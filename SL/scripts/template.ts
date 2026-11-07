import type { IconTemplate } from '../src/lib/pixels';

type Vec = [number, number, number];
type Rect = [number, number, number, number];
export interface Geometry {
  bones: { name: string; parent?: string; pivot?: Vec; mirror?: boolean; cubes?: { origin: Vec; size: Vec; uv: [number, number]; inflate?: number; mirror?: boolean }[] }[];
}
interface Face { points: Vec[]; uv: Rect; shade: number }
export interface Calibration { scale: number; phaseX: number; phaseY: number }
const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const normalize = (a: Vec): Vec => { const length = Math.hypot(...a); return a.map(n => n / length) as Vec; };
const eye = normalize([-1, 0.8165, -1]);
const right = normalize([-1, 0, 1]);
const up = normalize([0.8165 / 2, 1, 0.8165 / 2]);
const project = (p: Vec): [number, number] => [dot(p, right), dot(p, up)];

/** Original box projection implementation; runs at asset-preparation time only. */
export function modelFaces(geometry: Geometry): Face[] {
  const bones = new Map(geometry.bones.map(bone => [bone.name, bone]));
  const transform = (point: Vec, boneName: string, normal = false): Vec => {
    let p: Vec = [...point];
    let bone = bones.get(boneName);
    while (bone) {
      const lower = bone.name.toLowerCase();
      const degrees = lower === 'leftarm' ? -5.73 : lower === 'rightarm' ? 5.73 : 0;
      if (degrees) {
        const angle = degrees * Math.PI / 180, cos = Math.cos(angle), sin = Math.sin(angle);
        const pivot = normal ? [0, 0, 0] : [-(bone.pivot?.[0] ?? 0), bone.pivot?.[1] ?? 0, bone.pivot?.[2] ?? 0];
        const x = p[0] - pivot[0], y = p[1] - pivot[1];
        p = [pivot[0] + x * cos - y * sin, pivot[1] + x * sin + y * cos, p[2]];
      }
      bone = bone.parent ? bones.get(bone.parent) : undefined;
    }
    return p;
  };
  const faces: Face[] = [];
  for (const bone of geometry.bones) for (const cube of bone.cubes ?? []) {
    const [w, h, d] = cube.size, [u, v] = cube.uv, inflate = cube.inflate ?? 0;
    const min: Vec = [-(cube.origin[0] + w) - inflate, cube.origin[1] - inflate, cube.origin[2] - inflate];
    const max: Vec = [-cube.origin[0] + inflate, cube.origin[1] + h + inflate, cube.origin[2] + d + inflate];
    const rects: Record<string, Rect> = {
      east: [u, v + d, u + d, v + d + h], west: [u + d + w, v + d, u + 2 * d + w, v + d + h],
      north: [u + d, v + d, u + d + w, v + d + h], south: [u + 2 * d + w, v + d, u + 2 * d + 2 * w, v + d + h],
      up: [u + d + w, v + d, u + d, v], down: [u + d + 2 * w, v, u + d + w, v + d]
    };
    if (cube.mirror ?? bone.mirror ?? false) {
      for (const rect of Object.values(rects)) [rect[0], rect[2]] = [rect[2], rect[0]];
      [rects.east, rects.west] = [rects.west, rects.east];
    }
    const normals: Record<string, Vec> = { north: [0, 0, -1], south: [0, 0, 1], east: [1, 0, 0], west: [-1, 0, 0], up: [0, 1, 0], down: [0, -1, 0] };
    const pointAt = (side: string, a: number, b: number): Vec => {
      const width = max[0] - min[0], height = max[1] - min[1], depth = max[2] - min[2];
      switch (side) {
        case 'north': return [max[0] - a * width, max[1] - b * height, min[2]];
        case 'south': return [min[0] + a * width, max[1] - b * height, max[2]];
        case 'east': return [max[0], max[1] - b * height, max[2] - a * depth];
        case 'west': return [min[0], max[1] - b * height, min[2] + a * depth];
        case 'up': return [min[0] + a * width, max[1], min[2] + b * depth];
        default: return [min[0] + a * width, min[1], max[2] - b * depth];
      }
    };
    for (const side of Object.keys(normals)) {
      const normal = transform(normals[side], bone.name, true);
      // Blockbench's default Bedrock material is double-sided: a transparent
      // outer layer can reveal the inside of the opposite face of its cube.
      const rect = [...rects[side]] as Rect;
      const insetU = Math.sign(rect[2] - rect[0]) / 64, insetV = Math.sign(rect[3] - rect[1]) / 64;
      rect[0] += insetU; rect[2] -= insetU; rect[1] += insetV; rect[3] -= insetV;
      faces.push({
        points: [[0, 0], [1, 0], [1, 1], [0, 1]].map(([a, b]) => transform(pointAt(side, a, b), bone.name)),
        uv: rect,
        shade: 0.75 + 0.25 * normal[1] - 0.15 * normal[0] ** 2 + 0.05 * normal[2] ** 2
      });
    }
  }
  return faces;
}

export function bakeTemplate(geometry: Geometry, calibration: Calibration): IconTemplate {
  const faces = modelFaces(geometry);
  const projected = faces.flatMap(face => face.points.map(project));
  const centerX = (Math.min(...projected.map(p => p[0])) + Math.max(...projected.map(p => p[0]))) / 2;
  const centerY = (Math.min(...projected.map(p => p[1])) + Math.max(...projected.map(p => p[1]))) / 2;
  const spans: { depth: number; u: number; v: number; shade: number }[][] = Array.from({ length: 128 * 128 }, () => []);
  for (const face of faces) {
    const positions = face.points.map(point => {
      const [x, y] = project(point);
      return [64 + (x - centerX) * calibration.scale + calibration.phaseX, 64 - (y - centerY) * calibration.scale + calibration.phaseY];
    });
    const origin = positions[0], e1 = [positions[1][0] - origin[0], positions[1][1] - origin[1]], e2 = [positions[3][0] - origin[0], positions[3][1] - origin[1]];
    const determinant = e1[0] * e2[1] - e1[1] * e2[0];
    if (Math.abs(determinant) < 1e-8) continue;
    const minX = Math.max(0, Math.floor(Math.min(...positions.map(p => p[0])))), maxX = Math.min(127, Math.ceil(Math.max(...positions.map(p => p[0]))));
    const minY = Math.max(0, Math.floor(Math.min(...positions.map(p => p[1])))), maxY = Math.min(127, Math.ceil(Math.max(...positions.map(p => p[1]))));
    for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
      const dx = x + 0.5 - origin[0], dy = y + 0.5 - origin[1];
      const a = (dx * e2[1] - dy * e2[0]) / determinant, b = (e1[0] * dy - e1[1] * dx) / determinant;
      if (a < 0 || b < 0 || a >= 1 || b >= 1) continue;
      const point = face.points[0].map((n, axis) => n + a * (face.points[1][axis] - n) + b * (face.points[3][axis] - n)) as Vec;
      spans[y * 128 + x].push({ depth: dot(point, eye), u: face.uv[0] + a * (face.uv[2] - face.uv[0]), v: face.uv[1] + b * (face.uv[3] - face.uv[1]), shade: face.shade });
    }
  }
  const offsets: number[] = [], samples: number[] = [];
  for (const span of spans) {
    offsets.push(samples.length);
    for (const fragment of span.sort((a, b) => a.depth - b.depth)) {
      samples.push(Number(fragment.u.toFixed(6)), Number(fragment.v.toFixed(6)), Number(fragment.shade.toFixed(6)));
    }
  }
  offsets.push(samples.length);
  return { width: 128, height: 128, offsets, samples };
}

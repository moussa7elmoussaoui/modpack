import { Direction, StructureRotation } from '@minecraft/server';

import { Logger } from './logger.js';

export class MutVec3 {
	constructor(x, y, z) {
		this.x = 0;
		this.y = 0;
		this.z = 0;
		if (x === Direction.Down) {
			this.x = 0;
			this.y = -1;
			this.z = 0;
		} else if (x === Direction.Up) {
			this.x = 0;
			this.y = 1;
			this.z = 0;
		} else if (x === Direction.North) {
			this.x = 0;
			this.y = 0;
			this.z = -1;
		} else if (x === Direction.South) {
			this.x = 0;
			this.y = 0;
			this.z = 1;
		} else if (x === Direction.East) {
			this.x = 1;
			this.y = 0;
			this.z = 0;
		} else if (x === Direction.West) {
			this.x = -1;
			this.y = 0;
			this.z = 0;
		} else if (typeof x === 'number') {
			this.x = x;
			this.y = y;
			this.z = z;
		} else if (Array.isArray(x)) {
			this.x = x[0];
			this.y = x[1];
			this.z = x[2];
		} else if (x instanceof MutVec3 || x instanceof Vec3) {
			this.x = x.x;
			this.y = x.y;
			this.z = x.z;
		} else {
			if (!x || (x.x === undefined && x.y === undefined && x.z === undefined)) {
				throw new Error('Invalid vector');
			}
			this.x = x.x;
			this.y = x.y;
			this.z = x.z;
		}
	}

	static from(x, y, z) {
		if (x instanceof MutVec3) return new MutVec3(x);
		if (typeof x === 'number' && y !== undefined && z !== undefined) return new MutVec3(x, y, z);
		if (Array.isArray(x)) return new MutVec3(x);
		if (x === Direction.Down) return new MutVec3(Direction.Down);
		if (x === Direction.Up) return new MutVec3(Direction.Up);
		if (x === Direction.North) return new MutVec3(Direction.North);
		if (x === Direction.South) return new MutVec3(Direction.South);
		if (x === Direction.East) return new MutVec3(Direction.East);
		if (x === Direction.West) return new MutVec3(Direction.West);
		if (!x || (x.x === undefined && x.y === undefined && x.z === undefined)) {
			throw new Error('Invalid arguments');
		}
		return new MutVec3(x.x, x.y, x.z);
	}

	static _from(x, y, z) {
		if (x instanceof MutVec3) return x;
		if (typeof x === 'number' && y !== undefined && z !== undefined) return new MutVec3(x, y, z);
		if (Array.isArray(x)) return new MutVec3(x);
		if (x === Direction.Down) return new MutVec3(Direction.Down);
		if (x === Direction.Up) return new MutVec3(Direction.Up);
		if (x === Direction.North) return new MutVec3(Direction.North);
		if (x === Direction.South) return new MutVec3(Direction.South);
		if (x === Direction.East) return new MutVec3(Direction.East);
		if (x === Direction.West) return new MutVec3(Direction.West);
		if (!x || (x.x === undefined && x.y === undefined && x.z === undefined)) {
			throw new Error('Invalid arguments');
		}
		return new MutVec3(x.x, x.y, x.z);
	}

	copy() {
		return new MutVec3(this.x, this.y, this.z);
	}

	toImmutable() {
		return new Vec3(this.x, this.y, this.z);
	}

	static fromRotation(yaw, pitch) {
		let yawValue = yaw;
		let pitchValue = pitch;
		if (typeof yaw !== 'number') {
			yawValue = yaw.y;
			pitchValue = yaw.x;
		}
		const yawRad = yawValue * (Math.PI / 180);
		const pitchRad = pitchValue * (Math.PI / 180);
		const x = -Math.cos(pitchRad) * Math.sin(yawRad);
		const y = -Math.sin(pitchRad);
		const z = Math.cos(pitchRad) * Math.cos(yawRad);
		return new MutVec3(x, y, z);
	}

	toRotation() {
		if (this.isZero()) {
			throw new Error('Cannot convert zero-length vector to direction');
		}
		const normalized = this.copy().normalize();
		const yaw = -Math.atan2(normalized.x, normalized.z) * (180 / Math.PI);
		return { x: Math.asin(-normalized.y) * (180 / Math.PI), y: yaw };
	}

	add(x, y, z) {
		const other = MutVec3._from(x, y, z);
		this.x += other.x;
		this.y += other.y;
		this.z += other.z;
		return this;
	}

	subtract(x, y, z) {
		const other = MutVec3._from(x, y, z);
		this.x -= other.x;
		this.y -= other.y;
		this.z -= other.z;
		return this;
	}

	multiply(x, y, z) {
		if (typeof x === 'number' && y === undefined && z === undefined) {
			this.x *= x;
			this.y *= x;
			this.z *= x;
			return this;
		}
		const other = MutVec3._from(x, y, z);
		this.x *= other.x;
		this.y *= other.y;
		this.z *= other.z;
		return this;
	}

	scale(scalar) {
		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;
		return this;
	}

	divide(x, y, z) {
		if (typeof x === 'number' && y === undefined && z === undefined) {
			if (x === 0) throw new Error('Cannot divide by zero');
			this.x /= x;
			this.y /= x;
			this.z /= x;
			return this;
		}
		const other = MutVec3._from(x, y, z);
		if (other.x === 0 || other.y === 0 || other.z === 0) {
			throw new Error('Cannot divide by zero');
		}
		this.x /= other.x;
		this.y /= other.y;
		this.z /= other.z;
		return this;
	}

	normalize() {
		if (this.isZero()) throw new Error('Cannot normalize zero-length vector');
		const length = this.length();
		this.x /= length;
		this.y /= length;
		this.z /= length;
		return this;
	}

	length() {
		return Math.hypot(this.x, this.y, this.z);
	}

	lengthSquared() {
		return this.x * this.x + this.y * this.y + this.z * this.z;
	}

	cross(x, y, z) {
		const other = MutVec3._from(x, y, z);
		const newX = this.y * other.z - this.z * other.y;
		const newY = this.z * other.x - this.x * other.z;
		const newZ = this.x * other.y - this.y * other.x;
		this.x = newX;
		this.y = newY;
		this.z = newZ;
		return this;
	}

	distance(x, y, z) {
		const other = MutVec3._from(x, y, z);
		return this.copy().subtract(other).length();
	}

	distanceSquared(x, y, z) {
		const other = MutVec3._from(x, y, z);
		return this.copy().subtract(other).lengthSquared();
	}

	lerp(target, amount) {
		if (!target || amount === undefined) return this;
		if (amount === 1) {
			this.x = target.x;
			this.y = target.y;
			this.z = target.z;
			return this;
		}
		if (amount === 0) return this;
		this.x = this.x + (target.x - this.x) * amount;
		this.y = this.y + (target.y - this.y) * amount;
		this.z = this.z + (target.z - this.z) * amount;
		return this;
	}

	slerp(target, amount) {
		if (!target || amount === undefined) return this;
		if (amount === 1) {
			this.x = target.x;
			this.y = target.y;
			this.z = target.z;
			return this;
		}
		if (amount === 0) return this;
		const dot = this.dot(target);
		const theta = Math.acos(dot) * amount;
		const relative = MutVec3.from(target).subtract(this.copy().multiply(dot)).normalize();
		const cos = Math.cos(theta);
		const sin = Math.sin(theta);
		this.multiply(cos);
		this.x += relative.x * sin;
		this.y += relative.y * sin;
		this.z += relative.z * sin;
		return this;
	}

	dot(x, y, z) {
		const other = MutVec3._from(x, y, z);
		return this.x * other.x + this.y * other.y + this.z * other.z;
	}

	angleBetween(x, y, z) {
		const other = MutVec3._from(x, y, z);
		const dot = this.dot(other);
		const thisLengthSq = this.lengthSquared();
		if (thisLengthSq === 0) return 0;
		const otherLengthSq = other.lengthSquared();
		if (otherLengthSq === 0) return 0;
		const denominator = Math.sqrt(thisLengthSq * otherLengthSq);
		const clamped = Math.min(1, Math.max(-1, dot / denominator));
		return Math.acos(clamped);
	}

	projectOnto(x, y, z) {
		const other = MutVec3._from(x, y, z);
		if (other.isZero()) {
			this.x = 0;
			this.y = 0;
			this.z = 0;
			return this;
		}
		const otherLengthSq = other.dot(other);
		if (otherLengthSq === 0) {
			this.x = 0;
			this.y = 0;
			this.z = 0;
			return this;
		}
		const scalar = this.dot(other) / otherLengthSq;
		this.x = other.x * scalar;
		this.y = other.y * scalar;
		this.z = other.z * scalar;
		return this;
	}

	reflect(x, y, z) {
		const other = MutVec3._from(x, y, z);
		const projection = this.copy().projectOnto(other);
		return this.subtract(projection.multiply(2));
	}

	rotate(axis, degrees) {
		const halfRad = (degrees * Math.PI) / 180 / 2;
		const cos = Math.cos(halfRad);
		const sin = Math.sin(halfRad);
		const qx = axis.x * sin;
		const qy = axis.y * sin;
		const qz = axis.z * sin;
		const vx = this.x;
		const vy = this.y;
		const vz = this.z;
		const newX =
			cos * cos * vx +
			2 * qy * cos * vz -
			2 * qz * cos * vy +
			qx * qx * vx +
			2 * qy * qx * vy +
			2 * qz * qx * vz -
			qz * qz * vx -
			qy * qy * vx;
		const newY =
			2 * qx * qy * vx +
			qy * qy * vy +
			2 * qz * qy * vz +
			2 * cos * qz * vx -
			qz * qz * vy +
			cos * cos * vy -
			2 * qx * cos * vz -
			qx * qx * vy;
		const newZ =
			2 * qx * qz * vx +
			2 * qy * qz * vy +
			qz * qz * vz -
			2 * cos * qy * vx -
			qy * qy * vz +
			2 * cos * qx * vy -
			qx * qx * vz +
			cos * cos * vz;
		this.x = newX;
		this.y = newY;
		this.z = newZ;
		return this;
	}

	update(fnX, fnY, fnZ) {
		fnX = fnX || ((value) => value);
		fnY = fnY || ((value) => value);
		fnZ = fnZ || ((value) => value);
		this.x = fnX(this.x);
		this.y = fnY(this.y);
		this.z = fnZ(this.z);
		return this;
	}

	setX(fnOrValue) {
		if (typeof fnOrValue === 'number') {
			this.x = fnOrValue;
		} else {
			this.x = fnOrValue(this.x);
		}
		return this;
	}

	setY(fnOrValue) {
		if (typeof fnOrValue === 'number') {
			this.y = fnOrValue;
		} else {
			this.y = fnOrValue(this.y);
		}
		return this;
	}

	setZ(fnOrValue) {
		if (typeof fnOrValue === 'number') {
			this.z = fnOrValue;
		} else {
			this.z = fnOrValue(this.z);
		}
		return this;
	}

	floor() {
		return this.update(Math.floor, Math.floor, Math.floor);
	}

	floorX() {
		return this.setX(Math.floor);
	}

	floorY() {
		return this.setY(Math.floor);
	}

	floorZ() {
		return this.setZ(Math.floor);
	}

	ceil() {
		return this.update(Math.ceil, Math.ceil, Math.ceil);
	}

	ceilX() {
		return this.setX(Math.ceil);
	}

	ceilY() {
		return this.setY(Math.ceil);
	}

	ceilZ() {
		return this.setZ(Math.ceil);
	}

	round() {
		return this.update(Math.round, Math.round, Math.round);
	}

	roundX() {
		return this.setX(Math.round);
	}

	roundY() {
		return this.setY(Math.round);
	}

	roundZ() {
		return this.setZ(Math.round);
	}

	up() {
		return this.add(Direction.Up);
	}

	down() {
		return this.add(Direction.Down);
	}

	north() {
		return this.add(Direction.North);
	}

	south() {
		return this.add(Direction.South);
	}

	east() {
		return this.add(Direction.East);
	}

	west() {
		return this.add(Direction.West);
	}

	isZero() {
		return this.x === 0 && this.y === 0 && this.z === 0;
	}

	toArray() {
		return [this.x, this.y, this.z];
	}

	toDirection() {
		if (this.isZero()) {
			throw new Error('Cannot convert zero-length vector to direction');
		}
		const normalized = this.copy().normalize();
		const maxAxis = Math.max(Math.abs(normalized.x), Math.abs(normalized.y), Math.abs(normalized.z));
		if (maxAxis === normalized.x) return Direction.East;
		if (maxAxis === -normalized.x) return Direction.West;
		if (maxAxis === normalized.y) return Direction.Up;
		if (maxAxis === -normalized.y) return Direction.Down;
		if (maxAxis === normalized.z) return Direction.South;
		if (maxAxis === -normalized.z) return Direction.North;
		throw new Error('Cannot convert vector to direction');
	}

	toStructureRotation() {
		const rotation = this.toRotation();
		let degrees = Math.round(rotation.y / 90) * 90;
		if (degrees < 0) degrees += 360;
		if (degrees >= 360) degrees -= 360;
		if (degrees === 0) return StructureRotation.None;
		if (degrees === 90) return StructureRotation.Rotate90;
		if (degrees === 180) return StructureRotation.Rotate180;
		if (degrees === 270) return StructureRotation.Rotate270;
		throw new Error('Cannot convert vector to structure rotation');
	}

	toBlockLocation() {
		this.x = (this.x << 0) - (this.x < 0 && this.x !== (this.x << 0) ? 1 : 0);
		this.y = (this.y << 0) - (this.y < 0 && this.y !== (this.y << 0) ? 1 : 0);
		this.z = (this.z << 0) - (this.z < 0 && this.z !== (this.z << 0) ? 1 : 0);
		return this;
	}

	almostEqual(x, y, z, epsilon) {
		try {
			let other;
			if (typeof x !== 'number' && z === undefined) {
				other = MutVec3._from(x, undefined, undefined);
				epsilon = y;
			} else {
				other = MutVec3._from(x, y, z);
			}
			return (
				Math.abs(this.x - other.x) <= epsilon &&
				Math.abs(this.y - other.y) <= epsilon &&
				Math.abs(this.z - other.z) <= epsilon
			);
		} catch {
			return false;
		}
	}

	equals(x, y, z) {
		try {
			const other = MutVec3._from(x, y, z);
			return this.x === other.x && this.y === other.y && this.z === other.z;
		} catch {
			return false;
		}
	}

	toString(format = 'long', separator = ', ') {
		const value = `${this.x + separator + this.y + separator + this.z}`;
		return format === 'long' ? `MutVec3(${value})` : value;
	}

	static fromString(text, format = 'long', separator = ', ') {
		if (format === 'long') {
			const match = text.match(/^MutVec3\((.*)\)$/);
			if (!match) throw new Error('Invalid string format');
			const parts = match[1].split(separator);
			if (parts.length !== 3) throw new Error('Invalid string format');
			return new MutVec3(Number(parts[0]), Number(parts[1]), Number(parts[2]));
		} else {
			const parts = text.split(separator);
			if (parts.length !== 3) throw new Error('Invalid string format');
			return new MutVec3(Number(parts[0]), Number(parts[1]), Number(parts[2]));
		}
	}
}

MutVec3.log = Logger.getLogger('vec3', 'vec3', 'bedrock-boost');
MutVec3.Zero = new MutVec3(0, 0, 0);
MutVec3.Down = new MutVec3(Direction.Down);
MutVec3.Up = new MutVec3(Direction.Up);
MutVec3.North = new MutVec3(Direction.North);
MutVec3.South = new MutVec3(Direction.South);
MutVec3.East = new MutVec3(Direction.East);
MutVec3.West = new MutVec3(Direction.West);

export class Vec3 {
	constructor(x, y, z) {
		this.x = 0;
		this.y = 0;
		this.z = 0;
		if (x === Direction.Down) {
			this.x = 0;
			this.y = -1;
			this.z = 0;
		} else if (x === Direction.Up) {
			this.x = 0;
			this.y = 1;
			this.z = 0;
		} else if (x === Direction.North) {
			this.x = 0;
			this.y = 0;
			this.z = -1;
		} else if (x === Direction.South) {
			this.x = 0;
			this.y = 0;
			this.z = 1;
		} else if (x === Direction.East) {
			this.x = 1;
			this.y = 0;
			this.z = 0;
		} else if (x === Direction.West) {
			this.x = -1;
			this.y = 0;
			this.z = 0;
		} else if (typeof x === 'number') {
			this.x = x;
			this.y = y;
			this.z = z;
		} else if (Array.isArray(x)) {
			this.x = x[0];
			this.y = x[1];
			this.z = x[2];
		} else if (x instanceof Vec3) {
			this.x = x.x;
			this.y = x.y;
			this.z = x.z;
		} else {
			if (!x || (x.x === undefined && x.y === undefined && x.z === undefined)) {
				throw Vec3.log.error(new Error('Invalid vector'), x), new Error('Invalid vector');
			}
			this.x = x.x;
			this.y = x.y;
			this.z = x.z;
		}
	}

	static from(x, y, z) {
		if (x instanceof Vec3) return x;
		if (typeof x === 'number' && y !== undefined && z !== undefined) return new Vec3(x, y, z);
		if (Array.isArray(x)) return new Vec3(x);
		if (x === Direction.Down) return Vec3.Down;
		if (x === Direction.Up) return Vec3.Up;
		if (x === Direction.North) return Vec3.North;
		if (x === Direction.South) return Vec3.South;
		if (x === Direction.East) return Vec3.East;
		if (x === Direction.West) return Vec3.West;
		if (!x || (x.x === undefined && x.y === undefined && x.z === undefined)) {
			throw new Error('Invalid arguments');
		}
		return new Vec3(x.x, x.y, x.z);
	}

	static _from(x, y, z) {
		if (x instanceof Vec3) return x;
		if (typeof x === 'number' && y !== undefined && z !== undefined) return new Vec3(x, y, z);
		if (Array.isArray(x)) return new Vec3(x);
		if (x === Direction.Down) return Vec3.Down;
		if (x === Direction.Up) return Vec3.Up;
		if (x === Direction.North) return Vec3.North;
		if (x === Direction.South) return Vec3.South;
		if (x === Direction.East) return Vec3.East;
		if (x === Direction.West) return Vec3.West;
		if (!x || (x.x === undefined && x.y === undefined && x.z === undefined)) {
			throw new Error('Invalid arguments');
		}
		return new Vec3(x.x, x.y, x.z);
	}

	copy() {
		return new Vec3(this.x, this.y, this.z);
	}

	toMutable() {
		return new MutVec3(this.x, this.y, this.z);
	}

	static fromRotation(yaw, pitch) {
		let yawValue = yaw;
		let pitchValue = pitch;
		if (typeof yaw !== 'number') {
			yawValue = yaw.y;
			pitchValue = yaw.x;
		}
		const yawRad = yawValue * (Math.PI / 180);
		const pitchRad = pitchValue * (Math.PI / 180);
		const x = -Math.cos(pitchRad) * Math.sin(yawRad);
		const y = -Math.sin(pitchRad);
		const z = Math.cos(pitchRad) * Math.cos(yawRad);
		return new Vec3(x, y, z);
	}

	toRotation() {
		if (this.isZero()) {
			throw new Error('Cannot convert zero-length vector to direction');
		}
		const normalized = this.normalize();
		const yaw = -Math.atan2(normalized.x, normalized.z) * (180 / Math.PI);
		return { x: Math.asin(-normalized.y) * (180 / Math.PI), y: yaw };
	}

	add(x, y, z) {
		const other = Vec3._from(x, y, z);
		return Vec3.from(other.x + this.x, other.y + this.y, other.z + this.z);
	}

	subtract(x, y, z) {
		const other = Vec3._from(x, y, z);
		return Vec3.from(this.x - other.x, this.y - other.y, this.z - other.z);
	}

	multiply(x, y, z) {
		if (typeof x === 'number' && y === undefined && z === undefined) {
			return Vec3.from(this.x * x, this.y * x, this.z * x);
		}
		const other = Vec3._from(x, y, z);
		return Vec3.from(this.x * other.x, this.y * other.y, this.z * other.z);
	}

	scale(scalar) {
		return Vec3.from(this.x * scalar, this.y * scalar, this.z * scalar);
	}

	divide(x, y, z) {
		if (typeof x === 'number' && y === undefined && z === undefined) {
			if (x === 0) throw new Error('Cannot divide by zero');
			return Vec3.from(this.x / x, this.y / x, this.z / x);
		}
		const other = Vec3._from(x, y, z);
		if (other.x === 0 || other.y === 0 || other.z === 0) {
			throw new Error('Cannot divide by zero');
		}
		return Vec3.from(this.x / other.x, this.y / other.y, this.z / other.z);
	}

	normalize() {
		if (this.isZero()) throw new Error('Cannot normalize zero-length vector');
		const length = this.length();
		return Vec3.from(this.x / length, this.y / length, this.z / length);
	}

	length() {
		return Math.hypot(this.x, this.y, this.z);
	}

	lengthSquared() {
		return this.x * this.x + this.y * this.y + this.z * this.z;
	}

	cross(x, y, z) {
		const other = Vec3._from(x, y, z);
		return Vec3.from(
			this.y * other.z - this.z * other.y,
			this.z * other.x - this.x * other.z,
			this.x * other.y - this.y * other.x,
		);
	}

	distance(x, y, z) {
		const other = Vec3._from(x, y, z);
		return this.subtract(other).length();
	}

	distanceSquared(x, y, z) {
		const other = Vec3._from(x, y, z);
		return this.subtract(other).lengthSquared();
	}

	lerp(target, amount) {
		if (!target || !amount) return Vec3.from(this);
		if (amount === 1) return Vec3.from(target);
		if (amount === 0) return Vec3.from(this);
		return Vec3.from(
			this.x + (target.x - this.x) * amount,
			this.y + (target.y - this.y) * amount,
			this.z + (target.z - this.z) * amount,
		);
	}

	slerp(target, amount) {
		if (!target || !amount) return Vec3.from(this);
		if (amount === 1) return Vec3.from(target);
		if (amount === 0) return Vec3.from(this);
		const dot = this.dot(target);
		const theta = Math.acos(dot) * amount;
		const relative = Vec3.from(target).subtract(this.multiply(dot)).normalize();
		return this.multiply(Math.cos(theta)).add(relative.multiply(Math.sin(theta)));
	}

	dot(x, y, z) {
		const other = Vec3._from(x, y, z);
		return this.x * other.x + this.y * other.y + this.z * other.z;
	}

	angleBetween(x, y, z) {
		const other = Vec3._from(x, y, z);
		const dot = this.dot(other);
		const thisLengthSq = this.lengthSquared();
		if (thisLengthSq === 0) return 0;
		const otherLengthSq = other.lengthSquared();
		if (otherLengthSq === 0) return 0;
		const denominator = Math.sqrt(thisLengthSq * otherLengthSq);
		const clamped = Math.min(1, Math.max(-1, dot / denominator));
		return Math.acos(clamped);
	}

	projectOnto(x, y, z) {
		const other = Vec3._from(x, y, z);
		if (other.isZero()) return Vec3.Zero;
		const otherLengthSq = other.dot(other);
		if (otherLengthSq === 0) return Vec3.Zero;
		const scalar = this.dot(other) / otherLengthSq;
		return Vec3.from(other.x * scalar, other.y * scalar, other.z * scalar);
	}

	reflect(x, y, z) {
		const other = Vec3._from(x, y, z);
		const projection = this.projectOnto(other);
		return this.subtract(projection.multiply(2));
	}

	rotate(axis, degrees) {
		const halfRad = (degrees * Math.PI) / 180 / 2;
		const cos = Math.cos(halfRad);
		const sin = Math.sin(halfRad);
		const qx = axis.x * sin;
		const qy = axis.y * sin;
		const qz = axis.z * sin;
		const vx = this.x;
		const vy = this.y;
		const vz = this.z;
		const newX =
			cos * cos * vx +
			2 * qy * cos * vz -
			2 * qz * cos * vy +
			qx * qx * vx +
			2 * qy * qx * vy +
			2 * qz * qx * vz -
			qz * qz * vx -
			qy * qy * vx;
		const newY =
			2 * qx * qy * vx +
			qy * qy * vy +
			2 * qz * qy * vz +
			2 * cos * qz * vx -
			qz * qz * vy +
			cos * cos * vy -
			2 * qx * cos * vz -
			qx * qx * vy;
		const newZ =
			2 * qx * qz * vx +
			2 * qy * qz * vy +
			qz * qz * vz -
			2 * cos * qy * vx -
			qy * qy * vz +
			2 * cos * qx * vy -
			qx * qx * vz +
			cos * cos * vz;
		return new Vec3(newX, newY, newZ);
	}

	update(fnX, fnY, fnZ) {
		fnX = fnX || ((value) => value);
		fnY = fnY || ((value) => value);
		fnZ = fnZ || ((value) => value);
		return new Vec3(fnX(this.x), fnY(this.y), fnZ(this.z));
	}

	setX(fnOrValue) {
		if (typeof fnOrValue === 'number') {
			return new Vec3(fnOrValue, this.y, this.z);
		}
		return new Vec3(fnOrValue(this.x), this.y, this.z);
	}

	setY(fnOrValue) {
		if (typeof fnOrValue === 'number') {
			return new Vec3(this.x, fnOrValue, this.z);
		}
		return new Vec3(this.x, fnOrValue(this.y), this.z);
	}

	setZ(fnOrValue) {
		if (typeof fnOrValue === 'number') {
			return new Vec3(this.x, this.y, fnOrValue);
		}
		return new Vec3(this.x, this.y, fnOrValue(this.z));
	}

	distanceToLineSegment(start, end) {
		const segment = Vec3.from(end).subtract(start);
		if (segment.lengthSquared() === 0) return this.subtract(start).length();
		const t = Math.max(0, Math.min(1, this.subtract(start).dot(segment) / segment.dot(segment)));
		const point = Vec3.from(start).add(segment.multiply(t));
		return this.subtract(point).length();
	}

	floor() {
		return this.update(Math.floor, Math.floor, Math.floor);
	}

	floorX() {
		return this.setX(Math.floor);
	}

	floorY() {
		return this.setY(Math.floor);
	}

	floorZ() {
		return this.setZ(Math.floor);
	}

	ceil() {
		return new Vec3(Math.ceil(this.x), Math.ceil(this.y), Math.ceil(this.z));
	}

	ceilX() {
		return this.setX(Math.ceil);
	}

	ceilY() {
		return this.setY(Math.ceil);
	}

	ceilZ() {
		return this.setZ(Math.ceil);
	}

	round() {
		return this.update(Math.round, Math.round, Math.round);
	}

	roundX() {
		return this.setX(Math.round);
	}

	roundY() {
		return this.setY(Math.round);
	}

	roundZ() {
		return this.setZ(Math.round);
	}

	up() {
		return this.add(Vec3.Up);
	}

	down() {
		return this.add(Vec3.Down);
	}

	north() {
		return this.add(Vec3.North);
	}

	south() {
		return this.add(Vec3.South);
	}

	east() {
		return this.add(Vec3.East);
	}

	west() {
		return this.add(Vec3.West);
	}

	isZero() {
		return this.x === 0 && this.y === 0 && this.z === 0;
	}

	toArray() {
		return [this.x, this.y, this.z];
	}

	toDirection() {
		if (this.isZero()) {
			throw new Error('Cannot convert zero-length vector to direction');
		}
		const normalized = this.normalize();
		const maxAxis = Math.max(Math.abs(normalized.x), Math.abs(normalized.y), Math.abs(normalized.z));
		if (maxAxis === normalized.x) return Direction.East;
		if (maxAxis === -normalized.x) return Direction.West;
		if (maxAxis === normalized.y) return Direction.Up;
		if (maxAxis === -normalized.y) return Direction.Down;
		if (maxAxis === normalized.z) return Direction.South;
		if (maxAxis === -normalized.z) return Direction.North;
		throw new Error('Cannot convert vector to direction');
	}

	toStructureRotation() {
		const rotation = this.toRotation();
		let degrees = Math.round(rotation.y / 90) * 90;
		if (degrees < 0) degrees += 360;
		if (degrees >= 360) degrees -= 360;
		if (degrees === 0) return StructureRotation.None;
		if (degrees === 90) return StructureRotation.Rotate90;
		if (degrees === 180) return StructureRotation.Rotate180;
		if (degrees === 270) return StructureRotation.Rotate270;
		throw new Error('Cannot convert vector to structure rotation');
	}

	toBlockLocation() {
		return Vec3.from(
			(this.x << 0) - (this.x < 0 && this.x !== (this.x << 0) ? 1 : 0),
			(this.y << 0) - (this.y < 0 && this.y !== (this.y << 0) ? 1 : 0),
			(this.z << 0) - (this.z < 0 && this.z !== (this.z << 0) ? 1 : 0),
		);
	}

	almostEqual(x, y, z, epsilon) {
		try {
			let other;
			if (typeof x !== 'number' && z === undefined) {
				other = Vec3._from(x, undefined, undefined);
				epsilon = y;
			} else {
				other = Vec3._from(x, y, z);
			}
			return (
				Math.abs(this.x - other.x) <= epsilon &&
				Math.abs(this.y - other.y) <= epsilon &&
				Math.abs(this.z - other.z) <= epsilon
			);
		} catch {
			return false;
		}
	}

	equals(x, y, z) {
		try {
			const other = Vec3._from(x, y, z);
			return this.x === other.x && this.y === other.y && this.z === other.z;
		} catch {
			return false;
		}
	}

	toString(format = 'long', separator = ', ') {
		const value = `${this.x + separator + this.y + separator + this.z}`;
		return format === 'long' ? `Vec3(${value})` : value;
	}

	static fromString(text, format = 'long', separator = ', ') {
		if (format === 'long') {
			const match = text.match(/^Vec3\((.*)\)$/);
			if (!match) throw new Error('Invalid string format');
			const parts = match[1].split(separator);
			if (parts.length !== 3) throw new Error('Invalid string format');
			return Vec3.from(Number(parts[0]), Number(parts[1]), Number(parts[2]));
		} else {
			const parts = text.split(separator);
			if (parts.length !== 3) throw new Error('Invalid string format');
			return Vec3.from(Number(parts[0]), Number(parts[1]), Number(parts[2]));
		}
	}
}

Vec3.log = Logger.getLogger('vec3', 'vec3', 'bedrock-boost');
Vec3.Zero = new Vec3(0, 0, 0);
Vec3.Down = new Vec3(Direction.Down);
Vec3.Up = new Vec3(Direction.Up);
Vec3.North = new Vec3(Direction.North);
Vec3.South = new Vec3(Direction.South);
Vec3.East = new Vec3(Direction.East);
Vec3.West = new Vec3(Direction.West);

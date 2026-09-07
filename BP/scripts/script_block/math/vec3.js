export class Vec3 {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  static get back() {
    return new this(0, 0, -1);
  }

  static get down() {
    return new this(0, -1, 0);
  }

  static get forward() {
    return new this(0, 0, 1);
  }

  static get left() {
    return new this(-1, 0, 0);
  }

  static get right() {
    return new this(1, 0, 0);
  }

  static get up() {
    return new this(0, 1, 0);
  }

  static from(vector) {
    return new Vec3(vector.x, vector.y, vector.z);
  }

  static add(a, b) {
    const result = new Vec3(a.x, a.y, a.z);
    result.x += b.x;
    result.y += b.y;
    result.z += b.z;
    return result;
  }

}

import { Direction } from '@minecraft/server';

import { Logger } from './logger.js';
import { Vec3 } from './vector3.js';

export class MutVec2 {
	constructor(x, y) {
		this.x = 0;
		this.y = 0;
		if (x === Direction.Down || x === Direction.Up) {
			throw new Error('Invalid direction');
		}
		if (x === Direction.North) {
			this.x = 0;
			this.y = 1;
		} else if (x === Direction.South) {
			this.x = 0;
			this.y = -1;
		} else if (x === Direction.East) {
			this.x = 1;
			this.y = 0;
		} else if (x === Direction.West) {
			this.x = -1;
			this.y = 0;
		} else if (typeof x === 'number') {
			if (y === undefined) throw new Error('Invalid vector');
			this.x = x;
			this.y = y;
		} else if (Array.isArray(x)) {
			this.x = x[0];
			this.y = x[1];
		} else if (x instanceof MutVec2 || x instanceof Vec2) {
			this.x = x.x;
			this.y = x.y;
		} else {
			const source = x;
			if (!source || (source.x === undefined && source.y === undefined && source.z === undefined)) {
				throw new Error('Invalid vector');
			}
			this.x = source.x;
			if (source.y !== undefined) {
				this.y = source.y;
			} else if (source.z !== undefined) {
				this.y = source.z;
			} else {
				throw new Error('Invalid vector');
			}
		}
	}

	static from(x, y) {
		if (x instanceof MutVec2) return new MutVec2(x);
		if (x instanceof Vec2) return new MutVec2(x);
		if (typeof x === 'number' && y !== undefined) return new MutVec2(x, y);
		if (Array.isArray(x)) return new MutVec2(x);
		if (x === Direction.Down || x === Direction.Up) throw new Error('Invalid direction');
		if (x === Direction.North) return new MutVec2(Direction.North);
		if (x === Direction.South) return new MutVec2(Direction.South);
		if (x === Direction.East) return new MutVec2(Direction.East);
		if (x === Direction.West) return new MutVec2(Direction.West);
		return new MutVec2(x, y);
	}

	static _from(x, y) {
		if (x instanceof MutVec2) return x;
		if (x instanceof Vec2) return new MutVec2(x);
		if (typeof x === 'number' && y !== undefined) return new MutVec2(x, y);
		if (Array.isArray(x)) return new MutVec2(x);
		if (x === Direction.Down || x === Direction.Up) throw new Error('Invalid direction');
		if (x === Direction.North) return new MutVec2(Direction.North);
		if (x === Direction.South) return new MutVec2(Direction.South);
		if (x === Direction.East) return new MutVec2(Direction.East);
		if (x === Direction.West) return new MutVec2(Direction.West);
		return new MutVec2(x, y);
	}

	copy() {
		return new MutVec2(this.x, this.y);
	}

	toImmutable() {
		return new Vec2(this.x, this.y);
	}

	static fromYaw(yaw) {
		const yawRad = yaw * (Math.PI / 180);
		const sin = Math.sin(yawRad);
		const cos = Math.cos(yawRad);
		return new MutVec2(sin, cos);
	}

	toYaw() {
		if (this.isZero()) throw new Error('Cannot convert zero-length vector to direction');
		const normalized = this.copy().normalize();
		return Math.atan2(normalized.x, normalized.y) * (180 / Math.PI);
	}

	add(x, y) {
		const other = MutVec2._from(x, y);
		this.x += other.x;
		this.y += other.y;
		return this;
	}

	subtract(x, y) {
		const other = MutVec2._from(x, y);
		this.x -= other.x;
		this.y -= other.y;
		return this;
	}

	multiply(x, y) {
		if (typeof x === 'number' && y === undefined) {
			this.x *= x;
			this.y *= x;
			return this;
		}
		const other = MutVec2._from(x, y);
		this.x *= other.x;
		this.y *= other.y;
		return this;
	}

	scale(scalar) {
		this.x *= scalar;
		this.y *= scalar;
		return this;
	}

	divide(x, y) {
		if (typeof x === 'number' && y === undefined) {
			if (x === 0) throw new Error('Cannot divide by zero');
			this.x /= x;
			this.y /= x;
			return this;
		}
		const other = MutVec2._from(x, y);
		if (other.x === 0 || other.y === 0) throw new Error('Cannot divide by zero');
		this.x /= other.x;
		this.y /= other.y;
		return this;
	}

	normalize() {
		if (this.isZero()) throw new Error('Cannot normalize zero-length vector');
		const length = this.length();
		this.x /= length;
		this.y /= length;
		return this;
	}

	length() {
		return Math.hypot(this.x, this.y);
	}

	lengthSquared() {
		return this.x * this.x + this.y * this.y;
	}

	distance(x, y) {
		const other = MutVec2._from(x, y);
		return this.copy().subtract(other).length();
	}

	distanceSquared(x, y) {
		const other = MutVec2._from(x, y);
		return this.copy().subtract(other).lengthSquared();
	}

	lerp(target, amount) {
		if (!target || amount === undefined) return this;
		if (amount === 1) {
			this.x = target.x;
			this.y = target.y;
			return this;
		}
		if (amount === 0) return this;
		this.x = this.x + (target.x - this.x) * amount;
		this.y = this.y + (target.y - this.y) * amount;
		return this;
	}

	slerp(target, amount) {
		if (!target || amount === undefined) return this;
		if (amount === 1) {
			this.x = target.x;
			this.y = target.y;
			return this;
		}
		if (amount === 0) return this;
		const dot = this.dot(target);
		const theta = Math.acos(dot) * amount;
		const relative = MutVec2.from(target).subtract(this.copy().multiply(dot)).normalize();
		const cos = Math.cos(theta);
		const sin = Math.sin(theta);
		this.multiply(cos);
		this.x += relative.x * sin;
		this.y += relative.y * sin;
		return this;
	}

	dot(x, y) {
		const other = MutVec2._from(x, y);
		return this.x * other.x + this.y * other.y;
	}

	angleBetween(x, y) {
		const other = MutVec2._from(x, y);
		const dot = this.dot(other);
		const denominator = this.length() * other.length();
		return denominator === 0 ? 0 : Math.acos(dot / denominator);
	}

	projectOnto(x, y) {
		const other = MutVec2._from(x, y);
		if (other.isZero()) {
			this.x = 0;
			this.y = 0;
			return this;
		}
		const scalar = this.dot(other) / other.dot(other);
		this.x = other.x * scalar;
		this.y = other.y * scalar;
		return this;
	}

	reflect(x, y) {
		const other = MutVec2._from(x, y);
		const projection = this.copy().projectOnto(other);
		return this.subtract(projection.multiply(2));
	}

	toVec3(z) {
		return new Vec3(this.x, this.y, z || 0);
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

	update(fnX, fnY) {
		fnX = fnX || ((value) => value);
		fnY = fnY || ((value) => value);
		this.x = fnX(this.x);
		this.y = fnY(this.y);
		return this;
	}

	floor() {
		return this.update(Math.floor, Math.floor);
	}

	floorX() {
		return this.setX(Math.floor);
	}

	floorY() {
		return this.setY(Math.floor);
	}

	ceil() {
		return this.update(Math.ceil, Math.ceil);
	}

	ceilX() {
		return this.setX(Math.ceil);
	}

	ceilY() {
		return this.setY(Math.ceil);
	}

	round() {
		return this.update(Math.round, Math.round);
	}

	roundX() {
		return this.setX(Math.round);
	}

	roundY() {
		return this.setY(Math.round);
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
		return this.x === 0 && this.y === 0;
	}

	toArray() {
		return [this.x, this.y];
	}

	toDirection() {
		if (this.isZero()) throw new Error('Cannot convert zero-length vector to direction');
		const normalized = this.copy().normalize();
		const maxAxis = Math.max(Math.abs(normalized.x), Math.abs(normalized.y));
		if (maxAxis === normalized.x) return Direction.East;
		if (maxAxis === -normalized.x) return Direction.West;
		if (maxAxis === normalized.y) return Direction.North;
		if (maxAxis === -normalized.y) return Direction.South;
		throw new Error('Cannot convert vector to direction');
	}

	toBlockLocation() {
		const newX = (this.x << 0) - (this.x < 0 && this.x !== (this.x << 0) ? 1 : 0);
		const newY = (this.y << 0) - (this.y < 0 && this.y !== (this.y << 0) ? 1 : 0);
		this.x = newX;
		this.y = newY;
		return this;
	}

	almostEqual(x, y, epsilon) {
		try {
			let other;
			if (typeof x !== 'number' && epsilon === undefined) {
				other = MutVec2._from(x, undefined);
				epsilon = y;
			} else {
				other = MutVec2._from(x, y);
			}
			return Math.abs(this.x - other.x) <= epsilon && Math.abs(this.y - other.y) <= epsilon;
		} catch {
			return false;
		}
	}

	equals(x, y) {
		try {
			const other = MutVec2._from(x, y);
			return this.x === other.x && this.y === other.y;
		} catch {
			return false;
		}
	}

	toString(format = 'long', separator = ', ') {
		const value = `${this.x + separator + this.y}`;
		return format === 'long' ? `MutVec2(${value})` : value;
	}
}

MutVec2.log = Logger.getLogger('vec2', 'vec2', 'bedrock-boost');
MutVec2.Zero = new MutVec2(0, 0);
MutVec2.North = new MutVec2(Direction.North);
MutVec2.South = new MutVec2(Direction.South);
MutVec2.East = new MutVec2(Direction.East);
MutVec2.West = new MutVec2(Direction.West);

export class Vec2 {
	constructor(x, y) {
		this.x = 0;
		this.y = 0;
		if (x === Direction.Down || x === Direction.Up) {
			throw new Error('Invalid direction');
		}
		if (x === Direction.North) {
			this.x = 0;
			this.y = 1;
		} else if (x === Direction.South) {
			this.x = 0;
			this.y = -1;
		} else if (x === Direction.East) {
			this.x = 1;
			this.y = 0;
		} else if (x === Direction.West) {
			this.x = -1;
			this.y = 0;
		} else if (typeof x === 'number') {
			this.x = x;
			this.y = y;
		} else if (Array.isArray(x)) {
			this.x = x[0];
			this.y = x[1];
		} else if (x instanceof Vec2) {
			this.x = x.x;
			this.y = x.y;
		} else if (x instanceof MutVec2) {
			this.x = x.x;
			this.y = x.y;
		} else if (x instanceof Vec3) {
			this.x = x.x;
			this.y = x.y;
		} else {
			const source = x;
			if (!source || (source.x === undefined && source.y === undefined && source.z === undefined)) {
				throw Vec2.log.error(new Error('Invalid vector'), x), new Error('Invalid vector');
			}
			this.x = source.x;
			if (source.y !== undefined) {
				this.y = source.y;
			} else if (source.z !== undefined) {
				this.y = source.z;
			} else {
				throw Vec2.log.error(new Error('Invalid vector'), x), new Error('Invalid vector');
			}
		}
	}

	static from(x, y) {
		if (x instanceof Vec2) return x;
		if (x instanceof MutVec2) return new Vec2(x.x, x.y);
		if (typeof x === 'number' && y !== undefined) return new Vec2(x, y);
		if (Array.isArray(x)) return new Vec2(x);
		if (x === Direction.Down || x === Direction.Up) throw new Error('Invalid direction');
		if (x === Direction.North) return Vec2.North;
		if (x === Direction.South) return Vec2.South;
		if (x === Direction.East) return Vec2.East;
		if (x === Direction.West) return Vec2.West;
		return new Vec2(x, y);
	}

	static _from(x, y) {
		if (x instanceof Vec2) return x;
		if (x instanceof MutVec2) return new Vec2(x.x, x.y);
		if (typeof x === 'number' && y !== undefined) return new Vec2(x, y);
		if (Array.isArray(x)) return new Vec2(x);
		if (x === Direction.Down || x === Direction.Up) throw new Error('Invalid direction');
		if (x === Direction.North) return Vec2.North;
		if (x === Direction.South) return Vec2.South;
		if (x === Direction.East) return Vec2.East;
		if (x === Direction.West) return Vec2.West;
		return new Vec2(x, y);
	}

	copy() {
		return new Vec2(this.x, this.y);
	}

	toMutable() {
		return new MutVec2(this.x, this.y);
	}

	static fromYaw(yaw) {
		const yawRad = yaw * (Math.PI / 180);
		const sin = Math.sin(yawRad);
		const cos = Math.cos(yawRad);
		return new Vec2(sin, cos);
	}

	toYaw() {
		if (this.isZero()) throw new Error('Cannot convert zero-length vector to direction');
		const normalized = this.normalize();
		return Math.atan2(normalized.x, normalized.y) * (180 / Math.PI);
	}

	add(x, y) {
		const other = Vec2._from(x, y);
		return Vec2.from(other.x + this.x, other.y + this.y);
	}

	subtract(x, y) {
		const other = Vec2._from(x, y);
		return Vec2.from(this.x - other.x, this.y - other.y);
	}

	multiply(x, y) {
		if (typeof x === 'number' && y === undefined) {
			return Vec2.from(this.x * x, this.y * x);
		}
		const other = Vec2._from(x, y);
		return Vec2.from(this.x * other.x, this.y * other.y);
	}

	scale(scalar) {
		return Vec2.from(this.x * scalar, this.y * scalar);
	}

	divide(x, y) {
		if (typeof x === 'number' && y === undefined) {
			if (x === 0) throw new Error('Cannot divide by zero');
			return Vec2.from(this.x / x, this.y / x);
		}
		const other = Vec2._from(x, y);
		if (other.x === 0 || other.y === 0) throw new Error('Cannot divide by zero');
		return Vec2.from(this.x / other.x, this.y / other.y);
	}

	normalize() {
		if (this.isZero()) throw new Error('Cannot normalize zero-length vector');
		const length = this.length();
		return Vec2.from(this.x / length, this.y / length);
	}

	length() {
		return Math.sqrt(this.lengthSquared());
	}

	lengthSquared() {
		return this.x * this.x + this.y * this.y;
	}

	distance(x, y) {
		const other = Vec2._from(x, y);
		return Math.sqrt(this.distanceSquared(other));
	}

	distanceSquared(x, y) {
		const other = Vec2._from(x, y);
		return this.subtract(other).lengthSquared();
	}

	lerp(target, amount) {
		if (!target || !amount) return Vec2.from(this);
		if (amount === 1) return Vec2.from(target);
		if (amount === 0) return Vec2.from(this);
		return Vec2.from(this.x + (target.x - this.x) * amount, this.y + (target.y - this.y) * amount);
	}

	slerp(target, amount) {
		if (!target || !amount) return Vec2.from(this);
		if (amount === 1) return Vec2.from(target);
		if (amount === 0) return Vec2.from(this);
		const dot = this.dot(target);
		const theta = Math.acos(dot) * amount;
		const relative = Vec2.from(target).subtract(this.multiply(dot)).normalize();
		return this.multiply(Math.cos(theta)).add(relative.multiply(Math.sin(theta)));
	}

	dot(x, y) {
		const other = Vec2._from(x, y);
		return this.x * other.x + this.y * other.y;
	}

	angleBetween(x, y) {
		const other = Vec2._from(x, y);
		const dot = this.dot(other);
		const denominator = this.length() * other.length();
		return denominator === 0 ? 0 : Math.acos(dot / denominator);
	}

	projectOnto(x, y) {
		const other = Vec2._from(x, y);
		if (other.isZero()) return Vec2.Zero;
		return other.scale(this.dot(other) / other.dot(other));
	}

	reflect(x, y) {
		const other = Vec2._from(x, y);
		const projection = this.projectOnto(other);
		return this.subtract(projection.multiply(2));
	}

	toVec3(z) {
		return new Vec3(this.x, this.y, z || 0);
	}

	setX(fnOrValue) {
		if (typeof fnOrValue === 'number') {
			return new Vec2(fnOrValue, this.y);
		}
		return new Vec2(fnOrValue(this.x), this.y);
	}

	setY(fnOrValue) {
		if (typeof fnOrValue === 'number') {
			return new Vec2(this.x, fnOrValue);
		}
		return new Vec2(this.x, fnOrValue(this.y));
	}

	distanceToLineSegment(start, end) {
		const segment = Vec2.from(end).subtract(start);
		if (segment.lengthSquared() === 0) return this.subtract(start).length();
		const t = Math.max(0, Math.min(1, this.subtract(start).dot(segment) / segment.dot(segment)));
		const point = Vec2.from(start).add(segment.multiply(t));
		return this.subtract(point).length();
	}

	floor() {
		return new Vec2(Math.floor(this.x), Math.floor(this.y));
	}

	floorX() {
		return new Vec2(Math.floor(this.x), this.y);
	}

	floorY() {
		return new Vec2(this.x, Math.floor(this.y));
	}

	ceil() {
		return new Vec2(Math.ceil(this.x), Math.ceil(this.y));
	}

	ceilX() {
		return new Vec2(Math.ceil(this.x), this.y);
	}

	ceilY() {
		return new Vec2(this.x, Math.ceil(this.y));
	}

	round() {
		return new Vec2(Math.round(this.x), Math.round(this.y));
	}

	roundX() {
		return new Vec2(Math.round(this.x), this.y);
	}

	roundY() {
		return new Vec2(this.x, Math.round(this.y));
	}

	north() {
		return this.add(Vec2.North);
	}

	south() {
		return this.add(Vec2.South);
	}

	east() {
		return this.add(Vec2.East);
	}

	west() {
		return this.add(Vec2.West);
	}

	isZero() {
		return this.x === 0 && this.y === 0;
	}

	toArray() {
		return [this.x, this.y];
	}

	toDirection() {
		if (this.isZero()) throw new Error('Cannot convert zero-length vector to direction');
		const normalized = this.normalize();
		const maxAxis = Math.max(Math.abs(normalized.x), Math.abs(normalized.y));
		if (maxAxis === normalized.x) return Direction.East;
		if (maxAxis === -normalized.x) return Direction.West;
		if (maxAxis === normalized.y) return Direction.North;
		if (maxAxis === -normalized.y) return Direction.South;
		throw new Error('Cannot convert vector to direction');
	}

	toBlockLocation() {
		return Vec2.from(
			(this.x << 0) - (this.x < 0 && this.x !== (this.x << 0) ? 1 : 0),
			(this.y << 0) - (this.y < 0 && this.y !== (this.y << 0) ? 1 : 0),
		);
	}

	almostEqual(x, y, epsilon) {
		try {
			let other;
			if (typeof x !== 'number' && epsilon === undefined) {
				other = Vec2._from(x, undefined);
				epsilon = y;
			} else {
				other = Vec2._from(x, y);
			}
			return Math.abs(this.x - other.x) <= epsilon && Math.abs(this.y - other.y) <= epsilon;
		} catch {
			return false;
		}
	}

	equals(x, y) {
		try {
			const other = Vec2._from(x, y);
			return this.x === other.x && this.y === other.y;
		} catch {
			return false;
		}
	}

	toString(format = 'long', separator = ', ') {
		const value = `${this.x + separator + this.y}`;
		return format === 'long' ? `Vec2(${value})` : value;
	}
}

Vec2.log = Logger.getLogger('vec2', 'vec2', 'bedrock-boost');
Vec2.Zero = new Vec2(0, 0);
Vec2.North = new Vec2(Direction.North);
Vec2.South = new Vec2(Direction.South);
Vec2.East = new Vec2(Direction.East);
Vec2.West = new Vec2(Direction.West);

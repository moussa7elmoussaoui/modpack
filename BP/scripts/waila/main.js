var ue = Object.defineProperty
var Be = Object.getOwnPropertyDescriptor
var $e = (u, t, e) =>
  t in u
    ? ue(u, t, { enumerable: !0, configurable: !0, writable: !0, value: e })
    : (u[t] = e)
var q = (u, t, e, r) => {
  for (
    var i = r > 1 ? void 0 : r ? Be(t, e) : t, n = u.length - 1, s;
    n >= 0;
    n--
  )
    (s = u[n]) && (i = (r ? s(t, e, i) : s(i)) || i)
  return (r && i && ue(t, e, i), i)
}
var a = (u, t, e) => ($e(u, typeof t != 'symbol' ? t + '' : t, e), e)
import { Direction as C, StructureRotation as pt } from '@minecraft/server'
import { Direction as _, StructureRotation as yt } from '@minecraft/server'
import '@minecraft/server'
import { Direction as R } from '@minecraft/server'
import { Direction as E } from '@minecraft/server'
import { BlockPermutation as Qr, world as ti } from '@minecraft/server'
import { world as ri } from '@minecraft/server'
import { Player as ni } from '@minecraft/server'
import { system as ai } from '@minecraft/server'
import { system as me } from '@minecraft/server'
import { system as he, world as nt } from '@minecraft/server'
import { Player as Ke, system as Kt, world as mt } from '@minecraft/server'
import { system as di } from '@minecraft/server'
import { Direction as d } from '@minecraft/server'
import { StructureSaveMode as yi, world as bi } from '@minecraft/server'
import {
  EntityEquippableComponent as vi,
  EquipmentSlot as wi,
  GameMode as Si,
  ItemDurabilityComponent as ki,
  ItemEnchantableComponent as Ei,
} from '@minecraft/server'
var Ue = class v {
    constructor(t, e, r) {
      a(this, 'x')
      a(this, 'y')
      a(this, 'z')
      if (t === _.Down) ((this.x = 0), (this.y = -1), (this.z = 0))
      else if (t === _.Up) ((this.x = 0), (this.y = 1), (this.z = 0))
      else if (t === _.North) ((this.x = 0), (this.y = 0), (this.z = -1))
      else if (t === _.South) ((this.x = 0), (this.y = 0), (this.z = 1))
      else if (t === _.East) ((this.x = 1), (this.y = 0), (this.z = 0))
      else if (t === _.West) ((this.x = -1), (this.y = 0), (this.z = 0))
      else if (typeof t == 'number') ((this.x = t), (this.y = e), (this.z = r))
      else if (Array.isArray(t))
        ((this.x = t[0]), (this.y = t[1]), (this.z = t[2]))
      else if (t instanceof v || t instanceof J)
        ((this.x = t.x), (this.y = t.y), (this.z = t.z))
      else {
        if (
          !t ||
          (!t.x && t.x !== 0) ||
          (!t.y && t.y !== 0) ||
          (!t.z && t.z !== 0)
        )
          throw new Error('Invalid vector')
        ;((this.x = t.x), (this.y = t.y), (this.z = t.z))
      }
    }
    static from(t, e, r) {
      if (t instanceof v) return new v(t)
      if (typeof t == 'number' && e !== void 0 && r !== void 0)
        return new v(t, e, r)
      if (Array.isArray(t)) return new v(t)
      if (t === _.Down) return new v(_.Down)
      if (t === _.Up) return new v(_.Up)
      if (t === _.North) return new v(_.North)
      if (t === _.South) return new v(_.South)
      if (t === _.East) return new v(_.East)
      if (t === _.West) return new v(_.West)
      if (
        !t ||
        (!t.x && t.x !== 0) ||
        (!t.y && t.y !== 0) ||
        (!t.z && t.z !== 0)
      )
        throw new Error('Invalid arguments')
      return new v(t.x, t.y, t.z)
    }
    static _from(t, e, r) {
      if (t instanceof v) return t
      if (typeof t == 'number' && e !== void 0 && r !== void 0)
        return new v(t, e, r)
      if (Array.isArray(t)) return new v(t)
      if (t === _.Down) return new v(_.Down)
      if (t === _.Up) return new v(_.Up)
      if (t === _.North) return new v(_.North)
      if (t === _.South) return new v(_.South)
      if (t === _.East) return new v(_.East)
      if (t === _.West) return new v(_.West)
      if (
        !t ||
        (!t.x && t.x !== 0) ||
        (!t.y && t.y !== 0) ||
        (!t.z && t.z !== 0)
      )
        throw new Error('Invalid arguments')
      return new v(t.x, t.y, t.z)
    }
    copy() {
      return new v(this.x, this.y, this.z)
    }
    toImmutable() {
      return new J(this.x, this.y, this.z)
    }
    static fromRotation(t, e) {
      let r
      typeof t == 'number' ? ((r = t), (e = e)) : ((r = t.y), (e = t.x))
      let i = r * (Math.PI / 180),
        n = e * (Math.PI / 180),
        s = -Math.cos(n) * Math.sin(i),
        o = -Math.sin(n),
        c = Math.cos(n) * Math.cos(i)
      return new v(s, o, c)
    }
    toRotation() {
      if (this.isZero())
        throw new Error('Cannot convert zero-length vector to direction')
      let t = this.copy().normalize(),
        e = -Math.atan2(t.x, t.z) * (180 / Math.PI)
      return { x: Math.asin(-t.y) * (180 / Math.PI), y: e }
    }
    add(t, e, r) {
      let i = v._from(t, e, r)
      return ((this.x += i.x), (this.y += i.y), (this.z += i.z), this)
    }
    subtract(t, e, r) {
      let i = v._from(t, e, r)
      return ((this.x -= i.x), (this.y -= i.y), (this.z -= i.z), this)
    }
    multiply(t, e, r) {
      if (typeof t == 'number' && e === void 0 && r === void 0)
        return ((this.x *= t), (this.y *= t), (this.z *= t), this)
      let i = v._from(t, e, r)
      return ((this.x *= i.x), (this.y *= i.y), (this.z *= i.z), this)
    }
    scale(t) {
      return ((this.x *= t), (this.y *= t), (this.z *= t), this)
    }
    divide(t, e, r) {
      if (typeof t == 'number' && e === void 0 && r === void 0) {
        if (t === 0) throw new Error('Cannot divide by zero')
        return ((this.x /= t), (this.y /= t), (this.z /= t), this)
      }
      let i = v._from(t, e, r)
      if (i.x === 0 || i.y === 0 || i.z === 0)
        throw new Error('Cannot divide by zero')
      return ((this.x /= i.x), (this.y /= i.y), (this.z /= i.z), this)
    }
    normalize() {
      if (this.isZero()) throw new Error('Cannot normalize zero-length vector')
      let t = this.length()
      return ((this.x /= t), (this.y /= t), (this.z /= t), this)
    }
    length() {
      return Math.hypot(this.x, this.y, this.z)
    }
    lengthSquared() {
      return this.x * this.x + this.y * this.y + this.z * this.z
    }
    cross(t, e, r) {
      let i = v._from(t, e, r),
        n = this.y * i.z - this.z * i.y,
        s = this.z * i.x - this.x * i.z,
        o = this.x * i.y - this.y * i.x
      return ((this.x = n), (this.y = s), (this.z = o), this)
    }
    distance(t, e, r) {
      let i = v._from(t, e, r)
      return this.copy().subtract(i).length()
    }
    distanceSquared(t, e, r) {
      let i = v._from(t, e, r)
      return this.copy().subtract(i).lengthSquared()
    }
    lerp(t, e) {
      return !t || e === void 0
        ? this
        : e === 1
          ? ((this.x = t.x), (this.y = t.y), (this.z = t.z), this)
          : e === 0
            ? this
            : ((this.x = this.x + (t.x - this.x) * e),
              (this.y = this.y + (t.y - this.y) * e),
              (this.z = this.z + (t.z - this.z) * e),
              this)
    }
    slerp(t, e) {
      if (!t || e === void 0) return this
      if (e === 1) return ((this.x = t.x), (this.y = t.y), (this.z = t.z), this)
      if (e === 0) return this
      let r = this.dot(t),
        i = Math.acos(r) * e,
        n = v.from(t).subtract(this.copy().multiply(r)).normalize(),
        s = Math.cos(i),
        o = Math.sin(i)
      return (
        this.multiply(s),
        (this.x += n.x * o),
        (this.y += n.y * o),
        (this.z += n.z * o),
        this
      )
    }
    dot(t, e, r) {
      let i = v._from(t, e, r)
      return this.x * i.x + this.y * i.y + this.z * i.z
    }
    angleBetween(t, e, r) {
      let i = v._from(t, e, r),
        n = this.dot(i),
        s = this.lengthSquared()
      if (s === 0) return 0
      let o = i.lengthSquared()
      if (o === 0) return 0
      let c = Math.sqrt(s * o),
        h = Math.min(1, Math.max(-1, n / c))
      return Math.acos(h)
    }
    projectOnto(t, e, r) {
      let i = v._from(t, e, r)
      if (i.isZero()) return ((this.x = 0), (this.y = 0), (this.z = 0), this)
      let n = i.dot(i)
      if (n === 0) return ((this.x = 0), (this.y = 0), (this.z = 0), this)
      let s = this.dot(i) / n
      return ((this.x = i.x * s), (this.y = i.y * s), (this.z = i.z * s), this)
    }
    reflect(t, e, r) {
      let i = v._from(t, e, r),
        s = this.copy().projectOnto(i)
      return this.subtract(s.multiply(2))
    }
    rotate(t, e) {
      let r = (e * Math.PI) / 180 / 2,
        i = Math.cos(r),
        n = t.x * Math.sin(r),
        s = t.y * Math.sin(r),
        o = t.z * Math.sin(r),
        c = this.x,
        h = this.y,
        g = this.z,
        y =
          i * i * c +
          2 * s * i * g -
          2 * o * i * h +
          n * n * c +
          2 * s * n * h +
          2 * o * n * g -
          o * o * c -
          s * s * c,
        I =
          2 * n * s * c +
          s * s * h +
          2 * o * s * g +
          2 * i * o * c -
          o * o * h +
          i * i * h -
          2 * n * i * g -
          n * n * h,
        S =
          2 * n * o * c +
          2 * s * o * h +
          o * o * g -
          2 * i * s * c -
          s * s * g +
          2 * i * n * h -
          n * n * g +
          i * i * g
      return ((this.x = y), (this.y = I), (this.z = S), this)
    }
    update(t, e, r) {
      return (
        t || (t = (i) => i),
        e || (e = (i) => i),
        r || (r = (i) => i),
        (this.x = t(this.x)),
        (this.y = e(this.y)),
        (this.z = r(this.z)),
        this
      )
    }
    setX(t) {
      return (typeof t == 'number' ? (this.x = t) : (this.x = t(this.x)), this)
    }
    setY(t) {
      return (typeof t == 'number' ? (this.y = t) : (this.y = t(this.y)), this)
    }
    setZ(t) {
      return (typeof t == 'number' ? (this.z = t) : (this.z = t(this.z)), this)
    }
    floor() {
      return this.update(Math.floor, Math.floor, Math.floor)
    }
    floorX() {
      return this.setX(Math.floor)
    }
    floorY() {
      return this.setY(Math.floor)
    }
    floorZ() {
      return this.setZ(Math.floor)
    }
    ceil() {
      return this.update(Math.ceil, Math.ceil, Math.ceil)
    }
    ceilX() {
      return this.setX(Math.ceil)
    }
    ceilY() {
      return this.setY(Math.ceil)
    }
    ceilZ() {
      return this.setZ(Math.ceil)
    }
    round() {
      return this.update(Math.round, Math.round, Math.round)
    }
    roundX() {
      return this.setX(Math.round)
    }
    roundY() {
      return this.setY(Math.round)
    }
    roundZ() {
      return this.setZ(Math.round)
    }
    up() {
      return this.add(_.Up)
    }
    down() {
      return this.add(_.Down)
    }
    north() {
      return this.add(_.North)
    }
    south() {
      return this.add(_.South)
    }
    east() {
      return this.add(_.East)
    }
    west() {
      return this.add(_.West)
    }
    isZero() {
      return this.x === 0 && this.y === 0 && this.z === 0
    }
    toArray() {
      return [this.x, this.y, this.z]
    }
    toDirection() {
      if (this.isZero())
        throw new Error('Cannot convert zero-length vector to direction')
      let t = this.copy().normalize(),
        e = Math.max(Math.abs(t.x), Math.abs(t.y), Math.abs(t.z))
      if (e === t.x) return _.East
      if (e === -t.x) return _.West
      if (e === t.y) return _.Up
      if (e === -t.y) return _.Down
      if (e === t.z) return _.South
      if (e === -t.z) return _.North
      throw new Error('Cannot convert vector to direction')
    }
    toStructureRotation() {
      let t = this.toRotation(),
        e = Math.round(t.y / 90) * 90
      if ((e < 0 && (e += 360), e >= 360 && (e -= 360), e === 0)) return yt.None
      if (e === 90) return yt.Rotate90
      if (e === 180) return yt.Rotate180
      if (e === 270) return yt.Rotate270
      throw new Error('Cannot convert vector to structure rotation')
    }
    toBlockLocation() {
      return (
        (this.x =
          (this.x << 0) - (this.x < 0 && this.x !== this.x << 0 ? 1 : 0)),
        (this.y =
          (this.y << 0) - (this.y < 0 && this.y !== this.y << 0 ? 1 : 0)),
        (this.z =
          (this.z << 0) - (this.z < 0 && this.z !== this.z << 0 ? 1 : 0)),
        this
      )
    }
    almostEqual(t, e, r, i) {
      try {
        let n
        return (
          typeof t != 'number' && r === void 0
            ? ((n = v._from(t, void 0, void 0)), (i = e))
            : (n = v._from(t, e, r)),
          Math.abs(this.x - n.x) <= i &&
            Math.abs(this.y - n.y) <= i &&
            Math.abs(this.z - n.z) <= i
        )
      } catch {
        return !1
      }
    }
    equals(t, e, r) {
      try {
        let i = v._from(t, e, r)
        return this.x === i.x && this.y === i.y && this.z === i.z
      } catch {
        return !1
      }
    }
    toString(t = 'long', e = ', ') {
      let r = `${this.x + e + this.y + e + this.z}`
      return t === 'long' ? `MutVec3(${r})` : r
    }
    static fromString(t, e = 'long', r = ', ') {
      if (e === 'long') {
        let i = t.match(/^MutVec3\((.*)\)$/)
        if (!i) throw new Error('Invalid string format')
        let n = i[1].split(r)
        if (n.length !== 3) throw new Error('Invalid string format')
        return new v(Number(n[0]), Number(n[1]), Number(n[2]))
      } else {
        let i = t.split(r)
        if (i.length !== 3) throw new Error('Invalid string format')
        return new v(Number(i[0]), Number(i[1]), Number(i[2]))
      }
    }
  },
  l,
  p =
    ((l = class {
      constructor(t, e) {
        a(this, 'r')
        a(this, 'g')
        a(this, 'b')
        ;((this.code = t),
          (this.color = e),
          e &&
            ((this.r = (e >> 16) & 255),
            (this.g = (e >> 8) & 255),
            (this.b = e & 255)))
      }
      toString() {
        return l.PREFIX + this.code
      }
      toRGB() {
        return this.color
      }
      toHex() {
        return this.color?.toString(16)
      }
      getRed() {
        return this.r
      }
      getGreen() {
        return this.g
      }
      getBlue() {
        return this.b
      }
      getCode() {
        return this.code
      }
      static stripColor(t) {
        return t.replace(/§[0-9a-u]/g, '')
      }
      static findClosestColor(t, e, r) {
        let i = Number.MAX_VALUE,
          n = l.WHITE
        for (let s of l.ALL_COLORS)
          if (s.r && s.g && s.b) {
            let o = Math.sqrt(
              Math.pow(s.r - t, 2) +
                Math.pow(s.g - e, 2) +
                Math.pow(s.b - r, 2),
            )
            o < i && ((i = o), (n = s))
          }
        return n
      }
    }),
    a(l, 'BLACK', new l('0', 0)),
    a(l, 'DARK_BLUE', new l('1', 170)),
    a(l, 'DARK_GREEN', new l('2', 43520)),
    a(l, 'DARK_AQUA', new l('3', 43690)),
    a(l, 'DARK_RED', new l('4', 11141120)),
    a(l, 'DARK_PURPLE', new l('5', 11141290)),
    a(l, 'GOLD', new l('6', 16755200)),
    a(l, 'GRAY', new l('7', 11184810)),
    a(l, 'DARK_GRAY', new l('8', 5592405)),
    a(l, 'BLUE', new l('9', 5592575)),
    a(l, 'GREEN', new l('a', 5635925)),
    a(l, 'AQUA', new l('b', 5636095)),
    a(l, 'RED', new l('c', 16733525)),
    a(l, 'LIGHT_PURPLE', new l('d', 16733695)),
    a(l, 'YELLOW', new l('e', 16777045)),
    a(l, 'WHITE', new l('f', 16777215)),
    a(l, 'MINECOIN_GOLD', new l('g', 14603781)),
    a(l, 'MATERIAL_QUARTZ', new l('h', 14931153)),
    a(l, 'MATERIAL_IRON', new l('i', 13552330)),
    a(l, 'MATERIAL_NETHERITE', new l('j', 4471355)),
    a(l, 'MATERIAL_REDSTONE', new l('m', 9901575)),
    a(l, 'MATERIAL_COPPER', new l('n', 11823181)),
    a(l, 'MATERIAL_GOLD', new l('p', 14594349)),
    a(l, 'MATERIAL_EMERALD', new l('q', 1155126)),
    a(l, 'MATERIAL_DIAMOND', new l('s', 2931368)),
    a(l, 'MATERIAL_LAPIS', new l('t', 2181499)),
    a(l, 'MATERIAL_AMETHYST', new l('u', 10116294)),
    a(l, 'OBFUSCATED', new l('k')),
    a(l, 'BOLD', new l('l')),
    a(l, 'ITALIC', new l('o')),
    a(l, 'RESET', new l('r')),
    a(l, 'VALUES', [
      l.BLACK,
      l.DARK_BLUE,
      l.DARK_GREEN,
      l.DARK_AQUA,
      l.DARK_RED,
      l.DARK_PURPLE,
      l.GOLD,
      l.GRAY,
      l.DARK_GRAY,
      l.BLUE,
      l.GREEN,
      l.AQUA,
      l.RED,
      l.LIGHT_PURPLE,
      l.YELLOW,
      l.WHITE,
      l.MINECOIN_GOLD,
      l.MATERIAL_QUARTZ,
      l.MATERIAL_IRON,
      l.MATERIAL_NETHERITE,
      l.MATERIAL_REDSTONE,
      l.MATERIAL_COPPER,
      l.MATERIAL_GOLD,
      l.MATERIAL_EMERALD,
      l.MATERIAL_DIAMOND,
      l.MATERIAL_LAPIS,
      l.MATERIAL_AMETHYST,
      l.OBFUSCATED,
      l.BOLD,
      l.ITALIC,
      l.RESET,
    ]),
    a(l, 'ALL_COLORS', [
      l.BLACK,
      l.DARK_BLUE,
      l.DARK_GREEN,
      l.DARK_AQUA,
      l.DARK_RED,
      l.DARK_PURPLE,
      l.GOLD,
      l.GRAY,
      l.DARK_GRAY,
      l.BLUE,
      l.GREEN,
      l.AQUA,
      l.RED,
      l.LIGHT_PURPLE,
      l.YELLOW,
      l.WHITE,
      l.MINECOIN_GOLD,
      l.MATERIAL_QUARTZ,
      l.MATERIAL_IRON,
      l.MATERIAL_NETHERITE,
      l.MATERIAL_REDSTONE,
      l.MATERIAL_COPPER,
      l.MATERIAL_GOLD,
      l.MATERIAL_EMERALD,
      l.MATERIAL_DIAMOND,
      l.MATERIAL_LAPIS,
      l.MATERIAL_AMETHYST,
    ]),
    a(l, 'PREFIX', '\xA7'),
    l),
  Y,
  Fe =
    ((Y = class {
      constructor() {
        a(this, 'OpenObject', '{')
        a(this, 'CloseObject', '}')
        a(this, 'OpenArray', '[')
        a(this, 'CloseArray', ']')
        a(this, 'Comma', ',')
        a(this, 'KeyValueSeparator', ':')
        a(this, 'StringDelimiter', '"')
        a(this, 'KeyDelimiter', '')
        a(this, 'Indent', '  ')
        a(
          this,
          'NewLine',
          `
`,
        )
        a(this, 'Space', ' ')
        a(this, 'InlineThreshold', 60)
        a(this, 'MaxDepth', 1)
        a(this, 'IncludeClassNames', !0)
        a(this, 'FunctionValue', '\u0192')
        a(this, 'NullValue', 'null')
        a(this, 'UndefinedValue', 'undefined')
        a(this, 'TrueValue', 'true')
        a(this, 'FalseValue', 'false')
        a(this, 'CycleValue', '[...cycle...]')
        a(this, 'TruncatedObjectValue', '{...}')
        a(this, 'OpenCloseObjectColor', p.YELLOW)
        a(this, 'OpenCloseArrayColor', p.AQUA)
        a(this, 'NumberColor', p.DARK_AQUA)
        a(this, 'StringColor', p.DARK_GREEN)
        a(this, 'BooleanColor', p.GOLD)
        a(this, 'NullColor', p.GOLD)
        a(this, 'KeyColor', p.GRAY)
        a(this, 'EscapeColor', p.GOLD)
        a(this, 'FunctionColor', p.GRAY)
        a(this, 'ClassColor', p.GRAY)
        a(this, 'ClassStyle', p.BOLD)
        a(this, 'CycleColor', p.DARK_RED)
      }
      static createPlain() {
        let t = new Y()
        return (
          (t.OpenCloseObjectColor = ''),
          (t.OpenCloseArrayColor = ''),
          (t.NumberColor = ''),
          (t.StringColor = ''),
          (t.BooleanColor = ''),
          (t.NullColor = ''),
          (t.KeyColor = ''),
          (t.EscapeColor = ''),
          (t.FunctionColor = ''),
          (t.ClassColor = ''),
          (t.ClassStyle = ''),
          (t.CycleColor = ''),
          t
        )
      }
      stringify(t) {
        return this.stringifyValue(t, {
          indentLevel: 0,
          visited: new WeakSet(),
        })
      }
      stringifyString(t) {
        return (
          this.StringColor +
          this.StringDelimiter +
          this.escapeString(t) +
          this.StringDelimiter +
          p.RESET
        )
      }
      stringifyNumber(t) {
        return this.NumberColor + t.toString() + p.RESET
      }
      stringifyBoolean(t) {
        return (
          this.BooleanColor + (t ? this.TrueValue : this.FalseValue) + p.RESET
        )
      }
      stringifyFunction(t) {
        return this.FunctionColor + this.FunctionValue + p.RESET
      }
      stringifyNull() {
        return this.NullColor + this.NullValue + p.RESET
      }
      stringifyUndefined() {
        return this.NullColor + this.UndefinedValue + p.RESET
      }
      stringifyCycle() {
        return this.CycleColor + this.CycleValue + p.RESET
      }
      stringifyArray(t, e) {
        let r = this.Indent.repeat(e.indentLevel)
        if (t.length === 0)
          return (
            this.OpenCloseArrayColor +
            this.OpenArray +
            this.CloseArray +
            p.RESET
          )
        let i =
            this.OpenCloseArrayColor + this.OpenArray + p.RESET + this.NewLine,
          n = this.OpenCloseArrayColor + this.OpenArray + p.RESET
        return (
          t.forEach((s, o) => {
            ;((i += r + this.Indent + this.stringifyValue(s, this.indent(e))),
              (i +=
                o < t.length - 1 ? this.Comma + this.NewLine : this.NewLine),
              (n += this.stringifyValue(s, this.indent(e))),
              (n += o < t.length - 1 ? this.Comma + this.Space : ''))
          }),
          (i += r + this.OpenCloseArrayColor + this.CloseArray + p.RESET),
          (n += this.OpenCloseArrayColor + this.CloseArray + p.RESET),
          n.length < this.InlineThreshold ? n : i
        )
      }
      stringifyTruncatedObject(t, e, r) {
        return (
          (this.IncludeClassNames
            ? this.ClassColor + '' + this.ClassStyle + e + p.RESET + this.Space
            : '') + this.TruncatedObjectValue
        )
      }
      stringifyObject(t, e, r, i) {
        let n = this.Indent.repeat(i.indentLevel),
          s =
            this.IncludeClassNames && e !== 'Object'
              ? this.ClassColor +
                '' +
                this.ClassStyle +
                e +
                p.RESET +
                this.Space
              : ''
        if (r.length === 0)
          return (
            s +
            this.OpenCloseObjectColor +
            this.OpenObject +
            this.CloseObject +
            p.RESET
          )
        let o =
            s +
            this.OpenCloseObjectColor +
            this.OpenObject +
            p.RESET +
            this.NewLine,
          c = s + this.OpenCloseObjectColor + this.OpenObject + p.RESET
        return (
          r.forEach(([h, g], y) => {
            let I = this.stringifyValue(g, this.indent(i))
            ;((o +=
              n +
              this.Indent +
              this.KeyColor +
              this.KeyDelimiter +
              h +
              this.KeyDelimiter +
              p.RESET +
              this.KeyValueSeparator +
              this.Space +
              I),
              (o +=
                y < r.length - 1 ? this.Comma + this.NewLine : this.NewLine),
              (c +=
                this.KeyColor +
                h +
                p.RESET +
                this.KeyValueSeparator +
                this.Space +
                I),
              (c += y < r.length - 1 ? this.Comma + this.Space : ''))
          }),
          (o += n + this.OpenCloseObjectColor + this.CloseObject + p.RESET),
          (c += this.OpenCloseObjectColor + this.CloseObject + p.RESET),
          c.length < this.InlineThreshold ? c : o
        )
      }
      shouldTruncateObject(t, e, r) {
        return !(
          e === 'Object' ||
          r.indentLevel <= this.MaxDepth ||
          this.MaxDepth <= 0
        )
      }
      stringifyValue(t, e) {
        if (t === null) return this.stringifyNull()
        if (t === void 0) return this.stringifyUndefined()
        if (typeof t == 'number') return this.stringifyNumber(t)
        if (typeof t == 'string') return this.stringifyString(t)
        if (typeof t == 'boolean') return this.stringifyBoolean(t)
        if (typeof t == 'function') return this.stringifyFunction(t)
        if (this.isCycle(t, e)) return this.stringifyCycle()
        if ((this.markCycle(t, e), Array.isArray(t))) {
          let r = this.stringifyArray(t, e.indentLevel ? this.indent(e) : e)
          return (this.clearCycle(t, e), r)
        }
        if (typeof t == 'object') {
          let r = t.constructor.name
          if (this.shouldTruncateObject(t, r, e)) {
            let i = this.stringifyTruncatedObject(t, r, e)
            return (this.clearCycle(t, e), i)
          } else {
            let i = new Set(),
              n = Object.getPrototypeOf(t),
              s = Object.keys(n)
            for (; s.length > 0;)
              (s.forEach((g) => i.add(g)),
                (n = Object.getPrototypeOf(n)),
                (s = Object.keys(n)))
            ;(Object.keys(t).forEach((g) => i.add(g)),
              i.delete('__cycleDetection__'))
            let c = [...i]
                .sort()
                .map((g) => {
                  try {
                    return [g, t[g] ?? void 0]
                  } catch {
                    return [g, void 0]
                  }
                })
                .filter(([, g]) => typeof g != 'function' && g !== void 0),
              h = this.stringifyObject(t, r, c, e)
            return (this.clearCycle(t, e), h)
          }
        }
        return (this.clearCycle(t, e), p.RESET + t.toString())
      }
      escapeString(t) {
        return t
          .replace(/\\/g, this.EscapeColor + '\\\\' + this.StringColor)
          .replace(/"/g, this.EscapeColor + '\\"' + this.StringColor)
          .replace(/\n/g, this.EscapeColor + '\\n' + this.StringColor)
          .replace(/\r/g, this.EscapeColor + '\\r' + this.StringColor)
          .replace(/\t/g, this.EscapeColor + '\\t' + this.StringColor)
      }
      markCycle(t, e) {
        e.visited.add(t)
      }
      isCycle(t, e) {
        return e.visited.has(t)
      }
      clearCycle(t, e) {
        e.visited.delete(t)
      }
      indent(t) {
        return { ...t, indentLevel: t.indentLevel + 1 }
      }
    }),
    a(Y, 'DEFAULT', new Y()),
    a(Y, 'PLAIN', Y.createPlain()),
    Y),
  _t = void 0
try {
  _t = globalSourceMapping
} catch {}
var A,
  V =
    ((A = class {
      constructor(t, e, r = p.RESET) {
        ;((this.level = t), (this.name = e), (this.color = r))
      }
      toString() {
        return this.color + this.name.toUpperCase() + p.RESET
      }
      static parse(t) {
        t = t.toLowerCase()
        for (let r of A.values) if (r.name === t) return r
        let e = parseInt(t)
        if (!isNaN(e)) {
          for (let r of A.values) if (r.level === e) return r
        }
      }
    }),
    a(A, 'All', new A(-2, 'all')),
    a(A, 'Trace', new A(-2, 'trace', p.DARK_AQUA)),
    a(A, 'Debug', new A(-1, 'debug', p.AQUA)),
    a(A, 'Info', new A(0, 'info', p.GREEN)),
    a(A, 'Warn', new A(1, 'warn', p.GOLD)),
    a(A, 'Error', new A(2, 'error', p.RED)),
    a(A, 'Fatal', new A(3, 'fatal', p.DARK_RED)),
    a(A, 'Off', new A(100, 'off')),
    a(A, 'values', [
      A.All,
      A.Trace,
      A.Debug,
      A.Info,
      A.Warn,
      A.Error,
      A.Fatal,
      A.Off,
    ]),
    A)
var j = {
    level: V.Info,
    filter: ['*'],
    outputTags: !1,
    timestampFormatter: (u) => '',
    formatFunction: (u, t, e, r, i = void 0) => {
      let n = i !== void 0 ? `\xA77${i.map((o) => `[${o}]`).join('')}\xA7r` : ''
      return `${r ? `[${r}]` : ''}[${u}][${p.MATERIAL_EMERALD}${t.name}${p.RESET}]${n} ${e}`
    },
    messagesJoinFunction: (u) => u.join(' '),
    jsonFormatter: Fe.DEFAULT,
    outputConfig: {
      [V.Trace.level]: [0, 1],
      [V.Debug.level]: [0, 1],
      [V.Info.level]: [0, 1],
      [V.Warn.level]: [0, 1, 2],
      [V.Error.level]: [0, 1, 3],
      [V.Fatal.level]: [0, 1, 3],
    },
  },
  st,
  N =
    ((st = class {
      constructor(t, e = []) {
        ;((this.name = t), (this.tags = e))
      }
      static init() {}
      static setLevel(t) {
        j.level = t
      }
      static setFilter(t) {
        j.filter = t
      }
      static setFormatFunction(t) {
        j.formatFunction = t
      }
      static setMessagesJoinFunction(t) {
        j.messagesJoinFunction = t
      }
      static setTagsOutputVisibility(t) {
        j.outputTags = t
      }
      static setTimestampFormatter(t) {
        j.timestampFormatter = t
      }
      static setBasicTimestampFormatter() {
        j.timestampFormatter = (t) => {
          let e = t.getHours().toString().padStart(2, '0'),
            r = t.getMinutes().toString().padStart(2, '0'),
            i = t.getSeconds().toString().padStart(2, '0'),
            n = Math.floor(t.getMilliseconds() / 10)
              .toString()
              .padStart(2, '0')
          return `${e}:${r}:${i}.${n}`
        }
      }
      static setJsonFormatter(t) {
        j.jsonFormatter = t
      }
      static getOutputConfig() {
        return j.outputConfig
      }
      static getLogger(t, ...e) {
        return new st(t, e)
      }
      log(t, ...e) {}
      stringifyError(t) {
        let e = t.stack ?? ''
        if (_t) {
          let r = /\(([^)]+\.js):(\d+)(?::(\d+))?\)/
          e = e
            .split(
              `
`,
            )
            .map((i) => {
              let n = r.exec(i)
              if (n) {
                let s = n[1],
                  o = parseInt(n[2], 10) - _t.metadata.offset
                if (s.includes(_t.metadata.filePath)) {
                  let c = globalSourceMapping[o]
                  if (c) {
                    let h = `(${c.source}:${c.originalLine})`
                    return i.replace(r, h)
                  }
                }
              }
              return i
            }).join(`
`)
        }
        return `${p.DARK_RED}${p.BOLD}${t.message}
${p.RESET}${p.GRAY}${p.ITALIC}${e}${p.RESET}`
      }
      logRaw(t, ...e) {}
      trace(...t) {}
      debug(...t) {}
      info(...t) {}
      warn(...t) {}
      error(...t) {}
      fatal(...t) {}
    }),
    a(st, 'initialized', !1),
    st),
  m,
  J =
    ((m = class {
      constructor(t, e, r) {
        a(this, 'x')
        a(this, 'y')
        a(this, 'z')
        if (t === C.Down) ((this.x = 0), (this.y = -1), (this.z = 0))
        else if (t === C.Up) ((this.x = 0), (this.y = 1), (this.z = 0))
        else if (t === C.North) ((this.x = 0), (this.y = 0), (this.z = -1))
        else if (t === C.South) ((this.x = 0), (this.y = 0), (this.z = 1))
        else if (t === C.East) ((this.x = 1), (this.y = 0), (this.z = 0))
        else if (t === C.West) ((this.x = -1), (this.y = 0), (this.z = 0))
        else if (typeof t == 'number')
          ((this.x = t), (this.y = e), (this.z = r))
        else if (Array.isArray(t))
          ((this.x = t[0]), (this.y = t[1]), (this.z = t[2]))
        else if (t instanceof m)
          ((this.x = t.x), (this.y = t.y), (this.z = t.z))
        else {
          if (
            !t ||
            (!t.x && t.x !== 0) ||
            (!t.y && t.y !== 0) ||
            (!t.z && t.z !== 0)
          )
            throw (
              m.log.error(new Error('Invalid vector'), t),
              new Error('Invalid vector')
            )
          ;((this.x = t.x), (this.y = t.y), (this.z = t.z))
        }
      }
      static from(t, e, r) {
        if (t instanceof m) return t
        if (typeof t == 'number' && e !== void 0 && r !== void 0)
          return new m(t, e, r)
        if (Array.isArray(t)) return new m(t)
        if (t === C.Down) return m.Down
        if (t === C.Up) return m.Up
        if (t === C.North) return m.North
        if (t === C.South) return m.South
        if (t === C.East) return m.East
        if (t === C.West) return m.West
        if (
          !t ||
          (!t.x && t.x !== 0) ||
          (!t.y && t.y !== 0) ||
          (!t.z && t.z !== 0)
        )
          throw (
            m.log.error(new Error('Invalid arguments'), t, e, r),
            new Error('Invalid arguments')
          )
        return new m(t.x, t.y, t.z)
      }
      static _from(t, e, r) {
        if (t instanceof m) return t
        if (typeof t == 'number' && e !== void 0 && r !== void 0)
          return new m(t, e, r)
        if (Array.isArray(t)) return new m(t)
        if (t === C.Down) return m.Down
        if (t === C.Up) return m.Up
        if (t === C.North) return m.North
        if (t === C.South) return m.South
        if (t === C.East) return m.East
        if (t === C.West) return m.West
        if (
          !t ||
          (!t.x && t.x !== 0) ||
          (!t.y && t.y !== 0) ||
          (!t.z && t.z !== 0)
        )
          throw (
            m.log.error(new Error('Invalid arguments'), t, e, r),
            new Error('Invalid arguments')
          )
        return new m(t.x, t.y, t.z)
      }
      copy() {
        return new m(this.x, this.y, this.z)
      }
      toMutable() {
        return new Ue(this.x, this.y, this.z)
      }
      static fromRotation(t, e) {
        let r
        typeof t == 'number' ? ((r = t), (e = e)) : ((r = t.y), (e = t.x))
        let i = r * (Math.PI / 180),
          n = e * (Math.PI / 180),
          s = -Math.cos(n) * Math.sin(i),
          o = -Math.sin(n),
          c = Math.cos(n) * Math.cos(i)
        return new m(s, o, c)
      }
      toRotation() {
        if (this.isZero())
          throw (
            m.log.error(
              new Error('Cannot convert zero-length vector to direction'),
            ),
            new Error('Cannot convert zero-length vector to direction')
          )
        let t = this.normalize(),
          e = -Math.atan2(t.x, t.z) * (180 / Math.PI)
        return { x: Math.asin(-t.y) * (180 / Math.PI), y: e }
      }
      add(t, e, r) {
        let i = m._from(t, e, r)
        return m.from(i.x + this.x, i.y + this.y, i.z + this.z)
      }
      subtract(t, e, r) {
        let i = m._from(t, e, r)
        return m.from(this.x - i.x, this.y - i.y, this.z - i.z)
      }
      multiply(t, e, r) {
        if (typeof t == 'number' && e === void 0 && r === void 0)
          return m.from(this.x * t, this.y * t, this.z * t)
        let i = m._from(t, e, r)
        return m.from(i.x * this.x, i.y * this.y, i.z * this.z)
      }
      scale(t) {
        return m.from(this.x * t, this.y * t, this.z * t)
      }
      divide(t, e, r) {
        if (typeof t == 'number' && e === void 0 && r === void 0) {
          if (t === 0) throw new Error('Cannot divide by zero')
          return m.from(this.x / t, this.y / t, this.z / t)
        }
        let i = m._from(t, e, r)
        if (i.x === 0 || i.y === 0 || i.z === 0)
          throw new Error('Cannot divide by zero')
        return m.from(this.x / i.x, this.y / i.y, this.z / i.z)
      }
      normalize() {
        if (this.isZero())
          throw (
            m.log.error(new Error('Cannot normalize zero-length vector')),
            new Error('Cannot normalize zero-length vector')
          )
        let t = this.length()
        return m.from(this.x / t, this.y / t, this.z / t)
      }
      length() {
        return Math.hypot(this.x, this.y, this.z)
      }
      lengthSquared() {
        return this.x * this.x + this.y * this.y + this.z * this.z
      }
      cross(t, e, r) {
        let i = m._from(t, e, r)
        return m.from(
          this.y * i.z - this.z * i.y,
          this.z * i.x - this.x * i.z,
          this.x * i.y - this.y * i.x,
        )
      }
      distance(t, e, r) {
        let i = m._from(t, e, r)
        return this.subtract(i).length()
      }
      distanceSquared(t, e, r) {
        let i = m._from(t, e, r)
        return this.subtract(i).lengthSquared()
      }
      lerp(t, e) {
        return !t || !e
          ? m.from(this)
          : e === 1
            ? m.from(t)
            : e === 0
              ? m.from(this)
              : m.from(
                  this.x + (t.x - this.x) * e,
                  this.y + (t.y - this.y) * e,
                  this.z + (t.z - this.z) * e,
                )
      }
      slerp(t, e) {
        if (!t || !e) return m.from(this)
        if (e === 1) return m.from(t)
        if (e === 0) return m.from(this)
        let r = this.dot(t),
          i = Math.acos(r) * e,
          n = m.from(t).subtract(this.multiply(r)).normalize()
        return this.multiply(Math.cos(i)).add(n.multiply(Math.sin(i)))
      }
      dot(t, e, r) {
        let i = m._from(t, e, r)
        return this.x * i.x + this.y * i.y + this.z * i.z
      }
      angleBetween(t, e, r) {
        let i = m._from(t, e, r),
          n = this.dot(i),
          s = this.lengthSquared()
        if (s === 0) return 0
        let o = i.lengthSquared()
        if (o === 0) return 0
        let c = Math.sqrt(s * o),
          h = Math.min(1, Math.max(-1, n / c))
        return Math.acos(h)
      }
      projectOnto(t, e, r) {
        let i = m._from(t, e, r)
        if (i.isZero()) return m.Zero
        let n = i.dot(i)
        if (n === 0) return m.Zero
        let s = this.dot(i) / n
        return m.from(i.x * s, i.y * s, i.z * s)
      }
      reflect(t, e, r) {
        let i = m._from(t, e, r),
          n = this.projectOnto(i)
        return this.subtract(n.multiply(2))
      }
      rotate(t, e) {
        let r = (e * Math.PI) / 180 / 2,
          i = Math.cos(r),
          n = t.x * Math.sin(r),
          s = t.y * Math.sin(r),
          o = t.z * Math.sin(r),
          c = this,
          h =
            i * i * c.x +
            2 * s * i * c.z -
            2 * o * i * c.y +
            n * n * c.x +
            2 * s * n * c.y +
            2 * o * n * c.z -
            o * o * c.x -
            s * s * c.x,
          g =
            2 * n * s * c.x +
            s * s * c.y +
            2 * o * s * c.z +
            2 * i * o * c.x -
            o * o * c.y +
            i * i * c.y -
            2 * n * i * c.z -
            n * n * c.y,
          y =
            2 * n * o * c.x +
            2 * s * o * c.y +
            o * o * c.z -
            2 * i * s * c.x -
            s * s * c.z +
            2 * i * n * c.y -
            n * n * c.z +
            i * i * c.z
        return new m(h, g, y)
      }
      update(t, e, r) {
        return (
          t || (t = (i) => i),
          e || (e = (i) => i),
          r || (r = (i) => i),
          new m(t(this.x), e(this.y), r(this.z))
        )
      }
      setX(t) {
        return typeof t == 'number'
          ? new m(t, this.y, this.z)
          : new m(t(this.x), this.y, this.z)
      }
      setY(t) {
        return typeof t == 'number'
          ? new m(this.x, t, this.z)
          : new m(this.x, t(this.y), this.z)
      }
      setZ(t) {
        return typeof t == 'number'
          ? new m(this.x, this.y, t)
          : new m(this.x, this.y, t(this.z))
      }
      distanceToLineSegment(t, e) {
        let r = m.from(e).subtract(t)
        if (r.lengthSquared() === 0) return this.subtract(t).length()
        let i = Math.max(0, Math.min(1, this.subtract(t).dot(r) / r.dot(r))),
          n = m.from(t).add(r.multiply(i))
        return this.subtract(n).length()
      }
      floor() {
        return this.update(Math.floor, Math.floor, Math.floor)
      }
      floorX() {
        return this.setX(Math.floor)
      }
      floorY() {
        return this.setY(Math.floor)
      }
      floorZ() {
        return this.setZ(Math.floor)
      }
      ceil() {
        return new m(Math.ceil(this.x), Math.ceil(this.y), Math.ceil(this.z))
      }
      ceilX() {
        return this.setX(Math.ceil)
      }
      ceilY() {
        return this.setY(Math.ceil)
      }
      ceilZ() {
        return this.setZ(Math.ceil)
      }
      round() {
        return this.update(Math.round, Math.round, Math.round)
      }
      roundX() {
        return this.setX(Math.round)
      }
      roundY() {
        return this.setY(Math.round)
      }
      roundZ() {
        return this.setZ(Math.round)
      }
      up() {
        return this.add(m.Up)
      }
      down() {
        return this.add(m.Down)
      }
      north() {
        return this.add(m.North)
      }
      south() {
        return this.add(m.South)
      }
      east() {
        return this.add(m.East)
      }
      west() {
        return this.add(m.West)
      }
      isZero() {
        return this.x === 0 && this.y === 0 && this.z === 0
      }
      toArray() {
        return [this.x, this.y, this.z]
      }
      toDirection() {
        if (this.isZero())
          throw (
            m.log.error(
              new Error('Cannot convert zero-length vector to direction'),
            ),
            new Error('Cannot convert zero-length vector to direction')
          )
        let t = this.normalize(),
          e = Math.max(Math.abs(t.x), Math.abs(t.y), Math.abs(t.z))
        if (e === t.x) return C.East
        if (e === -t.x) return C.West
        if (e === t.y) return C.Up
        if (e === -t.y) return C.Down
        if (e === t.z) return C.South
        if (e === -t.z) return C.North
        throw (
          m.log.error(new Error('Cannot convert vector to direction'), this),
          new Error('Cannot convert vector to direction')
        )
      }
      toStructureRotation() {
        let t = this.toRotation(),
          e = Math.round(t.y / 90) * 90
        if ((e < 0 && (e += 360), e >= 360 && (e -= 360), e === 0))
          return pt.None
        if (e === 90) return pt.Rotate90
        if (e === 180) return pt.Rotate180
        if (e === 270) return pt.Rotate270
        throw (
          m.log.error(
            new Error('Cannot convert vector to structure rotation'),
            this,
          ),
          new Error('Cannot convert vector to structure rotation')
        )
      }
      toBlockLocation() {
        return m.from(
          (this.x << 0) - (this.x < 0 && this.x !== this.x << 0 ? 1 : 0),
          (this.y << 0) - (this.y < 0 && this.y !== this.y << 0 ? 1 : 0),
          (this.z << 0) - (this.z < 0 && this.z !== this.z << 0 ? 1 : 0),
        )
      }
      almostEqual(t, e, r, i) {
        try {
          let n
          return (
            typeof t != 'number' && r === void 0
              ? ((n = m._from(t, void 0, void 0)), (i = e))
              : (n = m._from(t, e, r)),
            Math.abs(this.x - n.x) <= i &&
              Math.abs(this.y - n.y) <= i &&
              Math.abs(this.z - n.z) <= i
          )
        } catch {
          return !1
        }
      }
      equals(t, e, r) {
        try {
          let i = m._from(t, e, r)
          return this.x === i.x && this.y === i.y && this.z === i.z
        } catch {
          return !1
        }
      }
      toString(t = 'long', e = ', ') {
        let r = `${this.x + e + this.y + e + this.z}`
        return t === 'long' ? `Vec3(${r})` : r
      }
      static fromString(t, e = 'long', r = ', ') {
        if (e === 'long') {
          let i = t.match(/^Vec3\((.*)\)$/)
          if (!i) throw new Error('Invalid string format')
          let n = i[1].split(r)
          if (n.length !== 3) throw new Error('Invalid string format')
          return m.from(Number(n[0]), Number(n[1]), Number(n[2]))
        } else {
          let i = t.split(r)
          if (i.length !== 3) throw new Error('Invalid string format')
          return m.from(Number(i[0]), Number(i[1]), Number(i[2]))
        }
      }
    }),
    a(m, 'log', N.getLogger('vec3', 'vec3', 'bedrock-boost')),
    a(m, 'Zero', new m(0, 0, 0)),
    a(m, 'Down', new m(C.Down)),
    a(m, 'Up', new m(C.Up)),
    a(m, 'North', new m(C.North)),
    a(m, 'South', new m(C.South)),
    a(m, 'East', new m(C.East)),
    a(m, 'West', new m(C.West)),
    m),
  bt = class k {
    constructor(t, e) {
      a(this, 'x')
      a(this, 'y')
      if (t === E.Down || t === E.Up) throw new Error('Invalid direction')
      if (t === E.North) ((this.x = 0), (this.y = 1))
      else if (t === E.South) ((this.x = 0), (this.y = -1))
      else if (t === E.East) ((this.x = 1), (this.y = 0))
      else if (t === E.West) ((this.x = -1), (this.y = 0))
      else if (typeof t == 'number') {
        if (e === void 0) throw new Error('Invalid vector')
        ;((this.x = t), (this.y = e))
      } else if (Array.isArray(t)) ((this.x = t[0]), (this.y = t[1]))
      else if (t instanceof k || t instanceof tt)
        ((this.x = t.x), (this.y = t.y))
      else {
        let r = t
        if (
          !r ||
          (!r.x && r.x !== 0) ||
          (!r.y && r.y !== 0 && !r.z && r.z !== 0)
        )
          throw new Error('Invalid vector')
        if (((this.x = r.x), r.y || r.y === 0)) this.y = r.y
        else if (r.z || r.z === 0) this.y = r.z
        else throw new Error('Invalid vector')
      }
    }
    static from(t, e) {
      if (t instanceof k) return new k(t)
      if (t instanceof tt) return new k(t)
      if (typeof t == 'number' && e !== void 0) return new k(t, e)
      if (Array.isArray(t)) return new k(t)
      if (t === E.Down || t === E.Up) throw new Error('Invalid direction')
      return t === E.North
        ? new k(E.North)
        : t === E.South
          ? new k(E.South)
          : t === E.East
            ? new k(E.East)
            : t === E.West
              ? new k(E.West)
              : new k(t, e)
    }
    static _from(t, e) {
      if (t instanceof k) return t
      if (t instanceof tt) return new k(t)
      if (typeof t == 'number' && e !== void 0) return new k(t, e)
      if (Array.isArray(t)) return new k(t)
      if (t === E.Down || t === E.Up) throw new Error('Invalid direction')
      return t === E.North
        ? new k(E.North)
        : t === E.South
          ? new k(E.South)
          : t === E.East
            ? new k(E.East)
            : t === E.West
              ? new k(E.West)
              : new k(t, e)
    }
    copy() {
      return new k(this.x, this.y)
    }
    toImmutable() {
      return new tt(this.x, this.y)
    }
    static fromYaw(t) {
      let e = t * (Math.PI / 180),
        r = Math.sin(e),
        i = Math.cos(e)
      return new k(r, i)
    }
    toYaw() {
      if (this.isZero())
        throw new Error('Cannot convert zero-length vector to direction')
      let t = this.copy().normalize()
      return Math.atan2(t.x, t.y) * (180 / Math.PI)
    }
    add(t, e) {
      let r = k._from(t, e)
      return ((this.x += r.x), (this.y += r.y), this)
    }
    subtract(t, e) {
      let r = k._from(t, e)
      return ((this.x -= r.x), (this.y -= r.y), this)
    }
    multiply(t, e) {
      if (typeof t == 'number' && e === void 0)
        return ((this.x *= t), (this.y *= t), this)
      let r = k._from(t, e)
      return ((this.x *= r.x), (this.y *= r.y), this)
    }
    scale(t) {
      return ((this.x *= t), (this.y *= t), this)
    }
    divide(t, e) {
      if (typeof t == 'number' && e === void 0) {
        if (t === 0) throw new Error('Cannot divide by zero')
        return ((this.x /= t), (this.y /= t), this)
      }
      let r = k._from(t, e)
      if (r.x === 0 || r.y === 0) throw new Error('Cannot divide by zero')
      return ((this.x /= r.x), (this.y /= r.y), this)
    }
    normalize() {
      if (this.isZero()) throw new Error('Cannot normalize zero-length vector')
      let t = this.length()
      return ((this.x /= t), (this.y /= t), this)
    }
    length() {
      return Math.hypot(this.x, this.y)
    }
    lengthSquared() {
      return this.x * this.x + this.y * this.y
    }
    distance(t, e) {
      let r = k._from(t, e)
      return this.copy().subtract(r).length()
    }
    distanceSquared(t, e) {
      let r = k._from(t, e)
      return this.copy().subtract(r).lengthSquared()
    }
    lerp(t, e) {
      return !t || e === void 0
        ? this
        : e === 1
          ? ((this.x = t.x), (this.y = t.y), this)
          : e === 0
            ? this
            : ((this.x = this.x + (t.x - this.x) * e),
              (this.y = this.y + (t.y - this.y) * e),
              this)
    }
    slerp(t, e) {
      if (!t || e === void 0) return this
      if (e === 1) return ((this.x = t.x), (this.y = t.y), this)
      if (e === 0) return this
      let r = this.dot(t),
        i = Math.acos(r) * e,
        n = k.from(t).subtract(this.copy().multiply(r)).normalize(),
        s = Math.cos(i),
        o = Math.sin(i)
      return (this.multiply(s), (this.x += n.x * o), (this.y += n.y * o), this)
    }
    dot(t, e) {
      let r = k._from(t, e)
      return this.x * r.x + this.y * r.y
    }
    angleBetween(t, e) {
      let r = k._from(t, e),
        i = this.dot(r),
        n = this.length() * r.length()
      return n === 0 ? 0 : Math.acos(i / n)
    }
    projectOnto(t, e) {
      let r = k._from(t, e)
      if (r.isZero()) return ((this.x = 0), (this.y = 0), this)
      let i = this.dot(r) / r.dot(r)
      return ((this.x = r.x * i), (this.y = r.y * i), this)
    }
    reflect(t, e) {
      let r = k._from(t, e),
        i = this.copy().projectOnto(r)
      return this.subtract(i.multiply(2))
    }
    toVec3(t) {
      return new J(this.x, this.y, t || 0)
    }
    setX(t) {
      return (typeof t == 'number' ? (this.x = t) : (this.x = t(this.x)), this)
    }
    setY(t) {
      return (typeof t == 'number' ? (this.y = t) : (this.y = t(this.y)), this)
    }
    update(t, e) {
      return (
        t || (t = (r) => r),
        e || (e = (r) => r),
        (this.x = t(this.x)),
        (this.y = e(this.y)),
        this
      )
    }
    floor() {
      return this.update(Math.floor, Math.floor)
    }
    floorX() {
      return this.setX(Math.floor)
    }
    floorY() {
      return this.setY(Math.floor)
    }
    ceil() {
      return this.update(Math.ceil, Math.ceil)
    }
    ceilX() {
      return this.setX(Math.ceil)
    }
    ceilY() {
      return this.setY(Math.ceil)
    }
    round() {
      return this.update(Math.round, Math.round)
    }
    roundX() {
      return this.setX(Math.round)
    }
    roundY() {
      return this.setY(Math.round)
    }
    north() {
      return this.add(E.North)
    }
    south() {
      return this.add(E.South)
    }
    east() {
      return this.add(E.East)
    }
    west() {
      return this.add(E.West)
    }
    isZero() {
      return this.x === 0 && this.y === 0
    }
    toArray() {
      return [this.x, this.y]
    }
    toDirection() {
      if (this.isZero())
        throw new Error('Cannot convert zero-length vector to direction')
      let t = this.copy().normalize(),
        e = Math.max(Math.abs(t.x), Math.abs(t.y))
      if (e === t.x) return E.East
      if (e === -t.x) return E.West
      if (e === t.y) return E.North
      if (e === -t.y) return E.South
      throw new Error('Cannot convert vector to direction')
    }
    toBlockLocation() {
      let t = (this.x << 0) - (this.x < 0 && this.x !== this.x << 0 ? 1 : 0),
        e = (this.y << 0) - (this.y < 0 && this.y !== this.y << 0 ? 1 : 0)
      return ((this.x = t), (this.y = e), this)
    }
    almostEqual(t, e, r) {
      try {
        let i
        return (
          typeof t != 'number' && r === void 0
            ? ((i = k._from(t, void 0)), (r = e))
            : (i = k._from(t, e)),
          Math.abs(this.x - i.x) <= r && Math.abs(this.y - i.y) <= r
        )
      } catch {
        return !1
      }
    }
    equals(t, e) {
      try {
        let r = k._from(t, e)
        return this.x === r.x && this.y === r.y
      } catch {
        return !1
      }
    }
    toString(t = 'long', e = ', ') {
      let r = `${this.x + e + this.y}`
      return t === 'long' ? `MutVec2(${r})` : r
    }
  },
  f,
  tt =
    ((f = class {
      constructor(t, e) {
        a(this, 'x')
        a(this, 'y')
        if (t === R.Down || t === R.Up)
          throw (
            f.log.error(new Error('Invalid direction'), t),
            new Error('Invalid direction')
          )
        if (t === R.North) ((this.x = 0), (this.y = 1))
        else if (t === R.South) ((this.x = 0), (this.y = -1))
        else if (t === R.East) ((this.x = 1), (this.y = 0))
        else if (t === R.West) ((this.x = -1), (this.y = 0))
        else if (typeof t == 'number') ((this.x = t), (this.y = e))
        else if (Array.isArray(t)) ((this.x = t[0]), (this.y = t[1]))
        else if (t instanceof f) ((this.x = t.x), (this.y = t.y))
        else if (t instanceof bt) ((this.x = t.x), (this.y = t.y))
        else if (t instanceof J) ((this.x = t.x), (this.y = t.y))
        else {
          let r = t
          if (
            !r ||
            (!r.x && r.x !== 0) ||
            (!r.y && r.y !== 0 && !r.z && r.z !== 0)
          )
            throw (
              f.log.error(new Error('Invalid vector'), t),
              new Error('Invalid vector')
            )
          if (((this.x = t.x), r.y || r.y === 0)) this.y = r.y
          else if (r.z || r.z === 0) this.y = r.z
          else
            throw (
              f.log.error(new Error('Invalid vector'), t),
              new Error('Invalid vector')
            )
        }
      }
      static from(t, e) {
        if (t instanceof f) return t
        if (t instanceof bt) return new f(t.x, t.y)
        if (typeof t == 'number' && e !== void 0) return new f(t, e)
        if (Array.isArray(t)) return new f(t)
        if (t === R.Down || t === R.Up)
          throw (
            f.log.error(new Error('Invalid direction'), t),
            new Error('Invalid direction')
          )
        return t === R.North
          ? f.North
          : t === R.South
            ? f.South
            : t === R.East
              ? f.East
              : t === R.West
                ? f.West
                : new f(t, e)
      }
      static _from(t, e) {
        if (t instanceof f) return t
        if (t instanceof bt) return new f(t.x, t.y)
        if (typeof t == 'number' && e !== void 0) return new f(t, e)
        if (Array.isArray(t)) return new f(t)
        if (t === R.Down || t === R.Up)
          throw (
            f.log.error(new Error('Invalid direction'), t),
            new Error('Invalid direction')
          )
        return t === R.North
          ? f.North
          : t === R.South
            ? f.South
            : t === R.East
              ? f.East
              : t === R.West
                ? f.West
                : new f(t, e)
      }
      copy() {
        return new f(this.x, this.y)
      }
      toMutable() {
        return new bt(this.x, this.y)
      }
      static fromYaw(t) {
        let e = t * (Math.PI / 180),
          r = Math.sin(e),
          i = Math.cos(e)
        return new f(r, i)
      }
      toYaw() {
        if (this.isZero())
          throw (
            f.log.error(
              new Error('Cannot convert zero-length vector to direction'),
            ),
            new Error('Cannot convert zero-length vector to direction')
          )
        let t = this.normalize()
        return Math.atan2(t.x, t.y) * (180 / Math.PI)
      }
      add(t, e) {
        let r = f._from(t, e)
        return f.from(r.x + this.x, r.y + this.y)
      }
      subtract(t, e) {
        let r = f._from(t, e)
        return f.from(this.x - r.x, this.y - r.y)
      }
      multiply(t, e) {
        if (typeof t == 'number' && e === void 0)
          return f.from(this.x * t, this.y * t)
        let r = f._from(t, e)
        return f.from(r.x * this.x, r.y * this.y)
      }
      scale(t) {
        return f.from(this.x * t, this.y * t)
      }
      divide(t, e) {
        if (typeof t == 'number' && e === void 0) {
          if (t === 0) throw new Error('Cannot divide by zero')
          return f.from(this.x / t, this.y / t)
        }
        let r = f._from(t, e)
        if (r.x === 0 || r.y === 0) throw new Error('Cannot divide by zero')
        return f.from(this.x / r.x, this.y / r.y)
      }
      normalize() {
        if (this.isZero())
          throw (
            f.log.error(new Error('Cannot normalize zero-length vector')),
            new Error('Cannot normalize zero-length vector')
          )
        let t = this.length()
        return f.from(this.x / t, this.y / t)
      }
      length() {
        return Math.sqrt(this.lengthSquared())
      }
      lengthSquared() {
        return this.x * this.x + this.y * this.y
      }
      distance(t, e) {
        let r = f._from(t, e)
        return Math.sqrt(this.distanceSquared(r))
      }
      distanceSquared(t, e) {
        let r = f._from(t, e)
        return this.subtract(r).lengthSquared()
      }
      lerp(t, e) {
        return !t || !e
          ? f.from(this)
          : e === 1
            ? f.from(t)
            : e === 0
              ? f.from(this)
              : f.from(this.x + (t.x - this.x) * e, this.y + (t.y - this.y) * e)
      }
      slerp(t, e) {
        if (!t || !e) return f.from(this)
        if (e === 1) return f.from(t)
        if (e === 0) return f.from(this)
        let r = this.dot(t),
          i = Math.acos(r) * e,
          n = f.from(t).subtract(this.multiply(r)).normalize()
        return this.multiply(Math.cos(i)).add(n.multiply(Math.sin(i)))
      }
      dot(t, e) {
        let r = f._from(t, e)
        return this.x * r.x + this.y * r.y
      }
      angleBetween(t, e) {
        let r = f._from(t, e),
          i = this.dot(r),
          n = this.length() * r.length()
        return n === 0 ? 0 : Math.acos(i / n)
      }
      projectOnto(t, e) {
        let r = f._from(t, e)
        return r.isZero() ? f.Zero : r.scale(this.dot(r) / r.dot(r))
      }
      reflect(t, e) {
        let r = f._from(t, e),
          i = this.projectOnto(r)
        return this.subtract(i.multiply(2))
      }
      toVec3(t) {
        return new J(this.x, this.y, t || 0)
      }
      setX(t) {
        return new f(t, this.y)
      }
      setY(t) {
        return new f(this.x, t)
      }
      distanceToLineSegment(t, e) {
        let r = f.from(e).subtract(t)
        if (r.lengthSquared() === 0) return this.subtract(t).length()
        let i = Math.max(0, Math.min(1, this.subtract(t).dot(r) / r.dot(r))),
          n = f.from(t).add(r.multiply(i))
        return this.subtract(n).length()
      }
      floor() {
        return new f(Math.floor(this.x), Math.floor(this.y))
      }
      floorX() {
        return new f(Math.floor(this.x), this.y)
      }
      floorY() {
        return new f(this.x, Math.floor(this.y))
      }
      ceil() {
        return new f(Math.ceil(this.x), Math.ceil(this.y))
      }
      ceilX() {
        return new f(Math.ceil(this.x), this.y)
      }
      ceilY() {
        return new f(this.x, Math.ceil(this.y))
      }
      round() {
        return new f(Math.round(this.x), Math.round(this.y))
      }
      roundX() {
        return new f(Math.round(this.x), this.y)
      }
      roundY() {
        return new f(this.x, Math.round(this.y))
      }
      north() {
        return this.add(f.North)
      }
      south() {
        return this.add(f.South)
      }
      east() {
        return this.add(f.East)
      }
      west() {
        return this.add(f.West)
      }
      isZero() {
        return this.x === 0 && this.y === 0
      }
      toArray() {
        return [this.x, this.y]
      }
      toDirection() {
        if (this.isZero())
          throw (
            f.log.error(
              new Error('Cannot convert zero-length vector to direction'),
            ),
            new Error('Cannot convert zero-length vector to direction')
          )
        let t = this.normalize(),
          e = Math.max(Math.abs(t.x), Math.abs(t.y))
        if (e === t.x) return R.East
        if (e === -t.x) return R.West
        if (e === t.y) return R.North
        if (e === -t.y) return R.South
        throw (
          f.log.error(new Error('Cannot convert vector to direction'), this),
          new Error('Cannot convert vector to direction')
        )
      }
      toBlockLocation() {
        return f.from(
          (this.x << 0) - (this.x < 0 && this.x !== this.x << 0 ? 1 : 0),
          (this.y << 0) - (this.y < 0 && this.y !== this.y << 0 ? 1 : 0),
        )
      }
      almostEqual(t, e, r) {
        try {
          let i
          return (
            typeof t != 'number' && r === void 0
              ? ((i = f._from(t, void 0)), (r = e))
              : (i = f._from(t, e)),
            Math.abs(this.x - i.x) <= r && Math.abs(this.y - i.y) <= r
          )
        } catch {
          return !1
        }
      }
      equals(t, e) {
        try {
          let r = f._from(t, e)
          return this.x === r.x && this.y === r.y
        } catch {
          return !1
        }
      }
      toString(t = 'long', e = ', ') {
        let r = `${this.x + e + this.y}`
        return t === 'long' ? `Vec2(${r})` : r
      }
    }),
    a(f, 'log', N.getLogger('vec2', 'vec2', 'bedrock-boost')),
    a(f, 'Zero', new f(0, 0)),
    a(f, 'North', new f(R.North)),
    a(f, 'South', new f(R.South)),
    a(f, 'East', new f(R.East)),
    a(f, 'West', new f(R.West)),
    f),
  X,
  Zr =
    ((X = class {
      static begin(t) {
        ;(this.end(),
          (this.lastTime = new Date().getTime()),
          (this.lastOperation = t))
      }
      static end() {
        let t = new Date().getTime()
        ;(this.lastTime > 0 &&
          X.log.debug(
            `Operation ${this.lastOperation} took ${t - this.lastTime}ms`,
          ),
          (this.lastTime = -1))
      }
    }),
    a(X, 'log', N.getLogger('Timings', 'timings')),
    a(X, 'lastTime', -1),
    a(X, 'lastOperation', ''),
    X)
var oi = N.getLogger('jobUtils', 'bedrock-boost', 'jobUtils')
var Z,
  de =
    ((Z = class {
      constructor(t, e) {
        a(this, 'items', [])
        a(this, 'period')
        a(this, 'currentTick', 0)
        a(this, 'runId')
        a(this, 'nextIndex', 0)
        a(this, 'executionSchedule', [])
        a(this, 'processor')
        if (e <= 0) throw new Error('Period must be a positive integer.')
        if (!t || typeof t != 'function')
          throw new Error('Processor function must be defined.')
        ;((this.period = e), (this.processor = t))
      }
      remove(t) {
        t >= 0 &&
          t < this.items.length &&
          (this.items.splice(t, 1),
          t < this.nextIndex && this.nextIndex--,
          this.recalculateExecutionSchedule())
      }
      removeIf(t) {
        for (let e = this.items.length - 1; e >= 0; e--)
          t(this.items[e]) && this.remove(e)
      }
      getItems() {
        return this.items
      }
      start() {
        ;(this.stop(),
          (this.currentTick = 0),
          (this.nextIndex = 0),
          (this.runId = me.runInterval(() => this.tick(), 1)))
      }
      stop() {
        this.runId !== void 0 &&
          (me.clearRun(this.runId), (this.runId = void 0))
      }
      recalculateExecutionSchedule() {
        let t = this.items.length
        if (
          ((this.executionSchedule = new Array(this.period).fill(0)), t === 0)
        )
          return
        let e = this.period / t
        for (let r = 0; r < t; r++)
          this.executionSchedule[Math.round(e * r) % this.period]++
      }
      tick() {
        if (this.items.length === 0) {
          Z.log.trace('No items to process.')
          return
        }
        let t = this.executionSchedule[this.currentTick]
        if (t === 0) {
          ;(Z.log.trace('No items to process this tick.'),
            (this.currentTick = (this.currentTick + 1) % this.period),
            this.currentTick === 0 && (this.nextIndex = 0))
          return
        }
        let e = 0
        for (; this.nextIndex < this.items.length && e < t; this.nextIndex++) {
          try {
            this.processor(this.items[this.nextIndex])
          } catch (r) {
            Z.log.error('Error processing item', r)
          }
          e++
        }
        ;((this.currentTick = (this.currentTick + 1) % this.period),
          this.currentTick === 0 && (this.nextIndex = 0))
      }
      push(...t) {
        return (
          this.items.push(...t),
          this.recalculateExecutionSchedule(),
          this.items.length
        )
      }
      pop() {
        let t = this.items.pop()
        return (this.recalculateExecutionSchedule(), t)
      }
      shift() {
        let t = this.items.shift()
        return (this.recalculateExecutionSchedule(), t)
      }
      unshift(...t) {
        return (
          this.items.unshift(...t),
          this.recalculateExecutionSchedule(),
          this.items.length
        )
      }
      splice(t, e = 0, ...r) {
        let i = this.items.splice(t, e, ...r)
        return (this.recalculateExecutionSchedule(), i)
      }
    }),
    a(
      Z,
      'log',
      N.getLogger('PulseScheduler', 'bedrock-boost', 'pulse-scheduler'),
    ),
    Z)
var at,
  ui =
    ((at = class extends de {
      constructor(e, r, i) {
        super((n) => {
          n.isValid ? e(n) : this.removeIf((s) => !s.isValid)
        }, r)
        a(this, 'filteredScratch', [])
        ;((this.queryOptions = i),
          this.push(
            ...nt
              .getDimension('minecraft:overworld')
              .getEntities(this.queryOptions),
          ),
          this.push(
            ...nt
              .getDimension('minecraft:nether')
              .getEntities(this.queryOptions),
          ),
          this.push(
            ...nt
              .getDimension('minecraft:the_end')
              .getEntities(this.queryOptions),
          ))
      }
      compareEntities(e, r) {
        return e.id === r.id
      }
      start() {
        ;(nt.afterEvents.entityLoad.subscribe((e) => {
          this.addIfMatchesWithRetry(e.entity)
        }),
          nt.afterEvents.entitySpawn.subscribe((e) => {
            this.addIfMatchesWithRetry(e.entity)
          }),
          nt.afterEvents.entityRemove.subscribe((e) => {
            this.removeIf((r) => !r.isValid || r.id === e.removedEntityId)
          }),
          super.start())
      }
      addIfMatchesWithRetry(e) {
        try {
          if (!e) return
          if (e.isValid) e.matches(this.queryOptions) && this.push(e)
          else {
            let r = he.runInterval(() => {
              e.isValid &&
                e.matches(this.queryOptions) &&
                (he.clearRun(r), this.push(e))
            }, 1)
          }
        } catch (r) {
          at.logger.debug('Failed to push entity to scheduler.', r)
        }
      }
      push(...e) {
        let r = this.filteredScratch
        r.length = 0
        for (let n of e) {
          if (!n.isValid) continue
          let s = !1
          for (let o of this.items)
            if (this.compareEntities(o, n)) {
              s = !0
              break
            }
          s || r.push(n)
        }
        let i = super.push(...r)
        return ((r.length = 0), i)
      }
      unshift(...e) {
        let r = this.filteredScratch
        r.length = 0
        for (let n of e) {
          if (!n.isValid) continue
          let s = !1
          for (let o of this.items)
            if (this.compareEntities(o, n)) {
              s = !0
              break
            }
          s || r.push(n)
        }
        let i = super.unshift(...r)
        return ((r.length = 0), i)
      }
      splice(e, r, ...i) {
        if (r === void 0) return super.splice(e)
        let n = this.filteredScratch
        n.length = 0
        for (let o of i) {
          let c = !1
          for (let h of this.items)
            if (this.compareEntities(h, o)) {
              c = !0
              break
            }
          c || n.push(o)
        }
        let s = super.splice(e, r, ...n)
        return ((n.length = 0), s)
      }
    }),
    a(
      at,
      'logger',
      N.getLogger(
        'EntityPulseScheduler',
        'bedrock-boost',
        'entity-pulse-scheduler',
      ),
    ),
    at),
  et,
  fe =
    ((et = class extends de {
      constructor(t, e) {
        super((r) => {
          r.isValid ? t(r) : this.removeIf((i) => !i.isValid)
        }, e)
        try {
          this.push(...mt.getAllPlayers())
        } catch {
          Kt.runTimeout(() => {
            this.push(...mt.getAllPlayers())
          }, 1)
        }
      }
      compareEntities(t, e) {
        return t.id === e.id
      }
      start() {
        ;(mt.afterEvents.playerJoin.subscribe((t) => {
          let e = 0,
            r = () => {
              if ((e++, e > 10)) {
                et.logger.debug(
                  'Failed to push player to scheduler after 10 attempts.',
                )
                return
              }
              try {
                let i = mt.getEntity(t.playerId)
                ;(i === void 0 && Kt.runTimeout(r, 1),
                  i instanceof Ke && this.push(i))
              } catch (i) {
                ;(et.logger.debug('Failed to push player to scheduler.', i),
                  Kt.runTimeout(r, 1))
              }
            }
          r()
        }),
          mt.afterEvents.playerLeave.subscribe((t) => {
            this.removeIf((e) => !e.isValid || e.id === t.playerId)
          }),
          super.start())
      }
      push(...t) {
        let e = t.filter(
          (r) =>
            r.isValid && !this.items.some((i) => this.compareEntities(i, r)),
        )
        return super.push(...e)
      }
      unshift(...t) {
        let e = t.filter(
          (r) =>
            r.isValid && !this.items.some((i) => this.compareEntities(i, r)),
        )
        return super.unshift(...e)
      }
      splice(t, e, ...r) {
        if (e === void 0) return super.splice(t)
        let i = r.filter(
          (n) => !this.items.some((s) => this.compareEntities(s, n)),
        )
        return super.splice(t, e, ...i)
      }
    }),
    a(
      et,
      'logger',
      N.getLogger(
        'PlayerPulseScheduler',
        'bedrock-boost',
        'player-pulse-scheduler',
      ),
    ),
    et)
var F,
  gi =
    ((F = class {}),
    a(F, 'Opposites', {
      [d.Down]: d.Up,
      [d.Up]: d.Down,
      [d.North]: d.South,
      [d.South]: d.North,
      [d.East]: d.West,
      [d.West]: d.East,
    }),
    a(F, 'PositivePerpendiculars', {
      [d.Down]: [d.East, d.North],
      [d.Up]: [d.East, d.North],
      [d.North]: [d.East, d.Up],
      [d.South]: [d.East, d.Up],
      [d.East]: [d.North, d.Up],
      [d.West]: [d.North, d.Up],
    }),
    a(F, 'NegativePerpendiculars', {
      [d.Down]: [d.West, d.South],
      [d.Up]: [d.West, d.South],
      [d.North]: [d.West, d.Down],
      [d.South]: [d.West, d.Down],
      [d.East]: [d.South, d.Down],
      [d.West]: [d.South, d.Down],
    }),
    a(F, 'ClockwisePerpendiculars', {
      [d.North]: d.East,
      [d.East]: d.South,
      [d.South]: d.West,
      [d.West]: d.North,
      [d.Up]: d.Down,
      [d.Down]: d.Up,
    }),
    a(F, 'CounterClockwisePerpendiculars', {
      [d.North]: d.West,
      [d.East]: d.North,
      [d.South]: d.East,
      [d.West]: d.South,
      [d.Up]: d.Down,
      [d.Down]: d.Up,
    }),
    a(F, 'SameAxis', {
      [d.North]: d.North,
      [d.South]: d.North,
      [d.East]: d.East,
      [d.West]: d.East,
      [d.Up]: d.Up,
      [d.Down]: d.Up,
    }),
    a(F, 'FromString', {
      north: d.North,
      east: d.East,
      south: d.South,
      west: d.West,
      up: d.Up,
      down: d.Down,
    }),
    a(F, 'Values', [d.Down, d.Up, d.North, d.South, d.East, d.West]),
    F)
var Ii = N.getLogger('itemUtils', 'bedrock-boost', 'itemUtils')
import { system as He, world as qe } from '@minecraft/server'
import { world as je } from '@minecraft/server'
var Ve = !1,
  ge = '[stylish:events]'
function U(u, t) {
  if (Ve)
    try {
      t ? console.debug(ge, u, t) : console.debug(ge, u)
    } catch {}
}
var vt = Object.create(null)
function Q(u) {
  return vt[u] ?? (vt[u] = [])
}
var Ht = new WeakMap(),
  pe = {},
  qt = !1
function Ye(u) {
  return (t) => {
    let e = Q(u)
    U('dispatch', { event: u, count: e.length })
    for (let r of e) r(t)
  }
}
function ye(u) {
  if ((U('wirePlatformEvent', { event: u }), pe[u])) {
    U('alreadyWired', { event: u })
    return
  }
  switch (u) {
    case 'startup':
    case 'worldLoad':
      break
    case 'beforeItemUse':
      ;(U('subscribe', { source: 'world.beforeEvents.itemUse' }),
        je.beforeEvents.itemUse.subscribe(Ye('beforeItemUse')),
        (pe[u] = !0))
      break
    default:
      break
  }
}
function wt(u) {
  if ((U('maybeWirePlatformEvents', { startupTriggered: qt }), !!qt)) {
    if (u) {
      Q(u).length > 0 && ye(u)
      return
    }
    for (let t of Object.keys(vt)) Q(t).length > 0 && ye(t)
  }
}
function jt(u) {
  return function (r, i, n) {
    if (typeof r == 'function' && i === void 0 && n === void 0) {
      ;(U('register:function', { event: u }), Q(u).push(r), wt(u))
      return
    }
    if (i !== void 0 && n && typeof n.value == 'function') {
      if (typeof r == 'function') {
        U('register:static', { event: u, propertyKey: String(i) })
        let h = n.value.bind(r)
        return (Q(u).push(h), wt(u), n)
      }
      U('annotate:instance', { event: u, propertyKey: String(i) })
      let s = r.constructor,
        o = Ht.get(s)
      o || ((o = new Map()), Ht.set(s, o))
      let c = o.get(u) ?? []
      return (c.includes(i) || c.push(i), o.set(u, c), n)
    }
  }
}
var Di = jt('startup'),
  St = jt('worldLoad'),
  Ri = jt('beforeItemUse')
function Vt(u) {
  if (!u) return
  let t = u.constructor,
    e = Ht.get(t)
  if (e)
    for (let [r, i] of e) {
      let n = Q(r)
      for (let s of i) {
        let o = u[s]
        typeof o == 'function' && n.push(o.bind(u))
      }
      ;(U('register:instance', {
        event: r,
        class: t?.name ?? '<anonymous>',
        count: i.length,
      }),
        wt(r))
    }
}
function Ge(u) {
  ;((qt = !0), wt())
  let t = Q('startup')
  U('triggerStartupEvent', { count: t.length })
  for (let e of t) e(u)
}
function Xe(u) {
  let t = Q('worldLoad')
  U('triggerWorldLoadEvent', { count: t.length })
  for (let e of t) e(u)
}
var Ze = []
function Je(u) {
  for (let t of Ze) {
    let e = new t()
    ;(Vt(e), u.registerCustomComponent(t.componentId, e))
  }
}
var Qe = []
function tr(u) {
  for (let t of Qe) {
    let e = new t()
    ;(Vt(e), u.registerCustomComponent(t.componentId, e))
  }
}
var be = []
function kt(u) {
  be.push(u)
}
function er(u) {
  for (let t of be) {
    let e = new t()
    Vt(e)
    let r,
      i = t.run
    if (
      (typeof i == 'function'
        ? (r = i.bind(t))
        : typeof e.run == 'function' && (r = e.run.bind(e)),
      !r)
    )
      throw new Error(
        `Custom command ${t.name} has no run method. Define a static or instance run(origin, ...args).`,
      )
    u.registerCommand(e, r)
  }
}
function Et(u, t, e) {
  let r = e.value
  return {
    configurable: !0,
    enumerable: e.enumerable,
    get() {
      let i = r.bind(this)
      return (
        Object.defineProperty(this, t, {
          value: i,
          configurable: !0,
          writable: !0,
          enumerable: !1,
        }),
        i
      )
    },
  }
}
function _e() {
  // Check if startup registries were already provided by the host addon (dynamic import after startup)
  const registries = globalThis.__wailaStartupRegistries;
  if (registries) {
    // Startup event already fired, register immediately
    rr(registries.itemComponentRegistry, registries.blockComponentRegistry);
    er(registries.customCommandRegistry);
    Ge(registries);
  } else {
    // Normal case: subscribe to startup event
    He.beforeEvents.startup.subscribe((u) => {
      rr(u.itemComponentRegistry, u.blockComponentRegistry);
      er(u.customCommandRegistry);
      Ge(u);
    });
  }
  qe.afterEvents.worldLoad.subscribe((u) => {
    Xe(u);
  });
}
function rr(u, t) {
  ;(Je(u), tr(t))
}
var L = class {
  constructor() {}
  static get(t) {
    let e = new Set()
    return (t && e.add(t), N.getLogger('WAILA', ...Array.from(e)))
  }
  static init() {
    ;(N.setTagsOutputVisibility(!0), N.setLevel(V.Debug))
  }
}
q([St], L, 'init', 1)
String.prototype.toTitle = function () {
  return this.replace(/(^|\s)\S/g, function (u) {
    return u.toUpperCase()
  })
}
String.prototype.abrevCaps = function (u = 4) {
  let t = [
    'and',
    'the',
    'of',
    'in',
    'on',
    'at',
    'to',
    'for',
    'with',
    'as',
    'by',
    'an',
    'a',
    'or',
    'but',
    'nor',
    'yet',
    'so',
  ]
  return this.split(' ')
    .map((e) =>
      e.length < u && !t.includes(e.toLowerCase()) ? e.toUpperCase() : e,
    )
    .join(' ')
}
import {
  CommandPermissionLevel as nr,
  CustomCommandStatus as sr,
  world as ve,
} from '@minecraft/server'
var ir = {
    manifest: {
      bp: { version: [5, 1, 1], min_engine_version: [1, 21, 100] },
      rp: { version: [5, 1, 1], min_engine_version: [1, 21, 100] },
    },
    github: {
      commit: '5dd4c0a8a56b1743ae88b192ce8e76b5689dd6e5',
      tag: 'v5.1.1',
    },
  },
  ot = ir
var It = {
  andexsa: {
    name: "8Crafter's Entity Scale, NBT, and Behavior Modifier, Bossbar, and Morph Addon",
    creator: '8Crafter',
  },
  andexdb: {
    name: "8Crafter's Server Utilities & Debug Sticks",
    creator: '8Crafter',
  },
  andexrp: {
    name: "8Crafter's Entity Scale, NBT, and Behavior Modifier, Bossbar, and Morph Addon",
    creator: '8Crafter',
  },
  andexsl: { name: "8Crafter's Secret Items Loader", creator: '8Crafter' },
  aria_pp: { name: 'Planes Pro', creator: 'AriaCreations' },
  ascent_paint: { name: 'Paint Add-On', creator: 'ASCENT' },
  ascent_htcg: {
    name: 'Hermitcraft TCG Add-On',
    creator: 'Hermitcraft x ASCENT',
  },
  bf_rb: { name: 'Biomes', creator: 'Block Factory' },
  bs_bwad: { name: 'Builders Wands', creator: 'Block Studios' },
  bs_most: { name: 'More Structures', creator: 'Block Studios' },
  bluemods: { name: 'BlueMods Anticheat', creator: 'BlueShadow' },
  cc_fairytales: { name: 'Fairy Tales', creator: 'Chillcraft Studios' },
  cc_abyss: { name: 'Abyssal Echoes', creator: 'Chillcraft Studios' },
  cc_mechs: { name: 'Mech Expansion', creator: 'Chillcraft Studios' },
  cc_su: { name: 'SCP: Uncaged Add-On', creator: 'Cloud Corp' },
  pl_sk_pr: { name: 'Player Skills Pro Add-On', creator: 'Cubed Creations' },
  cubc_mo_en: { name: 'More Enchantments Add-On', creator: 'Cubed Creations' },
  cubc_ra_su: { name: 'Raft Survival Add-On', creator: 'Cubed Creations' },
  cc_re: { name: 'Realism Effects Add-On', creator: 'Cubed Creations' },
  cubc_we_fu: { name: 'Weapons Fusion Add-On', creator: 'Cubed Creations' },
  cc_vd: { name: 'Villager Dweller Add-On', creator: 'Cubed Creations' },
  darkosto_elemental_crops: { name: 'Elemental Crops', creator: 'Darkosto' },
  float_fc: { name: 'Forest Craft', creator: 'Float Studios' },
  float_fca: { name: 'Fur Craft', creator: 'Float Studios' },
  float_br: { name: 'The Backrooms Add-On', creator: 'Float Studios' },
  fl_heli: { name: 'Helicopters+', creator: 'Floruit' },
  fl_opp: { name: 'Ores++', creator: 'Floruit' },
  fl_wings: { name: 'Wings++', creator: 'Floruit' },
  floruit_senna: { name: 'Senna World', creator: 'Floruit' },
  canopy: { name: 'Canopy', creator: 'ForestOfLight' },
  construct: { name: 'Construct', creator: 'ForestOfLight' },
  understudy: { name: 'Understudy', creator: 'ForestOfLight' },
  'statistic-display': { name: 'Statistic Display', creator: 'ForestOfLight' },
  nudge: { name: 'Nudge', creator: 'ForestOfLight' },
  gm1_ord: { name: 'Sonic', creator: 'Gamemode One' },
  gm1_zen: { name: 'How to Train Your Dragon', creator: 'Gamemode One' },
  gds_icu: { name: 'Combat Utilities', creator: 'Glowfischdesigns' },
  gds_we: { name: 'World Editing', creator: 'Glowfischdesigns' },
  hf_mzs: { name: 'Mowzie\u2019s Mobs', creator: 'Honeyfrost' },
  jm: { name: 'jeanmajid', creator: 'jeanmajid' },
  jig_atw: { name: 'ALL THE WOOL', creator: 'Jigarbov Productions' },
  jig_bmu: { name: 'Battle Mutants', creator: 'Jigarbov Productions' },
  jig_ccomp: { name: 'Computers', creator: 'Jigarbov Productions' },
  jig_mtd: { name: 'Detect-Ore', creator: 'Jigarbov Productions' },
  jig_pcs: { name: 'Papercraft Mob Stickers', creator: 'Jigarbov Productions' },
  jig_pco: { name: 'Advanced Compass', creator: 'Jigarbov Productions' },
  jig_poip: { name: 'Poisonous Potato', creator: 'Jigarbov Productions' },
  jig_teta: { name: 'Tetris\xAE Add-On', creator: 'Jigarbov Productions' },
  jig_common: {
    name: 'Cross-AddOn Jigarbov Pack',
    creator: 'Jigarbov Productions',
  },
  kubo_mg: { name: 'MORPH Add-On', creator: 'Kubo Studios' },
  kubo_ss: { name: 'SECURITY SYSTEMS Add-On', creator: 'Kubo Studios' },
  kubo_mv: { name: 'VILLAGERS++ Add-On', creator: 'Kubo Studios' },
  kubo_aj: { name: 'ANIME JUTSU Add-On', creator: 'Kubo Studios' },
  kubo_rpg: { name: 'RPG Add-On', creator: 'Kubo Studios' },
  kubo_fs: { name: 'FISHING++ Add-On', creator: 'Kubo Studios' },
  lpsm_assetsplus: { name: 'Assets+', creator: 'Legopitstop' },
  lpsm_more_pumpkins: { name: 'More Pumpkins', creator: 'Legopitstop' },
  mobpie_furn: { name: 'Furniture Add-On', creator: 'Mob Pie' },
  mobpie_animal: { name: 'Animals Add-On', creator: 'Mob Pie' },
  mobpie_cars: { name: 'Luxury Cars Add-On', creator: 'Mob Pie' },
  mobpie_doors: { name: 'Secret Doors Add-On', creator: 'Mob Pie' },
  mco_tde: { name: 'The Dawn Era', creator: 'Mush Co' },
  nps_mot: { name: 'More Ores and Tools', creator: 'Netherpixel' },
  oreville_15yr: {
    name: '15 Year Party Supplies',
    creator: 'Oreville Studios',
  },
  oreville_vm: { name: 'Vibrant Memories Add-On', creator: 'Oreville Studios' },
  oreville_rb: { name: 'Realistic Biomes Add-On', creator: 'Oreville Studios' },
  oreville_tc: { name: 'Time Capsule Add-On', creator: 'Oreville Studios' },
  oreville_wb: { name: 'World Builder Add-On', creator: 'Oreville Studios' },
  oreville_hp: { name: 'Health Bars Add-On', creator: 'Oreville Studios' },
  panascais_realism: {
    name: 'REALISM \\ Fields + Forests',
    creator: 'Panascais',
  },
  panascais_dwellers: { name: 'DWELLERS Add-On', creator: 'Panascais' },
  panascais_end: { name: 'Eternal End Add-On', creator: 'Panascais' },
  pu_biomes: { name: 'MORE BIOMES Add-On', creator: 'Pixelusion' },
  pu_bn: { name: 'BURNT Add-On', creator: 'Pixelusion' },
  pu_blasters: { name: 'BLASTERS Add-On', creator: 'Pixelusion' },
  pixelusion_dbp: { name: 'PORTAL BACKPACKS Add-On', creator: 'Pixelusion' },
  pixelusion_td: { name: 'Training Dummies Add-On', creator: 'Pixelusion' },
  pu_se: { name: 'SHIELDS Add-On', creator: 'Pixelusion' },
  pod_farm: { name: 'FARMING', creator: 'Podcrash' },
  pod_gard: { name: 'GARDENING', creator: 'Podcrash' },
  pod_engi: { name: 'MACHINES', creator: 'Podcrash' },
  pod_rpg: { name: 'RPG SKILLS', creator: 'Podcrash' },
  pod_trn: { name: 'TRAINS', creator: 'Podcrash' },
  pokeb: { name: 'PokeBedrock', creator: 'Smell of Curry' },
  httyd: { name: 'Age of Berk', creator: 'S3XT4 Studios' },
  sqst_bkpk: { name: 'Backpacks', creator: 'Scai Quest' },
  sqst_ihfs: { name: 'AutoFisher', creator: 'Scai Quest' },
  sqst_oreb: { name: 'Ore Beetles', creator: 'Scai Quest' },
  sqst_plsh: { name: 'Plushies', creator: 'Scai Quest' },
  sqst_xpcb: { name: 'XP Crystal Bank', creator: 'Scai Quest' },
  sqst_mtls: { name: 'Multitool', creator: 'Scai Quest' },
  shapescape_ext: { name: 'The Extinct', creator: 'Shapescape' },
  spark_portals: { name: 'Spark Portals', creator: 'Spark Universe' },
  spark: { name: 'RealismCraft', creator: 'Spark Universe' },
  spark_vfx: { name: 'Realism VFX', creator: 'Spark Universe' },
  spark_disasters: { name: 'Insane Disasters', creator: 'Spark Universe' },
  spark_amm1: { name: 'Lava Chicken Add-On', creator: 'Spark Universe' },
  spark_amm2: { name: 'A Minecraft Movie: Add-On', creator: 'Spark Universe' },
  spark_amm3: {
    name: 'A Minecraft Movie Jetpack Add-On',
    creator: 'Spark Universe',
  },
  spark_pets: { name: 'Spark Pets (Lite)', creator: 'Spark Universe' },
  spark_pets_pro: { name: 'Spark Pets (Premium)', creator: 'Spark Universe' },
  spark_spongebob: { name: 'SpongeBob SquarePants', creator: 'Spark Universe' },
  squaredreams_fhd: { name: 'Furniture HD', creator: 'Square Dreams' },
  squaredreams_realism: { name: 'Realism+', creator: 'Square Dreams' },
  squaredreams_bam: { name: 'Morph Into Anything', creator: 'Square Dreams' },
  sf_gaa: { name: "McDonald's Add-On", creator: 'Starfish Studios' },
  sf_cma: { name: 'CRAFTYMON', creator: 'Starfish Studios' },
  sf_hba: { name: 'Hamsters+', creator: 'Starfish Studios' },
  sf_scp: { name: 'Can You Survive?', creator: 'Starfish Studios' },
  sf_hei: { name: 'Moana 2', creator: 'Starfish Studios' },
  sf_afm: { name: 'Another Furniture', creator: 'Starfish Studios' },
  sf_nba: { name: 'Naturalist', creator: 'Starfish Studios' },
  'sf.baby_dragons': { name: 'DRAGON PETS', creator: 'Starfish Studios' },
  stark_ep: { name: 'Enchantments Plus', creator: 'StarkTMA' },
  exmh: { name: 'Extensive Mob Heads', creator: 'SwagLP03' },
  tm_aqc: { name: 'Aquaculture', creator: 'Team Metallurgy' },
  mb_af: { name: 'Auto Factory', creator: 'Team Metallurgy' },
  tep_lm: { name: 'LUNAR MOON Add-On', creator: 'Teplight' },
  twf_jb: { name: 'Chomp', creator: 'The World Foundry' },
  twfae_cos: { name: 'Lamp Lights', creator: 'The World Foundry' },
  twf_bmt: { name: 'Bubble', creator: 'The World Foundry' },
  twf_calm: { name: 'C.A.L.M.', creator: 'The World Foundry' },
  snst_bckp: { name: 'Backpacks++ Add-On', creator: 'ThunderAy' },
  snst_morph: { name: 'BE a MOB Add-On', creator: 'ThunderAy' },
  senior_bv: { name: 'Vanilla Biomes+ Add-On', creator: 'ThunderAy' },
  tomhmagic_realight: {
    name: 'Realight Reimagined',
    creator: 'Tomhmagic Creations',
  },
  thm_ecp: { name: 'Economy+', creator: 'Tomhmagic Creations' },
  thm_rmt: { name: 'Realm Management Tool', creator: 'Tomhmagic Creations' },
  ulkd_ess: { name: 'Essentials', creator: 'Unlinked' },
  ulkd_alch: { name: 'Alchemy', creator: 'Unlinked' },
  wypnt_ef: { name: 'Epic Fantasy', creator: 'Waypoint Studios' },
  wonder_tech: { name: 'Advanced Machines Add-On', creator: 'Wonder' },
  wonder_aps: { name: 'Advanced Power Suits Add-On', creator: 'Wonder' },
  wonder_cons: { name: 'Construction Add-On', creator: 'Wonder' },
  wonder_ores: { name: 'More Ores Tools Armor Add-On', creator: 'Wonder' },
  xp_furniture: { name: 'Furniture', creator: 'XP GAMES' },
  xp_dl: { name: 'Dynamic Light', creator: 'XP GAMES' },
  xp_cd: { name: 'Cave Dweller', creator: 'XP GAMES' },
}
var G = class G {
  constructor(t) {
    a(this, 'version')
    a(this, 'major')
    a(this, 'minor')
    a(this, 'patch')
    let [e, r, i] = t.replace(/[^0-9.]/g, '').split('.')
    ;((this.major = e), (this.minor = r), (this.patch = i), (this.version = t))
  }
  saveToWorld() {
    ve.setDynamicProperty('r4isen1920_waila:version', this.version)
  }
  static onWorldLoad() {
    let t = ve.getDynamicProperty('r4isen1920_waila:version'),
      e = G.get(),
      r = typeof t == 'string' ? G.compareTo(t) : -1,
      i = {
        previous:
          typeof t == 'string'
            ? { version: new G(t), commit: ot.github.commit }
            : null,
        current: { version: e, commit: ot.github.commit },
      }
    ;(r < 0
      ? (this.log.info(
          `World was loaded with older version (${t ?? 'unknown'}). Upgrading to ${e.version}.`,
        ),
        e.saveToWorld(),
        this.onUpgrade(i))
      : r > 0
        ? (this.log.warn(
            `World was loaded with newer version (${t}). Downgrading to ${e.version}.`,
          ),
          e.saveToWorld(),
          this.onDowngrade(i))
        : this.log.info(`World is up to date with ${e.version}.`),
      this.log.info(
        `Add-On namespace registry size: ${Object.keys(It).length}`,
      ),
      this.log.info('WAILA is loaded and running!'))
  }
  static onUpgrade(t) {}
  static onDowngrade(t) {}
  static get() {
    return (
      this._instance ||
        (this._instance = new G(ot.github.tag || ot.manifest.bp.version)),
      this._instance
    )
  }
  static compareTo(t) {
    if (!/^v?\d+\.\d+\.\d+$/.test(t)) return -1
    let e = this.get(),
      [r, i, n] = t
        .replace(/[^0-9.]/g, '')
        .split('.')
        .map(Number),
      [s, o, c] = [e.major, e.minor, e.patch].map(Number)
    return s !== r ? r - s : o !== i ? i - o : c !== n ? n - c : 0
  }
}
;(a(G, '_instance'),
  a(G, 'log', L.get('Version')),
  q([St], G, 'onWorldLoad', 1))
var Tt = G,
  ht = class {
    constructor() {
      a(this, 'name', 'r4isen1920_waila:version')
      a(
        this,
        'description',
        'Displays the current version of the WAILA Add-On.',
      )
      a(this, 'permissionLevel', nr.Any)
    }
    run(t) {
      let e = `WAILA is running on ${Tt.get().version}! (commit: ${ot.github.commit})`
      return { status: sr.Success, message: e }
    }
  }
;(q([Et], ht.prototype, 'run', 1), (ht = q([kt], ht)))
import {
  CommandPermissionLevel as Ne,
  CustomCommandParamType as Nr,
  CustomCommandStatus as ft,
  Player as zr,
  system as Wr,
} from '@minecraft/server'
import {
  MessageFormData as Br,
  ModalFormData as $r,
} from '@minecraft/server-ui'
import { world as Lr } from '@minecraft/server'
import { world as ar } from '@minecraft/server'
var or = N.getLogger('Init'),
  dt = [],
  we = !1
ar.afterEvents.worldLoad.subscribe(() => {
  for (
    we = !0,
      or.debug(`Loading ${dt.length} function${dt.length === 1 ? '' : 's'}.`);
    dt.length > 0;
  )
    dt.shift()()
})
function Yt(u) {
  we ? u() : dt.push(u)
}
import {
  EntityComponentTypes as lr,
  system as ke,
  world as Ee,
} from '@minecraft/server'
var Se = [
  'minecraft:crafting_table',
  'minecraft:furnace',
  'minecraft:blast_furnace',
  'minecraft:smoker',
  'minecraft:brewing_stand',
  'minecraft:chest',
  'minecraft:barrel',
  'minecraft:dispenser',
  'minecraft:dropper',
  'minecraft:hopper',
  'minecraft:shulker_box',
  'minecraft:undyed_shulker_box',
  'minecraft:white_shulker_box',
  'minecraft:orange_shulker_box',
  'minecraft:magenta_shulker_box',
  'minecraft:light_blue_shulker_box',
  'minecraft:yellow_shulker_box',
  'minecraft:lime_shulker_box',
  'minecraft:pink_shulker_box',
  'minecraft:gray_shulker_box',
  'minecraft:light_gray_shulker_box',
  'minecraft:cyan_shulker_box',
  'minecraft:purple_shulker_box',
  'minecraft:blue_shulker_box',
  'minecraft:brown_shulker_box',
  'minecraft:green_shulker_box',
  'minecraft:red_shulker_box',
  'minecraft:black_shulker_box',
  'minecraft:exposed_copper_chest',
  'minecraft:exposed_copper_chest',
  'minecraft:weathered_copper_chest',
  'minecraft:weathered_copper_chest',
  'minecraft:oxidized_copper_chest',
  'minecraft:oxidized_copper_chest',
  'minecraft:waxed_copper_chest',
  'minecraft:waxed_copper_chest',
  'minecraft:waxed_exposed_copper_chest',
  'minecraft:waxed_exposed_copper_chest',
  'minecraft:waxed_weathered_copper_chest',
  'minecraft:waxed_weathered_copper_chest',
  'minecraft:waxed_oxidized_copper_chest',
]
var At = 'r4isen1920_waila:paused',
  Ct = class {
    constructor(t) {
      this.clearUi = t
      a(this, 'log', L.get('PauseManager'))
      a(this, 'resumeWatchers', new Map())
    }
    initialize() {
      ;(Ee.afterEvents.playerInteractWithBlock.subscribe(
        ({ player: t, block: e }) => {
          e && Se.includes(e.typeId) && this.pause(t)
        },
      ),
        Ee.beforeEvents.playerLeave.subscribe(({ player: t }) => {
          ;(this.clearUi(t),
            t.setDynamicProperty(At, void 0),
            this.stopResumeWatcher(t.id))
        }))
    }
    checkPlayerInventoryOpen(t) {
      let e = t.getComponent(lr.CursorInventory)
      e && e.item !== void 0 && this.pause(t)
    }
    isPaused(t) {
      return !!t.getDynamicProperty(At)
    }
    pause(t) {
      if (this.isPaused(t)) return
      ;(t.setDynamicProperty(At, !0),
        this.clearUi(t),
        this.log.info(`Player ${t.name} opened a UI, pausing updates.`))
      let e = J.from(t.location),
        r = tt.from(t.getRotation()),
        i = ke.runInterval(() => {
          if (!t.isValid) {
            this.stopResumeWatcher(t.id)
            return
          }
          let n = J.from(t.location),
            s = tt.from(t.getRotation()),
            o = e.distance(n) > 2,
            c = s.distance(r) > 10
          ;(!o && !c) ||
            (this.log.info(`Player ${t.name} moved, resuming WAILA UI.`),
            this.stopResumeWatcher(t.id),
            t.setDynamicProperty(At, void 0),
            this.clearUi(t))
        }, 5)
      this.resumeWatchers.set(t.id, i)
    }
    stopResumeWatcher(t) {
      let e = this.resumeWatchers.get(t)
      if (e !== void 0) {
        try {
          ke.clearRun(e)
        } catch (r) {
          this.log.warn(`Failed to clear resume watcher for player ${t}: ${r}`)
        }
        this.resumeWatchers.delete(t)
      }
    }
  }
var Gt = 'r4isen1920_waila:old_log',
  xt = class {
    isDuplicate(t, e) {
      return t.getDynamicProperty(Gt) === e
        ? !0
        : (t.setDynamicProperty(Gt, e), !1)
    }
    clear(t) {
      t.setDynamicProperty(Gt, void 0)
    }
  }
import { ItemStack as Ir } from '@minecraft/server'
var Xt = ['minecraft:frame', 'minecraft:glow_frame']
var Zt = {
  wooden_door: 'item.wooden_door',
  spruce_door: 'item.spruce_door',
  birch_door: 'item.birch_door',
  jungle_door: 'item.jungle_door',
  acacia_door: 'item.acacia_door',
  dark_oak_door: 'item.dark_oak_door',
  mangrove_door: 'item.mangrove_door',
  cherry_door: 'item.cherry_door',
  brewing_stand: 'item.brewing_stand',
  acacia_hanging_sign: 'item.acacia_hanging_sign',
  bamboo_hanging_sign: 'item.bamboo_hanging_sign',
  birch_hanging_sign: 'item.birch_hanging_sign',
  cherry_hanging_sign: 'item.cherry_hanging_sign',
  crimson_hanging_sign: 'item.crimson_hanging_sign',
  dark_oak_hanging_sign: 'item.dark_oak_hanging_sign',
  jungle_hanging_sign: 'item.jungle_hanging_sign',
  mangrove_hanging_sign: 'item.mangrove_hanging_sign',
  oak_hanging_sign: 'item.oak_hanging_sign',
  spruce_hanging_sign: 'item.spruce_hanging_sign',
  warped_hanging_sign: 'item.warped_hanging_sign',
  pale_oak_hanging_sign: 'item.pale_oak_hanging_sign',
  acacia_standing_sign: 'item.acacia_sign',
  bamboo_standing_sign: 'item.bamboo_sign',
  birch_standing_sign: 'item.birch_sign',
  cherry_standing_sign: 'item.cherry_sign',
  crimson_standing_sign: 'item.crimson_sign',
  dark_oak_standing_sign: 'item.dark_oak_sign',
  jungle_standing_sign: 'item.jungle_sign',
  mangrove_standing_sign: 'item.mangrove_sign',
  standing_sign: 'item.sign',
  spruce_standing_sign: 'item.spruce_sign',
  warped_standing_sign: 'item.warped_sign',
  acacia_wall_sign: 'item.acacia_sign',
  bamboo_wall_sign: 'item.bamboo_sign',
  birch_wall_sign: 'item.birch_sign',
  cherry_wall_sign: 'item.cherry_sign',
  crimson_wall_sign: 'item.crimson_sign',
  dark_oak_wall_sign: 'item.dark_oak_sign',
  jungle_wall_sign: 'item.jungle_sign',
  mangrove_wall_sign: 'item.mangrove_sign',
  wall_sign: 'item.sign',
  spruce_wall_sign: 'item.spruce_sign',
  warped_wall_sign: 'item.warped_sign',
  frame: 'item.frame',
  glow_frame: 'item.glow_frame',
  seagrass: 'tile.seagrass.seagrass',
  powder_snow_bucket: 'tile.powder_snow',
  wheat_seeds: 'item.wheat',
  beetroot_seeds: 'beetroot',
  carrot: 'item.carrot',
  potato: 'tile.potatoes',
  melon_seeds: 'item.melon_seeds',
  pumpkin_seeds: 'tile.pumpkin',
  pitcher_pod: 'item.pitcher_pod',
  sugar_cane: 'item.reeds',
  glow_berries: 'item.glow_berries',
  sweet_berries: 'item.sweet_berries',
  bamboo_door: 'item.bamboo_door',
  oak_sign: 'item.sign',
  spruce_sign: 'item.spruce_sign',
  jungle_sign: 'item.jungle_sign',
  acacia_sign: 'item.acacia_sign',
  darkoak_sign: 'item.darkoak_sign',
  crimson_sign: 'item.crimson_sign',
  warped_sign: 'item.warped_sign',
  mangrove_sign: 'item.mangrove_sign',
  pale_oak_door: 'item.pale_oak_door',
  lit_blast_furnace: 'tile.blast_furnace',
  lit_deeplsate_redstone_ore: 'tile.deeplsate_redstone_ore',
  lit_furnace: 'tile.furnace',
  lit_redstone_lamp: 'tile.redstone_lamp',
  lit_redstone_ore: 'tile.redstone_ore',
  lit_smoker: 'tile.smoker',
}
import {
  Block as Ie,
  EntityComponentTypes as hr,
  EnchantmentTypes as dr,
  ItemComponentTypes as Mt,
  ItemLockMode as Jt,
  ItemStack as Qt,
} from '@minecraft/server'
var te = 'r4isen1920_waila:inventory_item_holder_slots',
  Te = 'r4isen1920_waila:inventory_item_backups',
  fr = '_chunk_',
  Ae = 32760,
  Dt = 16,
  gr = 9,
  pr = 26,
  Rt = class Rt {
    static apply(t, e, r = !0) {
      if (e.length === 0) return
      let i = this.getPlayerContainer(t)
      if (!i) return
      let n = new Set(this.getTrackedSlots(t)),
        s = this.getBackupMap(t),
        o = new Set()
      for (let c of e) {
        let h = c.slot
        if (h < 0 || h > i.size - 1) continue
        let g = String(h)
        if (!n.has(h)) {
          let y = i.getItem(h)
          ;((s[g] = this.serializeItemStack(y)), n.add(h))
        }
        ;(this.applyRequestToSlot(i, h, c.item), o.add(h))
      }
      if (r)
        for (let c = gr; c <= pr && !(c >= i.size); c++) {
          if (o.has(c)) continue
          let h = String(c)
          if (!n.has(c)) {
            let g = i.getItem(c)
            ;((s[h] = this.serializeItemStack(g)), n.add(c))
          }
          this.applyRequestToSlot(i, c, void 0)
        }
      if (!this.storeBackupMap(t, s)) {
        ;(this.revertSlotsFromBackup(i, n, s), this.clearTrackedSlots(t))
        return
      }
      this.setTrackedSlots(
        t,
        Array.from(n).sort((c, h) => c - h),
      )
    }
    static restore(t) {
      let e = this.getTrackedSlots(t)
      if (e.length === 0) {
        this.clearTrackedSlots(t)
        return
      }
      let r = this.getPlayerContainer(t)
      if (!r) {
        this.clearTrackedSlots(t)
        return
      }
      let i = this.getBackupMap(t)
      for (let n of e) {
        let s = String(n),
          o = i[s]
        delete i[s]
        let c = this.deserializeItemStack(o)
        try {
          r.setItem(n, c ?? void 0)
        } catch (h) {
          this.log.warn(`Failed restoring slot ${n}: ${h}`)
        }
      }
      ;(this.storeBackupMap(t, i), this.clearTrackedSlots(t))
    }
    static createPrimaryIconRequest(t) {
      let e = t instanceof Ie ? Rt.blockToItem(t) : t.clone()
      return (
        e && (e.amount = t instanceof Ie ? 1 : e.amount),
        { slot: 17, item: e }
      )
    }
    static createInventoryRequests(t) {
      return t.map(({ item: e, slot: r }) => ({
        slot: Math.min(9 + r, 35),
        item: e,
      }))
    }
    static blockToItem(t) {
      let r = {
        'minecraft:bubble_column': 'minecraft:water_bucket',
        'minecraft:flowing_lava': 'minecraft:lava_bucket',
        'minecraft:flowing_water': 'minecraft:water_bucket',
        'minecraft:water': 'minecraft:water_bucket',
        'minecraft:lava': 'minecraft:lava_bucket',
      }[t.typeId]
      if (r) return new Qt(r)
      try {
        return t.getItemStack(1, !0)
      } catch {
        try {
          return new Qt(t.typeId)
        } catch {
          return
        }
      }
    }
    static getPlayerContainer(t) {
      return t.getComponent(hr.Inventory)?.container
    }
    static getTrackedSlots(t) {
      let e = t.getDynamicProperty(te)
      if (typeof e == 'string' && e.length > 0)
        try {
          let r = JSON.parse(e)
          return Array.isArray(r) ? r : []
        } catch {
          return []
        }
      return []
    }
    static setTrackedSlots(t, e) {
      t.setDynamicProperty(te, e.length > 0 ? JSON.stringify(e) : void 0)
    }
    static clearTrackedSlots(t) {
      ;(t.setDynamicProperty(te, void 0), this.clearBackupPayload(t))
    }
    static applyRequestToSlot(t, e, r) {
      if (!r) {
        try {
          t.setItem(e, void 0)
        } catch (n) {
          this.log.warn(`Failed clearing slot ${e}: ${n}`)
        }
        return
      }
      let i
      try {
        i = r.clone()
      } catch (n) {
        this.log.warn(`Failed cloning request item for slot ${e}: ${n}`)
        try {
          t.setItem(e, void 0)
        } catch (s) {
          this.log.warn(`Failed clearing slot ${e} after clone failure: ${s}`)
        }
        return
      }
      if (!i) {
        try {
          t.setItem(e, void 0)
        } catch (n) {
          this.log.warn(`Failed clearing slot ${e} after undefined clone: ${n}`)
        }
        return
      }
      ;((i.lockMode = Jt.slot),
        (i.keepOnDeath = !0),
        (i.nameTag = '\xA77 \xA7r'))
      try {
        t.setItem(e, i)
      } catch (n) {
        this.log.warn(`Failed injecting item into slot ${e}: ${n}`)
      }
    }
    static getBackupMap(t) {
      let e = this.readBackupPayload(t)
      if (!e) return {}
      try {
        let r = JSON.parse(e)
        return r && typeof r == 'object' ? r : {}
      } catch (r) {
        return (
          this.log.warn(`Failed parsing inventory mirror payload: ${r}`),
          {}
        )
      }
    }
    static storeBackupMap(t, e) {
      let r = Object.entries(e).filter(([, o]) => o !== void 0)
      if (r.length === 0) return (this.clearBackupPayload(t), !0)
      let i = {}
      for (let [o, c] of r) i[o] = c ?? null
      let n = JSON.stringify(i),
        s = Ae * Dt
      return n.length > s
        ? (this.log.warn(
            `Inventory mirror payload (${n.length}) exceeds limit (${s}). Original items may be lost.`,
          ),
          !1)
        : this.writeBackupPayload(t, n)
    }
    static serializeItemStack(t) {
      if (!t) return null
      let e
      try {
        e = t.clone()
      } catch (g) {
        return (
          this.log.warn(`Failed cloning item stack for serialization: ${g}`),
          null
        )
      }
      if (!e)
        return (
          this.log.warn(
            `Clone returned undefined during serialization for ${t.typeId}`,
          ),
          null
        )
      let r = { typeId: e.typeId, amount: e.amount }
      ;(e.keepOnDeath && (r.keepOnDeath = !0),
        e.lockMode && e.lockMode !== Jt.none && (r.lockMode = e.lockMode),
        e.nameTag && (r.nameTag = e.nameTag))
      let i = this.safeGet(() => e.getCanDestroy())
      i && i.length > 0 && (r.canDestroy = i)
      let n = this.safeGet(() => e.getCanPlaceOn())
      n && n.length > 0 && (r.canPlaceOn = n)
      let s = this.safeGet(() => e.getLore())
      s && s.length > 0 && (r.lore = s)
      let o = this.serializeDurability(e)
      o && (r.durability = o)
      let c = this.serializeEnchantments(e)
      c && c.length > 0 && (r.enchantments = c)
      let h = this.serializeDynamicProperties(e)
      return (h && h.length > 0 && (r.dynamicProperties = h), r)
    }
    static deserializeItemStack(t) {
      if (t)
        try {
          let e = Math.max(1, t.amount ?? 1),
            r = new Qt(t.typeId, e)
          if (
            ((r.amount = e),
            t.keepOnDeath !== void 0 && (r.keepOnDeath = t.keepOnDeath),
            (r.lockMode = t.lockMode ?? Jt.none),
            t.nameTag !== void 0 && (r.nameTag = t.nameTag),
            t.lore)
          ) {
            let i = t.lore
            this.trySet(() => r.setLore(i))
          }
          if (
            (t.canDestroy && this.trySet(() => r.setCanDestroy(t.canDestroy)),
            t.canPlaceOn && this.trySet(() => r.setCanPlaceOn(t.canPlaceOn)),
            t.dynamicProperties)
          ) {
            this.trySet(() => r.clearDynamicProperties())
            for (let i of t.dynamicProperties)
              this.trySet(() => {
                if (i.type === 'vector3') {
                  r.setDynamicProperty(i.id, i.value)
                  return
                }
                r.setDynamicProperty(i.id, i.value)
              })
          }
          if (t.enchantments) {
            let i = this.safeGet(() => r.getComponent(Mt.Enchantable))
            if (i) {
              this.trySet(() => i.removeAllEnchantments())
              let n = []
              for (let s of t.enchantments) {
                let o = dr.get(s.id)
                o && n.push({ type: o, level: s.level })
              }
              n.length > 0 && this.trySet(() => i.addEnchantments(n))
            }
          }
          if (t.durability) {
            let i = t.durability,
              n = this.safeGet(() => r.getComponent(Mt.Durability))
            n &&
              this.trySet(() => {
                n.damage = i.damage ?? 0
              })
          }
          return r
        } catch (e) {
          this.log.warn(`Failed to deserialize inventory mirror entry: ${e}`)
          return
        }
    }
    static serializeDurability(t) {
      try {
        let e = t.getComponent(Mt.Durability)
        return !e || typeof e.damage != 'number' || e.damage <= 0
          ? void 0
          : { damage: e.damage }
      } catch (e) {
        this.log.debug?.(`Durability serialization failed: ${e}`)
        return
      }
    }
    static serializeEnchantments(t) {
      try {
        let e = t.getComponent(Mt.Enchantable)
        if (!e) return
        let r = e.getEnchantments()
        return !r || r.length === 0
          ? void 0
          : r.map((i) => ({ id: i.type.id, level: i.level }))
      } catch (e) {
        this.log.debug?.(`Enchantment serialization failed: ${e}`)
        return
      }
    }
    static serializeDynamicProperties(t) {
      try {
        let e = t.getDynamicPropertyIds()
        if (!e || e.length === 0) return
        let r = []
        for (let i of e) {
          let n = t.getDynamicProperty(i)
          if (n != null)
            switch (typeof n) {
              case 'boolean':
                r.push({ id: i, type: 'boolean', value: n })
                break
              case 'number':
                r.push({ id: i, type: 'number', value: n })
                break
              case 'string':
                r.push({ id: i, type: 'string', value: n })
                break
              case 'object': {
                if (
                  typeof n.x == 'number' &&
                  typeof n.y == 'number' &&
                  typeof n.z == 'number'
                ) {
                  let s = n
                  r.push({
                    id: i,
                    type: 'vector3',
                    value: { x: s.x, y: s.y, z: s.z },
                  })
                }
                break
              }
            }
        }
        return r.length ? r : void 0
      } catch (e) {
        this.log.debug?.(`Dynamic property serialization failed: ${e}`)
        return
      }
    }
    static writeBackupPayload(t, e) {
      if (!e) return (this.clearBackupPayload(t), !0)
      let r = this.chunkString(e, Ae)
      if (r.length > Dt)
        return (
          this.log.warn(`Inventory mirror chunk count exceeded: ${r.length}`),
          !1
        )
      this.clearBackupPayload(t)
      for (let i = 0; i < r.length; i++)
        t.setDynamicProperty(this.getBackupChunkId(i), r[i])
      return !0
    }
    static readBackupPayload(t) {
      let e = []
      for (let r = 0; r < Dt; r++) {
        let i = t.getDynamicProperty(this.getBackupChunkId(r))
        if (typeof i != 'string') {
          if (r === 0) return ''
          break
        }
        e.push(i)
      }
      return e.join('')
    }
    static clearBackupPayload(t) {
      for (let e = 0; e < Dt; e++) {
        let r = this.getBackupChunkId(e)
        t.getDynamicProperty(r) !== void 0 && t.setDynamicProperty(r, void 0)
      }
    }
    static getBackupChunkId(t) {
      return t === 0 ? Te : `${Te}${fr}${t}`
    }
    static chunkString(t, e) {
      let r = [],
        i = 0
      for (; i < t.length;) (r.push(t.slice(i, i + e)), (i += e))
      return r.length ? r : [t]
    }
    static safeGet(t) {
      try {
        return t()
      } catch (e) {
        this.log.debug?.(`InventoryMirror safeGet failed: ${e}`)
        return
      }
    }
    static trySet(t) {
      try {
        t()
      } catch (e) {
        this.log.debug?.(`InventoryMirror trySet failed: ${e}`)
      }
    }
    static revertSlotsFromBackup(t, e, r) {
      for (let i of e) {
        let n = this.deserializeItemStack(r[String(i)])
        try {
          t.setItem(i, n ?? void 0)
        } catch (s) {
          this.log.warn(
            `Failed reverting slot ${i} after backup overflow: ${s}`,
          )
        }
      }
    }
  }
a(Rt, 'log', L.get('InventoryMirror'))
var K = Rt
import { EntityComponentTypes as vr, ItemStack as xe } from '@minecraft/server'
var rt = ((r) => (
    (r.CORRECT = 'a'),
    (r.INCORRECT = 'b'),
    (r.UNDEFINED = 'z'),
    r
  ))(rt || {}),
  ee = ((x) => (
    (x.PICKAXE_WOOD = 'aa'),
    (x.PICKAXE_STONE = 'ab'),
    (x.PICKAXE_IRON = 'ac'),
    (x.PICKAXE_DIAMOND = 'ad'),
    (x.AXE_WOOD = 'ba'),
    (x.AXE_STONE = 'bb'),
    (x.AXE_IRON = 'bc'),
    (x.AXE_DIAMOND = 'bd'),
    (x.SHOVEL = 'ca'),
    (x.HOE = 'da'),
    (x.SWORD = 'ea'),
    (x.IGNITABLE = 'fa'),
    (x.CROPS = 'fb'),
    (x.SHEARS = 'fc'),
    (x.BUCKET = 'fd'),
    (x.BRUSH = 'fe'),
    (x.COMMANDS = 'ff'),
    (x.UNDEFINED = 'zz'),
    x
  ))(ee || {}),
  re = ((T) => (
    (T.CAN_CLIMB = 'aa'),
    (T.CAN_FLY = 'ab'),
    (T.CAN_POWER_JUMP = 'ac'),
    (T.FIRE_IMMUNE = 'ad'),
    (T.IS_BABY = 'ae'),
    (T.IS_CHESTED = 'af'),
    (T.IS_DYEABLE = 'ag'),
    (T.IS_STUNNED = 'ah'),
    (T.IS_RIDEABLE = 'ai'),
    (T.IS_TRADEABLE = 'aj'),
    (T.PROJECTILE = 'ak'),
    (T.WANTS_JOCKEY = 'al'),
    (T.TAMEABLE = 'am'),
    (T.WHEAT = 'an'),
    (T.POTATO = 'ao'),
    (T.HAY_BALE = 'ap'),
    (T.SEEDS = 'aq'),
    (T.GOLDEN_APPLE = 'ar'),
    (T.FISH = 'as'),
    (T.FLOWERS = 'at'),
    (T.FUNGI = 'au'),
    (T.SLIMEBALL = 'av'),
    (T.CACTUS = 'aw'),
    (T.TORCHFLOWER = 'ax'),
    (T.SPIDER_EYE = 'ay'),
    (T.UNDEFINED = 'zz'),
    T
  ))(re || {})
var Ce = [
  {
    name: 'commands',
    target: [
      'minecraft:barrier',
      'minecraft:command_block',
      'minecraft:light_block',
      'minecraft:structure_air',
      'minecraft:structure_block',
    ],
  },
  {
    name: 'bucket',
    remarks: {
      correct: { itemIds: ['bucket'] },
      incorrect: { itemIds: ['!bucket'] },
    },
    target: [
      'minecraft:bubble_column',
      'minecraft:flowing_lava',
      'minecraft:flowing_water',
      'minecraft:lava',
      'minecraft:powder_snow',
      'minecraft:water',
    ],
  },
  {
    name: 'brush',
    remarks: {
      correct: { itemIds: ['minecraft:brush'] },
      incorrect: { itemIds: ['!minecraft:brush'] },
    },
    target: ['minecraft:suspicious_sand', 'minecraft:suspicious_gravel'],
  },
  {
    name: 'shears',
    remarks: {
      correct: { itemIds: ['minecraft:shears'] },
      incorrect: { itemIds: ['!minecraft:shears'] },
    },
    target: [
      { tag: 'minecraft:is_shears_item_destructible' },
      { tag: '!minecraft:is_axe_item_destructible' },
      { tag: '!minecraft:is_pickaxe_item_destructible' },
      { tag: '!minecraft:is_shovel_item_destructible' },
      { tag: '!minecraft:is_hoe_item_destructible' },
      { tag: '!minecraft:is_sword_item_destructible' },
      'carpet',
      'coral',
      'dry_grass',
      'leaves',
      'petals',
      'root',
      'short_grass',
      'sprout',
      'tall_grass',
      'vine',
      'waterlily',
      'weed',
      'wool',
      '!coral_block',
      '!seed',
    ],
  },
  {
    name: 'sword',
    remarks: {
      correct: { tags: ['minecraft:is_sword'] },
      incorrect: { tags: ['!minecraft:is_sword'], itemIds: ['!sword'] },
    },
    target: [
      { tag: 'minecraft:is_sword_item_destructible' },
      { tag: '!minecraft:is_axe_item_destructible' },
      { tag: '!minecraft:is_pickaxe_item_destructible' },
      { tag: '!minecraft:is_shovel_item_destructible' },
      'minecraft:web',
    ],
  },
  {
    name: 'hoe',
    remarks: {
      correct: { tags: ['minecraft:is_hoe'] },
      incorrect: { tags: ['!minecraft:is_hoe'], itemIds: ['!hoe'] },
    },
    target: [
      { tag: 'minecraft:is_hoe_item_destructible' },
      { tag: '!minecraft:is_axe_item_destructible' },
      { tag: '!minecraft:is_pickaxe_item_destructible' },
      'leaves',
      'minecraft:calibrated_sculk_sensor',
      'minecraft:farmland',
      'minecraft:sculk',
      'minecraft:sculk_catalyst',
      'minecraft:sculk_sensor',
      'minecraft:sculk_shrieker',
      'minecraft:sculk_vein',
      'minecraft:wart_block',
      'minecraft:wet_sponge',
    ],
  },
  {
    name: 'shovel',
    remarks: {
      correct: { tags: ['minecraft:is_shovel'], itemIds: ['shovel'] },
      incorrect: { tags: ['!minecraft:is_shovel'], itemIds: ['!shovel'] },
    },
    target: [
      { tag: 'minecraft:is_shovel_item_destructible' },
      { tag: '!minecraft:is_pickaxe_item_destructible' },
      'concrete_powder',
      'grass',
      'minecraft:farmland',
      'minecraft:red_sand',
      'minecraft:sand',
      'minecraft:snow',
      'minecraft:snow_layer',
      '!dry_grass',
      '!short_grass',
      '!tall_grass',
      '!minecraft:short_grass',
      '!minecraft:short_dry_grass',
      '!stone',
      '!suspicious',
      '!wall',
    ],
  },
  {
    name: 'pickaxe_wood',
    remarks: {
      correct: { tags: ['minecraft:is_pickaxe'], itemIds: ['pickaxe'] },
      incorrect: { tags: ['!minecraft:is_pickaxe'], itemIds: ['!pickaxe'] },
    },
    target: [
      { tag: 'minecraft:is_pickaxe_item_destructible' },
      { tag: '!minecraft:stone_tier_destructible' },
      { tag: '!minecraft:iron_tier_destructible' },
      { tag: '!minecraft:diamond_tier_destructible' },
      'beacon',
    ],
  },
  {
    name: 'pickaxe_stone',
    remarks: {
      correct: {
        itemIds: [
          'minecraft:stone_pickaxe',
          'minecraft:iron_pickaxe',
          'minecraft:diamond_pickaxe',
          'minecraft:netherite_pickaxe',
        ],
      },
      incorrect: {
        itemIds: ['minecraft:wooden_pickaxe', '!minecraft:stone_pickaxe'],
      },
    },
    target: [
      { tag: 'minecraft:is_pickaxe_item_destructible' },
      { tag: 'minecraft:stone_tier_destructible' },
      { tag: '!minecraft:iron_tier_destructible' },
      { tag: '!minecraft:diamond_tier_destructible' },
    ],
  },
  {
    name: 'pickaxe_iron',
    remarks: {
      correct: {
        itemIds: [
          'minecraft:iron_pickaxe',
          'minecraft:diamond_pickaxe',
          'minecraft:netherite_pickaxe',
        ],
      },
      incorrect: { itemIds: ['!minecraft:iron_pickaxe'] },
    },
    target: [
      { tag: 'minecraft:is_pickaxe_item_destructible' },
      { tag: 'minecraft:iron_tier_destructible' },
      { tag: '!minecraft:diamond_tier_destructible' },
    ],
  },
  {
    name: 'pickaxe_diamond',
    remarks: {
      correct: {
        itemIds: ['minecraft:diamond_pickaxe', 'minecraft:netherite_pickaxe'],
      },
      incorrect: {
        itemIds: ['!minecraft:diamond_pickaxe', '!minecraft:netherite_pickaxe'],
      },
    },
    target: [
      { tag: 'minecraft:is_pickaxe_item_destructible' },
      { tag: 'minecraft:diamond_tier_destructible' },
    ],
  },
  {
    name: 'axe_wood',
    remarks: {
      correct: { tags: ['minecraft:is_axe'], itemIds: ['axe'] },
      incorrect: { tags: ['!minecraft:is_axe'], itemIds: ['!axe'] },
    },
    target: [
      { tag: 'minecraft:is_axe_item_destructible' },
      { tag: '!minecraft:stone_tier_destructible' },
      { tag: '!minecraft:iron_tier_destructible' },
      { tag: '!minecraft:diamond_tier_destructible' },
      { tag: '!minecraft:is_pickaxe_item_destructible' },
    ],
  },
  {
    name: 'axe_stone',
    remarks: {
      correct: {
        itemIds: [
          'minecraft:stone_axe',
          'minecraft:iron_axe',
          'minecraft:diamond_axe',
          'minecraft:netherite_axe',
        ],
      },
      incorrect: { itemIds: ['minecraft:wooden_axe', '!minecraft:stone_axe'] },
    },
    target: [
      { tag: 'minecraft:is_axe_item_destructible' },
      { tag: 'minecraft:stone_tier_destructible' },
      { tag: '!minecraft:is_pickaxe_item_destructible' },
    ],
  },
  {
    name: 'axe_iron',
    remarks: {
      correct: {
        itemIds: [
          'minecraft:iron_axe',
          'minecraft:stone_axe',
          'minecraft:diamond_axe',
          'minecraft:netherite_axe',
        ],
      },
      incorrect: { itemIds: ['!minecraft:iron_axe', '!minecraft:golden_axe'] },
    },
    target: [
      { tag: 'minecraft:is_axe_item_destructible' },
      { tag: 'minecraft:iron_tier_destructible' },
      { tag: '!minecraft:is_pickaxe_item_destructible' },
    ],
  },
  {
    name: 'axe_diamond',
    remarks: {
      correct: {
        itemIds: ['minecraft:diamond_axe', 'minecraft:netherite_axe'],
      },
      incorrect: {
        itemIds: ['!minecraft:diamond_axe', '!minecraft:netherite_axe'],
      },
    },
    target: [
      { tag: 'minecraft:is_axe_item_destructible' },
      { tag: 'minecraft:diamond_tier_destructible' },
      { tag: '!minecraft:is_pickaxe_item_destructible' },
    ],
  },
  {
    name: 'crops',
    target: [
      { tag: 'plant' },
      'minecraft:beetroot',
      'minecraft:cactus',
      'minecraft:carrot',
      'minecraft:chorus_flower',
      'minecraft:chorus_fruit',
      'minecraft:chorus_plant',
      'minecraft:cocoa',
      'minecraft:cocoa_beans',
      'minecraft:crimson_fungus',
      'minecraft:kelp',
      'minecraft:melon_block',
      'minecraft:melon_steam',
      'minecraft:nether_wart',
      'minecraft:pitcher_crop',
      'minecraft:pitcher_plant',
      'minecraft:potatoes',
      'minecraft:pumpkin',
      'minecraft:pumpkin_stem',
      'minecraft:reeds',
      'minecraft:sea_pickle',
      'minecraft:sweet_berry_bush',
      'minecraft:torchflower',
      'minecraft:torchflower_crop',
      'minecraft:warped_fungus',
      'minecraft:wheat',
      'leaves',
      'flower',
      'mushroom',
      'sapling',
      '!grass',
      '!pot',
    ],
  },
]
var Pt = class Pt {
  static matches(t, e) {
    let r = t.includes(':') ? t.split(':')[1] : t,
      i = e.startsWith('!'),
      n = i ? e.substring(1) : e,
      s = !1
    return (
      (n === t ||
        (!n.includes(':') && n === r) ||
        (!n.includes(':') && t.includes(n)) ||
        (!n.includes(':') && r.includes(n))) &&
        (s = !0),
      i ? !s : s
    )
  }
  static listMatches(t, e, r) {
    if (!e || e.length === 0) return !1
    let i = !1
    for (let n of e)
      if (Pt.matches(t, n)) {
        if (n.startsWith('!')) return (r?.onNegatedMatch?.(), !1)
        i = !0
      }
    return i
  }
}
a(Pt, 'log', N.getLogger('RuleMatcher'))
var B = Pt
import {
  EntityComponentTypes as br,
  EquipmentSlot as _r,
} from '@minecraft/server'
function Ot(u) {
  try {
    let e = u.getComponent(br.Equippable)?.getEquipment(_r.Mainhand)
    return e
      ? { itemTypeId: e.typeId ?? '__r4ui:none', tags: e.getTags() }
      : { itemTypeId: '__r4ui:none', tags: [] }
  } catch {
    return { itemTypeId: '__r4ui:none', tags: [] }
  }
}
var ie = 18,
  M = class M {
    static createLookupData(t) {
      return {
        type: 'tile',
        hitIdentifier: M.resolveHitIdentifier(t),
        block: t,
      }
    }
    static createRenderData(t, e, r) {
      let i = r?.includeInventory ?? !0,
        n = i ? M.extractInventory(t) : void 0,
        s = {
          toolIcons: M.buildToolIconString(t, e),
          blockStates: M.describeStates(t),
        }
      return (
        i &&
          n &&
          (n.slots && (s.inventory = n.slots),
          n.overflow > 0 && (s.inventoryOverflow = n.overflow)),
        s
      )
    }
    static resolveHitIdentifier(t) {
      try {
        let e = t.getItemStack(1, !0)
        if (e?.typeId) return e.typeId
      } catch {}
      return t.typeId
    }
    static buildToolIconString(t, e) {
      let r = M.collectMatchingTags(t)
      if (r.length === 0) return 'zz,z;zz,z:'
      let i = Ot(e),
        n = []
      for (let c of r) {
        let h = M.resolveToolIconId(c.name),
          g = M.resolveRemarkIcon(c, i)
        if (
          !n.some((y) => y.iconId.charAt(0) === h.charAt(0)) &&
          (n.push({ iconId: h, remark: g }), n.length >= 2)
        )
          break
      }
      let [s, o] = M.padToolEntries(n)
      return `${s.iconId},${s.remark};${o.iconId},${o.remark}:`
    }
    static collectMatchingTags(t) {
      let e = t.typeId,
        r = e.includes(':') ? e.split(':')[1] : e,
        i = t.getTags()
      return Ce.filter((n) => {
        let s = !1
        for (let o of n.target) {
          if (typeof o == 'string') {
            let I = o.startsWith('!'),
              S = I ? o.substring(1) : o
            if (!S) continue
            if (M.matchesBlockRule(S, e, r)) {
              if (I) return !1
              s = !0
            }
            continue
          }
          let c = o.tag
          if (!c) continue
          let h = c.startsWith('!'),
            g = h ? c.substring(1) : c
          if (M.matchesTagRule(g, i)) {
            if (h) return !1
            s = !0
          }
        }
        return s
      })
    }
    static matchesBlockRule(t, e, r) {
      return B.matches(e, t) || B.matches(r, t)
    }
    static matchesTagRule(t, e) {
      return e.some((r) => B.matches(r, t))
    }
    static matchesTagCondition(t, e) {
      if (!t) return !1
      let r = t.startsWith('!'),
        i = r ? t.substring(1) : t,
        n = e.some((s) => B.matches(s, i))
      return r ? !n : n
    }
    static matchesItemRule(t, e) {
      if (!t) return !1
      let r = t.startsWith('!'),
        i = r ? t.substring(1) : t,
        n = e,
        s = M.getNamespaceLessIdentifier(n),
        o = s.split('_').filter(Boolean),
        c = !1
      return (
        i.includes(':') ? (c = n === i) : (c = s === i || o.includes(i)),
        r ? !c : c
      )
    }
    static getNamespaceLessIdentifier(t) {
      return t.includes(':') ? t.split(':')[1] : t
    }
    static resolveToolIconId(t) {
      let e = t.toUpperCase()
      return ee[e] ?? 'zz'
    }
    static resolveRemarkIcon(t, e) {
      if (!t.remarks) return 'z'
      for (let r of Object.keys(t.remarks)) {
        let i = r.toUpperCase()
        if (!(i in rt)) continue
        let n = rt[i],
          s = t.remarks[r],
          o = s.tags?.some((h) => M.matchesTagCondition(h, e.tags)) ?? !1,
          c = s.itemIds?.some((h) => M.matchesItemRule(h, e.itemTypeId)) ?? !1
        if (o || c) return n
      }
      return 'z'
    }
    static padToolEntries(t) {
      let e = { iconId: 'zz', remark: 'z' }
      return [t[0] ?? e, t[1] ?? e]
    }
    static describeStates(t) {
      try {
        let e = t.permutation.getAllStates(),
          r = Object.keys(e).sort()
        return r.length === 0
          ? void 0
          : r.map((i) => {
              let n = e[i],
                s = i.replace('minecraft:', ''),
                o = M.colorForStateValue(n)
              return `\xA77${s}: ${o}${n}\xA7r`
            }).join(`
`)
      } catch {
        return
      }
    }
    static colorForStateValue(t) {
      return typeof t == 'number'
        ? '\xA73'
        : typeof t == 'boolean'
          ? t
            ? '\xA7a'
            : '\xA7c'
          : '\xA7e'
    }
    static extractInventory(t) {
      let e = M.getBlockContainer(t)
      if (!e) return { slots: void 0, overflow: 0 }
      let r = M.collectNonEmptyStacks(e)
      if (e.size > ie) {
        if (r.length === 0) return { slots: void 0, overflow: 0 }
        let s = M.packIntoTwoRows(r),
          o = s.slots,
          c = Math.max(0, s.aggregatedSize - o.length)
        return { slots: o.length > 0 ? o : void 0, overflow: c }
      }
      let i = M.mirrorContainer(e)
      if (!i) return { slots: void 0, overflow: 0 }
      let n = Math.max(0, r.length - i.mirroredNonEmpty)
      return { slots: i.slots, overflow: n }
    }
    static getBlockContainer(t) {
      return t.getComponent(vr.Inventory)?.container ?? void 0
    }
    static collectNonEmptyStacks(t) {
      let e = []
      for (let r = 0; r < t.size; r++) {
        let i = t.getItem(r)
        i && i.typeId !== 'minecraft:air' && i.amount > 0 && e.push(i)
      }
      return e
    }
    static packIntoTwoRows(t) {
      let e = M.aggregateStackableItems(t),
        r = []
      for (let n = 0; n < ie; n++) n !== 8 && r.push(n)
      let i = []
      for (let n = 0; n < r.length; n++) {
        let s = e[n]
        if (!s) break
        i.push({ item: s, slot: r[n] })
      }
      return { slots: i, aggregatedSize: e.length }
    }
    static mirrorContainer(t) {
      let e = [],
        r = 0
      for (let i = 0; i < t.size; i++) {
        let n = i < 8 ? i : i + 1
        if (n >= ie) break
        let s = t.getItem(i)
        ;(s && s.typeId !== 'minecraft:air' && s.amount > 0 && r++,
          e.push({ item: s ?? new xe('minecraft:air'), slot: n }))
      }
      return r > 0 ? { slots: e, mirroredNonEmpty: r } : void 0
    }
    static aggregateStackableItems(t) {
      if (t.length === 0) return t
      let e = [],
        r = new Map()
      for (let n of t) {
        if (!n) continue
        if (!M.isStackableCandidate(n)) {
          e.push({ kind: 'single', stack: n })
          continue
        }
        let s = n.typeId,
          o = r.get(s)
        ;(o ||
          ((o = { template: n, maxAmount: M.resolveMaxStackSize(n), total: 0 }),
          r.set(s, o),
          e.push({ kind: 'bucket', key: s })),
          (o.total += Math.max(0, n.amount)))
      }
      let i = []
      for (let n of e) {
        if (n.kind === 'single') {
          i.push(n.stack)
          continue
        }
        let s = r.get(n.key)
        if (!s) continue
        let o = s.total,
          c = Math.max(1, s.maxAmount)
        for (; o > 0;) {
          let h = Math.min(c, o),
            g = M.cloneItemForAggregation(s.template, h)
          ;(g && i.push(g), (o -= h))
        }
        r.delete(n.key)
      }
      return i
    }
    static isStackableCandidate(t) {
      return !t || t.amount <= 0 || t.isStackable !== !0
        ? !1
        : (typeof t.maxAmount == 'number' ? t.maxAmount : 0) > 1
    }
    static resolveMaxStackSize(t) {
      let e = typeof t.maxAmount == 'number' ? t.maxAmount : 0
      return e > 0 ? e : 64
    }
    static cloneItemForAggregation(t, e) {
      try {
        let r = t.clone()
        return ((r.amount = e), r)
      } catch (r) {
        M.log.debug?.(`Failed to clone stack for aggregation: ${r}`)
        try {
          let i = new xe(t.typeId, e)
          return ((i.amount = e), i)
        } catch (i) {
          M.log.warn(`Failed to create fallback stack for ${t.typeId}: ${i}`)
          return
        }
      }
    }
  }
a(M, 'log', L.get('BlockHandler'))
var ct = M
import {
  EntityComponentTypes as z,
  EquipmentSlot as Nt,
  TicksPerSecond as Pe,
} from '@minecraft/server'
var Me = {
  'minecraft:turtle_helmet': 2,
  'minecraft:leather_helmet': 1,
  'minecraft:leather_chestplate': 3,
  'minecraft:leather_leggings': 2,
  'minecraft:leather_boots': 1,
  'minecraft:golden_helmet': 2,
  'minecraft:golden_chestplate': 5,
  'minecraft:golden_leggings': 3,
  'minecraft:golden_boots': 1,
  'minecraft:chainmail_helmet': 2,
  'minecraft:chainmail_chestplate': 5,
  'minecraft:chainmail_leggings': 4,
  'minecraft:chainmail_boots': 1,
  'minecraft:iron_helmet': 2,
  'minecraft:iron_chestplate': 6,
  'minecraft:iron_leggings': 5,
  'minecraft:iron_boots': 2,
  'minecraft:diamond_helmet': 3,
  'minecraft:diamond_chestplate': 8,
  'minecraft:diamond_leggings': 6,
  'minecraft:diamond_boots': 3,
  'minecraft:netherite_helmet': 3,
  'minecraft:netherite_chestplate': 8,
  'minecraft:netherite_leggings': 6,
  'minecraft:netherite_boots': 3,
}
var De = [
  { name: 'can_climb', target: ['spider'] },
  {
    name: 'is_tradeable',
    remarks: { correct: { itemIds: ['minecraft:emerald'] } },
    target: ['merchant', 'wandering_trader', 'villager'],
  },
  {
    name: 'is_rideable',
    remarks: { correct: { itemIds: ['minecraft:saddle'] } },
    target: [
      'boat',
      'camel',
      'donkey',
      'horse',
      'minecart',
      'mule',
      'pig',
      'strider',
      '!piglin',
    ],
  },
  {
    name: 'tameable',
    target: [
      'cat',
      'donkey',
      'horse',
      'llama',
      'mule',
      'parrot',
      'skeleton_horse',
      'wolf',
    ],
  },
  {
    name: 'golden_apple',
    remarks: {
      correct: { itemIds: ['minecraft:golden_apple'] },
      incorrect: { itemIds: ['!minecraft:golden_apple'] },
    },
    target: ['horse', 'donkey'],
  },
  {
    name: 'wheat',
    remarks: {
      correct: { itemIds: ['minecraft:wheat'] },
      incorrect: { itemIds: ['!minecraft:wheat'] },
    },
    target: ['cow', 'goat', 'mooshroom', 'sheep'],
  },
  {
    name: 'potato',
    remarks: {
      correct: { itemIds: ['minecraft:potato'] },
      incorrect: { itemIds: ['!minecraft:potato'] },
    },
    target: ['pig', '!piglin'],
  },
  {
    name: 'seeds',
    remarks: {
      correct: { itemIds: ['minecraft:wheat_seeds'] },
      incorrect: { itemIds: ['!minecraft:wheat_seeds'] },
    },
    target: ['chicken', 'parrot'],
  },
  {
    name: 'fish',
    remarks: {
      correct: {
        itemIds: [
          'minecraft:cod',
          'minecraft:salmon',
          'minecraft:tropical_fish',
        ],
      },
      incorrect: {
        itemIds: [
          '!minecraft:cod',
          '!minecraft:salmon',
          '!minecraft:tropical_fish',
        ],
      },
    },
    target: ['cat', 'ocelot'],
  },
  {
    name: 'hay_bale',
    remarks: {
      correct: { itemIds: ['minecraft:hay_block'] },
      incorrect: { itemIds: ['!minecraft:hay_block'] },
    },
    target: ['llama'],
  },
  {
    name: 'flowers',
    remarks: {
      correct: {
        itemIds: [
          'minecraft:poppy',
          'minecraft:blue_orchid',
          'minecraft:allium',
          'minecraft:azure_bluet',
          'minecraft:red_tulip',
          'minecraft:orange_tulip',
          'minecraft:white_tulip',
          'minecraft:pink_tulip',
          'minecraft:oxeye_daisy',
          'minecraft:cornflower',
          'minecraft:lily_of_the_valley',
          'minecraft:dandelion',
          'minecraft:wither_rose',
          'minecraft:sunflower',
          'minecraft:lilac',
          'minecraft:rose_bush',
          'minecraft:peony',
          'minecraft:flowering_azalea',
          'minecraft:azalea_leaves_flowered',
          'minecraft:mangrove_propagule',
          'minecraft:pitcher_plant',
          'minecraft:torchflower',
          'minecraft:cherry_leaves',
          'minecraft:pink_petals',
          'minecraft:wildflowers',
          'minecraft:cactus_flower',
        ],
      },
      incorrect: {
        itemIds: [
          '!minecraft:poppy',
          '!minecraft:blue_orchid',
          '!minecraft:allium',
          '!minecraft:azure_bluet',
          '!minecraft:red_tulip',
          '!minecraft:orange_tulip',
          '!minecraft:white_tulip',
          '!minecraft:pink_tulip',
          '!minecraft:oxeye_daisy',
          '!minecraft:cornflower',
          '!minecraft:lily_of_the_valley',
          '!minecraft:dandelion',
          '!minecraft:wither_rose',
          '!minecraft:sunflower',
          '!minecraft:lilac',
          '!minecraft:rose_bush',
          '!minecraft:peony',
          '!minecraft:flowering_azalea',
          '!minecraft:azalea_leaves_flowered',
          '!minecraft:mangrove_propagule',
          '!minecraft:pitcher_plant',
          '!minecraft:torchflower',
          '!minecraft:cherry_leaves',
          '!minecraft:pink_petals',
          '!minecraft:wildflowers',
          '!minecraft:cactus_flower',
        ],
      },
    },
    target: ['bee', 'rabbit'],
  },
  {
    name: 'fungi',
    remarks: {
      correct: { itemIds: ['minecraft:crimson_fungus'] },
      incorrect: { itemIds: ['!minecraft:crimson_fungus'] },
    },
    target: ['hoglin'],
  },
  {
    name: 'fungi',
    remarks: {
      correct: { itemIds: ['minecraft:warped_fungus'] },
      incorrect: { itemIds: ['!minecraft:warped_fungus'] },
    },
    target: ['strider'],
  },
  {
    name: 'slimeball',
    remarks: {
      correct: { itemIds: ['minecraft:slimeball'] },
      incorrect: { itemIds: ['!minecraft:slimeball'] },
    },
    target: ['frog'],
  },
  {
    name: 'cactus',
    remarks: {
      correct: { itemIds: ['minecraft:cactus'] },
      incorrect: { itemIds: ['!minecraft:cactus'] },
    },
    target: ['camel'],
  },
  {
    name: 'torchflower',
    remarks: {
      correct: { itemIds: ['minecraft:torchflower'] },
      incorrect: { itemIds: ['!minecraft:torchflower'] },
    },
    target: ['sniffer'],
  },
  {
    name: 'spider_eye',
    remarks: {
      correct: { itemIds: ['minecraft:spider_eye'] },
      incorrect: { itemIds: ['!minecraft:spider_eye'] },
    },
    target: ['armadillo'],
  },
]
var Re = [
  'area_effect_cloud',
  'fireball',
  'minecart',
  'potion',
  'minecraft:arrow',
  'minecraft:boat',
  'minecraft:chest_boat',
  'minecraft:egg',
  'minecraft:eye_of_ender_signal',
  'minecraft:item',
  'minecraft:snowball',
  'minecraft:tnt',
  'minecraft:wind_charge_projectile',
]
var ne = 4,
  Er = [
    { name: 'speed', id: 1 },
    { name: 'slowness', id: 2 },
    { name: 'haste', id: 3 },
    { name: 'mining_fatigue', id: 4 },
    { name: 'strength', id: 5 },
    { name: 'instant_health', id: 6 },
    { name: 'instant_damage', id: 7 },
    { name: 'jump_boost', id: 8 },
    { name: 'nausea', id: 9 },
    { name: 'regeneration', id: 10 },
    { name: 'resistance', id: 11 },
    { name: 'fire_resistance', id: 12 },
    { name: 'water_breathing', id: 13 },
    { name: 'invisibility', id: 14 },
    { name: 'blindness', id: 15 },
    { name: 'night_vision', id: 16 },
    { name: 'hunger', id: 17 },
    { name: 'weakness', id: 18 },
    { name: 'poison', id: 19 },
    { name: 'wither', id: 20 },
    { name: 'health_boost', id: 21 },
    { name: 'absorption', id: 22 },
    { name: 'saturation', id: 23 },
    { name: 'levitation', id: 24 },
    { name: 'fatal_poison', id: 25 },
    { name: 'slow_falling', id: 26 },
    { name: 'conduit_power', id: 27 },
    { name: 'bad_omen', id: 28 },
    { name: 'village_hero', id: 29 },
    { name: 'darkness', id: 30 },
    { name: 'wind_charged', id: 31 },
    { name: 'weaving', id: 32 },
    { name: 'oozing', id: 33 },
    { name: 'infested', id: 34 },
  ],
  lt = class u {
    static createLookupData(t) {
      let e = t.getComponent(z.Health),
        r = {
          type: 'entity',
          hitIdentifier: t.typeId,
          entity: t,
          hp: e?.currentValue ?? 0,
          maxHp: e?.effectiveMax ?? 0,
        }
      try {
        r.effectsData = t
          .getEffects()
          .filter((i) => i.duration !== -1 && i.amplifier !== -1)
          .map((i) => ({
            id: i.typeId,
            amplifier: i.amplifier,
            duration: Math.floor(i.duration / Pe),
          }))
      } catch {
        r.effectsData = []
      }
      if (t.typeId === 'minecraft:item') {
        let i = t.getComponent(z.Item)
        i?.itemStack && (r.itemStack = i.itemStack)
      }
      return r
    }
    static transformEntityId(t) {
      if (Re.some((s) => t.typeId.includes(s))) return '0000000000000'
      let e = t.id ?? '0000000000000',
        r = BigInt(e),
        n = (r < 0n ? -r : r).toString().padStart(12, '0')
      return `${r < 0n ? '-' : ''}${n}`
    }
    static createRenderData(t, e, r, i) {
      let n = t.getComponent(z.Health),
        s = Math.floor(n?.currentValue ?? 0),
        o = Math.floor(n?.effectiveMax ?? 0),
        c =
          t.matches({ families: ['inanimate'] }) ||
          (o > 40 && !t.matches({ type: 'minecraft:player' })),
        h = u.buildHealthRenderer(s, o, r, c)
      return {
        entityId: u.transformEntityId(t),
        tagIcons: u.buildInteractionIconString(t, e),
        hp: s,
        maxHp: o,
        intHealthDisplay: c,
        healthRenderer: h,
        armorRenderer: u.buildArmorRenderer(t),
        effectsRenderer: u.buildEffectsRenderer(t, e, i),
      }
    }
    static buildInteractionIconString(t, e) {
      let r = u.collectInteractionTags(t),
        i = u.collectComponentTags(t),
        n = u.selectTagNames(r, i),
        s = Ot(e),
        o = n.map((g) => u.resolveTagIcon(g, r.get(g), s))
      for (; o.length < 2;) o.push({ iconId: 'zz', remark: 'z' })
      let [c, h] = o
      return `:${c.iconId},${c.remark};${h.iconId},${h.remark}:`
    }
    static collectInteractionTags(t) {
      let e = new Map(),
        r = t.typeId,
        i = r.includes(':') ? r.split(':')[1] : r
      for (let n of De) {
        let s = !1,
          o = !1
        for (let c of n.target) {
          if (typeof c != 'string') continue
          let h = c
          if (B.matches(r, h) || B.matches(i, h)) {
            if (h.startsWith('!')) {
              o = !0
              break
            }
            s = !0
          }
        }
        s && !o && e.set(n.name.toUpperCase(), n)
      }
      return e
    }
    static collectComponentTags(t) {
      let e = [
          z.CanFly,
          z.CanPowerJump,
          z.FireImmune,
          z.IsBaby,
          z.IsChested,
          z.IsDyeable,
          z.IsStunned,
          z.IsTamed,
          z.Projectile,
          z.WantsJockey,
        ],
        r = []
      for (let i of e)
        try {
          t.getComponent(i) && r.push(i.replace('minecraft:', '').toUpperCase())
        } catch {}
      return r
    }
    static selectTagNames(t, e) {
      let r = [],
        i = Array.from(t.keys())
      ;(i.includes('IS_BABY') && t.delete('IS_RIDEABLE'),
        i.includes('IS_TAMED') && t.delete('TAMEABLE'))
      for (let n of i)
        if ((r.includes(n) || r.push(n), r.length >= 2)) return r.slice(0, 2)
      for (let n of e) if ((r.includes(n) || r.push(n), r.length >= 2)) break
      return r.slice(0, 2)
    }
    static resolveTagIcon(t, e, r) {
      let i = re[t] ?? 'zz'
      if (!e?.remarks) return { iconId: i, remark: 'z' }
      for (let n of Object.keys(e.remarks)) {
        let s = n.toUpperCase()
        if (!(s in rt)) continue
        let o = rt[s],
          c = e.remarks[n]
        if (c.itemIds?.some((y) => B.matches(r.itemTypeId, y)))
          return { iconId: i, remark: o }
        if (c.tags?.some((y) => r.tags.some((I) => B.matches(I, y))))
          return { iconId: i, remark: o }
      }
      return { iconId: i, remark: 'z' }
    }
    static buildHealthRenderer(t, e, r, i) {
      if (i)
        return e > 40 && !r ? 'xyyyyyyyyyyyyyyyyyyy' : 'yyyyyyyyyyyyyyyyyyyy'
      let n = t,
        s = e,
        o = r ? 20 : 40
      s > o && ((n = Math.round((n / s) * o)), (s = o))
      let c = { empty: 'a', half: 'b', full: 'c', padding: 'y' },
        h = Math.ceil(Math.max(s, 0) / 2),
        g = Math.max(0, n),
        y = Math.floor(g / 2),
        I = g % 2,
        S = Math.max(0, h - y - I),
        b = c.full.repeat(y) + c.half.repeat(I) + c.empty.repeat(S)
      return (
        b.length < 20 && (b += c.padding.repeat(20 - b.length)),
        b.substring(0, 20) || 'yyyyyyyyyyyyyyyyyyyy'
      )
    }
    static buildArmorRenderer(t) {
      let e = t.getComponent(z.Equippable)
      if (!e) return 'dddddddddd'
      let r = Me,
        i = [Nt.Head, Nt.Chest, Nt.Legs, Nt.Feet].reduce((g, y) => {
          let I = e.getEquipment(y)
          return g + (r[I?.typeId ?? ''] ?? 0)
        }, 0),
        n = { empty: 'd', half: 'e', full: 'f' },
        s = Math.floor(i / 2),
        o = i % 2,
        c = Math.max(0, Math.ceil(20 / 2) - s - o),
        h = n.full.repeat(s) + n.half.repeat(o) + n.empty.repeat(c)
      return (
        h.length < 10 && (h += n.empty.repeat(10 - h.length)),
        h.substring(0, 10) || 'dddddddddd'
      )
    }
    static buildEffectsRenderer(t, e, r) {
      let i = 0,
        n = [],
        s = '',
        o = W(r.entityEffectsVisibility, e.isSneaking)
      for (let c of Er) {
        let h
        try {
          h = o ? t.getEffect(c.name) : void 0
        } catch {
          h = void 0
        }
        ;(h?.duration === -1 || h?.amplifier === -1) && (h = void 0)
        let g = h?.duration ?? 0,
          y = h?.amplifier ?? 0,
          I = h?.typeId
        ;(i >= ne ? ((g = 0), (y = 0)) : I && (y = Math.min(y + 1, 9)),
          I && (i++, g > 0 && n.push(I)))
        let S = Math.floor(g / Pe),
          b = Math.min(99, Math.floor(S / 60)),
          P = Math.floor(S % 60),
          O = `${b.toString().padStart(2, '0')}:${P.toString().padStart(2, '0')}`
        s += `d${O}p${Math.max(0, y).toString().padStart(1, '0')}`
      }
      return { effectString: s, effectsResolvedArray: n }
    }
  }
var Tr = 'zz,z;zz,z:',
  Ar = ':zz,z;zz,z:',
  Cr = 'yyyyyyyyyyyyyyyyyyyy',
  xr = 'yxyyyyyyyyyyyyyyyyyy',
  Mr = 'dddddddddd',
  zt = class {
    constructor() {
      a(this, 'log', L.get('LookPipeline'))
    }
    assess(t, e, r) {
      if (!e.type || !e.hitIdentifier || e.hitIdentifier === '__r4ui:none')
        return { hasTarget: !1 }
      if (e.type === 'entity') {
        let i = this.buildEntityContext(t, e, r)
        if (!i) return { hasTarget: !1 }
        let n = {
          hit: i.hitIdentifier,
          sneaking: t.isSneaking,
          name: i.displayName,
          tagIcons: i.renderData.tagIcons,
          healthRenderer: i.renderData.healthRenderer,
          armorRenderer: i.renderData.armorRenderer,
          health: `${i.renderData.hp}/${i.renderData.maxHp}`,
          effects: i.renderData.effectsRenderer.effectString,
          itemContext: i.itemContextIdentifier ?? '',
        }
        return { hasTarget: !0, signature: JSON.stringify(n), context: i }
      }
      if (e.type === 'tile') {
        let i = this.buildBlockContext(t, e, r)
        if (!i) return { hasTarget: !1 }
        let n = {
          hit: e.hitIdentifier,
          sneaking: t.isSneaking,
          name: i.displayName,
          toolIcons: i.renderData.toolIcons,
          blockStates: i.extendedInfoActive
            ? (i.renderData.blockStates ?? '')
            : '',
          inventory: i.inventorySignature,
          overflow: i.renderData.inventoryOverflow ?? 0,
          frameItem: i.itemInsideFrameTranslationKey ?? '',
        }
        return { hasTarget: !0, signature: JSON.stringify(n), context: i }
      }
      return { hasTarget: !1 }
    }
    finalize(t) {
      return t.type === 'entity'
        ? this.finalizeEntity(t)
        : this.finalizeBlock(t)
    }
    buildEntityContext(t, e, r) {
      let { entity: i } = e
      if (!i || !i.isValid) return
      let n = lt.createRenderData(i, t, i.typeId === 'minecraft:player', r),
        s = t.isSneaking,
        o = W(r.entityTagsVisibility, s),
        c = W(r.entityHealthVisibility, s)
      ;(o || (n.tagIcons = Ar),
        c ||
          ((n.healthRenderer = Cr),
          (n.armorRenderer = Mr),
          (n.hp = 0),
          (n.maxHp = 0)),
        n.maxHp > 0 &&
          r.alwaysDisplayEntityIntHealth &&
          ((n.healthRenderer = xr), (n.intHealthDisplay = !0)))
      let h = i.localizationKey,
        g,
        y,
        I,
        S = i.nameTag
      if (S && S.length > 0) ((h = S), (g = i.localizationKey))
      else if (i.typeId === 'minecraft:item') {
        let P = e
        P.itemStack && ((y = P.itemStack.typeId), (I = P.itemStack.clone()))
      }
      let b = this.resolveNamespace(e.hitIdentifier)
      return {
        type: 'entity',
        hitIdentifier: i.typeId,
        namespace: b,
        displayName: h,
        entity: i,
        renderData: n,
        nameTagContextTranslationKey: g,
        itemContextIdentifier: y,
        itemStack: I,
        isPlayer: i.typeId === 'minecraft:player',
      }
    }
    buildBlockContext(t, e, r) {
      let i = e.block
      if (!i) return
      let n = t.isSneaking,
        s = W(r.containerInventoryVisibility, n),
        o
      try {
        o = ct.createRenderData(i, t, { includeInventory: s })
      } catch ($) {
        this.log.warn(`Failed to build block render data for ${i.typeId}: ${$}`)
        return
      }
      ;(s || ((o.inventory = void 0), (o.inventoryOverflow = 0)),
        W(r.effectiveToolVisibility, n) || (o.toolIcons = Tr))
      let h = i.typeId,
        g = this.resolveNamespace(e.hitIdentifier),
        y = Zt[h.replace(/.*:/g, '')],
        I = y ? `${y}.name` : i.localizationKey,
        S = W(r.blockStatesVisibility, n),
        b = !!(o.blockStates && S),
        P = this.resolveFrameItemKey(h, e.hitIdentifier),
        O = s ? this.encodeInventory(o.inventory) : ''
      return {
        type: 'tile',
        hitIdentifier: e.hitIdentifier,
        namespace: g,
        displayName: I,
        block: i,
        blockTypeId: h,
        renderData: o,
        inventorySignature: O,
        extendedInfoActive: b,
        itemInsideFrameTranslationKey: P,
      }
    }
    finalizeEntity(t) {
      let e = {
          type: 'entity',
          hitIdentifier: t.entity.typeId,
          namespace: t.namespace,
          displayName: t.displayName,
          renderData: t.renderData,
          ...(t.nameTagContextTranslationKey && {
            nameTagContextTranslationKey: t.nameTagContextTranslationKey,
          }),
          ...(t.itemContextIdentifier && {
            itemContextIdentifier: t.itemContextIdentifier,
          }),
        },
        r = []
      return (
        t.itemStack && r.push(K.createPrimaryIconRequest(t.itemStack)),
        { metadata: e, iconRequests: r, extendedInfoActive: !1 }
      )
    }
    finalizeBlock(t) {
      let e = {
          type: 'tile',
          hitIdentifier: t.blockTypeId,
          namespace: t.namespace,
          displayName: t.displayName,
          renderData: t.renderData,
          ...(t.itemInsideFrameTranslationKey && {
            itemInsideFrameTranslationKey: t.itemInsideFrameTranslationKey,
          }),
        },
        r = [K.createPrimaryIconRequest(t.block)]
      return (
        t.renderData.inventory &&
          r.push(...K.createInventoryRequests(t.renderData.inventory)),
        {
          metadata: e,
          iconRequests: r,
          extendedInfoActive: t.extendedInfoActive,
        }
      )
    }
    resolveNamespace(t) {
      return t.includes(':') ? t.substring(0, t.indexOf(':') + 1) : 'minecraft:'
    }
    resolveFrameItemKey(t, e) {
      if (!Xt.includes(t) || Xt.includes(e)) return
      let r = e.replace(/.*:/g, ''),
        i = Zt[r]
      if (i) return `${i}.name`
      try {
        return new Ir(e).localizationKey
      } catch {
        return
      }
    }
    encodeInventory(t) {
      return !t || t.length === 0
        ? ''
        : t
            .map((e) => {
              let r = e.item?.typeId ?? 'minecraft:air',
                i = e.item?.amount ?? 0
              return `${e.slot}:${r}:${i}`
            })
            .join('|')
    }
  }
import { LocationOutOfWorldBoundariesError as Rr } from '@minecraft/server'
var Oe = [
  'minecraft:air',
  'minecraft:bubble_column',
  'minecraft:end_portal',
  'minecraft:portal',
  'minecraft:unknown',
]
var Wt = class {
  constructor() {
    a(this, 'log', L.get('LookScanner'))
  }
  scan(t, e) {
    try {
      let r = t.getEntitiesFromViewDirection({ maxDistance: e })
      if (r.length > 0 && r[0]?.entity) return lt.createLookupData(r[0].entity)
      let i = t.getBlockFromViewDirection({
        includeLiquidBlocks: !t.isInWater,
        includePassableBlocks: !t.isInWater,
        maxDistance: e,
      })
      return i?.block && !Oe.some((n) => n.includes(i.block.typeId))
        ? ct.createLookupData(i.block)
        : { type: void 0, hitIdentifier: '__r4ui:none' }
    } catch (r) {
      return (
        r instanceof Rr ||
          this.log.error(`Error while scanning look target: ${r}`),
        { type: void 0, hitIdentifier: '__r4ui:none' }
      )
    }
  }
}
import { TicksPerSecond as Or, system as ae } from '@minecraft/server'
var Le = [
  {
    token: '__r4ui:inv.furnace__',
    match: [
      'minecraft:lit_blast_furnace',
      'minecraft:lit_furnace',
      'minecraft:lit_smoker',
      'minecraft:furnace',
      'minecraft:blast_furnace',
      'minecraft:smoker',
    ],
  },
  { token: '__r4ui:inv.brewstand__', match: ['minecraft:brewing_stand'] },
  {
    token: '__r4ui:inv.chest__',
    match: [
      'minecraft:chest',
      'minecraft:barrel',
      'minecraft:shulker_box',
      'minecraft:undyed_shulker_box',
      'minecraft:white_shulker_box',
      'minecraft:orange_shulker_box',
      'minecraft:magenta_shulker_box',
      'minecraft:light_blue_shulker_box',
      'minecraft:yellow_shulker_box',
      'minecraft:lime_shulker_box',
      'minecraft:pink_shulker_box',
      'minecraft:gray_shulker_box',
      'minecraft:light_gray_shulker_box',
      'minecraft:cyan_shulker_box',
      'minecraft:purple_shulker_box',
      'minecraft:blue_shulker_box',
      'minecraft:brown_shulker_box',
      'minecraft:green_shulker_box',
      'minecraft:red_shulker_box',
      'minecraft:black_shulker_box',
      'minecraft:exposed_copper_chest',
      'minecraft:exposed_copper_chest',
      'minecraft:weathered_copper_chest',
      'minecraft:weathered_copper_chest',
      'minecraft:oxidized_copper_chest',
      'minecraft:oxidized_copper_chest',
      'minecraft:waxed_copper_chest',
      'minecraft:waxed_copper_chest',
      'minecraft:waxed_exposed_copper_chest',
      'minecraft:waxed_exposed_copper_chest',
      'minecraft:waxed_weathered_copper_chest',
      'minecraft:waxed_weathered_copper_chest',
      'minecraft:waxed_oxidized_copper_chest',
    ],
  },
  {
    token: '__r4ui:inv.dropper__',
    match: ['minecraft:dispenser', 'minecraft:dropper'],
  },
  { token: '__r4ui:inv.hopper__', match: ['minecraft:hopper'] },
]
var Bt = class u {
  static build(t, e, r, i) {
    let n = []
    e.type === 'entity' &&
      !e.itemContextIdentifier &&
      n.push({ text: e.renderData.entityId || '' })
    let s = t.isSneaking,
      o =
        e.type === 'tile' || (e.type === 'entity' && !!e.itemContextIdentifier),
      c = e.type === 'tile' && W(r.containerInventoryVisibility, s),
      h = o ? 'A' : 'B',
      g = '',
      y = '',
      I = '',
      S = 0
    if (o)
      if (e.type === 'tile') {
        let w = e.renderData
        ;((y = w.toolIcons), c && (S = w.inventoryOverflow ?? 0))
      } else y = 'zz,z;zz,z:'
    else {
      let w = e.renderData
      ;((g = `${w.healthRenderer}${w.armorRenderer}`),
        (y = w.tagIcons),
        (I = `${w.effectsRenderer.effectString}e${w.effectsRenderer.effectsResolvedArray.length.toString().padStart(2, '0')}`))
    }
    let b = []
    ;(e.hitIdentifier === 'minecraft:player' &&
      b.push({ text: '__r4ui:humanoid.' }),
      e.nameTagContextTranslationKey && e.hitIdentifier !== 'minecraft:player'
        ? (b.push({ text: `${e.displayName} \xA77(` }),
          b.push({ translate: e.nameTagContextTranslationKey }),
          b.push({ text: ')\xA7r' }))
        : b.push({ translate: e.displayName }),
      e.itemInsideFrameTranslationKey &&
        (b.push({
          text: `
\xA77[`,
        }),
        b.push({ translate: e.itemInsideFrameTranslationKey }),
        b.push({ text: ']\xA7r' })),
      b.push({ text: '\xA7r' }))
    let P = e.type === 'tile' && i ? (e.renderData.blockStates ?? '') : '',
      O =
        e.type === 'entity' && e.itemContextIdentifier
          ? `
\xA77${e.itemContextIdentifier}\xA7r`
          : '',
      $ = '',
      x = ''
    if (e.type === 'entity') {
      let w = e.renderData
      if (w.maxHp > 0 && w.intHealthDisplay) {
        let We = Math.round((w.hp / w.maxHp) * 100)
        $ = `
\xA77 ${w.maxHp < 1e6 ? `\uE10C ${w.hp}/${w.maxHp} (${We}%)` : '\uE10C \u221E'}\xA7r`
      }
      ;(w.maxHp > 0 &&
        w.maxHp <= 40 &&
        !w.intHealthDisplay &&
        (x += `
`),
        w.maxHp > 20 &&
          w.maxHp <= 40 &&
          !w.intHealthDisplay &&
          (x += `
`),
        w.maxHp > 40 &&
          !w.intHealthDisplay &&
          ($ = `
\xA77 ${w.maxHp < 1e6 ? `${w.hp}/${w.maxHp} (${Math.round((w.hp / w.maxHp) * 100)}%)` : '\u221E'}\xA7r`))
      let T = w.effectsRenderer.effectsResolvedArray.length,
        le = Math.ceil(ne / 2)
      ;(T > 0 && T <= le
        ? (x += `

`.repeat(T))
        : T > le &&
          (x +=
            !w.intHealthDisplay && w.maxHp > 40
              ? `
`
              : `

`),
        w.armorRenderer !== 'dddddddddd' &&
          (x += `
`))
    }
    let Ft = W(r.packAuthorVisibility, s),
      ze = u.resolveNamespaceText(e.namespace, Ft),
      gt = [
        { text: `_r4ui:${h}:` },
        { text: g },
        { text: y },
        { text: I },
        ...b,
        { text: O },
        { text: $ },
        { text: x },
        {
          text: `
\xA79\xA7o`,
        },
        { translate: ze },
        { text: '\xA7r' },
      ],
      oe = se(r.displayPosition, 'top_middle'),
      ce = oe
    if (
      (s && (ce = se(r.displayPositionWhenSneaking, oe)),
      i &&
        P.length > 0 &&
        (n.push({ text: '__r4ui:block_states__' }), n.push({ text: P })),
      c && e.type === 'tile' && S > 0)
    ) {
      let w = Math.min(99, Math.max(0, S))
      gt.push({ text: `__r4ui:inv.size_${w}__` })
    }
    if (
      (gt.push({ text: `__r4ui:anchor.${ce}__` }),
      c && e.type === 'tile' && e.renderData.inventory)
    )
      for (let w of u.collectInventoryTokens(e.hitIdentifier))
        gt.push({ text: w })
    return {
      title: gt.filter(
        (w) => !(typeof w == 'object' && 'text' in w && w.text === ''),
      ),
      subtitle: n,
    }
  }
  static collectInventoryTokens(t) {
    let e = Le,
      r = []
    for (let i of e) i.match.some((n) => n === t) && r.push(i.token)
    return r
  }
  static resolveNamespaceText(t, e) {
    let r = It[t.replace(':', '')]
    return r
      ? e && r.creator
        ? `${r.name}
by ${r.creator}`
        : r.name
      : t.length > 3
        ? t.replace(/_/g, ' ').replace(':', '').toTitle().abrevCaps()
        : t.replace(':', '').toUpperCase()
  }
}
var $t = class {
  constructor() {
    a(this, 'log', L.get('UIController'))
  }
  present(t, e, r) {
    try {
      let o =
        e.metadata.type === 'tile' &&
        W(r.containerInventoryVisibility, t.isSneaking) &&
        e.iconRequests.some((c) => c.slot >= 9 && c.slot <= 35 && c.slot !== 17)
      K.apply(t, e.iconRequests, o)
    } catch (s) {
      this.log.warn(`Failed applying inventory mirror: ${s}`)
    }
    let { title: i, subtitle: n } = Bt.build(
      t,
      e.metadata,
      r,
      e.extendedInfoActive,
    )
    ;(this.scheduleTitleUpdate(t, i, {
      subtitle: n,
      fadeInDuration: 0,
      fadeOutDuration: 0,
      stayDuration: Or * 60,
    }),
      ae.runTimeout(() => {
        try {
          K.restore(t)
        } catch (s) {
          this.log.warn(`Failed restoring inventory mirror: ${s}`)
        }
      }, 2))
  }
  clear(t) {
    let e = { fadeInDuration: 0, fadeOutDuration: 0, stayDuration: 0 }
    ;(this.scheduleTitleUpdate(t, ' ', e),
      ae.run(() => {
        t.runCommand('title @s reset')
      }),
      K.restore(t))
  }
  scheduleTitleUpdate(t, e, r) {
    let i = Array.isArray(e) ? { rawtext: e } : e,
      n = (() => {
        if (r?.subtitle)
          return Array.isArray(r.subtitle)
            ? { rawtext: r.subtitle }
            : r.subtitle
      })(),
      s = {
        fadeInDuration: r?.fadeInDuration ?? 0,
        fadeOutDuration: r?.fadeOutDuration ?? 0,
        stayDuration: r?.stayDuration ?? 0,
        ...(n !== void 0 && { subtitle: n }),
      }
    ;(this.log.debug(i, n),
      ae.run(() => {
        t.isValid && t.onScreenDisplay.setTitle(i, s)
      }))
  }
}
var it = class it {
  constructor() {
    a(this, 'log', L.get('Main'))
    a(this, 'signatureStore', new xt())
    a(this, 'lookScanner', new Wt())
    a(this, 'lookPipeline', new zt())
    a(this, 'uiController', new $t())
    a(this, 'playerHasTarget', new Map())
    a(this, 'pauseManager')
    ;((this.pauseManager = new Ct((t) => this.handleExternalClear(t))),
      this.pauseManager.initialize(),
      Yt(() => {
        ;((Lr.gameRules.showTags = !1),
          new fe((e) => {
            let r = D.get(e, 'isEnabled')
            ;(r === void 0 || r === !0) && this.processPlayer(e)
          }, 3).start())
      }))
  }
  static getInstance() {
    return (it.instance || (it.instance = new it()), it.instance)
  }
  processPlayer(t) {
    if (
      (this.pauseManager.checkPlayerInventoryOpen(t),
      this.pauseManager.isPaused(t))
    )
      return
    let e = D.getAllTyped(t),
      r = this.lookScanner.scan(t, D.DEFAULT_VIEW_DISTANCE),
      i = this.lookPipeline.assess(t, r, e)
    if (
      (this.updateTargetState(t, i), !i.hasTarget || !i.signature || !i.context)
    ) {
      this.signatureStore.clear(t)
      return
    }
    if (this.signatureStore.isDuplicate(t, i.signature)) return
    let n = this.lookPipeline.finalize(i.context)
    this.uiController.present(t, n, e)
  }
  updateTargetState(t, e) {
    let r = t.id,
      i = this.playerHasTarget.get(r) ?? !1,
      n = e.hasTarget
    ;(!n && i && this.handleExternalClear(t), this.playerHasTarget.set(r, n))
  }
  handleExternalClear(t) {
    ;(this.uiController.clear(t),
      this.signatureStore.clear(t),
      this.playerHasTarget.set(t.id, !1))
  }
  clearUI(t) {
    this.handleExternalClear(t)
  }
  isPaused(t) {
    return this.pauseManager.isPaused(t)
  }
}
a(it, 'instance')
var ut = it
ut.getInstance()
var D = class {
  static keys() {
    return (this.ensureInitialized(), this.settingRegistry.map((t) => t.key))
  }
  static entries() {
    return (
      this.ensureInitialized(),
      this.settingRegistry.map((t) => [t.key, t.definition])
    )
  }
  static get(t, e) {
    this.ensureInitialized()
    let r = this.settingsMap.get(e)
    if (!r) throw new Error(`Unknown WAILA setting: ${e}`)
    let i = r.definition,
      n = t.getDynamicProperty(this.propertyKey(e))
    if (n == null) return i.default
    switch (i.type) {
      case 'boolean':
        return typeof n == 'boolean' ? n : i.default
      case 'number':
        return typeof n == 'number' ? n : i.default
      case 'string':
        return typeof n == 'string' ? n : i.default
      case 'enum':
        return this.normalizeEnumStoredValue(i, n)
    }
  }
  static getAll(t) {
    let e = {}
    for (let [r] of this.entries()) e[r] = this.get(t, r)
    return e
  }
  static getAllTyped(t) {
    return {
      isEnabled: this.get(t, 'isEnabled'),
      displayPosition: this.get(t, 'displayPosition'),
      displayPositionWhenSneaking: this.get(t, 'displayPositionWhenSneaking'),
      blockStatesVisibility: this.get(t, 'blockStatesVisibility'),
      effectiveToolVisibility: this.get(t, 'effectiveToolVisibility'),
      containerInventoryVisibility: this.get(t, 'containerInventoryVisibility'),
      entityTagsVisibility: this.get(t, 'entityTagsVisibility'),
      entityHealthVisibility: this.get(t, 'entityHealthVisibility'),
      alwaysDisplayEntityIntHealth: this.get(t, 'alwaysDisplayEntityIntHealth'),
      entityEffectsVisibility: this.get(t, 'entityEffectsVisibility'),
      packAuthorVisibility: this.get(t, 'packAuthorVisibility'),
    }
  }
  static set(t, e, r) {
    this.ensureInitialized()
    let i = this.settingsMap.get(e)
    if (!i) return !1
    let n = i.definition,
      s = this.normalizeIncomingValue(n, r)
    return s === void 0
      ? !1
      : (t.setDynamicProperty(this.propertyKey(e), s), !0)
  }
  static reset(t, e) {
    this.ensureInitialized()
    let r = this.settingsMap.get(e)
    r && t.setDynamicProperty(this.propertyKey(e), r.definition.default)
  }
  static resetAll(t) {
    this.ensureInitialized()
    for (let e of this.settingRegistry)
      t.setDynamicProperty(this.propertyKey(e.key), e.definition.default)
  }
  static categories() {
    return (
      this.ensureInitialized(),
      this.categoryRegistry
        .slice()
        .sort((t, e) => t.registryOrder - e.registryOrder)
        .map(({ registryOrder: t, ...e }) => ({ ...e }))
    )
  }
  static entriesSorted() {
    return (
      this.ensureInitialized(),
      this.settingRegistry
        .slice()
        .sort((t, e) => t.registryOrder - e.registryOrder)
        .map((t) => [t.key, t.definition])
    )
  }
  static propertyKey(t) {
    return `${this.NAMESPACE}:${t}`
  }
  static registerCategory(t) {
    ;(this.ensureInitialized(), this.addCategory(t))
  }
  static registerSetting(t, e) {
    ;(this.ensureInitialized(), this.addSetting(t, e))
  }
  static ensureInitialized() {
    this.initialized || ((this.initialized = !0), this.seedDefaults())
  }
  static seedDefaults() {
    ;(this.addCategory({
      key: 'general',
      labelKey: 'waila.settings.category.general',
    }),
      this.addCategory({
        key: 'displayContent',
        labelKey: 'waila.settings.category.displayContent',
      }),
      this.addSetting('isEnabled', {
        type: 'boolean',
        labelKey: 'waila.settings.isEnabled.label',
        category: 'general',
        default: !0,
      }),
      this.addSetting('displayPosition', {
        type: 'enum',
        labelKey: 'waila.settings.displayPosition.label',
        category: 'general',
        default: 'top_middle',
        options: this.DISPLAY_POSITION_OPTIONS,
      }),
      this.addSetting('displayPositionWhenSneaking', {
        type: 'enum',
        labelKey: 'waila.settings.displayPositionWhenSneaking.label',
        descriptionKey:
          'waila.settings.displayPositionWhenSneaking.description',
        category: 'general',
        default: 'unchanged',
        options: [
          {
            value: 'unchanged',
            labelKey: 'waila.settings.displayPosition.option.unchanged',
          },
          ...this.DISPLAY_POSITION_OPTIONS,
        ],
      }),
      this.addSetting('blockStatesVisibility', {
        type: 'enum',
        labelKey: 'waila.settings.blockStatesVisibility.label',
        category: 'displayContent',
        default: 'when_sneaking',
        options: this.WHEN_TO_SHOW_OPTIONS,
      }),
      this.addSetting('effectiveToolVisibility', {
        type: 'enum',
        labelKey: 'waila.settings.effectiveToolVisibility.label',
        category: 'displayContent',
        default: 'always',
        options: this.WHEN_TO_SHOW_OPTIONS,
      }),
      this.addSetting('containerInventoryVisibility', {
        type: 'enum',
        labelKey: 'waila.settings.containerInventoryVisibility.label',
        descriptionKey:
          'waila.settings.containerInventoryVisibility.description',
        category: 'displayContent',
        default: 'never',
        options: this.WHEN_TO_SHOW_OPTIONS,
        experimental: {
          enabledValues: ['always', 'when_not_sneaking', 'when_sneaking'],
          confirmTitleKey:
            'waila.settings.experimental.containerInventory.title',
          confirmBodyKey: 'waila.settings.experimental.containerInventory.body',
        },
      }),
      this.addSetting('entityTagsVisibility', {
        type: 'enum',
        labelKey: 'waila.settings.entityTagsVisibility.label',
        category: 'displayContent',
        default: 'always',
        options: this.WHEN_TO_SHOW_OPTIONS,
      }),
      this.addSetting('entityHealthVisibility', {
        type: 'enum',
        labelKey: 'waila.settings.entityHealthVisibility.label',
        category: 'displayContent',
        default: 'always',
        options: this.WHEN_TO_SHOW_OPTIONS,
      }),
      this.addSetting('alwaysDisplayEntityIntHealth', {
        type: 'boolean',
        labelKey: 'waila.settings.alwaysDisplayEntityIntHealth.label',
        descriptionKey:
          'waila.settings.alwaysDisplayEntityIntHealth.description',
        category: 'displayContent',
        default: !1,
      }),
      this.addSetting('entityEffectsVisibility', {
        type: 'enum',
        labelKey: 'waila.settings.entityEffectsVisibility.label',
        category: 'displayContent',
        default: 'when_sneaking',
        options: this.WHEN_TO_SHOW_OPTIONS,
      }),
      this.addSetting('packAuthorVisibility', {
        type: 'enum',
        labelKey: 'waila.settings.packAuthorVisibility.label',
        category: 'displayContent',
        default: 'when_sneaking',
        options: this.WHEN_TO_SHOW_OPTIONS,
      }))
  }
  static addCategory(t) {
    let e = this.categoryRegistry.findIndex((r) => r.key === t.key)
    if (e >= 0) {
      let r = this.categoryRegistry[e]
      this.categoryRegistry[e] = { ...r, ...t, registryOrder: r.registryOrder }
      return
    }
    this.categoryRegistry.push({
      ...t,
      registryOrder: this.categoryRegistry.length,
    })
  }
  static addSetting(t, e) {
    let r = this.settingsMap.get(t)
    if (r) {
      r.definition = this.cloneSetting(e)
      return
    }
    let i = {
      key: t,
      definition: this.cloneSetting(e),
      registryOrder: this.settingRegistry.length,
    }
    ;(this.settingRegistry.push(i), this.settingsMap.set(t, i))
  }
  static cloneSetting(t) {
    if (t.type === 'enum') {
      let e = t
      return { ...e, options: e.options.map((r) => ({ ...r })) }
    }
    return { ...t }
  }
  static normalizeEnumStoredValue(t, e) {
    if (typeof e == 'string') {
      let r = t.options.find((i) => i.value === e)
      if (r) return r.value
    }
    if (typeof e == 'number') {
      let r = t.options.find((n) => n.value === e)
      if (r) return r.value
      let i = t.options[e]
      if (i) return i.value
    }
    return t.default
  }
  static normalizeIncomingValue(t, e) {
    switch (t.type) {
      case 'boolean':
        return typeof e == 'boolean' ? e : void 0
      case 'number':
        return typeof e == 'number' ? e : void 0
      case 'string':
        return typeof e == 'string' ? e : void 0
      case 'enum': {
        if (typeof e == 'number') {
          let r = t.options[e]
          if (r) return r.value
          let i = t.options.find((n) => n.value === e)
          return i ? i.value : void 0
        }
        if (typeof e == 'string') {
          let r = t.options.find((i) => i.value === e)
          return r ? r.value : void 0
        }
        return
      }
      default:
        return
    }
  }
  static isExperimentalEnabled(t, e) {
    return t.experimental
      ? t.experimental.enabledValues.some((r) => r === e)
      : !1
  }
}
;(a(D, 'NAMESPACE', 'r4isen1920_waila'),
  a(D, 'log', L.get('Settings')),
  a(D, 'DEFAULT_VIEW_DISTANCE', 8),
  a(D, 'initialized', !1),
  a(D, 'categoryRegistry', []),
  a(D, 'settingRegistry', []),
  a(D, 'settingsMap', new Map()),
  a(D, 'DISPLAY_POSITION_OPTIONS', [
    {
      value: 'top_left',
      labelKey: 'waila.settings.displayPosition.option.top_left',
    },
    {
      value: 'top_middle',
      labelKey: 'waila.settings.displayPosition.option.top_middle',
    },
    {
      value: 'top_right',
      labelKey: 'waila.settings.displayPosition.option.top_right',
    },
    {
      value: 'left_middle',
      labelKey: 'waila.settings.displayPosition.option.left_middle',
    },
    {
      value: 'center',
      labelKey: 'waila.settings.displayPosition.option.center',
    },
    {
      value: 'right_middle',
      labelKey: 'waila.settings.displayPosition.option.right_middle',
    },
    {
      value: 'bottom_left',
      labelKey: 'waila.settings.displayPosition.option.bottom_left',
    },
    {
      value: 'bottom_middle',
      labelKey: 'waila.settings.displayPosition.option.bottom_middle',
    },
    {
      value: 'bottom_right',
      labelKey: 'waila.settings.displayPosition.option.bottom_right',
    },
  ]),
  a(D, 'WHEN_TO_SHOW_OPTIONS', [
    { value: 'always', labelKey: 'waila.settings.whenToShow.option.always' },
    {
      value: 'when_not_sneaking',
      labelKey: 'waila.settings.whenToShow.option.when_not_sneaking',
    },
    {
      value: 'when_sneaking',
      labelKey: 'waila.settings.whenToShow.option.when_sneaking',
    },
    { value: 'never', labelKey: 'waila.settings.whenToShow.option.never' },
  ]))
var H = class {
  constructor() {
    a(this, 'name', H.NAMESPACE + ':waila')
    a(this, 'description', 'Shows the WAILA options')
    a(this, 'permissionLevel', Ne.Any)
    a(this, 'cheatsRequired', !1)
    a(this, 'optionalParameters', [{ name: 'player', type: Nr.PlayerSelector }])
  }
  run(t, e) {
    let { sourceEntity: r } = t
    return !r || !r.isValid || !(r instanceof zr)
      ? {
          status: ft.Failure,
          message: 'This command can only be run on a player',
        }
      : e && e.length === 0
        ? { status: ft.Failure, message: 'No targets matched the selector.' }
        : e && e.length > 1
          ? {
              status: ft.Failure,
              message:
                'Please select only one player to edit WAILA settings for.',
            }
          : e && e?.[0].id !== r.id && r.commandPermissionLevel < Ne.Admin
            ? {
                status: ft.Failure,
                message:
                  "You do not have permission to edit other players' WAILA settings.",
              }
            : (Wr.run(() => {
                Ut.showUI(r, e?.[0])
              }),
              H.log.info(
                `Displayed to: ${r.name}, editing: ${e?.[0].name ?? 'self'}`,
              ),
              { status: ft.Success, message: `WAILA UI shown for ${r.name}` })
  }
}
;(a(H, 'NAMESPACE', D.NAMESPACE),
  a(H, 'log', L.get('Command')),
  q([Et], H.prototype, 'run', 1),
  (H = q([kt], H)))
var Ut = class {
  static async showUI(t, e) {
    let r = e ?? t
    if (!r?.isValid || !t?.isValid) return
    let i = new $r()
        .title(
          this.str('waila.settings.title' + (t.id !== r.id ? '_for' : ''), r),
        )
        .submitButton(this.str('waila.settings.submit')),
      n = [],
      s = D.entriesSorted(),
      o = D.categories(),
      c = new Map(),
      h = []
    for (let S of s) {
      let [, b] = S
      if (!b.category) {
        h.push(S)
        continue
      }
      let P = c.get(b.category) ?? []
      ;(c.has(b.category) || c.set(b.category, P), P.push(S))
    }
    let g = (S, b) => {
      let P = D.get(r, S)
      switch (b.type) {
        case 'boolean': {
          let O = typeof P == 'boolean' ? P : b.default
          i.toggle(this.str(b.labelKey), { defaultValue: O })
          break
        }
        case 'number': {
          let O = b,
            $ = typeof P == 'number' ? P : O.default
          i.slider(this.str(O.labelKey), O.range[0], O.range[1], {
            valueStep: O.step ?? 1,
            defaultValue: $,
          })
          break
        }
        case 'string': {
          let O = b,
            $ = typeof P == 'string' ? P : O.default
          i.textField(this.str(O.labelKey), O.default, { defaultValue: $ })
          break
        }
        case 'enum': {
          let O = b,
            $ = typeof P == 'string' || typeof P == 'number' ? P : O.default,
            x = O.options.map((Ft) => this.str(Ft.labelKey))
          i.dropdown(this.str(O.labelKey), x, {
            defaultValueIndex: this.getEnumOptionIndex(O, $),
          })
          break
        }
      }
      ;(n.push(S),
        b.descriptionKey && i.label(this.str(b.descriptionKey, '\xA77')))
    }
    if (h.length > 0) for (let [S, b] of h) g(S, b)
    for (let S of o) {
      let b = c.get(S.key)
      if (!(!b || b.length === 0)) {
        ;(i.label(
          this.str(
            S.labelKey,
            `
\xA7l`,
          ),
        ),
          S.descriptionKey && i.label(this.str(S.descriptionKey, '\xA77')),
          i.divider())
        for (let [P, O] of b) g(P, O)
      }
    }
    i.label(
      this.str(
        t.id !== r.id
          ? 'waila.settings.footer.other_player'
          : 'waila.settings.footer.self_adjusting',
        `
`,
        r,
      ),
    )
    let y
    try {
      y = await i.show(t)
    } catch (S) {
      D.log.warn(`Failed to display settings UI: ${S}`)
      return
    }
    if (y.canceled || !y.formValues?.length) {
      t.isValid && t.playSound('note.bass')
      return
    }
    let { changesApplied: I } = await this.handleResponse(
      t,
      r,
      y.formValues ?? [],
      n,
      s,
    )
    I > 0
      ? (t.isValid && t.playSound('note.pling'),
        r.isValid && ut.getInstance().clearUI(r),
        this.notifyPlayers(t, r))
      : t.isValid && t.playSound('note.bass')
  }
  static async handleResponse(t, e, r, i, n) {
    let s = 0,
      o = new Map(n),
      c = 0
    for (let h of i) {
      let g = o.get(h)
      if (!g) continue
      for (; c < r.length && r[c] === void 0;) c++
      if (c >= r.length) break
      let y = r[c]
      c++
      let I = D.normalizeIncomingValue(g, y)
      if (I === void 0) continue
      let S = D.get(e, h)
      this.areValuesEqual(S, I) ||
        (g.experimental &&
          D.isExperimentalEnabled(g, I) &&
          !D.isExperimentalEnabled(g, S) &&
          !(await this.confirmExperimental(t, g, e))) ||
        (D.set(e, h, I) && s++)
    }
    return { changesApplied: s }
  }
  static async confirmExperimental(t, e, r) {
    if (!e.experimental) return !0
    if (!t.isValid) return !1
    let i = new Br()
        .title(this.str(e.experimental.confirmTitleKey, r))
        .body(this.str(e.experimental.confirmBodyKey))
        .button1(this.str('waila.settings.experimental.confirm'))
        .button2(this.str('waila.settings.experimental.cancel')),
      n
    try {
      n = await i.show(t)
    } catch (s) {
      return (
        D.log.warn(`Failed to display experimental confirmation: ${s}`),
        !1
      )
    }
    return n.selection === 0
  }
  static notifyPlayers(t, e) {
    let r = t.id === e.id
    if (e.isValid) {
      let i = r
        ? this.str('waila.settings.feedback.updatedSelf')
        : this.str('waila.settings.feedback.updatedByOther', t)
      e.sendMessage(i)
    }
    !r &&
      t.isValid &&
      t.sendMessage(this.str('waila.settings.feedback.updatedOther', e))
  }
  static areValuesEqual(t, e) {
    return t === e
  }
  static str(t, e, r) {
    return r
      ? { rawtext: [{ text: e }, { translate: t, with: [r.name] }] }
      : typeof e == 'string'
        ? { rawtext: [{ text: e }, { translate: t }] }
        : e
          ? { rawtext: [{ translate: t, with: [e.name] }] }
          : { rawtext: [{ translate: t }] }
  }
  static getEnumOptionIndex(t, e) {
    let r = t.options.findIndex((i) => i.value === e)
    return r >= 0 ? r : 0
  }
}
a(Ut, 'NAMESPACE', D.NAMESPACE)
function W(u, t) {
  switch (u) {
    case 'always':
      return !0
    case 'when_not_sneaking':
      return !t
    case 'when_sneaking':
      return t
    case 'never':
    default:
      return !1
  }
}
function se(u, t) {
  return u === 'unchanged' ? t : u
}
try { _e(); } catch (e) { console.warn("§e[WAILA] Initialization error: " + e); }
/**
 *
 * @author
 * r4isen1920
 * https://mcpedl.com/user/r4isen1920
 *
 * @license
 * MIT License
 *
 */

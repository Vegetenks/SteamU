if (!window.planck) {
  (function(global, factory) {
    typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.planck = {}));
  })(void 0, function(exports2) {
    "use strict";
    /**
     * Planck.js v1.5.0
     * @license The MIT license
     * @copyright Copyright (c) 2026 Erin Catto, Ali Shakiba
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     */
    var extendStatics = function(d2, b2) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d3, b3) {
        d3.__proto__ = b3;
      } || function(d3, b3) {
        for (var p in b3) if (Object.prototype.hasOwnProperty.call(b3, p)) d3[p] = b3[p];
      };
      return extendStatics(d2, b2);
    };
    function __extends(d2, b2) {
      if (typeof b2 !== "function" && b2 !== null) throw new TypeError("Class extends value " + String(b2) + " is not a constructor or null");
      extendStatics(d2, b2);
      function __() {
        this.constructor = d2;
      }
      d2.prototype = b2 === null ? Object.create(b2) : (__.prototype = b2.prototype, new __());
    }
    var __assign = function() {
      __assign = Object.assign || function __assign2(t) {
        for (var s2, i = 1, n2 = arguments.length; i < n2; i++) {
          s2 = arguments[i];
          for (var p in s2) if (Object.prototype.hasOwnProperty.call(s2, p)) t[p] = s2[p];
        }
        return t;
      };
      return __assign.apply(this, arguments);
    };
    typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
      var e3 = new Error(message);
      return e3.name = "SuppressedError", e3.error = error, e3.suppressed = suppressed, e3;
    };
    var options = function(input2, defaults) {
      if (input2 === null || typeof input2 === "undefined") {
        input2 = {};
      }
      var output2 = __assign({}, input2);
      for (var key in defaults) {
        if (defaults.hasOwnProperty(key) && typeof input2[key] === "undefined") {
          output2[key] = defaults[key];
        }
      }
      if (typeof Object.getOwnPropertySymbols === "function") {
        var symbols = Object.getOwnPropertySymbols(defaults);
        for (var i = 0; i < symbols.length; i++) {
          var symbol = symbols[i];
          if (defaults.propertyIsEnumerable(symbol) && typeof input2[symbol] === "undefined") {
            output2[symbol] = defaults[symbol];
          }
        }
      }
      return output2;
    };
    var math_random = Math.random;
    var EPSILON = 1e-9;
    var isFinite = Number.isFinite;
    function nextPowerOfTwo(x2) {
      x2 |= x2 >> 1;
      x2 |= x2 >> 2;
      x2 |= x2 >> 4;
      x2 |= x2 >> 8;
      x2 |= x2 >> 16;
      return x2 + 1;
    }
    function isPowerOfTwo(x2) {
      return x2 > 0 && (x2 & x2 - 1) === 0;
    }
    function mod(num, min, max) {
      if (typeof min === "undefined") {
        max = 1;
        min = 0;
      } else if (typeof max === "undefined") {
        max = min;
        min = 0;
      }
      if (max > min) {
        num = (num - min) % (max - min);
        return num + (num < 0 ? max : min);
      } else {
        num = (num - max) % (min - max);
        return num + (num <= 0 ? min : max);
      }
    }
    function clamp(num, min, max) {
      if (num < min) {
        return min;
      } else if (num > max) {
        return max;
      } else {
        return num;
      }
    }
    function random(min, max) {
      if (typeof min === "undefined") {
        max = 1;
        min = 0;
      } else if (typeof max === "undefined") {
        max = min;
        min = 0;
      }
      return min === max ? min : math_random() * (max - min) + min;
    }
    var math = Object.create(Math);
    math.EPSILON = EPSILON;
    math.isFinite = isFinite;
    math.nextPowerOfTwo = nextPowerOfTwo;
    math.isPowerOfTwo = isPowerOfTwo;
    math.mod = mod;
    math.clamp = clamp;
    math.random = random;
    var math_abs$9 = Math.abs;
    var math_sqrt$5 = Math.sqrt;
    var math_max$8 = Math.max;
    var math_min$8 = Math.min;
    var Vec2 = (function() {
      function Vec22(x2, y) {
        if (!(this instanceof Vec22)) {
          return new Vec22(x2, y);
        }
        if (typeof x2 === "undefined") {
          this.x = 0;
          this.y = 0;
        } else if (typeof x2 === "object") {
          this.x = x2.x;
          this.y = x2.y;
        } else {
          this.x = x2;
          this.y = y;
        }
      }
      Vec22.prototype._serialize = function() {
        return { x: this.x, y: this.y };
      };
      Vec22._deserialize = function(data) {
        var obj = Object.create(Vec22.prototype);
        obj.x = data.x;
        obj.y = data.y;
        return obj;
      };
      Vec22.zero = function() {
        var obj = Object.create(Vec22.prototype);
        obj.x = 0;
        obj.y = 0;
        return obj;
      };
      Vec22.neo = function(x2, y) {
        var obj = Object.create(Vec22.prototype);
        obj.x = x2;
        obj.y = y;
        return obj;
      };
      Vec22.clone = function(v3) {
        return Vec22.neo(v3.x, v3.y);
      };
      Vec22.prototype.toString = function() {
        return JSON.stringify(this);
      };
      Vec22.isValid = function(obj) {
        if (obj === null || typeof obj === "undefined") {
          return false;
        }
        return Number.isFinite(obj.x) && Number.isFinite(obj.y);
      };
      Vec22.assert = function(o) {
      };
      Vec22.prototype.clone = function() {
        return Vec22.clone(this);
      };
      Vec22.prototype.setZero = function() {
        this.x = 0;
        this.y = 0;
        return this;
      };
      Vec22.prototype.set = function(x2, y) {
        if (typeof x2 === "object") {
          this.x = x2.x;
          this.y = x2.y;
        } else {
          this.x = x2;
          this.y = y;
        }
        return this;
      };
      Vec22.prototype.setNum = function(x2, y) {
        this.x = x2;
        this.y = y;
        return this;
      };
      Vec22.prototype.setVec2 = function(value) {
        this.x = value.x;
        this.y = value.y;
        return this;
      };
      Vec22.prototype.wSet = function(a2, v3, b2, w) {
        if (typeof b2 !== "undefined" || typeof w !== "undefined") {
          return this.setCombine(a2, v3, b2, w);
        } else {
          return this.setMul(a2, v3);
        }
      };
      Vec22.prototype.setCombine = function(a2, v3, b2, w) {
        var x2 = a2 * v3.x + b2 * w.x;
        var y = a2 * v3.y + b2 * w.y;
        this.x = x2;
        this.y = y;
        return this;
      };
      Vec22.prototype.setMul = function(a2, v3) {
        var x2 = a2 * v3.x;
        var y = a2 * v3.y;
        this.x = x2;
        this.y = y;
        return this;
      };
      Vec22.prototype.add = function(w) {
        this.x += w.x;
        this.y += w.y;
        return this;
      };
      Vec22.prototype.wAdd = function(a2, v3, b2, w) {
        if (typeof b2 !== "undefined" || typeof w !== "undefined") {
          return this.addCombine(a2, v3, b2, w);
        } else {
          return this.addMul(a2, v3);
        }
      };
      Vec22.prototype.addCombine = function(a2, v3, b2, w) {
        var x2 = a2 * v3.x + b2 * w.x;
        var y = a2 * v3.y + b2 * w.y;
        this.x += x2;
        this.y += y;
        return this;
      };
      Vec22.prototype.addMul = function(a2, v3) {
        var x2 = a2 * v3.x;
        var y = a2 * v3.y;
        this.x += x2;
        this.y += y;
        return this;
      };
      Vec22.prototype.wSub = function(a2, v3, b2, w) {
        if (typeof b2 !== "undefined" || typeof w !== "undefined") {
          return this.subCombine(a2, v3, b2, w);
        } else {
          return this.subMul(a2, v3);
        }
      };
      Vec22.prototype.subCombine = function(a2, v3, b2, w) {
        var x2 = a2 * v3.x + b2 * w.x;
        var y = a2 * v3.y + b2 * w.y;
        this.x -= x2;
        this.y -= y;
        return this;
      };
      Vec22.prototype.subMul = function(a2, v3) {
        var x2 = a2 * v3.x;
        var y = a2 * v3.y;
        this.x -= x2;
        this.y -= y;
        return this;
      };
      Vec22.prototype.sub = function(w) {
        this.x -= w.x;
        this.y -= w.y;
        return this;
      };
      Vec22.prototype.mul = function(m) {
        this.x *= m;
        this.y *= m;
        return this;
      };
      Vec22.prototype.length = function() {
        return Vec22.lengthOf(this);
      };
      Vec22.prototype.lengthSquared = function() {
        return Vec22.lengthSquared(this);
      };
      Vec22.prototype.normalize = function() {
        var length = this.length();
        if (length < EPSILON) {
          return 0;
        }
        var invLength = 1 / length;
        this.x *= invLength;
        this.y *= invLength;
        return length;
      };
      Vec22.normalize = function(v3) {
        var length = Vec22.lengthOf(v3);
        if (length < EPSILON) {
          return Vec22.zero();
        }
        var invLength = 1 / length;
        return Vec22.neo(v3.x * invLength, v3.y * invLength);
      };
      Vec22.lengthOf = function(v3) {
        return math_sqrt$5(v3.x * v3.x + v3.y * v3.y);
      };
      Vec22.lengthSquared = function(v3) {
        return v3.x * v3.x + v3.y * v3.y;
      };
      Vec22.distance = function(v3, w) {
        var dx = v3.x - w.x;
        var dy = v3.y - w.y;
        return math_sqrt$5(dx * dx + dy * dy);
      };
      Vec22.distanceSquared = function(v3, w) {
        var dx = v3.x - w.x;
        var dy = v3.y - w.y;
        return dx * dx + dy * dy;
      };
      Vec22.areEqual = function(v3, w) {
        return v3 === w || typeof w === "object" && w !== null && v3.x === w.x && v3.y === w.y;
      };
      Vec22.skew = function(v3) {
        return Vec22.neo(-v3.y, v3.x);
      };
      Vec22.dot = function(v3, w) {
        return v3.x * w.x + v3.y * w.y;
      };
      Vec22.cross = function(v3, w) {
        if (typeof w === "number") {
          return Vec22.neo(w * v3.y, -w * v3.x);
        } else if (typeof v3 === "number") {
          return Vec22.neo(-v3 * w.y, v3 * w.x);
        } else {
          return v3.x * w.y - v3.y * w.x;
        }
      };
      Vec22.crossVec2Vec2 = function(v3, w) {
        return v3.x * w.y - v3.y * w.x;
      };
      Vec22.crossVec2Num = function(v3, w) {
        return Vec22.neo(w * v3.y, -w * v3.x);
      };
      Vec22.crossNumVec2 = function(v3, w) {
        return Vec22.neo(-v3 * w.y, v3 * w.x);
      };
      Vec22.addCross = function(a2, v3, w) {
        if (typeof w === "number") {
          return Vec22.neo(w * v3.y + a2.x, -w * v3.x + a2.y);
        } else if (typeof v3 === "number") {
          return Vec22.neo(-v3 * w.y + a2.x, v3 * w.x + a2.y);
        }
      };
      Vec22.addCrossVec2Num = function(a2, v3, w) {
        return Vec22.neo(w * v3.y + a2.x, -w * v3.x + a2.y);
      };
      Vec22.addCrossNumVec2 = function(a2, v3, w) {
        return Vec22.neo(-v3 * w.y + a2.x, v3 * w.x + a2.y);
      };
      Vec22.add = function(v3, w) {
        return Vec22.neo(v3.x + w.x, v3.y + w.y);
      };
      Vec22.wAdd = function(a2, v3, b2, w) {
        if (typeof b2 !== "undefined" || typeof w !== "undefined") {
          return Vec22.combine(a2, v3, b2, w);
        } else {
          return Vec22.mulNumVec2(a2, v3);
        }
      };
      Vec22.combine = function(a2, v3, b2, w) {
        return Vec22.zero().setCombine(a2, v3, b2, w);
      };
      Vec22.sub = function(v3, w) {
        return Vec22.neo(v3.x - w.x, v3.y - w.y);
      };
      Vec22.mul = function(a2, b2) {
        if (typeof a2 === "object") {
          return Vec22.neo(a2.x * b2, a2.y * b2);
        } else if (typeof b2 === "object") {
          return Vec22.neo(a2 * b2.x, a2 * b2.y);
        }
      };
      Vec22.mulVec2Num = function(a2, b2) {
        return Vec22.neo(a2.x * b2, a2.y * b2);
      };
      Vec22.mulNumVec2 = function(a2, b2) {
        return Vec22.neo(a2 * b2.x, a2 * b2.y);
      };
      Vec22.prototype.neg = function() {
        this.x = -this.x;
        this.y = -this.y;
        return this;
      };
      Vec22.neg = function(v3) {
        return Vec22.neo(-v3.x, -v3.y);
      };
      Vec22.abs = function(v3) {
        return Vec22.neo(math_abs$9(v3.x), math_abs$9(v3.y));
      };
      Vec22.mid = function(v3, w) {
        return Vec22.neo((v3.x + w.x) * 0.5, (v3.y + w.y) * 0.5);
      };
      Vec22.upper = function(v3, w) {
        return Vec22.neo(math_max$8(v3.x, w.x), math_max$8(v3.y, w.y));
      };
      Vec22.lower = function(v3, w) {
        return Vec22.neo(math_min$8(v3.x, w.x), math_min$8(v3.y, w.y));
      };
      Vec22.prototype.clamp = function(max) {
        var lengthSqr = this.x * this.x + this.y * this.y;
        if (lengthSqr > max * max) {
          var scale = max / math_sqrt$5(lengthSqr);
          this.x *= scale;
          this.y *= scale;
        }
        return this;
      };
      Vec22.clamp = function(v3, max) {
        var r = Vec22.neo(v3.x, v3.y);
        r.clamp(max);
        return r;
      };
      Vec22.clampVec2 = function(v3, min, max) {
        return { x: clamp(v3.x, min === null || min === void 0 ? void 0 : min.x, max === null || max === void 0 ? void 0 : max.x), y: clamp(v3.y, min === null || min === void 0 ? void 0 : min.y, max === null || max === void 0 ? void 0 : max.y) };
      };
      Vec22.scaleFn = function(x2, y) {
        return function(v3) {
          return Vec22.neo(v3.x * x2, v3.y * y);
        };
      };
      Vec22.translateFn = function(x2, y) {
        return function(v3) {
          return Vec22.neo(v3.x + x2, v3.y + y);
        };
      };
      return Vec22;
    })();
    var math_max$7 = Math.max;
    var math_min$7 = Math.min;
    var AABB = (function() {
      function AABB2(lower, upper) {
        if (!(this instanceof AABB2)) {
          return new AABB2(lower, upper);
        }
        this.lowerBound = Vec2.zero();
        this.upperBound = Vec2.zero();
        if (typeof lower === "object") {
          this.lowerBound.setVec2(lower);
        }
        if (typeof upper === "object") {
          this.upperBound.setVec2(upper);
        } else if (typeof lower === "object") {
          this.upperBound.setVec2(lower);
        }
      }
      AABB2.prototype.isValid = function() {
        return AABB2.isValid(this);
      };
      AABB2.isValid = function(obj) {
        if (obj === null || typeof obj === "undefined") {
          return false;
        }
        return Vec2.isValid(obj.lowerBound) && Vec2.isValid(obj.upperBound) && Vec2.sub(obj.upperBound, obj.lowerBound).lengthSquared() >= 0;
      };
      AABB2.assert = function(o) {
      };
      AABB2.prototype.getCenter = function() {
        return Vec2.neo((this.lowerBound.x + this.upperBound.x) * 0.5, (this.lowerBound.y + this.upperBound.y) * 0.5);
      };
      AABB2.prototype.getExtents = function() {
        return Vec2.neo((this.upperBound.x - this.lowerBound.x) * 0.5, (this.upperBound.y - this.lowerBound.y) * 0.5);
      };
      AABB2.prototype.getPerimeter = function() {
        return 2 * (this.upperBound.x - this.lowerBound.x + this.upperBound.y - this.lowerBound.y);
      };
      AABB2.prototype.combine = function(a2, b2) {
        b2 = b2 || this;
        var lowerA = a2.lowerBound;
        var upperA = a2.upperBound;
        var lowerB = b2.lowerBound;
        var upperB = b2.upperBound;
        var lowerX = math_min$7(lowerA.x, lowerB.x);
        var lowerY = math_min$7(lowerA.y, lowerB.y);
        var upperX = math_max$7(upperB.x, upperA.x);
        var upperY = math_max$7(upperB.y, upperA.y);
        this.lowerBound.setNum(lowerX, lowerY);
        this.upperBound.setNum(upperX, upperY);
      };
      AABB2.prototype.combinePoints = function(a2, b2) {
        this.lowerBound.setNum(math_min$7(a2.x, b2.x), math_min$7(a2.y, b2.y));
        this.upperBound.setNum(math_max$7(a2.x, b2.x), math_max$7(a2.y, b2.y));
      };
      AABB2.prototype.set = function(aabb) {
        this.lowerBound.setNum(aabb.lowerBound.x, aabb.lowerBound.y);
        this.upperBound.setNum(aabb.upperBound.x, aabb.upperBound.y);
      };
      AABB2.prototype.contains = function(aabb) {
        var result = true;
        result = result && this.lowerBound.x <= aabb.lowerBound.x;
        result = result && this.lowerBound.y <= aabb.lowerBound.y;
        result = result && aabb.upperBound.x <= this.upperBound.x;
        result = result && aabb.upperBound.y <= this.upperBound.y;
        return result;
      };
      AABB2.prototype.extend = function(value) {
        AABB2.extend(this, value);
        return this;
      };
      AABB2.extend = function(out, value) {
        out.lowerBound.x -= value;
        out.lowerBound.y -= value;
        out.upperBound.x += value;
        out.upperBound.y += value;
        return out;
      };
      AABB2.testOverlap = function(a2, b2) {
        var d1x = b2.lowerBound.x - a2.upperBound.x;
        var d2x = a2.lowerBound.x - b2.upperBound.x;
        var d1y = b2.lowerBound.y - a2.upperBound.y;
        var d2y = a2.lowerBound.y - b2.upperBound.y;
        if (d1x > 0 || d1y > 0 || d2x > 0 || d2y > 0) {
          return false;
        }
        return true;
      };
      AABB2.areEqual = function(a2, b2) {
        return Vec2.areEqual(a2.lowerBound, b2.lowerBound) && Vec2.areEqual(a2.upperBound, b2.upperBound);
      };
      AABB2.diff = function(a2, b2) {
        var wD = math_max$7(0, math_min$7(a2.upperBound.x, b2.upperBound.x) - math_max$7(b2.lowerBound.x, a2.lowerBound.x));
        var hD = math_max$7(0, math_min$7(a2.upperBound.y, b2.upperBound.y) - math_max$7(b2.lowerBound.y, a2.lowerBound.y));
        var wA = a2.upperBound.x - a2.lowerBound.x;
        var hA = a2.upperBound.y - a2.lowerBound.y;
        var wB = b2.upperBound.x - b2.lowerBound.x;
        var hB = b2.upperBound.y - b2.lowerBound.y;
        return wA * hA + wB * hB - wD * hD;
      };
      AABB2.prototype.rayCast = function(output2, input2) {
        var tmin = -Infinity;
        var tmax = Infinity;
        var p = input2.p1;
        var d2 = Vec2.sub(input2.p2, input2.p1);
        var absD = Vec2.abs(d2);
        var normal3 = Vec2.zero();
        {
          if (absD.x < EPSILON) {
            if (p.x < this.lowerBound.x || this.upperBound.x < p.x) {
              return false;
            }
          } else {
            var inv_d = 1 / d2.x;
            var t1 = (this.lowerBound.x - p.x) * inv_d;
            var t2 = (this.upperBound.x - p.x) * inv_d;
            var s2 = -1;
            if (t1 > t2) {
              var temp3 = t1;
              t1 = t2;
              t2 = temp3;
              s2 = 1;
            }
            if (t1 > tmin) {
              normal3.setZero();
              normal3.x = s2;
              tmin = t1;
            }
            tmax = math_min$7(tmax, t2);
            if (tmin > tmax) {
              return false;
            }
          }
        }
        {
          if (absD.y < EPSILON) {
            if (p.y < this.lowerBound.y || this.upperBound.y < p.y) {
              return false;
            }
          } else {
            var inv_d = 1 / d2.y;
            var t1 = (this.lowerBound.y - p.y) * inv_d;
            var t2 = (this.upperBound.y - p.y) * inv_d;
            var s2 = -1;
            if (t1 > t2) {
              var temp3 = t1;
              t1 = t2;
              t2 = temp3;
              s2 = 1;
            }
            if (t1 > tmin) {
              normal3.setZero();
              normal3.y = s2;
              tmin = t1;
            }
            tmax = math_min$7(tmax, t2);
            if (tmin > tmax) {
              return false;
            }
          }
        }
        if (tmin < 0 || input2.maxFraction < tmin) {
          return false;
        }
        output2.fraction = tmin;
        output2.normal = normal3;
        return true;
      };
      AABB2.prototype.toString = function() {
        return JSON.stringify(this);
      };
      AABB2.combinePoints = function(out, a2, b2) {
        out.lowerBound.x = math_min$7(a2.x, b2.x);
        out.lowerBound.y = math_min$7(a2.y, b2.y);
        out.upperBound.x = math_max$7(a2.x, b2.x);
        out.upperBound.y = math_max$7(a2.y, b2.y);
        return out;
      };
      AABB2.combinedPerimeter = function(a2, b2) {
        var lx = math_min$7(a2.lowerBound.x, b2.lowerBound.x);
        var ly = math_min$7(a2.lowerBound.y, b2.lowerBound.y);
        var ux = math_max$7(a2.upperBound.x, b2.upperBound.x);
        var uy = math_max$7(a2.upperBound.y, b2.upperBound.y);
        return 2 * (ux - lx + uy - ly);
      };
      return AABB2;
    })();
    var math_PI$6 = Math.PI;
    var Settings = (function() {
      function Settings2() {
      }
      Object.defineProperty(Settings2, "polygonRadius", { get: function() {
        return 2 * Settings2.linearSlop;
      }, enumerable: false, configurable: true });
      Settings2.lengthUnitsPerMeter = 1;
      Settings2.maxManifoldPoints = 2;
      Settings2.maxPolygonVertices = 12;
      Settings2.aabbExtension = 0.1;
      Settings2.aabbMultiplier = 2;
      Settings2.linearSlop = 5e-3;
      Settings2.angularSlop = 2 / 180 * math_PI$6;
      Settings2.maxSubSteps = 8;
      Settings2.maxTOIContacts = 32;
      Settings2.maxTOIIterations = 20;
      Settings2.maxDistanceIterations = 20;
      Settings2.velocityThreshold = 1;
      Settings2.maxLinearCorrection = 0.2;
      Settings2.maxAngularCorrection = 8 / 180 * math_PI$6;
      Settings2.maxTranslation = 2;
      Settings2.maxRotation = 0.5 * math_PI$6;
      Settings2.baumgarte = 0.2;
      Settings2.toiBaugarte = 0.75;
      Settings2.timeToSleep = 0.5;
      Settings2.linearSleepTolerance = 0.01;
      Settings2.angularSleepTolerance = 2 / 180 * math_PI$6;
      return Settings2;
    })();
    var SettingsInternal = (function() {
      function SettingsInternal2() {
      }
      Object.defineProperty(SettingsInternal2, "maxManifoldPoints", { get: function() {
        return Settings.maxManifoldPoints;
      }, enumerable: false, configurable: true });
      Object.defineProperty(SettingsInternal2, "maxPolygonVertices", { get: function() {
        return Settings.maxPolygonVertices;
      }, enumerable: false, configurable: true });
      Object.defineProperty(SettingsInternal2, "aabbExtension", { get: function() {
        return Settings.aabbExtension * Settings.lengthUnitsPerMeter;
      }, enumerable: false, configurable: true });
      Object.defineProperty(SettingsInternal2, "aabbMultiplier", { get: function() {
        return Settings.aabbMultiplier;
      }, enumerable: false, configurable: true });
      Object.defineProperty(SettingsInternal2, "linearSlop", { get: function() {
        return Settings.linearSlop * Settings.lengthUnitsPerMeter;
      }, enumerable: false, configurable: true });
      Object.defineProperty(SettingsInternal2, "linearSlopSquared", { get: function() {
        return Settings.linearSlop * Settings.lengthUnitsPerMeter * Settings.linearSlop * Settings.lengthUnitsPerMeter;
      }, enumerable: false, configurable: true });
      Object.defineProperty(SettingsInternal2, "angularSlop", { get: function() {
        return Settings.angularSlop;
      }, enumerable: false, configurable: true });
      Object.defineProperty(SettingsInternal2, "polygonRadius", { get: function() {
        return 2 * Settings.linearSlop;
      }, enumerable: false, configurable: true });
      Object.defineProperty(SettingsInternal2, "maxSubSteps", { get: function() {
        return Settings.maxSubSteps;
      }, enumerable: false, configurable: true });
      Object.defineProperty(SettingsInternal2, "maxTOIContacts", { get: function() {
        return Settings.maxTOIContacts;
      }, enumerable: false, configurable: true });
      Object.defineProperty(SettingsInternal2, "maxTOIIterations", { get: function() {
        return Settings.maxTOIIterations;
      }, enumerable: false, configurable: true });
      Object.defineProperty(SettingsInternal2, "maxDistanceIterations", { get: function() {
        return Settings.maxDistanceIterations;
      }, enumerable: false, configurable: true });
      Object.defineProperty(SettingsInternal2, "velocityThreshold", { get: function() {
        return Settings.velocityThreshold * Settings.lengthUnitsPerMeter;
      }, enumerable: false, configurable: true });
      Object.defineProperty(SettingsInternal2, "maxLinearCorrection", { get: function() {
        return Settings.maxLinearCorrection * Settings.lengthUnitsPerMeter;
      }, enumerable: false, configurable: true });
      Object.defineProperty(SettingsInternal2, "maxAngularCorrection", { get: function() {
        return Settings.maxAngularCorrection;
      }, enumerable: false, configurable: true });
      Object.defineProperty(SettingsInternal2, "maxTranslation", { get: function() {
        return Settings.maxTranslation * Settings.lengthUnitsPerMeter;
      }, enumerable: false, configurable: true });
      Object.defineProperty(SettingsInternal2, "maxTranslationSquared", { get: function() {
        return Settings.maxTranslation * Settings.lengthUnitsPerMeter * Settings.maxTranslation * Settings.lengthUnitsPerMeter;
      }, enumerable: false, configurable: true });
      Object.defineProperty(SettingsInternal2, "maxRotation", { get: function() {
        return Settings.maxRotation;
      }, enumerable: false, configurable: true });
      Object.defineProperty(SettingsInternal2, "maxRotationSquared", { get: function() {
        return Settings.maxRotation * Settings.maxRotation;
      }, enumerable: false, configurable: true });
      Object.defineProperty(SettingsInternal2, "baumgarte", { get: function() {
        return Settings.baumgarte;
      }, enumerable: false, configurable: true });
      Object.defineProperty(SettingsInternal2, "toiBaugarte", { get: function() {
        return Settings.toiBaugarte;
      }, enumerable: false, configurable: true });
      Object.defineProperty(SettingsInternal2, "timeToSleep", { get: function() {
        return Settings.timeToSleep;
      }, enumerable: false, configurable: true });
      Object.defineProperty(SettingsInternal2, "linearSleepTolerance", { get: function() {
        return Settings.linearSleepTolerance * Settings.lengthUnitsPerMeter;
      }, enumerable: false, configurable: true });
      Object.defineProperty(SettingsInternal2, "linearSleepToleranceSqr", { get: function() {
        return Settings.linearSleepTolerance * Settings.lengthUnitsPerMeter * Settings.linearSleepTolerance * Settings.lengthUnitsPerMeter;
      }, enumerable: false, configurable: true });
      Object.defineProperty(SettingsInternal2, "angularSleepTolerance", { get: function() {
        return Settings.angularSleepTolerance;
      }, enumerable: false, configurable: true });
      Object.defineProperty(SettingsInternal2, "angularSleepToleranceSqr", { get: function() {
        return Settings.angularSleepTolerance * Settings.angularSleepTolerance;
      }, enumerable: false, configurable: true });
      return SettingsInternal2;
    })();
    var Pool = (function() {
      function Pool2(opts) {
        this._list = [];
        this._max = Infinity;
        this._hasCreateFn = false;
        this._createCount = 0;
        this._hasAllocateFn = false;
        this._allocateCount = 0;
        this._hasReleaseFn = false;
        this._releaseCount = 0;
        this._hasDisposeFn = false;
        this._disposeCount = 0;
        this._list = [];
        this._max = opts.max || this._max;
        this._createFn = opts.create;
        this._hasCreateFn = typeof this._createFn === "function";
        this._allocateFn = opts.allocate;
        this._hasAllocateFn = typeof this._allocateFn === "function";
        this._releaseFn = opts.release;
        this._hasReleaseFn = typeof this._releaseFn === "function";
        this._disposeFn = opts.dispose;
        this._hasDisposeFn = typeof this._disposeFn === "function";
      }
      Pool2.prototype.max = function(n2) {
        if (typeof n2 === "number") {
          this._max = n2;
          return this;
        }
        return this._max;
      };
      Pool2.prototype.size = function() {
        return this._list.length;
      };
      Pool2.prototype.allocate = function() {
        var item;
        if (this._list.length > 0) {
          item = this._list.shift();
        } else {
          this._createCount++;
          if (this._hasCreateFn) {
            item = this._createFn();
          } else {
            item = {};
          }
        }
        this._allocateCount++;
        if (this._hasAllocateFn) {
          this._allocateFn(item);
        }
        return item;
      };
      Pool2.prototype.release = function(item) {
        if (this._list.length < this._max) {
          this._releaseCount++;
          if (this._hasReleaseFn) {
            this._releaseFn(item);
          }
          this._list.push(item);
        } else {
          this._disposeCount++;
          if (this._hasDisposeFn) {
            item = this._disposeFn(item);
          }
        }
      };
      Pool2.prototype.toString = function() {
        return " +" + this._createCount + " >" + this._allocateCount + " <" + this._releaseCount + " -" + this._disposeCount + " =" + this._list.length + "/" + this._max;
      };
      return Pool2;
    })();
    var math_abs$8 = Math.abs;
    var math_max$6 = Math.max;
    var TreeNode = (function() {
      function TreeNode2(id) {
        this.aabb = new AABB();
        this.userData = null;
        this.parent = null;
        this.child1 = null;
        this.child2 = null;
        this.height = -1;
        this.id = id;
      }
      TreeNode2.prototype.toString = function() {
        return this.id + ": " + this.userData;
      };
      TreeNode2.prototype.isLeaf = function() {
        return this.child1 == null;
      };
      return TreeNode2;
    })();
    var poolTreeNode = new Pool({ create: function() {
      return new TreeNode();
    }, release: function(node) {
      node.userData = null;
      node.parent = null;
      node.child1 = null;
      node.child2 = null;
      node.height = -1;
      node.id = void 0;
    } });
    var DynamicTree = (function() {
      function DynamicTree2() {
        this.inputPool = new Pool({ create: function() {
          return {};
        }, release: function(stack) {
        } });
        this.stackPool = new Pool({ create: function() {
          return [];
        }, release: function(stack) {
          stack.length = 0;
        } });
        this.iteratorPool = new Pool({ create: function() {
          return new Iterator();
        }, release: function(iterator) {
          iterator.close();
        } });
        this.m_root = null;
        this.m_nodes = {};
        this.m_lastProxyId = 0;
      }
      DynamicTree2.prototype.getUserData = function(id) {
        var node = this.m_nodes[id];
        return node.userData;
      };
      DynamicTree2.prototype.getFatAABB = function(id) {
        var node = this.m_nodes[id];
        return node.aabb;
      };
      DynamicTree2.prototype.allocateNode = function() {
        var node = poolTreeNode.allocate();
        node.id = ++this.m_lastProxyId;
        this.m_nodes[node.id] = node;
        return node;
      };
      DynamicTree2.prototype.freeNode = function(node) {
        delete this.m_nodes[node.id];
        poolTreeNode.release(node);
      };
      DynamicTree2.prototype.createProxy = function(aabb, userData) {
        var node = this.allocateNode();
        node.aabb.set(aabb);
        AABB.extend(node.aabb, SettingsInternal.aabbExtension);
        node.userData = userData;
        node.height = 0;
        this.insertLeaf(node);
        return node.id;
      };
      DynamicTree2.prototype.destroyProxy = function(id) {
        var node = this.m_nodes[id];
        this.removeLeaf(node);
        this.freeNode(node);
      };
      DynamicTree2.prototype.moveProxy = function(id, aabb, d2) {
        var node = this.m_nodes[id];
        if (node.aabb.contains(aabb)) {
          return false;
        }
        this.removeLeaf(node);
        node.aabb.set(aabb);
        aabb = node.aabb;
        AABB.extend(aabb, SettingsInternal.aabbExtension);
        if (d2.x < 0) {
          aabb.lowerBound.x += d2.x * SettingsInternal.aabbMultiplier;
        } else {
          aabb.upperBound.x += d2.x * SettingsInternal.aabbMultiplier;
        }
        if (d2.y < 0) {
          aabb.lowerBound.y += d2.y * SettingsInternal.aabbMultiplier;
        } else {
          aabb.upperBound.y += d2.y * SettingsInternal.aabbMultiplier;
        }
        this.insertLeaf(node);
        return true;
      };
      DynamicTree2.prototype.insertLeaf = function(leaf) {
        if (this.m_root == null) {
          this.m_root = leaf;
          this.m_root.parent = null;
          return;
        }
        var leafAABB = leaf.aabb;
        var index = this.m_root;
        while (!index.isLeaf()) {
          var child1 = index.child1;
          var child2 = index.child2;
          var area = index.aabb.getPerimeter();
          var combinedArea = AABB.combinedPerimeter(index.aabb, leafAABB);
          var cost = 2 * combinedArea;
          var inheritanceCost = 2 * (combinedArea - area);
          var newArea1 = AABB.combinedPerimeter(leafAABB, child1.aabb);
          var cost1 = newArea1 + inheritanceCost;
          if (!child1.isLeaf()) {
            var oldArea = child1.aabb.getPerimeter();
            cost1 -= oldArea;
          }
          var newArea2 = AABB.combinedPerimeter(leafAABB, child2.aabb);
          var cost2 = newArea2 + inheritanceCost;
          if (!child2.isLeaf()) {
            var oldArea = child2.aabb.getPerimeter();
            cost2 -= oldArea;
          }
          if (cost < cost1 && cost < cost2) {
            break;
          }
          if (cost1 < cost2) {
            index = child1;
          } else {
            index = child2;
          }
        }
        var sibling = index;
        var oldParent = sibling.parent;
        var newParent = this.allocateNode();
        newParent.parent = oldParent;
        newParent.userData = null;
        newParent.aabb.combine(leafAABB, sibling.aabb);
        newParent.height = sibling.height + 1;
        if (oldParent != null) {
          if (oldParent.child1 === sibling) {
            oldParent.child1 = newParent;
          } else {
            oldParent.child2 = newParent;
          }
          newParent.child1 = sibling;
          newParent.child2 = leaf;
          sibling.parent = newParent;
          leaf.parent = newParent;
        } else {
          newParent.child1 = sibling;
          newParent.child2 = leaf;
          sibling.parent = newParent;
          leaf.parent = newParent;
          this.m_root = newParent;
        }
        index = leaf.parent;
        while (index != null) {
          index = this.balance(index);
          var child1 = index.child1;
          var child2 = index.child2;
          index.height = 1 + math_max$6(child1.height, child2.height);
          index.aabb.combine(child1.aabb, child2.aabb);
          index = index.parent;
        }
      };
      DynamicTree2.prototype.removeLeaf = function(leaf) {
        if (leaf === this.m_root) {
          this.m_root = null;
          return;
        }
        var parent = leaf.parent;
        var grandParent = parent.parent;
        var sibling;
        if (parent.child1 === leaf) {
          sibling = parent.child2;
        } else {
          sibling = parent.child1;
        }
        if (grandParent != null) {
          if (grandParent.child1 === parent) {
            grandParent.child1 = sibling;
          } else {
            grandParent.child2 = sibling;
          }
          sibling.parent = grandParent;
          this.freeNode(parent);
          var index = grandParent;
          while (index != null) {
            index = this.balance(index);
            var child1 = index.child1;
            var child2 = index.child2;
            index.aabb.combine(child1.aabb, child2.aabb);
            index.height = 1 + math_max$6(child1.height, child2.height);
            index = index.parent;
          }
        } else {
          this.m_root = sibling;
          sibling.parent = null;
          this.freeNode(parent);
        }
      };
      DynamicTree2.prototype.balance = function(iA) {
        var A = iA;
        if (A.isLeaf() || A.height < 2) {
          return iA;
        }
        var B = A.child1;
        var C = A.child2;
        var balance = C.height - B.height;
        if (balance > 1) {
          var F = C.child1;
          var G = C.child2;
          C.child1 = A;
          C.parent = A.parent;
          A.parent = C;
          if (C.parent != null) {
            if (C.parent.child1 === iA) {
              C.parent.child1 = C;
            } else {
              C.parent.child2 = C;
            }
          } else {
            this.m_root = C;
          }
          if (F.height > G.height) {
            C.child2 = F;
            A.child2 = G;
            G.parent = A;
            A.aabb.combine(B.aabb, G.aabb);
            C.aabb.combine(A.aabb, F.aabb);
            A.height = 1 + math_max$6(B.height, G.height);
            C.height = 1 + math_max$6(A.height, F.height);
          } else {
            C.child2 = G;
            A.child2 = F;
            F.parent = A;
            A.aabb.combine(B.aabb, F.aabb);
            C.aabb.combine(A.aabb, G.aabb);
            A.height = 1 + math_max$6(B.height, F.height);
            C.height = 1 + math_max$6(A.height, G.height);
          }
          return C;
        }
        if (balance < -1) {
          var D = B.child1;
          var E = B.child2;
          B.child1 = A;
          B.parent = A.parent;
          A.parent = B;
          if (B.parent != null) {
            if (B.parent.child1 === A) {
              B.parent.child1 = B;
            } else {
              B.parent.child2 = B;
            }
          } else {
            this.m_root = B;
          }
          if (D.height > E.height) {
            B.child2 = D;
            A.child1 = E;
            E.parent = A;
            A.aabb.combine(C.aabb, E.aabb);
            B.aabb.combine(A.aabb, D.aabb);
            A.height = 1 + math_max$6(C.height, E.height);
            B.height = 1 + math_max$6(A.height, D.height);
          } else {
            B.child2 = E;
            A.child1 = D;
            D.parent = A;
            A.aabb.combine(C.aabb, D.aabb);
            B.aabb.combine(A.aabb, E.aabb);
            A.height = 1 + math_max$6(C.height, D.height);
            B.height = 1 + math_max$6(A.height, E.height);
          }
          return B;
        }
        return A;
      };
      DynamicTree2.prototype.getHeight = function() {
        if (this.m_root == null) {
          return 0;
        }
        return this.m_root.height;
      };
      DynamicTree2.prototype.getAreaRatio = function() {
        if (this.m_root == null) {
          return 0;
        }
        var root = this.m_root;
        var rootArea = root.aabb.getPerimeter();
        var totalArea = 0;
        var node;
        var it = this.iteratorPool.allocate().preorder(this.m_root);
        while (node = it.next()) {
          if (node.height < 0) {
            continue;
          }
          totalArea += node.aabb.getPerimeter();
        }
        this.iteratorPool.release(it);
        return totalArea / rootArea;
      };
      DynamicTree2.prototype.computeHeight = function(id) {
        var node;
        if (typeof id !== "undefined") {
          node = this.m_nodes[id];
        } else {
          node = this.m_root;
        }
        if (node.isLeaf()) {
          return 0;
        }
        var height1 = this.computeHeight(node.child1.id);
        var height2 = this.computeHeight(node.child2.id);
        return 1 + math_max$6(height1, height2);
      };
      DynamicTree2.prototype.validateStructure = function(node) {
        if (node == null) {
          return;
        }
        if (node === this.m_root) ;
        var child1 = node.child1;
        var child2 = node.child2;
        if (node.isLeaf()) {
          return;
        }
        this.validateStructure(child1);
        this.validateStructure(child2);
      };
      DynamicTree2.prototype.validateMetrics = function(node) {
        if (node == null) {
          return;
        }
        var child1 = node.child1;
        var child2 = node.child2;
        if (node.isLeaf()) {
          return;
        }
        this.validateMetrics(child1);
        this.validateMetrics(child2);
      };
      DynamicTree2.prototype.validate = function() {
        return;
      };
      DynamicTree2.prototype.getMaxBalance = function() {
        var maxBalance = 0;
        var node;
        var it = this.iteratorPool.allocate().preorder(this.m_root);
        while (node = it.next()) {
          if (node.height <= 1) {
            continue;
          }
          var balance = math_abs$8(node.child2.height - node.child1.height);
          maxBalance = math_max$6(maxBalance, balance);
        }
        this.iteratorPool.release(it);
        return maxBalance;
      };
      DynamicTree2.prototype.rebuildBottomUp = function() {
        var nodes = [];
        var count = 0;
        var node;
        var it = this.iteratorPool.allocate().preorder(this.m_root);
        while (node = it.next()) {
          if (node.height < 0) {
            continue;
          }
          if (node.isLeaf()) {
            node.parent = null;
            nodes[count] = node;
            ++count;
          } else {
            this.freeNode(node);
          }
        }
        this.iteratorPool.release(it);
        while (count > 1) {
          var minCost = Infinity;
          var iMin = -1;
          var jMin = -1;
          for (var i = 0; i < count; ++i) {
            var aabbi = nodes[i].aabb;
            for (var j = i + 1; j < count; ++j) {
              var aabbj = nodes[j].aabb;
              var cost = AABB.combinedPerimeter(aabbi, aabbj);
              if (cost < minCost) {
                iMin = i;
                jMin = j;
                minCost = cost;
              }
            }
          }
          var child1 = nodes[iMin];
          var child2 = nodes[jMin];
          var parent_1 = this.allocateNode();
          parent_1.child1 = child1;
          parent_1.child2 = child2;
          parent_1.height = 1 + math_max$6(child1.height, child2.height);
          parent_1.aabb.combine(child1.aabb, child2.aabb);
          parent_1.parent = null;
          child1.parent = parent_1;
          child2.parent = parent_1;
          nodes[jMin] = nodes[count - 1];
          nodes[iMin] = parent_1;
          --count;
        }
        this.m_root = nodes[0];
      };
      DynamicTree2.prototype.shiftOrigin = function(newOrigin) {
        var node;
        var it = this.iteratorPool.allocate().preorder(this.m_root);
        while (node = it.next()) {
          var aabb = node.aabb;
          aabb.lowerBound.x -= newOrigin.x;
          aabb.lowerBound.y -= newOrigin.y;
          aabb.upperBound.x -= newOrigin.x;
          aabb.upperBound.y -= newOrigin.y;
        }
        this.iteratorPool.release(it);
      };
      DynamicTree2.prototype.query = function(aabb, queryCallback) {
        var stack = this.stackPool.allocate();
        stack.push(this.m_root);
        while (stack.length > 0) {
          var node = stack.pop();
          if (node == null) {
            continue;
          }
          if (AABB.testOverlap(node.aabb, aabb)) {
            if (node.isLeaf()) {
              var proceed = queryCallback(node.id);
              if (proceed === false) {
                return;
              }
            } else {
              stack.push(node.child1);
              stack.push(node.child2);
            }
          }
        }
        this.stackPool.release(stack);
      };
      DynamicTree2.prototype.rayCast = function(input2, rayCastCallback) {
        var p1 = input2.p1;
        var p2 = input2.p2;
        var r = Vec2.sub(p2, p1);
        r.normalize();
        var v3 = Vec2.crossNumVec2(1, r);
        var abs_v = Vec2.abs(v3);
        var maxFraction = input2.maxFraction;
        var segmentAABB = new AABB();
        var t = Vec2.combine(1 - maxFraction, p1, maxFraction, p2);
        segmentAABB.combinePoints(p1, t);
        var stack = this.stackPool.allocate();
        var subInput = this.inputPool.allocate();
        stack.push(this.m_root);
        while (stack.length > 0) {
          var node = stack.pop();
          if (node == null) {
            continue;
          }
          if (AABB.testOverlap(node.aabb, segmentAABB) === false) {
            continue;
          }
          var c2 = node.aabb.getCenter();
          var h = node.aabb.getExtents();
          var separation = math_abs$8(Vec2.dot(v3, Vec2.sub(p1, c2))) - Vec2.dot(abs_v, h);
          if (separation > 0) {
            continue;
          }
          if (node.isLeaf()) {
            subInput.p1 = Vec2.clone(input2.p1);
            subInput.p2 = Vec2.clone(input2.p2);
            subInput.maxFraction = maxFraction;
            var value = rayCastCallback(subInput, node.id);
            if (value === 0) {
              break;
            } else if (value > 0) {
              maxFraction = value;
              t = Vec2.combine(1 - maxFraction, p1, maxFraction, p2);
              segmentAABB.combinePoints(p1, t);
            }
          } else {
            stack.push(node.child1);
            stack.push(node.child2);
          }
        }
        this.stackPool.release(stack);
        this.inputPool.release(subInput);
      };
      return DynamicTree2;
    })();
    var Iterator = (function() {
      function Iterator2() {
        this.parents = [];
        this.states = [];
      }
      Iterator2.prototype.preorder = function(root) {
        this.parents.length = 0;
        this.parents.push(root);
        this.states.length = 0;
        this.states.push(0);
        return this;
      };
      Iterator2.prototype.next = function() {
        while (this.parents.length > 0) {
          var i = this.parents.length - 1;
          var node = this.parents[i];
          if (this.states[i] === 0) {
            this.states[i] = 1;
            return node;
          }
          if (this.states[i] === 1) {
            this.states[i] = 2;
            if (node.child1) {
              this.parents.push(node.child1);
              this.states.push(1);
              return node.child1;
            }
          }
          if (this.states[i] === 2) {
            this.states[i] = 3;
            if (node.child2) {
              this.parents.push(node.child2);
              this.states.push(1);
              return node.child2;
            }
          }
          this.parents.pop();
          this.states.pop();
        }
      };
      Iterator2.prototype.close = function() {
        this.parents.length = 0;
      };
      return Iterator2;
    })();
    var math_max$5 = Math.max;
    var math_min$6 = Math.min;
    var BroadPhase = (function() {
      function BroadPhase2() {
        var _this = this;
        this.m_tree = new DynamicTree();
        this.m_moveBuffer = [];
        this.query = function(aabb, queryCallback) {
          _this.m_tree.query(aabb, queryCallback);
        };
        this.queryCallback = function(proxyId) {
          if (proxyId === _this.m_queryProxyId) {
            return true;
          }
          var proxyIdA = math_min$6(proxyId, _this.m_queryProxyId);
          var proxyIdB = math_max$5(proxyId, _this.m_queryProxyId);
          var userDataA = _this.m_tree.getUserData(proxyIdA);
          var userDataB = _this.m_tree.getUserData(proxyIdB);
          _this.m_callback(userDataA, userDataB);
          return true;
        };
      }
      BroadPhase2.prototype.getUserData = function(proxyId) {
        return this.m_tree.getUserData(proxyId);
      };
      BroadPhase2.prototype.testOverlap = function(proxyIdA, proxyIdB) {
        var aabbA = this.m_tree.getFatAABB(proxyIdA);
        var aabbB = this.m_tree.getFatAABB(proxyIdB);
        return AABB.testOverlap(aabbA, aabbB);
      };
      BroadPhase2.prototype.getFatAABB = function(proxyId) {
        return this.m_tree.getFatAABB(proxyId);
      };
      BroadPhase2.prototype.getProxyCount = function() {
        return this.m_moveBuffer.length;
      };
      BroadPhase2.prototype.getTreeHeight = function() {
        return this.m_tree.getHeight();
      };
      BroadPhase2.prototype.getTreeBalance = function() {
        return this.m_tree.getMaxBalance();
      };
      BroadPhase2.prototype.getTreeQuality = function() {
        return this.m_tree.getAreaRatio();
      };
      BroadPhase2.prototype.rayCast = function(input2, rayCastCallback) {
        this.m_tree.rayCast(input2, rayCastCallback);
      };
      BroadPhase2.prototype.shiftOrigin = function(newOrigin) {
        this.m_tree.shiftOrigin(newOrigin);
      };
      BroadPhase2.prototype.createProxy = function(aabb, userData) {
        var proxyId = this.m_tree.createProxy(aabb, userData);
        this.bufferMove(proxyId);
        return proxyId;
      };
      BroadPhase2.prototype.destroyProxy = function(proxyId) {
        this.unbufferMove(proxyId);
        this.m_tree.destroyProxy(proxyId);
      };
      BroadPhase2.prototype.moveProxy = function(proxyId, aabb, displacement2) {
        var changed = this.m_tree.moveProxy(proxyId, aabb, displacement2);
        if (changed) {
          this.bufferMove(proxyId);
        }
      };
      BroadPhase2.prototype.touchProxy = function(proxyId) {
        this.bufferMove(proxyId);
      };
      BroadPhase2.prototype.bufferMove = function(proxyId) {
        this.m_moveBuffer.push(proxyId);
      };
      BroadPhase2.prototype.unbufferMove = function(proxyId) {
        for (var i = 0; i < this.m_moveBuffer.length; ++i) {
          if (this.m_moveBuffer[i] === proxyId) {
            this.m_moveBuffer[i] = null;
          }
        }
      };
      BroadPhase2.prototype.updatePairs = function(addPairCallback) {
        this.m_callback = addPairCallback;
        while (this.m_moveBuffer.length > 0) {
          this.m_queryProxyId = this.m_moveBuffer.pop();
          if (this.m_queryProxyId === null) {
            continue;
          }
          var fatAABB = this.m_tree.getFatAABB(this.m_queryProxyId);
          this.m_tree.query(fatAABB, this.queryCallback);
        }
      };
      return BroadPhase2;
    })();
    var math_sin$2 = Math.sin;
    var math_cos$2 = Math.cos;
    var math_sqrt$4 = Math.sqrt;
    function vec2(x2, y) {
      return { x: x2, y };
    }
    function rotation(angle) {
      return { s: math_sin$2(angle), c: math_cos$2(angle) };
    }
    function setVec2(out, x2, y) {
      out.x = x2;
      out.y = y;
      return out;
    }
    function copyVec2(out, w) {
      out.x = w.x;
      out.y = w.y;
      return out;
    }
    function zeroVec2(out) {
      out.x = 0;
      out.y = 0;
      return out;
    }
    function negVec2(out) {
      out.x = -out.x;
      out.y = -out.y;
      return out;
    }
    function plusVec2(out, w) {
      out.x += w.x;
      out.y += w.y;
      return out;
    }
    function addVec2(out, v3, w) {
      out.x = v3.x + w.x;
      out.y = v3.y + w.y;
      return out;
    }
    function minusVec2(out, w) {
      out.x -= w.x;
      out.y -= w.y;
      return out;
    }
    function subVec2(out, v3, w) {
      out.x = v3.x - w.x;
      out.y = v3.y - w.y;
      return out;
    }
    function mulVec2(out, m) {
      out.x *= m;
      out.y *= m;
      return out;
    }
    function scaleVec2(out, m, w) {
      out.x = m * w.x;
      out.y = m * w.y;
      return out;
    }
    function plusScaleVec2(out, m, w) {
      out.x += m * w.x;
      out.y += m * w.y;
      return out;
    }
    function minusScaleVec2(out, m, w) {
      out.x -= m * w.x;
      out.y -= m * w.y;
      return out;
    }
    function combine2Vec2(out, am, a2, bm, b2) {
      out.x = am * a2.x + bm * b2.x;
      out.y = am * a2.y + bm * b2.y;
      return out;
    }
    function combine3Vec2(out, am, a2, bm, b2, cm, c2) {
      out.x = am * a2.x + bm * b2.x + cm * c2.x;
      out.y = am * a2.y + bm * b2.y + cm * c2.y;
      return out;
    }
    function normalizeVec2Length(out) {
      var length = math_sqrt$4(out.x * out.x + out.y * out.y);
      if (length !== 0) {
        var invLength = 1 / length;
        out.x *= invLength;
        out.y *= invLength;
      }
      return length;
    }
    function normalizeVec2(out) {
      var length = math_sqrt$4(out.x * out.x + out.y * out.y);
      if (length > 0) {
        var invLength = 1 / length;
        out.x *= invLength;
        out.y *= invLength;
      }
      return out;
    }
    function crossVec2Num(out, v3, w) {
      var x2 = w * v3.y;
      var y = -w * v3.x;
      out.x = x2;
      out.y = y;
      return out;
    }
    function crossNumVec2(out, w, v3) {
      var x2 = -w * v3.y;
      var y = w * v3.x;
      out.x = x2;
      out.y = y;
      return out;
    }
    function crossVec2Vec2(a2, b2) {
      return a2.x * b2.y - a2.y * b2.x;
    }
    function dotVec2(a2, b2) {
      return a2.x * b2.x + a2.y * b2.y;
    }
    function lengthSqrVec2(a2) {
      return a2.x * a2.x + a2.y * a2.y;
    }
    function distVec2(a2, b2) {
      var dx = a2.x - b2.x;
      var dy = a2.y - b2.y;
      return math_sqrt$4(dx * dx + dy * dy);
    }
    function distSqrVec2(a2, b2) {
      var dx = a2.x - b2.x;
      var dy = a2.y - b2.y;
      return dx * dx + dy * dy;
    }
    function setRotAngle(out, a2) {
      out.c = math_cos$2(a2);
      out.s = math_sin$2(a2);
      return out;
    }
    function rotVec2(out, q, v3) {
      out.x = q.c * v3.x - q.s * v3.y;
      out.y = q.s * v3.x + q.c * v3.y;
      return out;
    }
    function derotVec2(out, q, v3) {
      var x2 = q.c * v3.x + q.s * v3.y;
      var y = -q.s * v3.x + q.c * v3.y;
      out.x = x2;
      out.y = y;
      return out;
    }
    function rerotVec2(out, before, after, v3) {
      var x0 = before.c * v3.x + before.s * v3.y;
      var y0 = -before.s * v3.x + before.c * v3.y;
      var x2 = after.c * x0 - after.s * y0;
      var y = after.s * x0 + after.c * y0;
      out.x = x2;
      out.y = y;
      return out;
    }
    function transform(x2, y, a2) {
      return { p: vec2(x2, y), q: rotation(a2) };
    }
    function copyTransform(out, transform2) {
      out.p.x = transform2.p.x;
      out.p.y = transform2.p.y;
      out.q.s = transform2.q.s;
      out.q.c = transform2.q.c;
      return out;
    }
    function transformVec2(out, xf2, v3) {
      var x2 = xf2.q.c * v3.x - xf2.q.s * v3.y + xf2.p.x;
      var y = xf2.q.s * v3.x + xf2.q.c * v3.y + xf2.p.y;
      out.x = x2;
      out.y = y;
      return out;
    }
    function detransformVec2(out, xf2, v3) {
      var px = v3.x - xf2.p.x;
      var py = v3.y - xf2.p.y;
      var x2 = xf2.q.c * px + xf2.q.s * py;
      var y = -xf2.q.s * px + xf2.q.c * py;
      out.x = x2;
      out.y = y;
      return out;
    }
    function retransformVec2(out, from, to, v3) {
      var x0 = from.q.c * v3.x - from.q.s * v3.y + from.p.x;
      var y0 = from.q.s * v3.x + from.q.c * v3.y + from.p.y;
      var px = x0 - to.p.x;
      var py = y0 - to.p.y;
      var x2 = to.q.c * px + to.q.s * py;
      var y = -to.q.s * px + to.q.c * py;
      out.x = x2;
      out.y = y;
      return out;
    }
    function detransformTransform(out, a2, b2) {
      var c2 = a2.q.c * b2.q.c + a2.q.s * b2.q.s;
      var s2 = a2.q.c * b2.q.s - a2.q.s * b2.q.c;
      var x2 = a2.q.c * (b2.p.x - a2.p.x) + a2.q.s * (b2.p.y - a2.p.y);
      var y = -a2.q.s * (b2.p.x - a2.p.x) + a2.q.c * (b2.p.y - a2.p.y);
      out.q.c = c2;
      out.q.s = s2;
      out.p.x = x2;
      out.p.y = y;
      return out;
    }
    var math_sin$1 = Math.sin;
    var math_cos$1 = Math.cos;
    var math_atan2$1 = Math.atan2;
    var Rot = (function() {
      function Rot2(angle) {
        if (!(this instanceof Rot2)) {
          return new Rot2(angle);
        }
        if (typeof angle === "number") {
          this.setAngle(angle);
        } else if (typeof angle === "object") {
          this.setRot(angle);
        } else {
          this.setIdentity();
        }
      }
      Rot2.neo = function(angle) {
        var obj = Object.create(Rot2.prototype);
        obj.setAngle(angle);
        return obj;
      };
      Rot2.clone = function(rot) {
        var obj = Object.create(Rot2.prototype);
        obj.s = rot.s;
        obj.c = rot.c;
        return obj;
      };
      Rot2.identity = function() {
        var obj = Object.create(Rot2.prototype);
        obj.s = 0;
        obj.c = 1;
        return obj;
      };
      Rot2.isValid = function(obj) {
        if (obj === null || typeof obj === "undefined") {
          return false;
        }
        return Number.isFinite(obj.s) && Number.isFinite(obj.c);
      };
      Rot2.assert = function(o) {
      };
      Rot2.prototype.setIdentity = function() {
        this.s = 0;
        this.c = 1;
      };
      Rot2.prototype.set = function(angle) {
        if (typeof angle === "object") {
          this.s = angle.s;
          this.c = angle.c;
        } else {
          this.s = math_sin$1(angle);
          this.c = math_cos$1(angle);
        }
      };
      Rot2.prototype.setRot = function(angle) {
        this.s = angle.s;
        this.c = angle.c;
      };
      Rot2.prototype.setAngle = function(angle) {
        this.s = math_sin$1(angle);
        this.c = math_cos$1(angle);
      };
      Rot2.prototype.getAngle = function() {
        return math_atan2$1(this.s, this.c);
      };
      Rot2.prototype.getXAxis = function() {
        return Vec2.neo(this.c, this.s);
      };
      Rot2.prototype.getYAxis = function() {
        return Vec2.neo(-this.s, this.c);
      };
      Rot2.mul = function(rot, m) {
        if ("c" in m && "s" in m) {
          var qr = Rot2.identity();
          qr.s = rot.s * m.c + rot.c * m.s;
          qr.c = rot.c * m.c - rot.s * m.s;
          return qr;
        } else if ("x" in m && "y" in m) {
          return Vec2.neo(rot.c * m.x - rot.s * m.y, rot.s * m.x + rot.c * m.y);
        }
      };
      Rot2.mulRot = function(rot, m) {
        var qr = Rot2.identity();
        qr.s = rot.s * m.c + rot.c * m.s;
        qr.c = rot.c * m.c - rot.s * m.s;
        return qr;
      };
      Rot2.mulVec2 = function(rot, m) {
        return Vec2.neo(rot.c * m.x - rot.s * m.y, rot.s * m.x + rot.c * m.y);
      };
      Rot2.mulSub = function(rot, v3, w) {
        var x2 = rot.c * (v3.x - w.x) - rot.s * (v3.y - w.y);
        var y = rot.s * (v3.x - w.x) + rot.c * (v3.y - w.y);
        return Vec2.neo(x2, y);
      };
      Rot2.mulT = function(rot, m) {
        if ("c" in m && "s" in m) {
          var qr = Rot2.identity();
          qr.s = rot.c * m.s - rot.s * m.c;
          qr.c = rot.c * m.c + rot.s * m.s;
          return qr;
        } else if ("x" in m && "y" in m) {
          return Vec2.neo(rot.c * m.x + rot.s * m.y, -rot.s * m.x + rot.c * m.y);
        }
      };
      Rot2.mulTRot = function(rot, m) {
        var qr = Rot2.identity();
        qr.s = rot.c * m.s - rot.s * m.c;
        qr.c = rot.c * m.c + rot.s * m.s;
        return qr;
      };
      Rot2.mulTVec2 = function(rot, m) {
        return Vec2.neo(rot.c * m.x + rot.s * m.y, -rot.s * m.x + rot.c * m.y);
      };
      return Rot2;
    })();
    var math_atan2 = Math.atan2;
    var math_PI$5 = Math.PI;
    var temp$7 = vec2(0, 0);
    var Sweep = (function() {
      function Sweep2() {
        this.localCenter = Vec2.zero();
        this.c = Vec2.zero();
        this.a = 0;
        this.alpha0 = 0;
        this.c0 = Vec2.zero();
        this.a0 = 0;
      }
      Sweep2.prototype.recycle = function() {
        zeroVec2(this.localCenter);
        zeroVec2(this.c);
        this.a = 0;
        this.alpha0 = 0;
        zeroVec2(this.c0);
        this.a0 = 0;
      };
      Sweep2.prototype.setTransform = function(xf2) {
        transformVec2(temp$7, xf2, this.localCenter);
        copyVec2(this.c, temp$7);
        copyVec2(this.c0, temp$7);
        this.a = this.a0 = math_atan2(xf2.q.s, xf2.q.c);
      };
      Sweep2.prototype.setLocalCenter = function(localCenter2, xf2) {
        copyVec2(this.localCenter, localCenter2);
        transformVec2(temp$7, xf2, this.localCenter);
        copyVec2(this.c, temp$7);
        copyVec2(this.c0, temp$7);
      };
      Sweep2.prototype.getTransform = function(xf2, beta) {
        if (beta === void 0) {
          beta = 0;
        }
        setRotAngle(xf2.q, (1 - beta) * this.a0 + beta * this.a);
        combine2Vec2(xf2.p, 1 - beta, this.c0, beta, this.c);
        minusVec2(xf2.p, rotVec2(temp$7, xf2.q, this.localCenter));
      };
      Sweep2.prototype.advance = function(alpha) {
        var beta = (alpha - this.alpha0) / (1 - this.alpha0);
        combine2Vec2(this.c0, beta, this.c, 1 - beta, this.c0);
        this.a0 = beta * this.a + (1 - beta) * this.a0;
        this.alpha0 = alpha;
      };
      Sweep2.prototype.forward = function() {
        this.a0 = this.a;
        copyVec2(this.c0, this.c);
      };
      Sweep2.prototype.normalize = function() {
        var a0 = mod(this.a0, -math_PI$5, +math_PI$5);
        this.a -= this.a0 - a0;
        this.a0 = a0;
      };
      Sweep2.prototype.set = function(that) {
        copyVec2(this.localCenter, that.localCenter);
        copyVec2(this.c, that.c);
        this.a = that.a;
        this.alpha0 = that.alpha0;
        copyVec2(this.c0, that.c0);
        this.a0 = that.a0;
      };
      return Sweep2;
    })();
    var Transform = (function() {
      function Transform2(position, rotation2) {
        if (!(this instanceof Transform2)) {
          return new Transform2(position, rotation2);
        }
        this.p = Vec2.zero();
        this.q = Rot.identity();
        if (typeof position !== "undefined") {
          this.p.setVec2(position);
        }
        if (typeof rotation2 !== "undefined") {
          this.q.setAngle(rotation2);
        }
      }
      Transform2.clone = function(xf2) {
        var obj = Object.create(Transform2.prototype);
        obj.p = Vec2.clone(xf2.p);
        obj.q = Rot.clone(xf2.q);
        return obj;
      };
      Transform2.neo = function(position, rotation2) {
        var obj = Object.create(Transform2.prototype);
        obj.p = Vec2.clone(position);
        obj.q = Rot.clone(rotation2);
        return obj;
      };
      Transform2.identity = function() {
        var obj = Object.create(Transform2.prototype);
        obj.p = Vec2.zero();
        obj.q = Rot.identity();
        return obj;
      };
      Transform2.prototype.setIdentity = function() {
        this.p.setZero();
        this.q.setIdentity();
      };
      Transform2.prototype.set = function(a2, b2) {
        if (typeof b2 === "undefined") {
          this.p.set(a2.p);
          this.q.set(a2.q);
        } else {
          this.p.set(a2);
          this.q.set(b2);
        }
      };
      Transform2.prototype.setNum = function(position, rotation2) {
        this.p.setVec2(position);
        this.q.setAngle(rotation2);
      };
      Transform2.prototype.setTransform = function(xf2) {
        this.p.setVec2(xf2.p);
        this.q.setRot(xf2.q);
      };
      Transform2.isValid = function(obj) {
        if (obj === null || typeof obj === "undefined") {
          return false;
        }
        return Vec2.isValid(obj.p) && Rot.isValid(obj.q);
      };
      Transform2.assert = function(o) {
      };
      Transform2.mul = function(a2, b2) {
        if (Array.isArray(b2)) {
          var arr = [];
          for (var i = 0; i < b2.length; i++) {
            arr[i] = Transform2.mul(a2, b2[i]);
          }
          return arr;
        } else if ("x" in b2 && "y" in b2) {
          return Transform2.mulVec2(a2, b2);
        } else if ("p" in b2 && "q" in b2) {
          return Transform2.mulXf(a2, b2);
        }
      };
      Transform2.mulAll = function(a2, b2) {
        var arr = [];
        for (var i = 0; i < b2.length; i++) {
          arr[i] = Transform2.mul(a2, b2[i]);
        }
        return arr;
      };
      Transform2.mulFn = function(a2) {
        return function(b2) {
          return Transform2.mul(a2, b2);
        };
      };
      Transform2.mulVec2 = function(a2, b2) {
        var x2 = a2.q.c * b2.x - a2.q.s * b2.y + a2.p.x;
        var y = a2.q.s * b2.x + a2.q.c * b2.y + a2.p.y;
        return Vec2.neo(x2, y);
      };
      Transform2.mulXf = function(a2, b2) {
        var xf2 = Transform2.identity();
        xf2.q = Rot.mulRot(a2.q, b2.q);
        xf2.p = Vec2.add(Rot.mulVec2(a2.q, b2.p), a2.p);
        return xf2;
      };
      Transform2.mulT = function(a2, b2) {
        if ("x" in b2 && "y" in b2) {
          return Transform2.mulTVec2(a2, b2);
        } else if ("p" in b2 && "q" in b2) {
          return Transform2.mulTXf(a2, b2);
        }
      };
      Transform2.mulTVec2 = function(a2, b2) {
        var px = b2.x - a2.p.x;
        var py = b2.y - a2.p.y;
        var x2 = a2.q.c * px + a2.q.s * py;
        var y = -a2.q.s * px + a2.q.c * py;
        return Vec2.neo(x2, y);
      };
      Transform2.mulTXf = function(a2, b2) {
        var xf2 = Transform2.identity();
        xf2.q.setRot(Rot.mulTRot(a2.q, b2.q));
        xf2.p.setVec2(Rot.mulTVec2(a2.q, Vec2.sub(b2.p, a2.p)));
        return xf2;
      };
      return Transform2;
    })();
    var Velocity = /* @__PURE__ */ (function() {
      function Velocity2() {
        this.v = Vec2.zero();
        this.w = 0;
      }
      return Velocity2;
    })();
    var math_sin = Math.sin;
    var math_cos = Math.cos;
    var Position = (function() {
      function Position2() {
        this.c = Vec2.zero();
        this.a = 0;
      }
      Position2.prototype.getTransform = function(xf2, p) {
        xf2.q.c = math_cos(this.a);
        xf2.q.s = math_sin(this.a);
        xf2.p.x = this.c.x - (xf2.q.c * p.x - xf2.q.s * p.y);
        xf2.p.y = this.c.y - (xf2.q.s * p.x + xf2.q.c * p.y);
        return xf2;
      };
      return Position2;
    })();
    function getTransform(xf2, p, c2, a2) {
      xf2.q.c = math_cos(a2);
      xf2.q.s = math_sin(a2);
      xf2.p.x = c2.x - (xf2.q.c * p.x - xf2.q.s * p.y);
      xf2.p.y = c2.y - (xf2.q.s * p.x + xf2.q.c * p.y);
      return xf2;
    }
    var Shape = (function() {
      function Shape2() {
        this.style = {};
        this.appData = {};
      }
      Shape2.isValid = function(obj) {
        if (obj === null || typeof obj === "undefined") {
          return false;
        }
        return typeof obj.m_type === "string" && typeof obj.m_radius === "number";
      };
      return Shape2;
    })();
    var synchronize_aabb1 = new AABB();
    var synchronize_aabb2 = new AABB();
    var displacement = vec2(0, 0);
    var FixtureDefDefault = { userData: null, friction: 0.2, restitution: 0, density: 0, isSensor: false, filterGroupIndex: 0, filterCategoryBits: 1, filterMaskBits: 65535 };
    var FixtureProxy = /* @__PURE__ */ (function() {
      function FixtureProxy2(fixture, childIndex) {
        this.aabb = new AABB();
        this.fixture = fixture;
        this.childIndex = childIndex;
      }
      return FixtureProxy2;
    })();
    var Fixture = (function() {
      function Fixture2(body, shape, def) {
        this.style = {};
        this.appData = {};
        if (shape.shape) {
          def = shape;
          shape = shape.shape;
        } else if (typeof def === "number") {
          def = { density: def };
        }
        def = options(def, FixtureDefDefault);
        this.m_body = body;
        this.m_friction = def.friction;
        this.m_restitution = def.restitution;
        this.m_density = def.density;
        this.m_isSensor = def.isSensor;
        this.m_filterGroupIndex = def.filterGroupIndex;
        this.m_filterCategoryBits = def.filterCategoryBits;
        this.m_filterMaskBits = def.filterMaskBits;
        this.m_shape = shape;
        this.m_next = null;
        this.m_proxies = [];
        this.m_proxyCount = 0;
        var childCount = this.m_shape.getChildCount();
        for (var i = 0; i < childCount; ++i) {
          this.m_proxies[i] = new FixtureProxy(this, i);
        }
        this.m_userData = def.userData;
        if (typeof def.style === "object" && def.style !== null) {
          this.style = def.style;
        }
      }
      Fixture2.prototype._reset = function() {
        var body = this.getBody();
        var broadPhase = body.m_world.m_broadPhase;
        this.destroyProxies(broadPhase);
        if (this.m_shape._reset) {
          this.m_shape._reset();
        }
        var childCount = this.m_shape.getChildCount();
        for (var i = 0; i < childCount; ++i) {
          this.m_proxies[i] = new FixtureProxy(this, i);
        }
        this.createProxies(broadPhase, body.m_xf);
        body.resetMassData();
      };
      Fixture2.prototype._serialize = function() {
        return { friction: this.m_friction, restitution: this.m_restitution, density: this.m_density, isSensor: this.m_isSensor, filterGroupIndex: this.m_filterGroupIndex, filterCategoryBits: this.m_filterCategoryBits, filterMaskBits: this.m_filterMaskBits, shape: this.m_shape };
      };
      Fixture2._deserialize = function(data, body, restore) {
        var shape = restore(Shape, data.shape);
        var fixture = shape && new Fixture2(body, shape, data);
        return fixture;
      };
      Fixture2.prototype.getType = function() {
        return this.m_shape.m_type;
      };
      Fixture2.prototype.getShape = function() {
        return this.m_shape;
      };
      Fixture2.prototype.isSensor = function() {
        return this.m_isSensor;
      };
      Fixture2.prototype.setSensor = function(sensor) {
        if (sensor != this.m_isSensor) {
          this.m_body.setAwake(true);
          this.m_isSensor = sensor;
        }
      };
      Fixture2.prototype.getUserData = function() {
        return this.m_userData;
      };
      Fixture2.prototype.setUserData = function(data) {
        this.m_userData = data;
      };
      Fixture2.prototype.getBody = function() {
        return this.m_body;
      };
      Fixture2.prototype.getNext = function() {
        return this.m_next;
      };
      Fixture2.prototype.getDensity = function() {
        return this.m_density;
      };
      Fixture2.prototype.setDensity = function(density) {
        this.m_density = density;
      };
      Fixture2.prototype.getFriction = function() {
        return this.m_friction;
      };
      Fixture2.prototype.setFriction = function(friction) {
        this.m_friction = friction;
      };
      Fixture2.prototype.getRestitution = function() {
        return this.m_restitution;
      };
      Fixture2.prototype.setRestitution = function(restitution) {
        this.m_restitution = restitution;
      };
      Fixture2.prototype.testPoint = function(p) {
        return this.m_shape.testPoint(this.m_body.getTransform(), p);
      };
      Fixture2.prototype.rayCast = function(output2, input2, childIndex) {
        return this.m_shape.rayCast(output2, input2, this.m_body.getTransform(), childIndex);
      };
      Fixture2.prototype.getMassData = function(massData) {
        this.m_shape.computeMass(massData, this.m_density);
      };
      Fixture2.prototype.getAABB = function(childIndex) {
        return this.m_proxies[childIndex].aabb;
      };
      Fixture2.prototype.createProxies = function(broadPhase, xf2) {
        this.m_proxyCount = this.m_shape.getChildCount();
        for (var i = 0; i < this.m_proxyCount; ++i) {
          var proxy = this.m_proxies[i];
          this.m_shape.computeAABB(proxy.aabb, xf2, i);
          proxy.proxyId = broadPhase.createProxy(proxy.aabb, proxy);
        }
      };
      Fixture2.prototype.destroyProxies = function(broadPhase) {
        for (var i = 0; i < this.m_proxyCount; ++i) {
          var proxy = this.m_proxies[i];
          broadPhase.destroyProxy(proxy.proxyId);
          proxy.proxyId = null;
        }
        this.m_proxyCount = 0;
      };
      Fixture2.prototype.synchronize = function(broadPhase, xf1, xf2) {
        for (var i = 0; i < this.m_proxyCount; ++i) {
          var proxy = this.m_proxies[i];
          this.m_shape.computeAABB(synchronize_aabb1, xf1, proxy.childIndex);
          this.m_shape.computeAABB(synchronize_aabb2, xf2, proxy.childIndex);
          proxy.aabb.combine(synchronize_aabb1, synchronize_aabb2);
          subVec2(displacement, xf2.p, xf1.p);
          broadPhase.moveProxy(proxy.proxyId, proxy.aabb, displacement);
        }
      };
      Fixture2.prototype.setFilterData = function(filter) {
        this.m_filterGroupIndex = filter.groupIndex;
        this.m_filterCategoryBits = filter.categoryBits;
        this.m_filterMaskBits = filter.maskBits;
        this.refilter();
      };
      Fixture2.prototype.getFilterGroupIndex = function() {
        return this.m_filterGroupIndex;
      };
      Fixture2.prototype.setFilterGroupIndex = function(groupIndex) {
        this.m_filterGroupIndex = groupIndex;
        this.refilter();
      };
      Fixture2.prototype.getFilterCategoryBits = function() {
        return this.m_filterCategoryBits;
      };
      Fixture2.prototype.setFilterCategoryBits = function(categoryBits) {
        this.m_filterCategoryBits = categoryBits;
        this.refilter();
      };
      Fixture2.prototype.getFilterMaskBits = function() {
        return this.m_filterMaskBits;
      };
      Fixture2.prototype.setFilterMaskBits = function(maskBits) {
        this.m_filterMaskBits = maskBits;
        this.refilter();
      };
      Fixture2.prototype.refilter = function() {
        if (this.m_body == null) {
          return;
        }
        var edge = this.m_body.getContactList();
        while (edge) {
          var contact = edge.contact;
          var fixtureA = contact.getFixtureA();
          var fixtureB = contact.getFixtureB();
          if (fixtureA == this || fixtureB == this) {
            contact.flagForFiltering();
          }
          edge = edge.next;
        }
        var world = this.m_body.getWorld();
        if (world == null) {
          return;
        }
        var broadPhase = world.m_broadPhase;
        for (var i = 0; i < this.m_proxyCount; ++i) {
          broadPhase.touchProxy(this.m_proxies[i].proxyId);
        }
      };
      Fixture2.prototype.shouldCollide = function(that) {
        if (that.m_filterGroupIndex === this.m_filterGroupIndex && that.m_filterGroupIndex !== 0) {
          return that.m_filterGroupIndex > 0;
        }
        var collideA = (that.m_filterMaskBits & this.m_filterCategoryBits) !== 0;
        var collideB = (that.m_filterCategoryBits & this.m_filterMaskBits) !== 0;
        var collide = collideA && collideB;
        return collide;
      };
      return Fixture2;
    })();
    var STATIC = "static";
    var KINEMATIC = "kinematic";
    var DYNAMIC = "dynamic";
    var oldCenter = vec2(0, 0);
    var localCenter = vec2(0, 0);
    var shift = vec2(0, 0);
    var temp$6 = vec2(0, 0);
    var xf$2 = transform(0, 0, 0);
    var BodyDefDefault = { type: STATIC, position: Vec2.zero(), angle: 0, linearVelocity: Vec2.zero(), angularVelocity: 0, linearDamping: 0, angularDamping: 0, fixedRotation: false, bullet: false, gravityScale: 1, allowSleep: true, awake: true, active: true, userData: null };
    var Body = (function() {
      function Body2(world, def) {
        this.style = {};
        this.appData = {};
        def = options(def, BodyDefDefault);
        this.m_world = world;
        this.m_awakeFlag = def.awake;
        this.m_autoSleepFlag = def.allowSleep;
        this.m_bulletFlag = def.bullet;
        this.m_fixedRotationFlag = def.fixedRotation;
        this.m_activeFlag = def.active;
        this.m_islandFlag = false;
        this.m_toiFlag = false;
        this.m_userData = def.userData;
        this.m_type = def.type;
        if (this.m_type == DYNAMIC) {
          this.m_mass = 1;
          this.m_invMass = 1;
        } else {
          this.m_mass = 0;
          this.m_invMass = 0;
        }
        this.m_I = 0;
        this.m_invI = 0;
        this.m_xf = Transform.identity();
        this.m_xf.p.setVec2(def.position);
        this.m_xf.q.setAngle(def.angle);
        this.m_sweep = new Sweep();
        this.m_sweep.setTransform(this.m_xf);
        this.c_velocity = new Velocity();
        this.c_position = new Position();
        this.m_force = Vec2.zero();
        this.m_torque = 0;
        this.m_linearVelocity = Vec2.clone(def.linearVelocity);
        this.m_angularVelocity = def.angularVelocity;
        this.m_linearDamping = def.linearDamping;
        this.m_angularDamping = def.angularDamping;
        this.m_gravityScale = def.gravityScale;
        this.m_sleepTime = 0;
        this.m_jointList = null;
        this.m_contactList = null;
        this.m_fixtureList = null;
        this.m_prev = null;
        this.m_next = null;
        this.m_destroyed = false;
        if (typeof def.style === "object" && def.style !== null) {
          this.style = def.style;
        }
      }
      Body2.prototype._serialize = function() {
        var fixtures = [];
        for (var f = this.m_fixtureList; f; f = f.m_next) {
          fixtures.push(f);
        }
        return { type: this.m_type, bullet: this.m_bulletFlag, fixedRotation: this.m_fixedRotationFlag, position: this.m_xf.p, angle: this.m_xf.q.getAngle(), linearVelocity: this.m_linearVelocity, angularVelocity: this.m_angularVelocity, fixtures };
      };
      Body2._deserialize = function(data, world, restore) {
        var body = new Body2(world, data);
        if (data.fixtures) {
          for (var i = data.fixtures.length - 1; i >= 0; i--) {
            var fixture = restore(Fixture, data.fixtures[i], body);
            body._addFixture(fixture);
          }
        }
        return body;
      };
      Body2.prototype.isWorldLocked = function() {
        return this.m_world && this.m_world.isLocked() ? true : false;
      };
      Body2.prototype.getWorld = function() {
        return this.m_world;
      };
      Body2.prototype.getNext = function() {
        return this.m_next;
      };
      Body2.prototype.setUserData = function(data) {
        this.m_userData = data;
      };
      Body2.prototype.getUserData = function() {
        return this.m_userData;
      };
      Body2.prototype.getFixtureList = function() {
        return this.m_fixtureList;
      };
      Body2.prototype.getJointList = function() {
        return this.m_jointList;
      };
      Body2.prototype.getContactList = function() {
        return this.m_contactList;
      };
      Body2.prototype.isStatic = function() {
        return this.m_type == STATIC;
      };
      Body2.prototype.isDynamic = function() {
        return this.m_type == DYNAMIC;
      };
      Body2.prototype.isKinematic = function() {
        return this.m_type == KINEMATIC;
      };
      Body2.prototype.setStatic = function() {
        this.setType(STATIC);
        return this;
      };
      Body2.prototype.setDynamic = function() {
        this.setType(DYNAMIC);
        return this;
      };
      Body2.prototype.setKinematic = function() {
        this.setType(KINEMATIC);
        return this;
      };
      Body2.prototype.getType = function() {
        return this.m_type;
      };
      Body2.prototype.setType = function(type) {
        if (this.isWorldLocked() == true) {
          return;
        }
        if (this.m_type == type) {
          return;
        }
        this.m_type = type;
        this.resetMassData();
        if (this.m_type == STATIC) {
          this.m_linearVelocity.setZero();
          this.m_angularVelocity = 0;
          this.m_sweep.forward();
          this.synchronizeFixtures();
        }
        this.setAwake(true);
        this.m_force.setZero();
        this.m_torque = 0;
        var ce = this.m_contactList;
        while (ce) {
          var ce0 = ce;
          ce = ce.next;
          this.m_world.destroyContact(ce0.contact);
        }
        this.m_contactList = null;
        var broadPhase = this.m_world.m_broadPhase;
        for (var f = this.m_fixtureList; f; f = f.m_next) {
          for (var i = 0; i < f.m_proxyCount; ++i) {
            broadPhase.touchProxy(f.m_proxies[i].proxyId);
          }
        }
      };
      Body2.prototype.isBullet = function() {
        return this.m_bulletFlag;
      };
      Body2.prototype.setBullet = function(flag) {
        this.m_bulletFlag = !!flag;
      };
      Body2.prototype.isSleepingAllowed = function() {
        return this.m_autoSleepFlag;
      };
      Body2.prototype.setSleepingAllowed = function(flag) {
        this.m_autoSleepFlag = !!flag;
        if (this.m_autoSleepFlag == false) {
          this.setAwake(true);
        }
      };
      Body2.prototype.isAwake = function() {
        return this.m_awakeFlag;
      };
      Body2.prototype.setAwake = function(flag) {
        if (flag) {
          this.m_awakeFlag = true;
          this.m_sleepTime = 0;
        } else {
          this.m_awakeFlag = false;
          this.m_sleepTime = 0;
          this.m_linearVelocity.setZero();
          this.m_angularVelocity = 0;
          this.m_force.setZero();
          this.m_torque = 0;
        }
      };
      Body2.prototype.isActive = function() {
        return this.m_activeFlag;
      };
      Body2.prototype.setActive = function(flag) {
        if (flag == this.m_activeFlag) {
          return;
        }
        this.m_activeFlag = !!flag;
        if (this.m_activeFlag) {
          var broadPhase = this.m_world.m_broadPhase;
          for (var f = this.m_fixtureList; f; f = f.m_next) {
            f.createProxies(broadPhase, this.m_xf);
          }
          this.m_world.m_newFixture = true;
        } else {
          var broadPhase = this.m_world.m_broadPhase;
          for (var f = this.m_fixtureList; f; f = f.m_next) {
            f.destroyProxies(broadPhase);
          }
          var ce = this.m_contactList;
          while (ce) {
            var ce0 = ce;
            ce = ce.next;
            this.m_world.destroyContact(ce0.contact);
          }
          this.m_contactList = null;
        }
      };
      Body2.prototype.isFixedRotation = function() {
        return this.m_fixedRotationFlag;
      };
      Body2.prototype.setFixedRotation = function(flag) {
        if (this.m_fixedRotationFlag == flag) {
          return;
        }
        this.m_fixedRotationFlag = !!flag;
        this.m_angularVelocity = 0;
        this.resetMassData();
      };
      Body2.prototype.getTransform = function() {
        return this.m_xf;
      };
      Body2.prototype.setTransform = function(a2, b2) {
        if (this.isWorldLocked() == true) {
          return;
        }
        if (typeof b2 === "number") {
          this.m_xf.setNum(a2, b2);
        } else {
          this.m_xf.setTransform(a2);
        }
        this.m_sweep.setTransform(this.m_xf);
        var broadPhase = this.m_world.m_broadPhase;
        for (var f = this.m_fixtureList; f; f = f.m_next) {
          f.synchronize(broadPhase, this.m_xf, this.m_xf);
        }
        this.setAwake(true);
      };
      Body2.prototype.synchronizeTransform = function() {
        this.m_sweep.getTransform(this.m_xf, 1);
      };
      Body2.prototype.synchronizeFixtures = function() {
        this.m_sweep.getTransform(xf$2, 0);
        var broadPhase = this.m_world.m_broadPhase;
        for (var f = this.m_fixtureList; f; f = f.m_next) {
          f.synchronize(broadPhase, xf$2, this.m_xf);
        }
      };
      Body2.prototype.advance = function(alpha) {
        this.m_sweep.advance(alpha);
        copyVec2(this.m_sweep.c, this.m_sweep.c0);
        this.m_sweep.a = this.m_sweep.a0;
        this.m_sweep.getTransform(this.m_xf, 1);
      };
      Body2.prototype.getPosition = function() {
        return this.m_xf.p;
      };
      Body2.prototype.setPosition = function(p) {
        this.setTransform(p, this.m_sweep.a);
      };
      Body2.prototype.getAngle = function() {
        return this.m_sweep.a;
      };
      Body2.prototype.setAngle = function(angle) {
        this.setTransform(this.m_xf.p, angle);
      };
      Body2.prototype.getWorldCenter = function() {
        return this.m_sweep.c;
      };
      Body2.prototype.getLocalCenter = function() {
        return this.m_sweep.localCenter;
      };
      Body2.prototype.getLinearVelocity = function() {
        return this.m_linearVelocity;
      };
      Body2.prototype.getLinearVelocityFromWorldPoint = function(worldPoint) {
        var localCenter2 = Vec2.sub(worldPoint, this.m_sweep.c);
        return Vec2.add(this.m_linearVelocity, Vec2.crossNumVec2(this.m_angularVelocity, localCenter2));
      };
      Body2.prototype.getLinearVelocityFromLocalPoint = function(localPoint) {
        return this.getLinearVelocityFromWorldPoint(this.getWorldPoint(localPoint));
      };
      Body2.prototype.setLinearVelocity = function(v3) {
        if (this.m_type == STATIC) {
          return;
        }
        if (Vec2.dot(v3, v3) > 0) {
          this.setAwake(true);
        }
        this.m_linearVelocity.setVec2(v3);
      };
      Body2.prototype.getAngularVelocity = function() {
        return this.m_angularVelocity;
      };
      Body2.prototype.setAngularVelocity = function(w) {
        if (this.m_type == STATIC) {
          return;
        }
        if (w * w > 0) {
          this.setAwake(true);
        }
        this.m_angularVelocity = w;
      };
      Body2.prototype.getLinearDamping = function() {
        return this.m_linearDamping;
      };
      Body2.prototype.setLinearDamping = function(linearDamping) {
        this.m_linearDamping = linearDamping;
      };
      Body2.prototype.getAngularDamping = function() {
        return this.m_angularDamping;
      };
      Body2.prototype.setAngularDamping = function(angularDamping) {
        this.m_angularDamping = angularDamping;
      };
      Body2.prototype.getGravityScale = function() {
        return this.m_gravityScale;
      };
      Body2.prototype.setGravityScale = function(scale) {
        this.m_gravityScale = scale;
      };
      Body2.prototype.getMass = function() {
        return this.m_mass;
      };
      Body2.prototype.getInertia = function() {
        return this.m_I + this.m_mass * Vec2.dot(this.m_sweep.localCenter, this.m_sweep.localCenter);
      };
      Body2.prototype.getMassData = function(data) {
        data.mass = this.m_mass;
        data.I = this.getInertia();
        copyVec2(data.center, this.m_sweep.localCenter);
      };
      Body2.prototype.resetMassData = function() {
        this.m_mass = 0;
        this.m_invMass = 0;
        this.m_I = 0;
        this.m_invI = 0;
        zeroVec2(this.m_sweep.localCenter);
        if (this.isStatic() || this.isKinematic()) {
          copyVec2(this.m_sweep.c0, this.m_xf.p);
          copyVec2(this.m_sweep.c, this.m_xf.p);
          this.m_sweep.a0 = this.m_sweep.a;
          return;
        }
        zeroVec2(localCenter);
        for (var f = this.m_fixtureList; f; f = f.m_next) {
          if (f.m_density == 0) {
            continue;
          }
          var massData = { mass: 0, center: vec2(0, 0), I: 0 };
          f.getMassData(massData);
          this.m_mass += massData.mass;
          plusScaleVec2(localCenter, massData.mass, massData.center);
          this.m_I += massData.I;
        }
        if (this.m_mass > 0) {
          this.m_invMass = 1 / this.m_mass;
          scaleVec2(localCenter, this.m_invMass, localCenter);
        } else {
          this.m_mass = 1;
          this.m_invMass = 1;
        }
        if (this.m_I > 0 && this.m_fixedRotationFlag == false) {
          this.m_I -= this.m_mass * dotVec2(localCenter, localCenter);
          this.m_invI = 1 / this.m_I;
        } else {
          this.m_I = 0;
          this.m_invI = 0;
        }
        copyVec2(oldCenter, this.m_sweep.c);
        this.m_sweep.setLocalCenter(localCenter, this.m_xf);
        subVec2(shift, this.m_sweep.c, oldCenter);
        crossNumVec2(temp$6, this.m_angularVelocity, shift);
        plusVec2(this.m_linearVelocity, temp$6);
      };
      Body2.prototype.setMassData = function(massData) {
        if (this.isWorldLocked() == true) {
          return;
        }
        if (this.m_type != DYNAMIC) {
          return;
        }
        this.m_invMass = 0;
        this.m_I = 0;
        this.m_invI = 0;
        this.m_mass = massData.mass;
        if (this.m_mass <= 0) {
          this.m_mass = 1;
        }
        this.m_invMass = 1 / this.m_mass;
        if (massData.I > 0 && this.m_fixedRotationFlag == false) {
          this.m_I = massData.I - this.m_mass * dotVec2(massData.center, massData.center);
          this.m_invI = 1 / this.m_I;
        }
        copyVec2(oldCenter, this.m_sweep.c);
        this.m_sweep.setLocalCenter(massData.center, this.m_xf);
        subVec2(shift, this.m_sweep.c, oldCenter);
        crossNumVec2(temp$6, this.m_angularVelocity, shift);
        plusVec2(this.m_linearVelocity, temp$6);
      };
      Body2.prototype.applyForce = function(force, point2, wake) {
        if (wake === void 0) {
          wake = true;
        }
        if (this.m_type != DYNAMIC) {
          return;
        }
        if (wake && this.m_awakeFlag == false) {
          this.setAwake(true);
        }
        if (this.m_awakeFlag) {
          this.m_force.add(force);
          this.m_torque += Vec2.crossVec2Vec2(Vec2.sub(point2, this.m_sweep.c), force);
        }
      };
      Body2.prototype.applyForceToCenter = function(force, wake) {
        if (wake === void 0) {
          wake = true;
        }
        if (this.m_type != DYNAMIC) {
          return;
        }
        if (wake && this.m_awakeFlag == false) {
          this.setAwake(true);
        }
        if (this.m_awakeFlag) {
          this.m_force.add(force);
        }
      };
      Body2.prototype.applyTorque = function(torque, wake) {
        if (wake === void 0) {
          wake = true;
        }
        if (this.m_type != DYNAMIC) {
          return;
        }
        if (wake && this.m_awakeFlag == false) {
          this.setAwake(true);
        }
        if (this.m_awakeFlag) {
          this.m_torque += torque;
        }
      };
      Body2.prototype.applyLinearImpulse = function(impulse, point2, wake) {
        if (wake === void 0) {
          wake = true;
        }
        if (this.m_type != DYNAMIC) {
          return;
        }
        if (wake && this.m_awakeFlag == false) {
          this.setAwake(true);
        }
        if (this.m_awakeFlag) {
          this.m_linearVelocity.addMul(this.m_invMass, impulse);
          this.m_angularVelocity += this.m_invI * Vec2.crossVec2Vec2(Vec2.sub(point2, this.m_sweep.c), impulse);
        }
      };
      Body2.prototype.applyAngularImpulse = function(impulse, wake) {
        if (wake === void 0) {
          wake = true;
        }
        if (this.m_type != DYNAMIC) {
          return;
        }
        if (wake && this.m_awakeFlag == false) {
          this.setAwake(true);
        }
        if (this.m_awakeFlag) {
          this.m_angularVelocity += this.m_invI * impulse;
        }
      };
      Body2.prototype.shouldCollide = function(that) {
        if (this.m_type != DYNAMIC && that.m_type != DYNAMIC) {
          return false;
        }
        for (var jn = this.m_jointList; jn; jn = jn.next) {
          if (jn.other == that) {
            if (jn.joint.m_collideConnected == false) {
              return false;
            }
          }
        }
        return true;
      };
      Body2.prototype._addFixture = function(fixture) {
        if (this.isWorldLocked() == true) {
          return null;
        }
        if (this.m_activeFlag) {
          var broadPhase = this.m_world.m_broadPhase;
          fixture.createProxies(broadPhase, this.m_xf);
        }
        fixture.m_next = this.m_fixtureList;
        this.m_fixtureList = fixture;
        if (fixture.m_density > 0) {
          this.resetMassData();
        }
        this.m_world.m_newFixture = true;
        return fixture;
      };
      Body2.prototype.createFixture = function(shape, fixdef) {
        if (this.isWorldLocked() == true) {
          return null;
        }
        var fixture = new Fixture(this, shape, fixdef);
        this._addFixture(fixture);
        this.m_world.publish("add-fixture", fixture);
        return fixture;
      };
      Body2.prototype.destroyFixture = function(fixture) {
        if (this.isWorldLocked() == true) {
          return;
        }
        if (this.m_fixtureList === fixture) {
          this.m_fixtureList = fixture.m_next;
        } else {
          var node = this.m_fixtureList;
          while (node != null) {
            if (node.m_next === fixture) {
              node.m_next = fixture.m_next;
              break;
            }
            node = node.m_next;
          }
        }
        var edge = this.m_contactList;
        while (edge) {
          var c2 = edge.contact;
          edge = edge.next;
          var fixtureA = c2.getFixtureA();
          var fixtureB = c2.getFixtureB();
          if (fixture == fixtureA || fixture == fixtureB) {
            this.m_world.destroyContact(c2);
          }
        }
        if (this.m_activeFlag) {
          var broadPhase = this.m_world.m_broadPhase;
          fixture.destroyProxies(broadPhase);
        }
        fixture.m_body = null;
        fixture.m_next = null;
        this.m_world.publish("remove-fixture", fixture);
        this.resetMassData();
      };
      Body2.prototype.getWorldPoint = function(localPoint) {
        return Transform.mulVec2(this.m_xf, localPoint);
      };
      Body2.prototype.getWorldVector = function(localVector) {
        return Rot.mulVec2(this.m_xf.q, localVector);
      };
      Body2.prototype.getLocalPoint = function(worldPoint) {
        return Transform.mulTVec2(this.m_xf, worldPoint);
      };
      Body2.prototype.getLocalVector = function(worldVector) {
        return Rot.mulTVec2(this.m_xf.q, worldVector);
      };
      Body2.STATIC = "static";
      Body2.KINEMATIC = "kinematic";
      Body2.DYNAMIC = "dynamic";
      return Body2;
    })();
    var JointEdge = /* @__PURE__ */ (function() {
      function JointEdge2() {
        this.other = null;
        this.joint = null;
        this.prev = null;
        this.next = null;
      }
      return JointEdge2;
    })();
    var Joint = (function() {
      function Joint2(def, bodyA, bodyB) {
        this.m_type = "unknown-joint";
        this.m_prev = null;
        this.m_next = null;
        this.m_edgeA = new JointEdge();
        this.m_edgeB = new JointEdge();
        this.m_islandFlag = false;
        this.style = {};
        this.appData = {};
        bodyA = "bodyA" in def ? def.bodyA : bodyA;
        bodyB = "bodyB" in def ? def.bodyB : bodyB;
        this.m_bodyA = bodyA;
        this.m_bodyB = bodyB;
        this.m_collideConnected = !!def.collideConnected;
        this.m_userData = def.userData;
        if (typeof def.style === "object" && def.style !== null) {
          this.style = def.style;
        }
      }
      Joint2.prototype.isActive = function() {
        return this.m_bodyA.isActive() && this.m_bodyB.isActive();
      };
      Joint2.prototype.getType = function() {
        return this.m_type;
      };
      Joint2.prototype.getBodyA = function() {
        return this.m_bodyA;
      };
      Joint2.prototype.getBodyB = function() {
        return this.m_bodyB;
      };
      Joint2.prototype.getNext = function() {
        return this.m_next;
      };
      Joint2.prototype.getUserData = function() {
        return this.m_userData;
      };
      Joint2.prototype.setUserData = function(data) {
        this.m_userData = data;
      };
      Joint2.prototype.getCollideConnected = function() {
        return this.m_collideConnected;
      };
      Joint2.prototype.shiftOrigin = function(newOrigin) {
      };
      Joint2.prototype._resetAnchors = function(def) {
        return this._reset(def);
      };
      return Joint2;
    })();
    var stats = { gjkCalls: 0, gjkIters: 0, gjkMaxIters: 0, toiTime: 0, toiMaxTime: 0, toiCalls: 0, toiIters: 0, toiMaxIters: 0, toiRootIters: 0, toiMaxRootIters: 0, toString: function(newline) {
      newline = typeof newline === "string" ? newline : "\n";
      var string = "";
      for (var name_1 in this) {
        if (typeof this[name_1] !== "function" && typeof this[name_1] !== "object") {
          string += name_1 + ": " + this[name_1] + newline;
        }
      }
      return string;
    } };
    var now = function() {
      return Date.now();
    };
    var diff = function(time) {
      return Date.now() - time;
    };
    const Timer = { now, diff };
    var math_max$4 = Math.max;
    var temp$5 = vec2(0, 0);
    var normal$4 = vec2(0, 0);
    var e12 = vec2(0, 0);
    var e13 = vec2(0, 0);
    var e23 = vec2(0, 0);
    var temp1 = vec2(0, 0);
    var temp2 = vec2(0, 0);
    stats.gjkCalls = 0;
    stats.gjkIters = 0;
    stats.gjkMaxIters = 0;
    var DistanceInput = (function() {
      function DistanceInput2() {
        this.proxyA = new DistanceProxy();
        this.proxyB = new DistanceProxy();
        this.transformA = Transform.identity();
        this.transformB = Transform.identity();
        this.useRadii = false;
      }
      DistanceInput2.prototype.recycle = function() {
        this.proxyA.recycle();
        this.proxyB.recycle();
        this.transformA.setIdentity();
        this.transformB.setIdentity();
        this.useRadii = false;
      };
      return DistanceInput2;
    })();
    var DistanceOutput = (function() {
      function DistanceOutput2() {
        this.pointA = vec2(0, 0);
        this.pointB = vec2(0, 0);
        this.distance = 0;
        this.iterations = 0;
      }
      DistanceOutput2.prototype.recycle = function() {
        zeroVec2(this.pointA);
        zeroVec2(this.pointB);
        this.distance = 0;
        this.iterations = 0;
      };
      return DistanceOutput2;
    })();
    var SimplexCache = (function() {
      function SimplexCache2() {
        this.metric = 0;
        this.indexA = [];
        this.indexB = [];
        this.count = 0;
      }
      SimplexCache2.prototype.recycle = function() {
        this.metric = 0;
        this.indexA.length = 0;
        this.indexB.length = 0;
        this.count = 0;
      };
      return SimplexCache2;
    })();
    var Distance = function(output2, cache2, input2) {
      ++stats.gjkCalls;
      var proxyA = input2.proxyA;
      var proxyB = input2.proxyB;
      var xfA2 = input2.transformA;
      var xfB2 = input2.transformB;
      simplex.recycle();
      simplex.readCache(cache2, proxyA, xfA2, proxyB, xfB2);
      var vertices = simplex.m_v;
      var k_maxIters = SettingsInternal.maxDistanceIterations;
      var saveA = [];
      var saveB = [];
      var saveCount = 0;
      var iter = 0;
      while (iter < k_maxIters) {
        saveCount = simplex.m_count;
        for (var i = 0; i < saveCount; ++i) {
          saveA[i] = vertices[i].indexA;
          saveB[i] = vertices[i].indexB;
        }
        simplex.solve();
        if (simplex.m_count === 3) {
          break;
        }
        var d2 = simplex.getSearchDirection();
        if (lengthSqrVec2(d2) < EPSILON * EPSILON) {
          break;
        }
        var vertex = vertices[simplex.m_count];
        vertex.indexA = proxyA.getSupport(derotVec2(temp$5, xfA2.q, scaleVec2(temp$5, -1, d2)));
        transformVec2(vertex.wA, xfA2, proxyA.getVertex(vertex.indexA));
        vertex.indexB = proxyB.getSupport(derotVec2(temp$5, xfB2.q, d2));
        transformVec2(vertex.wB, xfB2, proxyB.getVertex(vertex.indexB));
        subVec2(vertex.w, vertex.wB, vertex.wA);
        ++iter;
        ++stats.gjkIters;
        var duplicate = false;
        for (var i = 0; i < saveCount; ++i) {
          if (vertex.indexA === saveA[i] && vertex.indexB === saveB[i]) {
            duplicate = true;
            break;
          }
        }
        if (duplicate) {
          break;
        }
        ++simplex.m_count;
      }
      stats.gjkMaxIters = math_max$4(stats.gjkMaxIters, iter);
      simplex.getWitnessPoints(output2.pointA, output2.pointB);
      output2.distance = distVec2(output2.pointA, output2.pointB);
      output2.iterations = iter;
      simplex.writeCache(cache2);
      if (input2.useRadii) {
        var rA2 = proxyA.m_radius;
        var rB2 = proxyB.m_radius;
        if (output2.distance > rA2 + rB2 && output2.distance > EPSILON) {
          output2.distance -= rA2 + rB2;
          subVec2(normal$4, output2.pointB, output2.pointA);
          normalizeVec2(normal$4);
          plusScaleVec2(output2.pointA, rA2, normal$4);
          minusScaleVec2(output2.pointB, rB2, normal$4);
        } else {
          var p = subVec2(temp$5, output2.pointA, output2.pointB);
          copyVec2(output2.pointA, p);
          copyVec2(output2.pointB, p);
          output2.distance = 0;
        }
      }
    };
    var DistanceProxy = (function() {
      function DistanceProxy2() {
        this.m_vertices = [];
        this.m_count = 0;
        this.m_radius = 0;
      }
      DistanceProxy2.prototype.recycle = function() {
        this.m_vertices.length = 0;
        this.m_count = 0;
        this.m_radius = 0;
      };
      DistanceProxy2.prototype.getVertexCount = function() {
        return this.m_count;
      };
      DistanceProxy2.prototype.getVertex = function(index) {
        return this.m_vertices[index];
      };
      DistanceProxy2.prototype.getSupport = function(d2) {
        var bestIndex = -1;
        var bestValue = -Infinity;
        for (var i = 0; i < this.m_count; ++i) {
          var value = dotVec2(this.m_vertices[i], d2);
          if (value > bestValue) {
            bestIndex = i;
            bestValue = value;
          }
        }
        return bestIndex;
      };
      DistanceProxy2.prototype.getSupportVertex = function(d2) {
        return this.m_vertices[this.getSupport(d2)];
      };
      DistanceProxy2.prototype.set = function(shape, index) {
        shape.computeDistanceProxy(this, index);
      };
      DistanceProxy2.prototype.setVertices = function(vertices, count, radius) {
        this.m_vertices = vertices;
        this.m_count = count;
        this.m_radius = radius;
      };
      return DistanceProxy2;
    })();
    var SimplexVertex = (function() {
      function SimplexVertex2() {
        this.wA = vec2(0, 0);
        this.indexA = 0;
        this.wB = vec2(0, 0);
        this.indexB = 0;
        this.w = vec2(0, 0);
        this.a = 0;
      }
      SimplexVertex2.prototype.recycle = function() {
        this.indexA = 0;
        this.indexB = 0;
        zeroVec2(this.wA);
        zeroVec2(this.wB);
        zeroVec2(this.w);
        this.a = 0;
      };
      SimplexVertex2.prototype.set = function(v3) {
        this.indexA = v3.indexA;
        this.indexB = v3.indexB;
        copyVec2(this.wA, v3.wA);
        copyVec2(this.wB, v3.wB);
        copyVec2(this.w, v3.w);
        this.a = v3.a;
      };
      return SimplexVertex2;
    })();
    var searchDirection_reuse = vec2(0, 0);
    var closestPoint_reuse = vec2(0, 0);
    var Simplex = (function() {
      function Simplex2() {
        this.m_v1 = new SimplexVertex();
        this.m_v2 = new SimplexVertex();
        this.m_v3 = new SimplexVertex();
        this.m_v = [this.m_v1, this.m_v2, this.m_v3];
      }
      Simplex2.prototype.recycle = function() {
        this.m_v1.recycle();
        this.m_v2.recycle();
        this.m_v3.recycle();
        this.m_count = 0;
      };
      Simplex2.prototype.toString = function() {
        if (this.m_count === 3) {
          return ["+" + this.m_count, this.m_v1.a, this.m_v1.wA.x, this.m_v1.wA.y, this.m_v1.wB.x, this.m_v1.wB.y, this.m_v2.a, this.m_v2.wA.x, this.m_v2.wA.y, this.m_v2.wB.x, this.m_v2.wB.y, this.m_v3.a, this.m_v3.wA.x, this.m_v3.wA.y, this.m_v3.wB.x, this.m_v3.wB.y].toString();
        } else if (this.m_count === 2) {
          return ["+" + this.m_count, this.m_v1.a, this.m_v1.wA.x, this.m_v1.wA.y, this.m_v1.wB.x, this.m_v1.wB.y, this.m_v2.a, this.m_v2.wA.x, this.m_v2.wA.y, this.m_v2.wB.x, this.m_v2.wB.y].toString();
        } else if (this.m_count === 1) {
          return ["+" + this.m_count, this.m_v1.a, this.m_v1.wA.x, this.m_v1.wA.y, this.m_v1.wB.x, this.m_v1.wB.y].toString();
        } else {
          return "+" + this.m_count;
        }
      };
      Simplex2.prototype.readCache = function(cache2, proxyA, transformA, proxyB, transformB) {
        this.m_count = cache2.count;
        for (var i = 0; i < this.m_count; ++i) {
          var v3 = this.m_v[i];
          v3.indexA = cache2.indexA[i];
          v3.indexB = cache2.indexB[i];
          var wALocal = proxyA.getVertex(v3.indexA);
          var wBLocal = proxyB.getVertex(v3.indexB);
          transformVec2(v3.wA, transformA, wALocal);
          transformVec2(v3.wB, transformB, wBLocal);
          subVec2(v3.w, v3.wB, v3.wA);
          v3.a = 0;
        }
        if (this.m_count > 1) {
          var metric1 = cache2.metric;
          var metric2 = this.getMetric();
          if (metric2 < 0.5 * metric1 || 2 * metric1 < metric2 || metric2 < EPSILON) {
            this.m_count = 0;
          }
        }
        if (this.m_count === 0) {
          var v3 = this.m_v[0];
          v3.indexA = 0;
          v3.indexB = 0;
          var wALocal = proxyA.getVertex(0);
          var wBLocal = proxyB.getVertex(0);
          transformVec2(v3.wA, transformA, wALocal);
          transformVec2(v3.wB, transformB, wBLocal);
          subVec2(v3.w, v3.wB, v3.wA);
          v3.a = 1;
          this.m_count = 1;
        }
      };
      Simplex2.prototype.writeCache = function(cache2) {
        cache2.metric = this.getMetric();
        cache2.count = this.m_count;
        for (var i = 0; i < this.m_count; ++i) {
          cache2.indexA[i] = this.m_v[i].indexA;
          cache2.indexB[i] = this.m_v[i].indexB;
        }
      };
      Simplex2.prototype.getSearchDirection = function() {
        var v13 = this.m_v1;
        var v22 = this.m_v2;
        switch (this.m_count) {
          case 1:
            return setVec2(searchDirection_reuse, -v13.w.x, -v13.w.y);
          case 2: {
            subVec2(e12, v22.w, v13.w);
            var sgn = -crossVec2Vec2(e12, v13.w);
            if (sgn > 0) {
              return setVec2(searchDirection_reuse, -e12.y, e12.x);
            } else {
              return setVec2(searchDirection_reuse, e12.y, -e12.x);
            }
          }
          default:
            return zeroVec2(searchDirection_reuse);
        }
      };
      Simplex2.prototype.getClosestPoint = function() {
        var v13 = this.m_v1;
        var v22 = this.m_v2;
        switch (this.m_count) {
          case 0:
            return zeroVec2(closestPoint_reuse);
          case 1:
            return copyVec2(closestPoint_reuse, v13.w);
          case 2:
            return combine2Vec2(closestPoint_reuse, v13.a, v13.w, v22.a, v22.w);
          case 3:
            return zeroVec2(closestPoint_reuse);
          default:
            return zeroVec2(closestPoint_reuse);
        }
      };
      Simplex2.prototype.getWitnessPoints = function(pA2, pB2) {
        var v13 = this.m_v1;
        var v22 = this.m_v2;
        var v3 = this.m_v3;
        switch (this.m_count) {
          case 0:
            break;
          case 1:
            copyVec2(pA2, v13.wA);
            copyVec2(pB2, v13.wB);
            break;
          case 2:
            combine2Vec2(pA2, v13.a, v13.wA, v22.a, v22.wA);
            combine2Vec2(pB2, v13.a, v13.wB, v22.a, v22.wB);
            break;
          case 3:
            combine3Vec2(pA2, v13.a, v13.wA, v22.a, v22.wA, v3.a, v3.wA);
            copyVec2(pB2, pA2);
            break;
        }
      };
      Simplex2.prototype.getMetric = function() {
        switch (this.m_count) {
          case 0:
            return 0;
          case 1:
            return 0;
          case 2:
            return distVec2(this.m_v1.w, this.m_v2.w);
          case 3:
            return crossVec2Vec2(subVec2(temp1, this.m_v2.w, this.m_v1.w), subVec2(temp2, this.m_v3.w, this.m_v1.w));
          default:
            return 0;
        }
      };
      Simplex2.prototype.solve = function() {
        switch (this.m_count) {
          case 1:
            break;
          case 2:
            this.solve2();
            break;
          case 3:
            this.solve3();
            break;
        }
      };
      Simplex2.prototype.solve2 = function() {
        var w1 = this.m_v1.w;
        var w2 = this.m_v2.w;
        subVec2(e12, w2, w1);
        var d12_2 = -dotVec2(w1, e12);
        if (d12_2 <= 0) {
          this.m_v1.a = 1;
          this.m_count = 1;
          return;
        }
        var d12_1 = dotVec2(w2, e12);
        if (d12_1 <= 0) {
          this.m_v2.a = 1;
          this.m_count = 1;
          this.m_v1.set(this.m_v2);
          return;
        }
        var inv_d12 = 1 / (d12_1 + d12_2);
        this.m_v1.a = d12_1 * inv_d12;
        this.m_v2.a = d12_2 * inv_d12;
        this.m_count = 2;
      };
      Simplex2.prototype.solve3 = function() {
        var w1 = this.m_v1.w;
        var w2 = this.m_v2.w;
        var w3 = this.m_v3.w;
        subVec2(e12, w2, w1);
        var w1e12 = dotVec2(w1, e12);
        var w2e12 = dotVec2(w2, e12);
        var d12_1 = w2e12;
        var d12_2 = -w1e12;
        subVec2(e13, w3, w1);
        var w1e13 = dotVec2(w1, e13);
        var w3e13 = dotVec2(w3, e13);
        var d13_1 = w3e13;
        var d13_2 = -w1e13;
        subVec2(e23, w3, w2);
        var w2e23 = dotVec2(w2, e23);
        var w3e23 = dotVec2(w3, e23);
        var d23_1 = w3e23;
        var d23_2 = -w2e23;
        var n123 = crossVec2Vec2(e12, e13);
        var d123_1 = n123 * crossVec2Vec2(w2, w3);
        var d123_2 = n123 * crossVec2Vec2(w3, w1);
        var d123_3 = n123 * crossVec2Vec2(w1, w2);
        if (d12_2 <= 0 && d13_2 <= 0) {
          this.m_v1.a = 1;
          this.m_count = 1;
          return;
        }
        if (d12_1 > 0 && d12_2 > 0 && d123_3 <= 0) {
          var inv_d12 = 1 / (d12_1 + d12_2);
          this.m_v1.a = d12_1 * inv_d12;
          this.m_v2.a = d12_2 * inv_d12;
          this.m_count = 2;
          return;
        }
        if (d13_1 > 0 && d13_2 > 0 && d123_2 <= 0) {
          var inv_d13 = 1 / (d13_1 + d13_2);
          this.m_v1.a = d13_1 * inv_d13;
          this.m_v3.a = d13_2 * inv_d13;
          this.m_count = 2;
          this.m_v2.set(this.m_v3);
          return;
        }
        if (d12_1 <= 0 && d23_2 <= 0) {
          this.m_v2.a = 1;
          this.m_count = 1;
          this.m_v1.set(this.m_v2);
          return;
        }
        if (d13_1 <= 0 && d23_1 <= 0) {
          this.m_v3.a = 1;
          this.m_count = 1;
          this.m_v1.set(this.m_v3);
          return;
        }
        if (d23_1 > 0 && d23_2 > 0 && d123_1 <= 0) {
          var inv_d23 = 1 / (d23_1 + d23_2);
          this.m_v2.a = d23_1 * inv_d23;
          this.m_v3.a = d23_2 * inv_d23;
          this.m_count = 2;
          this.m_v1.set(this.m_v3);
          return;
        }
        var inv_d123 = 1 / (d123_1 + d123_2 + d123_3);
        this.m_v1.a = d123_1 * inv_d123;
        this.m_v2.a = d123_2 * inv_d123;
        this.m_v3.a = d123_3 * inv_d123;
        this.m_count = 3;
      };
      return Simplex2;
    })();
    var simplex = new Simplex();
    var input$1 = new DistanceInput();
    var cache$1 = new SimplexCache();
    var output$1 = new DistanceOutput();
    var testOverlap = function(shapeA, indexA, shapeB, indexB, xfA2, xfB2) {
      input$1.recycle();
      input$1.proxyA.set(shapeA, indexA);
      input$1.proxyB.set(shapeB, indexB);
      copyTransform(input$1.transformA, xfA2);
      copyTransform(input$1.transformB, xfB2);
      input$1.useRadii = true;
      output$1.recycle();
      cache$1.recycle();
      Distance(output$1, cache$1, input$1);
      return output$1.distance < 10 * EPSILON;
    };
    Distance.testOverlap = testOverlap;
    Distance.Input = DistanceInput;
    Distance.Output = DistanceOutput;
    Distance.Proxy = DistanceProxy;
    Distance.Cache = SimplexCache;
    var ShapeCastInput = (function() {
      function ShapeCastInput2() {
        this.proxyA = new DistanceProxy();
        this.proxyB = new DistanceProxy();
        this.transformA = Transform.identity();
        this.transformB = Transform.identity();
        this.translationB = Vec2.zero();
      }
      ShapeCastInput2.prototype.recycle = function() {
        this.proxyA.recycle();
        this.proxyB.recycle();
        this.transformA.setIdentity();
        this.transformB.setIdentity();
        zeroVec2(this.translationB);
      };
      return ShapeCastInput2;
    })();
    var ShapeCastOutput = /* @__PURE__ */ (function() {
      function ShapeCastOutput2() {
        this.point = Vec2.zero();
        this.normal = Vec2.zero();
        this.lambda = 1;
        this.iterations = 0;
      }
      return ShapeCastOutput2;
    })();
    var ShapeCast = function(output2, input2) {
      output2.iterations = 0;
      output2.lambda = 1;
      output2.normal.setZero();
      output2.point.setZero();
      var proxyA = input2.proxyA;
      var proxyB = input2.proxyB;
      var radiusA = math_max$4(proxyA.m_radius, SettingsInternal.polygonRadius);
      var radiusB = math_max$4(proxyB.m_radius, SettingsInternal.polygonRadius);
      var radius = radiusA + radiusB;
      var xfA2 = input2.transformA;
      var xfB2 = input2.transformB;
      var r = input2.translationB;
      var n2 = Vec2.zero();
      var lambda = 0;
      var simplex2 = new Simplex();
      simplex2.m_count = 0;
      var vertices = simplex2.m_v;
      var indexA = proxyA.getSupport(Rot.mulTVec2(xfA2.q, Vec2.neg(r)));
      var wA = Transform.mulVec2(xfA2, proxyA.getVertex(indexA));
      var indexB = proxyB.getSupport(Rot.mulTVec2(xfB2.q, r));
      var wB = Transform.mulVec2(xfB2, proxyB.getVertex(indexB));
      var v3 = Vec2.sub(wA, wB);
      var sigma = math_max$4(SettingsInternal.polygonRadius, radius - SettingsInternal.polygonRadius);
      var tolerance = 0.5 * SettingsInternal.linearSlop;
      var k_maxIters = 20;
      var iter = 0;
      while (iter < k_maxIters && v3.length() - sigma > tolerance) {
        output2.iterations += 1;
        indexA = proxyA.getSupport(Rot.mulTVec2(xfA2.q, Vec2.neg(v3)));
        wA = Transform.mulVec2(xfA2, proxyA.getVertex(indexA));
        indexB = proxyB.getSupport(Rot.mulTVec2(xfB2.q, v3));
        wB = Transform.mulVec2(xfB2, proxyB.getVertex(indexB));
        var p = Vec2.sub(wA, wB);
        v3.normalize();
        var vp = Vec2.dot(v3, p);
        var vr = Vec2.dot(v3, r);
        if (vp - sigma > lambda * vr) {
          if (vr <= 0) {
            return false;
          }
          lambda = (vp - sigma) / vr;
          if (lambda > 1) {
            return false;
          }
          n2.setMul(-1, v3);
          simplex2.m_count = 0;
        }
        var vertex = vertices[simplex2.m_count];
        vertex.indexA = indexB;
        vertex.wA = Vec2.combine(1, wB, lambda, r);
        vertex.indexB = indexA;
        vertex.wB = wA;
        vertex.w = Vec2.sub(vertex.wB, vertex.wA);
        vertex.a = 1;
        simplex2.m_count += 1;
        switch (simplex2.m_count) {
          case 1:
            break;
          case 2:
            simplex2.solve2();
            break;
          case 3:
            simplex2.solve3();
            break;
        }
        if (simplex2.m_count == 3) {
          return false;
        }
        v3.setVec2(simplex2.getClosestPoint());
        ++iter;
      }
      if (iter == 0) {
        return false;
      }
      var pointA2 = Vec2.zero();
      var pointB2 = Vec2.zero();
      simplex2.getWitnessPoints(pointB2, pointA2);
      if (v3.lengthSquared() > 0) {
        n2.setMul(-1, v3);
        n2.normalize();
      }
      output2.point = Vec2.combine(1, pointA2, radiusA, n2);
      output2.normal = n2;
      output2.lambda = lambda;
      output2.iterations = iter;
      return true;
    };
    var math_abs$7 = Math.abs;
    var math_max$3 = Math.max;
    var TOIInput = (function() {
      function TOIInput2() {
        this.proxyA = new DistanceProxy();
        this.proxyB = new DistanceProxy();
        this.sweepA = new Sweep();
        this.sweepB = new Sweep();
      }
      TOIInput2.prototype.recycle = function() {
        this.proxyA.recycle();
        this.proxyB.recycle();
        this.sweepA.recycle();
        this.sweepB.recycle();
        this.tMax = -1;
      };
      return TOIInput2;
    })();
    exports2.TOIOutputState = void 0;
    (function(TOIOutputState2) {
      TOIOutputState2[TOIOutputState2["e_unset"] = -1] = "e_unset";
      TOIOutputState2[TOIOutputState2["e_unknown"] = 0] = "e_unknown";
      TOIOutputState2[TOIOutputState2["e_failed"] = 1] = "e_failed";
      TOIOutputState2[TOIOutputState2["e_overlapped"] = 2] = "e_overlapped";
      TOIOutputState2[TOIOutputState2["e_touching"] = 3] = "e_touching";
      TOIOutputState2[TOIOutputState2["e_separated"] = 4] = "e_separated";
    })(exports2.TOIOutputState || (exports2.TOIOutputState = {}));
    var TOIOutput = (function() {
      function TOIOutput2() {
        this.state = exports2.TOIOutputState.e_unset;
        this.t = -1;
      }
      TOIOutput2.prototype.recycle = function() {
        this.state = exports2.TOIOutputState.e_unset;
        this.t = -1;
      };
      return TOIOutput2;
    })();
    stats.toiTime = 0;
    stats.toiMaxTime = 0;
    stats.toiCalls = 0;
    stats.toiIters = 0;
    stats.toiMaxIters = 0;
    stats.toiRootIters = 0;
    stats.toiMaxRootIters = 0;
    var distanceInput = new DistanceInput();
    var distanceOutput = new DistanceOutput();
    var cache = new SimplexCache();
    var xfA$1 = transform(0, 0, 0);
    var xfB$1 = transform(0, 0, 0);
    var temp$4 = vec2(0, 0);
    var pointA$2 = vec2(0, 0);
    var pointB$2 = vec2(0, 0);
    var normal$3 = vec2(0, 0);
    var axisA = vec2(0, 0);
    var axisB = vec2(0, 0);
    var localPointA = vec2(0, 0);
    var localPointB = vec2(0, 0);
    var TimeOfImpact = function(output2, input2) {
      var timer = Timer.now();
      ++stats.toiCalls;
      output2.state = exports2.TOIOutputState.e_unknown;
      output2.t = input2.tMax;
      var proxyA = input2.proxyA;
      var proxyB = input2.proxyB;
      var sweepA = input2.sweepA;
      var sweepB = input2.sweepB;
      sweepA.normalize();
      sweepB.normalize();
      var tMax = input2.tMax;
      var totalRadius = proxyA.m_radius + proxyB.m_radius;
      var target = math_max$3(SettingsInternal.linearSlop, totalRadius - 3 * SettingsInternal.linearSlop);
      var tolerance = 0.25 * SettingsInternal.linearSlop;
      var t1 = 0;
      var k_maxIterations = SettingsInternal.maxTOIIterations;
      var iter = 0;
      cache.recycle();
      distanceInput.proxyA.setVertices(proxyA.m_vertices, proxyA.m_count, proxyA.m_radius);
      distanceInput.proxyB.setVertices(proxyB.m_vertices, proxyB.m_count, proxyB.m_radius);
      distanceInput.useRadii = false;
      while (true) {
        sweepA.getTransform(xfA$1, t1);
        sweepB.getTransform(xfB$1, t1);
        copyTransform(distanceInput.transformA, xfA$1);
        copyTransform(distanceInput.transformB, xfB$1);
        Distance(distanceOutput, cache, distanceInput);
        if (distanceOutput.distance <= 0) {
          output2.state = exports2.TOIOutputState.e_overlapped;
          output2.t = 0;
          break;
        }
        if (distanceOutput.distance < target + tolerance) {
          output2.state = exports2.TOIOutputState.e_touching;
          output2.t = t1;
          break;
        }
        separationFunction.initialize(cache, proxyA, sweepA, proxyB, sweepB, t1);
        var done = false;
        var t2 = tMax;
        var pushBackIter = 0;
        while (true) {
          var s2 = separationFunction.findMinSeparation(t2);
          if (s2 > target + tolerance) {
            output2.state = exports2.TOIOutputState.e_separated;
            output2.t = tMax;
            done = true;
            break;
          }
          if (s2 > target - tolerance) {
            t1 = t2;
            break;
          }
          var s1 = separationFunction.evaluate(t1);
          if (s1 < target - tolerance) {
            output2.state = exports2.TOIOutputState.e_failed;
            output2.t = t1;
            done = true;
            break;
          }
          if (s1 <= target + tolerance) {
            output2.state = exports2.TOIOutputState.e_touching;
            output2.t = t1;
            done = true;
            break;
          }
          var rootIterCount = 0;
          var a1 = t1;
          var a2 = t2;
          while (true) {
            var t = void 0;
            if (rootIterCount & 1) {
              t = a1 + (target - s1) * (a2 - a1) / (s2 - s1);
            } else {
              t = 0.5 * (a1 + a2);
            }
            ++rootIterCount;
            ++stats.toiRootIters;
            var s3 = separationFunction.evaluate(t);
            if (math_abs$7(s3 - target) < tolerance) {
              t2 = t;
              break;
            }
            if (s3 > target) {
              a1 = t;
              s1 = s3;
            } else {
              a2 = t;
              s2 = s3;
            }
            if (rootIterCount === 50) {
              break;
            }
          }
          stats.toiMaxRootIters = math_max$3(stats.toiMaxRootIters, rootIterCount);
          ++pushBackIter;
          if (pushBackIter === SettingsInternal.maxPolygonVertices) {
            break;
          }
        }
        ++iter;
        ++stats.toiIters;
        if (done) {
          break;
        }
        if (iter === k_maxIterations) {
          output2.state = exports2.TOIOutputState.e_failed;
          output2.t = t1;
          break;
        }
      }
      stats.toiMaxIters = math_max$3(stats.toiMaxIters, iter);
      var time = Timer.diff(timer);
      stats.toiMaxTime = math_max$3(stats.toiMaxTime, time);
      stats.toiTime += time;
      separationFunction.recycle();
    };
    var SeparationFunctionType;
    (function(SeparationFunctionType2) {
      SeparationFunctionType2[SeparationFunctionType2["e_unset"] = -1] = "e_unset";
      SeparationFunctionType2[SeparationFunctionType2["e_points"] = 1] = "e_points";
      SeparationFunctionType2[SeparationFunctionType2["e_faceA"] = 2] = "e_faceA";
      SeparationFunctionType2[SeparationFunctionType2["e_faceB"] = 3] = "e_faceB";
    })(SeparationFunctionType || (SeparationFunctionType = {}));
    var SeparationFunction = (function() {
      function SeparationFunction2() {
        this.m_proxyA = null;
        this.m_proxyB = null;
        this.m_sweepA = null;
        this.m_sweepB = null;
        this.m_type = SeparationFunctionType.e_unset;
        this.m_localPoint = vec2(0, 0);
        this.m_axis = vec2(0, 0);
        this.indexA = -1;
        this.indexB = -1;
      }
      SeparationFunction2.prototype.recycle = function() {
        this.m_proxyA = null;
        this.m_proxyB = null;
        this.m_sweepA = null;
        this.m_sweepB = null;
        this.m_type = SeparationFunctionType.e_unset;
        zeroVec2(this.m_localPoint);
        zeroVec2(this.m_axis);
        this.indexA = -1;
        this.indexB = -1;
      };
      SeparationFunction2.prototype.initialize = function(cache2, proxyA, sweepA, proxyB, sweepB, t1) {
        var count = cache2.count;
        this.m_proxyA = proxyA;
        this.m_proxyB = proxyB;
        this.m_sweepA = sweepA;
        this.m_sweepB = sweepB;
        this.m_sweepA.getTransform(xfA$1, t1);
        this.m_sweepB.getTransform(xfB$1, t1);
        if (count === 1) {
          this.m_type = SeparationFunctionType.e_points;
          var localPointA_1 = this.m_proxyA.getVertex(cache2.indexA[0]);
          var localPointB_1 = this.m_proxyB.getVertex(cache2.indexB[0]);
          transformVec2(pointA$2, xfA$1, localPointA_1);
          transformVec2(pointB$2, xfB$1, localPointB_1);
          subVec2(this.m_axis, pointB$2, pointA$2);
          var s2 = normalizeVec2Length(this.m_axis);
          return s2;
        } else if (cache2.indexA[0] === cache2.indexA[1]) {
          this.m_type = SeparationFunctionType.e_faceB;
          var localPointB1 = proxyB.getVertex(cache2.indexB[0]);
          var localPointB2 = proxyB.getVertex(cache2.indexB[1]);
          crossVec2Num(this.m_axis, subVec2(temp$4, localPointB2, localPointB1), 1);
          normalizeVec2(this.m_axis);
          rotVec2(normal$3, xfB$1.q, this.m_axis);
          combine2Vec2(this.m_localPoint, 0.5, localPointB1, 0.5, localPointB2);
          transformVec2(pointB$2, xfB$1, this.m_localPoint);
          var localPointA_2 = proxyA.getVertex(cache2.indexA[0]);
          var pointA_1 = Transform.mulVec2(xfA$1, localPointA_2);
          var s2 = dotVec2(pointA_1, normal$3) - dotVec2(pointB$2, normal$3);
          if (s2 < 0) {
            negVec2(this.m_axis);
            s2 = -s2;
          }
          return s2;
        } else {
          this.m_type = SeparationFunctionType.e_faceA;
          var localPointA1 = this.m_proxyA.getVertex(cache2.indexA[0]);
          var localPointA2 = this.m_proxyA.getVertex(cache2.indexA[1]);
          crossVec2Num(this.m_axis, subVec2(temp$4, localPointA2, localPointA1), 1);
          normalizeVec2(this.m_axis);
          rotVec2(normal$3, xfA$1.q, this.m_axis);
          combine2Vec2(this.m_localPoint, 0.5, localPointA1, 0.5, localPointA2);
          transformVec2(pointA$2, xfA$1, this.m_localPoint);
          var localPointB_2 = this.m_proxyB.getVertex(cache2.indexB[0]);
          transformVec2(pointB$2, xfB$1, localPointB_2);
          var s2 = dotVec2(pointB$2, normal$3) - dotVec2(pointA$2, normal$3);
          if (s2 < 0) {
            negVec2(this.m_axis);
            s2 = -s2;
          }
          return s2;
        }
      };
      SeparationFunction2.prototype.compute = function(find, t) {
        this.m_sweepA.getTransform(xfA$1, t);
        this.m_sweepB.getTransform(xfB$1, t);
        switch (this.m_type) {
          case SeparationFunctionType.e_points: {
            if (find) {
              derotVec2(axisA, xfA$1.q, this.m_axis);
              derotVec2(axisB, xfB$1.q, scaleVec2(temp$4, -1, this.m_axis));
              this.indexA = this.m_proxyA.getSupport(axisA);
              this.indexB = this.m_proxyB.getSupport(axisB);
            }
            copyVec2(localPointA, this.m_proxyA.getVertex(this.indexA));
            copyVec2(localPointB, this.m_proxyB.getVertex(this.indexB));
            transformVec2(pointA$2, xfA$1, localPointA);
            transformVec2(pointB$2, xfB$1, localPointB);
            var sep = dotVec2(pointB$2, this.m_axis) - dotVec2(pointA$2, this.m_axis);
            return sep;
          }
          case SeparationFunctionType.e_faceA: {
            rotVec2(normal$3, xfA$1.q, this.m_axis);
            transformVec2(pointA$2, xfA$1, this.m_localPoint);
            if (find) {
              derotVec2(axisB, xfB$1.q, scaleVec2(temp$4, -1, normal$3));
              this.indexA = -1;
              this.indexB = this.m_proxyB.getSupport(axisB);
            }
            copyVec2(localPointB, this.m_proxyB.getVertex(this.indexB));
            transformVec2(pointB$2, xfB$1, localPointB);
            var sep = dotVec2(pointB$2, normal$3) - dotVec2(pointA$2, normal$3);
            return sep;
          }
          case SeparationFunctionType.e_faceB: {
            rotVec2(normal$3, xfB$1.q, this.m_axis);
            transformVec2(pointB$2, xfB$1, this.m_localPoint);
            if (find) {
              derotVec2(axisA, xfA$1.q, scaleVec2(temp$4, -1, normal$3));
              this.indexB = -1;
              this.indexA = this.m_proxyA.getSupport(axisA);
            }
            copyVec2(localPointA, this.m_proxyA.getVertex(this.indexA));
            transformVec2(pointA$2, xfA$1, localPointA);
            var sep = dotVec2(pointA$2, normal$3) - dotVec2(pointB$2, normal$3);
            return sep;
          }
          default:
            if (find) {
              this.indexA = -1;
              this.indexB = -1;
            }
            return 0;
        }
      };
      SeparationFunction2.prototype.findMinSeparation = function(t) {
        return this.compute(true, t);
      };
      SeparationFunction2.prototype.evaluate = function(t) {
        return this.compute(false, t);
      };
      return SeparationFunction2;
    })();
    var separationFunction = new SeparationFunction();
    TimeOfImpact.Input = TOIInput;
    TimeOfImpact.Output = TOIOutput;
    var math_abs$6 = Math.abs;
    var math_sqrt$3 = Math.sqrt;
    var math_min$5 = Math.min;
    var TimeStep = (function() {
      function TimeStep2() {
        this.dt = 0;
        this.inv_dt = 0;
        this.velocityIterations = 0;
        this.positionIterations = 0;
        this.warmStarting = false;
        this.blockSolve = true;
        this.inv_dt0 = 0;
        this.dtRatio = 1;
      }
      TimeStep2.prototype.reset = function(dt) {
        if (this.dt > 0) {
          this.inv_dt0 = this.inv_dt;
        }
        this.dt = dt;
        this.inv_dt = dt == 0 ? 0 : 1 / dt;
        this.dtRatio = dt * this.inv_dt0;
      };
      return TimeStep2;
    })();
    var s_subStep = new TimeStep();
    var c = vec2(0, 0);
    var v = vec2(0, 0);
    var translation = vec2(0, 0);
    var input = new TOIInput();
    var output = new TOIOutput();
    var backup = new Sweep();
    var backup1 = new Sweep();
    var backup2 = new Sweep();
    var ContactImpulse = (function() {
      function ContactImpulse2(contact) {
        this.contact = contact;
        this.normals = [];
        this.tangents = [];
      }
      ContactImpulse2.prototype.recycle = function() {
        this.normals.length = 0;
        this.tangents.length = 0;
      };
      Object.defineProperty(ContactImpulse2.prototype, "normalImpulses", { get: function() {
        var contact = this.contact;
        var normals = this.normals;
        normals.length = 0;
        for (var p = 0; p < contact.v_points.length; ++p) {
          normals.push(contact.v_points[p].normalImpulse);
        }
        return normals;
      }, enumerable: false, configurable: true });
      Object.defineProperty(ContactImpulse2.prototype, "tangentImpulses", { get: function() {
        var contact = this.contact;
        var tangents = this.tangents;
        tangents.length = 0;
        for (var p = 0; p < contact.v_points.length; ++p) {
          tangents.push(contact.v_points[p].tangentImpulse);
        }
        return tangents;
      }, enumerable: false, configurable: true });
      return ContactImpulse2;
    })();
    var Solver = (function() {
      function Solver2(world) {
        this.m_world = world;
        this.m_stack = [];
        this.m_bodies = [];
        this.m_contacts = [];
        this.m_joints = [];
      }
      Solver2.prototype.clear = function() {
        this.m_stack.length = 0;
        this.m_bodies.length = 0;
        this.m_contacts.length = 0;
        this.m_joints.length = 0;
      };
      Solver2.prototype.addBody = function(body) {
        this.m_bodies.push(body);
      };
      Solver2.prototype.addContact = function(contact) {
        this.m_contacts.push(contact);
      };
      Solver2.prototype.addJoint = function(joint) {
        this.m_joints.push(joint);
      };
      Solver2.prototype.solveWorld = function(step) {
        var world = this.m_world;
        for (var b2 = world.m_bodyList; b2; b2 = b2.m_next) {
          b2.m_islandFlag = false;
        }
        for (var c_1 = world.m_contactList; c_1; c_1 = c_1.m_next) {
          c_1.m_islandFlag = false;
        }
        for (var j = world.m_jointList; j; j = j.m_next) {
          j.m_islandFlag = false;
        }
        var stack = this.m_stack;
        for (var seed = world.m_bodyList; seed; seed = seed.m_next) {
          if (seed.m_islandFlag) {
            continue;
          }
          if (seed.isAwake() == false || seed.isActive() == false) {
            continue;
          }
          if (seed.isStatic()) {
            continue;
          }
          this.clear();
          stack.push(seed);
          seed.m_islandFlag = true;
          while (stack.length > 0) {
            var b2 = stack.pop();
            this.addBody(b2);
            b2.m_awakeFlag = true;
            if (b2.isStatic()) {
              continue;
            }
            for (var ce = b2.m_contactList; ce; ce = ce.next) {
              var contact = ce.contact;
              if (contact.m_islandFlag) {
                continue;
              }
              if (contact.isEnabled() == false || contact.isTouching() == false) {
                continue;
              }
              var sensorA = contact.m_fixtureA.m_isSensor;
              var sensorB = contact.m_fixtureB.m_isSensor;
              if (sensorA || sensorB) {
                continue;
              }
              this.addContact(contact);
              contact.m_islandFlag = true;
              var other = ce.other;
              if (other.m_islandFlag) {
                continue;
              }
              stack.push(other);
              other.m_islandFlag = true;
            }
            for (var je = b2.m_jointList; je; je = je.next) {
              if (je.joint.m_islandFlag == true) {
                continue;
              }
              var other = je.other;
              if (other.isActive() == false) {
                continue;
              }
              this.addJoint(je.joint);
              je.joint.m_islandFlag = true;
              if (other.m_islandFlag) {
                continue;
              }
              stack.push(other);
              other.m_islandFlag = true;
            }
          }
          this.solveIsland(step);
          for (var i = 0; i < this.m_bodies.length; ++i) {
            var b2 = this.m_bodies[i];
            if (b2.isStatic()) {
              b2.m_islandFlag = false;
            }
          }
        }
      };
      Solver2.prototype.solveIsland = function(step) {
        var world = this.m_world;
        var gravity = world.m_gravity;
        var allowSleep = world.m_allowSleep;
        var h = step.dt;
        for (var i = 0; i < this.m_bodies.length; ++i) {
          var body = this.m_bodies[i];
          copyVec2(c, body.m_sweep.c);
          var a2 = body.m_sweep.a;
          copyVec2(v, body.m_linearVelocity);
          var w = body.m_angularVelocity;
          copyVec2(body.m_sweep.c0, body.m_sweep.c);
          body.m_sweep.a0 = body.m_sweep.a;
          if (body.isDynamic()) {
            plusScaleVec2(v, h * body.m_gravityScale, gravity);
            plusScaleVec2(v, h * body.m_invMass, body.m_force);
            w += h * body.m_invI * body.m_torque;
            scaleVec2(v, 1 / (1 + h * body.m_linearDamping), v);
            w *= 1 / (1 + h * body.m_angularDamping);
          }
          copyVec2(body.c_position.c, c);
          body.c_position.a = a2;
          copyVec2(body.c_velocity.v, v);
          body.c_velocity.w = w;
        }
        for (var i = 0; i < this.m_contacts.length; ++i) {
          var contact = this.m_contacts[i];
          contact.initConstraint(step);
        }
        for (var i = 0; i < this.m_contacts.length; ++i) {
          var contact = this.m_contacts[i];
          contact.initVelocityConstraint(step);
        }
        if (step.warmStarting) {
          for (var i = 0; i < this.m_contacts.length; ++i) {
            var contact = this.m_contacts[i];
            contact.warmStartConstraint(step);
          }
        }
        for (var i = 0; i < this.m_joints.length; ++i) {
          var joint = this.m_joints[i];
          joint.initVelocityConstraints(step);
        }
        for (var i = 0; i < step.velocityIterations; ++i) {
          for (var j = 0; j < this.m_joints.length; ++j) {
            var joint = this.m_joints[j];
            joint.solveVelocityConstraints(step);
          }
          for (var j = 0; j < this.m_contacts.length; ++j) {
            var contact = this.m_contacts[j];
            contact.solveVelocityConstraint(step);
          }
        }
        for (var i = 0; i < this.m_contacts.length; ++i) {
          var contact = this.m_contacts[i];
          contact.storeConstraintImpulses(step);
        }
        for (var i = 0; i < this.m_bodies.length; ++i) {
          var body = this.m_bodies[i];
          copyVec2(c, body.c_position.c);
          var a2 = body.c_position.a;
          copyVec2(v, body.c_velocity.v);
          var w = body.c_velocity.w;
          scaleVec2(translation, h, v);
          var translationLengthSqr = lengthSqrVec2(translation);
          if (translationLengthSqr > SettingsInternal.maxTranslationSquared) {
            var ratio = SettingsInternal.maxTranslation / math_sqrt$3(translationLengthSqr);
            mulVec2(v, ratio);
          }
          var rotation2 = h * w;
          if (rotation2 * rotation2 > SettingsInternal.maxRotationSquared) {
            var ratio = SettingsInternal.maxRotation / math_abs$6(rotation2);
            w *= ratio;
          }
          plusScaleVec2(c, h, v);
          a2 += h * w;
          copyVec2(body.c_position.c, c);
          body.c_position.a = a2;
          copyVec2(body.c_velocity.v, v);
          body.c_velocity.w = w;
        }
        var positionSolved = false;
        for (var i = 0; i < step.positionIterations; ++i) {
          var minSeparation = 0;
          for (var j = 0; j < this.m_contacts.length; ++j) {
            var contact = this.m_contacts[j];
            var separation = contact.solvePositionConstraint(step);
            minSeparation = math_min$5(minSeparation, separation);
          }
          var contactsOkay = minSeparation >= -3 * SettingsInternal.linearSlop;
          var jointsOkay = true;
          for (var j = 0; j < this.m_joints.length; ++j) {
            var joint = this.m_joints[j];
            var jointOkay = joint.solvePositionConstraints(step);
            jointsOkay = jointsOkay && jointOkay;
          }
          if (contactsOkay && jointsOkay) {
            positionSolved = true;
            break;
          }
        }
        for (var i = 0; i < this.m_bodies.length; ++i) {
          var body = this.m_bodies[i];
          copyVec2(body.m_sweep.c, body.c_position.c);
          body.m_sweep.a = body.c_position.a;
          copyVec2(body.m_linearVelocity, body.c_velocity.v);
          body.m_angularVelocity = body.c_velocity.w;
          body.synchronizeTransform();
        }
        this.postSolveIsland();
        if (allowSleep) {
          var minSleepTime = Infinity;
          var linTolSqr = SettingsInternal.linearSleepToleranceSqr;
          var angTolSqr = SettingsInternal.angularSleepToleranceSqr;
          for (var i = 0; i < this.m_bodies.length; ++i) {
            var body = this.m_bodies[i];
            if (body.isStatic()) {
              continue;
            }
            if (body.m_autoSleepFlag == false || body.m_angularVelocity * body.m_angularVelocity > angTolSqr || lengthSqrVec2(body.m_linearVelocity) > linTolSqr) {
              body.m_sleepTime = 0;
              minSleepTime = 0;
            } else {
              body.m_sleepTime += h;
              minSleepTime = math_min$5(minSleepTime, body.m_sleepTime);
            }
          }
          if (minSleepTime >= SettingsInternal.timeToSleep && positionSolved) {
            for (var i = 0; i < this.m_bodies.length; ++i) {
              var body = this.m_bodies[i];
              body.setAwake(false);
            }
          }
        }
      };
      Solver2.prototype.solveWorldTOI = function(step) {
        var world = this.m_world;
        if (world.m_stepComplete) {
          for (var b2 = world.m_bodyList; b2; b2 = b2.m_next) {
            b2.m_islandFlag = false;
            b2.m_sweep.alpha0 = 0;
          }
          for (var c_2 = world.m_contactList; c_2; c_2 = c_2.m_next) {
            c_2.m_toiFlag = false;
            c_2.m_islandFlag = false;
            c_2.m_toiCount = 0;
            c_2.m_toi = 1;
          }
        }
        while (true) {
          var minContact = null;
          var minAlpha = 1;
          for (var c_3 = world.m_contactList; c_3; c_3 = c_3.m_next) {
            if (c_3.isEnabled() == false) {
              continue;
            }
            if (c_3.m_toiCount > SettingsInternal.maxSubSteps) {
              continue;
            }
            var alpha = 1;
            if (c_3.m_toiFlag) {
              alpha = c_3.m_toi;
            } else {
              var fA_1 = c_3.getFixtureA();
              var fB_1 = c_3.getFixtureB();
              if (fA_1.isSensor() || fB_1.isSensor()) {
                continue;
              }
              var bA_1 = fA_1.getBody();
              var bB_1 = fB_1.getBody();
              var activeA = bA_1.isAwake() && !bA_1.isStatic();
              var activeB = bB_1.isAwake() && !bB_1.isStatic();
              if (activeA == false && activeB == false) {
                continue;
              }
              var collideA = bA_1.isBullet() || !bA_1.isDynamic();
              var collideB = bB_1.isBullet() || !bB_1.isDynamic();
              if (collideA == false && collideB == false) {
                continue;
              }
              var alpha0 = bA_1.m_sweep.alpha0;
              if (bA_1.m_sweep.alpha0 < bB_1.m_sweep.alpha0) {
                alpha0 = bB_1.m_sweep.alpha0;
                bA_1.m_sweep.advance(alpha0);
              } else if (bB_1.m_sweep.alpha0 < bA_1.m_sweep.alpha0) {
                alpha0 = bA_1.m_sweep.alpha0;
                bB_1.m_sweep.advance(alpha0);
              }
              var indexA = c_3.getChildIndexA();
              var indexB = c_3.getChildIndexB();
              input.proxyA.set(fA_1.getShape(), indexA);
              input.proxyB.set(fB_1.getShape(), indexB);
              input.sweepA.set(bA_1.m_sweep);
              input.sweepB.set(bB_1.m_sweep);
              input.tMax = 1;
              TimeOfImpact(output, input);
              var beta = output.t;
              if (output.state == exports2.TOIOutputState.e_touching) {
                alpha = math_min$5(alpha0 + (1 - alpha0) * beta, 1);
              } else {
                alpha = 1;
              }
              c_3.m_toi = alpha;
              c_3.m_toiFlag = true;
            }
            if (alpha < minAlpha) {
              minContact = c_3;
              minAlpha = alpha;
            }
          }
          if (minContact == null || 1 - 10 * EPSILON < minAlpha) {
            world.m_stepComplete = true;
            break;
          }
          var fA = minContact.getFixtureA();
          var fB = minContact.getFixtureB();
          var bA = fA.getBody();
          var bB = fB.getBody();
          backup1.set(bA.m_sweep);
          backup2.set(bB.m_sweep);
          bA.advance(minAlpha);
          bB.advance(minAlpha);
          minContact.update(world);
          minContact.m_toiFlag = false;
          ++minContact.m_toiCount;
          if (minContact.isEnabled() == false || minContact.isTouching() == false) {
            minContact.setEnabled(false);
            bA.m_sweep.set(backup1);
            bB.m_sweep.set(backup2);
            bA.synchronizeTransform();
            bB.synchronizeTransform();
            continue;
          }
          bA.setAwake(true);
          bB.setAwake(true);
          this.clear();
          this.addBody(bA);
          this.addBody(bB);
          this.addContact(minContact);
          bA.m_islandFlag = true;
          bB.m_islandFlag = true;
          minContact.m_islandFlag = true;
          var bodies = [bA, bB];
          for (var i = 0; i < bodies.length; ++i) {
            var body = bodies[i];
            if (body.isDynamic()) {
              for (var ce = body.m_contactList; ce; ce = ce.next) {
                var contact = ce.contact;
                if (contact.m_islandFlag) {
                  continue;
                }
                var other = ce.other;
                if (other.isDynamic() && !body.isBullet() && !other.isBullet()) {
                  continue;
                }
                var sensorA = contact.m_fixtureA.m_isSensor;
                var sensorB = contact.m_fixtureB.m_isSensor;
                if (sensorA || sensorB) {
                  continue;
                }
                backup.set(other.m_sweep);
                if (other.m_islandFlag == false) {
                  other.advance(minAlpha);
                }
                contact.update(world);
                if (contact.isEnabled() == false || contact.isTouching() == false) {
                  other.m_sweep.set(backup);
                  other.synchronizeTransform();
                  continue;
                }
                contact.m_islandFlag = true;
                this.addContact(contact);
                if (other.m_islandFlag) {
                  continue;
                }
                other.m_islandFlag = true;
                if (!other.isStatic()) {
                  other.setAwake(true);
                }
                this.addBody(other);
              }
            }
          }
          s_subStep.reset((1 - minAlpha) * step.dt);
          s_subStep.dtRatio = 1;
          s_subStep.positionIterations = 20;
          s_subStep.velocityIterations = step.velocityIterations;
          s_subStep.warmStarting = false;
          this.solveIslandTOI(s_subStep, bA, bB);
          for (var i = 0; i < this.m_bodies.length; ++i) {
            var body = this.m_bodies[i];
            body.m_islandFlag = false;
            if (!body.isDynamic()) {
              continue;
            }
            body.synchronizeFixtures();
            for (var ce = body.m_contactList; ce; ce = ce.next) {
              ce.contact.m_toiFlag = false;
              ce.contact.m_islandFlag = false;
            }
          }
          world.findNewContacts();
          if (world.m_subStepping) {
            world.m_stepComplete = false;
            break;
          }
        }
      };
      Solver2.prototype.solveIslandTOI = function(subStep, toiA, toiB) {
        for (var i = 0; i < this.m_bodies.length; ++i) {
          var body = this.m_bodies[i];
          copyVec2(body.c_position.c, body.m_sweep.c);
          body.c_position.a = body.m_sweep.a;
          copyVec2(body.c_velocity.v, body.m_linearVelocity);
          body.c_velocity.w = body.m_angularVelocity;
        }
        for (var i = 0; i < this.m_contacts.length; ++i) {
          var contact = this.m_contacts[i];
          contact.initConstraint(subStep);
        }
        for (var i = 0; i < subStep.positionIterations; ++i) {
          var minSeparation = 0;
          for (var j = 0; j < this.m_contacts.length; ++j) {
            var contact = this.m_contacts[j];
            var separation = contact.solvePositionConstraintTOI(subStep, toiA, toiB);
            minSeparation = math_min$5(minSeparation, separation);
          }
          var contactsOkay = minSeparation >= -1.5 * SettingsInternal.linearSlop;
          if (contactsOkay) {
            break;
          }
        }
        var i;
        copyVec2(toiA.m_sweep.c0, toiA.c_position.c);
        toiA.m_sweep.a0 = toiA.c_position.a;
        copyVec2(toiB.m_sweep.c0, toiB.c_position.c);
        toiB.m_sweep.a0 = toiB.c_position.a;
        for (var i = 0; i < this.m_contacts.length; ++i) {
          var contact = this.m_contacts[i];
          contact.initVelocityConstraint(subStep);
        }
        for (var i = 0; i < subStep.velocityIterations; ++i) {
          for (var j = 0; j < this.m_contacts.length; ++j) {
            var contact = this.m_contacts[j];
            contact.solveVelocityConstraint(subStep);
          }
        }
        var h = subStep.dt;
        for (var i = 0; i < this.m_bodies.length; ++i) {
          var body = this.m_bodies[i];
          copyVec2(c, body.c_position.c);
          var a2 = body.c_position.a;
          copyVec2(v, body.c_velocity.v);
          var w = body.c_velocity.w;
          scaleVec2(translation, h, v);
          var translationLengthSqr = lengthSqrVec2(translation);
          if (translationLengthSqr > SettingsInternal.maxTranslationSquared) {
            var ratio = SettingsInternal.maxTranslation / math_sqrt$3(translationLengthSqr);
            mulVec2(v, ratio);
          }
          var rotation2 = h * w;
          if (rotation2 * rotation2 > SettingsInternal.maxRotationSquared) {
            var ratio = SettingsInternal.maxRotation / math_abs$6(rotation2);
            w *= ratio;
          }
          plusScaleVec2(c, h, v);
          a2 += h * w;
          copyVec2(body.c_position.c, c);
          body.c_position.a = a2;
          copyVec2(body.c_velocity.v, v);
          body.c_velocity.w = w;
          copyVec2(body.m_sweep.c, c);
          body.m_sweep.a = a2;
          copyVec2(body.m_linearVelocity, v);
          body.m_angularVelocity = w;
          body.synchronizeTransform();
        }
        this.postSolveIsland();
      };
      Solver2.prototype.postSolveIsland = function() {
        for (var c_5 = 0; c_5 < this.m_contacts.length; ++c_5) {
          var contact = this.m_contacts[c_5];
          this.m_world.postSolve(contact, contact.m_impulse);
        }
      };
      return Solver2;
    })();
    Solver.TimeStep = TimeStep;
    var Mat22 = (function() {
      function Mat222(a2, b2, c2, d2) {
        if (typeof a2 === "object" && a2 !== null) {
          this.ex = Vec2.clone(a2);
          this.ey = Vec2.clone(b2);
        } else if (typeof a2 === "number") {
          this.ex = Vec2.neo(a2, c2);
          this.ey = Vec2.neo(b2, d2);
        } else {
          this.ex = Vec2.zero();
          this.ey = Vec2.zero();
        }
      }
      Mat222.prototype.toString = function() {
        return JSON.stringify(this);
      };
      Mat222.isValid = function(obj) {
        if (obj === null || typeof obj === "undefined") {
          return false;
        }
        return Vec2.isValid(obj.ex) && Vec2.isValid(obj.ey);
      };
      Mat222.assert = function(o) {
      };
      Mat222.prototype.set = function(a2, b2, c2, d2) {
        if (typeof a2 === "number" && typeof b2 === "number" && typeof c2 === "number" && typeof d2 === "number") {
          this.ex.setNum(a2, c2);
          this.ey.setNum(b2, d2);
        } else if (typeof a2 === "object" && typeof b2 === "object") {
          this.ex.setVec2(a2);
          this.ey.setVec2(b2);
        } else if (typeof a2 === "object") {
          this.ex.setVec2(a2.ex);
          this.ey.setVec2(a2.ey);
        } else ;
      };
      Mat222.prototype.setIdentity = function() {
        this.ex.x = 1;
        this.ey.x = 0;
        this.ex.y = 0;
        this.ey.y = 1;
      };
      Mat222.prototype.setZero = function() {
        this.ex.x = 0;
        this.ey.x = 0;
        this.ex.y = 0;
        this.ey.y = 0;
      };
      Mat222.prototype.getInverse = function() {
        var a2 = this.ex.x;
        var b2 = this.ey.x;
        var c2 = this.ex.y;
        var d2 = this.ey.y;
        var det = a2 * d2 - b2 * c2;
        if (det !== 0) {
          det = 1 / det;
        }
        var imx = new Mat222();
        imx.ex.x = det * d2;
        imx.ey.x = -det * b2;
        imx.ex.y = -det * c2;
        imx.ey.y = det * a2;
        return imx;
      };
      Mat222.prototype.solve = function(v3) {
        var a2 = this.ex.x;
        var b2 = this.ey.x;
        var c2 = this.ex.y;
        var d2 = this.ey.y;
        var det = a2 * d2 - b2 * c2;
        if (det !== 0) {
          det = 1 / det;
        }
        var w = Vec2.zero();
        w.x = det * (d2 * v3.x - b2 * v3.y);
        w.y = det * (a2 * v3.y - c2 * v3.x);
        return w;
      };
      Mat222.mul = function(mx, v3) {
        if (v3 && "x" in v3 && "y" in v3) {
          var x2 = mx.ex.x * v3.x + mx.ey.x * v3.y;
          var y = mx.ex.y * v3.x + mx.ey.y * v3.y;
          return Vec2.neo(x2, y);
        } else if (v3 && "ex" in v3 && "ey" in v3) {
          var a2 = mx.ex.x * v3.ex.x + mx.ey.x * v3.ex.y;
          var b2 = mx.ex.x * v3.ey.x + mx.ey.x * v3.ey.y;
          var c2 = mx.ex.y * v3.ex.x + mx.ey.y * v3.ex.y;
          var d2 = mx.ex.y * v3.ey.x + mx.ey.y * v3.ey.y;
          return new Mat222(a2, b2, c2, d2);
        }
      };
      Mat222.mulVec2 = function(mx, v3) {
        var x2 = mx.ex.x * v3.x + mx.ey.x * v3.y;
        var y = mx.ex.y * v3.x + mx.ey.y * v3.y;
        return Vec2.neo(x2, y);
      };
      Mat222.mulMat22 = function(mx, v3) {
        var a2 = mx.ex.x * v3.ex.x + mx.ey.x * v3.ex.y;
        var b2 = mx.ex.x * v3.ey.x + mx.ey.x * v3.ey.y;
        var c2 = mx.ex.y * v3.ex.x + mx.ey.y * v3.ex.y;
        var d2 = mx.ex.y * v3.ey.x + mx.ey.y * v3.ey.y;
        return new Mat222(a2, b2, c2, d2);
      };
      Mat222.mulT = function(mx, v3) {
        if (v3 && "x" in v3 && "y" in v3) {
          return Vec2.neo(Vec2.dot(v3, mx.ex), Vec2.dot(v3, mx.ey));
        } else if (v3 && "ex" in v3 && "ey" in v3) {
          var c1 = Vec2.neo(Vec2.dot(mx.ex, v3.ex), Vec2.dot(mx.ey, v3.ex));
          var c2 = Vec2.neo(Vec2.dot(mx.ex, v3.ey), Vec2.dot(mx.ey, v3.ey));
          return new Mat222(c1, c2);
        }
      };
      Mat222.mulTVec2 = function(mx, v3) {
        return Vec2.neo(Vec2.dot(v3, mx.ex), Vec2.dot(v3, mx.ey));
      };
      Mat222.mulTMat22 = function(mx, v3) {
        var c1 = Vec2.neo(Vec2.dot(mx.ex, v3.ex), Vec2.dot(mx.ey, v3.ex));
        var c2 = Vec2.neo(Vec2.dot(mx.ex, v3.ey), Vec2.dot(mx.ey, v3.ey));
        return new Mat222(c1, c2);
      };
      Mat222.abs = function(mx) {
        return new Mat222(Vec2.abs(mx.ex), Vec2.abs(mx.ey));
      };
      Mat222.add = function(mx1, mx2) {
        return new Mat222(Vec2.add(mx1.ex, mx2.ex), Vec2.add(mx1.ey, mx2.ey));
      };
      return Mat222;
    })();
    var math_sqrt$2 = Math.sqrt;
    var pointA$1 = vec2(0, 0);
    var pointB$1 = vec2(0, 0);
    var temp$3 = vec2(0, 0);
    var cA$1 = vec2(0, 0);
    var cB$1 = vec2(0, 0);
    var dist = vec2(0, 0);
    var planePoint$2 = vec2(0, 0);
    var clipPoint$1 = vec2(0, 0);
    exports2.ManifoldType = void 0;
    (function(ManifoldType2) {
      ManifoldType2[ManifoldType2["e_unset"] = -1] = "e_unset";
      ManifoldType2[ManifoldType2["e_circles"] = 0] = "e_circles";
      ManifoldType2[ManifoldType2["e_faceA"] = 1] = "e_faceA";
      ManifoldType2[ManifoldType2["e_faceB"] = 2] = "e_faceB";
    })(exports2.ManifoldType || (exports2.ManifoldType = {}));
    exports2.ContactFeatureType = void 0;
    (function(ContactFeatureType2) {
      ContactFeatureType2[ContactFeatureType2["e_unset"] = -1] = "e_unset";
      ContactFeatureType2[ContactFeatureType2["e_vertex"] = 0] = "e_vertex";
      ContactFeatureType2[ContactFeatureType2["e_face"] = 1] = "e_face";
    })(exports2.ContactFeatureType || (exports2.ContactFeatureType = {}));
    exports2.PointState = void 0;
    (function(PointState2) {
      PointState2[PointState2["nullState"] = 0] = "nullState";
      PointState2[PointState2["addState"] = 1] = "addState";
      PointState2[PointState2["persistState"] = 2] = "persistState";
      PointState2[PointState2["removeState"] = 3] = "removeState";
    })(exports2.PointState || (exports2.PointState = {}));
    var ClipVertex = (function() {
      function ClipVertex2() {
        this.v = vec2(0, 0);
        this.id = new ContactID();
      }
      ClipVertex2.prototype.set = function(o) {
        copyVec2(this.v, o.v);
        this.id.set(o.id);
      };
      ClipVertex2.prototype.recycle = function() {
        zeroVec2(this.v);
        this.id.recycle();
      };
      return ClipVertex2;
    })();
    var Manifold = (function() {
      function Manifold2() {
        this.localNormal = vec2(0, 0);
        this.localPoint = vec2(0, 0);
        this.points = [new ManifoldPoint(), new ManifoldPoint()];
        this.pointCount = 0;
      }
      Manifold2.prototype.set = function(that) {
        this.type = that.type;
        copyVec2(this.localNormal, that.localNormal);
        copyVec2(this.localPoint, that.localPoint);
        this.pointCount = that.pointCount;
        this.points[0].set(that.points[0]);
        this.points[1].set(that.points[1]);
      };
      Manifold2.prototype.recycle = function() {
        this.type = exports2.ManifoldType.e_unset;
        zeroVec2(this.localNormal);
        zeroVec2(this.localPoint);
        this.pointCount = 0;
        this.points[0].recycle();
        this.points[1].recycle();
      };
      Manifold2.prototype.getWorldManifold = function(wm, xfA2, radiusA, xfB2, radiusB) {
        if (this.pointCount == 0) {
          return wm;
        }
        wm = wm || new WorldManifold();
        wm.pointCount = this.pointCount;
        var normal3 = wm.normal;
        var points = wm.points;
        var separations = wm.separations;
        switch (this.type) {
          case exports2.ManifoldType.e_circles: {
            setVec2(normal3, 1, 0);
            var manifoldPoint = this.points[0];
            transformVec2(pointA$1, xfA2, this.localPoint);
            transformVec2(pointB$1, xfB2, manifoldPoint.localPoint);
            subVec2(dist, pointB$1, pointA$1);
            var lengthSqr = lengthSqrVec2(dist);
            if (lengthSqr > EPSILON * EPSILON) {
              var length_1 = math_sqrt$2(lengthSqr);
              scaleVec2(normal3, 1 / length_1, dist);
            }
            combine2Vec2(cA$1, 1, pointA$1, radiusA, normal3);
            combine2Vec2(cB$1, 1, pointB$1, -radiusB, normal3);
            combine2Vec2(points[0], 0.5, cA$1, 0.5, cB$1);
            separations[0] = dotVec2(subVec2(temp$3, cB$1, cA$1), normal3);
            break;
          }
          case exports2.ManifoldType.e_faceA: {
            rotVec2(normal3, xfA2.q, this.localNormal);
            transformVec2(planePoint$2, xfA2, this.localPoint);
            for (var i = 0; i < this.pointCount; ++i) {
              var manifoldPoint = this.points[i];
              transformVec2(clipPoint$1, xfB2, manifoldPoint.localPoint);
              combine2Vec2(cA$1, 1, clipPoint$1, radiusA - dotVec2(subVec2(temp$3, clipPoint$1, planePoint$2), normal3), normal3);
              combine2Vec2(cB$1, 1, clipPoint$1, -radiusB, normal3);
              combine2Vec2(points[i], 0.5, cA$1, 0.5, cB$1);
              separations[i] = dotVec2(subVec2(temp$3, cB$1, cA$1), normal3);
            }
            break;
          }
          case exports2.ManifoldType.e_faceB: {
            rotVec2(normal3, xfB2.q, this.localNormal);
            transformVec2(planePoint$2, xfB2, this.localPoint);
            for (var i = 0; i < this.pointCount; ++i) {
              var manifoldPoint = this.points[i];
              transformVec2(clipPoint$1, xfA2, manifoldPoint.localPoint);
              combine2Vec2(cB$1, 1, clipPoint$1, radiusB - dotVec2(subVec2(temp$3, clipPoint$1, planePoint$2), normal3), normal3);
              combine2Vec2(cA$1, 1, clipPoint$1, -radiusA, normal3);
              combine2Vec2(points[i], 0.5, cA$1, 0.5, cB$1);
              separations[i] = dotVec2(subVec2(temp$3, cA$1, cB$1), normal3);
            }
            negVec2(normal3);
            break;
          }
        }
        return wm;
      };
      Manifold2.clipSegmentToLine = clipSegmentToLine;
      Manifold2.ClipVertex = ClipVertex;
      Manifold2.getPointStates = getPointStates;
      Manifold2.PointState = exports2.PointState;
      return Manifold2;
    })();
    var ManifoldPoint = (function() {
      function ManifoldPoint2() {
        this.localPoint = vec2(0, 0);
        this.normalImpulse = 0;
        this.tangentImpulse = 0;
        this.id = new ContactID();
      }
      ManifoldPoint2.prototype.set = function(that) {
        copyVec2(this.localPoint, that.localPoint);
        this.normalImpulse = that.normalImpulse;
        this.tangentImpulse = that.tangentImpulse;
        this.id.set(that.id);
      };
      ManifoldPoint2.prototype.recycle = function() {
        zeroVec2(this.localPoint);
        this.normalImpulse = 0;
        this.tangentImpulse = 0;
        this.id.recycle();
      };
      return ManifoldPoint2;
    })();
    var ContactID = (function() {
      function ContactID2() {
        this.key = -1;
        this.indexA = -1;
        this.indexB = -1;
        this.typeA = exports2.ContactFeatureType.e_unset;
        this.typeB = exports2.ContactFeatureType.e_unset;
      }
      ContactID2.prototype.setFeatures = function(indexA, typeA, indexB, typeB) {
        this.indexA = indexA;
        this.indexB = indexB;
        this.typeA = typeA;
        this.typeB = typeB;
        this.key = this.indexA + this.indexB * 4 + this.typeA * 16 + this.typeB * 64;
      };
      ContactID2.prototype.set = function(that) {
        this.indexA = that.indexA;
        this.indexB = that.indexB;
        this.typeA = that.typeA;
        this.typeB = that.typeB;
        this.key = this.indexA + this.indexB * 4 + this.typeA * 16 + this.typeB * 64;
      };
      ContactID2.prototype.swapFeatures = function() {
        var indexA = this.indexA;
        var indexB = this.indexB;
        var typeA = this.typeA;
        var typeB = this.typeB;
        this.indexA = indexB;
        this.indexB = indexA;
        this.typeA = typeB;
        this.typeB = typeA;
        this.key = this.indexA + this.indexB * 4 + this.typeA * 16 + this.typeB * 64;
      };
      ContactID2.prototype.recycle = function() {
        this.indexA = 0;
        this.indexB = 0;
        this.typeA = exports2.ContactFeatureType.e_unset;
        this.typeB = exports2.ContactFeatureType.e_unset;
        this.key = -1;
      };
      return ContactID2;
    })();
    var WorldManifold = (function() {
      function WorldManifold2() {
        this.normal = vec2(0, 0);
        this.points = [vec2(0, 0), vec2(0, 0)];
        this.separations = [0, 0];
        this.pointCount = 0;
      }
      WorldManifold2.prototype.recycle = function() {
        zeroVec2(this.normal);
        zeroVec2(this.points[0]);
        zeroVec2(this.points[1]);
        this.separations[0] = 0;
        this.separations[1] = 0;
        this.pointCount = 0;
      };
      return WorldManifold2;
    })();
    function getPointStates(state1, state2, manifold1, manifold2) {
      for (var i = 0; i < manifold1.pointCount; ++i) {
        var id = manifold1.points[i].id;
        state1[i] = exports2.PointState.removeState;
        for (var j = 0; j < manifold2.pointCount; ++j) {
          if (manifold2.points[j].id.key === id.key) {
            state1[i] = exports2.PointState.persistState;
            break;
          }
        }
      }
      for (var i = 0; i < manifold2.pointCount; ++i) {
        var id = manifold2.points[i].id;
        state2[i] = exports2.PointState.addState;
        for (var j = 0; j < manifold1.pointCount; ++j) {
          if (manifold1.points[j].id.key === id.key) {
            state2[i] = exports2.PointState.persistState;
            break;
          }
        }
      }
    }
    function clipSegmentToLine(vOut, vIn, normal3, offset, vertexIndexA) {
      var numOut = 0;
      var distance0 = dotVec2(normal3, vIn[0].v) - offset;
      var distance1 = dotVec2(normal3, vIn[1].v) - offset;
      if (distance0 <= 0) vOut[numOut++].set(vIn[0]);
      if (distance1 <= 0) vOut[numOut++].set(vIn[1]);
      if (distance0 * distance1 < 0) {
        var interp = distance0 / (distance0 - distance1);
        combine2Vec2(vOut[numOut].v, 1 - interp, vIn[0].v, interp, vIn[1].v);
        vOut[numOut].id.setFeatures(vertexIndexA, exports2.ContactFeatureType.e_vertex, vIn[0].id.indexB, exports2.ContactFeatureType.e_face);
        ++numOut;
      }
      return numOut;
    }
    var math_sqrt$1 = Math.sqrt;
    var math_max$2 = Math.max;
    var math_min$4 = Math.min;
    var contactPool = new Pool({ create: function() {
      return new Contact();
    }, release: function(contact) {
      contact.recycle();
    } });
    var oldManifold = new Manifold();
    var worldManifold = new WorldManifold();
    var ContactEdge = (function() {
      function ContactEdge2(contact) {
        this.prev = null;
        this.next = null;
        this.other = null;
        this.contact = contact;
      }
      ContactEdge2.prototype.recycle = function() {
        this.prev = null;
        this.next = null;
        this.other = null;
      };
      return ContactEdge2;
    })();
    function mixFriction(friction1, friction2) {
      return math_sqrt$1(friction1 * friction2);
    }
    function mixRestitution(restitution1, restitution2) {
      return restitution1 > restitution2 ? restitution1 : restitution2;
    }
    var s_registers = [];
    var VelocityConstraintPoint = (function() {
      function VelocityConstraintPoint2() {
        this.rA = vec2(0, 0);
        this.rB = vec2(0, 0);
        this.normalImpulse = 0;
        this.tangentImpulse = 0;
        this.normalMass = 0;
        this.tangentMass = 0;
        this.velocityBias = 0;
      }
      VelocityConstraintPoint2.prototype.recycle = function() {
        zeroVec2(this.rA);
        zeroVec2(this.rB);
        this.normalImpulse = 0;
        this.tangentImpulse = 0;
        this.normalMass = 0;
        this.tangentMass = 0;
        this.velocityBias = 0;
      };
      return VelocityConstraintPoint2;
    })();
    var cA = vec2(0, 0);
    var vA = vec2(0, 0);
    var cB = vec2(0, 0);
    var vB = vec2(0, 0);
    var tangent$1 = vec2(0, 0);
    var xfA = transform(0, 0, 0);
    var xfB = transform(0, 0, 0);
    var pointA = vec2(0, 0);
    var pointB = vec2(0, 0);
    var clipPoint = vec2(0, 0);
    var planePoint$1 = vec2(0, 0);
    var rA = vec2(0, 0);
    var rB = vec2(0, 0);
    var P$1 = vec2(0, 0);
    var normal$2 = vec2(0, 0);
    var point = vec2(0, 0);
    var dv = vec2(0, 0);
    var dv1 = vec2(0, 0);
    var dv2 = vec2(0, 0);
    var b = vec2(0, 0);
    var a = vec2(0, 0);
    var x = vec2(0, 0);
    var d = vec2(0, 0);
    var P1 = vec2(0, 0);
    var P2 = vec2(0, 0);
    var temp$2 = vec2(0, 0);
    var Contact = (function() {
      function Contact2() {
        this.m_nodeA = new ContactEdge(this);
        this.m_nodeB = new ContactEdge(this);
        this.m_fixtureA = null;
        this.m_fixtureB = null;
        this.m_indexA = -1;
        this.m_indexB = -1;
        this.m_evaluateFcn = null;
        this.m_manifold = new Manifold();
        this.m_prev = null;
        this.m_next = null;
        this.m_toi = 1;
        this.m_toiCount = 0;
        this.m_toiFlag = false;
        this.m_friction = 0;
        this.m_restitution = 0;
        this.m_tangentSpeed = 0;
        this.m_enabledFlag = true;
        this.m_islandFlag = false;
        this.m_touchingFlag = false;
        this.m_filterFlag = false;
        this.m_bulletHitFlag = false;
        this.m_impulse = new ContactImpulse(this);
        this.v_points = [new VelocityConstraintPoint(), new VelocityConstraintPoint()];
        this.v_normal = vec2(0, 0);
        this.v_normalMass = new Mat22();
        this.v_K = new Mat22();
        this.v_pointCount = 0;
        this.v_tangentSpeed = 0;
        this.v_friction = 0;
        this.v_restitution = 0;
        this.v_invMassA = 0;
        this.v_invMassB = 0;
        this.v_invIA = 0;
        this.v_invIB = 0;
        this.p_localPoints = [vec2(0, 0), vec2(0, 0)];
        this.p_localNormal = vec2(0, 0);
        this.p_localPoint = vec2(0, 0);
        this.p_localCenterA = vec2(0, 0);
        this.p_localCenterB = vec2(0, 0);
        this.p_type = exports2.ManifoldType.e_unset;
        this.p_radiusA = 0;
        this.p_radiusB = 0;
        this.p_pointCount = 0;
        this.p_invMassA = 0;
        this.p_invMassB = 0;
        this.p_invIA = 0;
        this.p_invIB = 0;
      }
      Contact2.prototype.initialize = function(fA, indexA, fB, indexB, evaluateFcn) {
        this.m_fixtureA = fA;
        this.m_fixtureB = fB;
        this.m_indexA = indexA;
        this.m_indexB = indexB;
        this.m_evaluateFcn = evaluateFcn;
        this.m_friction = mixFriction(this.m_fixtureA.m_friction, this.m_fixtureB.m_friction);
        this.m_restitution = mixRestitution(this.m_fixtureA.m_restitution, this.m_fixtureB.m_restitution);
      };
      Contact2.prototype.recycle = function() {
        this.m_nodeA.recycle();
        this.m_nodeB.recycle();
        this.m_fixtureA = null;
        this.m_fixtureB = null;
        this.m_indexA = -1;
        this.m_indexB = -1;
        this.m_evaluateFcn = null;
        this.m_manifold.recycle();
        this.m_prev = null;
        this.m_next = null;
        this.m_toi = 1;
        this.m_toiCount = 0;
        this.m_toiFlag = false;
        this.m_friction = 0;
        this.m_restitution = 0;
        this.m_tangentSpeed = 0;
        this.m_enabledFlag = true;
        this.m_islandFlag = false;
        this.m_touchingFlag = false;
        this.m_filterFlag = false;
        this.m_bulletHitFlag = false;
        this.m_impulse.recycle();
        for (var _i = 0, _a2 = this.v_points; _i < _a2.length; _i++) {
          var point_1 = _a2[_i];
          point_1.recycle();
        }
        zeroVec2(this.v_normal);
        this.v_normalMass.setZero();
        this.v_K.setZero();
        this.v_pointCount = 0;
        this.v_tangentSpeed = 0;
        this.v_friction = 0;
        this.v_restitution = 0;
        this.v_invMassA = 0;
        this.v_invMassB = 0;
        this.v_invIA = 0;
        this.v_invIB = 0;
        for (var _b = 0, _c = this.p_localPoints; _b < _c.length; _b++) {
          var point_2 = _c[_b];
          zeroVec2(point_2);
        }
        zeroVec2(this.p_localNormal);
        zeroVec2(this.p_localPoint);
        zeroVec2(this.p_localCenterA);
        zeroVec2(this.p_localCenterB);
        this.p_type = exports2.ManifoldType.e_unset;
        this.p_radiusA = 0;
        this.p_radiusB = 0;
        this.p_pointCount = 0;
        this.p_invMassA = 0;
        this.p_invMassB = 0;
        this.p_invIA = 0;
        this.p_invIB = 0;
      };
      Contact2.prototype.initConstraint = function(step) {
        var fixtureA = this.m_fixtureA;
        var fixtureB = this.m_fixtureB;
        if (fixtureA === null || fixtureB === null) return;
        var bodyA = fixtureA.m_body;
        var bodyB = fixtureB.m_body;
        if (bodyA === null || bodyB === null) return;
        var shapeA = fixtureA.m_shape;
        var shapeB = fixtureB.m_shape;
        if (shapeA === null || shapeB === null) return;
        var manifold = this.m_manifold;
        var pointCount = manifold.pointCount;
        this.v_invMassA = bodyA.m_invMass;
        this.v_invMassB = bodyB.m_invMass;
        this.v_invIA = bodyA.m_invI;
        this.v_invIB = bodyB.m_invI;
        this.v_friction = this.m_friction;
        this.v_restitution = this.m_restitution;
        this.v_tangentSpeed = this.m_tangentSpeed;
        this.v_pointCount = pointCount;
        this.v_K.setZero();
        this.v_normalMass.setZero();
        this.p_invMassA = bodyA.m_invMass;
        this.p_invMassB = bodyB.m_invMass;
        this.p_invIA = bodyA.m_invI;
        this.p_invIB = bodyB.m_invI;
        copyVec2(this.p_localCenterA, bodyA.m_sweep.localCenter);
        copyVec2(this.p_localCenterB, bodyB.m_sweep.localCenter);
        this.p_radiusA = shapeA.m_radius;
        this.p_radiusB = shapeB.m_radius;
        this.p_type = manifold.type;
        copyVec2(this.p_localNormal, manifold.localNormal);
        copyVec2(this.p_localPoint, manifold.localPoint);
        this.p_pointCount = pointCount;
        for (var j = 0; j < SettingsInternal.maxManifoldPoints; ++j) {
          this.v_points[j].recycle();
          zeroVec2(this.p_localPoints[j]);
        }
        for (var j = 0; j < pointCount; ++j) {
          var cp = manifold.points[j];
          var vcp = this.v_points[j];
          if (step.warmStarting) {
            vcp.normalImpulse = step.dtRatio * cp.normalImpulse;
            vcp.tangentImpulse = step.dtRatio * cp.tangentImpulse;
          }
          copyVec2(this.p_localPoints[j], cp.localPoint);
        }
      };
      Contact2.prototype.getManifold = function() {
        return this.m_manifold;
      };
      Contact2.prototype.getWorldManifold = function(worldManifold2) {
        var fixtureA = this.m_fixtureA;
        var fixtureB = this.m_fixtureB;
        if (fixtureA === null || fixtureB === null) return;
        var bodyA = fixtureA.m_body;
        var bodyB = fixtureB.m_body;
        if (bodyA === null || bodyB === null) return;
        var shapeA = fixtureA.m_shape;
        var shapeB = fixtureB.m_shape;
        if (shapeA === null || shapeB === null) return;
        return this.m_manifold.getWorldManifold(worldManifold2, bodyA.getTransform(), shapeA.m_radius, bodyB.getTransform(), shapeB.m_radius);
      };
      Contact2.prototype.setEnabled = function(flag) {
        this.m_enabledFlag = !!flag;
      };
      Contact2.prototype.isEnabled = function() {
        return this.m_enabledFlag;
      };
      Contact2.prototype.isTouching = function() {
        return this.m_touchingFlag;
      };
      Contact2.prototype.getNext = function() {
        return this.m_next;
      };
      Contact2.prototype.getFixtureA = function() {
        return this.m_fixtureA;
      };
      Contact2.prototype.getFixtureB = function() {
        return this.m_fixtureB;
      };
      Contact2.prototype.getChildIndexA = function() {
        return this.m_indexA;
      };
      Contact2.prototype.getChildIndexB = function() {
        return this.m_indexB;
      };
      Contact2.prototype.flagForFiltering = function() {
        this.m_filterFlag = true;
      };
      Contact2.prototype.setFriction = function(friction) {
        this.m_friction = friction;
      };
      Contact2.prototype.getFriction = function() {
        return this.m_friction;
      };
      Contact2.prototype.resetFriction = function() {
        var fixtureA = this.m_fixtureA;
        var fixtureB = this.m_fixtureB;
        if (fixtureA === null || fixtureB === null) return;
        this.m_friction = mixFriction(fixtureA.m_friction, fixtureB.m_friction);
      };
      Contact2.prototype.setRestitution = function(restitution) {
        this.m_restitution = restitution;
      };
      Contact2.prototype.getRestitution = function() {
        return this.m_restitution;
      };
      Contact2.prototype.resetRestitution = function() {
        var fixtureA = this.m_fixtureA;
        var fixtureB = this.m_fixtureB;
        if (fixtureA === null || fixtureB === null) return;
        this.m_restitution = mixRestitution(fixtureA.m_restitution, fixtureB.m_restitution);
      };
      Contact2.prototype.setTangentSpeed = function(speed) {
        this.m_tangentSpeed = speed;
      };
      Contact2.prototype.getTangentSpeed = function() {
        return this.m_tangentSpeed;
      };
      Contact2.prototype.evaluate = function(manifold, xfA2, xfB2) {
        var fixtureA = this.m_fixtureA;
        var fixtureB = this.m_fixtureB;
        if (fixtureA === null || fixtureB === null) return;
        this.m_evaluateFcn(manifold, xfA2, fixtureA, this.m_indexA, xfB2, fixtureB, this.m_indexB);
      };
      Contact2.prototype.update = function(listener) {
        var fixtureA = this.m_fixtureA;
        var fixtureB = this.m_fixtureB;
        if (fixtureA === null || fixtureB === null) return;
        var bodyA = fixtureA.m_body;
        var bodyB = fixtureB.m_body;
        if (bodyA === null || bodyB === null) return;
        var shapeA = fixtureA.m_shape;
        var shapeB = fixtureB.m_shape;
        if (shapeA === null || shapeB === null) return;
        this.m_enabledFlag = true;
        var touching = false;
        var wasTouching = this.m_touchingFlag;
        var sensorA = fixtureA.m_isSensor;
        var sensorB = fixtureB.m_isSensor;
        var sensor = sensorA || sensorB;
        var xfA2 = bodyA.m_xf;
        var xfB2 = bodyB.m_xf;
        if (sensor) {
          touching = testOverlap(shapeA, this.m_indexA, shapeB, this.m_indexB, xfA2, xfB2);
          this.m_manifold.pointCount = 0;
        } else {
          oldManifold.recycle();
          oldManifold.set(this.m_manifold);
          this.m_manifold.recycle();
          this.evaluate(this.m_manifold, xfA2, xfB2);
          touching = this.m_manifold.pointCount > 0;
          for (var i = 0; i < this.m_manifold.pointCount; ++i) {
            var nmp = this.m_manifold.points[i];
            nmp.normalImpulse = 0;
            nmp.tangentImpulse = 0;
            for (var j = 0; j < oldManifold.pointCount; ++j) {
              var omp = oldManifold.points[j];
              if (omp.id.key === nmp.id.key) {
                nmp.normalImpulse = omp.normalImpulse;
                nmp.tangentImpulse = omp.tangentImpulse;
                break;
              }
            }
          }
          if (touching !== wasTouching) {
            bodyA.setAwake(true);
            bodyB.setAwake(true);
          }
        }
        this.m_touchingFlag = touching;
        var hasListener = typeof listener === "object" && listener !== null;
        if (!wasTouching && touching && hasListener) {
          listener.beginContact(this);
        }
        if (wasTouching && !touching && hasListener) {
          listener.endContact(this);
        }
        if (!sensor && touching && hasListener && oldManifold) {
          listener.preSolve(this, oldManifold);
        }
      };
      Contact2.prototype.solvePositionConstraint = function(step) {
        return this._solvePositionConstraint(step, null, null);
      };
      Contact2.prototype.solvePositionConstraintTOI = function(step, toiA, toiB) {
        return this._solvePositionConstraint(step, toiA, toiB);
      };
      Contact2.prototype._solvePositionConstraint = function(step, toiA, toiB) {
        var toi = toiA !== null && toiB !== null ? true : false;
        var minSeparation = 0;
        var fixtureA = this.m_fixtureA;
        var fixtureB = this.m_fixtureB;
        if (fixtureA === null || fixtureB === null) return minSeparation;
        var bodyA = fixtureA.m_body;
        var bodyB = fixtureB.m_body;
        if (bodyA === null || bodyB === null) return minSeparation;
        var positionA = bodyA.c_position;
        var positionB = bodyB.c_position;
        var localCenterA = this.p_localCenterA;
        var localCenterB = this.p_localCenterB;
        var mA = 0;
        var iA = 0;
        if (!toi || bodyA === toiA || bodyA === toiB) {
          mA = this.p_invMassA;
          iA = this.p_invIA;
        }
        var mB = 0;
        var iB = 0;
        if (!toi || bodyB === toiA || bodyB === toiB) {
          mB = this.p_invMassB;
          iB = this.p_invIB;
        }
        copyVec2(cA, positionA.c);
        var aA = positionA.a;
        copyVec2(cB, positionB.c);
        var aB = positionB.a;
        for (var j = 0; j < this.p_pointCount; ++j) {
          getTransform(xfA, localCenterA, cA, aA);
          getTransform(xfB, localCenterB, cB, aB);
          var separation = void 0;
          switch (this.p_type) {
            case exports2.ManifoldType.e_circles: {
              transformVec2(pointA, xfA, this.p_localPoint);
              transformVec2(pointB, xfB, this.p_localPoints[0]);
              subVec2(normal$2, pointB, pointA);
              normalizeVec2(normal$2);
              combine2Vec2(point, 0.5, pointA, 0.5, pointB);
              separation = dotVec2(pointB, normal$2) - dotVec2(pointA, normal$2) - this.p_radiusA - this.p_radiusB;
              break;
            }
            case exports2.ManifoldType.e_faceA: {
              rotVec2(normal$2, xfA.q, this.p_localNormal);
              transformVec2(planePoint$1, xfA, this.p_localPoint);
              transformVec2(clipPoint, xfB, this.p_localPoints[j]);
              separation = dotVec2(clipPoint, normal$2) - dotVec2(planePoint$1, normal$2) - this.p_radiusA - this.p_radiusB;
              copyVec2(point, clipPoint);
              break;
            }
            case exports2.ManifoldType.e_faceB: {
              rotVec2(normal$2, xfB.q, this.p_localNormal);
              transformVec2(planePoint$1, xfB, this.p_localPoint);
              transformVec2(clipPoint, xfA, this.p_localPoints[j]);
              separation = dotVec2(clipPoint, normal$2) - dotVec2(planePoint$1, normal$2) - this.p_radiusA - this.p_radiusB;
              copyVec2(point, clipPoint);
              negVec2(normal$2);
              break;
            }
            default: {
              return minSeparation;
            }
          }
          subVec2(rA, point, cA);
          subVec2(rB, point, cB);
          minSeparation = math_min$4(minSeparation, separation);
          var baumgarte = toi ? SettingsInternal.toiBaugarte : SettingsInternal.baumgarte;
          var linearSlop = SettingsInternal.linearSlop;
          var maxLinearCorrection = SettingsInternal.maxLinearCorrection;
          var C = clamp(baumgarte * (separation + linearSlop), -maxLinearCorrection, 0);
          var rnA = crossVec2Vec2(rA, normal$2);
          var rnB = crossVec2Vec2(rB, normal$2);
          var K = mA + mB + iA * rnA * rnA + iB * rnB * rnB;
          var impulse = K > 0 ? -C / K : 0;
          scaleVec2(P$1, impulse, normal$2);
          minusScaleVec2(cA, mA, P$1);
          aA -= iA * crossVec2Vec2(rA, P$1);
          plusScaleVec2(cB, mB, P$1);
          aB += iB * crossVec2Vec2(rB, P$1);
        }
        copyVec2(positionA.c, cA);
        positionA.a = aA;
        copyVec2(positionB.c, cB);
        positionB.a = aB;
        return minSeparation;
      };
      Contact2.prototype.initVelocityConstraint = function(step) {
        var fixtureA = this.m_fixtureA;
        var fixtureB = this.m_fixtureB;
        if (fixtureA === null || fixtureB === null) return;
        var bodyA = fixtureA.m_body;
        var bodyB = fixtureB.m_body;
        if (bodyA === null || bodyB === null) return;
        var velocityA = bodyA.c_velocity;
        var velocityB = bodyB.c_velocity;
        var positionA = bodyA.c_position;
        var positionB = bodyB.c_position;
        var radiusA = this.p_radiusA;
        var radiusB = this.p_radiusB;
        var manifold = this.m_manifold;
        var mA = this.v_invMassA;
        var mB = this.v_invMassB;
        var iA = this.v_invIA;
        var iB = this.v_invIB;
        var localCenterA = this.p_localCenterA;
        var localCenterB = this.p_localCenterB;
        copyVec2(cA, positionA.c);
        var aA = positionA.a;
        copyVec2(vA, velocityA.v);
        var wA = velocityA.w;
        copyVec2(cB, positionB.c);
        var aB = positionB.a;
        copyVec2(vB, velocityB.v);
        var wB = velocityB.w;
        getTransform(xfA, localCenterA, cA, aA);
        getTransform(xfB, localCenterB, cB, aB);
        worldManifold.recycle();
        manifold.getWorldManifold(worldManifold, xfA, radiusA, xfB, radiusB);
        copyVec2(this.v_normal, worldManifold.normal);
        for (var j = 0; j < this.v_pointCount; ++j) {
          var vcp = this.v_points[j];
          var wmp = worldManifold.points[j];
          subVec2(vcp.rA, wmp, cA);
          subVec2(vcp.rB, wmp, cB);
          var rnA = crossVec2Vec2(vcp.rA, this.v_normal);
          var rnB = crossVec2Vec2(vcp.rB, this.v_normal);
          var kNormal = mA + mB + iA * rnA * rnA + iB * rnB * rnB;
          vcp.normalMass = kNormal > 0 ? 1 / kNormal : 0;
          crossVec2Num(tangent$1, this.v_normal, 1);
          var rtA = crossVec2Vec2(vcp.rA, tangent$1);
          var rtB = crossVec2Vec2(vcp.rB, tangent$1);
          var kTangent = mA + mB + iA * rtA * rtA + iB * rtB * rtB;
          vcp.tangentMass = kTangent > 0 ? 1 / kTangent : 0;
          vcp.velocityBias = 0;
          var vRel = 0;
          vRel += dotVec2(this.v_normal, vB);
          vRel += dotVec2(this.v_normal, crossNumVec2(temp$2, wB, vcp.rB));
          vRel -= dotVec2(this.v_normal, vA);
          vRel -= dotVec2(this.v_normal, crossNumVec2(temp$2, wA, vcp.rA));
          if (vRel < -SettingsInternal.velocityThreshold) {
            vcp.velocityBias = -this.v_restitution * vRel;
          }
        }
        if (this.v_pointCount == 2 && step.blockSolve) {
          var vcp1 = this.v_points[0];
          var vcp2 = this.v_points[1];
          var rn1A = crossVec2Vec2(vcp1.rA, this.v_normal);
          var rn1B = crossVec2Vec2(vcp1.rB, this.v_normal);
          var rn2A = crossVec2Vec2(vcp2.rA, this.v_normal);
          var rn2B = crossVec2Vec2(vcp2.rB, this.v_normal);
          var k11 = mA + mB + iA * rn1A * rn1A + iB * rn1B * rn1B;
          var k22 = mA + mB + iA * rn2A * rn2A + iB * rn2B * rn2B;
          var k12 = mA + mB + iA * rn1A * rn2A + iB * rn1B * rn2B;
          var k_maxConditionNumber = 1e3;
          if (k11 * k11 < k_maxConditionNumber * (k11 * k22 - k12 * k12)) {
            this.v_K.ex.setNum(k11, k12);
            this.v_K.ey.setNum(k12, k22);
            var a_1 = this.v_K.ex.x;
            var b_1 = this.v_K.ey.x;
            var c2 = this.v_K.ex.y;
            var d_1 = this.v_K.ey.y;
            var det = a_1 * d_1 - b_1 * c2;
            if (det !== 0) {
              det = 1 / det;
            }
            this.v_normalMass.ex.x = det * d_1;
            this.v_normalMass.ey.x = -det * b_1;
            this.v_normalMass.ex.y = -det * c2;
            this.v_normalMass.ey.y = det * a_1;
          } else {
            this.v_pointCount = 1;
          }
        }
        copyVec2(positionA.c, cA);
        positionA.a = aA;
        copyVec2(velocityA.v, vA);
        velocityA.w = wA;
        copyVec2(positionB.c, cB);
        positionB.a = aB;
        copyVec2(velocityB.v, vB);
        velocityB.w = wB;
      };
      Contact2.prototype.warmStartConstraint = function(step) {
        var fixtureA = this.m_fixtureA;
        var fixtureB = this.m_fixtureB;
        if (fixtureA === null || fixtureB === null) return;
        var bodyA = fixtureA.m_body;
        var bodyB = fixtureB.m_body;
        if (bodyA === null || bodyB === null) return;
        var velocityA = bodyA.c_velocity;
        var velocityB = bodyB.c_velocity;
        var mA = this.v_invMassA;
        var iA = this.v_invIA;
        var mB = this.v_invMassB;
        var iB = this.v_invIB;
        copyVec2(vA, velocityA.v);
        var wA = velocityA.w;
        copyVec2(vB, velocityB.v);
        var wB = velocityB.w;
        copyVec2(normal$2, this.v_normal);
        crossVec2Num(tangent$1, normal$2, 1);
        for (var j = 0; j < this.v_pointCount; ++j) {
          var vcp = this.v_points[j];
          combine2Vec2(P$1, vcp.normalImpulse, normal$2, vcp.tangentImpulse, tangent$1);
          wA -= iA * crossVec2Vec2(vcp.rA, P$1);
          minusScaleVec2(vA, mA, P$1);
          wB += iB * crossVec2Vec2(vcp.rB, P$1);
          plusScaleVec2(vB, mB, P$1);
        }
        copyVec2(velocityA.v, vA);
        velocityA.w = wA;
        copyVec2(velocityB.v, vB);
        velocityB.w = wB;
      };
      Contact2.prototype.storeConstraintImpulses = function(step) {
        var manifold = this.m_manifold;
        for (var j = 0; j < this.v_pointCount; ++j) {
          manifold.points[j].normalImpulse = this.v_points[j].normalImpulse;
          manifold.points[j].tangentImpulse = this.v_points[j].tangentImpulse;
        }
      };
      Contact2.prototype.solveVelocityConstraint = function(step) {
        var fixtureA = this.m_fixtureA;
        var fixtureB = this.m_fixtureB;
        if (fixtureA === null || fixtureB === null) return;
        var bodyA = fixtureA.m_body;
        var bodyB = fixtureB.m_body;
        if (bodyA === null || bodyB === null) return;
        var velocityA = bodyA.c_velocity;
        var velocityB = bodyB.c_velocity;
        var mA = this.v_invMassA;
        var iA = this.v_invIA;
        var mB = this.v_invMassB;
        var iB = this.v_invIB;
        copyVec2(vA, velocityA.v);
        var wA = velocityA.w;
        copyVec2(vB, velocityB.v);
        var wB = velocityB.w;
        copyVec2(normal$2, this.v_normal);
        crossVec2Num(tangent$1, normal$2, 1);
        var friction = this.v_friction;
        for (var j = 0; j < this.v_pointCount; ++j) {
          var vcp = this.v_points[j];
          zeroVec2(dv);
          plusVec2(dv, vB);
          plusVec2(dv, crossNumVec2(temp$2, wB, vcp.rB));
          minusVec2(dv, vA);
          minusVec2(dv, crossNumVec2(temp$2, wA, vcp.rA));
          var vt = dotVec2(dv, tangent$1) - this.v_tangentSpeed;
          var lambda = vcp.tangentMass * -vt;
          var maxFriction = friction * vcp.normalImpulse;
          var newImpulse = clamp(vcp.tangentImpulse + lambda, -maxFriction, maxFriction);
          lambda = newImpulse - vcp.tangentImpulse;
          vcp.tangentImpulse = newImpulse;
          scaleVec2(P$1, lambda, tangent$1);
          minusScaleVec2(vA, mA, P$1);
          wA -= iA * crossVec2Vec2(vcp.rA, P$1);
          plusScaleVec2(vB, mB, P$1);
          wB += iB * crossVec2Vec2(vcp.rB, P$1);
        }
        if (this.v_pointCount == 1 || step.blockSolve == false) {
          for (var i = 0; i < this.v_pointCount; ++i) {
            var vcp = this.v_points[i];
            zeroVec2(dv);
            plusVec2(dv, vB);
            plusVec2(dv, crossNumVec2(temp$2, wB, vcp.rB));
            minusVec2(dv, vA);
            minusVec2(dv, crossNumVec2(temp$2, wA, vcp.rA));
            var vn = dotVec2(dv, normal$2);
            var lambda = -vcp.normalMass * (vn - vcp.velocityBias);
            var newImpulse = math_max$2(vcp.normalImpulse + lambda, 0);
            lambda = newImpulse - vcp.normalImpulse;
            vcp.normalImpulse = newImpulse;
            scaleVec2(P$1, lambda, normal$2);
            minusScaleVec2(vA, mA, P$1);
            wA -= iA * crossVec2Vec2(vcp.rA, P$1);
            plusScaleVec2(vB, mB, P$1);
            wB += iB * crossVec2Vec2(vcp.rB, P$1);
          }
        } else {
          var vcp1 = this.v_points[0];
          var vcp2 = this.v_points[1];
          setVec2(a, vcp1.normalImpulse, vcp2.normalImpulse);
          zeroVec2(dv1);
          plusVec2(dv1, vB);
          plusVec2(dv1, crossNumVec2(temp$2, wB, vcp1.rB));
          minusVec2(dv1, vA);
          minusVec2(dv1, crossNumVec2(temp$2, wA, vcp1.rA));
          zeroVec2(dv2);
          plusVec2(dv2, vB);
          plusVec2(dv2, crossNumVec2(temp$2, wB, vcp2.rB));
          minusVec2(dv2, vA);
          minusVec2(dv2, crossNumVec2(temp$2, wA, vcp2.rA));
          var vn1 = dotVec2(dv1, normal$2);
          var vn2 = dotVec2(dv2, normal$2);
          setVec2(b, vn1 - vcp1.velocityBias, vn2 - vcp2.velocityBias);
          b.x -= this.v_K.ex.x * a.x + this.v_K.ey.x * a.y;
          b.y -= this.v_K.ex.y * a.x + this.v_K.ey.y * a.y;
          while (true) {
            zeroVec2(x);
            x.x = -(this.v_normalMass.ex.x * b.x + this.v_normalMass.ey.x * b.y);
            x.y = -(this.v_normalMass.ex.y * b.x + this.v_normalMass.ey.y * b.y);
            if (x.x >= 0 && x.y >= 0) {
              subVec2(d, x, a);
              scaleVec2(P1, d.x, normal$2);
              scaleVec2(P2, d.y, normal$2);
              combine3Vec2(vA, -mA, P1, -mA, P2, 1, vA);
              wA -= iA * (crossVec2Vec2(vcp1.rA, P1) + crossVec2Vec2(vcp2.rA, P2));
              combine3Vec2(vB, mB, P1, mB, P2, 1, vB);
              wB += iB * (crossVec2Vec2(vcp1.rB, P1) + crossVec2Vec2(vcp2.rB, P2));
              vcp1.normalImpulse = x.x;
              vcp2.normalImpulse = x.y;
              break;
            }
            x.x = -vcp1.normalMass * b.x;
            x.y = 0;
            vn1 = 0;
            vn2 = this.v_K.ex.y * x.x + b.y;
            if (x.x >= 0 && vn2 >= 0) {
              subVec2(d, x, a);
              scaleVec2(P1, d.x, normal$2);
              scaleVec2(P2, d.y, normal$2);
              combine3Vec2(vA, -mA, P1, -mA, P2, 1, vA);
              wA -= iA * (crossVec2Vec2(vcp1.rA, P1) + crossVec2Vec2(vcp2.rA, P2));
              combine3Vec2(vB, mB, P1, mB, P2, 1, vB);
              wB += iB * (crossVec2Vec2(vcp1.rB, P1) + crossVec2Vec2(vcp2.rB, P2));
              vcp1.normalImpulse = x.x;
              vcp2.normalImpulse = x.y;
              break;
            }
            x.x = 0;
            x.y = -vcp2.normalMass * b.y;
            vn1 = this.v_K.ey.x * x.y + b.x;
            vn2 = 0;
            if (x.y >= 0 && vn1 >= 0) {
              subVec2(d, x, a);
              scaleVec2(P1, d.x, normal$2);
              scaleVec2(P2, d.y, normal$2);
              combine3Vec2(vA, -mA, P1, -mA, P2, 1, vA);
              wA -= iA * (crossVec2Vec2(vcp1.rA, P1) + crossVec2Vec2(vcp2.rA, P2));
              combine3Vec2(vB, mB, P1, mB, P2, 1, vB);
              wB += iB * (crossVec2Vec2(vcp1.rB, P1) + crossVec2Vec2(vcp2.rB, P2));
              vcp1.normalImpulse = x.x;
              vcp2.normalImpulse = x.y;
              break;
            }
            x.x = 0;
            x.y = 0;
            vn1 = b.x;
            vn2 = b.y;
            if (vn1 >= 0 && vn2 >= 0) {
              subVec2(d, x, a);
              scaleVec2(P1, d.x, normal$2);
              scaleVec2(P2, d.y, normal$2);
              combine3Vec2(vA, -mA, P1, -mA, P2, 1, vA);
              wA -= iA * (crossVec2Vec2(vcp1.rA, P1) + crossVec2Vec2(vcp2.rA, P2));
              combine3Vec2(vB, mB, P1, mB, P2, 1, vB);
              wB += iB * (crossVec2Vec2(vcp1.rB, P1) + crossVec2Vec2(vcp2.rB, P2));
              vcp1.normalImpulse = x.x;
              vcp2.normalImpulse = x.y;
              break;
            }
            break;
          }
        }
        copyVec2(velocityA.v, vA);
        velocityA.w = wA;
        copyVec2(velocityB.v, vB);
        velocityB.w = wB;
      };
      Contact2.addType = function(type1, type2, callback) {
        s_registers[type1] = s_registers[type1] || {};
        s_registers[type1][type2] = callback;
      };
      Contact2.create = function(fixtureA, indexA, fixtureB, indexB) {
        var typeA = fixtureA.m_shape.m_type;
        var typeB = fixtureB.m_shape.m_type;
        var contact = contactPool.allocate();
        var evaluateFcn;
        if (evaluateFcn = s_registers[typeA] && s_registers[typeA][typeB]) {
          contact.initialize(fixtureA, indexA, fixtureB, indexB, evaluateFcn);
        } else if (evaluateFcn = s_registers[typeB] && s_registers[typeB][typeA]) {
          contact.initialize(fixtureB, indexB, fixtureA, indexA, evaluateFcn);
        } else {
          return null;
        }
        fixtureA = contact.m_fixtureA;
        fixtureB = contact.m_fixtureB;
        indexA = contact.getChildIndexA();
        indexB = contact.getChildIndexB();
        var bodyA = fixtureA.m_body;
        var bodyB = fixtureB.m_body;
        contact.m_nodeA.contact = contact;
        contact.m_nodeA.other = bodyB;
        contact.m_nodeA.prev = null;
        contact.m_nodeA.next = bodyA.m_contactList;
        if (bodyA.m_contactList != null) {
          bodyA.m_contactList.prev = contact.m_nodeA;
        }
        bodyA.m_contactList = contact.m_nodeA;
        contact.m_nodeB.contact = contact;
        contact.m_nodeB.other = bodyA;
        contact.m_nodeB.prev = null;
        contact.m_nodeB.next = bodyB.m_contactList;
        if (bodyB.m_contactList != null) {
          bodyB.m_contactList.prev = contact.m_nodeB;
        }
        bodyB.m_contactList = contact.m_nodeB;
        if (fixtureA.isSensor() == false && fixtureB.isSensor() == false) {
          bodyA.setAwake(true);
          bodyB.setAwake(true);
        }
        return contact;
      };
      Contact2.destroy = function(contact, listener) {
        var fixtureA = contact.m_fixtureA;
        var fixtureB = contact.m_fixtureB;
        if (fixtureA === null || fixtureB === null) return;
        var bodyA = fixtureA.m_body;
        var bodyB = fixtureB.m_body;
        if (bodyA === null || bodyB === null) return;
        if (contact.isTouching()) {
          listener.endContact(contact);
        }
        if (contact.m_nodeA.prev) {
          contact.m_nodeA.prev.next = contact.m_nodeA.next;
        }
        if (contact.m_nodeA.next) {
          contact.m_nodeA.next.prev = contact.m_nodeA.prev;
        }
        if (contact.m_nodeA == bodyA.m_contactList) {
          bodyA.m_contactList = contact.m_nodeA.next;
        }
        if (contact.m_nodeB.prev) {
          contact.m_nodeB.prev.next = contact.m_nodeB.next;
        }
        if (contact.m_nodeB.next) {
          contact.m_nodeB.next.prev = contact.m_nodeB.prev;
        }
        if (contact.m_nodeB == bodyB.m_contactList) {
          bodyB.m_contactList = contact.m_nodeB.next;
        }
        if (contact.m_manifold.pointCount > 0 && !fixtureA.m_isSensor && !fixtureB.m_isSensor) {
          bodyA.setAwake(true);
          bodyB.setAwake(true);
        }
        contactPool.release(contact);
      };
      return Contact2;
    })();
    var DEFAULTS$b = { gravity: Vec2.zero(), allowSleep: true, warmStarting: true, continuousPhysics: true, subStepping: false, blockSolve: true, velocityIterations: 8, positionIterations: 3 };
    var World = (function() {
      function World2(def) {
        if (!(this instanceof World2)) {
          return new World2(def);
        }
        this.s_step = new TimeStep();
        if (!def) {
          def = {};
        } else if (Vec2.isValid(def)) {
          def = { gravity: def };
        }
        def = options(def, DEFAULTS$b);
        this.m_solver = new Solver(this);
        this.m_broadPhase = new BroadPhase();
        this.m_contactList = null;
        this.m_contactCount = 0;
        this.m_bodyList = null;
        this.m_bodyCount = 0;
        this.m_jointList = null;
        this.m_jointCount = 0;
        this.m_stepComplete = true;
        this.m_allowSleep = def.allowSleep;
        this.m_gravity = Vec2.clone(def.gravity);
        this.m_clearForces = true;
        this.m_newFixture = false;
        this.m_locked = false;
        this.m_warmStarting = def.warmStarting;
        this.m_continuousPhysics = def.continuousPhysics;
        this.m_subStepping = def.subStepping;
        this.m_blockSolve = def.blockSolve;
        this.m_velocityIterations = def.velocityIterations;
        this.m_positionIterations = def.positionIterations;
        this.m_t = 0;
        this.m_step_callback = [];
      }
      World2.prototype._serialize = function() {
        var bodies = [];
        var joints = [];
        for (var b2 = this.getBodyList(); b2; b2 = b2.getNext()) {
          bodies.push(b2);
        }
        for (var j = this.getJointList(); j; j = j.getNext()) {
          if (typeof j._serialize === "function") {
            joints.push(j);
          }
        }
        return { gravity: this.m_gravity, bodies, joints };
      };
      World2._deserialize = function(data, context, restore) {
        if (!data) {
          return new World2();
        }
        var world = new World2(data.gravity);
        if (data.bodies) {
          for (var i = data.bodies.length - 1; i >= 0; i -= 1) {
            world._addBody(restore(Body, data.bodies[i], world));
          }
        }
        if (data.joints) {
          for (var i = data.joints.length - 1; i >= 0; i--) {
            world.createJoint(restore(Joint, data.joints[i], world));
          }
        }
        return world;
      };
      World2.prototype.getBodyList = function() {
        return this.m_bodyList;
      };
      World2.prototype.getJointList = function() {
        return this.m_jointList;
      };
      World2.prototype.getContactList = function() {
        return this.m_contactList;
      };
      World2.prototype.getBodyCount = function() {
        return this.m_bodyCount;
      };
      World2.prototype.getJointCount = function() {
        return this.m_jointCount;
      };
      World2.prototype.getContactCount = function() {
        return this.m_contactCount;
      };
      World2.prototype.setGravity = function(gravity) {
        this.m_gravity.set(gravity);
      };
      World2.prototype.getGravity = function() {
        return this.m_gravity;
      };
      World2.prototype.isLocked = function() {
        return this.m_locked;
      };
      World2.prototype.setAllowSleeping = function(flag) {
        if (flag == this.m_allowSleep) {
          return;
        }
        this.m_allowSleep = flag;
        if (this.m_allowSleep == false) {
          for (var b2 = this.m_bodyList; b2; b2 = b2.m_next) {
            b2.setAwake(true);
          }
        }
      };
      World2.prototype.getAllowSleeping = function() {
        return this.m_allowSleep;
      };
      World2.prototype.setWarmStarting = function(flag) {
        this.m_warmStarting = flag;
      };
      World2.prototype.getWarmStarting = function() {
        return this.m_warmStarting;
      };
      World2.prototype.setContinuousPhysics = function(flag) {
        this.m_continuousPhysics = flag;
      };
      World2.prototype.getContinuousPhysics = function() {
        return this.m_continuousPhysics;
      };
      World2.prototype.setSubStepping = function(flag) {
        this.m_subStepping = flag;
      };
      World2.prototype.getSubStepping = function() {
        return this.m_subStepping;
      };
      World2.prototype.setAutoClearForces = function(flag) {
        this.m_clearForces = flag;
      };
      World2.prototype.getAutoClearForces = function() {
        return this.m_clearForces;
      };
      World2.prototype.clearForces = function() {
        for (var body = this.m_bodyList; body; body = body.getNext()) {
          body.m_force.setZero();
          body.m_torque = 0;
        }
      };
      World2.prototype.queryAABB = function(aabb, callback) {
        var broadPhase = this.m_broadPhase;
        this.m_broadPhase.query(aabb, function(proxyId) {
          var proxy = broadPhase.getUserData(proxyId);
          return callback(proxy.fixture);
        });
      };
      World2.prototype.rayCast = function(point1, point2, callback) {
        var broadPhase = this.m_broadPhase;
        this.m_broadPhase.rayCast({ maxFraction: 1, p1: point1, p2: point2 }, function(input2, proxyId) {
          var proxy = broadPhase.getUserData(proxyId);
          var fixture = proxy.fixture;
          var index = proxy.childIndex;
          var output2 = {};
          var hit = fixture.rayCast(output2, input2, index);
          if (hit) {
            var fraction = output2.fraction;
            var point3 = Vec2.add(Vec2.mulNumVec2(1 - fraction, input2.p1), Vec2.mulNumVec2(fraction, input2.p2));
            return callback(fixture, point3, output2.normal, fraction);
          }
          return input2.maxFraction;
        });
      };
      World2.prototype.getProxyCount = function() {
        return this.m_broadPhase.getProxyCount();
      };
      World2.prototype.getTreeHeight = function() {
        return this.m_broadPhase.getTreeHeight();
      };
      World2.prototype.getTreeBalance = function() {
        return this.m_broadPhase.getTreeBalance();
      };
      World2.prototype.getTreeQuality = function() {
        return this.m_broadPhase.getTreeQuality();
      };
      World2.prototype.shiftOrigin = function(newOrigin) {
        if (this.isLocked()) {
          return;
        }
        for (var b2 = this.m_bodyList; b2; b2 = b2.m_next) {
          b2.m_xf.p.sub(newOrigin);
          b2.m_sweep.c0.sub(newOrigin);
          b2.m_sweep.c.sub(newOrigin);
        }
        for (var j = this.m_jointList; j; j = j.m_next) {
          j.shiftOrigin(newOrigin);
        }
        this.m_broadPhase.shiftOrigin(newOrigin);
      };
      World2.prototype._addBody = function(body) {
        if (this.isLocked()) {
          return;
        }
        body.m_prev = null;
        body.m_next = this.m_bodyList;
        if (this.m_bodyList) {
          this.m_bodyList.m_prev = body;
        }
        this.m_bodyList = body;
        ++this.m_bodyCount;
        this.publish("add-body", body);
      };
      World2.prototype.createBody = function(arg1, arg2) {
        if (this.isLocked()) {
          return null;
        }
        var def = {};
        if (!arg1) ;
        else if (Vec2.isValid(arg1)) {
          def = { position: arg1, angle: arg2 };
        } else if (typeof arg1 === "object") {
          def = arg1;
        }
        var body = new Body(this, def);
        this._addBody(body);
        return body;
      };
      World2.prototype.createDynamicBody = function(arg1, arg2) {
        var def = {};
        if (!arg1) ;
        else if (Vec2.isValid(arg1)) {
          def = { position: arg1, angle: arg2 };
        } else if (typeof arg1 === "object") {
          def = arg1;
        }
        def.type = "dynamic";
        return this.createBody(def);
      };
      World2.prototype.createKinematicBody = function(arg1, arg2) {
        var def = {};
        if (!arg1) ;
        else if (Vec2.isValid(arg1)) {
          def = { position: arg1, angle: arg2 };
        } else if (typeof arg1 === "object") {
          def = arg1;
        }
        def.type = "kinematic";
        return this.createBody(def);
      };
      World2.prototype.destroyBody = function(b2) {
        if (this.isLocked()) {
          return;
        }
        if (b2.m_destroyed) {
          return false;
        }
        var je = b2.m_jointList;
        while (je) {
          var je0 = je;
          je = je.next;
          this.publish("remove-joint", je0.joint);
          this.destroyJoint(je0.joint);
          b2.m_jointList = je;
        }
        b2.m_jointList = null;
        var ce = b2.m_contactList;
        while (ce) {
          var ce0 = ce;
          ce = ce.next;
          this.destroyContact(ce0.contact);
          b2.m_contactList = ce;
        }
        b2.m_contactList = null;
        var f = b2.m_fixtureList;
        while (f) {
          var f0 = f;
          f = f.m_next;
          this.publish("remove-fixture", f0);
          f0.destroyProxies(this.m_broadPhase);
          b2.m_fixtureList = f;
        }
        b2.m_fixtureList = null;
        if (b2.m_prev) {
          b2.m_prev.m_next = b2.m_next;
        }
        if (b2.m_next) {
          b2.m_next.m_prev = b2.m_prev;
        }
        if (b2 == this.m_bodyList) {
          this.m_bodyList = b2.m_next;
        }
        b2.m_destroyed = true;
        --this.m_bodyCount;
        this.publish("remove-body", b2);
        return true;
      };
      World2.prototype.createJoint = function(joint) {
        if (this.isLocked()) {
          return null;
        }
        joint.m_prev = null;
        joint.m_next = this.m_jointList;
        if (this.m_jointList) {
          this.m_jointList.m_prev = joint;
        }
        this.m_jointList = joint;
        ++this.m_jointCount;
        joint.m_edgeA.joint = joint;
        joint.m_edgeA.other = joint.m_bodyB;
        joint.m_edgeA.prev = null;
        joint.m_edgeA.next = joint.m_bodyA.m_jointList;
        if (joint.m_bodyA.m_jointList) joint.m_bodyA.m_jointList.prev = joint.m_edgeA;
        joint.m_bodyA.m_jointList = joint.m_edgeA;
        joint.m_edgeB.joint = joint;
        joint.m_edgeB.other = joint.m_bodyA;
        joint.m_edgeB.prev = null;
        joint.m_edgeB.next = joint.m_bodyB.m_jointList;
        if (joint.m_bodyB.m_jointList) joint.m_bodyB.m_jointList.prev = joint.m_edgeB;
        joint.m_bodyB.m_jointList = joint.m_edgeB;
        if (joint.m_collideConnected == false) {
          for (var edge = joint.m_bodyB.getContactList(); edge; edge = edge.next) {
            if (edge.other == joint.m_bodyA) {
              edge.contact.flagForFiltering();
            }
          }
        }
        this.publish("add-joint", joint);
        return joint;
      };
      World2.prototype.destroyJoint = function(joint) {
        if (this.isLocked()) {
          return;
        }
        if (joint.m_prev) {
          joint.m_prev.m_next = joint.m_next;
        }
        if (joint.m_next) {
          joint.m_next.m_prev = joint.m_prev;
        }
        if (joint == this.m_jointList) {
          this.m_jointList = joint.m_next;
        }
        var bodyA = joint.m_bodyA;
        var bodyB = joint.m_bodyB;
        bodyA.setAwake(true);
        bodyB.setAwake(true);
        if (joint.m_edgeA.prev) {
          joint.m_edgeA.prev.next = joint.m_edgeA.next;
        }
        if (joint.m_edgeA.next) {
          joint.m_edgeA.next.prev = joint.m_edgeA.prev;
        }
        if (joint.m_edgeA == bodyA.m_jointList) {
          bodyA.m_jointList = joint.m_edgeA.next;
        }
        joint.m_edgeA.prev = null;
        joint.m_edgeA.next = null;
        if (joint.m_edgeB.prev) {
          joint.m_edgeB.prev.next = joint.m_edgeB.next;
        }
        if (joint.m_edgeB.next) {
          joint.m_edgeB.next.prev = joint.m_edgeB.prev;
        }
        if (joint.m_edgeB == bodyB.m_jointList) {
          bodyB.m_jointList = joint.m_edgeB.next;
        }
        joint.m_edgeB.prev = null;
        joint.m_edgeB.next = null;
        --this.m_jointCount;
        if (joint.m_collideConnected == false) {
          var edge = bodyB.getContactList();
          while (edge) {
            if (edge.other == bodyA) {
              edge.contact.flagForFiltering();
            }
            edge = edge.next;
          }
        }
        this.publish("remove-joint", joint);
      };
      World2.prototype.step = function(timeStep, velocityIterations, positionIterations) {
        this.publish("pre-step", timeStep);
        if ((velocityIterations | 0) !== velocityIterations) {
          velocityIterations = 0;
        }
        velocityIterations = velocityIterations || this.m_velocityIterations;
        positionIterations = positionIterations || this.m_positionIterations;
        if (this.m_newFixture) {
          this.findNewContacts();
          this.m_newFixture = false;
        }
        this.m_locked = true;
        this.s_step.reset(timeStep);
        this.s_step.velocityIterations = velocityIterations;
        this.s_step.positionIterations = positionIterations;
        this.s_step.warmStarting = this.m_warmStarting;
        this.s_step.blockSolve = this.m_blockSolve;
        this.updateContacts();
        if (this.m_stepComplete && timeStep > 0) {
          this.m_solver.solveWorld(this.s_step);
          for (var b2 = this.m_bodyList; b2; b2 = b2.getNext()) {
            if (b2.m_islandFlag == false) {
              continue;
            }
            if (b2.isStatic()) {
              continue;
            }
            b2.synchronizeFixtures();
          }
          this.findNewContacts();
        }
        if (this.m_continuousPhysics && timeStep > 0) {
          this.m_solver.solveWorldTOI(this.s_step);
        }
        if (this.m_clearForces) {
          this.clearForces();
        }
        this.m_locked = false;
        var callback;
        while (callback = this.m_step_callback.shift()) {
          callback(this);
        }
        this.publish("post-step", timeStep);
      };
      World2.prototype.queueUpdate = function(callback) {
        if (!this.isLocked()) {
          callback(this);
        } else {
          this.m_step_callback.push(callback);
        }
      };
      World2.prototype.findNewContacts = function() {
        var _this = this;
        this.m_broadPhase.updatePairs(function(proxyA, proxyB) {
          return _this.createContact(proxyA, proxyB);
        });
      };
      World2.prototype.createContact = function(proxyA, proxyB) {
        var fixtureA = proxyA.fixture;
        var fixtureB = proxyB.fixture;
        var indexA = proxyA.childIndex;
        var indexB = proxyB.childIndex;
        var bodyA = fixtureA.getBody();
        var bodyB = fixtureB.getBody();
        if (bodyA == bodyB) {
          return;
        }
        var edge = bodyB.getContactList();
        while (edge) {
          if (edge.other == bodyA) {
            var fA = edge.contact.getFixtureA();
            var fB = edge.contact.getFixtureB();
            var iA = edge.contact.getChildIndexA();
            var iB = edge.contact.getChildIndexB();
            if (fA == fixtureA && fB == fixtureB && iA == indexA && iB == indexB) {
              return;
            }
            if (fA == fixtureB && fB == fixtureA && iA == indexB && iB == indexA) {
              return;
            }
          }
          edge = edge.next;
        }
        if (bodyB.shouldCollide(bodyA) == false) {
          return;
        }
        if (fixtureB.shouldCollide(fixtureA) == false) {
          return;
        }
        var contact = Contact.create(fixtureA, indexA, fixtureB, indexB);
        if (contact == null) {
          return;
        }
        contact.m_prev = null;
        if (this.m_contactList != null) {
          contact.m_next = this.m_contactList;
          this.m_contactList.m_prev = contact;
        }
        this.m_contactList = contact;
        ++this.m_contactCount;
      };
      World2.prototype.updateContacts = function() {
        var c2;
        var next_c = this.m_contactList;
        while (c2 = next_c) {
          next_c = c2.getNext();
          var fixtureA = c2.getFixtureA();
          var fixtureB = c2.getFixtureB();
          var indexA = c2.getChildIndexA();
          var indexB = c2.getChildIndexB();
          var bodyA = fixtureA.getBody();
          var bodyB = fixtureB.getBody();
          if (c2.m_filterFlag) {
            if (bodyB.shouldCollide(bodyA) == false) {
              this.destroyContact(c2);
              continue;
            }
            if (fixtureB.shouldCollide(fixtureA) == false) {
              this.destroyContact(c2);
              continue;
            }
            c2.m_filterFlag = false;
          }
          var activeA = bodyA.isAwake() && !bodyA.isStatic();
          var activeB = bodyB.isAwake() && !bodyB.isStatic();
          if (activeA == false && activeB == false) {
            continue;
          }
          var proxyIdA = fixtureA.m_proxies[indexA].proxyId;
          var proxyIdB = fixtureB.m_proxies[indexB].proxyId;
          var overlap = this.m_broadPhase.testOverlap(proxyIdA, proxyIdB);
          if (overlap == false) {
            this.destroyContact(c2);
            continue;
          }
          c2.update(this);
        }
      };
      World2.prototype.destroyContact = function(contact) {
        if (contact.m_prev) {
          contact.m_prev.m_next = contact.m_next;
        }
        if (contact.m_next) {
          contact.m_next.m_prev = contact.m_prev;
        }
        if (contact == this.m_contactList) {
          this.m_contactList = contact.m_next;
        }
        Contact.destroy(contact, this);
        --this.m_contactCount;
      };
      World2.prototype.on = function(name, listener) {
        if (typeof name !== "string" || typeof listener !== "function") {
          return this;
        }
        if (!this._listeners) {
          this._listeners = {};
        }
        if (!this._listeners[name]) {
          this._listeners[name] = [];
        }
        this._listeners[name].push(listener);
        return this;
      };
      World2.prototype.off = function(name, listener) {
        if (typeof name !== "string" || typeof listener !== "function") {
          return this;
        }
        var listeners = this._listeners && this._listeners[name];
        if (!listeners || !listeners.length) {
          return this;
        }
        var index = listeners.indexOf(listener);
        if (index >= 0) {
          listeners.splice(index, 1);
        }
        return this;
      };
      World2.prototype.publish = function(name, arg1, arg2, arg3) {
        var listeners = this._listeners && this._listeners[name];
        if (!listeners || !listeners.length) {
          return 0;
        }
        for (var l = 0; l < listeners.length; l++) {
          listeners[l].call(this, arg1, arg2, arg3);
        }
        return listeners.length;
      };
      World2.prototype.beginContact = function(contact) {
        this.publish("begin-contact", contact);
      };
      World2.prototype.endContact = function(contact) {
        this.publish("end-contact", contact);
      };
      World2.prototype.preSolve = function(contact, oldManifold2) {
        this.publish("pre-solve", contact, oldManifold2);
      };
      World2.prototype.postSolve = function(contact, impulse) {
        this.publish("post-solve", contact, impulse);
      };
      return World2;
    })();
    var Vec3 = (function() {
      function Vec32(x2, y, z) {
        if (!(this instanceof Vec32)) {
          return new Vec32(x2, y, z);
        }
        if (typeof x2 === "undefined") {
          this.x = 0;
          this.y = 0;
          this.z = 0;
        } else if (typeof x2 === "object") {
          this.x = x2.x;
          this.y = x2.y;
          this.z = x2.z;
        } else {
          this.x = x2;
          this.y = y;
          this.z = z;
        }
      }
      Vec32.prototype._serialize = function() {
        return { x: this.x, y: this.y, z: this.z };
      };
      Vec32._deserialize = function(data) {
        var obj = Object.create(Vec32.prototype);
        obj.x = data.x;
        obj.y = data.y;
        obj.z = data.z;
        return obj;
      };
      Vec32.neo = function(x2, y, z) {
        var obj = Object.create(Vec32.prototype);
        obj.x = x2;
        obj.y = y;
        obj.z = z;
        return obj;
      };
      Vec32.zero = function() {
        var obj = Object.create(Vec32.prototype);
        obj.x = 0;
        obj.y = 0;
        obj.z = 0;
        return obj;
      };
      Vec32.clone = function(v3) {
        return Vec32.neo(v3.x, v3.y, v3.z);
      };
      Vec32.prototype.toString = function() {
        return JSON.stringify(this);
      };
      Vec32.isValid = function(obj) {
        if (obj === null || typeof obj === "undefined") {
          return false;
        }
        return Number.isFinite(obj.x) && Number.isFinite(obj.y) && Number.isFinite(obj.z);
      };
      Vec32.assert = function(o) {
      };
      Vec32.prototype.setZero = function() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        return this;
      };
      Vec32.prototype.set = function(x2, y, z) {
        this.x = x2;
        this.y = y;
        this.z = z;
        return this;
      };
      Vec32.prototype.add = function(w) {
        this.x += w.x;
        this.y += w.y;
        this.z += w.z;
        return this;
      };
      Vec32.prototype.sub = function(w) {
        this.x -= w.x;
        this.y -= w.y;
        this.z -= w.z;
        return this;
      };
      Vec32.prototype.mul = function(m) {
        this.x *= m;
        this.y *= m;
        this.z *= m;
        return this;
      };
      Vec32.areEqual = function(v3, w) {
        return v3 === w || typeof v3 === "object" && v3 !== null && typeof w === "object" && w !== null && v3.x === w.x && v3.y === w.y && v3.z === w.z;
      };
      Vec32.dot = function(v3, w) {
        return v3.x * w.x + v3.y * w.y + v3.z * w.z;
      };
      Vec32.cross = function(v3, w) {
        return new Vec32(v3.y * w.z - v3.z * w.y, v3.z * w.x - v3.x * w.z, v3.x * w.y - v3.y * w.x);
      };
      Vec32.add = function(v3, w) {
        return new Vec32(v3.x + w.x, v3.y + w.y, v3.z + w.z);
      };
      Vec32.sub = function(v3, w) {
        return new Vec32(v3.x - w.x, v3.y - w.y, v3.z - w.z);
      };
      Vec32.mul = function(v3, m) {
        return new Vec32(m * v3.x, m * v3.y, m * v3.z);
      };
      Vec32.prototype.neg = function() {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        return this;
      };
      Vec32.neg = function(v3) {
        return new Vec32(-v3.x, -v3.y, -v3.z);
      };
      return Vec32;
    })();
    var v1$2 = vec2(0, 0);
    var v2$1 = vec2(0, 0);
    var EdgeShape = (function(_super) {
      __extends(EdgeShape2, _super);
      function EdgeShape2(v122, v22) {
        var _this = this;
        if (!(_this instanceof EdgeShape2)) {
          return new EdgeShape2(v122, v22);
        }
        _this = _super.call(this) || this;
        _this.m_type = EdgeShape2.TYPE;
        _this.m_radius = SettingsInternal.polygonRadius;
        _this.m_vertex1 = v122 ? Vec2.clone(v122) : Vec2.zero();
        _this.m_vertex2 = v22 ? Vec2.clone(v22) : Vec2.zero();
        _this.m_vertex0 = Vec2.zero();
        _this.m_vertex3 = Vec2.zero();
        _this.m_hasVertex0 = false;
        _this.m_hasVertex3 = false;
        return _this;
      }
      EdgeShape2.prototype._serialize = function() {
        return { type: this.m_type, vertex1: this.m_vertex1, vertex2: this.m_vertex2, vertex0: this.m_vertex0, vertex3: this.m_vertex3 };
      };
      EdgeShape2._deserialize = function(data) {
        var shape = new EdgeShape2(data.vertex1, data.vertex2);
        if (shape.m_hasVertex0) {
          shape.setPrevVertex(data.vertex0);
        }
        if (shape.m_hasVertex3) {
          shape.setNextVertex(data.vertex3);
        }
        return shape;
      };
      EdgeShape2.prototype._reset = function() {
      };
      EdgeShape2.prototype.getRadius = function() {
        return this.m_radius;
      };
      EdgeShape2.prototype.getType = function() {
        return this.m_type;
      };
      EdgeShape2.prototype.setNext = function(v3) {
        return this.setNextVertex(v3);
      };
      EdgeShape2.prototype.setNextVertex = function(v3) {
        if (v3) {
          this.m_vertex3.setVec2(v3);
          this.m_hasVertex3 = true;
        } else {
          this.m_vertex3.setZero();
          this.m_hasVertex3 = false;
        }
        return this;
      };
      EdgeShape2.prototype.getNextVertex = function() {
        return this.m_vertex3;
      };
      EdgeShape2.prototype.setPrev = function(v3) {
        return this.setPrevVertex(v3);
      };
      EdgeShape2.prototype.setPrevVertex = function(v3) {
        if (v3) {
          this.m_vertex0.setVec2(v3);
          this.m_hasVertex0 = true;
        } else {
          this.m_vertex0.setZero();
          this.m_hasVertex0 = false;
        }
        return this;
      };
      EdgeShape2.prototype.getPrevVertex = function() {
        return this.m_vertex0;
      };
      EdgeShape2.prototype._set = function(v122, v22) {
        this.m_vertex1.setVec2(v122);
        this.m_vertex2.setVec2(v22);
        this.m_hasVertex0 = false;
        this.m_hasVertex3 = false;
        return this;
      };
      EdgeShape2.prototype._clone = function() {
        var clone = new EdgeShape2();
        clone.m_type = this.m_type;
        clone.m_radius = this.m_radius;
        clone.m_vertex1.setVec2(this.m_vertex1);
        clone.m_vertex2.setVec2(this.m_vertex2);
        clone.m_vertex0.setVec2(this.m_vertex0);
        clone.m_vertex3.setVec2(this.m_vertex3);
        clone.m_hasVertex0 = this.m_hasVertex0;
        clone.m_hasVertex3 = this.m_hasVertex3;
        return clone;
      };
      EdgeShape2.prototype.getChildCount = function() {
        return 1;
      };
      EdgeShape2.prototype.testPoint = function(xf2, p) {
        return false;
      };
      EdgeShape2.prototype.rayCast = function(output2, input2, xf2, childIndex) {
        var p1 = Rot.mulTVec2(xf2.q, Vec2.sub(input2.p1, xf2.p));
        var p2 = Rot.mulTVec2(xf2.q, Vec2.sub(input2.p2, xf2.p));
        var d2 = Vec2.sub(p2, p1);
        var v122 = this.m_vertex1;
        var v22 = this.m_vertex2;
        var e3 = Vec2.sub(v22, v122);
        var normal3 = Vec2.neo(e3.y, -e3.x);
        normal3.normalize();
        var numerator = Vec2.dot(normal3, Vec2.sub(v122, p1));
        var denominator = Vec2.dot(normal3, d2);
        if (denominator == 0) {
          return false;
        }
        var t = numerator / denominator;
        if (t < 0 || input2.maxFraction < t) {
          return false;
        }
        var q = Vec2.add(p1, Vec2.mulNumVec2(t, d2));
        var r = Vec2.sub(v22, v122);
        var rr = Vec2.dot(r, r);
        if (rr == 0) {
          return false;
        }
        var s2 = Vec2.dot(Vec2.sub(q, v122), r) / rr;
        if (s2 < 0 || 1 < s2) {
          return false;
        }
        output2.fraction = t;
        if (numerator > 0) {
          output2.normal = Rot.mulVec2(xf2.q, normal3).neg();
        } else {
          output2.normal = Rot.mulVec2(xf2.q, normal3);
        }
        return true;
      };
      EdgeShape2.prototype.computeAABB = function(aabb, xf2, childIndex) {
        transformVec2(v1$2, xf2, this.m_vertex1);
        transformVec2(v2$1, xf2, this.m_vertex2);
        AABB.combinePoints(aabb, v1$2, v2$1);
        AABB.extend(aabb, this.m_radius);
      };
      EdgeShape2.prototype.computeMass = function(massData, density) {
        massData.mass = 0;
        combine2Vec2(massData.center, 0.5, this.m_vertex1, 0.5, this.m_vertex2);
        massData.I = 0;
      };
      EdgeShape2.prototype.computeDistanceProxy = function(proxy) {
        proxy.m_vertices[0] = this.m_vertex1;
        proxy.m_vertices[1] = this.m_vertex2;
        proxy.m_vertices.length = 2;
        proxy.m_count = 2;
        proxy.m_radius = this.m_radius;
      };
      EdgeShape2.TYPE = "edge";
      return EdgeShape2;
    })(Shape);
    var v1$1 = vec2(0, 0);
    var v2 = vec2(0, 0);
    var ChainShape = (function(_super) {
      __extends(ChainShape2, _super);
      function ChainShape2(vertices, loop) {
        var _this = this;
        if (!(_this instanceof ChainShape2)) {
          return new ChainShape2(vertices, loop);
        }
        _this = _super.call(this) || this;
        _this.m_type = ChainShape2.TYPE;
        _this.m_radius = SettingsInternal.polygonRadius;
        _this.m_vertices = [];
        _this.m_count = 0;
        _this.m_prevVertex = null;
        _this.m_nextVertex = null;
        _this.m_hasPrevVertex = false;
        _this.m_hasNextVertex = false;
        _this.m_isLoop = !!loop;
        if (vertices && vertices.length) {
          if (loop) {
            _this._createLoop(vertices);
          } else {
            _this._createChain(vertices);
          }
        }
        return _this;
      }
      ChainShape2.prototype._serialize = function() {
        var data = { type: this.m_type, vertices: this.m_isLoop ? this.m_vertices.slice(0, this.m_vertices.length - 1) : this.m_vertices, isLoop: this.m_isLoop, hasPrevVertex: this.m_hasPrevVertex, hasNextVertex: this.m_hasNextVertex, prevVertex: null, nextVertex: null };
        if (this.m_prevVertex) {
          data.prevVertex = this.m_prevVertex;
        }
        if (this.m_nextVertex) {
          data.nextVertex = this.m_nextVertex;
        }
        return data;
      };
      ChainShape2._deserialize = function(data, fixture, restore) {
        var vertices = [];
        if (data.vertices) {
          for (var i = 0; i < data.vertices.length; i++) {
            vertices.push(data.vertices[i]);
          }
        }
        var shape = new ChainShape2(vertices, data.isLoop);
        if (data.prevVertex) {
          shape.setPrevVertex(data.prevVertex);
        }
        if (data.nextVertex) {
          shape.setNextVertex(data.nextVertex);
        }
        return shape;
      };
      ChainShape2.prototype.getType = function() {
        return this.m_type;
      };
      ChainShape2.prototype.getRadius = function() {
        return this.m_radius;
      };
      ChainShape2.prototype._createLoop = function(vertices) {
        if (vertices.length < 3) {
          return;
        }
        var i;
        this.m_vertices = [];
        this.m_count = vertices.length + 1;
        for (var i = 0; i < vertices.length; ++i) {
          this.m_vertices[i] = Vec2.clone(vertices[i]);
        }
        this.m_vertices[vertices.length] = Vec2.clone(vertices[0]);
        this.m_prevVertex = this.m_vertices[this.m_count - 2];
        this.m_nextVertex = this.m_vertices[1];
        this.m_hasPrevVertex = true;
        this.m_hasNextVertex = true;
        return this;
      };
      ChainShape2.prototype._createChain = function(vertices) {
        var i;
        this.m_vertices = [];
        this.m_count = vertices.length;
        for (var i = 0; i < vertices.length; ++i) {
          this.m_vertices[i] = Vec2.clone(vertices[i]);
        }
        this.m_prevVertex = null;
        this.m_nextVertex = null;
        this.m_hasPrevVertex = false;
        this.m_hasNextVertex = false;
        return this;
      };
      ChainShape2.prototype._reset = function() {
        if (this.m_isLoop) {
          this._createLoop(this.m_vertices.slice(0, this.m_vertices.length - 1));
        } else {
          this._createChain(this.m_vertices);
        }
      };
      ChainShape2.prototype.setPrevVertex = function(prevVertex) {
        this.m_prevVertex = prevVertex;
        this.m_hasPrevVertex = true;
      };
      ChainShape2.prototype.getPrevVertex = function() {
        return this.m_prevVertex;
      };
      ChainShape2.prototype.setNextVertex = function(nextVertex) {
        this.m_nextVertex = nextVertex;
        this.m_hasNextVertex = true;
      };
      ChainShape2.prototype.getNextVertex = function() {
        return this.m_nextVertex;
      };
      ChainShape2.prototype._clone = function() {
        var clone = new ChainShape2();
        clone._createChain(this.m_vertices);
        clone.m_type = this.m_type;
        clone.m_radius = this.m_radius;
        clone.m_prevVertex = this.m_prevVertex;
        clone.m_nextVertex = this.m_nextVertex;
        clone.m_hasPrevVertex = this.m_hasPrevVertex;
        clone.m_hasNextVertex = this.m_hasNextVertex;
        return clone;
      };
      ChainShape2.prototype.getChildCount = function() {
        return this.m_count - 1;
      };
      ChainShape2.prototype.getChildEdge = function(edge, childIndex) {
        edge.m_type = EdgeShape.TYPE;
        edge.m_radius = this.m_radius;
        edge.m_vertex1 = this.m_vertices[childIndex];
        edge.m_vertex2 = this.m_vertices[childIndex + 1];
        if (childIndex > 0) {
          edge.m_vertex0 = this.m_vertices[childIndex - 1];
          edge.m_hasVertex0 = true;
        } else {
          edge.m_vertex0 = this.m_prevVertex;
          edge.m_hasVertex0 = this.m_hasPrevVertex;
        }
        if (childIndex < this.m_count - 2) {
          edge.m_vertex3 = this.m_vertices[childIndex + 2];
          edge.m_hasVertex3 = true;
        } else {
          edge.m_vertex3 = this.m_nextVertex;
          edge.m_hasVertex3 = this.m_hasNextVertex;
        }
      };
      ChainShape2.prototype.getVertex = function(index) {
        if (index < this.m_count) {
          return this.m_vertices[index];
        } else {
          return this.m_vertices[0];
        }
      };
      ChainShape2.prototype.isLoop = function() {
        return this.m_isLoop;
      };
      ChainShape2.prototype.testPoint = function(xf2, p) {
        return false;
      };
      ChainShape2.prototype.rayCast = function(output2, input2, xf2, childIndex) {
        var edgeShape = new EdgeShape(this.getVertex(childIndex), this.getVertex(childIndex + 1));
        return edgeShape.rayCast(output2, input2, xf2, 0);
      };
      ChainShape2.prototype.computeAABB = function(aabb, xf2, childIndex) {
        transformVec2(v1$1, xf2, this.getVertex(childIndex));
        transformVec2(v2, xf2, this.getVertex(childIndex + 1));
        AABB.combinePoints(aabb, v1$1, v2);
      };
      ChainShape2.prototype.computeMass = function(massData, density) {
        massData.mass = 0;
        zeroVec2(massData.center);
        massData.I = 0;
      };
      ChainShape2.prototype.computeDistanceProxy = function(proxy, childIndex) {
        proxy.m_vertices[0] = this.getVertex(childIndex);
        proxy.m_vertices[1] = this.getVertex(childIndex + 1);
        proxy.m_count = 2;
        proxy.m_radius = this.m_radius;
      };
      ChainShape2.TYPE = "chain";
      return ChainShape2;
    })(Shape);
    var math_max$1 = Math.max;
    var math_min$3 = Math.min;
    var temp$1 = vec2(0, 0);
    var e$1 = vec2(0, 0);
    var e1$1 = vec2(0, 0);
    var e2$1 = vec2(0, 0);
    var center = vec2(0, 0);
    var s = vec2(0, 0);
    var PolygonShape = (function(_super) {
      __extends(PolygonShape2, _super);
      function PolygonShape2(vertices) {
        var _this = this;
        if (!(_this instanceof PolygonShape2)) {
          return new PolygonShape2(vertices);
        }
        _this = _super.call(this) || this;
        _this.m_type = PolygonShape2.TYPE;
        _this.m_radius = SettingsInternal.polygonRadius;
        _this.m_centroid = Vec2.zero();
        _this.m_vertices = [];
        _this.m_normals = [];
        _this.m_count = 0;
        if (vertices && vertices.length) {
          _this._set(vertices);
        }
        return _this;
      }
      PolygonShape2.prototype._serialize = function() {
        return { type: this.m_type, vertices: this.m_vertices };
      };
      PolygonShape2._deserialize = function(data, fixture, restore) {
        var vertices = [];
        if (data.vertices) {
          for (var i = 0; i < data.vertices.length; i++) {
            vertices.push(data.vertices[i]);
          }
        }
        var shape = new PolygonShape2(vertices);
        return shape;
      };
      PolygonShape2.prototype.getType = function() {
        return this.m_type;
      };
      PolygonShape2.prototype.getRadius = function() {
        return this.m_radius;
      };
      PolygonShape2.prototype._clone = function() {
        var clone = new PolygonShape2();
        clone.m_type = this.m_type;
        clone.m_radius = this.m_radius;
        clone.m_count = this.m_count;
        clone.m_centroid.setVec2(this.m_centroid);
        for (var i = 0; i < this.m_count; i++) {
          clone.m_vertices.push(this.m_vertices[i].clone());
        }
        for (var i = 0; i < this.m_normals.length; i++) {
          clone.m_normals.push(this.m_normals[i].clone());
        }
        return clone;
      };
      PolygonShape2.prototype.getChildCount = function() {
        return 1;
      };
      PolygonShape2.prototype._reset = function() {
        this._set(this.m_vertices);
      };
      PolygonShape2.prototype._set = function(vertices) {
        if (vertices.length < 3) {
          this._setAsBox(1, 1);
          return;
        }
        var n2 = math_min$3(vertices.length, SettingsInternal.maxPolygonVertices);
        var ps = [];
        for (var i = 0; i < n2; ++i) {
          var v3 = vertices[i];
          var unique = true;
          for (var j = 0; j < ps.length; ++j) {
            if (Vec2.distanceSquared(v3, ps[j]) < 0.25 * SettingsInternal.linearSlopSquared) {
              unique = false;
              break;
            }
          }
          if (unique) {
            ps.push(Vec2.clone(v3));
          }
        }
        n2 = ps.length;
        if (n2 < 3) {
          this._setAsBox(1, 1);
          return;
        }
        var i0 = 0;
        var x0 = ps[0].x;
        for (var i = 1; i < n2; ++i) {
          var x2 = ps[i].x;
          if (x2 > x0 || x2 === x0 && ps[i].y < ps[i0].y) {
            i0 = i;
            x0 = x2;
          }
        }
        var hull = [];
        var m = 0;
        var ih = i0;
        while (true) {
          hull[m] = ih;
          var ie2 = 0;
          for (var j = 1; j < n2; ++j) {
            if (ie2 === ih) {
              ie2 = j;
              continue;
            }
            var r = Vec2.sub(ps[ie2], ps[hull[m]]);
            var v3 = Vec2.sub(ps[j], ps[hull[m]]);
            var c2 = Vec2.crossVec2Vec2(r, v3);
            if (c2 < 0) {
              ie2 = j;
            }
            if (c2 === 0 && v3.lengthSquared() > r.lengthSquared()) {
              ie2 = j;
            }
          }
          ++m;
          ih = ie2;
          if (ie2 === i0) {
            break;
          }
        }
        if (m < 3) {
          this._setAsBox(1, 1);
          return;
        }
        this.m_count = m;
        this.m_vertices = [];
        for (var i = 0; i < m; ++i) {
          this.m_vertices[i] = ps[hull[i]];
        }
        for (var i = 0; i < m; ++i) {
          var i1 = i;
          var i2 = i + 1 < m ? i + 1 : 0;
          var edge = Vec2.sub(this.m_vertices[i2], this.m_vertices[i1]);
          this.m_normals[i] = Vec2.crossVec2Num(edge, 1);
          this.m_normals[i].normalize();
        }
        this.m_centroid = computeCentroid(this.m_vertices, m);
      };
      PolygonShape2.prototype._setAsBox = function(hx, hy, center2, angle) {
        this.m_vertices[0] = Vec2.neo(hx, -hy);
        this.m_vertices[1] = Vec2.neo(hx, hy);
        this.m_vertices[2] = Vec2.neo(-hx, hy);
        this.m_vertices[3] = Vec2.neo(-hx, -hy);
        this.m_normals[0] = Vec2.neo(1, 0);
        this.m_normals[1] = Vec2.neo(0, 1);
        this.m_normals[2] = Vec2.neo(-1, 0);
        this.m_normals[3] = Vec2.neo(0, -1);
        this.m_count = 4;
        if (center2 && Vec2.isValid(center2)) {
          angle = angle || 0;
          copyVec2(this.m_centroid, center2);
          var xf2 = Transform.identity();
          xf2.p.setVec2(center2);
          xf2.q.setAngle(angle);
          for (var i = 0; i < this.m_count; ++i) {
            this.m_vertices[i] = Transform.mulVec2(xf2, this.m_vertices[i]);
            this.m_normals[i] = Rot.mulVec2(xf2.q, this.m_normals[i]);
          }
        }
      };
      PolygonShape2.prototype.testPoint = function(xf2, p) {
        var pLocal = detransformVec2(temp$1, xf2, p);
        for (var i = 0; i < this.m_count; ++i) {
          var dot = dotVec2(this.m_normals[i], pLocal) - dotVec2(this.m_normals[i], this.m_vertices[i]);
          if (dot > 0) {
            return false;
          }
        }
        return true;
      };
      PolygonShape2.prototype.rayCast = function(output2, input2, xf2, childIndex) {
        var p1 = Rot.mulTVec2(xf2.q, Vec2.sub(input2.p1, xf2.p));
        var p2 = Rot.mulTVec2(xf2.q, Vec2.sub(input2.p2, xf2.p));
        var d2 = Vec2.sub(p2, p1);
        var lower = 0;
        var upper = input2.maxFraction;
        var index = -1;
        for (var i = 0; i < this.m_count; ++i) {
          var numerator = Vec2.dot(this.m_normals[i], Vec2.sub(this.m_vertices[i], p1));
          var denominator = Vec2.dot(this.m_normals[i], d2);
          if (denominator == 0) {
            if (numerator < 0) {
              return false;
            }
          } else {
            if (denominator < 0 && numerator < lower * denominator) {
              lower = numerator / denominator;
              index = i;
            } else if (denominator > 0 && numerator < upper * denominator) {
              upper = numerator / denominator;
            }
          }
          if (upper < lower) {
            return false;
          }
        }
        if (index >= 0) {
          output2.fraction = lower;
          output2.normal = Rot.mulVec2(xf2.q, this.m_normals[index]);
          return true;
        }
        return false;
      };
      PolygonShape2.prototype.computeAABB = function(aabb, xf2, childIndex) {
        var minX = Infinity;
        var minY = Infinity;
        var maxX = -Infinity;
        var maxY = -Infinity;
        for (var i = 0; i < this.m_count; ++i) {
          var v3 = transformVec2(temp$1, xf2, this.m_vertices[i]);
          minX = math_min$3(minX, v3.x);
          maxX = math_max$1(maxX, v3.x);
          minY = math_min$3(minY, v3.y);
          maxY = math_max$1(maxY, v3.y);
        }
        setVec2(aabb.lowerBound, minX - this.m_radius, minY - this.m_radius);
        setVec2(aabb.upperBound, maxX + this.m_radius, maxY + this.m_radius);
      };
      PolygonShape2.prototype.computeMass = function(massData, density) {
        zeroVec2(center);
        var area = 0;
        var I = 0;
        zeroVec2(s);
        for (var i = 0; i < this.m_count; ++i) {
          plusVec2(s, this.m_vertices[i]);
        }
        scaleVec2(s, 1 / this.m_count, s);
        var k_inv3 = 1 / 3;
        for (var i = 0; i < this.m_count; ++i) {
          subVec2(e1$1, this.m_vertices[i], s);
          if (i + 1 < this.m_count) {
            subVec2(e2$1, this.m_vertices[i + 1], s);
          } else {
            subVec2(e2$1, this.m_vertices[0], s);
          }
          var D = crossVec2Vec2(e1$1, e2$1);
          var triangleArea = 0.5 * D;
          area += triangleArea;
          combine2Vec2(temp$1, triangleArea * k_inv3, e1$1, triangleArea * k_inv3, e2$1);
          plusVec2(center, temp$1);
          var ex1 = e1$1.x;
          var ey1 = e1$1.y;
          var ex2 = e2$1.x;
          var ey2 = e2$1.y;
          var intx2 = ex1 * ex1 + ex2 * ex1 + ex2 * ex2;
          var inty2 = ey1 * ey1 + ey2 * ey1 + ey2 * ey2;
          I += 0.25 * k_inv3 * D * (intx2 + inty2);
        }
        massData.mass = density * area;
        scaleVec2(center, 1 / area, center);
        addVec2(massData.center, center, s);
        massData.I = density * I;
        massData.I += massData.mass * (dotVec2(massData.center, massData.center) - dotVec2(center, center));
      };
      PolygonShape2.prototype.validate = function() {
        for (var i = 0; i < this.m_count; ++i) {
          var i1 = i;
          var i2 = i < this.m_count - 1 ? i1 + 1 : 0;
          var p = this.m_vertices[i1];
          subVec2(e$1, this.m_vertices[i2], p);
          for (var j = 0; j < this.m_count; ++j) {
            if (j == i1 || j == i2) {
              continue;
            }
            var c2 = crossVec2Vec2(e$1, subVec2(temp$1, this.m_vertices[j], p));
            if (c2 < 0) {
              return false;
            }
          }
        }
        return true;
      };
      PolygonShape2.prototype.computeDistanceProxy = function(proxy) {
        for (var i = 0; i < this.m_count; ++i) {
          proxy.m_vertices[i] = this.m_vertices[i];
        }
        proxy.m_vertices.length = this.m_count;
        proxy.m_count = this.m_count;
        proxy.m_radius = this.m_radius;
      };
      PolygonShape2.TYPE = "polygon";
      return PolygonShape2;
    })(Shape);
    function computeCentroid(vs, count) {
      var c2 = Vec2.zero();
      var area = 0;
      var pRef = Vec2.zero();
      var i;
      var inv3 = 1 / 3;
      for (var i = 0; i < count; ++i) {
        var p1 = pRef;
        var p2 = vs[i];
        var p3 = i + 1 < count ? vs[i + 1] : vs[0];
        var e1_1 = Vec2.sub(p2, p1);
        var e2_1 = Vec2.sub(p3, p1);
        var D = Vec2.crossVec2Vec2(e1_1, e2_1);
        var triangleArea = 0.5 * D;
        area += triangleArea;
        combine3Vec2(temp$1, 1, p1, 1, p2, 1, p3);
        plusScaleVec2(c2, triangleArea * inv3, temp$1);
      }
      c2.mul(1 / area);
      return c2;
    }
    var math_sqrt = Math.sqrt;
    var math_PI$4 = Math.PI;
    var temp = vec2(0, 0);
    var CircleShape = (function(_super) {
      __extends(CircleShape2, _super);
      function CircleShape2(a2, b2) {
        var _this = this;
        if (!(_this instanceof CircleShape2)) {
          return new CircleShape2(a2, b2);
        }
        _this = _super.call(this) || this;
        _this.m_type = CircleShape2.TYPE;
        _this.m_p = Vec2.zero();
        _this.m_radius = 1;
        if (typeof a2 === "object" && Vec2.isValid(a2)) {
          _this.m_p.setVec2(a2);
          if (typeof b2 === "number") {
            _this.m_radius = b2;
          }
        } else if (typeof a2 === "number") {
          _this.m_radius = a2;
        }
        return _this;
      }
      CircleShape2.prototype._serialize = function() {
        return { type: this.m_type, p: this.m_p, radius: this.m_radius };
      };
      CircleShape2._deserialize = function(data) {
        return new CircleShape2(data.p, data.radius);
      };
      CircleShape2.prototype._reset = function() {
      };
      CircleShape2.prototype.getType = function() {
        return this.m_type;
      };
      CircleShape2.prototype.getRadius = function() {
        return this.m_radius;
      };
      CircleShape2.prototype.getCenter = function() {
        return this.m_p;
      };
      CircleShape2.prototype._clone = function() {
        var clone = new CircleShape2();
        clone.m_type = this.m_type;
        clone.m_radius = this.m_radius;
        clone.m_p = this.m_p.clone();
        return clone;
      };
      CircleShape2.prototype.getChildCount = function() {
        return 1;
      };
      CircleShape2.prototype.testPoint = function(xf2, p) {
        var center2 = transformVec2(temp, xf2, this.m_p);
        return distSqrVec2(p, center2) <= this.m_radius * this.m_radius;
      };
      CircleShape2.prototype.rayCast = function(output2, input2, xf2, childIndex) {
        var position = Vec2.add(xf2.p, Rot.mulVec2(xf2.q, this.m_p));
        var s2 = Vec2.sub(input2.p1, position);
        var b2 = Vec2.dot(s2, s2) - this.m_radius * this.m_radius;
        var r = Vec2.sub(input2.p2, input2.p1);
        var c2 = Vec2.dot(s2, r);
        var rr = Vec2.dot(r, r);
        var sigma = c2 * c2 - rr * b2;
        if (sigma < 0 || rr < EPSILON) {
          return false;
        }
        var a2 = -(c2 + math_sqrt(sigma));
        if (0 <= a2 && a2 <= input2.maxFraction * rr) {
          a2 /= rr;
          output2.fraction = a2;
          output2.normal = Vec2.add(s2, Vec2.mulNumVec2(a2, r));
          output2.normal.normalize();
          return true;
        }
        return false;
      };
      CircleShape2.prototype.computeAABB = function(aabb, xf2, childIndex) {
        var p = transformVec2(temp, xf2, this.m_p);
        setVec2(aabb.lowerBound, p.x - this.m_radius, p.y - this.m_radius);
        setVec2(aabb.upperBound, p.x + this.m_radius, p.y + this.m_radius);
      };
      CircleShape2.prototype.computeMass = function(massData, density) {
        massData.mass = density * math_PI$4 * this.m_radius * this.m_radius;
        copyVec2(massData.center, this.m_p);
        massData.I = massData.mass * (0.5 * this.m_radius * this.m_radius + lengthSqrVec2(this.m_p));
      };
      CircleShape2.prototype.computeDistanceProxy = function(proxy) {
        proxy.m_vertices[0] = this.m_p;
        proxy.m_vertices.length = 1;
        proxy.m_count = 1;
        proxy.m_radius = this.m_radius;
      };
      CircleShape2.TYPE = "circle";
      return CircleShape2;
    })(Shape);
    var math_abs$5 = Math.abs;
    var math_PI$3 = Math.PI;
    var DEFAULTS$a = { frequencyHz: 0, dampingRatio: 0 };
    var DistanceJoint = (function(_super) {
      __extends(DistanceJoint2, _super);
      function DistanceJoint2(def, bodyA, bodyB, anchorA, anchorB) {
        var _this = this;
        if (!(_this instanceof DistanceJoint2)) {
          return new DistanceJoint2(def, bodyA, bodyB, anchorA, anchorB);
        }
        if (bodyB && anchorA && "m_type" in anchorA && "x" in bodyB && "y" in bodyB) {
          var temp3 = bodyB;
          bodyB = anchorA;
          anchorA = temp3;
        }
        def = options(def, DEFAULTS$a);
        _this = _super.call(this, def, bodyA, bodyB) || this;
        bodyA = _this.m_bodyA;
        bodyB = _this.m_bodyB;
        _this.m_type = DistanceJoint2.TYPE;
        _this.m_localAnchorA = Vec2.clone(anchorA ? bodyA.getLocalPoint(anchorA) : def.localAnchorA || Vec2.zero());
        _this.m_localAnchorB = Vec2.clone(anchorB ? bodyB.getLocalPoint(anchorB) : def.localAnchorB || Vec2.zero());
        _this.m_length = Number.isFinite(def.length) ? def.length : Vec2.distance(bodyA.getWorldPoint(_this.m_localAnchorA), bodyB.getWorldPoint(_this.m_localAnchorB));
        _this.m_frequencyHz = def.frequencyHz;
        _this.m_dampingRatio = def.dampingRatio;
        _this.m_impulse = 0;
        _this.m_gamma = 0;
        _this.m_bias = 0;
        return _this;
      }
      DistanceJoint2.prototype._serialize = function() {
        return { type: this.m_type, bodyA: this.m_bodyA, bodyB: this.m_bodyB, collideConnected: this.m_collideConnected, frequencyHz: this.m_frequencyHz, dampingRatio: this.m_dampingRatio, localAnchorA: this.m_localAnchorA, localAnchorB: this.m_localAnchorB, length: this.m_length };
      };
      DistanceJoint2._deserialize = function(data, world, restore) {
        data = __assign({}, data);
        data.bodyA = restore(Body, data.bodyA, world);
        data.bodyB = restore(Body, data.bodyB, world);
        var joint = new DistanceJoint2(data);
        return joint;
      };
      DistanceJoint2.prototype._reset = function(def) {
        if (def.anchorA) {
          this.m_localAnchorA.setVec2(this.m_bodyA.getLocalPoint(def.anchorA));
        } else if (def.localAnchorA) {
          this.m_localAnchorA.setVec2(def.localAnchorA);
        }
        if (def.anchorB) {
          this.m_localAnchorB.setVec2(this.m_bodyB.getLocalPoint(def.anchorB));
        } else if (def.localAnchorB) {
          this.m_localAnchorB.setVec2(def.localAnchorB);
        }
        if (def.length > 0) {
          this.m_length = +def.length;
        } else if (def.length < 0) ;
        else if (def.anchorA || def.anchorA || def.anchorA || def.anchorA) {
          this.m_length = Vec2.distance(this.m_bodyA.getWorldPoint(this.m_localAnchorA), this.m_bodyB.getWorldPoint(this.m_localAnchorB));
        }
        if (Number.isFinite(def.frequencyHz)) {
          this.m_frequencyHz = def.frequencyHz;
        }
        if (Number.isFinite(def.dampingRatio)) {
          this.m_dampingRatio = def.dampingRatio;
        }
      };
      DistanceJoint2.prototype.getLocalAnchorA = function() {
        return this.m_localAnchorA;
      };
      DistanceJoint2.prototype.getLocalAnchorB = function() {
        return this.m_localAnchorB;
      };
      DistanceJoint2.prototype.setLength = function(length) {
        this.m_length = length;
      };
      DistanceJoint2.prototype.getLength = function() {
        return this.m_length;
      };
      DistanceJoint2.prototype.setFrequency = function(hz) {
        this.m_frequencyHz = hz;
      };
      DistanceJoint2.prototype.getFrequency = function() {
        return this.m_frequencyHz;
      };
      DistanceJoint2.prototype.setDampingRatio = function(ratio) {
        this.m_dampingRatio = ratio;
      };
      DistanceJoint2.prototype.getDampingRatio = function() {
        return this.m_dampingRatio;
      };
      DistanceJoint2.prototype.getAnchorA = function() {
        return this.m_bodyA.getWorldPoint(this.m_localAnchorA);
      };
      DistanceJoint2.prototype.getAnchorB = function() {
        return this.m_bodyB.getWorldPoint(this.m_localAnchorB);
      };
      DistanceJoint2.prototype.getReactionForce = function(inv_dt) {
        return Vec2.mulNumVec2(this.m_impulse, this.m_u).mul(inv_dt);
      };
      DistanceJoint2.prototype.getReactionTorque = function(inv_dt) {
        return 0;
      };
      DistanceJoint2.prototype.initVelocityConstraints = function(step) {
        this.m_localCenterA = this.m_bodyA.m_sweep.localCenter;
        this.m_localCenterB = this.m_bodyB.m_sweep.localCenter;
        this.m_invMassA = this.m_bodyA.m_invMass;
        this.m_invMassB = this.m_bodyB.m_invMass;
        this.m_invIA = this.m_bodyA.m_invI;
        this.m_invIB = this.m_bodyB.m_invI;
        var cA2 = this.m_bodyA.c_position.c;
        var aA = this.m_bodyA.c_position.a;
        var vA2 = this.m_bodyA.c_velocity.v;
        var wA = this.m_bodyA.c_velocity.w;
        var cB2 = this.m_bodyB.c_position.c;
        var aB = this.m_bodyB.c_position.a;
        var vB2 = this.m_bodyB.c_velocity.v;
        var wB = this.m_bodyB.c_velocity.w;
        var qA = Rot.neo(aA);
        var qB = Rot.neo(aB);
        this.m_rA = Rot.mulVec2(qA, Vec2.sub(this.m_localAnchorA, this.m_localCenterA));
        this.m_rB = Rot.mulVec2(qB, Vec2.sub(this.m_localAnchorB, this.m_localCenterB));
        this.m_u = Vec2.sub(Vec2.add(cB2, this.m_rB), Vec2.add(cA2, this.m_rA));
        var length = this.m_u.length();
        if (length > SettingsInternal.linearSlop) {
          this.m_u.mul(1 / length);
        } else {
          this.m_u.setNum(0, 0);
        }
        var crAu = Vec2.crossVec2Vec2(this.m_rA, this.m_u);
        var crBu = Vec2.crossVec2Vec2(this.m_rB, this.m_u);
        var invMass = this.m_invMassA + this.m_invIA * crAu * crAu + this.m_invMassB + this.m_invIB * crBu * crBu;
        this.m_mass = invMass != 0 ? 1 / invMass : 0;
        if (this.m_frequencyHz > 0) {
          var C = length - this.m_length;
          var omega = 2 * math_PI$3 * this.m_frequencyHz;
          var d2 = 2 * this.m_mass * this.m_dampingRatio * omega;
          var k = this.m_mass * omega * omega;
          var h = step.dt;
          this.m_gamma = h * (d2 + h * k);
          this.m_gamma = this.m_gamma != 0 ? 1 / this.m_gamma : 0;
          this.m_bias = C * h * k * this.m_gamma;
          invMass += this.m_gamma;
          this.m_mass = invMass != 0 ? 1 / invMass : 0;
        } else {
          this.m_gamma = 0;
          this.m_bias = 0;
        }
        if (step.warmStarting) {
          this.m_impulse *= step.dtRatio;
          var P3 = Vec2.mulNumVec2(this.m_impulse, this.m_u);
          vA2.subMul(this.m_invMassA, P3);
          wA -= this.m_invIA * Vec2.crossVec2Vec2(this.m_rA, P3);
          vB2.addMul(this.m_invMassB, P3);
          wB += this.m_invIB * Vec2.crossVec2Vec2(this.m_rB, P3);
        } else {
          this.m_impulse = 0;
        }
        this.m_bodyA.c_velocity.v.setVec2(vA2);
        this.m_bodyA.c_velocity.w = wA;
        this.m_bodyB.c_velocity.v.setVec2(vB2);
        this.m_bodyB.c_velocity.w = wB;
      };
      DistanceJoint2.prototype.solveVelocityConstraints = function(step) {
        var vA2 = this.m_bodyA.c_velocity.v;
        var wA = this.m_bodyA.c_velocity.w;
        var vB2 = this.m_bodyB.c_velocity.v;
        var wB = this.m_bodyB.c_velocity.w;
        var vpA = Vec2.add(vA2, Vec2.crossNumVec2(wA, this.m_rA));
        var vpB = Vec2.add(vB2, Vec2.crossNumVec2(wB, this.m_rB));
        var Cdot = Vec2.dot(this.m_u, vpB) - Vec2.dot(this.m_u, vpA);
        var impulse = -this.m_mass * (Cdot + this.m_bias + this.m_gamma * this.m_impulse);
        this.m_impulse += impulse;
        var P3 = Vec2.mulNumVec2(impulse, this.m_u);
        vA2.subMul(this.m_invMassA, P3);
        wA -= this.m_invIA * Vec2.crossVec2Vec2(this.m_rA, P3);
        vB2.addMul(this.m_invMassB, P3);
        wB += this.m_invIB * Vec2.crossVec2Vec2(this.m_rB, P3);
        this.m_bodyA.c_velocity.v.setVec2(vA2);
        this.m_bodyA.c_velocity.w = wA;
        this.m_bodyB.c_velocity.v.setVec2(vB2);
        this.m_bodyB.c_velocity.w = wB;
      };
      DistanceJoint2.prototype.solvePositionConstraints = function(step) {
        if (this.m_frequencyHz > 0) {
          return true;
        }
        var cA2 = this.m_bodyA.c_position.c;
        var aA = this.m_bodyA.c_position.a;
        var cB2 = this.m_bodyB.c_position.c;
        var aB = this.m_bodyB.c_position.a;
        var qA = Rot.neo(aA);
        var qB = Rot.neo(aB);
        var rA2 = Rot.mulSub(qA, this.m_localAnchorA, this.m_localCenterA);
        var rB2 = Rot.mulSub(qB, this.m_localAnchorB, this.m_localCenterB);
        var u = Vec2.sub(Vec2.add(cB2, rB2), Vec2.add(cA2, rA2));
        var length = u.normalize();
        var C = clamp(length - this.m_length, -SettingsInternal.maxLinearCorrection, SettingsInternal.maxLinearCorrection);
        var impulse = -this.m_mass * C;
        var P3 = Vec2.mulNumVec2(impulse, u);
        cA2.subMul(this.m_invMassA, P3);
        aA -= this.m_invIA * Vec2.crossVec2Vec2(rA2, P3);
        cB2.addMul(this.m_invMassB, P3);
        aB += this.m_invIB * Vec2.crossVec2Vec2(rB2, P3);
        this.m_bodyA.c_position.c.setVec2(cA2);
        this.m_bodyA.c_position.a = aA;
        this.m_bodyB.c_position.c.setVec2(cB2);
        this.m_bodyB.c_position.a = aB;
        return math_abs$5(C) < SettingsInternal.linearSlop;
      };
      DistanceJoint2.TYPE = "distance-joint";
      return DistanceJoint2;
    })(Joint);
    var DEFAULTS$9 = { maxForce: 0, maxTorque: 0 };
    var FrictionJoint = (function(_super) {
      __extends(FrictionJoint2, _super);
      function FrictionJoint2(def, bodyA, bodyB, anchor) {
        var _this = this;
        if (!(_this instanceof FrictionJoint2)) {
          return new FrictionJoint2(def, bodyA, bodyB, anchor);
        }
        def = options(def, DEFAULTS$9);
        _this = _super.call(this, def, bodyA, bodyB) || this;
        bodyA = _this.m_bodyA;
        bodyB = _this.m_bodyB;
        _this.m_type = FrictionJoint2.TYPE;
        _this.m_localAnchorA = Vec2.clone(anchor ? bodyA.getLocalPoint(anchor) : def.localAnchorA || Vec2.zero());
        _this.m_localAnchorB = Vec2.clone(anchor ? bodyB.getLocalPoint(anchor) : def.localAnchorB || Vec2.zero());
        _this.m_linearImpulse = Vec2.zero();
        _this.m_angularImpulse = 0;
        _this.m_maxForce = def.maxForce;
        _this.m_maxTorque = def.maxTorque;
        return _this;
      }
      FrictionJoint2.prototype._serialize = function() {
        return { type: this.m_type, bodyA: this.m_bodyA, bodyB: this.m_bodyB, collideConnected: this.m_collideConnected, maxForce: this.m_maxForce, maxTorque: this.m_maxTorque, localAnchorA: this.m_localAnchorA, localAnchorB: this.m_localAnchorB };
      };
      FrictionJoint2._deserialize = function(data, world, restore) {
        data = __assign({}, data);
        data.bodyA = restore(Body, data.bodyA, world);
        data.bodyB = restore(Body, data.bodyB, world);
        var joint = new FrictionJoint2(data);
        return joint;
      };
      FrictionJoint2.prototype._reset = function(def) {
        if (def.anchorA) {
          this.m_localAnchorA.setVec2(this.m_bodyA.getLocalPoint(def.anchorA));
        } else if (def.localAnchorA) {
          this.m_localAnchorA.setVec2(def.localAnchorA);
        }
        if (def.anchorB) {
          this.m_localAnchorB.setVec2(this.m_bodyB.getLocalPoint(def.anchorB));
        } else if (def.localAnchorB) {
          this.m_localAnchorB.setVec2(def.localAnchorB);
        }
        if (Number.isFinite(def.maxForce)) {
          this.m_maxForce = def.maxForce;
        }
        if (Number.isFinite(def.maxTorque)) {
          this.m_maxTorque = def.maxTorque;
        }
      };
      FrictionJoint2.prototype.getLocalAnchorA = function() {
        return this.m_localAnchorA;
      };
      FrictionJoint2.prototype.getLocalAnchorB = function() {
        return this.m_localAnchorB;
      };
      FrictionJoint2.prototype.setMaxForce = function(force) {
        this.m_maxForce = force;
      };
      FrictionJoint2.prototype.getMaxForce = function() {
        return this.m_maxForce;
      };
      FrictionJoint2.prototype.setMaxTorque = function(torque) {
        this.m_maxTorque = torque;
      };
      FrictionJoint2.prototype.getMaxTorque = function() {
        return this.m_maxTorque;
      };
      FrictionJoint2.prototype.getAnchorA = function() {
        return this.m_bodyA.getWorldPoint(this.m_localAnchorA);
      };
      FrictionJoint2.prototype.getAnchorB = function() {
        return this.m_bodyB.getWorldPoint(this.m_localAnchorB);
      };
      FrictionJoint2.prototype.getReactionForce = function(inv_dt) {
        return Vec2.mulNumVec2(inv_dt, this.m_linearImpulse);
      };
      FrictionJoint2.prototype.getReactionTorque = function(inv_dt) {
        return inv_dt * this.m_angularImpulse;
      };
      FrictionJoint2.prototype.initVelocityConstraints = function(step) {
        this.m_localCenterA = this.m_bodyA.m_sweep.localCenter;
        this.m_localCenterB = this.m_bodyB.m_sweep.localCenter;
        this.m_invMassA = this.m_bodyA.m_invMass;
        this.m_invMassB = this.m_bodyB.m_invMass;
        this.m_invIA = this.m_bodyA.m_invI;
        this.m_invIB = this.m_bodyB.m_invI;
        var aA = this.m_bodyA.c_position.a;
        var vA2 = this.m_bodyA.c_velocity.v;
        var wA = this.m_bodyA.c_velocity.w;
        var aB = this.m_bodyB.c_position.a;
        var vB2 = this.m_bodyB.c_velocity.v;
        var wB = this.m_bodyB.c_velocity.w;
        var qA = Rot.neo(aA);
        var qB = Rot.neo(aB);
        this.m_rA = Rot.mulVec2(qA, Vec2.sub(this.m_localAnchorA, this.m_localCenterA));
        this.m_rB = Rot.mulVec2(qB, Vec2.sub(this.m_localAnchorB, this.m_localCenterB));
        var mA = this.m_invMassA;
        var mB = this.m_invMassB;
        var iA = this.m_invIA;
        var iB = this.m_invIB;
        var K = new Mat22();
        K.ex.x = mA + mB + iA * this.m_rA.y * this.m_rA.y + iB * this.m_rB.y * this.m_rB.y;
        K.ex.y = -iA * this.m_rA.x * this.m_rA.y - iB * this.m_rB.x * this.m_rB.y;
        K.ey.x = K.ex.y;
        K.ey.y = mA + mB + iA * this.m_rA.x * this.m_rA.x + iB * this.m_rB.x * this.m_rB.x;
        this.m_linearMass = K.getInverse();
        this.m_angularMass = iA + iB;
        if (this.m_angularMass > 0) {
          this.m_angularMass = 1 / this.m_angularMass;
        }
        if (step.warmStarting) {
          this.m_linearImpulse.mul(step.dtRatio);
          this.m_angularImpulse *= step.dtRatio;
          var P3 = Vec2.neo(this.m_linearImpulse.x, this.m_linearImpulse.y);
          vA2.subMul(mA, P3);
          wA -= iA * (Vec2.crossVec2Vec2(this.m_rA, P3) + this.m_angularImpulse);
          vB2.addMul(mB, P3);
          wB += iB * (Vec2.crossVec2Vec2(this.m_rB, P3) + this.m_angularImpulse);
        } else {
          this.m_linearImpulse.setZero();
          this.m_angularImpulse = 0;
        }
        this.m_bodyA.c_velocity.v = vA2;
        this.m_bodyA.c_velocity.w = wA;
        this.m_bodyB.c_velocity.v = vB2;
        this.m_bodyB.c_velocity.w = wB;
      };
      FrictionJoint2.prototype.solveVelocityConstraints = function(step) {
        var vA2 = this.m_bodyA.c_velocity.v;
        var wA = this.m_bodyA.c_velocity.w;
        var vB2 = this.m_bodyB.c_velocity.v;
        var wB = this.m_bodyB.c_velocity.w;
        var mA = this.m_invMassA;
        var mB = this.m_invMassB;
        var iA = this.m_invIA;
        var iB = this.m_invIB;
        var h = step.dt;
        {
          var Cdot = wB - wA;
          var impulse = -this.m_angularMass * Cdot;
          var oldImpulse = this.m_angularImpulse;
          var maxImpulse = h * this.m_maxTorque;
          this.m_angularImpulse = clamp(this.m_angularImpulse + impulse, -maxImpulse, maxImpulse);
          impulse = this.m_angularImpulse - oldImpulse;
          wA -= iA * impulse;
          wB += iB * impulse;
        }
        {
          var Cdot = Vec2.sub(Vec2.add(vB2, Vec2.crossNumVec2(wB, this.m_rB)), Vec2.add(vA2, Vec2.crossNumVec2(wA, this.m_rA)));
          var impulse = Vec2.neg(Mat22.mulVec2(this.m_linearMass, Cdot));
          var oldImpulse = this.m_linearImpulse;
          this.m_linearImpulse.add(impulse);
          var maxImpulse = h * this.m_maxForce;
          if (this.m_linearImpulse.lengthSquared() > maxImpulse * maxImpulse) {
            this.m_linearImpulse.normalize();
            this.m_linearImpulse.mul(maxImpulse);
          }
          impulse = Vec2.sub(this.m_linearImpulse, oldImpulse);
          vA2.subMul(mA, impulse);
          wA -= iA * Vec2.crossVec2Vec2(this.m_rA, impulse);
          vB2.addMul(mB, impulse);
          wB += iB * Vec2.crossVec2Vec2(this.m_rB, impulse);
        }
        this.m_bodyA.c_velocity.v = vA2;
        this.m_bodyA.c_velocity.w = wA;
        this.m_bodyB.c_velocity.v = vB2;
        this.m_bodyB.c_velocity.w = wB;
      };
      FrictionJoint2.prototype.solvePositionConstraints = function(step) {
        return true;
      };
      FrictionJoint2.TYPE = "friction-joint";
      return FrictionJoint2;
    })(Joint);
    var Mat33 = (function() {
      function Mat332(a2, b2, c2) {
        if (typeof a2 === "object" && a2 !== null) {
          this.ex = Vec3.clone(a2);
          this.ey = Vec3.clone(b2);
          this.ez = Vec3.clone(c2);
        } else {
          this.ex = Vec3.zero();
          this.ey = Vec3.zero();
          this.ez = Vec3.zero();
        }
      }
      Mat332.prototype.toString = function() {
        return JSON.stringify(this);
      };
      Mat332.isValid = function(obj) {
        if (obj === null || typeof obj === "undefined") {
          return false;
        }
        return Vec3.isValid(obj.ex) && Vec3.isValid(obj.ey) && Vec3.isValid(obj.ez);
      };
      Mat332.assert = function(o) {
      };
      Mat332.prototype.setZero = function() {
        this.ex.setZero();
        this.ey.setZero();
        this.ez.setZero();
        return this;
      };
      Mat332.prototype.solve33 = function(v3) {
        var cross_x = this.ey.y * this.ez.z - this.ey.z * this.ez.y;
        var cross_y = this.ey.z * this.ez.x - this.ey.x * this.ez.z;
        var cross_z = this.ey.x * this.ez.y - this.ey.y * this.ez.x;
        var det = this.ex.x * cross_x + this.ex.y * cross_y + this.ex.z * cross_z;
        if (det !== 0) {
          det = 1 / det;
        }
        var r = new Vec3();
        cross_x = this.ey.y * this.ez.z - this.ey.z * this.ez.y;
        cross_y = this.ey.z * this.ez.x - this.ey.x * this.ez.z;
        cross_z = this.ey.x * this.ez.y - this.ey.y * this.ez.x;
        r.x = det * (v3.x * cross_x + v3.y * cross_y + v3.z * cross_z);
        cross_x = v3.y * this.ez.z - v3.z * this.ez.y;
        cross_y = v3.z * this.ez.x - v3.x * this.ez.z;
        cross_z = v3.x * this.ez.y - v3.y * this.ez.x;
        r.y = det * (this.ex.x * cross_x + this.ex.y * cross_y + this.ex.z * cross_z);
        cross_x = this.ey.y * v3.z - this.ey.z * v3.y;
        cross_y = this.ey.z * v3.x - this.ey.x * v3.z;
        cross_z = this.ey.x * v3.y - this.ey.y * v3.x;
        r.z = det * (this.ex.x * cross_x + this.ex.y * cross_y + this.ex.z * cross_z);
        return r;
      };
      Mat332.prototype.solve22 = function(v3) {
        var a11 = this.ex.x;
        var a12 = this.ey.x;
        var a21 = this.ex.y;
        var a22 = this.ey.y;
        var det = a11 * a22 - a12 * a21;
        if (det !== 0) {
          det = 1 / det;
        }
        var r = Vec2.zero();
        r.x = det * (a22 * v3.x - a12 * v3.y);
        r.y = det * (a11 * v3.y - a21 * v3.x);
        return r;
      };
      Mat332.prototype.getInverse22 = function(M) {
        var a2 = this.ex.x;
        var b2 = this.ey.x;
        var c2 = this.ex.y;
        var d2 = this.ey.y;
        var det = a2 * d2 - b2 * c2;
        if (det !== 0) {
          det = 1 / det;
        }
        M.ex.x = det * d2;
        M.ey.x = -det * b2;
        M.ex.z = 0;
        M.ex.y = -det * c2;
        M.ey.y = det * a2;
        M.ey.z = 0;
        M.ez.x = 0;
        M.ez.y = 0;
        M.ez.z = 0;
      };
      Mat332.prototype.getSymInverse33 = function(M) {
        var det = Vec3.dot(this.ex, Vec3.cross(this.ey, this.ez));
        if (det !== 0) {
          det = 1 / det;
        }
        var a11 = this.ex.x;
        var a12 = this.ey.x;
        var a13 = this.ez.x;
        var a22 = this.ey.y;
        var a23 = this.ez.y;
        var a33 = this.ez.z;
        M.ex.x = det * (a22 * a33 - a23 * a23);
        M.ex.y = det * (a13 * a23 - a12 * a33);
        M.ex.z = det * (a12 * a23 - a13 * a22);
        M.ey.x = M.ex.y;
        M.ey.y = det * (a11 * a33 - a13 * a13);
        M.ey.z = det * (a13 * a12 - a11 * a23);
        M.ez.x = M.ex.z;
        M.ez.y = M.ey.z;
        M.ez.z = det * (a11 * a22 - a12 * a12);
      };
      Mat332.mul = function(a2, b2) {
        if (b2 && "z" in b2 && "y" in b2 && "x" in b2) {
          var x2 = a2.ex.x * b2.x + a2.ey.x * b2.y + a2.ez.x * b2.z;
          var y = a2.ex.y * b2.x + a2.ey.y * b2.y + a2.ez.y * b2.z;
          var z = a2.ex.z * b2.x + a2.ey.z * b2.y + a2.ez.z * b2.z;
          return new Vec3(x2, y, z);
        } else if (b2 && "y" in b2 && "x" in b2) {
          var x2 = a2.ex.x * b2.x + a2.ey.x * b2.y;
          var y = a2.ex.y * b2.x + a2.ey.y * b2.y;
          return Vec2.neo(x2, y);
        }
      };
      Mat332.mulVec3 = function(a2, b2) {
        var x2 = a2.ex.x * b2.x + a2.ey.x * b2.y + a2.ez.x * b2.z;
        var y = a2.ex.y * b2.x + a2.ey.y * b2.y + a2.ez.y * b2.z;
        var z = a2.ex.z * b2.x + a2.ey.z * b2.y + a2.ez.z * b2.z;
        return new Vec3(x2, y, z);
      };
      Mat332.mulVec2 = function(a2, b2) {
        var x2 = a2.ex.x * b2.x + a2.ey.x * b2.y;
        var y = a2.ex.y * b2.x + a2.ey.y * b2.y;
        return Vec2.neo(x2, y);
      };
      Mat332.add = function(a2, b2) {
        return new Mat332(Vec3.add(a2.ex, b2.ex), Vec3.add(a2.ey, b2.ey), Vec3.add(a2.ez, b2.ez));
      };
      return Mat332;
    })();
    var math_abs$4 = Math.abs;
    var LimitState$2;
    (function(LimitState2) {
      LimitState2[LimitState2["inactiveLimit"] = 0] = "inactiveLimit";
      LimitState2[LimitState2["atLowerLimit"] = 1] = "atLowerLimit";
      LimitState2[LimitState2["atUpperLimit"] = 2] = "atUpperLimit";
      LimitState2[LimitState2["equalLimits"] = 3] = "equalLimits";
    })(LimitState$2 || (LimitState$2 = {}));
    var DEFAULTS$8 = { lowerAngle: 0, upperAngle: 0, maxMotorTorque: 0, motorSpeed: 0, enableLimit: false, enableMotor: false };
    var RevoluteJoint = (function(_super) {
      __extends(RevoluteJoint2, _super);
      function RevoluteJoint2(def, bodyA, bodyB, anchor) {
        var _this = this;
        var _a2, _b, _c, _d, _e, _f;
        if (!(_this instanceof RevoluteJoint2)) {
          return new RevoluteJoint2(def, bodyA, bodyB, anchor);
        }
        def = def !== null && def !== void 0 ? def : {};
        _this = _super.call(this, def, bodyA, bodyB) || this;
        bodyA = _this.m_bodyA;
        bodyB = _this.m_bodyB;
        _this.m_mass = new Mat33();
        _this.m_limitState = LimitState$2.inactiveLimit;
        _this.m_type = RevoluteJoint2.TYPE;
        if (Vec2.isValid(anchor)) {
          _this.m_localAnchorA = bodyA.getLocalPoint(anchor);
        } else if (Vec2.isValid(def.localAnchorA)) {
          _this.m_localAnchorA = Vec2.clone(def.localAnchorA);
        } else {
          _this.m_localAnchorA = Vec2.zero();
        }
        if (Vec2.isValid(anchor)) {
          _this.m_localAnchorB = bodyB.getLocalPoint(anchor);
        } else if (Vec2.isValid(def.localAnchorB)) {
          _this.m_localAnchorB = Vec2.clone(def.localAnchorB);
        } else {
          _this.m_localAnchorB = Vec2.zero();
        }
        if (Number.isFinite(def.referenceAngle)) {
          _this.m_referenceAngle = def.referenceAngle;
        } else {
          _this.m_referenceAngle = bodyB.getAngle() - bodyA.getAngle();
        }
        _this.m_impulse = new Vec3();
        _this.m_motorImpulse = 0;
        _this.m_lowerAngle = (_a2 = def.lowerAngle) !== null && _a2 !== void 0 ? _a2 : DEFAULTS$8.lowerAngle;
        _this.m_upperAngle = (_b = def.upperAngle) !== null && _b !== void 0 ? _b : DEFAULTS$8.upperAngle;
        _this.m_maxMotorTorque = (_c = def.maxMotorTorque) !== null && _c !== void 0 ? _c : DEFAULTS$8.maxMotorTorque;
        _this.m_motorSpeed = (_d = def.motorSpeed) !== null && _d !== void 0 ? _d : DEFAULTS$8.motorSpeed;
        _this.m_enableLimit = (_e = def.enableLimit) !== null && _e !== void 0 ? _e : DEFAULTS$8.enableLimit;
        _this.m_enableMotor = (_f = def.enableMotor) !== null && _f !== void 0 ? _f : DEFAULTS$8.enableMotor;
        return _this;
      }
      RevoluteJoint2.prototype._serialize = function() {
        return { type: this.m_type, bodyA: this.m_bodyA, bodyB: this.m_bodyB, collideConnected: this.m_collideConnected, lowerAngle: this.m_lowerAngle, upperAngle: this.m_upperAngle, maxMotorTorque: this.m_maxMotorTorque, motorSpeed: this.m_motorSpeed, enableLimit: this.m_enableLimit, enableMotor: this.m_enableMotor, localAnchorA: this.m_localAnchorA, localAnchorB: this.m_localAnchorB, referenceAngle: this.m_referenceAngle };
      };
      RevoluteJoint2._deserialize = function(data, world, restore) {
        data = __assign({}, data);
        data.bodyA = restore(Body, data.bodyA, world);
        data.bodyB = restore(Body, data.bodyB, world);
        var joint = new RevoluteJoint2(data);
        return joint;
      };
      RevoluteJoint2.prototype._reset = function(def) {
        if (def.anchorA) {
          this.m_localAnchorA.setVec2(this.m_bodyA.getLocalPoint(def.anchorA));
        } else if (def.localAnchorA) {
          this.m_localAnchorA.setVec2(def.localAnchorA);
        }
        if (def.anchorB) {
          this.m_localAnchorB.setVec2(this.m_bodyB.getLocalPoint(def.anchorB));
        } else if (def.localAnchorB) {
          this.m_localAnchorB.setVec2(def.localAnchorB);
        }
        if (Number.isFinite(def.referenceAngle)) {
          this.m_referenceAngle = def.referenceAngle;
        }
        if (def.enableLimit !== void 0) {
          this.m_enableLimit = def.enableLimit;
        }
        if (Number.isFinite(def.lowerAngle)) {
          this.m_lowerAngle = def.lowerAngle;
        }
        if (Number.isFinite(def.upperAngle)) {
          this.m_upperAngle = def.upperAngle;
        }
        if (Number.isFinite(def.maxMotorTorque)) {
          this.m_maxMotorTorque = def.maxMotorTorque;
        }
        if (Number.isFinite(def.motorSpeed)) {
          this.m_motorSpeed = def.motorSpeed;
        }
        if (def.enableMotor !== void 0) {
          this.m_enableMotor = def.enableMotor;
        }
      };
      RevoluteJoint2.prototype.getLocalAnchorA = function() {
        return this.m_localAnchorA;
      };
      RevoluteJoint2.prototype.getLocalAnchorB = function() {
        return this.m_localAnchorB;
      };
      RevoluteJoint2.prototype.getReferenceAngle = function() {
        return this.m_referenceAngle;
      };
      RevoluteJoint2.prototype.getJointAngle = function() {
        var bA = this.m_bodyA;
        var bB = this.m_bodyB;
        return bB.m_sweep.a - bA.m_sweep.a - this.m_referenceAngle;
      };
      RevoluteJoint2.prototype.getJointSpeed = function() {
        var bA = this.m_bodyA;
        var bB = this.m_bodyB;
        return bB.m_angularVelocity - bA.m_angularVelocity;
      };
      RevoluteJoint2.prototype.isMotorEnabled = function() {
        return this.m_enableMotor;
      };
      RevoluteJoint2.prototype.enableMotor = function(flag) {
        if (flag == this.m_enableMotor) return;
        this.m_bodyA.setAwake(true);
        this.m_bodyB.setAwake(true);
        this.m_enableMotor = flag;
      };
      RevoluteJoint2.prototype.getMotorTorque = function(inv_dt) {
        return inv_dt * this.m_motorImpulse;
      };
      RevoluteJoint2.prototype.setMotorSpeed = function(speed) {
        if (speed == this.m_motorSpeed) return;
        this.m_bodyA.setAwake(true);
        this.m_bodyB.setAwake(true);
        this.m_motorSpeed = speed;
      };
      RevoluteJoint2.prototype.getMotorSpeed = function() {
        return this.m_motorSpeed;
      };
      RevoluteJoint2.prototype.setMaxMotorTorque = function(torque) {
        if (torque == this.m_maxMotorTorque) return;
        this.m_bodyA.setAwake(true);
        this.m_bodyB.setAwake(true);
        this.m_maxMotorTorque = torque;
      };
      RevoluteJoint2.prototype.getMaxMotorTorque = function() {
        return this.m_maxMotorTorque;
      };
      RevoluteJoint2.prototype.isLimitEnabled = function() {
        return this.m_enableLimit;
      };
      RevoluteJoint2.prototype.enableLimit = function(flag) {
        if (flag != this.m_enableLimit) {
          this.m_bodyA.setAwake(true);
          this.m_bodyB.setAwake(true);
          this.m_enableLimit = flag;
          this.m_impulse.z = 0;
        }
      };
      RevoluteJoint2.prototype.getLowerLimit = function() {
        return this.m_lowerAngle;
      };
      RevoluteJoint2.prototype.getUpperLimit = function() {
        return this.m_upperAngle;
      };
      RevoluteJoint2.prototype.setLimits = function(lower, upper) {
        if (lower != this.m_lowerAngle || upper != this.m_upperAngle) {
          this.m_bodyA.setAwake(true);
          this.m_bodyB.setAwake(true);
          this.m_impulse.z = 0;
          this.m_lowerAngle = lower;
          this.m_upperAngle = upper;
        }
      };
      RevoluteJoint2.prototype.getAnchorA = function() {
        return this.m_bodyA.getWorldPoint(this.m_localAnchorA);
      };
      RevoluteJoint2.prototype.getAnchorB = function() {
        return this.m_bodyB.getWorldPoint(this.m_localAnchorB);
      };
      RevoluteJoint2.prototype.getReactionForce = function(inv_dt) {
        return Vec2.neo(this.m_impulse.x, this.m_impulse.y).mul(inv_dt);
      };
      RevoluteJoint2.prototype.getReactionTorque = function(inv_dt) {
        return inv_dt * this.m_impulse.z;
      };
      RevoluteJoint2.prototype.initVelocityConstraints = function(step) {
        this.m_localCenterA = this.m_bodyA.m_sweep.localCenter;
        this.m_localCenterB = this.m_bodyB.m_sweep.localCenter;
        this.m_invMassA = this.m_bodyA.m_invMass;
        this.m_invMassB = this.m_bodyB.m_invMass;
        this.m_invIA = this.m_bodyA.m_invI;
        this.m_invIB = this.m_bodyB.m_invI;
        var aA = this.m_bodyA.c_position.a;
        var vA2 = this.m_bodyA.c_velocity.v;
        var wA = this.m_bodyA.c_velocity.w;
        var aB = this.m_bodyB.c_position.a;
        var vB2 = this.m_bodyB.c_velocity.v;
        var wB = this.m_bodyB.c_velocity.w;
        var qA = Rot.neo(aA);
        var qB = Rot.neo(aB);
        this.m_rA = Rot.mulVec2(qA, Vec2.sub(this.m_localAnchorA, this.m_localCenterA));
        this.m_rB = Rot.mulVec2(qB, Vec2.sub(this.m_localAnchorB, this.m_localCenterB));
        var mA = this.m_invMassA;
        var mB = this.m_invMassB;
        var iA = this.m_invIA;
        var iB = this.m_invIB;
        var fixedRotation = iA + iB === 0;
        this.m_mass.ex.x = mA + mB + this.m_rA.y * this.m_rA.y * iA + this.m_rB.y * this.m_rB.y * iB;
        this.m_mass.ey.x = -this.m_rA.y * this.m_rA.x * iA - this.m_rB.y * this.m_rB.x * iB;
        this.m_mass.ez.x = -this.m_rA.y * iA - this.m_rB.y * iB;
        this.m_mass.ex.y = this.m_mass.ey.x;
        this.m_mass.ey.y = mA + mB + this.m_rA.x * this.m_rA.x * iA + this.m_rB.x * this.m_rB.x * iB;
        this.m_mass.ez.y = this.m_rA.x * iA + this.m_rB.x * iB;
        this.m_mass.ex.z = this.m_mass.ez.x;
        this.m_mass.ey.z = this.m_mass.ez.y;
        this.m_mass.ez.z = iA + iB;
        this.m_motorMass = iA + iB;
        if (this.m_motorMass > 0) {
          this.m_motorMass = 1 / this.m_motorMass;
        }
        if (this.m_enableMotor == false || fixedRotation) {
          this.m_motorImpulse = 0;
        }
        if (this.m_enableLimit && fixedRotation == false) {
          var jointAngle = aB - aA - this.m_referenceAngle;
          if (math_abs$4(this.m_upperAngle - this.m_lowerAngle) < 2 * SettingsInternal.angularSlop) {
            this.m_limitState = LimitState$2.equalLimits;
          } else if (jointAngle <= this.m_lowerAngle) {
            if (this.m_limitState != LimitState$2.atLowerLimit) {
              this.m_impulse.z = 0;
            }
            this.m_limitState = LimitState$2.atLowerLimit;
          } else if (jointAngle >= this.m_upperAngle) {
            if (this.m_limitState != LimitState$2.atUpperLimit) {
              this.m_impulse.z = 0;
            }
            this.m_limitState = LimitState$2.atUpperLimit;
          } else {
            this.m_limitState = LimitState$2.inactiveLimit;
            this.m_impulse.z = 0;
          }
        } else {
          this.m_limitState = LimitState$2.inactiveLimit;
        }
        if (step.warmStarting) {
          this.m_impulse.mul(step.dtRatio);
          this.m_motorImpulse *= step.dtRatio;
          var P3 = Vec2.neo(this.m_impulse.x, this.m_impulse.y);
          vA2.subMul(mA, P3);
          wA -= iA * (Vec2.crossVec2Vec2(this.m_rA, P3) + this.m_motorImpulse + this.m_impulse.z);
          vB2.addMul(mB, P3);
          wB += iB * (Vec2.crossVec2Vec2(this.m_rB, P3) + this.m_motorImpulse + this.m_impulse.z);
        } else {
          this.m_impulse.setZero();
          this.m_motorImpulse = 0;
        }
        this.m_bodyA.c_velocity.v = vA2;
        this.m_bodyA.c_velocity.w = wA;
        this.m_bodyB.c_velocity.v = vB2;
        this.m_bodyB.c_velocity.w = wB;
      };
      RevoluteJoint2.prototype.solveVelocityConstraints = function(step) {
        var vA2 = this.m_bodyA.c_velocity.v;
        var wA = this.m_bodyA.c_velocity.w;
        var vB2 = this.m_bodyB.c_velocity.v;
        var wB = this.m_bodyB.c_velocity.w;
        var mA = this.m_invMassA;
        var mB = this.m_invMassB;
        var iA = this.m_invIA;
        var iB = this.m_invIB;
        var fixedRotation = iA + iB === 0;
        if (this.m_enableMotor && this.m_limitState != LimitState$2.equalLimits && fixedRotation == false) {
          var Cdot = wB - wA - this.m_motorSpeed;
          var impulse = -this.m_motorMass * Cdot;
          var oldImpulse = this.m_motorImpulse;
          var maxImpulse = step.dt * this.m_maxMotorTorque;
          this.m_motorImpulse = clamp(this.m_motorImpulse + impulse, -maxImpulse, maxImpulse);
          impulse = this.m_motorImpulse - oldImpulse;
          wA -= iA * impulse;
          wB += iB * impulse;
        }
        if (this.m_enableLimit && this.m_limitState != LimitState$2.inactiveLimit && fixedRotation == false) {
          var Cdot1 = Vec2.zero();
          Cdot1.addCombine(1, vB2, 1, Vec2.crossNumVec2(wB, this.m_rB));
          Cdot1.subCombine(1, vA2, 1, Vec2.crossNumVec2(wA, this.m_rA));
          var Cdot2 = wB - wA;
          var Cdot = new Vec3(Cdot1.x, Cdot1.y, Cdot2);
          var impulse = Vec3.neg(this.m_mass.solve33(Cdot));
          if (this.m_limitState == LimitState$2.equalLimits) {
            this.m_impulse.add(impulse);
          } else if (this.m_limitState == LimitState$2.atLowerLimit) {
            var newImpulse = this.m_impulse.z + impulse.z;
            if (newImpulse < 0) {
              var rhs = Vec2.combine(-1, Cdot1, this.m_impulse.z, Vec2.neo(this.m_mass.ez.x, this.m_mass.ez.y));
              var reduced = this.m_mass.solve22(rhs);
              impulse.x = reduced.x;
              impulse.y = reduced.y;
              impulse.z = -this.m_impulse.z;
              this.m_impulse.x += reduced.x;
              this.m_impulse.y += reduced.y;
              this.m_impulse.z = 0;
            } else {
              this.m_impulse.add(impulse);
            }
          } else if (this.m_limitState == LimitState$2.atUpperLimit) {
            var newImpulse = this.m_impulse.z + impulse.z;
            if (newImpulse > 0) {
              var rhs = Vec2.combine(-1, Cdot1, this.m_impulse.z, Vec2.neo(this.m_mass.ez.x, this.m_mass.ez.y));
              var reduced = this.m_mass.solve22(rhs);
              impulse.x = reduced.x;
              impulse.y = reduced.y;
              impulse.z = -this.m_impulse.z;
              this.m_impulse.x += reduced.x;
              this.m_impulse.y += reduced.y;
              this.m_impulse.z = 0;
            } else {
              this.m_impulse.add(impulse);
            }
          }
          var P3 = Vec2.neo(impulse.x, impulse.y);
          vA2.subMul(mA, P3);
          wA -= iA * (Vec2.crossVec2Vec2(this.m_rA, P3) + impulse.z);
          vB2.addMul(mB, P3);
          wB += iB * (Vec2.crossVec2Vec2(this.m_rB, P3) + impulse.z);
        } else {
          var Cdot = Vec2.zero();
          Cdot.addCombine(1, vB2, 1, Vec2.crossNumVec2(wB, this.m_rB));
          Cdot.subCombine(1, vA2, 1, Vec2.crossNumVec2(wA, this.m_rA));
          var impulse = this.m_mass.solve22(Vec2.neg(Cdot));
          this.m_impulse.x += impulse.x;
          this.m_impulse.y += impulse.y;
          vA2.subMul(mA, impulse);
          wA -= iA * Vec2.crossVec2Vec2(this.m_rA, impulse);
          vB2.addMul(mB, impulse);
          wB += iB * Vec2.crossVec2Vec2(this.m_rB, impulse);
        }
        this.m_bodyA.c_velocity.v = vA2;
        this.m_bodyA.c_velocity.w = wA;
        this.m_bodyB.c_velocity.v = vB2;
        this.m_bodyB.c_velocity.w = wB;
      };
      RevoluteJoint2.prototype.solvePositionConstraints = function(step) {
        var cA2 = this.m_bodyA.c_position.c;
        var aA = this.m_bodyA.c_position.a;
        var cB2 = this.m_bodyB.c_position.c;
        var aB = this.m_bodyB.c_position.a;
        var qA = Rot.neo(aA);
        var qB = Rot.neo(aB);
        var angularError = 0;
        var positionError = 0;
        var fixedRotation = this.m_invIA + this.m_invIB == 0;
        if (this.m_enableLimit && this.m_limitState != LimitState$2.inactiveLimit && fixedRotation == false) {
          var angle = aB - aA - this.m_referenceAngle;
          var limitImpulse = 0;
          if (this.m_limitState == LimitState$2.equalLimits) {
            var C = clamp(angle - this.m_lowerAngle, -SettingsInternal.maxAngularCorrection, SettingsInternal.maxAngularCorrection);
            limitImpulse = -this.m_motorMass * C;
            angularError = math_abs$4(C);
          } else if (this.m_limitState == LimitState$2.atLowerLimit) {
            var C = angle - this.m_lowerAngle;
            angularError = -C;
            C = clamp(C + SettingsInternal.angularSlop, -SettingsInternal.maxAngularCorrection, 0);
            limitImpulse = -this.m_motorMass * C;
          } else if (this.m_limitState == LimitState$2.atUpperLimit) {
            var C = angle - this.m_upperAngle;
            angularError = C;
            C = clamp(C - SettingsInternal.angularSlop, 0, SettingsInternal.maxAngularCorrection);
            limitImpulse = -this.m_motorMass * C;
          }
          aA -= this.m_invIA * limitImpulse;
          aB += this.m_invIB * limitImpulse;
        }
        {
          qA.setAngle(aA);
          qB.setAngle(aB);
          var rA2 = Rot.mulVec2(qA, Vec2.sub(this.m_localAnchorA, this.m_localCenterA));
          var rB2 = Rot.mulVec2(qB, Vec2.sub(this.m_localAnchorB, this.m_localCenterB));
          var C = Vec2.zero();
          C.addCombine(1, cB2, 1, rB2);
          C.subCombine(1, cA2, 1, rA2);
          positionError = C.length();
          var mA = this.m_invMassA;
          var mB = this.m_invMassB;
          var iA = this.m_invIA;
          var iB = this.m_invIB;
          var K = new Mat22();
          K.ex.x = mA + mB + iA * rA2.y * rA2.y + iB * rB2.y * rB2.y;
          K.ex.y = -iA * rA2.x * rA2.y - iB * rB2.x * rB2.y;
          K.ey.x = K.ex.y;
          K.ey.y = mA + mB + iA * rA2.x * rA2.x + iB * rB2.x * rB2.x;
          var impulse = Vec2.neg(K.solve(C));
          cA2.subMul(mA, impulse);
          aA -= iA * Vec2.crossVec2Vec2(rA2, impulse);
          cB2.addMul(mB, impulse);
          aB += iB * Vec2.crossVec2Vec2(rB2, impulse);
        }
        this.m_bodyA.c_position.c.setVec2(cA2);
        this.m_bodyA.c_position.a = aA;
        this.m_bodyB.c_position.c.setVec2(cB2);
        this.m_bodyB.c_position.a = aB;
        return positionError <= SettingsInternal.linearSlop && angularError <= SettingsInternal.angularSlop;
      };
      RevoluteJoint2.TYPE = "revolute-joint";
      return RevoluteJoint2;
    })(Joint);
    var math_abs$3 = Math.abs;
    var math_max = Math.max;
    var math_min$2 = Math.min;
    var LimitState$1;
    (function(LimitState2) {
      LimitState2[LimitState2["inactiveLimit"] = 0] = "inactiveLimit";
      LimitState2[LimitState2["atLowerLimit"] = 1] = "atLowerLimit";
      LimitState2[LimitState2["atUpperLimit"] = 2] = "atUpperLimit";
      LimitState2[LimitState2["equalLimits"] = 3] = "equalLimits";
    })(LimitState$1 || (LimitState$1 = {}));
    var DEFAULTS$7 = { enableLimit: false, lowerTranslation: 0, upperTranslation: 0, enableMotor: false, maxMotorForce: 0, motorSpeed: 0 };
    var PrismaticJoint = (function(_super) {
      __extends(PrismaticJoint2, _super);
      function PrismaticJoint2(def, bodyA, bodyB, anchor, axis) {
        var _this = this;
        if (!(_this instanceof PrismaticJoint2)) {
          return new PrismaticJoint2(def, bodyA, bodyB, anchor, axis);
        }
        def = options(def, DEFAULTS$7);
        _this = _super.call(this, def, bodyA, bodyB) || this;
        bodyA = _this.m_bodyA;
        bodyB = _this.m_bodyB;
        _this.m_type = PrismaticJoint2.TYPE;
        _this.m_localAnchorA = Vec2.clone(anchor ? bodyA.getLocalPoint(anchor) : def.localAnchorA || Vec2.zero());
        _this.m_localAnchorB = Vec2.clone(anchor ? bodyB.getLocalPoint(anchor) : def.localAnchorB || Vec2.zero());
        _this.m_localXAxisA = Vec2.clone(axis ? bodyA.getLocalVector(axis) : def.localAxisA || Vec2.neo(1, 0));
        _this.m_localXAxisA.normalize();
        _this.m_localYAxisA = Vec2.crossNumVec2(1, _this.m_localXAxisA);
        _this.m_referenceAngle = Number.isFinite(def.referenceAngle) ? def.referenceAngle : bodyB.getAngle() - bodyA.getAngle();
        _this.m_impulse = new Vec3();
        _this.m_motorMass = 0;
        _this.m_motorImpulse = 0;
        _this.m_lowerTranslation = def.lowerTranslation;
        _this.m_upperTranslation = def.upperTranslation;
        _this.m_maxMotorForce = def.maxMotorForce;
        _this.m_motorSpeed = def.motorSpeed;
        _this.m_enableLimit = def.enableLimit;
        _this.m_enableMotor = def.enableMotor;
        _this.m_limitState = LimitState$1.inactiveLimit;
        _this.m_axis = Vec2.zero();
        _this.m_perp = Vec2.zero();
        _this.m_K = new Mat33();
        return _this;
      }
      PrismaticJoint2.prototype._serialize = function() {
        return { type: this.m_type, bodyA: this.m_bodyA, bodyB: this.m_bodyB, collideConnected: this.m_collideConnected, lowerTranslation: this.m_lowerTranslation, upperTranslation: this.m_upperTranslation, maxMotorForce: this.m_maxMotorForce, motorSpeed: this.m_motorSpeed, enableLimit: this.m_enableLimit, enableMotor: this.m_enableMotor, localAnchorA: this.m_localAnchorA, localAnchorB: this.m_localAnchorB, localAxisA: this.m_localXAxisA, referenceAngle: this.m_referenceAngle };
      };
      PrismaticJoint2._deserialize = function(data, world, restore) {
        data = __assign({}, data);
        data.bodyA = restore(Body, data.bodyA, world);
        data.bodyB = restore(Body, data.bodyB, world);
        data.localAxisA = Vec2.clone(data.localAxisA);
        var joint = new PrismaticJoint2(data);
        return joint;
      };
      PrismaticJoint2.prototype._reset = function(def) {
        if (def.anchorA) {
          this.m_localAnchorA.setVec2(this.m_bodyA.getLocalPoint(def.anchorA));
        } else if (def.localAnchorA) {
          this.m_localAnchorA.setVec2(def.localAnchorA);
        }
        if (def.anchorB) {
          this.m_localAnchorB.setVec2(this.m_bodyB.getLocalPoint(def.anchorB));
        } else if (def.localAnchorB) {
          this.m_localAnchorB.setVec2(def.localAnchorB);
        }
        if (def.localAxisA) {
          this.m_localXAxisA.setVec2(def.localAxisA);
          this.m_localYAxisA.setVec2(Vec2.crossNumVec2(1, def.localAxisA));
        }
        if (Number.isFinite(def.referenceAngle)) {
          this.m_referenceAngle = def.referenceAngle;
        }
        if (typeof def.enableLimit !== "undefined") {
          this.m_enableLimit = !!def.enableLimit;
        }
        if (Number.isFinite(def.lowerTranslation)) {
          this.m_lowerTranslation = def.lowerTranslation;
        }
        if (Number.isFinite(def.upperTranslation)) {
          this.m_upperTranslation = def.upperTranslation;
        }
        if (typeof def.enableMotor !== "undefined") {
          this.m_enableMotor = !!def.enableMotor;
        }
        if (Number.isFinite(def.maxMotorForce)) {
          this.m_maxMotorForce = def.maxMotorForce;
        }
        if (Number.isFinite(def.motorSpeed)) {
          this.m_motorSpeed = def.motorSpeed;
        }
      };
      PrismaticJoint2.prototype.getLocalAnchorA = function() {
        return this.m_localAnchorA;
      };
      PrismaticJoint2.prototype.getLocalAnchorB = function() {
        return this.m_localAnchorB;
      };
      PrismaticJoint2.prototype.getLocalAxisA = function() {
        return this.m_localXAxisA;
      };
      PrismaticJoint2.prototype.getReferenceAngle = function() {
        return this.m_referenceAngle;
      };
      PrismaticJoint2.prototype.getJointTranslation = function() {
        var pA2 = this.m_bodyA.getWorldPoint(this.m_localAnchorA);
        var pB2 = this.m_bodyB.getWorldPoint(this.m_localAnchorB);
        var d2 = Vec2.sub(pB2, pA2);
        var axis = this.m_bodyA.getWorldVector(this.m_localXAxisA);
        var translation2 = Vec2.dot(d2, axis);
        return translation2;
      };
      PrismaticJoint2.prototype.getJointSpeed = function() {
        var bA = this.m_bodyA;
        var bB = this.m_bodyB;
        var rA2 = Rot.mulVec2(bA.m_xf.q, Vec2.sub(this.m_localAnchorA, bA.m_sweep.localCenter));
        var rB2 = Rot.mulVec2(bB.m_xf.q, Vec2.sub(this.m_localAnchorB, bB.m_sweep.localCenter));
        var p1 = Vec2.add(bA.m_sweep.c, rA2);
        var p2 = Vec2.add(bB.m_sweep.c, rB2);
        var d2 = Vec2.sub(p2, p1);
        var axis = Rot.mulVec2(bA.m_xf.q, this.m_localXAxisA);
        var vA2 = bA.m_linearVelocity;
        var vB2 = bB.m_linearVelocity;
        var wA = bA.m_angularVelocity;
        var wB = bB.m_angularVelocity;
        var speed = Vec2.dot(d2, Vec2.crossNumVec2(wA, axis)) + Vec2.dot(axis, Vec2.sub(Vec2.addCrossNumVec2(vB2, wB, rB2), Vec2.addCrossNumVec2(vA2, wA, rA2)));
        return speed;
      };
      PrismaticJoint2.prototype.isLimitEnabled = function() {
        return this.m_enableLimit;
      };
      PrismaticJoint2.prototype.enableLimit = function(flag) {
        if (flag != this.m_enableLimit) {
          this.m_bodyA.setAwake(true);
          this.m_bodyB.setAwake(true);
          this.m_enableLimit = flag;
          this.m_impulse.z = 0;
        }
      };
      PrismaticJoint2.prototype.getLowerLimit = function() {
        return this.m_lowerTranslation;
      };
      PrismaticJoint2.prototype.getUpperLimit = function() {
        return this.m_upperTranslation;
      };
      PrismaticJoint2.prototype.setLimits = function(lower, upper) {
        if (lower != this.m_lowerTranslation || upper != this.m_upperTranslation) {
          this.m_bodyA.setAwake(true);
          this.m_bodyB.setAwake(true);
          this.m_lowerTranslation = lower;
          this.m_upperTranslation = upper;
          this.m_impulse.z = 0;
        }
      };
      PrismaticJoint2.prototype.isMotorEnabled = function() {
        return this.m_enableMotor;
      };
      PrismaticJoint2.prototype.enableMotor = function(flag) {
        if (flag == this.m_enableMotor) return;
        this.m_bodyA.setAwake(true);
        this.m_bodyB.setAwake(true);
        this.m_enableMotor = flag;
      };
      PrismaticJoint2.prototype.setMotorSpeed = function(speed) {
        if (speed == this.m_motorSpeed) return;
        this.m_bodyA.setAwake(true);
        this.m_bodyB.setAwake(true);
        this.m_motorSpeed = speed;
      };
      PrismaticJoint2.prototype.setMaxMotorForce = function(force) {
        if (force == this.m_maxMotorForce) return;
        this.m_bodyA.setAwake(true);
        this.m_bodyB.setAwake(true);
        this.m_maxMotorForce = force;
      };
      PrismaticJoint2.prototype.getMaxMotorForce = function() {
        return this.m_maxMotorForce;
      };
      PrismaticJoint2.prototype.getMotorSpeed = function() {
        return this.m_motorSpeed;
      };
      PrismaticJoint2.prototype.getMotorForce = function(inv_dt) {
        return inv_dt * this.m_motorImpulse;
      };
      PrismaticJoint2.prototype.getAnchorA = function() {
        return this.m_bodyA.getWorldPoint(this.m_localAnchorA);
      };
      PrismaticJoint2.prototype.getAnchorB = function() {
        return this.m_bodyB.getWorldPoint(this.m_localAnchorB);
      };
      PrismaticJoint2.prototype.getReactionForce = function(inv_dt) {
        return Vec2.combine(this.m_impulse.x, this.m_perp, this.m_motorImpulse + this.m_impulse.z, this.m_axis).mul(inv_dt);
      };
      PrismaticJoint2.prototype.getReactionTorque = function(inv_dt) {
        return inv_dt * this.m_impulse.y;
      };
      PrismaticJoint2.prototype.initVelocityConstraints = function(step) {
        this.m_localCenterA = this.m_bodyA.m_sweep.localCenter;
        this.m_localCenterB = this.m_bodyB.m_sweep.localCenter;
        this.m_invMassA = this.m_bodyA.m_invMass;
        this.m_invMassB = this.m_bodyB.m_invMass;
        this.m_invIA = this.m_bodyA.m_invI;
        this.m_invIB = this.m_bodyB.m_invI;
        var cA2 = this.m_bodyA.c_position.c;
        var aA = this.m_bodyA.c_position.a;
        var vA2 = this.m_bodyA.c_velocity.v;
        var wA = this.m_bodyA.c_velocity.w;
        var cB2 = this.m_bodyB.c_position.c;
        var aB = this.m_bodyB.c_position.a;
        var vB2 = this.m_bodyB.c_velocity.v;
        var wB = this.m_bodyB.c_velocity.w;
        var qA = Rot.neo(aA);
        var qB = Rot.neo(aB);
        var rA2 = Rot.mulVec2(qA, Vec2.sub(this.m_localAnchorA, this.m_localCenterA));
        var rB2 = Rot.mulVec2(qB, Vec2.sub(this.m_localAnchorB, this.m_localCenterB));
        var d2 = Vec2.zero();
        d2.addCombine(1, cB2, 1, rB2);
        d2.subCombine(1, cA2, 1, rA2);
        var mA = this.m_invMassA;
        var mB = this.m_invMassB;
        var iA = this.m_invIA;
        var iB = this.m_invIB;
        {
          this.m_axis = Rot.mulVec2(qA, this.m_localXAxisA);
          this.m_a1 = Vec2.crossVec2Vec2(Vec2.add(d2, rA2), this.m_axis);
          this.m_a2 = Vec2.crossVec2Vec2(rB2, this.m_axis);
          this.m_motorMass = mA + mB + iA * this.m_a1 * this.m_a1 + iB * this.m_a2 * this.m_a2;
          if (this.m_motorMass > 0) {
            this.m_motorMass = 1 / this.m_motorMass;
          }
        }
        {
          this.m_perp = Rot.mulVec2(qA, this.m_localYAxisA);
          this.m_s1 = Vec2.crossVec2Vec2(Vec2.add(d2, rA2), this.m_perp);
          this.m_s2 = Vec2.crossVec2Vec2(rB2, this.m_perp);
          Vec2.crossVec2Vec2(rA2, this.m_perp);
          var k11 = mA + mB + iA * this.m_s1 * this.m_s1 + iB * this.m_s2 * this.m_s2;
          var k12 = iA * this.m_s1 + iB * this.m_s2;
          var k13 = iA * this.m_s1 * this.m_a1 + iB * this.m_s2 * this.m_a2;
          var k22 = iA + iB;
          if (k22 == 0) {
            k22 = 1;
          }
          var k23 = iA * this.m_a1 + iB * this.m_a2;
          var k33 = mA + mB + iA * this.m_a1 * this.m_a1 + iB * this.m_a2 * this.m_a2;
          this.m_K.ex.set(k11, k12, k13);
          this.m_K.ey.set(k12, k22, k23);
          this.m_K.ez.set(k13, k23, k33);
        }
        if (this.m_enableLimit) {
          var jointTranslation = Vec2.dot(this.m_axis, d2);
          if (math_abs$3(this.m_upperTranslation - this.m_lowerTranslation) < 2 * SettingsInternal.linearSlop) {
            this.m_limitState = LimitState$1.equalLimits;
          } else if (jointTranslation <= this.m_lowerTranslation) {
            if (this.m_limitState != LimitState$1.atLowerLimit) {
              this.m_limitState = LimitState$1.atLowerLimit;
              this.m_impulse.z = 0;
            }
          } else if (jointTranslation >= this.m_upperTranslation) {
            if (this.m_limitState != LimitState$1.atUpperLimit) {
              this.m_limitState = LimitState$1.atUpperLimit;
              this.m_impulse.z = 0;
            }
          } else {
            this.m_limitState = LimitState$1.inactiveLimit;
            this.m_impulse.z = 0;
          }
        } else {
          this.m_limitState = LimitState$1.inactiveLimit;
          this.m_impulse.z = 0;
        }
        if (this.m_enableMotor == false) {
          this.m_motorImpulse = 0;
        }
        if (step.warmStarting) {
          this.m_impulse.mul(step.dtRatio);
          this.m_motorImpulse *= step.dtRatio;
          var P3 = Vec2.combine(this.m_impulse.x, this.m_perp, this.m_motorImpulse + this.m_impulse.z, this.m_axis);
          var LA = this.m_impulse.x * this.m_s1 + this.m_impulse.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_a1;
          var LB = this.m_impulse.x * this.m_s2 + this.m_impulse.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_a2;
          vA2.subMul(mA, P3);
          wA -= iA * LA;
          vB2.addMul(mB, P3);
          wB += iB * LB;
        } else {
          this.m_impulse.setZero();
          this.m_motorImpulse = 0;
        }
        this.m_bodyA.c_velocity.v.setVec2(vA2);
        this.m_bodyA.c_velocity.w = wA;
        this.m_bodyB.c_velocity.v.setVec2(vB2);
        this.m_bodyB.c_velocity.w = wB;
      };
      PrismaticJoint2.prototype.solveVelocityConstraints = function(step) {
        var vA2 = this.m_bodyA.c_velocity.v;
        var wA = this.m_bodyA.c_velocity.w;
        var vB2 = this.m_bodyB.c_velocity.v;
        var wB = this.m_bodyB.c_velocity.w;
        var mA = this.m_invMassA;
        var mB = this.m_invMassB;
        var iA = this.m_invIA;
        var iB = this.m_invIB;
        if (this.m_enableMotor && this.m_limitState != LimitState$1.equalLimits) {
          var Cdot = Vec2.dot(this.m_axis, Vec2.sub(vB2, vA2)) + this.m_a2 * wB - this.m_a1 * wA;
          var impulse = this.m_motorMass * (this.m_motorSpeed - Cdot);
          var oldImpulse = this.m_motorImpulse;
          var maxImpulse = step.dt * this.m_maxMotorForce;
          this.m_motorImpulse = clamp(this.m_motorImpulse + impulse, -maxImpulse, maxImpulse);
          impulse = this.m_motorImpulse - oldImpulse;
          var P3 = Vec2.mulNumVec2(impulse, this.m_axis);
          var LA = impulse * this.m_a1;
          var LB = impulse * this.m_a2;
          vA2.subMul(mA, P3);
          wA -= iA * LA;
          vB2.addMul(mB, P3);
          wB += iB * LB;
        }
        var Cdot1 = Vec2.zero();
        Cdot1.x += Vec2.dot(this.m_perp, vB2) + this.m_s2 * wB;
        Cdot1.x -= Vec2.dot(this.m_perp, vA2) + this.m_s1 * wA;
        Cdot1.y = wB - wA;
        if (this.m_enableLimit && this.m_limitState != LimitState$1.inactiveLimit) {
          var Cdot2 = 0;
          Cdot2 += Vec2.dot(this.m_axis, vB2) + this.m_a2 * wB;
          Cdot2 -= Vec2.dot(this.m_axis, vA2) + this.m_a1 * wA;
          var Cdot = new Vec3(Cdot1.x, Cdot1.y, Cdot2);
          var f1 = Vec3.clone(this.m_impulse);
          var df = this.m_K.solve33(Vec3.neg(Cdot));
          this.m_impulse.add(df);
          if (this.m_limitState == LimitState$1.atLowerLimit) {
            this.m_impulse.z = math_max(this.m_impulse.z, 0);
          } else if (this.m_limitState == LimitState$1.atUpperLimit) {
            this.m_impulse.z = math_min$2(this.m_impulse.z, 0);
          }
          var b2 = Vec2.combine(-1, Cdot1, -(this.m_impulse.z - f1.z), Vec2.neo(this.m_K.ez.x, this.m_K.ez.y));
          var f2r = Vec2.add(this.m_K.solve22(b2), Vec2.neo(f1.x, f1.y));
          this.m_impulse.x = f2r.x;
          this.m_impulse.y = f2r.y;
          df = Vec3.sub(this.m_impulse, f1);
          var P3 = Vec2.combine(df.x, this.m_perp, df.z, this.m_axis);
          var LA = df.x * this.m_s1 + df.y + df.z * this.m_a1;
          var LB = df.x * this.m_s2 + df.y + df.z * this.m_a2;
          vA2.subMul(mA, P3);
          wA -= iA * LA;
          vB2.addMul(mB, P3);
          wB += iB * LB;
        } else {
          var df = this.m_K.solve22(Vec2.neg(Cdot1));
          this.m_impulse.x += df.x;
          this.m_impulse.y += df.y;
          var P3 = Vec2.mulNumVec2(df.x, this.m_perp);
          var LA = df.x * this.m_s1 + df.y;
          var LB = df.x * this.m_s2 + df.y;
          vA2.subMul(mA, P3);
          wA -= iA * LA;
          vB2.addMul(mB, P3);
          wB += iB * LB;
        }
        this.m_bodyA.c_velocity.v = vA2;
        this.m_bodyA.c_velocity.w = wA;
        this.m_bodyB.c_velocity.v = vB2;
        this.m_bodyB.c_velocity.w = wB;
      };
      PrismaticJoint2.prototype.solvePositionConstraints = function(step) {
        var cA2 = this.m_bodyA.c_position.c;
        var aA = this.m_bodyA.c_position.a;
        var cB2 = this.m_bodyB.c_position.c;
        var aB = this.m_bodyB.c_position.a;
        var qA = Rot.neo(aA);
        var qB = Rot.neo(aB);
        var mA = this.m_invMassA;
        var mB = this.m_invMassB;
        var iA = this.m_invIA;
        var iB = this.m_invIB;
        var rA2 = Rot.mulVec2(qA, Vec2.sub(this.m_localAnchorA, this.m_localCenterA));
        var rB2 = Rot.mulVec2(qB, Vec2.sub(this.m_localAnchorB, this.m_localCenterB));
        var d2 = Vec2.sub(Vec2.add(cB2, rB2), Vec2.add(cA2, rA2));
        var axis = Rot.mulVec2(qA, this.m_localXAxisA);
        var a1 = Vec2.crossVec2Vec2(Vec2.add(d2, rA2), axis);
        var a2 = Vec2.crossVec2Vec2(rB2, axis);
        var perp2 = Rot.mulVec2(qA, this.m_localYAxisA);
        var s1 = Vec2.crossVec2Vec2(Vec2.add(d2, rA2), perp2);
        var s2 = Vec2.crossVec2Vec2(rB2, perp2);
        var impulse = new Vec3();
        var C1 = Vec2.zero();
        C1.x = Vec2.dot(perp2, d2);
        C1.y = aB - aA - this.m_referenceAngle;
        var linearError = math_abs$3(C1.x);
        var angularError = math_abs$3(C1.y);
        var linearSlop = SettingsInternal.linearSlop;
        var maxLinearCorrection = SettingsInternal.maxLinearCorrection;
        var active = false;
        var C2 = 0;
        if (this.m_enableLimit) {
          var translation2 = Vec2.dot(axis, d2);
          if (math_abs$3(this.m_upperTranslation - this.m_lowerTranslation) < 2 * linearSlop) {
            C2 = clamp(translation2, -maxLinearCorrection, maxLinearCorrection);
            linearError = math_max(linearError, math_abs$3(translation2));
            active = true;
          } else if (translation2 <= this.m_lowerTranslation) {
            C2 = clamp(translation2 - this.m_lowerTranslation + linearSlop, -maxLinearCorrection, 0);
            linearError = Math.max(linearError, this.m_lowerTranslation - translation2);
            active = true;
          } else if (translation2 >= this.m_upperTranslation) {
            C2 = clamp(translation2 - this.m_upperTranslation - linearSlop, 0, maxLinearCorrection);
            linearError = Math.max(linearError, translation2 - this.m_upperTranslation);
            active = true;
          }
        }
        if (active) {
          var k11 = mA + mB + iA * s1 * s1 + iB * s2 * s2;
          var k12 = iA * s1 + iB * s2;
          var k13 = iA * s1 * a1 + iB * s2 * a2;
          var k22 = iA + iB;
          if (k22 == 0) {
            k22 = 1;
          }
          var k23 = iA * a1 + iB * a2;
          var k33 = mA + mB + iA * a1 * a1 + iB * a2 * a2;
          var K = new Mat33();
          K.ex.set(k11, k12, k13);
          K.ey.set(k12, k22, k23);
          K.ez.set(k13, k23, k33);
          var C = new Vec3();
          C.x = C1.x;
          C.y = C1.y;
          C.z = C2;
          impulse = K.solve33(Vec3.neg(C));
        } else {
          var k11 = mA + mB + iA * s1 * s1 + iB * s2 * s2;
          var k12 = iA * s1 + iB * s2;
          var k22 = iA + iB;
          if (k22 == 0) {
            k22 = 1;
          }
          var K = new Mat22();
          K.ex.setNum(k11, k12);
          K.ey.setNum(k12, k22);
          var impulse1 = K.solve(Vec2.neg(C1));
          impulse.x = impulse1.x;
          impulse.y = impulse1.y;
          impulse.z = 0;
        }
        var P3 = Vec2.combine(impulse.x, perp2, impulse.z, axis);
        var LA = impulse.x * s1 + impulse.y + impulse.z * a1;
        var LB = impulse.x * s2 + impulse.y + impulse.z * a2;
        cA2.subMul(mA, P3);
        aA -= iA * LA;
        cB2.addMul(mB, P3);
        aB += iB * LB;
        this.m_bodyA.c_position.c = cA2;
        this.m_bodyA.c_position.a = aA;
        this.m_bodyB.c_position.c = cB2;
        this.m_bodyB.c_position.a = aB;
        return linearError <= SettingsInternal.linearSlop && angularError <= SettingsInternal.angularSlop;
      };
      PrismaticJoint2.TYPE = "prismatic-joint";
      return PrismaticJoint2;
    })(Joint);
    var DEFAULTS$6 = { ratio: 1 };
    var GearJoint = (function(_super) {
      __extends(GearJoint2, _super);
      function GearJoint2(def, bodyA, bodyB, joint1, joint2, ratio) {
        var _this = this;
        if (!(_this instanceof GearJoint2)) {
          return new GearJoint2(def, bodyA, bodyB, joint1, joint2, ratio);
        }
        def = options(def, DEFAULTS$6);
        _this = _super.call(this, def, bodyA, bodyB) || this;
        bodyA = _this.m_bodyA;
        bodyB = _this.m_bodyB;
        _this.m_type = GearJoint2.TYPE;
        _this.m_joint1 = joint1 ? joint1 : def.joint1;
        _this.m_joint2 = joint2 ? joint2 : def.joint2;
        _this.m_ratio = Number.isFinite(ratio) ? ratio : def.ratio;
        _this.m_type1 = _this.m_joint1.getType();
        _this.m_type2 = _this.m_joint2.getType();
        var coordinateA;
        var coordinateB;
        _this.m_bodyC = _this.m_joint1.getBodyA();
        _this.m_bodyA = _this.m_joint1.getBodyB();
        var xfA2 = _this.m_bodyA.m_xf;
        var aA = _this.m_bodyA.m_sweep.a;
        var xfC = _this.m_bodyC.m_xf;
        var aC = _this.m_bodyC.m_sweep.a;
        if (_this.m_type1 === RevoluteJoint.TYPE) {
          var revolute = _this.m_joint1;
          _this.m_localAnchorC = revolute.m_localAnchorA;
          _this.m_localAnchorA = revolute.m_localAnchorB;
          _this.m_referenceAngleA = revolute.m_referenceAngle;
          _this.m_localAxisC = Vec2.zero();
          coordinateA = aA - aC - _this.m_referenceAngleA;
        } else {
          var prismatic = _this.m_joint1;
          _this.m_localAnchorC = prismatic.m_localAnchorA;
          _this.m_localAnchorA = prismatic.m_localAnchorB;
          _this.m_referenceAngleA = prismatic.m_referenceAngle;
          _this.m_localAxisC = prismatic.m_localXAxisA;
          var pC = _this.m_localAnchorC;
          var pA2 = Rot.mulTVec2(xfC.q, Vec2.add(Rot.mulVec2(xfA2.q, _this.m_localAnchorA), Vec2.sub(xfA2.p, xfC.p)));
          coordinateA = Vec2.dot(pA2, _this.m_localAxisC) - Vec2.dot(pC, _this.m_localAxisC);
        }
        _this.m_bodyD = _this.m_joint2.getBodyA();
        _this.m_bodyB = _this.m_joint2.getBodyB();
        var xfB2 = _this.m_bodyB.m_xf;
        var aB = _this.m_bodyB.m_sweep.a;
        var xfD = _this.m_bodyD.m_xf;
        var aD = _this.m_bodyD.m_sweep.a;
        if (_this.m_type2 === RevoluteJoint.TYPE) {
          var revolute = _this.m_joint2;
          _this.m_localAnchorD = revolute.m_localAnchorA;
          _this.m_localAnchorB = revolute.m_localAnchorB;
          _this.m_referenceAngleB = revolute.m_referenceAngle;
          _this.m_localAxisD = Vec2.zero();
          coordinateB = aB - aD - _this.m_referenceAngleB;
        } else {
          var prismatic = _this.m_joint2;
          _this.m_localAnchorD = prismatic.m_localAnchorA;
          _this.m_localAnchorB = prismatic.m_localAnchorB;
          _this.m_referenceAngleB = prismatic.m_referenceAngle;
          _this.m_localAxisD = prismatic.m_localXAxisA;
          var pD = _this.m_localAnchorD;
          var pB2 = Rot.mulTVec2(xfD.q, Vec2.add(Rot.mulVec2(xfB2.q, _this.m_localAnchorB), Vec2.sub(xfB2.p, xfD.p)));
          coordinateB = Vec2.dot(pB2, _this.m_localAxisD) - Vec2.dot(pD, _this.m_localAxisD);
        }
        _this.m_constant = coordinateA + _this.m_ratio * coordinateB;
        _this.m_impulse = 0;
        return _this;
      }
      GearJoint2.prototype._serialize = function() {
        return { type: this.m_type, bodyA: this.m_bodyA, bodyB: this.m_bodyB, collideConnected: this.m_collideConnected, joint1: this.m_joint1, joint2: this.m_joint2, ratio: this.m_ratio };
      };
      GearJoint2._deserialize = function(data, world, restore) {
        data = __assign({}, data);
        data.bodyA = restore(Body, data.bodyA, world);
        data.bodyB = restore(Body, data.bodyB, world);
        data.joint1 = restore(Joint, data.joint1, world);
        data.joint2 = restore(Joint, data.joint2, world);
        var joint = new GearJoint2(data);
        return joint;
      };
      GearJoint2.prototype._reset = function(def) {
        if (Number.isFinite(def.ratio)) {
          this.m_ratio = def.ratio;
        }
      };
      GearJoint2.prototype.getJoint1 = function() {
        return this.m_joint1;
      };
      GearJoint2.prototype.getJoint2 = function() {
        return this.m_joint2;
      };
      GearJoint2.prototype.setRatio = function(ratio) {
        this.m_ratio = ratio;
      };
      GearJoint2.prototype.getRatio = function() {
        return this.m_ratio;
      };
      GearJoint2.prototype.getAnchorA = function() {
        return this.m_bodyA.getWorldPoint(this.m_localAnchorA);
      };
      GearJoint2.prototype.getAnchorB = function() {
        return this.m_bodyB.getWorldPoint(this.m_localAnchorB);
      };
      GearJoint2.prototype.getReactionForce = function(inv_dt) {
        return Vec2.mulNumVec2(this.m_impulse, this.m_JvAC).mul(inv_dt);
      };
      GearJoint2.prototype.getReactionTorque = function(inv_dt) {
        var L = this.m_impulse * this.m_JwA;
        return inv_dt * L;
      };
      GearJoint2.prototype.initVelocityConstraints = function(step) {
        this.m_lcA = this.m_bodyA.m_sweep.localCenter;
        this.m_lcB = this.m_bodyB.m_sweep.localCenter;
        this.m_lcC = this.m_bodyC.m_sweep.localCenter;
        this.m_lcD = this.m_bodyD.m_sweep.localCenter;
        this.m_mA = this.m_bodyA.m_invMass;
        this.m_mB = this.m_bodyB.m_invMass;
        this.m_mC = this.m_bodyC.m_invMass;
        this.m_mD = this.m_bodyD.m_invMass;
        this.m_iA = this.m_bodyA.m_invI;
        this.m_iB = this.m_bodyB.m_invI;
        this.m_iC = this.m_bodyC.m_invI;
        this.m_iD = this.m_bodyD.m_invI;
        var aA = this.m_bodyA.c_position.a;
        var vA2 = this.m_bodyA.c_velocity.v;
        var wA = this.m_bodyA.c_velocity.w;
        var aB = this.m_bodyB.c_position.a;
        var vB2 = this.m_bodyB.c_velocity.v;
        var wB = this.m_bodyB.c_velocity.w;
        var aC = this.m_bodyC.c_position.a;
        var vC = this.m_bodyC.c_velocity.v;
        var wC = this.m_bodyC.c_velocity.w;
        var aD = this.m_bodyD.c_position.a;
        var vD = this.m_bodyD.c_velocity.v;
        var wD = this.m_bodyD.c_velocity.w;
        var qA = Rot.neo(aA);
        var qB = Rot.neo(aB);
        var qC = Rot.neo(aC);
        var qD = Rot.neo(aD);
        this.m_mass = 0;
        if (this.m_type1 == RevoluteJoint.TYPE) {
          this.m_JvAC = Vec2.zero();
          this.m_JwA = 1;
          this.m_JwC = 1;
          this.m_mass += this.m_iA + this.m_iC;
        } else {
          var u = Rot.mulVec2(qC, this.m_localAxisC);
          var rC = Rot.mulSub(qC, this.m_localAnchorC, this.m_lcC);
          var rA2 = Rot.mulSub(qA, this.m_localAnchorA, this.m_lcA);
          this.m_JvAC = u;
          this.m_JwC = Vec2.crossVec2Vec2(rC, u);
          this.m_JwA = Vec2.crossVec2Vec2(rA2, u);
          this.m_mass += this.m_mC + this.m_mA + this.m_iC * this.m_JwC * this.m_JwC + this.m_iA * this.m_JwA * this.m_JwA;
        }
        if (this.m_type2 == RevoluteJoint.TYPE) {
          this.m_JvBD = Vec2.zero();
          this.m_JwB = this.m_ratio;
          this.m_JwD = this.m_ratio;
          this.m_mass += this.m_ratio * this.m_ratio * (this.m_iB + this.m_iD);
        } else {
          var u = Rot.mulVec2(qD, this.m_localAxisD);
          var rD = Rot.mulSub(qD, this.m_localAnchorD, this.m_lcD);
          var rB2 = Rot.mulSub(qB, this.m_localAnchorB, this.m_lcB);
          this.m_JvBD = Vec2.mulNumVec2(this.m_ratio, u);
          this.m_JwD = this.m_ratio * Vec2.crossVec2Vec2(rD, u);
          this.m_JwB = this.m_ratio * Vec2.crossVec2Vec2(rB2, u);
          this.m_mass += this.m_ratio * this.m_ratio * (this.m_mD + this.m_mB) + this.m_iD * this.m_JwD * this.m_JwD + this.m_iB * this.m_JwB * this.m_JwB;
        }
        this.m_mass = this.m_mass > 0 ? 1 / this.m_mass : 0;
        if (step.warmStarting) {
          vA2.addMul(this.m_mA * this.m_impulse, this.m_JvAC);
          wA += this.m_iA * this.m_impulse * this.m_JwA;
          vB2.addMul(this.m_mB * this.m_impulse, this.m_JvBD);
          wB += this.m_iB * this.m_impulse * this.m_JwB;
          vC.subMul(this.m_mC * this.m_impulse, this.m_JvAC);
          wC -= this.m_iC * this.m_impulse * this.m_JwC;
          vD.subMul(this.m_mD * this.m_impulse, this.m_JvBD);
          wD -= this.m_iD * this.m_impulse * this.m_JwD;
        } else {
          this.m_impulse = 0;
        }
        this.m_bodyA.c_velocity.v.setVec2(vA2);
        this.m_bodyA.c_velocity.w = wA;
        this.m_bodyB.c_velocity.v.setVec2(vB2);
        this.m_bodyB.c_velocity.w = wB;
        this.m_bodyC.c_velocity.v.setVec2(vC);
        this.m_bodyC.c_velocity.w = wC;
        this.m_bodyD.c_velocity.v.setVec2(vD);
        this.m_bodyD.c_velocity.w = wD;
      };
      GearJoint2.prototype.solveVelocityConstraints = function(step) {
        var vA2 = this.m_bodyA.c_velocity.v;
        var wA = this.m_bodyA.c_velocity.w;
        var vB2 = this.m_bodyB.c_velocity.v;
        var wB = this.m_bodyB.c_velocity.w;
        var vC = this.m_bodyC.c_velocity.v;
        var wC = this.m_bodyC.c_velocity.w;
        var vD = this.m_bodyD.c_velocity.v;
        var wD = this.m_bodyD.c_velocity.w;
        var Cdot = Vec2.dot(this.m_JvAC, vA2) - Vec2.dot(this.m_JvAC, vC) + Vec2.dot(this.m_JvBD, vB2) - Vec2.dot(this.m_JvBD, vD);
        Cdot += this.m_JwA * wA - this.m_JwC * wC + (this.m_JwB * wB - this.m_JwD * wD);
        var impulse = -this.m_mass * Cdot;
        this.m_impulse += impulse;
        vA2.addMul(this.m_mA * impulse, this.m_JvAC);
        wA += this.m_iA * impulse * this.m_JwA;
        vB2.addMul(this.m_mB * impulse, this.m_JvBD);
        wB += this.m_iB * impulse * this.m_JwB;
        vC.subMul(this.m_mC * impulse, this.m_JvAC);
        wC -= this.m_iC * impulse * this.m_JwC;
        vD.subMul(this.m_mD * impulse, this.m_JvBD);
        wD -= this.m_iD * impulse * this.m_JwD;
        this.m_bodyA.c_velocity.v.setVec2(vA2);
        this.m_bodyA.c_velocity.w = wA;
        this.m_bodyB.c_velocity.v.setVec2(vB2);
        this.m_bodyB.c_velocity.w = wB;
        this.m_bodyC.c_velocity.v.setVec2(vC);
        this.m_bodyC.c_velocity.w = wC;
        this.m_bodyD.c_velocity.v.setVec2(vD);
        this.m_bodyD.c_velocity.w = wD;
      };
      GearJoint2.prototype.solvePositionConstraints = function(step) {
        var cA2 = this.m_bodyA.c_position.c;
        var aA = this.m_bodyA.c_position.a;
        var cB2 = this.m_bodyB.c_position.c;
        var aB = this.m_bodyB.c_position.a;
        var cC = this.m_bodyC.c_position.c;
        var aC = this.m_bodyC.c_position.a;
        var cD = this.m_bodyD.c_position.c;
        var aD = this.m_bodyD.c_position.a;
        var qA = Rot.neo(aA);
        var qB = Rot.neo(aB);
        var qC = Rot.neo(aC);
        var qD = Rot.neo(aD);
        var linearError = 0;
        var coordinateA;
        var coordinateB;
        var JvAC;
        var JvBD;
        var JwA;
        var JwB;
        var JwC;
        var JwD;
        var mass = 0;
        if (this.m_type1 == RevoluteJoint.TYPE) {
          JvAC = Vec2.zero();
          JwA = 1;
          JwC = 1;
          mass += this.m_iA + this.m_iC;
          coordinateA = aA - aC - this.m_referenceAngleA;
        } else {
          var u = Rot.mulVec2(qC, this.m_localAxisC);
          var rC = Rot.mulSub(qC, this.m_localAnchorC, this.m_lcC);
          var rA2 = Rot.mulSub(qA, this.m_localAnchorA, this.m_lcA);
          JvAC = u;
          JwC = Vec2.crossVec2Vec2(rC, u);
          JwA = Vec2.crossVec2Vec2(rA2, u);
          mass += this.m_mC + this.m_mA + this.m_iC * JwC * JwC + this.m_iA * JwA * JwA;
          var pC = Vec2.sub(this.m_localAnchorC, this.m_lcC);
          var pA2 = Rot.mulTVec2(qC, Vec2.add(rA2, Vec2.sub(cA2, cC)));
          coordinateA = Vec2.dot(Vec2.sub(pA2, pC), this.m_localAxisC);
        }
        if (this.m_type2 == RevoluteJoint.TYPE) {
          JvBD = Vec2.zero();
          JwB = this.m_ratio;
          JwD = this.m_ratio;
          mass += this.m_ratio * this.m_ratio * (this.m_iB + this.m_iD);
          coordinateB = aB - aD - this.m_referenceAngleB;
        } else {
          var u = Rot.mulVec2(qD, this.m_localAxisD);
          var rD = Rot.mulSub(qD, this.m_localAnchorD, this.m_lcD);
          var rB2 = Rot.mulSub(qB, this.m_localAnchorB, this.m_lcB);
          JvBD = Vec2.mulNumVec2(this.m_ratio, u);
          JwD = this.m_ratio * Vec2.crossVec2Vec2(rD, u);
          JwB = this.m_ratio * Vec2.crossVec2Vec2(rB2, u);
          mass += this.m_ratio * this.m_ratio * (this.m_mD + this.m_mB) + this.m_iD * JwD * JwD + this.m_iB * JwB * JwB;
          var pD = Vec2.sub(this.m_localAnchorD, this.m_lcD);
          var pB2 = Rot.mulTVec2(qD, Vec2.add(rB2, Vec2.sub(cB2, cD)));
          coordinateB = Vec2.dot(pB2, this.m_localAxisD) - Vec2.dot(pD, this.m_localAxisD);
        }
        var C = coordinateA + this.m_ratio * coordinateB - this.m_constant;
        var impulse = 0;
        if (mass > 0) {
          impulse = -C / mass;
        }
        cA2.addMul(this.m_mA * impulse, JvAC);
        aA += this.m_iA * impulse * JwA;
        cB2.addMul(this.m_mB * impulse, JvBD);
        aB += this.m_iB * impulse * JwB;
        cC.subMul(this.m_mC * impulse, JvAC);
        aC -= this.m_iC * impulse * JwC;
        cD.subMul(this.m_mD * impulse, JvBD);
        aD -= this.m_iD * impulse * JwD;
        this.m_bodyA.c_position.c.setVec2(cA2);
        this.m_bodyA.c_position.a = aA;
        this.m_bodyB.c_position.c.setVec2(cB2);
        this.m_bodyB.c_position.a = aB;
        this.m_bodyC.c_position.c.setVec2(cC);
        this.m_bodyC.c_position.a = aC;
        this.m_bodyD.c_position.c.setVec2(cD);
        this.m_bodyD.c_position.a = aD;
        return linearError < SettingsInternal.linearSlop;
      };
      GearJoint2.TYPE = "gear-joint";
      return GearJoint2;
    })(Joint);
    var DEFAULTS$5 = { maxForce: 1, maxTorque: 1, correctionFactor: 0.3 };
    var MotorJoint = (function(_super) {
      __extends(MotorJoint2, _super);
      function MotorJoint2(def, bodyA, bodyB) {
        var _this = this;
        if (!(_this instanceof MotorJoint2)) {
          return new MotorJoint2(def, bodyA, bodyB);
        }
        def = options(def, DEFAULTS$5);
        _this = _super.call(this, def, bodyA, bodyB) || this;
        bodyA = _this.m_bodyA;
        bodyB = _this.m_bodyB;
        _this.m_type = MotorJoint2.TYPE;
        _this.m_linearOffset = Vec2.isValid(def.linearOffset) ? Vec2.clone(def.linearOffset) : bodyA.getLocalPoint(bodyB.getPosition());
        _this.m_angularOffset = Number.isFinite(def.angularOffset) ? def.angularOffset : bodyB.getAngle() - bodyA.getAngle();
        _this.m_linearImpulse = Vec2.zero();
        _this.m_angularImpulse = 0;
        _this.m_maxForce = def.maxForce;
        _this.m_maxTorque = def.maxTorque;
        _this.m_correctionFactor = def.correctionFactor;
        return _this;
      }
      MotorJoint2.prototype._serialize = function() {
        return { type: this.m_type, bodyA: this.m_bodyA, bodyB: this.m_bodyB, collideConnected: this.m_collideConnected, maxForce: this.m_maxForce, maxTorque: this.m_maxTorque, correctionFactor: this.m_correctionFactor, linearOffset: this.m_linearOffset, angularOffset: this.m_angularOffset };
      };
      MotorJoint2._deserialize = function(data, world, restore) {
        data = __assign({}, data);
        data.bodyA = restore(Body, data.bodyA, world);
        data.bodyB = restore(Body, data.bodyB, world);
        var joint = new MotorJoint2(data);
        return joint;
      };
      MotorJoint2.prototype._reset = function(def) {
        if (Number.isFinite(def.angularOffset)) {
          this.m_angularOffset = def.angularOffset;
        }
        if (Number.isFinite(def.maxForce)) {
          this.m_maxForce = def.maxForce;
        }
        if (Number.isFinite(def.maxTorque)) {
          this.m_maxTorque = def.maxTorque;
        }
        if (Number.isFinite(def.correctionFactor)) {
          this.m_correctionFactor = def.correctionFactor;
        }
        if (Vec2.isValid(def.linearOffset)) {
          this.m_linearOffset.set(def.linearOffset);
        }
      };
      MotorJoint2.prototype.setMaxForce = function(force) {
        this.m_maxForce = force;
      };
      MotorJoint2.prototype.getMaxForce = function() {
        return this.m_maxForce;
      };
      MotorJoint2.prototype.setMaxTorque = function(torque) {
        this.m_maxTorque = torque;
      };
      MotorJoint2.prototype.getMaxTorque = function() {
        return this.m_maxTorque;
      };
      MotorJoint2.prototype.setCorrectionFactor = function(factor) {
        this.m_correctionFactor = factor;
      };
      MotorJoint2.prototype.getCorrectionFactor = function() {
        return this.m_correctionFactor;
      };
      MotorJoint2.prototype.setLinearOffset = function(linearOffset) {
        if (linearOffset.x != this.m_linearOffset.x || linearOffset.y != this.m_linearOffset.y) {
          this.m_bodyA.setAwake(true);
          this.m_bodyB.setAwake(true);
          this.m_linearOffset.set(linearOffset);
        }
      };
      MotorJoint2.prototype.getLinearOffset = function() {
        return this.m_linearOffset;
      };
      MotorJoint2.prototype.setAngularOffset = function(angularOffset) {
        if (angularOffset != this.m_angularOffset) {
          this.m_bodyA.setAwake(true);
          this.m_bodyB.setAwake(true);
          this.m_angularOffset = angularOffset;
        }
      };
      MotorJoint2.prototype.getAngularOffset = function() {
        return this.m_angularOffset;
      };
      MotorJoint2.prototype.getAnchorA = function() {
        return this.m_bodyA.getPosition();
      };
      MotorJoint2.prototype.getAnchorB = function() {
        return this.m_bodyB.getPosition();
      };
      MotorJoint2.prototype.getReactionForce = function(inv_dt) {
        return Vec2.mulNumVec2(inv_dt, this.m_linearImpulse);
      };
      MotorJoint2.prototype.getReactionTorque = function(inv_dt) {
        return inv_dt * this.m_angularImpulse;
      };
      MotorJoint2.prototype.initVelocityConstraints = function(step) {
        this.m_localCenterA = this.m_bodyA.m_sweep.localCenter;
        this.m_localCenterB = this.m_bodyB.m_sweep.localCenter;
        this.m_invMassA = this.m_bodyA.m_invMass;
        this.m_invMassB = this.m_bodyB.m_invMass;
        this.m_invIA = this.m_bodyA.m_invI;
        this.m_invIB = this.m_bodyB.m_invI;
        var cA2 = this.m_bodyA.c_position.c;
        var aA = this.m_bodyA.c_position.a;
        var vA2 = this.m_bodyA.c_velocity.v;
        var wA = this.m_bodyA.c_velocity.w;
        var cB2 = this.m_bodyB.c_position.c;
        var aB = this.m_bodyB.c_position.a;
        var vB2 = this.m_bodyB.c_velocity.v;
        var wB = this.m_bodyB.c_velocity.w;
        var qA = Rot.neo(aA);
        var qB = Rot.neo(aB);
        this.m_rA = Rot.mulVec2(qA, Vec2.sub(this.m_linearOffset, this.m_localCenterA));
        this.m_rB = Rot.mulVec2(qB, Vec2.neg(this.m_localCenterB));
        var mA = this.m_invMassA;
        var mB = this.m_invMassB;
        var iA = this.m_invIA;
        var iB = this.m_invIB;
        var K = new Mat22();
        K.ex.x = mA + mB + iA * this.m_rA.y * this.m_rA.y + iB * this.m_rB.y * this.m_rB.y;
        K.ex.y = -iA * this.m_rA.x * this.m_rA.y - iB * this.m_rB.x * this.m_rB.y;
        K.ey.x = K.ex.y;
        K.ey.y = mA + mB + iA * this.m_rA.x * this.m_rA.x + iB * this.m_rB.x * this.m_rB.x;
        this.m_linearMass = K.getInverse();
        this.m_angularMass = iA + iB;
        if (this.m_angularMass > 0) {
          this.m_angularMass = 1 / this.m_angularMass;
        }
        this.m_linearError = Vec2.zero();
        this.m_linearError.addCombine(1, cB2, 1, this.m_rB);
        this.m_linearError.subCombine(1, cA2, 1, this.m_rA);
        this.m_angularError = aB - aA - this.m_angularOffset;
        if (step.warmStarting) {
          this.m_linearImpulse.mul(step.dtRatio);
          this.m_angularImpulse *= step.dtRatio;
          var P3 = Vec2.neo(this.m_linearImpulse.x, this.m_linearImpulse.y);
          vA2.subMul(mA, P3);
          wA -= iA * (Vec2.crossVec2Vec2(this.m_rA, P3) + this.m_angularImpulse);
          vB2.addMul(mB, P3);
          wB += iB * (Vec2.crossVec2Vec2(this.m_rB, P3) + this.m_angularImpulse);
        } else {
          this.m_linearImpulse.setZero();
          this.m_angularImpulse = 0;
        }
        this.m_bodyA.c_velocity.v = vA2;
        this.m_bodyA.c_velocity.w = wA;
        this.m_bodyB.c_velocity.v = vB2;
        this.m_bodyB.c_velocity.w = wB;
      };
      MotorJoint2.prototype.solveVelocityConstraints = function(step) {
        var vA2 = this.m_bodyA.c_velocity.v;
        var wA = this.m_bodyA.c_velocity.w;
        var vB2 = this.m_bodyB.c_velocity.v;
        var wB = this.m_bodyB.c_velocity.w;
        var mA = this.m_invMassA;
        var mB = this.m_invMassB;
        var iA = this.m_invIA;
        var iB = this.m_invIB;
        var h = step.dt;
        var inv_h = step.inv_dt;
        {
          var Cdot = wB - wA + inv_h * this.m_correctionFactor * this.m_angularError;
          var impulse = -this.m_angularMass * Cdot;
          var oldImpulse = this.m_angularImpulse;
          var maxImpulse = h * this.m_maxTorque;
          this.m_angularImpulse = clamp(this.m_angularImpulse + impulse, -maxImpulse, maxImpulse);
          impulse = this.m_angularImpulse - oldImpulse;
          wA -= iA * impulse;
          wB += iB * impulse;
        }
        {
          var Cdot = Vec2.zero();
          Cdot.addCombine(1, vB2, 1, Vec2.crossNumVec2(wB, this.m_rB));
          Cdot.subCombine(1, vA2, 1, Vec2.crossNumVec2(wA, this.m_rA));
          Cdot.addMul(inv_h * this.m_correctionFactor, this.m_linearError);
          var impulse = Vec2.neg(Mat22.mulVec2(this.m_linearMass, Cdot));
          var oldImpulse = Vec2.clone(this.m_linearImpulse);
          this.m_linearImpulse.add(impulse);
          var maxImpulse = h * this.m_maxForce;
          this.m_linearImpulse.clamp(maxImpulse);
          impulse = Vec2.sub(this.m_linearImpulse, oldImpulse);
          vA2.subMul(mA, impulse);
          wA -= iA * Vec2.crossVec2Vec2(this.m_rA, impulse);
          vB2.addMul(mB, impulse);
          wB += iB * Vec2.crossVec2Vec2(this.m_rB, impulse);
        }
        this.m_bodyA.c_velocity.v = vA2;
        this.m_bodyA.c_velocity.w = wA;
        this.m_bodyB.c_velocity.v = vB2;
        this.m_bodyB.c_velocity.w = wB;
      };
      MotorJoint2.prototype.solvePositionConstraints = function(step) {
        return true;
      };
      MotorJoint2.TYPE = "motor-joint";
      return MotorJoint2;
    })(Joint);
    var math_PI$2 = Math.PI;
    var DEFAULTS$4 = { maxForce: 0, frequencyHz: 5, dampingRatio: 0.7 };
    var MouseJoint = (function(_super) {
      __extends(MouseJoint2, _super);
      function MouseJoint2(def, bodyA, bodyB, target) {
        var _this = this;
        if (!(_this instanceof MouseJoint2)) {
          return new MouseJoint2(def, bodyA, bodyB, target);
        }
        def = options(def, DEFAULTS$4);
        _this = _super.call(this, def, bodyA, bodyB) || this;
        bodyA = _this.m_bodyA;
        bodyB = _this.m_bodyB;
        _this.m_type = MouseJoint2.TYPE;
        if (Vec2.isValid(target)) {
          _this.m_targetA = Vec2.clone(target);
        } else if (Vec2.isValid(def.target)) {
          _this.m_targetA = Vec2.clone(def.target);
        } else {
          _this.m_targetA = Vec2.zero();
        }
        _this.m_localAnchorB = Transform.mulTVec2(bodyB.getTransform(), _this.m_targetA);
        _this.m_maxForce = def.maxForce;
        _this.m_impulse = Vec2.zero();
        _this.m_frequencyHz = def.frequencyHz;
        _this.m_dampingRatio = def.dampingRatio;
        _this.m_beta = 0;
        _this.m_gamma = 0;
        _this.m_rB = Vec2.zero();
        _this.m_localCenterB = Vec2.zero();
        _this.m_invMassB = 0;
        _this.m_invIB = 0;
        _this.m_mass = new Mat22();
        _this.m_C = Vec2.zero();
        return _this;
      }
      MouseJoint2.prototype._serialize = function() {
        return { type: this.m_type, bodyA: this.m_bodyA, bodyB: this.m_bodyB, collideConnected: this.m_collideConnected, target: this.m_targetA, maxForce: this.m_maxForce, frequencyHz: this.m_frequencyHz, dampingRatio: this.m_dampingRatio, _localAnchorB: this.m_localAnchorB };
      };
      MouseJoint2._deserialize = function(data, world, restore) {
        data = __assign({}, data);
        data.bodyA = restore(Body, data.bodyA, world);
        data.bodyB = restore(Body, data.bodyB, world);
        data.target = Vec2.clone(data.target);
        var joint = new MouseJoint2(data);
        if (data._localAnchorB) {
          joint.m_localAnchorB = data._localAnchorB;
        }
        return joint;
      };
      MouseJoint2.prototype._reset = function(def) {
        if (Number.isFinite(def.maxForce)) {
          this.m_maxForce = def.maxForce;
        }
        if (Number.isFinite(def.frequencyHz)) {
          this.m_frequencyHz = def.frequencyHz;
        }
        if (Number.isFinite(def.dampingRatio)) {
          this.m_dampingRatio = def.dampingRatio;
        }
      };
      MouseJoint2.prototype.setTarget = function(target) {
        if (Vec2.areEqual(target, this.m_targetA)) return;
        this.m_bodyB.setAwake(true);
        this.m_targetA.set(target);
      };
      MouseJoint2.prototype.getTarget = function() {
        return this.m_targetA;
      };
      MouseJoint2.prototype.setMaxForce = function(force) {
        this.m_maxForce = force;
      };
      MouseJoint2.prototype.getMaxForce = function() {
        return this.m_maxForce;
      };
      MouseJoint2.prototype.setFrequency = function(hz) {
        this.m_frequencyHz = hz;
      };
      MouseJoint2.prototype.getFrequency = function() {
        return this.m_frequencyHz;
      };
      MouseJoint2.prototype.setDampingRatio = function(ratio) {
        this.m_dampingRatio = ratio;
      };
      MouseJoint2.prototype.getDampingRatio = function() {
        return this.m_dampingRatio;
      };
      MouseJoint2.prototype.getAnchorA = function() {
        return Vec2.clone(this.m_targetA);
      };
      MouseJoint2.prototype.getAnchorB = function() {
        return this.m_bodyB.getWorldPoint(this.m_localAnchorB);
      };
      MouseJoint2.prototype.getReactionForce = function(inv_dt) {
        return Vec2.mulNumVec2(inv_dt, this.m_impulse);
      };
      MouseJoint2.prototype.getReactionTorque = function(inv_dt) {
        return inv_dt * 0;
      };
      MouseJoint2.prototype.shiftOrigin = function(newOrigin) {
        this.m_targetA.sub(newOrigin);
      };
      MouseJoint2.prototype.initVelocityConstraints = function(step) {
        this.m_localCenterB = this.m_bodyB.m_sweep.localCenter;
        this.m_invMassB = this.m_bodyB.m_invMass;
        this.m_invIB = this.m_bodyB.m_invI;
        var position = this.m_bodyB.c_position;
        var velocity = this.m_bodyB.c_velocity;
        var cB2 = position.c;
        var aB = position.a;
        var vB2 = velocity.v;
        var wB = velocity.w;
        var qB = Rot.neo(aB);
        var mass = this.m_bodyB.getMass();
        var omega = 2 * math_PI$2 * this.m_frequencyHz;
        var d2 = 2 * mass * this.m_dampingRatio * omega;
        var k = mass * (omega * omega);
        var h = step.dt;
        this.m_gamma = h * (d2 + h * k);
        if (this.m_gamma != 0) {
          this.m_gamma = 1 / this.m_gamma;
        }
        this.m_beta = h * k * this.m_gamma;
        this.m_rB = Rot.mulVec2(qB, Vec2.sub(this.m_localAnchorB, this.m_localCenterB));
        var K = new Mat22();
        K.ex.x = this.m_invMassB + this.m_invIB * this.m_rB.y * this.m_rB.y + this.m_gamma;
        K.ex.y = -this.m_invIB * this.m_rB.x * this.m_rB.y;
        K.ey.x = K.ex.y;
        K.ey.y = this.m_invMassB + this.m_invIB * this.m_rB.x * this.m_rB.x + this.m_gamma;
        this.m_mass = K.getInverse();
        this.m_C.setVec2(cB2);
        this.m_C.addCombine(1, this.m_rB, -1, this.m_targetA);
        this.m_C.mul(this.m_beta);
        wB *= 0.98;
        if (step.warmStarting) {
          this.m_impulse.mul(step.dtRatio);
          vB2.addMul(this.m_invMassB, this.m_impulse);
          wB += this.m_invIB * Vec2.crossVec2Vec2(this.m_rB, this.m_impulse);
        } else {
          this.m_impulse.setZero();
        }
        velocity.v.setVec2(vB2);
        velocity.w = wB;
      };
      MouseJoint2.prototype.solveVelocityConstraints = function(step) {
        var velocity = this.m_bodyB.c_velocity;
        var vB2 = Vec2.clone(velocity.v);
        var wB = velocity.w;
        var Cdot = Vec2.crossNumVec2(wB, this.m_rB);
        Cdot.add(vB2);
        Cdot.addCombine(1, this.m_C, this.m_gamma, this.m_impulse);
        Cdot.neg();
        var impulse = Mat22.mulVec2(this.m_mass, Cdot);
        var oldImpulse = Vec2.clone(this.m_impulse);
        this.m_impulse.add(impulse);
        var maxImpulse = step.dt * this.m_maxForce;
        this.m_impulse.clamp(maxImpulse);
        impulse = Vec2.sub(this.m_impulse, oldImpulse);
        vB2.addMul(this.m_invMassB, impulse);
        wB += this.m_invIB * Vec2.crossVec2Vec2(this.m_rB, impulse);
        velocity.v.setVec2(vB2);
        velocity.w = wB;
      };
      MouseJoint2.prototype.solvePositionConstraints = function(step) {
        return true;
      };
      MouseJoint2.TYPE = "mouse-joint";
      return MouseJoint2;
    })(Joint);
    var math_abs$2 = Math.abs;
    var DEFAULTS$3 = { collideConnected: true };
    var PulleyJoint = (function(_super) {
      __extends(PulleyJoint2, _super);
      function PulleyJoint2(def, bodyA, bodyB, groundA, groundB, anchorA, anchorB, ratio) {
        var _this = this;
        if (!(_this instanceof PulleyJoint2)) {
          return new PulleyJoint2(def, bodyA, bodyB, groundA, groundB, anchorA, anchorB, ratio);
        }
        def = options(def, DEFAULTS$3);
        _this = _super.call(this, def, bodyA, bodyB) || this;
        bodyA = _this.m_bodyA;
        bodyB = _this.m_bodyB;
        _this.m_type = PulleyJoint2.TYPE;
        _this.m_groundAnchorA = Vec2.clone(groundA ? groundA : def.groundAnchorA || Vec2.neo(-1, 1));
        _this.m_groundAnchorB = Vec2.clone(groundB ? groundB : def.groundAnchorB || Vec2.neo(1, 1));
        _this.m_localAnchorA = Vec2.clone(anchorA ? bodyA.getLocalPoint(anchorA) : def.localAnchorA || Vec2.neo(-1, 0));
        _this.m_localAnchorB = Vec2.clone(anchorB ? bodyB.getLocalPoint(anchorB) : def.localAnchorB || Vec2.neo(1, 0));
        _this.m_lengthA = Number.isFinite(def.lengthA) ? def.lengthA : Vec2.distance(anchorA, groundA);
        _this.m_lengthB = Number.isFinite(def.lengthB) ? def.lengthB : Vec2.distance(anchorB, groundB);
        _this.m_ratio = Number.isFinite(ratio) ? ratio : def.ratio;
        _this.m_constant = _this.m_lengthA + _this.m_ratio * _this.m_lengthB;
        _this.m_impulse = 0;
        return _this;
      }
      PulleyJoint2.prototype._serialize = function() {
        return { type: this.m_type, bodyA: this.m_bodyA, bodyB: this.m_bodyB, collideConnected: this.m_collideConnected, groundAnchorA: this.m_groundAnchorA, groundAnchorB: this.m_groundAnchorB, localAnchorA: this.m_localAnchorA, localAnchorB: this.m_localAnchorB, lengthA: this.m_lengthA, lengthB: this.m_lengthB, ratio: this.m_ratio };
      };
      PulleyJoint2._deserialize = function(data, world, restore) {
        data = __assign({}, data);
        data.bodyA = restore(Body, data.bodyA, world);
        data.bodyB = restore(Body, data.bodyB, world);
        var joint = new PulleyJoint2(data);
        return joint;
      };
      PulleyJoint2.prototype._reset = function(def) {
        if (Vec2.isValid(def.groundAnchorA)) {
          this.m_groundAnchorA.set(def.groundAnchorA);
        }
        if (Vec2.isValid(def.groundAnchorB)) {
          this.m_groundAnchorB.set(def.groundAnchorB);
        }
        if (Vec2.isValid(def.localAnchorA)) {
          this.m_localAnchorA.set(def.localAnchorA);
        } else if (Vec2.isValid(def.anchorA)) {
          this.m_localAnchorA.set(this.m_bodyA.getLocalPoint(def.anchorA));
        }
        if (Vec2.isValid(def.localAnchorB)) {
          this.m_localAnchorB.set(def.localAnchorB);
        } else if (Vec2.isValid(def.anchorB)) {
          this.m_localAnchorB.set(this.m_bodyB.getLocalPoint(def.anchorB));
        }
        if (Number.isFinite(def.lengthA)) {
          this.m_lengthA = def.lengthA;
        }
        if (Number.isFinite(def.lengthB)) {
          this.m_lengthB = def.lengthB;
        }
        if (Number.isFinite(def.ratio)) {
          this.m_ratio = def.ratio;
        }
      };
      PulleyJoint2.prototype.getGroundAnchorA = function() {
        return this.m_groundAnchorA;
      };
      PulleyJoint2.prototype.getGroundAnchorB = function() {
        return this.m_groundAnchorB;
      };
      PulleyJoint2.prototype.getLengthA = function() {
        return this.m_lengthA;
      };
      PulleyJoint2.prototype.getLengthB = function() {
        return this.m_lengthB;
      };
      PulleyJoint2.prototype.getRatio = function() {
        return this.m_ratio;
      };
      PulleyJoint2.prototype.getCurrentLengthA = function() {
        var p = this.m_bodyA.getWorldPoint(this.m_localAnchorA);
        var s2 = this.m_groundAnchorA;
        return Vec2.distance(p, s2);
      };
      PulleyJoint2.prototype.getCurrentLengthB = function() {
        var p = this.m_bodyB.getWorldPoint(this.m_localAnchorB);
        var s2 = this.m_groundAnchorB;
        return Vec2.distance(p, s2);
      };
      PulleyJoint2.prototype.shiftOrigin = function(newOrigin) {
        this.m_groundAnchorA.sub(newOrigin);
        this.m_groundAnchorB.sub(newOrigin);
      };
      PulleyJoint2.prototype.getAnchorA = function() {
        return this.m_bodyA.getWorldPoint(this.m_localAnchorA);
      };
      PulleyJoint2.prototype.getAnchorB = function() {
        return this.m_bodyB.getWorldPoint(this.m_localAnchorB);
      };
      PulleyJoint2.prototype.getReactionForce = function(inv_dt) {
        return Vec2.mulNumVec2(this.m_impulse, this.m_uB).mul(inv_dt);
      };
      PulleyJoint2.prototype.getReactionTorque = function(inv_dt) {
        return 0;
      };
      PulleyJoint2.prototype.initVelocityConstraints = function(step) {
        this.m_localCenterA = this.m_bodyA.m_sweep.localCenter;
        this.m_localCenterB = this.m_bodyB.m_sweep.localCenter;
        this.m_invMassA = this.m_bodyA.m_invMass;
        this.m_invMassB = this.m_bodyB.m_invMass;
        this.m_invIA = this.m_bodyA.m_invI;
        this.m_invIB = this.m_bodyB.m_invI;
        var cA2 = this.m_bodyA.c_position.c;
        var aA = this.m_bodyA.c_position.a;
        var vA2 = this.m_bodyA.c_velocity.v;
        var wA = this.m_bodyA.c_velocity.w;
        var cB2 = this.m_bodyB.c_position.c;
        var aB = this.m_bodyB.c_position.a;
        var vB2 = this.m_bodyB.c_velocity.v;
        var wB = this.m_bodyB.c_velocity.w;
        var qA = Rot.neo(aA);
        var qB = Rot.neo(aB);
        this.m_rA = Rot.mulVec2(qA, Vec2.sub(this.m_localAnchorA, this.m_localCenterA));
        this.m_rB = Rot.mulVec2(qB, Vec2.sub(this.m_localAnchorB, this.m_localCenterB));
        this.m_uA = Vec2.sub(Vec2.add(cA2, this.m_rA), this.m_groundAnchorA);
        this.m_uB = Vec2.sub(Vec2.add(cB2, this.m_rB), this.m_groundAnchorB);
        var lengthA = this.m_uA.length();
        var lengthB = this.m_uB.length();
        if (lengthA > 10 * SettingsInternal.linearSlop) {
          this.m_uA.mul(1 / lengthA);
        } else {
          this.m_uA.setZero();
        }
        if (lengthB > 10 * SettingsInternal.linearSlop) {
          this.m_uB.mul(1 / lengthB);
        } else {
          this.m_uB.setZero();
        }
        var ruA = Vec2.crossVec2Vec2(this.m_rA, this.m_uA);
        var ruB = Vec2.crossVec2Vec2(this.m_rB, this.m_uB);
        var mA = this.m_invMassA + this.m_invIA * ruA * ruA;
        var mB = this.m_invMassB + this.m_invIB * ruB * ruB;
        this.m_mass = mA + this.m_ratio * this.m_ratio * mB;
        if (this.m_mass > 0) {
          this.m_mass = 1 / this.m_mass;
        }
        if (step.warmStarting) {
          this.m_impulse *= step.dtRatio;
          var PA = Vec2.mulNumVec2(-this.m_impulse, this.m_uA);
          var PB = Vec2.mulNumVec2(-this.m_ratio * this.m_impulse, this.m_uB);
          vA2.addMul(this.m_invMassA, PA);
          wA += this.m_invIA * Vec2.crossVec2Vec2(this.m_rA, PA);
          vB2.addMul(this.m_invMassB, PB);
          wB += this.m_invIB * Vec2.crossVec2Vec2(this.m_rB, PB);
        } else {
          this.m_impulse = 0;
        }
        this.m_bodyA.c_velocity.v = vA2;
        this.m_bodyA.c_velocity.w = wA;
        this.m_bodyB.c_velocity.v = vB2;
        this.m_bodyB.c_velocity.w = wB;
      };
      PulleyJoint2.prototype.solveVelocityConstraints = function(step) {
        var vA2 = this.m_bodyA.c_velocity.v;
        var wA = this.m_bodyA.c_velocity.w;
        var vB2 = this.m_bodyB.c_velocity.v;
        var wB = this.m_bodyB.c_velocity.w;
        var vpA = Vec2.add(vA2, Vec2.crossNumVec2(wA, this.m_rA));
        var vpB = Vec2.add(vB2, Vec2.crossNumVec2(wB, this.m_rB));
        var Cdot = -Vec2.dot(this.m_uA, vpA) - this.m_ratio * Vec2.dot(this.m_uB, vpB);
        var impulse = -this.m_mass * Cdot;
        this.m_impulse += impulse;
        var PA = Vec2.mulNumVec2(-impulse, this.m_uA);
        var PB = Vec2.mulNumVec2(-this.m_ratio * impulse, this.m_uB);
        vA2.addMul(this.m_invMassA, PA);
        wA += this.m_invIA * Vec2.crossVec2Vec2(this.m_rA, PA);
        vB2.addMul(this.m_invMassB, PB);
        wB += this.m_invIB * Vec2.crossVec2Vec2(this.m_rB, PB);
        this.m_bodyA.c_velocity.v = vA2;
        this.m_bodyA.c_velocity.w = wA;
        this.m_bodyB.c_velocity.v = vB2;
        this.m_bodyB.c_velocity.w = wB;
      };
      PulleyJoint2.prototype.solvePositionConstraints = function(step) {
        var cA2 = this.m_bodyA.c_position.c;
        var aA = this.m_bodyA.c_position.a;
        var cB2 = this.m_bodyB.c_position.c;
        var aB = this.m_bodyB.c_position.a;
        var qA = Rot.neo(aA);
        var qB = Rot.neo(aB);
        var rA2 = Rot.mulVec2(qA, Vec2.sub(this.m_localAnchorA, this.m_localCenterA));
        var rB2 = Rot.mulVec2(qB, Vec2.sub(this.m_localAnchorB, this.m_localCenterB));
        var uA = Vec2.sub(Vec2.add(cA2, this.m_rA), this.m_groundAnchorA);
        var uB = Vec2.sub(Vec2.add(cB2, this.m_rB), this.m_groundAnchorB);
        var lengthA = uA.length();
        var lengthB = uB.length();
        if (lengthA > 10 * SettingsInternal.linearSlop) {
          uA.mul(1 / lengthA);
        } else {
          uA.setZero();
        }
        if (lengthB > 10 * SettingsInternal.linearSlop) {
          uB.mul(1 / lengthB);
        } else {
          uB.setZero();
        }
        var ruA = Vec2.crossVec2Vec2(rA2, uA);
        var ruB = Vec2.crossVec2Vec2(rB2, uB);
        var mA = this.m_invMassA + this.m_invIA * ruA * ruA;
        var mB = this.m_invMassB + this.m_invIB * ruB * ruB;
        var mass = mA + this.m_ratio * this.m_ratio * mB;
        if (mass > 0) {
          mass = 1 / mass;
        }
        var C = this.m_constant - lengthA - this.m_ratio * lengthB;
        var linearError = math_abs$2(C);
        var impulse = -mass * C;
        var PA = Vec2.mulNumVec2(-impulse, uA);
        var PB = Vec2.mulNumVec2(-this.m_ratio * impulse, uB);
        cA2.addMul(this.m_invMassA, PA);
        aA += this.m_invIA * Vec2.crossVec2Vec2(rA2, PA);
        cB2.addMul(this.m_invMassB, PB);
        aB += this.m_invIB * Vec2.crossVec2Vec2(rB2, PB);
        this.m_bodyA.c_position.c = cA2;
        this.m_bodyA.c_position.a = aA;
        this.m_bodyB.c_position.c = cB2;
        this.m_bodyB.c_position.a = aB;
        return linearError < SettingsInternal.linearSlop;
      };
      PulleyJoint2.TYPE = "pulley-joint";
      return PulleyJoint2;
    })(Joint);
    var math_min$1 = Math.min;
    var LimitState;
    (function(LimitState2) {
      LimitState2[LimitState2["inactiveLimit"] = 0] = "inactiveLimit";
      LimitState2[LimitState2["atLowerLimit"] = 1] = "atLowerLimit";
      LimitState2[LimitState2["atUpperLimit"] = 2] = "atUpperLimit";
      LimitState2[LimitState2["equalLimits"] = 3] = "equalLimits";
    })(LimitState || (LimitState = {}));
    var DEFAULTS$2 = { maxLength: 0 };
    var RopeJoint = (function(_super) {
      __extends(RopeJoint2, _super);
      function RopeJoint2(def, bodyA, bodyB, anchor) {
        var _this = this;
        if (!(_this instanceof RopeJoint2)) {
          return new RopeJoint2(def, bodyA, bodyB, anchor);
        }
        def = options(def, DEFAULTS$2);
        _this = _super.call(this, def, bodyA, bodyB) || this;
        bodyA = _this.m_bodyA;
        bodyB = _this.m_bodyB;
        _this.m_type = RopeJoint2.TYPE;
        _this.m_localAnchorA = Vec2.clone(anchor ? bodyA.getLocalPoint(anchor) : def.localAnchorA || Vec2.neo(-1, 0));
        _this.m_localAnchorB = Vec2.clone(anchor ? bodyB.getLocalPoint(anchor) : def.localAnchorB || Vec2.neo(1, 0));
        _this.m_maxLength = def.maxLength;
        _this.m_mass = 0;
        _this.m_impulse = 0;
        _this.m_length = 0;
        _this.m_state = LimitState.inactiveLimit;
        return _this;
      }
      RopeJoint2.prototype._serialize = function() {
        return { type: this.m_type, bodyA: this.m_bodyA, bodyB: this.m_bodyB, collideConnected: this.m_collideConnected, localAnchorA: this.m_localAnchorA, localAnchorB: this.m_localAnchorB, maxLength: this.m_maxLength };
      };
      RopeJoint2._deserialize = function(data, world, restore) {
        data = __assign({}, data);
        data.bodyA = restore(Body, data.bodyA, world);
        data.bodyB = restore(Body, data.bodyB, world);
        var joint = new RopeJoint2(data);
        return joint;
      };
      RopeJoint2.prototype._reset = function(def) {
        if (Number.isFinite(def.maxLength)) {
          this.m_maxLength = def.maxLength;
        }
      };
      RopeJoint2.prototype.getLocalAnchorA = function() {
        return this.m_localAnchorA;
      };
      RopeJoint2.prototype.getLocalAnchorB = function() {
        return this.m_localAnchorB;
      };
      RopeJoint2.prototype.setMaxLength = function(length) {
        this.m_maxLength = length;
      };
      RopeJoint2.prototype.getMaxLength = function() {
        return this.m_maxLength;
      };
      RopeJoint2.prototype.getLimitState = function() {
        return this.m_state;
      };
      RopeJoint2.prototype.getAnchorA = function() {
        return this.m_bodyA.getWorldPoint(this.m_localAnchorA);
      };
      RopeJoint2.prototype.getAnchorB = function() {
        return this.m_bodyB.getWorldPoint(this.m_localAnchorB);
      };
      RopeJoint2.prototype.getReactionForce = function(inv_dt) {
        return Vec2.mulNumVec2(this.m_impulse, this.m_u).mul(inv_dt);
      };
      RopeJoint2.prototype.getReactionTorque = function(inv_dt) {
        return 0;
      };
      RopeJoint2.prototype.initVelocityConstraints = function(step) {
        this.m_localCenterA = this.m_bodyA.m_sweep.localCenter;
        this.m_localCenterB = this.m_bodyB.m_sweep.localCenter;
        this.m_invMassA = this.m_bodyA.m_invMass;
        this.m_invMassB = this.m_bodyB.m_invMass;
        this.m_invIA = this.m_bodyA.m_invI;
        this.m_invIB = this.m_bodyB.m_invI;
        var cA2 = this.m_bodyA.c_position.c;
        var aA = this.m_bodyA.c_position.a;
        var vA2 = this.m_bodyA.c_velocity.v;
        var wA = this.m_bodyA.c_velocity.w;
        var cB2 = this.m_bodyB.c_position.c;
        var aB = this.m_bodyB.c_position.a;
        var vB2 = this.m_bodyB.c_velocity.v;
        var wB = this.m_bodyB.c_velocity.w;
        var qA = Rot.neo(aA);
        var qB = Rot.neo(aB);
        this.m_rA = Rot.mulSub(qA, this.m_localAnchorA, this.m_localCenterA);
        this.m_rB = Rot.mulSub(qB, this.m_localAnchorB, this.m_localCenterB);
        this.m_u = Vec2.zero();
        this.m_u.addCombine(1, cB2, 1, this.m_rB);
        this.m_u.subCombine(1, cA2, 1, this.m_rA);
        this.m_length = this.m_u.length();
        var C = this.m_length - this.m_maxLength;
        if (C > 0) {
          this.m_state = LimitState.atUpperLimit;
        } else {
          this.m_state = LimitState.inactiveLimit;
        }
        if (this.m_length > SettingsInternal.linearSlop) {
          this.m_u.mul(1 / this.m_length);
        } else {
          this.m_u.setZero();
          this.m_mass = 0;
          this.m_impulse = 0;
          return;
        }
        var crA = Vec2.crossVec2Vec2(this.m_rA, this.m_u);
        var crB = Vec2.crossVec2Vec2(this.m_rB, this.m_u);
        var invMass = this.m_invMassA + this.m_invIA * crA * crA + this.m_invMassB + this.m_invIB * crB * crB;
        this.m_mass = invMass != 0 ? 1 / invMass : 0;
        if (step.warmStarting) {
          this.m_impulse *= step.dtRatio;
          var P3 = Vec2.mulNumVec2(this.m_impulse, this.m_u);
          vA2.subMul(this.m_invMassA, P3);
          wA -= this.m_invIA * Vec2.crossVec2Vec2(this.m_rA, P3);
          vB2.addMul(this.m_invMassB, P3);
          wB += this.m_invIB * Vec2.crossVec2Vec2(this.m_rB, P3);
        } else {
          this.m_impulse = 0;
        }
        this.m_bodyA.c_velocity.v.setVec2(vA2);
        this.m_bodyA.c_velocity.w = wA;
        this.m_bodyB.c_velocity.v.setVec2(vB2);
        this.m_bodyB.c_velocity.w = wB;
      };
      RopeJoint2.prototype.solveVelocityConstraints = function(step) {
        var vA2 = this.m_bodyA.c_velocity.v;
        var wA = this.m_bodyA.c_velocity.w;
        var vB2 = this.m_bodyB.c_velocity.v;
        var wB = this.m_bodyB.c_velocity.w;
        var vpA = Vec2.addCrossNumVec2(vA2, wA, this.m_rA);
        var vpB = Vec2.addCrossNumVec2(vB2, wB, this.m_rB);
        var C = this.m_length - this.m_maxLength;
        var Cdot = Vec2.dot(this.m_u, Vec2.sub(vpB, vpA));
        if (C < 0) {
          Cdot += step.inv_dt * C;
        }
        var impulse = -this.m_mass * Cdot;
        var oldImpulse = this.m_impulse;
        this.m_impulse = math_min$1(0, this.m_impulse + impulse);
        impulse = this.m_impulse - oldImpulse;
        var P3 = Vec2.mulNumVec2(impulse, this.m_u);
        vA2.subMul(this.m_invMassA, P3);
        wA -= this.m_invIA * Vec2.crossVec2Vec2(this.m_rA, P3);
        vB2.addMul(this.m_invMassB, P3);
        wB += this.m_invIB * Vec2.crossVec2Vec2(this.m_rB, P3);
        this.m_bodyA.c_velocity.v = vA2;
        this.m_bodyA.c_velocity.w = wA;
        this.m_bodyB.c_velocity.v = vB2;
        this.m_bodyB.c_velocity.w = wB;
      };
      RopeJoint2.prototype.solvePositionConstraints = function(step) {
        var cA2 = this.m_bodyA.c_position.c;
        var aA = this.m_bodyA.c_position.a;
        var cB2 = this.m_bodyB.c_position.c;
        var aB = this.m_bodyB.c_position.a;
        var qA = Rot.neo(aA);
        var qB = Rot.neo(aB);
        var rA2 = Rot.mulSub(qA, this.m_localAnchorA, this.m_localCenterA);
        var rB2 = Rot.mulSub(qB, this.m_localAnchorB, this.m_localCenterB);
        var u = Vec2.zero();
        u.addCombine(1, cB2, 1, rB2);
        u.subCombine(1, cA2, 1, rA2);
        var length = u.normalize();
        var C = length - this.m_maxLength;
        C = clamp(C, 0, SettingsInternal.maxLinearCorrection);
        var impulse = -this.m_mass * C;
        var P3 = Vec2.mulNumVec2(impulse, u);
        cA2.subMul(this.m_invMassA, P3);
        aA -= this.m_invIA * Vec2.crossVec2Vec2(rA2, P3);
        cB2.addMul(this.m_invMassB, P3);
        aB += this.m_invIB * Vec2.crossVec2Vec2(rB2, P3);
        this.m_bodyA.c_position.c.setVec2(cA2);
        this.m_bodyA.c_position.a = aA;
        this.m_bodyB.c_position.c.setVec2(cB2);
        this.m_bodyB.c_position.a = aB;
        return length - this.m_maxLength < SettingsInternal.linearSlop;
      };
      RopeJoint2.TYPE = "rope-joint";
      return RopeJoint2;
    })(Joint);
    var math_abs$1 = Math.abs;
    var math_PI$1 = Math.PI;
    var DEFAULTS$1 = { frequencyHz: 0, dampingRatio: 0 };
    var WeldJoint = (function(_super) {
      __extends(WeldJoint2, _super);
      function WeldJoint2(def, bodyA, bodyB, anchor) {
        var _this = this;
        if (!(_this instanceof WeldJoint2)) {
          return new WeldJoint2(def, bodyA, bodyB, anchor);
        }
        def = options(def, DEFAULTS$1);
        _this = _super.call(this, def, bodyA, bodyB) || this;
        bodyA = _this.m_bodyA;
        bodyB = _this.m_bodyB;
        _this.m_type = WeldJoint2.TYPE;
        _this.m_localAnchorA = Vec2.clone(anchor ? bodyA.getLocalPoint(anchor) : def.localAnchorA || Vec2.zero());
        _this.m_localAnchorB = Vec2.clone(anchor ? bodyB.getLocalPoint(anchor) : def.localAnchorB || Vec2.zero());
        _this.m_referenceAngle = Number.isFinite(def.referenceAngle) ? def.referenceAngle : bodyB.getAngle() - bodyA.getAngle();
        _this.m_frequencyHz = def.frequencyHz;
        _this.m_dampingRatio = def.dampingRatio;
        _this.m_impulse = new Vec3();
        _this.m_bias = 0;
        _this.m_gamma = 0;
        _this.m_mass = new Mat33();
        return _this;
      }
      WeldJoint2.prototype._serialize = function() {
        return { type: this.m_type, bodyA: this.m_bodyA, bodyB: this.m_bodyB, collideConnected: this.m_collideConnected, frequencyHz: this.m_frequencyHz, dampingRatio: this.m_dampingRatio, localAnchorA: this.m_localAnchorA, localAnchorB: this.m_localAnchorB, referenceAngle: this.m_referenceAngle };
      };
      WeldJoint2._deserialize = function(data, world, restore) {
        data = __assign({}, data);
        data.bodyA = restore(Body, data.bodyA, world);
        data.bodyB = restore(Body, data.bodyB, world);
        var joint = new WeldJoint2(data);
        return joint;
      };
      WeldJoint2.prototype._reset = function(def) {
        if (def.anchorA) {
          this.m_localAnchorA.setVec2(this.m_bodyA.getLocalPoint(def.anchorA));
        } else if (def.localAnchorA) {
          this.m_localAnchorA.setVec2(def.localAnchorA);
        }
        if (def.anchorB) {
          this.m_localAnchorB.setVec2(this.m_bodyB.getLocalPoint(def.anchorB));
        } else if (def.localAnchorB) {
          this.m_localAnchorB.setVec2(def.localAnchorB);
        }
        if (Number.isFinite(def.frequencyHz)) {
          this.m_frequencyHz = def.frequencyHz;
        }
        if (Number.isFinite(def.dampingRatio)) {
          this.m_dampingRatio = def.dampingRatio;
        }
      };
      WeldJoint2.prototype.getLocalAnchorA = function() {
        return this.m_localAnchorA;
      };
      WeldJoint2.prototype.getLocalAnchorB = function() {
        return this.m_localAnchorB;
      };
      WeldJoint2.prototype.getReferenceAngle = function() {
        return this.m_referenceAngle;
      };
      WeldJoint2.prototype.setFrequency = function(hz) {
        this.m_frequencyHz = hz;
      };
      WeldJoint2.prototype.getFrequency = function() {
        return this.m_frequencyHz;
      };
      WeldJoint2.prototype.setDampingRatio = function(ratio) {
        this.m_dampingRatio = ratio;
      };
      WeldJoint2.prototype.getDampingRatio = function() {
        return this.m_dampingRatio;
      };
      WeldJoint2.prototype.getAnchorA = function() {
        return this.m_bodyA.getWorldPoint(this.m_localAnchorA);
      };
      WeldJoint2.prototype.getAnchorB = function() {
        return this.m_bodyB.getWorldPoint(this.m_localAnchorB);
      };
      WeldJoint2.prototype.getReactionForce = function(inv_dt) {
        return Vec2.neo(this.m_impulse.x, this.m_impulse.y).mul(inv_dt);
      };
      WeldJoint2.prototype.getReactionTorque = function(inv_dt) {
        return inv_dt * this.m_impulse.z;
      };
      WeldJoint2.prototype.initVelocityConstraints = function(step) {
        this.m_localCenterA = this.m_bodyA.m_sweep.localCenter;
        this.m_localCenterB = this.m_bodyB.m_sweep.localCenter;
        this.m_invMassA = this.m_bodyA.m_invMass;
        this.m_invMassB = this.m_bodyB.m_invMass;
        this.m_invIA = this.m_bodyA.m_invI;
        this.m_invIB = this.m_bodyB.m_invI;
        var aA = this.m_bodyA.c_position.a;
        var vA2 = this.m_bodyA.c_velocity.v;
        var wA = this.m_bodyA.c_velocity.w;
        var aB = this.m_bodyB.c_position.a;
        var vB2 = this.m_bodyB.c_velocity.v;
        var wB = this.m_bodyB.c_velocity.w;
        var qA = Rot.neo(aA);
        var qB = Rot.neo(aB);
        this.m_rA = Rot.mulVec2(qA, Vec2.sub(this.m_localAnchorA, this.m_localCenterA));
        this.m_rB = Rot.mulVec2(qB, Vec2.sub(this.m_localAnchorB, this.m_localCenterB));
        var mA = this.m_invMassA;
        var mB = this.m_invMassB;
        var iA = this.m_invIA;
        var iB = this.m_invIB;
        var K = new Mat33();
        K.ex.x = mA + mB + this.m_rA.y * this.m_rA.y * iA + this.m_rB.y * this.m_rB.y * iB;
        K.ey.x = -this.m_rA.y * this.m_rA.x * iA - this.m_rB.y * this.m_rB.x * iB;
        K.ez.x = -this.m_rA.y * iA - this.m_rB.y * iB;
        K.ex.y = K.ey.x;
        K.ey.y = mA + mB + this.m_rA.x * this.m_rA.x * iA + this.m_rB.x * this.m_rB.x * iB;
        K.ez.y = this.m_rA.x * iA + this.m_rB.x * iB;
        K.ex.z = K.ez.x;
        K.ey.z = K.ez.y;
        K.ez.z = iA + iB;
        if (this.m_frequencyHz > 0) {
          K.getInverse22(this.m_mass);
          var invM = iA + iB;
          var m = invM > 0 ? 1 / invM : 0;
          var C = aB - aA - this.m_referenceAngle;
          var omega = 2 * math_PI$1 * this.m_frequencyHz;
          var d2 = 2 * m * this.m_dampingRatio * omega;
          var k = m * omega * omega;
          var h = step.dt;
          this.m_gamma = h * (d2 + h * k);
          this.m_gamma = this.m_gamma != 0 ? 1 / this.m_gamma : 0;
          this.m_bias = C * h * k * this.m_gamma;
          invM += this.m_gamma;
          this.m_mass.ez.z = invM != 0 ? 1 / invM : 0;
        } else if (K.ez.z == 0) {
          K.getInverse22(this.m_mass);
          this.m_gamma = 0;
          this.m_bias = 0;
        } else {
          K.getSymInverse33(this.m_mass);
          this.m_gamma = 0;
          this.m_bias = 0;
        }
        if (step.warmStarting) {
          this.m_impulse.mul(step.dtRatio);
          var P3 = Vec2.neo(this.m_impulse.x, this.m_impulse.y);
          vA2.subMul(mA, P3);
          wA -= iA * (Vec2.crossVec2Vec2(this.m_rA, P3) + this.m_impulse.z);
          vB2.addMul(mB, P3);
          wB += iB * (Vec2.crossVec2Vec2(this.m_rB, P3) + this.m_impulse.z);
        } else {
          this.m_impulse.setZero();
        }
        this.m_bodyA.c_velocity.v = vA2;
        this.m_bodyA.c_velocity.w = wA;
        this.m_bodyB.c_velocity.v = vB2;
        this.m_bodyB.c_velocity.w = wB;
      };
      WeldJoint2.prototype.solveVelocityConstraints = function(step) {
        var vA2 = this.m_bodyA.c_velocity.v;
        var wA = this.m_bodyA.c_velocity.w;
        var vB2 = this.m_bodyB.c_velocity.v;
        var wB = this.m_bodyB.c_velocity.w;
        var mA = this.m_invMassA;
        var mB = this.m_invMassB;
        var iA = this.m_invIA;
        var iB = this.m_invIB;
        if (this.m_frequencyHz > 0) {
          var Cdot2 = wB - wA;
          var impulse2 = -this.m_mass.ez.z * (Cdot2 + this.m_bias + this.m_gamma * this.m_impulse.z);
          this.m_impulse.z += impulse2;
          wA -= iA * impulse2;
          wB += iB * impulse2;
          var Cdot1 = Vec2.zero();
          Cdot1.addCombine(1, vB2, 1, Vec2.crossNumVec2(wB, this.m_rB));
          Cdot1.subCombine(1, vA2, 1, Vec2.crossNumVec2(wA, this.m_rA));
          var impulse1 = Vec2.neg(Mat33.mulVec2(this.m_mass, Cdot1));
          this.m_impulse.x += impulse1.x;
          this.m_impulse.y += impulse1.y;
          var P3 = Vec2.clone(impulse1);
          vA2.subMul(mA, P3);
          wA -= iA * Vec2.crossVec2Vec2(this.m_rA, P3);
          vB2.addMul(mB, P3);
          wB += iB * Vec2.crossVec2Vec2(this.m_rB, P3);
        } else {
          var Cdot1 = Vec2.zero();
          Cdot1.addCombine(1, vB2, 1, Vec2.crossNumVec2(wB, this.m_rB));
          Cdot1.subCombine(1, vA2, 1, Vec2.crossNumVec2(wA, this.m_rA));
          var Cdot2 = wB - wA;
          var Cdot = new Vec3(Cdot1.x, Cdot1.y, Cdot2);
          var impulse = Vec3.neg(Mat33.mulVec3(this.m_mass, Cdot));
          this.m_impulse.add(impulse);
          var P3 = Vec2.neo(impulse.x, impulse.y);
          vA2.subMul(mA, P3);
          wA -= iA * (Vec2.crossVec2Vec2(this.m_rA, P3) + impulse.z);
          vB2.addMul(mB, P3);
          wB += iB * (Vec2.crossVec2Vec2(this.m_rB, P3) + impulse.z);
        }
        this.m_bodyA.c_velocity.v = vA2;
        this.m_bodyA.c_velocity.w = wA;
        this.m_bodyB.c_velocity.v = vB2;
        this.m_bodyB.c_velocity.w = wB;
      };
      WeldJoint2.prototype.solvePositionConstraints = function(step) {
        var cA2 = this.m_bodyA.c_position.c;
        var aA = this.m_bodyA.c_position.a;
        var cB2 = this.m_bodyB.c_position.c;
        var aB = this.m_bodyB.c_position.a;
        var qA = Rot.neo(aA);
        var qB = Rot.neo(aB);
        var mA = this.m_invMassA;
        var mB = this.m_invMassB;
        var iA = this.m_invIA;
        var iB = this.m_invIB;
        var rA2 = Rot.mulVec2(qA, Vec2.sub(this.m_localAnchorA, this.m_localCenterA));
        var rB2 = Rot.mulVec2(qB, Vec2.sub(this.m_localAnchorB, this.m_localCenterB));
        var positionError;
        var angularError;
        var K = new Mat33();
        K.ex.x = mA + mB + rA2.y * rA2.y * iA + rB2.y * rB2.y * iB;
        K.ey.x = -rA2.y * rA2.x * iA - rB2.y * rB2.x * iB;
        K.ez.x = -rA2.y * iA - rB2.y * iB;
        K.ex.y = K.ey.x;
        K.ey.y = mA + mB + rA2.x * rA2.x * iA + rB2.x * rB2.x * iB;
        K.ez.y = rA2.x * iA + rB2.x * iB;
        K.ex.z = K.ez.x;
        K.ey.z = K.ez.y;
        K.ez.z = iA + iB;
        if (this.m_frequencyHz > 0) {
          var C1 = Vec2.zero();
          C1.addCombine(1, cB2, 1, rB2);
          C1.subCombine(1, cA2, 1, rA2);
          positionError = C1.length();
          angularError = 0;
          var P3 = Vec2.neg(K.solve22(C1));
          cA2.subMul(mA, P3);
          aA -= iA * Vec2.crossVec2Vec2(rA2, P3);
          cB2.addMul(mB, P3);
          aB += iB * Vec2.crossVec2Vec2(rB2, P3);
        } else {
          var C1 = Vec2.zero();
          C1.addCombine(1, cB2, 1, rB2);
          C1.subCombine(1, cA2, 1, rA2);
          var C2 = aB - aA - this.m_referenceAngle;
          positionError = C1.length();
          angularError = math_abs$1(C2);
          var C = new Vec3(C1.x, C1.y, C2);
          var impulse = new Vec3();
          if (K.ez.z > 0) {
            impulse = Vec3.neg(K.solve33(C));
          } else {
            var impulse2 = Vec2.neg(K.solve22(C1));
            impulse.set(impulse2.x, impulse2.y, 0);
          }
          var P3 = Vec2.neo(impulse.x, impulse.y);
          cA2.subMul(mA, P3);
          aA -= iA * (Vec2.crossVec2Vec2(rA2, P3) + impulse.z);
          cB2.addMul(mB, P3);
          aB += iB * (Vec2.crossVec2Vec2(rB2, P3) + impulse.z);
        }
        this.m_bodyA.c_position.c = cA2;
        this.m_bodyA.c_position.a = aA;
        this.m_bodyB.c_position.c = cB2;
        this.m_bodyB.c_position.a = aB;
        return positionError <= SettingsInternal.linearSlop && angularError <= SettingsInternal.angularSlop;
      };
      WeldJoint2.TYPE = "weld-joint";
      return WeldJoint2;
    })(Joint);
    var math_abs = Math.abs;
    var math_PI = Math.PI;
    var DEFAULTS = { enableMotor: false, maxMotorTorque: 0, motorSpeed: 0, frequencyHz: 2, dampingRatio: 0.7 };
    var WheelJoint = (function(_super) {
      __extends(WheelJoint2, _super);
      function WheelJoint2(def, bodyA, bodyB, anchor, axis) {
        var _this = this;
        if (!(_this instanceof WheelJoint2)) {
          return new WheelJoint2(def, bodyA, bodyB, anchor, axis);
        }
        def = options(def, DEFAULTS);
        _this = _super.call(this, def, bodyA, bodyB) || this;
        bodyA = _this.m_bodyA;
        bodyB = _this.m_bodyB;
        _this.m_ax = Vec2.zero();
        _this.m_ay = Vec2.zero();
        _this.m_type = WheelJoint2.TYPE;
        _this.m_localAnchorA = Vec2.clone(anchor ? bodyA.getLocalPoint(anchor) : def.localAnchorA || Vec2.zero());
        _this.m_localAnchorB = Vec2.clone(anchor ? bodyB.getLocalPoint(anchor) : def.localAnchorB || Vec2.zero());
        if (Vec2.isValid(axis)) {
          _this.m_localXAxisA = bodyA.getLocalVector(axis);
        } else if (Vec2.isValid(def.localAxisA)) {
          _this.m_localXAxisA = Vec2.clone(def.localAxisA);
        } else if (Vec2.isValid(def.localAxis)) {
          _this.m_localXAxisA = Vec2.clone(def.localAxis);
        } else {
          _this.m_localXAxisA = Vec2.neo(1, 0);
        }
        _this.m_localYAxisA = Vec2.crossNumVec2(1, _this.m_localXAxisA);
        _this.m_mass = 0;
        _this.m_impulse = 0;
        _this.m_motorMass = 0;
        _this.m_motorImpulse = 0;
        _this.m_springMass = 0;
        _this.m_springImpulse = 0;
        _this.m_maxMotorTorque = def.maxMotorTorque;
        _this.m_motorSpeed = def.motorSpeed;
        _this.m_enableMotor = def.enableMotor;
        _this.m_frequencyHz = def.frequencyHz;
        _this.m_dampingRatio = def.dampingRatio;
        _this.m_bias = 0;
        _this.m_gamma = 0;
        return _this;
      }
      WheelJoint2.prototype._serialize = function() {
        return { type: this.m_type, bodyA: this.m_bodyA, bodyB: this.m_bodyB, collideConnected: this.m_collideConnected, enableMotor: this.m_enableMotor, maxMotorTorque: this.m_maxMotorTorque, motorSpeed: this.m_motorSpeed, frequencyHz: this.m_frequencyHz, dampingRatio: this.m_dampingRatio, localAnchorA: this.m_localAnchorA, localAnchorB: this.m_localAnchorB, localAxisA: this.m_localXAxisA };
      };
      WheelJoint2._deserialize = function(data, world, restore) {
        data = __assign({}, data);
        data.bodyA = restore(Body, data.bodyA, world);
        data.bodyB = restore(Body, data.bodyB, world);
        var joint = new WheelJoint2(data);
        return joint;
      };
      WheelJoint2.prototype._reset = function(def) {
        if (def.anchorA) {
          this.m_localAnchorA.setVec2(this.m_bodyA.getLocalPoint(def.anchorA));
        } else if (def.localAnchorA) {
          this.m_localAnchorA.setVec2(def.localAnchorA);
        }
        if (def.anchorB) {
          this.m_localAnchorB.setVec2(this.m_bodyB.getLocalPoint(def.anchorB));
        } else if (def.localAnchorB) {
          this.m_localAnchorB.setVec2(def.localAnchorB);
        }
        if (def.localAxisA) {
          this.m_localXAxisA.setVec2(def.localAxisA);
          this.m_localYAxisA.setVec2(Vec2.crossNumVec2(1, def.localAxisA));
        }
        if (def.enableMotor !== void 0) {
          this.m_enableMotor = def.enableMotor;
        }
        if (Number.isFinite(def.maxMotorTorque)) {
          this.m_maxMotorTorque = def.maxMotorTorque;
        }
        if (Number.isFinite(def.motorSpeed)) {
          this.m_motorSpeed = def.motorSpeed;
        }
        if (Number.isFinite(def.frequencyHz)) {
          this.m_frequencyHz = def.frequencyHz;
        }
        if (Number.isFinite(def.dampingRatio)) {
          this.m_dampingRatio = def.dampingRatio;
        }
      };
      WheelJoint2.prototype.getLocalAnchorA = function() {
        return this.m_localAnchorA;
      };
      WheelJoint2.prototype.getLocalAnchorB = function() {
        return this.m_localAnchorB;
      };
      WheelJoint2.prototype.getLocalAxisA = function() {
        return this.m_localXAxisA;
      };
      WheelJoint2.prototype.getJointTranslation = function() {
        var bA = this.m_bodyA;
        var bB = this.m_bodyB;
        var pA2 = bA.getWorldPoint(this.m_localAnchorA);
        var pB2 = bB.getWorldPoint(this.m_localAnchorB);
        var d2 = Vec2.sub(pB2, pA2);
        var axis = bA.getWorldVector(this.m_localXAxisA);
        var translation2 = Vec2.dot(d2, axis);
        return translation2;
      };
      WheelJoint2.prototype.getJointSpeed = function() {
        var wA = this.m_bodyA.m_angularVelocity;
        var wB = this.m_bodyB.m_angularVelocity;
        return wB - wA;
      };
      WheelJoint2.prototype.isMotorEnabled = function() {
        return this.m_enableMotor;
      };
      WheelJoint2.prototype.enableMotor = function(flag) {
        if (flag == this.m_enableMotor) return;
        this.m_bodyA.setAwake(true);
        this.m_bodyB.setAwake(true);
        this.m_enableMotor = flag;
      };
      WheelJoint2.prototype.setMotorSpeed = function(speed) {
        if (speed == this.m_motorSpeed) return;
        this.m_bodyA.setAwake(true);
        this.m_bodyB.setAwake(true);
        this.m_motorSpeed = speed;
      };
      WheelJoint2.prototype.getMotorSpeed = function() {
        return this.m_motorSpeed;
      };
      WheelJoint2.prototype.setMaxMotorTorque = function(torque) {
        if (torque == this.m_maxMotorTorque) return;
        this.m_bodyA.setAwake(true);
        this.m_bodyB.setAwake(true);
        this.m_maxMotorTorque = torque;
      };
      WheelJoint2.prototype.getMaxMotorTorque = function() {
        return this.m_maxMotorTorque;
      };
      WheelJoint2.prototype.getMotorTorque = function(inv_dt) {
        return inv_dt * this.m_motorImpulse;
      };
      WheelJoint2.prototype.setSpringFrequencyHz = function(hz) {
        this.m_frequencyHz = hz;
      };
      WheelJoint2.prototype.getSpringFrequencyHz = function() {
        return this.m_frequencyHz;
      };
      WheelJoint2.prototype.setSpringDampingRatio = function(ratio) {
        this.m_dampingRatio = ratio;
      };
      WheelJoint2.prototype.getSpringDampingRatio = function() {
        return this.m_dampingRatio;
      };
      WheelJoint2.prototype.getAnchorA = function() {
        return this.m_bodyA.getWorldPoint(this.m_localAnchorA);
      };
      WheelJoint2.prototype.getAnchorB = function() {
        return this.m_bodyB.getWorldPoint(this.m_localAnchorB);
      };
      WheelJoint2.prototype.getReactionForce = function(inv_dt) {
        return Vec2.combine(this.m_impulse, this.m_ay, this.m_springImpulse, this.m_ax).mul(inv_dt);
      };
      WheelJoint2.prototype.getReactionTorque = function(inv_dt) {
        return inv_dt * this.m_motorImpulse;
      };
      WheelJoint2.prototype.initVelocityConstraints = function(step) {
        this.m_localCenterA = this.m_bodyA.m_sweep.localCenter;
        this.m_localCenterB = this.m_bodyB.m_sweep.localCenter;
        this.m_invMassA = this.m_bodyA.m_invMass;
        this.m_invMassB = this.m_bodyB.m_invMass;
        this.m_invIA = this.m_bodyA.m_invI;
        this.m_invIB = this.m_bodyB.m_invI;
        var mA = this.m_invMassA;
        var mB = this.m_invMassB;
        var iA = this.m_invIA;
        var iB = this.m_invIB;
        var cA2 = this.m_bodyA.c_position.c;
        var aA = this.m_bodyA.c_position.a;
        var vA2 = this.m_bodyA.c_velocity.v;
        var wA = this.m_bodyA.c_velocity.w;
        var cB2 = this.m_bodyB.c_position.c;
        var aB = this.m_bodyB.c_position.a;
        var vB2 = this.m_bodyB.c_velocity.v;
        var wB = this.m_bodyB.c_velocity.w;
        var qA = Rot.neo(aA);
        var qB = Rot.neo(aB);
        var rA2 = Rot.mulVec2(qA, Vec2.sub(this.m_localAnchorA, this.m_localCenterA));
        var rB2 = Rot.mulVec2(qB, Vec2.sub(this.m_localAnchorB, this.m_localCenterB));
        var d2 = Vec2.zero();
        d2.addCombine(1, cB2, 1, rB2);
        d2.subCombine(1, cA2, 1, rA2);
        {
          this.m_ay = Rot.mulVec2(qA, this.m_localYAxisA);
          this.m_sAy = Vec2.crossVec2Vec2(Vec2.add(d2, rA2), this.m_ay);
          this.m_sBy = Vec2.crossVec2Vec2(rB2, this.m_ay);
          this.m_mass = mA + mB + iA * this.m_sAy * this.m_sAy + iB * this.m_sBy * this.m_sBy;
          if (this.m_mass > 0) {
            this.m_mass = 1 / this.m_mass;
          }
        }
        this.m_springMass = 0;
        this.m_bias = 0;
        this.m_gamma = 0;
        if (this.m_frequencyHz > 0) {
          this.m_ax = Rot.mulVec2(qA, this.m_localXAxisA);
          this.m_sAx = Vec2.crossVec2Vec2(Vec2.add(d2, rA2), this.m_ax);
          this.m_sBx = Vec2.crossVec2Vec2(rB2, this.m_ax);
          var invMass = mA + mB + iA * this.m_sAx * this.m_sAx + iB * this.m_sBx * this.m_sBx;
          if (invMass > 0) {
            this.m_springMass = 1 / invMass;
            var C = Vec2.dot(d2, this.m_ax);
            var omega = 2 * math_PI * this.m_frequencyHz;
            var damp = 2 * this.m_springMass * this.m_dampingRatio * omega;
            var k = this.m_springMass * omega * omega;
            var h = step.dt;
            this.m_gamma = h * (damp + h * k);
            if (this.m_gamma > 0) {
              this.m_gamma = 1 / this.m_gamma;
            }
            this.m_bias = C * h * k * this.m_gamma;
            this.m_springMass = invMass + this.m_gamma;
            if (this.m_springMass > 0) {
              this.m_springMass = 1 / this.m_springMass;
            }
          }
        } else {
          this.m_springImpulse = 0;
        }
        if (this.m_enableMotor) {
          this.m_motorMass = iA + iB;
          if (this.m_motorMass > 0) {
            this.m_motorMass = 1 / this.m_motorMass;
          }
        } else {
          this.m_motorMass = 0;
          this.m_motorImpulse = 0;
        }
        if (step.warmStarting) {
          this.m_impulse *= step.dtRatio;
          this.m_springImpulse *= step.dtRatio;
          this.m_motorImpulse *= step.dtRatio;
          var P3 = Vec2.combine(this.m_impulse, this.m_ay, this.m_springImpulse, this.m_ax);
          var LA = this.m_impulse * this.m_sAy + this.m_springImpulse * this.m_sAx + this.m_motorImpulse;
          var LB = this.m_impulse * this.m_sBy + this.m_springImpulse * this.m_sBx + this.m_motorImpulse;
          vA2.subMul(this.m_invMassA, P3);
          wA -= this.m_invIA * LA;
          vB2.addMul(this.m_invMassB, P3);
          wB += this.m_invIB * LB;
        } else {
          this.m_impulse = 0;
          this.m_springImpulse = 0;
          this.m_motorImpulse = 0;
        }
        this.m_bodyA.c_velocity.v.setVec2(vA2);
        this.m_bodyA.c_velocity.w = wA;
        this.m_bodyB.c_velocity.v.setVec2(vB2);
        this.m_bodyB.c_velocity.w = wB;
      };
      WheelJoint2.prototype.solveVelocityConstraints = function(step) {
        var mA = this.m_invMassA;
        var mB = this.m_invMassB;
        var iA = this.m_invIA;
        var iB = this.m_invIB;
        var vA2 = this.m_bodyA.c_velocity.v;
        var wA = this.m_bodyA.c_velocity.w;
        var vB2 = this.m_bodyB.c_velocity.v;
        var wB = this.m_bodyB.c_velocity.w;
        {
          var Cdot = Vec2.dot(this.m_ax, vB2) - Vec2.dot(this.m_ax, vA2) + this.m_sBx * wB - this.m_sAx * wA;
          var impulse = -this.m_springMass * (Cdot + this.m_bias + this.m_gamma * this.m_springImpulse);
          this.m_springImpulse += impulse;
          var P3 = Vec2.mulNumVec2(impulse, this.m_ax);
          var LA = impulse * this.m_sAx;
          var LB = impulse * this.m_sBx;
          vA2.subMul(mA, P3);
          wA -= iA * LA;
          vB2.addMul(mB, P3);
          wB += iB * LB;
        }
        {
          var Cdot = wB - wA - this.m_motorSpeed;
          var impulse = -this.m_motorMass * Cdot;
          var oldImpulse = this.m_motorImpulse;
          var maxImpulse = step.dt * this.m_maxMotorTorque;
          this.m_motorImpulse = clamp(this.m_motorImpulse + impulse, -maxImpulse, maxImpulse);
          impulse = this.m_motorImpulse - oldImpulse;
          wA -= iA * impulse;
          wB += iB * impulse;
        }
        {
          var Cdot = Vec2.dot(this.m_ay, vB2) - Vec2.dot(this.m_ay, vA2) + this.m_sBy * wB - this.m_sAy * wA;
          var impulse = -this.m_mass * Cdot;
          this.m_impulse += impulse;
          var P3 = Vec2.mulNumVec2(impulse, this.m_ay);
          var LA = impulse * this.m_sAy;
          var LB = impulse * this.m_sBy;
          vA2.subMul(mA, P3);
          wA -= iA * LA;
          vB2.addMul(mB, P3);
          wB += iB * LB;
        }
        this.m_bodyA.c_velocity.v.setVec2(vA2);
        this.m_bodyA.c_velocity.w = wA;
        this.m_bodyB.c_velocity.v.setVec2(vB2);
        this.m_bodyB.c_velocity.w = wB;
      };
      WheelJoint2.prototype.solvePositionConstraints = function(step) {
        var cA2 = this.m_bodyA.c_position.c;
        var aA = this.m_bodyA.c_position.a;
        var cB2 = this.m_bodyB.c_position.c;
        var aB = this.m_bodyB.c_position.a;
        var qA = Rot.neo(aA);
        var qB = Rot.neo(aB);
        var rA2 = Rot.mulVec2(qA, Vec2.sub(this.m_localAnchorA, this.m_localCenterA));
        var rB2 = Rot.mulVec2(qB, Vec2.sub(this.m_localAnchorB, this.m_localCenterB));
        var d2 = Vec2.zero();
        d2.addCombine(1, cB2, 1, rB2);
        d2.subCombine(1, cA2, 1, rA2);
        var ay = Rot.mulVec2(qA, this.m_localYAxisA);
        var sAy = Vec2.crossVec2Vec2(Vec2.add(d2, rA2), ay);
        var sBy = Vec2.crossVec2Vec2(rB2, ay);
        var C = Vec2.dot(d2, ay);
        var k = this.m_invMassA + this.m_invMassB + this.m_invIA * this.m_sAy * this.m_sAy + this.m_invIB * this.m_sBy * this.m_sBy;
        var impulse = k != 0 ? -C / k : 0;
        var P3 = Vec2.mulNumVec2(impulse, ay);
        var LA = impulse * sAy;
        var LB = impulse * sBy;
        cA2.subMul(this.m_invMassA, P3);
        aA -= this.m_invIA * LA;
        cB2.addMul(this.m_invMassB, P3);
        aB += this.m_invIB * LB;
        this.m_bodyA.c_position.c.setVec2(cA2);
        this.m_bodyA.c_position.a = aA;
        this.m_bodyB.c_position.c.setVec2(cB2);
        this.m_bodyB.c_position.a = aB;
        return math_abs(C) <= SettingsInternal.linearSlop;
      };
      WheelJoint2.TYPE = "wheel-joint";
      return WheelJoint2;
    })(Joint);
    var _a;
    var SID = 0;
    var SERIALIZE_REF_TYPES = { World, Body, Joint, Fixture, Shape };
    var DESERIALIZE_BY_REF_TYPE = { Vec2, Vec3, World, Body, Joint, Fixture, Shape };
    var DESERIALIZE_BY_TYPE_FIELD = (_a = {}, _a[Body.STATIC] = Body, _a[Body.DYNAMIC] = Body, _a[Body.KINEMATIC] = Body, _a[ChainShape.TYPE] = ChainShape, _a[PolygonShape.TYPE] = PolygonShape, _a[EdgeShape.TYPE] = EdgeShape, _a[CircleShape.TYPE] = CircleShape, _a[DistanceJoint.TYPE] = DistanceJoint, _a[FrictionJoint.TYPE] = FrictionJoint, _a[GearJoint.TYPE] = GearJoint, _a[MotorJoint.TYPE] = MotorJoint, _a[MouseJoint.TYPE] = MouseJoint, _a[PrismaticJoint.TYPE] = PrismaticJoint, _a[PulleyJoint.TYPE] = PulleyJoint, _a[RevoluteJoint.TYPE] = RevoluteJoint, _a[RopeJoint.TYPE] = RopeJoint, _a[WeldJoint.TYPE] = WeldJoint, _a[WheelJoint.TYPE] = WheelJoint, _a);
    var DEFAULT_OPTIONS = { rootClass: World, preSerialize: function(obj) {
      return obj;
    }, postSerialize: function(data, obj) {
      return data;
    }, preDeserialize: function(data) {
      return data;
    }, postDeserialize: function(obj, data) {
      return obj;
    } };
    var Serializer = /* @__PURE__ */ (function() {
      function Serializer2(options2) {
        var _this = this;
        this.toJson = function(root) {
          var preSerialize = _this.options.preSerialize;
          var postSerialize = _this.options.postSerialize;
          var json = [];
          var refQueue = [root];
          var refMemoById = {};
          function addToRefQueue(value, typeName) {
            value.__sid = value.__sid || ++SID;
            if (!refMemoById[value.__sid]) {
              refQueue.push(value);
              var index = json.length + refQueue.length;
              var ref = { refIndex: index, refType: typeName };
              refMemoById[value.__sid] = ref;
            }
            return refMemoById[value.__sid];
          }
          function serializeWithHooks(obj2) {
            obj2 = preSerialize(obj2);
            var data = obj2._serialize();
            data = postSerialize(data, obj2);
            return data;
          }
          function traverse(value, noRefType) {
            if (noRefType === void 0) {
              noRefType = false;
            }
            if (typeof value !== "object" || value === null) {
              return value;
            }
            if (typeof value._serialize === "function") {
              if (!noRefType) {
                for (var typeName in SERIALIZE_REF_TYPES) {
                  if (value instanceof SERIALIZE_REF_TYPES[typeName]) {
                    return addToRefQueue(value, typeName);
                  }
                }
              }
              value = serializeWithHooks(value);
            }
            if (Array.isArray(value)) {
              var newValue = [];
              for (var key = 0; key < value.length; key++) {
                newValue[key] = traverse(value[key]);
              }
              value = newValue;
            } else {
              var newValue = {};
              for (var key in value) {
                if (value.hasOwnProperty(key)) {
                  newValue[key] = traverse(value[key]);
                }
              }
              value = newValue;
            }
            return value;
          }
          while (refQueue.length) {
            var obj = refQueue.shift();
            var str = traverse(obj, true);
            json.push(str);
          }
          return json;
        };
        this.fromJson = function(json) {
          var preDeserialize = _this.options.preDeserialize;
          var postDeserialize = _this.options.postDeserialize;
          var rootClass = _this.options.rootClass;
          var deserializedRefMemoByIndex = {};
          function deserializeWithHooks(classHint, data, context) {
            if (!classHint || !classHint._deserialize) {
              classHint = DESERIALIZE_BY_TYPE_FIELD[data.type];
            }
            var deserializer = classHint && classHint._deserialize;
            if (!deserializer) {
              return;
            }
            data = preDeserialize(data);
            var classDeserializeFn = classHint._deserialize;
            var obj = classDeserializeFn(data, context, deserializeChild);
            obj = postDeserialize(obj, data);
            return obj;
          }
          function deserializeChild(classHint, dataOrRef, context) {
            var isRefObject = dataOrRef.refIndex && dataOrRef.refType;
            if (!isRefObject) {
              return deserializeWithHooks(classHint, dataOrRef, context);
            }
            var ref = dataOrRef;
            if (DESERIALIZE_BY_REF_TYPE[ref.refType]) {
              classHint = DESERIALIZE_BY_REF_TYPE[ref.refType];
            }
            var refIndex = ref.refIndex;
            if (!deserializedRefMemoByIndex[refIndex]) {
              var data = json[refIndex];
              var obj = deserializeWithHooks(classHint, data, context);
              deserializedRefMemoByIndex[refIndex] = obj;
            }
            return deserializedRefMemoByIndex[refIndex];
          }
          var root = deserializeWithHooks(rootClass, json[0], null);
          return root;
        };
        this.options = __assign(__assign({}, DEFAULT_OPTIONS), options2);
      }
      return Serializer2;
    })();
    var worldSerializer = new Serializer({ rootClass: World });
    Serializer.fromJson = worldSerializer.fromJson;
    Serializer.toJson = worldSerializer.toJson;
    var Testbed = (function() {
      function Testbed2() {
      }
      Testbed2.mount = function(options2) {
        throw new Error("Not implemented");
      };
      Testbed2.start = function(world) {
        var testbed2 = Testbed2.mount();
        testbed2.start(world);
        return testbed2;
      };
      return Testbed2;
    })();
    function testbed(a2, b2) {
      var callback;
      var options2;
      if (typeof a2 === "function") {
        callback = a2;
        options2 = b2;
      } else if (typeof b2 === "function") {
        callback = b2;
        options2 = a2;
      } else {
        options2 = a2 !== null && a2 !== void 0 ? a2 : b2;
      }
      var testbed2 = Testbed.mount(options2);
      if (callback) {
        var world = callback(testbed2) || testbed2.world;
        testbed2.start(world);
      } else {
        return testbed2;
      }
    }
    var BoxShape = (function(_super) {
      __extends(BoxShape2, _super);
      function BoxShape2(halfWidth, halfHeight, center2, angle) {
        var _this = this;
        if (!(_this instanceof BoxShape2)) {
          return new BoxShape2(halfWidth, halfHeight, center2, angle);
        }
        _this = _super.call(this) || this;
        _this._setAsBox(halfWidth, halfHeight, center2, angle);
        return _this;
      }
      BoxShape2.TYPE = "polygon";
      return BoxShape2;
    })(PolygonShape);
    Contact.addType(CircleShape.TYPE, CircleShape.TYPE, CircleCircleContact);
    function CircleCircleContact(manifold, xfA2, fixtureA, indexA, xfB2, fixtureB, indexB) {
      CollideCircles(manifold, fixtureA.getShape(), xfA2, fixtureB.getShape(), xfB2);
    }
    var pA = vec2(0, 0);
    var pB = vec2(0, 0);
    var CollideCircles = function(manifold, circleA, xfA2, circleB, xfB2) {
      manifold.pointCount = 0;
      transformVec2(pA, xfA2, circleA.m_p);
      transformVec2(pB, xfB2, circleB.m_p);
      var distSqr = distSqrVec2(pB, pA);
      var rA2 = circleA.m_radius;
      var rB2 = circleB.m_radius;
      var radius = rA2 + rB2;
      if (distSqr > radius * radius) {
        return;
      }
      manifold.type = exports2.ManifoldType.e_circles;
      copyVec2(manifold.localPoint, circleA.m_p);
      zeroVec2(manifold.localNormal);
      manifold.pointCount = 1;
      copyVec2(manifold.points[0].localPoint, circleB.m_p);
      manifold.points[0].id.setFeatures(0, exports2.ContactFeatureType.e_vertex, 0, exports2.ContactFeatureType.e_vertex);
    };
    Contact.addType(EdgeShape.TYPE, CircleShape.TYPE, EdgeCircleContact);
    Contact.addType(ChainShape.TYPE, CircleShape.TYPE, ChainCircleContact);
    function EdgeCircleContact(manifold, xfA2, fixtureA, indexA, xfB2, fixtureB, indexB) {
      var shapeA = fixtureA.getShape();
      var shapeB = fixtureB.getShape();
      CollideEdgeCircle(manifold, shapeA, xfA2, shapeB, xfB2);
    }
    function ChainCircleContact(manifold, xfA2, fixtureA, indexA, xfB2, fixtureB, indexB) {
      var chain = fixtureA.getShape();
      var edge = new EdgeShape();
      chain.getChildEdge(edge, indexA);
      var shapeA = edge;
      var shapeB = fixtureB.getShape();
      CollideEdgeCircle(manifold, shapeA, xfA2, shapeB, xfB2);
    }
    var e = vec2(0, 0);
    var e1 = vec2(0, 0);
    var e2 = vec2(0, 0);
    var Q = vec2(0, 0);
    var P = vec2(0, 0);
    var n$2 = vec2(0, 0);
    var CollideEdgeCircle = function(manifold, edgeA, xfA2, circleB, xfB2) {
      manifold.pointCount = 0;
      retransformVec2(Q, xfB2, xfA2, circleB.m_p);
      var A = edgeA.m_vertex1;
      var B = edgeA.m_vertex2;
      subVec2(e, B, A);
      var u = dotVec2(e, B) - dotVec2(e, Q);
      var v3 = dotVec2(e, Q) - dotVec2(e, A);
      var radius = edgeA.m_radius + circleB.m_radius;
      if (v3 <= 0) {
        copyVec2(P, A);
        var dd_1 = distSqrVec2(Q, A);
        if (dd_1 > radius * radius) {
          return;
        }
        if (edgeA.m_hasVertex0) {
          var A1 = edgeA.m_vertex0;
          var B1 = A;
          subVec2(e1, B1, A1);
          var u1 = dotVec2(e1, B1) - dotVec2(e1, Q);
          if (u1 > 0) {
            return;
          }
        }
        manifold.type = exports2.ManifoldType.e_circles;
        zeroVec2(manifold.localNormal);
        copyVec2(manifold.localPoint, P);
        manifold.pointCount = 1;
        copyVec2(manifold.points[0].localPoint, circleB.m_p);
        manifold.points[0].id.setFeatures(0, exports2.ContactFeatureType.e_vertex, 0, exports2.ContactFeatureType.e_vertex);
        return;
      }
      if (u <= 0) {
        copyVec2(P, B);
        var dd_2 = distSqrVec2(Q, P);
        if (dd_2 > radius * radius) {
          return;
        }
        if (edgeA.m_hasVertex3) {
          var B2 = edgeA.m_vertex3;
          var A2 = B;
          subVec2(e2, B2, A2);
          var v22 = dotVec2(e2, Q) - dotVec2(e2, A2);
          if (v22 > 0) {
            return;
          }
        }
        manifold.type = exports2.ManifoldType.e_circles;
        zeroVec2(manifold.localNormal);
        copyVec2(manifold.localPoint, P);
        manifold.pointCount = 1;
        copyVec2(manifold.points[0].localPoint, circleB.m_p);
        manifold.points[0].id.setFeatures(1, exports2.ContactFeatureType.e_vertex, 0, exports2.ContactFeatureType.e_vertex);
        return;
      }
      var den = lengthSqrVec2(e);
      combine2Vec2(P, u / den, A, v3 / den, B);
      var dd = distSqrVec2(Q, P);
      if (dd > radius * radius) {
        return;
      }
      crossNumVec2(n$2, 1, e);
      if (dotVec2(n$2, Q) - dotVec2(n$2, A) < 0) {
        negVec2(n$2);
      }
      normalizeVec2(n$2);
      manifold.type = exports2.ManifoldType.e_faceA;
      copyVec2(manifold.localNormal, n$2);
      copyVec2(manifold.localPoint, A);
      manifold.pointCount = 1;
      copyVec2(manifold.points[0].localPoint, circleB.m_p);
      manifold.points[0].id.setFeatures(0, exports2.ContactFeatureType.e_face, 0, exports2.ContactFeatureType.e_vertex);
    };
    var incidentEdge = [new ClipVertex(), new ClipVertex()];
    var clipPoints1$1 = [new ClipVertex(), new ClipVertex()];
    var clipPoints2$1 = [new ClipVertex(), new ClipVertex()];
    var clipSegmentToLineNormal = vec2(0, 0);
    var v1 = vec2(0, 0);
    var n$1 = vec2(0, 0);
    var xf$1 = transform(0, 0, 0);
    var v11 = vec2(0, 0);
    var v12 = vec2(0, 0);
    var localTangent = vec2(0, 0);
    var localNormal = vec2(0, 0);
    var planePoint = vec2(0, 0);
    var tangent = vec2(0, 0);
    var normal$1 = vec2(0, 0);
    var normal1$1 = vec2(0, 0);
    Contact.addType(PolygonShape.TYPE, PolygonShape.TYPE, PolygonContact);
    function PolygonContact(manifold, xfA2, fixtureA, indexA, xfB2, fixtureB, indexB) {
      CollidePolygons(manifold, fixtureA.getShape(), xfA2, fixtureB.getShape(), xfB2);
    }
    function findMaxSeparation(poly1, xf1, poly2, xf2, output2) {
      var count1 = poly1.m_count;
      var count2 = poly2.m_count;
      var n1s = poly1.m_normals;
      var v1s = poly1.m_vertices;
      var v2s = poly2.m_vertices;
      detransformTransform(xf$1, xf2, xf1);
      var bestIndex = 0;
      var maxSeparation2 = -Infinity;
      for (var i = 0; i < count1; ++i) {
        rotVec2(n$1, xf$1.q, n1s[i]);
        transformVec2(v1, xf$1, v1s[i]);
        var si = Infinity;
        for (var j = 0; j < count2; ++j) {
          var sij = dotVec2(n$1, v2s[j]) - dotVec2(n$1, v1);
          if (sij < si) {
            si = sij;
          }
        }
        if (si > maxSeparation2) {
          maxSeparation2 = si;
          bestIndex = i;
        }
      }
      output2.maxSeparation = maxSeparation2;
      output2.bestIndex = bestIndex;
    }
    function findIncidentEdge(clipVertex, poly1, xf1, edge12, poly2, xf2) {
      var normals1 = poly1.m_normals;
      var count2 = poly2.m_count;
      var vertices2 = poly2.m_vertices;
      var normals2 = poly2.m_normals;
      rerotVec2(normal1$1, xf2.q, xf1.q, normals1[edge12]);
      var index = 0;
      var minDot = Infinity;
      for (var i = 0; i < count2; ++i) {
        var dot = dotVec2(normal1$1, normals2[i]);
        if (dot < minDot) {
          minDot = dot;
          index = i;
        }
      }
      var i1 = index;
      var i2 = i1 + 1 < count2 ? i1 + 1 : 0;
      transformVec2(clipVertex[0].v, xf2, vertices2[i1]);
      clipVertex[0].id.setFeatures(edge12, exports2.ContactFeatureType.e_face, i1, exports2.ContactFeatureType.e_vertex);
      transformVec2(clipVertex[1].v, xf2, vertices2[i2]);
      clipVertex[1].id.setFeatures(edge12, exports2.ContactFeatureType.e_face, i2, exports2.ContactFeatureType.e_vertex);
    }
    var maxSeparation = { maxSeparation: 0, bestIndex: 0 };
    var CollidePolygons = function(manifold, polyA, xfA2, polyB, xfB2) {
      manifold.pointCount = 0;
      var totalRadius = polyA.m_radius + polyB.m_radius;
      findMaxSeparation(polyA, xfA2, polyB, xfB2, maxSeparation);
      var edgeA = maxSeparation.bestIndex;
      var separationA = maxSeparation.maxSeparation;
      if (separationA > totalRadius) return;
      findMaxSeparation(polyB, xfB2, polyA, xfA2, maxSeparation);
      var edgeB = maxSeparation.bestIndex;
      var separationB = maxSeparation.maxSeparation;
      if (separationB > totalRadius) return;
      var poly1;
      var poly2;
      var xf1;
      var xf2;
      var edge12;
      var flip;
      var k_tol = 0.1 * SettingsInternal.linearSlop;
      if (separationB > separationA + k_tol) {
        poly1 = polyB;
        poly2 = polyA;
        xf1 = xfB2;
        xf2 = xfA2;
        edge12 = edgeB;
        manifold.type = exports2.ManifoldType.e_faceB;
        flip = true;
      } else {
        poly1 = polyA;
        poly2 = polyB;
        xf1 = xfA2;
        xf2 = xfB2;
        edge12 = edgeA;
        manifold.type = exports2.ManifoldType.e_faceA;
        flip = false;
      }
      incidentEdge[0].recycle();
      incidentEdge[1].recycle();
      findIncidentEdge(incidentEdge, poly1, xf1, edge12, poly2, xf2);
      var count1 = poly1.m_count;
      var vertices1 = poly1.m_vertices;
      var iv1 = edge12;
      var iv2 = edge12 + 1 < count1 ? edge12 + 1 : 0;
      copyVec2(v11, vertices1[iv1]);
      copyVec2(v12, vertices1[iv2]);
      subVec2(localTangent, v12, v11);
      normalizeVec2(localTangent);
      crossVec2Num(localNormal, localTangent, 1);
      combine2Vec2(planePoint, 0.5, v11, 0.5, v12);
      rotVec2(tangent, xf1.q, localTangent);
      crossVec2Num(normal$1, tangent, 1);
      transformVec2(v11, xf1, v11);
      transformVec2(v12, xf1, v12);
      var frontOffset = dotVec2(normal$1, v11);
      var sideOffset1 = -dotVec2(tangent, v11) + totalRadius;
      var sideOffset2 = dotVec2(tangent, v12) + totalRadius;
      clipPoints1$1[0].recycle();
      clipPoints1$1[1].recycle();
      clipPoints2$1[0].recycle();
      clipPoints2$1[1].recycle();
      setVec2(clipSegmentToLineNormal, -tangent.x, -tangent.y);
      var np1 = clipSegmentToLine(clipPoints1$1, incidentEdge, clipSegmentToLineNormal, sideOffset1, iv1);
      if (np1 < 2) {
        return;
      }
      setVec2(clipSegmentToLineNormal, tangent.x, tangent.y);
      var np2 = clipSegmentToLine(clipPoints2$1, clipPoints1$1, clipSegmentToLineNormal, sideOffset2, iv2);
      if (np2 < 2) {
        return;
      }
      copyVec2(manifold.localNormal, localNormal);
      copyVec2(manifold.localPoint, planePoint);
      var pointCount = 0;
      for (var i = 0; i < clipPoints2$1.length; ++i) {
        var separation = dotVec2(normal$1, clipPoints2$1[i].v) - frontOffset;
        if (separation <= totalRadius) {
          var cp = manifold.points[pointCount];
          detransformVec2(cp.localPoint, xf2, clipPoints2$1[i].v);
          cp.id.set(clipPoints2$1[i].id);
          if (flip) {
            cp.id.swapFeatures();
          }
          ++pointCount;
        }
      }
      manifold.pointCount = pointCount;
    };
    Contact.addType(PolygonShape.TYPE, CircleShape.TYPE, PolygonCircleContact);
    function PolygonCircleContact(manifold, xfA2, fixtureA, indexA, xfB2, fixtureB, indexB) {
      CollidePolygonCircle(manifold, fixtureA.getShape(), xfA2, fixtureB.getShape(), xfB2);
    }
    var cLocal = vec2(0, 0);
    var faceCenter = vec2(0, 0);
    var CollidePolygonCircle = function(manifold, polygonA, xfA2, circleB, xfB2) {
      manifold.pointCount = 0;
      retransformVec2(cLocal, xfB2, xfA2, circleB.m_p);
      var normalIndex = 0;
      var separation = -Infinity;
      var radius = polygonA.m_radius + circleB.m_radius;
      var vertexCount = polygonA.m_count;
      var vertices = polygonA.m_vertices;
      var normals = polygonA.m_normals;
      for (var i = 0; i < vertexCount; ++i) {
        var s2 = dotVec2(normals[i], cLocal) - dotVec2(normals[i], vertices[i]);
        if (s2 > radius) {
          return;
        }
        if (s2 > separation) {
          separation = s2;
          normalIndex = i;
        }
      }
      var vertIndex1 = normalIndex;
      var vertIndex2 = vertIndex1 + 1 < vertexCount ? vertIndex1 + 1 : 0;
      var v13 = vertices[vertIndex1];
      var v22 = vertices[vertIndex2];
      if (separation < EPSILON) {
        manifold.pointCount = 1;
        manifold.type = exports2.ManifoldType.e_faceA;
        copyVec2(manifold.localNormal, normals[normalIndex]);
        combine2Vec2(manifold.localPoint, 0.5, v13, 0.5, v22);
        copyVec2(manifold.points[0].localPoint, circleB.m_p);
        manifold.points[0].id.setFeatures(0, exports2.ContactFeatureType.e_vertex, 0, exports2.ContactFeatureType.e_vertex);
        return;
      }
      var u1 = dotVec2(cLocal, v22) - dotVec2(cLocal, v13) - dotVec2(v13, v22) + dotVec2(v13, v13);
      var u2 = dotVec2(cLocal, v13) - dotVec2(cLocal, v22) - dotVec2(v22, v13) + dotVec2(v22, v22);
      if (u1 <= 0) {
        if (distSqrVec2(cLocal, v13) > radius * radius) {
          return;
        }
        manifold.pointCount = 1;
        manifold.type = exports2.ManifoldType.e_faceA;
        subVec2(manifold.localNormal, cLocal, v13);
        normalizeVec2(manifold.localNormal);
        copyVec2(manifold.localPoint, v13);
        copyVec2(manifold.points[0].localPoint, circleB.m_p);
        manifold.points[0].id.setFeatures(0, exports2.ContactFeatureType.e_vertex, 0, exports2.ContactFeatureType.e_vertex);
      } else if (u2 <= 0) {
        if (distSqrVec2(cLocal, v22) > radius * radius) {
          return;
        }
        manifold.pointCount = 1;
        manifold.type = exports2.ManifoldType.e_faceA;
        subVec2(manifold.localNormal, cLocal, v22);
        normalizeVec2(manifold.localNormal);
        copyVec2(manifold.localPoint, v22);
        copyVec2(manifold.points[0].localPoint, circleB.m_p);
        manifold.points[0].id.setFeatures(0, exports2.ContactFeatureType.e_vertex, 0, exports2.ContactFeatureType.e_vertex);
      } else {
        combine2Vec2(faceCenter, 0.5, v13, 0.5, v22);
        var separation_1 = dotVec2(cLocal, normals[vertIndex1]) - dotVec2(faceCenter, normals[vertIndex1]);
        if (separation_1 > radius) {
          return;
        }
        manifold.pointCount = 1;
        manifold.type = exports2.ManifoldType.e_faceA;
        copyVec2(manifold.localNormal, normals[vertIndex1]);
        copyVec2(manifold.localPoint, faceCenter);
        copyVec2(manifold.points[0].localPoint, circleB.m_p);
        manifold.points[0].id.setFeatures(0, exports2.ContactFeatureType.e_vertex, 0, exports2.ContactFeatureType.e_vertex);
      }
    };
    var math_min = Math.min;
    Contact.addType(EdgeShape.TYPE, PolygonShape.TYPE, EdgePolygonContact);
    Contact.addType(ChainShape.TYPE, PolygonShape.TYPE, ChainPolygonContact);
    function EdgePolygonContact(manifold, xfA2, fA, indexA, xfB2, fB, indexB) {
      CollideEdgePolygon(manifold, fA.getShape(), xfA2, fB.getShape(), xfB2);
    }
    var edge_reuse = new EdgeShape();
    function ChainPolygonContact(manifold, xfA2, fA, indexA, xfB2, fB, indexB) {
      var chain = fA.getShape();
      chain.getChildEdge(edge_reuse, indexA);
      CollideEdgePolygon(manifold, edge_reuse, xfA2, fB.getShape(), xfB2);
    }
    var EPAxisType;
    (function(EPAxisType2) {
      EPAxisType2[EPAxisType2["e_unknown"] = -1] = "e_unknown";
      EPAxisType2[EPAxisType2["e_edgeA"] = 1] = "e_edgeA";
      EPAxisType2[EPAxisType2["e_edgeB"] = 2] = "e_edgeB";
    })(EPAxisType || (EPAxisType = {}));
    var VertexType;
    (function(VertexType2) {
      VertexType2[VertexType2["e_isolated"] = 0] = "e_isolated";
      VertexType2[VertexType2["e_concave"] = 1] = "e_concave";
      VertexType2[VertexType2["e_convex"] = 2] = "e_convex";
    })(VertexType || (VertexType = {}));
    var EPAxis = /* @__PURE__ */ (function() {
      function EPAxis2() {
      }
      return EPAxis2;
    })();
    var TempPolygon = /* @__PURE__ */ (function() {
      function TempPolygon2() {
        this.vertices = [];
        this.normals = [];
        this.count = 0;
        for (var i = 0; i < SettingsInternal.maxPolygonVertices; i++) {
          this.vertices.push(vec2(0, 0));
          this.normals.push(vec2(0, 0));
        }
      }
      return TempPolygon2;
    })();
    var ReferenceFace = (function() {
      function ReferenceFace2() {
        this.v1 = vec2(0, 0);
        this.v2 = vec2(0, 0);
        this.normal = vec2(0, 0);
        this.sideNormal1 = vec2(0, 0);
        this.sideNormal2 = vec2(0, 0);
      }
      ReferenceFace2.prototype.recycle = function() {
        zeroVec2(this.v1);
        zeroVec2(this.v2);
        zeroVec2(this.normal);
        zeroVec2(this.sideNormal1);
        zeroVec2(this.sideNormal2);
      };
      return ReferenceFace2;
    })();
    var clipPoints1 = [new ClipVertex(), new ClipVertex()];
    var clipPoints2 = [new ClipVertex(), new ClipVertex()];
    var ie = [new ClipVertex(), new ClipVertex()];
    var edgeAxis = new EPAxis();
    var polygonAxis = new EPAxis();
    var polygonBA = new TempPolygon();
    var rf = new ReferenceFace();
    var centroidB = vec2(0, 0);
    var edge0 = vec2(0, 0);
    var edge1 = vec2(0, 0);
    var edge2 = vec2(0, 0);
    var xf = transform(0, 0, 0);
    var normal = vec2(0, 0);
    var normal0 = vec2(0, 0);
    var normal1 = vec2(0, 0);
    var normal2 = vec2(0, 0);
    var lowerLimit = vec2(0, 0);
    var upperLimit = vec2(0, 0);
    var perp = vec2(0, 0);
    var n = vec2(0, 0);
    var CollideEdgePolygon = function(manifold, edgeA, xfA2, polygonB, xfB2) {
      detransformTransform(xf, xfA2, xfB2);
      transformVec2(centroidB, xf, polygonB.m_centroid);
      var v0 = edgeA.m_vertex0;
      var v13 = edgeA.m_vertex1;
      var v22 = edgeA.m_vertex2;
      var v3 = edgeA.m_vertex3;
      var hasVertex0 = edgeA.m_hasVertex0;
      var hasVertex3 = edgeA.m_hasVertex3;
      subVec2(edge1, v22, v13);
      normalizeVec2(edge1);
      setVec2(normal1, edge1.y, -edge1.x);
      var offset1 = dotVec2(normal1, centroidB) - dotVec2(normal1, v13);
      var offset0 = 0;
      var offset2 = 0;
      var convex1 = false;
      var convex2 = false;
      zeroVec2(normal0);
      zeroVec2(normal2);
      if (hasVertex0) {
        subVec2(edge0, v13, v0);
        normalizeVec2(edge0);
        setVec2(normal0, edge0.y, -edge0.x);
        convex1 = crossVec2Vec2(edge0, edge1) >= 0;
        offset0 = Vec2.dot(normal0, centroidB) - Vec2.dot(normal0, v0);
      }
      if (hasVertex3) {
        subVec2(edge2, v3, v22);
        normalizeVec2(edge2);
        setVec2(normal2, edge2.y, -edge2.x);
        convex2 = Vec2.crossVec2Vec2(edge1, edge2) > 0;
        offset2 = Vec2.dot(normal2, centroidB) - Vec2.dot(normal2, v22);
      }
      var front;
      zeroVec2(normal);
      zeroVec2(lowerLimit);
      zeroVec2(upperLimit);
      if (hasVertex0 && hasVertex3) {
        if (convex1 && convex2) {
          front = offset0 >= 0 || offset1 >= 0 || offset2 >= 0;
          if (front) {
            copyVec2(normal, normal1);
            copyVec2(lowerLimit, normal0);
            copyVec2(upperLimit, normal2);
          } else {
            scaleVec2(normal, -1, normal1);
            scaleVec2(lowerLimit, -1, normal1);
            scaleVec2(upperLimit, -1, normal1);
          }
        } else if (convex1) {
          front = offset0 >= 0 || offset1 >= 0 && offset2 >= 0;
          if (front) {
            copyVec2(normal, normal1);
            copyVec2(lowerLimit, normal0);
            copyVec2(upperLimit, normal1);
          } else {
            scaleVec2(normal, -1, normal1);
            scaleVec2(lowerLimit, -1, normal2);
            scaleVec2(upperLimit, -1, normal1);
          }
        } else if (convex2) {
          front = offset2 >= 0 || offset0 >= 0 && offset1 >= 0;
          if (front) {
            copyVec2(normal, normal1);
            copyVec2(lowerLimit, normal1);
            copyVec2(upperLimit, normal2);
          } else {
            scaleVec2(normal, -1, normal1);
            scaleVec2(lowerLimit, -1, normal1);
            scaleVec2(upperLimit, -1, normal0);
          }
        } else {
          front = offset0 >= 0 && offset1 >= 0 && offset2 >= 0;
          if (front) {
            copyVec2(normal, normal1);
            copyVec2(lowerLimit, normal1);
            copyVec2(upperLimit, normal1);
          } else {
            scaleVec2(normal, -1, normal1);
            scaleVec2(lowerLimit, -1, normal2);
            scaleVec2(upperLimit, -1, normal0);
          }
        }
      } else if (hasVertex0) {
        if (convex1) {
          front = offset0 >= 0 || offset1 >= 0;
          if (front) {
            copyVec2(normal, normal1);
            copyVec2(lowerLimit, normal0);
            scaleVec2(upperLimit, -1, normal1);
          } else {
            scaleVec2(normal, -1, normal1);
            copyVec2(lowerLimit, normal1);
            scaleVec2(upperLimit, -1, normal1);
          }
        } else {
          front = offset0 >= 0 && offset1 >= 0;
          if (front) {
            copyVec2(normal, normal1);
            copyVec2(lowerLimit, normal1);
            scaleVec2(upperLimit, -1, normal1);
          } else {
            scaleVec2(normal, -1, normal1);
            copyVec2(lowerLimit, normal1);
            scaleVec2(upperLimit, -1, normal0);
          }
        }
      } else if (hasVertex3) {
        if (convex2) {
          front = offset1 >= 0 || offset2 >= 0;
          if (front) {
            copyVec2(normal, normal1);
            scaleVec2(lowerLimit, -1, normal1);
            copyVec2(upperLimit, normal2);
          } else {
            scaleVec2(normal, -1, normal1);
            scaleVec2(lowerLimit, -1, normal1);
            copyVec2(upperLimit, normal1);
          }
        } else {
          front = offset1 >= 0 && offset2 >= 0;
          if (front) {
            copyVec2(normal, normal1);
            scaleVec2(lowerLimit, -1, normal1);
            copyVec2(upperLimit, normal1);
          } else {
            scaleVec2(normal, -1, normal1);
            scaleVec2(lowerLimit, -1, normal2);
            copyVec2(upperLimit, normal1);
          }
        }
      } else {
        front = offset1 >= 0;
        if (front) {
          copyVec2(normal, normal1);
          scaleVec2(lowerLimit, -1, normal1);
          scaleVec2(upperLimit, -1, normal1);
        } else {
          scaleVec2(normal, -1, normal1);
          copyVec2(lowerLimit, normal1);
          copyVec2(upperLimit, normal1);
        }
      }
      polygonBA.count = polygonB.m_count;
      for (var i = 0; i < polygonB.m_count; ++i) {
        transformVec2(polygonBA.vertices[i], xf, polygonB.m_vertices[i]);
        rotVec2(polygonBA.normals[i], xf.q, polygonB.m_normals[i]);
      }
      var radius = polygonB.m_radius + edgeA.m_radius;
      manifold.pointCount = 0;
      {
        edgeAxis.type = EPAxisType.e_edgeA;
        edgeAxis.index = front ? 0 : 1;
        edgeAxis.separation = Infinity;
        for (var i = 0; i < polygonBA.count; ++i) {
          var v4 = polygonBA.vertices[i];
          var s2 = dotVec2(normal, v4) - dotVec2(normal, v13);
          if (s2 < edgeAxis.separation) {
            edgeAxis.separation = s2;
          }
        }
      }
      if (edgeAxis.type == EPAxisType.e_unknown) {
        return;
      }
      if (edgeAxis.separation > radius) {
        return;
      }
      {
        polygonAxis.type = EPAxisType.e_unknown;
        polygonAxis.index = -1;
        polygonAxis.separation = -Infinity;
        setVec2(perp, -normal.y, normal.x);
        for (var i = 0; i < polygonBA.count; ++i) {
          scaleVec2(n, -1, polygonBA.normals[i]);
          var s1 = dotVec2(n, polygonBA.vertices[i]) - dotVec2(n, v13);
          var s22 = dotVec2(n, polygonBA.vertices[i]) - dotVec2(n, v22);
          var s2 = math_min(s1, s22);
          if (s2 > radius) {
            polygonAxis.type = EPAxisType.e_edgeB;
            polygonAxis.index = i;
            polygonAxis.separation = s2;
            break;
          }
          if (dotVec2(n, perp) >= 0) {
            if (dotVec2(n, normal) - dotVec2(upperLimit, normal) < -SettingsInternal.angularSlop) {
              continue;
            }
          } else {
            if (dotVec2(n, normal) - dotVec2(lowerLimit, normal) < -SettingsInternal.angularSlop) {
              continue;
            }
          }
          if (s2 > polygonAxis.separation) {
            polygonAxis.type = EPAxisType.e_edgeB;
            polygonAxis.index = i;
            polygonAxis.separation = s2;
          }
        }
      }
      if (polygonAxis.type != EPAxisType.e_unknown && polygonAxis.separation > radius) {
        return;
      }
      var k_relativeTol = 0.98;
      var k_absoluteTol = 1e-3;
      var primaryAxis;
      if (polygonAxis.type == EPAxisType.e_unknown) {
        primaryAxis = edgeAxis;
      } else if (polygonAxis.separation > k_relativeTol * edgeAxis.separation + k_absoluteTol) {
        primaryAxis = polygonAxis;
      } else {
        primaryAxis = edgeAxis;
      }
      ie[0].recycle();
      ie[1].recycle();
      if (primaryAxis.type == EPAxisType.e_edgeA) {
        manifold.type = exports2.ManifoldType.e_faceA;
        var bestIndex = 0;
        var bestValue = dotVec2(normal, polygonBA.normals[0]);
        for (var i = 1; i < polygonBA.count; ++i) {
          var value = dotVec2(normal, polygonBA.normals[i]);
          if (value < bestValue) {
            bestValue = value;
            bestIndex = i;
          }
        }
        var i1 = bestIndex;
        var i2 = i1 + 1 < polygonBA.count ? i1 + 1 : 0;
        copyVec2(ie[0].v, polygonBA.vertices[i1]);
        ie[0].id.setFeatures(0, exports2.ContactFeatureType.e_face, i1, exports2.ContactFeatureType.e_vertex);
        copyVec2(ie[1].v, polygonBA.vertices[i2]);
        ie[1].id.setFeatures(0, exports2.ContactFeatureType.e_face, i2, exports2.ContactFeatureType.e_vertex);
        if (front) {
          rf.i1 = 0;
          rf.i2 = 1;
          copyVec2(rf.v1, v13);
          copyVec2(rf.v2, v22);
          copyVec2(rf.normal, normal1);
        } else {
          rf.i1 = 1;
          rf.i2 = 0;
          copyVec2(rf.v1, v22);
          copyVec2(rf.v2, v13);
          scaleVec2(rf.normal, -1, normal1);
        }
      } else {
        manifold.type = exports2.ManifoldType.e_faceB;
        copyVec2(ie[0].v, v13);
        ie[0].id.setFeatures(0, exports2.ContactFeatureType.e_vertex, primaryAxis.index, exports2.ContactFeatureType.e_face);
        copyVec2(ie[1].v, v22);
        ie[1].id.setFeatures(0, exports2.ContactFeatureType.e_vertex, primaryAxis.index, exports2.ContactFeatureType.e_face);
        rf.i1 = primaryAxis.index;
        rf.i2 = rf.i1 + 1 < polygonBA.count ? rf.i1 + 1 : 0;
        copyVec2(rf.v1, polygonBA.vertices[rf.i1]);
        copyVec2(rf.v2, polygonBA.vertices[rf.i2]);
        copyVec2(rf.normal, polygonBA.normals[rf.i1]);
      }
      setVec2(rf.sideNormal1, rf.normal.y, -rf.normal.x);
      setVec2(rf.sideNormal2, -rf.sideNormal1.x, -rf.sideNormal1.y);
      rf.sideOffset1 = dotVec2(rf.sideNormal1, rf.v1);
      rf.sideOffset2 = dotVec2(rf.sideNormal2, rf.v2);
      clipPoints1[0].recycle();
      clipPoints1[1].recycle();
      clipPoints2[0].recycle();
      clipPoints2[1].recycle();
      var np1 = clipSegmentToLine(clipPoints1, ie, rf.sideNormal1, rf.sideOffset1, rf.i1);
      if (np1 < SettingsInternal.maxManifoldPoints) {
        return;
      }
      var np2 = clipSegmentToLine(clipPoints2, clipPoints1, rf.sideNormal2, rf.sideOffset2, rf.i2);
      if (np2 < SettingsInternal.maxManifoldPoints) {
        return;
      }
      if (primaryAxis.type == EPAxisType.e_edgeA) {
        copyVec2(manifold.localNormal, rf.normal);
        copyVec2(manifold.localPoint, rf.v1);
      } else {
        copyVec2(manifold.localNormal, polygonB.m_normals[rf.i1]);
        copyVec2(manifold.localPoint, polygonB.m_vertices[rf.i1]);
      }
      var pointCount = 0;
      for (var i = 0; i < SettingsInternal.maxManifoldPoints; ++i) {
        var separation = dotVec2(rf.normal, clipPoints2[i].v) - dotVec2(rf.normal, rf.v1);
        if (separation <= radius) {
          var cp = manifold.points[pointCount];
          if (primaryAxis.type == EPAxisType.e_edgeA) {
            detransformVec2(cp.localPoint, xf, clipPoints2[i].v);
            cp.id.set(clipPoints2[i].id);
          } else {
            copyVec2(cp.localPoint, clipPoints2[i].v);
            cp.id.set(clipPoints2[i].id);
            cp.id.swapFeatures();
          }
          ++pointCount;
        }
      }
      manifold.pointCount = pointCount;
    };
    var internal = { CollidePolygons, Settings, Sweep, Manifold, Distance, TimeOfImpact, DynamicTree, stats };
    var DataDriver = (function() {
      function DataDriver2(key, listener) {
        this._refMap = {};
        this._map = {};
        this._xmap = {};
        this._data = [];
        this._entered = [];
        this._exited = [];
        this._key = key;
        this._listener = listener;
      }
      DataDriver2.prototype.update = function(data) {
        if (!Array.isArray(data)) throw "Invalid data: " + data;
        this._entered.length = 0;
        this._exited.length = 0;
        this._data.length = data.length;
        for (var i = 0; i < data.length; i++) {
          if (typeof data[i] !== "object" || data[i] === null) continue;
          var d2 = data[i];
          var id = this._key(d2);
          if (!this._map[id]) {
            this._entered.push(d2);
          } else {
            delete this._map[id];
          }
          this._data[i] = d2;
          this._xmap[id] = d2;
        }
        for (var id in this._map) {
          this._exited.push(this._map[id]);
          delete this._map[id];
        }
        var temp3 = this._map;
        this._map = this._xmap;
        this._xmap = temp3;
        for (var i = 0; i < this._exited.length; i++) {
          var d2 = this._exited[i];
          var key = this._key(d2);
          var ref = this._refMap[key];
          this._listener.exit(d2, ref);
          delete this._refMap[key];
        }
        for (var i = 0; i < this._entered.length; i++) {
          var d2 = this._entered[i];
          var key = this._key(d2);
          var ref = this._listener.enter(d2);
          if (ref) {
            this._refMap[key] = ref;
          }
        }
        for (var i = 0; i < this._data.length; i++) {
          if (typeof data[i] !== "object" || data[i] === null) continue;
          var d2 = this._data[i];
          var key = this._key(d2);
          var ref = this._refMap[key];
          this._listener.update(d2, ref);
        }
        this._entered.length = 0;
        this._exited.length = 0;
        this._data.length = 0;
      };
      DataDriver2.prototype.ref = function(d2) {
        return this._refMap[this._key(d2)];
      };
      return DataDriver2;
    })();
    const planck = Object.freeze(Object.defineProperty({ __proto__: null, AABB, Body, Box: BoxShape, BoxShape, BroadPhase, Chain: ChainShape, ChainShape, Circle: CircleShape, CircleShape, ClipVertex, CollideCircles, CollideEdgeCircle, CollideEdgePolygon, CollidePolygonCircle, CollidePolygons, Contact, ContactEdge, get ContactFeatureType() {
      return exports2.ContactFeatureType;
    }, ContactID, ContactImpulse, DataDriver, Distance, DistanceInput, DistanceJoint, DistanceOutput, DistanceProxy, DynamicTree, Edge: EdgeShape, EdgeShape, Fixture, FixtureProxy, FrictionJoint, GearJoint, Joint, JointEdge, Manifold, ManifoldPoint, get ManifoldType() {
      return exports2.ManifoldType;
    }, Mat22, Mat33, Math: math, MotorJoint, MouseJoint, get PointState() {
      return exports2.PointState;
    }, Polygon: PolygonShape, PolygonShape, PrismaticJoint, PulleyJoint, RevoluteJoint, RopeJoint, Rot, Serializer, Settings, SettingsInternal, Shape, ShapeCast, ShapeCastInput, ShapeCastOutput, SimplexCache, Solver, Sweep, TOIInput, TOIOutput, get TOIOutputState() {
      return exports2.TOIOutputState;
    }, Testbed, TimeOfImpact, TimeStep, Transform, TreeNode, Vec2, Vec3, VelocityConstraintPoint, WeldJoint, WheelJoint, World, WorldManifold, clipSegmentToLine, getPointStates, internal, mixFriction, mixRestitution, stats, testOverlap, testbed }, Symbol.toStringTag, { value: "Module" }));
    exports2.AABB = AABB;
    exports2.Body = Body;
    exports2.Box = BoxShape;
    exports2.BoxShape = BoxShape;
    exports2.BroadPhase = BroadPhase;
    exports2.Chain = ChainShape;
    exports2.ChainShape = ChainShape;
    exports2.Circle = CircleShape;
    exports2.CircleShape = CircleShape;
    exports2.ClipVertex = ClipVertex;
    exports2.CollideCircles = CollideCircles;
    exports2.CollideEdgeCircle = CollideEdgeCircle;
    exports2.CollideEdgePolygon = CollideEdgePolygon;
    exports2.CollidePolygonCircle = CollidePolygonCircle;
    exports2.CollidePolygons = CollidePolygons;
    exports2.Contact = Contact;
    exports2.ContactEdge = ContactEdge;
    exports2.ContactID = ContactID;
    exports2.ContactImpulse = ContactImpulse;
    exports2.DataDriver = DataDriver;
    exports2.Distance = Distance;
    exports2.DistanceInput = DistanceInput;
    exports2.DistanceJoint = DistanceJoint;
    exports2.DistanceOutput = DistanceOutput;
    exports2.DistanceProxy = DistanceProxy;
    exports2.DynamicTree = DynamicTree;
    exports2.Edge = EdgeShape;
    exports2.EdgeShape = EdgeShape;
    exports2.Fixture = Fixture;
    exports2.FixtureProxy = FixtureProxy;
    exports2.FrictionJoint = FrictionJoint;
    exports2.GearJoint = GearJoint;
    exports2.Joint = Joint;
    exports2.JointEdge = JointEdge;
    exports2.Manifold = Manifold;
    exports2.ManifoldPoint = ManifoldPoint;
    exports2.Mat22 = Mat22;
    exports2.Mat33 = Mat33;
    exports2.Math = math;
    exports2.MotorJoint = MotorJoint;
    exports2.MouseJoint = MouseJoint;
    exports2.Polygon = PolygonShape;
    exports2.PolygonShape = PolygonShape;
    exports2.PrismaticJoint = PrismaticJoint;
    exports2.PulleyJoint = PulleyJoint;
    exports2.RevoluteJoint = RevoluteJoint;
    exports2.RopeJoint = RopeJoint;
    exports2.Rot = Rot;
    exports2.Serializer = Serializer;
    exports2.Settings = Settings;
    exports2.SettingsInternal = SettingsInternal;
    exports2.Shape = Shape;
    exports2.ShapeCast = ShapeCast;
    exports2.ShapeCastInput = ShapeCastInput;
    exports2.ShapeCastOutput = ShapeCastOutput;
    exports2.SimplexCache = SimplexCache;
    exports2.Solver = Solver;
    exports2.Sweep = Sweep;
    exports2.TOIInput = TOIInput;
    exports2.TOIOutput = TOIOutput;
    exports2.Testbed = Testbed;
    exports2.TimeOfImpact = TimeOfImpact;
    exports2.TimeStep = TimeStep;
    exports2.Transform = Transform;
    exports2.TreeNode = TreeNode;
    exports2.Vec2 = Vec2;
    exports2.Vec3 = Vec3;
    exports2.VelocityConstraintPoint = VelocityConstraintPoint;
    exports2.WeldJoint = WeldJoint;
    exports2.WheelJoint = WheelJoint;
    exports2.World = World;
    exports2.WorldManifold = WorldManifold;
    exports2.clipSegmentToLine = clipSegmentToLine;
    exports2.default = planck;
    exports2.getPointStates = getPointStates;
    exports2.internal = internal;
    exports2.mixFriction = mixFriction;
    exports2.mixRestitution = mixRestitution;
    exports2.stats = stats;
    exports2.testOverlap = testOverlap;
    exports2.testbed = testbed;
    Object.defineProperties(exports2, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
  });
}
if (window.__pcvCasinoPhysique?.version !== "db0482e13dbf") {
  (() => {
    const PPM = 20;
    const REGLAGES = {
      pas: 1 / 120,
      sousPasMax: 6,
      iterV: 10,
      iterP: 8,
      gravite: 800,
      vmax: 360,
      // px/s², px/s (vidéos officielles)
      frottement: 0.6,
      rebond: 0.02,
      densite: 1,
      rebondTerrain: 0.75,
      // (14/10) le « terrain rebondissant » du jeu (objets « Jump », fréquents avec la bombe)
      // (14/10) la bombe : rayon (unités du modèle), mèche 40 images à 30 i/s (AnCaObBombFuseBurn), souffle : rayon (px de
      // l'écran) et vitesse donnée au centre ; (14/10 : un souffle court, « les badges bougent peu » dans le jeu réel)
      // (15/10, retour de l'auteur : « le souffle ne fait presque rien, seul le choc de la bombe fait bouger les badges ») un
      // souffle franc qui projette les badges autour, par consigne de l'auteur, même si ça s'éloigne du jeu réel
      bombe: { rayon: 0.9, meche: 40 / 30, souffle: 130, vitesse: 420 },
      murs: [0, 400],
      hautMurs: 30,
      epaisseurMur: 40,
      // les deux parois (x écran) ; au-dessus de hautMurs, un objet du décor passe devant la pince
      murHaut: -160,
      // (14/10) les parois montent jusqu'en haut de la vitrine : rien ne passe derrière les poteaux
      sortie: 240 + 40,
      // un corps plus bas que cela est sorti (goulotte)
      pince: {
        unite: 19.8,
        // px par unité du modèle (camera CrSt_Cam_Play)
        ouverture: 55 * Math.PI / 180,
        // butée haute
        vitesseOuvrir: 55 * Math.PI / 180 / 1.3,
        vitesseFermer: 55 * Math.PI / 180 / 1.4,
        // P03 : 1,3 s et 1,4 s
        couple: 600,
        // N·m (unités Box2D) : la force de la prise ; 14/10 : 30 % au robot du casino (318 parties, avec la tenue PRISE_VRAIE de casino.js)
        coupleOuvert: 300,
        // ouverte : les bras tiennent leur ouverture et écartent les badges ; un badge coincé entre eux les fait céder un peu
        densiteBras: 1,
        frottementBras: 0.9,
        // (14/10, retour de l'auteur : « des morceaux de plateau en hauteur empêchent d'atteindre les badges du dessous »)
        // contre le décor, seules comptent les pointes (Lo_ArmL_edge, le point de collision du modèle) et le moyeu : le
        // reste des bras, en 2,5D, passe devant les plateaux et les chevilles, comme dans le jeu. « tout » : l'ancien choix
        brasDecor: "pointes",
        rayonPointe: 0.3
        // unités du modèle
      }
    };
    const BRAS = [
      [[-0.1, 0.27], [0.38, 0.02], [-0.24, -0.72], [-1.18, -0.72], [-0.95, -0.45]],
      [[-1.18, -0.72], [-0.24, -0.72], [0.02, -1.3], [-0.3, -1.46], [-1.06, -1.38], [-1.26, -1.04]],
      [[-0.92, -1.42], [0.08, -1.4], [1.65, -2.38], [2.04, -2.52], [1.98, -2.74], [0.84, -2.77]]
    ];
    const ARTIC = [1.697, -0.437];
    const MOYEU = { rx: 1.82, ry: 1.15 };
    const GROUPE_PINCE = -7;
    const DECOR = 2;
    const ARRET = { force: 1200, images: 2, plie: 0.5, recul: 3, enfonce: 1.5, imagesCoince: 30 };
    const MARGE_MUR = Math.ceil(MOYEU.rx * 19.8) + 3;
    const aire = (P) => {
      let a = 0;
      for (let i = 0; i < P.length; i++) {
        const [x0, y0] = P[i], [x1, y1] = P[(i + 1) % P.length];
        a += x0 * y1 - x1 * y0;
      }
      return a / 2;
    };
    const enveloppe = (pts) => {
      const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      if (p.length < 3) return p;
      const x = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], hi = [];
      for (const q of p) {
        while (lo.length >= 2 && x(lo[lo.length - 2], lo[lo.length - 1], q) <= 1e-9) lo.pop();
        lo.push(q);
      }
      for (let i = p.length - 1; i >= 0; i--) {
        const q = p[i];
        while (hi.length >= 2 && x(hi[hi.length - 2], hi[hi.length - 1], q) <= 1e-9) hi.pop();
        hi.push(q);
      }
      return lo.slice(0, -1).concat(hi.slice(0, -1));
    };
    const nettoyer = (P, aireMin = 1.5) => {
      const q = [];
      for (const p of P) if (!q.some((r) => Math.hypot(r[0] - p[0], r[1] - p[1]) < 0.35)) q.push(p);
      const h = enveloppe(q);
      if (h.length < 3 || Math.abs(aire(h)) < aireMin) return [];
      if (h.length <= 8) return [h];
      const out = [];
      for (let i = 1; i < h.length - 1; i += 6) out.push([h[0], ...h.slice(i, Math.min(h.length, i + 7))]);
      return out.filter((x) => x.length >= 3 && Math.abs(aire(x)) >= aireMin);
    };
    const fusionner = (polys) => {
      let L = polys.filter((P) => P.length >= 3).map((P) => P.slice());
      const cle = (p) => p[0].toFixed(1) + "," + p[1].toFixed(1);
      for (let encore = true; encore; ) {
        encore = false;
        fin: for (let i = 0; i < L.length; i++) for (let k = i + 1; k < L.length; k++) {
          const A = L[i], B = L[k], ka = new Set(A.map(cle)), communs = B.filter((p) => ka.has(cle(p))).length;
          if (communs < 2) continue;
          const h = enveloppe([...A, ...B]);
          if (h.length > 8) continue;
          if (Math.abs(Math.abs(aire(h)) - Math.abs(aire(A)) - Math.abs(aire(B))) > 0.5) continue;
          L[i] = h;
          L.splice(k, 1);
          encore = true;
          break fin;
        }
      }
      return L;
    };
    const bordsExt = (polys) => {
      const k = (a, b) => a[0].toFixed(1) + "," + a[1].toFixed(1) + ":" + b[0].toFixed(1) + "," + b[1].toFixed(1), n = /* @__PURE__ */ new Map(), L = [];
      for (const P of polys) for (let i = 0; i < P.length; i++) {
        const a = P[i], b = P[(i + 1) % P.length];
        n.set(k(a, b), (n.get(k(a, b)) || 0) + 1);
        L.push([a, b]);
      }
      return L.filter(([a, b]) => !n.has(k(b, a))).map(([a, b]) => [a[0], a[1], b[0], b[1]]);
    };
    const creer = (o = {}) => {
      const pl = window.planck;
      if (!pl) throw new Error("casino-physique : planck.js absent");
      const R = { ...REGLAGES, ...o.reglages || {}, pince: { ...REGLAGES.pince, ...o.reglages?.pince || {} } };
      const V = (x, y) => new pl.Vec2(x / PPM, y / PPM);
      const monde = new pl.World({ gravity: new pl.Vec2(0, R.gravite / PPM) });
      const badges = /* @__PURE__ */ new Set(), accs = /* @__PURE__ */ new Set(), evts = [], ignores = /* @__PURE__ */ new Map();
      const prises = /* @__PURE__ */ new Map();
      let reste = 0, pince = null;
      const cle = (a, b) => a.__id < b.__id ? a.__id + ":" + b.__id : b.__id + ":" + a.__id;
      let nId = 0;
      const fixe = monde.createBody({ type: "static" });
      for (const x of R.murs) {
        if ((R.murHaut ?? R.hautMurs) < R.hautMurs) fixe.createFixture(new pl.Edge(V(x, R.murHaut ?? R.hautMurs), V(x, R.hautMurs)), { friction: 0.2, filterGroupIndex: GROUPE_PINCE }).__mur = true;
        const x1 = x + (x > 0 ? R.epaisseurMur : -R.epaisseurMur);
        fixe.createFixture(new pl.Polygon([V(x, R.hautMurs), V(x1, R.hautMurs), V(x1, R.sortie + 200), V(x, R.sortie + 200)]), { friction: 0.2 }).__mur = true;
      }
      fixe.__type = "decor";
      monde.on("pre-solve", (c) => {
        const a = c.getFixtureA().getBody(), b = c.getFixtureB().getBody();
        if (a.__badge && b.__badge && ignores.has(cle(a, b))) c.setEnabled(false);
      });
      monde.on("post-solve", (c, imp) => {
        const a = c.getFixtureA().getBody(), b = c.getFixtureB().getBody();
        const pc = a.__type === "pince" ? a : b.__type === "pince" ? b : null;
        if (!pc || !pince) return;
        let f = 0;
        for (const x of imp.normalImpulses) f += x;
        pc.__force = (pc.__force || 0) + f / R.pas;
        const autre = pc === a ? b : a;
        if ((pc === a ? c.getFixtureB() : c.getFixtureA()).__mur) return;
        if (autre.__badge) pc.__forceBadge = (pc.__forceBadge || 0) + f / R.pas;
        const wm = c.getWorldManifold(null);
        if (!wm) return;
        if (autre.__badge) for (let k = 0; k < c.getManifold().pointCount; k++) pc.__enfonce = Math.max(pc.__enfonce || 0, -wm.separations[k] * PPM);
        const ny = pc === a ? wm.normal.y : -wm.normal.y, haut = ny * f / R.pas;
        if (haut <= 0) return;
        pc.__forceHaut = (pc.__forceHaut || 0) + haut;
        if (autre.__type === "decor") pc.__forceDur = (pc.__forceDur || 0) + haut;
      });
      monde.on("begin-contact", (c) => {
        const a = c.getFixtureA().getBody(), b = c.getFixtureB().getBody();
        const ba = a.__badge, bb = b.__badge;
        if (!ba && !bb) return;
        const pinceA = a.__type === "pince", pinceB = b.__type === "pince";
        if (pinceA || pinceB) {
          const bd = ba || bb;
          if (bd && !bd.__parPince) {
            bd.__parPince = true;
          }
          evts.push({ type: "choc", b: bd, pince: true });
          return;
        }
        const va = a.getLinearVelocity(), vb = b.getLinearVelocity(), dv = Math.hypot(va.x - vb.x, va.y - vb.y) * PPM;
        if (dv > 60) evts.push({ type: "pose", b: ba || bb, force: dv });
      });
      fixe.__bords = R.murs.map((x) => [x, R.murHaut ?? R.hautMurs, x, R.sortie + 200]);
      const decor = (objets) => {
        for (const ob of objets || []) {
          const f = ob.phys ? ob.phys[1] : ob.glisse ? 0 : R.frottement, qs = fusionner((ob.polys || []).flatMap((P) => nettoyer(P)));
          const devant = qs.some((q) => q.some(([, y]) => y < R.hautMurs));
          for (const q of qs) fixe.createFixture(new pl.Polygon(q.map(([x, y]) => V(x, y))), { friction: f, restitution: ob.rebond ? R.rebondTerrain : 0, filterGroupIndex: devant ? GROUPE_PINCE : 0, filterCategoryBits: DECOR });
          fixe.__bords.push(...bordsExt(qs));
        }
      };
      const badge = (d) => {
        const s = d.ech || 0.5, sx = s, sy = s;
        const corps = monde.createBody({ type: "dynamic", position: V(d.x, d.y), angle: d.rot || 0, awake: !d.fige, allowSleep: true, angularDamping: 0.6, linearDamping: 0.05 });
        const frott = d.phys ? Math.max(0.05, d.phys[1]) : R.frottement;
        const garnir = (polys) => {
          for (let f = corps.getFixtureList(); f; ) {
            const g = f.getNext();
            corps.destroyFixture(f);
            f = g;
          }
          const pieces = fusionner((polys || []).flatMap((P) => nettoyer(P.map(([u, v]) => [(u - 64) * sx, (v - 64) * sy]))));
          let n = 0;
          for (const q of pieces) {
            corps.createFixture(new pl.Polygon(q.map(([x, y]) => V(x, y))), { density: R.densite, friction: frott, restitution: R.rebond });
            n++;
          }
          if (!n) corps.createFixture(new pl.Circle(V(0, 0), (d.r || 30) / PPM), { density: R.densite, friction: frott, restitution: R.rebond });
          corps.__bords = n ? bordsExt(pieces) : Array.from({ length: 16 }, (_, k) => {
            const r = d.r || 30, a = k / 16 * Math.PI * 2, b2 = (k + 1) / 16 * Math.PI * 2;
            return [Math.cos(a) * r, Math.sin(a) * r, Math.cos(b2) * r, Math.sin(b2) * r];
          });
          return n;
        };
        garnir(d.polys);
        const b = {
          forme: garnir,
          corps,
          donnees: d.donnees,
          fige: !!d.fige,
          touche: !d.fige,
          r: d.r || 30,
          lire() {
            const p = corps.getPosition();
            return { x: p.x * PPM, y: p.y * PPM, a: corps.getAngle(), eveille: corps.isAwake(), touche: b.touche };
          },
          point(u, v) {
            const p = corps.getWorldPoint(V((u - 64) * sx, (v - 64) * sy));
            return [p.x * PPM, p.y * PPM];
          },
          vitesse() {
            const v = corps.getLinearVelocity();
            return [v.x * PPM, v.y * PPM];
          },
          reveiller() {
            b.reveille = true;
            corps.setAwake(true);
          },
          // (15/10) la boîte de sa forme, px de l'écran : [x0, y0, x1, y1]
          boite() {
            const q = [1e9, 1e9, -1e9, -1e9];
            for (let f = corps.getFixtureList(); f; f = f.getNext()) {
              const a = f.getAABB(0);
              q[0] = Math.min(q[0], a.lowerBound.x * PPM);
              q[1] = Math.min(q[1], a.lowerBound.y * PPM);
              q[2] = Math.max(q[2], a.upperBound.x * PPM);
              q[3] = Math.max(q[3], a.upperBound.y * PPM);
            }
            return q;
          }
        };
        corps.__badge = b;
        corps.__id = ++nId;
        corps.__type = "badge";
        badges.add(b);
        return b;
      };
      const retirer = (b) => {
        if (!badges.has(b)) return;
        badges.delete(b);
        prises.delete(b);
        for (const k of [...ignores.keys()]) if (ignores.get(k).includes(b)) ignores.delete(k);
        monde.destroyBody(b.corps);
      };
      const chevauchent = (A, B) => {
        const xa = A.getTransform(), xb = B.getTransform();
        for (let fa = A.getFixtureList(); fa; fa = fa.getNext()) for (let fb = B.getFixtureList(); fb; fb = fb.getNext())
          if (pl.testOverlap(fa.getShape(), 0, fb.getShape(), 0, xa, xb)) return true;
        return false;
      };
      const croiser = (neufs) => {
        const L = [...badges];
        for (const a of neufs || L) for (const b of L) {
          if (a === b || ignores.has(cle(a.corps, b.corps))) continue;
          if (chevauchent(a.corps, b.corps)) ignores.set(cle(a.corps, b.corps), [a, b]);
        }
      };
      const accessoire = (d) => {
        const sx = d.sx || 1, sy = d.sy || 1;
        const corps = monde.createBody({ type: d.genre === "fixe" ? "static" : "dynamic", position: V(d.x, d.y), angle: d.rot || 0, awake: !d.fige, allowSleep: true, angularDamping: 0.6, linearDamping: 0.05 });
        const frott = d.phys ? Math.max(0.05, d.phys[1]) : R.frottement;
        const pieces = fusionner((d.polys || []).flatMap((P) => nettoyer(P.map(([u, v]) => [(u - d.w / 2) * sx, (v - d.h / 2) * sy]))));
        for (const q of pieces) corps.createFixture(new pl.Polygon(q.map(([x, y]) => V(x, y))), { density: R.densite, friction: frott, restitution: R.rebond });
        if (!pieces.length) corps.createFixture(new pl.Circle(V(0, 0), 6 / PPM), { density: R.densite, friction: frott });
        if (d.genre === "pivot") monde.createJoint(new pl.RevoluteJoint({}, fixe, corps, V(d.x, d.y)));
        corps.__bords = bordsExt(pieces);
        corps.__id = ++nId;
        const a = {
          corps,
          donnees: d.donnees,
          fige: !!d.fige,
          genre: d.genre,
          lire() {
            const p = corps.getPosition();
            return { x: p.x * PPM, y: p.y * PPM, a: corps.getAngle(), sorti: !!a.sorti };
          }
        };
        if (d.genre === "fixe") corps.__type = "decor";
        else {
          corps.__type = "acc";
          corps.__acc = a;
          accs.add(a);
        }
        return a;
      };
      const souder = (b, a) => {
        if (!b || !a || a.genre === "fixe") return;
        const p = b.corps.getPosition();
        monde.createJoint(new pl.WeldJoint({}, a.corps, b.corps, p));
        b.soude = a;
      };
      let laBombe = null;
      const bombe = (x, y, vx = 0, vy = 0) => {
        if (laBombe) monde.destroyBody(laBombe);
        laBombe = monde.createBody({ type: "dynamic", position: V(x, y), bullet: true, allowSleep: false, angularDamping: 0.8 });
        laBombe.createFixture(new pl.Circle(V(0, 0), R.bombe.rayon * R.pince.unite / PPM), { density: 2, friction: 0.6, restitution: 0.3, filterGroupIndex: GROUPE_PINCE });
        laBombe.setLinearVelocity(new pl.Vec2(vx / PPM, vy / PPM));
        laBombe.__type = "pince";
        return laBombe;
      };
      const exploser = (x, y) => {
        const B_ = R.bombe, touches = [];
        if (laBombe) {
          monde.destroyBody(laBombe);
          laBombe = null;
        }
        for (const e of [...badges, ...accs]) {
          const c = e.corps, p = c.getPosition(), dx = p.x * PPM - x, dy = p.y * PPM - y, d = Math.hypot(dx, dy);
          if (d > B_.souffle + 20) continue;
          const k = Math.max(0, 1 - d / (B_.souffle + 20)), v = B_.vitesse * k / PPM, ux = d > 1e-3 ? dx / d : 0, uy = d > 1e-3 ? dy / d : -1;
          e.reveille = true;
          c.setAwake(true);
          c.applyLinearImpulse(new pl.Vec2(ux * v * c.getMass(), (uy - 0.35) * v * c.getMass()), c.getWorldCenter(), true);
          if (badges.has(e)) {
            e.__parPince = true;
            touches.push(e);
          }
        }
        return touches;
      };
      const couvert = (b) => {
        const p = b.corps.getPosition(), r = b.r / PPM;
        return [-0.5, 0, 0.5].every((k) => {
          let dur = false;
          monde.rayCast(new pl.Vec2(p.x + k * r, p.y), new pl.Vec2(p.x + k * r, R.murHaut / PPM), (f) => {
            if (f.getBody() !== fixe || f.getFilterGroupIndex() === GROUPE_PINCE || f.getShape().getType() === "edge" || f.__mur) return -1;
            dur = true;
            return 0;
          });
          return dur;
        });
      };
      const creerPince = (o2 = {}) => {
        const P = R.pince, U = P.unite;
        const moyeu = monde.createBody({ type: "kinematic", position: V(200, -60) });
        moyeu.__type = "pince";
        const ov = Array.from({ length: 8 }, (_, k) => {
          const t = k / 8 * Math.PI * 2;
          return V(Math.cos(t) * MOYEU.rx * U, Math.sin(t) * MOYEU.ry * U);
        });
        moyeu.createFixture(new pl.Polygon(ov), { friction: 0.5, filterGroupIndex: GROUPE_PINCE });
        const bras = [-1, 1].map((sg) => {
          const ancre = [sg * ARTIC[0] * U, -ARTIC[1] * U];
          const b = monde.createBody({ type: "dynamic", position: V(200 + ancre[0], -60 + ancre[1]), gravityScale: 0, angularDamping: 2, linearDamping: 0.5, allowSleep: false, bullet: true });
          b.__type = "pince";
          b.__sg = sg;
          for (const morceau of BRAS) {
            const q = enveloppe(morceau.map(([x, y]) => [-sg * x * U, -y * U]));
            b.createFixture(new pl.Polygon(q.map(([x, y]) => V(x, y))), { density: P.densiteBras, friction: P.frottementBras, filterGroupIndex: GROUPE_PINCE, filterMaskBits: o2.sansBras ? 0 : P.brasDecor === "tout" ? 65535 : 65535 & ~DECOR });
          }
          if (P.brasDecor !== "tout") b.createFixture(new pl.Circle(V(-sg * 1.697 * U, 2.653 * U), P.rayonPointe * U / PPM), { density: P.densiteBras, friction: P.frottementBras, filterGroupIndex: GROUPE_PINCE, filterMaskBits: o2.sansBras ? 0 : 65535 });
          const j = monde.createJoint(new pl.RevoluteJoint({
            enableMotor: true,
            maxMotorTorque: P.coupleOuvert,
            motorSpeed: 0,
            enableLimit: true,
            lowerAngle: sg < 0 ? 0 : -P.ouverture,
            upperAngle: sg < 0 ? P.ouverture : 0
          }, moyeu, b, V(200 + ancre[0], -60 + ancre[1])));
          return { b, j, sg, ancre, contacts: 0, decor: 0 };
        });
        let cible = { x: 200, y: -60, phi: 0 }, ouvrir = 1, couple = null;
        const touche = (corps) => {
          for (let e = corps.getContactList(); e; e = e.next) if (e.contact.isTouching() && e.contact.isEnabled() && e.other.__type !== "pince") return true;
          return false;
        };
        const angle = (k) => bras[k].j.getJointAngle() * -bras[k].sg;
        const placer = (x, y, phi, a) => {
          moyeu.setTransform(V(x, y), -phi);
          moyeu.setLinearVelocity(new pl.Vec2(0, 0));
          moyeu.setAngularVelocity(0);
          for (const B of bras) {
            const ang = -phi - B.sg * a, c = Math.cos(-phi), s = Math.sin(-phi), [ax, ay] = B.ancre;
            B.b.setTransform(V(x + ax * c - ay * s, y + ax * s + ay * c), ang);
            B.b.setLinearVelocity(new pl.Vec2(0, 0));
            B.b.setAngularVelocity(0);
          }
          cible = { x, y, phi };
        };
        placer(200, -60, 0, P.ouverture * 0.8);
        const p = {
          placer,
          commander(o3) {
            if (o3.x != null) cible = { x: o3.x, y: o3.y, phi: o3.phi || 0 };
            if (o3.ouvrir != null) ouvrir = o3.ouvrir;
            if (o3.couple !== void 0) couple = o3.couple;
          },
          // (appelé à chaque sous-pas) le moyeu suit sa cible par sa vitesse (cinématique : il pousse, rien ne le pousse) ;
          // chaque bras tourne par son moteur vers ouvert ou fermé, avec son couple
          // (k : la part du chemin vers la cible à faire pendant ce sous-pas ; la cible est répartie sur les sous-pas d'un pas,
          // sans quoi le moyeu avançait par à-coups et l'inertie des bras les repliait)
          piloter(h, k = 1) {
            const pos = moyeu.getPosition(), a0 = moyeu.getAngle();
            moyeu.setLinearVelocity(new pl.Vec2((cible.x / PPM - pos.x) * k / h, (cible.y / PPM - pos.y) * k / h));
            moyeu.setAngularVelocity((-cible.phi - a0) * k / h);
            for (let k2 = 0; k2 < 2; k2++) {
              const B = bras[k2], o_ = typeof ouvrir === "number" ? ouvrir : ouvrir[k2], a = angle(k2);
              if (o_) {
                B.bloque = false;
                B.cale = 0;
                B.a0 = a;
              } else if (!B.bloque) {
                if (!touche(B.b)) {
                  B.cale = 0;
                  B.a0 = a;
                } else {
                  B.cale = (B.cale || 0) + h;
                  if (B.cale >= 0.12) {
                    if (B.a0 - a < 0.25 * P.vitesseFermer * B.cale) B.bloque = true;
                    B.cale = 0;
                    B.a0 = a;
                  }
                }
              }
              if (!o_ && B.bloque) {
                B.j.enableMotor(false);
                B.b.applyTorque(B.sg * (couple ?? P.couple), true);
                continue;
              }
              B.j.enableMotor(true);
              const v = o_ ? Math.min(P.vitesseOuvrir, Math.max(0, (P.ouverture - a) * 8)) : -P.vitesseFermer;
              B.j.setMotorSpeed(-B.sg * v);
              B.j.setMaxMotorTorque(o_ ? P.coupleOuvert : couple ?? P.couple);
            }
          },
          // LA DESCENTE S'ARRÊTE (à appeler à chaque image pendant la descente) : le moyeu touche quelque chose ; ou un bras
          // replié de moitié (il a buté en descendant ; contre une paroi, il glisse le long et la pince continue) ; ou la pince appuie vraiment
          // (plus de ARRET.force N pendant ARRET.images images de suite) : elle ne fait que frôler un badge libre, elle
          // continue (les bras ouverts sont souples). Rend la raison, ou null ; casino.js remonte alors de ARRET.recul px
          // (8/10/2026, règle de l'auteur : « elle cogne et n'attrape rien ») : comme le vrai jeu, la pince FORCE vers le bas
          // jusqu'à sa profondeur maximale ; seules les surfaces dures l'arrêtent (décor : plateaux, pentes, murets, sol),
          // jamais un badge : elle les pousse, les écarte, les tasse pour engager le badge visé entre ses bras. Arrêt :
          // le moyeu dans le décor ; le décor qui la repousse vers le haut (ARRET.force, ARRET.images images) ; un bras
          // replié de moitié contre le décor ; ou des badges qui ne cèdent plus. Elle pousse les badges sans les traverser :
          // dès qu'elle entre de plus de ARRET.enfonce px dans un badge, etat.retenir demande à l'automate de ne pas
          // descendre à cette image (le badge a le temps de glisser, d'être écarté ou tassé) ; retenue trop longtemps
          // (ARRET.imagesCoince, compteur qui fuit quand elle avance), le tas ne cède pas : elle s'arrête là
          arret(lu = p.lire(), etat = p) {
            const c = lu.contacts, F = lu.haut;
            etat.appui = F.dur > ARRET.force ? (etat.appui || 0) + 1 : 0;
            etat.retenir = F.enfonce > ARRET.enfonce;
            etat.coince = Math.max(0, (etat.coince || 0) + (etat.retenir ? 1 : -0.25));
            if (c.decorMoyeu || p.dansDecor()) return "moyeu";
            if (lu.oG < ARRET.plie && c.decorG || lu.oD < ARRET.plie && c.decorD) return "bras";
            const seule = !c.decorMoyeu && c.decorG > 0 !== c.decorD > 0 && (c.decorG ? lu.oG : lu.oD) > ARRET.plie;
            if (etat.appui >= ARRET.images && !seule) return "decor";
            if (etat.coince >= ARRET.imagesCoince) return "coince";
            return null;
          },
          lire() {
            const c = { moyeu: 0, g: 0, d: 0, decorG: 0, decorD: 0, decorMoyeu: 0 }, tenus = /* @__PURE__ */ new Set();
            const compter = (corps, cleB, cleD) => {
              for (let e = corps.getContactList(); e; e = e.next) {
                const k = e.contact;
                if (!k.isTouching() || !k.isEnabled()) continue;
                const autre = e.other;
                if (k.getFixtureA().__mur || k.getFixtureB().__mur) continue;
                if (autre.__badge) {
                  c[cleB]++;
                  if (cleB !== "moyeu") tenus.add(autre.__badge);
                } else if (autre.__type === "decor") c[cleD]++;
              }
            };
            compter(moyeu, "moyeu", "decorMoyeu");
            compter(bras[0].b, "g", "decorG");
            compter(bras[1].b, "d", "decorD");
            return { oG: angle(0) / P.ouverture, oD: angle(1) / P.ouverture, force: { moyeu: moyeu.__forceMax || 0, g: bras[0].b.__forceMax || 0, d: bras[1].b.__forceMax || 0 }, haut: { moyeu: moyeu.__hautMax || 0, g: bras[0].b.__hautMax || 0, d: bras[1].b.__hautMax || 0, dur: Math.max(moyeu.__durMax || 0, bras[0].b.__durMax || 0, bras[1].b.__durMax || 0), badges: Math.max(moyeu.__badgeMax || 0, bras[0].b.__badgeMax || 0, bras[1].b.__badgeMax || 0), enfonce: Math.max(moyeu.__enfonceMax || 0, bras[0].b.__enfonceMax || 0, bras[1].b.__enfonceMax || 0) }, bloqueG: !!bras[0].bloque, bloqueD: !!bras[1].bloque, contacts: c, tenus: [...tenus] };
          },
          // le moyeu dans le décor ? (cinématique : Box2D ne le fait pas buter contre le statique ; casino.js l'arrête)
          dansDecor(marge = 0) {
            const xa = moyeu.getTransform();
            for (let fa = moyeu.getFixtureList(); fa; fa = fa.getNext())
              for (let fb = fixe.getFixtureList(); fb; fb = fb.getNext()) {
                if (fb.getShape().getType() === "edge" || fb.__mur || fb.getFilterGroupIndex() === GROUPE_PINCE) continue;
                if (pl.testOverlap(fa.getShape(), 0, fb.getShape(), 0, xa, fixe.getTransform())) return true;
              }
            return false;
          },
          formes() {
            const out = [];
            for (const corps of [moyeu, bras[0].b, bras[1].b]) for (let f = corps.getFixtureList(); f; f = f.getNext()) {
              const sh = f.getShape();
              const vs = sh.m_vertices || Array.from({ length: 8 }, (_, k) => new pl.Vec2(sh.m_p.x + Math.cos(k * Math.PI / 4) * sh.m_radius, sh.m_p.y + Math.sin(k * Math.PI / 4) * sh.m_radius));
              out.push(vs.map((v) => {
                const w = corps.getWorldPoint(v);
                return [w.x * PPM, w.y * PPM];
              }));
            }
            return out;
          },
          // la place libre sous la pince (px) : des rayons vers le bas depuis le dessous du moyeu et les deux pointes, jusqu'au
          // premier badge ou décor (casino.js freine la descente en approchant)
          dessous(max = 300) {
            let d = max;
            const U_ = P.unite, depuis = [[moyeu, [0, MOYEU.ry * U_]], [bras[0].b, [1.697 * U_, 2.653 * U_]], [bras[1].b, [-1.697 * U_, 2.653 * U_]]];
            for (const [corps, [x, y]] of depuis) {
              const a = corps.getWorldPoint(V(x, y)), b = new pl.Vec2(a.x, a.y + max / PPM);
              monde.rayCast(a, b, (f, pt, n, frac) => {
                const t = f.getBody().__type;
                if (t === "pince" || f.getFilterGroupIndex() === GROUPE_PINCE) return -1;
                d = Math.min(d, frac * max);
                return frac;
              });
            }
            return d;
          },
          pointes() {
            return bras.map((B) => {
              const w = B.b.getWorldPoint(V(-B.sg * 1.697 * U, 2.653 * U));
              return [w.x * PPM, w.y * PPM];
            });
          },
          // (15/10, test « pince à 100 % » : sur 14 bornes, presque aucun badge PORTÉ ; serré par le seul frottement de deux
          // bras de 600 N·m, le badge (≈ 440 N) glissait entre eux pendant la montée) LA PRISE : un badge que les bras
          // referment à leur portée pend au moyeu par un pivot entre les deux pointes (au-dessus de son centre : il pend et se
          // balance, comme dans le jeu) ; les bras le serrent toujours, et lacher() le rend à la gravité (glisse, goulotte)
          saisir(b) {
            if (prises.has(b) || !badges.has(b)) return;
            const [g, d] = p.pointes(), q = b.lire();
            b.reveiller();
            prises.set(b, monde.createJoint(new pl.RevoluteJoint({}, moyeu, b.corps, V((g[0] + d[0]) / 2, Math.min((g[1] + d[1]) / 2, q.y - 0.4 * b.r)))));
          },
          lacher() {
            for (const [b, j] of prises) if (badges.has(b)) monde.destroyJoint(j);
            prises.clear();
          },
          get prises() {
            return [...prises.keys()];
          },
          corps: [moyeu, bras[0].b, bras[1].b]
        };
        pince = p;
        return p;
      };
      let cout = 0;
      const pas = (dt) => {
        const t0 = (typeof performance !== "undefined" ? performance : Date).now();
        if (pince) for (const c of pince.corps) c.__forceMax = c.__hautMax = c.__durMax = c.__badgeMax = c.__enfonceMax = 0;
        evts.length = 0;
        reste = Math.min(reste + dt, R.pas * R.sousPasMax);
        const vm = R.vmax / PPM;
        const avant = /* @__PURE__ */ new Map();
        for (const b of badges) avant.set(b, b.corps.isAwake());
        let n = Math.floor((reste + 1e-9) / R.pas), i = 0;
        while (reste >= R.pas - 1e-9) {
          reste -= R.pas;
          i++;
          if (pince) {
            pince.piloter(R.pas, 1 / (n - i + 1));
            for (const c of pince.corps) c.__force = c.__forceHaut = c.__forceDur = c.__forceBadge = c.__enfonce = 0;
          }
          monde.step(R.pas, R.iterV, R.iterP);
          if (pince) for (const c of pince.corps) {
            c.__forceMax = Math.max(c.__forceMax || 0, c.__force);
            c.__hautMax = Math.max(c.__hautMax || 0, c.__forceHaut);
            c.__durMax = Math.max(c.__durMax || 0, c.__forceDur);
            c.__badgeMax = Math.max(c.__badgeMax || 0, c.__forceBadge);
            c.__enfonceMax = Math.max(c.__enfonceMax || 0, c.__enfonce);
          }
          for (const b of badges) {
            const v = b.corps.getLinearVelocity(), l = Math.hypot(v.x, v.y);
            if (l > vm) b.corps.setLinearVelocity(new pl.Vec2(v.x * vm / l, v.y * vm / l));
          }
          for (const a of accs) {
            const v = a.corps.getLinearVelocity(), l = Math.hypot(v.x, v.y);
            if (l > vm) a.corps.setLinearVelocity(new pl.Vec2(v.x * vm / l, v.y * vm / l));
          }
          const vif = (o2) => {
            const e = o2.__badge || o2.__acc;
            return o2.__type === "pince" || !!e && o2.isAwake() && (e.reveille || !e.fige);
          };
          for (const b of [...badges, ...accs]) {
            if (!b.fige || b.reveille || !b.corps.isAwake()) continue;
            let vrai = false;
            for (let e = b.corps.getContactList(); e && !vrai; e = e.next) {
              if (!e.contact.isTouching() || !e.contact.isEnabled()) continue;
              vrai = vif(e.other);
            }
            for (let e = b.corps.getJointList(); e && !vrai; e = e.next) vrai = vif(e.other);
            if (vrai) b.reveille = true;
            else b.corps.setAwake(false);
          }
        }
        for (const b of badges) {
          const ev = b.corps.isAwake();
          if (ev && !avant.get(b)) {
            if (!b.touche) {
              b.touche = true;
            }
            evts.push({ type: "reveil", b });
          }
          if (b.corps.getPosition().y * PPM > R.sortie && !b.sorti) {
            b.sorti = true;
            evts.push({ type: "sortie", b, x: b.corps.getPosition().x * PPM });
          }
        }
        for (const a of accs) if (a.corps.getPosition().y * PPM > R.sortie + 60) {
          a.sorti = true;
          accs.delete(a);
          monde.destroyBody(a.corps);
        }
        if (laBombe && laBombe.getPosition().y * PPM > R.sortie + 60) {
          monde.destroyBody(laBombe);
          laBombe = null;
        }
        if (ignores.size) {
          for (const [k, [a, b]] of ignores) if ((a.corps.isAwake() || b.corps.isAwake()) && !chevauchent(a.corps, b.corps)) ignores.delete(k);
        }
        const t1 = (typeof performance !== "undefined" ? performance : Date).now();
        cout = cout ? cout * 0.9 + (t1 - t0) * 0.1 : t1 - t0;
        return evts.slice();
      };
      const dedans = (B, x, y) => {
        const p = new pl.Vec2(x / PPM, y / PPM);
        for (let f = B.getFixtureList(); f; f = f.getNext()) if (f.getShape().getType() !== "edge" && f.testPoint(p)) return true;
        return false;
      };
      const bordsMonde = (B) => {
        const L = B.__bords;
        if (!L) {
          const out = [];
          for (let f = B.getFixtureList(); f; f = f.getNext()) {
            const v = f.getShape().m_vertices;
            if (!v) continue;
            for (let i = 0; i < v.length; i++) {
              const a = v[i], b = v[(i + 1) % v.length];
              out.push([a.x * PPM, a.y * PPM, b.x * PPM, b.y * PPM]);
            }
          }
          B.__bords = out;
          return bordsMonde(B);
        }
        if (B === fixe) return L;
        const t = B.getTransform();
        return L.map(([x0, y0, x1, y1]) => {
          const a = pl.Transform.mulVec2(t, V(x0, y0)), b = pl.Transform.mulVec2(t, V(x1, y1));
          return [a.x * PPM, a.y * PPM, b.x * PPM, b.y * PPM];
        });
      };
      const distSeg = (x, y, [ax, ay, bx, by]) => {
        const ex = bx - ax, ey = by - ay, l2 = ex * ex + ey * ey, t = l2 ? Math.max(0, Math.min(1, ((x - ax) * ex + (y - ay) * ey) / l2)) : 0;
        return Math.hypot(x - ax - ex * t, y - ay - ey * t);
      };
      const profondeur = (A, B) => {
        const LA = bordsMonde(A), LB = bordsMonde(B);
        let d = 0;
        if (!LB.length) return 0;
        for (const [x0, y0, x1, y1] of LA) for (const [x, y] of [[x0, y0], [(x0 + x1) / 2, (y0 + y1) / 2]]) if (dedans(B, x, y)) {
          let m = 1e9;
          for (const e of LB) m = Math.min(m, distSeg(x, y, e));
          d = Math.max(d, m);
        }
        return d;
      };
      const mesure = () => {
        let inter = 0, pire = 0;
        const parGenre = {}, paires = [];
        for (let c = monde.getContactList(); c; c = c.getNext()) {
          if (!c.isTouching() || !c.isEnabled()) continue;
          const a = c.getFixtureA().getBody(), b = c.getFixtureB().getBody();
          if (!a.__badge && !b.__badge) continue;
          const genre = [a.__type, b.__type].sort().join("-");
          const s = Math.max(profondeur(a, b), profondeur(b, a));
          if (s > pire) pire = s;
          if (s > 1) {
            inter++;
            parGenre[genre] = (parGenre[genre] || 0) + 1;
            paires.push([a, b, s]);
          }
        }
        let suspendus = 0, figesEnLAir = 0, eveilles = 0;
        const liste = [];
        for (const b of badges) {
          const c = b.corps;
          let appui = false;
          for (let e = c.getContactList(); e; e = e.next) if (e.contact.isTouching() && e.contact.isEnabled()) {
            appui = true;
            break;
          }
          if (c.isAwake()) eveilles++;
          if (!appui && c.getLinearVelocity().length() * PPM < 2) {
            if (b.touche) {
              suspendus++;
              liste.push(b);
            } else figesEnLAir++;
          }
        }
        return { interpenetrations: inter, parGenre, paires, pire, suspendus, figesEnLAir, eveilles, liste };
      };
      return {
        R,
        PPM,
        monde,
        ignores,
        decor,
        badge,
        retirer,
        croiser,
        pince: creerPince,
        pas,
        mesure,
        badges,
        accs,
        accessoire,
        souder,
        bombe,
        exploser,
        couvert,
        get laBombe() {
          return laBombe;
        },
        get cout() {
          return cout;
        },
        get laPince() {
          return pince;
        }
      };
    };
    window.__pcvCasinoPhysique = { creer, REGLAGES, ARRET, MARGE_MUR, PPM, BRAS, ARTIC, MOYEU, nettoyer, enveloppe, fusionner };
  })();
  window.__pcvCasinoPhysique.version = "db0482e13dbf";
}
(() => {
  const T = window.THREE;
  const LUMIERE_BORNE = { direction: [-0.408, -0.816, -0.408], diffuse: [1, 1, 1], ambiante: [0.5, 0.5, 0.5], speculaire: [0.2, 0.4, 0.4], brillance: 24 };
  const SRC = (s) => ({ 0: "vtx", 1: "fdif", 2: "fspe", 3: "t0", 4: "t1", 5: "t2", 6: "t0", 13: "buf", 14: "cst", 15: "prev" })[s] || "vec4(0.0)";
  const OPC = (s, o) => ({ 0: `${s}.rgb`, 1: `(1.0-${s}.rgb)`, 2: `${s}.aaa`, 3: `vec3(1.0-${s}.a)`, 4: `${s}.rrr`, 5: `vec3(1.0-${s}.r)`, 8: `${s}.ggg`, 9: `vec3(1.0-${s}.g)`, 12: `${s}.bbb`, 13: `vec3(1.0-${s}.b)` })[o] || `${s}.rgb`;
  const OPA = (s, o) => [`${s}.a`, `(1.0-${s}.a)`, `${s}.r`, `(1.0-${s}.r)`, `${s}.g`, `(1.0-${s}.g)`, `${s}.b`, `(1.0-${s}.b)`][o & 7];
  const CMB = (c, a, b, d, v3) => {
    const un = v3 ? "vec3(1.0)" : "1.0", demi = v3 ? "vec3(0.5)" : "0.5";
    switch (c) {
      case 0:
        return a;
      case 1:
        return `${a}*${b}`;
      case 2:
        return `${a}+${b}`;
      case 3:
        return `${a}+${b}-${demi}`;
      case 4:
        return `${a}*${d}+${b}*(${un}-${d})`;
      case 5:
        return `${a}-${b}`;
      case 6:
      case 7:
        return v3 ? `vec3(4.0*dot(${a}-0.5,${b}-0.5))` : `1.0`;
      case 8:
        return `${a}*${b}+${d}`;
      case 9:
        return `min(${a}+${b},${un})*${d}`;
      default:
        return a;
    }
  };
  const fragment = (p) => {
    const L = [];
    L.push("vec4 prev = vec4(0.0), buf = vec4(0.0), nbuf = uTampon, cst;");
    p.etages.forEach((e, i) => {
      const rien = e.comb_rgb === 0 && e.comb_a === 0 && e.src_rgb[0] === 15 && e.src_a[0] === 15;
      if (rien) {
        L.push(`buf = nbuf;`);
        return;
      }
      L.push(`cst = uCst[${i}];`);
      const r = [0, 1, 2].map((k) => OPC(SRC(e.src_rgb[k]), e.op_rgb[k])), a = [0, 1, 2].map((k) => OPA(SRC(e.src_a[k]), e.op_a[k]));
      L.push(`{ vec3 c = clamp((${CMB(e.comb_rgb, r[0], r[1], r[2], true)})*${e.echelle_rgb.toFixed(1)}, 0.0, 1.0);`);
      L.push(`  float al = clamp((${e.comb_a === 7 ? "c.r" : CMB(e.comb_a, a[0], a[1], a[2], false)})*${e.echelle_a.toFixed(1)}, 0.0, 1.0);`);
      L.push(`  vec4 sortie = vec4(c, al); buf = nbuf;`);
      if (i < 4 && p.tampon.maj_rgb[i]) L.push(`  nbuf.rgb = sortie.rgb;`);
      if (i < 4 && p.tampon.maj_a[i]) L.push(`  nbuf.a = sortie.a;`);
      L.push(`  prev = sortie; }`);
    });
    return L.join("\n");
  };
  const vert = `
    varying vec3 vN; varying vec3 vV; varying vec2 vUv0; varying vec2 vUv1; varying vec4 vCol;
    attribute vec4 couleur; attribute vec2 uv1b;
    uniform mat3 uTx0; uniform mat3 uTx1; uniform mat3 uTx2;
    varying vec2 vUv2;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vV = -mv.xyz; vN = normalMatrix * normal;
      vUv0 = (uTx0 * vec3(uv, 1.0)).xy; vUv1 = (uTx1 * vec3(uv, 1.0)).xy; vUv2 = (uTx2 * vec3(uv, 1.0)).xy;
      vCol = couleur;
      gl_Position = projectionMatrix * mv;
    }`;
  const materiau = (p, textures, options) => {
    const o = options || {}, lum = o.lumiere || LUMIERE_BORNE;
    const c01 = (c) => new T.Vector4(c[0] / 255, c[1] / 255, c[2] / 255, c[3] / 255);
    const consts = p.constantes.map(c01);
    const c0 = p.constantes[0], teintable = c0[0] === 255 && c0[1] === 128 && c0[2] === 0;
    const teinte = o.teinte != null && teintable ? new T.Color(o.teinte) : null;
    const U = {
      uT0: { value: textures[0] || null },
      uT1: { value: textures[1] || null },
      uT2: { value: textures[2] || null },
      uCst: { value: [0, 1, 2, 3, 4, 5].map(() => new T.Vector4()) },
      uConst: { value: consts },
      uTampon: { value: c01(p.tampon.initial) },
      uEmi: { value: c01(p.couleurs.emission) },
      uAmb: { value: c01(p.couleurs.ambiante) },
      uDif: { value: c01(p.couleurs.diffuse) },
      uSpe: { value: c01(p.couleurs.speculaire0) },
      uLumDir: { value: new T.Vector3(...lum.direction).negate().normalize() },
      uLumDif: { value: new T.Vector3(...lum.diffuse) },
      uLumAmb: { value: new T.Vector3(...lum.ambiante) },
      uLumSpe: { value: new T.Vector3(...lum.speculaire) },
      uBrillance: { value: lum.brillance },
      uTx0: { value: new T.Matrix3() },
      uTx1: { value: new T.Matrix3() },
      uTx2: { value: new T.Matrix3() }
    };
    const majConstantes = () => {
      for (let i = 0; i < 6; i++) {
        const k = p.affectation[i] || 0, c = U.uConst.value[k];
        U.uCst.value[i].copy(c);
        if (k === 0 && teinte) U.uCst.value[i].set(teinte.r, teinte.g, teinte.b, c.w);
      }
    };
    majConstantes();
    const avec = (i) => textures[i] ? 1 : 0;
    const m = p.melange, blend = m.src_rgb === 6 && m.dst_rgb === 7, additif = m.src_rgb === 6 && m.dst_rgb === 1;
    const fs = `
      uniform sampler2D uT0; uniform sampler2D uT1; uniform sampler2D uT2; uniform vec4 uCst[6]; uniform vec4 uTampon;
      uniform vec4 uEmi; uniform vec4 uAmb; uniform vec4 uDif; uniform vec4 uSpe;
      uniform vec3 uLumDir; uniform vec3 uLumDif; uniform vec3 uLumAmb; uniform vec3 uLumSpe; uniform float uBrillance;
      varying vec3 vN; varying vec3 vV; varying vec2 vUv0; varying vec2 vUv1; varying vec2 vUv2; varying vec4 vCol;
      void main() {
        vec3 N = length(vN) > 1e-4 ? normalize(vN) : vec3(0.0, 0.0, 1.0); if (!gl_FrontFacing) N = -N;
        vec3 V = normalize(vV), Ld = normalize((viewMatrix * vec4(uLumDir, 0.0)).xyz), H = normalize(Ld + V);
        float nl = max(dot(N, Ld), 0.0);
        vec4 vtx = vCol;
        vec4 fdif = vec4(clamp(uEmi.rgb + uAmb.rgb * uLumAmb + uDif.rgb * uLumDif * nl, 0.0, 1.0), 1.0);
        vec4 fspe = vec4(clamp(uSpe.rgb * uLumSpe * pow(max(dot(N, H), 0.0), uBrillance) * step(0.0001, nl), 0.0, 1.0), 1.0);
        vec4 t0 = ${avec(0) ? "texture2D(uT0, vUv0)" : "vec4(1.0)"};
        vec4 t1 = ${avec(1) ? "texture2D(uT1, vUv1)" : "vec4(1.0)"};
        vec4 t2 = ${avec(2) ? "texture2D(uT2, vUv2)" : "vec4(1.0)"};
        ${fragment(p)}
        ${p.alpha_test.actif ? `if (!(${["false", "true", "prev.a == R", "prev.a != R", "prev.a < R", "prev.a <= R", "prev.a > R", "prev.a >= R"][p.alpha_test.fonction].replace(/R/g, (p.alpha_test.ref / 255).toFixed(4))})) discard;` : ""}
        gl_FragColor = ${o.debug ? `vec4((${o.debug}).rgb, 1.0)` : "prev"};
        ${blend || additif ? "" : "gl_FragColor.a = 1.0;"}
        ${o.lineaire ? "gl_FragColor.rgb = pow(max(gl_FragColor.rgb, vec3(0.0)), vec3(2.2));" : ""}
      }`;
    const mat = new T.ShaderMaterial({
      uniforms: U,
      vertexShader: vert,
      fragmentShader: fs,
      transparent: blend || additif,
      blending: blend || additif ? T.CustomBlending : T.NoBlending,
      blendSrc: T.SrcAlphaFactor,
      blendDst: additif ? T.OneFactor : T.OneMinusSrcAlphaFactor,
      blendSrcAlpha: T.ZeroFactor,
      blendDstAlpha: T.OneFactor,
      depthWrite: !(blend || additif) || p.profondeur.ecriture,
      side: T.DoubleSide
    });
    mat.userData.pica = p;
    mat.userData.majConstantes = majConstantes;
    mat.userData.teinte = (c) => {
      if (teinte) {
        teinte.set(c);
        majConstantes();
      }
    };
    return mat;
  };
  const habiller = async (gltf, options) => {
    const parser = gltf.parser, cache = /* @__PURE__ */ new Map();
    const tex = async (i) => {
      if (i == null) return null;
      if (!cache.has(i)) cache.set(i, parser.getDependency("texture", i).then((t) => {
        t.flipY = false;
        t.colorSpace = T.NoColorSpace || "";
        return t;
      }));
      return cache.get(i);
    };
    const mats = [];
    const parcours = [];
    gltf.scene.traverse((o) => {
      if (o.isMesh) parcours.push(o);
    });
    for (const o of parcours) {
      const p = o.material.userData?.pica || parser.json.materials[parser.associations.get(o.material)?.materials]?.extras?.pica;
      if (!p) continue;
      const t = await Promise.all((p.textures || []).map(tex));
      const g = o.geometry;
      if (!g.attributes.couleur) {
        const col = g.attributes.color;
        const n = g.attributes.position.count;
        g.setAttribute("couleur", col ? col : new T.BufferAttribute(new Float32Array(n * 4).fill(1), 4));
      }
      if (!g.attributes.uv) g.setAttribute("uv", new T.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
      const nom = o.material.name;
      o.material = materiau(p, t, options);
      o.material.name = nom;
      mats.push(o.material);
      o.renderOrder = o.parent?.userData?.couche ?? 0;
    }
    gltf.userData.materiauxPica = mats;
    const ex = parser.json.nodes.find((n) => n.extras?.animations_materiau)?.extras || {};
    gltf.userData.anims = ex.animations_materiau || [];
    gltf.userData.textures = ex.textures || {};
    gltf.userData.texturesPretes = {};
    await Promise.all(Object.entries(gltf.userData.textures).map(async ([nom, i]) => {
      gltf.userData.texturesPretes[nom] = await tex(i);
    }));
    return mats;
  };
  const valeur = (el, f) => {
    const v = el.valeurs;
    if (!v?.length) return null;
    const n = v.length - 1, i = Math.max(0, Math.min(n, f)), a = Math.floor(i), b = Math.min(n, a + 1), t = i - a;
    const va = v[a];
    if (!va) return null;
    return va.map((x, k) => x == null ? null : x + ((v[b]?.[k] ?? x) - x) * t);
  };
  const CIBLE_CONST = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5 };
  const appliquer = (gltf, anim, f) => {
    const mats = gltf.userData.materiauxPica || [];
    for (const el of anim.elements) {
      if (el.booleens) {
        const v2 = el.booleens[Math.max(0, Math.min(el.booleens.length - 1, Math.floor(f)))];
        const parNoeud = gltf.userData.parNoeud ||= /* @__PURE__ */ new Map();
        let l = parNoeud.get(el.cible);
        if (!l) {
          l = [];
          gltf.scene.traverse((o) => {
            if (o.isMesh && (o.userData?.noeud === el.cible || o.parent?.userData?.noeud === el.cible)) l.push(o);
          });
          parNoeud.set(el.cible, l);
        }
        for (const o of l) o.visible = v2;
        continue;
      }
      const v = valeur(el, f);
      if (!v) continue;
      for (const mat of mats.filter((m) => m.name === el.cible)) {
        if (el.type_cible in CIBLE_CONST) {
          const c = mat.uniforms.uConst.value[CIBLE_CONST[el.type_cible]];
          if (v[0] != null) c.x = v[0];
          if (v[1] != null) c.y = v[1];
          if (v[2] != null) c.z = v[2];
          if (v[3] != null) c.w = v[3];
          mat.userData.majConstantes();
        } else if (el.type_cible === 13 && anim.textures) {
          const t = gltf.userData.texturesPretes?.[anim.textures[Math.round(v[0])]];
          if (t) mat.uniforms.uT0.value = t;
        }
      }
    }
  };
  const animer = (gltf, nom, f) => {
    const a = (gltf.userData.anims || []).find((x) => x.nom === nom);
    if (a) appliquer(gltf, a, a.boucle ? f % a.images : Math.min(f, a.images));
  };
  const chiffres = (gltf, n) => {
    const A = (nom, f) => animer(gltf, nom, f);
    if (n == null) {
      A("AnCaObBody_FontCenter", 0);
      A("AnCaObBody_FontL", 0);
      A("AnCaObBody_FontR", 0);
      return;
    }
    if (n < 10) {
      A("AnCaObBody_FontCenter", n);
    } else {
      A("AnCaObBody_FontL", Math.floor(n / 10) % 10);
      A("AnCaObBody_FontR", n % 10);
    }
  };
  window.__pcvPicaTev = { habiller, animer, chiffres, materiau, LUMIERE_BORNE };
})();
(() => {
  window.__pcvCasinoBadges?.fin?.();
  const T = window.THREE, E = window.__pcvESM;
  if (!T || !E?.GLTFLoader) return "casino : three.js ou son GLTFLoader absent";
  const Tr = window.__pcvT || ((c) => c);
  const fins = [];
  const lire = (k, d) => {
    try {
      const v = localStorage.getItem(k);
      return v == null ? d : JSON.parse(v);
    } catch (e) {
      return d;
    }
  };
  const ecrire = (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {
    }
  };
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lisse = (x) => (x = clamp(x, 0, 1)) * x * (3 - 2 * x);
  const amortir = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
  const echap = (s) => String(s).replace(/[&<>"']/g, (c) => "&#" + c.charCodeAt(0) + ";");
  const css = (s) => s.replace(/(-?\d*\.?\d+)u\b/g, "calc(var(--u) * $1)");
  const jourDe = (d = /* @__PURE__ */ new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const graine = (s) => {
    let h = 1779033703 ^ s.length;
    for (let i = 0; i < s.length; i++) {
      h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
      h = h << 13 | h >>> 19;
    }
    return () => {
      h = Math.imul(h ^ h >>> 16, 2246822507);
      h = Math.imul(h ^ h >>> 13, 3266489909);
      return ((h ^= h >>> 16) >>> 0) / 4294967296;
    };
  };
  const melanger = (t, r) => {
    for (let i = t.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [t[i], t[j]] = [t[j], t[i]];
    }
    return t;
  };
  const CLE = { parties: "pcv-arcade-parties", boite: "pcv-arcade-boite", jour: "pcv-arcade-jour", mode: "pcv-arcade-grands" };
  const OFFERTES = 10, JETONS_PAR_PARTIE = 10, BONUS_ENTRAINEMENT = 2, NB_SERIES = 7, LOTS = 28, MORCEAUX_PAR_MACHINE = 10;
  const BORNES_SERIES = 4;
  let index = null, attenteIndex = null, seriesPar = /* @__PURE__ */ new Map(), morceauxDe = /* @__PURE__ */ new Map(), morceauDe = /* @__PURE__ */ new Map();
  const chargerIndex = () => attenteIndex ||= (async () => {
    try {
      const A = window.__pcvArcade?.charger;
      if (A) {
        const j2 = await A();
        if (j2?.series?.length) return j2;
      }
      const j = JSON.parse(new TextDecoder().decode(await octets("badges/index.json", "application/json")));
      return j?.series?.length ? j : null;
    } catch (e) {
      return null;
    }
  })().then((j) => {
    index = j;
    if (!j) {
      attenteIndex = null;
      return j;
    }
    seriesPar = /* @__PURE__ */ new Map();
    morceauxDe = /* @__PURE__ */ new Map();
    morceauDe = /* @__PURE__ */ new Map();
    for (const s of j.series) {
      s.lots = [];
      s.tailles = {};
      for (const b of s.badges || []) {
        const o = typeof b === "string" ? { fichier: b, cases: s.grands?.[b] } : b, f = o.fichier || String(o.id).split("/").pop();
        if (o.morceau) {
          morceauDe.set(o.id || `${s.id}/${f}`, o.morceau);
          continue;
        }
        s.lots.push(f);
        if (o.cases && o.cases[0] * o.cases[1] > 1) s.tailles[f] = o.cases;
        if (o.morceaux) morceauxDe.set(`${s.id}/${f}`, o.morceaux);
      }
      seriesPar.set(s.id, s);
    }
    morceauDe.forEach((m, id) => m.k = morceauxDe.get(m.de)?.indexOf(id) ?? 0);
    return j;
  });
  const tailleDe = (id) => {
    const [sid, f] = String(id).split("/");
    return seriesPar.get(sid)?.tailles[f] || [1, 1];
  };
  const LANGUES_NOMS = { fr: 0, en: 1, es: 2 };
  const nomComplet = (id) => {
    const m = morceauDe.get(id);
    if (m) return nomComplet(m.de);
    const f = String(id).split("/").pop().replace(/\.png$/, ""), N = vraies?.noms || nomsSeuls, i = N && (N.b[f] ?? N.b[f + "_Sep"]);
    return i == null ? null : N.t[i]?.[LANGUES_NOMS[window.__pcvLangue?.()] ?? 0] || null;
  };
  const parties = () => {
    const p = lire(CLE.parties, null) || { jour: "", offertes: 0, bonus: 0, jetons: 0, bonusJetons: 0 };
    if (p.jour !== jourDe()) {
      Object.assign(p, { jour: jourDe(), offertes: OFFERTES, jetons: 0, bonusJetons: 0 });
      ecrire(CLE.parties, p);
    }
    if (!(p.bonus >= 0)) p.bonus = 0;
    return p;
  };
  const totalParties = () => {
    const p = parties();
    return p.offertes + p.bonus;
  };
  const depenser = () => {
    if (essai()) return true;
    const p = parties();
    if (p.offertes > 0) p.offertes--;
    else if (p.bonus > 0) p.bonus--;
    else return false;
    ecrire(CLE.parties, p);
    return true;
  };
  const boite = () => lire(CLE.boite, {});
  const essai = () => lire("pcv-casino-illimite", false) === true;
  const nbMorceaux = (b, id) => {
    const p = morceauxDe.get(id);
    return !p ? b[id] ? 1 : 0 : b[id] ? p.length : p.filter((x) => b[x]).length;
  };
  const complet = (b, id) => nbMorceaux(b, id) === (morceauxDe.get(id)?.length || 1);
  const possede = (b, id) => nbMorceaux(b, id) > 0;
  const modeGrands = () => lire(CLE.mode, "morceaux") === "entiers" ? "entiers" : "morceaux";
  const etatJour = () => {
    const e = lire(CLE.jour, null);
    return e?.jour === jourDe() ? e : { jour: jourDe(), gagnes: {} };
  };
  const enregistrer = (m, id) => {
    const b = boite(), n = (b[id]?.n || 0) + 1;
    b[id] = { n, t: b[id]?.t || Date.now() };
    ecrire(CLE.boite, b);
    const e = etatJour();
    (e.gagnes[m.cle] ||= []).push(id);
    ecrire(CLE.jour, e);
    m.file = m.file.filter((x) => x !== id);
    return n;
  };
  let machines = [], machinesDe = "";
  const ENTRAINEMENT = { cle: "entrainement", type: "pince", entrainement: true, nom: Tr("casino.entrainement"), sous: Tr("casino.badges_carton_gratuit"), famille: "Entra\xEEnement", stock: [] };
  const machineDe = (s, type, stock) => ({ cle: s.id, type, serie: s, nom: s.nom, sous: s.sous, famille: s.famille, stock });
  const stockDe = (s, type, mode, r, b) => {
    const petits = melanger(s.lots.filter((f) => !s.tailles[f]), r).map((f) => `${s.id}/${f}`), grands = s.lots.filter((f) => s.tailles[f]).map((f) => `${s.id}/${f}`);
    if (mode === "entiers") {
      const g = melanger(grands.filter((id) => tailleDe(id)[0] <= 2), r).slice(0, Math.max(type === "pousseur" ? 3 : 2, Math.min(12, LOTS - petits.length)));
      return melanger([...g, ...petits.slice(0, LOTS - g.length)], r);
    }
    const quota = Math.max(MORCEAUX_PAR_MACHINE, LOTS - petits.length), morceaux = [];
    const commences = melanger(grands.filter((id) => possede(b, id) && !complet(b, id)), r), neufs = melanger(grands.filter((id) => !possede(b, id)), r);
    for (const id of [...commences, ...neufs]) {
      const manque = morceauxDe.get(id)?.filter((p) => !b[p]) || [];
      if (morceaux.length && morceaux.length + manque.length > quota) break;
      morceaux.push(...manque);
    }
    return melanger([...morceaux, ...petits.slice(0, Math.max(0, LOTS - morceaux.length))], r);
  };
  const machinesDuJour = (mode) => {
    const r = graine("arcade " + jourDe()), b = boite(), liste = [ENTRAINEMENT];
    if (!index) return liste;
    const commencees = mode === "morceaux" ? melanger(index.series.filter((s) => s.lots.some((f) => {
      const id = `${s.id}/${f}`;
      return morceauxDe.has(id) && possede(b, id) && !complet(b, id);
    })), r).slice(0, 2) : [];
    const parFamille = {}, choisies = [...commencees];
    for (const s of commencees) parFamille[s.famille] = (parFamille[s.famille] || 0) + 1;
    for (const s of melanger(index.series.filter((s2) => s2.lots.length >= 12 && !commencees.includes(s2)), r)) {
      if (choisies.length >= NB_SERIES) break;
      if ((parFamille[s.famille] || 0) >= 2) continue;
      parFamille[s.famille] = (parFamille[s.famille] || 0) + 1;
      choisies.push(s);
    }
    const pousseurs = new Set(melanger([...choisies.keys()], r).slice(0, 2));
    choisies.forEach((s, i) => {
      const type = pousseurs.has(i) ? "pousseur" : "pince";
      liste.push(machineDe(s, type, stockDe(s, type, mode, r, b)));
    });
    return liste;
  };
  const habillerVraie = (m) => {
    m.vraie = machineVraie(m);
    m.geo = m.vraie && pinceGltf ? GEO_VRAIE : GEO_DESSIN;
  };
  const preparerMachines = () => {
    const mode = modeGrands(), cle = jourDe() + (index ? ":i:" : ":") + mode + (vraies ? ":v" : "");
    if (machinesDe === cle && machines.length) return false;
    machinesDe = cle;
    const e = etatJour();
    let liste = null;
    if (index && e.mode === mode && e.machines?.length) liste = [ENTRAINEMENT, ...e.machines.filter((d) => seriesPar.has(d.cle)).map((d) => machineDe(seriesPar.get(d.cle), d.type, d.stock))];
    if (!liste || liste.length < 2) {
      liste = machinesDuJour(mode);
      if (index) {
        e.mode = mode;
        e.machines = liste.filter((d) => !d.entrainement).map((d) => ({ cle: d.cle, type: d.type, stock: d.stock }));
        ecrire(CLE.jour, e);
      }
    }
    machines = liste.slice(0, 1 + BORNES_SERIES).map((d) => ({ ...d, theme: themeDe(d), file: d.stock.filter((id) => !e.gagnes[d.cle]?.includes(id)), monde: null, jeu: null }));
    machines.forEach(habillerVraie);
    const tirage = melanger(VARIANTES.slice(), graine("plateaux " + jourDe()));
    let k = 0;
    for (const m of machines) if (!m.entrainement && m.theme !== "mktv" && m.theme !== "niveau") m.plateau = tirage[k++ % tirage.length];
    return true;
  };
  const NIVEAU = /^(MroSMB|MroMkr\d?|FcRemix\d?)$/;
  const themeDe = (d) => d.entrainement ? "carton" : d.cle === "MroKrt8" ? "mktv" : NIVEAU.test(d.cle) ? "niveau" : DECOR_SERIE[d.cle] || DECOR_FAMILLE[d.famille] || "trait";
  const BORNE = { DY: 0, DH: 6, DF: 1.5 };
  const VITRE = { x0: -5.83, x1: 5.83, y0: 5.53 + BORNE.DY, y1: 12.85 + BORNE.DY + BORNE.DH, z: 10.16 };
  const ZONE_JEU = { x0: -7.65, x1: 7.65, y0: VITRE.y0 + 2.03, y1: VITRE.y1 - 0.25 };
  const W = 760, S = (ZONE_JEU.x1 - ZONE_JEU.x0) / W, H = Math.round((ZONE_JEU.y1 - ZONE_JEU.y0) / S), G = 1500, MU_S = 0.55, MU_K = 0.35;
  const VITRE_CADRAGE = { y0: VITRE.y0, y1: ZONE_JEU.y1 };
  const H0 = Math.round((12.85 - 5.53) / S);
  const R_BADGE = 52, K = 1.25;
  const contact = (a, b, nx, ny, d, kdx, kdy, mus, muk) => {
    const wa = a.w, wb = b ? b.w : 0, ws = wa + wb;
    if (ws <= 0) return;
    const fa = wa / ws, fb = wb / ws;
    a.x += nx * d * fa;
    a.y += ny * d * fa;
    if (b) {
      b.x -= nx * d * fb;
      b.y -= ny * d * fb;
    }
    a.touche = true;
    if (b) b.touche = true;
    if (ny < -0.5) a.appui = true;
    if (b && ny > 0.5) b.appui = true;
    const rx = a.x - a.px - (b ? b.x - b.px : kdx), ry = a.y - a.py - (b ? b.y - b.py : kdy);
    const rn = rx * nx + ry * ny, tx = rx - rn * nx, ty = ry - rn * ny, lt = Math.hypot(tx, ty);
    if (!lt) return;
    const k = lt < mus * d ? 1 : Math.min(muk * d / lt, 1);
    a.x -= tx * k * fa;
    a.y -= ty * k * fa;
    if (b) {
      b.x += tx * k * fb;
      b.y += ty * k * fb;
    }
  };
  const enfoncement = (p, s) => {
    const ex = s.bx - s.ax, ey = s.by - s.ay, l2 = ex * ex + ey * ey;
    const t = l2 ? clamp(((p.x - s.ax) * ex + (p.y - s.ay) * ey) / l2, 0, 1) : 0, dx = p.x - s.ax - ex * t, dy = p.y - s.ay - ey * t;
    return { d: p.r + s.r - Math.hypot(dx, dy), dx, dy, ex, ey, l2 };
  };
  const contreCapsule = (p, s) => {
    const e = enfoncement(p, s);
    if (e.d <= 0) return;
    if (s.v != null) p.kin = Math.max(p.kin, s.v * 0.6);
    let l = Math.hypot(e.dx, e.dy), nx, ny;
    if (l > 1e-6) {
      nx = e.dx / l;
      ny = e.dy / l;
    } else {
      l = Math.sqrt(e.l2) || 1;
      nx = -e.ey / l;
      ny = e.ex / l;
    }
    contact(p, null, nx, ny, e.d * (s.souple ?? 1), s.dx || 0, s.dy || 0, s.mus ?? MU_S, s.muk ?? MU_K);
  };
  const tige = (c) => {
    const P = c.parts;
    for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
      const a = P[i], b = P[j], L = (j - i) * c.ecart, ws = a.w + b.w;
      if (!ws) continue;
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1e-6, k = (d - L) / d / ws;
      a.x += dx * k * a.w;
      a.y += dy * k * a.w;
      b.x -= dx * k * b.w;
      b.y -= dy * k * b.w;
    }
  };
  const reveiller = (p) => {
    if (!p.dort) return;
    for (const q of p.c.parts) {
      if (!q.dort) continue;
      q.dort = false;
      q.w = q.wDort;
      q.calme = 0;
      q.px = q.x;
      q.py = q.y;
    }
  };
  const SOMMEIL = 1, VOISINAGE = 2.6;
  const reveillerAutour = (mo, p) => {
    for (const q of mo.parts) if (q.dort && Math.hypot(q.x - p.x, q.y - p.y) < (p.r + q.r) * VOISINAGE / 2) reveiller(q);
  };
  const bouger = (mo, dt) => {
    mo.t = (mo.t || 0) + dt;
    for (const s_ of mo.segs) {
      if (s_.tapis) {
        s_.dx = s_.tapis * dt;
        s_.dy = 0;
      }
      const B_ = s_.bascule;
      if (!B_) continue;
      const a = B_.amp * Math.sin(mo.t * Math.PI * 2 / B_.periode), ux = Math.cos(a) * B_.demi, uy = Math.sin(a) * B_.demi;
      const ax = B_.cx - ux, ay = B_.cy - uy, bx = B_.cx + ux, by = B_.cy + uy;
      s_.dx = (ax + bx - (s_.ax + s_.bx)) / 2;
      s_.dy = (ay + by - (s_.ay + s_.by)) / 2;
      s_.dyA = ay - s_.ay;
      s_.dyB = by - s_.by;
      s_.ax = ax;
      s_.ay = ay;
      s_.bx = bx;
      s_.by = by;
      s_.angle = a;
    }
  };
  const pasPhysique = (mo, dt) => {
    for (const e of mo.phys.pas(dt)) {
      const c = e.b?.donnees;
      if (!c) continue;
      if (e.type === "choc") {
        mo.chocs = (mo.chocs || 0) + 1;
        if (mo.enJeu && mo.prise) c.pince = true;
      } else if (e.type === "pose") mo.poses = (mo.poses || 0) + 1;
    }
    for (const c of mo.corps) {
      if (!c.pb) continue;
      const p = c.parts[0], [u, v] = c.pb.point(64 + (c.vrai?.c[0] ?? 0), 64 + (c.vrai?.c[1] ?? 0)), [x, y] = ecranVersMonde(u, v);
      p.px = p.x;
      p.py = p.y;
      p.x = x;
      p.y = y;
      c.ang = c.pb.lire().a;
    }
  };
  const pas = (mo, dt) => {
    if (mo.phys) return pasPhysique(mo, dt);
    const g = G * dt * dt, P = mo.parts, n = P.length;
    bouger(mo, dt);
    for (const p of P) {
      p.appui = p.touche = p.mobile = false;
      p.kin = -1;
      if (p.tenu || p.dort) {
        p.vit = 0;
        continue;
      }
      let vx = p.x - p.px, vy = p.y - p.py;
      const v = Math.hypot(vx, vy);
      if (v > 10) {
        vx *= 10 / v;
        vy *= 10 / v;
      }
      const fl = p.c.flotte ? FLOTTE : 0.998;
      p.vx0 = vx * fl;
      p.vy0 = vy * fl + (p.c.flotte ? 0 : g);
      p.vit = v;
      p.px = p.x;
      p.py = p.y;
      p.x += p.vx0;
      p.y += p.vy0;
    }
    for (let it = 0; it < 7; it++) {
      for (let i = 0; i < n; i++) {
        const a = P[i];
        for (let j = i + 1; j < n; j++) {
          const b = P[j];
          if (a.c === b.c || a.dort && b.dort || a.c.croise?.has(b.c)) continue;
          const dx = a.x - b.x, dy = a.y - b.y, R = a.r + b.r;
          if (dx > R || dx < -R || dy > R || dy < -R) continue;
          const d2 = dx * dx + dy * dy;
          if (d2 >= R * R || d2 < 1e-9) continue;
          const d = Math.sqrt(d2);
          if (a.dort !== b.dort) {
            const [dormeur, autre] = a.dort ? [a, b] : [b, a];
            if ((autre.vit > 0.7 || autre.tenu) && R - d > 0.5) reveiller(dormeur);
          }
          if (a.tenu) b.c.pince = true;
          else if (b.tenu) a.c.pince = true;
          contact(a, b, dx / d, dy / d, R - d, 0, 0, MU_S, MU_K);
        }
      }
      for (const c of mo.corps) if (c.parts.length > 1) tige(c);
      for (const s of mo.segs) for (const p of P) {
        if (s.tapis || s.bascule) {
          if (enfoncement(p, s).d > -2) {
            if (p.dort) reveiller(p);
            p.mobile = true;
            if (s.bascule) {
              const t_ = clamp((p.x - s.ax) / (s.bx - s.ax || 1), 0, 1), dy = s.dyA + (s.dyB - s.dyA) * t_;
              if (dy < 0) p.y += dy;
            }
          }
        }
        if (!p.dort) contreCapsule(p, s);
      }
      for (const s of mo.cines) for (const p of P) {
        if (enfoncement(p, s).d > 0) {
          if (!p.c.pince || p.dort) {
            if (!mo.vrai) reveillerAutour(mo, p);
            mo.chocs = (mo.chocs || 0) + 1;
          }
          p.c.pince = true;
          reveiller(p);
        }
        contreCapsule(p, s);
      }
    }
    for (const p of P) {
      if (p.tenu || p.dort) continue;
      if (p.kin >= 0) {
        const vx = p.x - p.px, vy = p.y - p.py, v = Math.hypot(vx, vy), lim = p.kin + 0.25;
        if (v > lim) {
          p.px = p.x - vx * lim / v;
          p.py = p.y - vy * lim / v;
        }
      }
      const dvx = p.x - p.px - p.vx0, dvy = p.y - p.py - p.vy0, dv = Math.hypot(dvx, dvy);
      if (dv > 2.5) {
        p.px = p.x - p.vx0 - dvx * 2.5 / dv;
        p.py = p.y - p.vy0 - dvy * 2.5 / dv;
      }
      if (p.touche) {
        const vx = p.x - p.px, vy = p.y - p.py, v = Math.hypot(vx, vy);
        if (v > 3) {
          p.px = p.x - vx * 3 / v;
          p.py = p.y - vy * 3 / v;
        }
      }
    }
    for (const p of P) {
      if (p.appui && !p.tenu && !p.dort) {
        if ((p.vit || 0) > POSE_BRUIT) mo.poses = (mo.poses || 0) + 1;
        p.px += (p.x - p.px) * 0.08;
        p.py += (p.y - p.py) * 0.08;
      }
    }
    for (const p of P) {
      if (p.dort || p.tenu || Math.hypot(p.x - p.px, p.y - p.py) < 0.9) continue;
      for (const q of P) if (q.dort && Math.hypot(q.x - p.x, q.y - p.y) < p.r + q.r + (mo.vrai ? 2 : 12)) reveiller(q);
    }
    for (const c of mo.corps) {
      const Q = c.parts;
      if (Q[0].dort || Q.some((p) => p.tenu)) continue;
      let calme2 = true;
      for (const p of Q) {
        p.calme = Math.hypot(p.x - p.px, p.y - p.py) < 0.04 && (p.appui || p.touche) ? (p.calme || 0) + dt : 0;
        if (p.calme < SOMMEIL || p.mobile) calme2 = false;
      }
      if (calme2) for (const p of Q) {
        p.dort = true;
        p.wDort = p.w;
        p.w = 0;
        p.px = p.x;
        p.py = p.y;
      }
    }
    for (const c of mo.corps) {
      const Q = c.parts;
      if (Q.length > 1) c.ang = Math.atan2(Q[Q.length - 1].y - Q[0].y, Q[Q.length - 1].x - Q[0].x) - c.axe;
      else if (Q[0].appui && !Q[0].tenu && !Q[0].dort) c.ang = clamp(c.ang * 0.995 + (Q[0].x - Q[0].px) / Q[0].r * 0.3, -0.6, 0.6);
    }
  };
  const ajouterCorps = (mo, c, x, y, ang = 0) => {
    const [col, rang] = c.taille, n = Math.max(col, rang);
    c.axe = col >= rang ? 0 : Math.PI / 2;
    c.ang = ang;
    if (col === rang) {
      const r = c.r ?? R_BADGE * n;
      c.parts = [{ x, y, px: x, py: y, r, w: 1 / (1.3 * Math.max(1, (r / R_BADGE) ** 2)), c }];
    } else {
      c.ecart = R_BADGE * 2.2;
      const a = ang + c.axe, ux = Math.cos(a), uy = Math.sin(a);
      c.parts = Array.from({ length: n }, (_, k) => {
        const o = (k - (n - 1) / 2) * c.ecart, px = x + ux * o, py = y + uy * o;
        return { x: px, y: py, px, py, r: R_BADGE, w: 1 / 1.6, c };
      });
    }
    mo.corps.push(c);
    mo.parts.push(...c.parts);
    return c;
  };
  const retirerCorps = (mo, c) => {
    mo.corps = mo.corps.filter((k) => k !== c);
    mo.parts = mo.parts.filter((p) => p.c !== c);
    if (c.pb && mo.phys) mo.phys.retirer(c.pb);
  };
  const cinematiques = (mo, caps) => {
    if (!caps.length) {
      mo.cines = [];
      mo.cinesPrec = null;
      return;
    }
    mo.cines = caps.map((k, i) => {
      const v = mo.cinesPrec?.[i];
      const dx = v ? Math.max(Math.abs(k[0] - v.ax), Math.abs(k[2] - v.bx)) * Math.sign(k[0] + k[2] - v.ax - v.bx) : 0, dy = v ? Math.max(Math.abs(k[1] - v.ay), Math.abs(k[3] - v.by)) * Math.sign(k[1] + k[3] - v.ay - v.by) : 0;
      return { ax: k[0], ay: k[1], bx: k[2], by: k[3], r: k[4], mus: 0.03, muk: 0.01, dx, dy, v: Math.hypot(dx, dy), souple: 0.45 };
    });
    mo.cinesPrec = mo.cines;
  };
  const calme = (mo) => mo.phys ? mo.corps.every((c) => !c.pb || Math.hypot(...c.pb.vitesse()) < 4) : mo.parts.every((p) => p.tenu || Math.abs(p.x - p.px) + Math.abs(p.y - p.py) < 0.25);
  const PLATEAUX = {
    // entraînement (« Practice Catcher », capture entrainement.png) : la colline verte qui descend vers la goulotte
    carton: { sol: [[0, 0.62], [0.1, 0.64], [0.21, 0.7], [0.33, 0.74], [0.46, 0.79], [0.6, 0.83], [0.72, 0.84], [0.77, 0.8]], blocs: [[0.425, 0.61, 0.445, 0.79]], bascule: { c: [0.435, 0.605], demi: 0.17, amp: 0.1, periode: 7.5 } },
    // la glace (bord blanc ondulé) est toujours en cuvette : un badge lâché glisse vers le creux, jamais tout seul dans la
    // goulotte ; il faut le porter au-dessus d'elle
    // Mario Kart 8 (capture pince.jpg) : la cuvette de glace, relevée côté goulotte
    cuvette: { sol: [[0, 0.6], [0.09, 0.7], [0.2, 0.8], [0.34, 0.86], [0.5, 0.87], [0.62, 0.83], [0.72, 0.74], [0.77, 0.72]], glace: true },
    // Super Mario Bros. (capture pince-smb.jpg) : bassin de glace aux bords relevés, une rangée de blocs de sol au milieu
    bassin: { sol: [[0, 0.56], [0.1, 0.7], [0.2, 0.82], [0.52, 0.84], [0.62, 0.8], [0.71, 0.68], [0.77, 0.66]], glace: true, blocs: [[0.27, 0.73, 0.45, 0.84]] },
    // Mario et ses amis (capture approche.jpg) : les marches de gauche à droite
    marches: { sol: [[0, 0.6], [0.24, 0.6], [0.24, 0.68], [0.46, 0.68], [0.46, 0.77], [0.62, 0.77], [0.62, 0.84], [0.73, 0.84], [0.77, 0.8]] },
    // une plateforme suspendue au milieu : des badges dessus, d'autres dessous, à demi cachés
    // (8/10 : relevée de .52 à .46 : dessous, la place qu'il faut à la pince pour passer à côté et prendre un badge posé au
    // ras de la plateforme ; plus bas, ses doigts restaient pris contre le bord)
    plateforme: { sol: [[0, 0.78], [0.3, 0.8], [0.55, 0.82], [0.72, 0.84], [0.77, 0.79]], blocs: [[0.18, 0.46, 0.44, 0.51]] },
    // une bosse au milieu : les badges se calent de part et d'autre, le sommet est vide
    bosse: { sol: [[0, 0.76], [0.16, 0.8], [0.3, 0.7], [0.38, 0.64], [0.46, 0.7], [0.6, 0.82], [0.72, 0.84], [0.77, 0.79]] },
    // un muret au milieu qui barre le chemin de la goulotte : il faut soulever par-dessus
    muret: { sol: [[0, 0.7], [0.2, 0.74], [0.42, 0.76], [0.62, 0.8], [0.72, 0.82], [0.77, 0.78]], blocs: [[0.47, 0.62, 0.51, 0.77]] },
    // deux étages : un palier haut à gauche, un bas à droite séparé par une marche franche
    etages: { sol: [[0, 0.58], [0.3, 0.58], [0.31, 0.76], [0.6, 0.78], [0.72, 0.82], [0.77, 0.78]], blocs: [[0.6, 0.7, 0.66, 0.79]] },
    // (lot 2 : des plateaux qui bougent, comme les machines de l'appli) le tapis : la marche du haut est un tapis roulant
    // qui pousse lentement les badges vers le bord ; la bascule : une planche sur un poteau, qui penche d'un côté puis de
    // l'autre (celle du « Practice Catcher »)
    tapis: { sol: [[0, 0.64], [0.38, 0.64], [0.38, 0.74], [0.6, 0.77], [0.72, 0.84], [0.77, 0.8]], tapis: { seg: 0, v: 16 } },
    bascule: { sol: [[0, 0.74], [0.3, 0.8], [0.55, 0.82], [0.72, 0.84], [0.77, 0.79]], blocs: [[0.355, 0.66, 0.385, 0.81]], bascule: { c: [0.37, 0.655], demi: 0.19, amp: 0.13, periode: 6.5 } }
  };
  const VARIANTES = ["marches", "plateforme", "bosse", "muret", "etages", "tapis", "bascule"];
  const plateauDe = (m) => m.plateau ||= (() => {
    if (m.entrainement) return "carton";
    if (m.theme === "mktv") return "cuvette";
    if (m.theme === "niveau") return "bassin";
    const r = graine("plateau " + m.cle);
    return VARIANTES[Math.floor(r() * VARIANTES.length)];
  })();
  const PINCE = { rail: 18, L0: 66, xmin: 70, x0: Math.round(W * 0.89), rebord: Math.round(W * 0.77), vitesse: 88 };
  const SURPRISE = 0.04;
  const RYTHME = { ouvrir: 1.1, descenteVite: 320, descenteLent: 110, fermer: 1.2, pauseFond: 0.3, transport: 2.4, pauseGoulotte: 0.8 };
  const OUVERTURE_REPOS = 0.8;
  const versCadre = ([x, y]) => [x * W, H - (1 - y) * H0];
  const plateau = (m) => PLATEAUX[plateauDe(m)];
  const solDe = (m) => plateau(m).sol.map(versCadre);
  const blocsPlateau = (m) => (plateau(m).blocs || []).map(([x0, y0, x1, y1]) => [...versCadre([x0, y0]), ...versCadre([x1, y1])]);
  const hauteurSol = (pts, x) => {
    let y = H;
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
      if (bx > ax && x >= ax && x <= bx) y = Math.min(y, ay + (by - ay) * (x - ax) / (bx - ax));
      else if (bx === ax && Math.abs(x - ax) < 1) y = Math.min(y, ay, by);
    }
    return y;
  };
  const dessusEn = (m, x) => {
    if (m.vraie) return dessusVrai(m, x);
    let y = hauteurSol(solDe(m), x);
    for (const [x0, y0, x1] of blocsPlateau(m)) if (x >= x0 && x <= x1) y = Math.min(y, y0);
    const B_ = plateau(m).bascule;
    if (B_) {
      const [cx, cy] = versCadre(B_.c);
      if (Math.abs(x - cx) <= B_.demi * W) y = Math.min(y, cy - 12);
    }
    return y;
  };
  const creerMonde = (m) => {
    const mo = { parts: [], corps: [], segs: [], cines: [], cinesPrec: null }, r = 14, P = plateau(m);
    const [fs, fk] = P.glace ? [0.07, 0.03] : [0.7, 0.45];
    const seg = (ax, ay, bx, by, rr, mus, muk) => mo.segs.push({ ax, ay, bx, by, r: rr, mus, muk });
    seg(-30, -400, -30, H + 300, 30, 0.1, 0.05);
    seg(W + 30, -400, W + 30, H + 300, 30, 0.1, 0.05);
    mo.segs[0].mur = mo.segs[1].mur = true;
    const pts = solDe(m), fin = pts[pts.length - 1];
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1], l = Math.hypot(bx - ax, by - ay) || 1, nx = (by - ay) / l, ny = -(bx - ax) / l;
      seg(ax - nx * r, ay - ny * r, bx - nx * r, by - ny * r, r, fs, fk);
    }
    if (P.tapis) mo.segs[2 + P.tapis.seg].tapis = P.tapis.v;
    seg(fin[0] - r, fin[1], fin[0] - r, H + 300, r, 0.2, 0.1);
    if (P.bascule) {
      const [cx, cy] = versCadre(P.bascule.c), demi = P.bascule.demi * W;
      seg(cx - demi, cy, cx + demi, cy, 10, fs, fk);
      mo.segs[mo.segs.length - 1].bascule = { cx, cy, demi, amp: P.bascule.amp, periode: P.bascule.periode };
    }
    for (const [x0, y0, x1, y1] of blocsPlateau(m)) {
      const a = x0 + r, b = Math.max(a, x1 - r), c = y0 + r, d = Math.max(c, y1 - r);
      seg(a, c, b, c, r, fs, fk);
      seg(a, d, b, d, r, 0.5, 0.3);
      seg(a, c, a, d, r, 0.3, 0.2);
      seg(b, c, b, d, r, 0.3, 0.2);
    }
    return mo;
  };
  const nbDedans = (m) => m.vraie ? m.vraie.lots.filter(horsGoulotte).length : m.entrainement ? 8 : 9;
  const CARTONS = ["MroSMB", "DotHard", "FcRemix", "BTCenter"];
  let cartonIds = null;
  const idsCarton = () => cartonIds ||= (() => {
    if (!index) return [];
    const r = graine("carton " + jourDe()), l = [];
    for (const sid of CARTONS) {
      const s = seriesPar.get(sid);
      if (s) l.push(...melanger(s.lots.filter((f) => !s.tailles[f]), r).slice(0, 4).map((f) => `${sid}/${f}`));
    }
    return l;
  })();
  const nouveauCorps = (m, k) => {
    if (m.entrainement) {
      const l = idsCarton();
      return l.length ? { carton: true, id: l[k % l.length], taille: [1, 1] } : null;
    }
    const deja = new Set(m.monde.corps.map((c) => c.id)), id = m.file.find((x) => !deja.has(x));
    return id ? { id, taille: tailleDe(id) } : null;
  };
  const TAS = { essais: 6, marge: 88, recul: 125, penche: 0.9, jeu: 10 };
  const remplir = (m, n, pluie = false) => {
    const a = TAS.marge, b = PINCE.rebord - TAS.recul;
    for (let k = 0; k < n; k++) {
      const c = nouveauCorps(m, m.monde.corps.length + k);
      if (!c) return;
      const rr = R_BADGE * Math.max(...c.taille), dessusTas = (xx) => m.monde.parts.reduce((y_, p) => Math.abs(p.x - xx) < p.r + rr ? Math.min(y_, p.y - Math.sqrt(Math.max(0, (p.r + rr) ** 2 - (p.x - xx) ** 2)) - 2) : y_, dessusEn(m, xx) - rr - 2);
      let x = a, y = -1e9;
      for (let e = 0; e < TAS.essais; e++) {
        const xx = a + Math.random() * (b - a), yy = dessusTas(xx);
        if (yy > y) {
          x = xx;
          y = yy;
        }
      }
      if (y - rr < PINCE.rail + 14 + GEO_DESSIN.L0 + GEO_DESSIN.pointe + TAS.jeu) return;
      if (pluie) {
        ajouterCorps(m.monde, c, x, -rr * (1.5 + k * 2.6), (Math.random() - 0.5) * TAS.penche);
        continue;
      }
      ajouterCorps(m.monde, c, x, y, (Math.random() - 0.5) * TAS.penche);
      for (let i = 0; i < 40; i++) pas(m.monde, 1 / 120);
    }
  };
  const remplirAvec = (m, c) => {
    const x = 60 + Math.random() * 200, rr = R_BADGE * Math.max(...c.taille);
    const y = m.monde.parts.reduce((y_, p) => Math.abs(p.x - x) < p.r + rr ? Math.min(y_, p.y - Math.sqrt(Math.max(0, (p.r + rr) ** 2 - (p.x - x) ** 2)) - 2) : y_, dessusEn(m, x) - rr - 2);
    for (const p of c.parts) {
      p.dort = false;
      p.tenu = false;
    }
    ajouterCorps(m.monde, { id: c.id, carton: c.carton, taille: c.taille, o3: null }, x, y, 0);
  };
  const installer = (m) => {
    if (m.monde) return;
    if (m.vraie) {
      m.monde = creerMondeVrai(m);
      m.aRemettre = [];
      poserLots(m);
    } else {
      m.monde = creerMonde(m);
      remplir(m, nbDedans(m));
    }
    m.jeu = { etat: "attente", cx: geoDe(m).x0, cible: geoDe(m).x0, dir: 0, vx: 0, L: geoDe(m).L0, phi: 0, vphi: 0, oG: OUVERTURE_REPOS, oD: OUVERTURE_REPOS, t: 0, tenus: [], gains: [], bombe: estBombe(m) };
    if (m.monde.phys) {
      m.monde.preroule = 480;
      positionnerOutil(m, 0);
      return;
    }
    for (let k = 0; k < 480; k++) pas(m.monde, 1 / 120);
    positionnerOutil(m, 0);
    finirPreroule(m);
  };
  const PREROULE_MS = 3;
  const horsDePortee = (m) => {
    const fond = (PINCE.rail + 14 + GEO_VRAIE.Lmax + GEO_VRAIE.pointe - Y_ECRAN) / E_, coin = (xminDe(m) + pointBras(-1, 1, BRAS.pointe)[0]) / E_;
    for (const c of m.monde.corps.slice()) {
      const q = c.pb?.lire(), bo = c.pb?.boite();
      if (q && Math.hypot(q.x - c.lot.x, q.y - c.lot.y) > c.r / E_ / 2 && (q.y - c.r / E_ > fond || bo[0] < coin + GEO_VRAIE.rBout / E_ || m.monde.phys.couvert(c.pb))) {
        retirerCorps(m.monde, c);
        (m.aRemettre ||= []).push(c.id);
      }
    }
  };
  const finirPreroule = (m) => {
    m.monde.preroule = 0;
    for (const c of m.monde.corps.slice()) if (c.parts.every((p) => p.y > H)) {
      retirerCorps(m.monde, c);
      if (m.monde.phys) (m.aRemettre ||= []).push(c.id);
    }
    if (m.monde.phys) {
      horsDePortee(m);
      m.aRemettre = regarnir(m, 0, m.aRemettre || []);
    }
  };
  const preroulerUnPeu = (m, budget) => {
    const mo = m.monde, t0 = performance.now();
    while (mo.preroule > 0 && (budget == null || performance.now() - t0 < budget)) {
      for (let k = 0; k < 8 && mo.preroule > 0; k++, mo.preroule--) pas(mo, 1 / 120);
      if (mo.corps.every((c) => !c.pb || !c.pb.corps.isAwake())) mo.preroule = 0;
    }
    if (!mo.preroule) finirPreroule(m);
  };
  const formeDessinee = (hx, hy, phi, oG, oD) => {
    const c = Math.cos(phi), s = Math.sin(phi), R = (x, y) => [hx + (x * c + y * s) * K, hy + (-x * s + y * c) * K];
    const doigt2 = (sg, o) => [R(sg * 20, 10), R(sg * (40 + 44 * o), 60), R(sg * (14 + 52 * o), 96)];
    return { R, tete: [...R(-24, 0), ...R(24, 0)], anneau: R(0, -34), moyeu: [...R(-MOYEU.demi, -34), ...R(MOYEU.demi, -34)], g: doigt2(-1, oG), d: doigt2(1, oD) };
  };
  const MOYEU = { demi: 40, r: 34 };
  const GEO_DESSIN = {
    k: K,
    forme: formeDessinee,
    pointe: 96 * K,
    cage: [6 * K, 92 * K, 38 * K],
    rTete: 14 * K,
    rDoigt: 6 * K,
    rBout: 12 * K,
    rMoyeu: MOYEU.r * K,
    approche: 60 * K,
    prise: [50 * K, 120 * K],
    pend: (sg, o) => [sg * (14 + 52 * o) * 0.7, 90],
    L0: 66,
    x0: PINCE.x0,
    xmin: PINCE.xmin
  };
  GEO_DESSIN.Lmax = H - 24 - (PINCE.rail + 14) - GEO_DESSIN.pointe;
  const geoDe = (m) => m?.geo || GEO_DESSIN;
  const forme = (m, hx, hy, phi, oG, oD) => geoDe(m).forme(hx, hy, phi, oG, oD);
  const ECRAN = { l: 400, h: 240 }, E_ = W / ECRAN.l, Y_ECRAN = H - ECRAN.h * E_;
  const ecranVersMonde = (x, y) => [x * E_, Y_ECRAN + y * E_];
  const PRIVE_BA = { bornes: "badge-arcade/bornes/", pince: "badge-arcade/modeles/romfs/pince-standard.glb", pinceBombe: "badge-arcade/modeles/romfs/pince-bombe.glb", partie: "badge-arcade/romfs-eur/layout-png/", sons: "sons/badge-arcade/romfs/" };
  let PH = null;
  const chargerPhysique = () => PH = window.planck && window.__pcvCasinoPhysique || null;
  const avecPhysique = (m) => !!(PH && m.geo === GEO_VRAIE && m.vraie?.objets.every((o) => o.polys));
  const xminDe = (m) => m.monde?.phys ? Math.max(geoDe(m).xmin, PH.MARGE_MUR * E_) : geoDe(m).xmin;
  const UNITE = 19.8 * E_, OUVERTURE_VRAIE = 55 * Math.PI / 180;
  const BRAS = { joint: [1.697, -0.437], coude: [-1.15, -0.85], pointe: [1.697, -2.653] };
  const pointBras = (sg, o, [x, y]) => {
    const a = o * OUVERTURE_VRAIE, ca = Math.cos(a), sa = Math.sin(a), xr = x * ca + y * sa, yr = -x * sa + y * ca;
    return [sg * (BRAS.joint[0] - xr) * UNITE, -(BRAS.joint[1] + yr) * UNITE];
  };
  const formeVraie = (hx, hy, phi, oG, oD) => {
    const c = Math.cos(phi), s = Math.sin(phi), R = (x, y) => [hx + x * c + y * s, hy - x * s + y * c], u = UNITE;
    const doigt2 = (sg, o) => [[0, 0], BRAS.coude, BRAS.pointe].map((p) => R(...pointBras(sg, o, p)));
    return { R, tete: [...R(-1.07 * u, 0.4 * u), ...R(1.07 * u, 0.4 * u)], anneau: R(0, 0), moyeu: [...R(-0.67 * u, 0), ...R(0.67 * u, 0)], g: doigt2(-1, oG), d: doigt2(1, oD) };
  };
  const REPOS_VRAIE = -35, HAUT_VRAIE = /* @__PURE__ */ new Set(["attente", "deplacement", "ouvrir", "transport"]);
  const GEO_VRAIE = {
    k: 1,
    forme: formeVraie,
    pointe: 3.55 * UNITE,
    cage: [0.5 * UNITE, 3.4 * UNITE, 1.6 * UNITE],
    rTete: 0.75 * UNITE,
    rDoigt: 0.22 * UNITE,
    rBout: 0.3 * UNITE,
    rMoyeu: 1.15 * UNITE,
    approche: 2 * UNITE,
    prise: [2.1 * UNITE, 5 * UNITE],
    pend: (sg, o) => {
      const [x, y] = pointBras(sg, o, BRAS.pointe);
      return [x * 0.7, y * 0.94];
    },
    L0: Y_ECRAN + REPOS_VRAIE * E_ - PINCE.rail - 14,
    x0: W - Math.max(...[OUVERTURE_REPOS, 1].flatMap((o) => [BRAS.coude, BRAS.pointe].map((p) => pointBras(1, o, p)[0]))) - 3 * E_,
    xmin: 0,
    decor: [0, 5, 6],
    ouvrir: 1.3,
    fermer: 1.4
  };
  GEO_VRAIE.Lmax = H - 10 - (PINCE.rail + 14) - GEO_VRAIE.pointe;
  let vraies = null, attenteVraies = null, pinceGltf = null, bombeGltf = null, nomsSeuls = null;
  const chargerVraies = () => attenteVraies ||= (async () => {
    try {
      vraies = JSON.parse(new TextDecoder().decode(await octets(PRIVE_BA.bornes + "index.json", "application/json")));
      if (!vraies?.machines) vraies = null;
    } catch (e) {
      vraies = null;
    }
    if (vraies && window.__pcvPicaTev && E.GLTFLoader) try {
      const b = await octets(PRIVE_BA.pince, "model/gltf-binary");
      pinceGltf = await new Promise((ok, ko) => new E.GLTFLoader().parse(b, "", ok, ko));
    } catch (e) {
      pinceGltf = null;
      console.warn("casino : la vraie pince manque, la pince dessin\xE9e la remplace", e);
    }
    if (pinceGltf) try {
      const b = await octets(PRIVE_BA.pinceBombe, "model/gltf-binary");
      bombeGltf = await new Promise((ok, ko) => new E.GLTFLoader().parse(b, "", ok, ko));
    } catch (e) {
      bombeGltf = null;
    }
    if (vraies) chargerPhysique();
    if (!vraies) attenteVraies = null;
  })();
  const BOMBES_ACTIVES = false;
  const TYPES_JOUES = /* @__PURE__ */ new Set(["standard", ...BOMBES_ACTIVES ? ["bombe"] : []]);
  const machineVraie = (m) => {
    if (!vraies) return null;
    const rep = vraies.repli || [];
    if (m.forceVraie && vraies.machines[m.forceVraie]) return { nom: m.forceVraie, ...vraies.machines[m.forceVraie] };
    const joue = (n) => vraies.machines[n] && TYPES_JOUES.has(vraies.machines[n].type) && (vraies.machines[n].type !== "bombe" || bombeGltf);
    const l = m.entrainement ? [vraies.entrainement] : [].concat(vraies.series?.[m.cle] || []).filter(joue), choix = l.length ? l : rep.filter(joue);
    const nom = choix.length ? choix[graine("machine " + jourDe() + " " + m.cle)() * choix.length | 0] : null, v = nom && vraies.machines[nom];
    return v ? { nom, ...v } : null;
  };
  const estBombe = (m) => m?.vraie?.type === "bombe" && !!bombeGltf;
  const PINCE_ENTRAINEMENT_RVB = [0.16, 0.72, 0.22];
  const couleurVraie = (m) => new T.Color().setRGB(...m.entrainement ? PINCE_ENTRAINEMENT_RVB : m.vraie.couleur);
  let parNom = null;
  const idDeNom = (nom) => {
    if (!index) return null;
    parNom ||= (() => {
      const t = /* @__PURE__ */ new Map();
      for (const s of index.series) for (const f of s.lots) t.set(f.replace(/\.png$/, ""), `${s.id}/${f}`);
      return t;
    })();
    return parNom.get(nom) || parNom.get(nom.replace(/_Sep$/, "")) || null;
  };
  const FLOTTE = 0.9;
  const BORD_VRAI = 3, GOULOTTE_VRAIE = { x: 320 * E_, rebord: 16 };
  const SOL_VRAI_HAUT = ECRAN.h - 16, SOL_VRAI_FIN = GOULOTTE_VRAIE.x / E_ - GOULOTTE_VRAIE.rebord;
  const SOL_VRAI = { polys: [[[0, SOL_VRAI_HAUT], [SOL_VRAI_FIN, SOL_VRAI_HAUT], [SOL_VRAI_FIN, ECRAN.h + 20], [0, ECRAN.h + 20]]] };
  const TROU_MIN = 16, BAS_TOUCHE = 6;
  const trouesVraies = (m) => {
    const pleins = [], r = [];
    let x = 0;
    for (const o of m.vraie.objets.length ? m.vraie.objets : [SOL_VRAI]) for (const P of o.polys || [])
      if (Math.max(...P.map((p) => p[1])) >= ECRAN.h - BAS_TOUCHE) pleins.push([Math.min(...P.map((p) => p[0])), Math.max(...P.map((p) => p[0]))]);
    for (const [a, b] of pleins.sort((p, q) => p[0] - q[0])) {
      if (a - x > TROU_MIN) r.push([x, a]);
      x = Math.max(x, b);
    }
    if (ECRAN.l - x > TROU_MIN) r.push([x, ECRAN.l]);
    return r.map(([a, b]) => [a * E_, b * E_]);
  };
  const dansChute = (m, x) => trouesVraies(m).some(([a, b]) => x > a - 20 && x < b + 20);
  const creerMondeVrai = (m) => {
    const mo = { parts: [], corps: [], segs: [], cines: [], cinesPrec: null, vrai: true };
    const seg = (ax, ay, bx, by, rr, mus, muk) => mo.segs.push({ ax, ay, bx, by, r: rr, mus, muk });
    seg(-30, -400, -30, H + 300, 30, 0.1, 0.05);
    seg(W + 30, -400, W + 30, H + 300, 30, 0.1, 0.05);
    mo.segs[0].mur = mo.segs[1].mur = true;
    for (const o of m.vraie.objets) {
      const [fs, fk] = o.glisse ? [0.07, 0.03] : [0.7, 0.45];
      for (const [x0, y0, x1, y1] of o.bords) seg(...ecranVersMonde(x0, y0), ...ecranVersMonde(x1, y1), BORD_VRAI, fs, fk);
    }
    const r = 14, L_ = ECRAN.l * E_;
    let xg = -30;
    for (const [a, b] of trouesVraies(m)) {
      if (a - r > xg) seg(xg, H + r, a - r, H + r, r, 0.7, 0.45);
      seg(a - r, H - 16, a - r, H + 300, r, 0.2, 0.1);
      xg = b + r;
      if (b < L_ - 1) seg(xg, H - 16, xg, H + 300, r, 0.2, 0.1);
      else xg = L_ + 30;
    }
    if (xg < L_ + 30) seg(xg, H + r, L_ + 30, H + r, r, 0.7, 0.45);
    if (avecPhysique(m)) {
      mo.phys = PH.creer();
      mo.phys.decor(m.vraie.objets.length ? m.vraie.objets : [SOL_VRAI]);
      mo.pince = mo.phys.pince({ sansBras: estBombe(m) });
      mo.accs = (m.vraie.accessoires || []).map((a) => mo.phys.accessoire({ ...a, rot: a.rot * Math.PI / 180, fige: !a.grav, genre: genreAccessoire(a.nom) }));
    }
    return mo;
  };
  const genreAccessoire = (nom) => /Seesaw|Pinwheel|Circle01/.test(nom) ? "pivot" : /Hang|Stopper/.test(nom) ? "fixe" : "libre";
  const souderAccroches = (m) => {
    const mo = m.monde;
    if (!mo.phys || !mo.accs?.length) return;
    for (const r of m.vraie.accroches || []) {
      const a = mo.accs[r.acc], d = m.vraie.accessoires[r.acc], l = m.vraie.lots[r.lot];
      if (!a || !d || /PackingCase|Cave|Grip/.test(d.nom)) continue;
      const c = mo.corps.find((k) => k.lot === l);
      if (!c?.pb) continue;
      if (Math.hypot(l.x - d.x, l.y - d.y) > Math.max(d.w * d.sx, d.h * d.sy) * 0.75 + 30) continue;
      mo.phys.souder(c.pb, a);
    }
  };
  const dessusVrai = (m, x) => {
    let y = H + 60;
    for (const s_ of m.monde?.segs || []) {
      if (s_.mur || Math.abs(s_.bx - s_.ax) < 1) continue;
      const a = Math.min(s_.ax, s_.bx), b = Math.max(s_.ax, s_.bx);
      if (x < a || x > b) continue;
      y = Math.min(y, s_.ay + (s_.by - s_.ay) * (x - s_.ax) / (s_.bx - s_.ax) - s_.r);
    }
    return y;
  };
  const RAYON_MEDIAN = 48;
  const EMPAN_IMAGE = 128, RAYON_COLLECTION = EMPAN_IMAGE / 2 / 1.06, LISERE_IMAGE = 4, formesImages = /* @__PURE__ */ new Map();
  const BANDES_IMAGE = 4;
  const formeImage = (id, im) => {
    if (formesImages.has(id)) return formesImages.get(id);
    let P = null;
    try {
      const w = im.naturalWidth || im.width, h = im.naturalHeight || im.height, [, x] = toile(w, h);
      x.drawImage(im, 0, 0);
      const d = x.getImageData(0, 0, w, h).data;
      const plein = (i, j) => d[(j * w + i) * 4 + 3] > 127;
      const bandes = Array.from({ length: BANDES_IMAGE }, () => []);
      for (let j = 0; j < h; j++) {
        let a = -1, b = -1;
        for (let i = 0; i < w; i++) if (plein(i, j)) {
          if (a < 0) a = i;
          b = i;
        }
        if (a < 0) continue;
        const k = Math.min(BANDES_IMAGE - 1, Math.floor(j / h * BANDES_IMAGE));
        bandes[k].push([a, j], [b + 1, j], [a, j + 1], [b + 1, j + 1]);
      }
      const L = LISERE_IMAGE, aireT = (a, b, c) => Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1])), pieces = [];
      for (const pts of bandes) {
        if (pts.length < 3) continue;
        const R = [];
        for (const [i, j] of pts) for (let k = 0; k < 8; k++) R.push([i + L * Math.cos(k * Math.PI / 4), j + L * Math.sin(k * Math.PI / 4)]);
        let H2 = PH.enveloppe(R);
        if (H2.length < 3) continue;
        while (H2.length > 8) {
          let k0 = 0, m0 = Infinity;
          for (let k = 0; k < H2.length; k++) {
            const t = aireT(H2[(k + H2.length - 1) % H2.length], H2[k], H2[(k + 1) % H2.length]);
            if (t < m0) {
              m0 = t;
              k0 = k;
            }
          }
          H2.splice(k0, 1);
        }
        pieces.push(H2.map(([i, j]) => [64 + (i / w - 0.5) * EMPAN_IMAGE, 64 + (j / h - 0.5) * EMPAN_IMAGE]));
      }
      if (pieces.length) P = pieces;
    } catch (e) {
      P = null;
    }
    formesImages.set(id, P);
    return P;
  };
  const echPetits = (m) => m.vraie.echPetits ??= (() => {
    const e = m.vraie.lots.filter((l) => !/_Sep$/.test(l.nom)).map((l) => l.s).sort((a, b) => a - b);
    return e[e.length >> 1] || 0.55;
  })();
  const echDe = (m, l, id, info) => info || !/_Sep$/.test(l.nom) || tailleDe(id)[0] * tailleDe(id)[1] > 1 ? l.s : Math.min(l.s, echPetits(m));
  const corpsVrai = (m, l, id, carton) => {
    const info = vraies.badges[l.nom] && (idDeNom(l.nom) === id || id === JEU + l.nom) ? vraies.badges[l.nom] : null, k = echDe(m, l, id, info) * E_;
    return { id, carton, taille: [1, 1], vrai: info, ech: k, r: (info?.r ?? RAYON_COLLECTION) * k, dc: info ? [info.c[0] * k, info.c[1] * k] : [0, 0], lot: l };
  };
  const poserCorps = (m, c, l, fige) => {
    const a = l.rot * Math.PI / 180, [x, y] = ecranVersMonde(l.x, l.y), [dx, dy] = c.dc;
    ajouterCorps(m.monde, c, x + dx * Math.cos(a) - dy * Math.sin(a), y + dx * Math.sin(a) + dy * Math.cos(a), a);
    if (m.monde.phys) {
      c.pw = m.monde.phys;
      c.pb = c.pw.badge({ polys: c.vrai?.polys, r: c.r / E_, x: l.x, y: l.y, ech: c.ech / E_, rot: a, fige, phys: l.phys, donnees: c });
      if (c.id) quandPrete(image(c.id), (im) => {
        const P = formeImage(c.id, im);
        if (P && c.pw.badges.has(c.pb)) {
          c.pb.forme(P);
          c.pw.croiser([c.pb]);
        }
      });
      return c;
    }
    if (fige) {
      c.flotte = true;
      for (const p of c.parts) {
        p.dort = true;
        p.wDort = p.w;
        p.w = 0;
        p.px = p.x;
        p.py = p.y;
      }
    }
    return c;
  };
  const JEU = "jeu/";
  const prochainId = (m, deja) => m.entrainement ? null : m.file.find((x) => !deja.has(x) && tailleDe(x)[0] === 1 && tailleDe(x)[1] === 1) || null;
  const horsGoulotte = (l) => !l.grav || l.x * E_ < GOULOTTE_VRAIE.x - RAYON_MEDIAN * l.s * E_;
  const poserLots = (m) => {
    const e = etatJour(), gagnes = new Set(e.gagnes[m.cle] || []), deja = /* @__PURE__ */ new Set();
    m.vraie.lots.filter(horsGoulotte).forEach((l) => {
      let id = idDeNom(l.nom);
      if (!m.entrainement && (!id || gagnes.has(id) || deja.has(id) || !m.file.includes(id))) id = prochainId(m, deja);
      if (m.entrainement && !id) id = vraies.badges[l.nom] ? JEU + l.nom : idsCarton()[deja.size % Math.max(1, idsCarton().length)];
      if (!id) return;
      deja.add(id);
      poserCorps(m, corpsVrai(m, l, id, !!m.entrainement), l, !l.grav);
    });
    croiser(m.monde.corps);
    souderAccroches(m);
  };
  const croiser = (cs, neufs = cs) => {
    if (neufs[0]?.pw) return neufs[0].pw.croiser(neufs === cs ? void 0 : neufs.map((c) => c.pb));
    for (const a of neufs) for (const b of cs) if (a !== b && Math.hypot(a.parts[0].x - b.parts[0].x, a.parts[0].y - b.parts[0].y) < a.parts[0].r + b.parts[0].r) {
      (a.croise ||= /* @__PURE__ */ new Set()).add(b);
      (b.croise ||= /* @__PURE__ */ new Set()).add(a);
    }
  };
  const placeLibre = (m, l, r, serre = 1) => {
    const [x, y] = ecranVersMonde(l.x, l.y);
    return m.monde.parts.every((p) => {
      const d = Math.hypot(p.x - x, p.y - y);
      return d > (p.r + r * 0.8) * serre && (serre < 1 || d > p.r + r * 2.5 || !p.c.pb?.lire().eveille);
    });
  };
  const regarnir = (m, n, ids = []) => {
    const deja = new Set(m.monde.corps.map((c) => c.id)), reste = ids.filter((id) => !deja.has(id));
    for (const id of reste) deja.add(id);
    const L = m.vraie.lots.filter(horsGoulotte), dorment = L.filter((l) => !l.grav);
    for (const [places, serre] of [[m.monde.phys && dorment.length ? dorment : L, 1], [L, 1], [L, 0.5]]) for (const l of melanger(places.slice(), Math.random)) {
      if (n <= 0 && !reste.length) return reste;
      const id = reste[0] || (n <= 0 ? null : m.entrainement ? idDeNom(l.nom) || (vraies.badges[l.nom] ? JEU + l.nom : idsCarton()[Math.random() * idsCarton().length | 0]) : prochainId(m, deja));
      if (!id) return reste;
      const c = corpsVrai(m, l, id, !!m.entrainement);
      if (!placeLibre(m, l, c.r, serre) || serre < 1 && reste[0] !== id) continue;
      deja.add(id);
      if (reste[0] === id) reste.shift();
      else n--;
      c.nait = horloge;
      poserCorps(m, c, l, !l.grav);
      croiser(m.monde.corps, [c]);
    }
    return reste;
  };
  const FERMEE = /* @__PURE__ */ new Set(["fermeture", "montee", "transport"]);
  const PRISE_COMPTE = /* @__PURE__ */ new Set(["fermeture", "montee", "transport", "lacher", "largage", "souffle"]);
  const positionnerOutil = (m, dt) => {
    const j = m.jeu;
    j.hx = j.cx + Math.sin(j.phi) * j.L;
    j.hy = PINCE.rail + 14 + Math.cos(j.phi) * j.L;
    if (m.monde?.phys) {
      const P_2 = m.monde.pince, x = j.hx / E_, y = (j.hy - Y_ECRAN) / E_, ouvrir2 = FERMEE.has(j.etat) && !(j.lachePrise > 0) || j.etat === "lacher" && j.t < RYTHME.pauseGoulotte ? 0 : j.etat === "descente" && j.lu ? [+!(j.lu.contacts.decorG && !j.lu.contacts.decorD), +!(j.lu.contacts.decorD && !j.lu.contacts.decorG)] : 1;
      if (!m.monde.pincePosee) {
        P_2.placer(x, y, j.phi, OUVERTURE_VRAIE * j.oG);
        m.monde.pincePosee = true;
      }
      P_2.commander({ x, y, phi: j.phi, ouvrir: ouvrir2 });
      j.lu = P_2.lire();
      j.oG = clamp(j.lu.oG, 0, 1.1);
      j.oD = clamp(j.lu.oD, 0, 1.1);
      j.D = forme(m, j.hx, j.hy, j.phi, j.oG, j.oD);
      m.monde.cines = [];
      return;
    }
    const D = j.D = forme(m, j.hx, j.hy, j.phi, j.oG, j.oD);
    const g_ = geoDe(m), bout = (q) => [...q, ...q, g_.rBout];
    const haut = g_.decor && HAUT_VRAIE.has(j.etat);
    cinematiques(m.monde, haut ? [] : g_.decor ? [[...D.tete, g_.rTete], bout(D.g[2]), bout(D.g[2]), bout(D.d[2]), bout(D.d[2]), [...D.moyeu, g_.rMoyeu]] : [
      [...D.tete, g_.rTete],
      [...D.g[0], ...D.g[1], g_.rDoigt],
      [...D.g[1], ...D.g[2], g_.rDoigt],
      [...D.d[0], ...D.d[1], g_.rDoigt],
      [...D.d[1], ...D.d[2], g_.rDoigt],
      [...D.moyeu, g_.rMoyeu]
    ]);
    for (const t of j.tenus) {
      if (t.petit && t.c.parts.length === 1) {
        pendre(j, D, t, dt, g_);
        continue;
      }
      t.c.parts.forEach((p, k) => {
        const [x, y] = D.R(t.off[k][0] / g_.k, t.off[k][1] / g_.k);
        p.px = p.x;
        p.py = p.y;
        p.x = x;
        p.y = y;
      });
    }
  };
  const PENDULE = { raideur: 14, amorti: 2.4, pousse: 35e-4, bras: 0.72, penche: 0.3 };
  const pendre = (j, D, t, dt, g_) => {
    const p = t.c.parts[0];
    t.pend ||= { sg: t.off[0][0] >= 0 ? 1 : -1, a: 0, v: 0, vx: j.vx || 0, k: 0 };
    const P_2 = t.pend;
    if (dt) {
      const acc = ((j.vx || 0) - P_2.vx) / dt;
      P_2.vx = j.vx || 0;
      P_2.k = Math.min(1, P_2.k + dt * 2.5);
      P_2.v += (-PENDULE.raideur * Math.sin(P_2.a) - PENDULE.amorti * P_2.v - acc * PENDULE.pousse) * dt;
      P_2.a = clamp(P_2.a + P_2.v * dt, -0.7, 0.7);
    }
    const o = P_2.sg < 0 ? j.oG : j.oD, [tx, ty] = D.R(...g_.pend(P_2.sg, o)), [mx, my] = D.R(t.off[0][0] / g_.k, t.off[0][1] / g_.k);
    const L = p.r * PENDULE.bras, ax = tx + Math.sin(P_2.a) * L - P_2.sg * L * 0.25, ay = ty + Math.cos(P_2.a) * L;
    p.px = p.x;
    p.py = p.y;
    p.x = mx + (ax - mx) * P_2.k;
    p.y = my + (ay - my) * P_2.k;
    t.c.ang = -(P_2.a + P_2.sg * PENDULE.penche) * P_2.k;
  };
  const capsPince = (D, g_) => [
    [...D.tete, g_.rTete],
    [...D.g[0], ...D.g[1], g_.rDoigt],
    [...D.g[1], ...D.g[2], g_.rDoigt],
    [...D.d[0], ...D.d[1], g_.rDoigt],
    [...D.d[1], ...D.d[2], g_.rDoigt],
    [...D.g[2], ...D.g[2], g_.rBout],
    [...D.d[2], ...D.d[2], g_.rBout]
  ];
  const dansDecor = (m, D, ks) => {
    let d = -99;
    const g_ = geoDe(m), caps = capsPince(D, g_), q = { x: 0, y: 0, r: 0 };
    for (const k of ks || caps.keys()) {
      if (g_.decor && !g_.decor.includes(k)) continue;
      const c = caps[k];
      for (let t = 0; t <= 1.001; t += 0.25) {
        q.x = c[0] + (c[2] - c[0]) * t;
        q.y = c[1] + (c[3] - c[1]) * t;
        q.r = c[4];
        for (const s_ of m.monde.segs) {
          if (s_.mur) continue;
          const e = enfoncement(q, s_).d;
          if (e > d) d = e;
        }
      }
    }
    return d;
  };
  const maxEnfoncement = (mo, ks) => {
    let d = -99;
    for (const k of ks) for (const p of mo.parts) if (!p.tenu) d = Math.max(d, enfoncement(p, mo.cines[k]).d);
    return d;
  };
  const gros = (p) => p.r > R_BADGE * 1.4 || p.c.parts.length > 1;
  let tricher = false;
  const stats = { gains: 0, pousses: 0 };
  const PRISE_TIENT_VRAIE = 0.7;
  const PRISE_VRAIE = { glisse: 0.92, quand: [0.3, 1], ouverte: 1.1 };
  const prisDe = (m, j) => {
    const [g, d] = m.monde.pince.pointes(), yM = (j.hy - Y_ECRAN) / E_;
    return (j.lu?.tenus || []).filter((b) => {
      const q = b.lire();
      return q.x > Math.min(g[0], d[0]) && q.x < Math.max(g[0], d[0]) && q.y > yM;
    });
  };
  const PRISE_TIENT = 0.42;
  const prise = (m, j) => {
    const { hx, hy } = j, cand = [], g_ = geoDe(m), [c0, c1, cx_] = g_.cage;
    const dansCage = (p) => p.y > hy + c0 && p.y < hy + c1 && Math.abs(p.x - hx) < cx_;
    for (const c of m.monde.corps) {
      const ps = c.parts, n = ps.length, dedans = ps.filter(dansCage).length;
      const mx = ps.reduce((a, p) => a + p.x, 0) / n, my = ps.reduce((a, p) => a + p.y, 0) / n, dx = mx - hx;
      let q = 0;
      if (n === 1 && ps[0].r < R_BADGE * 1.4) {
        if (dedans) q = 0.74 - 0.7 * (dx / cx_) ** 2;
      } else if (n === 1) {
        if (hy + g_.pointe > my + 6 && Math.abs(dx) < ps[0].r * 0.5 && j.bloqueG && j.bloqueD) q = 0.5 - 0.7 * Math.abs(dx) / ps[0].r;
      } else if (dedans || hy + g_.pointe > my && Math.abs(dx) < g_.prise[0]) q = (dedans === n ? 0.62 : 0.45) - Math.abs(dx) / g_.prise[1] - (c.axe ? 0.06 : 0);
      if (q <= 0) continue;
      const dessus = m.monde.parts.some((o) => o.c !== c && !dansCage(o) && ps.some((p) => o.y < p.y - 8 && Math.hypot(o.x - p.x, o.y - p.y) < o.r + p.r + 3));
      if (dessus) q -= 0.18;
      cand.push({ c, q: clamp(q * (m.vraie ? PRISE_TIENT_VRAIE : PRISE_TIENT), 0.05, 0.95) });
    }
    if (tricher && !cand.length) {
      const c = m.monde.corps.filter((k) => k.parts.length === 1).sort((a, b) => Math.hypot(a.parts[0].x - hx, a.parts[0].y - hy) - Math.hypot(b.parts[0].x - hx, b.parts[0].y - hy))[0];
      if (c) cand.push({ c, q: 0.95 });
    }
    const c2 = Math.cos(j.phi), s2 = Math.sin(j.phi);
    const meilleur = cand.sort((a, b) => b.q - a.q)[0];
    j.tenus = meilleur ? [meilleur].map(({ c, q }) => {
      reveiller(c.parts[0]);
      c.flotte = false;
      c.parts.forEach((p) => {
        p.tenu = true;
        p.w0 = p.w;
        p.w = 0;
      });
      return { c, q, petit: c.parts.length === 1 && c.parts[0].r < R_BADGE * 1.4, off: c.parts.map((p) => {
        const x = p.x - hx, y = p.y - hy;
        return [x * c2 - y * s2, x * s2 + y * c2];
      }) };
    }) : [];
    j.rate = meilleur && !tricher && Math.random() > meilleur.q ? { quand: 0.08 + Math.random() * 0.62 } : null;
    j.desserre = 0;
    j.Lbas = j.L;
    sonPince("serre", "serre");
  };
  const lacher = (c) => c.parts.forEach((p) => {
    if (p.tenu) {
      p.tenu = false;
      p.w = p.w0;
    }
  });
  const glisser = (j, avance) => {
    if (!j.rate || avance < j.rate.quand) return;
    j.rate = null;
    j.desserre = 0.45;
    j.glisses = (j.glisses || 0) + 1;
    son("glisse");
    for (const t of j.tenus) {
      lacher(t.c);
      if (!t.petit) {
        const sens = Math.random() < 0.5 ? -1 : 1;
        t.c.parts.forEach((p) => p.px = p.x - sens * 1.6);
      }
    }
    j.tenus = [];
  };
  const serrer = (j, dt) => {
    if (j.desserre > 0) {
      j.desserre -= dt;
      j.oG = Math.min(0.9, j.oG + dt * 4);
      j.oD = Math.min(0.9, j.oD + dt * 4);
    } else {
      j.oG = Math.max(j.fermeG, j.oG - dt * 2);
      j.oD = Math.max(j.fermeD, j.oD - dt * 2);
    }
  };
  const viseSous = (m, j) => {
    const g_ = geoDe(m), cy = j.hy + (g_.cage[0] + g_.cage[1]) / 2;
    let best = null, d0 = 1e9;
    for (const c of m.monde.corps) {
      const p = c.parts[0], d = Math.hypot(p.x - j.hx, p.y - cy);
      if (d < d0 && Math.abs(p.x - j.hx) < g_.cage[2] * 1.4) {
        d0 = d;
        best = c;
      }
    }
    return best;
  };
  const OUVERTURE_MIN = 0.15;
  const BOMBE = { pause: 0.25, attente: 3, sous: 2.4 * 19.8, centre: 0, secousse: 0.3 };
  const pointBombe = (j) => [j.hx / E_ + Math.sin(j.phi) * BOMBE.sous, (j.hy - Y_ECRAN) / E_ + Math.cos(j.phi) * BOMBE.sous];
  const lacherBouton = (j) => {
    if (j.etat !== "deplacement") return false;
    j.etat = j.bombe ? "largage" : "ouvrir";
    j.t = 0;
    j.cible = j.cx;
    j.viseBanc = null;
    sonPince("boutonLache");
    sonPince("arret");
    sonPince("ouvre", "ouvre", 1, 0.18);
    return true;
  };
  const avancerPince = (m, j, dt) => {
    const g = PINCE, G0 = geoDe(m), v0 = j.vx;
    j.t += dt;
    if (m.monde.phys && (j.etat === "montee" || j.etat === "transport")) {
      j.tPrise = (j.tPrise || 0) + dt;
      if (j.glisseT != null && j.tPrise >= j.glisseT) {
        j.glisseT = null;
        j.lachePrise = PRISE_VRAIE.ouverte;
        m.monde.pince.lacher();
        son("glisse");
      }
      if (j.lachePrise > 0) j.lachePrise -= dt;
    }
    if (j.etat === "deplacement") {
      j.vx = -g.vitesse;
      j.cx = Math.max(xminDe(m), j.cx + j.vx * dt);
      if (j.cx <= xminDe(m) || j.viseBanc != null && j.cx <= j.viseBanc) {
        j.vx = 0;
        lacherBouton(j);
      }
    } else {
      const roule = j.etat === "attente" || j.etat === "transport";
      j.vx = roule ? clamp((G0.x0 - j.cx) * (j.etat === "transport" ? RYTHME.transport : 7), -260, 260) : 0;
      j.cx += j.vx * dt;
    }
    const Lp = j.L + 60, brise = j.etat === "attente" ? Math.sin(j.t * 1.9) * 0.3 : 0;
    j.vphi += (-(G / Lp) * Math.sin(j.phi) - 4 * j.vphi - (j.vx - v0) / Math.max(dt, 1e-3) / Lp * 0.55 + brise) * dt;
    j.phi = clamp(j.phi + j.vphi * dt, -0.32, 0.32);
    switch (j.etat) {
      // (l'arrêt fait osciller la pince sur son câble : elle s'ouvre en grand pendant que l'oscillation s'éteint)
      case "ouvrir":
        j.oG = j.oD = Math.min(1, j.oG + dt * 1.5);
        if (j.t >= (G0.ouvrir ?? RYTHME.ouvrir)) {
          j.etat = "descente";
          j.t = 0;
          j.bloqueG = j.bloqueD = false;
          j.limG = j.limD = 1;
          if (!vraisBruits()) son("descend");
        }
        break;
      case "descente":
        if (m.monde.phys) {
          const P_2 = m.monde.pince;
          if (!j.retenir) j.L += clamp(RYTHME.descenteLent + 2.6 * (P_2.dessous() - 4) * E_, RYTHME.descenteLent, RYTHME.descenteVite) * dt;
          const raison = j.lu && P_2.arret(j.lu, j) || (j.L >= GEO_VRAIE.Lmax ? "fond" : null);
          if (raison) {
            j.L = j.Lfond = Math.min(j.L, GEO_VRAIE.Lmax) - PH.ARRET.recul * E_;
            j.etat = "fermeture";
            j.t = 0;
            j.surDecor = raison !== "moyeu";
            j.coince = 0;
            j.retenir = false;
          }
          break;
        } else {
          j.oG = Math.min(j.limG ?? 1, j.oG + dt * 3);
          j.oD = Math.min(j.limD ?? 1, j.oD + dt * 3);
          const L0 = j.L;
          const G_ = geoDe(m), pointe = g.rail + 14 + j.L + G_.pointe, dessous = m.monde.parts.reduce((y_, p) => Math.abs(p.x - j.cx) < G_.approche && !p.tenu ? Math.min(y_, p.y - p.r) : y_, dessusEn(m, j.cx));
          j.L += clamp(RYTHME.descenteLent + 2.6 * (dessous - pointe), RYTHME.descenteLent, RYTHME.descenteVite) * dt;
          const D_ = (L) => forme(m, j.cx + Math.sin(j.phi) * L, g.rail + 14 + Math.cos(j.phi) * L, j.phi, j.oG, j.oD);
          const replier = (L) => {
            for (let k = 0; k < 16; k++) {
              const D = D_(L);
              let fait = false;
              if (j.oG > OUVERTURE_MIN && dansDecor(m, D, [1, 2, 5]) > 0) {
                j.oG = j.limG = Math.max(OUVERTURE_MIN, j.oG - 0.05);
                fait = true;
              }
              if (j.oD > OUVERTURE_MIN && dansDecor(m, D, [3, 4, 6]) > 0) {
                j.oD = j.limD = Math.max(OUVERTURE_MIN, j.oD - 0.05);
                fait = true;
              }
              if (!fait) return;
            }
          };
          replier(j.L);
          const glisserBord = (L) => {
            for (let k = 0; k < 30; k++) {
              const D = D_(L), bg = j.oG <= OUVERTURE_MIN + 1e-6 && dansDecor(m, D, [1, 2, 5]) > 0, bd = j.oD <= OUVERTURE_MIN + 1e-6 && dansDecor(m, D, [3, 4, 6]) > 0;
              if (bg === bd || dansDecor(m, D, [0]) > 0 || g.rail + 14 + L + G_.pointe > dessusEn(m, j.cx) - 30) return;
              const sg = bg ? 1 : -1;
              if (Math.abs(j.cx + sg * 1.5 - j.cible) > 40) return;
              j.cx += sg * 1.5;
            }
          };
          glisserBord(j.L);
          for (const [ks, cle] of [[[1, 2, 5], "G"], [[3, 4, 6], "D"]]) {
            const lim = "lim" + cle;
            if (j[lim] >= 1) continue;
            const o = Math.min(1, j[lim] + 0.04);
            const D = forme(m, j.cx + Math.sin(j.phi) * j.L, g.rail + 14 + Math.cos(j.phi) * j.L, j.phi, cle === "G" ? o : j.oG, cle === "D" ? o : j.oD);
            if (dansDecor(m, D, ks) <= 0) j[lim] = o;
          }
          if (j.t > 0.15) {
            if (maxEnfoncement(m.monde, [2]) > 3 && j.oG > OUVERTURE_MIN) j.oG = j.limG = Math.max(OUVERTURE_MIN, j.oG - 0.08);
            if (maxEnfoncement(m.monde, [4]) > 3 && j.oD > OUVERTURE_MIN) j.oD = j.limD = Math.max(OUVERTURE_MIN, j.oD - 0.08);
          }
          const butees = G_.decor ? [0, ...j.oG > OUVERTURE_MIN + 1e-6 ? [5] : [], ...j.oD > OUVERTURE_MIN + 1e-6 ? [6] : []] : void 0;
          const libre = (L) => dansDecor(m, D_(L), butees) <= 0;
          let bute = false;
          if (!libre(j.L)) {
            let a = L0, b = j.L;
            for (let k = 0; k < 8; k++) {
              const c = (a + b) / 2;
              if (libre(c)) a = c;
              else b = c;
            }
            j.L = a;
            bute = true;
          }
          const doigtBloque = (k, o) => o <= OUVERTURE_MIN + 1e-6 && maxEnfoncement(m.monde, [k]) > 3;
          if (bute || j.L >= G_.Lmax || j.t > 0.15 && (maxEnfoncement(m.monde, G_.decor ? [0, 5] : [0]) > (G_.decor ? -1 : 1) || doigtBloque(2, j.oG) || doigtBloque(4, j.oD))) {
            j.L = Math.min(j.L, G_.Lmax);
            if (G_.decor) j.vise = viseSous(m, j);
            j.etat = "fermeture";
            j.t = 0;
            j.surDecor = bute;
          }
          break;
        }
      case "fermeture":
        if (m.monde.phys) {
          if (j.lu && Math.max(j.lu.force.moyeu, j.lu.force.g, j.lu.force.d) > PH.ARRET.force * 2 && j.L > j.Lfond - PH.ARRET.recul * E_) j.L -= E_;
          if (j.t > GEO_VRAIE.fermer + RYTHME.pauseFond) {
            j.fermeG = j.oG;
            j.fermeD = j.oD;
            j.tenus = [];
            j.rate = null;
            j.Lbas = j.L;
            sonPince("serre", "serre");
            j.etat = "montee";
            j.t = 0;
            j.tPrise = 0;
            const pris = prisDe(m, j);
            for (const b of pris) m.monde.pince.saisir(b);
            j.glisseT = pris.length && !tricher && Math.random() < PRISE_VRAIE.glisse ? PRISE_VRAIE.quand[0] + Math.random() * (PRISE_VRAIE.quand[1] - PRISE_VRAIE.quand[0]) : null;
          }
          break;
        } else {
          const G1 = geoDe(m), fermer_ = G1.fermer ?? RYTHME.fermer, vv = dt / fermer_;
          const bute = (sg, o) => {
            const D = forme(m, j.hx, j.hy, j.phi, sg < 0 ? o : j.oG, sg > 0 ? o : j.oD), f = sg < 0 ? D.g : D.d;
            if (dansDecor(m, D, sg < 0 ? [1, 2, 5] : [3, 4, 6]) > 0) return true;
            if (G1.decor) return !!j.vise && j.vise.parts.some((p) => !p.tenu && enfoncement(p, { ax: f[2][0], ay: f[2][1], bx: f[2][0], by: f[2][1], r: G1.rBout }).d > 0);
            return [[...f[0], ...f[1]], [...f[1], ...f[2]]].some((k) => m.monde.parts.some((p) => !p.tenu && gros(p) && enfoncement(p, { ax: k[0], ay: k[1], bx: k[2], by: k[3], r: 6 * K }).d > 0));
          };
          if (!j.bloqueG) {
            if (bute(-1, j.oG - vv)) j.bloqueG = true;
            else j.oG = Math.max(0, j.oG - vv);
          }
          if (!j.bloqueD) {
            if (bute(1, j.oD - vv)) j.bloqueD = true;
            else j.oD = Math.max(0, j.oD - vv);
          }
          if (j.t > fermer_ + RYTHME.pauseFond) {
            j.fermeG = j.oG;
            j.fermeD = j.oD;
            prise(m, j);
            j.etat = "montee";
            j.t = 0;
            if (!vraisBruits()) son("monte");
          }
          break;
        }
      case "montee": {
        const L0_ = geoDe(m).L0;
        j.L -= (j.tenus.some((t) => !t.petit) ? 90 : 130) * dt;
        glisser(j, 0.55 * (1 - (j.L - L0_) / Math.max(1, j.Lbas - L0_)));
        serrer(j, dt);
        if (j.L <= L0_) {
          j.L = L0_;
          j.etat = "transport";
          j.t = 0;
          j.xDepart = j.cx;
        }
        break;
      }
      case "transport":
        glisser(j, 0.55 + 0.45 * clamp((j.cx - j.xDepart) / Math.max(1, G0.x0 - j.xDepart), 0, 1));
        serrer(j, dt);
        if (Math.abs(j.cx - G0.x0) < 3) {
          j.etat = "lacher";
          j.t = 0;
        }
        break;
      // au-dessus de la goulotte : un temps d'arrêt, puis elle s'ouvre et lâche
      case "lacher": {
        const t = j.t - RYTHME.pauseGoulotte;
        if (t < 0) {
          serrer(j, dt);
          break;
        }
        if (m.monde.phys && !j.lache) {
          j.lache = true;
          for (const b of [...j.lu?.tenus || [], ...m.monde.pince.prises]) if (b.donnees) b.donnees.lache = true;
          m.monde.pince.lacher();
        }
        j.oG = j.oD = Math.min(1, j.oG + dt * 4);
        if (t > 0.1 && j.tenus.length) {
          j.tenus.forEach((c_) => {
            lacher(c_.c);
            c_.c.lache = true;
          });
          j.tenus = [];
        }
        if (t > 0.9) {
          j.etat = "repos";
          j.t = 0;
        }
        break;
      }
      // (14/10) LA PINCE BOMBE (Badge Arcade : « Explosive Crane ») : on la mène à gauche comme la pince, la bombe pendue
      // à sa chaîne se balance ; on lâche : la bombe tombe, sa mèche brûle (AnCaObBombFuseBurn, 40 images), elle explose
      // et souffle ce qui l'entoure (peu, disent les joueurs) ; ce qu'elle a touché ou soufflé et qui tombe est gagné ;
      // le moyeu ne descend pas, il rentre au-dessus de la goulotte avec une bombe neuve
      case "largage":
        if (j.t >= BOMBE.pause && !j.bombeLachee) {
          const [bx, by] = pointBombe(j);
          j.bombeLachee = m.monde.phys.bombe(bx, by, j.vx / E_, 0);
          j.mecheT = 0;
          sonPince("bombe", "descend");
        }
        if (j.bombeLachee) {
          j.mecheT += dt;
          const b = j.bombeLachee.getPosition(), PPM_ = m.monde.phys.PPM;
          j.bombeXY = [b.x * PPM_, b.y * PPM_];
          if (j.mecheT >= PH.REGLAGES.bombe.meche || j.bombeXY[1] > ECRAN.h) {
            j.etat = "souffle";
            j.t = 0;
            j.bombeXY[1] = Math.min(j.bombeXY[1], ECRAN.h);
            for (const b_ of m.monde.phys.exploser(...j.bombeXY)) if (b_.donnees) b_.donnees.pince = true;
            j.eclat = { x: j.bombeXY[0], y: j.bombeXY[1], t: 0 };
            sonPince("explose", "goulotte");
            j.bombeLachee = null;
          }
        }
        break;
      case "souffle":
        if (j.t > BOMBE.attente || j.t > 0.8 && calme(m.monde)) {
          j.etat = "repos";
          j.t = 0;
        }
        break;
      case "repos":
        j.oG = j.oD = amortir(j.oG, OUVERTURE_REPOS, 4, dt);
        if (j.t > 1.8 || j.t > 0.6 && calme(m.monde)) {
          j.etat = "attente";
          j.cible = G0.x0;
          finPartie(m);
        }
        break;
      default:
        j.oG = j.oD = j.oG + (OUVERTURE_REPOS - j.oG) * Math.min(1, dt * 4);
    }
  };
  const ramasser = (m) => {
    const mo = m.monde;
    for (const c of mo.corps.slice()) {
      if (c.parts.some((p) => p.y < H + 60)) continue;
      const x = c.parts[0].x;
      retirerCorps(mo, c);
      const goulotte = mo.phys ? !!c.lache || dansChute(m, x) : x > (m.vraie ? GOULOTTE_VRAIE.x : PINCE.rebord) - 20;
      c.xChute = x;
      if (goulotte) {
        sonPince("goulotte", "goulotte");
        m.jeu.gains.push(c);
        stats.gains++;
        if (!c.lache) {
          stats.pousses++;
          (stats.journal ||= []).push(m.jeu.etat + "@" + Math.round(m.jeu.cx) + " de " + Math.round(c.xDebut) + "," + Math.round(c.yDebut));
        }
        if (c.id && !c.carton) {
          if (essai()) m.essai = true;
          else c.fois = enregistrer(m, c.id);
        }
        feter(m, c);
        if (m.jeu.etat === "attente") finPartie(m);
      } else if (m.vraie) (m.aRemettre ||= []).push(c.id);
      else remplirAvec(m, c);
    }
  };
  const POSE_BRUIT = 3.5;
  const avancer = (m, dt) => {
    if (m.monde.preroule) preroulerUnPeu(m);
    avancerPince(m, m.jeu, dt);
    positionnerOutil(m, dt);
    m.monde.enJeu = m.jeu.etat !== "attente";
    m.monde.prise = PRISE_COMPTE.has(m.jeu.etat);
    pas(m.monde, dt);
    ramasser(m);
    const mo = m.monde;
    if (m === mJeu && vue === "machine") {
      if (mo.chocs) sonPince("choc", null, 0.8);
      if (mo.poses) sonPince("pose", null, 0.6);
    }
    mo.chocs = mo.poses = 0;
  };
  const F = { sons: "casino-luigi/sons/", voix: "casino-luigi/voix/", musique: "casino-luigi", salleDeJeux: "casino-luigi-salle-de-jeux" };
  let opts = {};
  const octets = async (chemin, type) => {
    if (opts.lire) return opts.lire(chemin);
    const url = await window.__pcvRessource?.(chemin, type);
    if (!url) throw new Error("casino : prive/" + chemin + " absent");
    if (chemin.startsWith("badges/")) return (await fetch(url)).arrayBuffer();
    try {
      return await (await fetch(url)).arrayBuffer();
    } finally {
      URL.revokeObjectURL(url);
      if (window.__pcvBlobs?.[chemin] === url) delete window.__pcvBlobs[chemin];
    }
  };
  const images = /* @__PURE__ */ new Map();
  const image = (id) => {
    let im = images.get(id);
    if (im) return im;
    im = new Image();
    images.set(id, im);
    const chemin = "badges/" + id;
    (opts.lire ? opts.lire(chemin).then((b) => URL.createObjectURL(new Blob([b], { type: "image/png" }))) : Promise.resolve(window.__pcvRessource?.(chemin, "image/png"))).then((u) => {
      if (u) im.src = u;
    }).catch(() => {
    });
    return im;
  };
  const pret = (im) => im.complete && im.naturalWidth > 0;
  const quandPrete = (im, f) => {
    if (pret(im)) f(im);
    else im.addEventListener("load", () => f(im), { once: true });
  };
  const SONS = {
    bouge: "C_TOUCH",
    approche: "C_TURN",
    piece: "COIN_BET",
    refus: "COIN_LOST",
    descend: "C_DOWN",
    monte: "C_UP",
    serre: "C_SOROU",
    glisse: "C_CHANGE",
    tombe: "COIN_GET",
    gagne: "CASINO_WIN",
    rate: "CASINO_BAD",
    retour: "C_SORT"
  };
  const VOIX = { accueil: ["START"], designer: ["PROMPT"], gagne: ["PAIR"], bravo: ["PAIR", "CLAP"], rate: ["NOPAIR"], presque: ["LOSE"], ouvrir: ["DRAW"] };
  let ac = null, maitre = null;
  const tampons = {};
  const volume = () => +lire("pcv-bruitages", 1) || 0;
  const chargerSons = async () => {
    try {
      ac ||= new AudioContext();
      maitre ||= ac.createGain();
      maitre.connect(ac.destination);
    } catch (e) {
      return;
    }
    await Promise.all(Object.entries(SONS).map(async ([nom, f]) => {
      if (tampons[nom]) return;
      try {
        tampons[nom] = await ac.decodeAudioData(await octets(F.sons + "NCS_SE_MGM_" + f + ".wav", "audio/wav"));
      } catch (e) {
      }
    }));
    await Promise.all([...new Set(Object.values(VOIX).flat())].map(async (f) => {
      if (tampons["L_" + f]) return;
      try {
        tampons["L_" + f] = await ac.decodeAudioData(await octets(F.voix + "NCS_SE_MGM_L_" + f + ".wav", "audio/wav"));
      } catch (e) {
      }
    }));
    await Promise.all([...Object.values(SONS_BA), ...Object.values(BOUCLES_BA).map((b) => b.f)].map(async (f) => {
      if (tampons["ba:" + f]) return;
      try {
        tampons["ba:" + f] = await ac.decodeAudioData(await octets(PRIVE_BA.sons + f + ".ogg", "audio/ogg"));
      } catch (e) {
      }
    }));
  };
  const SONS_BA = {
    arret: "SE_CRANE_STOP",
    ouvre: "SE_CRANE_OPEN",
    serre: "SE_CRANE_CLOSED",
    choc: "SE_CRANE_PRIZE_HIT",
    pose: "SE_CRANE_PRIZE_DOWN",
    goulotte: "SE_CRANE_SLOT_OUT",
    gain1: "SE_GET_BADGE_01",
    gain2: "SE_GET_BADGE_02",
    gain3: "SE_GET_BADGE_03",
    gain4: "SE_GET_BADGE_04",
    bouton: "SE_CRANE_PUSH_BUTTON_ON",
    boutonLache: "SE_CRANE_PUSH_BUTTON_OFF",
    touche: "SE_CRANE_BADGE_TOUCH_GET",
    bombe: "SE_CRANE_BOMB_THROW",
    explose: "SE_CRANE_BOMB_EXPLORE"
  };
  const BOUCLES_BA = { deplacement: { f: "SE_CRANE_GO", de: 0.6, a: 1.6 }, descente: { f: "SE_CRANE_DOWN", de: 0.2, a: 1.8 }, montee: { f: "SE_CRANE_UP", de: 0.2, a: 1.8 }, transport: { f: "SE_CRANE_BACK", de: 0.6, a: 1.6 } };
  const VARIE_BOUCLE = 0.03, FONDU_BOUCLE = 0.06, SONS_PINCE_ECART = { choc: 0.18, pose: 0.25 };
  const derniersSons = {};
  const sonPince = (nom, repli, v = 1, t0 = 0) => {
    const b = tampons["ba:" + SONS_BA[nom]];
    if (!b) return repli && son(repli, v);
    if (!ac || !volume()) return;
    if (pilote) journalSons(nom);
    if (SONS_PINCE_ECART[nom]) {
      if (horloge - (derniersSons[nom] ?? -9) < SONS_PINCE_ECART[nom]) return;
      derniersSons[nom] = horloge;
    }
    try {
      if (ac.state === "suspended") ac.resume();
      maitre.gain.value = volume() * 0.8;
      const s_ = ac.createBufferSource(), g = ac.createGain();
      s_.buffer = b;
      s_.playbackRate.value = 1 + (Math.random() - 0.5) * 2 * VARIE;
      g.gain.value = v;
      s_.connect(g).connect(maitre);
      s_.start(ac.currentTime + t0);
    } catch (e) {
    }
  };
  let boucleEnCours = null;
  const boucler = (cle) => {
    if ((boucleEnCours?.cle ?? null) === (cle ?? null)) return;
    if (boucleEnCours) {
      const { s: s_, g } = boucleEnCours;
      try {
        g.gain.setTargetAtTime(0, ac.currentTime, FONDU_BOUCLE / 3);
        s_.stop(ac.currentTime + FONDU_BOUCLE * 2);
      } catch (e) {
      }
      boucleEnCours = null;
    }
    const B_ = cle && BOUCLES_BA[cle], b = B_ && tampons["ba:" + B_.f];
    if (!b || !ac || !volume()) return;
    if (pilote) journalSons("boucle:" + cle);
    try {
      maitre.gain.value = volume() * 0.8;
      const s_ = ac.createBufferSource(), g = ac.createGain();
      s_.buffer = b;
      s_.loop = true;
      s_.loopStart = B_.de;
      s_.loopEnd = B_.a;
      s_.playbackRate.value = 1 + (Math.random() - 0.5) * 2 * VARIE_BOUCLE;
      g.gain.setValueAtTime(0, ac.currentTime);
      g.gain.linearRampToValueAtTime(0.8, ac.currentTime + FONDU_BOUCLE);
      s_.connect(g).connect(maitre);
      s_.start(ac.currentTime, B_.de * 0.5);
      boucleEnCours = { cle, s: s_, g };
    } catch (e) {
    }
  };
  const journalSons = (x) => {
    const l = stats.sons ||= [];
    if (l.length < 200) l.push(Math.round(horloge * 10) / 10 + " " + x);
  };
  const vraisBruits = () => !!tampons["ba:" + BOUCLES_BA.deplacement.f];
  const voix = (geste2) => {
    const l = VOIX[geste2];
    if (!l) return;
    let t = 0;
    for (const f of l) {
      setTimeout(() => son("L_" + f, 0.9), t);
      t += (tampons["L_" + f]?.duration || 0) * 1e3 + 120;
    }
  };
  const VARIE = 0.05;
  const son = (nom, v = 1) => {
    if (SYNTH[nom]) return synth(nom, v);
    const b = tampons[nom];
    if (!b || !ac || !volume()) return;
    try {
      if (ac.state === "suspended") ac.resume();
      maitre.gain.value = volume() * 0.8;
      const s = ac.createBufferSource(), g = ac.createGain();
      s.buffer = b;
      s.playbackRate.value = 1 + (Math.random() - 0.5) * 2 * VARIE;
      g.gain.value = v;
      s.connect(g).connect(maitre);
      s.start();
    } catch (e) {
    }
  };
  const note = (type, f0, f1, d, v, t0 = 0) => {
    const t = ac.currentTime + t0, o = ac.createOscillator(), g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + d);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + Math.min(0.015, d / 4));
    g.gain.exponentialRampToValueAtTime(5e-4, t + d);
    o.connect(g).connect(maitre);
    o.start(t);
    o.stop(t + d + 0.02);
  };
  let bruitBlanc = null;
  const souffle = (f0, f1, d, v, t0 = 0) => {
    const t = ac.currentTime + t0;
    bruitBlanc ||= (() => {
      const b = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), x = b.getChannelData(0);
      for (let i = 0; i < x.length; i++) x[i] = Math.random() * 2 - 1;
      return b;
    })();
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = bruitBlanc;
    f.type = "bandpass";
    f.Q.value = 1.2;
    f.frequency.setValueAtTime(f0, t);
    f.frequency.exponentialRampToValueAtTime(f1, t + d);
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(5e-4, t + d);
    s.connect(f).connect(g).connect(maitre);
    s.start(t);
    s.stop(t + d + 0.02);
  };
  const alea = (x) => x * (1 + (Math.random() - 0.5) * 2 * VARIE);
  const SYNTH = {
    ouvre: (v) => {
      note("square", alea(1320), alea(1760), 0.05, 0.05 * v);
      note("triangle", alea(660), alea(990), 0.18, 0.07 * v, 0.04);
    },
    // déclic, puis les doigts qui s'écartent
    serre: (v) => {
      note("square", alea(880), alea(520), 0.06, 0.05 * v);
      souffle(2400, 900, 0.12, 0.08 * v, 0.02);
    },
    descend: (v) => note("triangle", alea(520), alea(260), 0.55, 0.07 * v),
    monte: (v) => {
      note("triangle", alea(330), alea(990), 1.2, 0.07 * v);
      note("sine", alea(660), alea(1980), 1.2, 0.025 * v);
    },
    // le glissando de la montée
    goulotte: (v) => {
      souffle(1800, 300, 0.35, 0.22 * v);
      note("sine", alea(220), alea(90), 0.25, 0.12 * v);
    },
    // « pouf » dans la goulotte
    surprise: (v) => [0, 4, 7, 12].forEach((k, i) => note("triangle", 880 * 2 ** (k / 12), 880 * 2 ** (k / 12), 0.14, 0.06 * v, i * 0.07))
  };
  const synth = (nom, v) => {
    if (!ac || !volume()) return;
    try {
      if (ac.state === "suspended") ac.resume();
      maitre.gain.value = volume() * 0.8;
      SYNTH[nom](v);
    } catch (e) {
    }
  };
  const MOTEUR = { pas: 0.15, gamme: [0, 2, 4, 7, 9, 12, 9, 7], base: 523, v: 0.035 };
  let moteurT = 0, moteurK = 0;
  const sonsPince = (dt) => {
    const j = mJeu?.jeu;
    if (ac && vraisBruits()) return boucler(j && vue === "machine" && BOUCLES_BA[j.etat] ? j.etat : null);
    if (!j || vue !== "machine" || !ac) return;
    const va = j.etat === "deplacement", retour2 = j.etat === "transport";
    if (!va && !retour2) {
      moteurK = 0;
      moteurT = 0;
      return;
    }
    moteurT -= dt;
    if (moteurT > 0) return;
    moteurT = MOTEUR.pas * (retour2 ? 1.4 : 1);
    const f = MOTEUR.base * (retour2 ? 0.5 : 1) * 2 ** ((MOTEUR.gamme[moteurK++ % MOTEUR.gamme.length] + (va ? Math.floor(moteurK / MOTEUR.gamme.length) : 0)) / 12);
    if (volume()) try {
      note("square", alea(f), alea(f), 0.09, MOTEUR.v * (retour2 ? 0.6 : 1));
    } catch (e) {
    }
  };
  const MUSIQUE = { machine: "badge-arcade/machine", derniere: "badge-arcade/derniere-partie", boite: "badge-arcade/boite" };
  let musiqueSalle = false, musiqueCartes = null, musiqueVoulue;
  const MUSIQUE_CLE = "pcv-casino-musique";
  const lecteurCasino = window.__pcvLecteurMusique?.();
  const musiqueUrl = {};
  const FONDU_CASINO = 1;
  const volMusique = () => lire("pcv-volume-musique", 0.3);
  const finFonduCasino = (cible) => new Promise((ok) => {
    const g = lecteurCasino?._gain;
    if (!g) {
      lecteurCasino && (lecteurCasino.volume = cible);
      return ok();
    }
    g.gain.setTargetAtTime(cible, g.context.currentTime, FONDU_CASINO / 3);
    setTimeout(ok, FONDU_CASINO * 1e3);
  });
  const musique = (cle) => {
    const silence = lire(MUSIQUE_CLE, true) === false || lire("pcv-musique", false) === false;
    const p = silence ? false : cle === "salle" ? musiqueSalle : cle === "cartes" ? musiqueCartes || musiqueSalle : MUSIQUE[cle] || null;
    if (p === musiqueVoulue) return;
    musiqueVoulue = p;
    if (!lecteurCasino) return;
    if (!p) {
      if (!lecteurCasino.paused) finFonduCasino(0).then(() => {
        if (!musiqueVoulue) lecteurCasino.pause();
      });
      return;
    }
    (async () => {
      const u = musiqueUrl[p] ||= await (opts.lire ? opts.lire("sons/" + p + ".mp3").then((b) => URL.createObjectURL(new Blob([b], { type: "audio/mpeg" }))) : Promise.resolve(window.__pcvRessource?.("sons/" + p + ".mp3", "audio/mpeg"))).catch(() => null);
      if (musiqueVoulue !== p || !u) return;
      const silencieux = lecteurCasino.paused;
      if (lecteurCasino.src !== u) {
        lecteurCasino.src = u;
        lecteurCasino.dataset.chemin = "sons/" + p + ".mp3";
        lecteurCasino.currentTime = 0;
      }
      lecteurCasino.volume = silencieux ? 0 : volMusique();
      await lecteurCasino.play();
      if (musiqueVoulue !== p) return;
      if (silencieux) finFonduCasino(volMusique());
      else lecteurCasino.volume = volMusique();
    })();
  };
  const jingleAudio = new Audio(), jingleUrl = {};
  const jingle = async (nom) => {
    if (!volume()) return;
    const u = jingleUrl[nom] ||= await (opts.lire ? opts.lire("sons/badge-arcade/" + nom + ".mp3").then((b) => URL.createObjectURL(new Blob([b], { type: "audio/mpeg" }))) : Promise.resolve(window.__pcvRessource?.("sons/badge-arcade/" + nom + ".mp3", "audio/mpeg"))).catch(() => null);
    if (!u || opts.pilote) return;
    jingleAudio.src = u;
    jingleAudio.volume = 0.45 * volume();
    jingleAudio.play().catch(() => {
    });
  };
  let jetables = [];
  const garder = (x) => (jetables.push(x), x);
  const toile = (l, h) => {
    const c = document.createElement("canvas");
    c.width = l;
    c.height = h;
    return [c, c.getContext("2d")];
  };
  const pixels = (im) => {
    const [c, x] = toile(im.width, im.height);
    x.drawImage(im, 0, 0);
    return x.getImageData(0, 0, c.width, c.height);
  };
  const scale2x = (img, enroule) => {
    const w = img.width, h = img.height, s = new Uint32Array(img.data.buffer.slice(0)), o = new ImageData(w * 2, h * 2), d = new Uint32Array(o.data.buffer);
    const at = (x, y) => enroule ? s[(y + h) % h * w + (x + w) % w] : s[clamp(y, 0, h - 1) * w + clamp(x, 0, w - 1)];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const E0 = at(x, y), B = at(x, y - 1), D = at(x - 1, y), Fx = at(x + 1, y), Hh = at(x, y + 1), i = y * 2 * w * 2 + x * 2;
      d[i] = D === B && B !== Fx && D !== Hh ? D : E0;
      d[i + 1] = B === Fx && B !== D && Fx !== Hh ? Fx : E0;
      d[i + w * 2] = D === Hh && D !== B && Hh !== Fx ? D : E0;
      d[i + w * 2 + 1] = Hh === Fx && D !== Hh && B !== Fx ? Fx : E0;
    }
    return o;
  };
  const agrandir = (im, fois = 2, enroule = true) => {
    let d = im instanceof ImageData ? im : pixels(im);
    for (let k = 0; k < fois; k++) d = scale2x(d, enroule);
    const [c, x] = toile(d.width, d.height);
    x.putImageData(d, 0, 0);
    return c;
  };
  const texture = (c, o = {}) => {
    const t = garder(new T.CanvasTexture(c));
    t.flipY = o.flipY ?? false;
    t.colorSpace = T.SRGBColorSpace;
    t.wrapS = t.wrapT = o.bord ? T.ClampToEdgeWrapping : T.RepeatWrapping;
    t.anisotropy = rendu?.capabilities.getMaxAnisotropy?.() || 4;
    t.magFilter = T.LinearFilter;
    t.minFilter = T.LinearMipmapLinearFilter;
    t.generateMipmaps = true;
    return t;
  };
  const degrade = (c, h, ...cs) => {
    const g = c.createLinearGradient(0, 0, 0, h);
    cs.forEach((k, i) => g.addColorStop(i / (cs.length - 1), k));
    return g;
  };
  const etoile = (x, cx, cy, R) => {
    x.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? R * 0.45 : R;
      x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    x.closePath();
    x.fill();
  };
  const C = {
    carton: ["#4ea2ea", "#2b72c6"],
    planche: "rgba(12,44,110,.38)",
    herbe: ["#5fca3f", "#3f9f2c"],
    herbeRaie: "rgba(30,110,20,.22)",
    corde: ["#e3352f", "#ffffff"],
    cordeGrise: ["#8f9aa6", "#ffffff"],
    nuit: ["#2d3c73", "#1a2450"],
    ciel: ["#5c94fc", "#a8c8fc"],
    piste: ["#40525c", "#71848c"],
    damier: ["#bff3f6", "#3fc6cf"],
    glace: ["#ffffff", "#d9effa", "#a9d6ee"],
    autocollant: "#fffdf2",
    lisere: "rgba(96,86,74,.6)",
    kraft: ["#b5834a", "#e2bf86"],
    pince: "#ffd21c",
    pinceEntrainement: "#ee3a2c",
    ecranNuit: "#0f1d45",
    ecranChiffre: "#c9ecff",
    triangle: "#ffd83f",
    triangleBord: "#1e2a52",
    goulotte: "#16204a"
  };
  const DECOR_SERIE = {
    Tank: "desert",
    SFZero: "espace",
    CrazyGalaxy: "espace",
    Hakoboy: "boite",
    Pushmo: "pousse",
    Tomodachi: "ile",
    Karesansui: "zen",
    Lawson: "lawson",
    Nikki: "carnet",
    Nikki2: "carnet",
    Todofuken: "japon",
    Mgmmgr: "japon",
    DalSp: "stade",
    Rhythm: "bibliotheque",
    Rhythm2: "bibliotheque",
    BandBro: "scene",
    BandBro2: "scene",
    Rockman: "rockman",
    Rockman2: "rockman"
  };
  const DECOR_FAMILLE = {
    "Pok\xE9mon": "pokemon",
    Mario: "champignon",
    "Yo-kai Watch": "yokai",
    "R\xE9tro": "pixels",
    Zelda: "zelda",
    "Animal Crossing": "village",
    "Monster Hunter": "chasse",
    Splatoon: "encre",
    Musique: "scene",
    Kirby: "reve",
    "Badge Arcade": "arcade",
    WarioWare: "wario",
    "Fire Emblem": "blason",
    Pikmin: "jardin",
    Sanrio: "sanrio",
    Divers: "arcade"
  };
  const disque = (x, cx, cy, R) => {
    x.beginPath();
    x.arc(cx, cy, R, 0, Math.PI * 2);
    x.fill();
  };
  const nuageDessin = (x, cx, cy, R, fond, bord) => {
    x.fillStyle = bord;
    for (const [dx, dy, k] of [[-1, 0.2, 0.7], [0, -0.25, 1], [1, 0.2, 0.75], [0.5, 0.35, 0.7], [-0.5, 0.35, 0.7]]) disque(x, cx + dx * R, cy + dy * R, R * k + 3);
    x.fillStyle = fond;
    for (const [dx, dy, k] of [[-1, 0.2, 0.7], [0, -0.25, 1], [1, 0.2, 0.75], [0.5, 0.35, 0.7], [-0.5, 0.35, 0.7]]) disque(x, cx + dx * R, cy + dy * R, R * k);
  };
  const rayonEclair = (x, cx, cy, a0, a1, R, n) => {
    x.beginPath();
    x.moveTo(cx, cy);
    for (let k = 1; k <= n; k++) {
      const rr = R * k / n, a = a0 + (k % 2 ? 1 : -1) * (a1 - a0) * 0.35;
      x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    for (let k = n; k >= 1; k--) {
      const rr = R * k / n, a = a1 + (k % 2 ? 1 : -1) * (a1 - a0) * 0.35;
      x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    x.closePath();
    x.fill();
  };
  const cube = (x, cx, cy, e, haut, gauche, droite) => {
    const T0 = [cx, cy - e * 0.5], T1 = [cx + e * 0.866, cy], T2 = [cx, cy + e * 0.5], T3 = [cx - e * 0.866, cy], bas = ([a, b]) => [a, b + e];
    const poly = (pts, c) => {
      x.fillStyle = c;
      x.beginPath();
      pts.forEach(([a, b], i) => x[i ? "lineTo" : "moveTo"](a, b));
      x.closePath();
      x.fill();
    };
    poly([T0, T1, T2, T3], haut);
    poly([T3, T2, bas(T2), bas(T3)], gauche);
    poly([T2, T1, bas(T1), bas(T2)], droite);
  };
  const silhouetteVille = (x, l, base, r, c, hMin, hMax, fenetres) => {
    let px = -10;
    x.fillStyle = c;
    while (px < l) {
      const w = 30 + r() * 60, hh = hMin + r() * (hMax - hMin);
      x.fillStyle = c;
      x.fillRect(px, base - hh, w, hh + 2);
      if (fenetres) {
        x.fillStyle = fenetres;
        for (let fy = base - hh + 8; fy < base - 8; fy += 12) for (let fx = px + 6; fx < px + w - 8; fx += 10) if (r() < 0.45) x.fillRect(fx, fy, 4, 6);
      }
      px += w + 2;
    }
  };
  const toits = (x, l, base, r, c) => {
    let px = -20;
    x.fillStyle = c;
    while (px < l) {
      const w = 50 + r() * 70, hh = 30 + r() * 40;
      x.beginPath();
      x.moveTo(px - 8, base - hh);
      x.lineTo(px + w * 0.5, base - hh - 22 - r() * 10);
      x.lineTo(px + w + 8, base - hh);
      x.closePath();
      x.fill();
      x.fillRect(px, base - hh, w, hh + 2);
      px += w + 6 + r() * 20;
    }
  };
  const DECORS = {
    // Pokémon (relevé : machine Pokémon de l'appli) : jaune vif, rayons en éclairs autour d'un point lumineux ; plateau jaune
    // bordé d'une corde bleu et blanc, pince jaune ; goulotte aux ▽ blancs cernés de bleu
    pokemon: {
      cotes: ["#ffe14a", "#f2b200"],
      pince: "#ffd21c",
      corde: ["#2a6fe0", "#ffffff"],
      goulotte: { fond: "#f2b200", tri: "#ffffff", cerne: "#2a6fe0" },
      plateau: { face: ["#ffd84a", "#f0a800"], motif: "raies", trait: "rgba(255,255,255,.22)", dessus: 16770688 },
      fond: (x, l, h, r, xv, yv, nu) => {
        x.fillStyle = degrade(x, h, "#ffec5a", "#ffc800");
        x.fillRect(0, 0, l, h);
        const cx = nu ? l * 0.3 : xv(0.55), cy = nu ? h * 0.4 : yv(0.36), R = Math.hypot(l, h), n = 26;
        for (let i = 0; i < n; i++) {
          x.fillStyle = i % 2 ? "rgba(255,255,255,.3)" : "rgba(255,150,0,.24)";
          rayonEclair(x, cx, cy, i / n * Math.PI * 2, (i + 0.55) / n * Math.PI * 2, R, 14);
        }
        const g = x.createRadialGradient(cx, cy, 0, cx, cy, h * 0.45);
        g.addColorStop(0, "rgba(255,255,235,.95)");
        g.addColorStop(0.25, "rgba(255,250,200,.5)");
        g.addColorStop(1, "rgba(255,240,150,0)");
        x.fillStyle = g;
        x.fillRect(0, 0, l, h);
      }
    },
    // Mario (le Royaume Champignon des jeux 2D) : ciel bleu, nuages blancs ronds, collines vertes à taches, sol de briques
    champignon: {
      cotes: ["#5cb8ff", "#bfe6ff"],
      pince: "#e52521",
      corde: ["#e52521", "#ffffff"],
      plateau: { face: ["#d9733a", "#9a4416"], motif: "briques", trait: "rgba(70,20,0,.45)", dessus: 6277695 },
      fond: (x, l, h, r, xv, yv, nu) => {
        x.fillStyle = degrade(x, h, "#4aa8ff", "#c4e8ff");
        x.fillRect(0, 0, l, h);
        if (nu) return;
        for (const [f, y, R] of [[0.12, 0.14, 26], [0.5, 0.08, 34], [0.82, 0.2, 24]]) nuageDessin(x, xv(f), yv(y), R, "#ffffff", "rgba(60,120,200,.35)");
        for (const [f, R, c] of [[0.18, 0.3, "#2fa83a"], [0.62, 0.24, "#3fbf45"], [0.95, 0.32, "#2fa83a"]]) {
          const cx = xv(f), base = yv(0.98), rr = (yv(1) - yv(0)) * R;
          x.fillStyle = "#1c6b22";
          disque(x, cx, base, rr + 5);
          x.fillStyle = c;
          disque(x, cx, base, rr);
          x.fillStyle = "#1c6b22";
          for (let k = 0; k < 3; k++) {
            x.beginPath();
            x.ellipse(cx - rr * 0.3 + k * rr * 0.3, base - rr * 0.55 + k % 2 * rr * 0.12, rr * 0.05, rr * 0.11, 0, 0, Math.PI * 2);
            x.fill();
          }
        }
      }
    },
    // Yo-kai Watch : la ville au crépuscule (toits et poteaux électriques), le grand cercle d'invocation dans le ciel,
    // des volutes violettes ; pince rouge et blanche, plateau violet
    yokai: {
      cotes: ["#5a2a8c", "#ff9a4a"],
      pince: "#e8382f",
      corde: ["#e8382f", "#ffffff"],
      plateau: { face: ["#8a62c4", "#4b2f78"], motif: "points", trait: "rgba(255,255,255,.14)", dessus: 11111136 },
      fond: (x, l, h, r, xv, yv, nu) => {
        x.fillStyle = degrade(x, h, "#3b1d6e", "#8a3fa8", "#ff8a3d", "#ffc06a");
        x.fillRect(0, 0, l, h);
        if (nu) return;
        const cx = xv(0.5), cy = yv(0.34), R = (yv(1) - yv(0)) * 0.3;
        x.strokeStyle = "rgba(255,240,200,.75)";
        x.lineWidth = 6;
        x.beginPath();
        x.arc(cx, cy, R, 0, Math.PI * 2);
        x.stroke();
        x.lineWidth = 2;
        x.beginPath();
        x.arc(cx, cy, R * 0.78, 0, Math.PI * 2);
        x.stroke();
        for (let k = 0; k < 8; k++) {
          const a = k / 8 * Math.PI * 2;
          x.fillStyle = "rgba(255,240,200,.75)";
          disque(x, cx + Math.cos(a) * R * 0.89, cy + Math.sin(a) * R * 0.89, 6);
        }
        x.strokeStyle = "rgba(190,120,255,.45)";
        x.lineWidth = 5;
        for (let k = 0; k < 5; k++) {
          const px = xv(r()), py = yv(0.15 + r() * 0.35);
          x.beginPath();
          x.moveTo(px, py);
          x.bezierCurveTo(px + 20, py - 30, px + 50, py + 10, px + 30, py - 40);
          x.stroke();
        }
        toits(x, l, yv(0.98), r, "#2a1446");
        x.strokeStyle = "#2a1446";
        x.lineWidth = 3;
        for (const f of [0.1, 0.45, 0.8]) {
          const px = xv(f);
          x.fillStyle = "#2a1446";
          x.fillRect(px - 3, yv(0.45), 6, yv(1) - yv(0.45));
          x.fillRect(px - 16, yv(0.48), 32, 3);
        }
        x.lineWidth = 1.5;
        for (let k = 0; k < 3; k++) {
          x.beginPath();
          x.moveTo(0, yv(0.49 + k * 0.02));
          x.quadraticCurveTo(xv(0.3), yv(0.56 + k * 0.02), xv(0.45), yv(0.49 + k * 0.02));
          x.quadraticCurveTo(xv(0.62), yv(0.56 + k * 0.02), xv(0.8), yv(0.49 + k * 0.02));
          x.quadraticCurveTo(xv(1), yv(0.56 + k * 0.02), l, yv(0.49 + k * 0.02));
          x.stroke();
        }
      }
    },
    // Pixels Nintendo : les consoles en pixels ; un fond par console (couleur de sa coque) sur une trame de gros pixels,
    // et son signe : le cube du démarrage du GameCube, les rayures de la Famicom, les quatre cubes de la N64…
    pixels: {
      cotes: ["#4b3fa0", "#2a2266"],
      pince: "#8f84e8",
      corde: ["#2fbf4a", "#ffffff"],
      plateau: { face: ["#4b3fa0", "#241c5c"], motif: "grille", trait: "rgba(255,255,255,.12)", dessus: 6971344 },
      fond: (x, l, h, r, xv, yv, nu, m) => {
        const P = PIXELS[m?.cle] || PIXELS.DotHard5;
        x.fillStyle = degrade(x, h, ...P.fond);
        x.fillRect(0, 0, l, h);
        const e = 16;
        for (let py = 0; py < h; py += e) for (let px = 0; px < l; px += e) if ((px + py) / e % 2 === 0) {
          x.fillStyle = P.trame;
          x.fillRect(px, py, e, e);
        }
        if (nu) return;
        P.signe(x, l, h, r, xv, yv);
      }
    },
    // Mega Man : la ville de nuit de l'intro de Mega Man 2 (gratte-ciel, fenêtres allumées, étoiles en pixels)
    rockman: {
      cotes: ["#0a1450", "#1d3aa8"],
      pince: "#3ab4f2",
      corde: ["#3ab4f2", "#ffffff"],
      plateau: { face: ["#9aa6b8", "#596478"], motif: "rivets", trait: "rgba(30,40,60,.5)", dessus: 12109014 },
      fond: (x, l, h, r, xv, yv, nu) => {
        x.fillStyle = degrade(x, h, "#060c3a", "#13277c", "#2a52c4");
        x.fillRect(0, 0, l, h);
        x.fillStyle = "#ffffff";
        for (let k = 0; k < 70; k++) x.fillRect(Math.round(r() * l / 4) * 4, Math.round(r() * h * 0.6 / 4) * 4, 4, 4);
        if (nu) return;
        silhouetteVille(x, l, yv(1.02), r, "#05081e", (yv(1) - yv(0)) * 0.25, (yv(1) - yv(0)) * 0.62, "#ffe37a");
      }
    },
    // Zelda : la plaine d'Hyrule, la Montagne de la Mort qui rougeoie au loin, le château ; pince dorée (la Triforce)
    zelda: {
      cotes: ["#7cc6e6", "#d6eef2"],
      pince: "#e8b53a",
      corde: ["#e8b53a", "#2f6e2a"],
      plateau: { face: ["#a8895a", "#6e5530"], motif: "pierres", trait: "rgba(60,40,20,.35)", dessus: 7323461 },
      fond: (x, l, h, r, xv, yv, nu) => {
        x.fillStyle = degrade(x, h, "#6cbfe4", "#d8f0f0");
        x.fillRect(0, 0, l, h);
        if (nu) return;
        const crete = (base, amp, c, pas2) => {
          x.fillStyle = c;
          x.beginPath();
          x.moveTo(0, h);
          for (let px = 0; px <= l; px += pas2) x.lineTo(px, base - amp * (0.5 + 0.5 * Math.sin(px / 90 + r() * 0.6)));
          x.lineTo(l, h);
          x.fill();
        };
        crete(yv(0.55), 50, "#9fb6c8", 40);
        const vx = xv(0.8), vy = yv(0.3);
        x.fillStyle = "#6a4a46";
        x.beginPath();
        x.moveTo(vx - 120, yv(0.62));
        x.lineTo(vx - 18, vy);
        x.lineTo(vx + 18, vy);
        x.lineTo(vx + 120, yv(0.62));
        x.fill();
        const g = x.createRadialGradient(vx, vy, 0, vx, vy, 60);
        g.addColorStop(0, "rgba(255,90,40,.9)");
        g.addColorStop(1, "rgba(255,90,40,0)");
        x.fillStyle = g;
        x.fillRect(vx - 60, vy - 60, 120, 120);
        const cx = xv(0.3), cy = yv(0.6);
        x.fillStyle = "#7d8ea6";
        x.fillRect(cx - 40, cy - 30, 80, 30);
        for (const [dx, hh] of [[-36, 50], [0, 75], [36, 50]]) {
          x.fillRect(cx + dx - 7, cy - hh, 14, hh);
          x.beginPath();
          x.moveTo(cx + dx - 10, cy - hh);
          x.lineTo(cx + dx, cy - hh - 16);
          x.lineTo(cx + dx + 10, cy - hh);
          x.fill();
        }
        crete(yv(0.75), 30, "#7fbf5a", 30);
        crete(yv(0.9), 20, "#5fa83f", 24);
      }
    },
    // Animal Crossing : vert tendre semé de feuilles (le signe du jeu), bande de sable ; corde en bois de chez Tom Nook
    village: {
      cotes: ["#bfe58a", "#e9f6c8"],
      pince: "#5fbf3a",
      corde: ["#8a5a2b", "#f3e3c0"],
      plateau: { face: ["#f1d58e", "#d2a85a"], motif: "points", trait: "rgba(255,255,255,.35)", dessus: 16180136 },
      fond: (x, l, h, r, xv, yv, nu) => {
        x.fillStyle = degrade(x, h, "#a8d86e", "#e6f5c0");
        x.fillRect(0, 0, l, h);
        x.fillStyle = "rgba(255,255,255,.25)";
        for (let k = 0; k < l; k += 48) x.fillRect(k, 0, 18, h);
        if (nu) return;
        for (let k = 0; k < 14; k++) {
          const cx = xv(r()), cy = yv(r() * 0.85), R = 16 + r() * 16, a = r() * Math.PI * 2;
          x.save();
          x.translate(cx, cy);
          x.rotate(a);
          x.fillStyle = "#4f9f2f";
          x.beginPath();
          x.moveTo(0, -R);
          x.bezierCurveTo(R * 0.9, -R * 0.6, R * 0.8, R * 0.5, 0, R);
          x.bezierCurveTo(-R * 0.8, R * 0.5, -R * 0.9, -R * 0.6, 0, -R);
          x.fill();
          x.strokeStyle = "#cfeaa0";
          x.lineWidth = 2;
          x.beginPath();
          x.moveTo(0, -R * 0.7);
          x.lineTo(0, R * 1.25);
          x.stroke();
          x.restore();
        }
      }
    },
    // Monster Hunter : les notes du chasseur, carte sur parchemin (quadrillage, courbes de niveau, rose des vents)
    chasse: {
      cotes: ["#e9d9b0", "#cdb383"],
      pince: "#b07a3a",
      corde: ["#7a4a1e", "#e9d9b0"],
      plateau: { face: ["#8a7a64", "#5b4c3a"], motif: "pierres", trait: "rgba(30,20,10,.35)", dessus: 8359754 },
      fond: (x, l, h, r, xv, yv, nu) => {
        x.fillStyle = degrade(x, h, "#efe2bd", "#d5bd8e");
        x.fillRect(0, 0, l, h);
        x.strokeStyle = "rgba(110,70,30,.18)";
        x.lineWidth = 1;
        for (let k = 0; k < l; k += 40) {
          x.beginPath();
          x.moveTo(k, 0);
          x.lineTo(k, h);
          x.stroke();
        }
        for (let k = 0; k < h; k += 40) {
          x.beginPath();
          x.moveTo(0, k);
          x.lineTo(l, k);
          x.stroke();
        }
        if (nu) return;
        x.strokeStyle = "rgba(110,70,30,.5)";
        x.lineWidth = 2;
        for (let k = 0; k < 4; k++) {
          x.beginPath();
          x.ellipse(xv(0.35), yv(0.45), 60 + k * 34, 36 + k * 22, 0.2, 0, Math.PI * 2);
          x.stroke();
        }
        const rx = xv(0.82), ry = yv(0.25);
        x.fillStyle = "rgba(110,70,30,.6)";
        for (let k = 0; k < 4; k++) {
          x.save();
          x.translate(rx, ry);
          x.rotate(k * Math.PI / 2);
          x.beginPath();
          x.moveTo(0, -38);
          x.lineTo(7, 0);
          x.lineTo(-7, 0);
          x.fill();
          x.restore();
        }
      }
    },
    // Splatoon : l'encre de la guerre de territoire, rose et vert fluo, éclaboussures et coulures sur fond sombre
    encre: {
      cotes: ["#2a2338", "#17121f"],
      pince: "#c7f22b",
      corde: ["#ff3f9f", "#c7f22b"],
      plateau: { face: ["#7d7f87", "#55575e"], motif: "taches", trait: "rgba(255,63,159,.55)", dessus: 10132643 },
      fond: (x, l, h, r, xv, yv, nu) => {
        x.fillStyle = degrade(x, h, "#2c2440", "#14101c");
        x.fillRect(0, 0, l, h);
        if (nu) return;
        for (let k = 0; k < 9; k++) {
          const c = k % 2 ? "#ff3f9f" : "#b4f01e", cx = xv(r()), cy = yv(r() * 0.8), R = 24 + r() * 40;
          x.fillStyle = c;
          disque(x, cx, cy, R);
          for (let j = 0; j < 7; j++) {
            const a = r() * Math.PI * 2, d = R * (1 + r() * 0.6);
            disque(x, cx + Math.cos(a) * d, cy + Math.sin(a) * d, R * (0.12 + r() * 0.2));
          }
          x.fillRect(cx - R * 0.2, cy, R * 0.18, R * (1 + r() * 1.5));
        }
      }
    },
    // Rhythm Heaven (relevé : machine de l'appli) : la bibliothèque, rayonnages qui fuient vers le fond, mur clair ; le bord
    // ondulé blanc et bleu pâle ; pince bleue
    bibliotheque: {
      cotes: ["#e9eef2", "#c9d3dc"],
      pince: "#2f6fd6",
      bord: "vagues",
      plateau: { face: ["#ffffff", "#bfe0f2"], motif: "vagues", trait: "rgba(120,190,230,.35)", dessus: 15398655 },
      fond: (x, l, h, r, xv, yv, nu) => {
        x.fillStyle = degrade(x, h, "#f4f6f8", "#d7dee5");
        x.fillRect(0, 0, l, h);
        const etagere = (x0, x1, y0, y1) => {
          x.fillStyle = "#b9a58a";
          x.fillRect(x0, y0, x1 - x0, y1 - y0);
          const n = 5, eh = (y1 - y0) / n;
          for (let k = 0; k < n; k++) {
            let px = x0 + 4;
            while (px < x1 - 6) {
              const w = 5 + r() * 7;
              x.fillStyle = ["#6f86a8", "#a86f6f", "#7fa86f", "#c9b27a", "#8a7fa8", "#5f6f7f"][Math.floor(r() * 6)];
              x.fillRect(px, y0 + k * eh + 4 + r() * 5, w, eh - 8);
              px += w + 1;
            }
            x.fillStyle = "#8f7a5e";
            x.fillRect(x0, y0 + (k + 1) * eh - 3, x1 - x0, 3);
          }
        };
        if (nu) {
          for (let k = 0; k < l; k += 120) etagere(k, k + 100, h * 0.15, h * 0.85);
          return;
        }
        for (const [a, b] of [[0, 0.18], [0.22, 0.38], [0.62, 0.78], [0.82, 1]]) etagere(xv(a), xv(b), yv(0.08), yv(0.82));
        x.fillStyle = "rgba(255,255,255,.55)";
        x.fillRect(xv(0.42), yv(0), xv(0.58) - xv(0.42), yv(0.85));
      }
    },
    // Band Brothers : la scène de concert, rideaux rouges, faisceaux des projecteurs, notes de musique
    scene: {
      cotes: ["#2a0a14", "#5a1222"],
      pince: "#e8b53a",
      corde: ["#c3121b", "#e8b53a"],
      plateau: { face: ["#b77a3c", "#7a4a1e"], motif: "planches", trait: "rgba(60,30,10,.45)", dessus: 13671002 },
      fond: (x, l, h, r, xv, yv, nu) => {
        x.fillStyle = degrade(x, h, "#1a0610", "#4a0e1c");
        x.fillRect(0, 0, l, h);
        for (let k = 0; k < l; k += 26) {
          x.fillStyle = k % 52 ? "rgba(160,20,40,.55)" : "rgba(110,10,25,.55)";
          x.fillRect(k, 0, 26, h);
        }
        if (nu) return;
        for (const f of [0.25, 0.5, 0.75]) {
          const g = x.createLinearGradient(xv(f), 0, xv(f), h);
          g.addColorStop(0, "rgba(255,240,190,.55)");
          g.addColorStop(1, "rgba(255,240,190,0)");
          x.fillStyle = g;
          x.beginPath();
          x.moveTo(xv(f) - 10, 0);
          x.lineTo(xv(f) + 10, 0);
          x.lineTo(xv(f) + 90, h);
          x.lineTo(xv(f) - 90, h);
          x.fill();
        }
        x.fillStyle = "#ffe37a";
        for (let k = 0; k < 6; k++) {
          const px = xv(0.1 + r() * 0.8), py = yv(0.15 + r() * 0.4);
          x.beginPath();
          x.ellipse(px, py, 9, 7, -0.4, 0, Math.PI * 2);
          x.fill();
          x.fillRect(px + 6, py - 30, 3, 30);
        }
      }
    },
    // Kirby : Dream Land en pastel, nuages ronds, étoiles jaunes (l'étoile filante de Kirby)
    reve: {
      cotes: ["#ffc6e0", "#c6e8ff"],
      pince: "#ff8fc0",
      corde: ["#ff5fa8", "#ffffff"],
      plateau: { face: ["#9fe07a", "#5fae3f"], motif: "points", trait: "rgba(255,255,255,.3)", dessus: 12578970 },
      fond: (x, l, h, r, xv, yv, nu) => {
        x.fillStyle = degrade(x, h, "#ffc2de", "#d8ecff");
        x.fillRect(0, 0, l, h);
        if (nu) return;
        for (const [f, y, R] of [[0.15, 0.3, 22], [0.45, 0.12, 28], [0.8, 0.35, 24]]) nuageDessin(x, xv(f), yv(y), R, "#ffffff", "rgba(255,150,200,.4)");
        for (let k = 0; k < 7; k++) {
          x.fillStyle = "#c98200";
          etoile(x, xv(r()), yv(r() * 0.7), 15 + r() * 10);
        }
        for (let k = 0; k < 7; k++) {
          x.fillStyle = "#ffe14a";
          etoile(x, xv(r()), yv(r() * 0.7), 12 + r() * 8);
        }
      }
    },
    // Badge Arcade : le rouge du hall à étoiles blanches (écran du bas de l'appli)
    arcade: {
      cotes: ["#e8322c", "#a80e14"],
      pince: "#ffffff",
      corde: ["#e8322c", "#ffffff"],
      plateau: { face: ["#ffc93a", "#e09a0e"], motif: "raies", trait: "rgba(255,255,255,.25)", dessus: 16769146 },
      fond: (x, l, h, r, xv, yv, nu) => {
        x.fillStyle = degrade(x, h, "#ec3a30", "#b3121a");
        x.fillRect(0, 0, l, h);
        x.fillStyle = "rgba(255,255,255,.16)";
        for (let py = 20, k = 0; py < h; py += 46, k++) for (let px = k % 2 * 30 + 10; px < l; px += 60) etoile(x, px, py, 11);
      }
    },
    // WarioWare : jaune et violet de Wario, rayures en zigzag
    wario: {
      cotes: ["#ffd400", "#f2a000"],
      pince: "#7b3fbf",
      corde: ["#7b3fbf", "#ffd400"],
      plateau: { face: ["#8a4fd0", "#55248f"], motif: "raies", trait: "rgba(255,212,0,.35)", dessus: 10514656 },
      fond: (x, l, h, r, xv, yv, nu) => {
        x.fillStyle = degrade(x, h, "#ffe23a", "#ffb000");
        x.fillRect(0, 0, l, h);
        x.fillStyle = "rgba(123,63,191,.55)";
        for (let y0 = 20; y0 < h; y0 += 70) {
          x.beginPath();
          x.moveTo(0, y0);
          for (let px = 0; px <= l; px += 30) x.lineTo(px, y0 + (px / 30 % 2 ? 16 : -16));
          for (let px = l; px >= 0; px -= 30) x.lineTo(px, y0 + 14 + (px / 30 % 2 ? 16 : -16));
          x.fill();
        }
      }
    },
    // Fire Emblem : bleu royal, losanges héraldiques et médaillon d'or
    blason: {
      cotes: ["#1a2f7a", "#0d1a4a"],
      pince: "#e8b53a",
      corde: ["#e8b53a", "#1a2f7a"],
      plateau: { face: ["#9aa0aa", "#5f6570"], motif: "pierres", trait: "rgba(30,30,40,.35)", dessus: 12107464 },
      fond: (x, l, h, r, xv, yv, nu) => {
        x.fillStyle = degrade(x, h, "#1e3a96", "#0c1848");
        x.fillRect(0, 0, l, h);
        x.strokeStyle = "rgba(232,181,58,.22)";
        x.lineWidth = 2;
        for (let k = -h; k < l; k += 50) {
          x.beginPath();
          x.moveTo(k, 0);
          x.lineTo(k + h, h);
          x.moveTo(k + h, 0);
          x.lineTo(k, h);
          x.stroke();
        }
        if (nu) return;
        const cx = xv(0.5), cy = yv(0.35);
        x.strokeStyle = "#e8b53a";
        x.lineWidth = 7;
        x.beginPath();
        x.arc(cx, cy, 56, 0, Math.PI * 2);
        x.stroke();
        x.lineWidth = 2;
        x.beginPath();
        x.arc(cx, cy, 44, 0, Math.PI * 2);
        x.stroke();
        x.fillStyle = "#e8b53a";
        x.beginPath();
        x.moveTo(cx, cy - 34);
        x.lineTo(cx + 22, cy);
        x.lineTo(cx, cy + 34);
        x.lineTo(cx - 22, cy);
        x.fill();
      }
    },
    // Pikmin : le jardin vu à hauteur de Pikmin : feuilles géantes, trèfle, une fleur, la terre
    jardin: {
      cotes: ["#8fd0ff", "#4f9f2f"],
      pince: "#e53b2f",
      corde: ["#e53b2f", "#f5d000"],
      plateau: { face: ["#8a5a34", "#5c3a1f"], motif: "points", trait: "rgba(255,230,180,.18)", dessus: 7319098 },
      fond: (x, l, h, r, xv, yv, nu) => {
        x.fillStyle = degrade(x, h, "#9ed8ff", "#d8f2c0", "#5fa83a");
        x.fillRect(0, 0, l, h);
        if (nu) return;
        for (let k = 0; k < 6; k++) {
          const cx = xv(r()), cy = yv(0.4 + r() * 0.5), R = 40 + r() * 50, a = -1.2 + r() * 2.4;
          x.save();
          x.translate(cx, cy);
          x.rotate(a);
          x.fillStyle = k % 2 ? "#3f8f2a" : "#5fb33a";
          x.beginPath();
          x.ellipse(0, -R, R * 0.45, R, 0, 0, Math.PI * 2);
          x.fill();
          x.strokeStyle = "rgba(220,255,180,.6)";
          x.lineWidth = 3;
          x.beginPath();
          x.moveTo(0, 0);
          x.lineTo(0, -R * 1.8);
          x.stroke();
          x.restore();
        }
        const fx = xv(0.75), fy = yv(0.3);
        x.fillStyle = "#ffffff";
        for (let k = 0; k < 5; k++) {
          const a = k / 5 * Math.PI * 2;
          x.beginPath();
          x.ellipse(fx + Math.cos(a) * 22, fy + Math.sin(a) * 22, 16, 11, a, 0, Math.PI * 2);
          x.fill();
        }
        x.fillStyle = "#ffd21c";
        disque(x, fx, fy, 12);
      }
    },
    // Sanrio : rose pastel à pois blancs, nœuds rouges (celui de Hello Kitty)
    sanrio: {
      cotes: ["#ffc6d9", "#ff9fbf"],
      pince: "#ff7fae",
      corde: ["#e8323f", "#ffffff"],
      plateau: { face: ["#ffffff", "#ffd6e4"], motif: "points", trait: "rgba(255,120,170,.35)", dessus: 16773365 },
      fond: (x, l, h, r, xv, yv, nu) => {
        x.fillStyle = degrade(x, h, "#ffd2e2", "#ffa8c8");
        x.fillRect(0, 0, l, h);
        x.fillStyle = "rgba(255,255,255,.7)";
        for (let py = 16, k = 0; py < h; py += 34, k++) for (let px = k % 2 * 17 + 8; px < l; px += 34) disque(x, px, py, 5);
        if (nu) return;
        for (let k = 0; k < 5; k++) {
          const cx = xv(0.1 + r() * 0.8), cy = yv(0.1 + r() * 0.6);
          x.fillStyle = "#e8323f";
          x.beginPath();
          x.ellipse(cx - 14, cy, 14, 10, -0.3, 0, Math.PI * 2);
          x.ellipse(cx + 14, cy, 14, 10, 0.3, 0, Math.PI * 2);
          x.fill();
          disque(x, cx, cy, 7);
        }
      }
    },
    // Tank Troopers : le désert du champ de bataille, dunes, mesas, traces de chenilles ; pince kaki, corde de chantier
    desert: {
      cotes: ["#8fc8e8", "#e6c98a"],
      pince: "#7d8a3a",
      corde: ["#f2c200", "#2b2b2b"],
      goulotte: { fond: "#4f5426", tri: "#f2c200" },
      plateau: { face: ["#d9b46a", "#a87c3a"], motif: "sable", trait: "rgba(120,80,30,.35)", dessus: 15256714 },
      fond: (x, l, h, r, xv, yv, nu) => {
        x.fillStyle = degrade(x, h, "#7cc0e6", "#e8d9a8", "#e2bf7a");
        x.fillRect(0, 0, l, h);
        if (nu) return;
        x.fillStyle = "#c98e52";
        for (const [f, w, hh] of [[0.15, 0.14, 0.22], [0.72, 0.2, 0.3]]) {
          const cx = xv(f), b = yv(0.62), wp = xv(w) - xv(0), hp = (yv(1) - yv(0)) * hh;
          x.beginPath();
          x.moveTo(cx - wp, b);
          x.lineTo(cx - wp * 0.45, b - hp);
          x.lineTo(cx + wp * 0.5, b - hp);
          x.lineTo(cx + wp, b);
          x.fill();
        }
        x.fillStyle = "#e0bd78";
        x.beginPath();
        x.moveTo(0, h);
        for (let px = 0; px <= l; px += 20) x.lineTo(px, yv(0.62) + Math.sin(px / 110) * 14);
        x.lineTo(l, h);
        x.fill();
        x.fillStyle = "rgba(120,80,30,.32)";
        for (const [y0, k0] of [[0.7, 0.1], [0.86, 0.35]]) for (let k = 0; k < 2; k++) for (let px = xv(k0); px < xv(k0 + 0.55); px += 14) {
          const py = yv(y0) + k * 14 + Math.sin(px / 80) * 6;
          x.fillRect(px, py, 9, 5);
        }
        x.fillStyle = "rgba(79,84,38,.5)";
        etoile(x, xv(0.5), yv(0.25), 26);
      }
    },
    // Star Fox, Crazy Galaxy : l'espace, étoiles, planète bleue (Corneria) et traînées
    espace: {
      cotes: ["#05061a", "#1a1450"],
      pince: "#c9ccd6",
      corde: ["#3a8cff", "#ffffff"],
      plateau: { face: ["#9aa6b8", "#596478"], motif: "rivets", trait: "rgba(30,40,60,.5)", dessus: 12109014 },
      fond: (x, l, h, r, xv, yv, nu) => {
        x.fillStyle = degrade(x, h, "#05061a", "#1a1450");
        x.fillRect(0, 0, l, h);
        for (let k = 0; k < 160; k++) {
          x.fillStyle = `rgba(255,255,255,${0.3 + r() * 0.7})`;
          x.fillRect(r() * l, r() * h, 2, 2);
        }
        if (nu) return;
        const px = xv(0.25), py = yv(0.4), R = 60;
        const g = x.createRadialGradient(px - 20, py - 20, 5, px, py, R);
        g.addColorStop(0, "#9fe0ff");
        g.addColorStop(0.6, "#2f7ad6");
        g.addColorStop(1, "#0f2a6e");
        x.fillStyle = g;
        disque(x, px, py, R);
        x.strokeStyle = "rgba(150,200,255,.5)";
        x.lineWidth = 2;
        for (let k = 0; k < 5; k++) {
          const a = xv(0.5 + r() * 0.4), b = yv(r() * 0.6);
          x.beginPath();
          x.moveTo(a, b);
          x.lineTo(a + 80, b + 30);
          x.stroke();
        }
      }
    },
    // BoxBoy! : blanc, trait noir, grille de cases et boîtes carrées (le monde en noir et blanc de Qbby)
    boite: {
      cotes: ["#ffffff", "#e9e9e9"],
      pince: "#2b2b2b",
      corde: ["#2b2b2b", "#ffffff"],
      plateau: { face: ["#ffffff", "#dcdcdc"], motif: "grille", trait: "rgba(0,0,0,.45)", dessus: 16777215 },
      fond: (x, l, h, r, xv, yv, nu) => {
        x.fillStyle = "#fafafa";
        x.fillRect(0, 0, l, h);
        x.strokeStyle = "rgba(0,0,0,.08)";
        x.lineWidth = 1;
        for (let k = 0; k < l; k += 32) {
          x.beginPath();
          x.moveTo(k, 0);
          x.lineTo(k, h);
          x.stroke();
        }
        for (let k = 0; k < h; k += 32) {
          x.beginPath();
          x.moveTo(0, k);
          x.lineTo(l, k);
          x.stroke();
        }
        if (nu) return;
        x.strokeStyle = "#2b2b2b";
        x.lineWidth = 5;
        for (let k = 0; k < 7; k++) {
          const px = Math.round(xv(r()) / 32) * 32, py = Math.round(yv(r() * 0.7) / 32) * 32;
          x.fillStyle = "#ffffff";
          x.fillRect(px, py, 64, 64);
          x.strokeRect(px, py, 64, 64);
        }
      }
    },
    // Pushmo : un mur de blocs à pousser, carrés aux couleurs franches
    pousse: {
      cotes: ["#ffe9b0", "#ffcf6a"],
      pince: "#ff8a1c",
      corde: ["#ff8a1c", "#ffffff"],
      plateau: { face: ["#ffb347", "#e07a0e"], motif: "grille", trait: "rgba(255,255,255,.35)", dessus: 16765578 },
      fond: (x, l, h, r, xv, yv, nu) => {
        x.fillStyle = "#ffe9b0";
        x.fillRect(0, 0, l, h);
        const e = 40, cs = ["#ff5a5a", "#ffb000", "#4fbf4f", "#3a8cff", "#c86ad6", "#ff8a1c"];
        for (let py = 0; py < h; py += e) for (let px = 0; px < l; px += e) {
          x.fillStyle = nu ? "rgba(255,200,120,.35)" : cs[Math.floor(r() * cs.length)];
          x.globalAlpha = nu ? 1 : 0.55;
          x.fillRect(px + 2, py + 2, e - 4, e - 4);
        }
        x.globalAlpha = 1;
      }
    },
    // Tomodachi Life : l'île, ciel clair, la mer, l'immeuble des Mii
    ile: {
      cotes: ["#8fd8ff", "#3fb0e0"],
      pince: "#ff9a2a",
      corde: ["#2fbfbf", "#ffffff"],
      plateau: { face: ["#f1d58e", "#d2a85a"], motif: "sable", trait: "rgba(180,130,60,.3)", dessus: 16180136 },
      fond: (x, l, h, r, xv, yv, nu) => {
        x.fillStyle = degrade(x, h, "#8fd8ff", "#d8f4ff", "#3fb0e0");
        x.fillRect(0, 0, l, h);
        if (nu) return;
        const bx = xv(0.6), by = yv(0.75);
        x.fillStyle = "#ffffff";
        x.fillRect(bx - 50, by - 150, 100, 150);
        x.fillStyle = "#ff9a2a";
        x.fillRect(bx - 56, by - 158, 112, 12);
        for (let k = 0; k < 5; k++) for (let j = 0; j < 3; j++) {
          x.fillStyle = "#7fcff2";
          x.fillRect(bx - 40 + j * 30, by - 140 + k * 28, 18, 16);
        }
        x.fillStyle = "#4fbf4f";
        disque(x, xv(0.2), yv(0.82), 60);
        nuageDessin(x, xv(0.3), yv(0.2), 22, "#ffffff", "rgba(80,160,220,.35)");
      }
    },
    // Jardin zen (karesansui) : le sable ratissé en ondes autour des pierres, la mousse
    zen: {
      cotes: ["#efe7d6", "#d6cbb2"],
      pince: "#8a5a2b",
      corde: ["#5a6b3a", "#efe7d6"],
      plateau: { face: ["#cfc3a8", "#a89a7c"], motif: "sable", trait: "rgba(120,100,70,.3)", dessus: 15129796 },
      fond: (x, l, h, r, xv, yv, nu) => {
        x.fillStyle = "#ece3d0";
        x.fillRect(0, 0, l, h);
        x.strokeStyle = "rgba(150,130,100,.35)";
        x.lineWidth = 2;
        for (let k = 0; k < h; k += 9) {
          x.beginPath();
          x.moveTo(0, k);
          x.lineTo(l, k);
          x.stroke();
        }
        if (nu) return;
        for (const [f, y, R] of [[0.3, 0.45, 34], [0.7, 0.3, 26]]) {
          const cx = xv(f), cy = yv(y);
          x.fillStyle = "#ece3d0";
          disque(x, cx, cy, R + 50);
          x.strokeStyle = "rgba(150,130,100,.45)";
          for (let k = 1; k < 6; k++) {
            x.beginPath();
            x.arc(cx, cy, R + k * 9, 0, Math.PI * 2);
            x.stroke();
          }
          x.fillStyle = "#6b6a66";
          disque(x, cx, cy, R);
          x.fillStyle = "#6f8f3a";
          x.beginPath();
          x.ellipse(cx, cy + R * 0.7, R * 1.1, R * 0.35, 0, 0, Math.PI * 2);
          x.fill();
        }
      }
    },
    // Lawson : les rayures bleu et blanc de la devanture
    lawson: {
      cotes: ["#2a6fd6", "#1a4fa8"],
      pince: "#2a6fd6",
      corde: ["#2a6fd6", "#ffffff"],
      plateau: { face: ["#ffffff", "#d8e6f6"], motif: "raies", trait: "rgba(42,111,214,.25)", dessus: 16777215 },
      fond: (x, l, h, r, xv, yv, nu) => {
        for (let k = 0; k < l; k += 40) {
          x.fillStyle = k / 40 % 2 ? "#ffffff" : "#2f78e0";
          x.fillRect(k, 0, 40, h);
        }
        const g = x.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, "rgba(255,255,255,.15)");
        g.addColorStop(1, "rgba(0,30,90,.2)");
        x.fillStyle = g;
        x.fillRect(0, 0, l, h);
      }
    },
    // Swapnote : la page du carnet, lignes bleues, marge rouge
    carnet: {
      cotes: ["#fffdf4", "#efe9d6"],
      pince: "#ff8a1c",
      corde: ["#e8322c", "#ffffff"],
      plateau: { face: ["#ffe37a", "#f2b700"], motif: "raies", trait: "rgba(255,255,255,.3)", dessus: 16773288 },
      fond: (x, l, h, r, xv, yv, nu) => {
        x.fillStyle = "#fffdf4";
        x.fillRect(0, 0, l, h);
        x.strokeStyle = "rgba(90,140,220,.45)";
        x.lineWidth = 2;
        for (let k = 30; k < h; k += 26) {
          x.beginPath();
          x.moveTo(0, k);
          x.lineTo(l, k);
          x.stroke();
        }
        if (nu) return;
        x.strokeStyle = "rgba(230,60,60,.6)";
        x.beginPath();
        x.moveTo(xv(0.08), 0);
        x.lineTo(xv(0.08), h);
        x.stroke();
      }
    },
    // Préfectures, déesses : le Japon, vagues seigaiha bleu indigo et soleil rouge
    japon: {
      cotes: ["#f4ead6", "#d8c8a8"],
      pince: "#c3121b",
      corde: ["#c3121b", "#ffffff"],
      plateau: { face: ["#2f4f8f", "#1a2f5f"], motif: "vagues", trait: "rgba(255,255,255,.3)", dessus: 5205936 },
      fond: (x, l, h, r, xv, yv, nu) => {
        x.fillStyle = "#f4ead6";
        x.fillRect(0, 0, l, h);
        x.strokeStyle = "rgba(47,79,143,.35)";
        x.lineWidth = 2;
        for (let py = h * 0.5, k = 0; py < h + 30; py += 15, k++) for (let px = k % 2 * 20; px < l + 40; px += 40) for (let j = 1; j < 4; j++) {
          x.beginPath();
          x.arc(px, py, j * 6, Math.PI, 0);
          x.stroke();
        }
        if (nu) return;
        x.fillStyle = "#d8202a";
        disque(x, xv(0.5), yv(0.28), 50);
      }
    },
    // Darumeshi Sports : le terrain de baseball, gazon rayé, losange de terre, tribunes
    stade: {
      cotes: ["#7fc8f0", "#3f9f3f"],
      pince: "#ffffff",
      corde: ["#ffffff", "#c3121b"],
      plateau: { face: ["#c8864a", "#9a5a28"], motif: "sable", trait: "rgba(80,40,10,.3)", dessus: 6274885 },
      fond: (x, l, h, r, xv, yv, nu) => {
        x.fillStyle = degrade(x, h, "#7fc8f0", "#bfe6ff");
        x.fillRect(0, 0, l, yv(0.35));
        for (let k = 0; k < 6; k++) {
          x.fillStyle = k % 2 ? "#4faa45" : "#5fbf55";
          x.fillRect(0, yv(0.35) + k * (h - yv(0.35)) / 6, l, (h - yv(0.35)) / 6 + 1);
        }
        x.fillStyle = "#6f6f7a";
        x.fillRect(0, yv(0.22), l, yv(0.35) - yv(0.22));
        x.fillStyle = "rgba(255,255,255,.35)";
        for (let k = 0; k < l; k += 8) for (let j = 0; j < 3; j++) if (r() < 0.5) x.fillRect(k, yv(0.23) + j * 10, 4, 4);
        if (nu) return;
        x.fillStyle = "#c8864a";
        x.beginPath();
        x.moveTo(xv(0.5), yv(0.45));
        x.lineTo(xv(0.7), yv(0.65));
        x.lineTo(xv(0.5), yv(0.85));
        x.lineTo(xv(0.3), yv(0.65));
        x.fill();
        x.fillStyle = "#ffffff";
        for (const [a, b] of [[0.5, 0.45], [0.7, 0.65], [0.3, 0.65], [0.5, 0.85]]) x.fillRect(xv(a) - 6, yv(b) - 6, 12, 12);
      }
    }
  };
  const PIXELS = {
    DotHard: { fond: ["#f3ead2", "#d9ccb0"], trame: "rgba(155,28,34,.06)", signe: (x, l, h, r, xv, yv) => {
      x.fillStyle = "#9b1c22";
      for (const f of [0.2, 0.3]) x.fillRect(0, yv(f), l, 14);
      x.fillStyle = "#c9a24a";
      x.fillRect(0, yv(0.6), l, 22);
    } },
    DotHard2: { fond: ["#3a3a40", "#1e1e22"], trame: "rgba(255,255,255,.04)", signe: (x, l, h, r, xv, yv) => ["#e8322c", "#2fbf4a", "#ffd21c", "#2a6fe0"].forEach((c, k) => cube(x, xv(0.22 + k * 0.18), yv(0.42), 34, c, "rgba(0,0,0,.35)", "rgba(0,0,0,.18)")) },
    DotHard3: { fond: ["#ffffff", "#e6eef4"], trame: "rgba(120,170,210,.06)", signe: (x, l, h, r, xv, yv) => {
      x.strokeStyle = "rgba(90,180,230,.6)";
      x.lineWidth = 3;
      for (let k = 0; k < 4; k++) for (let j = 0; j < 2; j++) {
        x.beginPath();
        x.roundRect(xv(0.06 + k * 0.23), yv(0.12 + j * 0.3), xv(0.2) - xv(0), yv(0.24) - yv(0), 14);
        x.stroke();
      }
    } },
    DotHard4: { fond: ["#d8d8dc", "#a8a8b0"], trame: "rgba(0,0,0,.05)", signe: (x, l, h, r, xv, yv) => {
      x.fillStyle = "#c3121b";
      x.fillRect(0, yv(0.3), l, 10);
      x.fillStyle = "#3a3a40";
      x.fillRect(xv(0.45), yv(0.1), xv(0.1) - xv(0), yv(0.4) - yv(0));
    } },
    // le démarrage du GameCube : le cube indigo qui roule sur sa grille, au fond sombre
    DotHard5: { fond: ["#2a2266", "#4b3fa0"], trame: "rgba(255,255,255,.035)", signe: (x, l, h, r, xv, yv) => {
      x.strokeStyle = "rgba(160,150,255,.35)";
      x.lineWidth = 2;
      const y0 = yv(0.72);
      for (let k = -20; k <= 20; k++) {
        x.beginPath();
        x.moveTo(xv(0.5) + k * 22, y0);
        x.lineTo(xv(0.5) + k * 90, h);
        x.stroke();
      }
      for (let k = 0; k < 6; k++) {
        const yy = y0 + (h - y0) * (k / 6) ** 1.6;
        x.beginPath();
        x.moveTo(0, yy);
        x.lineTo(l, yy);
        x.stroke();
      }
      cube(x, xv(0.5) - 30, yv(0.4), 60, "#8f84e8", "#4b3fa0", "#6a5fd0");
      cube(x, xv(0.5) - 12, yv(0.4) - 22, 24, "#2a2266", "#1a1450", "#231c5a");
      for (let k = 0; k < 4; k++) cube(x, xv(0.12 + k * 0.26), yv(0.18), 14, "rgba(160,150,255,.5)", "rgba(80,70,180,.5)", "rgba(110,100,210,.5)");
    } }
  };
  const decorDe = (m) => DECORS[m.theme] || null;
  const autocollant = (im, carton, z = 4) => {
    const s = agrandir(im, Math.round(Math.log2(z)), false), w = s.width, h = s.height, m = 8 * z, [c, x] = toile(w + 2 * m, h + 2 * m), sx = s.getContext("2d");
    if (carton) {
      const d = sx.getImageData(0, 0, w, h), p = d.data, A = [181, 131, 74], B = [226, 191, 134];
      for (let i = 0; i < p.length; i += 4) {
        const k = (p[i] * 0.3 + p[i + 1] * 0.55 + p[i + 2] * 0.15) / 255, o = i / 4 % w % (3 * z) < 1.5 * z ? 0.94 : 1;
        p[i] = (A[0] + (B[0] - A[0]) * k) * o;
        p[i + 1] = (A[1] + (B[1] - A[1]) * k) * o;
        p[i + 2] = (A[2] + (B[2] - A[2]) * k) * o;
      }
      sx.putImageData(d, 0, 0);
    }
    const plein = (col) => {
      const [p, px] = toile(w, h);
      px.drawImage(s, 0, 0);
      px.globalCompositeOperation = "source-in";
      px.fillStyle = col;
      px.fillRect(0, 0, w, h);
      return p;
    };
    const lis = plein(C.lisere), bord = plein(carton ? "#efd6a6" : C.autocollant);
    for (const [src, R] of [[lis, m], [bord, m - 1.6 * z]]) for (const f of [1, 0.66, 0.33]) for (let a = 0; a < 28; a++) x.drawImage(src, m + Math.cos(a / 28 * Math.PI * 2) * R * f, m + Math.sin(a / 28 * Math.PI * 2) * R * f);
    x.drawImage(s, m, m);
    return { c, marge: m / (w + 2 * m) };
  };
  const traits = (x, ids, xv, yv, r, alpha) => ids.forEach((id, i) => {
    const im = image(id);
    if (!pret(im)) return;
    const t = Math.round((yv(1) - yv(0)) * (0.34 + r() * 0.1)), px = xv((i % 4 + 0.5) / 4) + (r() - 0.5) * 30, py = yv(i < 4 ? 0.26 : 0.7) + (r() - 0.5) * 20;
    const [s, sx] = toile(t, t);
    sx.drawImage(im, 0, 0, t, t);
    const dd = sx.getImageData(0, 0, t, t), o = sx.createImageData(t, t);
    for (let yy = 1; yy < t - 1; yy++) for (let xx = 1; xx < t - 1; xx++) {
      const k = (yy * t + xx) * 4, a = dd.data[k + 3] > 100;
      if (a && (dd.data[k - 4 + 3] <= 100 || dd.data[k + 4 + 3] <= 100 || dd.data[k - t * 4 + 3] <= 100 || dd.data[k + t * 4 + 3] <= 100)) {
        o.data[k] = o.data[k + 1] = o.data[k + 2] = 255;
        o.data[k + 3] = alpha;
      }
    }
    sx.putImageData(o, 0, 0);
    x.drawImage(s, px - t / 2, py - t / 2);
    x.drawImage(s, px - t / 2 + 1, py - t / 2);
  });
  const BLOCS = [/Obj_Rengablock\.png$/, /Obj_Hatenablock\.png$/, /Obj_Dokan\.png$/, /Obj_Kumoblock\.png$/, /Obj_Groundblock\.png$/];
  const blocsDe = () => {
    const s = seriesPar.get("MroSMB");
    if (!s) return [];
    return BLOCS.map((re) => s.lots.find((f) => re.test(f))).map((f) => f && `${s.id}/${f}`);
  };
  const VU = { x0: 0.17, x1: 0.83, y0: 0.25, y1: 0.83 };
  const dessinerFond = (x, m, l0, h0, vu = VU, nu = false) => {
    const t = m.theme, r = graine("fond " + m.cle), xv = (f) => l0 * (vu.x0 + f * (vu.x1 - vu.x0)), yv = (f) => h0 * (vu.y0 + f * (vu.y1 - vu.y0));
    const l = l0, h = h0;
    if (t === "carton") {
      x.fillStyle = degrade(x, h, ...C.carton);
      x.fillRect(0, 0, l, h);
      for (let k = 0; k < 7; k++) {
        const y = k * h / 7;
        x.fillStyle = C.planche;
        x.fillRect(0, y, l, 4);
        x.fillStyle = "rgba(255,255,255,.14)";
        x.fillRect(0, y + 4, l, 2);
        x.strokeStyle = "rgba(255,255,255,.07)";
        x.lineWidth = 2;
        for (let v2 = 0; v2 < 4; v2++) {
          const y0 = y + 12 + r() * (h / 7 - 20);
          x.beginPath();
          x.moveTo(0, y0);
          x.bezierCurveTo(l * 0.3, y0 + (r() - 0.5) * 10, l * 0.7, y0 + (r() - 0.5) * 10, l, y0);
          x.stroke();
        }
      }
      x.fillStyle = "rgba(255,255,255,.2)";
      for (let k = 0; k < 13; k++) {
        x.save();
        x.translate(r() * l, 30 + r() * h * 0.75);
        x.rotate((r() - 0.5) * 0.6);
        etoile(x, 0, 0, 16 + r() * 22);
        x.restore();
      }
    } else if (t === "mktv") {
      const hz = yv(0.2);
      x.fillStyle = degrade(x, hz, "#2f4552", "#4c6470");
      x.fillRect(0, 0, l, hz);
      x.fillStyle = "#4f8d3c";
      x.fillRect(0, hz - h * 0.04, l, h * 0.06);
      x.fillStyle = "rgba(20,60,10,.35)";
      for (let k = 0; k < l; k += 7) x.fillRect(k, hz - h * 0.04 - 4 - r() * 6, 3, 10);
      const damier = (y, e) => {
        for (let k = 0; k * e < l; k++) for (let v2 = 0; v2 < 2; v2++) {
          x.fillStyle = C.damier[(k + v2) % 2];
          x.fillRect(k * e, y + v2 * e, e, e);
        }
      };
      const gp = x.createLinearGradient(0, hz, 0, h);
      gp.addColorStop(0, C.piste[0]);
      gp.addColorStop(1, C.piste[1]);
      x.fillStyle = gp;
      x.fillRect(0, hz + h * 0.02, l, h);
      x.fillStyle = "rgba(255,255,255,.035)";
      for (let k = 0; k < 900; k++) x.fillRect(r() * l, hz + r() * (h - hz), 2, 2);
      damier(hz + h * 0.03, 12);
      damier(yv(0.62), 12);
      if (!nu) {
        const g = x.createLinearGradient(xv(0.42), 0, xv(0.58), 0);
        g.addColorStop(0, "rgba(60,150,255,0)");
        g.addColorStop(0.5, "rgba(80,190,255,.9)");
        g.addColorStop(1, "rgba(60,150,255,0)");
        x.fillStyle = g;
        x.fillRect(xv(0.42), hz, xv(0.58) - xv(0.42), h - hz);
        x.fillStyle = "rgba(255,255,255,.35)";
        for (let k = 0; k < 14; k++) x.fillRect(xv(0.45 + r() * 0.1), hz + r() * (h - hz), 2, 10);
        const ph = yv(0.16) - yv(0), py = yv(0.02);
        x.fillStyle = "#e9edf0";
        x.beginPath();
        x.roundRect(xv(0.02), py, xv(0.36) - xv(0.02), ph, 8);
        x.fill();
        x.fillStyle = "#2b3138";
        x.font = `900 ${Math.round(ph * 0.7)}px Nunito, sans-serif`;
        x.textBaseline = "middle";
        x.fillText("MKTV", xv(0.06), py + ph / 2);
        x.strokeStyle = "#29a6e0";
        x.lineWidth = 3;
        for (let k = 0; k < 3; k++) {
          x.beginPath();
          x.arc(xv(0.31), py + ph / 2, 5 + k * 6, -0.7, 0.7);
          x.stroke();
        }
        x.fillStyle = "#e9edf0";
        x.fillRect(xv(0.6), py, xv(0.98) - xv(0.6), ph);
        x.fillStyle = "#e0402e";
        for (let k = 0; k < 4; k++) {
          const cx = xv(0.64 + k * 0.08), a_ = ph * 0.3;
          x.beginPath();
          x.moveTo(cx + a_, py + ph * 0.15);
          x.lineTo(cx, py + ph / 2);
          x.lineTo(cx + a_, py + ph * 0.85);
          x.lineTo(cx + a_ * 1.5, py + ph * 0.85);
          x.lineTo(cx + a_ * 0.5, py + ph / 2);
          x.lineTo(cx + a_ * 1.5, py + ph * 0.15);
          x.fill();
        }
      }
    } else if (t === "niveau") {
      x.fillStyle = degrade(x, h, ...C.ciel);
      x.fillRect(0, 0, l, h);
      const bl = nu ? [] : blocsDe(), e = Math.round((yv(1) - yv(0)) * 0.1);
      x.imageSmoothingEnabled = false;
      const bloc = (id, px, py, n = 1, a = 0.9) => {
        if (!id) return;
        const im = image(id);
        if (!pret(im)) return;
        x.globalAlpha = a;
        for (let k = 0; k < n; k++) x.drawImage(im, px + k * e, py, e, e);
        x.globalAlpha = 1;
      };
      bloc(bl[3], xv(0.06), yv(0.2), 3, 0.75);
      bloc(bl[3], xv(0.66), yv(0.16), 2, 0.75);
      [0, 1, 0, 1, 0].forEach((k, j) => bloc(bl[k], xv(0.3) + j * e, yv(0.38), 1));
      if (bl[2]) bloc(bl[2], xv(0.86), yv(0.5), 1);
      x.imageSmoothingEnabled = true;
      const fs = Math.round((yv(1) - yv(0)) * 0.055);
      x.font = `700 ${fs}px "Courier New", monospace`;
      x.fillStyle = "#ffffff";
      x.textBaseline = "top";
      if (!nu) {
        [["MARIO", 0.02], ["WORLD", 0.56], ["TIME", 0.82]].forEach(([s_, f]) => x.fillText(s_, xv(f), yv(0.015)));
        [["000000", 0.02], ["\xD700", 0.32], ["1-1", 0.58], ["400", 0.83]].forEach(([s_, f]) => x.fillText(s_, xv(f), yv(0.015) + fs * 1.15));
      }
      x.fillStyle = "rgba(20,40,110,.07)";
      for (let y = 0; y < h; y += 4) x.fillRect(0, y, l, 2);
    } else if (DECORS[t]) DECORS[t].fond(x, l, h, r, xv, yv, nu, m);
    else {
      x.fillStyle = degrade(x, h, ...C.nuit);
      x.fillRect(0, 0, l, h);
      x.fillStyle = "rgba(150,180,255,.16)";
      for (let y = 6, k = 0; y < h; y += 11, k++) for (let px = k % 2 * 5.5 + 3; px < l; px += 11) x.fillRect(px, y, 2.4, 2.4);
      if (!nu) traits(x, (m.stock || []).slice(0, 8), xv, yv, r, 80);
    }
    const v = x.createRadialGradient(l / 2, h * 0.2, h * 0.2, l / 2, h * 0.45, l * 0.7);
    v.addColorStop(0, "rgba(255,255,255,.06)");
    v.addColorStop(0.6, "rgba(0,0,0,0)");
    v.addColorStop(1, "rgba(0,0,30,.2)");
    x.fillStyle = v;
    x.fillRect(0, 0, l, h);
  };
  const COTES = { carton: C.carton, mktv: ["#2f4552", "#71848c"], niveau: C.ciel, trait: C.nuit };
  const cotesDe = (t) => DECORS[t]?.cotes || COTES[t] || C.nuit;
  const attendus = (m) => m.theme === "trait" ? (m.stock || []).slice(0, 8) : m.theme === "niveau" ? blocsDe().filter(Boolean) : [];
  const texFond = (m, wp, hp, nu = false) => {
    const l = nu ? 512 : 1024, h = Math.round(l * hp / wp), [c, x] = toile(l, h);
    const vu = { x0: clamp(0.5 - 9 / wp, 0, 0.4), x1: clamp(0.5 + 9 / wp, 0.6, 1), y0: 0.03, y1: 0.97 };
    dessinerFond(x, m, l, h, vu, nu);
    const t = texture(c, { bord: true, flipY: true });
    if (!nu) Promise.all(attendus(m).map((id) => new Promise((ok) => quandPrete(image(id), ok)))).then(() => {
      dessinerFond(x, m, l, h, vu);
      t.needsUpdate = true;
    });
    return t;
  };
  const TUILE_PLATEAU = 1.6;
  const PLATEAU_THEME = {
    carton: { face: C.herbe, motif: "raies", trait: C.herbeRaie, dessus: 7327562 },
    trait: { face: C.herbe, motif: "raies", trait: C.herbeRaie, dessus: 7327562 },
    mktv: { face: C.glace, motif: "vagues", trait: "rgba(120,190,230,.35)", dessus: 15398655 },
    niveau: { face: C.glace, motif: "vagues", trait: "rgba(120,190,230,.35)", dessus: 15398655 }
  };
  const aspectPlateau = (t) => DECORS[t]?.plateau || PLATEAU_THEME[t] || PLATEAU_THEME.trait;
  const bordDe = (t) => t === "mktv" || t === "niveau" ? "vagues" : DECORS[t]?.bord || "corde";
  const cordeDe = (t) => DECORS[t]?.corde || (t === "trait" ? C.cordeGrise : C.corde);
  const pinceDe = (m) => m.entrainement ? C.pinceEntrainement : DECORS[m.theme]?.pince || C.pince;
  const texPlateau = (theme) => {
    const [c, x] = toile(128, 512), A = aspectPlateau(theme), r = graine("plateau " + theme);
    x.fillStyle = degrade(x, 512, ...A.face.length > 2 ? A.face : [A.face[0], A.face[1]]);
    x.fillRect(0, 0, 128, 512);
    x.fillStyle = x.strokeStyle = A.trait;
    switch (A.motif) {
      case "vagues":
        x.lineWidth = 3;
        for (let y = 40; y < 512; y += 46) {
          x.beginPath();
          for (let k = 0; k <= 128; k += 4) x.lineTo(k, y + Math.sin(k / 128 * Math.PI * 2) * 6);
          x.stroke();
        }
        break;
      case "briques":
        for (let y = 0, k = 0; y < 512; y += 32, k++) {
          x.fillRect(0, y, 128, 3);
          for (let px = k % 2 * 32; px < 128; px += 64) x.fillRect(px, y, 3, 32);
        }
        break;
      case "planches":
        for (let y = 0; y < 512; y += 40) x.fillRect(0, y, 128, 4);
        for (let k = 0; k < 30; k++) x.fillRect(r() * 128, r() * 512, 10 + r() * 30, 1.5);
        break;
      case "grille":
        for (let k = 0; k < 512; k += 32) x.fillRect(0, k, 128, 2);
        for (let k = 0; k < 128; k += 32) x.fillRect(k, 0, 2, 512);
        break;
      case "points":
        for (let y = 12, k = 0; y < 512; y += 24, k++) for (let px = k % 2 * 12 + 6; px < 128; px += 24) disque(x, px, y, 4);
        break;
      case "pierres":
        for (let k = 0; k < 40; k++) {
          x.beginPath();
          x.ellipse(r() * 128, r() * 512, 8 + r() * 12, 6 + r() * 8, r() * 3, 0, Math.PI * 2);
          x.fill();
        }
        break;
      case "rivets":
        for (let y = 0; y < 512; y += 64) {
          x.fillRect(0, y, 128, 3);
          for (const px of [12, 116]) disque(x, px, y + 32, 4);
        }
        break;
      case "sable":
        for (let k = 0; k < 900; k++) x.fillRect(r() * 128, r() * 512, 2, 2);
        for (let y = 30; y < 512; y += 50) {
          x.beginPath();
          for (let k = 0; k <= 128; k += 8) x.lineTo(k, y + Math.sin(k / 20) * 3);
          x.lineWidth = 1.5;
          x.stroke();
        }
        break;
      case "taches":
        for (let k = 0; k < 8; k++) disque(x, r() * 128, r() * 512, 8 + r() * 14);
        break;
      default:
        for (let k = -512; k < 128; k += 32) {
          x.beginPath();
          x.moveTo(k, 512);
          x.lineTo(k + 512, 0);
          x.lineTo(k + 528, 0);
          x.lineTo(k + 16, 512);
          x.fill();
        }
    }
    const t = texture(c, { flipY: true });
    t.wrapT = T.ClampToEdgeWrapping;
    t.repeat.set(1 / TUILE_PLATEAU, 1 / (VITRE.y1 - VITRE.y0 + 1));
    t.offset.set(0, -(VITRE.y0 - 1) * t.repeat.y);
    return t;
  };
  const texBloc = (genre, l, h) => {
    const px = 64, [c, x] = toile(Math.max(16, Math.round(l * px)), Math.max(16, Math.round(h * px))), L_ = c.width, H_ = c.height;
    if (genre === "glace") {
      x.fillStyle = degrade(x, H_, "#ffffff", "#cfe9f7");
      x.fillRect(0, 0, L_, H_);
      x.strokeStyle = "rgba(120,190,230,.5)";
      x.lineWidth = 4;
      for (let y = 10; y < H_; y += 22) {
        x.beginPath();
        for (let k = 0; k <= L_; k += 6) x.lineTo(k, y + Math.sin(k / 18) * 3);
        x.stroke();
      }
    } else {
      const [a, b] = genre === "carton" ? ["#e2bf86", "#b5834a"] : ["#c98a4b", "#8e5a2b"];
      x.fillStyle = a;
      x.fillRect(0, 0, L_, H_);
      const n = Math.max(2, Math.round(H_ / 22));
      x.fillStyle = b;
      for (let k = 1; k < n; k++) x.fillRect(0, k * H_ / n - 2, L_, 4);
      x.strokeStyle = b;
      x.lineWidth = 6;
      x.strokeRect(3, 3, L_ - 6, H_ - 6);
      if (genre !== "carton") {
        x.fillStyle = "#5a3a1c";
        for (const [u, v] of [[9, 9], [L_ - 9, 9], [9, H_ - 9], [L_ - 9, H_ - 9]]) {
          x.beginPath();
          x.arc(u, v, 3, 0, 7);
          x.fill();
        }
      }
    }
    return texture(c, { bord: true, flipY: true });
  };
  const texCorde = (cs) => {
    const [c, x] = toile(64, 16);
    x.fillStyle = cs[1];
    x.fillRect(0, 0, 64, 16);
    x.fillStyle = cs[0];
    for (let k = -16; k < 64; k += 16) {
      x.beginPath();
      x.moveTo(k, 16);
      x.lineTo(k + 8, 0);
      x.lineTo(k + 16, 0);
      x.lineTo(k + 8, 16);
      x.fill();
    }
    return texture(c);
  };
  let matcapPlastique = null;
  const texMatcap = () => matcapPlastique ||= (() => {
    const [c, x] = toile(256, 256);
    x.fillStyle = "#8a8a8a";
    x.fillRect(0, 0, 256, 256);
    const g = x.createRadialGradient(104, 92, 8, 128, 128, 128);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.42, "#ededed");
    g.addColorStop(0.8, "#bdbdbd");
    g.addColorStop(1, "#8e8e8e");
    x.fillStyle = g;
    x.beginPath();
    x.arc(128, 128, 128, 0, Math.PI * 2);
    x.fill();
    const rim = x.createRadialGradient(150, 160, 90, 128, 128, 128);
    rim.addColorStop(0.75, "rgba(255,255,255,0)");
    rim.addColorStop(1, "rgba(255,255,255,.35)");
    x.fillStyle = rim;
    x.fillRect(0, 0, 256, 256);
    const hl = x.createRadialGradient(88, 72, 0, 88, 72, 30);
    hl.addColorStop(0, "rgba(255,255,255,1)");
    hl.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = hl;
    x.fillRect(0, 0, 256, 256);
    return texture(c, { bord: true });
  })();
  const plastique = (couleur, o = {}) => garder(new T.MeshMatcapMaterial({ matcap: texMatcap(), color: couleur, ...o }));
  const LED = { col: 22, rang: 13, allume: "#c9ecff", eteint: "rgba(140,170,255,.16)" };
  const dessinerAfficheur = (x, n) => {
    x.clearRect(0, 0, 128, 128);
    x.fillStyle = C.ecranNuit;
    x.beginPath();
    x.ellipse(64, 64, 63, 63, 0, 0, Math.PI * 2);
    x.fill();
    const [cm, xm] = toile(LED.col, LED.rang);
    xm.fillStyle = "#fff";
    xm.textAlign = "center";
    xm.textBaseline = "middle";
    if (n == null) etoile(xm, LED.col / 2, LED.rang / 2 + 0.5, 6.2);
    else if (n === "coeur") {
      const cx = LED.col / 2, cy = LED.rang / 2;
      xm.beginPath();
      xm.moveTo(cx, cy + 5);
      xm.bezierCurveTo(cx - 9, cy - 1, cx - 4, cy - 7, cx, cy - 2.5);
      xm.bezierCurveTo(cx + 4, cy - 7, cx + 9, cy - 1, cx, cy + 5);
      xm.fill();
    } else {
      xm.font = `900 ${n > 9 ? 11 : 13}px Nunito, sans-serif`;
      xm.fillText(String(n), LED.col / 2, LED.rang / 2 + 1);
    }
    const d = xm.getImageData(0, 0, LED.col, LED.rang).data, pas2 = 112 / LED.col;
    for (let j = 0; j < LED.rang; j++) for (let i = 0; i < LED.col; i++) {
      const u = (i + 0.5) / LED.col * 2 - 1, v = (j + 0.5) / LED.rang * 2 - 1;
      if (u * u + v * v > 1) continue;
      const on = d[(j * LED.col + i) * 4 + 3] > 110;
      x.fillStyle = on ? LED.allume : LED.eteint;
      if (on) {
        x.shadowColor = "rgba(160,220,255,.9)";
        x.shadowBlur = 6;
      }
      x.beginPath();
      x.arc(8 + (i + 0.5) * pas2, 64 + (j + 0.5 - LED.rang / 2) * pas2 * (LED.col / LED.rang) * 0.6, pas2 * 0.36, 0, Math.PI * 2);
      x.fill();
      x.shadowBlur = 0;
    }
  };
  const TABLE = 5.6, LUIGI = { pos: new T.Vector3(0, 0, 11.6), taille: 12.5, debout: 12.5 };
  const JETONS_COMPTOIR = { r: 0.42, z: 0.9, piles: [[-7.4, 15658734, 9], [-6.4, 13114910, 7], [-5.4, 1981640, 5], [-4.4, 15185226, 4]] };
  const MEUBLES = ["comptoir", "poker", "roulette", "cartes", "caisse", "sc\xE8ne", "machine \xE0 sous"];
  const RANGEE = { o: new T.Vector3(-23.24, 0, -25.39), u: new T.Vector3(0.439, 0, -0.899).normalize(), ECH: 0.66, pas: 18.8, debut: -100, recul: 5 };
  RANGEE.n = RANGEE.u.clone().cross(new T.Vector3(0, 1, 0)).normalize();
  const Z = { fond: 1.2, terrain0: 2.4, terrain1: 9, badges: 8.1, pince: 8.1 };
  let rendu = null, scene = null, camera = null, racine = null, toileGL = null, decor = null, luigi = null, luigiPret = null;
  let sel = 1, vue = "salle", mJeu = null, plan = null, horloge = 0, boucle = 0, dernier = 0, pilote = false, ouvert = false, bornes = [], tableau = null;
  let session = { parties: 0, gains: 0 };
  const vec = (x, y, z) => new T.Vector3(x, y, z);
  const AXE_Y = vec(0, 1, 0);
  const OCT = { c: vec(10, 0, 16), r: 74 }, AP_OCT = OCT.r * Math.cos(Math.PI / 8), DEMI_OCT = OCT.r * Math.sin(Math.PI / 8);
  const SOMMETS = [[-1, -0.5], [-1, 0.5], [-0.5, 1], [0.5, 1], [1, 0.5], [1, -0.5], [0.5, -1], [-0.5, -1]].map(([a, b]) => [OCT.c.x + (Math.abs(a) === 1 ? a * AP_OCT : a * 2 * DEMI_OCT), OCT.c.z + (Math.abs(b) === 1 ? b * AP_OCT : b * 2 * DEMI_OCT)]);
  const MUR_BORNE = 4.45 * RANGEE.ECH + 0.3 + 0.45;
  const LIGNE_B = [SOMMETS[2], SOMMETS[1], SOMMETS[0], SOMMETS[7]].map(([s_, t]) => vec(s_, 0, t));
  const LONG_PAN = 2 * DEMI_OCT, P_ = RANGEE.pas;
  const RANGEE_B = [1.5 * LONG_PAN - P_, 1.5 * LONG_PAN, 1.5 * LONG_PAN + P_, 2 * LONG_PAN + 21, 2 * LONG_PAN + 21 + P_];
  const ESTRADE_B = { h: 0.8, prof: 13, d0: LONG_PAN, d1: 0 };
  ESTRADE_B.d1 = RANGEE_B[RANGEE_B.length - 1] + 8.45 + 0.5;
  const surLigne = (d) => {
    let k = 0;
    while (k < 2 && d > LONG_PAN) {
      d -= LONG_PAN;
      k++;
    }
    const a = LIGNE_B[k], b = LIGNE_B[k + 1], u = b.clone().sub(a).normalize();
    return { p: a.clone().addScaledVector(u, d), u, n: vec(-u.z, 0, u.x) };
  };
  const ST = (s, t, y = 0) => vec(s, y, t);
  const enS = (p) => p.x;
  const CAP = (s, t) => Math.atan2(s, t);
  const CAP_C = CAP(0, 1);
  const pres = (x, z, y = 0) => vec(x, 0, z).applyAxisAngle(AXE_Y, CAP_C).add(LUIGI.pos).setY(y);
  const DOUCHE = pres(-2, 14.4, 38);
  const contourEstrade = () => {
    const E2 = ESTRADE_B, ds = [E2.d0, ...[1, 2].map((k) => k * LONG_PAN).filter((d) => d > E2.d0 + 1e-6 && d < E2.d1 - 1e-6), E2.d1];
    const ext = ds.map((d) => surLigne(d).p), ns = ds.slice(0, -1).map((d, j) => surLigne((d + ds[j + 1]) / 2).n);
    const onglet = (a, b) => a.clone().add(b).multiplyScalar(E2.prof / (1 + a.dot(b)));
    const int = ext.map((p, j) => j === 0 ? p.clone().addScaledVector(ns[0], E2.prof) : j === ext.length - 1 ? p.clone().addScaledVector(ns[ns.length - 1], E2.prof) : p.clone().add(onglet(ns[j - 1], ns[j])));
    return { ext, int };
  };
  let estradePoly = null;
  const solSalle = (p) => {
    {
      const g = auGuichet(p);
      if (g.x > COULOIR.x0 - 0.3 && g.x < COULOIR.x1 + 0.5 && g.z > 0.3 && g.z < COULOIR.z1 + 0.3) return GUICHET.estrade * clamp((g.x - COULOIR.x0 + 0.3) / 1.2, 0, 1);
    }
    estradePoly ||= (() => {
      const { ext, int } = contourEstrade();
      return { poly: [...ext, ...int.reverse()], int: contourEstrade().int };
    })();
    const P2 = estradePoly.poly;
    let dedans = false;
    for (let i = 0, j = P2.length - 1; i < P2.length; j = i++) {
      const a = P2[i], b = P2[j];
      if (a.z > p.z !== b.z > p.z && p.x < (b.x - a.x) * (p.z - a.z) / (b.z - a.z) + a.x) dedans = !dedans;
    }
    if (!dedans) {
      const E3 = decor?.userData.estradeRoulette;
      if (E3) {
        const dr = Math.hypot(p.x - E3.c.x, p.z - E3.c.z);
        for (let k = E3.marches.length - 1; k >= 0; k--) if (dr < E3.marches[k][0]) return E3.marches[k][1];
      }
      return 0;
    }
    let d = 1e9;
    const I = estradePoly.int;
    for (let k = 0; k < I.length - 1; k++) {
      const a = I[k], b = I[k + 1], ab = b.clone().sub(a), t = clamp(p.clone().sub(a).dot(ab) / ab.lengthSq(), 0, 1);
      d = Math.min(d, a.clone().addScaledVector(ab, t).setY(0).distanceTo(vec(p.x, 0, p.z)));
    }
    return ESTRADE_B.h * clamp(d / 0.8 + 0.25, 0, 1);
  };
  const SALLE = { haut: 46, coins: SOMMETS };
  const PANS_BORNES = [0, 7];
  const POKER = { centre: ST(30, -18), rayon: 13.5 };
  const TABLE_MII = {
    sieges: [[-17.5, 0], [-12.37, -12.37], [12.37, -12.37], [17.5, 0]],
    // les Mii, dans l'ordre du jeu (invités B, C, D, E de la maquette)
    joueur: [0, 17.4],
    tabouret: 4.2,
    assise: 5.25,
    taille: 11,
    regard: 0.45,
    invites: [1, 2, 3, 4],
    expressions: ["sourire", "neutre", "joie", "neutre"],
    etats: ["neutre", "cligne", "sourire", "joie", "inquiet", "parle"],
    resolution: 256,
    anneau: { r: 2.6, couleur: 8256666 },
    reaction: 2.2,
    vue: { pos: ST(52, 22, 25), cible: ST(27, -20, 4), fov: 44 },
    // la vue de la salle sur la grande table
    jeu: { pos: ST(30, 7, 19.5), cible: ST(30, -17.5, 6), fov: 58 }
  };
  const GUICHET = {
    k: 0.55,
    long: 44,
    avance: 9.6,
    haut: 5.6,
    marquise: 14.2,
    meuble: 2.55,
    luigi: 7.2,
    couloir: 6.3,
    porte: 2.5,
    estrade: 1.1,
    // estrade : le plancher du couloir (Luigi accoudé au comptoir, les mains dessus, comme sur la planche)
    vue: { pos: ST(2, 46, 14.5), cible: ST(-31, 60.5, 8), fov: 54 },
    regard: ST(2, 46, 11)
  };
  const PAN_G = { a: vec(SOMMETS[1][0], 0, SOMMETS[1][1]), b: vec(SOMMETS[2][0], 0, SOMMETS[2][1]) };
  const AXE_G = PAN_G.a.clone().sub(PAN_G.b).normalize(), SALLE_G = vec(-AXE_G.z, 0, AXE_G.x);
  const ORIGINE_G = PAN_G.a.clone().lerp(PAN_G.b, GUICHET.k), CAP_GUICHET = Math.atan2(SALLE_G.x, SALLE_G.z);
  const guichetEn = (x, z, y = 0) => ORIGINE_G.clone().addScaledVector(AXE_G, x).addScaledVector(SALLE_G, z).setY(y);
  const auGuichet = (q) => {
    const d = vec(q.x - ORIGINE_G.x, 0, q.z - ORIGINE_G.z);
    return { x: d.dot(AXE_G), z: d.dot(SALLE_G) };
  };
  const SLOTS = { pan: 6, t: OCT.c.z - AP_OCT + 0.3 + 0.45 + 2.3, s0: 1.1, pas: 6.6, n: 4, jeu: 1 };
  const ENTREE = { pan: 2, s: OCT.c.x, l: 36, bas: 14, haut: 41, prof: 36 }, PORTES = { pan: 2, s: 0 }, RIDEAUX = [5], LUSTRE_ST = [16, -14];
  const MATS = {};
  const physique = (o) => garder(new T.MeshPhysicalMaterial(o));
  const standard = (o) => garder(new T.MeshStandardMaterial(o));
  const uTemps = { value: 0 };
  const fabriquerMatieres = () => {
    Object.assign(MATS, {
      laque: physique({ color: 10096662, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.08 }),
      // corps rouges vernis
      laqueSombre: physique({ color: 3802892, roughness: 0.34, clearcoat: 1, clearcoatRoughness: 0.12 }),
      // socles
      // la laque des grandes surfaces du bâti (panneaux du lambris, pilastres, colonnes, loge, portes) : un seul vernis
      // (mesuré au banc : l'éclairage par pixel est le premier poste ; le double vernis reste aux meubles qu'on regarde)
      laqueMur: standard({ color: 10096662, roughness: 0.2, metalness: 0, envMapIntensity: 1.1 }),
      laqueMurSombre: standard({ color: 3802892, roughness: 0.26, envMapIntensity: 1 }),
      noirLaque: physique({ color: 789266, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.05 }),
      // machines à sous
      or: standard({ color: 14854728, roughness: 0.24, metalness: 1, envMapIntensity: 1.1 }),
      // laiton poli (filets)
      orSatine: standard({ color: 11107380, roughness: 0.46, metalness: 1 }),
      // laiton brossé (poutres)
      chrome: standard({ color: 14080738, roughness: 0.14, metalness: 1, envMapIntensity: 1.2 }),
      // liserés des machines
      cuir: physique({ color: 3807758, roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.35 }),
      // boudins des tables
      velours: physique({ color: 10686495, roughness: 0.8, sheen: 1, sheenColor: new T.Color(16743046), sheenRoughness: 0.45 }),
      // tabourets, rideaux
      terre: physique({ color: 12999212, roughness: 0.55, clearcoat: 0.5, clearcoatRoughness: 0.3 }),
      // jardinière
      noir: standard({ color: 526348, roughness: 0.6 }),
      blanc: standard({ color: 16052196, roughness: 0.5 })
    });
    MATS.ampoule = lumineuse(new T.MeshBasicMaterial({ color: new T.Color(1, 0.82, 0.55).multiplyScalar(3) }), true);
  };
  const ampoules = [];
  const ampoule = (parent, p, r = 0.28, halo = 3.2, motif = 0, k = ampoules.length) => {
    const o = new T.Object3D();
    o.position.copy(p);
    parent.add(o);
    ampoules.push({ o, r, halo, motif, k });
  };
  const ECLAT = `
    float eclat(vec2 m, float t) {
      if (m.x < .5) return .9 + .1 * sin(t * 6.3 + m.y * 12.9898);
      if (m.x < 1.5) return fract((m.y - t * 7.) / 3.) < .34 ? 1.15 : .09;   // (D9 : \xE9teinte, un verre sombre et non une pastille beige)
      if (m.x < 2.5) { float s = sin(t * 1.9 + m.y * 7.13) * .5 + .5; return .45 + .75 * smoothstep(.55, 1., s); }
      return mod(m.y + floor(t * 1.6), 2.) < 1. ? 1. : .28; }
`;
  const lumineuse = (m, face = false) => {
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uTemps = uTemps;
      sh.vertexShader = "attribute vec2 aMotif;\nuniform float uTemps;\nvarying float vEclat;\n" + ECLAT + sh.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\n vEclat = eclat(aMotif, uTemps);");
      if (face) sh.vertexShader = sh.vertexShader.replace("#include <project_vertex>", `vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(0., 0., 0., 1.);
        float ech = length(instanceMatrix[0].xyz); mvPosition.xy += transformed.xy * ech; mvPosition.z += .3 * ech;   // (\xE0 l'avant de la sph\xE8re d'origine)
        gl_Position = projectionMatrix * mvPosition;`);
      sh.fragmentShader = "varying float vEclat;\n" + sh.fragmentShader.replace("#include <color_fragment>", "#include <color_fragment>\n diffuseColor.rgb *= vEclat;");
    };
    m.customProgramCacheKey = () => face ? "pcv-eclat-face" : "pcv-eclat";
    return garder(m);
  };
  let geoAmpoule = null, matHalo = null, matOmbre = null;
  const poserAmpoules = () => {
    if (!ampoules.length) return;
    const v = vec(0, 0, 0), M = new T.Matrix4(), q = new T.Quaternion(), s = vec(1, 1, 1);
    const n = ampoules.length, motifs = new Float32Array(n * 2), inst = new T.InstancedMesh(geoAmpoule, MATS.ampoule, n);
    const pos = [], tailles = [], motifsH = [];
    ampoules.forEach((a, i) => {
      a.o.updateWorldMatrix(true, false);
      a.o.getWorldPosition(v);
      a.o.removeFromParent();
      inst.setMatrixAt(i, M.compose(v, q, s.setScalar(a.r / 0.3)));
      motifs[i * 2] = a.motif;
      motifs[i * 2 + 1] = a.k;
      if (a.halo) {
        pos.push(v.x, v.y, v.z);
        tailles.push(a.halo);
        motifsH.push(a.motif, a.k);
      }
    });
    inst.geometry = geoAmpoule.clone();
    garder(inst.geometry);
    inst.geometry.setAttribute("aMotif", new T.InstancedBufferAttribute(motifs, 2));
    inst.instanceMatrix.needsUpdate = true;
    inst.computeBoundingSphere();
    inst.name = "ampoules";
    inst.frustumCulled = false;
    scene.add(inst);
    for (const grand of [false, true]) {
      const idx = tailles.map((t, k) => t > 5 === grand ? k : -1).filter((k) => k >= 0);
      if (!idx.length) continue;
      const g = garder(new T.BufferGeometry());
      g.setAttribute("position", new T.Float32BufferAttribute(idx.flatMap((k) => pos.slice(k * 3, k * 3 + 3)), 3));
      g.setAttribute("aMotif", new T.Float32BufferAttribute(idx.flatMap((k) => motifsH.slice(k * 2, k * 2 + 2)), 2));
      const m = grand ? lumineuse(matHalo.clone()) : matHalo;
      if (grand) m.size = 8;
      const pts = new T.Points(g, m);
      pts.name = "halos";
      pts.renderOrder = 9;
      pts.frustumCulled = false;
      scene.add(pts);
    }
    ampoules.length = 0;
  };
  const kits = {};
  const instance = (kit, parent, p, rot, ech, couleur) => {
    const o = new T.Object3D();
    o.position.copy(p);
    if (rot) o.rotation.copy(rot);
    if (ech) o.scale.copy(ech);
    parent.add(o);
    kits[kit].liste.push({ o, couleur });
    return o;
  };
  const rouleauMasquable = (i, position) => {
    const o = new T.Object3D(), M0 = new T.Matrix4(), M = new T.Matrix4();
    let vu = true;
    o.position.copy(position);
    Object.defineProperty(o, "visible", { get: () => vu, set: (v) => {
      const inst = kits.rouleaux?.inst;
      v = !!v;
      if (!inst || v === vu) {
        vu = v;
        return;
      }
      if (!v) {
        inst.getMatrixAt(i, M0);
        inst.setMatrixAt(i, M.makeScale(0, 0, 0).setPosition(new T.Vector3().setFromMatrixPosition(M0)));
      } else inst.setMatrixAt(i, M0);
      vu = v;
      inst.instanceMatrix.needsUpdate = true;
    } });
    return o;
  };
  const poserKits = () => {
    const c = new T.Color();
    for (const [nom, k] of Object.entries(kits)) {
      if (!k.liste.length) continue;
      const inst = new T.InstancedMesh(k.geo, k.mat, k.liste.length);
      inst.name = nom;
      if (k.attributs) {
        inst.geometry = garder(k.geo.clone());
        for (const [a, n] of Object.entries(k.attributs)) inst.geometry.setAttribute(a, new T.InstancedBufferAttribute(new Float32Array(k.liste.length * n), n));
      }
      k.liste.forEach((e, i) => {
        e.o.updateWorldMatrix(true, false);
        inst.setMatrixAt(i, e.o.matrixWorld);
        if (e.couleur != null) inst.setColorAt(i, c.set(e.couleur));
        e.o.removeFromParent();
      });
      inst.instanceMatrix.needsUpdate = true;
      if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
      inst.computeBoundingSphere();
      scene.add(inst);
      k.inst = inst;
      k.liste = [];
    }
  };
  const texMoquette = () => {
    const N = 512, [c, x] = toile(N, N), [cb, xb] = toile(N, N), r = graine("moquette");
    x.fillStyle = "#c94a16";
    x.fillRect(0, 0, N, N);
    xb.fillStyle = "#808080";
    xb.fillRect(0, 0, N, N);
    for (let k = 0; k < 26e3; k++) {
      const px = r() * N, py = r() * N, a = r();
      x.fillStyle = a < 0.5 ? "rgba(110,25,0,.16)" : "rgba(255,170,90,.10)";
      x.fillRect(px, py, 1.3, 2.4);
      xb.fillStyle = a < 0.5 ? "rgba(0,0,0,.25)" : "rgba(255,255,255,.25)";
      xb.fillRect(px, py, 1.3, 2.4);
    }
    const pas_ = N / 6;
    for (let j = 0; j < 6; j++) for (let i = 0; i < 6; i++) {
      const px = (i + j % 2 * 0.5) * pas_ + pas_ / 4, py = (j + 0.5) * pas_;
      x.fillStyle = "rgba(255,190,80,.22)";
      x.save();
      x.translate((px + pas_ / 2) % N, (py + pas_ / 2) % N);
      x.rotate(Math.PI / 4);
      x.fillRect(-4, -4, 8, 8);
      x.restore();
      x.save();
      x.translate(px, py);
      x.rotate((r() - 0.5) * 0.9);
      const R_ = 13 + r() * 5;
      x.fillStyle = "#8a2c06";
      etoile(x, 0, 0, R_ + 2.5);
      x.fillStyle = "#f7c531";
      etoile(x, 0, 0, R_);
      x.fillStyle = "rgba(255,240,170,.75)";
      etoile(x, -1.5, -2, R_ * 0.42);
      x.restore();
      xb.save();
      xb.translate(px, py);
      xb.fillStyle = "#3a3a3a";
      etoile(xb, 0, 0, R_ + 2.5);
      xb.restore();
    }
    const t = texture(c), b = texture(cb);
    t.repeat.set(40, 40);
    b.repeat.set(40, 40);
    b.colorSpace = T.NoColorSpace;
    return { t, b };
  };
  const texMur = () => {
    const N = 512, [c, x] = toile(N, N), [cb, xb] = toile(N, N), r = graine("mur");
    const g = x.createLinearGradient(0, 0, N, 0);
    for (let k = 0; k <= 8; k++) g.addColorStop(k / 8, k % 2 ? "#2a1162" : "#321571");
    x.fillStyle = g;
    x.fillRect(0, 0, N, N);
    for (let k = 0; k < 9e3; k++) {
      x.fillStyle = r() < 0.5 ? "rgba(10,0,30,.22)" : "rgba(150,120,255,.05)";
      x.fillRect(r() * N, r() * N, 1.2, 3.5);
    }
    xb.fillStyle = "#808080";
    xb.fillRect(0, 0, N, N);
    const pts = [];
    for (let essai2 = 0; essai2 < 400 && pts.length < 11; essai2++) {
      const p = [r() * N, r() * N, 26 + r() * 30];
      if (pts.every((q) => {
        let dx = Math.abs(q[0] - p[0]), dy = Math.abs(q[1] - p[1]);
        dx = Math.min(dx, N - dx);
        dy = Math.min(dy, N - dy);
        return Math.hypot(dx, dy) > q[2] + p[2] + 34;
      })) pts.push(p);
    }
    for (const [px, py, R_] of pts) for (const ox of [-N, 0, N]) for (const oy of [-N, 0, N]) {
      const cx = px + ox, cy = py + oy;
      if (cx < -70 || cx > N + 70 || cy < -70 || cy > N + 70) continue;
      const a = px * 7 % 10 / 10 * 1.2 - 0.6;
      x.save();
      x.translate(cx, cy);
      x.rotate(a);
      x.fillStyle = "rgba(0,0,10,.45)";
      etoile(x, 3, 4, R_);
      x.fillStyle = "#c98e22";
      etoile(x, 0, 0, R_);
      x.fillStyle = "#f3c94e";
      etoile(x, -1, -1.5, R_ * 0.86);
      x.fillStyle = "rgba(255,240,180,.55)";
      etoile(x, -3, -4, R_ * 0.38);
      x.restore();
      xb.save();
      xb.translate(cx, cy);
      xb.rotate(a);
      xb.fillStyle = "#c8c8c8";
      etoile(xb, 0, 0, R_);
      xb.fillStyle = "#e8e8e8";
      etoile(xb, 0, 0, R_ * 0.6);
      xb.restore();
    }
    const t = texture(c), b = texture(cb);
    b.colorSpace = T.NoColorSpace;
    return { t, b };
  };
  const texCiel = () => {
    const N = 512, [c, x] = toile(N, N), r = graine("ciel");
    x.fillStyle = "#000";
    x.fillRect(0, 0, N, N);
    for (let k = 0; k < 150; k++) {
      const px = r() * N, py = r() * N, a = 0.35 + r() * 0.65, R_ = 1 + r() * 1.8, g = x.createRadialGradient(px, py, 0, px, py, R_ * 2.4);
      g.addColorStop(0, `rgba(255,236,190,${a})`);
      g.addColorStop(1, "rgba(255,220,160,0)");
      x.fillStyle = g;
      x.fillRect(px - R_ * 3, py - R_ * 3, R_ * 6, R_ * 6);
    }
    return texture(c);
  };
  const scintillant = (m) => {
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uTemps = uTemps;
      sh.fragmentShader = "uniform float uTemps;\n" + sh.fragmentShader.replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
        { vec2 cel = floor(vEmissiveMapUv * 48.); float h = fract(sin(dot(cel, vec2(12.9898, 78.233))) * 43758.5453);
          totalEmissiveRadiance *= .35 + .9 * smoothstep(.2, 1., sin(uTemps * (.8 + h * 1.6) + h * 40.) * .5 + .5); }`);
    };
    m.customProgramCacheKey = () => "pcv-ciel";
    return m;
  };
  const texRayures = () => {
    const [c, x] = toile(256, 64);
    x.fillStyle = "#8a0f16";
    x.fillRect(0, 0, 256, 64);
    x.fillStyle = "#e3b24a";
    for (let k = 0; k < 256; k += 32) x.fillRect(k + 13, 0, 6, 64);
    x.fillStyle = "rgba(255,240,200,.35)";
    for (let k = 0; k < 256; k += 32) x.fillRect(k + 14, 0, 2, 64);
    return texture(c);
  };
  const texFeutre = (embleme) => {
    const [c, x] = toile(1024, 1024), r = graine("feutre");
    x.fillStyle = "#0d5c2c";
    x.fillRect(0, 0, 1024, 1024);
    for (let k = 0; k < 2e4; k++) {
      x.fillStyle = r() < 0.5 ? "rgba(0,30,10,.2)" : "rgba(120,220,150,.06)";
      x.fillRect(r() * 1024, r() * 1024, 2, 2);
    }
    if (embleme) {
      x.strokeStyle = "rgba(240,200,90,.8)";
      x.lineWidth = 7;
      x.beginPath();
      x.arc(512, 0, 760, 0.18 * Math.PI, 0.82 * Math.PI);
      x.stroke();
      x.lineWidth = 3;
      x.beginPath();
      x.arc(512, 0, 720, 0.2 * Math.PI, 0.8 * Math.PI);
      x.stroke();
      x.fillStyle = "rgba(240,236,220,.85)";
      x.beginPath();
      x.arc(512, 250, 64, 0, Math.PI * 2);
      x.fill();
      x.strokeStyle = "rgba(240,200,90,.9)";
      x.lineWidth = 6;
      x.stroke();
      x.fillStyle = "#1f8a3a";
      x.font = "900 100px Nunito, sans-serif";
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText("L", 512, 256);
    }
    return texture(c, { bord: true });
  };
  const texHalo = () => {
    const [c, x] = toile(64, 64), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,240,200,1)");
    g.addColorStop(0.15, "rgba(255,210,130,.6)");
    g.addColorStop(0.45, "rgba(255,170,70,.12)");
    g.addColorStop(1, "rgba(255,150,50,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 64, 64);
    return texture(c, { bord: true });
  };
  const texOmbre = () => {
    const [c, x] = toile(128, 128), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(0,0,0,.62)");
    g.addColorStop(0.55, "rgba(0,0,0,.34)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 128, 128);
    return texture(c, { bord: true });
  };
  const texFeuille = () => {
    const [c, x] = toile(64, 256);
    const g = x.createLinearGradient(0, 0, 64, 0);
    g.addColorStop(0, "#5a5a5a");
    g.addColorStop(0.42, "#e8e8e8");
    g.addColorStop(0.5, "#ffffff");
    g.addColorStop(0.58, "#e8e8e8");
    g.addColorStop(1, "#5a5a5a");
    x.fillStyle = g;
    x.fillRect(0, 0, 64, 256);
    x.fillStyle = "rgba(255,255,230,.9)";
    x.fillRect(30, 0, 4, 256);
    x.strokeStyle = "rgba(255,255,220,.35)";
    x.lineWidth = 1.5;
    for (let k = 10; k < 256; k += 14) {
      x.beginPath();
      x.moveTo(32, k);
      x.lineTo(2, k + 18);
      x.moveTo(32, k);
      x.lineTo(62, k + 18);
      x.stroke();
    }
    return texture(c, { bord: true });
  };
  const ombre = (x, z, l, p, a = 1) => {
    const m = new T.Mesh(garder(new T.PlaneGeometry(l, p)), matOmbre);
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.03, z);
    m.renderOrder = 1;
    (decor || scene).add(m);
    return m;
  };
  const extruder = (forme2, prof, biseau = 0.25, mat) => {
    const g = garder(new T.ExtrudeGeometry(forme2, { depth: prof, bevelEnabled: true, bevelSize: biseau, bevelThickness: biseau, bevelSegments: 3, curveSegments: 24 }));
    g.rotateX(-Math.PI / 2);
    return new T.Mesh(g, mat);
  };
  const polygone = (n, r, rot = 0) => {
    const s = new T.Shape();
    for (let k = 0; k <= n; k++) {
      const a = rot + k / n * Math.PI * 2;
      s[k ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r);
    }
    return s;
  };
  const boudin = (points, rayon2, mat, ferme = false, cotes = 8) => new T.Mesh(garder(new T.TubeGeometry(new T.CatmullRomCurve3(points, ferme, "catmullrom", 0.05), points.length * 8, rayon2, cotes, ferme)), mat);
  const tourner_ = (profil, mat, n = 32) => new T.Mesh(garder(new T.LatheGeometry(profil.map(([x, y]) => new T.Vector2(x, y)), n)), mat);
  const demiLune = (r) => {
    const sh = new T.Shape();
    sh.moveTo(-r, 0);
    sh.absarc(0, 0, r, Math.PI, 0, true);
    sh.lineTo(-r, 0);
    return sh;
  };
  const tabouret = (parent, x, z, rot = 0, haut = 4.4) => {
    const g = new T.Group();
    g.position.set(x, 0, z);
    g.rotation.y = rot;
    parent.add(g);
    const pied = tourner_([[0, 0], [1.5, 0], [1.45, 0.18], [0.35, 0.32], [0.22, 0.5], [0.22, haut - 0.4], [0.5, haut - 0.2], [0, haut - 0.2]], MATS.chrome, 24);
    g.add(pied);
    const assise = tourner_([[0, 0], [1.25, 0], [1.6, 0.25], [1.68, 0.6], [1.55, 0.85], [1.1, 0.95], [0, 0.9]], MATS.velours, 28);
    assise.position.y = haut - 0.2;
    g.add(assise);
    const dossier = new T.Mesh(garder(new T.CylinderGeometry(1.62, 1.62, 1.5, 20, 1, true, Math.PI * 0.6, Math.PI * 0.8)), MATS.velours);
    dossier.position.y = haut + 1.2;
    g.add(dossier);
    const liser\u00E9 = new T.Mesh(garder(new T.TorusGeometry(1.64, 0.09, 6, 32)), MATS.chrome);
    liser\u00E9.rotation.x = Math.PI / 2;
    liser\u00E9.position.y = haut + 0.45;
    g.add(liser\u00E9);
    return g;
  };
  const VERTS = [3111466, 3836462, 2779686, 4691514, 3505968];
  const touffe = (parent, p, n, long, r, ouverture = [0.35, 1.05]) => {
    for (let k = 0; k < n; k++) {
      const az = k / n * Math.PI * 2 + (r() - 0.5) * 0.5, el = ouverture[0] + r() * (ouverture[1] - ouverture[0]), l = long * (0.75 + r() * 0.45);
      instance("feuilles", parent, p.clone().add(vec((r() - 0.5) * 0.3, 0, (r() - 0.5) * 0.3)), new T.Euler(-el, az, (r() - 0.5) * 0.4, "YXZ"), vec(l * 0.9, l, l), VERTS[Math.floor(r() * VERTS.length)]);
    }
  };
  const plante = (x, z, k = 1) => {
    const g = new T.Group();
    g.position.set(x, 0, z);
    g.scale.setScalar(k);
    decor.add(g);
    const pot = tourner_([[0, 0], [1.15, 0], [1.3, 0.3], [1.62, 2.5], [1.8, 2.7], [1.8, 2.95], [1.5, 2.95], [1.5, 2.7], [0, 2.7]], MATS.or, 28);
    g.add(pot);
    const bague = new T.Mesh(garder(new T.TorusGeometry(1.45, 0.1, 6, 28)), MATS.laqueSombre);
    bague.rotation.x = Math.PI / 2;
    bague.position.y = 1.2;
    g.add(bague);
    const terre_ = new T.Mesh(garder(new T.CircleGeometry(1.55, 20)), MATS.cuir);
    terre_.rotation.x = -Math.PI / 2;
    terre_.position.y = 2.75;
    g.add(terre_);
    touffe(g, vec(0, 2.8, 0), 13, 4.6, graine("plante" + x + z), [0.25, 1.15]);
    touffe(g, vec(0, 3, 0), 5, 3.2, graine("coeur" + x), [1.1, 1.4]);
    ombre(x, z, 5.5 * k, 5.5 * k);
  };
  const ecriteau = (txt, o = {}) => {
    const W2 = o.l || 1024, H2 = o.h || 256, [c, k] = toile(W2, H2);
    k.fillStyle = o.fond || "#8a0f16";
    k.fillRect(0, 0, W2, H2);
    if (o.bord !== false) {
      k.strokeStyle = o.bordC || "#e3b24a";
      k.lineWidth = H2 * 0.07;
      k.strokeRect(H2 * 0.06, H2 * 0.06, W2 - H2 * 0.12, H2 - H2 * 0.12);
    }
    k.fillStyle = o.couleur || "#fbeedd";
    k.font = `900 ${o.taille || H2 * 0.56}px Nunito, sans-serif`;
    k.textAlign = "center";
    k.textBaseline = "middle";
    k.fillText(txt, W2 / 2, H2 / 2 + H2 * 0.03);
    return texture(c, { flipY: true, bord: true });
  };
  const construireGuichet = () => {
    const G2 = GUICHET, L = G2.long, ZC = G2.avance, HC = G2.haut, H2 = G2.marquise;
    const g = new T.Group();
    g.name = "guichet";
    g.position.copy(guichetEn(0, 0));
    g.rotation.y = CAP_GUICHET;
    decor.add(g);
    const rayures = (l, marquise = false) => {
      const [c, x] = toile(256, 64);
      x.fillStyle = "#8a0f16";
      x.fillRect(0, 0, 256, 64);
      x.fillStyle = marquise ? "#f3e6c8" : "#e3b24a";
      for (let k = 0; k < 256; k += 32) x.fillRect(k + (marquise ? 16 : 13), 0, marquise ? 16 : 6, 64);
      const t = texture(c, { flipY: true });
      t.repeat.set(marquise ? l / 5 : l / 4, 1);
      if (marquise) {
        t.rotation = Math.PI / 2;
        t.repeat.set(1, l / 4);
      }
      return t;
    };
    const panneau = (l, h, tex, emissif) => new T.Mesh(garder(new T.PlaneGeometry(l, h)), standard({ map: tex, roughness: 0.4, emissive: 16777215, emissiveMap: tex, emissiveIntensity: emissif }));
    const cyl = (r, h, mat, n = 16) => new T.Mesh(garder(new T.CylinderGeometry(r, r, h, n)), mat);
    const marbre = physique({ color: 13615789, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.05 });
    const comptoir = (l, x, z, rotY = 0) => {
      const c = new T.Group();
      c.position.set(x, 0, z);
      c.rotation.y = rotY;
      g.add(c);
      const s_ = boite3(l, 0.9, 2.8, MATS.laqueSombre);
      s_.position.y = 0.45;
      c.add(s_);
      const corps = boite3(l - 0.3, HC - 1.4, 2.4, physique({ map: rayures(l), roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.1 }));
      corps.position.y = 0.9 + (HC - 1.4) / 2;
      c.add(corps);
      for (const y of [1, HC - 0.55]) {
        const b = boite3(l - 0.2, 0.22, 2.5, MATS.or);
        b.position.y = y;
        c.add(b);
      }
      const dessus = boite3(l + 0.4, 0.36, 3.2, marbre);
      dessus.position.set(0, HC - 0.18, 0.15);
      c.add(dessus);
    };
    comptoir(L, 0, ZC);
    comptoir(7.4, L / 2 - 1.2, ZC - 4.9, -Math.PI / 2);
    {
      const e2 = G2.estrade, l = COULOIR.x1 - COULOIR.x0, p_ = boite3(l, e2, COULOIR.z1 - COULOIR.z0 + 0.6, MATS.laqueSombre);
      p_.position.set((COULOIR.x0 + COULOIR.x1) / 2, e2 / 2, (COULOIR.z0 + COULOIR.z1) / 2);
      g.add(p_);
    }
    for (const x of [-L / 2 + 0.6, L / 2 - 0.6]) {
      const c = cyl(0.5, H2 - HC, MATS.or, 20);
      c.position.set(x, HC + (H2 - HC) / 2, ZC + 0.9);
      g.add(c);
      for (let k = 0; k < 7; k++) {
        const t = new T.Mesh(garder(new T.TorusGeometry(0.56, 0.12, 6, 20)), MATS.orSatine);
        t.rotation.x = Math.PI / 2;
        t.position.set(x, HC + 0.8 + k * (H2 - HC - 1.2) / 6, ZC + 0.9);
        g.add(t);
      }
    }
    const verre = physique({ color: 15267071, roughness: 0.04, metalness: 0, transparent: true, opacity: 0.2, clearcoat: 1, envMapIntensity: 1.5, side: T.DoubleSide, depthWrite: false });
    for (const [x, l] of [[-(L / 4 + 2.2), L / 2 - 7], [L / 4 + 2.2, L / 2 - 7]]) {
      const vt = new T.Mesh(garder(new T.PlaneGeometry(l, 4.4)), verre);
      vt.position.set(x, HC + 2.4, ZC + 0.3);
      vt.userData.garder = true;
      g.add(vt);
      for (const y of [HC + 0.2, HC + 4.6]) {
        const b = boite3(l, 0.18, 0.25, MATS.or);
        b.position.set(x, y, ZC + 0.3);
        g.add(b);
      }
      for (const dx of [-l / 2, l / 2]) {
        const b = boite3(0.18, 4.4, 0.25, MATS.or);
        b.position.set(x + dx, HC + 2.4, ZC + 0.3);
        g.add(b);
      }
    }
    const prof = 7.2, ang = 0.32, aw = new T.Mesh(garder(new T.PlaneGeometry(L + 1.5, prof)), physique({ map: rayures(L + 1.5, true), roughness: 0.5, side: T.DoubleSide, sheen: 0.5 }));
    aw.rotation.x = -Math.PI / 2 + ang;
    aw.position.set(0, H2 + Math.sin(ang) * prof / 2, ZC + 1.6 - Math.cos(ang) * prof / 2 + 0.4);
    g.add(aw);
    const nf = 21, fes = garder(new T.CircleGeometry((L + 1.5) / nf / 2, 16, Math.PI, Math.PI)), matsF = [10096662, 14922314].map((c) => standard({ color: c, roughness: 0.45, side: T.DoubleSide }));
    for (let k = 0; k < nf; k++) {
      const f2 = new T.Mesh(fes, matsF[k % 2]);
      f2.position.set(-(L + 1.5) / 2 + (k + 0.5) * (L + 1.5) / nf, H2, ZC + 2);
      g.add(f2);
    }
    for (let k = 0; k <= 40; k++) ampoule(g, vec(-(L + 1.5) / 2 + k * (L + 1.5) / 40, H2 - 0.55, ZC + 2.05), 0.24, 1.6, 0, k);
    const fronton = new T.Group();
    fronton.position.set(0, H2 + 4.6, ZC - 2.6);
    g.add(fronton);
    const sig = panneau(17, 3.4, ecriteau(Tr("casino.jeu_guichet_titre").toUpperCase(), { l: 1280, h: 256, fond: "#1f8a3a", bordC: "#f2c14e", taille: 112 }), 0.55);
    sig.position.z = 0.3;
    fronton.add(sig);
    fronton.add(boite3(17.8, 4.2, 0.5, MATS.or));
    for (let k = 0; k <= 16; k++) for (const y of [2.25, -2.25]) ampoule(fronton, vec(-8.9 + k * 17.8 / 16, y, 0.3), 0.22, 1.6, 0, k);
    const e = new T.Group();
    e.position.set(0, 4.3, 0.1);
    fronton.add(e);
    const d = cyl(2, 0.5, MATS.laque, 32);
    d.rotation.x = Math.PI / 2;
    e.add(d);
    const f = panneau(3.3, 3.3, ecriteau("L", { l: 256, h: 256, fond: "#f6f2e6", couleur: "#1f8a3a", bord: false, taille: 200 }), 0.5);
    f.position.z = 0.3;
    e.add(f);
    const c2 = new T.Mesh(garder(new T.TorusGeometry(2.05, 0.16, 8, 32)), MATS.or);
    c2.position.z = 0.3;
    e.add(c2);
    const pl = panneau(5.2, 1.3, ecriteau(Tr("casino.taux_change", { n: window.__pcvCasinoJeux?.ECO?.taux ?? CHANGE_REPLI }), { l: 1024, h: 256, fond: "#1e1208", couleur: "#f2c14e", taille: 92 }), 0.35);
    pl.rotation.x = -0.35;
    pl.position.set(8, HC + 0.55, ZC + 1.45);
    g.add(pl);
    const ancreG = new T.Group();
    ancreG.name = "ancre du guichet";
    g.add(ancreG);
    decor.userData.ancreGuichet = ancreG;
  };
  const CHANGE_REPLI = 20;
  const construireSalle = () => {
    fabriquerMatieres();
    geoAmpoule = garder(new T.CircleGeometry(0.3, 14));
    matHalo = lumineuse(new T.PointsMaterial({ map: texHalo(), size: 3, sizeAttenuation: true, transparent: true, depthWrite: false, blending: T.AdditiveBlending, color: new T.Color(0.32, 0.26, 0.18) }));
    matOmbre = garder(new T.MeshBasicMaterial({ map: texOmbre(), transparent: true, depthWrite: false }));
    const gf = new T.PlaneGeometry(1, 1, 2, 10), P = gf.attributes.position;
    for (let k = 0; k < P.count; k++) {
      const u = P.getX(k), v = P.getY(k) + 0.5, w = Math.pow(Math.sin(Math.PI * Math.min(1, v * 1.05)), 0.6) * 0.3, X = u * 2 * w;
      P.setXYZ(k, X, -0.55 * v * v + Math.abs(X) * 0.35, v);
    }
    gf.computeVertexNormals();
    garder(gf);
    kits.feuilles = { geo: gf, mat: standard({ map: texFeuille(), color: 16777215, roughness: 0.5, side: T.DoubleSide, envMapIntensity: 0.5 }), liste: [] };
    decor = new T.Group();
    decor.name = "casino de Luigi (neuf)";
    scene.add(decor);
    ampoules.length = 0;
    const S2 = SALLE, NC = S2.coins.length;
    const mq = texMoquette();
    const formeSol = new T.Shape(S2.coins.map(([s_, t]) => {
      const d = Math.hypot(s_ - OCT.c.x, t - OCT.c.z), k = (d + 2) / d;
      return new T.Vector2(OCT.c.x + (s_ - OCT.c.x) * k, -(OCT.c.z + (t - OCT.c.z) * k));
    }));
    for (const t of [mq.t, mq.b]) t.repeat.set(1 / 12, 1 / 12);
    const sol = new T.Mesh(garder(new T.ShapeGeometry(formeSol)), standard({ map: mq.t, bumpMap: mq.b, bumpScale: 1.2, roughness: 0.86, envMapIntensity: 0.35 }));
    sol.rotation.x = -Math.PI / 2;
    sol.name = "moquette";
    sol.receiveShadow = true;
    sol.userData.garder = true;
    decor.add(sol);
    const [cv, xv] = toile(256, 16);
    for (let k = 0; k < 256; k++) {
      const v = 0.55 + 0.45 * Math.sin(k / 256 * Math.PI * 16);
      xv.fillStyle = `rgb(${Math.round(150 * v + 40)},${Math.round(10 * v + 4)},${Math.round(22 * v + 6)})`;
      xv.fillRect(k, 0, 1, 16);
    }
    const matRideau = physique({ map: texture(cv), roughness: 0.8, sheen: 1, sheenColor: new T.Color(16736368), sheenRoughness: 0.5, side: T.DoubleSide });
    const rideau = (l, h, plis = 14, serre = 0) => {
      const geo = garder(new T.PlaneGeometry(l, h, plis * 4, 8)), Pr = geo.attributes.position;
      for (let k = 0; k < Pr.count; k++) {
        const y = Pr.getY(k) / h + 0.5, x = Pr.getX(k), pince = serre ? 1 - serre * Math.exp(-((y - 0.38) ** 2) / 0.02) : 1;
        Pr.setX(k, x * pince);
        Pr.setZ(k, Math.sin(x / l * Math.PI * 2 * plis) * 0.45 * (2 - pince));
      }
      geo.computeVertexNormals();
      return new T.Mesh(geo, matRideau);
    };
    const tm = texMur(), M_ETOILES = 30;
    const matMur = standard({ map: tm.t, bumpMap: tm.b, bumpScale: 2, roughness: 0.74, envMapIntensity: 0.45 });
    const uvMonde = (geo, l, h, dx = 0, dy = 0) => {
      const U = geo.attributes.uv, Pp = geo.attributes.position, N_ = geo.attributes.normal;
      for (let i = 0; i < U.count; i++) {
        const cote_ = Math.abs(N_.getX(i)) > 0.5;
        U.setXY(i, ((cote_ ? Pp.getZ(i) : Pp.getX(i)) + dx) / M_ETOILES, (Pp.getY(i) + dy) / M_ETOILES);
      }
      return geo;
    };
    const applique = (parent, ax, ay, az, rotY = 0) => {
      const ap = new T.Group();
      ap.position.set(ax, ay, az);
      ap.rotation.y = rotY;
      parent.add(ap);
      const platine = new T.Mesh(garder(new T.CylinderGeometry(0.9, 0.9, 0.25, 20)), MATS.or);
      platine.rotation.x = Math.PI / 2;
      ap.add(platine);
      ap.add(boudin([vec(0, 0, 0.1), vec(0, -0.6, 0.9), vec(0, 0.2, 1.7)], 0.14, MATS.or));
      const coupe = tourner_([[0, 0], [0.35, 0], [0.9, 0.5], [1, 0.7]], MATS.or, 20);
      coupe.position.set(0, 0.1, 1.7);
      ap.add(coupe);
      ampoule(ap, vec(0, 1.15, 1.7), 0.55, 7, 0);
      return ap;
    };
    let u0 = 0;
    const pans = S2.coins.map(([s0, t0], k) => {
      const [s1, t1] = S2.coins[(k + 1) % NC], a = ST(s0, t0), b = ST(s1, t1);
      const g = new T.Group();
      g.position.copy(a).lerp(b, 0.5);
      g.rotation.y = CAP(t1 - t0, -(s1 - s0));
      decor.add(g);
      g.updateMatrixWorld(true);
      const L = a.distanceTo(b), pan = { k, g, L, a, b, u0, x: (p) => g.worldToLocal(p.clone()).x, appliques: [] };
      u0 += L;
      return pan;
    });
    for (const pan of pans) {
      const { g, L, k, u0: u0p } = pan, E_2 = ENTREE, loge = k === E_2.pan, portes = k === PORTES.pan;
      const ex = loge ? pan.x(ST(E_2.s, 0)) : 0, xa = ex - E_2.l / 2, xb2 = ex + E_2.l / 2;
      const tenture = (x0, x1, y0, y1, ep = 0) => {
        const l = x1 - x0, h = y1 - y0;
        if (l <= 0.1 || h <= 0.1) return;
        const geo = uvMonde(ep ? garder(new T.BoxGeometry(l, h, ep)) : garder(new T.PlaneGeometry(l, h)), l, h, (x0 + x1) / 2 + L / 2 + u0p, (y0 + y1) / 2 - 9);
        const m = new T.Mesh(geo, matMur);
        m.position.set((x0 + x1) / 2, (y0 + y1) / 2, ep ? -ep / 2 : 0);
        g.add(m);
        return m;
      };
      if (loge) {
        tenture(-L / 2, xa, 9, S2.haut, 2);
        tenture(xb2, L / 2, 9, S2.haut, 2);
        tenture(xa, xb2, 9, E_2.bas, 2);
        tenture(xa, xb2, E_2.haut, S2.haut, 2);
      } else tenture(-L / 2, L / 2, 9, S2.haut);
      const lb = boite3(L, 9, 1.2, MATS.laqueMurSombre);
      lb.position.set(0, 4.5, -0.6);
      g.add(lb);
      const np = Math.max(1, Math.round(L / 16));
      for (let p = 0; p < np; p++) {
        const pn = boite3(L / np - 2.4, 5.4, 0.3, MATS.laqueMur);
        pn.position.set(-L / 2 + (p + 0.5) * L / np, 4.4, 0.1);
        g.add(pn);
        for (const y of [1.85, 7]) {
          const f = boite3(L / np - 3.2, 0.12, 0.12, MATS.or);
          f.position.set(-L / 2 + (p + 0.5) * L / np, y, 0.3);
          g.add(f);
        }
      }
      const cimaise = boite3(L, 0.5, 0.8, MATS.or);
      cimaise.position.set(0, 9.1, 0);
      g.add(cimaise);
      const plinthe = boite3(L, 0.8, 1.3, MATS.or);
      plinthe.position.set(0, 0.4, -0.2);
      g.add(plinthe);
      if (!PANS_BORNES.includes(k)) {
        const pil = boite3(3.2, S2.haut, 1.6, MATS.laqueMur);
        pil.position.set(L / 2, S2.haut / 2, 0);
        g.add(pil);
        for (const y of [0.5, 9.1, S2.haut - 6]) {
          const b = boite3(4, y < 1 ? 1 : 1.2, 2.2, MATS.or);
          b.position.set(L / 2, y, 0);
          g.add(b);
        }
      }
      const corniche = boite3(L, 1.6, 2.6, MATS.orSatine);
      corniche.position.set(0, S2.haut - 0.8, 0);
      g.add(corniche);
      const frise2 = boite3(L, 0.3, 0.5, MATS.or);
      frise2.position.set(0, S2.haut - 1.9, 1.2);
      g.add(frise2);
      const na = Math.max(1, Math.round(L / 40)), xp = portes ? pan.x(ST(PORTES.s, 0)) : null;
      for (let i = 0; i < na; i++) {
        const ax = -L / 2 + (i + 0.5) * L / na;
        if (xp != null && Math.abs(ax - xp) < 11 || loge && Math.abs(ax - ex) < E_2.l / 2 + 4 || k === SLOTS.pan && Math.abs(ax - pan.x(ST(SLOTS.s0 + (SLOTS.n - 1) * SLOTS.pas / 2, 0))) < 16) continue;
        applique(g, ax, 19, 1);
        pan.appliques.push(ax);
      }
      if (loge) {
        const P_2 = E_2.prof, lg = new T.Group();
        lg.position.x = ex;
        g.add(lg);
        const xa2 = -E_2.l / 2, xb3 = E_2.l / 2;
        const mqL = mq.t.clone();
        mqL.repeat.set(E_2.l / 12, P_2 / 12);
        mqL.needsUpdate = true;
        garder(mqL);
        const plancher = boite3(E_2.l, 1, P_2, standard({ map: mqL, bumpMap: mq.b, bumpScale: 1, roughness: 0.86 }));
        plancher.position.set(0, E_2.bas - 0.5, -P_2 / 2);
        lg.add(plancher);
        const nez = boite3(E_2.l, 1.2, 1.2, MATS.or);
        nez.position.set(0, E_2.bas - 0.6, 0.2);
        lg.add(nez);
        const mursL = [xa2, xb3].map((x) => {
          const m = new T.Mesh(uvMonde(garder(new T.BoxGeometry(1, E_2.haut - E_2.bas, P_2)), 1, 0, 0, 0), matMur);
          m.position.set(x, (E_2.bas + E_2.haut) / 2, -P_2 / 2);
          lg.add(m);
          return m;
        });
        const fondL = new T.Mesh(uvMonde(garder(new T.BoxGeometry(E_2.l, E_2.haut - E_2.bas, 1)), 0, 0), matMur);
        fondL.position.set(0, (E_2.bas + E_2.haut) / 2, -P_2);
        lg.add(fondL);
        const plafL = boite3(E_2.l + 1, 1, P_2 + 1, MATS.laqueSombre);
        plafL.position.set(0, E_2.haut + 0.5, -P_2 / 2);
        lg.add(plafL);
        for (const m of [...mursL, fondL]) {
          const lb_ = boite3(m === fondL ? E_2.l : 1.4, 4, m === fondL ? 1.4 : P_2, MATS.laqueSombre);
          lb_.position.copy(m.position).setY(E_2.bas + 2);
          lg.add(lb_);
        }
        applique(lg, xa2 + 0.6, E_2.bas + 11, -P_2 * 0.55, Math.PI / 2);
        applique(lg, xb3 - 0.6, E_2.bas + 11, -P_2 * 0.55, -Math.PI / 2);
        const balustre = [[0, 0], [0.35, 0], [0.35, 0.3], [0.18, 0.5], [0.32, 1.3], [0.16, 2.3], [0.25, 2.5], [0.25, 2.7], [0, 2.7]];
        for (let x = xa2 + 1.2; x < xb3 - 0.6; x += 1.15) {
          const b = tourner_(balustre, MATS.or, 10);
          b.position.set(x, E_2.bas + 0.3, 0.2);
          lg.add(b);
        }
        const main = boite3(E_2.l, 0.5, 0.9, MATS.laque);
        main.position.set(0, E_2.bas + 3.2, 0.2);
        lg.add(main);
        const fil = boite3(E_2.l, 0.14, 1, MATS.or);
        fil.position.set(0, E_2.bas + 3.5, 0.2);
        lg.add(fil);
        const lisse2 = boite3(E_2.l, 0.3, 0.7, MATS.or);
        lisse2.position.set(0, E_2.bas + 0.2, 0.2);
        lg.add(lisse2);
        for (const x of [xa2, xb3]) {
          const m = boite3(3, E_2.haut - E_2.bas + 2, 3.4, MATS.laqueMur);
          m.position.set(x, (E_2.bas + E_2.haut) / 2, -0.4);
          lg.add(m);
          for (const y of [E_2.bas + 0.3, E_2.haut - 0.3]) {
            const f = boite3(3.6, 0.6, 4, MATS.or);
            f.position.set(x, y, -0.4);
            lg.add(f);
          }
          for (let i = 0; i < 16; i++) ampoule(lg, vec(x + (x < 0 ? 1.7 : -1.7), E_2.bas + 1.5 + i * (E_2.haut - E_2.bas - 3) / 15, 0.4), 0.28, 2.2, 1, x < 0 ? i : 15 - i);
        }
        const linteau = boite3(E_2.l + 3.6, 2.4, 3.6, MATS.laqueMur);
        linteau.position.set(0, E_2.haut + 1, -0.4);
        lg.add(linteau);
        for (const s_ of [-1, 1]) {
          const r = rideau(7, E_2.haut - E_2.bas - 1, 5, 0.5);
          r.position.set(s_ * (E_2.l / 2 - 4.5), (E_2.bas + E_2.haut) / 2, -1.2);
          lg.add(r);
          const emb = new T.Mesh(garder(new T.TorusGeometry(0.9, 0.2, 8, 16)), MATS.or);
          emb.position.set(s_ * (E_2.l / 2 - 4.5), E_2.bas + 9, -0.5);
          lg.add(emb);
        }
      }
      if (portes) {
        const porte = (x, s_) => {
          const b = boite3(7, 11.5, 0.6, MATS.laqueMur);
          b.position.set(x, 5.95, 0.5);
          g.add(b);
          const los = new T.Mesh(garder(new T.TorusGeometry(1.6, 0.14, 4, 4)), MATS.or);
          los.position.set(x, 6.6, 0.85);
          g.add(los);
          const poignee = boite3(0.3, 2.2, 0.3, MATS.or);
          poignee.position.set(x - s_ * 2.8, 6, 0.9);
          g.add(poignee);
        };
        porte(xp - 3.6, -1);
        porte(xp + 3.6, 1);
        const chambranle = boite3(16.4, 1, 1.2, MATS.or);
        chambranle.position.set(xp, 12.2, 0.5);
        g.add(chambranle);
        for (const s_ of [-1, 1]) {
          const m = boite3(1, 12.4, 1.2, MATS.or);
          m.position.set(xp + s_ * 7.7, 6, 0.5);
          g.add(m);
        }
        for (let i = 0; i <= 16; i++) ampoule(g, vec(xp - 8 + i, 12.9, 1), 0.24, 1.8, 1, i);
      }
      if (RIDEAUX.includes(k)) for (const s_ of [-1, 1]) {
        const r = rideau(9, S2.haut - 2, 6, 0.45);
        r.position.set(s_ * (L / 2 - 5.5), S2.haut / 2 - 1, 1.2);
        g.add(r);
      }
    }
    const texC = texCiel(), matCiel = scintillant(standard({ color: 1838400, roughness: 0.9, emissive: 16769712, emissiveMap: texC, emissiveIntensity: 1.6 }));
    texC.repeat.set(1 / 23, 1 / 23);
    const contour = new T.Shape(S2.coins.map(([s, t]) => {
      const p = ST(s, t);
      return new T.Vector2(p.x, p.z);
    }));
    const plafond = new T.Mesh(garder(new T.ShapeGeometry(contour)), matCiel);
    plafond.rotation.x = Math.PI / 2;
    plafond.position.y = S2.haut;
    plafond.userData.garder = true;
    decor.add(plafond);
    const dansSalle = (s, t, m = 2) => S2.coins.every(([s0, t0], k) => {
      const [s1, t1] = S2.coins[(k + 1) % NC], l = Math.hypot(s1 - s0, t1 - t0);
      return ((s - s0) * (t1 - t0) - (t - t0) * (s1 - s0)) / l >= m;
    });
    const LUSTRE = ST(...LUSTRE_ST, 29.5);
    const pasS = 2 * AP_OCT / 7, pasT = 2 * AP_OCT / 7;
    for (let i = 0; i <= 7; i++) for (let j = 0; j <= 7; j++) for (const sens of [0, 1]) {
      const s0 = OCT.c.x - AP_OCT + i * pasS, t0 = OCT.c.z - AP_OCT + j * pasT, s1 = s0 + (sens ? pasS : 0), t1 = t0 + (sens ? 0 : pasT), m = ST((s0 + s1) / 2, (t0 + t1) / 2, S2.haut - 0.9);
      if (!dansSalle(s0, t0, 1) || !dansSalle(s1, t1, 1) || Math.hypot(m.x - LUSTRE.x, m.z - LUSTRE.z) < 33) continue;
      const l = sens ? pasS : pasT, poutre = boite3(sens ? l + 1.4 : 1.4, 1.8, sens ? 1.4 : l + 1.4, MATS.orSatine);
      poutre.position.copy(m);
      poutre.rotation.y = CAP_C;
      decor.add(poutre);
      const filet = boite3(sens ? l : 0.3, 0.18, sens ? 0.3 : l, MATS.or);
      filet.position.copy(m).setY(S2.haut - 1.9);
      filet.rotation.y = CAP_C;
      decor.add(filet);
    }
    const texCo = texC.clone();
    texCo.repeat.set(10, 10);
    texCo.needsUpdate = true;
    garder(texCo);
    const coupole = new T.Mesh(garder(new T.SphereGeometry(30, 40, 12, 0, Math.PI * 2, 0, Math.PI / 2)), scintillant(standard({ color: 2363472, roughness: 0.85, emissive: 16769712, emissiveMap: texCo, emissiveIntensity: 1.6, side: T.BackSide })));
    coupole.position.set(LUSTRE.x, S2.haut - 1, LUSTRE.z);
    coupole.scale.y = 0.42;
    coupole.userData.garder = true;
    decor.add(coupole);
    for (let k = 0; k < 16; k++) {
      const a = k / 16 * Math.PI * 2, pts = Array.from({ length: 9 }, (_, j) => {
        const t = j / 8 * Math.PI / 2;
        return vec(LUSTRE.x + Math.cos(a) * Math.cos(t) * 29.5, S2.haut - 1 + Math.sin(t) * 29.5 * 0.42, LUSTRE.z + Math.sin(a) * Math.cos(t) * 29.5);
      });
      decor.add(boudin(pts, 0.3, MATS.orSatine));
    }
    const anneauC = new T.Mesh(garder(new T.TorusGeometry(30.5, 1, 8, 96)), MATS.or);
    anneauC.rotation.x = Math.PI / 2;
    anneauC.position.set(LUSTRE.x, S2.haut - 1.2, LUSTRE.z);
    decor.add(anneauC);
    for (let k = 0; k < 72; k++) {
      const a = k / 72 * Math.PI * 2;
      ampoule(decor, vec(LUSTRE.x + Math.cos(a) * 30.5, S2.haut - 2.3, LUSTRE.z + Math.sin(a) * 30.5), 0.3, 2.4, 1, k);
    }
    const lustre = new T.Group();
    lustre.position.copy(LUSTRE);
    decor.add(lustre);
    const N = 10, pt = (r, y, k) => {
      const a = k / N * Math.PI * 2;
      return vec(Math.cos(a) * r, y, Math.sin(a) * r);
    };
    const rampe = (pts, pas2 = 1.5) => {
      lustre.add(boudin(pts, 0.2, MATS.or));
      const courbe = new T.CatmullRomCurve3(pts, false, "catmullrom", 0.05), L = courbe.getLength();
      for (let d = pas2 / 2; d < L; d += pas2) ampoule(lustre, courbe.getPointAt(d / L).add(vec(0, -0.3, 0)), 0.24, 2.6, 2);
    };
    for (let k = 0; k < N; k++) {
      const h1 = pt(6, 5, k), h2 = pt(6, 5, k + 1), m1 = pt(22, 0, k), m2 = pt(22, 0, k + 1), v1 = pt(14, 2.5, k + 0.5);
      rampe([h1, h2], 1.3);
      rampe([h1, v1]);
      rampe([v1, h2]);
      rampe([v1, m1]);
      rampe([v1, m2]);
      rampe([m1, m2]);
      rampe([m1, pt(19, -5.5, k + 0.3), pt(19, -6.5, k + 0.5), pt(19, -5.5, k + 0.7), m2]);
    }
    const hTige = S2.haut - LUSTRE.y - 5, tige2 = new T.Mesh(garder(new T.CylinderGeometry(0.3, 0.3, hTige, 8)), MATS.or);
    tige2.position.y = 5 + hTige / 2;
    lustre.add(tige2);
    const coiffe = tourner_([[0, 0], [2.4, 0], [2, 0.8], [1, 1.5], [0.3, 1.8], [0, 1.8]], MATS.or, 24);
    coiffe.position.y = 4.2;
    lustre.add(coiffe);
    const goutte = tourner_([[0, 0], [0.8, 0.6], [1.1, 1.8], [0.6, 3], [0, 3.4]], MATS.or, 24);
    goutte.position.y = -4;
    lustre.add(goutte);
    for (let k = 0; k < N; k++) lustre.add(boudin([vec(0, 5, 0), pt(6, 5, k)], 0.12, MATS.or));
    decor.userData.lustre = lustre;
    const CR = 10.5, demi = demiLune(CR);
    const comptoir = new T.Group();
    comptoir.name = "comptoir";
    comptoir.position.copy(pres(0, 1.6));
    comptoir.rotation.y = CAP_C;
    decor.add(comptoir);
    const corps = extruder(demi, TABLE - 0.9, 0.3, MATS.laque);
    corps.position.y = 0.45;
    corps.scale.set(1, 1, -1);
    comptoir.add(corps);
    const socle = extruder(demi, 0.45, 0.15, MATS.or);
    socle.scale.set(0.96, 1, -0.96);
    comptoir.add(socle);
    for (const y of [1.6, TABLE - 1.2]) comptoir.add(boudin(Array.from({ length: 25 }, (_, k) => {
      const a = Math.PI * k / 24;
      return vec(-Math.cos(a) * (CR + 0.3), y, Math.sin(a) * (CR + 0.3));
    }), 0.14, MATS.or));
    for (let k = 1; k < 8; k++) {
      const a = Math.PI * k / 8, b = boite3(0.25, TABLE - 3.2, 0.25, MATS.or);
      b.position.set(-Math.cos(a) * (CR + 0.32), 1.6 + (TABLE - 2.8) / 2, Math.sin(a) * (CR + 0.32));
      b.rotation.y = -a + Math.PI / 2;
      comptoir.add(b);
    }
    const feutre = new T.Mesh(garder(new T.ShapeGeometry(demi, 32)), standard({ map: texFeutre(true), roughness: 0.95, envMapIntensity: 0.2 }));
    feutre.rotation.x = -Math.PI / 2;
    feutre.scale.set(1, -1, 1);
    feutre.position.y = TABLE;
    feutre.receiveShadow = true;
    feutre.userData.garder = true;
    comptoir.add(feutre);
    {
      const U = feutre.geometry.attributes.uv, Pp = feutre.geometry.attributes.position;
      for (let k = 0; k < U.count; k++) U.setXY(k, (Pp.getX(k) + CR) / (2 * CR), 1 - Pp.getY(k) / CR);
    }
    const rail = boudin(Array.from({ length: 33 }, (_, k) => {
      const a = Math.PI * k / 32;
      return vec(-Math.cos(a) * (CR - 0.2), TABLE + 0.25, Math.sin(a) * (CR - 0.2));
    }), 0.6, MATS.cuir, false, 12);
    comptoir.add(rail);
    for (const s of [-1, 1]) {
      const bout = new T.Mesh(garder(new T.SphereGeometry(0.6, 16, 10)), MATS.cuir);
      bout.position.set(s * (CR - 0.2), TABLE + 0.25, 0);
      comptoir.add(bout);
    }
    const geoJeton = garder(new T.CylinderGeometry(JETONS_COMPTOIR.r, JETONS_COMPTOIR.r, 0.13, 20));
    for (const [x, col, nb] of JETONS_COMPTOIR.piles) {
      const mat = physique({ color: col, roughness: 0.35, clearcoat: 0.6 });
      for (let k = 0; k < nb; k++) {
        const j = new T.Mesh(geoJeton, mat);
        j.position.set(x + k % 2 * 0.03, TABLE + 0.07 + k * 0.14, JETONS_COMPTOIR.z);
        j.rotation.y = k;
        comptoir.add(j);
      }
    }
    const ancreComptoir = new T.Group();
    ancreComptoir.name = "ancre du comptoir";
    ancreComptoir.position.set(0, TABLE - 5.05, 1.4);
    ancreComptoir.userData.croupier = vec(0, 0, -3);
    ancreComptoir.userData.gabarit = { camera: [[0, 14.5, 15.5], [0, 7, 0]] };
    comptoir.add(ancreComptoir);
    try {
      const p = window.__pcvCasinoJeux?.decorComptoir?.(T, ancreComptoir);
      p?.traverse((o) => {
        o.userData.garder = true;
      });
    } catch (e) {
      console.warn("casino : le paquet du comptoir", e);
    }
    {
      const o = pres(0, 5.5);
      ombre(o.x, o.z, 28, 17, 1).rotation.z = CAP_C;
    }
    const PK = POKER, poker = new T.Group();
    poker.name = "poker";
    poker.position.copy(PK.centre);
    poker.rotation.y = CAP_C;
    decor.add(poker);
    const tR = texRayures();
    tR.repeat.set(12, 1);
    const apron = new T.Mesh(garder(new T.CylinderGeometry(PK.rayon, PK.rayon - 0.6, 4.6, 8, 1, true)), physique({ map: tR, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.1, side: T.DoubleSide }));
    apron.position.y = 3.2;
    apron.rotation.y = Math.PI / 8;
    poker.add(apron);
    const pied = new T.Mesh(garder(new T.CylinderGeometry(PK.rayon - 2, PK.rayon - 1.4, 1, 8)), MATS.or);
    pied.position.y = 0.5;
    pied.rotation.y = Math.PI / 8;
    poker.add(pied);
    const dessus = new T.Mesh(garder(new T.CircleGeometry(PK.rayon - 0.3, 8)), standard({ map: texFeutre(false), roughness: 0.95, envMapIntensity: 0.2 }));
    dessus.rotation.set(-Math.PI / 2, 0, Math.PI / 8);
    dessus.position.y = 5.5;
    poker.add(dessus);
    const pts8 = Array.from({ length: 8 }, (_, k) => {
      const a = (k + 0.5) / 8 * Math.PI * 2;
      return vec(Math.cos(a) * (PK.rayon + 0.1), 5.75, Math.sin(a) * (PK.rayon + 0.1));
    });
    poker.add(boudin(pts8, 0.75, MATS.cuir, true, 12));
    for (const [x, z] of [...TABLE_MII.sieges, TABLE_MII.joueur]) {
      const t = tabouret(poker, x, z, Math.atan2(-x, -z), TABLE_MII.tabouret);
      const o = poker.localToWorld(vec(x, 0, z));
      ombre(o.x, o.z, 4.5, 4.5);
      if (x === TABLE_MII.joueur[0] && z === TABLE_MII.joueur[1]) poker.userData.siegeJoueur = t;
    }
    {
      const A_ = TABLE_MII.anneau, m = new T.Mesh(garder(new T.RingGeometry(A_.r * 0.78, A_.r, 48)), garder(new T.MeshBasicMaterial({ color: new T.Color(A_.couleur).multiplyScalar(2.2), transparent: true, opacity: 0.9, side: T.DoubleSide, depthWrite: false })));
      m.rotation.x = -Math.PI / 2;
      m.position.set(TABLE_MII.joueur[0], 0.06, TABLE_MII.joueur[1]);
      m.renderOrder = 5;
      m.visible = false;
      m.userData.garder = true;
      m.name = "anneau du joueur";
      poker.add(m);
      decor.userData.anneauJoueur = m;
    }
    const BORD_PK = (PK.rayon + 0.1) * Math.cos(Math.PI / 8) + 0.75, ancreCartes = new T.Group();
    ancreCartes.name = "ancre des cartes";
    ancreCartes.position.set(0, 5.53 - 5.05, -(BORD_PK + 1.4) + 3);
    ancreCartes.userData.croupier = vec(0, 0, -3);
    poker.add(ancreCartes);
    ancreCartes.userData.gabarit = { camera: [[0, 14.5, 15.5], [0, 7, 0]] };
    const ancreTable = new T.Group();
    ancreTable.name = "ancre de la grande table";
    ancreTable.position.set(0, 5.53 - 5.05, 0);
    poker.add(ancreTable);
    ancreTable.userData.croupier = vec(0, 0, ancreCartes.position.z + ancreCartes.userData.croupier.z);
    ancreTable.userData.siege = poker.userData.siegeJoueur;
    poker.updateMatrixWorld(true);
    ancreTable.userData.gabarit = { camera: [ancreTable.worldToLocal(TABLE_MII.jeu.pos.clone()).toArray(), ancreTable.worldToLocal(TABLE_MII.jeu.cible.clone()).toArray()] };
    ombre(PK.centre.x, PK.centre.z, 38, 38);
    {
      let kb = 0;
      for (const k of PANS_BORNES) {
        const pan = pans[k], m = boite3(pan.L - 1, 0.6, 1.1, MATS.or);
        m.position.set(0, 16.6, 0.6);
        pan.g.add(m);
        const n_ = Math.round(pan.L / 1.9);
        for (let i = 0; i <= n_; i++) ampoule(pan.g, vec(-pan.L / 2 + 0.5 + i * (pan.L - 1) / n_, 17.3, 1), 0.28, 2.2, 1, kb++);
      }
    }
    {
      const E2 = ESTRADE_B, { ext, int } = contourEstrade(), f = new T.Shape([...ext, ...int.slice().reverse()].map((p) => new T.Vector2(p.x, -p.z)));
      const corps2 = extruder(f, E2.h - 0.1, 0.05, MATS.laqueSombre);
      corps2.name = "estrade des bornes";
      decor.add(corps2);
      const mqE = mq.t.clone();
      mqE.needsUpdate = true;
      garder(mqE);
      const dessusE = new T.Mesh(garder(new T.ShapeGeometry(f)), standard({ map: mqE, roughness: 0.86 }));
      dessusE.rotation.x = -Math.PI / 2;
      dessusE.position.y = E2.h + 0.01;
      dessusE.receiveShadow = true;
      decor.add(dessusE);
      decor.add(boudin(int.map((p) => p.clone().setY(E2.h)), 0.16, MATS.or));
      let kb = 0;
      for (let k = 0; k < int.length - 1; k++) {
        const a = int[k], b = int[k + 1], n_ = Math.round(a.distanceTo(b) / 2.4);
        for (let i = 0; i < n_; i++) ampoule(decor, a.clone().lerp(b, (i + 0.5) / n_).setY(E2.h * 0.45), 0.16, 1.2, 1, kb++);
      }
    }
    const ens = new T.Group();
    ens.position.copy(pans[0].g.localToWorld(vec(0, 27, 1.2)));
    ens.rotation.y = pans[0].g.rotation.y;
    decor.add(ens);
    const disque2 = new T.Mesh(garder(new T.CylinderGeometry(5.2, 5.2, 0.8, 48)), MATS.laque);
    disque2.rotation.x = Math.PI / 2;
    ens.add(disque2);
    const [ce, xe] = toile(256, 256);
    xe.fillStyle = "#f6f2e6";
    xe.beginPath();
    xe.arc(128, 128, 120, 0, Math.PI * 2);
    xe.fill();
    xe.fillStyle = "#1f8a3a";
    xe.font = "900 190px Nunito, sans-serif";
    xe.textAlign = "center";
    xe.textBaseline = "middle";
    xe.fillText("L", 128, 140);
    const tE = texture(ce, { bord: true, flipY: true }), face = new T.Mesh(garder(new T.CircleGeometry(3.8, 48)), standard({ map: tE, roughness: 0.35, emissive: 16777215, emissiveMap: tE, emissiveIntensity: 0.7 }));
    face.position.z = 0.45;
    ens.add(face);
    const cercle = new T.Mesh(garder(new T.TorusGeometry(4.6, 0.35, 10, 64)), MATS.or);
    cercle.position.z = 0.4;
    ens.add(cercle);
    for (let k = 0; k < 24; k++) {
      const a = k / 24 * Math.PI * 2;
      ampoule(ens, vec(Math.cos(a) * 4.6, Math.sin(a) * 4.6, 0.8), 0.3, 2.4, 1, k);
    }
    const [ct, xt] = toile(128, 512);
    xt.fillStyle = "#6e0c14";
    xt.fillRect(0, 0, 128, 512);
    xt.fillStyle = "#d9a948";
    xt.fillRect(8, 0, 6, 512);
    xt.fillRect(114, 0, 6, 512);
    xt.fillStyle = "rgba(240,190,90,.35)";
    for (let k = 0; k < 512; k += 64) {
      xt.save();
      xt.translate(64, k + 32);
      xt.rotate(Math.PI / 4);
      xt.fillRect(-14, -14, 28, 28);
      xt.restore();
    }
    const tt = texture(ct);
    tt.repeat.set(1, 4);
    const tapis = new T.Mesh(garder(new T.PlaneGeometry(13, 60)), standard({ map: tt, roughness: 0.9, bumpMap: mq.b, bumpScale: 0.6 }));
    tapis.rotation.set(-Math.PI / 2, 0, CAP_C);
    tapis.position.copy(ST(PORTES.s, 54, 0.04));
    decor.add(tapis);
    const poteau = (x, z) => {
      const g = new T.Group();
      g.position.set(x, 0, z);
      decor.add(g);
      g.add(tourner_([[0, 0], [0.95, 0], [0.9, 0.2], [0.3, 0.35], [0.2, 0.6], [0.2, 3.5], [0.32, 3.6], [0.42, 3.9], [0.3, 4.25], [0, 4.3]], MATS.or, 20));
      ombre(x, z, 2.6, 2.6);
      return vec(x, 3.5, z);
    };
    for (const s_ of [-1, 1]) {
      const tetes = [78, 64, 50, 36].map((t) => {
        const p = ST(PORTES.s + s_ * 8.5, t);
        return poteau(p.x, p.z);
      });
      for (let k = 0; k < tetes.length - 1; k++) {
        const a = tetes[k], b = tetes[k + 1], m = a.clone().lerp(b, 0.5).add(vec(0, -1.1, 0));
        decor.add(boudin([a, a.clone().lerp(m, 0.5).add(vec(0, -0.4, 0)), m, b.clone().lerp(m, 0.5).add(vec(0, -0.4, 0)), b], 0.16, MATS.velours));
      }
    }
    const fut = garder(new T.CylinderGeometry(1.7, 1.7, S2.haut, 72, 1, true));
    {
      const Pp = fut.attributes.position;
      for (let k = 0; k < Pp.count; k++) {
        const x = Pp.getX(k), z = Pp.getZ(k), a = Math.atan2(z, x), r = 1.62 + 0.1 * Math.abs(Math.cos(a * 12));
        Pp.setX(k, Math.cos(a) * r);
        Pp.setZ(k, Math.sin(a) * r);
      }
      fut.computeVertexNormals();
    }
    const colonne = (x, z) => {
      const g = new T.Group();
      g.position.set(x, 0, z);
      decor.add(g);
      const f = new T.Mesh(fut, MATS.laqueMur);
      f.position.y = S2.haut / 2;
      g.add(f);
      g.add(tourner_([[0, 0], [2.5, 0], [2.5, 0.7], [2.1, 0.9], [2.1, 1.4], [1.8, 1.6], [0, 1.6]], MATS.or, 32));
      for (const y of [9.1, 20]) {
        const b = new T.Mesh(garder(new T.TorusGeometry(1.82, 0.22, 8, 40)), MATS.or);
        b.rotation.x = Math.PI / 2;
        b.position.y = y;
        g.add(b);
      }
      const chap = tourner_([[0, 0], [1.8, 0], [2.1, 0.6], [2.6, 1.6], [2.9, 2], [2.9, 2.6], [0, 2.6]], MATS.or, 32);
      chap.position.y = S2.haut - 8.2;
      g.add(chap);
      ombre(x, z, 9, 9);
    };
    for (const [s_, t] of [[26, 52], [34, 66]]) {
      const p = ST(s_, t);
      colonne(p.x, p.z);
    }
    construireGuichet();
    for (const [s_, t] of [[-13, 36], [13, 36], [46, -2], [70, 47]]) {
      const p = ST(s_, t);
      plante(p.x, p.z, 0.9);
    }
    const ESTRADE = ST(52, 32), est = new T.Group();
    est.name = "roulette";
    est.position.copy(ESTRADE);
    est.rotation.y = CAP_C;
    est.scale.setScalar(0.85);
    decor.add(est);
    [[15, 0.7], [13.4, 1.4]].forEach(([r, h]) => {
      const m = extruder(polygone(8, r, Math.PI / 8), h - 0.3, 0.15, MATS.laqueSombre);
      est.add(m);
      const dessusM = new T.Mesh(garder(new T.ShapeGeometry(polygone(8, r - 0.35, Math.PI / 8))), sol.material);
      dessusM.rotation.x = -Math.PI / 2;
      dessusM.position.y = h - 0.13;
      est.add(dessusM);
      const n_ = new T.Mesh(garder(new T.TorusGeometry(r * Math.cos(Math.PI / 8) + 0.1, 0.12, 6, 8)), MATS.or);
      n_.rotation.set(Math.PI / 2, 0, Math.PI / 8);
      n_.position.y = h;
      est.add(n_);
    });
    for (let k = 0; k < 40; k++) {
      const a = k / 40 * Math.PI * 2, rr = 15.2 * Math.cos(Math.PI / 8) / Math.cos(((a - Math.PI / 8) % (Math.PI / 4) + Math.PI / 4) % (Math.PI / 4) - Math.PI / 8);
      ampoule(est, vec(Math.cos(a) * rr, 0.35, Math.sin(a) * rr), 0.22, 1.6, 1, k);
    }
    const tableR = new T.Group();
    tableR.position.y = 1.4;
    tableR.rotation.y = -0.6;
    est.add(tableR);
    const plateau2 = boite3(13, 0.6, 6.5, MATS.cuir);
    plateau2.position.y = 4.6;
    tableR.add(plateau2);
    const tapisR = new T.Mesh(garder(new T.PlaneGeometry(12, 5.6)), standard({ map: texFeutre(false), roughness: 0.95 }));
    tapisR.rotation.x = -Math.PI / 2;
    tapisR.position.y = 4.92;
    tapisR.name = "tapis de mise";
    tapisR.userData.garder = true;
    tableR.add(tapisR);
    tableR.userData.croupier = vec(-1.5, 0, -6.4);
    tableR.userData.gabarit = { camera: [[-0.5, 15, 15.5], [-0.5, 7, -2]] };
    decor.userData.estradeRoulette = { c: ESTRADE.clone(), marches: [[15, 0.7], [13.4, 1.4]].map(([r_, h]) => [r_ * Math.cos(Math.PI / 8) * 0.85, (h - 0.13) * 0.85]) };
    const tRR = tR.clone();
    tRR.repeat.set(5, 1);
    tRR.needsUpdate = true;
    garder(tRR);
    const pietR = boite3(11, 4.3, 5, physique({ map: tRR, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.1 }));
    pietR.position.y = 2.2;
    tableR.add(pietR);
    const [cr, xr] = toile(512, 512);
    xr.translate(256, 256);
    for (let k = 0; k < 37; k++) {
      xr.fillStyle = k === 0 ? "#127a3a" : k % 2 ? "#b8141c" : "#16161c";
      xr.beginPath();
      xr.moveTo(0, 0);
      xr.arc(0, 0, 250, k / 37 * Math.PI * 2, (k + 1) / 37 * Math.PI * 2);
      xr.closePath();
      xr.fill();
    }
    xr.fillStyle = "#6b3418";
    xr.beginPath();
    xr.arc(0, 0, 150, 0, Math.PI * 2);
    xr.fill();
    xr.strokeStyle = "#e7b54a";
    xr.lineWidth = 8;
    for (const r of [150, 250]) {
      xr.beginPath();
      xr.arc(0, 0, r, 0, Math.PI * 2);
      xr.stroke();
    }
    const roue = new T.Mesh(garder(new T.CylinderGeometry(2.6, 2.6, 0.5, 48)), [MATS.orSatine, physique({ map: texture(cr, { bord: true }), roughness: 0.3, clearcoat: 1 }), MATS.orSatine]);
    roue.position.set(-3.8, 5.1, 0);
    roue.userData.garder = true;
    roue.name = "roue";
    tableR.add(roue);
    decor.userData.roue = roue;
    const bol = new T.Mesh(garder(new T.TorusGeometry(2.75, 0.3, 10, 48)), MATS.cuir);
    bol.rotation.x = Math.PI / 2;
    bol.position.set(-3.8, 5.25, 0);
    tableR.add(bol);
    const tourelle = new T.Mesh(garder(new T.ConeGeometry(0.5, 1.4, 16)), MATS.or);
    tourelle.position.set(-3.8, 6, 0);
    tableR.add(tourelle);
    for (let k = 0; k < 4; k++) {
      const b = boite3(1.8, 0.12, 0.12, MATS.or);
      b.position.set(-3.8, 6.3, 0);
      b.rotation.y = k * Math.PI / 4;
      tableR.add(b);
    }
    ombre(ESTRADE.x, ESTRADE.z, 31, 31);
    const [cs, xs] = toile(128, 640), symboles = ["star", "L", "\u2666", "champi", "\u2663"];
    xs.fillStyle = "#f6f0e2";
    xs.fillRect(0, 0, 128, 640);
    symboles.forEach((sym, k) => {
      const cy = k * 128 + 64;
      xs.save();
      xs.translate(64, cy);
      if (sym === "star") {
        xs.fillStyle = "#e9a91c";
        etoile(xs, 0, 0, 44);
        xs.fillStyle = "#ffd75a";
        etoile(xs, -3, -4, 26);
      } else if (sym === "L") {
        xs.fillStyle = "#1f8a3a";
        xs.beginPath();
        xs.arc(0, 0, 44, 0, Math.PI * 2);
        xs.fill();
        xs.fillStyle = "#fff";
        xs.font = "900 64px Nunito, sans-serif";
        xs.textAlign = "center";
        xs.textBaseline = "middle";
        xs.fillText("L", 0, 4);
      } else if (sym === "champi") {
        xs.fillStyle = "#d02020";
        xs.beginPath();
        xs.arc(0, 4, 42, Math.PI, 0);
        xs.fill();
        xs.fillStyle = "#fff";
        for (const [a, b, r] of [[-20, -14, 10], [18, -16, 9], [0, -30, 8]]) {
          xs.beginPath();
          xs.arc(a, b, r, 0, Math.PI * 2);
          xs.fill();
        }
        xs.fillStyle = "#f4e2c0";
        xs.fillRect(-22, 4, 44, 30);
        xs.fillStyle = "#222";
        xs.fillRect(-10, 12, 5, 12);
        xs.fillRect(6, 12, 5, 12);
      } else {
        xs.font = "900 96px 'DejaVu Sans', sans-serif";
        xs.textAlign = "center";
        xs.textBaseline = "middle";
        xs.fillStyle = sym === "\u2666" ? "#c81e1e" : "#16161c";
        xs.fillText(sym, 0, 6);
      }
      xs.restore();
      xs.fillStyle = "rgba(0,0,0,.08)";
      xs.fillRect(0, k * 128, 128, 3);
    });
    const texRouleau = texture(cs);
    texRouleau.repeat.set(1, 0.6);
    const matRouleau = standard({ map: texRouleau, roughness: 0.45, emissive: 16777215, emissiveMap: texRouleau, emissiveIntensity: 0.55 });
    matRouleau.onBeforeCompile = (sh) => {
      sh.vertexShader = "attribute float aDecalage;\n" + sh.vertexShader.replace("#include <uv_vertex>", "#include <uv_vertex>\n vMapUv.y += aDecalage; vEmissiveMapUv.y += aDecalage;");
    };
    matRouleau.customProgramCacheKey = () => "pcv-rouleau";
    const geoRouleau = garder(new T.CylinderGeometry(1.05, 1.05, 1.1, 20, 1, true));
    geoRouleau.rotateZ(Math.PI / 2);
    {
      const U = geoRouleau.attributes.uv;
      for (let i = 0; i < U.count; i++) U.setXY(i, 1 - U.getY(i), 1 - U.getX(i));
    }
    kits.rouleaux = { geo: geoRouleau, mat: matRouleau, liste: [], attributs: { aDecalage: 1 } };
    const rouleaux = decor.userData.rouleaux = [];
    const matEcran = standard({ color: 658456, roughness: 0.2, emissive: 2788607, emissiveIntensity: 1.4 });
    const matVitreM = physique({ color: 10471679, roughness: 0.05, transparent: true, opacity: 0.14, clearcoat: 1, depthWrite: false });
    const matBoutons = [16726832, 16763930, 3461208].map((c) => standard({ color: 1118481, emissive: c, emissiveIntensity: 2.2, roughness: 0.3 }));
    const [cb, xb] = toile(256, 256);
    {
      const g = xb.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, "#ff5a3c");
      g.addColorStop(0.5, "#c8102e");
      g.addColorStop(1, "#5a0414");
      xb.fillStyle = g;
      xb.fillRect(0, 0, 256, 256);
      xb.fillStyle = "rgba(255,230,140,.95)";
      etoile(xb, 128, 120, 70);
      xb.fillStyle = "#1f8a3a";
      xb.font = "900 72px Nunito, sans-serif";
      xb.textAlign = "center";
      xb.textBaseline = "middle";
      xb.fillText("L", 128, 126);
    }
    const tVentre = texture(cb, { bord: true, flipY: true }), matVentre = standard({ map: tVentre, emissive: 16777215, emissiveMap: tVentre, emissiveIntensity: 0.9, roughness: 0.15 });
    const machineASous = (x, z, rot, num) => {
      const g = new T.Group();
      g.name = "machine \xE0 sous";
      g.position.set(x, 0, z);
      g.rotation.y = rot;
      decor.add(g);
      const plinthe = boite3(5.4, 1.1, 4.6, MATS.noirLaque);
      plinthe.position.y = 0.55;
      g.add(plinthe);
      const bas = boite3(5, 4.4, 4.2, MATS.noirLaque);
      bas.position.set(0, 3.3, 0);
      g.add(bas);
      const ventre = new T.Mesh(garder(new T.PlaneGeometry(3.8, 2.8)), matVentre);
      ventre.position.set(0, 3.3, 2.11);
      g.add(ventre);
      const pup = boite3(5.2, 0.5, 2.2, MATS.noirLaque);
      pup.position.set(0, 5.75, 1.6);
      pup.rotation.x = 0.32;
      g.add(pup);
      const bordP = boite3(5.3, 0.14, 0.14, MATS.chrome);
      bordP.position.set(0, 5.6, 2.72);
      g.add(bordP);
      matBoutons.forEach((m, k) => {
        const b = new T.Mesh(garder(new T.CylinderGeometry(0.32, 0.36, 0.22, 16)), m);
        b.position.set(-1.4 + k * 1.4, 6.05, 1.75);
        b.rotation.x = 0.32;
        g.add(b);
      });
      const haut = boite3(5, 5.4, 3.6, MATS.noirLaque);
      haut.position.set(0, 8.7, -0.3);
      g.add(haut);
      const fondE = new T.Mesh(garder(new T.PlaneGeometry(4.2, 2.6)), matEcran);
      fondE.position.set(0, 8.4, 1.53);
      g.add(fondE);
      for (let r = 0; r < 3; r++) {
        instance("rouleaux", g, vec(-1.3 + r * 1.3, 8.4, 1.05), null, null);
        rouleaux.push({ i: rouleaux.length, v: 0, decal: Math.random(), phase: Math.random() * 6, k: r });
      }
      const vitre = new T.Mesh(garder(new T.PlaneGeometry(4.2, 2.6)), matVitreM);
      vitre.position.set(0, 8.4, 2.3);
      vitre.renderOrder = 5;
      g.add(vitre);
      for (const [l, h, px, py] of [[4.6, 0.3, 0, 9.85], [4.6, 0.3, 0, 6.95], [0.3, 3.2, -2.25, 8.4], [0.3, 3.2, 2.25, 8.4]]) {
        const b = boite3(l, h, 0.9, MATS.chrome);
        b.position.set(px, py, 1.9);
        g.add(b);
      }
      const ligne = boite3(4.2, 0.06, 0.06, matBoutons[0]);
      ligne.position.set(0, 8.4, 2.33);
      g.add(ligne);
      for (const s of [-1, 1]) {
        const l1 = boite3(0.18, 10.6, 0.18, MATS.chrome);
        l1.position.set(s * 2.52, 5.9, 2.12);
        g.add(l1);
      }
      const front = new T.Mesh(garder(new T.CylinderGeometry(2.5, 2.5, 3, 32, 1, false, -Math.PI / 2, Math.PI)), MATS.laque);
      front.rotation.x = -Math.PI / 2;
      front.position.set(0, 11.4, -0.3);
      g.add(front);
      const jante = new T.Mesh(garder(new T.TorusGeometry(2.55, 0.14, 6, 32, Math.PI)), MATS.chrome);
      jante.position.set(0, 11.4, 1.25);
      g.add(jante);
      for (let k = 0; k <= 10; k++) {
        const a = Math.PI * k / 10;
        ampoule(g, vec(Math.cos(a) * 2.2, 11.4 + Math.sin(a) * 2.2, 1.3), 0.2, 1.6, 1, k + num * 3);
      }
      const axe = new T.Mesh(garder(new T.CylinderGeometry(0.42, 0.42, 0.5, 16)), MATS.chrome);
      axe.rotation.z = Math.PI / 2;
      axe.position.set(2.75, 7.2, 0.4);
      g.add(axe);
      const levier = new T.Mesh(garder(new T.CylinderGeometry(0.13, 0.13, 3.6, 8)), MATS.chrome);
      levier.position.set(2.95, 8.9, 0.4);
      levier.rotation.z = -0.08;
      g.add(levier);
      const boule = new T.Mesh(garder(new T.SphereGeometry(0.5, 16, 12)), physique({ color: 13636636, roughness: 0.15, clearcoat: 1 }));
      boule.position.set(3.1, 10.7, 0.4);
      g.add(boule);
      g.userData.siege = tabouret(g, 0, 5.4, 0, 4.4);
      const p = g.localToWorld(vec(0, 0, 5.4)), q = g.localToWorld(vec(0, 0, 1));
      ombre(q.x, q.z, 7.5, 7).rotation.z = rot;
      ombre(p.x, p.z, 4, 4);
      return g;
    };
    const placeSlot = (k, d = 0) => ST(SLOTS.s0 + k * SLOTS.pas, SLOTS.t + d);
    const machinesASous = Array.from({ length: SLOTS.n }, (_, k) => {
      const p = placeSlot(k);
      return machineASous(p.x, p.z, CAP(0, 1), k);
    });
    const ancreMachine = machinesASous[SLOTS.jeu];
    ancreMachine.userData.rouleaux = [0, 1, 2].map((r) => ({ mesh: rouleauMasquable(SLOTS.jeu * 3 + r, vec(-1.3 + r * 1.3, 8.4, 1.05)) }));
    ancreMachine.userData.gabarit = {
      R: 1.05,
      large: 1.1,
      y: 8.4,
      afficheur: [0, 10.72, 1.53],
      plaque: [0, 3.3, 2.14],
      bouton: [2.1, 5.78, 2.2],
      camera: [[0, 9.6, 14], [0, 6.9, 1.8]]
    };
    ancreMachine.userData.siege.traverse((o) => {
      o.userData.garder = true;
    });
    decor.userData.ancres = { cartes: ancreCartes, roulette: tableR, machines: ancreMachine, comptoir: ancreComptoir, table: ancreTable };
    const ensS = new T.Group();
    ensS.position.copy(ST(SLOTS.s0 + (SLOTS.n - 1) * SLOTS.pas / 2, OCT.c.z - AP_OCT + 1.3, 23.5));
    ensS.rotation.y = CAP(0, 1);
    decor.add(ensS);
    const ovale = (rx, ry) => {
      const sh = new T.Shape();
      sh.absellipse(0, 0, rx, ry, 0, Math.PI * 2, false, 0);
      return sh;
    };
    const anneauS = extruder(ovale(14, 6.2), 0.9, 0.3, MATS.laque);
    anneauS.rotation.x = Math.PI / 2;
    anneauS.position.z = -1.1;
    ensS.add(anneauS);
    const [cS, xS] = toile(1024, 448);
    {
      const g = xS.createRadialGradient(512, 200, 40, 512, 224, 560);
      g.addColorStop(0, "#fffaf0");
      g.addColorStop(1, "#e9dcc4");
      xS.fillStyle = g;
      xS.fillRect(0, 0, 1024, 448);
      xS.font = "900 230px Nunito, sans-serif";
      xS.textAlign = "center";
      xS.textBaseline = "middle";
      xS.lineJoin = "round";
      xS.lineWidth = 30;
      xS.strokeStyle = "#7a2a06";
      xS.strokeText("SLOTS", 512, 236);
      const gl2 = xS.createLinearGradient(0, 120, 0, 340);
      gl2.addColorStop(0, "#ffe680");
      gl2.addColorStop(0.5, "#f2a81e");
      gl2.addColorStop(1, "#c86a08");
      xS.fillStyle = gl2;
      xS.fillText("SLOTS", 512, 230);
      xS.fillStyle = "rgba(255,255,230,.55)";
      xS.font = "900 230px Nunito, sans-serif";
      xS.save();
      xS.beginPath();
      xS.rect(0, 0, 1024, 190);
      xS.clip();
      xS.fillText("SLOTS", 509, 226);
      xS.restore();
    }
    const tS = texture(cS, { bord: true, flipY: true }), faceS = new T.Mesh(garder(new T.ShapeGeometry(ovale(12.6, 5.1), 48)), standard({ map: tS, roughness: 0.3, emissive: 16777215, emissiveMap: tS, emissiveIntensity: 0.75 }));
    {
      const U = faceS.geometry.attributes.uv, Pp = faceS.geometry.attributes.position;
      for (let k = 0; k < U.count; k++) U.setXY(k, (Pp.getX(k) + 12.6) / 25.2, (Pp.getY(k) + 5.1) / 10.2);
    }
    faceS.position.z = 0.5;
    ensS.add(faceS);
    const lisereS = new T.Mesh(garder(new T.TorusGeometry(1, 0.06, 6, 96)), MATS.or);
    lisereS.scale.set(12.9, 5.4, 4);
    lisereS.position.z = 0.55;
    ensS.add(lisereS);
    for (let k = 0; k < 44; k++) {
      const a = k / 44 * Math.PI * 2;
      ampoule(ensS, vec(Math.cos(a) * 13.3, Math.sin(a) * 5.65, 0.8), 0.32, 2.4, 1, k);
    }
    for (const x of [-8, 8]) {
      const tg = new T.Mesh(garder(new T.CylinderGeometry(0.15, 0.15, S2.haut - 28, 6)), MATS.or);
      tg.position.set(x, 4 + (S2.haut - 28) / 2, -0.6);
      ensS.add(tg);
    }
    const [cj, xj] = toile(256, 64);
    xj.fillStyle = "#c65a2c";
    xj.fillRect(0, 0, 256, 64);
    xj.fillStyle = "#8a1a10";
    for (let k = 0; k < 8; k++) {
      xj.beginPath();
      xj.moveTo(16 + k * 32, 12);
      xj.lineTo(25 + k * 32, 32);
      xj.lineTo(16 + k * 32, 52);
      xj.lineTo(7 + k * 32, 32);
      xj.fill();
    }
    xj.fillStyle = "rgba(255,220,180,.25)";
    xj.fillRect(0, 4, 256, 3);
    xj.fillRect(0, 57, 256, 3);
    const matJ = physique({ map: texture(cj), roughness: 0.5, clearcoat: 0.5, clearcoatRoughness: 0.3 });
    const jardiniere = (x, z, l, rot) => {
      const g = new T.Group();
      g.position.set(x, 0, z);
      g.rotation.y = rot;
      decor.add(g);
      const bac = boite3(l, 3.2, 3.6, matJ);
      bac.position.y = 1.9;
      g.add(bac);
      const pied_ = boite3(l - 0.6, 0.3, 3.2, MATS.laqueSombre);
      pied_.position.y = 0.15;
      g.add(pied_);
      const levre = boite3(l + 0.5, 0.4, 4.1, MATS.or);
      levre.position.y = 3.5;
      g.add(levre);
      const r = graine("jard" + x);
      for (let k = 0; k < Math.round(l / 2.6); k++) touffe(g, vec(-l / 2 + 1.3 + k * (l - 2.6) / Math.max(1, Math.round(l / 2.6) - 1), 3.4, (r() - 0.5) * 1.2), 9, 5.2, r, [0.15, 0.95]);
      ombre(x, z, l + 3, 7).rotation.z = rot;
    };
    {
      const p = ST(24, OCT.c.z + AP_OCT - 0.3 - 0.45 - 1.8);
      jardiniere(p.x, p.z, 12, CAP(0, -1));
    }
    {
      const m = vec(OCT.c.x + (AP_OCT + DEMI_OCT) / 2, 0, OCT.c.z - (AP_OCT + DEMI_OCT) / 2).add(vec(-1, 0, 1).normalize().multiplyScalar(2.6));
      jardiniere(m.x, m.z, 16, CAP(-1, 1));
    }
    const SCENE = vec(OCT.c.x + (AP_OCT + DEMI_OCT) / 2, 0, OCT.c.z + (AP_OCT + DEMI_OCT) / 2).add(vec(-1, 0, -1).normalize().multiplyScalar(1.4)), scene_ = new T.Group();
    scene_.name = "sc\xE8ne";
    scene_.position.copy(SCENE);
    scene_.rotation.y = CAP(-1, -1);
    scene_.scale.setScalar(0.9);
    decor.add(scene_);
    [[15, 0.8], [12.5, 1.6]].forEach(([r, h]) => {
      const m = extruder(demiLune(r), h - 0.2, 0.1, MATS.laqueSombre);
      m.scale.z = -1;
      scene_.add(m);
      scene_.add(boudin(Array.from({ length: 25 }, (_, k) => {
        const a = Math.PI * k / 24;
        return vec(-Math.cos(a) * r, h, Math.sin(a) * r);
      }), 0.12, MATS.or));
    });
    const fondS = rideau(30, 22);
    fondS.position.set(0, 11, -1.5);
    scene_.add(fondS);
    for (const s_ of [-1, 1]) {
      const r = rideau(7, 22, 5, 0.4);
      r.position.set(s_ * 13, 11, 1);
      scene_.add(r);
      const emb = new T.Mesh(garder(new T.TorusGeometry(0.9, 0.2, 8, 16)), MATS.or);
      emb.position.set(s_ * 13, 8.4, 1.8);
      scene_.add(emb);
    }
    const lambrequin = rideau(31, 3.5, 20);
    lambrequin.position.set(0, 21, 1.4);
    scene_.add(lambrequin);
    const frise = boite3(32, 0.6, 0.6, MATS.or);
    frise.position.set(0, 22.9, 1.4);
    scene_.add(frise);
    for (let k = 0; k <= 24; k++) ampoule(scene_, vec(-15 + k * 30 / 24, 23.5, 1.6), 0.26, 2, 3, k);
    const micro = new T.Group();
    micro.position.set(0, 1.6, 6);
    scene_.add(micro);
    micro.add(tourner_([[0, 0], [1, 0], [0.9, 0.15], [0.12, 0.3], [0.1, 5.2], [0, 5.2]], MATS.or, 16));
    const tm_ = new T.Mesh(garder(new T.SphereGeometry(0.35, 12, 8)), MATS.noir);
    tm_.position.y = 5.4;
    micro.add(tm_);
    for (let k = 0; k < 9; k++) {
      const a = Math.PI * (k + 0.5) / 9;
      ampoule(scene_, vec(-Math.cos(a) * 15.2, 0.9, Math.sin(a) * 15.2), 0.28, 2.2, 3, k);
    }
    ombre(SCENE.x, SCENE.z, 34, 34);
    const T3 = (p) => p.toArray().map((v) => +v.toFixed(2)), C3 = (s_, t, y = 0) => T3(ST(s_, t, y));
    decor.userData.places = [
      ...Array.from({ length: SLOTS.n }, (_, k) => ({ type: "assis", lieu: "machines \xE0 sous", pos: T3(placeSlot(k, 5.4).setY(5.3)), regard: T3(placeSlot(k).setY(8.4)), gestes: ["jouer", "gagner", "attendre"] })),
      ...TABLE_MII.sieges.map(([x, z]) => ({ type: "assis", lieu: "cartes", pos: T3(poker.localToWorld(vec(x, 5.1, z))), regard: T3(POKER.centre.clone().setY(5.5)), gestes: ["cartes", "attendre", "gagner"] })),
      ...[-1, 0, 1].map((k) => ({ type: "debout", lieu: "roulette", pos: C3(38 + k * 4, 46 + k * 3, 0), regard: T3(ESTRADE.clone().setY(6)), gestes: ["miser", "applaudir", "attendre"] })),
      { type: "debout", lieu: "sc\xE8ne", pos: T3(scene_.localToWorld(vec(-3, 1.6, 3))), regard: C3(0, 40, 8), gestes: ["chanter", "saluer"] },
      ...[0, 1, 2].map((k) => ({ type: "debout", lieu: "bo\xEEte \xE0 badges", pos: C3(66, 4 + k * 12), regard: C3(76, 4 + k * 12, 6), gestes: ["regarder", "attendre"] }))
    ];
    decor.userData.chemins = [
      [[0, 80], [0, 36], [14, 26], [26, 44], [16, 74], [6, 80], [0, 80]].map(([a, b]) => C3(a, b)),
      [[-12, 72], [-14, 40], [-26, 22], [-32, 0], [-18, -12], [-14, -36], [-30, -30], [-40, 10], [-38, 44], [-12, 72]].map(([a, b]) => C3(a, b)),
      [[24, 80], [34, 54], [64, 50], [68, 4], [52, -36], [8, -38], [-4, -26], [12, 0], [40, 12], [24, 80]].map(([a, b]) => C3(a, b))
    ];
    const [cl, xl] = toile(128, 128), gl = xl.createRadialGradient(64, 64, 0, 64, 64, 64);
    gl.addColorStop(0, "rgba(255,180,100,.30)");
    gl.addColorStop(0.6, "rgba(255,140,60,.08)");
    gl.addColorStop(1, "rgba(255,140,60,0)");
    xl.fillStyle = gl;
    xl.fillRect(0, 0, 128, 128);
    const matFlaque = garder(new T.MeshBasicMaterial({ map: texture(cl, { bord: true }), transparent: true, depthWrite: false, blending: T.AdditiveBlending }));
    const flaque = (x, z, r) => {
      const m = new T.Mesh(garder(new T.PlaneGeometry(r, r)), matFlaque);
      m.rotation.x = -Math.PI / 2;
      m.position.set(x, 0.05, z);
      m.renderOrder = 2;
      decor.add(m);
    };
    for (const d of RANGEE_B) {
      const L_ = surLigne(d), p = L_.p.clone().addScaledVector(L_.n, 16);
      flaque(p.x, p.z, 20);
    }
    for (const pan of pans) for (const ax of pan.appliques) {
      const p = pan.g.localToWorld(vec(ax, 0, 6));
      flaque(p.x, p.z, 16);
    }
    {
      const p = ST(12, -40);
      flaque(p.x, p.z, 56);
      const q = ST(PORTES.s, 76);
      flaque(q.x, q.z, 40);
    }
  };
  const fusionner = (groupe) => {
    if (!E.mergeGeometries) return;
    groupe.updateMatrixWorld(true);
    const inv = groupe.matrixWorld.clone().invert(), parMat = /* @__PURE__ */ new Map();
    groupe.traverse((o) => {
      if (!o.isMesh || o.isInstancedMesh || Array.isArray(o.material) || o.userData.garder || o.matrixWorld.determinant() < 0) return;
      const l = parMat.get(o.material) || [];
      l.push(o);
      parMat.set(o.material, l);
    });
    for (const [mat, l] of parMat) {
      if (l.length < 2) continue;
      const geos = l.map((o) => {
        let g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
        g.applyMatrix4(new T.Matrix4().multiplyMatrices(inv, o.matrixWorld));
        for (const a of Object.keys(g.attributes)) if (!["position", "normal", "uv"].includes(a)) g.deleteAttribute(a);
        if (!g.attributes.uv) g.setAttribute("uv", new T.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
        g.clearGroups();
        return g;
      });
      const m = E.mergeGeometries(geos, false);
      geos.forEach((g) => g.dispose());
      if (!m) continue;
      const fusion = new T.Mesh(garder(m), mat);
      fusion.renderOrder = l[0].renderOrder;
      fusion.receiveShadow = l.some((o) => o.receiveShadow);
      groupe.add(fusion);
      for (const o of l) o.removeFromParent();
    }
  };
  const fusionnerRangee = () => {
    if (!E.mergeGeometries) return;
    const parMat = /* @__PURE__ */ new Map();
    for (const bo of bornes) {
      for (const g of [bo.fronton.groupe, bo.groupe.getObjectByName("meuble de la borne")]) {
        if (!g) continue;
        g.updateMatrixWorld(true);
        for (const o of g.children) {
          if (!o.isMesh || o.isInstancedMesh || Array.isArray(o.material) || o.userData.garder || o.matrixWorld.determinant() < 0) continue;
          const k = o.material.uuid + "|" + o.renderOrder, l = parMat.get(k) || [];
          l.push([o, bo]);
          parMat.set(k, l);
        }
      }
    }
    rangeeFusion = [];
    for (const l of parMat.values()) {
      if (l.length < 2) continue;
      const geos = l.map(([o]) => {
        const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
        g.applyMatrix4(o.matrixWorld);
        for (const a of Object.keys(g.attributes)) if (!["position", "normal", "uv"].includes(a)) g.deleteAttribute(a);
        if (!g.attributes.uv) g.setAttribute("uv", new T.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
        g.clearGroups();
        return g;
      });
      const m = E.mergeGeometries(geos, false);
      geos.forEach((g) => g.dispose());
      if (!m) continue;
      const o0 = l[0][0], fusion = new T.Mesh(garder(m), o0.material);
      fusion.name = "bornes : fusion";
      fusion.renderOrder = o0.renderOrder;
      fusion.receiveShadow = l.some(([o]) => o.receiveShadow);
      fusion.matrixAutoUpdate = false;
      scene.add(fusion);
      rangeeFusion.push(fusion);
      for (const [o] of l) o.visible = false;
    }
  };
  let rangeeFusion = [];
  const figerBornes = () => {
    for (const bo of bornes) {
      bo.groupe.updateMatrixWorld(true);
      const f = (o) => {
        if (o === bo.meuble.bouton) return;
        o.updateMatrix();
        o.matrixAutoUpdate = false;
        for (const c of o.children) f(c);
      };
      bo.groupe.matrixAutoUpdate = false;
      f(bo.groupe.getObjectByName("meuble de la borne"));
      f(bo.fronton.groupe);
      bo.fronton.groupe.matrixWorldAutoUpdate = false;
    }
  };
  const animerSalle = (dt) => {
    const u = decor?.userData;
    if (!u) return;
    uTemps.value = horloge;
    const attr = kits.rouleaux?.inst?.geometry.getAttribute("aDecalage");
    for (const r of u.rouleaux || []) {
      r.phase -= dt;
      if (r.phase < 0) {
        r.v = r.v ? 0 : 2.5 + Math.random() * 2;
        r.phase = r.v ? 1.2 + r.k * 0.35 : 2 + Math.random() * 5;
      }
      if (r.v) r.decal = (r.decal + r.v * dt) % 1;
      else r.decal += (Math.round(r.decal * 5 - 0.2) / 5 + 0.2 - r.decal) * Math.min(1, dt * 10);
      if (attr) attr.array[r.i] = r.decal;
    }
    if (attr) attr.needsUpdate = true;
    if (u.roue && !u.ancres?.roulette?.userData.pilote) u.roue.rotation.y += dt * 0.6;
    if (u.lustre) u.lustre.rotation.y = Math.sin(horloge * 0.25) * 0.03;
  };
  const environnement = () => {
    const sc = new T.Scene(), pm = new T.PMREMGenerator(rendu), jet = [];
    const mat = (c) => {
      const m = new T.MeshBasicMaterial({ color: c, side: T.DoubleSide });
      jet.push(m);
      return m;
    };
    const boite_ = new T.Mesh(new T.BoxGeometry(100, 60, 100), mat(2363456));
    boite_.material.side = T.BackSide;
    sc.add(boite_);
    const sol = new T.Mesh(new T.PlaneGeometry(100, 100), mat(6956040));
    sol.rotation.x = -Math.PI / 2;
    sol.position.y = -29;
    sc.add(sol);
    const lustre = new T.Mesh(new T.CircleGeometry(12, 24), mat(new T.Color(6, 4.2, 2.4)));
    lustre.rotation.x = Math.PI / 2;
    lustre.position.y = 28;
    sc.add(lustre);
    const bulbe = new T.SphereGeometry(0.6, 8, 6), chaud = mat(new T.Color(8, 6, 3.6));
    for (const y of [-6, 4, 14]) for (let k = 0; k < 48; k++) {
      const a = k / 48 * Math.PI * 2, b = new T.Mesh(bulbe, chaud);
      b.position.set(Math.cos(a) * 46, y, Math.sin(a) * 46);
      sc.add(b);
    }
    const bande = (x, y, z, l, h, c) => {
      const m = new T.Mesh(new T.PlaneGeometry(l, h), mat(c));
      m.position.set(x, y, z);
      m.lookAt(0, y, 0);
      sc.add(m);
    };
    bande(0, 0, -49, 50, 4, new T.Color(0.6, 1.2, 2.4));
    bande(-49, -2, 0, 30, 6, new T.Color(2.2, 0.5, 0.3));
    bande(49, -2, 0, 30, 6, new T.Color(2.2, 0.5, 0.3));
    const t = pm.fromScene(sc, 0.02).texture;
    pm.dispose();
    sc.traverse((o) => o.geometry?.dispose());
    jet.forEach((m) => m.dispose());
    bulbe.dispose();
    garder(t);
    return t;
  };
  const placeBorne = (i) => {
    const L_ = surLigne(RANGEE_B[Math.min(i, RANGEE_B.length - 1)]);
    return L_.p.clone().addScaledVector(L_.n, MUR_BORNE).setY(ESTRADE_B.h);
  };
  const axesBorne = (i) => {
    const n = surLigne(RANGEE_B[Math.min(i, RANGEE_B.length - 1)]).n;
    return { n, u: vec(n.z, 0, -n.x) };
  };
  const monde = (bo, x, y, z) => bo.groupe.localToWorld(vec(x, y, z));
  const centreVitre = (bo) => monde(bo, 0, (VITRE.y0 + VITRE.y1) / 2, VITRE.z);
  const centreVitreCadrage = (bo) => monde(bo, 0, (VITRE_CADRAGE.y0 + VITRE_CADRAGE.y1) / 2, VITRE.z);
  const placeLuigi = (bo) => {
    const p = monde(bo, 18, 0, 12.5);
    return p.setY(solSalle(p));
  };
  const FRONTON_LUEUR = 0.22;
  const FRONTON = { y0: 13.6 + BORNE.DY + BORNE.DH, y1: 17.3 + BORNE.DY + BORNE.DH + BORNE.DF, avant: 12.6, demi: 7.4, fond: 0.9, coin: [14.4, 1.4] };
  const fabriquerFronton = (groupe) => {
    const F_ = FRONTON, g = new T.Group(), h = F_.y1 - F_.y0;
    g.name = "fronton";
    groupe.add(g);
    const [c] = toile(1024, 256), t = texture(c, { bord: true, flipY: true }), face = physique({ map: t, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.1, emissive: 16777215, emissiveMap: t, emissiveIntensity: FRONTON_LUEUR });
    const avant = new T.Mesh(garder(new T.BoxGeometry(2 * F_.demi, h, F_.fond)), [MATS.laque, MATS.laque, MATS.laque, MATS.laque, face, MATS.laque]);
    avant.position.set(0, (F_.y0 + F_.y1) / 2, F_.avant);
    g.add(avant);
    for (const s_ of [-1, 1]) {
      const a = vec(s_ * F_.demi, 0, F_.avant), b = vec(s_ * F_.coin[0], 0, F_.coin[1]), d = b.clone().sub(a), l = d.length();
      const cote_ = boite3(l, h, F_.fond, MATS.laque);
      cote_.position.copy(a.clone().add(b).multiplyScalar(0.5)).setY((F_.y0 + F_.y1) / 2);
      cote_.rotation.y = -Math.atan2(d.z, d.x);
      g.add(cote_);
      for (const y of [F_.y0, F_.y1]) {
        const f = boite3(l, 0.35, F_.fond + 0.3, MATS.or);
        f.position.copy(cote_.position).setY(y);
        f.rotation.y = cote_.rotation.y;
        g.add(f);
      }
      for (let k = 1; k < 6; k++) ampoule(g, a.clone().lerp(b, k / 6).setY(F_.y1 + 0.45).addScaledVector(vec(-d.z, 0, d.x).normalize(), s_ * 0.1), 0.28, 1.4, 1, s_ < 0 ? 6 - k : 16 + k);
    }
    for (const y of [F_.y0, F_.y1]) {
      const f = boite3(2 * F_.demi + 0.4, 0.35, F_.fond + 0.3, MATS.or);
      f.position.set(0, y, F_.avant);
      g.add(f);
    }
    avant.userData.garder = true;
    for (let k = 0; k <= 10; k++) ampoule(g, vec(-F_.demi + k * 2 * F_.demi / 10, F_.y1 + 0.45, F_.avant + 0.2), 0.28, 1.4, 1, 6 + k);
    const dessus = boite3(2 * F_.coin[0], 0.5, F_.avant + 1, MATS.laqueSombre);
    dessus.position.set(0, F_.y1 + 0.1, F_.avant / 2);
    g.add(dessus);
    return { c, t, groupe: g };
  };
  const ecrireFronton = (bo, texte, sous) => {
    const { c, t } = bo.fronton, x = c.getContext("2d"), l = c.width, h = c.height;
    x.fillStyle = "#a3141c";
    x.fillRect(0, 0, l, h);
    const g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "rgba(255,255,255,.16)");
    g.addColorStop(0.5, "rgba(255,255,255,0)");
    g.addColorStop(1, "rgba(0,0,0,.18)");
    x.fillStyle = g;
    x.fillRect(0, 0, l, h);
    x.fillStyle = "#e9b84e";
    for (const cx of [60, l - 60]) etoile(x, cx, h / 2, 30);
    let px = sous ? 112 : 132;
    x.font = `900 ${px}px Nunito, sans-serif`;
    while (x.measureText(texte).width > l - 200 && px > 60) x.font = `900 ${px -= 4}px Nunito, sans-serif`;
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.lineJoin = "round";
    const y = sous ? h * 0.4 : h / 2 + 4;
    x.lineWidth = px * 0.2;
    x.strokeStyle = "#5a0a0e";
    x.strokeText(texte, l / 2, y + 2);
    x.lineWidth = px * 0.1;
    x.strokeStyle = "#f2c862";
    x.strokeText(texte, l / 2, y);
    x.fillStyle = "#fff8ec";
    x.fillText(texte, l / 2, y);
    if (sous) {
      x.font = `800 46px Nunito, sans-serif`;
      x.fillStyle = "#f2c862";
      x.fillText(sous, l / 2, h * 0.8);
    }
    t.needsUpdate = true;
  };
  const autocollantsDessus = (bo, m) => {
    bo.serie = m.serie || null;
    figurine(bo, m);
    ecrireFronton(bo, m.entrainement ? Tr("casino.entrainement") : m.nom, m.entrainement ? Tr("casino.badges_carton_faux") : m.sous);
  };
  const PLAN_BORNE = [[-7.4, 10.9], [7.4, 10.9], [13.6, 0.8], [13.6, -4.4], [-13.6, -4.4], [-13.6, 0.8]];
  const VOLUME = { fond: -4.2 + 0.25 + 0.05, cote: PLAN_BORNE[2][0] - 0.15, haut: 13.3 + BORNE.DY + BORNE.DH - 0.15 - 0.02, jeu: 0.985 };
  const PLAN_VITRINE = PLAN_BORNE.map(([x, z]) => [x * VOLUME.jeu, Math.max(VOLUME.fond, z * VOLUME.jeu)]);
  const demiVitrine = (z) => {
    const [[, za], [xb, zb]] = [PLAN_VITRINE[1], PLAN_VITRINE[2]];
    return z >= zb ? PLAN_VITRINE[1][0] + (xb - PLAN_VITRINE[1][0]) * (za - z) / (za - zb) : xb;
  };
  const texEnseignes = () => {
    const [c, x] = toile(512, 128);
    x.fillStyle = "#9e1218";
    x.fillRect(0, 0, 512, 128);
    const g = x.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, "rgba(255,255,255,.1)");
    g.addColorStop(1, "rgba(0,0,0,.2)");
    x.fillStyle = g;
    x.fillRect(0, 0, 512, 128);
    x.strokeStyle = "#e7b54a";
    x.lineWidth = 4;
    x.strokeRect(10, 10, 492, 108);
    x.font = "900 72px 'DejaVu Sans', sans-serif";
    x.textAlign = "center";
    x.textBaseline = "middle";
    ["\u2660", "\u2665", "\u2666", "\u2663"].forEach((s, k) => {
      const cx = 64 + k * 128;
      x.fillStyle = "rgba(0,0,0,.35)";
      x.fillText(s, cx + 3, 68);
      x.fillStyle = "#f1c862";
      x.fillText(s, cx, 64);
    });
    return texture(c, { bord: true, flipY: true });
  };
  const COMPTEUR_VRAI = { fond: "#f3efe2", bord: "#c9b98a" };
  const texCompteurVrai = (n) => {
    const [c, x] = toile(128, 64), P_2 = IU.parties, N_ = IU.chiffres;
    x.fillStyle = COMPTEUR_VRAI.fond;
    x.fillRect(0, 0, 128, 64);
    x.strokeStyle = COMPTEUR_VRAI.bord;
    x.lineWidth = 4;
    x.strokeRect(2, 2, 124, 60);
    x.drawImage(P_2, 0, 0, P_2.width, P_2.height * 0.45, 4, 6, 70, 70 * P_2.height * 0.45 / P_2.width);
    if (n == null) {
      x.fillStyle = "#1b1b1b";
      etoile(x, 98, 33, 18);
      return c;
    }
    const t = String(Math.min(99, n)), h = N_.height / 10, l = 26, ht = l * h / N_.width;
    [...t].forEach((d, i) => x.drawImage(N_, 0, +d * h, N_.width, h, 92 - (t.length - 1) * 9 + i * 18 - l / 2, 32 - ht / 2, l, ht));
    return c;
  };
  const texCompteur = (n) => {
    if (IU.parties && IU.chiffres) return texCompteurVrai(n);
    const [c, x] = toile(128, 64);
    x.fillStyle = "#0b0f1e";
    x.fillRect(0, 0, 128, 64);
    x.font = "900 48px Nunito, sans-serif";
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillStyle = "#ffb43a";
    x.shadowColor = "#ff8a00";
    x.shadowBlur = 10;
    if (n == null) etoile(x, 64, 33, 22);
    else x.fillText(String(n), 64, 34);
    return c;
  };
  let matsBorne = null;
  const fabriquerMeubleBorne = (groupe) => {
    const M = MATS, g = new T.Group();
    g.name = "meuble de la borne";
    groupe.add(g);
    matsBorne ||= {
      enseignes: garder(new T.MeshStandardMaterial({ map: texEnseignes(), roughness: 0.4, emissive: 16777215, emissiveMap: texEnseignes(), emissiveIntensity: 0.25 })),
      // (15/10, retour de l'auteur, photo : un champ blanchâtre semi-transparent au milieu de la borne, cerné à gauche,
      // en haut et à droite) : le verre de la vitrine (les trois pans, posés plus bas par face(...)). Une vitre existe
      // pour de vraies (reflets, profondeur), mais n'a pas à se voir : opacité à 0 plutôt que la quasi-nulle .025
      // d'avant, qui restait visible en photo (JPEG, lumière de la pièce). Elle garde sa place dans la scène (le
      // raycast de sélection d'une borne continue de la toucher).
      vitre: garder(new T.MeshBasicMaterial({ color: 16777215, transparent: true, opacity: 0, depthWrite: false })),
      bouton: physique({ color: 16753178, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.05, emissive: 8008704, emissiveIntensity: 0.5 }),
      feutre: garder(new T.MeshStandardMaterial({ color: 875564, roughness: 0.95 })),
      noir: garder(new T.MeshStandardMaterial({ color: 657936, roughness: 0.6 }))
    };
    const B = matsBorne, forme2 = new T.Shape(PLAN_BORNE.map(([x, z]) => new T.Vector2(x, -z)));
    const plinthe = extruder(forme2, 0.8, 0.12, M.cuir);
    plinthe.scale.set(0.97, 1, 0.97);
    g.add(plinthe);
    const { DY, DH } = BORNE;
    const caisse = extruder(forme2, 4.3 + DY, 0.25, M.laque);
    caisse.position.y = 0.9;
    g.add(caisse);
    const ceinture = extruder(forme2, 0.25, 0.1, M.or);
    ceinture.position.y = 3.1 + DY * 0.45;
    ceinture.scale.set(1.012, 1, 1.012);
    g.add(ceinture);
    const corniche = extruder(forme2, 0.3, 0.12, M.or);
    corniche.position.y = 5.3 + DY;
    corniche.scale.set(1.02, 1, 1.02);
    g.add(corniche);
    const face = (a, b, y0, y1, mat, dz = 0.3) => {
      const A = vec(a[0], 0, a[1]), Bv = vec(b[0], 0, b[1]), d = Bv.clone().sub(A), n_ = vec(d.z, 0, -d.x).normalize().multiplyScalar(-1);
      const m = new T.Mesh(garder(new T.PlaneGeometry(d.length() * 0.82, y1 - y0)), mat);
      m.position.copy(A.clone().add(Bv).multiplyScalar(0.5)).addScaledVector(n_, dz).setY((y0 + y1) / 2);
      m.rotation.y = Math.atan2(n_.x, n_.z);
      g.add(m);
      return m;
    };
    face(PLAN_BORNE[5], PLAN_BORNE[0], 1.3 + DY * 0.5, 2.9 + DY * 0.5, B.enseignes);
    face(PLAN_BORNE[1], PLAN_BORNE[2], 1.3 + DY * 0.5, 2.9 + DY * 0.5, B.enseignes);
    const trappe = boite3(4.2, 1.6, 0.3, M.or);
    trappe.position.set(0, 2.2, 11.05);
    g.add(trappe);
    const volet = boite3(3.6, 1.1, 0.2, B.noir);
    volet.position.set(0, 2.2, 11.2);
    g.add(volet);
    for (const [x, z] of PLAN_BORNE.slice(0, 4).concat([PLAN_BORNE[5]])) {
      if (z < -4) continue;
      const p = new T.Mesh(garder(new T.CylinderGeometry(0.55, 0.6, 8 + DH, 16)), M.laque);
      p.position.set(x, 9.6 + DY + DH / 2, z);
      g.add(p);
      for (const y of [5.75 + DY, 13.4 + DY + DH]) {
        const c = new T.Mesh(garder(new T.CylinderGeometry(0.8, 0.8, 0.4, 16)), M.or);
        c.position.set(x, y, z);
        g.add(c);
      }
    }
    const v0 = 5.6 + DY, v1 = 13.4 + DY + DH;
    face(PLAN_BORNE[0], PLAN_BORNE[1], v0, v1, B.vitre, -0.65).renderOrder = 6;
    face(PLAN_BORNE[5], PLAN_BORNE[0], v0, v1, B.vitre, -0.1).renderOrder = 6;
    face(PLAN_BORNE[1], PLAN_BORNE[2], v0, v1, B.vitre, -0.1).renderOrder = 6;
    const dos = boite3(27.4, 8 + DH, 0.5, M.laqueSombre);
    dos.position.set(0, 9.6 + DY + DH / 2, -4.2);
    g.add(dos);
    const toit = extruder(forme2, 0.5, 0.15, M.laqueSombre);
    toit.position.y = 13.3 + DY + DH;
    g.add(toit);
    for (let k = 0; k <= 10; k++) for (const y of [5.15 + DY, 13.25 + DY + DH]) ampoule(g, vec(-6.6 + k * 13.2 / 10, y, 11), 0.18, 0, 1, y > 6 + DY ? 4 + k : 24 - k);
    for (let k = 1; k < 6; k++) for (const x of [-6.75, 6.75]) ampoule(g, vec(x, 5.15 + DY + k * (8.1 + DH) / 6, 11), 0.18, 0, 1, x < 0 ? 4 - k : 14 + k);
    const pup = new T.Group();
    pup.position.set(0, 4.6 + DY, 12.6);
    pup.rotation.x = 0.28;
    g.add(pup);
    const tablette = boite3(13, 0.9, 4, M.laque);
    pup.add(tablette);
    const feutre = boite3(12, 0.1, 3.2, B.feutre);
    feutre.position.y = 0.46;
    pup.add(feutre);
    const bord = boite3(13.2, 0.2, 0.3, M.or);
    bord.position.set(0, 0.5, 2);
    pup.add(bord);
    const bague = new T.Mesh(garder(new T.CylinderGeometry(1.55, 1.7, 0.45, 32)), M.or);
    bague.position.set(0, 0.7, 0.1);
    pup.add(bague);
    const bouton = new T.Mesh(garder(new T.SphereGeometry(1.3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2)), garder(B.bouton.clone()));
    bouton.scale.y = 0.55;
    bouton.position.set(0, 0.9, 0.1);
    pup.add(bouton);
    const ecran = new T.Mesh(garder(new T.PlaneGeometry(2.6, 1.3)), garder(new T.MeshBasicMaterial({ map: texture(texCompteur(totalParties()), { bord: true, flipY: true }) })));
    ecran.rotation.x = -Math.PI / 2;
    ecran.position.set(-4, 0.6, 0);
    pup.add(ecran);
    const cadreE = boite3(2.9, 0.15, 1.6, M.or);
    cadreE.position.set(-4, 0.48, 0);
    pup.add(cadreE);
    const fente = boite3(1.8, 0.2, 1.2, M.or);
    fente.position.set(4, 0.55, 0);
    pup.add(fente);
    const trou = boite3(1.1, 0.22, 0.16, B.noir);
    trou.position.set(4, 0.58, 0);
    pup.add(trou);
    for (const s_ of [-1, 1]) {
      const jambe = boite3(0.8, 4 + DY, 0.8, M.cuir);
      jambe.position.set(s_ * 5.6, -2.3 - DY / 2, 1.2 - DY / 2 * Math.sin(0.28));
      jambe.rotation.x = -0.28;
      pup.add(jambe);
    }
    return { compteur: ecran, bouton };
  };
  const majCompteur = (bo, n) => {
    const e = bo.meuble?.compteur;
    if (!e || e.userData.n === n) return;
    e.userData.n = n;
    const t = e.material.map;
    t.image = texCompteur(n);
    t.needsUpdate = true;
  };
  const figurine = (bo, m) => {
    bo.figurine?.removeFromParent();
    bo.figurine = null;
    const s = m.serie;
    if (!s) return;
    const grands = s.lots.filter((f) => s.tailles[f]).sort((a, b) => s.tailles[b][0] * s.tailles[b][1] - s.tailles[a][0] * s.tailles[a][1]);
    const id = grands[0] ? `${s.id}/${grands[0]}` : m.stock.find((x) => tailleDe(x)[0] === 1) || `${s.id}/${s.icone}`;
    quandPrete(image(id), (im) => {
      if (bo.serie !== s) return;
      const a = autocollant(im, false, 4), t = texture(a.c, { bord: true, flipY: true }), k = 6.5 / Math.max(im.naturalWidth, im.naturalHeight);
      const mat = garder(new T.MeshStandardMaterial({ map: t, alphaTest: 0.45, roughness: 0.5, emissive: 16777215, emissiveMap: t, emissiveIntensity: 0.3, side: T.DoubleSide }));
      const p = new T.Mesh(garder(new T.PlaneGeometry(im.naturalWidth * k, im.naturalHeight * k)), mat);
      p.position.set(0, FRONTON.y1 + 0.6 + im.naturalHeight * k / 2, FRONTON.avant - 1.5);
      const socle = boite3(4.5, 0.5, 1.5, MATS.or);
      socle.position.set(0, FRONTON.y1 + 0.35, FRONTON.avant - 1.5);
      const f = new T.Group();
      f.add(p, socle);
      bo.groupe.add(f);
      bo.figurine = f;
    });
  };
  const fabriquerBorne = (i) => {
    const groupe = new T.Group();
    groupe.name = "borne " + (i + 1);
    const ax = axesBorne(i);
    groupe.position.copy(placeBorne(i));
    groupe.rotation.y = Math.atan2(ax.n.x, ax.n.z);
    groupe.scale.setScalar(RANGEE.ECH);
    scene.add(groupe);
    const bo = { i, groupe, interieur: null, n: ax.n, u: ax.u };
    bo.meuble = fabriquerMeubleBorne(groupe);
    bo.fronton = fabriquerFronton(groupe);
    groupe.updateMatrixWorld(true);
    return bo;
  };
  const versLocal = (x, y) => [ZONE_JEU.x0 + x * S, ZONE_JEU.y1 - y * S];
  const SOL_VITRINE = 5.76 + BORNE.DY;
  const basique = (o) => garder(new T.MeshBasicMaterial(o));
  const garnir = (bo, m) => {
    if (bo.interieur) return;
    const I = new T.Group();
    I.name = "int\xE9rieur";
    bo.groupe.add(I);
    bo.interieur = I;
    bo.badges = /* @__PURE__ */ new Map();
    const haut = VOLUME.haut, bas3 = SOL_VITRINE, hp = haut - bas3, yc = (haut + bas3) / 2;
    const A0 = vec(7.4 - 0.7, 0, 10.9 - 0.2), B0 = vec(13.6 - 0.7, 0, 0.8), xMur = (z) => A0.x + (B0.x - A0.x) * (A0.z - z) / (A0.z - B0.z);
    const zf = VOLUME.fond, xf = VOLUME.cote, wp = 2 * xf;
    poserFond(I, m, { wp, hp, yc, haut, A0, xf, zf });
    if (m.vraie) objetsVrais(bo, m, I);
    else {
      const pts = solDe(m), f = new T.Shape(), bas = H + 60, gauche = (-xMur(Z.terrain1) + 0.3 - ZONE_JEU.x0) / S;
      f.moveTo(...versLocal(gauche, bas));
      f.lineTo(...versLocal(gauche, pts[0][1]));
      for (const p of pts) f.lineTo(...versLocal(p[0], p[1]));
      f.lineTo(...versLocal(pts[pts.length - 1][0], bas));
      f.closePath();
      const glace3 = !!plateau(m).glace, A = aspectPlateau(m.theme), dessus = basique({ color: A.dessus });
      const plat = new T.Mesh(garder(new T.ExtrudeGeometry(f, { depth: Z.terrain1 - Z.terrain0, bevelEnabled: false })), [basique({ map: texPlateau(m.theme) }), dessus]);
      plat.position.z = Z.terrain0;
      I.add(plat);
      for (const [x0, y0, x1, y1] of blocsPlateau(m)) {
        const [a, b] = versLocal(x0, y0), [c, d] = versLocal(x1, y1), prof = Z.terrain1 - Z.terrain0 - 1.2;
        const tb = texBloc(glace3 ? "glace" : m.theme === "carton" ? "carton" : "caisse", c - a, b - d), cote = basique({ map: tb, color: 12105912 });
        const bloc = new T.Mesh(garder(new T.BoxGeometry(c - a, b - d, prof)), [cote, cote, basique({ map: tb, color: 15263976 }), cote, basique({ map: tb }), cote]);
        bloc.position.set((a + c) / 2, (b + d) / 2, Z.terrain1 - prof / 2);
        I.add(bloc);
        const levre = new T.Mesh(garder(new T.CapsuleGeometry(0.13, Math.max(0.01, c - a - 0.26), 6, 10)), plastique(glace3 ? 16777215 : 14890287));
        levre.rotation.z = Math.PI / 2;
        levre.position.set((a + c) / 2, b + 0.06, Z.terrain1 + 0.02);
        I.add(levre);
      }
      const P3 = plateau(m);
      if (P3.bascule) {
        const lg = 2 * P3.bascule.demi * W * S, pl = new T.Mesh(garder(new T.BoxGeometry(lg, 0.32, Z.terrain1 - Z.terrain0 - 1)), basique({ map: texBloc(m.theme === "carton" ? "carton" : "caisse", lg, 0.32) }));
        const bande2 = new T.Mesh(garder(new T.BoxGeometry(lg, 0.1, 0.1)), plastique(15909376));
        bande2.position.set(0, 0.2, (Z.terrain1 - Z.terrain0 - 1) / 2);
        pl.add(bande2);
        I.add(pl);
        bo.planche = pl;
      } else bo.planche = null;
      if (P3.tapis) {
        const [ax, ay] = solDe(m)[P3.tapis.seg], [bx] = solDe(m)[P3.tapis.seg + 1], lg = (bx - ax) * S, [cg2, xc] = toile(64, 16);
        xc.fillStyle = "#3a3a44";
        xc.fillRect(0, 0, 64, 16);
        xc.fillStyle = "#f2c200";
        for (let k = 0; k < 64; k += 16) {
          xc.beginPath();
          xc.moveTo(k, 0);
          xc.lineTo(k + 8, 8);
          xc.lineTo(k, 16);
          xc.lineTo(k + 5, 16);
          xc.lineTo(k + 13, 8);
          xc.lineTo(k + 5, 0);
          xc.fill();
        }
        const tt = texture(cg2);
        tt.repeat.set(Math.max(1, Math.round(lg / 0.5)), 1);
        const tap = new T.Mesh(garder(new T.PlaneGeometry(lg, 0.34)), basique({ map: tt }));
        const [lx, ly] = versLocal((ax + bx) / 2, ay);
        tap.position.set(lx, ly - 0.2, Z.terrain1 + 0.03);
        I.add(tap);
        bo.tapis = tt;
      } else bo.tapis = null;
      const bord = [...pts, [pts[pts.length - 1][0], H + 20]], chemin = new T.CurvePath();
      for (let i = 0; i < bord.length - 1; i++) {
        const [ax, ay] = versLocal(...bord[i]), [bx, by] = versLocal(...bord[i + 1]);
        chemin.add(new T.LineCurve3(vec(ax, ay + 0.06, Z.terrain1 + 0.02), vec(bx, by + 0.06, Z.terrain1 + 0.02)));
      }
      const L = chemin.getLength();
      if (bordDe(m.theme) === "vagues") {
        I.add(new T.Mesh(garder(new T.TubeGeometry(chemin, 120, 0.17, 8, false)), plastique(16777215)));
        const n = Math.floor((L - 0.2) / 0.55) + 1, vagues = new T.InstancedMesh(garder(new T.SphereGeometry(0.26, 12, 8)), plastique(15398911), n), M4 = new T.Matrix4(), q = new T.Quaternion();
        for (let k = 0; k < n; k++) {
          const p = chemin.getPointAt(Math.min(1, (0.2 + k * 0.55) / L));
          p.y += 0.05;
          vagues.setMatrixAt(k, M4.compose(p, q, vec(1, 0.8, 0.9)));
        }
        vagues.computeBoundingSphere();
        I.add(vagues);
      } else {
        const tc = texCorde(cordeDe(m.theme));
        tc.repeat.set(Math.round(L / 0.42), 1);
        I.add(new T.Mesh(garder(new T.TubeGeometry(chemin, 120, 0.13, 8, false)), plastique(16777215, { map: tc })));
      }
      const [xs1] = versLocal(PINCE.rebord, 0), Gt = DECORS[m.theme]?.goulotte || { fond: C.triangleBord, tri: C.triangle };
      const couper = (pts2, garde) => {
        const r = [];
        pts2.forEach((a, k) => {
          const b = pts2[(k + 1) % pts2.length], ga = garde(a[0]), gb = garde(b[0]);
          if (ga) r.push(a);
          if (ga !== gb) {
            const t = (xs1 - a[0]) / (b[0] - a[0]);
            r.push([xs1, a[1] + t * (b[1] - a[1])]);
          }
        });
        return r;
      };
      for (const [garde, col] of [[(x) => x <= xs1, A.face[A.face.length - 1]], [(x) => x >= xs1, Gt.fond]]) {
        const forme2 = new T.Shape(couper(PLAN_BORNE.map(([x, z]) => [x * 0.97, z * 0.97]), garde).map(([x, z]) => new T.Vector2(x, -z)));
        const sol = new T.Mesh(garder(new T.ShapeGeometry(forme2)), basique({ color: col }));
        sol.rotation.x = -Math.PI / 2;
        sol.position.y = SOL_VITRINE;
        I.add(sol);
      }
      const [xr] = versLocal(PINCE.rebord, 0), lb = VITRE.x1 - xr + 0.2, [cg, xgo] = toile(256, Math.round(256 * 0.5 / lb));
      xgo.fillStyle = Gt.fond;
      xgo.fillRect(0, 0, cg.width, cg.height);
      for (let k = 0; k < 4; k++) {
        const cx = (k + 0.5) * cg.width / 4, hh = cg.height;
        xgo.fillStyle = Gt.tri;
        xgo.beginPath();
        xgo.moveTo(cx - hh * 0.34, hh * 0.22);
        xgo.lineTo(cx + hh * 0.34, hh * 0.22);
        xgo.lineTo(cx, hh * 0.8);
        xgo.closePath();
        xgo.fill();
        if (Gt.cerne) {
          xgo.strokeStyle = Gt.cerne;
          xgo.lineWidth = 3;
          xgo.stroke();
        }
      }
      const bande = new T.Mesh(garder(new T.PlaneGeometry(lb, 0.5)), basique({ map: texture(cg, { bord: true, flipY: true }) }));
      bande.position.set((xr + VITRE.x1) / 2, SOL_VITRINE + 0.26, VITRE.z - 0.3);
      I.add(bande);
    }
    const [cr, xx] = toile(256, 160);
    xx.fillStyle = "rgba(255,255,255,.16)";
    for (const [x0, l] of [[188, 14], [214, 6]]) {
      xx.beginPath();
      xx.moveTo(x0, 0);
      xx.lineTo(x0 + l, 0);
      xx.lineTo(x0 + l - 46, 60);
      xx.lineTo(x0 - 46, 60);
      xx.fill();
    }
    const reflet = new T.Mesh(garder(new T.PlaneGeometry(VITRE.x1 - VITRE.x0, VITRE.y1 - VITRE.y0)), basique({ map: texture(cr, { bord: true, flipY: true }), transparent: true, depthWrite: false }));
    reflet.position.set(0, (VITRE.y0 + VITRE.y1) / 2, VITRE.z + 0.02);
    reflet.renderOrder = 5;
    I.add(reflet);
    bo.reflet = reflet;
    bo.pince = construirePince(m);
    I.add(bo.pince.groupe);
    majInterieur(bo, m);
  };
  const outilsPeau = (m) => ({ T, S, K, VITRE, Z, MOYEU, versLocal, garder, basique, plastique, couleur: pinceDe(m) });
  const poserFond = (I, m, cadre) => {
    if (m.vraie) return fondVrai(I, m, cadre);
    try {
      if (window.__pcvBornesPeaux?.fond?.(I, m, cadre, outilsPeau(m))) return;
    } catch (e) {
      console.warn("casino : peau du fond", e);
    }
    fondDessine(I, m, cadre);
  };
  const LONG_COTE = PLAN_VITRINE[2][1] - VOLUME.fond;
  const cotesPleins = (I, hp, yc, mat) => {
    for (const s_ of [-1, 1]) {
      const mur = new T.Mesh(garder(new T.PlaneGeometry(LONG_COTE, hp)), mat);
      mur.position.set(s_ * VOLUME.cote, yc, VOLUME.fond + LONG_COTE / 2);
      mur.rotation.y = -s_ * Math.PI / 2;
      I.add(mur);
    }
  };
  const plaqueVitrine = (y, mat) => {
    const g = garder(new T.ShapeGeometry(new T.Shape(PLAN_VITRINE.map(([x, z]) => new T.Vector2(x, -z)))));
    g.computeBoundingBox();
    const b = g.boundingBox, uv = g.attributes.uv, p = g.attributes.position;
    for (let k = 0; k < uv.count; k++) uv.setXY(k, (p.getX(k) - b.min.x) / (b.max.x - b.min.x), (p.getY(k) - b.min.y) / (b.max.y - b.min.y));
    const m_ = new T.Mesh(g, mat);
    m_.rotation.x = -Math.PI / 2;
    m_.position.y = y;
    return m_;
  };
  const fondDessine = (I, m, { wp, hp, yc, haut, xf, zf }) => {
    m.texFond ||= texFond(m, wp, hp);
    const fond = new T.Mesh(garder(new T.PlaneGeometry(wp, hp)), basique({ map: m.texFond }));
    fond.position.set(0, yc, zf);
    I.add(fond);
    m.texMur ||= texFond(m, LONG_COTE * 1.12, hp, true);
    cotesPleins(I, hp, yc, basique({ map: m.texMur, color: 15132390, side: T.DoubleSide }));
    I.add(plaqueVitrine(haut, basique({ color: cotesDe(m.theme)[0], side: T.DoubleSide })));
  };
  const construirePince = (m) => {
    if (m.geo === GEO_VRAIE) return pinceVraie(m);
    try {
      const p_ = window.__pcvBornesPeaux?.pince?.(m, outilsPeau(m));
      if (p_) return p_;
    } catch (e) {
      console.warn("casino : peau de la pince", e);
    }
    return pinceDessinee(m);
  };
  const texPrivee = (chemin, f, o = {}) => {
    const im = new Image();
    (opts.lire ? opts.lire(chemin).then((b) => URL.createObjectURL(new Blob([b], { type: "image/png" }))) : Promise.resolve(window.__pcvRessource?.(chemin, chemin.endsWith(".jpg") ? "image/jpeg" : "image/png"))).then((u) => {
      if (!u) return f(null);
      im.onload = () => {
        const t = garder(new T.Texture(im));
        t.colorSpace = T.SRGBColorSpace;
        t.flipY = o.flipY ?? true;
        t.anisotropy = 4;
        t.needsUpdate = true;
        f(t, im);
      };
      im.onerror = () => f(null);
      im.src = u;
    }).catch(() => f(null));
  };
  const COTE_VRAI = 10132122, BANDE_VRAIE = 0.12;
  const PROFONDEUR_VRAIE = { bandeMur: 0.08, epaisseur: 0.86 / 8.56, pasCouche: 0.012, ombre: 1.55 / 6.4, decalage: [0.08, -0.12], opaciteOmbre: 0.4, tranche: 13158600, objets: 1.4 };
  const profondeur = () => ({ ...PROFONDEUR_VRAIE, ...window.__pcvCasinoProfondeur || {} });
  const tranche = (geo, mat, ep) => {
    const n = clamp(Math.ceil(ep / PROFONDEUR_VRAIE.pasCouche), 3, 24), t_ = new T.InstancedMesh(geo, mat, n), M4 = new T.Matrix4();
    for (let k = 0; k < n; k++) t_.setMatrixAt(k, M4.makeTranslation(0, 0, -ep * (k + 1) / n));
    t_.instanceMatrix.needsUpdate = true;
    t_.frustumCulled = false;
    return t_;
  };
  const fondVrai = (I, m, cadre) => {
    const { wp, hp, yc, haut, xf, zf } = cadre, V = m.vraie;
    texPrivee(PRIVE_BA.bornes + V.fond, (t) => {
      if (!bo_(m)?.interieur || bo_(m).interieur !== I) return;
      if (!t) return fondDessine(I, m, cadre);
      const k = Math.min(1, wp / hp / (ECRAN.l / ECRAN.h)), kh = Math.min(1, ECRAN.l / ECRAN.h / (wp / hp));
      t.repeat.set(k, kh);
      t.offset.set((1 - k) / 2, 0);
      const fond = new T.Mesh(garder(new T.PlaneGeometry(wp, hp)), basique({ map: t }));
      fond.position.set(0, yc, zf);
      I.add(fond);
      for (const s_ of [-1, 1]) {
        const tm = garder(t.clone()), bk = PROFONDEUR_VRAIE.bandeMur * k;
        tm.repeat.set(bk, kh);
        tm.offset.set(s_ < 0 ? (1 - k) / 2 : (1 + k) / 2 - bk, 0);
        tm.needsUpdate = true;
        const mur = new T.Mesh(garder(new T.PlaneGeometry(LONG_COTE, hp)), basique({ map: tm, color: COTE_VRAI, side: T.DoubleSide }));
        mur.position.set(s_ * xf, yc, zf + LONG_COTE / 2);
        mur.rotation.y = -s_ * Math.PI / 2;
        I.add(mur);
      }
      for (const [y, haut_] of [[haut, true], [SOL_VITRINE, false]]) {
        const tb = garder(t.clone());
        tb.repeat.set(k, haut_ ? kh - 1 : BANDE_VRAIE * kh);
        tb.offset.set((1 - k) / 2, haut_ ? 1 : 0);
        tb.needsUpdate = true;
        I.add(plaqueVitrine(y, basique({ map: tb, color: haut_ ? 16777215 : COTE_VRAI, side: T.DoubleSide })));
      }
    });
  };
  const bo_ = (m) => bornes[machines.indexOf(m)];
  const IU_FICHIERS = {
    debut: "MgCrStart/MgCrTextStart.png",
    entrainement: "MgCrBonusStart/MgCrBonusTextStart.png",
    gain1: "MgCrEftGetPrize/MgCrGetPrize1.png",
    gain2: "MgCrEftGetPrize/MgCrGetPrize2.png",
    gain3: "MgCrEftGetPrize/MgCrGetPrize3.png",
    gain4: "MgCrEftGetPrize/MgCrGetPrize4Over.png",
    bouton: "MgCrBtnPlay/MgCrPlayBtn02.png",
    parties: "MgCrBtnPlay/MgCrPlayTextLeft.png",
    chiffres: "MgCrBtnPlay/MgCrPlayTextNo.png",
    touchez: "MgCrRsltSignD/MgCrRsltBadgeTouch.png"
  };
  const IU = {};
  const imagePrivee = (chemin, f) => {
    const im = new Image();
    (opts.lire ? opts.lire(chemin).then((b) => URL.createObjectURL(new Blob([b], { type: "image/png" }))) : Promise.resolve(window.__pcvRessource?.(chemin, "image/png"))).then((u) => {
      if (!u) return f(null);
      im.onload = () => f(im);
      im.onerror = () => f(null);
      im.src = u;
    }).catch(() => f(null));
  };
  const chargerInterface = () => {
    for (const [k, f] of Object.entries(IU_FICHIERS)) if (!IU[k]) imagePrivee(PRIVE_BA.partie + f, (im) => {
      if (!im) return;
      IU[k] = im;
      if (k === "bouton") dessinerBoutonA();
      if (k === "parties" || k === "chiffres") bornes.forEach((bo) => {
        if (bo.meuble?.compteur) bo.meuble.compteur.userData.n = void 0;
      });
    });
  };
  const Z_OBJETS = -0.3;
  const CHUTE_VUE = { h: 8, pas: 23, tri: [7, 4.5], fond: "#141c4a", jaune: "#f8e020", cerne: "#5a4a10" };
  const objetsVrais = (bo, m, I) => {
    bo.planche = null;
    bo.tapis = null;
    bo.profondeurs = [];
    const I0 = I;
    for (const o of m.vraie.objets) {
      if (o.invisible) continue;
      texPrivee(PRIVE_BA.bornes + o.img, (t) => {
        if (!t || bo.interieur !== I0) return;
        const [x, y] = versLocal(...ecranVersMonde(o.x, o.y)), l = o.w * o.sx * E_ * S, h = o.h * o.sy * E_ * S;
        const geo = garder(new T.PlaneGeometry(l, h)), p = new T.Mesh(geo, basique({ map: t, transparent: true, alphaTest: 0.02, depthWrite: false }));
        p.position.set(x, y, Z.badges + Z_OBJETS);
        p.rotation.z = -o.rot * Math.PI / 180;
        p.renderOrder = 1;
        I0.add(p);
        const Pf = profondeur(), d = 128 * E_ * S * Pf.objets, L_ = bo.profondeurs ||= [];
        if (Pf.epaisseur > 0) {
          const tr = tranche(geo, basique({ map: t, color: Pf.tranche, alphaTest: 0.5 }), Pf.epaisseur * d);
          p.add(tr);
          L_.push(tr);
        }
        const om = new T.Mesh(geo, basique({ map: t, color: 0, transparent: true, opacity: Pf.opaciteOmbre, depthWrite: false }));
        om.position.set(Pf.decalage[0] * d, Pf.decalage[1] * d, -Pf.ombre * d);
        om.renderOrder = 0;
        p.add(om);
        L_.push(om);
      });
    }
    bo.accs = (m.vraie.accessoires || []).map((a) => {
      if (a.invisible) return null;
      const e = { mesh: null };
      texPrivee(PRIVE_BA.bornes + a.img, (t) => {
        if (!t || bo.interieur !== I0) return;
        const p = new T.Mesh(garder(new T.PlaneGeometry(a.w * a.sx * E_ * S, a.h * a.sy * E_ * S)), basique({ map: t, transparent: true, alphaTest: 0.02, depthWrite: false }));
        const [x, y] = versLocal(...ecranVersMonde(a.x, a.y));
        p.position.set(x, y, Z.badges + Z_OBJETS + 0.05);
        p.rotation.z = -a.rot * Math.PI / 180;
        p.renderOrder = 1;
        I0.add(p);
        e.mesh = p;
      });
      return e;
    });
    for (const [a, b] of trouesVraies(m)) {
      const l = (b - a) / E_, n = Math.max(1, Math.round(l / CHUTE_VUE.pas)), Q = 4, [cg, xg] = toile(Math.round(l * Q), CHUTE_VUE.h * Q);
      xg.fillStyle = CHUTE_VUE.fond;
      xg.fillRect(0, 0, cg.width, cg.height);
      xg.lineWidth = Q * 0.6;
      xg.strokeStyle = CHUTE_VUE.cerne;
      xg.fillStyle = CHUTE_VUE.jaune;
      for (let k = 0; k < n; k++) {
        const cx = (k + 0.5) * cg.width / n, [tl, th] = CHUTE_VUE.tri, y02 = (cg.height - th * Q) / 2;
        xg.beginPath();
        xg.moveTo(cx - tl * Q / 2, y02);
        xg.lineTo(cx + tl * Q / 2, y02);
        xg.lineTo(cx, y02 + th * Q);
        xg.closePath();
        xg.fill();
        xg.stroke();
      }
      const [x0, y0] = versLocal(a, H - CHUTE_VUE.h * E_), [x1, y1] = versLocal(b, H);
      const bande = new T.Mesh(garder(new T.PlaneGeometry(x1 - x0, y0 - y1)), basique({ map: texture(cg, { bord: true, flipY: true }) }));
      bande.position.set((x0 + x1) / 2, (y0 + y1) / 2, Z.badges + Z_OBJETS + 0.02);
      bande.renderOrder = 1;
      I.add(bande);
    }
    if (!m.vraie.objets.length) {
      const [x0, y0] = versLocal(...ecranVersMonde(0, SOL_VRAI_HAUT)), [x1, y1] = versLocal(...ecranVersMonde(SOL_VRAI_FIN, ECRAN.h));
      const sol = new T.Mesh(garder(new T.PlaneGeometry(x1 - x0, y0 - y1)), basique({ map: texBloc("caisse", x1 - x0, y0 - y1) }));
      sol.position.set((x0 + x1) / 2, (y0 + y1) / 2, Z.badges + Z_OBJETS);
      sol.renderOrder = 1;
      I.add(sol);
      const levre = new T.Mesh(garder(new T.CapsuleGeometry(0.13, Math.max(0.01, x1 - x0 - 0.26), 6, 10)), plastique(14890287));
      levre.rotation.z = Math.PI / 2;
      levre.position.set((x0 + x1) / 2, y0 + 0.06, Z.badges + Z_OBJETS + 0.02);
      I.add(levre);
    }
  };
  const DEVANT_VRAIE = 0.45;
  const RAIL_VRAI = { y: -0.12, r: 0.09, chariot: [0.7, 0.32, 0.42], teinte: 0.75, metal: 10133672 };
  const LED_VRAIE = { cadence: 30, allumee: "AnCaObBodyLightOn_rainbow", bras: ["AnCaObArmLLightOn", "AnCaObArmRLightOn"], derniere: "AnCaObBodyLightOn_LastLoop", brasDerniere: ["AnCaObArmLLastLoop", "AnCaObArmRLastLoop"] };
  const pinceVraie = (m) => {
    const P_2 = window.__pcvPicaTev, G_ = estBombe(m) ? bombeGltf : pinceGltf, copie = E.clone(G_.scene), g = { ...G_, scene: copie, userData: {} }, groupe = new T.Group(), ech = UNITE * S;
    copie.scale.setScalar(ech);
    copie.visible = false;
    groupe.add(copie);
    if (estBombe(m)) copie.traverse((o) => {
      if (o.isMesh && o.material?.name === "MtCaObArmFront" && !o.geometry.attributes.couleur) {
        const d = new Float32Array(o.geometry.attributes.position.count * 4);
        for (let k = 3; k < d.length; k += 4) d[k] = 1;
        o.geometry.setAttribute("couleur", new T.BufferAttribute(d, 4));
      }
    });
    const bG = copie.getObjectByName("Pivot-ArmL"), bD = copie.getObjectByName("Pivot-ArmR"), tige2 = copie.getObjectByName("Tige"), HAUT_TIGE = 25.78;
    const bombeM = copie.getObjectByName("Pivot-Bomb");
    let libre = null;
    P_2.habiller(g, { teinte: couleurVraie(m), lineaire: true }).then(() => {
      copie.visible = true;
      if (bombeM) {
        libre = E.clone(bombeM);
        libre.scale.setScalar(ech);
        libre.visible = false;
        groupe.add(libre);
      }
    }).catch((e) => console.warn("casino : mat\xE9riaux de la vraie pince", e));
    const eclat = bombeM && new T.Mesh(garder(new T.SphereGeometry(1, 20, 14)), basique({ color: 16765530, transparent: true, opacity: 0.9, depthWrite: false }));
    if (eclat) {
      eclat.visible = false;
      eclat.renderOrder = 5;
      groupe.add(eclat);
    }
    const fumee = bombeM && new T.Mesh(garder(new T.SphereGeometry(1, 12, 9)), basique({ color: 5591114, transparent: true, opacity: 0.55, depthWrite: false }));
    if (fumee) {
      fumee.visible = false;
      fumee.renderOrder = 4;
      groupe.add(fumee);
    }
    copie.traverse((o) => {
      if (o !== copie && o !== bG && o !== bD && o !== tige2 && o !== bombeM) {
        o.updateMatrix();
        o.matrixAutoUpdate = false;
      }
    });
    const R_ = RAIL_VRAI, yR = ZONE_JEU.y1 + R_.y, mR = plastique(new T.Color(couleurVraie(m)).multiplyScalar(R_.teinte));
    const rail = new T.Mesh(garder(new T.CylinderGeometry(R_.r, R_.r, 2 * demiVitrine(Z.pince + DEVANT_VRAIE), 12)), plastique(R_.metal));
    rail.rotation.z = Math.PI / 2;
    groupe.add(rail);
    const chariot = new T.Mesh(garder(new T.BoxGeometry(...R_.chariot)), mR);
    groupe.add(chariot);
    return { groupe, vraie: true, poser({ j, D, w, z, n }) {
      const [x, y] = w(D.anneau);
      copie.position.set(x, y, z + DEVANT_VRAIE);
      copie.rotation.z = -j.phi;
      rail.position.set(0, yR, z + DEVANT_VRAIE);
      chariot.position.set(x, yR, z + DEVANT_VRAIE);
      if (bG) bG.rotation.z = -OUVERTURE_VRAIE * j.oG;
      if (bD) bD.rotation.z = OUVERTURE_VRAIE * j.oD;
      if (bombeM) {
        const lachee = !!j.bombeLachee && j.bombeXY;
        bombeM.visible = !lachee && j.etat !== "souffle";
        if (libre) {
          libre.visible = lachee;
          if (lachee) {
            const [lx, ly] = w(ecranVersMonde(j.bombeXY[0], j.bombeXY[1] - BOMBE.centre));
            libre.position.set(lx, ly, z + DEVANT_VRAIE);
            libre.rotation.z = -j.bombeLachee.getAngle();
          }
        }
        if (eclat && j.eclat) {
          j.eclat.t += 1 / 60;
          const DUREE_FUMEE = 1.1, kf = j.eclat.t / 0.45, kg = j.eclat.t / DUREE_FUMEE, [ex, ey] = w(ecranVersMonde(j.eclat.x, j.eclat.y));
          eclat.visible = kf < 1;
          eclat.position.set(ex, ey, z + DEVANT_VRAIE + 0.3);
          eclat.scale.setScalar(Math.max(0.01, PH.REGLAGES.bombe.souffle * E_ * S * (0.3 + 0.7 * Math.sqrt(kf))));
          eclat.material.opacity = 0.9 * (1 - kf);
          if (fumee) {
            const [fx, fy] = w(ecranVersMonde(j.eclat.x, j.eclat.y - j.eclat.t * 40));
            fumee.visible = kg < 1;
            fumee.position.set(fx, fy, z + DEVANT_VRAIE + 0.2);
            fumee.scale.setScalar(Math.max(0.01, PH.REGLAGES.bombe.souffle * E_ * S * (0.25 + 0.9 * Math.sqrt(kg))));
            fumee.material.opacity = 0.55 * (1 - kg);
          }
          if (kg >= 1) j.eclat = null;
        }
        if (copie.visible) P_2.animer(g, "AnCaObBombFuseBurn", j.bombeLachee ? Math.min(39, j.mecheT * 30) : 0);
      }
      if (tige2) tige2.scale.y = Math.max(0.05, (yR - y) / ech / HAUT_TIGE);
      if (!copie.visible) return;
      const chiffre = typeof n === "number" ? Math.min(99, n) : null;
      const travaille = j.etat !== "attente" && j.etat !== "repos", derniere = !m.entrainement && typeof n === "number" && n === (j.etat === "attente" ? 1 : 0);
      const f = derniere ? horloge * LED_VRAIE.cadence % 20 : travaille ? horloge * LED_VRAIE.cadence % 13 : 0;
      P_2.animer(g, derniere ? LED_VRAIE.derniere : LED_VRAIE.allumee, f);
      for (const a of derniere ? LED_VRAIE.brasDerniere : LED_VRAIE.bras) P_2.animer(g, a, f);
      if (chiffre === null) P_2.animer(g, "AnCaObBody_FontCenter", 0);
      else if (chiffre === 0) {
        P_2.animer(g, "AnCaObBody_FontL", 0);
        P_2.animer(g, "AnCaObBody_FontR", 0);
      } else P_2.chiffres(g, chiffre);
    } };
  };
  const FORME_PINCE = { ovale: [1.62, 0.96], epaule: 12.5, avantBras: 9.5, rotule: 13, pointe: [9, 30], tige: 8.5, bague: 13 };
  const pinceDessinee = (m) => {
    const groupe = new T.Group(), s = S * K, F_ = FORME_PINCE, couleur = new T.Color(pinceDe(m)), matP = plastique(couleur), matF = plastique(couleur.clone().multiplyScalar(0.72));
    const anneau = new T.Mesh(garder(new T.TorusGeometry(37 * s, 11 * s, 18, 56)), matP);
    anneau.scale.set(F_.ovale[0], F_.ovale[1], 1.25);
    groupe.add(anneau);
    const [ca, xa] = toile(128, 128);
    dessinerAfficheur(xa, m.entrainement ? null : totalParties());
    const ta = texture(ca, { bord: true, flipY: true }), afficheur = new T.Mesh(garder(new T.CircleGeometry(36 * s, 48)), basique({ map: ta }));
    afficheur.scale.set(F_.ovale[0], F_.ovale[1], 1);
    groupe.add(afficheur);
    const dos = new T.Mesh(garder(new T.CircleGeometry(40 * s, 40)), matF);
    dos.scale.set(F_.ovale[0], F_.ovale[1], 1);
    dos.rotation.y = Math.PI;
    groupe.add(dos);
    const tete = new T.Mesh(garder(new T.CapsuleGeometry(11 * s, 40 * s, 6, 14)), matF);
    tete.visible = false;
    groupe.add(tete);
    const segEpaule = garder(new T.CapsuleGeometry(F_.epaule * s, 1, 6, 14)), segAvant = garder(new T.CapsuleGeometry(F_.avantBras * s, 1, 6, 12));
    const bras = [0, 1, 2, 3].map((k) => {
      const b = new T.Mesh(k % 2 ? segAvant : segEpaule, matP);
      groupe.add(b);
      return b;
    });
    const geoRotule = garder(new T.SphereGeometry(F_.rotule * s, 18, 12)), rotules = [0, 1, 2, 3].map(() => {
      const r_ = new T.Mesh(geoRotule, matF);
      groupe.add(r_);
      return r_;
    });
    const geoPointe = garder(new T.ConeGeometry(F_.pointe[0] * s, F_.pointe[1] * s, 14)), bouts = [0, 1].map(() => {
      const b = new T.Mesh(geoPointe, matP);
      groupe.add(b);
      return b;
    });
    const tige2 = new T.Mesh(garder(new T.CylinderGeometry(F_.tige * s, F_.tige * s, 1, 16)), matP);
    groupe.add(tige2);
    const manchon = new T.Mesh(garder(new T.CylinderGeometry(F_.bague * s, F_.bague * s, 1, 20)), plastique(15921906));
    groupe.add(manchon);
    const P = { groupe, anneau, afficheur, dos, tete, bras, rotules, bouts, tige: tige2, manchon, xa, ta, n: m.entrainement ? null : totalParties(), matP, base: couleur.clone() };
    P.poser = (etat) => poserPinceDessinee(P, etat);
    return P;
  };
  const vA = new T.Vector3(), vB = new T.Vector3(), Yh = new T.Vector3(0, 1, 0);
  const poserSegment = (o, a, b, z) => {
    vA.set(a[0], a[1], z);
    vB.set(b[0], b[1], z);
    o.position.copy(vA).add(vB).multiplyScalar(0.5);
    const d = vB.sub(vA), l = d.length();
    o.scale.set(1, Math.max(0.01, l), 1);
    o.quaternion.setFromUnitVectors(Yh, d.normalize());
  };
  const matsAuto = /* @__PURE__ */ new Map();
  const matAutocollant = (id, carton, f) => {
    const cle = (carton ? "c:" : "") + id;
    let e = matsAuto.get(cle);
    if (!e) {
      e = { mat: null, ombre: null, marge: 0, attente: [] };
      matsAuto.set(cle, e);
      quandPrete(image(id), (im) => {
        const a = autocollant(im, carton), t = texture(a.c, { bord: true, flipY: true });
        e.mat = basique({ map: t, alphaTest: 0.5 });
        e.ombre = basique({ map: t, color: 0, transparent: true, opacity: 0.3, depthWrite: false });
        e.marge = a.marge;
        e.attente.splice(0).forEach((g) => g(e));
      });
    }
    if (e.mat) f(e);
    else e.attente.push(f);
  };
  const plaqueBadge = (bo, c) => {
    if (c.o3 || c.o3attente || !c.id) return;
    c.o3attente = true;
    if (c.vrai) return plaqueVraie(bo, c);
    matAutocollant(c.id, c.carton, (e) => {
      c.o3attente = false;
      if (!bo.interieur) return;
      const [col, rang] = c.taille, d = 2 * (c.r ?? R_BADGE) * S * 1.06 / (1 - 2 * e.marge), geo = garder(new T.PlaneGeometry(d * col, d * rang)), g = new T.Group();
      const ombre2 = new T.Mesh(geo, e.ombre);
      ombre2.position.set(0.07, -0.09, -0.04);
      ombre2.renderOrder = 1;
      const face = new T.Mesh(geo, e.mat);
      face.renderOrder = 2;
      g.add(ombre2, face);
      c.k3 = Math.random() * 0.4;
      bo.interieur.add(g);
      c.o3 = g;
      bo.badges.set(c, g);
    });
  };
  const texVraies = /* @__PURE__ */ new Map();
  const matVrai = (c, f) => {
    const cle = c.vrai.img;
    let e = texVraies.get(cle);
    if (!e) {
      e = { attente: [] };
      texVraies.set(cle, e);
      texPrivee(PRIVE_BA.bornes + cle, (t) => {
        e.mat = t && basique({ map: t, alphaTest: 0.5 });
        e.ombre = t && basique({ map: t, color: 0, transparent: true, opacity: PROFONDEUR_VRAIE.opaciteOmbre, depthWrite: false });
        e.pret = true;
        e.attente.splice(0).forEach((g) => g(e));
      });
    }
    if (e.pret) f(e);
    else e.attente.push(f);
  };
  const plaqueVraie = (bo, c) => {
    const I0 = bo.interieur;
    matVrai(c, (e) => {
      c.o3attente = false;
      if (!bo.interieur || bo.interieur !== I0) return;
      if (!e.mat) {
        c.vrai = null;
        return plaqueBadge(bo, c);
      }
      const d = 128 * c.ech * S, geo = garder(new T.PlaneGeometry(d, d)), g = new T.Group(), ox = -c.dc[0] * S, oy = c.dc[1] * S, Pf = profondeur();
      const ombre2 = new T.Mesh(geo, e.ombre);
      ombre2.position.set(ox + Pf.decalage[0] * d, oy + Pf.decalage[1] * d, -Pf.ombre * d);
      ombre2.renderOrder = 1;
      const face = new T.Mesh(geo, e.mat);
      face.position.set(ox, oy, 0);
      face.renderOrder = 2;
      g.add(ombre2, face);
      if (Pf.epaisseur > 0) {
        e.tranche ||= basique({ map: e.mat.map, color: Pf.tranche, alphaTest: 0.5 });
        const tr = tranche(geo, e.tranche, Pf.epaisseur * d);
        tr.position.set(ox, oy, 0);
        g.add(tr);
        g.userData.tranche = tr;
      }
      c.k3 = Math.random() * 0.4;
      bo.interieur.add(g);
      c.o3 = g;
      bo.badges.set(c, g);
    });
  };
  const NAISSANCE = 0.35;
  const BOUTON = { orange: new T.Color(16753178), blanc: new T.Color(16774876), lueurOrange: new T.Color(8008704), lueurBlanche: new T.Color(16773312), y: 0.9, ech: 0.55, enfonce: 0.32, onde: 0.35 };
  const animerBouton = (bo, m) => {
    const b = bo.meuble?.bouton;
    if (!b) return;
    const M_ = b.material, j = m.jeu, ici = vue === "machine" && bornes[sel] === bo;
    const etat = !ici || !j ? "repos" : j.etat === "deplacement" ? "tenu" : j.etat === "attente" && !gain ? "pret" : j.etat === "ouvrir" && j.t < BOUTON.onde ? "onde" : "eteint";
    const t = horloge;
    let lueur = 0.5, blanc = 0, ech = BOUTON.ech;
    if (etat === "pret") lueur = 0.8 + 0.5 * Math.sin(t * 4);
    else if (etat === "tenu") {
      blanc = 1;
      lueur = 1.6 + 0.3 * Math.sin(t * 18);
      ech = BOUTON.enfonce;
    } else if (etat === "onde") {
      const k = j.t / BOUTON.onde;
      blanc = 1 - k;
      lueur = 1.6 * (1 - k);
      ech = BOUTON.enfonce + (BOUTON.ech - BOUTON.enfonce) * lisse(k) + 0.08 * Math.sin(k * Math.PI);
    } else if (etat === "eteint") lueur = 0.08;
    M_.color.copy(BOUTON.orange).lerp(BOUTON.blanc, blanc);
    M_.emissive.copy(BOUTON.lueurOrange).lerp(BOUTON.lueurBlanche, blanc);
    M_.emissiveIntensity = lueur;
    b.scale.y = ech;
    b.position.y = BOUTON.y - (BOUTON.ech - ech) * 1.3;
  };
  const majInterieur = (bo, m) => {
    if (!bo.interieur || !m.monde) return;
    animerBouton(bo, m);
    if (bo.reflet) bo.reflet.visible = !(vue === "machine" && bornes[sel] === bo);
    const mo = m.monde, vus = /* @__PURE__ */ new Set(), proche = bornes[sel] === bo && vue !== "salle";
    for (const o of bo.profondeurs || []) o.visible = proche;
    for (const c of mo.corps) {
      if (!c.o3) plaqueBadge(bo, c);
      vus.add(c);
      const g = c.o3;
      if (!g) continue;
      const n = c.parts.length, x = c.parts.reduce((a, p) => a + p.x, 0) / n, y = c.parts.reduce((a, p) => a + p.y, 0) / n, [px, py] = versLocal(x, y);
      g.position.set(px, py, Z.badges + c.k3 - 0.2);
      g.rotation.z = -c.ang;
      g.visible = y < H + R_BADGE * 0.6;
      if (g.userData.tranche) g.userData.tranche.visible = proche;
      if (c.nait != null) {
        const k = (horloge - c.nait) / NAISSANCE;
        g.scale.setScalar(k >= 1 ? 1 : 0.01 + 1.15 * lisse(k / 0.7) - 0.15 * lisse((k - 0.7) / 0.3));
        if (k >= 1) c.nait = null;
      }
    }
    for (const [c, g] of bo.badges) if (!vus.has(c)) {
      g.removeFromParent();
      bo.badges.delete(c);
      c.o3 = null;
    }
    if (bo.accs && mo.accs) bo.accs.forEach((e, i) => {
      const a = mo.accs[i], g = e?.mesh;
      if (!g || !a) return;
      const q = a.lire();
      if (q.sorti) {
        g.visible = false;
        return;
      }
      const [px, py] = versLocal(...ecranVersMonde(q.x, q.y));
      g.position.x = px;
      g.position.y = py;
      g.rotation.z = -q.a;
    });
    if (bo.planche) {
      const sg = mo.segs.find((x) => x.bascule);
      if (sg) {
        const [cx, cy] = versLocal((sg.ax + sg.bx) / 2, (sg.ay + sg.by) / 2);
        bo.planche.position.set(cx, cy, (Z.terrain0 + Z.terrain1) / 2 + 0.5);
        bo.planche.rotation.z = -sg.angle || 0;
      }
    }
    if (bo.tapis) bo.tapis.offset.x = -(mo.t || 0) * (plateau(m).tapis.v * S / 0.5);
    const j = m.jeu, D = j.D, P = bo.pince;
    if (!D || !P) return;
    const w = (p) => versLocal(p[0], p[1]), nb = m.entrainement ? null : j.surprise ? "coeur" : totalParties();
    P.poser({ j, D, w, z: Z.pince, n: nb, clignote: j.etat === "deplacement" || j.etat === "transport" ? 0.5 + 0.5 * Math.sin(horloge * 14) : 0 });
    majCompteur(bo, m.entrainement ? null : totalParties());
  };
  const CLIGNOTE = new T.Color("#fff3a0");
  const poserPinceDessinee = (P, { j, D, w, z, n, clignote }) => {
    const [ax, ay] = w(D.anneau);
    P.anneau.position.set(ax, ay, z);
    P.anneau.rotation.z = -j.phi;
    P.afficheur.position.set(ax, ay, z + 0.2);
    P.afficheur.rotation.z = -j.phi;
    P.dos.position.set(ax, ay, z - 0.14);
    P.dos.rotation.z = -j.phi;
    const [t0x, t0y] = w(D.tete.slice(0, 2)), [t1x, t1y] = w(D.tete.slice(2));
    P.tete.position.set((t0x + t1x) / 2, (t0y + t1y) / 2, z);
    P.tete.rotation.z = Math.PI / 2 - j.phi;
    [D.g, D.d].forEach((f, i) => {
      const sg = i ? 1 : -1, e = w(D.R(sg * (MOYEU.demi + 14), -30)), c_ = w(f[1]), b_ = w(f[2]);
      poserSegment(P.bras[i * 2], e, c_, z + 0.04);
      poserSegment(P.bras[i * 2 + 1], c_, b_, z + 0.06);
      P.rotules[i * 2].position.set(e[0], e[1], z + 0.02);
      P.rotules[i * 2 + 1].position.set(c_[0], c_[1], z + 0.08);
      const dx = b_[0] - c_[0], dy = b_[1] - c_[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, k = FORME_PINCE.pointe[1] * S * K * 0.42;
      const a = Math.atan2(uy, ux) + (i ? -1 : 1) * 0.96;
      P.bouts[i].position.set(b_[0] + Math.cos(a) * k, b_[1] + Math.sin(a) * k, z + 0.06);
      P.bouts[i].rotation.z = a - Math.PI / 2;
    });
    const haut = VITRE.y1 + 0.6, sommet = ay + 40 * S * K;
    poserSegment(P.tige, [ax + Math.sin(j.phi) * (haut - sommet), haut], [ax, sommet], z - 0.02);
    poserSegment(P.manchon, [ax + Math.sin(j.phi) * (haut - sommet) * 0.12, sommet + (haut - sommet) * 0.1], [ax, sommet], z);
    P.matP.color.copy(P.base).lerp(CLIGNOTE, clignote * 0.55);
    if (n !== P.n) {
      P.n = n;
      dessinerAfficheur(P.xa, n);
      P.ta.needsUpdate = true;
    }
  };
  const TABLEAU = { badge: 4.8 };
  const construireTableau = () => {
    const gp = new T.Group();
    gp.visible = false;
    const l = VITRE.x1 - VITRE.x0, h = VITRE.y1 - VITRE.y0, cy = (VITRE.y0 + VITRE.y1) / 2;
    const [cr, xr] = toile(512, 512);
    xr.translate(256, 256);
    const halo = xr.createRadialGradient(0, 0, 10, 0, 0, 300);
    halo.addColorStop(0, "rgba(255,250,210,1)");
    halo.addColorStop(0.35, "rgba(255,226,110,.85)");
    halo.addColorStop(1, "rgba(255,200,60,0)");
    for (let i = 0; i < 18; i++) {
      xr.fillStyle = i % 2 ? "rgba(255,236,150,.55)" : "rgba(255,212,70,.75)";
      xr.beginPath();
      xr.moveTo(0, 0);
      xr.arc(0, 0, 360, i / 18 * Math.PI * 2, (i + 0.62) / 18 * Math.PI * 2);
      xr.closePath();
      xr.fill();
    }
    xr.fillStyle = halo;
    xr.fillRect(-256, -256, 512, 512);
    const tr = texture(cr, { bord: true });
    tr.center.set(0.5, 0.5);
    tr.repeat.set(1, h / l);
    tr.offset.set(0, (1 - h / l) / 2);
    const rayons = new T.Mesh(garder(new T.PlaneGeometry(l, h)), garder(new T.MeshBasicMaterial({ map: tr, transparent: true, depthWrite: false, opacity: 0.95 })));
    rayons.position.set(0, cy, VITRE.z - 0.5);
    rayons.renderOrder = 6;
    gp.add(rayons);
    const voile = new T.Mesh(garder(new T.PlaneGeometry(l, h)), garder(new T.MeshBasicMaterial({ color: "#fff6d0", transparent: true, opacity: 0.35, depthWrite: false })));
    voile.position.set(0, cy, VITRE.z - 0.55);
    voile.renderOrder = 5;
    gp.add(voile);
    const [ct, xt] = toile(1024, 200), tt = texture(ct, { bord: true, flipY: true });
    const texte = new T.Mesh(garder(new T.PlaneGeometry(l * 0.86, l * 0.86 * 200 / 1024)), garder(new T.MeshBasicMaterial({ map: tt, transparent: true, depthWrite: false })));
    texte.position.set(0, VITRE.y0 + h * 0.2, VITRE.z - 0.3);
    texte.renderOrder = 8;
    gp.add(texte);
    const image2 = new T.Mesh(garder(new T.PlaneGeometry(1, 1)), garder(new T.MeshBasicMaterial({ transparent: true, depthWrite: false })));
    image2.position.copy(texte.position);
    image2.renderOrder = 8;
    image2.visible = false;
    gp.add(image2);
    return { gp, rayons, voile, texte, image: image2, xt, tt, badges: [], t: 0 };
  };
  const IMAGE_TEXTE = 0.64, texturesIU = /* @__PURE__ */ new Map();
  const texIU = (im) => {
    let t = texturesIU.get(im);
    if (!t) {
      t = garder(new T.Texture(im));
      t.colorSpace = T.SRGBColorSpace;
      t.needsUpdate = true;
      texturesIU.set(im, t);
    }
    return t;
  };
  const poserImageTexte = (o, im, l) => {
    o.material.map = texIU(im);
    o.material.needsUpdate = true;
    o.userData.l = l * IMAGE_TEXTE;
    o.userData.h = l * IMAGE_TEXTE * im.height / im.width;
    o.visible = true;
  };
  const ecrireTableau = (t) => {
    const x = tableau.xt;
    x.clearRect(0, 0, 1024, 200);
    x.font = `italic 900 118px Nunito, sans-serif`;
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.lineJoin = "round";
    x.shadowColor = "rgba(255,250,220,.95)";
    x.shadowBlur = 26;
    x.lineWidth = 30;
    x.strokeStyle = "#fff6d6";
    x.strokeText(t, 512, 104);
    x.shadowBlur = 0;
    x.lineWidth = 16;
    x.strokeStyle = "#b5600f";
    x.strokeText(t, 512, 104);
    const g = x.createLinearGradient(0, 50, 0, 160);
    g.addColorStop(0, "#fff7b8");
    g.addColorStop(0.45, "#ffd83a");
    g.addColorStop(1, "#f2a50e");
    x.fillStyle = g;
    x.fillText(t, 512, 104);
    tableau.tt.needsUpdate = true;
  };
  const montrerTableau = (bo, corps, texte, im = null) => {
    tableau ||= construireTableau();
    const tb = tableau;
    bo.groupe.add(tb.gp);
    for (const b of tb.badges) b.removeFromParent();
    tb.badges = [];
    if (im) {
      tb.texte.visible = false;
      poserImageTexte(tb.image, im, VITRE.x1 - VITRE.x0);
    } else {
      tb.image.visible = false;
      tb.texte.visible = true;
      ecrireTableau(texte);
    }
    tb.gp.visible = true;
    tb.t = 0;
    const n = Math.min(4, corps.length), l = VITRE.x1 - VITRE.x0, d = Math.min(TABLEAU.badge, l * 0.8 / n);
    corps.slice(0, n).forEach((c, i) => (c.vrai ? (f) => matVrai(c, (e) => e.mat && f({ ...e, marge: 0 })) : (f) => matAutocollant(c.id, c.carton, f))((e) => {
      const [col, rang] = c.taille, k = d / Math.max(col, rang) / (1 - 2 * e.marge);
      const b = new T.Mesh(garder(new T.PlaneGeometry(k * col, k * rang)), e.mat);
      b.position.set((i - (n - 1) / 2) * d * 1.08, (VITRE.y0 + VITRE.y1) / 2 + 0.55, VITRE.z - 0.4);
      b.renderOrder = 7;
      b.userData.k = i;
      b.scale.setScalar(0.01);
      tb.gp.add(b);
      tb.badges.push(b);
    }));
  };
  const animerTableau = (dt) => {
    const tb = tableau;
    if (!tb?.gp.visible) return;
    tb.t += dt;
    tb.rayons.material.map.rotation -= dt * 0.35;
    const f = Math.min(1, tb.t / 0.25);
    tb.rayons.material.opacity = 0.95 * f;
    tb.voile.material.opacity = 0.35 * f;
    tb.texte.material.opacity = f;
    tb.image.material.opacity = f;
    const k_ = 0.7 + 0.3 * lisse(tb.t / 0.35) + 0.03 * Math.sin(tb.t * 6);
    tb.texte.scale.setScalar(k_);
    tb.image.scale.set(k_ * (tb.image.userData.l || 1), k_ * (tb.image.userData.h || 1), 1);
    for (const b of tb.badges) {
      const t = tb.t - 0.12 * b.userData.k, s = t < 0 ? 0.01 : t < 0.3 ? 1.2 * lisse(t / 0.3) : 1.2 - 0.2 * lisse((t - 0.3) / 0.2);
      b.scale.setScalar(Math.max(0.01, s * f));
      b.rotation.z = 0.06 * Math.sin(tb.t * 2 + b.userData.k);
    }
  };
  const cacherTableau = () => {
    if (tableau) {
      tableau.gp.visible = false;
      tableau.gp.removeFromParent();
    }
  };
  const AFFICHE = { duree: 1.6, entree: 0.35, rebond: 0.15, sortie: 0.3, attente: 0.6 };
  let affiche = null;
  const cacherAffiche = () => {
    affiche?.o.removeFromParent();
    affiche = null;
  };
  const montrerAffiche = (bo, im) => {
    cacherAffiche();
    if (!bo || !im) return;
    const l = (VITRE.x1 - VITRE.x0) * IMAGE_TEXTE, h = l * im.height / im.width;
    const o = new T.Mesh(garder(new T.PlaneGeometry(l, h)), garder(new T.MeshBasicMaterial({ map: texIU(im), transparent: true, depthWrite: false })));
    o.position.set(0, (VITRE.y0 + VITRE.y1) / 2, VITRE.z - 0.35);
    o.renderOrder = 9;
    o.scale.setScalar(0.01);
    bo.groupe.add(o);
    affiche = { o, t: 0 };
  };
  const animerAffiche = (dt) => {
    const a = affiche;
    if (!a) return;
    a.t += dt;
    const k = a.t, A = AFFICHE;
    if (k >= A.duree) return cacherAffiche();
    a.o.scale.setScalar(Math.max(0.01, k < A.entree ? 1.15 * lisse(k / A.entree) : 1.15 - 0.15 * lisse((k - A.entree) / A.rebond)));
    a.o.material.opacity = 1 - lisse((k - (A.duree - A.sortie)) / A.sortie);
  };
  const FIN_SEANCE = { duree: 3.2 };
  let finSeance = null;
  const montrerFinSeance = () => {
    const bo = bornes[sel];
    if (!bo) return false;
    montrerTableau(bo, session.corps.slice(-4), null, IU.touchez);
    finSeance = { fin: horloge + FIN_SEANCE.duree };
    majHud();
    return true;
  };
  const finirSeance = () => {
    if (!finSeance) return;
    finSeance = null;
    sonPince("touche");
    cacherTableau();
    revenir();
  };
  const NUAGE = { duree: 0.9, bouffees: 7, etoiles: 5 };
  const nuages = [];
  let geoBouffee = null, geoEtoile = null;
  const nuage = (bo, xChute) => {
    if (!bo?.interieur) return;
    geoBouffee ||= garder(new T.CircleGeometry(1, 20));
    geoEtoile ||= (() => {
      const f = new T.Shape();
      for (let i = 0; i <= 10; i++) {
        const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.45 : 1;
        f[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r);
      }
      return garder(new T.ShapeGeometry(f));
    })();
    const [x0] = versLocal(xChute != null ? clamp(xChute - 70, 10, W - 150) : PINCE.rebord + 20, 0), [x1] = versLocal(xChute != null ? clamp(xChute + 70, 150, W - 10) : W - 10, 0), y = SOL_VITRINE + 0.5, g = new T.Group(), parts = [];
    for (let k = 0; k < NUAGE.bouffees; k++) {
      const b = new T.Mesh(geoBouffee, new T.MeshBasicMaterial({ color: 16777215, transparent: true, depthWrite: false }));
      b.renderOrder = 4;
      b.position.set(x0 + (x1 - x0) * (k + 0.5) / NUAGE.bouffees, y, Z.badges + 0.6);
      g.add(b);
      parts.push({ o: b, vx: (Math.random() - 0.5) * 1.2, vy: 1.2 + Math.random() * 1.6, r: 0.5 + Math.random() * 0.35 });
    }
    for (let k = 0; k < NUAGE.etoiles; k++) {
      const e = new T.Mesh(geoEtoile, new T.MeshBasicMaterial({ color: 16769354, transparent: true, depthWrite: false }));
      e.renderOrder = 5;
      e.position.set(x0 + Math.random() * (x1 - x0), y + 0.4, Z.badges + 0.7);
      g.add(e);
      parts.push({ o: e, vx: (Math.random() - 0.5) * 3, vy: 3 + Math.random() * 2.5, r: 0.22, etoile: true });
    }
    bo.interieur.add(g);
    nuages.push({ g, parts, t: 0 });
  };
  const animerNuages = (dt) => {
    for (let i = nuages.length - 1; i >= 0; i--) {
      const n = nuages[i];
      n.t += dt;
      const k = n.t / NUAGE.duree;
      if (k >= 1 || !n.g.parent) {
        n.g.removeFromParent();
        n.parts.forEach((p) => p.o.material.dispose());
        nuages.splice(i, 1);
        continue;
      }
      for (const p of n.parts) {
        p.o.position.x += p.vx * dt;
        p.o.position.y += p.vy * dt * (1 - k * 0.7);
        if (p.etoile) p.vy -= 6 * dt;
        p.o.rotation.z += dt * 4;
        p.o.scale.setScalar(p.r * (p.etoile ? 1 : 0.6 + 1.4 * lisse(k * 2)));
        p.o.material.opacity = p.etoile ? 1 - k : 0.95 * (1 - lisse((k - 0.35) / 0.65));
      }
    }
  };
  const ACCORD = {
    luigi: { propre: 0.26, matiere: { rugosite: 0.55, reflets: 0.6 } },
    mii: {
      ambiante: new T.Color(0.78, 0.58, 0.46),
      diffuse: new T.Color(1.36, 1.01, 0.72),
      speculaire: new T.Color(0.25, 0.16, 0.1),
      tete: 8,
      // la lumière vise la tête (position du Mii + 8 en hauteur)
      ombre: [5.5, 4.5]
    },
    // l'ombre au sol (largeur, profondeur)
    SRGB_LIN: "vec3 pcvLin(vec3 c) { return mix(c / 12.92, pow((c + .055) / 1.055, vec3(2.4)), step(.04045, c)); }\n",
    RESCRUTER: 30
  };
  const miisSalle = /* @__PURE__ */ new Set(), qMii = new T.Vector3(), mCam = new T.Matrix4();
  let nImageMii = 0;
  const accorderMateriaux = (a) => a.objet.traverse((o) => {
    for (const mt of [o.material].flat()) {
      const u = mt?.uniforms;
      if (!u?.u_light_ambient) continue;
      if (u.u_light_dir.value !== a.dir) {
        u.u_light_ambient.value = ACCORD.mii.ambiante;
        u.u_light_diffuse.value = ACCORD.mii.diffuse;
        u.u_light_specular.value = ACCORD.mii.speculaire;
        u.u_light_dir.value = a.dir;
      }
      if (mt.userData.pcvLin || !/gl_FragColor\s*=\s*color\s*;/.test(mt.fragmentShader)) continue;
      mt.userData.pcvLin = true;
      mt.fragmentShader = mt.fragmentShader.replace(/void\s+main\s*\(/, ACCORD.SRGB_LIN + "void main(").replace(/gl_FragColor\s*=\s*color\s*;/, "gl_FragColor = vec4(pcvLin(clamp(color.rgb, 0., 1.)), color.a);");
      mt.needsUpdate = true;
    }
  });
  const accorderMii = (objet, o = {}) => {
    const a = { objet, dir: new T.Vector3(), cam: new T.Matrix4(), pos: new T.Vector3(NaN, 0, 0), ombre: null };
    if (o.ombre !== false) {
      a.ombre = ombre(0, 0, ...ACCORD.mii.ombre);
      scene.attach(a.ombre);
      a.ombre.userData.garder = true;
    }
    accorderMateriaux(a);
    miisSalle.add(a);
    return a;
  };
  const majMiiSalle = () => {
    if (!miisSalle.size) return;
    const relire = ++nImageMii % ACCORD.RESCRUTER === 0;
    camera.updateMatrixWorld();
    mCam.copy(camera.matrixWorld);
    for (const a of miisSalle) {
      if (!a.objet.parent) {
        a.ombre?.removeFromParent();
        miisSalle.delete(a);
        continue;
      }
      if (relire) accorderMateriaux(a);
      a.objet.getWorldPosition(qMii);
      if (qMii.equals(a.pos) && mCam.equals(a.cam)) continue;
      a.pos.copy(qMii);
      a.cam.copy(mCam);
      if (a.ombre) a.ombre.position.set(qMii.x, (qMii.y > 1 ? qMii.y - 5.2 : qMii.y) + 0.06, qMii.z);
      qMii.y += ACCORD.mii.tete;
      a.dir.copy(DOUCHE).sub(qMii).normalize().transformDirection(camera.matrixWorldInverse);
    }
  };
  let luigiObj = null, trajet = null, luigiOmbre = null;
  const OS_PAQUET = "card_lmodel";
  const cartesDeLuigi = () => {
    let m = null;
    luigiObj?.traverse((o) => {
      if (o.isMesh && o.material?.name === "cartes") m = o;
    });
    return m;
  };
  const cartesLuigi = (oui) => {
    const m = cartesDeLuigi();
    if (m) m.visible = !!oui;
  };
  const mainLuigi = () => {
    const m = cartesDeLuigi();
    if (!m?.isSkinnedMesh) return null;
    let l = m.userData.sommetsPaquet;
    if (!l) {
      const k = m.skeleton.bones.findIndex((b) => b.name === OS_PAQUET), si = m.geometry.attributes.skinIndex, sw = m.geometry.attributes.skinWeight;
      l = m.userData.sommetsPaquet = [];
      if (k >= 0) {
        for (let i = 0; i < si.count; i++) for (let j = 0; j < 4; j++) if (si.getComponent(i, j) === k && sw.getComponent(i, j) > 0.5) l.push(i);
      }
    }
    if (!l.length) return null;
    luigiObj.updateMatrixWorld(true);
    const c = vec(0, 0, 0), v = vec(0, 0, 0), os = m.applyBoneTransform || m.boneTransform;
    for (const i of l) {
      v.fromBufferAttribute(m.geometry.attributes.position, i);
      os.call(m, i, v);
      c.add(m.localToWorld(v));
    }
    return c.divideScalar(l.length);
  };
  const poserLuigi = async () => {
    const voulu = opts.luigi || lire("pcv-casino-luigi", "ds"), modeles = [voulu === "ds" ? null : window.__pcvLuigiWonder, window.__pcvLuigiVrai].filter(Boolean);
    luigiObj = new T.Group();
    luigiObj.name = "Luigi";
    luigiObj.position.copy(LUIGI.pos);
    scene.add(luigiObj);
    let chance = 0.05;
    try {
      const c = localStorage.getItem("pcv-casino-luigi-mii-chance");
      if (c != null) chance = +c;
    } catch (e) {
    }
    if (window.__pcvVraisMii && Math.random() < chance) try {
      const l = await fabriquerLuigiMii(luigiObj);
      if (!ouvert) {
        l.liberer();
        return null;
      }
      luigi = l;
      luigiOmbre = ombre(LUIGI.pos.x, LUIGI.pos.z, 7, 5);
      scene.attach(luigiOmbre);
      luigiOmbre.userData.garder = true;
      return l;
    } catch (e) {
      console.warn("casino : le Luigi en Mii n'a pas pu venir", e);
    }
    for (const V of modeles) {
      const ds = V === window.__pcvLuigiVrai;
      try {
        const l = await V.fabriquer(rendu, luigiObj, {
          lire: opts.lire,
          taille: LUIGI.taille,
          appui: (TABLE - LUIGI.pos.y) / LUIGI.taille,
          sol: (x, z) => solSalle(vec(x, 0, z)),
          vivant: false,
          teint: { lumiere: new T.Color(0.9, 0.88, 0.86), propre: ds ? ACCORD.luigi.propre : 0.32 },
          matiere: ds ? ACCORD.luigi.matiere : null
        });
        if (!ouvert) {
          l.liberer();
          return null;
        }
        luigiObj.traverse((o) => {
          if (o.isMesh) {
            o.castShadow = true;
            o.receiveShadow = ds;
            if (!ds) {
              for (const m of [o.material].flat()) if (m && "envMapIntensity" in m) m.envMapIntensity = 0.22;
            }
          }
        });
        cartesLuigi(false);
        luigi = l;
        luigiOmbre = ombre(LUIGI.pos.x, LUIGI.pos.z, 7, 5);
        scene.attach(luigiOmbre);
        luigiOmbre.userData.garder = true;
        return l;
      } catch (e) {
        console.warn("casino : un mod\xE8le de Luigi manque", e);
      }
    }
    luigiObj.removeFromParent();
    luigiObj = null;
    return null;
  };
  const GESTES_MII = {
    accueil: "saluer",
    salut: "saluer",
    designer: "salut",
    gagne: "content",
    bravo: "applaudir",
    rate: "hausser",
    presque: "frotter",
    battu: "frotter",
    triomphe: "content",
    cartes: "parler",
    astiquer: "parler",
    noeud: "yeux",
    regarde: "yeux",
    salle: "yeux",
    ouvrir: "tenir"
  };
  const TENUE_LUIGI_MII = ["casquette-luigi", "gilet-croupier", "noeud-vert"];
  const fabriquerLuigiMii = async (parent) => {
    const V = window.__pcvVraisMii, M = window.__pcvMii3D?.vrais ? window.__pcvMii3D : await V?.charger?.();
    if (!M) throw new Error("moteur des Mii absent");
    const j = JSON.parse(new TextDecoder().decode(await octets("mii/luigi-switch.json", "application/json")));
    let ecl = "wiiu";
    try {
      ecl = localStorage.getItem("pcv-casino-luigi-mii-eclairage") || ecl;
    } catch (e) {
    }
    const m = M.creer({ donnees: j.donnees, couleursSwitch: j.couleurs_switch, rendu, eclairage: ecl, tenue: TENUE_LUIGI_MII, resolution: 512 });
    parent.add(m.objet);
    m.regler(LUIGI.taille);
    m.jouer("repos");
    const lineariser = () => m.objet.traverse((x) => {
      for (const mt of [x.material].flat()) if (mt?.isShaderMaterial && !mt.uniforms?.u_light_ambient && !mt.userData.pcvLin) {
        mt.userData.pcvLin = true;
        const avant = mt.onBeforeCompile;
        mt.onBeforeCompile = (sh, r) => {
          avant?.call(mt, sh, r);
          sh.fragmentShader = sh.fragmentShader.replace(/}\s*$/, "  gl_FragColor.rgb = pow(max(gl_FragColor.rgb, vec3(0.)), vec3(2.2));\n}");
        };
        mt.customProgramCacheKey = () => (mt.type || "") + "-pcv-lin";
        mt.needsUpdate = true;
      }
    });
    lineariser();
    setTimeout(lineariser, 1500);
    accorderMii(m.objet, { ombre: false });
    const L = { objet: m.objet, m, appui: null, porte: false, geste: null, avant: null, allure: "repos", tGeste: 0 };
    const vp = new T.Vector3();
    L.maj = (dt) => {
      parent.getWorldPosition(vp);
      const v = L.avant && dt > 0 ? vp.distanceTo(L.avant) / dt : 0;
      L.avant = (L.avant || new T.Vector3()).copy(vp);
      if (L.geste && (L.tGeste += dt) > 1.9) L.finir();
      const voulu = v > 12 ? "courir" : v > 0.6 ? L.porte ? "porterMarche" : "marcher" : L.geste ? GESTES_MII[L.geste.nom] || "repos" : L.porte ? "porter" : "repos";
      if (voulu !== L.allure) {
        L.allure = voulu;
        m.jouer(voulu);
      }
      m.maj(dt);
    };
    L.reagir = (nom, o = {}) => {
      if (nom === "porter") {
        L.porte = true;
        return Promise.resolve();
      }
      if (nom === "attente") return Promise.resolve();
      L.finir();
      if (o.vers) m.regarder(o.vers);
      return new Promise((fin) => {
        L.geste = { nom, fin };
        L.tGeste = 0;
      });
    };
    L.finir = () => {
      L.porte = false;
      const g = L.geste;
      L.geste = null;
      g?.fin();
    };
    L.regarder = (v) => m.regarder(v);
    L.regler = () => {
    };
    L.appuyer = (f) => {
      L.appui = f ?? null;
    };
    L.elan = () => {
    };
    L.coupDOeil = () => {
      const a = parent.localToWorld(new T.Vector3((Math.random() - 0.5) * 30, 9, 20));
      m.regarder(a);
    };
    L.dire = () => Promise.resolve();
    L.liberer = () => {
      L.finir();
      m.liberer();
      m.objet.removeFromParent();
    };
    return L;
  };
  const AVEC_CARTES = (nom) => nom === "cartes" || (nom === "astiquer" || nom === "noeud") && luigi?.appui != null;
  const geste = (nom, o) => {
    if (!luigi) return;
    if (AVEC_CARTES(nom) && jeuOuvert !== "cartes" && jeuOuvert !== "table") nom = "salle";
    voix(nom);
    return luigi.reagir(nom, { silence: true, ...o }).catch(() => {
    });
  };
  const ARRIERE = pres(-3, -7), DEVANT = 24;
  const COIN = ST(30, 10);
  const devant = (bo) => monde(bo, 15.6, 0, DEVANT).setY(0);
  const aTable = (q) => Math.hypot(q.x - LUIGI.pos.x, q.z - LUIGI.pos.z) < 6;
  const borneDe = (q) => bornes.findIndex((bo) => placeLuigi(bo).distanceTo(vec(q.x, 0, q.z)) < 3);
  const etapesVers = (de, i) => {
    const k = borneDe(de), l = Math.hypot(de.x - MEUBLE.pos.x, de.z - MEUBLE.pos.z) < 30 ? [COIN.clone()] : [];
    if (k >= 0 && k !== i) l.push(devant(bornes[k]));
    if (aTable(de) && i != null) l.push(ARRIERE.clone());
    if (i == null) {
      if (!aTable(de)) l.push(ARRIERE.clone());
      l.push(LUIGI.pos.clone().setY(0));
    } else {
      if (k >= 0 && k !== i) l.push(devant(bornes[i]));
      l.push(placeLuigi(bornes[i]));
    }
    return l;
  };
  const longueur = (de, l) => l.reduce((a, q, k) => a + Math.hypot(q.x - (k ? l[k - 1] : de).x, q.z - (k ? l[k - 1] : de).z), 0);
  const GRILLE = { pas: 0.5, marge: 2, bas: 1.3, haut: 11 };
  let grille = null;
  const construireGrille = () => {
    const G2 = GRILLE, x0 = OCT.c.x - OCT.r - 3, z0 = OCT.c.z - OCT.r - 3, n = Math.ceil((2 * OCT.r + 6) / G2.pas);
    const plein = new Uint8Array(n * n), a = vec(0, 0, 0), b = vec(0, 0, 0), c = vec(0, 0, 0);
    const marquer = (i, k) => {
      if (i >= 0 && k >= 0 && i < n && k < n) plein[k * n + i] = 1;
    };
    const segment = (p, q) => {
      const m = Math.ceil(Math.max(Math.abs(q.x - p.x), Math.abs(q.z - p.z)) / G2.pas * 2) + 1;
      for (let j = 0; j <= m; j++) {
        const t = j / m;
        marquer(Math.floor((p.x + (q.x - p.x) * t - x0) / G2.pas), Math.floor((p.z + (q.z - p.z) * t - z0) / G2.pas));
      }
    };
    const croix = (p, q, x, z) => (q.x - p.x) * (z - p.z) - (q.z - p.z) * (x - p.x);
    const tri = (p, q, r) => {
      if (Math.max(p.y, q.y, r.y) < G2.bas || Math.min(p.y, q.y, r.y) > G2.haut) return;
      segment(p, q);
      segment(q, r);
      segment(r, p);
      const d = croix(p, q, r.x, r.z);
      if (Math.abs(d) < 1e-4) return;
      const i0 = Math.max(0, Math.floor((Math.min(p.x, q.x, r.x) - x0) / G2.pas)), i1 = Math.min(n - 1, Math.floor((Math.max(p.x, q.x, r.x) - x0) / G2.pas));
      const k0 = Math.max(0, Math.floor((Math.min(p.z, q.z, r.z) - z0) / G2.pas)), k1 = Math.min(n - 1, Math.floor((Math.max(p.z, q.z, r.z) - z0) / G2.pas));
      for (let k = k0; k <= k1; k++) for (let i = i0; i <= i1; i++) {
        const x = x0 + (i + 0.5) * G2.pas, z = z0 + (k + 0.5) * G2.pas;
        const s1 = croix(p, q, x, z) * d, s2 = croix(q, r, x, z) * d, s3 = croix(r, p, x, z) * d;
        if (s1 >= 0 && s2 >= 0 && s3 >= 0) plein[k * n + i] = 1;
      }
    };
    const sources = [decor, ...bornes.map((bo) => bo.groupe), meuble?.groupe].filter(Boolean);
    for (const src of sources) {
      src.updateMatrixWorld(true);
      src.traverse((o) => {
        if (!o.isMesh || o.isInstancedMesh || !o.geometry?.attributes.position) return;
        const P = o.geometry.attributes.position, I = o.geometry.index, m = o.matrixWorld, nb = I ? I.count : P.count;
        for (let j = 0; j + 2 < nb; j += 3) {
          const ia = I ? I.getX(j) : j, ib = I ? I.getX(j + 1) : j + 1, ic = I ? I.getX(j + 2) : j + 2;
          a.fromBufferAttribute(P, ia).applyMatrix4(m);
          b.fromBufferAttribute(P, ib).applyMatrix4(m);
          c.fromBufferAttribute(P, ic).applyMatrix4(m);
          tri(a, b, c);
        }
      });
    }
    const D = new Float32Array(n * n);
    for (let j = 0; j < n * n; j++) D[j] = plein[j] ? 0 : 1e9;
    const passe2 = (sens) => {
      for (let kk = 0; kk < n; kk++) {
        const k = sens > 0 ? kk : n - 1 - kk;
        for (let ii = 0; ii < n; ii++) {
          const i = sens > 0 ? ii : n - 1 - ii, j = k * n + i;
          for (const [di, dk, c_] of [[-1, 0, 3], [0, -1, 3], [-1, -1, 4], [1, -1, 4]]) {
            const i2 = i + di * sens, k2 = k + dk * sens;
            if (i2 < 0 || k2 < 0 || i2 >= n || k2 >= n) continue;
            const v = D[k2 * n + i2] + c_;
            if (v < D[j]) D[j] = v;
          }
        }
      }
    };
    passe2(1);
    passe2(-1);
    const libre = new Uint8Array(n * n);
    for (let j = 0; j < n * n; j++) libre[j] = D[j] / 3 * G2.pas > G2.marge ? 1 : 0;
    return grille = { n, x0, z0, libre, plein };
  };
  const caseDe = (p) => {
    const G2 = grille;
    return [Math.floor((p.x - G2.x0) / GRILLE.pas), Math.floor((p.z - G2.z0) / GRILLE.pas)];
  };
  const centreCase = (i, k) => vec(grille.x0 + (i + 0.5) * GRILLE.pas, 0, grille.z0 + (k + 0.5) * GRILLE.pas);
  const estLibre = (i, k) => i >= 0 && k >= 0 && i < grille.n && k < grille.n && grille.libre[k * grille.n + i] === 1;
  const vue_ = (p, q) => {
    const l = Math.hypot(q.x - p.x, q.z - p.z), m = Math.ceil(l / (GRILLE.pas * 0.5)) + 1;
    for (let j = 0; j <= m; j++) {
      const t = j / m, [i, k] = caseDe(vec(p.x + (q.x - p.x) * t, 0, p.z + (q.z - p.z) * t));
      if (!estLibre(i, k)) return false;
    }
    return true;
  };
  const caseLibre = (p) => {
    const [i0, k0] = caseDe(p);
    if (estLibre(i0, k0)) return [i0, k0];
    for (let r = 1; r < 24; r++) {
      let mieux = null, dm = 1e9;
      for (let k = k0 - r; k <= k0 + r; k++) for (let i = i0 - r; i <= i0 + r; i++) {
        if (Math.max(Math.abs(i - i0), Math.abs(k - k0)) !== r || !estLibre(i, k)) continue;
        const d = (i - i0) ** 2 + (k - k0) ** 2;
        if (d < dm) {
          dm = d;
          mieux = [i, k];
        }
      }
      if (mieux) return mieux;
    }
    return [i0, k0];
  };
  const planifier = (de, a) => {
    if (!grille) construireGrille();
    const n = grille.n, [si, sk] = caseLibre(de), [bi, bk] = caseLibre(a), depart = sk * n + si, but = bk * n + bi;
    const fin = vec(a.x, 0, a.z);
    if (depart === but || vue_(centreCase(si, sk), centreCase(bi, bk))) return vue_(de, fin) || Math.hypot(centreCase(si, sk).x - de.x, centreCase(si, sk).z - de.z) < 0.8 ? [fin] : [centreCase(si, sk), fin];
    const g = new Float32Array(n * n).fill(1e9), venu = new Int32Array(n * n).fill(-1), ferme = new Uint8Array(n * n), tas = [];
    const h = (j) => Math.hypot(j % n - bi, Math.floor(j / n) - bk);
    const pousser = (j, f) => {
      tas.push([f, j]);
      let x2 = tas.length - 1;
      while (x2 > 0) {
        const p = x2 - 1 >> 1;
        if (tas[p][0] <= tas[x2][0]) break;
        [tas[p], tas[x2]] = [tas[x2], tas[p]];
        x2 = p;
      }
    };
    const tirer = () => {
      const t = tas[0], d = tas.pop();
      if (tas.length) {
        tas[0] = d;
        let x2 = 0;
        for (; ; ) {
          const l = 2 * x2 + 1, r = l + 1;
          let m = x2;
          if (l < tas.length && tas[l][0] < tas[m][0]) m = l;
          if (r < tas.length && tas[r][0] < tas[m][0]) m = r;
          if (m === x2) break;
          [tas[m], tas[x2]] = [tas[x2], tas[m]];
          x2 = m;
        }
      }
      return t[1];
    };
    g[depart] = 0;
    pousser(depart, h(depart));
    let trouve = false;
    while (tas.length) {
      const j = tirer();
      if (ferme[j]) continue;
      ferme[j] = 1;
      if (j === but) {
        trouve = true;
        break;
      }
      const i = j % n, k = (j - i) / n;
      for (let dk = -1; dk <= 1; dk++) for (let di = -1; di <= 1; di++) {
        if (!di && !dk) continue;
        const i2 = i + di, k2 = k + dk;
        if (!estLibre(i2, k2)) continue;
        if (di && dk && (!estLibre(i + di, k) || !estLibre(i, k + dk))) continue;
        const j2 = k2 * n + i2, c_ = g[j] + (di && dk ? Math.SQRT2 : 1);
        if (c_ < g[j2]) {
          g[j2] = c_;
          venu[j2] = j;
          pousser(j2, c_ + h(j2));
        }
      }
    }
    if (!trouve) return [fin];
    const cases = [];
    for (let j = but; j !== -1; j = venu[j]) cases.push(centreCase(j % n, Math.floor(j / n)));
    cases.reverse();
    const tendu = [cases[0]];
    let x = 0;
    while (x < cases.length - 1) {
      let y = cases.length - 1;
      while (y > x + 1 && !vue_(cases[x], cases[y])) y--;
      tendu.push(cases[y]);
      x = y;
    }
    tendu[tendu.length - 1] = fin;
    if (Math.hypot(tendu[0].x - de.x, tendu[0].z - de.z) < 0.8 || tendu.length > 1 && vue_(de, tendu[1])) tendu.shift();
    return tendu;
  };
  const ALLURE_C = { course: { vmax: 23, acc: 50, frein: 52 }, marche: { vmax: 7.5, acc: 22, frein: 24 }, seuilCourse: 12, elan: 0.14, virage: 11 };
  const allureDe = (l) => l > ALLURE_C.seuilCourse ? ALLURE_C.course : ALLURE_C.marche;
  const vitesseVoulue = (A_, p, ch) => {
    const c = ch[0], d = vec(c.x - p.x, 0, c.z - p.z), l = d.length();
    let v = Math.min(A_.vmax, Math.sqrt(2 * A_.frein * (l + longueur(c, ch.slice(1)))));
    if (ch.length > 1 && l > 1e-3) {
      const s2 = vec(ch[1].x - c.x, 0, ch[1].z - c.z).normalize(), angle = Math.acos(clamp(d.normalize().dot(s2), -1, 1));
      v = Math.min(v, Math.sqrt((A_.vmax * clamp(1 - angle / 2.2, 0.3, 1)) ** 2 + 2 * A_.frein * l));
    }
    return v;
  };
  const avancerSur = (p, ch, pas_) => {
    while (pas_ > 0 && ch.length) {
      const c = ch[0], dd = vec(c.x - p.x, 0, c.z - p.z), ll = dd.length();
      if (ll <= pas_ && ch.length > 1) {
        p.set(c.x, p.y, c.z);
        pas_ -= ll;
        ch.shift();
      } else {
        p.addScaledVector(dd, Math.min(1, pas_ / Math.max(ll, 1e-6)));
        pas_ = 0;
      }
    }
  };
  const eta = (de, chemin) => {
    const ch = chemin.map((q) => q.clone()), p = de.clone(), A_ = allureDe(longueur(de, ch));
    let v = 0, t = ALLURE_C.elan;
    for (let k = 0; k < 900; k++) {
      const c = ch[ch.length - 1];
      if (ch.length === 1 && Math.hypot(c.x - p.x, c.z - p.z) < 0.02) break;
      v = Math.min(vitesseVoulue(A_, p, ch), v + A_.acc / 60);
      avancerSur(p, ch, v / 60);
      t += 1 / 60;
    }
    return t;
  };
  const COULOIR = { x0: -GUICHET.long / 2, x1: GUICHET.long / 2 - 2.6, z0: GUICHET.meuble + 1.6, z1: GUICHET.avance - 1.2 };
  const dansCouloir = (q) => {
    const l = auGuichet(q);
    return l.x > COULOIR.x0 - 0.5 && l.x < COULOIR.x1 + 0.5 && l.z > COULOIR.z0 - 0.5 && l.z < COULOIR.z1 + 0.5;
  };
  const BOUT = () => guichetEn(COULOIR.x0 + 1.5, GUICHET.couloir), PORTE = () => guichetEn(COULOIR.x0 - GUICHET.porte, GUICHET.couloir);
  const dansLeCouloir = (x) => clamp(x, COULOIR.x0 + 1, COULOIR.x1 - 1);
  const placeGuichet = () => guichetEn(0, GUICHET.luigi);
  const ACCOUDE = () => ({ appui: true, regard: guichetEn(0, GUICHET.luigi + 50, 11), tete: GUICHET.regard.clone() });
  const cheminLuigi = (de, a) => {
    const fin = vec(a.x, 0, a.z), i = dansCouloir(de), j = dansCouloir(a);
    if (i && j) return [fin];
    if (i) return [BOUT(), PORTE(), ...planifier(PORTE(), a)];
    if (j) return [...planifier(de, PORTE()), BOUT(), fin];
    return planifier(de, a);
  };
  const allerLuigi = (etapes, o = {}) => {
    if (!luigiObj) return;
    const p = luigiObj.position, but = etapes[etapes.length - 1], chemin = cheminLuigi(p, but);
    trajet = { chemin, l: longueur(p, chemin), allure: allureDe(longueur(p, chemin)), v: 0, attente: ALLURE_C.elan, table: !!o.table, appui: !!o.appui, regard: o.regard || null, tete: o.tete || null, arrivee: o.arrivee || null };
    if (chemin.length && trajet.l > 0.3) luigi?.elan?.(chemin[0].clone().setY(LUIGI.taille * 0.8));
    luigi?.appuyer(null);
    luigi?.finir?.();
  };
  const majLuigi = (dt) => {
    if (!luigiObj) return;
    const p = luigiObj.position, tr = trajet;
    if (tr) {
      const ch = tr.chemin;
      while (ch.length > 1 && Math.hypot(ch[0].x - p.x, ch[0].z - p.z) < 0.05) ch.shift();
      const cible = ch[0], d = vec(cible.x - p.x, 0, cible.z - p.z), l = d.length();
      if (l > 0.02 || ch.length > 1) {
        const cap = Math.atan2(d.x, d.z), ecart = Math.abs(ecartAngle(luigiObj.rotation.y, cap));
        if (tr.attente > 0 || tr.v < 0.5 && ecart > 1.65) {
          tr.attente -= dt;
          luigiObj.rotation.y = tournerVers(luigiObj.rotation.y, cap, 9, dt);
        } else {
          tr.v = Math.min(vitesseVoulue(tr.allure, p, ch), tr.v + tr.allure.acc * dt);
          avancerSur(p, ch, tr.v * dt);
          const vise = ch[0], dv = vec(vise.x - p.x, 0, vise.z - p.z), reste = dv.length() + longueur(vise, ch.slice(1));
          if (dv.length() > 0.05) {
            let a = Math.atan2(dv.x, dv.z);
            if (tr.regard && ch.length === 1) {
              const ar = Math.atan2(tr.regard.x - p.x, tr.regard.z - p.z);
              a += ecartAngle(a, ar) * lisse(1 - reste / 6) * 0.85;
            }
            luigiObj.rotation.y = tournerVers(luigiObj.rotation.y, a, ALLURE_C.virage, dt);
          }
        }
      } else {
        const vise = tr.regard ? Math.atan2(tr.regard.x - p.x, tr.regard.z - p.z) : luigiObj.rotation.y;
        tr.v = 0;
        luigiObj.rotation.y = tournerVers(luigiObj.rotation.y, vise, 7, dt);
        if (Math.abs(ecartAngle(luigiObj.rotation.y, vise)) < 0.05) {
          trajet = null;
          if (tr.table) {
            luigi?.appuyer((TABLE - LUIGI.pos.y) / LUIGI.taille);
            luigi?.regarder(PLANS.salle().pos.clone().setY(11));
          } else if (tr.appui) {
            luigi?.appuyer((GUICHET.haut - LUIGI.pos.y) / LUIGI.taille);
            if (tr.tete || tr.regard) luigi?.regarder(tr.tete || tr.regard);
          }
          tr.arrivee?.();
        }
      }
      p.y = solSalle(p);
    }
    vivre(dt);
    if (luigiOmbre) {
      luigiOmbre.position.x = p.x;
      luigiOmbre.position.z = p.z;
      luigiOmbre.rotation.z = -luigiObj.rotation.y;
    }
    luigi?.maj(dt);
  };
  let repos = 2.5;
  const vivre = (dt) => {
    if (!luigi) return;
    const enPartie = vue === "machine" && mJeu?.jeu && !["attente", "repos"].includes(mJeu.jeu.etat);
    if (enPartie) {
      const bo = bornes[sel], D = mJeu.jeu.D;
      if (bo && D) {
        const [x, y] = versLocal(...D.anneau);
        luigi.regarder(monde(bo, x, y, Z.pince));
      }
      repos = 2;
      vivre.suit = true;
      return;
    }
    if (vivre.suit) {
      vivre.suit = false;
      luigi.regarder(camera.position.clone());
    }
    if (trajet || luigi.geste || coffre || bulle?.bloque) {
      repos = Math.max(repos, 2.5);
      return;
    }
    if ((repos -= dt) > 0) return;
    repos = 3.5 + Math.random() * 3.5;
    const auComptoir = aTable(luigiObj.position), r = Math.random();
    if (auComptoir) {
      if (r < 0.4) geste("salle");
      else if (r < 0.65) geste("regarde");
      else luigi.coupDOeil();
    } else if (vue === "machine" || vue === "rangee") {
      const bo = bornes[sel];
      if (r < 0.3) luigi.coupDOeil();
      else if (r < 0.48) geste("noeud");
      else if (r < 0.62) geste("regarde");
      else if (bo) {
        luigi.regarder(centreVitre(bo));
        setTimeout(() => luigi?.regarder(camera?.position.clone()), 1400);
      }
    } else luigi.coupDOeil();
  };
  const ecartAngle = (a, b) => {
    let d = (b - a) % (2 * Math.PI);
    if (d > Math.PI) d -= 2 * Math.PI;
    if (d < -Math.PI) d += 2 * Math.PI;
    return d;
  };
  const tournerVers = (a, b, k, dt) => a + ecartAngle(a, b) * (1 - Math.exp(-k * dt));
  const luigiVersBorne = (i, presenter = true, cam = PLANS.rangee(i).pos, apres2 = null) => {
    const bo = bornes[i];
    if (!bo || !luigiObj) return apres2?.();
    allerLuigi(etapesVers(luigiObj.position, i), { regard: cam, arrivee: () => {
      luigi?.regarder(cam);
      if (apres2) return apres2();
      if (presenter && i === sel && vue === "rangee") {
        geste("designer", { vers: centreVitre(bo) });
        presenterBorne(i);
      }
    } });
  };
  const tournerLuigiVers = (cam) => {
    if (!luigiObj) return;
    luigi?.regarder(cam);
    if (!trajet) allerLuigi([luigiObj.position.clone()], { regard: cam });
    else trajet.regard = cam;
  };
  const luigiVersTable = () => luigiObj && allerLuigi(etapesVers(luigiObj.position, null), { table: true, regard: PLANS.salle().pos, arrivee: () => vue === "salle" && geste("accueil") });
  const sonde = new T.Raycaster();
  const recul = (bo, c, dmax) => {
    if (bo.recul) return bo.recul;
    const meubles = [];
    decor?.traverse((o) => {
      if (MEUBLES.includes(o.name)) meubles.push(o);
    });
    const bas = c.clone().add(vec(0, -5, 0)), vise = [c, bas, c.clone().addScaledVector(bo.u, -6), c.clone().addScaledVector(bo.u, 6)];
    for (let d = dmax; d > 8; d -= 1) for (let h = 0; h <= 4; h += 2) {
      const cam = c.clone().addScaledVector(bo.n, d).add(vec(0, 3 * d / dmax + h, 0));
      const libre = vise.every((q) => {
        const dir = q.clone().sub(cam), l = dir.length();
        sonde.set(cam, dir.normalize());
        sonde.far = l;
        return !sonde.intersectObjects(meubles, true).length;
      });
      if (libre) return bo.recul = { d, h };
    }
    return bo.recul = { d: 8, h: 0 };
  };
  const PLANS = {
    // l'entrée : à l'ouverture du casino, un plan d'ensemble depuis les portes (le plafond étoilé, la coupole, le lustre,
    // la salle) qui glisse jusqu'au comptoir ; c'est la seule vue d'où l'on voit le haut de la salle
    entree: () => ({ pos: ST(4, 74, 20), cible: ST(12, -20, 22), fov: 50 }),
    // l'écran du haut du jeu de cartes : Luigi derrière sa table, la rangée de bornes à gauche derrière lui
    // (étape 2 : reculée, pour que Luigi garde une taille normale pendant ses gestes ; le salut casquette levée tient dans
    // le cadre ; avant : pres(0, 29.4, 13.2), visée pres(-.5, 0, 9.4), 34°)
    salle: () => ({ pos: pres(0, 38, 14), cible: pres(-1.5, 0, 9.6), fov: 36 }),
    // debout face à une borne : elle au centre, ses voisines à moitié (comme le hall de Badge Arcade), Luigi à sa droite
    // (près d'un meuble, la caméra s'approche et ouvre l'angle pour garder le même cadrage)
    // (bornes plus hautes que Luigi depuis le 7/10 au soir : on recule un peu, le fronton et la figurine restent dans l'image)
    rangee: (i) => {
      const bo = bornes[i], c = centreVitre(bo).addScaledVector(bo.u, 2.5), { d, h } = recul(bo, c, 36);
      return { pos: c.clone().addScaledVector(bo.n, d).add(vec(0, 2.4 * d / 36 + h, 0)), cible: c.clone().add(vec(0, 0.8 + h * 0.25, 0)), fov: 2 * Math.atan(Math.tan(18.5 * Math.PI / 180) * 36 / d) * 180 / Math.PI };
    },
    // devant la borne : du fronton au pupitre, la vitrine au milieu (on vise, on attend) ; Luigi, à droite de la borne,
    // reste juste hors du cadre (il mesure plus que la borne : dans le champ, il le remplirait) ; pendant la partie, la
    // vitrine remplit l'image
    machine: (i) => {
      const bo = bornes[i], c = centreVitre(bo);
      return { pos: c.clone().addScaledVector(bo.n, 20.5).addScaledVector(bo.u, -1.1).add(vec(0, 1.6, 0)), cible: c.clone().addScaledVector(bo.u, -1.1).add(vec(0, 0.9, 0)), fov: 33 };
    },
    // (la vitrine entière dans l'image, de la pince en haut à la goulotte en bas)
    // (8/10, retour de l'auteur : « quand on perd, on ne voit pas Luigi ») : le plan de la réaction, juste après le résultat
    // d'une partie : la caméra recule et se décale vers Luigi, debout à droite de la borne, qui se réjouit ou se désole ;
    // la vitrine reste à gauche de l'image (comme le lapin de Badge Arcade à côté de la machine), puis retour à la vitrine
    reaction: (i) => {
      const bo = bornes[i], c = centreVitre(bo), L = placeLuigi(bo).add(vec(0, LUIGI.debout * 0.62, 0)), m = c.clone().lerp(L, 0.5);
      return { pos: m.clone().addScaledVector(bo.n, 33).add(vec(0, 2.5, 0)), cible: m.clone().add(vec(0, -0.4, 0)), fov: 34 };
    },
    // (16/10) la hauteur ET la largeur de la zone de jeu tiennent dans l'image, quel que soit le rapport de l'écran
    partie: (i) => {
      const bo = bornes[i], c = centreVitreCadrage(bo), t = 2 * Math.tan(16.5 * Math.PI / 180), hv = (VITRE_CADRAGE.y1 - VITRE_CADRAGE.y0) * RANGEE.ECH, lv = (ZONE_JEU.x1 - ZONE_JEU.x0) * RANGEE.ECH, d = Math.max(hv * 1.1 / t, lv * 1.1 / (t * (camera?.aspect || 1.6)));
      return { pos: c.clone().addScaledVector(bo.n, d).add(vec(0, 0.1, 0)), cible: c.clone(), fov: 33 };
    },
    // (9/10) le guichet de Luigi : la vue de la planche (variante B), Luigi derrière le comptoir, la bulle en bas à droite
    guichet: () => ({ pos: GUICHET.vue.pos.clone(), cible: GUICHET.vue.cible.clone(), fov: GUICHET.vue.fov })
  };
  const allerA = (nom, i, duree = 1, suivre = false, arc = false) => {
    const p = PLANS[nom](i);
    if (!plan) plan = { de: p, a: p, t: 1, d: 1 };
    else {
      const de = courant();
      plan = { de, a: p, t: 0, d: duree, suivre, par: arc ? de.pos.clone().lerp(p.pos, 0.5).add(vec(0, 11, 0)) : null };
    }
  };
  const courant = () => {
    const { de, a, t, d, suivre, par } = plan, k = d > 0 ? lisse(t / d) : 1;
    const pos = par ? de.pos.clone().multiplyScalar((1 - k) ** 2).addScaledVector(par, 2 * (1 - k) * k).addScaledVector(a.pos, k * k) : de.pos.clone().lerp(a.pos, k);
    const r = { pos, cible: de.cible.clone().lerp(a.cible, k), fov: de.fov + (a.fov - de.fov) * k };
    if (suivre && luigiObj && k < 1) r.cible.lerp(luigiObj.position.clone().add(vec(0, LUIGI.taille * 0.6, 0)), (plan.luigi ? 0.5 : 0.3) * Math.sin(Math.PI * k));
    if (plan.luigi && luigiObj && k < 1) {
      const L = luigiObj.position, e = vec(r.pos.x - L.x, 0, r.pos.z - L.z);
      let d2 = e.length();
      if (d2 < PRES_MIN) {
        if (d2 < 0.01) {
          e.set(r.pos.x - r.cible.x, 0, r.pos.z - r.cible.z);
          d2 = 0;
        }
        const f = (PRES_MIN - d2) * Math.min(1, 3 * Math.sin(Math.PI * k));
        r.pos.addScaledVector(e.normalize(), f);
        r.pos.y += f * 0.45;
      }
    }
    return r;
  };
  const placerCamera = () => {
    const c = courant();
    camera.position.copy(c.pos);
    camera.lookAt(c.cible);
    if (camera.fov !== c.fov) {
      camera.fov = c.fov;
      camera.updateProjectionMatrix();
    }
    const ecl = mJeu?.jeu?.eclat;
    if (ecl) {
      const f = Math.max(0, 1 - ecl.t / 0.45) * BOMBE.secousse;
      camera.position.x += (Math.random() - 0.5) * f;
      camera.position.y += (Math.random() - 0.5) * f;
    }
  };
  const PRES_MIN = 24;
  const attendreLuigi = () => {
    if (plan && trajet && luigiObj) plan.luigi = Math.max(0.5, longueur(luigiObj.position, trajet.chemin));
  };
  const dureeTrajet = (min = 1.4) => luigiObj && trajet ? Math.max(min, eta(luigiObj.position, trajet.chemin) - 0.3) : min;
  const dureeVers = (i, min = 0.8) => {
    if (!luigiObj) return min;
    const ch = planifier(luigiObj.position, etapesVers(luigiObj.position, i).pop());
    return Math.max(min, eta(luigiObj.position, ch) - 0.3);
  };
  const POLICE = "Nunito, 'Arial Rounded MT Bold', sans-serif";
  const COULEUR_PIECE = ["#f8d858", "#f0b050", "#e0a048", "#c88038", "#f8f888"];
  const CSS = css(`
    .pcvc { position: absolute; inset: 0; overflow: hidden; background: #000; user-select: none; -webkit-user-select: none; font-family: ${POLICE}; container-type: size; }
    .pcvc > canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; }
    .pcvc svg.hud { position: absolute; overflow: visible; pointer-events: none; }
    .pcvc .pieces { left: 1.6cqh; bottom: 1.9cqh; height: 8.2cqh; transition: opacity .25s; }
    .pcvc > canvas.hud { position: absolute; display: block; inset: auto; width: auto; }
    .pcvc > canvas.boutonA { right: 2.4cqh; bottom: 1.4cqh; height: 15cqh; pointer-events: auto !important; cursor: pointer; transition: opacity .25s, transform .12s, filter .12s; }
    .pcvc > canvas.boutonA.pret { animation: pcvc-respire 1.2s ease-in-out infinite; }
    .pcvc > canvas.boutonA.tenu { transform: scale(.9); filter: brightness(1.3); }
    @keyframes pcvc-respire { 50% { transform: scale(1.05); filter: brightness(1.12); } }
    .pcvc .action { right: 2.4cqh; bottom: 1.9cqh; height: 8.2cqh; pointer-events: auto !important; cursor: pointer; transition: opacity .25s; }
    .pcvc .plaque { left: 41%; bottom: 2.6cqh; height: 10.5cqh; transform: translateX(-50%);    transition: opacity .3s, transform .3s; }
    .pcvc .cache { opacity: 0; pointer-events: none !important; }
    
    .pcvc .nav { position: absolute; left: 50%; bottom: 2.2cqh; transform: translateX(-50%); display: flex; align-items: center; gap: 1.6cqh; max-width: 62%;
      padding: 1cqh 2.4cqh; border-radius: 99px; background: color-mix(in srgb, var(--pcv-carte) 20%, transparent); border: 1px solid rgba(255,255,255,.45); box-shadow: 0 .6cqh 2cqh rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.5);
      backdrop-filter: blur(10px) saturate(1.3); color: var(--pcv-sur-accent); font: 700 2.5cqh/1.2 Nunito, "Nunito Sans", sans-serif; text-shadow: 0 1px 2px rgba(0,0,0,.6); white-space: nowrap; transition: opacity .25s; }
    .pcvc .nav b { font-size: 3cqh; font-weight: 900; overflow: hidden; text-overflow: ellipsis; }
    .pcvc .nav span { opacity: .82; overflow: hidden; text-overflow: ellipsis; }
    .pcvc .nav span.vide { visibility: hidden; }
    .pcvc .nav i { font-style: normal; display: inline-block; min-width: 2.6cqh; padding: 0 .6cqh; margin: 0 .5cqh; border-radius: .8cqh; background: rgba(0,0,0,.35); font-size: 2cqh; text-align: center; }
    .pcvc .plaque.cache { transform: translateX(-50%) translateY(2cqh); }
    .pcvc > .essai { position: absolute; left: 1.6cqh; bottom: 10.6cqh; padding: .2cqh 1cqh; border-radius: 1cqh; background: var(--pcv-rouge); color: var(--pcv-sur-accent); font: 900 1.9cqh/1.3 var(--pcv-police, Nunito, sans-serif); letter-spacing: .2cqh; pointer-events: none; }
    .pcvc .pieces.secoue { animation: pcvc-secoue .4s; }
    @keyframes pcvc-secoue { 20%, 60% { transform: translateX(-1.2cqh); } 40%, 80% { transform: translateX(1.2cqh); } }
    .pcvc .voile { position: absolute; inset: 0; background: #000; opacity: 0; pointer-events: none; transition: opacity .28s; z-index: 30; }
    .pcvc .voile.noir { opacity: 1; }
    
    .pcvc .voile .chargement { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; gap: 22px;
      font: 900 26px Nunito, sans-serif; color: #ffe14a; letter-spacing: .02em; text-shadow: 0 3px 0 #7a3b00, 0 0 12px rgba(0,0,0,.6); opacity: 0; transition: opacity .3s .3s; }
    .pcvc .voile.noir .chargement { opacity: 1; }
    .pcvc .voile:not(.noir) .chargement { transition: none; }
    .pcvc .voile .chargement i { width: 76px; height: 76px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-style: normal; font-size: 42px; color: #fff3a8;
      background: radial-gradient(circle at 38% 32%, #fff6b0 0 12%, #ffd23a 30%, #e9a20c 70%, #b86f00 100%); box-shadow: inset 0 0 0 5px #c98200, inset 0 0 0 8px #ffe066, 0 6px 0 #7a3b00;
      text-shadow: 0 2px 0 #b86f00; animation: pcvcPiece 1.1s linear infinite; }
    @keyframes pcvcPiece { from { transform: rotateY(0deg); } to { transform: rotateY(360deg); } }
    .pcvc.pilote * { transition: none !important; animation: none !important; }
    .pcvc .bt { display: inline-flex; align-items: center; justify-content: center; width: 24u; height: 24u; border-radius: 50%; border: 2u solid currentColor; font-size: 14u; font-weight: 900; line-height: 1; }
    
    .pcvc .boite { position: absolute; inset: 0; z-index: 20; display: none; flex-direction: column; background: #c3121b; color: #3b3b3b; }
    .pcvc .boite.on { display: flex; }
    .pcvc .cadre-or { flex: 0 0 55%; min-height: 0; overflow: hidden; padding: 16u; box-sizing: border-box; background: repeating-linear-gradient(135deg, #f7c51c 0 9u, #eab10f 9u 18u); box-shadow: inset 0 0 0 3u #ffe36a, inset 0 -6u 0 #c88a06; }
    .pcvc .tableau-serie { height: 100%; box-sizing: border-box; border: 4u solid #b97c06; border-radius: 4u; background: #f3f6f8; position: relative; overflow: hidden;
      display: grid; grid-template-columns: repeat(var(--col), 1fr); grid-template-rows: repeat(5, minmax(0, 1fr)); gap: 6u; padding: 14u 18u; }
    .pcvc .case { position: relative; min-height: 0; display: flex; align-items: center; justify-content: center; border-radius: 6u; }
    .pcvc .case canvas { height: 100%; max-width: 100%; aspect-ratio: 1; object-fit: contain; }
    .pcvc .case.manque canvas { filter: brightness(0) opacity(.18); }
    .pcvc .case.curseur { box-shadow: 0 0 0 3u var(--pcv-anneau-c), 0 0 0 6u #2b8cff; background: rgba(255,255,255,.35); }
    .pcvc .case .nb { position: absolute; right: 0; bottom: 0; font-size: 13u; font-weight: 900; color: var(--pcv-sur-accent); background: #2747d6; border-radius: 8u; padding: 0 5u; }
    .pcvc .pupitre-boite { flex: 1; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 14u 0 56u; box-sizing: border-box; background: #c8141c; }
    .pcvc .fiche { width: 46%; min-width: 520u; padding: 10u 24u 12u; box-sizing: border-box; border-radius: 10u; background: #f8c81e; box-shadow: inset 0 0 0 2u #ffe36a, 0 3u 0 #b77d05;
      color: #a03322; text-align: center; font-weight: 800; position: relative; }
    .pcvc .fiche b { display: block; font-size: 25u; } .pcvc .fiche hr { border: 0; border-top: 2u solid rgba(160,51,34,.45); margin: 7u 30u; }
    .pcvc .fiche span { font-size: 20u; font-weight: 700; }
    .pcvc .carrousel { display: flex; align-items: center; gap: 12u; margin-top: 20u; height: 92u; }
    .pcvc .carrousel .vig { position: relative; width: 104u; height: 78u; border-radius: 8u; border: 3u solid #f3d68a; background: #fff; box-shadow: 0 2u 4u rgba(0,0,0,.3); opacity: .85; display: flex; align-items: center; justify-content: center; }
    .pcvc .carrousel .vig.choisie { width: 124u; height: 92u; border-color: #fff; opacity: 1; }
    .pcvc .carrousel .vig img { height: 80%; image-rendering: pixelated; }
    .pcvc .carrousel .vig .etoile { position: absolute; left: -4u; top: -8u; color: var(--pcv-sur-accent); font-size: 20u; text-shadow: 0 1u 2u rgba(0,0,0,.5); }
    .pcvc .bas-boite { position: absolute; left: 0; right: 0; bottom: 12u; display: flex; justify-content: center; gap: 14u; align-items: center; }
    .pcvc .bas-boite .retour { position: absolute; left: 24u; display: flex; align-items: center; gap: 8u; padding: 4u 16u 4u 6u; border-radius: 18u; background: #a20c14; color: var(--pcv-sur-accent); font-weight: 800; font-size: 20u; cursor: pointer; }
    .pcvc .bas-boite .total { padding: 4u 22u; border-radius: 6u; background: #fff6ec; color: #4a3a32; font-weight: 700; font-size: 20u; min-width: 320u; display: flex; justify-content: space-between; gap: 30u; }
    .pcvc .bas-boite .poser { padding: 4u 16u; border-radius: 18u; background: #fffaf0; color: #e14b45; font-weight: 800; font-size: 19u; display: flex; gap: 8u; align-items: center; }
    
    .pcvc .bulle { position: absolute; left: 4cqw; right: 4cqw; top: 3.2cqh; min-height: 15cqh; box-sizing: border-box; z-index: 12; padding: 2.6cqh 9cqh 2.8cqh 4cqh;
      background: #fff; border-radius: 4.4cqh; box-shadow: 0 .5cqh 0 rgba(0,0,0,.16), 0 0 0 .35cqh rgba(0,0,0,.08); color: #3c3c3c; font-weight: 800; font-size: 4.1cqh; line-height: 1.32;
      opacity: 0; transform: translateY(-1.2cqh) scale(.98); transition: opacity .16s, transform .16s; pointer-events: none; }
    .pcvc .bulle.on { opacity: 1; transform: none; }
    .pcvc .bulle::after { content: ""; position: absolute; left: var(--queue, 82%); bottom: -2.4cqh; width: 3.6cqh; height: 3.2cqh; margin-left: -1.8cqh; background: #fff;
      clip-path: polygon(0 0, 100% 0, var(--pointe, 70%) 100%); }
    
    .pcvc .bulle.bas { top: auto; bottom: 2.4cqh; left: 3cqw; right: auto; max-width: 54cqw; min-height: 0; padding: 1.6cqh 3cqh; font-size: 4.4cqh; border-radius: 3cqh; text-align: left; }
    .pcvc .bulle.bas::after { display: none; }
    .pcvc .bulle .rouge { color: #e8322c; } .pcvc .bulle .bleu { color: #2a6fe0; }
    .pcvc .bulle .cache-l { visibility: hidden; }
    .pcvc .bulle .suite { position: absolute; right: 2.6cqh; top: 2.2cqh; width: 4.6cqh; height: 4.6cqh; border-radius: 50%; box-sizing: border-box; border: .45cqh solid #d8d8d8; }
    .pcvc .bulle.fin .suite { border-color: #e8322c; background: #fff; display: flex; align-items: center; justify-content: center; animation: pcvc-suite .9s ease-in-out infinite; }
    .pcvc .bulle.fin .suite::before { content: attr(data-a); color: #e8322c; font-size: 2.9cqh; font-weight: 900; }
    .pcvc .bulle.bas .suite, .pcvc .bulle.seule .suite { display: none; }
    @keyframes pcvc-suite { 50% { transform: translateY(.5cqh); } }
    .pcvc .bulle .choix { display: none; margin-top: 1.4cqh; padding-left: 2cqh; font-size: 3.7cqh; }
    .pcvc .bulle .choix.on { display: block; }
    .pcvc .bulle .choix div { position: relative; padding-left: 3.4cqh; color: #8a8a8a; }
    .pcvc .bulle .choix div.sel { color: #3c3c3c; }
    
    .pcvc .bulle.guichet { left: auto; right: 3cqw; width: 40cqw; top: auto; bottom: 4cqh; font-size: 3.4cqh; --queue: 18%; --pointe: 30%; }
    .pcvc .bulle.guichet::after { bottom: auto; top: -2.4cqh; transform: scaleY(-1); }
    .pcvc .bulle.guichet .choix { font-size: 3.1cqh; }
    .pcvc .bulle .choix div.sel::before { content: ""; position: absolute; left: .4cqh; top: 50%; width: 1.6cqh; height: 1.6cqh; margin-top: -.8cqh; border-radius: 50%; background: #e8322c; }`);
  const mesure = (() => {
    const c = document.createElement("canvas").getContext("2d");
    return (texte, px) => {
      c.font = `900 ${px}px ${POLICE}`;
      return c.measureText(texte).width;
    };
  })();
  const DEGRADE = `<linearGradient id="pcvc-jaune" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8f8f8"/><stop offset=".22" stop-color="#f0f080"/><stop offset=".45" stop-color="#f8f830"/><stop offset=".8" stop-color="#e0e018"/><stop offset="1" stop-color="#d0c800"/></linearGradient>`;
  const texteCerne = (x, y, texte, taille, remplissage, ancre2 = "start") => `<text x="${x}" y="${y}" font-size="${taille}" font-weight="900" text-anchor="${ancre2}" fill="${remplissage}" stroke="#000" stroke-width="${taille * 0.2}" stroke-linejoin="round" paint-order="stroke">${echap(texte)}</text>`;
  const boutonA = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="7.4" fill="#000"/><circle cx="${cx}" cy="${cy}" r="6.4" fill="#d00000"/>
    <path d="M${cx - 6.4} ${cy} a6.4 6.4 0 0 1 12.8 0 z" fill="#f86058"/><ellipse cx="${cx - 2}" cy="${cy - 3.6}" rx="2.6" ry="1.4" fill="#f8b8b8"/>
    ${texteCerne(cx, cy + 4.6, valider(), 12.5, "#f8f800", "middle")}`;
  const valider = () => (window.__pcvTouche?.(1) || ["?"])[0];
  const svgPieces = (n) => {
    const t = String(n), l = mesure(t, 15), P = COULEUR_PIECE;
    return `<svg class="hud pieces" viewBox="0 0 ${22 + l + 4} 20">
    <ellipse cx="9" cy="10" rx="7.6" ry="8.8" fill="#000"/><ellipse cx="9" cy="10" rx="6.6" ry="7.8" fill="${P[3]}"/>
    <ellipse cx="8.6" cy="9.6" rx="5.9" ry="7" fill="${P[1]}"/><ellipse cx="8.1" cy="9" rx="4" ry="4.9" fill="${P[0]}"/>
    <path d="M8.6 5.2 l1.1 2.6 2.8.2 -2.1 1.8.7 2.7 -2.5-1.5 -2.4 1.5.7-2.7 -2.1-1.8 2.8-.2z" fill="${P[2]}" opacity=".85"/>
    <ellipse cx="5.6" cy="5.8" rx="1" ry="1.7" transform="rotate(30 5.6 5.8)" fill="${P[4]}"/>
    ${texteCerne(21, 15.6, t, 15, "#f8f830")}</svg>`;
  };
  const svgAction = (texte) => {
    const l = mesure(texte, 15);
    return `<svg class="hud action" viewBox="0 0 ${22 + l + 3} 20"><defs>${DEGRADE}</defs>${boutonA(9, 10)}${texteCerne(20, 15.6, texte, 15, "url(#pcvc-jaune)")}</svg>`;
  };
  const svgPlaque = (texte) => {
    const l = Math.max(110, mesure(texte, 15) + 40), h = 30;
    return `<svg class="hud plaque" viewBox="0 0 ${l} ${h}" shape-rendering="crispEdges">
      <rect x="0" y="0" width="${l}" height="${h}" fill="#000"/><rect x="1" y="1" width="${l - 2}" height="${h - 2}" fill="#f8f8f8"/>
      <rect x="3" y="3" width="${l - 4}" height="${h - 4}" fill="#d8a830"/><rect x="3" y="3" width="${l - 7}" height="${h - 8}" fill="#f8f8b0"/>
      <path d="M${l - 5} 2 l2 2 -2 2 -2 -2z M4 ${h - 6} l2 2 -2 2 -2 -2z" fill="#f8f800"/>
      <g shape-rendering="geometricPrecision">${texteCerne(l / 2, 20.5, texte, 15, "#a8e048", "middle")}</g></svg>`;
  };
  const nomMachine = (m) => !m ? Tr("casino.machine") : machines.some((x) => x !== m && x.nom === m.nom) && m.sous ? `${m.nom} : ${m.sous}` : m.nom;
  let hud = null, gain = null, tenuHud = false;
  const BOUTON_A = { centre: [85, 54], r: 17, jaune: "#f2ec12", socle: "#2c3140", police: "900 25px Nunito, sans-serif" };
  let boutonADessine = null;
  const dessinerBoutonA = () => {
    const c = hud?.boutonA, im = IU.bouton;
    if (!c || !im) return;
    const [lbl] = window.__pcvTouche?.(1) || ["A"];
    if (boutonADessine === lbl) return;
    boutonADessine = lbl;
    const x = c.getContext("2d"), B_ = BOUTON_A;
    x.clearRect(0, 0, c.width, c.height);
    x.fillStyle = B_.socle;
    x.beginPath();
    x.ellipse(c.width / 2, c.height / 2 + 2, c.width / 2 - 6, c.height / 2 - 5, 0, 0, Math.PI * 2);
    x.fill();
    x.drawImage(im, 0, 0, c.width, c.height);
    if (String(lbl).toUpperCase() !== "A") {
      const [cx, cy] = B_.centre;
      x.fillStyle = B_.jaune;
      x.beginPath();
      x.arc(cx, cy, B_.r, 0, Math.PI * 2);
      x.fill();
      x.fillStyle = B_.socle;
      x.font = B_.police;
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText(lbl, cx, cy + 1);
    }
  };
  const remplacer = (cle, html) => {
    hud[cle].outerHTML = html;
    hud[cle] = racine.querySelector("." + cle);
  };
  const majHud = () => {
    if (!hud) return;
    const n = totalParties(), m = machines[sel], etat = mJeu?.jeu?.etat;
    let action = boiteOuverte || jeuOuvert || bulle?.bloque ? null : coffre ? actionCoffre() : vue === "jeu" ? window.__pcvCasinoJeux?.ouvrir ? { cartes: Tr("casino.action_cartes"), table: Tr("casino.action_sasseoir"), roulette: Tr("casino.action_roulette"), machines: Tr("casino.action_jouer") }[JEUX[jeu].nom] : null : vue === "guichet" ? Tr("casino.action_guichet") : vue === "salle" ? JEU_COMPTOIR >= 0 && window.__pcvCasinoJeux?.ouvrir ? Tr("casino.action_poker") : Tr("casino.action_jouer") : vue === "rangee" ? nomMachine(m) : gain ? null : vue === "machine" && etat === "attente" ? Tr("casino.action_maintenir") : vue === "machine" && etat === "deplacement" ? Tr("casino.action_lacher") : null;
    const bA = !!IU.bouton && vue === "machine" && !gain && !finSeance && !boiteOuverte && !coffre && !bulle?.bloque && (etat === "attente" || etat === "deplacement");
    if (hud.boutonA) {
      if (bA) dessinerBoutonA();
      hud.boutonA.classList.toggle("cache", !bA);
      hud.boutonA.classList.toggle("pret", bA && etat === "attente");
      hud.boutonA.classList.toggle("tenu", bA && etat === "deplacement");
    }
    if (bA || finSeance) action = null;
    if (hud.n !== n) {
      hud.n = n;
      remplacer("pieces", svgPieces(n));
    }
    racine.querySelector(".essai")?.toggleAttribute("hidden", !essai() || !!jeuOuvert);
    hud.pieces.classList.toggle("cache", vue === "machine" || !!boiteOuverte || !!coffre || !!jeuOuvert);
    if (action && hud.texte !== action + valider()) {
      hud.texte = action + valider();
      remplacer("action", svgAction(action));
      hud.action.addEventListener("pointerdown", (e) => {
        e.stopPropagation();
        touche(1);
        if (mJeu?.jeu?.etat === "deplacement") {
          tenuHud = true;
          try {
            hud.action.setPointerCapture(e.pointerId);
          } catch (x) {
          }
        }
      });
    }
    hud.action.classList.toggle("cache", !action);
    hud.plaque.classList.toggle("cache", !gain?.nom && !(coffre?.phase === "fiche" && coffre.nom));
    majNav();
    majAnneau();
  };
  const NOMS_JEUX = { cartes: Tr("casino.table_poker"), table: Tr("casino.grande_table"), roulette: Tr("casino.roulette"), machines: Tr("casino.machines_a_sous") };
  let ordreZones = null;
  const zones = () => {
    const cle = machines.length + (meuble ? "m" : "") + JEUX[0].nom;
    if (ordreZones && ordreZones.cle === cle) return ordreZones.l;
    const P_2 = PLANS.salle(), avant = P_2.cible.clone().sub(P_2.pos).setY(0).normalize(), droite = vec(-avant.z, 0, avant.x);
    const ecranX = (v) => {
      const d = v.clone().sub(P_2.pos).setY(0);
      return Math.atan2(d.dot(droite), d.dot(avant));
    }, ou = (o) => o.getWorldPosition(new T.Vector3());
    const l = machines.map((m, i) => ({ type: "borne", i, nom: nomMachine(m), x: bornes[i] ? ecranX(ou(bornes[i].groupe)) : -9 + i * 0.01 }));
    l.push({ type: "comptoir", nom: Tr("casino.comptoir_luigi"), x: ecranX(LUIGI.pos) });
    JEUX.forEach((J, k) => {
      if (!J.cle) l.push({ type: "jeu", k, nom: NOMS_JEUX[J.nom], x: ecranX(J.cible) });
    });
    l.push({ type: "guichet", nom: Tr("casino.jeu_guichet_titre"), x: ecranX(guichetEn(0, GUICHET.avance)) });
    l.sort((a, b) => a.x - b.x);
    ordreZones = { cle, l };
    return l;
  };
  const zoneIci = () => zones().findIndex((z) => vue === "jeu" && JEUX[jeu].cle !== "comptoir" ? z.type === "jeu" && z.k === jeu : vue === "guichet" || vue === "coffre" ? z.type === "guichet" : vue === "salle" || vue === "jeu" ? z.type === "comptoir" : z.type === "borne" && z.i === sel);
  const naviguer = (d) => {
    if (!["salle", "rangee", "jeu", "guichet"].includes(vue) || jeuOuvert || bulle?.bloque) return;
    const Z2 = zones(), k = zoneIci(), z = Z2[k + d];
    if (k < 0 || !z) return son("refus", 0.5);
    if (z.type === "borne") {
      if (vue === "rangee") choisir(z.i);
      else {
        sel = z.i;
        if (vue === "jeu" || vue === "guichet") {
          vue = "salle";
        }
        versRangee();
      }
    } else if (z.type === "comptoir") {
      if (vue === "rangee" || vue === "guichet") revenir();
      else if (vue === "jeu") quitterJeu();
    } else if (z.type === "guichet") versGuichet();
    else versJeu(z.k);
    majHud();
  };
  const majNav = () => {
    const n = hud?.nav;
    if (!n) return;
    const montre = ["salle", "rangee", "jeu", "guichet"].includes(vue) && !jeuOuvert && !coffre && !boiteOuverte && !bulle?.bloque && !guide;
    n.classList.toggle("cache", !montre);
    if (!montre) return;
    const Z2 = zones(), k = zoneIci(), g = Z2[k - 1], d = Z2[k + 1];
    const t = (b2, s) => (window.__pcvTouche?.(b2) || [s])[0], cle = [k, g?.nom, d?.nom, t(5, "L"), t(6, "R")].join("|");
    if (n.dataset.cle === cle) return;
    n.dataset.cle = cle;
    const [sg, b, sd] = n.children;
    sg.innerHTML = g ? `<i>${t(5, "L")}</i>\u25C0 ${g.nom}` : "";
    sd.innerHTML = d ? `${d.nom} \u25B6<i>${t(6, "R")}</i>` : "";
    sg.classList.toggle("vide", !g);
    sd.classList.toggle("vide", !d);
    b.textContent = Z2[k]?.nom || "";
  };
  const balises = (t) => echap(t).replace(/\*([^*]+)\*/g, '<span class="rouge">$1</span>').replace(/_([^_]+)_/g, '<span class="bleu">$1</span>');
  const enLettres = (html) => {
    let n = 0;
    const sortie = html.replace(/(<[^>]+>)|(&#\d+;|[^<])/g, (m_, b, c) => b || `<span class="cache-l" data-l="${n++}">${c}</span>`);
    return { html: sortie, n };
  };
  let bulle = null;
  const elBulle = () => racine?.querySelector(".bulle");
  const majQueue = () => {
    const el = elBulle();
    if (!el || !bulle || el.classList.contains("bas") || el.classList.contains("guichet")) return;
    let x = 0.82;
    if (luigiObj?.visible && camera) {
      const v = luigiObj.position.clone().add(vec(0, LUIGI.taille * 0.9, 0)).project(camera);
      if (v.z < 1 && Math.abs(v.x) < 1.1) x = (v.x + 1) / 2;
    }
    x = clamp(x, 0.1, 0.9);
    el.style.setProperty("--queue", (x * 100).toFixed(1) + "%");
    el.style.setProperty("--pointe", x < 0.5 ? "30%" : "70%");
  };
  const montrerLigne = () => {
    const el = elBulle(), L = bulle.lignes[bulle.i];
    if (!el) return;
    const { html, n } = enLettres(balises(L.texte));
    el.querySelector(".texte").innerHTML = html;
    bulle.n = n;
    bulle.montre = 0;
    bulle.t = 0;
    bulle.sel = 0;
    const ch = el.querySelector(".choix");
    ch.classList.remove("on");
    ch.innerHTML = (L.choix || []).map((c, k) => `<div class="${k ? "" : "sel"}">${balises(c)}</div>`).join("");
    el.querySelector(".suite").dataset.a = valider();
    el.classList.remove("fin");
    el.classList.toggle("bas", !!bulle.bas);
    el.classList.toggle("guichet", !!bulle.guichet);
    el.classList.toggle("seule", !bulle.bloque);
    el.classList.add("on");
    majQueue();
    if (L.geste) geste(L.geste, L.o);
    else if (L.voix) voix(L.voix);
    if (bulle.bloque) luigi?.parler?.(Math.min(3, 0.6 + L.texte.length * 0.03));
    if (L.faire) L.faire();
  };
  const dialogue = (lignes, o = {}) => new Promise((fin) => {
    if (!racine) return fin(-1);
    if (bulle?.fin) bulle.fin(-1);
    bulle = { lignes: lignes.map((l) => typeof l === "string" ? { texte: l } : l), i: 0, bloque: true, bas: !!o.bas || vue === "machine", guichet: !!o.guichet, fin, reponse: -1 };
    montrerLigne();
    majHud();
  });
  let dernierDit = 0;
  const dire = (texte, o = {}) => {
    if (!racine || bulle?.bloque) return;
    if (gain && vue === "machine") return apres(gain.fin - horloge + 0.25, () => dire(texte, o));
    bulle = { lignes: [{ texte }], i: 0, bloque: false, bas: vue === "machine" || !!o.bas, duree: o.duree ?? Math.min(4.2, 1.6 + texte.length * 0.045), age: 0 };
    montrerLigne();
    dernierDit = horloge;
  };
  const fermerBulle = () => {
    const el = elBulle();
    el?.classList.remove("on", "fin");
    const b = bulle;
    bulle = null;
    majHud();
    b?.fin?.(b.reponse);
  };
  const majBulle = (dt) => {
    if (!bulle) return;
    const el = elBulle();
    if (!el) return;
    if (bulle.montre < bulle.n) {
      bulle.t += dt;
      const k = Math.min(bulle.n, Math.floor(bulle.t * 45));
      for (let l = bulle.montre; l < k; l++) el.querySelector(`[data-l="${l}"]`)?.classList.remove("cache-l");
      bulle.montre = k;
      if (k >= bulle.n) {
        el.classList.add("fin");
        el.querySelector(".choix").classList.toggle("on", !!bulle.lignes[bulle.i].choix);
      }
    }
    if (!bulle.bloque && bulle.montre >= bulle.n && (bulle.age += dt) > bulle.duree) fermerBulle();
    majQueue();
  };
  const toucheBulle = (b) => {
    const el = elBulle(), L = bulle.lignes[bulle.i];
    if (bulle.montre < bulle.n) {
      if (b === 1 || b === 2) {
        el.querySelectorAll(".cache-l").forEach((x) => x.classList.remove("cache-l"));
        bulle.montre = bulle.n;
        el.classList.add("fin");
        el.querySelector(".choix").classList.toggle("on", !!L.choix);
      }
      return true;
    }
    if (L.choix && [9, 10, 11, 12].includes(b)) {
      const n = L.choix.length;
      bulle.sel = (bulle.sel + (b === 10 || b === 12 ? 1 : n - 1)) % n;
      son("bouge", 0.5);
      el.querySelectorAll(".choix div").forEach((d, k) => d.classList.toggle("sel", k === bulle.sel));
      return true;
    }
    if (b !== 1 && b !== 2) return true;
    if (L.choix) {
      bulle.reponse = b === 2 ? L.annuler ?? L.choix.length - 1 : bulle.sel;
      son("bouge", 0.7);
    } else son("bouge", 0.4);
    if (bulle.i < bulle.lignes.length - 1 && !L.choix) {
      bulle.i++;
      montrerLigne();
      return true;
    }
    fermerBulle();
    return true;
  };
  const auHasard = (l) => l[Math.floor(Math.random() * l.length)];
  let dernierDitTexte = null;
  const auHasardNeuf = (l) => {
    const c = l.filter((x) => x !== dernierDitTexte);
    return dernierDitTexte = auHasard(c.length ? c : l);
  };
  const ENTR = "pcv-casino-entrainement";
  let guide = null;
  const plusTard = [];
  const apres = (s_, f) => plusTard.push({ t: horloge + s_, f });
  const majPlusTard = () => {
    for (let k = plusTard.length - 1; k >= 0; k--) if (horloge >= plusTard[k].t) {
      const f = plusTard.splice(k, 1)[0].f;
      f();
    }
  };
  const REPLIQUES = {
    // (%b : « Bonjour » ou « Bonsoir » selon l'heure de la console ; les répliques du soir ne servent que le soir)
    retour: [Tr("luigi.retour_1"), Tr("luigi.retour_2"), Tr("luigi.retour_3")],
    retourSoir: [Tr("luigi.retour_soir_1"), Tr("luigi.retour_soir_2")],
    borne: [Tr("luigi.borne_1"), Tr("luigi.borne_2"), Tr("luigi.borne_3")],
    gagne: [Tr("luigi.gagne_1"), Tr("luigi.gagne_2"), Tr("luigi.gagne_3"), Tr("luigi.gagne_4")],
    bravo: [Tr("luigi.replique_bravo_1"), Tr("luigi.replique_bravo_2")],
    rate: [Tr("luigi.rate_1"), Tr("luigi.rate_2"), Tr("luigi.rate_3"), Tr("luigi.rate_4")],
    presque: [Tr("luigi.presque_1"), Tr("luigi.presque_2")],
    derniere: [Tr("luigi.derniere_1")],
    plusDeParties: [Tr("luigi.plus_de_parties_1")],
    boite: [Tr("luigi.boite_1"), Tr("luigi.boite_2")],
    aurevoir: [Tr("luigi.aurevoir_1"), Tr("luigi.aurevoir_2"), Tr("luigi.aurevoir_3")]
  };
  const presenterBorne = (i) => {
    const m = machines[i];
    if (!m || guide) return;
    if (m.entrainement) return dire(Tr("luigi.borne_entrainement"));
    if (Math.random() < 0.75) dire(auHasard(REPLIQUES.borne).replace("%s", nomMachine(m)));
  };
  const accueillir = async () => {
    if (!ouvert || vue !== "salle" || pilote && opts.sansAccueil) return;
    const e = lire(ENTR, {}), n = totalParties(), auj = jourDe(), deja = lire("pcv-casino-visite", "") === auj;
    ecrire("pcv-casino-visite", auj);
    if (!e.fait) {
      const lignes = !e.vu ? [
        { texte: Tr("luigi.accueil", { salut: salut(), salut_bas: salut().toLowerCase() }), geste: "accueil" },
        Tr("luigi.premiere_visite"),
        Tr("luigi.ici_on_gagne"),
        Tr("luigi.chaque_jour_offertes", { n: OFFERTES }),
        { texte: Tr("luigi.entrainement_propose"), choix: [Tr("luigi.choix_oui"), Tr("luigi.choix_non")] }
      ] : [{ texte: Tr("luigi.retour_propose"), geste: "accueil" }, { texte: Tr("luigi.retour_essai"), choix: [Tr("luigi.choix_oui"), Tr("luigi.choix_plus_tard")] }];
      e.vu = true;
      ecrire(ENTR, e);
      if (await dialogue(lignes) === 0) return versEntrainement();
      return dialogue([{ texte: Tr("luigi.borne_reste_bout"), geste: "designer", o: { vers: centreVitre(bornes[0]) } }]);
    }
    if (n <= 0) return dialogue([{ texte: auHasard([
      Tr("luigi.plus_bornes_badges_1", { salut: salut() }),
      Tr("luigi.plus_bornes_badges_2", { salut: salut() })
    ]), geste: "accueil" }]);
    return dialogue([{ texte: deja ? Tr("luigi.re_salut_parties", { salut: salut().toLowerCase(), n }) : `${auHasard(soir() ? [...REPLIQUES.retour, ...REPLIQUES.retourSoir] : REPLIQUES.retour).replace("%b", salut())}` + Tr("luigi.parties_aujourdhui", { n }), geste: "accueil" }]);
  };
  const SOIR = { debut: 18, fin: 5 };
  const soir = () => {
    const h = (/* @__PURE__ */ new Date()).getHours();
    return h >= SOIR.debut || h < SOIR.fin;
  };
  const salut = () => Tr(soir() ? "luigi.bonsoir" : "luigi.bonjour");
  const versEntrainement = () => {
    if (!bornes[0]) return;
    guide = { etape: "borne" };
    sel = 0;
    vue = "rangee";
    son("approche");
    musique("machine");
    allerA("rangee", 0, Math.max(1.4, dureeVers(0)), true, true);
    attendreLuigi();
    luigiVersBorne(0, false, PLANS.rangee(0).pos, async () => {
      await dialogue([
        { texte: Tr("luigi.borne_entrainement_voila"), geste: "designer", o: { vers: centreVitre(bornes[0]) } },
        Tr("luigi.tiens_touche_gauche", { touche: valider() }),
        Tr("luigi.lache_badge_ouvre"),
        Tr("luigi.faire_tomber_goulotte")
      ]);
      guide.etape = "partie";
      approcher();
      apres(1.2, () => guide?.etape === "partie" && mJeu?.jeu?.etat === "attente" && dire(Tr("luigi.tiens_lache_badge", { touche: valider() }), { bas: true, duree: 4 }));
    });
    majHud();
  };
  const commenterEntrainement = (gagne) => {
    const e = lire(ENTR, {});
    e.essais = (e.essais || 0) + 1;
    if (gagne) {
      e.fait = true;
      ecrire(ENTR, e);
      guide = null;
      apres(1.4, () => dialogue([
        { texte: e.essais === 1 ? Tr("luigi.bravo_premier") : Tr("luigi.bravo_coup"), geste: "bravo" },
        Tr("luigi.jetons_badges", { n: JETONS_PAR_PARTIE }),
        Tr("luigi.vraies_bornes_attendent", { n: totalParties() })
      ]));
      return;
    }
    ecrire(ENTR, e);
    apres(0.9, async () => {
      const r = await dialogue([
        { texte: Tr("luigi.fail_dur"), geste: "presque" },
        { texte: Tr("luigi.fail_recommence"), choix: [Tr("luigi.choix_oui_essai"), Tr("luigi.ca_ira")] }
      ]);
      if (r !== 0) {
        const e2 = lire(ENTR, {});
        e2.fait = true;
        ecrire(ENTR, e2);
        guide = null;
        dialogue([Tr("luigi.vraies_bornes_a_cote")]);
      }
    });
  };
  let aurevoir = null;
  const direAuRevoir = () => {
    if (!window.__pcvPerso?.fermer) return false;
    aurevoir = { t: horloge };
    geste("salut");
    dire(auHasard(REPLIQUES.aurevoir), { bas: false, duree: 2 });
    apres(1.5, () => {
      if (aurevoir) {
        aurevoir = null;
        window.__pcvPerso?.fermer?.();
      }
    });
    return true;
  };
  const refus = () => {
    son("refus");
    hud.pieces.classList.remove("cache", "secoue");
    void hud.pieces.getBoundingClientRect();
    hud.pieces.classList.add("secoue");
    setTimeout(majHud, 900);
  };
  let boiteOuverte = null;
  const $ = (s) => racine?.querySelector(s);
  const seriesBoite = () => (index?.series || []).filter((s) => s.lots.length);
  const ouvrirBoite = () => {
    if (!racine || gain) return;
    son("approche");
    dire(auHasard(REPLIQUES.boite), { bas: true });
    const b = boite(), l = seriesBoite();
    let i = l.findIndex((s) => s.lots.some((f) => possede(b, `${s.id}/${f}`)));
    if (i < 0) i = 0;
    boiteOuverte = { i, cur: -1 };
    $(".boite").classList.add("on");
    musique("boite");
    dessinerBoite();
    majHud();
  };
  const fermerBoite = () => {
    boiteOuverte = null;
    $(".boite")?.classList.remove("on");
    musique(vue === "salle" ? "salle" : "machine");
    son("retour");
    majHud();
  };
  const dessinerBoite = () => {
    const bo = boiteOuverte;
    if (!bo) return;
    racine.querySelectorAll(".boite .bt").forEach((e) => {
      e.textContent = (window.__pcvTouche?.(+e.dataset.touche) || ["?"])[0];
    });
    const l = seriesBoite(), b = boite();
    if (!l.length) {
      $(".fiche b").textContent = Tr("casino.aucun_badge");
      $(".fiche span").textContent = Tr("casino.badges_se_rangent");
      $(".tableau-serie").innerHTML = "";
      $(".carrousel").innerHTML = "";
      $(".total b").textContent = "0";
      return;
    }
    const s = l[bo.i], ids = s.lots.map((f) => `${s.id}/${f}`);
    $(".fiche b").textContent = bo.cur >= 0 && possede(b, ids[bo.cur]) && nomComplet(ids[bo.cur]) || `${s.nom} : ${s.sous}`;
    $(".fiche span").textContent = Tr("casino.badges_n_sur_m", { n: ids.filter((id) => possede(b, id)).length, total: ids.length });
    $(".total b").textContent = String(l.filter((x) => x.lots.every((f) => complet(b, `${x.id}/${f}`))).length);
    const t = $(".tableau-serie"), col = ids.length > 60 ? 16 : ids.length > 30 ? 12 : 10;
    t.style.setProperty("--col", col);
    const debut = bo.cur < 0 ? 0 : Math.max(0, Math.floor(bo.cur / col) - 2) * col, vus = ids.slice(debut, debut + col * 5);
    t.innerHTML = vus.map((id, k) => `<div class="case${possede(b, id) ? "" : " manque"}${debut + k === bo.cur ? " curseur" : ""}" data-k="${debut + k}"><canvas width="96" height="96"></canvas>${(b[id]?.n || 0) > 1 ? `<span class="nb">\xD7${b[id].n}</span>` : ""}${morceauxDe.has(id) && possede(b, id) && !complet(b, id) ? `<span class="nb">${nbMorceaux(b, id)}/${morceauxDe.get(id).length}</span>` : ""}</div>`).join("");
    t.querySelectorAll(".case").forEach((el) => {
      const id = ids[+el.dataset.k], cv = el.querySelector("canvas");
      quandPrete(image(id), (im) => {
        const a = autocollant(im, false, 2), x = cv.getContext("2d");
        x.clearRect(0, 0, 96, 96);
        x.drawImage(a.c, 0, 0, 96, 96);
      });
    });
    const car = $(".carrousel"), autour = [-2, -1, 0, 1, 2].map((d) => l[(bo.i + d + l.length) % l.length]);
    car.innerHTML = autour.map((x, k) => `<div class="vig${k === 2 ? " choisie" : ""}">${x.icone ? `<img data-id="${echap(x.id + "/" + x.icone)}" alt="">` : ""}${x.lots.every((f) => complet(b, `${x.id}/${f}`)) ? '<span class="etoile">\u2605</span>' : ""}</div>`).join("");
    car.querySelectorAll("img[data-id]").forEach((im) => quandPrete(image(im.dataset.id), (x) => im.src = x.src));
    $(".poser").style.visibility = bo.cur >= 0 && possede(b, ids[bo.cur]) ? "visible" : "hidden";
  };
  const toucheBoite = (b) => {
    const bo = boiteOuverte, l = seriesBoite();
    if (!l.length) {
      if (b === 2 || b === 1) fermerBoite();
      return true;
    }
    const s = l[bo.i], n = s.lots.length, col = +$(".tableau-serie").style.getPropertyValue("--col") || 10;
    if (bo.cur < 0) {
      if (b === 11 || b === 5) bo.i = (bo.i - 1 + l.length) % l.length;
      else if (b === 12 || b === 6) bo.i = (bo.i + 1) % l.length;
      else if (b === 1 || b === 10) bo.cur = 0;
      else if (b === 2 || b === 3 || b === 4) {
        fermerBoite();
        return true;
      }
    } else {
      if (b === 11) bo.cur = Math.max(0, bo.cur - 1);
      else if (b === 12) bo.cur = Math.min(n - 1, bo.cur + 1);
      else if (b === 9) {
        if (bo.cur < col) bo.cur = -1;
        else bo.cur -= col;
      } else if (b === 10) bo.cur = Math.min(n - 1, bo.cur + col);
      else if (b === 5 || b === 6) {
        bo.i = (bo.i + (b === 6 ? 1 : -1) + l.length) % l.length;
        bo.cur = 0;
      } else if (b === 2) bo.cur = -1;
      else if (b === 1) {
        const id = `${s.id}/${s.lots[bo.cur]}`;
        if (possede(boite(), id)) {
          poser(id);
          return true;
        }
        son("refus");
        return true;
      }
    }
    son("bouge", 0.6);
    dessinerBoite();
    return true;
  };
  const poser = (id) => {
    const b = boite(), p = morceauxDe.get(id), entier = !p || complet(b, id), cible = entier ? id : p.find((x) => b[x]), taille = entier ? tailleDe(id) : [1, 1];
    son("tombe");
    const sc = window.__pcvArcade?.surColler;
    if (sc) return sc(cible, taille);
    if (opts.lire) return window.__pcvPoserBadge?.(cible, taille);
    window.__pcvPerso?.fermer?.(true);
    (window.opener || window).__pcvAller?.(1);
    setTimeout(() => window.__pcvPoserBadge?.(cible, taille), 600);
  };
  const preparerBornes = () => bornes.forEach((bo, i) => {
    const m = machines[i];
    if (!m) return;
    installer(m);
    garnir(bo, m);
  });
  const versRangee = () => {
    if (!machines.length) return;
    son("approche");
    musique("machine");
    vue = "rangee";
    allerA("rangee", sel, Math.max(1.4, dureeVers(sel)), true, true);
    luigiVersBorne(sel);
    majHud();
  };
  const choisir = (i) => {
    i = clamp(i, 0, machines.length - 1);
    if (i === sel) return son("refus", 0.5);
    if (mJeu?.jeu && mJeu.jeu.etat !== "attente") return;
    sel = i;
    son("bouge");
    cacherTableau();
    gain = null;
    if (vue === "machine") {
      mJeu = machines[sel];
      allerA("partie", sel, GLISSE_BORNE);
      poserLuigiA(sel);
      majHud();
      return;
    }
    allerA("rangee", sel, Math.max(0.9, dureeVers(sel)), true);
    luigiVersBorne(sel, true, PLANS.rangee(sel).pos);
    majHud();
  };
  const GLISSE_BORNE = 0.45;
  const poserLuigiA = (i) => {
    const bo = bornes[i];
    if (!bo || !luigiObj) return;
    const ici = placeLuigi(bo), cam = PLANS.rangee(i).pos;
    luigiObj.position.copy(ici);
    trajet = null;
    luigiObj.rotation.y = Math.atan2(cam.x - ici.x, cam.z - ici.z);
    luigi?.regarder(cam);
  };
  const approcher = () => {
    const m = machines[sel];
    if (!m) return;
    mJeu = m;
    son("approche");
    if (bulle && !bulle.bloque) fermerBulle();
    jingle("jingle-depart");
    vue = "machine";
    session = { parties: 0, gains: 0 };
    const im = m.entrainement ? IU.entrainement : totalParties() > 0 ? IU.debut : null;
    if (im) apres(AFFICHE.attente, () => {
      if (vue === "machine" && mJeu === m && !session.parties) montrerAffiche(bornes[sel], im);
    });
    allerA("partie", sel, 0.9);
    tournerLuigiVers(PLANS.rangee(sel).pos);
    majHud();
  };
  const REACTION = { gain: 2.6, rien: 3, bulle: 0.8 };
  const reagirDepart = () => {
    const g = session.gains;
    geste(g > 1 ? "bravo" : g ? "gagne" : "rate");
    apres(REACTION.bulle, () => vue === "reaction" && dire(g > 1 ? Tr("casino.n_badges_belle_seance", { n: g }) : g ? Tr("casino.un_badge_de_plus") : auHasardNeuf(REPLIQUES.rate), { bas: false, duree: 2 }));
  };
  const finirReaction = () => {
    if (vue !== "reaction") return;
    vue = "rangee";
    allerA("rangee", sel, 0.9);
    majHud();
  };
  const remettreEssai = (m) => {
    const bo = bornes[machines.indexOf(m)];
    m.essai = false;
    if (!bo) return;
    m.monde = null;
    m.jeu = null;
    bo.interieur?.removeFromParent();
    bo.interieur = null;
    installer(m);
    garnir(bo, m);
    autocollantsDessus(bo, m);
  };
  const revenir = () => {
    if (vue === "reaction") {
      finirReaction();
      return true;
    }
    if (vue === "machine") {
      if (gain || mJeu?.jeu && mJeu.jeu.etat !== "attente") return true;
      if (finSeance) {
        finirSeance();
        return true;
      }
      if (session.corps?.length && IU.touchez && !session.touchee) {
        session.touchee = true;
        if (montrerFinSeance()) return true;
      }
      cacherAffiche();
      if (mJeu?.essai) remettreEssai(mJeu);
      mJeu = null;
      son("retour");
      if (!session.parties) {
        vue = "rangee";
        allerA("rangee", sel, 0.8);
        majHud();
        return true;
      }
      vue = "reaction";
      allerA("reaction", sel, 1);
      tournerLuigiVers(PLANS.reaction(sel).pos);
      reagirDepart();
      const s0 = session;
      apres(session.gains ? REACTION.gain : REACTION.rien, () => {
        if (session === s0) finirReaction();
      });
      majHud();
      return true;
    }
    if (vue === "rangee") {
      son("retour");
      vue = "salle";
      musique("salle");
      allerA("salle", 0, Math.max(1.4, dureeVers(null)), true, true);
      luigiVersTable();
      majHud();
      return true;
    }
    if (vue === "guichet") {
      son("retour");
      vue = "salle";
      musique("salle");
      luigiVersTable();
      allerA("salle", 0, dureeTrajet(), true, true);
      attendreLuigi();
      majHud();
      return true;
    }
    return direAuRevoir();
  };
  const jouer = () => {
    const m = mJeu, j = m?.jeu;
    if (vue !== "machine" || !j || j.etat !== "attente" || gain) return;
    if (!m.monde.corps.length) return refus();
    if (!m.entrainement && !depenser()) {
      geste("rate");
      dire(REPLIQUES.plusDeParties[0], { bas: true });
      return refus();
    }
    if (bulle && !bulle.bloque) fermerBulle();
    for (const c of m.monde.corps) {
      c.xDebut = c.parts[0].x;
      c.yDebut = c.parts[0].y;
      c.pince = c.lache = false;
    }
    j.surprise = !j.dejaSurprise && Math.random() < SURPRISE;
    j.dejaSurprise = j.surprise;
    if (j.surprise) son("surprise");
    cacherAffiche();
    son("piece");
    sonPince("bouton");
    window.__pcvLed?.("casino-pince");
    j.gains = [];
    j.glisses = 0;
    j.lache = false;
    j.etat = "deplacement";
    j.t = 0;
    j.bloqueG = j.bloqueD = false;
    j.limG = j.limD = 1;
    session.parties++;
    if (!m.entrainement && totalParties() === 0) musique("derniere");
    majHud();
  };
  const finPartie = (m) => {
    const j = m.jeu, g = j.gains;
    j.gains = [];
    if (m.monde.phys) horsDePortee(m);
    if (m.vraie) {
      const n = m.monde.corps.length + (m.aRemettre?.length || 0) <= nbDedans(m) - 3 ? 2 : 0;
      m.aRemettre = regarnir(m, n, m.aRemettre || []);
    } else if (m.monde.corps.length < nbDedans(m) - 4) remplir(m, 3, true);
    if (m !== mJeu) return;
    majHud();
    window.__pcvLed?.(g.length ? "casino-pince-fin" : "casino-perte");
    session.gains += g.length;
    if (!g.length) {
      son("rate");
      geste(j.glisses ? "presque" : "rate");
      if (m.entrainement && guide) return commenterEntrainement(false);
      if (!m.entrainement && totalParties() === 0) dire(REPLIQUES.derniere[0], { bas: true });
      else if (j.glisses ? Math.random() < 0.7 : Math.random() < 0.3) dire(auHasardNeuf(REPLIQUES[j.glisses ? "presque" : "rate"]), { bas: true });
      return;
    }
    if (m.entrainement) {
      const p = parties();
      p.jetons += g.length;
      while (p.bonusJetons < BONUS_ENTRAINEMENT && Math.floor(p.jetons / JETONS_PAR_PARTIE) > p.bonusJetons) {
        p.bonusJetons++;
        p.bonus++;
      }
      ecrire(CLE.parties, p);
    }
    const gros_ = g.length > 1 || g.some((c) => c.parts.length > 1 || c.parts[0].r > R_BADGE * 1.4);
    geste(gros_ ? "bravo" : "gagne");
    majHud();
    if (m.entrainement && guide) return commenterEntrainement(true);
    if (!m.entrainement && !m.essai && !m.monde.corps.length) return machineVidee(m);
    if (session.gains !== g.length && Math.random() > 0.45) return;
    apres(Math.max(0.3, (gain?.fin ?? horloge) - horloge + 0.25), () => dire(!m.entrainement && totalParties() === 0 ? REPLIQUES.derniere[0] : auHasardNeuf(REPLIQUES[gros_ ? "bravo" : "gagne"]), { bas: true }));
  };
  const FETE = { duree: 1.8 };
  const VIDEE = { attente: 2.6 };
  const machineVidee = (m) => {
    const i = machines.indexOf(m), bo = bornes[i];
    if (!bo) return;
    geste("bravo");
    dire(Tr("casino.machine_videe"), { duree: VIDEE.attente });
    jingle("jingle-serie-complete");
    apres(VIDEE.attente, () => {
      const e = etatJour(), d = (e.machines || []).find((x) => seriesPar.has(x.cle) && !machines.some((y) => y.cle === x.cle) && x.stock.some((id) => !e.gagnes[x.cle]?.includes(id)));
      if (!d || machines[i] !== m) return;
      const nv = machineDe(seriesPar.get(d.cle), d.type, d.stock);
      machines[i] = { ...nv, theme: themeDe(nv), file: nv.stock.filter((id) => !e.gagnes[nv.cle]?.includes(id)), monde: null, jeu: null };
      machines[i].plateau = m.plateau;
      habillerVraie(machines[i]);
      bo.interieur?.removeFromParent();
      bo.interieur = null;
      installer(machines[i]);
      garnir(bo, machines[i]);
      autocollantsDessus(bo, machines[i]);
      if (mJeu === m) mJeu = machines[i];
      nuage(bo);
      son("approche");
      majHud();
    });
  };
  const texteFete = () => [Tr("casino.fete.simple"), Tr("casino.fete.double"), Tr("casino.fete.triple"), Tr("casino.fete.quadruple")];
  const feter = (m, c) => {
    const bo = bornes[machines.indexOf(m)];
    if (!bo) return;
    nuage(bo, m.vraie ? c.xChute : null);
    if (m !== mJeu || vue !== "machine") return;
    const g = m.jeu.gains, n = g.length, sid = String(c.id || "").split("/")[0], s_ = !m.entrainement && seriesPar.get(sid), b = boite();
    const complete = s_ && s_.lots.every((f) => complet(b, `${sid}/${f}`)) && !m.serieFetee;
    const fete = texteFete(), texte = m.entrainement ? n > 1 ? Tr("casino.n_jetons", { n }) : Tr("casino.un_jeton") : complete ? Tr("casino.serie_complete_point") : fete[Math.min(n, fete.length) - 1];
    if (complete) m.serieFetee = true;
    gain = { m, corps: g.slice(), fin: horloge + FETE.duree * (complete ? 1.6 : 1), nom: m.entrainement ? null : nomComplet(c.id) };
    window.__pcvLed?.(n >= 3 ? "casino-gain-triple" : n === 2 ? "casino-gain-double" : "casino-gain");
    montrerTableau(bo, g.slice(-4), texte, !m.entrainement && !complete ? IU["gain" + Math.min(4, n)] : null);
    if (!m.entrainement) (session.corps ||= []).push(c);
    if (gain.nom) remplacer("plaque", svgPlaque(gain.nom));
    sonPince("gain" + Math.min(4, n), "gagne");
    if (complete) jingle("jingle-serie-complete");
    else if (n === 1 && !tampons["ba:" + SONS_BA.gain1]) jingle("jingle-fin");
    majHud();
  };
  const finirGain = () => {
    if (!gain) return;
    gain = null;
    cacherTableau();
    majHud();
  };
  const MEUBLE = { pos: guichetEn(0, GUICHET.meuble), lacet: CAP_GUICHET };
  const RANGS = {
    boites: { cols: 12, rangs: 10, l: 3, h: 0.95, p: 2.2, pasX: 3.3, pasY: 1.25, bas: 1.3 },
    vitrines: { cols: 15, rangs: 8, l: 2.6, h: 1.75, p: 1.3, pasX: 2.8, pasY: 1.95, bas: 0.9 }
  };
  const COULEURS_MEUBLE = { bois: 7025688, boisClair: 10115624, rouge: 11541532, or: 14725184, feutre: "#17773a", velours: "#5c0c16", creux: "rgba(0,0,0,.5)" };
  const PLANCHE = { cols: 8, cellule: 96, visibles: 5 };
  let meuble = null, coffre = null;
  const varianteCoffre = () => {
    const v = opts.coffre || lire("pcv-casino-coffre", "boites");
    return ["boites", "vitrines", "ecran"].includes(v) ? v : "boites";
  };
  const mondeMeuble = (x, y, z) => meuble.groupe.localToWorld(vec(x, y, z));
  const caseMeuble = (k) => {
    const R = RANGS[meuble.variante], c = k % R.cols, r = Math.floor(k / R.cols);
    return { x: (c - (R.cols - 1) / 2) * R.pasX, y: R.bas + (R.rangs - 1 - r) * R.pasY + R.h / 2, c, r };
  };
  const boite3 = (l, h, p, m) => new T.Mesh(garder(new T.BoxGeometry(l, h, p)), m);
  let atlas = null;
  const ATLAS = { l: 1024, h: 640, cl: 128, ch: 40, cols: 8 };
  const etiquette = (s, l, h) => {
    const A = ATLAS;
    atlas ||= (() => {
      const [c, x2] = toile(A.l, A.h), t = texture(c, { bord: true, flipY: true });
      return { x: x2, t, n: 0, mat: garder(new T.MeshLambertMaterial({ map: t, emissive: 16777215, emissiveMap: t, emissiveIntensity: 0.25 })) };
    })();
    const k = atlas.n++, cx = k % A.cols * A.cl, cy = Math.floor(k / A.cols) * A.ch, x = atlas.x;
    const dessiner = (im) => {
      x.save();
      x.beginPath();
      x.rect(cx, cy, A.cl, A.ch);
      x.clip();
      x.fillStyle = "#f6edd2";
      x.fillRect(cx, cy, A.cl, A.ch);
      x.strokeStyle = "#c8962c";
      x.lineWidth = 5;
      x.strokeRect(cx + 2.5, cy + 2.5, A.cl - 5, A.ch - 5);
      if (im) {
        const kk = (A.ch - 12) / im.naturalHeight;
        x.imageSmoothingEnabled = false;
        x.drawImage(im, cx + (A.cl - im.naturalWidth * kk) / 2, cy + 6, im.naturalWidth * kk, im.naturalHeight * kk);
      }
      x.restore();
      atlas.t.needsUpdate = true;
    };
    dessiner(null);
    if (s.icone) quandPrete(image(`${s.id}/${s.icone}`), dessiner);
    const geo = garder(new T.PlaneGeometry(l, h)), U = geo.attributes.uv;
    for (let i = 0; i < U.count; i++) U.setXY(i, (cx + U.getX(i) * A.cl) / A.l, 1 - (cy + (1 - U.getY(i)) * A.ch) / A.h);
    return new T.Mesh(geo, atlas.mat);
  };
  const fabriquerBoite = (s) => {
    const R = RANGS.boites, g = new T.Group(), M = meuble.mats;
    const caisse = boite3(R.l, R.h * 0.7, R.p, M.rouge);
    caisse.position.y = -R.h * 0.15;
    g.add(caisse);
    const charniere = new T.Group();
    charniere.position.set(0, R.h * 0.2, -R.p / 2);
    g.add(charniere);
    const couvercle = boite3(R.l + 0.08, R.h * 0.3, R.p + 0.08, M.rouge);
    couvercle.position.set(0, R.h * 0.15, R.p / 2);
    charniere.add(couvercle);
    const rebord = boite3(R.l + 0.1, 0.07, R.p + 0.1, M.or);
    rebord.position.set(0, 0, R.p / 2);
    charniere.add(rebord);
    const e = etiquette(s, R.l * 0.62, R.h * 0.58);
    e.position.set(0, -R.h * 0.12, R.p / 2 + 0.01);
    g.add(e);
    g.userData = { charniere, s };
    return g;
  };
  const fabriquerVitrine = (s) => {
    const R = RANGS.vitrines, g = new T.Group(), M = meuble.mats;
    const fond = boite3(R.l, R.h, 0.1, M.velours);
    fond.position.z = -R.p / 2;
    g.add(fond);
    const [c, x] = toile(160, 108), t = texture(c, { bord: true, flipY: true }), b = boite(), eus = s.lots.map((f) => `${s.id}/${f}`).filter((id) => possede(b, id)).slice(0, 6);
    const peindre = () => {
      x.fillStyle = "#7a1420";
      x.fillRect(0, 0, 160, 108);
      const lum = x.createRadialGradient(80, 10, 5, 80, 40, 110);
      lum.addColorStop(0, "rgba(255,220,160,.35)");
      lum.addColorStop(1, "rgba(0,0,0,.25)");
      x.fillStyle = lum;
      x.fillRect(0, 0, 160, 108);
      x.imageSmoothingEnabled = false;
      const l = eus.length ? eus : s.icone ? [`${s.id}/${s.icone}`] : [];
      l.forEach((id, k) => {
        const im = image(id);
        if (!pret(im)) return;
        const n = l.length, cols = Math.min(3, n), e2 = n > 1 ? 44 : 64, cx = 80 + (k % cols - (cols - 1) / 2) * 50, cy = (n > 3 ? 32 : 54) + Math.floor(k / cols) * 46;
        x.globalAlpha = eus.length ? 1 : 0.55;
        x.drawImage(im, cx - e2 / 2, cy - e2 / 2, e2, e2);
        x.globalAlpha = 1;
      });
      t.needsUpdate = true;
    };
    peindre();
    (eus.length ? eus : s.icone ? [`${s.id}/${s.icone}`] : []).forEach((id) => quandPrete(image(id), peindre));
    const vue_2 = new T.Mesh(garder(new T.PlaneGeometry(R.l - 0.1, R.h - 0.1)), garder(new T.MeshBasicMaterial({ map: t })));
    vue_2.position.z = -R.p / 2 + 0.06;
    g.add(vue_2);
    g.userData.apercu = vue_2;
    for (const [l, h, x2, y] of [[R.l + 0.16, 0.1, 0, R.h / 2], [R.l + 0.16, 0.1, 0, -R.h / 2], [0.1, R.h, -R.l / 2, 0], [0.1, R.h, R.l / 2, 0]]) {
      const b2 = boite3(l, h, R.p, M.rouge);
      b2.position.set(x2, y, 0);
      g.add(b2);
    }
    const charniere = new T.Group();
    charniere.position.set(-R.l / 2, 0, R.p / 2);
    g.add(charniere);
    const porte = new T.Group();
    porte.position.x = R.l / 2;
    charniere.add(porte);
    for (const [l, h, x2, y] of [[R.l, 0.08, 0, R.h / 2 - 0.04], [R.l, 0.08, 0, -R.h / 2 + 0.04], [0.08, R.h, -R.l / 2 + 0.04, 0], [0.08, R.h, R.l / 2 - 0.04, 0]]) {
      const b2 = boite3(l, h, 0.06, M.or);
      b2.position.set(x2, y, 0);
      porte.add(b2);
    }
    const vitre = new T.Mesh(garder(new T.PlaneGeometry(R.l - 0.1, R.h - 0.1)), M.vitre);
    vitre.position.z = 0.01;
    porte.add(vitre);
    const e = etiquette(s, R.l * 0.42, 0.32);
    e.position.set(0, -R.h / 2 - 0.2, R.p / 2 - 0.05);
    g.add(e);
    const lampe = new T.Mesh(garder(new T.PlaneGeometry(R.l - 0.3, 0.06)), M.lampe);
    lampe.position.set(0, R.h / 2 - 0.1, R.p / 2 - 0.2);
    lampe.rotation.x = Math.PI / 2;
    g.add(lampe);
    Object.assign(g.userData, { charniere, s });
    return g;
  };
  const construireMeuble = () => {
    const variante = varianteCoffre();
    if (variante === "ecran") return;
    atlas = null;
    const groupe = new T.Group();
    groupe.name = "bo\xEEte \xE0 badges : " + variante;
    groupe.position.copy(MEUBLE.pos);
    groupe.rotation.y = MEUBLE.lacet;
    scene.add(groupe);
    const mats = {
      bois: MATS.laqueSombre,
      boisClair: MATS.cuir,
      rouge: standard({ color: 6162445, roughness: 0.55 }),
      or: MATS.or,
      velours: MATS.velours,
      vitre: garder(new T.MeshPhongMaterial({ color: 14675967, transparent: true, opacity: 0.16, shininess: 120, depthWrite: false })),
      lampe: garder(new T.MeshBasicMaterial({ color: 16773320 }))
    };
    meuble = { variante, groupe, mats, cases: [] };
    const R = RANGS[variante], L = R.cols * R.pasX + 0.8, Ht = R.bas + R.rangs * R.pasY + 0.4;
    const fond = boite3(L, Ht, 0.4, mats.bois);
    fond.position.set(0, Ht / 2, -R.p / 2 - 0.5);
    groupe.add(fond);
    for (const s of [-1, 1]) {
      const c = boite3(0.5, Ht, R.p + 1, mats.boisClair);
      c.position.set(s * L / 2, Ht / 2, -0.1);
      groupe.add(c);
    }
    const dessus = boite3(L + 0.8, 0.5, R.p + 1.4, mats.boisClair);
    dessus.position.set(0, Ht + 0.25, 0);
    groupe.add(dessus);
    const corniche = boite3(L + 0.9, 0.18, 0.2, mats.or);
    corniche.position.set(0, Ht + 0.1, R.p / 2 + 0.72);
    groupe.add(corniche);
    const socle = boite3(L + 0.4, R.bas - 0.1, R.p + 1, mats.rouge);
    socle.position.set(0, (R.bas - 0.1) / 2, -0.1);
    groupe.add(socle);
    if (variante === "boites") for (let r = 0; r <= R.rangs; r++) {
      const e = boite3(L, 0.12, R.p + 0.6, mats.boisClair);
      e.position.set(0, R.bas + r * R.pasY - 0.06 - (R.pasY - R.h) / 2 + 0.05, -0.1);
      groupe.add(e);
    }
    seriesBoite().slice(0, R.cols * R.rangs).forEach((s, k) => {
      const p = caseMeuble(k), o = variante === "boites" ? fabriquerBoite(s) : fabriquerVitrine(s);
      o.position.set(p.x, p.y, variante === "boites" ? 0 : 0);
      groupe.add(o);
      meuble.cases.push(o);
    });
    groupe.updateMatrixWorld(true);
    fusionnerMeuble();
    groupe.matrixAutoUpdate = false;
  };
  const fusionnerMeuble = () => {
    if (!E.mergeGeometries) return;
    const G2 = meuble.groupe, inv = G2.matrixWorld.clone().invert(), parMat = /* @__PURE__ */ new Map();
    meuble.uCache = { value: new T.Vector2(-1, -1) };
    meuble.fusions = [];
    meuble.cases.forEach((o3, k) => o3.traverse((o) => {
      if (!o.isMesh || Array.isArray(o.material)) return;
      if (!parMat.has(o.material)) parMat.set(o.material, []);
      parMat.get(o.material).push([o, k]);
    }));
    for (const [mat, l] of parMat) {
      if (l.length < 2) continue;
      const geos = l.map(([o, k]) => {
        const g = (o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone()).applyMatrix4(new T.Matrix4().multiplyMatrices(inv, o.matrixWorld));
        for (const a of Object.keys(g.attributes)) if (!["position", "normal", "uv"].includes(a)) g.deleteAttribute(a);
        g.setAttribute("aCase", new T.Float32BufferAttribute(new Float32Array(g.attributes.position.count).fill(k), 1));
        return g;
      });
      const geo = E.mergeGeometries(geos, false);
      geos.forEach((g) => g.dispose());
      if (!geo) continue;
      const m2 = garder(mat.clone());
      m2.onBeforeCompile = (sh) => {
        sh.uniforms.uCache = meuble.uCache;
        sh.vertexShader = "attribute float aCase;\nuniform vec2 uCache;\n" + sh.vertexShader.replace("#include <project_vertex>", "#include <project_vertex>\n if (abs(aCase - uCache.x) < .5 || abs(aCase - uCache.y) < .5) gl_Position = vec4(0., 0., 2., 1.);");
      };
      m2.customProgramCacheKey = () => "pcv-meuble";
      const f = new T.Mesh(garder(geo), m2);
      f.renderOrder = l[0][0].renderOrder;
      G2.add(f);
      meuble.fusions.push(f);
      for (const [o] of l) o.userData.fusionne = true;
    }
    majMeuble();
  };
  const majMeuble = () => {
    if (!meuble?.fusions) return;
    const a = coffre ? coffre.k : -1, b = retour ? retour.k : -1;
    meuble.uCache.value.set(a, b);
    meuble.cases.forEach((o3, k) => {
      const vrai = k === a || k === b;
      if (o3.userData.vif === vrai) return;
      o3.userData.vif = vrai;
      o3.traverse((o) => {
        if (o.userData.fusionne) o.visible = vrai;
      });
      if (!vrai) o3.updateMatrixWorld(true);
      o3.matrixWorldAutoUpdate = vrai;
    });
  };
  const silhouette = (im, couleur) => {
    const [c, x] = toile(im.naturalWidth || im.width, im.naturalHeight || im.height);
    x.drawImage(im, 0, 0);
    x.globalCompositeOperation = "source-in";
    x.fillStyle = couleur;
    x.fillRect(0, 0, c.width, c.height);
    return c;
  };
  const planche = (s, fondCouleur) => {
    const P = PLANCHE, ids = s.lots.map((f) => `${s.id}/${f}`), rangs = Math.max(P.visibles, Math.ceil(ids.length / P.cols)), e = P.cellule;
    const [c, x] = toile(P.cols * e, rangs * e), t = texture(c, { bord: true, flipY: true }), b = boite();
    t.repeat.set(1, P.visibles / rangs);
    x.fillStyle = fondCouleur;
    x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = "rgba(255,255,255,.035)";
    for (let k = 0; k < c.height; k += 3) x.fillRect(0, k, c.width, 1);
    ids.forEach((id, k) => {
      const cx = (k % P.cols + 0.5) * e, cy = (Math.floor(k / P.cols) + 0.5) * e, d = e * 0.86;
      x.fillStyle = "rgba(0,0,0,.16)";
      x.beginPath();
      x.roundRect(cx - d / 2, cy - d / 2, d, d, e * 0.14);
      x.fill();
      x.strokeStyle = "rgba(255,255,255,.1)";
      x.lineWidth = 2;
      x.beginPath();
      x.roundRect(cx - d / 2 + 1, cy - d / 2 + 2, d, d, e * 0.14);
      x.stroke();
    });
    const poserImage = (im, cx, cy, l, h, possede_) => {
      x.imageSmoothingEnabled = false;
      if (possede_) {
        const a = autocollant(im, false, 2), k = 0.82 / (1 - 2 * a.marge), L = l * k, Hh = h * k;
        x.imageSmoothingEnabled = true;
        x.globalAlpha = 0.4;
        x.drawImage(silhouette(a.c, "#000"), cx - L / 2 + 3, cy - Hh / 2 + 4, L, Hh);
        x.globalAlpha = 1;
        x.drawImage(a.c, cx - L / 2, cy - Hh / 2, L, Hh);
      } else {
        x.drawImage(silhouette(im, "rgba(0,0,0,.4)"), cx - l / 2, cy - h / 2, l, h);
        x.globalAlpha = 0.5;
        x.drawImage(silhouette(im, "rgba(255,255,255,.14)"), cx - l / 2 + 1.5, cy - h / 2 + 2, l, h);
        x.globalAlpha = 1;
      }
      t.needsUpdate = true;
    };
    ids.forEach((id, k) => {
      const cx = (k % P.cols + 0.5) * e, cy = (Math.floor(k / P.cols) + 0.5) * e, [tl, th] = tailleDe(id), cote = e * 0.8, pieces = morceauxDe.get(id);
      if (pieces && !b[id]) {
        const pc = cote / Math.max(tl, th);
        pieces.forEach((pid, j) => quandPrete(image(pid), (im) => poserImage(im, cx + (j % tl - (tl - 1) / 2) * pc, cy + (Math.floor(j / tl) - (th - 1) / 2) * pc, pc, pc, !!b[pid])));
      } else quandPrete(image(id), (im) => {
        const k2 = cote / Math.max(im.naturalWidth, im.naturalHeight);
        poserImage(im, cx, cy, im.naturalWidth * k2, im.naturalHeight * k2, possede(b, id));
      });
    });
    return { t, rangs, ids };
  };
  const texCurseur = () => {
    const [c, x] = toile(128, 128);
    x.strokeStyle = "#2b8cff";
    x.lineWidth = 12;
    x.beginPath();
    x.roundRect(8, 8, 112, 112, 18);
    x.stroke();
    x.strokeStyle = "#ffffff";
    x.lineWidth = 5;
    x.beginPath();
    x.roundRect(8, 8, 112, 112, 18);
    x.stroke();
    return texture(c, { bord: true, flipY: true });
  };
  PLANS.meuble = () => planMeuble(coffre?.k ?? 0);
  const VUE_MEUBLE = { recul: 20, fov: 31, base: 10, jeu: 0.25 };
  const planMeuble = (k) => {
    const R = RANGS[meuble.variante], V = VUE_MEUBLE, G2 = GUICHET, p = caseMeuble(k), y = p.y, z0 = R.p / 2;
    const zDessus = G2.avance + 0.15 - 1.6 - G2.meuble, zFestons = G2.avance + 2 - G2.meuble, yFestons = G2.marquise - (G2.long + 1.5) / 21 / 2 - V.jeu;
    const k_ = (z) => (V.recul - z0) / (z - z0), haut = Math.min(Math.max(V.base, y + (G2.haut + V.jeu - y) * k_(zDessus)), y + (yFestons - y) * k_(zFestons));
    const bord = (R.cols * R.pasX + 0.8) / 2 - V.recul * Math.tan(V.fov / 2 * Math.PI / 180) * camera.aspect, x = clamp(p.x + 1, -bord, bord);
    return { pos: mondeMeuble(x, haut, V.recul), cible: mondeMeuble(x, y, 0), fov: V.fov };
  };
  PLANS.dedans = () => {
    const o = coffre.ouverte;
    if (!o) return PLANS.salle();
    const c = o.surface.getWorldPosition(vec(0, 0, 0)), nrm = o.normale.clone();
    return { pos: c.clone().addScaledVector(nrm, o.recul), cible: c, fov: 34 };
  };
  const placeLuigiMeuble = (k) => guichetEn(dansLeCouloir(caseMeuble(k).x + 5.5), GUICHET.meuble + 4.5);
  const attenteMeuble = (k) => guichetEn(caseMeuble(k).x < 0 ? COULOIR.x1 - 1 : COULOIR.x0 + 1, GUICHET.couloir);
  PLANS.prise = () => {
    const p = caseMeuble(coffre?.k ?? 0);
    return { pos: mondeMeuble(p.x + 3, 12.5, 30), cible: mondeMeuble(p.x + 3, 7, 0), fov: 40 };
  };
  const SUR_TABLE = guichetEn(0, GUICHET.avance + 0.9, GUICHET.haut), CAP_BOITE = new T.Quaternion().setFromAxisAngle(AXE_Y, CAP_GUICHET), NORMALE_BOITE = vec(0, 1, 0).addScaledVector(SALLE_G, 0.55).normalize();
  const vueApresCoffre = (c) => c?.vueAvant === "guichet" ? "guichet" : "salle";
  const luigiApresCoffre = (v) => v === "guichet" ? allerLuigi([placeGuichet()], ACCOUDE()) : luigiVersTable();
  const ouvrirCoffre = () => {
    if (!meuble || coffre) return false;
    if (bulle?.bloque) fermerBulle();
    dire(auHasard(REPLIQUES.boite), { bas: false });
    const l = seriesBoite(), b = boite();
    let k = l.findIndex((s) => s.lots.some((f) => possede(b, `${s.id}/${f}`)));
    if (k < 0) k = 0;
    coffre = { k: Math.min(k, meuble.cases.length - 1), phase: "choix", vueAvant: vue, badge: 0, defile: 0, porte: null, ouverte: null, fiche: null };
    mJeu = null;
    vue = "coffre";
    son("approche");
    musique("boite");
    allerLuigi([attenteMeuble(coffre.k)], { regard: mondeMeuble(caseMeuble(coffre.k).x, 6, 0) });
    allerA("meuble", 0, dureeTrajet(), true, true);
    attendreLuigi();
    majHud();
    return true;
  };
  const deplacerCurseur = (k) => {
    k = clamp(k, 0, meuble.cases.length - 1);
    if (k === coffre.k) return son("refus", 0.5);
    meuble.cases[coffre.k].position.z = 0;
    coffre.k = k;
    son("bouge", 0.6);
    allerA("meuble", 0, 0.5);
    if (luigiObj && !trajet) luigi?.regarder(mondeMeuble(caseMeuble(k).x, caseMeuble(k).y, 0));
    majHud();
  };
  const garnirPlanche = (o, s, fondCouleur, l, h, parent, position) => {
    const pl = planche(s, fondCouleur), surface = new T.Mesh(garder(new T.PlaneGeometry(l, h)), garder(new T.MeshBasicMaterial({ map: pl.t, color: 15788256 })));
    surface.position.copy(position);
    parent.add(surface);
    const curseur = new T.Mesh(garder(new T.PlaneGeometry(l / PLANCHE.cols, h / PLANCHE.visibles)), garder(new T.MeshBasicMaterial({ map: texCurseur(), transparent: true, depthWrite: false })));
    curseur.renderOrder = 4;
    parent.add(curseur);
    Object.assign(o, { surface, curseur, planche: pl, l, h, s });
    placerCurseurPlanche();
  };
  const placerCurseurPlanche = () => {
    const o = coffre?.ouverte;
    if (!o) return;
    const P = PLANCHE, i = coffre.badge, c = i % P.cols, r = Math.floor(i / P.cols);
    coffre.defile = clamp(coffre.defile, r - P.visibles + 1, r);
    coffre.defile = clamp(coffre.defile, 0, Math.max(0, o.planche.rangs - P.visibles));
    o.planche.t.offset.y = 1 - (coffre.defile + P.visibles) / o.planche.rangs;
    o.curseur.position.copy(o.surface.position).add(vec((c + 0.5) * o.l / P.cols - o.l / 2, o.h / 2 - (r - coffre.defile + 0.5) * o.h / P.visibles, 0.02).applyQuaternion(o.surface.quaternion));
    o.curseur.quaternion.copy(o.surface.quaternion);
  };
  const idCourant = () => coffre?.ouverte?.planche.ids[coffre.badge];
  const prendre = () => {
    const o3 = meuble.cases[coffre.k], s = o3.userData.s, ici = placeLuigiMeuble(coffre.k);
    if (luigiObj && Math.hypot(luigiObj.position.x - ici.x, luigiObj.position.z - ici.z) > 1.5) {
      coffre.phase = "va";
      allerA("prise", 0, 0.9);
      allerLuigi([ici], { regard: mondeMeuble(caseMeuble(coffre.k).x, 6, 0), arrivee: () => {
        if (coffre?.phase === "va") prendre();
      } });
      return;
    }
    if (meuble.variante === "vitrines") {
      coffre.phase = "ouvre";
      geste("ouvrir");
      coffre.anim = { t: 0, d: 1.6, f: (k) => {
        o3.userData.charniere.rotation.y = -1.9 * lisse((k - 0.3) / 0.5);
      }, fin: () => {
        const R = RANGS.vitrines, o = { o3, normale: vec(0, 0, 1).applyQuaternion(meuble.groupe.quaternion), recul: 4.4 };
        coffre.ouverte = o;
        o3.userData.apercu.visible = false;
        garnirPlanche(o, s, "#7a1420", R.l - 0.3, (R.l - 0.3) * PLANCHE.visibles / PLANCHE.cols, o3, vec(0, 0, -R.p / 2 + 0.08));
        coffre.phase = "ouvert";
        allerA("dedans", 0, 1);
        majHud();
      } };
      return;
    }
    coffre.phase = "prend";
    geste("designer", { vers: o3.getWorldPosition(vec(0, 0, 0)) });
    coffre.anim = { t: 0, d: 1.2, f: (k) => {
      o3.position.z = 1.4 * lisse(k / 0.5);
    }, fin: () => {
      const monde_ = o3.getWorldPosition(vec(0, 0, 0)), q = o3.getWorldQuaternion(new T.Quaternion());
      scene.attach(o3);
      o3.position.copy(monde_);
      o3.quaternion.copy(q);
      coffre.portee = o3;
      allerLuigi([placeGuichet()], { ...ACCOUDE(), arrivee: poserSurTable });
      luigi?.reagir("porter", { silence: true }).catch(() => {
      });
      allerA("guichet", 0, dureeTrajet(), true, true);
      coffre.phase = "porte";
    } };
  };
  const poserSurTable = () => {
    if (coffre?.phase !== "porte") return;
    const o3 = coffre.portee;
    luigi?.finir?.();
    coffre.phase = "pose";
    const de = o3.position.clone(), qa = o3.quaternion.clone(), qb = CAP_BOITE.clone();
    coffre.anim = { t: 0, d: 1.6, f: (k) => {
      o3.position.lerpVectors(de, SUR_TABLE.clone().add(vec(0, RANGS.boites.h * 0.5, 0)), lisse(k / 0.35));
      o3.quaternion.slerpQuaternions(qa, qb, lisse(k / 0.35));
      o3.scale.setScalar(1 + 0.25 * lisse(k / 0.35));
      if (k > 0.4) o3.userData.charniere.rotation.x = -1.95 * lisse((k - 0.4) / 0.4);
    }, debut: () => geste("ouvrir"), fin: () => {
      const R = RANGS.boites, o = { o3, normale: NORMALE_BOITE.clone(), recul: 4.6 };
      coffre.ouverte = o;
      const l = R.l - 0.25, h = R.p - 0.25;
      garnirPlanche(o, o3.userData.s, COULEURS_MEUBLE.feutre, l, Math.min(h, l * PLANCHE.visibles / PLANCHE.cols), o3, vec(0, -R.h * 0.15 + R.h * 0.35 + 0.01, 0));
      o.surface.rotation.x = -Math.PI / 2;
      placerCurseurPlanche();
      coffre.phase = "ouvert";
      allerA("dedans", 0, 1.1);
      majHud();
    } };
    coffre.anim.debut();
  };
  const fermerCoffre = () => {
    const c = coffre;
    if (!c) return;
    if (c.phase === "fiche") {
      c.fiche?.removeFromParent();
      c.fiche = null;
      c.phase = "ouvert";
      majHud();
      return;
    }
    if (c.phase === "ouvert" && meuble.variante === "vitrines") {
      const o3 = c.ouverte.o3;
      o3.userData.apercu.visible = true;
      c.ouverte.surface.removeFromParent();
      c.ouverte.curseur.removeFromParent();
      c.ouverte = null;
      c.phase = "ferme";
      geste("ouvrir");
      c.anim = { t: 0, d: 1, f: (k) => {
        o3.userData.charniere.rotation.y = -1.9 * (1 - lisse(k / 0.7));
      }, fin: () => {
        c.phase = "choix";
        majHud();
      } };
      allerA("meuble", 0, 0.9);
      return;
    }
    if (c.phase === "ouvert") {
      const o3 = c.ouverte.o3;
      c.ouverte.surface.removeFromParent();
      c.ouverte.curseur.removeFromParent();
      c.ouverte = null;
      c.phase = "ferme";
      son("retour");
      allerA(vueApresCoffre(c), 0, 1);
      c.anim = { t: 0, d: 0.6, f: (k) => {
        o3.userData.charniere.rotation.x = -1.95 * (1 - lisse(k));
      }, fin: rangerBoite };
      return;
    }
    if (c.phase === "choix") quitterCoffre();
  };
  const rangerBoite = () => {
    const c = coffre, o3 = c.portee;
    quitterCoffre();
    if (!o3) return;
    retour = { o3, k: c.k };
    allerLuigi([placeLuigiMeuble(c.k)], { regard: mondeMeuble(caseMeuble(c.k).x, 6, 0), arrivee: () => {
      remettre();
      luigiApresCoffre(vue === "guichet" ? "guichet" : "salle");
    } });
    luigi?.reagir("porter", { silence: true }).catch(() => {
    });
  };
  let retour = null;
  const remettre = () => {
    if (!retour) return;
    const { o3, k } = retour;
    retour = null;
    luigi?.finir?.();
    meuble.groupe.attach(o3);
    const p = caseMeuble(k);
    o3.position.set(p.x, p.y, 0);
    o3.quaternion.identity();
    o3.scale.setScalar(1);
    o3.userData.charniere.rotation.x = 0;
  };
  const quitterCoffre = () => {
    const c = coffre;
    if (!c) return;
    coffre = null;
    vue = vueApresCoffre(c);
    musique("salle");
    if (c.portee && c.phase !== "ferme") {
      retour = { o3: c.portee };
      retour.k = c.k;
      remettre();
    }
    if (meuble?.cases[c.k]) meuble.cases[c.k].position.z = 0;
    if (c.phase === "choix" || c.phase === "ouvre") {
      luigiApresCoffre(vue);
      allerA(vue, 0, dureeTrajet(), true, true);
      attendreLuigi();
    }
    majHud();
  };
  const ficheBadge = () => {
    const c = coffre, id = idCourant();
    if (!id || !possede(boite(), id)) return son("refus", 0.6);
    c.phase = "fiche";
    son("piece");
    c.nom = nomComplet(id);
    if (c.nom) remplacer("plaque", svgPlaque(c.nom));
    matAutocollant(id, false, (e) => {
      if (coffre !== c || c.phase !== "fiche") return;
      const o = c.ouverte, [tl, th] = tailleDe(id), cote = o.l / PLANCHE.cols * 2.2 / (1 - 2 * e.marge), k = cote / Math.max(tl, th);
      const f = new T.Mesh(garder(new T.PlaneGeometry(tl * k, th * k)), e.mat);
      f.renderOrder = 6;
      f.quaternion.copy(o.surface.quaternion);
      f.userData = { de: o.curseur.position.clone(), a: o.surface.position.clone().addScaledVector(vec(0, 0, 1).applyQuaternion(o.surface.quaternion), 0.5), t: 0 };
      o.o3.add(f);
      c.fiche = f;
    });
    majHud();
  };
  const toucheCoffre = (b) => {
    const c = coffre;
    if (!c) return false;
    if (["va", "prend", "porte", "pose", "ouvre", "ferme"].includes(c.phase)) return true;
    if (b === 2) {
      fermerCoffre();
      return true;
    }
    if (c.phase === "choix") {
      const C_ = RANGS[meuble.variante].cols;
      if (b === 11) deplacerCurseur(c.k - 1);
      else if (b === 12) deplacerCurseur(c.k + 1);
      else if (b === 9) deplacerCurseur(c.k - C_);
      else if (b === 10) deplacerCurseur(c.k + C_);
      else if (b === 1) {
        if (trajet) return true;
        son("approche");
        prendre();
      }
      return true;
    }
    if (c.phase === "ouvert") {
      const n = c.ouverte.planche.ids.length, P = PLANCHE;
      const i = b === 11 ? c.badge - 1 : b === 12 ? c.badge + 1 : b === 9 ? c.badge - P.cols : b === 10 ? c.badge + P.cols : null;
      if (i != null) {
        if (i >= 0 && i < n) {
          c.badge = i;
          son("bouge", 0.5);
          placerCurseurPlanche();
          majHud();
        }
        return true;
      }
      if (b === 1) ficheBadge();
      return true;
    }
    if (c.phase === "fiche") {
      if (b === 1) poser(idCourant());
      return true;
    }
    return true;
  };
  const animerCoffre = (dt) => {
    const c = coffre;
    majMeuble();
    if (c?.anim) {
      const a = c.anim;
      a.t += dt;
      a.f(Math.min(1, a.t / a.d));
      if (a.t >= a.d) {
        c.anim = null;
        a.fin?.();
      }
    }
    const portee = c?.phase === "porte" ? c.portee : retour?.o3;
    if (portee && luigi) {
      const g = luigi.os.wrist_l1.getWorldPosition(vec(0, 0, 0)).add(luigi.os.wrist_r1.getWorldPosition(vec(0, 0, 0))).multiplyScalar(0.5);
      portee.position.copy(g).add(vec(Math.sin(luigiObj.rotation.y), 0, Math.cos(luigiObj.rotation.y)).multiplyScalar(0.7));
      portee.rotation.set(0, luigiObj.rotation.y, 0);
    }
    if (c?.fiche) {
      const f = c.fiche, u = f.userData;
      u.t = Math.min(1, u.t + dt / 0.35);
      f.position.lerpVectors(u.de, u.a, lisse(u.t));
      f.scale.setScalar(0.5 + 0.5 * lisse(u.t));
    }
    if (meuble && c?.phase === "choix") {
      const o = meuble.cases[c.k];
      o.position.z = amortir(o.position.z, 0.5, 8, dt);
    }
  };
  const actionCoffre = () => {
    const c = coffre;
    if (!c) return null;
    if (c.phase === "choix") {
      const s = meuble.cases[c.k]?.userData.s;
      return s ? `${s.nom} : ${s.sous}` : null;
    }
    if (c.phase === "ouvert") {
      const id = idCourant();
      return id && possede(boite(), id) ? nomComplet(id) : null;
    }
    if (c.phase === "fiche") return Tr("casino.poser_sur_accueil");
    return null;
  };
  const CARREFOUR = ST(10, 4);
  const ancre = (nom) => decor?.userData.ancres?.[nom];
  const croupier = (nom, sinon) => {
    const a = ancre(nom);
    if (!a?.userData.croupier) return sinon;
    a.updateWorldMatrix(true, false);
    return a.localToWorld(a.userData.croupier.clone()).setY(0);
  };
  const JEUX = [
    // (la grande table : face à Luigi tant que ses Mii ne sont pas là ; ensuite, « table » à plusieurs : voir venueDesMii)
    { nom: "cartes", cible: ST(31, -24, 6), cam: ST(27, 10, 13), fov: 40, fovPartie: 50, get luigi() {
      return croupier(this.ancre || this.nom, ST(30, -32));
    }, par: [ST(10, -26), ST(12, -38)] },
    { nom: "roulette", cible: ST(54, 27.5, 7.5), cam: ST(38.5, 49, 12), fov: 38, fovPartie: 50, get luigi() {
      return croupier("roulette", ST(63, 22));
    }, par: [ST(50, 12)] },
    { nom: "machines", cible: ST(6.5, -49, 8), cam: ST(7.5, -20, 9.5), fov: 50, fovPartie: 44, luigi: ST(-7, -44.5), par: [ST(2, -30)] },
    // (8/10) le poker au comptoir de Luigi (ancre « comptoir ») : Ⓐ dans la salle ; Luigi n'a pas à marcher, il y est
    { nom: "cartes", cle: "comptoir", ancre: "comptoir", cible: pres(0, 3, TABLE + 1.5), cam: pres(0, 24, 13), fov: 40, fovPartie: 50, get luigi() {
      return croupier("comptoir", LUIGI.pos.clone().setY(0));
    }, par: [] }
  ];
  const JEU_COMPTOIR = JEUX.findIndex((J) => J.cle === "comptoir"), ancreDe = (J) => ancre(J.ancre || J.nom);
  PLANS.jeu = (i) => {
    const J = JEUX[i];
    return { pos: J.cam.clone(), cible: J.cible.clone(), fov: J.fov };
  };
  PLANS.partieJeu = (i) => {
    const J = JEUX[i], a = ancreDe(J), c = a && window.__pcvCasinoJeux?.cadrage?.(J.nom, a);
    if (!c) return null;
    a.updateWorldMatrix(true, false);
    return { pos: a.localToWorld(vec(...c[0])), cible: a.localToWorld(vec(...c[1])), fov: J.fovPartie || J.fov };
  };
  const cheminJeu = (de, i) => {
    const k = JEUX.findIndex((J) => J.luigi.distanceTo(vec(de.x, 0, de.z)) < 3), l = [];
    if (aTable(de)) l.push(ARRIERE.clone());
    if (k >= 0) l.push(...JEUX[k].par.slice().reverse().map((p) => p.clone()));
    l.push(CARREFOUR.clone());
    if (i == null) l.push(ARRIERE.clone(), LUIGI.pos.clone().setY(0));
    else l.push(...JEUX[i].par.map((p) => p.clone()), JEUX[i].luigi.clone());
    return l;
  };
  let jeu = 0, jeuOuvert = null;
  const versJeu = (i) => {
    jeu = (i + JEUX.length) % JEUX.length;
    vue = "jeu";
    son("approche");
    const J = JEUX[jeu];
    if (luigiObj && !(J.cle === "comptoir" && aTable(luigiObj.position))) allerLuigi(cheminJeu(luigiObj.position, J.cle === "comptoir" ? null : jeu), { table: J.cle === "comptoir", regard: J.cam, arrivee: () => geste("designer", { vers: J.cible }) });
    allerA("jeu", jeu, 1.8, true, true);
    attendreLuigi();
    majHud();
  };
  const parImage = /* @__PURE__ */ new Set();
  const cadrer = (pos, cible, duree = 1) => new Promise((ok) => {
    const q = { pos: pos.clone(), cible: cible.clone(), fov: jeuOuvert && JEUX[jeu].fovPartie || camera.fov };
    if (!duree) {
      plan = { de: q, a: q, t: 1, d: 1 };
      return ok();
    }
    plan = { de: courant(), a: q, t: 0, d: duree, fin: ok };
  });
  let ancreOuverte = null;
  const ouvrirJeu = () => {
    const J = JEUX[jeu], X = window.__pcvCasinoJeux, a = ancreDe(J);
    if (!X?.ouvrir || !a) return son("refus", 0.6);
    jeuOuvert = J.nom;
    ancreOuverte = a;
    a.userData.pilote = true;
    if (J.nom === "cartes" || J.nom === "table") musique("cartes");
    if (a.userData.siege) a.userData.siege.visible = false;
    majHud();
    if (luigiObj) {
      trajet = null;
      luigiObj.position.copy(J.luigi);
      luigiObj.position.y = solSalle(luigiObj.position);
      luigiObj.rotation.y = Math.atan2(J.cam.x - J.luigi.x, J.cam.z - J.luigi.z);
    }
    const aide = {
      crediter,
      fermer: fermerJeu,
      THREE: T,
      scene,
      camera,
      ancre: a,
      cadrer,
      rendu: (f) => {
        parImage.add(f);
        return () => parImage.delete(f);
      },
      luigi: { geste, regarder: (v) => luigi?.regarder(v ?? camera.position.clone()), objet: luigiObj, main: mainLuigi, cartes: cartesLuigi },
      dialogue: (l) => dialogue(l),
      joueurs: J.nom === "table" ? joueursTable() : void 0
    };
    majAnneau();
    Promise.resolve(X.ouvrir(J.nom, racine, aide)).then(fermerJeu, fermerJeu);
  };
  const fermerJeu = () => {
    if (!jeuOuvert) return;
    if (jeuOuvert === "guichet") return fermerVenteGuichet();
    const a = ancreOuverte;
    ancreOuverte = null;
    if (a) {
      a.userData.pilote = false;
      if (a.userData.siege) a.userData.siege.visible = true;
    }
    jeuOuvert = null;
    parImage.clear();
    window.__pcvCasinoJeux?.fermer?.();
    cartesLuigi(false);
    musique("salle");
    allerA("jeu", jeu, 0.8);
    majHud();
  };
  const quitterJeu = () => {
    vue = "salle";
    son("retour");
    if (luigiObj && !aTable(luigiObj.position)) allerLuigi(cheminJeu(luigiObj.position, null), { table: true, regard: PLANS.salle().pos, arrivee: () => vue === "salle" && geste("accueil") });
    allerA("salle", 0, 1.8, true, true);
    attendreLuigi();
    majHud();
  };
  let miiTable = [], decorTable = null;
  const JEU_TABLE_SEUL = { nom: JEUX[0].nom, cam: JEUX[0].cam, cible: JEUX[0].cible, fov: JEUX[0].fov, fovPartie: JEUX[0].fovPartie };
  const VISEE_TABLE = new T.Sphere(POKER.centre.clone().setY(6), POKER.rayon + 9), champ = new T.Frustum(), mChamp = new T.Matrix4();
  const venueDesMii = async () => {
    const V = window.__pcvVraisMii;
    if (!V || !decor || miiTable.length || !ouvert) return;
    try {
      const M = window.__pcvMii3D?.vrais ? window.__pcvMii3D : await V.charger?.();
      const n = M?.invites?.length || 0;
      if (!n || !ouvert) return;
      const S2 = TABLE_MII, l = [], fini = () => {
        for (const e of l) e.m.liberer();
      };
      for (const [k, [x, z]] of S2.sieges.entries()) {
        await new Promise((ok) => requestAnimationFrame(() => setTimeout(ok, 0)));
        if (!ouvert || !scene) return fini();
        const i = S2.invites[k] % n, m = M.creer({ donnees: M.invite(i), rendu, resolution: S2.resolution, expressions: S2.etats, pantalon: "gris" });
        const p = POKER.centre.clone().add(vec(x, S2.assise, z)), regard = POKER.centre.clone().add(vec(x * S2.regard, 5.5, z * S2.regard));
        m.regler(S2.taille);
        m.objet.position.copy(p);
        m.cap = m.capVise = Math.atan2(POKER.centre.x - p.x, POKER.centre.z - p.z);
        m.objet.rotation.y = m.cap;
        m.jouer("assis");
        m.regarder(regard);
        m.expression(S2.expressions[k]);
        m.maj(0);
        const e = { m, k, nom: M.invites[i].nom || Tr("casino.invite_n", { n: k + 1 }), dir: [x / Math.hypot(x, z), z / Math.hypot(x, z)], regard, expr: S2.expressions[k], a: accorderMii(m.objet) };
        l.push(e);
        await rendu.compileAsync?.(m.objet, camera, scene).catch(() => {
        });
        if (!ouvert || !scene) return fini();
        scene.add(m.objet);
      }
      miiTable = l;
      Object.assign(JEUX[0], { nom: "table", ancre: "table", cam: S2.vue.pos.clone(), cible: S2.vue.cible.clone(), fov: S2.vue.fov, fovPartie: S2.jeu.fov });
      try {
        decorTable = window.__pcvCasinoJeux?.decorTable?.(T, ancre("table"), joueursTable()) || null;
      } catch (e) {
        console.warn("casino : d\xE9cor de la grande table", e);
      }
      ordreZones = null;
      if (vue === "jeu" && jeu === 0 && !jeuOuvert) allerA("jeu", 0, 1);
      majHud();
    } catch (e) {
      console.warn("casino : les Mii de la grande table ne sont pas venus", e);
    }
  };
  const majMiiTable = (dt) => {
    if (!miiTable.length) return;
    camera.updateMatrixWorld();
    champ.setFromProjectionMatrix(mChamp.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
    const vu = !(vue === "machine" && plan.t >= plan.d) && champ.intersectsSphere(VISEE_TABLE);
    for (const e of miiTable) {
      if (e.m.objet.visible !== vu) e.m.objet.visible = vu;
      if (vu) e.m.maj(dt);
    }
  };
  const joueursTable = () => miiTable.map((e) => ({
    nom: e.nom,
    dir: e.dir,
    tete: () => e.m.objet.position.clone().add(vec(0, ACCORD.mii.tete, 0)),
    parler: (oui) => {
      e.m.expression(oui ? "parle" : e.expr);
    },
    regarder: (v) => {
      e.m.regarder(v || e.regard);
    },
    reagir: (nom) => {
      e.m.expression(nom === "gagne" ? "joie" : "inquiet");
      e.m.bras = nom === "gagne" ? "salut" : null;
      apres(TABLE_MII.reaction, () => {
        e.m.expression(e.expr);
        e.m.bras = null;
      });
    }
  }));
  const majAnneau = () => {
    const a = decor?.userData.anneauJoueur;
    if (a) a.visible = miiTable.length > 0 && vue === "jeu" && JEUX[jeu]?.nom === "table" && !jeuOuvert;
  };
  const choixGuichet = () => [Tr("casino.une_partie_pieces", { n: window.__pcvCasinoJeux?.ECO?.taux ?? CHANGE_REPLI }), Tr("casino.petit_depannage"), Tr("casino.revendre_badges"), Tr("casino.ouvrir_boite_badges")];
  const versGuichet = () => {
    if (bulle && !bulle.bloque) fermerBulle();
    vue = "guichet";
    son("approche");
    musique("salle");
    if (!luigiObj) {
      allerA("guichet", 0, 1.4, true, true);
      apres(1.4, menuGuichet);
      majHud();
      return;
    }
    allerLuigi([placeGuichet()], { ...ACCOUDE(), arrivee: () => {
      if (vue === "guichet") menuGuichet();
    } });
    allerA("guichet", 0, dureeTrajet(), true, true);
    attendreLuigi();
    majHud();
  };
  const menuGuichet = async () => {
    if (vue !== "guichet" || bulle?.bloque || jeuOuvert || coffre) return;
    const r = await dialogue([{ texte: Tr("luigi.caisse_bienvenue"), choix: choixGuichet(), annuler: -1, geste: "accueil" }], { guichet: true });
    if (vue !== "guichet") return;
    const X = window.__pcvCasinoJeux;
    if (r === 0 || r === 1) {
      const res = X?.guichet ? X.guichet[r ? "depanner" : "changer"]() : { ok: false, texte: Tr("casino.tables_fermees") };
      if (!res.ok) son("refus", 0.6);
      majHud();
      await dialogue([{ texte: res.texte, geste: res.ok ? "gagne" : "rate" }], { guichet: true });
      return menuGuichet();
    }
    if (r === 2) return ouvrirVenteGuichet();
    if (r === 3) return ouvrirCoffre();
  };
  const ouvrirVenteGuichet = () => {
    const X = window.__pcvCasinoJeux, a = decor?.userData.ancreGuichet;
    if (!X?.ouvrir || !a) return son("refus", 0.6);
    jeuOuvert = "guichet";
    majHud();
    const aide = {
      crediter,
      fermer: fermerVenteGuichet,
      THREE: T,
      scene,
      camera,
      ancre: a,
      cadrer: () => Promise.resolve(),
      rendu: (f) => {
        parImage.add(f);
        return () => parImage.delete(f);
      },
      luigi: { geste, regarder: (v) => luigi?.regarder(v ?? camera.position.clone()), objet: luigiObj }
    };
    Promise.resolve(X.ouvrir("guichet", racine, aide)).then(fermerVenteGuichet, fermerVenteGuichet);
  };
  const fermerVenteGuichet = () => {
    if (jeuOuvert !== "guichet") return;
    jeuOuvert = null;
    parImage.clear();
    window.__pcvCasinoJeux?.fermer?.();
    majHud();
    if (vue === "guichet") apres(0.25, menuGuichet);
  };
  const crediter = (n, raison = "") => {
    n = Math.max(0, Math.floor(+n || 0));
    if (!n) return totalParties();
    const p = parties();
    p.bonus += n;
    ecrire(CLE.parties, p);
    son("tombe");
    geste(n > 2 ? "bravo" : "gagne");
    if (hud) {
      majHud();
      if (!jeuOuvert) {
        hud.pieces.classList.remove("cache", "secoue");
        void hud.pieces.getBoundingClientRect();
        hud.pieces.classList.add("secoue");
      }
    }
    window.dispatchEvent(new CustomEvent("pcv-casino-credit", { detail: { n, raison, total: totalParties() } }));
    return totalParties();
  };
  const recouvert = () => {
    if (!racine?.isConnected || pilote) return false;
    const e = document.elementFromPoint(innerWidth / 2, innerHeight / 2);
    return !!e && !racine.contains(e);
  };
  const touche = (b) => {
    if (!racine || !ouvert || recouvert()) return false;
    if (!scene || !plan || !bornes.length) return b !== 2;
    try {
      return toucheOuvert(b);
    } catch (e) {
      console.warn("casino : touche", b, e);
      return b !== 2;
    }
  };
  const toucheOuvert = (b) => {
    if (bulle?.bloque) return toucheBulle(b);
    if (guide?.etape === "borne") {
      if (b === 2) {
        guide = null;
        return revenir();
      }
      return true;
    }
    if (aurevoir) return b === 2 ? (aurevoir = null, false) : true;
    if (boiteOuverte) return toucheBoite(b);
    if (coffre) return toucheCoffre(b);
    if (jeuOuvert) return !!window.__pcvCasinoJeux?.touche?.(b) || b !== 2;
    if (vue === "jeu") {
      if (b === 1) ouvrirJeu();
      else if (b === 2) quitterJeu();
      else if (b === 5 || b === 6 || b === 11 || b === 12) naviguer(b === 6 || b === 12 ? 1 : -1);
      return true;
    }
    if (gain) return true;
    if (finSeance) {
      if (b === 1 || b === 2) finirSeance();
      return true;
    }
    if (vue === "reaction") {
      if (b === 1 || b === 2) finirReaction();
      return true;
    }
    if ((b === 3 || b === 4) && (vue !== "machine" || mJeu?.jeu?.etat === "attente")) {
      if (!meuble || !luigiObj || !ouvrirCoffre()) ouvrirBoite();
      return true;
    }
    if (b === 2) return revenir();
    if (vue === "guichet") {
      if (b === 1) menuGuichet();
      else if (b === 5 || b === 6 || b === 11 || b === 12) naviguer(b === 6 || b === 12 ? 1 : -1);
      return true;
    }
    if (vue === "salle") {
      if (b === 1) {
        if (JEU_COMPTOIR >= 0 && window.__pcvCasinoJeux?.ouvrir) versJeu(JEU_COMPTOIR);
        else versRangee();
      } else if (b === 5 || b === 6 || b === 11 || b === 12) naviguer(b === 6 || b === 12 ? 1 : -1);
      return true;
    }
    if (vue === "rangee") {
      if (b === 11 || b === 12 || b === 5 || b === 6) naviguer(b === 12 || b === 6 ? 1 : -1);
      else if (b === 1) approcher();
      return true;
    }
    if (vue === "machine") {
      const j = mJeu?.jeu;
      if (!j) return true;
      if (b === 1) jouer();
      else if ((b === 5 || b === 6) && j.etat === "attente") choisir(sel + (b === 6 ? 1 : -1));
      return true;
    }
    return true;
  };
  const relacher = (b = 1) => {
    if (b !== 1 || !racine || !ouvert) return false;
    const j = mJeu?.jeu;
    if (vue !== "machine" || !j) return false;
    if (lacherBouton(j)) majHud();
    return true;
  };
  const surRelache = (e) => {
    if (ouvert) relacher(e.detail?.button);
  };
  const surToucheLevee = (e) => {
    if (ouvert && e.key === "Enter") relacher(1);
  };
  const surLeveeHud = () => {
    if (!tenuHud) return;
    tenuHud = false;
    relacher(1);
  };
  const rayon = new T.Raycaster(), ndc = new T.Vector2();
  const versVitre = (e) => {
    const r = toileGL.getBoundingClientRect();
    ndc.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
    rayon.setFromCamera(ndc, camera);
    const bo = bornes[sel], o = monde(bo, 0, 0, Z.pince), plan3 = new T.Plane().setFromNormalAndCoplanarPoint(bo.n, o), p = new T.Vector3();
    if (!rayon.ray.intersectPlane(plan3, p)) return null;
    bo.groupe.worldToLocal(p);
    return (p.x - ZONE_JEU.x0) / S;
  };
  let doigt = null;
  const surDoigt = (e) => {
    if (boiteOuverte) return;
    if (e.type === "pointerdown") {
      doigt = { x: e.clientX, y: e.clientY, tient: false };
      if (vue === "machine" && !gain && mJeu?.jeu?.etat === "attente") {
        touche(1);
        doigt.tient = mJeu?.jeu?.etat === "deplacement";
      }
      toileGL.setPointerCapture?.(e.pointerId);
      return;
    }
    if (!doigt) return;
    if (e.type === "pointermove") return;
    const d = doigt;
    doigt = null;
    if (d.tient) return relacher(1);
    if (e.type !== "pointerup") return;
    const dx = e.clientX - d.x;
    if (vue === "machine") return;
    if (vue === "rangee" && Math.abs(dx) > 40) return choisir(sel + (dx < 0 ? 1 : -1));
    if (vue === "rangee") {
      const r = toileGL.getBoundingClientRect();
      ndc.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
      rayon.setFromCamera(ndc, camera);
      const i = bornes.findIndex((bo) => rayon.intersectObject(bo.groupe, true).length);
      if (i >= 0 && i !== sel && i < machines.length) return choisir(i);
    }
    touche(1);
  };
  const POST = { seuil: 1.9, douceur: 0.6, force: 0.36, forceLarge: 0.3, vignette: 0.3, exposition: 0.9 };
  let post = null;
  const SOMMET = "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }";
  const passeMat = (frag, uniforms, extra = {}) => garder(new T.ShaderMaterial({ vertexShader: SOMMET, fragmentShader: frag, uniforms, depthTest: false, depthWrite: false, ...extra }));
  const preparerPost = () => {
    if (!rendu.capabilities.isWebGL2 || !rendu.extensions.has("EXT_color_buffer_float") && !rendu.extensions.has("EXT_color_buffer_half_float")) return null;
    const cible = (o = {}) => garder(new T.WebGLRenderTarget(4, 4, { type: T.HalfFloatType, depthBuffer: false, ...o }));
    const P = { scene: cible({ samples: 4, depthBuffer: true }), a: cible(), b: cible(), c: cible(), d: cible(), taille: new T.Vector2() };
    P.extraire = passeMat(`uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uSeuil, uDouceur; varying vec2 vUv;
      void main() { vec3 c = .25 * (texture2D(tSrc, vUv + uTexel * vec2(-1., -1.)).rgb + texture2D(tSrc, vUv + uTexel * vec2(1., -1.)).rgb
          + texture2D(tSrc, vUv + uTexel * vec2(-1., 1.)).rgb + texture2D(tSrc, vUv + uTexel * vec2(1., 1.)).rgb);
        float b = max(c.r, max(c.g, c.b)), k = clamp(b - uSeuil + uDouceur, 0., 2. * uDouceur); k = k * k / (4. * uDouceur + 1e-4);
        gl_FragColor = vec4(c * max(k, b - uSeuil) / max(b, 1e-4), 1.); }`, { tSrc: { value: null }, uTexel: { value: new T.Vector2() }, uSeuil: { value: POST.seuil }, uDouceur: { value: POST.douceur } });
    P.reduire = passeMat(`uniform sampler2D tSrc; uniform vec2 uTexel; varying vec2 vUv;
      void main() { gl_FragColor = vec4(.25 * (texture2D(tSrc, vUv + uTexel * vec2(-1., -1.)).rgb + texture2D(tSrc, vUv + uTexel * vec2(1., -1.)).rgb
          + texture2D(tSrc, vUv + uTexel * vec2(-1., 1.)).rgb + texture2D(tSrc, vUv + uTexel * vec2(1., 1.)).rgb), 1.); }`, { tSrc: { value: null }, uTexel: { value: new T.Vector2() } });
    P.flou = passeMat(`uniform sampler2D tSrc; uniform vec2 uDir; varying vec2 vUv;
      void main() { vec3 s = texture2D(tSrc, vUv).rgb * .2270270270;
        s += (texture2D(tSrc, vUv + uDir * 1.3846153846).rgb + texture2D(tSrc, vUv - uDir * 1.3846153846).rgb) * .3162162162;
        s += (texture2D(tSrc, vUv + uDir * 3.2307692308).rgb + texture2D(tSrc, vUv - uDir * 3.2307692308).rgb) * .0702702703;
        gl_FragColor = vec4(s, 1.); }`, { tSrc: { value: null }, uDir: { value: new T.Vector2() } });
    P.final = passeMat(
      `uniform sampler2D tScene, tHalo, tHaloLarge; uniform float uForce, uForceLarge, uVignette, uExposition, uAspect; varying vec2 vUv;
      vec3 neutre(vec3 c) {   // \xAB Khronos PBR Neutral \xBB
        float x = min(c.r, min(c.g, c.b)), o = x < .08 ? x - 6.25 * x * x : .04; c -= o;
        float pic = max(c.r, max(c.g, c.b)); if (pic < .76) return c;
        float d = .24, np = 1. - d * d / (pic + d - .76); c *= np / pic;
        return mix(c, vec3(np), 1. - 1. / (.15 * (pic - np) + 1.)); }
      void main() { vec3 c = texture2D(tScene, vUv).rgb + texture2D(tHalo, vUv).rgb * uForce + texture2D(tHaloLarge, vUv).rgb * uForceLarge;
        vec2 d = (vUv - .5) * vec2(uAspect, 1.); c *= uExposition * mix(1., smoothstep(1.05, .3, length(d)), uVignette);
        gl_FragColor = vec4(neutre(max(c, 0.)), 1.);
        #include <colorspace_fragment>
        gl_FragColor.rgb += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - .5) / 255.; }`,
      { tScene: { value: null }, tHalo: { value: null }, tHaloLarge: { value: null }, uForce: { value: POST.force }, uForceLarge: { value: POST.forceLarge }, uVignette: { value: POST.vignette }, uExposition: { value: POST.exposition }, uAspect: { value: 1.6 } },
      { toneMapped: false }
    );
    P.quad = new T.Mesh(garder(new T.PlaneGeometry(2, 2)), P.final);
    P.quad.frustumCulled = false;
    P.sceneQuad = new T.Scene();
    P.sceneQuad.add(P.quad);
    P.cam = new T.Camera();
    return P;
  };
  const taillePost = () => {
    if (!post) return;
    const t = rendu.getDrawingBufferSize(post.taille), l = Math.max(1, t.x), h = Math.max(1, t.y);
    post.scene.setSize(l, h);
    const l4 = Math.max(1, Math.round(l / 4)), h4 = Math.max(1, Math.round(h / 4));
    post.a.setSize(l4, h4);
    post.b.setSize(l4, h4);
    const l8 = Math.max(1, Math.round(l / 8)), h8 = Math.max(1, Math.round(h / 8));
    post.c.setSize(l8, h8);
    post.d.setSize(l8, h8);
    post.extraire.uniforms.uTexel.value.set(1 / l, 1 / h);
    post.reduire.uniforms.uTexel.value.set(1 / l4, 1 / h4);
    post.final.uniforms.uAspect.value = l / h;
  };
  const passe = (mat, src, cible, dir) => {
    if (src) mat.uniforms.tSrc.value = src.texture;
    if (dir) mat.uniforms.uDir.value.copy(dir);
    post.quad.material = mat;
    rendu.setRenderTarget(cible);
    rendu.render(post.sceneQuad, post.cam);
  };
  const vH = new T.Vector2(), vV = new T.Vector2();
  const rendreImage = () => {
    if (!post) {
      rendu.setRenderTarget(null);
      rendu.render(scene, camera);
      return;
    }
    const P = post;
    rendu.setRenderTarget(P.scene);
    rendu.render(scene, camera);
    passe(P.extraire, P.scene, P.a);
    passe(P.flou, P.a, P.b, vH.set(1 / P.a.width, 0));
    passe(P.flou, P.b, P.a, vV.set(0, 1 / P.a.height));
    passe(P.reduire, P.a, P.c);
    passe(P.flou, P.c, P.d, vH.set(1 / P.c.width, 0));
    passe(P.flou, P.d, P.c, vV.set(0, 1 / P.c.height));
    P.final.uniforms.tScene.value = P.scene.texture;
    P.final.uniforms.tHalo.value = P.a.texture;
    P.final.uniforms.tHaloLarge.value = P.c.texture;
    passe(P.final, null, null);
  };
  const eclairer = () => {
    const hemi = new T.HemisphereLight(16766638, 2757176, 0.48);
    scene.add(hemi);
    ambiance = (a) => {
      hemi.intensity = a === "gris" ? 0.3 : 0.48;
    };
    ambiance(document.documentElement.dataset.pcvApparence);
    const lustre = new T.PointLight(16757864, 520, 125, 1.45);
    lustre.position.copy(ST(...LUSTRE_ST, 31));
    scene.add(lustre);
    const douche = new T.SpotLight(16773340, 320, 75, 0.5, 0.7, 1.25);
    douche.position.copy(DOUCHE);
    douche.target.position.copy(pres(0, 0.4, 4));
    douche.castShadow = true;
    douche.shadow.mapSize.set(1024, 1024);
    douche.shadow.camera.near = 10;
    douche.shadow.camera.far = 60;
    douche.shadow.bias = -4e-4;
    douche.shadow.normalBias = 0.03;
    douche.shadow.radius = 3;
    scene.add(douche, douche.target);
    const rampe = new T.PointLight(16763024, 380, 110, 1.4);
    rampe.position.copy(ST(-36, 16, 22));
    scene.add(rampe);
  };
  const cadresUtilises = () => {
    const vues = { entree: PLANS.entree(), salle: PLANS.salle() }, paires = [["entree", "salle", false]];
    bornes.forEach((_, i) => {
      vues["r" + i] = PLANS.rangee(i);
      vues["m" + i] = PLANS.machine(i);
      vues["p" + i] = PLANS.partie(i);
      vues["x" + i] = PLANS.reaction(i);
      paires.push(["salle", "r" + i, true], ["r" + i, "m" + i, false], ["m" + i, "p" + i, false], ["r" + i, "p" + i, false], ["p" + i, "x" + i, false], ["x" + i, "r" + i, false]);
      if (i) paires.push(["r" + (i - 1), "r" + i, false], ["m" + (i - 1), "m" + i, false], ["p" + (i - 1), "p" + i, false]);
    });
    JEUX.forEach((_, j) => {
      vues["j" + j] = PLANS.jeu(j);
      paires.push(["salle", "j" + j, true], ["j" + j, "j" + (j + 1) % JEUX.length, true]);
      const g = PLANS.partieJeu(j);
      if (g) {
        vues["g" + j] = g;
        paires.push(["j" + j, "g" + j, false]);
      }
    });
    if (meuble) {
      const R = RANGS[meuble.variante], n = meuble.cases.length;
      for (const k of [0, R.cols - 1, Math.floor(n / 2), n - R.cols, n - 1, Math.floor(R.cols / 2)]) {
        vues["b" + k] = planMeuble(clamp(k, 0, n - 1));
        paires.push(["salle", "b" + k, true]);
      }
      const c = SUR_TABLE.clone().add(vec(0, RANGS.boites.h * 0.5, 0));
      vues.dedans = { pos: c.clone().addScaledVector(NORMALE_BOITE, 4.6), cible: c, fov: 34 };
      paires.push(["guichet", "dedans", false]);
      vues.prise = PLANS.prise();
      paires.push(["guichet", "prise", false], ["prise", "b0", false]);
      for (const k of Object.keys(vues).filter((x) => /^b\d/.test(x))) paires.push(["guichet", k, false]);
    }
    vues.guichet = PLANS.guichet();
    paires.push(["salle", "guichet", true]);
    bornes.forEach((_, i) => paires.push(["guichet", "r" + i, true]));
    vues.tableVue = { ...TABLE_MII.vue };
    vues.tableJeu = { ...TABLE_MII.jeu };
    paires.push(["salle", "tableVue", true], ["tableVue", "tableJeu", false], ["guichet", "tableVue", true]);
    const plans = Object.values(vues);
    for (const [a, b, arc] of paires) {
      const A = vues[a], Bv = vues[b], par = arc ? A.pos.clone().lerp(Bv.pos, 0.5).add(vec(0, 11, 0)) : null;
      for (let k = 0.1; k < 0.95; k += 0.1) plans.push({
        pos: par ? A.pos.clone().multiplyScalar((1 - k) ** 2).addScaledVector(par, 2 * (1 - k) * k).addScaledVector(Bv.pos, k * k) : A.pos.clone().lerp(Bv.pos, k),
        cible: A.cible.clone().lerp(Bv.cible, k),
        fov: A.fov + (Bv.fov - A.fov) * k
      });
    }
    const cam = new T.PerspectiveCamera(40, 1.9, 0.3, 400), M = new T.Matrix4();
    return plans.map((p) => {
      cam.fov = p.fov * 1.1;
      cam.updateProjectionMatrix();
      cam.position.copy(p.pos);
      cam.lookAt(p.cible);
      cam.updateMatrixWorld(true);
      return new T.Frustum().setFromProjectionMatrix(M.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    });
  };
  const elaguer = () => {
    const cadres = cadresUtilises(), sph = new T.Sphere(), v = vec(0, 0, 0), vu = () => cadres.some((f) => f.intersectsSphere(sph));
    decor.updateMatrixWorld(true);
    const bilan = { maillages: 0, triangles: 0, ampoules: 0, feuilles: 0 }, retirer = [];
    decor.traverse((o) => {
      if (!o.isMesh || o.isInstancedMesh || o.userData.garder) return;
      o.geometry.computeBoundingSphere();
      sph.copy(o.geometry.boundingSphere).applyMatrix4(o.matrixWorld);
      sph.radius += 2.5;
      if (!vu()) {
        retirer.push(o);
        bilan.maillages++;
        bilan.triangles += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3;
      }
    });
    for (const o of retirer) o.removeFromParent();
    for (let i = ampoules.length - 1; i >= 0; i--) {
      const a = ampoules[i];
      if (bornes.some((bo) => a.o.parent && isDescendant(a.o, bo.groupe))) continue;
      a.o.updateWorldMatrix(true, false);
      sph.set(a.o.getWorldPosition(v), a.r + 2.5);
      if (!vu()) {
        a.o.removeFromParent();
        ampoules.splice(i, 1);
        bilan.ampoules++;
      }
    }
    for (const k of [kits.feuilles].filter(Boolean)) k.liste = k.liste.filter((e) => {
      e.o.updateWorldMatrix(true, false);
      sph.set(e.o.getWorldPosition(v), 6);
      const garde = vu();
      if (!garde) {
        e.o.removeFromParent();
        bilan.feuilles++;
      }
      return garde;
    });
    decor.userData.elagage = bilan;
  };
  const isDescendant = (o, g) => {
    for (let p = o; p; p = p.parent) if (p === g) return true;
    return false;
  };
  let masquables = null;
  const image_ = (dt, dessiner = true) => {
    if (!scene || !plan) return;
    horloge += dt;
    if (plan && plan.t < plan.d) plan.t = Math.min(plan.d, plan.t + dt);
    if (plan?.luigi) {
      if (trajet && luigiObj) plan.t = Math.min(plan.t, plan.d * clamp(1 - longueur(luigiObj.position, trajet.chemin) / plan.luigi + 0.12, 0, 1));
      else plan.luigi = 0;
    }
    if (plan?.fin && plan.t >= plan.d) {
      const f = plan.fin;
      plan.fin = null;
      f();
    }
    placerCamera();
    {
      const t0 = performance.now();
      for (const m of machines) if (m.monde?.preroule) preroulerUnPeu(m, Math.max(0, PREROULE_MS - (performance.now() - t0)));
    }
    if (mJeu?.monde) {
      let r = dt;
      while (r > 1e-4) {
        const p = Math.min(r, 1 / 120);
        avancer(mJeu, p);
        r -= p;
      }
      if (vue === "machine" && hud.etat !== mJeu.jeu.etat) {
        hud.etat = mJeu.jeu.etat;
        majHud();
      }
    }
    bornes.forEach((bo, i) => {
      if (bo.interieur && machines[i]) majInterieur(bo, machines[i]);
    });
    majNav();
    if (gain && horloge >= gain.fin) finirGain();
    if (finSeance && horloge >= finSeance.fin) finirSeance();
    sonsPince(dt);
    animerAffiche(dt);
    majPlusTard();
    animerTableau(dt);
    animerNuages(dt);
    animerCoffre(dt);
    majBulle(dt);
    majLuigi(dt);
    majMiiTable(dt);
    majMiiSalle();
    animerSalle(dt);
    for (const f of parImage) f(dt);
    const plein = vue === "machine" && plan.t >= plan.d;
    masquables ||= scene.children.filter((o) => o.name === "ampoules" || o.name === "halos");
    for (const o of masquables) o.visible = !plein;
    if (dessiner) {
      rendu.info.reset();
      rendreImage();
    }
  };
  const tourner = (t) => {
    if (!ouvert) return;
    boucle = requestAnimationFrame(tourner);
    if (document.hidden || !racine?.isConnected || boiteOuverte || window.__pcvMenuOuvert?.() || ((tourner.n = (tourner.n || 0) + 1) % 20 === 0 ? tourner.cache = recouvert() : tourner.cache)) {
      dernier = 0;
      return;
    }
    const dt = dernier ? Math.min(0.1, (t - dernier) / 1e3) : 0;
    dernier = t;
    const c0 = performance.now(), q = gpuDebut();
    image_(dt);
    gpuFin(q);
    suivreQualite(t, dt, performance.now() - c0);
  };
  const ajuster = () => {
    if (!rendu || !racine) return;
    const l = racine.clientWidth, h = racine.clientHeight;
    if (!l || !h) return;
    rendu.setSize(l, h, false);
    taillePost();
    camera.aspect = l / h;
    camera.updateProjectionMatrix();
    if (pilote) image_(0);
  };
  const SOUS_APPLI = "data-pcvc-sous", GARDER_PAR_DESSUS = "#pcv-toasts";
  const CSS_SOUS = `html.pcv-appli-plein [${SOUS_APPLI}] { visibility: hidden !important; }`;
  const masquerDessous = (oui) => {
    for (const e of document.querySelectorAll(`[${SOUS_APPLI}]`)) e.removeAttribute(SOUS_APPLI);
    if (!oui || !racine) return;
    for (let p = racine; p?.parentElement && p !== document.body; p = p.parentElement)
      for (const f of p.parentElement.children) if (f !== p && !/^(STYLE|SCRIPT|LINK)$/.test(f.tagName) && !f.matches(GARDER_PAR_DESSUS)) f.setAttribute(SOUS_APPLI, "");
  };
  const QUALITE = { max: 1.5, min: 0.6, pas: 0.85, gpuHaut: 13, gpuBas: 7.5, intervalleHaut: 19, attente: 1500, fenetre: 1e3 };
  let qualite = null;
  const qualiteNeuve = () => ({ r: Math.min(QUALITE.max, devicePixelRatio || 1), plafond: Math.min(QUALITE.max, devicePixelRatio || 1), requetes: [], libres: [], gpu: [], dts: [], cpu: [], change: 0, t0: 0, ext: null, aff: null, bilan: null });
  const gpuDebut = () => {
    const Q = qualite;
    if (!Q?.ext) return null;
    const gl = rendu.getContext();
    if (Q.requetes.length > 4) return null;
    const q = Q.libres.pop() || gl.createQuery();
    gl.beginQuery(Q.ext.TIME_ELAPSED_EXT, q);
    return q;
  };
  const gpuFin = (q) => {
    const Q = qualite, gl = rendu.getContext();
    if (q) {
      gl.endQuery(Q.ext.TIME_ELAPSED_EXT);
      Q.requetes.push(q);
    }
    while (Q.requetes.length && gl.getQueryParameter(Q.requetes[0], gl.QUERY_RESULT_AVAILABLE)) {
      const r = Q.requetes.shift();
      if (!gl.getParameter(Q.ext.GPU_DISJOINT_EXT)) Q.gpu.push(gl.getQueryParameter(r, gl.QUERY_RESULT) / 1e6);
      Q.libres.push(r);
    }
  };
  const regler = (r) => {
    const Q = qualite;
    r = Math.max(QUALITE.min, Math.min(Q.plafond, r));
    if (Math.abs(r - Q.r) < 0.01) return;
    Q.r = r;
    rendu.setPixelRatio(r);
    ajuster();
  };
  const suivreQualite = (t, dt, cpu) => {
    const Q = qualite;
    if (!Q || pilote) return;
    if (dt > 0) Q.dts.push(dt * 1e3);
    Q.cpu.push(cpu);
    if (!Q.t0) Q.t0 = t;
    if (t - Q.t0 < QUALITE.fenetre) return;
    Q.t0 = t;
    const moy = (a) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0, med = (a) => a.length ? a.slice().sort((x, y) => x - y)[a.length >> 1] : 0;
    const gpu = med(Q.gpu), inter = med(Q.dts);
    Q.bilan = { ips: Q.dts.length ? +(1e3 / moy(Q.dts)).toFixed(1) : 0, pire: Math.round(Math.max(0, ...Q.dts)), gpu: Q.gpu.length ? +gpu.toFixed(2) : null, cpu: +moy(Q.cpu).toFixed(2), echelle: +Q.r.toFixed(2), taille: [rendu.domElement.width, rendu.domElement.height], dessins: rendu.info.render.calls };
    if (Q.dts.length > 20) Q.ecran = Math.min(Q.ecran || 17, Q.dts.slice().sort((x, y) => x - y)[Q.dts.length / 10 | 0]);
    Q.gpu.length = Q.dts.length = Q.cpu.length = 0;
    if (Q.aff) Q.aff.textContent = `${Q.bilan.ips} i/s, pire ${Q.bilan.pire} ms, GPU ${Q.bilan.gpu ?? "?"} ms, CPU ${Q.bilan.cpu} ms, \xD7${Q.bilan.echelle} ${Q.bilan.taille.join("\xD7")}`;
    if (window.__pcvCasinoPerf && !Q.aff && racine) {
      Q.aff = document.createElement("div");
      Q.aff.style.cssText = "position:absolute;right:6px;top:4px;z-index:9;font:12px monospace;color:#9f9;background:rgba(0,0,0,.55);padding:2px 6px;pointer-events:none";
      racine.appendChild(Q.aff);
    } else if (!window.__pcvCasinoPerf && Q.aff) {
      Q.aff.remove();
      Q.aff = null;
    }
    if (t - Q.change < QUALITE.attente || window.__pcvCasinoPerf?.echelle) {
      if (window.__pcvCasinoPerf?.echelle) regler(window.__pcvCasinoPerf.echelle);
      return;
    }
    const k = Math.min(1, (Q.ecran || 17) * 0.06);
    const trop = Q.bilan.gpu != null ? gpu > QUALITE.gpuHaut * k : inter > QUALITE.intervalleHaut * k, large = Q.bilan.gpu != null && gpu < QUALITE.gpuBas * k;
    if (trop && Q.r > QUALITE.min) {
      regler(Q.r * QUALITE.pas);
      Q.change = t;
    } else if (large && Q.r < Q.plafond) {
      regler(Q.r / QUALITE.pas);
      Q.change = t;
    }
  };
  let observateur = null;
  let ambiance = null;
  addEventListener("pcv-apparence", (e) => ambiance?.(e.detail?.apparence));
  const ouvrir = async (conteneur, o = {}) => {
    if (!await window.__pcvNintendo?.exiger?.("casino")) return false;
    fermer();
    opts = o;
    pilote = !!o.pilote;
    ouvert = true;
    window.__pcvMusique?.(false);
    window.__pcvLed?.("casino-entree", "#" + COULEURS_MEUBLE.rouge.toString(16).padStart(6, "0"));
    document.documentElement.classList.add("pcv-appli-plein");
    racine = document.createElement("div");
    racine.className = "pcvc" + (pilote ? " pilote" : "");
    racine.innerHTML = `<style>${CSS}${CSS_SOUS}</style><canvas></canvas><svg class="hud pieces"></svg><div class="essai" hidden>ESSAI</div><svg class="hud action cache"></svg><svg class="hud plaque cache"></svg><canvas class="hud boutonA cache" width="172" height="118"></canvas><div class="nav cache"><span class="g"></span><b></b><span class="d"></span></div>
      <div class="boite"><div class="cadre-or"><div class="tableau-serie"></div></div>
        <div class="pupitre-boite"><div class="fiche"><b></b><hr><span></span></div><div class="carrousel"></div>
          <div class="bas-boite"><span class="retour" data-acte="b"><span class="bt" data-touche="2"></span>${Tr("casino.retour")}</span><span class="poser"><span class="bt" data-touche="1"></span>${Tr("casino.poser_sur_accueil")}</span><span class="total"><span>${Tr("casino.serie_complete")} :</span><b></b></span></div></div></div>
      <div class="bulle"><div class="texte"></div><div class="choix"></div><span class="suite"></span></div>
      <div class="voile noir"><div class="chargement"><i>\u2605</i>${Tr("casino.chargement")}</div></div>`;
    conteneur.appendChild(racine);
    toileGL = racine.querySelector("canvas");
    masquerDessous(true);
    toileGL.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      console.warn("casino : contexte WebGL perdu");
      cancelAnimationFrame(boucle);
      boucle = 0;
    });
    toileGL.addEventListener("webglcontextrestored", () => {
      console.warn("casino : contexte WebGL rendu, r\xE9ouverture");
      if (ouvert) ouvrir(conteneur, o);
    });
    racine.querySelector(".retour").addEventListener("click", () => touche(2));
    hud = { pieces: racine.querySelector(".pieces"), action: racine.querySelector(".action"), plaque: racine.querySelector(".plaque"), boutonA: racine.querySelector(".boutonA"), nav: racine.querySelector(".nav") };
    hud.nav.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      const r = hud.nav.getBoundingClientRect(), x = (e.clientX - r.left) / r.width;
      if (x < 0.3) naviguer(-1);
      else if (x > 0.7) naviguer(1);
    });
    hud.boutonA.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      touche(1);
      if (mJeu?.jeu?.etat === "deplacement") {
        tenuHud = true;
        try {
          hud.boutonA.setPointerCapture(e.pointerId);
        } catch (x) {
        }
      }
    });
    boutonADessine = null;
    dessinerBoutonA();
    rendu = new T.WebGLRenderer({ canvas: toileGL, antialias: true, powerPreference: "high-performance", preserveDrawingBuffer: pilote });
    qualite = qualiteNeuve();
    rendu.setPixelRatio(qualite.r);
    rendu.setClearColor(0, 1);
    qualite.ext = rendu.getContext().getExtension?.("EXT_disjoint_timer_query_webgl2") || null;
    rendu.outputColorSpace = T.SRGBColorSpace;
    rendu.info.autoReset = false;
    rendu.shadowMap.enabled = true;
    rendu.shadowMap.type = T.PCFSoftShadowMap;
    post = preparerPost();
    scene = new T.Scene();
    camera = new T.PerspectiveCamera(46, 1.6, 0.3, 400);
    scene.matrixAutoUpdate = false;
    eclairer();
    try {
      const fontes = document.fonts?.load?.(`900 30px Nunito`).catch(() => {
      });
      await Promise.all([chargerIndex(), fontes]);
      await chargerVraies();
      chargerInterface();
      if (!ouvert) return false;
      const souffle2 = () => new Promise((ok) => requestAnimationFrame(() => setTimeout(ok, 0)));
      scene.environment = environnement();
      construireSalle();
      await souffle2();
      if (!ouvert) return false;
      preparerMachines();
      await souffle2();
      if (!ouvert) return false;
      bornes = machines.map((m, i) => fabriquerBorne(i));
      await souffle2();
      if (!ouvert) return false;
      for (const [i, bo] of bornes.entries()) {
        autocollantsDessus(bo, machines[i]);
        const c = monde(bo, 0, 0, 2);
        ombre(c.x, c.z, 24, 24);
      }
      sel = bornes.slice(1).reduce((k, bo, j) => placeLuigi(bo).distanceTo(LUIGI.pos) < placeLuigi(bornes[k]).distanceTo(LUIGI.pos) ? j + 1 : k, Math.min(1, bornes.length - 1));
      preparerBornes();
      construireMeuble();
      bornes.forEach((bo, i) => PLANS.rangee(i));
      elaguer();
      poserAmpoules();
      poserKits();
      if (o.fusion !== false) {
        fusionner(decor);
        for (const bo of bornes) {
          fusionner(bo.fronton.groupe);
          bo.meuble.compteur.userData.garder = bo.meuble.bouton.userData.garder = true;
          fusionner(bo.groupe.getObjectByName("meuble de la borne"));
        }
      }
      figer(decor);
      if (o.fusion !== false) fusionnerRangee();
      figerBornes();
    } catch (e) {
      console.warn("casino : d\xE9cor ou borne absents, la salle 2D prend le relais", e);
      fermer();
      if (window.__pcvArcade) window.__pcvArcade.ouvrir(conteneur);
      return false;
    }
    luigiPret = poserLuigi();
    chargerSons();
    window.__pcvListe?.("sons").then((l) => {
      if (!ouvert) return;
      const a = (n) => l?.includes(n + ".mp3");
      if (a(F.salleDeJeux)) musiqueSalle = F.salleDeJeux;
      else if (a(F.musique)) musiqueSalle = F.musique;
      if (a(F.musique)) musiqueCartes = F.musique;
      if (vue === "salle") {
        musiqueVoulue = void 0;
        musique("salle");
      }
    });
    vue = "salle";
    allerA("entree", 0);
    allerA("salle", 0, 2.8);
    musique("salle");
    observateur = new ResizeObserver(ajuster);
    observateur.observe(racine);
    ajuster();
    for (const t of ["pointerdown", "pointermove", "pointerup", "pointercancel"]) toileGL.addEventListener(t, surDoigt);
    addEventListener("vgp_onbuttonup", surRelache, true);
    addEventListener("keyup", surToucheLevee, true);
    addEventListener("pointerup", surLeveeHud, true);
    addEventListener("pointercancel", surLeveeHud, true);
    majHud();
    await luigiPret;
    if (!ouvert) return false;
    try {
      rendu.compile(scene, camera);
      image_(0);
    } catch (e) {
      console.warn("casino : pr\xE9compilation", e);
    }
    await new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok)));
    if (!ouvert) return false;
    racine.querySelector(".voile").classList.remove("noir");
    apres(0.5, accueillir);
    apres(VENUE_MII, venueDesMii);
    if (!pilote) boucle = requestAnimationFrame(tourner);
    else image_(0);
    return true;
  };
  const VENUE_MII = 3.2;
  const figer = (g) => {
    const u = g.userData, vivants = new Set([u.roue, u.lustre, ...Object.values(u.ancres || {})].filter(Boolean));
    const f = (o) => {
      if (vivants.has(o)) return;
      o.updateMatrix();
      o.matrixAutoUpdate = false;
      for (const c of o.children) f(c);
    };
    g.updateMatrixWorld(true);
    for (const c of g.children) f(c);
  };
  const fermer = () => {
    document.documentElement.classList.remove("pcv-appli-plein");
    masquerDessous(false);
    qualite = null;
    if (!racine && !ouvert) return;
    ouvert = false;
    window.__pcvLed?.("casino-sortie");
    cancelAnimationFrame(boucle);
    boucle = 0;
    dernier = 0;
    if (jeuOuvert) window.__pcvCasinoJeux?.fermer?.();
    parImage.clear();
    observateur?.disconnect();
    observateur = null;
    removeEventListener("vgp_onbuttonup", surRelache, true);
    removeEventListener("keyup", surToucheLevee, true);
    removeEventListener("pointerup", surLeveeHud, true);
    removeEventListener("pointercancel", surLeveeHud, true);
    tenuHud = false;
    bulle = null;
    guide = null;
    aurevoir = null;
    plusTard.length = 0;
    affiche = null;
    finSeance = null;
    texturesIU.clear();
    luigi?.liberer();
    luigi = null;
    luigiObj = null;
    for (const e of miiTable) e.m.liberer();
    miiTable = [];
    decorTable = null;
    Object.assign(JEUX[0], JEU_TABLE_SEUL);
    delete JEUX[0].ancre;
    ordreZones = null;
    miisSalle.clear();
    atlas = null;
    trajet = null;
    jeuOuvert = null;
    gain = null;
    tableau = null;
    boiteOuverte = null;
    coffre = null;
    meuble = null;
    retour = null;
    for (const m of machines) {
      m.monde = null;
      m.jeu = null;
      m.texFond = null;
    }
    mJeu = null;
    bornes = [];
    nuages.length = 0;
    geoBouffee = geoEtoile = null;
    for (const x of jetables.splice(0)) x.dispose?.();
    matsAuto.clear();
    texVraies.clear();
    post = null;
    masquables = null;
    rangeeFusion = [];
    rendu?.dispose();
    rendu?.forceContextLoss?.();
    rendu = null;
    scene = null;
    decor = null;
    plan = null;
    vue = "salle";
    racine?.remove();
    racine = null;
    hud = null;
    musiqueVoulue = void 0;
    window.__pcvMusique?.(null);
    if (lecteurCasino && !lecteurCasino.paused) finFonduCasino(0).then(() => lecteurCasino.pause());
  };
  fins.push(fermer);
  const nomPourAccueil = (id) => {
    if (!nomsSeuls && !vraies) {
      nomsSeuls = { b: {}, t: [] };
      Promise.all([chargerIndex(), octets(PRIVE_BA.bornes + "index.json", "application/json")]).then(([, b]) => {
        nomsSeuls = JSON.parse(new TextDecoder().decode(b))?.noms || nomsSeuls;
        window.__pcvConsoleMarquer?.();
      }).catch(() => {
      });
    }
    return nomComplet(id);
  };
  window.__pcvCasinoBadges = {
    ouvrir,
    fermer,
    touche,
    relacher,
    crediter,
    recouvert,
    nom: nomPourAccueil,
    // les passants à venir (personnages qui se promènent dans le casino) : leurs places (assis ou debout, où regarder,
    // gestes possibles) et des chemins en boucle dans la salle (points du sol, unités de la salle)
    get passants() {
      const u = decor?.userData;
      return u ? { places: u.places, chemins: u.chemins } : null;
    },
    etat: () => ({
      vue,
      sel,
      machines: machines.map((m) => ({ nom: m.nom, theme: m.theme, dedans: m.monde?.corps.length ?? null })),
      parties: totalParties(),
      jeu: mJeu?.jeu?.etat ?? null,
      gain: gain?.nom ?? null,
      bulle: bulle ? { bloque: bulle.bloque, lu: bulle.montre >= bulle.n, choix: !!bulle.lignes[bulle.i].choix, texte: bulle.lignes[bulle.i].texte } : null,
      guide: guide?.etape ?? null,
      luigi: luigiObj ? { x: +luigiObj.position.x.toFixed(2), z: +luigiObj.position.z.toFixed(2), marche: !!trajet } : null,
      boite: !!boiteOuverte
    }),
    banc: {
      // la grille des obstacles de Luigi, en image (rouge : meubles, rose : marge, sombre : libre), ses places et ses chemins
      grille: (chemins = []) => {
        if (!grille) construireGrille();
        const G2 = grille, k = 3, c = document.createElement("canvas");
        c.width = c.height = G2.n * k;
        const x = c.getContext("2d");
        for (let j = 0; j < G2.n * G2.n; j++) {
          x.fillStyle = G2.plein[j] ? "#d02020" : G2.libre[j] ? "#202630" : "#e7a0b0";
          x.fillRect(j % G2.n * k, Math.floor(j / G2.n) * k, k, k);
        }
        const px = (q) => [(q.x - G2.x0) / GRILLE.pas * k, (q.z - G2.z0) / GRILLE.pas * k];
        x.fillStyle = "#40e040";
        for (const bo of bornes) {
          const [a, b] = px(placeLuigi(bo));
          x.fillRect(a - 4, b - 4, 8, 8);
        }
        {
          const [a, b] = px(LUIGI.pos);
          x.fillRect(a - 4, b - 4, 8, 8);
        }
        x.strokeStyle = "#ffe040";
        x.lineWidth = 2;
        for (const [de, a] of chemins) {
          const ch = planifier(vec(...de), vec(...a));
          x.beginPath();
          x.moveTo(...px(vec(...de)));
          for (const q of ch) x.lineTo(...px(q));
          x.stroke();
        }
        return c.toDataURL("image/png");
      },
      places: () => ({ table: LUIGI.pos.toArray(), bornes: bornes.map((bo) => placeLuigi(bo).toArray()) }),
      eta: (de, a) => {
        const ch = planifier(vec(...de), vec(...a));
        return { eta: eta(vec(...de), ch), l: longueur(vec(...de), ch), points: ch.length };
      },
      avancer: (s, p = 1 / 30) => {
        for (let t = 0; t < s - 1e-6; t += p) image_(Math.min(p, s - t), t + p >= s - 1e-6);
      },
      accorderMii,
      // banc : un Mii posé dans la salle reçoit la lumière de la salle et son ombre
      tricher: (oui = true) => {
        tricher = oui;
      },
      stats: () => ({ ...stats }),
      monde: () => mJeu?.monde,
      jouee: () => mJeu,
      // (la machine jouée : sa file, ses badges à remettre)
      // banc : une partie complète (viser x, descendre, attendre la fin) ; rend les badges gagnés, dont poussés
      partie: (x) => {
        const m = mJeu;
        if (!m?.jeu) return null;
        const g0 = stats.gains, p0 = stats.pousses;
        m.jeu.viseBanc = clamp(x, xminDe(m), geoDe(m).x0);
        jouer();
        for (let k = 0; k < 2400 && m.jeu.etat !== "attente"; k++) image_(1 / 60, false);
        if (gain) finirGain();
        return { gains: stats.gains - g0, pousses: stats.pousses - p0, dedans: m.monde.corps.length };
      },
      // banc : la prochaine pince lancée (touche(1)) sera relâchée d'elle-même au-dessus de x (le robot « lâche » là)
      viser: (x) => {
        const j = mJeu?.jeu;
        if (j) j.viseBanc = clamp(x, xminDe(mJeu), geoDe(mJeu).x0);
      },
      // banc : tenir Ⓐ, puis relacher (même chemin que la manette)
      tenir: () => touche(1),
      relacher: () => relacher(1),
      // banc (8/10) : la pince ouverte descendue à vide en x (badges ignorés) : où s'arrête sa pointe, et le dessus du décor
      pinceBas: (x, replier = true) => {
        const m = mJeu;
        if (!m?.monde) return null;
        const G_ = geoDe(m);
        let L = G_.L0, oG = 1, oD = 1, cx = x;
        const f = (l) => forme(m, cx, PINCE.rail + 14 + l, 0, oG, oD);
        while (L < G_.Lmax) {
          const D = f(L + 1);
          if (replier && oG > OUVERTURE_MIN && dansDecor(m, D, [1, 2, 5]) > 0) {
            oG = Math.max(OUVERTURE_MIN, oG - 0.05);
            continue;
          }
          if (replier && oD > OUVERTURE_MIN && dansDecor(m, D, [3, 4, 6]) > 0) {
            oD = Math.max(OUVERTURE_MIN, oD - 0.05);
            continue;
          }
          if (replier) {
            const bg = oG <= OUVERTURE_MIN && dansDecor(m, D, [1, 2, 5]) > 0, bd = oD <= OUVERTURE_MIN && dansDecor(m, D, [3, 4, 6]) > 0;
            if (bg !== bd && dansDecor(m, D, [0]) <= 0 && PINCE.rail + 14 + L + G_.pointe < dessusEn(m, cx) - 30 && Math.abs(cx + (bg ? 1.5 : -1.5) - x) <= 40) {
              cx += bg ? 1.5 : -1.5;
              continue;
            }
          }
          if (dansDecor(m, D) > 0) break;
          L += 1;
        }
        return { x, cx: Math.round(cx), L: Math.round(L), pointe: Math.round(PINCE.rail + 14 + L + G_.pointe), sol: Math.round(dessusEn(m, cx)), Lmax: L >= G_.Lmax, oG: +oG.toFixed(2), oD: +oD.toFixed(2), H };
      },
      // banc (8/10) : la borne i reçoit le plateau « nom » (planche des plateaux)
      plateau: (i, nom) => {
        const m = machines[i], bo = bornes[i];
        if (!m || !bo || !PLATEAUX[nom]) return false;
        m.plateau = nom;
        m.monde = null;
        m.jeu = null;
        m.file = m.stock.slice();
        if (bo.interieur) {
          bo.interieur.removeFromParent();
          bo.interieur = null;
        }
        installer(m);
        garnir(bo, m);
        autocollantsDessus(bo, m);
        if (sel === i && vue === "machine") mJeu = m;
        return true;
      },
      dessus: (x) => mJeu?.monde ? Math.round(dessusEn(mJeu, x)) : null,
      // banc (8/10) : les formes de collision de la vraie physique (pince, badges, décor), en traits magenta par-dessus
      // la vitrine de la borne jouée, à l'instant de l'appel (formes(false) les retire)
      formes: (oui = true) => {
        const m = mJeu, bo = bornes[sel];
        bo?.formesBanc?.removeFromParent();
        if (!oui || !m?.monde?.phys || !bo?.interieur) return 0;
        const w = m.monde.phys, K2 = w.PPM, pts = [], seg = (a, b) => {
          const A = versLocal(...ecranVersMonde(a[0], a[1])), B = versLocal(...ecranVersMonde(b[0], b[1]));
          pts.push(A[0], A[1], Z.badges + 0.5, B[0], B[1], Z.badges + 0.5);
        };
        for (let c = w.monde.getBodyList(); c; c = c.getNext()) for (let f = c.getFixtureList(); f; f = f.getNext()) {
          const sh = f.getShape(), t = sh.getType();
          const P = t === "circle" ? Array.from({ length: 16 }, (_, k) => {
            const p = c.getWorldPoint(sh.getCenter());
            return [p.x * K2 + Math.cos(k / 8 * Math.PI) * sh.getRadius() * K2, p.y * K2 + Math.sin(k / 8 * Math.PI) * sh.getRadius() * K2];
          }) : (t === "edge" ? [sh.m_vertex1, sh.m_vertex2] : sh.m_vertices || []).map((v) => {
            const p = c.getWorldPoint(v);
            return [p.x * K2, p.y * K2];
          });
          if (t === "edge") seg(P[0], P[1]);
          else for (let k = 0; k < P.length; k++) seg(P[k], P[(k + 1) % P.length]);
        }
        const g = new T.BufferGeometry();
        g.setAttribute("position", new T.Float32BufferAttribute(pts, 3));
        const L = new T.LineSegments(g, new T.LineBasicMaterial({ color: 16711935, depthTest: false, transparent: true }));
        L.renderOrder = 999;
        bo.interieur.add(L);
        bo.formesBanc = L;
        return pts.length / 6;
      },
      // (8/10, vraies bornes) les séries qui ont une vraie machine, la machine de la borne i, la géométrie de la pince jouée
      machine: (i, sid, nom) => window.__pcvCasinoBadges.banc.serie(i, sid, nom),
      machinesVraies: (type) => vraies ? Object.entries(vraies.machines).filter(([, v]) => !type || v.type === type).map(([n, v]) => [n, v.serie]) : [],
      seriesVraies: () => vraies ? Object.keys(vraies.series).filter((sid) => seriesPar.get(sid)?.lots.length >= 12) : [],
      machineVraie: (i) => machines[i]?.vraie?.nom ?? null,
      geo: () => geoDe(mJeu),
      pince: () => mJeu?.jeu,
      // vise le badge seul le plus haut du tas (pour une capture de gain)
      cibleFacile: () => {
        const m = mJeu;
        if (!m?.monde) return null;
        const c = m.monde.corps.filter((k) => k.parts.length === 1 && k.parts[0].r < R_BADGE * 1.4).sort((a, b) => b.parts[0].x - a.parts[0].x)[0];
        if (c) m.jeu.viseBanc = clamp(c.parts[0].x, xminDe(m), geoDe(m).x0);
        return c?.parts[0].x ?? null;
      },
      // la borne i joue la série sid (captures d'un décor précis : piste MKTV…)
      serie: (i, sid, nom) => {
        const s = seriesPar.get(sid), bo = bornes[i];
        if (!s || !bo) return false;
        const d = machineDe(s, "pince", stockDe(s, "pince", modeGrands(), graine("banc " + sid), boite()));
        machines[i] = { ...d, theme: themeDe(d), file: d.stock.slice(), monde: null, jeu: null, forceVraie: nom };
        habillerVraie(machines[i]);
        if (bo.interieur) {
          bo.interieur.removeFromParent();
          bo.interieur = null;
        }
        installer(machines[i]);
        garnir(bo, machines[i]);
        autocollantsDessus(bo, machines[i]);
        if (sel === i) mJeu = vue === "machine" ? machines[i] : mJeu;
        return true;
      },
      // aller tout de suite à une vue (captures) : Luigi posé à sa place, la caméra arrivée
      aller: (nom, i = sel) => {
        sel = i;
        if (retour) remettre();
        camera.near = 0.3;
        camera.updateProjectionMatrix();
        vue = nom === "salle" || nom === "entree" ? "salle" : nom === "rangee" ? "rangee" : "machine";
        mJeu = vue === "machine" ? machines[sel] : null;
        if (vue === "machine") session = { parties: 0, gains: 0 };
        allerA(nom === "machine" ? "partie" : nom, sel, 0);
        plan.t = plan.d = 1;
        if (luigiObj) {
          const ici = vue === "salle" ? LUIGI.pos.clone() : placeLuigi(bornes[sel]);
          luigiObj.position.copy(ici);
          trajet = null;
          const cam = PLANS[nom === "partie" ? "machine" : nom](sel).pos;
          luigiObj.rotation.y = Math.atan2(cam.x - ici.x, cam.z - ici.z);
          luigi?.regarder(vue === "salle" ? PLANS.salle().pos.clone().setY(11) : cam);
          luigi?.appuyer(vue === "salle" ? (TABLE - LUIGI.pos.y) / LUIGI.taille : null);
          luigi?.regler(vue === "salle" ? LUIGI.taille : LUIGI.debout);
        }
        majHud();
      },
      premierEu: () => {
        const o = coffre?.ouverte;
        if (!o) return -1;
        const b = boite(), i = o.planche.ids.findIndex((id) => possede(b, id) && !morceauxDe.has(id));
        if (i >= 0) {
          coffre.badge = i;
          placerCurseurPlanche();
          majHud();
        }
        return i;
      },
      // near : pour la vue de dessus, un plan proche qui coupe le plafond (rien n'est retiré de la salle)
      libre: (pos, cible, fov = 40, near = 0.3) => {
        const q = { pos: vec(...pos), cible: vec(...cible), fov };
        plan = { de: q, a: q, t: 1, d: 1 };
        camera.near = near;
        camera.updateProjectionMatrix();
      },
      coffre: () => coffre && { phase: coffre.phase, k: coffre.k, badge: coffre.badge, variante: meuble?.variante },
      jeu: (i) => versJeu(i),
      guichet: () => versGuichet(),
      get miiTable() {
        return miiTable;
      },
      venueDesMii,
      zones: () => zones().map((z) => z.nom),
      // diagnostics (skill threejs-debug-profiler) : compteurs de la dernière image dessinée
      ST: (s_, t, y = 0) => ST(s_, t, y).toArray(),
      // profilage (skill threejs-debug-profiler : couper un poste à la fois) : rendu final, anticrénelage, ombre, lumières
      reglage: (o = {}) => {
        if ("post" in o) {
          post = o.post ? preparerPost() : null;
          taillePost();
        }
        if ("msaa" in o && post) {
          post.scene.dispose();
          post.scene = garder(new T.WebGLRenderTarget(4, 4, { type: T.HalfFloatType, samples: o.msaa }));
          taillePost();
        }
        if ("ombre" in o) {
          rendu.shadowMap.enabled = o.ombre;
          scene.traverse((x) => {
            if (x.material) for (const m of [x.material].flat()) m.needsUpdate = true;
          });
        }
        if ("lumieres" in o) scene.traverse((x) => {
          if (x.isLight && !x.isHemisphereLight) x.visible = o.lumieres;
        });
        return true;
      },
      perf: () => qualite && { ...qualite.bilan, echelleMax: qualite.plafond, minuterie: !!qualite.ext },
      info: () => {
        const i = rendu?.info;
        if (!i) return null;
        let maillages = 0, instances = 0;
        scene.traverse((o) => {
          if (o.isMesh || o.isPoints) {
            maillages++;
            if (o.isInstancedMesh) instances += o.count;
          }
        });
        return { elagage: decor?.userData.elagage, dessins: i.render.calls, triangles: i.render.triangles, points: i.render.points, geometries: i.memory.geometries, textures: i.memory.textures, programmes: i.programs?.length, maillages, instances, dpr: rendu.getPixelRatio(), taille: [rendu.domElement.width, rendu.domElement.height] };
      },
      // temps moyen d'une image (simulation + rendu, attendu jusqu'au bout par une lecture de pixel) : à comparer en relatif
      mesurer: (n = 10) => {
        const gl = rendu.getContext(), px = new Uint8Array(4);
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
        const t0 = performance.now();
        for (let k = 0; k < n; k++) {
          image_(1 / 60);
          gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
        }
        return +((performance.now() - t0) / n).toFixed(1);
      },
      geste,
      get luigi() {
        return luigi;
      },
      get camera() {
        return camera;
      },
      get bornes() {
        return bornes;
      },
      get scene() {
        return scene;
      },
      PLANS,
      RANGEE,
      image: image_
    },
    fin: () => {
      for (const f of fins.splice(0)) f();
    }
  };
  return "casino : pr\xEAt";
})();

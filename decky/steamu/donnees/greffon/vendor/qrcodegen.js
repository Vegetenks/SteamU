"use strict";
var qrcodegen = new function() {
  this.QrCode = function(initData, mask, version, errCorLvl) {
    if (mask < -1 || mask > 7)
      throw "Mask value out of range";
    if (initData instanceof Array) {
      if (version < 1 || version > 40)
        throw "Version value out of range";
    } else if (initData instanceof qrcodegen.QrCode) {
      if (version != void 0 || errCorLvl != void 0)
        throw "Values must be undefined";
      version = initData.version;
      errCorLvl = initData.errorCorrectionLevel;
    } else
      throw "Invalid initial data";
    var size = version * 4 + 17;
    var row = [];
    for (var i = 0; i < size; i++)
      row.push(false);
    var modules = [];
    var isFunction = [];
    for (var i = 0; i < size; i++) {
      modules.push(row.slice());
      isFunction.push(row.slice());
    }
    if (initData instanceof Array) {
      drawFunctionPatterns();
      var allCodewords = appendErrorCorrection(initData);
      drawCodewords(allCodewords);
    } else if (initData instanceof qrcodegen.QrCode) {
      for (var y = 0; y < size; y++) {
        for (var x = 0; x < size; x++) {
          modules[y][x] = initData.getModule(x, y) == 1;
          isFunction[y][x] = initData.isFunctionModule(x, y);
        }
      }
      applyMask(initData.mask);
    } else
      throw "Invalid initial data";
    if (mask == -1) {
      var minPenalty = Infinity;
      for (var i = 0; i < 8; i++) {
        drawFormatBits(i);
        applyMask(i);
        var penalty = getPenaltyScore();
        if (penalty < minPenalty) {
          mask = i;
          minPenalty = penalty;
        }
        applyMask(i);
      }
    }
    if (mask < 0 || mask > 7)
      throw "Assertion error";
    drawFormatBits(mask);
    applyMask(mask);
    Object.defineProperty(this, "version", { value: version });
    Object.defineProperty(this, "size", { value: size });
    Object.defineProperty(this, "errorCorrectionLevel", { value: errCorLvl });
    Object.defineProperty(this, "mask", { value: mask });
    this.getModule = function(x2, y2) {
      if (0 <= x2 && x2 < size && 0 <= y2 && y2 < size)
        return modules[y2][x2] ? 1 : 0;
      else
        return 0;
    };
    this.isFunctionModule = function(x2, y2) {
      if (0 <= x2 && x2 < size && 0 <= y2 && y2 < size)
        return isFunction[y2][x2];
      else
        return false;
    };
    this.drawCanvas = function(scale, border, canvas) {
      if (scale <= 0 || border < 0)
        throw "Value out of range";
      var width = (size + border * 2) * scale;
      canvas.width = width;
      canvas.height = width;
      var ctx = canvas.getContext("2d");
      for (var y2 = -border; y2 < size + border; y2++) {
        for (var x2 = -border; x2 < size + border; x2++) {
          ctx.fillStyle = this.getModule(x2, y2) == 1 ? "#000000" : "#FFFFFF";
          ctx.fillRect((x2 + border) * scale, (y2 + border) * scale, scale, scale);
        }
      }
    };
    this.toSvgString = function(border) {
      if (border < 0)
        throw "Border must be non-negative";
      var result = '<?xml version="1.0" encoding="UTF-8"?>\n';
      result += '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n';
      result += '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ' + (size + border * 2) + " " + (size + border * 2) + '">\n';
      result += '	<rect width="100%" height="100%" fill="#FFFFFF" stroke-width="0"/>\n';
      result += '	<path d="';
      var head = true;
      for (var y2 = -border; y2 < size + border; y2++) {
        for (var x2 = -border; x2 < size + border; x2++) {
          if (this.getModule(x2, y2) == 1) {
            if (head)
              head = false;
            else
              result += " ";
            result += "M" + (x2 + border) + "," + (y2 + border) + "h1v1h-1z";
          }
        }
      }
      result += '" fill="#000000" stroke-width="0"/>\n';
      result += "</svg>\n";
      return result;
    };
    function drawFunctionPatterns() {
      for (var i2 = 0; i2 < size; i2++) {
        setFunctionModule(6, i2, i2 % 2 == 0);
        setFunctionModule(i2, 6, i2 % 2 == 0);
      }
      drawFinderPattern(3, 3);
      drawFinderPattern(size - 4, 3);
      drawFinderPattern(3, size - 4);
      var alignPatPos = QrCode.getAlignmentPatternPositions(version);
      var numAlign = alignPatPos.length;
      for (var i2 = 0; i2 < numAlign; i2++) {
        for (var j = 0; j < numAlign; j++) {
          if (i2 == 0 && j == 0 || i2 == 0 && j == numAlign - 1 || i2 == numAlign - 1 && j == 0)
            continue;
          else
            drawAlignmentPattern(alignPatPos[i2], alignPatPos[j]);
        }
      }
      drawFormatBits(0);
      drawVersion();
    }
    function drawFormatBits(mask2) {
      var data = errCorLvl.formatBits << 3 | mask2;
      var rem = data;
      for (var i2 = 0; i2 < 10; i2++)
        rem = rem << 1 ^ (rem >>> 9) * 1335;
      data = data << 10 | rem;
      data ^= 21522;
      if (data >>> 15 != 0)
        throw "Assertion error";
      for (var i2 = 0; i2 <= 5; i2++)
        setFunctionModule(8, i2, (data >>> i2 & 1) != 0);
      setFunctionModule(8, 7, (data >>> 6 & 1) != 0);
      setFunctionModule(8, 8, (data >>> 7 & 1) != 0);
      setFunctionModule(7, 8, (data >>> 8 & 1) != 0);
      for (var i2 = 9; i2 < 15; i2++)
        setFunctionModule(14 - i2, 8, (data >>> i2 & 1) != 0);
      for (var i2 = 0; i2 <= 7; i2++)
        setFunctionModule(size - 1 - i2, 8, (data >>> i2 & 1) != 0);
      for (var i2 = 8; i2 < 15; i2++)
        setFunctionModule(8, size - 15 + i2, (data >>> i2 & 1) != 0);
      setFunctionModule(8, size - 8, true);
    }
    function drawVersion() {
      if (version < 7)
        return;
      var rem = version;
      for (var i2 = 0; i2 < 12; i2++)
        rem = rem << 1 ^ (rem >>> 11) * 7973;
      var data = version << 12 | rem;
      if (data >>> 18 != 0)
        throw "Assertion error";
      for (var i2 = 0; i2 < 18; i2++) {
        var bit = (data >>> i2 & 1) != 0;
        var a = size - 11 + i2 % 3, b = Math.floor(i2 / 3);
        setFunctionModule(a, b, bit);
        setFunctionModule(b, a, bit);
      }
    }
    function drawFinderPattern(x2, y2) {
      for (var i2 = -4; i2 <= 4; i2++) {
        for (var j = -4; j <= 4; j++) {
          var dist = Math.max(Math.abs(i2), Math.abs(j));
          var xx = x2 + j, yy = y2 + i2;
          if (0 <= xx && xx < size && 0 <= yy && yy < size)
            setFunctionModule(xx, yy, dist != 2 && dist != 4);
        }
      }
    }
    function drawAlignmentPattern(x2, y2) {
      for (var i2 = -2; i2 <= 2; i2++) {
        for (var j = -2; j <= 2; j++)
          setFunctionModule(x2 + j, y2 + i2, Math.max(Math.abs(i2), Math.abs(j)) != 1);
      }
    }
    function setFunctionModule(x2, y2, isBlack) {
      modules[y2][x2] = isBlack;
      isFunction[y2][x2] = true;
    }
    function appendErrorCorrection(data) {
      if (data.length != QrCode.getNumDataCodewords(version, errCorLvl))
        throw "Invalid argument";
      var numBlocks = QrCode.NUM_ERROR_CORRECTION_BLOCKS[errCorLvl.ordinal][version];
      var totalEcc = QrCode.NUM_ERROR_CORRECTION_CODEWORDS[errCorLvl.ordinal][version];
      if (totalEcc % numBlocks != 0)
        throw "Assertion error";
      var blockEccLen = Math.floor(totalEcc / numBlocks);
      var numShortBlocks = numBlocks - Math.floor(QrCode.getNumRawDataModules(version) / 8) % numBlocks;
      var shortBlockLen = Math.floor(QrCode.getNumRawDataModules(version) / (numBlocks * 8));
      var blocks = [];
      var rs = new ReedSolomonGenerator(blockEccLen);
      for (var i2 = 0, k = 0; i2 < numBlocks; i2++) {
        var dat = data.slice(k, k + shortBlockLen - blockEccLen + (i2 < numShortBlocks ? 0 : 1));
        k += dat.length;
        var ecc = rs.getRemainder(dat);
        if (i2 < numShortBlocks)
          dat.push(0);
        ecc.forEach(function(b) {
          dat.push(b);
        });
        blocks.push(dat);
      }
      var result = [];
      for (var i2 = 0; i2 < blocks[0].length; i2++) {
        for (var j = 0; j < blocks.length; j++) {
          if (i2 != shortBlockLen - blockEccLen || j >= numShortBlocks)
            result.push(blocks[j][i2]);
        }
      }
      if (result.length != Math.floor(QrCode.getNumRawDataModules(version) / 8))
        throw "Assertion error";
      return result;
    }
    function drawCodewords(data) {
      if (data.length != Math.floor(QrCode.getNumRawDataModules(version) / 8))
        throw "Invalid argument";
      var i2 = 0;
      for (var right = size - 1; right >= 1; right -= 2) {
        if (right == 6)
          right = 5;
        for (var vert = 0; vert < size; vert++) {
          for (var j = 0; j < 2; j++) {
            var x2 = right - j;
            var upwards = (right & 2) == 0 ^ x2 < 6;
            var y2 = upwards ? size - 1 - vert : vert;
            if (!isFunction[y2][x2] && i2 < data.length * 8) {
              modules[y2][x2] = (data[i2 >>> 3] >>> 7 - (i2 & 7) & 1) != 0;
              i2++;
            }
          }
        }
      }
      if (i2 != data.length * 8)
        throw "Assertion error";
    }
    function applyMask(mask2) {
      if (mask2 < 0 || mask2 > 7)
        throw "Mask value out of range";
      for (var y2 = 0; y2 < size; y2++) {
        for (var x2 = 0; x2 < size; x2++) {
          var invert;
          switch (mask2) {
            case 0:
              invert = (x2 + y2) % 2 == 0;
              break;
            case 1:
              invert = y2 % 2 == 0;
              break;
            case 2:
              invert = x2 % 3 == 0;
              break;
            case 3:
              invert = (x2 + y2) % 3 == 0;
              break;
            case 4:
              invert = (Math.floor(x2 / 3) + Math.floor(y2 / 2)) % 2 == 0;
              break;
            case 5:
              invert = x2 * y2 % 2 + x2 * y2 % 3 == 0;
              break;
            case 6:
              invert = (x2 * y2 % 2 + x2 * y2 % 3) % 2 == 0;
              break;
            case 7:
              invert = ((x2 + y2) % 2 + x2 * y2 % 3) % 2 == 0;
              break;
            default:
              throw "Assertion error";
          }
          modules[y2][x2] ^= invert & !isFunction[y2][x2];
        }
      }
    }
    function getPenaltyScore() {
      var result = 0;
      for (var y2 = 0; y2 < size; y2++) {
        var colorX = modules[y2][0];
        for (var x2 = 1, runX = 1; x2 < size; x2++) {
          if (modules[y2][x2] != colorX) {
            colorX = modules[y2][x2];
            runX = 1;
          } else {
            runX++;
            if (runX == 5)
              result += QrCode.PENALTY_N1;
            else if (runX > 5)
              result++;
          }
        }
      }
      for (var x2 = 0; x2 < size; x2++) {
        var colorY = modules[0][x2];
        for (var y2 = 1, runY = 1; y2 < size; y2++) {
          if (modules[y2][x2] != colorY) {
            colorY = modules[y2][x2];
            runY = 1;
          } else {
            runY++;
            if (runY == 5)
              result += QrCode.PENALTY_N1;
            else if (runY > 5)
              result++;
          }
        }
      }
      for (var y2 = 0; y2 < size - 1; y2++) {
        for (var x2 = 0; x2 < size - 1; x2++) {
          var color = modules[y2][x2];
          if (color == modules[y2][x2 + 1] && color == modules[y2 + 1][x2] && color == modules[y2 + 1][x2 + 1])
            result += QrCode.PENALTY_N2;
        }
      }
      for (var y2 = 0; y2 < size; y2++) {
        for (var x2 = 0, bits = 0; x2 < size; x2++) {
          bits = bits << 1 & 2047 | (modules[y2][x2] ? 1 : 0);
          if (x2 >= 10 && (bits == 93 || bits == 1488))
            result += QrCode.PENALTY_N3;
        }
      }
      for (var x2 = 0; x2 < size; x2++) {
        for (var y2 = 0, bits = 0; y2 < size; y2++) {
          bits = bits << 1 & 2047 | (modules[y2][x2] ? 1 : 0);
          if (y2 >= 10 && (bits == 93 || bits == 1488))
            result += QrCode.PENALTY_N3;
        }
      }
      var black = 0;
      modules.forEach(function(row2) {
        row2.forEach(function(color2) {
          if (color2)
            black++;
        });
      });
      var total = size * size;
      for (var k = 0; black * 20 < (9 - k) * total || black * 20 > (11 + k) * total; k++)
        result += QrCode.PENALTY_N4;
      return result;
    }
  };
  this.QrCode.encodeText = function(text, ecl) {
    var segs = qrcodegen.QrSegment.makeSegments(text);
    return this.encodeSegments(segs, ecl);
  };
  this.QrCode.encodeBinary = function(data, ecl) {
    var seg = qrcodegen.QrSegment.makeBytes(data);
    return this.encodeSegments([seg], ecl);
  };
  this.QrCode.encodeSegments = function(segs, ecl, minVersion, maxVersion, mask, boostEcl) {
    if (minVersion == void 0) minVersion = 1;
    if (maxVersion == void 0) maxVersion = 40;
    if (mask == void 0) mask = -1;
    if (boostEcl == void 0) boostEcl = true;
    if (!(1 <= minVersion && minVersion <= maxVersion && maxVersion <= 40) || mask < -1 || mask > 7)
      throw "Invalid value";
    var version, dataUsedBits;
    for (version = minVersion; ; version++) {
      var dataCapacityBits = QrCode.getNumDataCodewords(version, ecl) * 8;
      dataUsedBits = qrcodegen.QrSegment.getTotalBits(segs, version);
      if (dataUsedBits != null && dataUsedBits <= dataCapacityBits)
        break;
      if (version >= maxVersion)
        throw "Data too long";
    }
    [this.Ecc.MEDIUM, this.Ecc.QUARTILE, this.Ecc.HIGH].forEach(function(newEcl) {
      if (boostEcl && dataUsedBits <= QrCode.getNumDataCodewords(version, newEcl) * 8)
        ecl = newEcl;
    });
    var dataCapacityBits = QrCode.getNumDataCodewords(version, ecl) * 8;
    var bb = new BitBuffer();
    segs.forEach(function(seg) {
      bb.appendBits(seg.mode.modeBits, 4);
      bb.appendBits(seg.numChars, seg.mode.numCharCountBits(version));
      bb.appendData(seg);
    });
    bb.appendBits(0, Math.min(4, dataCapacityBits - bb.bitLength()));
    bb.appendBits(0, (8 - bb.bitLength() % 8) % 8);
    for (var padByte = 236; bb.bitLength() < dataCapacityBits; padByte ^= 236 ^ 17)
      bb.appendBits(padByte, 8);
    if (bb.bitLength() % 8 != 0)
      throw "Assertion error";
    return new this(bb.getBytes(), mask, version, ecl);
  };
  var QrCode = {};
  QrCode.getAlignmentPatternPositions = function(ver) {
    if (ver < 1 || ver > 40)
      throw "Version number out of range";
    else if (ver == 1)
      return [];
    else {
      var size = ver * 4 + 17;
      var numAlign = Math.floor(ver / 7) + 2;
      var step;
      if (ver != 32)
        step = Math.ceil((size - 13) / (2 * numAlign - 2)) * 2;
      else
        step = 26;
      var result = [];
      for (var i = numAlign - 1, pos = size - 7; i >= 1; i--, pos -= step)
        result.push(pos);
      result.push(6);
      result.reverse();
      return result;
    }
  };
  QrCode.getNumRawDataModules = function(ver) {
    if (ver < 1 || ver > 40)
      throw "Version number out of range";
    var result = (16 * ver + 128) * ver + 64;
    if (ver >= 2) {
      var numAlign = Math.floor(ver / 7) + 2;
      result -= (25 * numAlign - 10) * numAlign - 55;
      if (ver >= 7)
        result -= 18 * 2;
    }
    return result;
  };
  QrCode.getNumDataCodewords = function(ver, ecl) {
    if (ver < 1 || ver > 40)
      throw "Version number out of range";
    return Math.floor(QrCode.getNumRawDataModules(ver) / 8) - QrCode.NUM_ERROR_CORRECTION_CODEWORDS[ecl.ordinal][ver];
  };
  QrCode.PENALTY_N1 = 3;
  QrCode.PENALTY_N2 = 3;
  QrCode.PENALTY_N3 = 40;
  QrCode.PENALTY_N4 = 10;
  QrCode.NUM_ERROR_CORRECTION_CODEWORDS = [
    // Version: (note that index 0 is for padding, and is set to an illegal value)
    //  0,  1,  2,  3,  4,  5,   6,   7,   8,   9,  10,  11,  12,  13,  14,  15,  16,  17,  18,  19,  20,  21,  22,  23,  24,   25,   26,   27,   28,   29,   30,   31,   32,   33,   34,   35,   36,   37,   38,   39,   40    Error correction level
    [null, 7, 10, 15, 20, 26, 36, 40, 48, 60, 72, 80, 96, 104, 120, 132, 144, 168, 180, 196, 224, 224, 252, 270, 300, 312, 336, 360, 390, 420, 450, 480, 510, 540, 570, 570, 600, 630, 660, 720, 750],
    // Low
    [null, 10, 16, 26, 36, 48, 64, 72, 88, 110, 130, 150, 176, 198, 216, 240, 280, 308, 338, 364, 416, 442, 476, 504, 560, 588, 644, 700, 728, 784, 812, 868, 924, 980, 1036, 1064, 1120, 1204, 1260, 1316, 1372],
    // Medium
    [null, 13, 22, 36, 52, 72, 96, 108, 132, 160, 192, 224, 260, 288, 320, 360, 408, 448, 504, 546, 600, 644, 690, 750, 810, 870, 952, 1020, 1050, 1140, 1200, 1290, 1350, 1440, 1530, 1590, 1680, 1770, 1860, 1950, 2040],
    // Quartile
    [null, 17, 28, 44, 64, 88, 112, 130, 156, 192, 224, 264, 308, 352, 384, 432, 480, 532, 588, 650, 700, 750, 816, 900, 960, 1050, 1110, 1200, 1260, 1350, 1440, 1530, 1620, 1710, 1800, 1890, 1980, 2100, 2220, 2310, 2430]
    // High
  ];
  QrCode.NUM_ERROR_CORRECTION_BLOCKS = [
    // Version: (note that index 0 is for padding, and is set to an illegal value)
    //  0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40    Error correction level
    [null, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
    // Low
    [null, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
    // Medium
    [null, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
    // Quartile
    [null, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81]
    // High
  ];
  this.QrCode.Ecc = {
    // Constants declared in ascending order of error protection
    LOW: new Ecc(0, 1),
    MEDIUM: new Ecc(1, 0),
    QUARTILE: new Ecc(2, 3),
    HIGH: new Ecc(3, 2)
  };
  function Ecc(ord, fb) {
    Object.defineProperty(this, "ordinal", { value: ord });
    Object.defineProperty(this, "formatBits", { value: fb });
  }
  this.QrSegment = function(mode, numChars, bitData) {
    if (numChars < 0 || !(mode instanceof Mode))
      throw "Invalid argument";
    Object.defineProperty(this, "mode", { value: mode });
    Object.defineProperty(this, "numChars", { value: numChars });
    this.getBits = function() {
      return bitData.slice();
    };
  };
  this.QrSegment.makeBytes = function(data) {
    var bb = new BitBuffer();
    data.forEach(function(b) {
      bb.appendBits(b, 8);
    });
    return new this(this.Mode.BYTE, data.length, bb.getBits());
  };
  this.QrSegment.makeNumeric = function(digits) {
    if (!this.NUMERIC_REGEX.test(digits))
      throw "String contains non-numeric characters";
    var bb = new BitBuffer();
    var i;
    for (i = 0; i + 3 <= digits.length; i += 3)
      bb.appendBits(parseInt(digits.substr(i, 3), 10), 10);
    var rem = digits.length - i;
    if (rem > 0)
      bb.appendBits(parseInt(digits.substring(i), 10), rem * 3 + 1);
    return new this(this.Mode.NUMERIC, digits.length, bb.getBits());
  };
  this.QrSegment.makeAlphanumeric = function(text) {
    if (!this.ALPHANUMERIC_REGEX.test(text))
      throw "String contains unencodable characters in alphanumeric mode";
    var bb = new BitBuffer();
    var i;
    for (i = 0; i + 2 <= text.length; i += 2) {
      var temp = QrSegment.ALPHANUMERIC_ENCODING_TABLE[text.charCodeAt(i) - 32] * 45;
      temp += QrSegment.ALPHANUMERIC_ENCODING_TABLE[text.charCodeAt(i + 1) - 32];
      bb.appendBits(temp, 11);
    }
    if (i < text.length)
      bb.appendBits(QrSegment.ALPHANUMERIC_ENCODING_TABLE[text.charCodeAt(i) - 32], 6);
    return new this(this.Mode.ALPHANUMERIC, text.length, bb.getBits());
  };
  this.QrSegment.makeSegments = function(text) {
    if (text == "")
      return [];
    else if (this.NUMERIC_REGEX.test(text))
      return [this.makeNumeric(text)];
    else if (this.ALPHANUMERIC_REGEX.test(text))
      return [this.makeAlphanumeric(text)];
    else
      return [this.makeBytes(toUtf8ByteArray(text))];
  };
  this.QrSegment.getTotalBits = function(segs, version) {
    if (version < 1 || version > 40)
      throw "Version number out of range";
    var result = 0;
    for (var i = 0; i < segs.length; i++) {
      var seg = segs[i];
      var ccbits = seg.mode.numCharCountBits(version);
      if (seg.numChars >= 1 << ccbits)
        return null;
      result += 4 + ccbits + seg.getBits().length;
    }
    return result;
  };
  var QrSegment = {};
  this.QrSegment.NUMERIC_REGEX = /^[0-9]*$/;
  this.QrSegment.ALPHANUMERIC_REGEX = /^[A-Z0-9 $%*+.\/:-]*$/;
  QrSegment.ALPHANUMERIC_ENCODING_TABLE = [
    // SP,  !,  ",  #,  $,  %,  &,  ',  (,  ),  *,  +,  ,,  -,  .,  /,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9,  :,  ;,  <,  =,  >,  ?,  @,  // ASCII codes 32 to 64
    36,
    -1,
    -1,
    -1,
    37,
    38,
    -1,
    -1,
    -1,
    -1,
    39,
    40,
    -1,
    41,
    42,
    43,
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    44,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    // Array indices 0 to 32
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    29,
    30,
    31,
    32,
    33,
    34,
    35
    // Array indices 33 to 58
    //  A,  B,  C,  D,  E,  F,  G,  H,  I,  J,  K,  L,  M,  N,  O,  P,  Q,  R,  S,  T,  U,  V,  W,  X,  Y,  Z,  // ASCII codes 65 to 90
  ];
  this.QrSegment.Mode = {
    // Constants
    NUMERIC: new Mode(1, [10, 12, 14]),
    ALPHANUMERIC: new Mode(2, [9, 11, 13]),
    BYTE: new Mode(4, [8, 16, 16]),
    KANJI: new Mode(8, [8, 10, 12])
  };
  function Mode(mode, ccbits) {
    Object.defineProperty(this, "modeBits", { value: mode });
    this.numCharCountBits = function(ver) {
      if (1 <= ver && ver <= 9) return ccbits[0];
      else if (10 <= ver && ver <= 26) return ccbits[1];
      else if (27 <= ver && ver <= 40) return ccbits[2];
      else throw "Version number out of range";
    };
  }
  function toUtf8ByteArray(str) {
    str = encodeURI(str);
    var result = [];
    for (var i = 0; i < str.length; i++) {
      if (str.charAt(i) != "%")
        result.push(str.charCodeAt(i));
      else {
        result.push(parseInt(str.substr(i + 1, 2), 16));
        i += 2;
      }
    }
    return result;
  }
  function ReedSolomonGenerator(degree) {
    if (degree < 1 || degree > 255)
      throw "Degree out of range";
    var coefficients = [];
    for (var i = 0; i < degree - 1; i++)
      coefficients.push(0);
    coefficients.push(1);
    var root = 1;
    for (var i = 0; i < degree; i++) {
      for (var j = 0; j < coefficients.length; j++) {
        coefficients[j] = ReedSolomonGenerator.multiply(coefficients[j], root);
        if (j + 1 < coefficients.length)
          coefficients[j] ^= coefficients[j + 1];
      }
      root = root << 1 ^ (root >>> 7) * 285;
    }
    this.getRemainder = function(data) {
      var result = coefficients.map(function() {
        return 0;
      });
      data.forEach(function(b) {
        var factor = b ^ result[0];
        result.shift();
        result.push(0);
        for (var j2 = 0; j2 < result.length; j2++)
          result[j2] ^= ReedSolomonGenerator.multiply(coefficients[j2], factor);
      });
      return result;
    };
  }
  ReedSolomonGenerator.multiply = function(x, y) {
    if (x >>> 8 != 0 || y >>> 8 != 0)
      throw "Byte out of range";
    var z = 0;
    for (var i = 7; i >= 0; i--) {
      z = z << 1 ^ (z >>> 7) * 285;
      z ^= (y >>> i & 1) * x;
    }
    if (z >>> 8 != 0)
      throw "Assertion error";
    return z;
  };
  function BitBuffer() {
    var bitData = [];
    this.bitLength = function() {
      return bitData.length;
    };
    this.getBits = function() {
      return bitData.slice();
    };
    this.getBytes = function() {
      var result = [];
      var numBytes = Math.ceil(bitData.length / 8);
      for (var i = 0; i < numBytes; i++)
        result.push(0);
      bitData.forEach(function(bit, i2) {
        result[i2 >>> 3] |= bit << 7 - (i2 & 7);
      });
      return result;
    };
    this.appendBits = function(val, len) {
      if (len < 0 || len > 32 || len < 32 && val >>> len != 0)
        throw "Value out of range";
      for (var i = len - 1; i >= 0; i--)
        bitData.push(val >>> i & 1);
    };
    this.appendData = function(seg) {
      seg.getBits().forEach(function(b) {
        bitData.push(b);
      });
    };
  }
}();

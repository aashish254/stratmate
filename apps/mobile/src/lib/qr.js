// Minimal QR code encoder, byte mode only, ECC level L.
// Returns a 2D boolean matrix (true = dark module).
// Supports versions 1-10 (up to ~174 bytes in byte mode with EC level L).
// Adapted from public-domain QR encoding references. Self-contained, no deps.

const GF_EXP = new Array(512);
const GF_LOG = new Array(256);
(function initGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
})();

const gfMul = (a, b) => {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
};

const rsGeneratorPoly = (degree) => {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    poly = polyMul(poly, [1, GF_EXP[i]]);
  }
  return poly;
};

const polyMul = (a, b) => {
  const out = new Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      out[i + j] ^= gfMul(a[i], b[j]);
    }
  }
  return out;
};

const rsEncode = (data, ecLen) => {
  const gen = rsGeneratorPoly(ecLen);
  const buf = data.concat(new Array(ecLen).fill(0));
  for (let i = 0; i < data.length; i++) {
    const coef = buf[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        buf[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  return buf.slice(data.length);
};

// Capacities for byte mode, EC level L, versions 1-10
// Source: ISO/IEC 18004 capacity table
const CAP_BYTE_L = [17, 32, 53, 78, 106, 134, 154, 192, 230, 271];

// Total codewords and EC codewords for versions 1-10, level L
const TOTAL_CW = [26, 44, 70, 100, 134, 172, 196, 242, 292, 346];
const EC_CW = [7, 10, 15, 20, 26, 18, 20, 24, 30, 18];
// Block layout: [num blocks group1, data cw per block group1, num blocks group2, data cw per block group2]
// For level L, versions 1-10 (simplified — most are 1 group)
const BLOCKS_L = [
  [1, 19, 0, 0],
  [1, 34, 0, 0],
  [1, 55, 0, 0],
  [1, 80, 0, 0],
  [1, 108, 0, 0],
  [2, 68, 0, 0],
  [2, 78, 0, 0],
  [2, 97, 0, 0],
  [2, 116, 0, 0],
  [2, 68, 2, 69],
];

// Format info bits (level L, mask 0-7), precomputed BCH-encoded with mask XOR
const FORMAT_BITS_L = [
  0x77c4, 0x72f3, 0x7daa, 0x789d, 0x662f, 0x6318, 0x6c41, 0x6976,
];

// Alignment pattern positions per version (versions 2+)
const ALIGN_POS = [
  null,
  null,
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
];

const pickVersion = (byteLen) => {
  for (let v = 1; v <= 10; v++) {
    if (byteLen <= CAP_BYTE_L[v - 1]) return v;
  }
  return -1;
};

const bitsToBytes = (bits) => {
  const out = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) {
      b = (b << 1) | (bits[i + j] || 0);
    }
    out.push(b);
  }
  return out;
};

const encodeByteMode = (text, version) => {
  // Mode indicator: 0100 (4 bits)
  // Char count: 8 bits for v1-9, 16 bits for v10+
  const ccLen = version < 10 ? 8 : 16;
  const bytes = [];
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (c < 128) {
      bytes.push(c);
    } else {
      // UTF-8 encode
      const ch = encodeURIComponent(text[i]);
      for (let k = 0; k < ch.length; k++) {
        if (ch[k] === "%") {
          bytes.push(parseInt(ch.slice(k + 1, k + 3), 16));
          k += 2;
        } else {
          bytes.push(ch.charCodeAt(k));
        }
      }
    }
  }
  const bits = [];
  const pushBits = (val, n) => {
    for (let k = n - 1; k >= 0; k--) bits.push((val >> k) & 1);
  };
  pushBits(0b0100, 4);
  pushBits(bytes.length, ccLen);
  for (const b of bytes) pushBits(b, 8);

  // Terminator (up to 4 zero bits)
  const totalDataCw = (() => {
    const [g1n, g1d, g2n, g2d] = BLOCKS_L[version - 1];
    return g1n * g1d + g2n * g2d;
  })();
  const capacityBits = totalDataCw * 8;
  for (let i = 0; i < 4 && bits.length < capacityBits; i++) bits.push(0);
  // Pad to byte boundary
  while (bits.length % 8 !== 0) bits.push(0);
  // Pad bytes alternating 0xEC 0x11
  const dataBytes = bitsToBytes(bits);
  let pad = 0;
  while (dataBytes.length < totalDataCw) {
    dataBytes.push(pad === 0 ? 0xec : 0x11);
    pad = 1 - pad;
  }
  return dataBytes;
};

const interleaveBlocks = (dataBytes, version) => {
  const [g1n, g1d, g2n, g2d] = BLOCKS_L[version - 1];
  const ecLen = EC_CW[version - 1];
  const blocks = [];
  let off = 0;
  for (let i = 0; i < g1n; i++) {
    const data = dataBytes.slice(off, off + g1d);
    off += g1d;
    blocks.push({ data, ec: rsEncode(data, ecLen) });
  }
  for (let i = 0; i < g2n; i++) {
    const data = dataBytes.slice(off, off + g2d);
    off += g2d;
    blocks.push({ data, ec: rsEncode(data, ecLen) });
  }
  // Interleave
  const result = [];
  const maxData = Math.max(g1d, g2d);
  for (let i = 0; i < maxData; i++) {
    for (const blk of blocks) {
      if (i < blk.data.length) result.push(blk.data[i]);
    }
  }
  for (let i = 0; i < ecLen; i++) {
    for (const blk of blocks) result.push(blk.ec[i]);
  }
  return result;
};

const makeMatrix = (version) => {
  const size = 17 + version * 4;
  const m = [];
  const r = [];
  for (let i = 0; i < size; i++) {
    m.push(new Array(size).fill(false));
    r.push(new Array(size).fill(false)); // reserved
  }

  const placeFinder = (rr, cc) => {
    for (let i = -1; i <= 7; i++) {
      for (let j = -1; j <= 7; j++) {
        const y = rr + i;
        const x = cc + j;
        if (y < 0 || y >= size || x < 0 || x >= size) continue;
        r[y][x] = true;
        const isOuter = (i === 0 || i === 6) && j >= 0 && j <= 6;
        const isSide = (j === 0 || j === 6) && i >= 0 && i <= 6;
        const isInner = i >= 2 && i <= 4 && j >= 2 && j <= 4;
        m[y][x] = isOuter || isSide || isInner;
      }
    }
  };
  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (!r[6][i]) {
      m[6][i] = i % 2 === 0;
      r[6][i] = true;
    }
    if (!r[i][6]) {
      m[i][6] = i % 2 === 0;
      r[i][6] = true;
    }
  }

  // Alignment patterns (v2+)
  if (version >= 2) {
    const pos = ALIGN_POS[version];
    if (pos) {
      for (const cy of pos) {
        for (const cx of pos) {
          // Skip if overlapping finder
          if (
            (cy === 6 && cx === 6) ||
            (cy === 6 && cx === size - 7) ||
            (cy === size - 7 && cx === 6)
          )
            continue;
          for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              const y = cy + dy;
              const x = cx + dx;
              r[y][x] = true;
              const isEdge = Math.abs(dy) === 2 || Math.abs(dx) === 2;
              const isCenter = dy === 0 && dx === 0;
              m[y][x] = isEdge || isCenter;
            }
          }
        }
      }
    }
  }

  // Format info reservation
  for (let i = 0; i <= 8; i++) {
    r[8][i] = true;
    r[i][8] = true;
    r[8][size - 1 - i] = true;
    r[size - 1 - i][8] = true;
  }
  // Dark module
  m[size - 8][8] = true;
  r[size - 8][8] = true;

  return { m, r, size };
};

const placeData = (m, r, size, codewords) => {
  // ZigZag from bottom-right
  const bits = [];
  for (const cw of codewords) {
    for (let i = 7; i >= 0; i--) bits.push((cw >> i) & 1);
  }
  let bitIdx = 0;
  let upward = true;
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--; // skip timing column
    for (let i = 0; i < size; i++) {
      const y = upward ? size - 1 - i : i;
      for (let dx = 0; dx < 2; dx++) {
        const x = col - dx;
        if (!r[y][x]) {
          m[y][x] = bitIdx < bits.length && bits[bitIdx] === 1;
          bitIdx++;
        }
      }
    }
    upward = !upward;
  }
};

const applyMask = (m, r, size, mask) => {
  const cloned = m.map((row) => row.slice());
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (r[y][x]) continue;
      let invert = false;
      switch (mask) {
        case 0:
          invert = (y + x) % 2 === 0;
          break;
        case 1:
          invert = y % 2 === 0;
          break;
        case 2:
          invert = x % 3 === 0;
          break;
        case 3:
          invert = (y + x) % 3 === 0;
          break;
        case 4:
          invert = (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0;
          break;
        case 5:
          invert = ((y * x) % 2) + ((y * x) % 3) === 0;
          break;
        case 6:
          invert = (((y * x) % 2) + ((y * x) % 3)) % 2 === 0;
          break;
        case 7:
          invert = (((y + x) % 2) + ((y * x) % 3)) % 2 === 0;
          break;
      }
      if (invert) cloned[y][x] = !cloned[y][x];
    }
  }
  return cloned;
};

const placeFormat = (m, size, mask) => {
  const bits = FORMAT_BITS_L[mask];
  // Top-left
  for (let i = 0; i < 15; i++) {
    const v = ((bits >> i) & 1) === 1;
    if (i < 6) m[i][8] = v;
    else if (i === 6) m[7][8] = v;
    else if (i === 7) m[8][8] = v;
    else if (i === 8) m[8][7] = v;
    else m[8][14 - i] = v;
  }
  // Top-right + bottom-left
  for (let i = 0; i < 15; i++) {
    const v = ((bits >> i) & 1) === 1;
    if (i < 8) m[8][size - 1 - i] = v;
    else m[size - 15 + i][8] = v;
  }
};

const evaluateMask = (m, size) => {
  // Simple penalty: count adjacent same-color in rows and cols
  let penalty = 0;
  for (let y = 0; y < size; y++) {
    let runColor = m[y][0];
    let runLen = 1;
    for (let x = 1; x < size; x++) {
      if (m[y][x] === runColor) {
        runLen++;
        if (runLen === 5) penalty += 3;
        else if (runLen > 5) penalty += 1;
      } else {
        runColor = m[y][x];
        runLen = 1;
      }
    }
  }
  for (let x = 0; x < size; x++) {
    let runColor = m[0][x];
    let runLen = 1;
    for (let y = 1; y < size; y++) {
      if (m[y][x] === runColor) {
        runLen++;
        if (runLen === 5) penalty += 3;
        else if (runLen > 5) penalty += 1;
      } else {
        runColor = m[y][x];
        runLen = 1;
      }
    }
  }
  return penalty;
};

export const encodeQR = (text) => {
  try {
    if (!text || typeof text !== "string") return null;
    // Estimate byte length
    let byteLen = 0;
    for (let i = 0; i < text.length; i++) {
      const c = text.charCodeAt(i);
      byteLen += c < 128 ? 1 : c < 2048 ? 2 : 3;
    }
    const version = pickVersion(byteLen);
    if (version < 0) return null; // too long

    const dataBytes = encodeByteMode(text, version);
    const finalCw = interleaveBlocks(dataBytes, version);
    const { m, r, size } = makeMatrix(version);
    placeData(m, r, size, finalCw);

    // Try all 8 masks, pick lowest penalty
    let best = null;
    for (let mask = 0; mask < 8; mask++) {
      const masked = applyMask(m, r, size, mask);
      placeFormat(masked, size, mask);
      const p = evaluateMask(masked, size);
      if (!best || p < best.p) best = { p, mask, matrix: masked };
    }
    return { matrix: best.matrix, size };
  } catch (e) {
    console.error("QR encode failed", e);
    return null;
  }
};

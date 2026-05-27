// Team Code encoder/decoder for alliance schedules.
// New format: "TEAM1-" + base64url(JSON.stringify(compact-payload))
// Legacy format (still readable): "CAT1:" + base64url(JSON.stringify(verbose-payload))

const PREFIX_NEW = "TEAM1-";
const PREFIX_LEGACY = "CAT1:";

const b64encode = (str) => {
  if (typeof btoa === "function")
    return btoa(unescape(encodeURIComponent(str)));
  // eslint-disable-next-line no-undef
  return Buffer.from(str, "utf-8").toString("base64");
};

const b64decode = (str) => {
  if (typeof atob === "function") return decodeURIComponent(escape(atob(str)));
  // eslint-disable-next-line no-undef
  return Buffer.from(str, "base64").toString("utf-8");
};

const toUrlSafe = (b64) =>
  b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromUrlSafe = (s) => {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return s.replace(/-/g, "+").replace(/_/g, "/") + pad;
};

// Compact category map for shorter codes
const CAT_TO_CODE = { Combat: 1, Defense: 2, Economy: 3, Custom: 4 };
const CODE_TO_CAT = { 1: "Combat", 2: "Defense", 3: "Economy", 4: "Custom" };

export const encode = (config) => {
  // Compact payload: drop ids, drop zeros, single-letter keys
  const payload = {
    n: config.name || "",
    o: config.offset || "+00:00",
    e: (config.events || []).map((ev) => {
      const compact = {
        n: ev.name || "",
        c: CAT_TO_CODE[ev.category] || 4,
        a: ev.anchor || "00:00",
        i: parseInt(ev.interval, 10) || 60,
      };
      if (ev.lead) compact.l = parseInt(ev.lead, 10);
      if (ev.duration) compact.d = parseInt(ev.duration, 10);
      return compact;
    }),
  };
  const json = JSON.stringify(payload);
  return PREFIX_NEW + toUrlSafe(b64encode(json));
};

const decodeNew = (body) => {
  const json = b64decode(fromUrlSafe(body));
  const p = JSON.parse(json);
  if (!p || !Array.isArray(p.e)) throw new Error("bad shape");
  const config = {
    v: 1,
    name: p.n || "",
    offset: p.o || "+00:00",
    events: p.e.map((ev, idx) => ({
      id: `e_${idx}_${Math.random().toString(36).slice(2, 6)}`,
      name: ev.n || "",
      category: CODE_TO_CAT[ev.c] || "Custom",
      anchor: ev.a || "00:00",
      interval: parseInt(ev.i, 10) || 60,
      duration: parseInt(ev.d, 10) || 0,
      lead: parseInt(ev.l, 10) || 0,
    })),
  };
  return config;
};

const decodeLegacy = (body) => {
  const json = b64decode(fromUrlSafe(body));
  const p = JSON.parse(json);
  if (!p || !Array.isArray(p.events)) throw new Error("bad shape");
  return p;
};

export const decode = (raw) => {
  try {
    if (!raw || typeof raw !== "string")
      return { ok: false, error: "This doesn't look like a Team Code." };
    const trimmed = raw.trim();
    if (trimmed.startsWith(PREFIX_NEW)) {
      const config = decodeNew(trimmed.slice(PREFIX_NEW.length));
      return { ok: true, config };
    }
    if (trimmed.startsWith(PREFIX_LEGACY)) {
      const config = decodeLegacy(trimmed.slice(PREFIX_LEGACY.length));
      return { ok: true, config };
    }
    return { ok: false, error: "A Team Code should start with TEAM1-" };
  } catch (err) {
    return {
      ok: false,
      error: "We couldn't read that code. Try copying it again.",
    };
  }
};

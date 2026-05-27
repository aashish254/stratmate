// Short, memorable team IDs derived from the schedule name + offset.
// Pure function — same input always yields the same ID.
// Format: ABC-123 (6 alphanumeric chars, unambiguous alphabet).

const ALPHA = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no I, L, O, 0, 1

const hash32 = (str) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h >>> 0;
};

export const getTeamId = (config) => {
  if (!config) return "TEAM-0";
  const seed = `${config.name || ""}|${config.offset || ""}|${(config.events || []).length}`;
  let h = hash32(seed);
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += ALPHA[h % ALPHA.length];
    h = Math.floor(h / ALPHA.length) ^ ((h * 31) >>> 0);
  }
  return `${id.slice(0, 3)}-${id.slice(3)}`;
};

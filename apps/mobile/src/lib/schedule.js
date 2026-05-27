// Time math for alliance events.
// Server time = device UTC + offset (e.g. "+08:00").
// We compute the next N occurrences in the device's local clock.

const parseOffsetMinutes = (offset) => {
  if (!offset || typeof offset !== "string") return 0;
  const m = offset.match(/^([+-])(\d{2}):(\d{2})$/);
  if (!m) return 0;
  const sign = m[1] === "-" ? -1 : 1;
  return sign * (parseInt(m[2], 10) * 60 + parseInt(m[3], 10));
};

const parseAnchorMinutes = (anchor) => {
  if (!anchor) return 0;
  const m = anchor.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return 0;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
};

// Returns Date objects for the next `count` occurrences of an event,
// using the alliance's server offset and the event's anchor (server HH:MM) + interval (minutes).
export const getNextOccurrences = (
  event,
  serverOffset,
  count = 5,
  now = new Date(),
) => {
  const offsetMin = parseOffsetMinutes(serverOffset);
  const anchorMin = parseAnchorMinutes(event.anchor);
  const intervalMin = Math.max(1, parseInt(event.interval, 10) || 60);

  // Anchor in UTC minutes-of-day = anchor (server) - offset
  // Anchor as a UTC timestamp for "today" in server time:
  const nowMs = now.getTime();

  // Compute a reference anchor timestamp: today's server-date at anchor HH:MM, converted to UTC ms.
  // Easier: get current server-time minutes since epoch, find nearest anchor.
  const serverNowMs = nowMs + offsetMin * 60000;
  const serverNow = new Date(serverNowMs);
  const serverY = serverNow.getUTCFullYear();
  const serverMo = serverNow.getUTCMonth();
  const serverD = serverNow.getUTCDate();

  // Today's anchor in server time (as UTC ms of the server clock)
  let anchorServerMs =
    Date.UTC(serverY, serverMo, serverD, 0, 0, 0) + anchorMin * 60000;

  // Step backward to find the most recent occurrence <= serverNowMs
  const intervalMs = intervalMin * 60000;
  while (anchorServerMs > serverNowMs) {
    anchorServerMs -= intervalMs;
  }
  while (anchorServerMs + intervalMs <= serverNowMs) {
    anchorServerMs += intervalMs;
  }
  // anchorServerMs is now the most recent past/current occurrence in server clock.
  // Next occurrence is +interval.
  const occurrences = [];
  let next = anchorServerMs + intervalMs;
  for (let i = 0; i < count; i++) {
    const localMs = next - offsetMin * 60000;
    occurrences.push(new Date(localMs));
    next += intervalMs;
  }
  return occurrences;
};

// Returns { msUntil, percentElapsed } for the current cycle window.
export const getCycleProgress = (event, serverOffset, now = new Date()) => {
  const intervalMin = Math.max(1, parseInt(event.interval, 10) || 60);
  const next = getNextOccurrences(event, serverOffset, 1, now)[0];
  const msUntil = next.getTime() - now.getTime();
  const cycleMs = intervalMin * 60000;
  const elapsed = cycleMs - msUntil;
  const percent = Math.max(0, Math.min(100, (elapsed / cycleMs) * 100));
  return { next, msUntil, percentElapsed: percent };
};

export const formatTimeRemaining = (ms) => {
  if (ms <= 0) return "now";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

export const formatClock = (date) => {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
};

export const getDeviceOffsetString = () => {
  const offsetMin = -new Date().getTimezoneOffset();
  const sign = offsetMin >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMin);
  const h = Math.floor(abs / 60)
    .toString()
    .padStart(2, "0");
  const m = (abs % 60).toString().padStart(2, "0");
  return `${sign}${h}:${m}`;
};

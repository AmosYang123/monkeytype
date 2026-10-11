// Mock leaderboard data + selection/date helpers. Deterministic: seeded PRNG, anchored to the UTC day.

export type LbType = "allTime" | "weekly" | "daily";
export type Selection = {
  type: LbType;
  mode2: "15" | "60";
  language: string;
  previous: boolean;
};
export type Badge = "mythical" | "allYearLong";
export type SpeedEntry = {
  rank: number;
  name: string;
  badge?: Badge;
  wpm: number;
  acc: number;
  raw: number;
  consistency: number;
  timestamp: number;
};
export type XpEntry = {
  rank: number;
  name: string;
  badge?: Badge;
  totalXp: number;
  timeTypedSeconds: number;
  lastActivityTimestamp: number;
};

export const PAGE_SIZE = 50;
export const DAILY_LANGUAGES = ["english", "spanish", "german", "portuguese", "indonesian", "italian", "french"];
export const DEFAULT_SELECTION: Selection = { type: "allTime", mode2: "15", language: "english", previous: false };

const DAY = 86_400_000;
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const pad2 = (n: number) => String(n).padStart(2, "0");

// ---------- selection <-> url ----------

type ParamGetter = { get(name: string): string | null };

export function selectionFromParams(params: ParamGetter): Selection {
  const t = params.get("type");
  const type: LbType = t === "weekly" || t === "daily" ? t : "allTime";
  const mode2 = params.get("mode2") === "60" ? "60" : "15";
  const lang = params.get("language") ?? "english";
  const language = type === "daily" && DAILY_LANGUAGES.includes(lang) ? lang : "english";
  return { type, mode2, language, previous: false };
}

export function pageFromParams(params: ParamGetter): number {
  const n = Number.parseInt(params.get("page") ?? "1", 10);
  return Number.isFinite(n) && n >= 1 ? n - 1 : 0;
}

export function paramsFor(sel: Selection, page: number): string {
  const p = new URLSearchParams({ type: sel.type });
  if (sel.type !== "weekly") {
    p.set("mode", "time");
    p.set("mode2", sel.mode2);
    p.set("language", sel.language);
  }
  p.set("page", String(page + 1));
  return p.toString();
}

/** Mirrors the source's normalizeSelection: all-time only supports english, weekly has no mode/language. */
export function normalizeSelection(sel: Selection): Selection {
  if (sel.type === "daily") return sel;
  return { ...sel, language: "english", previous: false };
}

// ---------- mock data ----------

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

const ADJECTIVES = ["swift", "quiet", "lucky", "brisk", "cosmic", "mellow", "rapid", "silent", "amber", "frosty", "nimble", "crimson", "gentle", "stormy", "velvet", "hasty", "lunar", "wild", "ember", "polar"];
const NOUNS = ["falcon", "pixel", "otter", "comet", "typist", "walrus", "ember", "badger", "cipher", "lynx", "raven", "quill", "panda", "fjord", "gecko", "marble", "orbit", "sparrow", "tundra", "wombat"];

function makeNames(rand: () => number, n: number): string[] {
  const seen = new Set<string>();
  while (seen.size < n) {
    const adj = ADJECTIVES[Math.floor(rand() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(rand() * NOUNS.length)];
    const cap = rand() < 0.3;
    const sep = rand() < 0.25 ? "_" : "";
    const digits = rand() < 0.7 ? String(Math.floor(rand() * 10000)) : "";
    const base = cap ? adj[0].toUpperCase() + adj.slice(1) + sep + noun[0].toUpperCase() + noun.slice(1) : adj + sep + noun;
    seen.add(base + digits);
  }
  return [...seen];
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export const utcDayStart = (now: number) => Math.floor(now / DAY) * DAY;
/** Monday 00:00 UTC of the week containing `ts`. */
export const utcWeekStart = (ts: number) => {
  const day = utcDayStart(ts);
  const dow = new Date(day).getUTCDay();
  return day - ((dow + 6) % 7) * DAY;
};

const cache = new Map<string, unknown[]>();

function speedStart(sel: Selection): number {
  if (sel.type === "allTime") return sel.mode2 === "15" ? 319 : 285;
  const factor = sel.language === "english" ? 1 : 0.6 + (hash(sel.language) % 25) / 100;
  return (sel.mode2 === "15" ? 285 : 255) * factor;
}

export function speedEntries(sel: Selection, now: number): SpeedEntry[] {
  const today = utcDayStart(now);
  const dayStart = sel.previous ? today - DAY : today;
  const anchor = sel.type === "daily" ? dayStart : today;
  const key = `s|${sel.type}|${sel.mode2}|${sel.language}|${anchor}`;
  const hit = cache.get(key);
  if (hit) return hit as SpeedEntry[];
  // all-time data is seeded without the day so only its dates move, daily reseeds each day
  const rand = mulberry32(hash(sel.type === "daily" ? key : key.slice(0, key.lastIndexOf("|"))));
  const n = sel.type === "allTime" ? 1000 : 200;
  const start = speedStart(sel);
  const names = makeNames(rand, n);
  const wpms = Array.from({ length: n }, (_, i) => start * (1 - 0.5 * Math.pow(i / n, 0.6)) - rand() * 1.5).sort((a, b) => b - a);
  const entries = wpms.map((w, i): SpeedEntry => {
    const wpm = round2(w);
    const acc = round2(rand() < 0.1 ? 100 : 92 + rand() * 8);
    return {
      rank: i + 1,
      name: names[i],
      badge: sel.type === "allTime" && rand() < 0.02 ? "mythical" : undefined,
      wpm,
      acc,
      raw: round2(wpm + (acc === 100 ? 0 : rand() * 14)),
      consistency: round2(70 + rand() * 25),
      timestamp: sel.type === "daily" ? dayStart + Math.floor(rand() * DAY) : anchor - Math.floor(rand() * 730 * DAY),
    };
  });
  cache.set(key, entries);
  return entries;
}

export function xpEntries(sel: Selection, now: number): XpEntry[] {
  const today = utcDayStart(now);
  const weekStart = utcWeekStart(today) - (sel.previous ? 7 * DAY : 0);
  const key = `x|${weekStart}`;
  const hit = cache.get(key);
  if (hit) return hit as XpEntry[];
  const rand = mulberry32(hash(key));
  const n = 1000;
  const names = makeNames(rand, n);
  const span = sel.previous ? 7 * DAY : Math.max(DAY, today - weekStart);
  const xps = Array.from({ length: n }, (_, i) => 480_000 * Math.pow(1 - i / n, 2.2) + rand() * 300).sort((a, b) => b - a);
  const entries = xps.map((xp, i): XpEntry => ({
    rank: i + 1,
    name: names[i],
    badge: rand() < 0.04 ? "allYearLong" : undefined,
    totalXp: Math.round(xp),
    timeTypedSeconds: Math.round(xp / (5 + rand() * 4)),
    lastActivityTimestamp: weekStart + Math.floor(rand() * span),
  }));
  cache.set(key, entries);
  return entries;
}

// ---------- formatting ----------

export const abbreviateNumber = (v: number) => (v < 1000 ? v.toFixed(0) : `${(v / 1000).toFixed(1)}k`);

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  return `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor((s % 3600) / 60))}:${pad2(s % 60)}`;
}

export const formatDate = (ts: number) => {
  const d = new Date(ts);
  return `${pad2(d.getDate())} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
};
export const formatTime = (ts: number) => {
  const d = new Date(ts);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

export function nextUpdateText(type: LbType, now: number): string {
  if (type === "allTime") {
    const d = new Date(now);
    const total = (14 - (d.getMinutes() % 15)) * 60 + (60 - d.getSeconds());
    return `Next update in: ${pad2(Math.floor(total / 60))}:${pad2(total % 60)}`;
  }
  if (type === "daily") {
    return `Next reset in: ${formatDuration(Math.ceil((utcDayStart(now) + DAY - now) / 1000))}`;
  }
  const secs = Math.ceil((utcWeekStart(now) + 7 * DAY - now) / 1000);
  const days = Math.floor(secs / 86400);
  return `Next reset in: ${days > 0 ? `${pad2(days)}:` : ""}${formatDuration(secs % 86400)}`;
}

const ordinal = (n: number) => {
  const r = n % 100;
  if (r >= 11 && r <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10 > 3 ? 0 : n % 10]}`;
};

function longDate(ts: number, utc: boolean, withTime: boolean): string {
  // utc=false shifts the instant by the local offset so the UTC getters read local time
  const d = new Date(utc ? ts : ts - new Date(ts).getTimezoneOffset() * 60000);
  const base = `${WEEKDAYS[d.getUTCDay()]}, ${ordinal(d.getUTCDate())} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  return withTime ? `${base} ${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}` : base;
}

export function subTitle(sel: Selection, now: number): { dateString: string; localString: string; buttonText: string } | null {
  if (sel.type === "allTime") return null;
  const today = utcDayStart(now);
  const weekly = sel.type === "weekly";
  const start = weekly ? utcWeekStart(today) - (sel.previous ? 7 * DAY : 0) : today - (sel.previous ? DAY : 0);
  const end = start + (weekly ? 7 : 1) * DAY - 1;
  return {
    dateString: weekly ? `${longDate(start, true, false)} - ${longDate(end, true, false)} UTC` : `${longDate(start, true, false)} UTC`,
    localString: `local time\n${longDate(start, false, true)} -\n${longDate(end, false, true)}`,
    buttonText: sel.previous ? (weekly ? "show this week" : "show today") : weekly ? "show last week" : "show yesterday",
  };
}

export function titleText(sel: Selection): string {
  const type = sel.type === "allTime" ? "All-time" : sel.type === "weekly" ? "Weekly XP" : "Daily";
  const language = sel.type === "weekly" ? "" : sel.language.charAt(0).toUpperCase() + sel.language.slice(1);
  const mode = sel.type !== "weekly" ? ` Time ${sel.mode2}` : "";
  return `${type} ${language} ${mode} Leaderboard`;
}

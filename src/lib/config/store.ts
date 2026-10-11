// Global config store (monkeytype's `Config` singleton): readable from React via useConfig()
// and from plain modules (engine, command line) via getConfig()/setConfig().
// Persisted to localStorage["config"] like the live site.
import { getDefaultConfig } from "./defaults.ts";
import { sanitizeConfig } from "./options.ts";
import type { Config, ConfigKey } from "./types.ts";

export const STORAGE_KEY = "config";

type Listener = (changed: readonly ConfigKey[]) => void;

let config: Config = getDefaultConfig();
let loaded = false;
const listeners = new Set<Listener>();

function readStorage(): Config {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizeConfig(JSON.parse(raw)) : getDefaultConfig();
  } catch {
    return getDefaultConfig();
  }
}

function writeStorage(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // storage full or blocked: settings still apply for this session
  }
}

function emit(changed: readonly ConfigKey[]): void {
  listeners.forEach((l) => l(changed));
}

/** Loads the saved config once on the client. Safe to call repeatedly. */
export function loadConfig(): void {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  const saved = readStorage();
  const changed = (Object.keys(saved) as ConfigKey[]).filter(
    (k) => JSON.stringify(saved[k]) !== JSON.stringify(config[k]),
  );
  config = saved;
  if (changed.length) emit(changed);
}

export const getConfig = (): Config => config;

export function subscribeConfig(l: Listener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** Applies a partial update; invalid values are dropped by sanitizeConfig. Returns changed keys. */
export function setConfigs(patch: Partial<Config>): ConfigKey[] {
  const next = sanitizeConfig({ ...config, ...patch });
  const changed = (Object.keys(patch) as ConfigKey[]).filter(
    (k) => JSON.stringify(next[k]) !== JSON.stringify(config[k]),
  );
  if (!changed.length) return changed;
  config = next;
  writeStorage();
  emit(changed);
  return changed;
}

export function setConfig<K extends ConfigKey>(key: K, value: Config[K]): boolean {
  return setConfigs({ [key]: value } as Partial<Config>).length > 0;
}

export function resetConfig(): void {
  const defaults = getDefaultConfig();
  const changed = (Object.keys(defaults) as ConfigKey[]).filter(
    (k) => JSON.stringify(defaults[k]) !== JSON.stringify(config[k]),
  );
  config = defaults;
  writeStorage();
  emit(changed);
}

/** For tests only. */
export function __resetStoreForTests(c: Config = getDefaultConfig()): void {
  config = c;
  loaded = false;
  listeners.clear();
}

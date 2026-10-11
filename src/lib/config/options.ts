// Allowed values and ranges for every config key (ported from packages/schemas/src/configs.ts, GPL-3.0).
import { DEFAULT_CONFIG, getDefaultConfig } from "./defaults.ts";
import { FONTS, LANGUAGES, LAYOUTS, THEME_NAMES } from "./lists.ts";
import type {
  Ads,
  CaretStyle,
  CompositionDisplay,
  Config,
  ConfigKey,
  ConfidenceMode,
  CustomBackgroundSize,
  DeleteOnError,
  Difficulty,
  FunboxName,
  HighlightMode,
  IndicateTypos,
  KeymapKeys,
  KeymapLegendStyle,
  KeymapMode,
  KeymapStyle,
  LiveSpeedAccBurstStyle,
  MinimumAccuracy,
  MinimumBurst,
  MinimumWordsPerMinute,
  Mode,
  MonkeyPowerLevel,
  OnOff,
  OppositeShiftMode,
  PaceCaret,
  PlaySoundOnClick,
  PlaySoundOnError,
  PlayTimeWarning,
  QuickRestart,
  QuoteLength,
  RandomTheme,
  RepeatQuotes,
  ShowAverage,
  SingleListCommandLine,
  SmoothCaret,
  StopOnError,
  TapeMode,
  TimerColor,
  TimerOpacity,
  TimerStyle,
  TypedEffect,
  TypingSpeedUnit,
} from "./types.ts";

export const MODE_OPTIONS: readonly Mode[] = ["time", "words", "quote", "custom", "zen"];
export const QUOTE_LENGTH_OPTIONS: readonly QuoteLength[] = [-3, -2, 0, 1, 2, 3];
export const DIFFICULTY_OPTIONS: readonly Difficulty[] = ["normal", "expert", "master"];
export const QUICK_RESTART_OPTIONS: readonly QuickRestart[] = ["off", "esc", "tab", "enter"];
export const REPEAT_QUOTES_OPTIONS: readonly RepeatQuotes[] = ["off", "typing"];
export const SINGLE_LIST_COMMAND_LINE_OPTIONS: readonly SingleListCommandLine[] = ["manual", "on"];
export const MIN_WPM_OPTIONS: readonly MinimumWordsPerMinute[] = ["off", "custom"];
export const MIN_ACC_OPTIONS: readonly MinimumAccuracy[] = ["off", "custom"];
export const MIN_BURST_OPTIONS: readonly MinimumBurst[] = ["off", "fixed", "flex"];
export const OPPOSITE_SHIFT_MODE_OPTIONS: readonly OppositeShiftMode[] = ["off", "on", "keymap"];
export const STOP_ON_ERROR_OPTIONS: readonly StopOnError[] = ["off", "word", "letter"];
export const DELETE_ON_ERROR_OPTIONS: readonly DeleteOnError[] = ["off", "letter", "letter_hard", "word", "word_hard"];
export const CONFIDENCE_MODE_OPTIONS: readonly ConfidenceMode[] = ["off", "on", "max"];
export const INDICATE_TYPOS_OPTIONS: readonly IndicateTypos[] = ["off", "below", "replace", "both"];
export const COMPOSITION_DISPLAY_OPTIONS: readonly CompositionDisplay[] = ["off", "below", "replace"];
export const PLAY_SOUND_ON_CLICK_OPTIONS: readonly PlaySoundOnClick[] = [
  "off", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13",
  "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26",
];
export const PLAY_SOUND_ON_ERROR_OPTIONS: readonly PlaySoundOnError[] = ["off", "1", "2", "3", "4"];
export const PLAY_TIME_WARNING_OPTIONS: readonly PlayTimeWarning[] = ["off", "1", "3", "5", "10"];
export const SMOOTH_CARET_OPTIONS: readonly SmoothCaret[] = ["off", "slow", "medium", "fast"];
export const CARET_STYLE_OPTIONS: readonly CaretStyle[] = [
  "off",
  "default",
  "block",
  "outline",
  "underline",
  "carrot",
  "banana",
  "monkey",
];
// caret styles the live settings page offers (carrot, banana and monkey are hidden)
export const VISIBLE_CARET_STYLE_OPTIONS: readonly CaretStyle[] = ["off", "default", "block", "outline", "underline"];
export const PACE_CARET_OPTIONS: readonly PaceCaret[] = ["off", "average", "pb", "tagPb", "last", "custom", "daily"];
export const TIMER_STYLE_OPTIONS: readonly TimerStyle[] = ["off", "bar", "text", "mini", "flash_text", "flash_mini"];
export const LIVE_STYLE_OPTIONS: readonly LiveSpeedAccBurstStyle[] = ["off", "text", "mini"];
export const TIMER_COLOR_OPTIONS: readonly TimerColor[] = ["black", "sub", "text", "main"];
export const TIMER_OPACITY_OPTIONS: readonly TimerOpacity[] = ["0.25", "0.5", "0.75", "1"];
export const HIGHLIGHT_MODE_OPTIONS: readonly HighlightMode[] = [
  "off",
  "letter",
  "word",
  "next_word",
  "next_two_words",
  "next_three_words",
];
export const TYPED_EFFECT_OPTIONS: readonly TypedEffect[] = ["keep", "hide", "fade", "dots"];
export const TAPE_MODE_OPTIONS: readonly TapeMode[] = ["off", "letter", "word"];
export const TYPING_SPEED_UNIT_OPTIONS: readonly TypingSpeedUnit[] = ["wpm", "cpm", "wps", "cps", "wph"];
export const KEYMAP_MODE_OPTIONS: readonly KeymapMode[] = ["off", "static", "react", "next"];
export const KEYMAP_STYLE_OPTIONS: readonly KeymapStyle[] = [
  "staggered",
  "alice",
  "matrix",
  "split",
  "split_matrix",
  "steno",
  "steno_matrix",
];
export const KEYMAP_LEGEND_STYLE_OPTIONS: readonly KeymapLegendStyle[] = ["lowercase", "uppercase", "blank", "dynamic"];
export const KEYMAP_KEYS_OPTIONS: readonly KeymapKeys[] = ["minimal", "minimal_numrow", "full"];
export const CUSTOM_BACKGROUND_SIZE_OPTIONS: readonly CustomBackgroundSize[] = ["cover", "contain", "max"];
export const RANDOM_THEME_OPTIONS: readonly RandomTheme[] = ["off", "on", "fav", "light", "dark", "custom", "auto"];
export const SHOW_AVERAGE_OPTIONS: readonly ShowAverage[] = ["off", "speed", "acc", "both"];
export const MONKEY_POWER_LEVEL_OPTIONS: readonly MonkeyPowerLevel[] = ["off", "1", "2", "3", "4"];
export const ADS_OPTIONS: readonly Ads[] = ["off", "result", "on", "sellout"];
export const ON_OFF_OPTIONS: readonly OnOff[] = ["on", "off"];
export const FUNBOX_OPTIONS: readonly FunboxName[] = [
  "58008", "mirror", "upside_down", "nausea", "round_round_baby", "simon_says", "tts", "choo_choo",
  "arrows", "rAnDoMcAsE", "sPoNgEcAsE", "capitals", "layout_mirror", "layoutfluid", "earthquake",
  "space_balls", "gibberish", "ascii", "specials", "plus_zero", "plus_one", "plus_two", "plus_three",
  "read_ahead_easy", "read_ahead", "read_ahead_hard", "memory", "nospace", "poetry", "wikipedia",
  "weakspot", "pseudolang", "IPv4", "IPv6", "binary", "hexadecimal", "zipf", "morse", "crt",
  "backwards", "ddoouubblleedd", "instant_messaging", "underscore_spaces", "ALL_CAPS", "polyglot",
  "asl", "rot13", "no_quit",
];

// config keys whose value is one entry of a fixed list
export const ENUM_OPTIONS: { [K in ConfigKey]?: readonly Config[K][] } = {
  mode: MODE_OPTIONS,
  difficulty: DIFFICULTY_OPTIONS,
  quickRestart: QUICK_RESTART_OPTIONS,
  repeatQuotes: REPEAT_QUOTES_OPTIONS,
  singleListCommandLine: SINGLE_LIST_COMMAND_LINE_OPTIONS,
  minWpm: MIN_WPM_OPTIONS,
  minAcc: MIN_ACC_OPTIONS,
  minBurst: MIN_BURST_OPTIONS,
  oppositeShiftMode: OPPOSITE_SHIFT_MODE_OPTIONS,
  stopOnError: STOP_ON_ERROR_OPTIONS,
  deleteOnError: DELETE_ON_ERROR_OPTIONS,
  confidenceMode: CONFIDENCE_MODE_OPTIONS,
  indicateTypos: INDICATE_TYPOS_OPTIONS,
  compositionDisplay: COMPOSITION_DISPLAY_OPTIONS,
  playSoundOnClick: PLAY_SOUND_ON_CLICK_OPTIONS,
  playSoundOnError: PLAY_SOUND_ON_ERROR_OPTIONS,
  playTimeWarning: PLAY_TIME_WARNING_OPTIONS,
  smoothCaret: SMOOTH_CARET_OPTIONS,
  caretStyle: CARET_STYLE_OPTIONS,
  paceCaret: PACE_CARET_OPTIONS,
  paceCaretStyle: CARET_STYLE_OPTIONS,
  timerStyle: TIMER_STYLE_OPTIONS,
  liveSpeedStyle: LIVE_STYLE_OPTIONS,
  liveAccStyle: LIVE_STYLE_OPTIONS,
  liveBurstStyle: LIVE_STYLE_OPTIONS,
  timerColor: TIMER_COLOR_OPTIONS,
  timerOpacity: TIMER_OPACITY_OPTIONS,
  highlightMode: HIGHLIGHT_MODE_OPTIONS,
  typedEffect: TYPED_EFFECT_OPTIONS,
  tapeMode: TAPE_MODE_OPTIONS,
  typingSpeedUnit: TYPING_SPEED_UNIT_OPTIONS,
  keymapMode: KEYMAP_MODE_OPTIONS,
  keymapStyle: KEYMAP_STYLE_OPTIONS,
  keymapLegendStyle: KEYMAP_LEGEND_STYLE_OPTIONS,
  keymapKeys: KEYMAP_KEYS_OPTIONS,
  customBackgroundSize: CUSTOM_BACKGROUND_SIZE_OPTIONS,
  randomTheme: RANDOM_THEME_OPTIONS,
  showAverage: SHOW_AVERAGE_OPTIONS,
  monkeyPowerLevel: MONKEY_POWER_LEVEL_OPTIONS,
  ads: ADS_OPTIONS,
};

// numeric limits from the zod schemas; fontSize is also required to be > 0, maxLineWidth is 0 or 20-1000
export const NUMBER_RANGES: Partial<Record<ConfigKey, { min?: number; max?: number; step?: number }>> = {
  words: { min: 0, step: 1 },
  time: { min: 0, step: 1 },
  minWpmCustomSpeed: { min: 0 },
  minAccCustom: { min: 0, max: 100 },
  minBurstCustomSpeed: { min: 0 },
  paceCaretCustomSpeed: { min: 0 },
  soundVolume: { min: 0, max: 1, step: 0.1 },
  tapeMargin: { min: 10, max: 90 },
  maxLineWidth: { min: 20, max: 1000 },
  fontSize: { min: 0 },
  keymapSize: { min: 0.5, max: 3.5, step: 0.1 },
};

const FONT_NAME_PATTERN = /^[a-zA-Z0-9_\-+.]+$/;
const HEX_COLOR_PATTERN = /^#([\da-f]{3}){1,2}$/i;
const BACKGROUND_EXTENSION_PATTERN = /.+(\.png|\.gif|\.jpeg|\.jpg|\.webp)/i;

const isArrayOf = <T>(v: unknown, ok: (item: unknown) => item is T): v is T[] => Array.isArray(v) && v.every(ok);
const oneOf =
  <T extends string | number>(list: readonly T[]) =>
  (v: unknown): v is T =>
    (typeof v === "string" || typeof v === "number") && (list as readonly unknown[]).includes(v);
const isLanguage = oneOf(LANGUAGES);
const isLayout = oneOf(LAYOUTS);
const isTheme = oneOf(THEME_NAMES);
const isFunbox = oneOf(FUNBOX_OPTIONS);
const isQuoteLength = oneOf(QUOTE_LENGTH_OPTIONS);
const isOnOff = oneOf(ON_OFF_OPTIONS);
const isNumber = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

function inRange(key: ConfigKey, v: unknown): boolean {
  if (!isNumber(v)) return false;
  const { min, max, step } = NUMBER_RANGES[key] ?? {};
  if (min !== undefined && v < min) return false;
  if (max !== undefined && v > max) return false;
  return step === 1 ? Number.isInteger(v) : true;
}

function isCustomBackground(v: unknown): boolean {
  if (typeof v !== "string") return false;
  if (v === "") return true;
  if (v.length > 2048 || !/^https?:\/\/[^`'"]*$/.test(v) || !BACKGROUND_EXTENSION_PATTERN.test(v)) return false;
  try {
    new URL(v);
    return true;
  } catch {
    return false;
  }
}

// keys whose validity can't be read off the default value's type or ENUM_OPTIONS
const CUSTOM_VALIDATORS: { [K in ConfigKey]?: (v: unknown) => boolean } = {
  language: isLanguage,
  layout: (v) => v === "default" || isLayout(v),
  keymapLayout: (v) => v === "overrideSync" || isLayout(v),
  fontFamily: (v) =>
    typeof v === "string" && (FONTS.some((f) => f.name === v) || (v.length <= 50 && FONT_NAME_PATTERN.test(v))),
  theme: isTheme,
  themeLight: isTheme,
  themeDark: isTheme,
  favThemes: (v) => isArrayOf(v, isTheme),
  quoteLength: (v) => isArrayOf(v, isQuoteLength),
  funbox: (v) => isArrayOf(v, isFunbox) && v.length <= 15,
  customLayoutfluid: (v) => isArrayOf(v, isLayout) && v.length >= 2 && v.length <= 15,
  customPolyglot: (v) => isArrayOf(v, isLanguage) && v.length >= 2,
  accountChart: (v) => isArrayOf(v, isOnOff) && v.length === 4,
  customBackground: isCustomBackground,
  customBackgroundFilter: (v) => isArrayOf(v, isNumber) && v.length === 4,
  customThemeColors: (v) =>
    Array.isArray(v) && v.length === 10 && v.every((c) => typeof c === "string" && HEX_COLOR_PATTERN.test(c)),
  maxLineWidth: (v) => v === 0 || inRange("maxLineWidth", v),
  fontSize: (v) => isNumber(v) && v > 0,
};

function isValid(key: ConfigKey, v: unknown): boolean {
  const custom = CUSTOM_VALIDATORS[key];
  if (custom) return custom(v);
  const options = ENUM_OPTIONS[key] as readonly unknown[] | undefined;
  if (options) return options.includes(v);
  const fallback = DEFAULT_CONFIG[key];
  if (typeof fallback === "boolean") return typeof v === "boolean";
  if (typeof fallback === "number") return inRange(key, v);
  return false;
}

// Takes parsed JSON (e.g. from localStorage) and returns a valid Config: unknown keys are dropped,
// missing or invalid values fall back to their defaults. Never throws.
export function sanitizeConfig(input: unknown): Config {
  const config = getDefaultConfig();
  if (typeof input !== "object" || input === null || Array.isArray(input)) return config;
  const source = input as Record<string, unknown>;
  const target = config as Record<string, unknown>;
  for (const key of Object.keys(DEFAULT_CONFIG) as ConfigKey[]) {
    if (!Object.hasOwn(source, key)) continue;
    const value = source[key];
    if (isValid(key, value)) target[key] = structuredClone(value);
  }
  return config;
}

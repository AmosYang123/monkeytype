// Command line command list (ported from monkeytype commandline/lists.ts + commandline-metadata.ts + util.ts, GPL-3.0).
// Display strings, aliases and ordering follow upstream. Commands that need an account, a running test or
// features this clone does not have (tags, presets, quote favorites, bail out, result screen, challenges,
// local font/background upload, profile search, fps counter, sw cache) are left out.
import type { FaIconName } from "@/components/icons";
import type { Config, ConfigKey } from "./config/types.ts";
import { ENUM_OPTIONS } from "./config/options.ts";
import { FONTS, FUNBOXES, LANGUAGES, LAYOUTS, THEME_NAMES } from "./config/lists.ts";
import { checkCompatibility } from "./funbox-validation.ts";
import { validSettingsPatch } from "./test-settings.ts";
import type { ModalId } from "./modals.ts";
import { PRACTISE_MISSED_EVENT } from "./test-events.ts";

export type InputSpec = {
  defaultValue: string;
  /** config patch for the typed text, null when the text can not be parsed */
  apply: (raw: string) => Partial<Config> | null;
};

export type Action =
  | { type: "modal"; id: ModalId; patch?: Partial<Config> }
  | { type: "route"; path: string }
  | { type: "url"; url: string }
  | { type: "clearNotifications" }
  /** window event for the test engine; the test page opens first */
  | { type: "testEvent"; name: string }
  | { type: "fullscreen" };

export type Child = {
  display: string;
  alias?: string;
  /** shown as the parent label instead of the top command, for nested lists like "Custom font" */
  parent?: string;
  patch?: Partial<Config>;
  /** defined = the row has a check column */
  active?: boolean;
  theme?: string;
  fav?: boolean;
  font?: string;
  input?: InputSpec;
  /** the command line stays open after running it */
  sticky?: boolean;
};

export type Top = {
  id: string;
  display: string;
  icon: FaIconName;
  alias?: string;
  children?: Child[];
  input?: InputSpec;
  action?: Action;
  patch?: Partial<Config>;
};

const ICON: Partial<Record<ConfigKey, FaIconName>> = {
  punctuation: "at",
  numbers: "hashtag",
  words: "font",
  time: "clock",
  mode: "bars",
  quoteLength: "quote-right",
  language: "language",
  difficulty: "star",
  quickRestart: "redo-alt",
  repeatQuotes: "sync-alt",
  resultSaving: "save",
  blindMode: "eye-slash",
  alwaysShowWordsHistory: "align-left",
  singleListCommandLine: "list",
  minWpm: "bomb",
  minAcc: "bomb",
  minBurst: "bomb",
  britishEnglish: "language",
  funbox: "gamepad",
  customLayoutfluid: "tint",
  customPolyglot: "language",
  freedomMode: "feather-alt",
  strictSpace: "minus",
  oppositeShiftMode: "exchange-alt",
  stopOnError: "hand-paper",
  deleteOnError: "eraser",
  confidenceMode: "backspace",
  quickEnd: "step-forward",
  indicateTypos: "exclamation",
  compositionDisplay: "language",
  hideExtraLetters: "eye-slash",
  lazyMode: "couch",
  layout: "keyboard",
  codeUnindentOnBackspace: "code",
  soundVolume: "volume-down",
  playSoundOnClick: "volume-up",
  playSoundOnError: "volume-mute",
  playTimeWarning: "exclamation-triangle",
  smoothCaret: "i-cursor",
  caretStyle: "i-cursor",
  paceCaret: "i-cursor",
  paceCaretStyle: "i-cursor",
  repeatedPace: "i-cursor",
  timerStyle: "chart-pie",
  liveSpeedStyle: "tachometer-alt",
  liveAccStyle: "tachometer-alt",
  liveBurstStyle: "tachometer-alt",
  timerColor: "chart-pie",
  timerOpacity: "chart-pie",
  highlightMode: "highlighter",
  typedEffect: "eye",
  tapeMode: "tape",
  tapeMargin: "tape",
  smoothLineScroll: "align-left",
  showAllLines: "align-left",
  alwaysShowDecimalPlaces: "ellipsis-h",
  typingSpeedUnit: "tachometer-alt",
  startGraphsAtZero: "chart-line",
  maxLineWidth: "text-width",
  fontSize: "font",
  fontFamily: "font",
  keymapMode: "keyboard",
  keymapLayout: "keyboard",
  keymapStyle: "keyboard",
  keymapLegendStyle: "keyboard",
  keymapKeys: "keyboard",
  keymapSize: "keyboard",
  flipTestColors: "adjust",
  colorfulMode: "fill-drip",
  customBackground: "image",
  customBackgroundSize: "image",
  customBackgroundFilter: "image",
  randomTheme: "palette",
  theme: "palette",
  customTheme: "palette",
  showKeyTips: "question",
  showOutOfFocusWarning: "exclamation",
  capsLockWarning: "exclamation-triangle",
  showAverage: "chart-bar",
  showPb: "crown",
  monkey: "egg",
  monkeyPowerLevel: "egg",
  ads: "ad",
};

// displayString of the config metadata, the default root label is "<Capitalized>..."
const NAME: Partial<Record<ConfigKey, string>> = {
  words: "word count",
  quoteLength: "quote length",
  quickRestart: "quick restart",
  repeatQuotes: "repeat quotes",
  resultSaving: "result saving",
  blindMode: "blind mode",
  alwaysShowWordsHistory: "always show words history",
  singleListCommandLine: "single list command line",
  britishEnglish: "british english",
  customLayoutfluid: "custom layoutfluid",
  customPolyglot: "polyglot languages",
  freedomMode: "freedom mode",
  strictSpace: "strict space",
  oppositeShiftMode: "opposite shift mode",
  stopOnError: "stop on error",
  deleteOnError: "delete on error",
  confidenceMode: "confidence mode",
  quickEnd: "quick end",
  indicateTypos: "indicate typos",
  compositionDisplay: "composition display",
  hideExtraLetters: "hide extra letters",
  lazyMode: "lazy mode",
  codeUnindentOnBackspace: "code unindent on backspace",
  soundVolume: "sound volume",
  playTimeWarning: "play time warning",
  smoothCaret: "smooth caret",
  caretStyle: "caret style",
  paceCaretStyle: "pace caret style",
  repeatedPace: "repeated pace",
  timerStyle: "live progress style",
  liveSpeedStyle: "live speed style",
  liveAccStyle: "live accuracy style",
  liveBurstStyle: "live word burst style",
  highlightMode: "highlight mode",
  typedEffect: "typed effect",
  tapeMode: "tape mode",
  tapeMargin: "tape margin",
  smoothLineScroll: "smooth line scroll",
  showAllLines: "show all lines",
  alwaysShowDecimalPlaces: "always show decimal places",
  typingSpeedUnit: "typing speed unit",
  startGraphsAtZero: "start graphs at zero",
  maxLineWidth: "max line width",
  fontSize: "font size",
  fontFamily: "font family",
  keymapMode: "keymap mode",
  keymapLayout: "keymap layout",
  keymapStyle: "keymap style",
  keymapLegendStyle: "keymap legend style",
  keymapKeys: "keymap keys",
  keymapSize: "keymap size",
  flipTestColors: "flip test colors",
  colorfulMode: "colorful mode",
  customBackgroundSize: "custom background size",
  customTheme: "custom theme",
  randomTheme: "random theme",
  capsLockWarning: "caps lock warning",
  showAverage: "show average",
  showPb: "show personal best",
};

const cap = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);
const spaced = (value: string): string => value.replace(/_/g, " ");
const onOff = (value: boolean): string => (value ? "on" : "off");
const labelOf = (value: unknown): string => (typeof value === "boolean" ? onOff(value) : String(value));
const patchOf = <K extends ConfigKey>(key: K, value: Config[K]): Partial<Config> => ({ [key]: value }) as Partial<Config>;
const rootDisplay = (key: ConfigKey): string => `${cap(NAME[key] ?? key)}...`;

type GroupOptions<K extends ConfigKey> = {
  display?: string;
  alias?: string;
  options?: readonly Config[K][];
  label?: (value: Config[K]) => string;
  optionAlias?: (value: Config[K]) => string | undefined;
  /** extra config changed together with the option, e.g. the mode for time/words */
  also?: Partial<Config>;
  /** last row, an input */
  input?: Child;
};

/** upstream sorts "off" / false to the top and keeps the rest in order */
const offFirst = <T>(values: readonly T[]): T[] =>
  [...values].sort((a, b) => (a === "off" || a === false ? -1 : b === "off" || b === false ? 1 : 0));

function group<K extends ConfigKey>(config: Config, key: K, options: GroupOptions<K> = {}): Top {
  const values = offFirst(options.options ?? (ENUM_OPTIONS[key] as readonly Config[K][] | undefined) ?? ([false, true] as unknown as Config[K][]));
  const children: Child[] = values.map((value) => ({
    display: options.label?.(value) ?? labelOf(value),
    alias: options.optionAlias?.(value),
    patch: { ...patchOf(key, value), ...options.also },
    active: JSON.stringify(config[key]) === JSON.stringify(value),
  }));
  if (options.input) children.push(options.input);
  return { id: key, display: options.display ?? rootDisplay(key), icon: ICON[key] ?? "cog", alias: options.alias, children };
}

const numberOf = (raw: string): number | null => (raw.trim() !== "" && Number.isFinite(Number(raw)) ? Number(raw) : null);

/** an input for a number config key; `also` and `mode` mirror upstream's extra config changes */
function numberInput<K extends ConfigKey>(config: Config, key: K, extra: Partial<Config> = {}): InputSpec {
  return {
    defaultValue: String(config[key]),
    apply: (raw) => {
      const value = numberOf(raw);
      return value === null ? null : { ...patchOf(key, value as Config[K]), ...extra };
    },
  };
}

/** a top level command that is only an input, like "Font size..." */
function inputTop<K extends ConfigKey>(config: Config, key: K, extra: { display?: string; alias?: string; extra?: Partial<Config> } = {}): Top {
  return {
    id: key,
    display: extra.display ?? rootDisplay(key),
    icon: ICON[key] ?? "cog",
    alias: extra.alias,
    input: numberInput(config, key, extra.extra),
  };
}

/** the "custom..." row of a sub list: selects `configValue` and stores the typed number in `numberKey` */
function customRow(config: Config, key: ConfigKey, value: string, numberKey: ConfigKey, display = "custom..."): Child {
  return {
    display,
    active: config[key] === value,
    input: {
      defaultValue: String(config[numberKey]),
      apply: (raw) => {
        const number = numberOf(raw);
        return number === null ? null : ({ [key]: value, [numberKey]: number } as Partial<Config>);
      },
    },
  };
}

const wordsInput = (config: Config, key: "words" | "time", mode: Config["mode"]): Child => ({
  display: "custom...",
  input: numberInput(config, key, { mode }),
});

function themeList(config: Config): Top {
  const names = [...THEME_NAMES].sort();
  const favorites = names.filter((name) => config.favThemes.includes(name));
  const ordered = [...favorites, ...names.filter((name) => !config.favThemes.includes(name))];
  return {
    id: "theme",
    display: "Theme...",
    icon: "palette",
    children: ordered.map((name) => ({
      display: spaced(name),
      patch: { theme: name, customTheme: false },
      active: config.theme === name,
      theme: name,
      fav: config.favThemes.includes(name),
    })),
  };
}

function favoriteCommands(config: Config): Top[] {
  if (config.customTheme) return [];
  const isFavorite = config.favThemes.includes(config.theme);
  return [
    isFavorite
      ? { id: "removeThemeFromFavorite", display: "Remove current theme from favorite", icon: "star", patch: { favThemes: config.favThemes.filter((name) => name !== config.theme) } }
      : { id: "addThemeToFavorite", display: "Add current theme to favorite", icon: "star", patch: { favThemes: [...config.favThemes, config.theme] } },
  ];
}

function funboxList(config: Config): Top {
  const toggled = (name: string): Config["funbox"] =>
    (config.funbox.includes(name as Config["funbox"][number]) ? config.funbox.filter((it) => it !== name) : [...config.funbox, name]) as Config["funbox"];
  return {
    id: "funbox",
    display: "Funbox...",
    alias: "fun box",
    icon: "gamepad",
    children: [
      { display: "none", alias: "off", patch: { funbox: [] }, active: false, sticky: true },
      ...FUNBOXES.filter((funbox) => config.funbox.includes(funbox.name as Config["funbox"][number]) || checkCompatibility(config.funbox, funbox.name)).map(
        (funbox) => ({
          display: spaced(funbox.name),
          alias: funbox.alias,
          patch: { funbox: toggled(funbox.name) },
          active: config.funbox.includes(funbox.name as Config["funbox"][number]),
          sticky: true,
        }),
      ),
    ],
  };
}

function fontFamilyList(config: Config): Top {
  const fonts = [...FONTS].sort((a, b) => a.display.localeCompare(b.display));
  return {
    id: "fontFamily",
    display: "Font family...",
    icon: "font",
    children: [
      ...fonts.map((font) => ({ display: font.display, patch: { fontFamily: font.name }, active: config.fontFamily === font.name, font: font.name })),
      {
        display: "Custom name...",
        parent: "Custom font",
        alias: "custom font name",
        input: { defaultValue: config.fontFamily.replace(/_/g, " "), apply: (raw) => (raw.trim() === "" ? null : { fontFamily: raw.trim().replace(/ /g, "_") }) },
      },
    ],
  };
}

function backgroundFilter(config: Config): Top {
  const names = ["blur...", "brightness...", "saturation...", "opacity..."];
  return {
    id: "customBackgroundFilter",
    display: "Custom background filter...",
    icon: "image",
    children: names.map((display, index) => ({
      display,
      input: {
        defaultValue: String(config.customBackgroundFilter[index]),
        apply: (raw) => {
          const value = numberOf(raw);
          if (value === null) return null;
          const next = [...config.customBackgroundFilter] as Config["customBackgroundFilter"];
          next[index] = value;
          return { customBackgroundFilter: next };
        },
      },
    })),
  };
}

function backgroundList(config: Config): Top {
  return {
    id: "customBackground",
    display: "Custom background...",
    icon: "image",
    children: [
      {
        display: "Custom background...",
        input: { defaultValue: config.customBackground, apply: (raw) => ({ customBackground: raw.trim() }) },
      },
      ...(config.customBackground === "" ? [] : [{ display: "Remove custom background", patch: { customBackground: "" } }]),
    ],
  };
}

const SOUND_CLICK = ["off", "click", "beep", "pop", "nk creams", "typewriter", "osu", "hitmarker", "sine", "sawtooth", "square", "triangle", "pentatonic", "wholetone", "fist fight", "rubber keys", "fart", "akko lavenders", "cherrymx black abs", "cherrymx black pbt", "cherrymx blue abs", "cherrymx blue pbt", "cherrymx brown pbt", "kalih box white", "razer green", "tealios v2", "trust gxt"];
const SOUND_ERROR = ["off", "damage", "triangle", "square", "punch miss"];
const VOLUME = new Map<number, string>([[0.1, "quiet"], [0.5, "medium"], [1, "loud"]]);
const QUOTE_LENGTHS: Config["quoteLength"][] = [[0, 1, 2, 3], [0], [1], [2], [3]];
const QUOTE_LENGTH_LABEL: Record<number, string> = { 0: "short", 1: "medium", 2: "long", 3: "thicc" };
const POWER_LEVEL = ["off", "mellow", "high", "ultra", "over 9000"];

// quote length rows are "include" style: active when every length of the row is selected
function quoteLength(config: Config): Top {
  const top = group(config, "quoteLength", { alias: "quotes", options: QUOTE_LENGTHS, label: (value) => (value.length === 4 ? "all" : (QUOTE_LENGTH_LABEL[value[0] ?? 0] ?? "")) });
  top.children?.forEach((child, index) => {
    child.active = (QUOTE_LENGTHS[index] ?? []).every((length) => config.quoteLength.includes(length));
  });
  return top;
}

function behaviorAndTest(config: Config): Top[] {
  return [
    group(config, "punctuation"),
    group(config, "numbers"),
    group(config, "mode"),
    group(config, "time", { options: [15, 30, 60, 120], also: { mode: "time" }, input: wordsInput(config, "time", "time") }),
    group(config, "words", { alias: "words", options: [10, 25, 50, 100], also: { mode: "words" }, input: wordsInput(config, "words", "words") }),
    quoteLength(config),
    group(config, "language", { options: LANGUAGES, label: spaced }),
    { id: "changeCustomModeText", display: "Change custom text", icon: "align-left", action: { type: "modal", id: "CustomText" } },
    { id: "practiseMissedWords", display: "Practice missed words (all time)", alias: "practise mistakes weak", icon: "exclamation-triangle", action: { type: "testEvent", name: PRACTISE_MISSED_EVENT } },
    { id: "viewQuoteSearchPopup", display: "Search for quotes", icon: "search", action: { type: "modal", id: "QuoteSearch", patch: { mode: "quote" } } },
    { id: "shareTestSettings", display: "Share test settings", icon: "share", action: { type: "modal", id: "ShareTestSettings" } },

    group(config, "resultSaving", { alias: "results practice incognito", optionAlias: (value) => (value ? "enabled" : "disabled") }),
    group(config, "difficulty"),
    group(config, "quickRestart"),
    group(config, "repeatQuotes"),
    group(config, "blindMode"),
    group(config, "alwaysShowWordsHistory"),
    group(config, "singleListCommandLine"),
    group(config, "minWpm", { display: "Minimum speed...", alias: "wpm", options: ["off"], input: customRow(config, "minWpm", "custom", "minWpmCustomSpeed") }),
    group(config, "minAcc", { display: "Minimum accuracy...", options: ["off"], input: customRow(config, "minAcc", "custom", "minAccCustom") }),
    {
      id: "minBurst",
      display: "Minimum word burst...",
      alias: "minimum",
      icon: "bomb",
      children: [
        { display: "off", patch: { minBurst: "off" }, active: config.minBurst === "off" },
        customRow(config, "minBurst", "fixed", "minBurstCustomSpeed", "fixed..."),
        customRow(config, "minBurst", "flex", "minBurstCustomSpeed", "flex..."),
      ],
    },
    group(config, "britishEnglish"),
    funboxList(config),
    {
      id: "customLayoutfluid",
      display: rootDisplay("customLayoutfluid"),
      icon: "tint",
      input: { defaultValue: config.customLayoutfluid.join(" "), apply: (raw) => ({ customLayoutfluid: raw.trim().split(" ") }) },
    },
    {
      id: "customPolyglot",
      display: rootDisplay("customPolyglot"),
      icon: "language",
      input: { defaultValue: config.customPolyglot.join(" "), apply: (raw) => ({ customPolyglot: raw.trim().split(" ") }) },
    },
  ];
}

function inputAndSound(config: Config): Top[] {
  return [
    group(config, "freedomMode"),
    group(config, "strictSpace"),
    group(config, "oppositeShiftMode"),
    group(config, "stopOnError"),
    group(config, "deleteOnError", { label: spaced }),
    group(config, "confidenceMode"),
    group(config, "quickEnd"),
    group(config, "indicateTypos"),
    group(config, "compositionDisplay"),
    group(config, "hideExtraLetters"),
    group(config, "lazyMode"),
    group(config, "layout", { options: ["default", ...LAYOUTS], label: (layout) => (layout === "default" ? "off" : spaced(layout)) }),
    group(config, "codeUnindentOnBackspace"),

    group(config, "soundVolume", {
      options: [0.1, 0.5, 1],
      label: (value) => VOLUME.get(value) ?? "custom...",
      input: { display: "custom...", input: numberInput(config, "soundVolume") },
    }),
    group(config, "playSoundOnClick", { display: "Sound on click...", alias: "play", label: (value) => SOUND_CLICK[value === "off" ? 0 : Number(value)] ?? value }),
    group(config, "playSoundOnError", { display: "Sound on error...", alias: "play", label: (value) => SOUND_ERROR[value === "off" ? 0 : Number(value)] ?? value }),
    group(config, "playTimeWarning", { alias: "sound", label: (value) => (value === "off" ? "off" : `${value} second${value !== "1" ? "s" : ""}`) }),

    group(config, "smoothCaret"),
    group(config, "caretStyle"),
    group(config, "paceCaret", {
      display: "Pace caret mode...",
      options: ["off", "pb", "tagPb", "last", "average", "daily"],
      label: (value) => (value === "tagPb" ? "tag pb" : value),
      input: customRow(config, "paceCaret", "custom", "paceCaretCustomSpeed"),
    }),
    group(config, "repeatedPace"),
    group(config, "paceCaretStyle"),
  ];
}

function appearance(config: Config): Top[] {
  const timerAlias = "timer speed wpm burst acc";
  return [
    group(config, "timerStyle", { alias: "timer", label: spaced }),
    group(config, "liveSpeedStyle", { alias: "wpm" }),
    group(config, "liveAccStyle", { alias: "wpm" }),
    group(config, "liveBurstStyle", { alias: "wpm" }),
    group(config, "timerColor", { display: "Live progress color...", alias: timerAlias, optionAlias: () => "timer" }),
    group(config, "timerOpacity", { display: "Live progress opacity...", alias: timerAlias, optionAlias: () => "timer" }),
    group(config, "highlightMode", { label: spaced }),
    group(config, "typedEffect"),
    group(config, "tapeMode"),
    inputTop(config, "tapeMargin"),
    group(config, "smoothLineScroll"),
    group(config, "showAllLines"),
    group(config, "typingSpeedUnit"),
    group(config, "alwaysShowDecimalPlaces"),
    group(config, "startGraphsAtZero"),
    inputTop(config, "maxLineWidth", { alias: "page" }),
    inputTop(config, "fontSize"),
    fontFamilyList(config),
    group(config, "keymapMode", { alias: "keyboard", optionAlias: (value) => (value === "react" ? "flash" : undefined) }),
    group(config, "keymapStyle", { alias: "keyboard", label: spaced }),
    group(config, "keymapLegendStyle", { alias: "keyboard" }),
    inputTop(config, "keymapSize", { alias: "keyboard" }),
    group(config, "keymapLayout", {
      alias: "keyboard",
      options: ["overrideSync", ...LAYOUTS],
      label: (layout) => (layout === "overrideSync" ? "emulator sync" : spaced(layout)),
      optionAlias: (layout) => (layout === "overrideSync" ? "default" : undefined),
    }),
    group(config, "keymapKeys", { alias: "keyboard", label: spaced }),
  ];
}

function themeAndRest(config: Config): Top[] {
  return [
    themeList(config),
    group(config, "customTheme"),
    group(config, "flipTestColors"),
    group(config, "colorfulMode"),
    ...favoriteCommands(config),
    backgroundList(config),
    group(config, "customBackgroundSize"),
    backgroundFilter(config),
    group(config, "randomTheme", { options: (ENUM_OPTIONS.randomTheme ?? []).filter((value) => value !== "custom") }),

    group(config, "showKeyTips", { display: "Key tips..." }),
    group(config, "showOutOfFocusWarning", { display: "Out of focus warning..." }),
    group(config, "capsLockWarning"),
    group(config, "showAverage"),
    group(config, "showPb", { alias: "pb" }),
    group(config, "monkeyPowerLevel", { alias: "powermode", label: (value) => POWER_LEVEL[value === "off" ? 0 : Number(value)] ?? value }),
    group(config, "monkey"),
    group(config, "ads"),

    { id: "viewTypingPage", display: "View Typing Page", alias: "navigate go to start begin type test", icon: "keyboard", action: { type: "route", path: "/" } },
    { id: "viewLeaderboards", display: "View Leaderboards", alias: "navigate go to", icon: "crown", action: { type: "route", path: "/leaderboards" } },
    { id: "viewAbout", display: "View About Page", alias: "navigate go to", icon: "info", action: { type: "route", path: "/about" } },
    { id: "viewSettings", display: "View Settings Page", alias: "navigate go to", icon: "cog", action: { type: "route", path: "/settings" } },
    { id: "viewAccount", display: "View Account Page", alias: "navigate go to stats", icon: "user", action: { type: "route", path: "/account" } },
    { id: "toggleFullscreen", display: "Toggle Fullscreen", icon: "expand", action: { type: "fullscreen" } },
    {
      id: "importSettingsJSON",
      display: "Import settings JSON",
      icon: "cog",
      alias: "import config",
      input: {
        defaultValue: "",
        apply: (raw) => {
          try {
            const patch = validSettingsPatch(JSON.parse(raw));
            return Object.keys(patch).length > 0 ? patch : null;
          } catch {
            return null;
          }
        },
      },
    },
    { id: "exportSettingsJSON", display: "Export settings JSON", icon: "cog", alias: "export config", input: { defaultValue: JSON.stringify(config), apply: () => ({}) } },
    { id: "clearNotifications", display: "Clear all notifications", icon: "trash-alt", alias: "dismiss", action: { type: "clearNotifications" } },
    { id: "joinDiscord", display: "Join the Discord server", icon: "users", action: { type: "url", url: "https://discord.gg/monkeytype" } },
  ];
}

/** every top level command in upstream order */
export function buildCommands(config: Config): Top[] {
  return [...behaviorAndTest(config), ...inputAndSound(config), ...appearance(config), ...themeAndRest(config)];
}

/** what the single list searches: "<parent> <display>", with the aliases of parent and row joined */
export function singleListEntries(tops: readonly Top[]): { top: Top; child?: Child; display: string; parent?: string; alias?: string }[] {
  return tops.flatMap((top) => {
    if (!top.children) return [{ top, display: top.display, alias: top.alias }];
    const parent = top.display.replace(/\s?\.\.\.$/, "");
    return top.children.map((child) => ({
      top,
      child,
      display: `${child.parent ?? parent} ${child.display}`,
      parent: child.parent ?? parent,
      alias: [top.alias, child.alias].filter(Boolean).join(" ") || undefined,
    }));
  });
}

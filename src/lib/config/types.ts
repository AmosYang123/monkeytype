// Monkeytype config types (ported from packages/schemas/src/configs.ts, GPL-3.0).

export type Mode = "time" | "words" | "quote" | "custom" | "zen";
export type Difficulty = "normal" | "expert" | "master";
export type SmoothCaret = "off" | "slow" | "medium" | "fast";
export type QuickRestart = "off" | "esc" | "tab" | "enter";
export type QuoteLength = -3 | -2 | 0 | 1 | 2 | 3;
export type CaretStyle = "off" | "default" | "block" | "outline" | "underline" | "carrot" | "banana" | "monkey";
export type ConfidenceMode = "off" | "on" | "max";
export type IndicateTypos = "off" | "below" | "replace" | "both";
export type CompositionDisplay = "off" | "below" | "replace";
export type TimerStyle = "off" | "bar" | "text" | "mini" | "flash_text" | "flash_mini";
export type LiveSpeedAccBurstStyle = "off" | "text" | "mini";
export type RandomTheme = "off" | "on" | "fav" | "light" | "dark" | "custom" | "auto";
export type TimerColor = "black" | "sub" | "text" | "main";
export type TimerOpacity = "0.25" | "0.5" | "0.75" | "1";
export type StopOnError = "off" | "word" | "letter";
export type DeleteOnError = "off" | "letter" | "letter_hard" | "word" | "word_hard";
export type KeymapMode = "off" | "static" | "react" | "next";
export type KeymapStyle = "staggered" | "alice" | "matrix" | "split" | "split_matrix" | "steno" | "steno_matrix";
export type KeymapLegendStyle = "lowercase" | "uppercase" | "blank" | "dynamic";
export type KeymapKeys = "minimal" | "minimal_numrow" | "full";
export type SingleListCommandLine = "manual" | "on";
export type PlaySoundOnError = "off" | "1" | "2" | "3" | "4";
export type PlaySoundOnClick =
  | "off"
  | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13"
  | "14" | "15" | "16" | "17" | "18" | "19" | "20" | "21" | "22" | "23" | "24" | "25" | "26";
export type PlayTimeWarning = "off" | "1" | "3" | "5" | "10";
export type PaceCaret = "off" | "average" | "pb" | "tagPb" | "last" | "custom" | "daily";
export type OnOff = "on" | "off";
export type AccountChart = [OnOff, OnOff, OnOff, OnOff];
export type MinimumWordsPerMinute = "off" | "custom";
export type MinimumAccuracy = "off" | "custom";
export type MinimumBurst = "off" | "fixed" | "flex";
export type HighlightMode = "off" | "letter" | "word" | "next_word" | "next_two_words" | "next_three_words";
export type TypedEffect = "keep" | "hide" | "fade" | "dots";
export type TapeMode = "off" | "letter" | "word";
export type TypingSpeedUnit = "wpm" | "cpm" | "wps" | "cps" | "wph";
export type Ads = "off" | "result" | "on" | "sellout";
export type RepeatQuotes = "off" | "typing";
export type OppositeShiftMode = "off" | "on" | "keymap";
export type CustomBackgroundSize = "cover" | "contain" | "max";
export type CustomBackgroundFilter = [number, number, number, number];
export type MonkeyPowerLevel = "off" | "1" | "2" | "3" | "4";
export type ShowAverage = "off" | "speed" | "acc" | "both";
export type CustomThemeColors = [string, string, string, string, string, string, string, string, string, string];

export type FunboxName =
  | "58008"
  | "mirror"
  | "upside_down"
  | "nausea"
  | "round_round_baby"
  | "simon_says"
  | "tts"
  | "choo_choo"
  | "arrows"
  | "rAnDoMcAsE"
  | "sPoNgEcAsE"
  | "capitals"
  | "layout_mirror"
  | "layoutfluid"
  | "earthquake"
  | "space_balls"
  | "gibberish"
  | "ascii"
  | "specials"
  | "plus_zero"
  | "plus_one"
  | "plus_two"
  | "plus_three"
  | "read_ahead_easy"
  | "read_ahead"
  | "read_ahead_hard"
  | "memory"
  | "nospace"
  | "poetry"
  | "wikipedia"
  | "weakspot"
  | "pseudolang"
  | "IPv4"
  | "IPv6"
  | "binary"
  | "hexadecimal"
  | "zipf"
  | "morse"
  | "crt"
  | "backwards"
  | "ddoouubblleedd"
  | "instant_messaging"
  | "underscore_spaces"
  | "ALL_CAPS"
  | "polyglot"
  | "asl"
  | "rot13"
  | "no_quit";

export type Config = {
  // test
  punctuation: boolean;
  numbers: boolean;
  words: number;
  time: number;
  mode: Mode;
  quoteLength: QuoteLength[];
  language: string;
  burstHeatmap: boolean;

  // behavior
  difficulty: Difficulty;
  quickRestart: QuickRestart;
  repeatQuotes: RepeatQuotes;
  resultSaving: boolean;
  blindMode: boolean;
  alwaysShowWordsHistory: boolean;
  singleListCommandLine: SingleListCommandLine;
  minWpm: MinimumWordsPerMinute;
  minWpmCustomSpeed: number;
  minAcc: MinimumAccuracy;
  minAccCustom: number;
  minBurst: MinimumBurst;
  minBurstCustomSpeed: number;
  britishEnglish: boolean;
  funbox: FunboxName[];
  customLayoutfluid: string[];
  customPolyglot: string[];

  // input
  freedomMode: boolean;
  strictSpace: boolean;
  oppositeShiftMode: OppositeShiftMode;
  stopOnError: StopOnError;
  deleteOnError: DeleteOnError;
  confidenceMode: ConfidenceMode;
  quickEnd: boolean;
  indicateTypos: IndicateTypos;
  compositionDisplay: CompositionDisplay;
  hideExtraLetters: boolean;
  lazyMode: boolean;
  layout: string;
  codeUnindentOnBackspace: boolean;

  // sound
  soundVolume: number;
  playSoundOnClick: PlaySoundOnClick;
  playSoundOnError: PlaySoundOnError;
  playTimeWarning: PlayTimeWarning;

  // caret
  smoothCaret: SmoothCaret;
  caretStyle: CaretStyle;
  paceCaret: PaceCaret;
  paceCaretCustomSpeed: number;
  paceCaretStyle: CaretStyle;
  repeatedPace: boolean;

  // appearance
  timerStyle: TimerStyle;
  liveSpeedStyle: LiveSpeedAccBurstStyle;
  liveAccStyle: LiveSpeedAccBurstStyle;
  liveBurstStyle: LiveSpeedAccBurstStyle;
  timerColor: TimerColor;
  timerOpacity: TimerOpacity;
  highlightMode: HighlightMode;
  typedEffect: TypedEffect;
  tapeMode: TapeMode;
  tapeMargin: number;
  smoothLineScroll: boolean;
  showAllLines: boolean;
  alwaysShowDecimalPlaces: boolean;
  typingSpeedUnit: TypingSpeedUnit;
  startGraphsAtZero: boolean;
  maxLineWidth: number;
  fontSize: number;
  fontFamily: string;
  keymapMode: KeymapMode;
  keymapLayout: string;
  keymapStyle: KeymapStyle;
  keymapLegendStyle: KeymapLegendStyle;
  keymapKeys: KeymapKeys;
  keymapSize: number;

  // theme
  flipTestColors: boolean;
  colorfulMode: boolean;
  customBackground: string;
  customBackgroundSize: CustomBackgroundSize;
  customBackgroundFilter: CustomBackgroundFilter;
  autoSwitchTheme: boolean;
  themeLight: string;
  themeDark: string;
  randomTheme: RandomTheme;
  favThemes: string[];
  theme: string;
  customTheme: boolean;
  customThemeColors: CustomThemeColors;

  // hide elements
  showKeyTips: boolean;
  showOutOfFocusWarning: boolean;
  capsLockWarning: boolean;
  showAverage: ShowAverage;
  showPb: boolean;

  // other (hidden)
  accountChart: AccountChart;
  monkey: boolean;
  monkeyPowerLevel: MonkeyPowerLevel;

  // ads
  ads: Ads;
};

export type ConfigKey = keyof Config;

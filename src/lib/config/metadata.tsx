// Settings page model (ported from monkeytype config/metadata.tsx + SettingsPage.tsx, GPL-3.0).
// Titles, icons, descriptions and button labels follow the live settings page.
import type { ReactNode } from "react";
import type { FaIconName } from "@/components/icons";
import {
  COMPOSITION_DISPLAY_OPTIONS,
  CONFIDENCE_MODE_OPTIONS,
  DELETE_ON_ERROR_OPTIONS,
  DIFFICULTY_OPTIONS,
  HIGHLIGHT_MODE_OPTIONS,
  INDICATE_TYPOS_OPTIONS,
  KEYMAP_KEYS_OPTIONS,
  KEYMAP_LEGEND_STYLE_OPTIONS,
  KEYMAP_MODE_OPTIONS,
  KEYMAP_STYLE_OPTIONS,
  LIVE_STYLE_OPTIONS,
  MIN_BURST_OPTIONS,
  MIN_ACC_OPTIONS,
  MIN_WPM_OPTIONS,
  OPPOSITE_SHIFT_MODE_OPTIONS,
  PACE_CARET_OPTIONS,
  PLAY_SOUND_ON_CLICK_OPTIONS,
  PLAY_SOUND_ON_ERROR_OPTIONS,
  PLAY_TIME_WARNING_OPTIONS,
  QUICK_RESTART_OPTIONS,
  RANDOM_THEME_OPTIONS,
  REPEAT_QUOTES_OPTIONS,
  SHOW_AVERAGE_OPTIONS,
  SINGLE_LIST_COMMAND_LINE_OPTIONS,
  SMOOTH_CARET_OPTIONS,
  STOP_ON_ERROR_OPTIONS,
  TAPE_MODE_OPTIONS,
  TIMER_COLOR_OPTIONS,
  TIMER_OPACITY_OPTIONS,
  TIMER_STYLE_OPTIONS,
  TYPED_EFFECT_OPTIONS,
  TYPING_SPEED_UNIT_OPTIONS,
  ADS_OPTIONS,
  VISIBLE_CARET_STYLE_OPTIONS,
} from "./options";
import type { ConfigKey } from "./types";

export type SettingGroupId =
  | "behavior"
  | "input"
  | "sound"
  | "caret"
  | "appearance"
  | "theme"
  | "hideElements"
  | "dangerZone";

type ButtonOption = { value: string | number | boolean; label: string };

export type CustomSettingId =
  | "funbox"
  | "fontFamily"
  | "customBackground"
  | "customBackgroundFilters"
  | "theme"
  | "keymap"
  | "importExport"
  | "updateCookies"
  | "theRest"
  | "resetSettings"
  | "customLayoutfluid"
  | "customPolyglot";

export type SettingControl =
  | { kind: "buttons"; options: ButtonOption[] }
  // showInputWhen is the config value of the buttons' key that shows the input; "*" means always shown
  | {
      kind: "buttonsWithInput";
      options: ButtonOption[];
      inputKey: ConfigKey;
      showInputWhen: string;
      min?: number;
      max?: number;
      step?: number;
    }
  | { kind: "number"; min?: number; max?: number; step?: number }
  | { kind: "range"; min: number; max: number; step: number }
  | { kind: "select"; source: "language" | "layout" | "keymapLayout"; multiple?: false }
  | { kind: "multiSelect"; source: "language" | "layout" }
  | { kind: "custom"; id: CustomSettingId };

export type SettingMeta = {
  id: string;
  configKey?: ConfigKey;
  title: string;
  icon: FaIconName;
  description: ReactNode;
  control: SettingControl;
  requiresRestart?: boolean;
  // only show the setting while config[key] !== notValue
  showWhen?: { key: ConfigKey; notValue: string };
};

export type SettingsGroup = {
  id: SettingGroupId;
  title: string;
  icon: FaIconName;
  settings: SettingMeta[];
};

const spaced = (value: string): string => value.replace(/_/g, " ");

function optionList(values: readonly (string | number)[], labels: Record<string, string>): ButtonOption[] {
  return values.map((value) => ({ value, label: labels[value] ?? spaced(String(value)) }));
}

function buttons(values: readonly (string | number)[], labels: Record<string, string> = {}): SettingControl {
  return { kind: "buttons", options: optionList(values, labels) };
}

// buttons plus a number input for another config key (always visible on the live page)
function withInput(
  values: readonly (string | number)[],
  inputKey: ConfigKey,
  limits: { min?: number; max?: number },
  labels: Record<string, string> = {},
): SettingControl {
  return { kind: "buttonsWithInput", options: optionList(values, labels), inputKey, showInputWhen: "*", ...limits };
}

const onOff = (): SettingControl => ({
  kind: "buttons",
  options: [
    { value: false, label: "off" },
    { value: true, label: "on" },
  ],
});

const showHide = (): SettingControl => ({
  kind: "buttons",
  options: [
    { value: false, label: "hide" },
    { value: true, label: "show" },
  ],
});

const customControl = (id: CustomSettingId): SettingControl => ({ kind: "custom", id });

// config key -> setting; most settings share the config key as their id
function setting(
  configKey: ConfigKey,
  title: string,
  icon: FaIconName,
  description: ReactNode,
  control: SettingControl,
  extra: Partial<SettingMeta> = {},
): SettingMeta {
  return { id: configKey, configKey, title, icon, description, control, ...extra };
}

const CLICK_SOUND_LABELS: Record<string, string> = {
  "1": "click",
  "2": "beep",
  "3": "pop",
  "4": "nk creams",
  "5": "typewriter",
  "6": "osu",
  "7": "hitmarker",
  "8": "sine",
  "9": "sawtooth",
  "10": "square",
  "11": "triangle",
  "12": "pentatonic",
  "13": "wholetone",
  "14": "fist fight",
  "15": "rubber keys",
  "16": "fart",
  "17": "akko lavenders",
  "18": "cherrymx black abs",
  "19": "cherrymx black pbt",
  "20": "cherrymx blue abs",
  "21": "cherrymx blue pbt",
  "22": "cherrymx brown pbt",
  "23": "kalih box white",
  "24": "razer green",
  "25": "tealios v2",
  "26": "trust gxt",
};

const KEYMAP_SHOWN = { key: "keymapMode", notValue: "off" } as const;

export const SETTINGS_GROUPS: SettingsGroup[] = [
  {
    id: "behavior",
    title: "behavior",
    icon: "tools",
    settings: [
      setting(
        "difficulty",
        "difficulty",
        "star",
        "Normal is the classic typing test experience. Expert fails the test if you submit (press space) an incorrect word. Master fails if you press a single incorrect key (meaning you have to achieve 100% accuracy).",
        buttons(DIFFICULTY_OPTIONS),
        { requiresRestart: true },
      ),
      setting(
        "quickRestart",
        "quick restart",
        "redo-alt",
        'Press tab, esc or enter to quickly restart the test, or to quickly jump to the test page. These options disable tab navigation on most parts of the website. Using the "esc" option will move opening the commandline to the tab key.',
        buttons(QUICK_RESTART_OPTIONS),
      ),
      setting(
        "repeatQuotes",
        "repeat quotes",
        "sync-alt",
        "This setting changes the restarting behavior when typing in quote mode. Changing it to 'typing' will repeat the quote if you restart while typing.",
        buttons(REPEAT_QUOTES_OPTIONS),
      ),
      setting(
        "blindMode",
        "blind mode",
        "eye-slash",
        "No errors or incorrect words are highlighted. Helps you to focus on raw speed. If enabled, quick end is recommended.",
        {
          kind: "buttons",
          // the "on" label is a blank (ensp-like) space in monkeytype so both buttons have the same height
          options: [
            { value: false, label: "off" },
            { value: true, label: " " },
          ],
        },
      ),
      setting(
        "alwaysShowWordsHistory",
        "always show words history",
        "align-left",
        "This option will automatically show the words history at the end of the test. Can cause slight lag with a lot of words.",
        onOff(),
      ),
      setting(
        "singleListCommandLine",
        "single list command line",
        "list",
        "When enabled, it will show the command line with all commands in a single list instead of submenu arrangements. Selecting 'manual' will expose all commands only after typing >.",
        buttons(SINGLE_LIST_COMMAND_LINE_OPTIONS),
      ),
      setting(
        "minWpm",
        "min speed",
        "bomb",
        "Automatically fails a test if your speed falls below a threshold.",
        withInput(MIN_WPM_OPTIONS, "minWpmCustomSpeed", { min: 0 }),
        { requiresRestart: true },
      ),
      setting(
        "minAcc",
        "min accuracy",
        "bomb",
        "Automatically fails a test if your accuracy falls below a threshold.",
        withInput(MIN_ACC_OPTIONS, "minAccCustom", { min: 0, max: 100 }),
        { requiresRestart: true },
      ),
      setting(
        "minBurst",
        "min word burst",
        "bomb",
        "Automatically fails a test if your raw for a single word falls below this threshold. Selecting 'flex' allows for this threshold to automatically decrease for longer words.",
        withInput(MIN_BURST_OPTIONS, "minBurstCustomSpeed", { min: 0 }),
        { requiresRestart: true },
      ),
      setting(
        "britishEnglish",
        "british english",
        "language",
        "When enabled, the website will use the British spelling instead of American. Note that this might not replace all words correctly. If you find any issues, please let us know.",
        onOff(),
        { requiresRestart: true },
      ),
      setting(
        "language",
        "language",
        "language",
        "Change in which language you want to type.",
        { kind: "select", source: "language" },
        { requiresRestart: true },
      ),
      setting(
        "funbox",
        "funbox",
        "gamepad",
        "These are special modes that change the website in some special way (by altering the word generation, behavior of the website or the looks). Give each one of them a try!",
        customControl("funbox"),
        { requiresRestart: true },
      ),
      setting(
        "customLayoutfluid",
        "custom layoutfluid",
        "tint",
        "Select which layouts you want the layoutfluid funbox to cycle through.",
        { kind: "multiSelect", source: "layout" },
        { requiresRestart: true },
      ),
      setting(
        "customPolyglot",
        "polyglot languages",
        "language",
        "Select which languages you want the polyglot funbox to use.",
        { kind: "multiSelect", source: "language" },
      ),
    ],
  },
  {
    id: "input",
    title: "input",
    icon: "keyboard",
    settings: [
      setting(
        "freedomMode",
        "freedom mode",
        "feather-alt",
        "Allows you to delete any word, even if it was typed correctly.",
        onOff(),
      ),
      setting(
        "strictSpace",
        "strict space",
        "minus",
        "Pressing space at the beginning of a word will insert a space character when this mode is enabled.",
        onOff(),
        { requiresRestart: true },
      ),
      setting(
        "oppositeShiftMode",
        "opposite shift mode",
        "exchange-alt",
        'This mode will force you to use opposite shift keys for shifting. Using an incorrect one will count as an error. This feature ignores keys in locations B, Y, and ^ because many people use the other hand for those keys. If you\'re using external software to emulate your layout (including QMK), you should use the "keymap" mode - the standard "on" will not work. This will enforce opposite shift based on the "keymap layout" setting.',
        buttons(OPPOSITE_SHIFT_MODE_OPTIONS),
      ),
      setting(
        "stopOnError",
        "stop on error",
        "hand-paper",
        "Letter mode will stop input when pressing any incorrect letters. Word mode will not allow you to continue to the next word until you correct all mistakes.",
        buttons(STOP_ON_ERROR_OPTIONS),
        { requiresRestart: true },
      ),
      setting(
        "deleteOnError",
        "delete on error",
        "eraser",
        "Letter mode will automatically delete the incorrect character and the one before it. Word mode will delete the entire current word. The hard variants will additionally jump back to the previous word if you make a mistake on the first character.",
        buttons(DELETE_ON_ERROR_OPTIONS),
      ),
      setting(
        "confidenceMode",
        "confidence mode",
        "backspace",
        "When enabled, you will not be able to go back to previous words to fix mistakes. When turned up to the max, you won't be able to backspace at all.",
        buttons(CONFIDENCE_MODE_OPTIONS),
      ),
      setting(
        "quickEnd",
        "quick end",
        "step-forward",
        "This only applies to the words mode - when enabled, the test will end as soon as the last word has been typed, even if it's incorrect. When disabled, you need to manually confirm the last incorrect entry with a space.",
        onOff(),
      ),
      setting(
        "indicateTypos",
        "indicate typos",
        "exclamation",
        'Shows typos that you\'ve made. "Below" shows what you typed below the letters, "replace" will replace the letters with the ones you typed and "both" will do the same as replace and below, but it will show the correct letters below your mistakes.',
        buttons(INDICATE_TYPOS_OPTIONS),
      ),
      setting(
        "hideExtraLetters",
        "hide extra letters",
        "eye-slash",
        "Hides extra letters. This will completely avoid words jumping lines (due to changing width), but might feel a bit confusing when you press a key and nothing happens.",
        onOff(),
      ),
      setting(
        "compositionDisplay",
        "composition display",
        "language",
        'Change how composition is displayed. "off" will just underline the letter if composition is active. "below" will show the composed character below the test. "replace" will replace the letter in the test with the composed character.',
        buttons(COMPOSITION_DISPLAY_OPTIONS),
      ),
      setting(
        "lazyMode",
        "lazy mode",
        "couch",
        "Replaces accents / diacritics / special characters with their normal letter equivalents.",
        onOff(),
        { requiresRestart: true },
      ),
      setting(
        "layout",
        "layout",
        "keyboard",
        "With this setting you can emulate other layouts. This setting is best kept off, as it can break things like dead keys and alt layers.",
        { kind: "select", source: "layout" },
        { requiresRestart: true },
      ),
      setting(
        "codeUnindentOnBackspace",
        "code unindent on backspace",
        "code",
        "Automatically go back to the previous line when deleting line leading tab characters. Only works in code languages.",
        onOff(),
        { requiresRestart: true },
      ),
    ],
  },
  {
    id: "sound",
    title: "sound",
    icon: "volume-up",
    settings: [
      setting(
        "soundVolume",
        "sound volume",
        "volume-down",
        "Change the volume of the sound effects.",
        { kind: "range", min: 0, max: 1, step: 0.1 },
      ),
      setting(
        "playSoundOnClick",
        "play sound on click",
        "volume-up",
        "Plays a short sound when you press a key.",
        buttons(PLAY_SOUND_ON_CLICK_OPTIONS, CLICK_SOUND_LABELS),
      ),
      setting(
        "playSoundOnError",
        "play sound on error",
        "volume-mute",
        "Plays a short sound if you press an incorrect key or press space too early.",
        buttons(PLAY_SOUND_ON_ERROR_OPTIONS, { "1": "damage", "2": "triangle", "3": "square", "4": "missed punch" }),
      ),
      setting(
        "playTimeWarning",
        "play time warning",
        "exclamation-triangle",
        "Play a short warning sound if you are close to the end of a timed test.",
        buttons(PLAY_TIME_WARNING_OPTIONS, { "1": "1 second", "3": "3 seconds", "5": "5 seconds", "10": "10 seconds" }),
      ),
    ],
  },
  {
    id: "caret",
    title: "caret",
    icon: "i-cursor",
    settings: [
      setting(
        "smoothCaret",
        "smooth caret",
        "i-cursor",
        "The caret will move smoothly between letters and words.",
        buttons(SMOOTH_CARET_OPTIONS),
      ),
      setting(
        "caretStyle",
        "caret style",
        "i-cursor",
        "Change the style of the caret during the test.",
        buttons(VISIBLE_CARET_STYLE_OPTIONS),
      ),
      setting(
        "paceCaret",
        "pace caret",
        "i-cursor",
        "Displays a second caret that moves at constant speed. The 'average' option averages the speed of last 10 results. The 'tag pb' option takes the highest PB of any active tag. The 'daily' option takes the highest speed of the last 24 hours.",
        withInput(PACE_CARET_OPTIONS, "paceCaretCustomSpeed", { min: 0 }, { tagPb: "tag pb" }),
      ),
      setting(
        "repeatedPace",
        "repeated pace",
        "i-cursor",
        "When repeating a test, a pace caret will automatically be enabled for one test with the speed of your previous test. It does not override the pace caret if it's already enabled.",
        onOff(),
      ),
      setting(
        "paceCaretStyle",
        "pace caret style",
        "i-cursor",
        "Change the style of the pace caret during the test.",
        buttons(VISIBLE_CARET_STYLE_OPTIONS),
      ),
    ],
  },
  {
    id: "appearance",
    title: "appearance",
    icon: "palette",
    settings: [
      setting(
        "timerStyle",
        "live progress style",
        "chart-pie",
        'Change the style of the timer/word count during a test. "Flash" styles will briefly show the timer in timed modes every 15 seconds.',
        buttons(TIMER_STYLE_OPTIONS),
      ),
      setting(
        "liveSpeedStyle",
        "live speed style",
        "tachometer-alt",
        "Change the style of the live speed displayed during the test.",
        buttons(LIVE_STYLE_OPTIONS),
      ),
      setting(
        "liveAccStyle",
        "live accuracy style",
        "tachometer-alt",
        "Change the style of the live accuracy displayed during the test.",
        buttons(LIVE_STYLE_OPTIONS),
      ),
      setting(
        "liveBurstStyle",
        "live word burst style",
        "tachometer-alt",
        "Change the style of the live burst speed displayed during the test.",
        buttons(LIVE_STYLE_OPTIONS),
      ),
      setting(
        "timerColor",
        "timer color",
        "chart-pie",
        "Change the color of the progress, live speed, accuracy and burst text.",
        buttons(TIMER_COLOR_OPTIONS),
      ),
      setting(
        "timerOpacity",
        "timer opacity",
        "chart-pie",
        "Change the opacity of the progress, live speed, burst and accuracy text.",
        buttons(TIMER_OPACITY_OPTIONS),
      ),
      setting(
        "highlightMode",
        "highlight mode",
        "highlighter",
        "Change what is highlighted during the test.",
        buttons(HIGHLIGHT_MODE_OPTIONS),
      ),
      setting(
        "typedEffect",
        "typed effect",
        "eye",
        "Change how typed words are shown.",
        buttons(TYPED_EFFECT_OPTIONS),
      ),
      setting(
        "tapeMode",
        "tape mode",
        "tape",
        "Only shows one line which scrolls horizontally. Setting this to 'word' will make it scroll after every word and 'letter' will scroll after every keypress. Works best with smooth line scroll enabled and a monospace font.",
        buttons(TAPE_MODE_OPTIONS),
      ),
      setting(
        "tapeMargin",
        "tape margin",
        "tape",
        "When in tape mode, set the carets position from the left edge of the typing test as a percentage (for example, 50% centers it).",
        { kind: "number", min: 10, max: 90 },
      ),
      setting(
        "smoothLineScroll",
        "smooth line scroll",
        "align-left",
        "When enabled, the line transition will be animated.",
        onOff(),
      ),
      setting(
        "showAllLines",
        "show all lines",
        "align-left",
        "When enabled, the website will show all lines for word, custom and quote mode tests - otherwise the lines will be limited to 3, and will automatically scroll. Using this could cause the timer text and live speed to not be visible.",
        onOff(),
      ),
      setting(
        "alwaysShowDecimalPlaces",
        "always show decimal places",
        "ellipsis-h",
        "Always shows decimal places for values on the result page, without the need to hover over the stats.",
        onOff(),
      ),
      setting(
        "typingSpeedUnit",
        "typing speed unit",
        "tachometer-alt",
        "Display typing speed in the specified unit.",
        buttons(TYPING_SPEED_UNIT_OPTIONS),
      ),
      setting(
        "startGraphsAtZero",
        "start graphs at zero",
        "chart-line",
        "Force graph axis to always start at zero, no matter what the data is. Turning this off may exaggerate the value changes.",
        onOff(),
      ),
      setting(
        "maxLineWidth",
        "max line width",
        "text-width",
        "Change the maximum width of the typing test, measured in characters. Setting this to 0 will align the words to the edges of the content area.",
        // schema: 0 (full width) or 20-1000
        { kind: "number", min: 0, max: 1000 },
      ),
      setting("fontSize", "font size", "font", "Change the font size of the test words.", { kind: "number", min: 0 }),
      setting(
        "fontFamily",
        "font family",
        "font",
        <>
          Change the font family used by the website. Using a local font will override your choice.
          <br />
          <div className="mt-2 text-xs">
            Note: Local fonts are not sent to the server and will not persist across devices.
          </div>
        </>,
        customControl("fontFamily"),
      ),
      setting(
        "keymapMode",
        "keymap mode",
        "keyboard",
        "Displays your current layout while taking a test. React shows what you pressed and Next shows what you need to press next.",
        buttons(KEYMAP_MODE_OPTIONS),
      ),
      // keymap sub-settings: only shown while keymap mode is on
      setting(
        "keymapLayout",
        "keymap layout",
        "keyboard",
        "Controls which layout is displayed on the keymap.",
        { kind: "select", source: "keymapLayout" },
        { showWhen: KEYMAP_SHOWN },
      ),
      setting("keymapStyle", "keymap style", "keyboard", "", buttons(KEYMAP_STYLE_OPTIONS), {
        showWhen: KEYMAP_SHOWN,
      }),
      setting("keymapLegendStyle", "keymap legend style", "keyboard", "", buttons(KEYMAP_LEGEND_STYLE_OPTIONS), {
        showWhen: KEYMAP_SHOWN,
      }),
      setting("keymapKeys", "keymap keys", "keyboard", "", buttons(KEYMAP_KEYS_OPTIONS), {
        showWhen: KEYMAP_SHOWN,
      }),
      setting(
        "keymapSize",
        "keymap size",
        "keyboard",
        "Change the size of the keymap.",
        { kind: "range", min: 0.5, max: 3.5, step: 0.1 },
        { showWhen: KEYMAP_SHOWN },
      ),
    ],
  },
  {
    id: "theme",
    title: "theme",
    icon: "brush",
    settings: [
      setting(
        "flipTestColors",
        "flip test colors",
        "adjust",
        "By default, typed text is brighter than the future text. When enabled, the colors will be flipped and the future text will be brighter than the already typed text.",
        onOff(),
      ),
      setting(
        "colorfulMode",
        "colorful mode",
        "fill-drip",
        "When enabled, the test words will use the main color, instead of the text color, making the website more colorful.",
        onOff(),
      ),
      setting(
        "customBackground",
        "custom background",
        "link",
        <>
          Set an image url or local image to be a custom background image. Local image always take priority over the
          image url. Cover fits the image to cover the screen. Contain fits the image to be fully visible. Max fits the
          image corner to corner.
          <br />
          <div className="mt-2 text-xs">
            Note: The local image is stored in your browser&apos;s local storage and will not be uploaded to the server.
            This means that if you clear your browser&apos;s local storage or use a different browser, the local image
            will be lost.
          </div>
        </>,
        customControl("customBackground"),
      ),
      // the size buttons (cover / contain / max) are part of the customBackground control
      {
        id: "customBackgroundFilter",
        configKey: "customBackgroundFilter",
        title: "custom background filters",
        icon: "image",
        description: "Apply various effects to the custom background.",
        control: customControl("customBackgroundFilters"),
        showWhen: { key: "customBackground", notValue: "" },
      },
      setting(
        "autoSwitchTheme",
        "auto switch theme",
        "palette",
        "Enabling this will automatically switch the theme between light and dark depending on the system theme.",
        onOff(),
      ),
      setting(
        "randomTheme",
        "random theme",
        "palette",
        "After completing a test, the theme will be set to a random one. The random themes are not saved to your config. If set to 'favorite' only favorite themes will be randomized. If set to 'light' or 'dark', only presets with light or dark background colors will be randomized, respectively. If set to 'auto' dark or light themes are used, depending on your system theme. If set to 'custom', custom themes will be randomized.",
        buttons(RANDOM_THEME_OPTIONS, { fav: "favorite" }),
      ),
      setting(
        "theme",
        "theme",
        "palette",
        "Completely change the look and feel of the website by picking one of the presets, or by creating your own completely custom theme.",
        customControl("theme"),
      ),
    ],
  },
  {
    id: "hideElements",
    title: "hide elements",
    icon: "eye-slash",
    settings: [
      setting("showKeyTips", "show key tips", "question", "Shows the keybind tips at the bottom of the page.", showHide()),
      setting(
        "showOutOfFocusWarning",
        "show out of focus warning",
        "exclamation",
        "Shows an out of focus reminder after 1 second of being 'out of focus' (not being able to type).",
        showHide(),
      ),
      setting(
        "capsLockWarning",
        "caps lock warning",
        "exclamation-triangle",
        "Displays a warning when caps lock is on.",
        showHide(),
      ),
      setting(
        "showAverage",
        "show average",
        "chart-bar",
        "Displays your average speed and/or accuracy over the last 10 tests.",
        buttons(SHOW_AVERAGE_OPTIONS),
      ),
      setting(
        "ads",
        "ads",
        "ad",
        'You can disable or enable ads at any time. "Result" will show one ad on the result page, "on" will add floating vertical banners, and "sellout" will add multiple ads on every page.',
        buttons(ADS_OPTIONS),
      ),
    ],
  },
  {
    id: "dangerZone",
    title: "danger zone",
    icon: "exclamation-triangle",
    settings: [
      {
        id: "importExport",
        title: "import/export settings",
        icon: "sliders-h",
        description: "Import or export the settings as JSON.",
        control: customControl("importExport"),
      },
      {
        id: "cookies",
        title: "update cookie preferences",
        icon: "cookie-bite",
        description:
          "If you changed your mind about which cookies you consent to, you can change your preferences here.",
        control: customControl("updateCookies"),
      },
      {
        id: "theRest",
        title: "the rest",
        icon: "sliders-h",
        description: "Niche settings that only affect minor functionality. Most people will never need to touch these.",
        control: customControl("theRest"),
      },
      {
        id: "resetSettings",
        title: "reset settings",
        icon: "undo",
        description: (
          <div>
            Resets settings to the default (but doesn&apos;t touch your tags and presets).
            <br />
            <div className="text-error">You can&apos;t undo this!</div>
          </div>
        ),
        control: customControl("resetSettings"),
      },
    ],
  },
];

"use client";

import { useRef } from "react";
import { useConfig } from "@/components/ConfigProvider";
import { Fa } from "@/components/icons";
import { ModalButton } from "@/components/modals/ModalButton";
import { cn } from "@/lib/cn";
import { THEME_NAMES } from "@/lib/config/lists";
import { getConfig, setConfig, setConfigs } from "@/lib/config/store";
import { notify } from "@/lib/notifications";
import { THEMES, themeLabel } from "@/lib/theme";

const GRID = "grid grid-cols-[repeat(auto-fill,minmax(17rem,1fr))] gap-2";

/** [config index, label] in the order the source lays the pickers out. */
const PICKERS: [number, string][] = [
  [0, "background"],
  [1, "main"],
  [3, "sub"],
  [5, "text"],
  [2, "caret"],
  [4, "sub alt"],
  [6, "error"],
  [7, "extra error"],
];
const COLORFUL_PICKERS: [number, string][] = [
  [8, "error"],
  [9, "extra error"],
];

function ThemeBubbles({
  bg,
  main,
  sub,
  text,
  className,
}: Record<"bg" | "main" | "sub" | "text", string> & { className?: string }) {
  return (
    <div
      className={cn(
        "grid grid-flow-col place-content-center gap-1 rounded-full p-1",
        className,
      )}
      style={{ background: bg }}
    >
      {[main, sub, text].map((c, i) => (
        <div
          key={i}
          className="size-[1em] rounded-full"
          style={{ background: c }}
        />
      ))}
    </div>
  );
}

function ThemeButton({
  name,
  active,
  fav,
}: {
  name: string;
  active: boolean;
  fav: boolean;
}) {
  const t = THEMES[name];
  if (!t) return null;
  return (
    <div
      className={cn(
        "group/theme relative grid cursor-pointer grid-cols-[1fr_auto_1fr] justify-between rounded-lg border-0 p-1 ring-4 transition-[opacity,color,background,box-shadow] duration-125 hover:ring-(--tmain)",
        "bg-(--tbg) text-(--tmain)",
        active ? "ring-(--tmain)" : "ring-transparent",
      )}
      style={
        {
          "--tbg": t.bg,
          "--tmain": t.main,
          "--ttext": t.text,
        } as React.CSSProperties
      }
    >
      <button
        type="button"
        className="col-span-3 grid grid-cols-subgrid cursor-pointer"
        onClick={() => {
          if (active) return;
          // like the source, picking a preset turns auto switch off
          setConfigs({
            theme: name,
            customTheme: false,
            ...(getConfig().autoSwitchTheme ? { autoSwitchTheme: false } : {}),
          });
        }}
      >
        <span />
        <span>{themeLabel(name)}</span>
        <ThemeBubbles
          {...t}
          className={cn(
            "mr-1 place-self-end self-center opacity-0 transition-opacity duration-125 group-hover/theme:opacity-100",
            active && "opacity-100",
          )}
        />
      </button>
      <button
        type="button"
        aria-label={`${fav ? "remove from favorites" : "add to favorites"}: ${themeLabel(name)}`}
        className={cn(
          "absolute top-1 left-1 grid place-self-start rounded-full bg-(--tbg) p-1 opacity-0 transition-[opacity,color] duration-125 group-hover/theme:opacity-100 focus:opacity-100 hover:text-(--ttext)",
          fav && "opacity-100",
        )}
        onClick={(e) => {
          e.stopPropagation();
          const favs = getConfig().favThemes;
          setConfig(
            "favThemes",
            fav ? favs.filter((f) => f !== name) : [...favs, name],
          );
        }}
      >
        <Fa icon="star" variant={fav ? "solid" : "regular"} />
      </button>
    </div>
  );
}

function Presets() {
  const { theme, customTheme, favThemes } = useConfig();
  const favs = THEME_NAMES.filter((n) => favThemes.includes(n));
  const rest = THEME_NAMES.filter((n) => !favThemes.includes(n));
  const button = (n: string) => (
    <ThemeButton
      key={n}
      name={n}
      active={!customTheme && theme === n}
      fav={favThemes.includes(n)}
    />
  );
  return (
    <div className="grid gap-4">
      {favs.length > 0 && (
        <>
          <div className={GRID}>{favs.map(button)}</div>
          <div className="h-px bg-sub-alt" />
        </>
      )}
      <div className={GRID}>{rest.map(button)}</div>
    </div>
  );
}

function Picker({ index, label }: { index: number; label: string }) {
  const { customThemeColors } = useConfig();
  const color = customThemeColors[index];
  const colorInput = useRef<HTMLInputElement>(null);
  const update = (value: string) => {
    const next = [...getConfig().customThemeColors];
    next[index] = value;
    setConfig("customThemeColors", next as typeof customThemeColors);
  };
  return (
    <div className="grid w-full grid-cols-[1fr_1fr_min-content] items-center gap-2">
      <div>{label}</div>
      <input
        key={color}
        className="w-full"
        type="text"
        aria-label={`${label} color`}
        defaultValue={color}
        onBlur={(e) => {
          if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(e.currentTarget.value))
            update(e.currentTarget.value);
          else e.currentTarget.value = color;
        }}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
      />
      <div className="grid">
        <input
          ref={colorInput}
          type="color"
          aria-label={`${label} color picker`}
          value={/^#[0-9a-f]{6}$/i.test(color) ? color : "#000000"}
          onChange={(e) => update(e.currentTarget.value)}
          className="pointer-events-none col-[1/1] row-[1/1] m-0 h-full w-0 p-0 opacity-0"
        />
        <button
          type="button"
          aria-label={`pick ${label} color`}
          className="col-[1/1] row-[1/1] cursor-pointer rounded-lg border-0 p-2 text-bg"
          style={{
            background: index === 0 ? customThemeColors[4] : color,
            color:
              index === 0 || index === 4
                ? customThemeColors[5]
                : customThemeColors[0],
          }}
          onClick={() => colorInput.current?.click()}
        >
          <Fa icon="palette" />
        </button>
      </div>
    </div>
  );
}

async function shareCustomTheme() {
  const link = `${window.location.origin}?customTheme=${btoa(JSON.stringify({ c: getConfig().customThemeColors }))}`;
  try {
    await navigator.clipboard.writeText(link);
    notify("URL Copied to clipboard", { level: "success" });
  } catch {
    notify(
      "Looks like we couldn't copy the link straight to your clipboard. Please copy it manually.",
      {
        durationMs: 5000,
      },
    );
    window.prompt("Custom theme URL", link);
  }
}

function loadFromPreset() {
  const t = THEMES[getConfig().theme];
  if (!t) {
    notify("Current preset theme not found. How is this possible?", {
      level: "error",
    });
    return;
  }
  const {
    bg,
    main,
    caret,
    sub,
    subAlt,
    text,
    error,
    errorExtra,
    colorfulError,
    colorfulErrorExtra,
  } = t;
  setConfig("customThemeColors", [
    bg,
    main,
    caret,
    sub,
    subAlt,
    text,
    error,
    errorExtra,
    colorfulError,
    colorfulErrorExtra,
  ] as never);
}

function Customs() {
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {PICKERS.map(([i, label]) => (
          <Picker key={i} index={i} label={label} />
        ))}
        <div className="col-span-1 text-sub md:col-span-2">
          when colorful mode is enabled:
        </div>
        {COLORFUL_PICKERS.map(([i, label]) => (
          <Picker key={i} index={i} label={label} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <ModalButton onClick={loadFromPreset}>load from preset</ModalButton>
        <ModalButton onClick={() => void shareCustomTheme()}>share</ModalButton>
        {/* ponytail: "save as new" / saved custom themes need an account; plain "save" is automatic here */}
        <ModalButton
          onClick={() =>
            notify("Custom theme colors saved", { level: "success" })
          }
        >
          save
        </ModalButton>
      </div>
    </div>
  );
}

function ThemeSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-[7rem_1fr] items-center gap-2">
      <div>{label}</div>
      <select
        aria-label={`${label} theme`}
        className="w-full cursor-pointer rounded-lg border-0 bg-sub-alt p-2 text-text"
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
      >
        {THEME_NAMES.map((n) => (
          <option key={n} value={n}>
            {themeLabel(n)}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Light/dark theme pickers shown while "auto switch theme" is on. */
function AutoSwitchPickers() {
  const { themeLight, themeDark } = useConfig();
  return (
    <div className="mb-4 grid grid-cols-1 gap-8 md:grid-cols-2">
      <ThemeSelect
        label="light"
        value={themeLight}
        onChange={(v) => setConfig("themeLight", v)}
      />
      <ThemeSelect
        label="dark"
        value={themeDark}
        onChange={(v) => setConfig("themeDark", v)}
      />
    </div>
  );
}

export function ThemeSetting() {
  const { customTheme, autoSwitchTheme } = useConfig();
  return (
    <div className="grid w-full gap-4">
      {autoSwitchTheme && <AutoSwitchPickers />}
      <div className="grid w-full grid-cols-2 gap-2">
        <ModalButton
          active={!customTheme}
          onClick={() => setConfig("customTheme", false)}
        >
          preset
        </ModalButton>
        <ModalButton
          active={customTheme}
          onClick={() => setConfig("customTheme", true)}
        >
          custom
        </ModalButton>
      </div>
      {customTheme ? <Customs /> : <Presets />}
    </div>
  );
}

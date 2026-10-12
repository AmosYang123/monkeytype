"use client";

import { useEffect, useState } from "react";
import { useConfig } from "@/components/ConfigProvider";
import { Fa } from "@/components/icons";
import { ModalButton } from "@/components/modals/ModalButton";
import { ScrollToTop } from "@/components/settings/ScrollToTop";
import { ThemeSetting } from "@/components/settings/ThemeSetting";
import { SETTINGS_GROUPS, type SettingMeta } from "@/lib/config/metadata";
import { FONTS, FUNBOXES, LANGUAGES, LAYOUTS } from "@/lib/config/lists";
import { setConfigs, setConfig, resetConfig } from "@/lib/config/store";
import { checkCompatibility } from "@/lib/funbox-validation";
import { matchingIndexes, textOf } from "@/lib/settings-search";
import { showModal } from "@/lib/modals";
import { notify } from "@/lib/notifications";
import { validLocalBackground } from "@/lib/settings-theme";

const inputClass = "w-full rounded-lg border-0 bg-sub-alt p-2 text-text";
// upstream input[type=range]: sub-alt track, main-color thumb 25% wide, 1.25em tall
const rangeClass =
  "h-5 w-full cursor-pointer appearance-none rounded-lg bg-sub-alt p-0 focus-visible:shadow-[0_0_0_0.1rem_var(--bg-color),0_0_0_0.2rem_var(--text-color)] focus-visible:outline-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-1/4 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-lg [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:bg-main [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-1/4 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-lg [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-main";
const spaced = (value: string) => value.replaceAll("_", " ");
// settings whose options span the full row under the description upstream
const WIDE_SETTINGS = new Set([
  "playSoundOnClick",
  "playSoundOnError",
  "playTimeWarning",
  "caretStyle",
  "paceCaretStyle",
  "timerStyle",
  "highlightMode",
  "randomTheme",
  "theme",
  "funbox",
  "fontFamily",
]);

function CustomControl({ id }: { id: string }) {
  const config = useConfig();
  if (id === "theme") return <ThemeSetting />;
  if (id === "fontFamily")
    return (
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {FONTS.map((font) => (
          <ModalButton
            key={font.name}
            active={config.fontFamily === font.name}
            onClick={() => setConfig("fontFamily", font.name)}
          >
            {font.display}
          </ModalButton>
        ))}
        <input
          className={inputClass}
          aria-label="custom font family"
          placeholder="custom font"
          defaultValue={config.fontFamily}
          onBlur={(event) => setConfig("fontFamily", event.currentTarget.value)}
        />
      </div>
    );
  if (id === "funbox")
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {FUNBOXES.map((box) => (
          <ModalButton
            key={box.name}
            active={config.funbox.some((name) => name === box.name)}
            onClick={() => {
              const next = config.funbox.some((name) => name === box.name)
                ? config.funbox.filter((name) => name !== box.name)
                : [...config.funbox, box.name];
              if (checkCompatibility(next))
                setConfigs({ funbox: next as typeof config.funbox });
              else
                notify("These funboxes cannot be combined", {
                  level: "error",
                });
            }}
          >
            {spaced(box.name)}
          </ModalButton>
        ))}
      </div>
    );
  if (id === "customBackground")
    return (
      <div className="grid gap-2">
        <input
          aria-label="background image URL"
          key={config.customBackground}
          className={inputClass}
          placeholder="image URL"
          defaultValue={config.customBackground}
          onBlur={(event) =>
            setConfig("customBackground", event.currentTarget.value)
          }
        />
        <input
          aria-label="local background image"
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (!file) return;
            if (!/^image\/(?:png|jpe?g|gif|webp|avif|bmp)$/i.test(file.type)) {
              notify("Choose a PNG, JPEG, GIF, WebP, AVIF or BMP image", {
                level: "error",
              });
              return;
            }
            if (file.size > 3000000) {
              notify("Choose an image smaller than 3 MB", { level: "error" });
              return;
            }
            const reader = new FileReader();
            reader.onerror = () =>
              notify("Could not read image", { level: "error" });
            reader.onload = () => {
              if (typeof reader.result === "string") {
                try {
                  localStorage.setItem("localBackground", reader.result);
                  window.dispatchEvent(new Event("mt:background-changed"));
                } catch {
                  notify("Could not save the image in browser storage", {
                    level: "error",
                  });
                }
              }
            };
            reader.readAsDataURL(file);
          }}
        />
        <div className="grid grid-cols-4 gap-2">
          {(["cover", "contain", "max"] as const).map((size) => (
            <ModalButton
              key={size}
              active={config.customBackgroundSize === size}
              onClick={() => setConfig("customBackgroundSize", size)}
            >
              {size}
            </ModalButton>
          ))}
          <ModalButton
            onClick={() => {
              setConfig("customBackground", "");
              try {
                localStorage.removeItem("localBackground");
                window.dispatchEvent(new Event("mt:background-changed"));
              } catch {
                notify("Could not clear the image from browser storage", {
                  level: "error",
                });
              }
            }}
          >
            clear
          </ModalButton>
        </div>
      </div>
    );
  if (id === "customBackgroundFilters")
    return (
      <div className="grid gap-2">
        {["blur", "brightness", "saturate", "opacity"].map((name, index) => (
          <label
            key={name}
            className="grid grid-cols-[7rem_1fr] items-center gap-2"
          >
            {name}
            <input
              aria-label={name}
              type="range"
              min="0"
              max={index === 0 ? 20 : index === 3 ? 1 : 3}
              step="0.1"
              value={config.customBackgroundFilter[index]}
              onChange={(event) => {
                const next = [
                  ...config.customBackgroundFilter,
                ] as typeof config.customBackgroundFilter;
                next[index] = Number(event.currentTarget.value);
                setConfig("customBackgroundFilter", next);
              }}
            />
          </label>
        ))}
      </div>
    );
  if (id === "resetSettings")
    return (
      <ModalButton
        onClick={() => {
          if (window.confirm("Reset all settings to defaults?")) {
            resetConfig();
            try {
              localStorage.removeItem("localBackground");
              window.dispatchEvent(new Event("mt:background-changed"));
            } catch {
              notify(
                "Settings reset, but the local image could not be cleared",
                { level: "error" },
              );
            }
          }
        }}
      >
        reset settings
      </ModalButton>
    );
  return (
    <ModalButton
      onClick={() =>
        showModal(
          id === "importExport"
            ? "ImportExportSettings"
            : id === "updateCookies"
              ? "Cookies"
              : "TheRest",
        )
      }
    >
      {id === "importExport"
        ? "import / export"
        : id === "updateCookies"
          ? "update cookie preferences"
          : "open"}
    </ModalButton>
  );
}

function Control({ setting, wide }: { setting: SettingMeta; wide: boolean }) {
  const config = useConfig();
  const control = setting.control;
  const key = setting.configKey;
  if (control.kind === "custom") return <CustomControl id={control.id} />;
  if (!key) return null;
  if (control.kind === "buttons" || control.kind === "buttonsWithInput")
    return (
      <div className="grid gap-2">
        {control.kind === "buttonsWithInput" &&
          (control.showInputWhen === "*" ||
            config[key] === control.showInputWhen) && (
            <input
              aria-label={setting.title + " custom value"}
              className={inputClass}
              type="number"
              min={control.min}
              max={control.max}
              step={control.step ?? "any"}
              value={Number(config[control.inputKey])}
              onChange={(event) => {
                if (event.currentTarget.value !== "")
                  setConfigs({
                    [control.inputKey]: Number(event.currentTarget.value),
                  });
              }}
            />
          )}
        <div
          className={
            wide
              ? "grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5"
              : control.options.length > 5
                ? "grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4"
                : "grid auto-cols-fr grid-flow-col gap-2"
          }
        >
          {control.options.map((option) => (
            <ModalButton
              key={String(option.value)}
              active={config[key] === option.value}
              onClick={() => setConfigs({ [key]: option.value })}
            >
              {option.label}
            </ModalButton>
          ))}
        </div>
      </div>
    );
  if (control.kind === "range")
    return (
      <div className="grid grid-cols-[auto_1fr] items-center gap-4">
        <span className="text-text">{Number(config[key]).toFixed(1)}</span>
        <input
          aria-label={setting.title}
          className={rangeClass}
          type="range"
          min={control.min}
          max={control.max}
          step={control.step}
          value={Number(config[key])}
          onChange={(event) =>
            setConfigs({ [key]: Number(event.currentTarget.value) })
          }
        />
      </div>
    );
  if (control.kind === "number")
    return (
      <input
        aria-label={setting.title}
        className={inputClass}
        type="number"
        min={control.min}
        max={control.max}
        step={control.step ?? "any"}
        value={Number(config[key])}
        onChange={(event) => {
          if (event.currentTarget.value !== "")
            setConfigs({ [key]: Number(event.currentTarget.value) });
        }}
      />
    );
  const options =
    control.source === "language"
      ? LANGUAGES
      : control.source === "keymapLayout"
        ? ["overrideSync", ...LAYOUTS]
        : LAYOUTS;
  const multiple = control.kind === "multiSelect";
  return (
    <select
      aria-label={setting.title}
      className={inputClass}
      multiple={multiple}
      value={config[key] as string | string[]}
      onChange={(event) =>
        setConfigs({
          [key]: multiple
            ? Array.from(
                event.currentTarget.selectedOptions,
                (option) => option.value,
              )
            : event.currentTarget.value,
        })
      }
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {spaced(option)}
        </option>
      ))}
    </select>
  );
}

const settings = SETTINGS_GROUPS.flatMap((group) => group.settings);
const haystacks = settings.map((setting) =>
  (setting.title + " " + textOf(setting.description)).toLowerCase(),
);

export function SettingsPage() {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const config = useConfig();
  const [hasLocalBackground, setHasLocalBackground] = useState(false);
  useEffect(() => {
    const read = () => {
      try {
        setHasLocalBackground(
          Boolean(
            validLocalBackground(localStorage.getItem("localBackground")),
          ),
        );
      } catch {
        setHasLocalBackground(false);
      }
    };
    read();
    window.addEventListener("mt:background-changed", read);
    return () => window.removeEventListener("mt:background-changed", read);
  }, []);
  const matches = matchingIndexes(haystacks, query);
  return (
    <main className="full-width content-grid" id="settings">
      <div className="mb-8 grid gap-8">
        <nav
          aria-label="settings sections"
          className="mx-auto flex flex-wrap justify-center gap-x-6 gap-y-2 rounded-lg bg-sub-alt px-6 py-2.5 text-xs"
        >
          {SETTINGS_GROUPS.map((group) => (
            <a
              key={group.id}
              href={"#group_" + group.id}
              className="text-sub hover:text-text"
            >
              <Fa icon={group.icon} /> {group.title}
            </a>
          ))}
        </nav>
        <p className="text-center text-sub">
          tip: You can also change all these settings quickly using the
          command line ( <kbd>escape</kbd> or <kbd>ctrl + shift + p</kbd> )
        </p>
        <div className="relative">
          <Fa
            icon="search"
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sub"
          />
          <input
            aria-label="search settings"
            className={inputClass + " py-2.5 pl-10"}
            placeholder="search settings"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
          />
        </div>
      </div>
      {SETTINGS_GROUPS.map((group) => {
        const visible = group.settings.filter(
          (setting) =>
            matches.has(settings.indexOf(setting)) &&
            (!setting.showWhen ||
              config[setting.showWhen.key] !== setting.showWhen.notValue ||
              (setting.id === "customBackgroundFilter" && hasLocalBackground)),
        );
        if (!visible.length) return null;
        const closed = !query && collapsed.includes(group.id);
        return (
          <section
            id={"group_" + group.id}
            key={group.id}
            className="mb-16 scroll-mt-8"
          >
            <button
              type="button"
              aria-expanded={!closed}
              className="mb-8 flex cursor-pointer items-center gap-4 text-4xl text-sub hover:text-text"
              onClick={() =>
                setCollapsed((current) =>
                  current.includes(group.id)
                    ? current.filter((id) => id !== group.id)
                    : [...current, group.id],
                )
              }
            >
              <Fa icon={closed ? "chevron-right" : "chevron-down"} />
              {group.title}
            </button>
            {!closed && (
              <div className="grid gap-8">
                {visible.map((setting) => {
                  const wide = WIDE_SETTINGS.has(setting.id);
                  return (
                    <div
                      key={setting.id}
                      id={setting.id}
                      className={
                        "group grid items-start gap-x-8 gap-y-2 " +
                        (wide ? "" : "md:grid-cols-[2fr_1fr]")
                      }
                    >
                      <div className="flex items-center gap-2 text-sub md:col-span-full">
                        <Fa icon={setting.icon} />
                        {setting.title}
                        <a
                          href={"#" + setting.id}
                          aria-label={"link to " + setting.title}
                          className="text-sub opacity-0 group-hover:opacity-100 hover:text-text focus-visible:opacity-100"
                        >
                          <Fa icon="link" />
                        </a>
                      </div>
                      <div className="text-text">{setting.description}</div>
                      <Control setting={setting} wide={wide} />
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
      {matches.size === 0 && (
        <p className="text-center text-sub">no settings found</p>
      )}
      <ScrollToTop />
    </main>
  );
}

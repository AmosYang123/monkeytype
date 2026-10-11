"use client";

import type { ReactNode } from "react";
import { Fa, type FaIconName } from "@/components/icons";
import { useTest } from "@/components/TestProvider";
import { cn } from "@/lib/cn";
import { MODE_OPTIONS } from "@/lib/typing";
import type { TestConfig as TestConfigState } from "@/types/test";

const MODES: { mode: TestConfigState["mode"]; icon: FaIconName }[] = [
  { mode: "time", icon: "clock" },
  { mode: "words", icon: "font" },
  { mode: "quote", icon: "quote-left" },
  { mode: "zen", icon: "mountain" },
  { mode: "custom", icon: "wrench" },
];

const TOGGLES: { key: "punctuation" | "numbers"; icon: FaIconName }[] = [
  { key: "punctuation", icon: "at" },
  { key: "numbers", icon: "hashtag" },
];

const CARD = "rounded-lg bg-sub-alt px-[var(--horizontal-padding)]";
const BTN = "mt-button py-[var(--vertical-padding)] px-[var(--horizontal-padding)]";

type OptionProps = {
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
};

function Option({ active, disabled, onClick, children }: OptionProps) {
  return (
    <button type="button" className={cn(BTN, active && "active")} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

export function TestConfig() {
  const { state, focusMode, setConfig, focusInput } = useTest();
  const { config, finished } = state;
  const hidden = config.mode === "zen" ? "w-0 overflow-hidden opacity-0 pointer-events-none" : "";

  const apply = (patch: Partial<TestConfigState>) => {
    setConfig(patch);
    focusInput();
  };

  let options: ReactNode = null;
  if (config.mode === "time") {
    options = (
      <>
        {MODE_OPTIONS.time.map((n) => (
          <Option key={n} active={config.time === n} disabled={finished} onClick={() => apply({ time: n })}>
            {n}
          </Option>
        ))}
        <Option disabled={finished} onClick={focusInput}>
          <Fa icon="tools" />
        </Option>
      </>
    );
  } else if (config.mode === "words") {
    options = (
      <>
        {MODE_OPTIONS.words.map((n) => (
          <Option key={n} active={config.words === n} disabled={finished} onClick={() => apply({ words: n })}>
            {n}
          </Option>
        ))}
        <Option disabled={finished} onClick={focusInput}>
          <Fa icon="tools" />
        </Option>
      </>
    );
  } else if (config.mode === "quote") {
    options = (
      <>
        {MODE_OPTIONS.quote.map((q) => (
          <Option key={q} active={config.quoteLength === q} disabled={finished} onClick={() => apply({ quoteLength: q })}>
            {q}
          </Option>
        ))}
        <Option disabled={finished} onClick={focusInput}>
          <Fa icon="search" />
        </Option>
      </>
    );
  } else if (config.mode === "custom") {
    options = (
      <Option disabled={finished} onClick={focusInput}>
        change
      </Option>
    );
  }

  return (
    <div
      className={cn(
        "relative flex justify-center transition-opacity duration-[125ms] ease-[cubic-bezier(.4,0,.2,1)]",
        (focusMode || finished) && "opacity-0",
      )}
    >
      <div
        className={cn(
          "relative mx-auto mb-8 hidden w-max grid-cols-[1fr_auto_1fr] text-[length:var(--font-size)] leading-tight md:grid",
          "[--card-gap:.25em] [--font-size:.5em] [--horizontal-padding:.4em] [--vertical-padding:.5rem]",
          "md:[--card-gap:1em] md:[--font-size:.6em] md:[--horizontal-padding:.45em] md:[--vertical-padding:.75rem]",
          "lg:[--font-size:.75em] lg:[--horizontal-padding:.5em]",
          "xl:[--card-gap:2em] xl:[--horizontal-padding:1em]",
        )}
      >
        <div className={cn("mr-[var(--card-gap)] w-max place-self-end", hidden)}>
          <div className={cn(CARD, "block")}>
            {TOGGLES.map(({ key, icon }) => (
              <Option
                key={key}
                active={config[key]}
                disabled={finished || config.mode === "quote"}
                onClick={() => apply({ [key]: !config[key] })}
              >
                <Fa icon={icon} />
                {key}
              </Option>
            ))}
          </div>
        </div>
        <div className={cn(CARD, "z-[2] block")}>
          {MODES.map(({ mode, icon }) => (
            <Option key={mode} active={config.mode === mode} disabled={finished} onClick={() => apply({ mode })}>
              <Fa icon={icon} />
              {mode}
            </Option>
          ))}
        </div>
        <div className={cn("relative grid w-max", hidden)}>
          <div className={cn(CARD, "ml-[var(--card-gap)] grid grid-flow-col")}>{options}</div>
        </div>
      </div>
      <button
        type="button"
        className="mt-button mx-auto gap-2 bg-sub-alt px-4 py-2 text-base leading-5 md:hidden"
        disabled={finished}
      >
        <Fa icon="cog" fw={false} />
        test settings
      </button>
    </div>
  );
}

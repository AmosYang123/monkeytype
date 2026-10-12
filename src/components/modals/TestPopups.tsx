"use client";

import { useEffect, useState } from "react";
import { AnimatedModal } from "@/components/ui/AnimatedModal";
import { useTest } from "@/components/TestProvider";
import { useConfig } from "@/components/ConfigProvider";
import { getConfig, setConfigs } from "@/lib/config/store";
import {
  deleteSavedText,
  getCustomText,
  getSavedTexts,
  saveText,
  setCustomText,
  type CustomTextLimitMode,
  type CustomTextMode,
} from "@/lib/custom-text";
import { hideModal, showModal } from "@/lib/modals";
import { notify } from "@/lib/notifications";
import {
  emitTestEvent,
  PRACTISE_WORDS_EVENT,
  setSelectedQuoteId,
  type PractiseWordsDetail,
} from "@/lib/test-events";
import {
  parseQuotes,
  parseTestAmount,
  readSharedTestSettings,
  testSettingsUrl,
} from "@/lib/test-settings";
import { loadLanguage, quoteLanguage } from "@/lib/languages";
import type { Quote } from "@/types/test";

const INPUT =
  "w-full rounded-lg bg-sub-alt p-3 text-text outline-none focus:ring-2 focus:ring-main";
const BUTTON =
  "rounded-lg bg-sub-alt px-4 py-2 text-sub hover:bg-text hover:text-bg";

function AmountModal({ words = false }: { words?: boolean }) {
  const { setConfig, focusInput } = useTest();
  const config = useConfig();
  const [value, setValue] = useState("");
  const id = words ? "CustomWordAmount" : "TestDuration";
  return (
    <AnimatedModal
      id={id}
      afterHide={focusInput}
      title={words ? "Custom word amount" : "Test duration"}
      focusFirstInput="select"
      afterShow={() => setValue(String(words ? config.words : config.time))}
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          const amount = parseTestAmount(value);
          if (amount === null) {
            notify("Enter a whole number between 0 and 100000", {
              level: "error",
            });
            return;
          }
          setConfig(words ? { words: amount } : { time: amount });
          hideModal(id);
          focusInput();
        }}
      >
        <label>
          {words ? "words" : "seconds"}
          <input
            aria-label={words ? "Custom word amount" : "Test duration seconds"}
            className={INPUT}
            type="number"
            min="0"
            max="100000"
            step="1"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </label>
        <p className="text-xs text-sub">
          0 means infinite. End an infinite test with shift + enter.
        </p>
        <button className={BUTTON}>save</button>
      </form>
    </AnimatedModal>
  );
}

function CustomTextModal() {
  const { focusInput } = useTest();
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<CustomTextMode>("repeat");
  const [limit, setLimit] = useState("0");
  const [limitMode, setLimitMode] = useState<CustomTextLimitMode>("word");
  const [filter, setFilter] = useState("");
  const [saved, setSaved] = useState<Record<string, string>>({});
  const [delimiter, setDelimiter] = useState(false);
  const init = () => {
    const current = getCustomText();
    setText(current.text.join(current.pipeDelimiter ? "|" : " "));
    setMode(current.mode);
    setLimit(String(current.limit.value));
    setLimitMode(current.limit.mode);
    setDelimiter(current.pipeDelimiter);
    setSaved(getSavedTexts());
  };
  return (
    <AnimatedModal
      id="CustomText"
      afterHide={focusInput}
      title="Custom text"
      modalClass="max-w-3xl"
      focusFirstInput
      afterShow={init}
    >
      <textarea
        aria-label="Custom text"
        className={`${INPUT} min-h-48`}
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        {(["repeat", "random", "shuffle"] as const).map((option) => (
          <button
            key={option}
            className={`${BUTTON} ${mode === option ? "text-main" : ""}`}
            onClick={() => setMode(option)}
          >
            {option}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={delimiter}
          onChange={(event) => setDelimiter(event.target.checked)}
        />
        use | as word delimiter
      </label>
      <label>
        limit (0 uses all text)
        <input
          className={INPUT}
          type="number"
          min="0"
          max="100000"
          value={limit}
          onChange={(event) => setLimit(event.target.value)}
        />
      </label>
      <label>
        limit mode
        <select
          aria-label="Custom text limit mode"
          className={INPUT}
          value={limitMode}
          onChange={(event) =>
            setLimitMode(event.target.value as CustomTextLimitMode)
          }
        >
          <option value="word">words</option>
          <option value="time">seconds</option>
          <option value="section">section</option>
        </select>
      </label>
      <div className="flex gap-2">
        <input
          aria-label="Word filter"
          className={INPUT}
          placeholder="words containing..."
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        />
        <button
          className={BUTTON}
          onClick={() =>
            setText(
              text
                .split(delimiter ? "|" : /\s+/)
                .filter((word) =>
                  word.toLowerCase().includes(filter.toLowerCase()),
                )
                .join(delimiter ? "|" : " "),
            )
          }
        >
          filter
        </button>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input
          aria-label="Saved text name"
          placeholder="name"
          className={INPUT}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button
          className={BUTTON}
          onClick={() => {
            if (!name.trim() || !text.trim()) {
              notify("Enter text and a name", { level: "error" });
              return;
            }
            saveText(name.trim(), text);
            setSaved(getSavedTexts());
            if (getSavedTexts()[name.trim()] === text)
              notify("Text saved", { level: "success" });
            else
              notify("Could not save text in browser storage", {
                level: "error",
              });
          }}
        >
          save text
        </button>
      </div>
      {Object.entries(saved).map(([key, value]) => (
        <div className="flex gap-2" key={key}>
          <button
            className={`${BUTTON} flex-1 text-left`}
            onClick={() => {
              setText(value);
              setName(key);
            }}
          >
            {key}
          </button>
          <button
            aria-label={`Delete ${key}`}
            className={BUTTON}
            onClick={() => {
              deleteSavedText(key);
              setSaved(getSavedTexts());
            }}
          >
            delete
          </button>
        </div>
      ))}
      <button
        className={BUTTON}
        onClick={async () => {
          try {
            const language = await loadLanguage(getConfig().language);
            setText(
              Array.from(
                { length: 50 },
                () =>
                  language.words[
                    Math.floor(Math.random() * language.words.length)
                  ],
              ).join(" "),
            );
          } catch {
            notify("Could not load words", { level: "error" });
          }
        }}
      >
        generate 50 words
      </button>
      <button
        className={BUTTON}
        onClick={() => {
          const amount = parseTestAmount(limit);
          const words = text
            .trim()
            .split(delimiter ? "|" : /\s+/)
            .map((word) => word.trim())
            .filter(Boolean);
          if (!words.length || amount === null) {
            notify("Enter some text and a valid word limit", {
              level: "error",
            });
            return;
          }
          setCustomText({
            text: words,
            mode,
            pipeDelimiter: delimiter,
            limit: { value: amount, mode: limitMode },
          });
          setConfigs({ mode: "custom" });
          hideModal("CustomText");
          focusInput();
        }}
      >
        ok
      </button>
    </AnimatedModal>
  );
}

function QuoteSearchModal() {
  const { restart } = useTest();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/quotes/${quoteLanguage(getConfig().language)}.json`,
      );
      if (!response.ok) throw new Error("Unavailable");
      const data: unknown = await response.json();
      setQuotes(parseQuotes(data));
    } catch {
      setQuotes([]);
      setError("Quotes are unavailable for this language.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <AnimatedModal
      id="QuoteSearch"
      title="Search quotes"
      modalClass="max-w-3xl"
      focusFirstInput
      afterShow={() => {
        void load();
      }}
    >
      <input
        className={INPUT}
        aria-label="Search quotes"
        placeholder="text, source or quote id"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="grid max-h-96 gap-2 overflow-auto">
        {loading && <p>loading...</p>}
        {error && <p>{error}</p>}
        {quotes
          .filter((quote) =>
            `${quote.text} ${quote.source} ${quote.id}`
              .toLowerCase()
              .includes(query.toLowerCase()),
          )
          .slice(0, 100)
          .map((quote) => (
            <button
              key={quote.id}
              className={`${BUTTON} text-left`}
              onClick={() => {
                setSelectedQuoteId(quote.id);
                setConfigs({ mode: "quote", quoteLength: [-2] });
                restart();
                hideModal("QuoteSearch");
              }}
            >
              <div>{quote.text}</div>
              <div className="mt-2 text-xs">
                {quote.source} · {quote.id}
              </div>
            </button>
          ))}
      </div>
    </AnimatedModal>
  );
}

export function TestPopups() {
  const { focusInput } = useTest();
  const [share, setShare] = useState("");
  const [missed, setMissed] = useState<PractiseWordsDetail["missed"]>("words");
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const shared = readSharedTestSettings(window.location.search);
    if (Object.keys(shared).length) setConfigs(shared);
  }, []);
  return (
    <>
      <AmountModal />
      <AmountModal words />
      <CustomTextModal />
      <QuoteSearchModal />
      <AnimatedModal
        id="ShareTestSettings"
        title="Share test settings"
        afterShow={() =>
          setShare(testSettingsUrl(window.location.origin, getConfig()))
        }
        focusFirstInput="select"
      >
        <input
          aria-label="Shared test URL"
          readOnly
          value={share}
          className={INPUT}
        />
        <button
          className={BUTTON}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(share);
              notify("Link copied", { level: "success" });
            } catch {
              notify("Select the link and copy it manually", {
                level: "error",
              });
            }
          }}
        >
          copy
        </button>
      </AnimatedModal>
      <AnimatedModal id="PractiseWords" title="Practise words" afterHide={focusInput}>
        <label>
          missed words
          <select
            className={INPUT}
            value={missed}
            onChange={(event) =>
              setMissed(event.target.value as PractiseWordsDetail["missed"])
            }
          >
            <option value="off">off</option>
            <option value="words">words</option>
            <option value="biwords">word pairs</option>
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={slow}
            onChange={(event) => setSlow(event.target.checked)}
          />{" "}
          include slow words
        </label>
        <button
          className={BUTTON}
          onClick={() => {
            if (missed === "off" && !slow) {
              notify("Select missed or slow words", { level: "error" });
              return;
            }
            emitTestEvent<PractiseWordsDetail>(PRACTISE_WORDS_EVENT, {
              missed,
              slow,
            });
            hideModal("PractiseWords");
          }}
        >
          practise
        </button>
      </AnimatedModal>
      <AnimatedModal id="MobileTestConfig" title="Test settings">
        <div className="flex flex-wrap gap-2">
          {(["time", "words", "quote", "zen", "custom"] as const).map(
            (mode) => (
              <button
                key={mode}
                className={BUTTON}
                onClick={() => {
                  setConfigs({ mode });
                }}
              >
                {mode}
              </button>
            ),
          )}
        </div>
        <button
          className={BUTTON}
          onClick={() =>
            showModal(
              getConfig().mode === "words"
                ? "CustomWordAmount"
                : "TestDuration",
            )
          }
        >
          custom duration / words
        </button>
        <button className={BUTTON} onClick={() => showModal("CustomText")}>
          custom text
        </button>
        <button className={BUTTON} onClick={() => showModal("QuoteSearch")}>
          quote search
        </button>
      </AnimatedModal>
    </>
  );
}

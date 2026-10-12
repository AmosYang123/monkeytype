"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatedModal } from "@/components/ui/AnimatedModal";
import { fontCssFamily, previewTheme, useConfig } from "@/components/ConfigProvider";
import { Fa, type FaIconName } from "@/components/icons";
import { useTest } from "@/components/TestProvider";
import {
  buildCommands,
  singleListEntries,
  type Action,
  type Child,
  type InputSpec,
  type Top,
} from "@/lib/commandline-commands";
import { findMatchingCommands, parseSearch } from "@/lib/commandline-search";
import {
  COMMANDLINE_OPEN_EVENT,
  type CommandlineOpenDetail,
} from "@/lib/commandline-bridge";
import { getConfig, setConfigs } from "@/lib/config/store";
import type { Config } from "@/lib/config/types";
import { cn } from "@/lib/cn";
import { getOpenModal, hideModal, showModal, useIsModalOpen } from "@/lib/modals";
import { clearAllNotifications } from "@/lib/notifications";
import { THEMES } from "@/lib/theme";
import { validSettingsPatch } from "@/lib/test-settings";

type Row = {
  top: Top;
  child?: Child;
  display: string;
  /** label before the chevron in the single list */
  parent?: string;
  alias?: string;
};

type InputMode = { title: string; spec: InputSpec; icon: FaIconName };

// monkeytype caps the rendered rows (MAX_RENDERED_COMMANDS)
const MAX_ROWS = 1000;

export function CommandLine() {
  const router = useRouter();
  const { focusInput } = useTest();
  const config = useConfig();
  const isOpen = useIsModalOpen("Commandline");
  const [group, setGroup] = useState("");
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState<InputMode | null>(null);
  const [invalid, setInvalid] = useState(false);
  const lastSearch = useRef("");
  const field = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  // true between the open hotkey and the field getting focus: keys typed meanwhile are captured here
  const opening = useRef(false);
  const tops = useMemo(() => buildCommands(config), [config]);
  const restore = () => previewTheme(null);
  const startIndex = (id: string): number =>
    Math.max(0, tops.find((top) => top.id === id)?.children?.findIndex((child) => child.active) ?? 0);
  useEffect(() => {
    const open = (event: Event) => {
      const subgroup = (event as CustomEvent<CommandlineOpenDetail>).detail?.subgroup;
      const id = subgroup === "themes" ? "theme" : (subgroup ?? "");
      const top = buildCommands(getConfig()).find((it) => it.id === id && it.children);
      setGroup(top ? id : "");
      setQuery("");
      setIndex(Math.max(0, top?.children?.findIndex((child) => child.active) ?? 0));
      setInput(null);
      setInvalid(false);
      opening.current = true;
      setTimeout(() => (opening.current = false), 400);
      showModal("Commandline");
    };
    const hotkey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || getOpenModal()) return;
      if (
        (event.key === "Escape" && getConfig().quickRestart !== "esc") ||
        ((event.ctrlKey || event.metaKey) &&
          event.shiftKey &&
          event.key.toLowerCase() === "p")
      ) {
        event.preventDefault();
        open(new Event(COMMANDLINE_OPEN_EVENT));
      }
    };
    // runs before the typing test sees the key: the field is not mounted yet right after opening
    const capture = (event: KeyboardEvent) => {
      if (!opening.current || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key.length === 1) setQuery((text) => text + event.key);
      else if (event.key === "Backspace") setQuery((text) => text.slice(0, -1));
      else return;
      event.preventDefault();
      event.stopPropagation();
    };
    window.addEventListener(COMMANDLINE_OPEN_EVENT, open);
    window.addEventListener("keydown", hotkey);
    window.addEventListener("keydown", capture, true);
    return () => {
      window.removeEventListener(COMMANDLINE_OPEN_EVENT, open);
      window.removeEventListener("keydown", hotkey);
      window.removeEventListener("keydown", capture, true);
    };
  }, []);
  const enter = (next: string) => {
    restore();
    setGroup(next);
    setQuery("");
    setIndex(startIndex(next));
  };
  const close = () => {
    restore();
    hideModal("Commandline");
  };
  const apply = (patch: Partial<Config>, sticky = false) => {
    previewTheme(null);
    setConfigs(patch);
    if (!sticky) hideModal("Commandline");
  };
  const perform = (action: Action) => {
    if (action.type === "modal") {
      if (action.patch) setConfigs(action.patch);
      close();
      showModal(action.id);
      return;
    }
    close();
    if (action.type === "route") router.push(action.path);
    else if (action.type === "url") window.open(action.url);
    else if (action.type === "clearNotifications") clearAllNotifications();
    else if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen();
  };
  const startInput = (title: string, spec: InputSpec, icon: FaIconName) => {
    setInput({ title, spec, icon });
    setQuery(spec.defaultValue);
    setInvalid(false);
    requestAnimationFrame(() => field.current?.select());
  };
  const submitInput = () => {
    if (!input) return;
    const patch = input.spec.apply(query);
    const valid = patch ? validSettingsPatch(patch) : null;
    if (!patch || !valid || Object.keys(valid).length !== Object.keys(patch).length) {
      setInvalid(true);
      setTimeout(() => setInvalid(false), 500);
      return;
    }
    apply(patch);
  };
  const run = (row: Row) => {
    const { top, child } = row;
    if (child?.input) return startInput(child.display, child.input, top.icon);
    if (child?.patch) return apply(child.patch, child.sticky);
    if (top.children) return enter(top.id);
    if (top.input) return startInput(top.display, top.input, top.icon);
    if (top.action) return perform(top.action);
    if (top.patch) apply(top.patch);
  };

  const search = parseSearch(query, config.singleListCommandLine);
  const singleList = !input && group === "" && search.single;
  const groupTop = tops.find((top) => top.id === group);
  let rows: Row[];
  if (input) rows = [];
  else if (singleList)
    rows = search.query.trim() ? singleListEntries(tops) : [];
  else if (groupTop?.children)
    rows = groupTop.children.map((child) => ({ top: groupTop, child, display: child.display, alias: child.alias }));
  else rows = tops.map((top) => ({ top, display: top.display, alias: top.alias }));
  const text = singleList ? search.query : query;
  const found = findMatchingCommands(rows, text);
  const filtered = rows.filter((_, i) => found[i]).slice(0, MAX_ROWS);
  const selected = Math.min(index, Math.max(0, filtered.length - 1));
  const previewName = isOpen ? (filtered[selected]?.child?.theme ?? null) : null;
  useEffect(() => previewTheme(previewName), [previewName]);
  useEffect(() => {
    if (!isOpen) return;
    return () => {
      opening.current = false;
    };
  }, [isOpen]);
  useEffect(() => {
    list.current?.querySelector(`[data-index="${selected}"]`)?.scrollIntoView({ block: "nearest" });
  }, [selected, filtered.length]);
  const execute = (row: Row) => {
    if (group === "" && query !== "") lastSearch.current = query;
    run(row);
  };
  const placeholder = input ? input.title : groupTop ? groupTop.display : "Search...";
  return (
    <AnimatedModal
      id="Commandline"
      focusFirstInput
      afterHide={() => {
        // hand focus back to the typing input unless another modal took over
        if (getOpenModal() === null) focusInput();
      }}
      wrapperClass={cn("items-start px-8 py-24", previewName !== null && "bg-transparent!")}
      modalClass={cn(
        "max-w-[600px]! gap-0! overflow-hidden! p-0! ring-[0.2em]! ring-transparent! sm:p-0!",
        previewName !== null && "ring-sub-alt!",
        invalid && "animate-shake",
      )}
      onEscape={() => {
        restore();
        if (input) {
          setInput(null);
          setQuery("");
        } else if (group) enter("");
        else hideModal("Commandline");
      }}
    >
      <div className="grid grid-cols-[auto_1fr] items-center">
        <Fa icon={input ? input.icon : "search"} className="mx-4 mt-px text-sub" />
        <input
          ref={field}
          aria-label="Search commands"
          placeholder={placeholder}
          value={query}
          className="w-full rounded-(--roundness) border-none bg-bg py-4 pr-4 pl-0 text-base text-text outline-none"
          onFocus={() => (opening.current = false)}
          onChange={(event) => {
            setQuery(event.target.value);
            setIndex(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              if (input) return submitInput();
              const row = filtered[selected];
              if (row) execute(row);
              return;
            }
            if (input) return;
            if (
              event.key === "ArrowUp" &&
              query === "" &&
              group === "" &&
              lastSearch.current
            ) {
              event.preventDefault();
              setQuery(lastSearch.current);
              setIndex(0);
              return;
            }
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              setIndex(
                (selected +
                  (event.key === "ArrowDown" ? 1 : -1) +
                  filtered.length) %
                  Math.max(1, filtered.length),
              );
            }
          }}
        />
      </div>
      <div
        ref={list}
        className={cn("max-h-[60vh] overflow-auto", filtered.length > 0 && "pb-2")}
        role="listbox"
        aria-label="Commands"
      >
        {filtered.map((row, i) => {
          const { top, child } = row;
          const dim = i === selected ? "text-bg" : "text-sub";
          const colors = child?.theme ? THEMES[child.theme] : undefined;
          const check = child?.active !== undefined && (
            <Fa icon="check" className={`mr-2 ${dim}${child.active ? "" : " invisible"}`} />
          );
          return (
            <button
              key={`${top.id}-${row.display}-${i}`}
              role="option"
              data-index={i}
              aria-selected={i === selected}
              className={`flex w-full items-center px-4 py-2 text-left text-xs leading-3 ${i === selected ? "bg-text text-bg" : "text-sub"}`}
              onMouseEnter={() => setIndex(i)}
              onClick={() => execute(row)}
              style={
                child?.font
                  ? { fontFamily: `'${fontCssFamily(child.font)}', monospace` }
                  : undefined
              }
            >
              {row.parent !== undefined ? (
                <>
                  <Fa icon={top.icon} className={`mr-2 ${dim}`} />
                  {row.parent}
                  <Fa icon="chevron-right" className={`mx-2 ${dim}`} />
                  {check}
                </>
              ) : (
                check || <Fa icon={top.icon} className={`mr-2 ${dim}`} />
              )}
              {child?.display ?? row.display}
              {child?.theme && (
                <>
                  {child.fav && <Fa icon="star" className="mr-1 ml-auto" />}
                  {colors && (
                    <span
                      aria-hidden
                      className={cn("-my-1 grid grid-flow-col gap-1 rounded-full p-1", !child.fav && "ml-auto")}
                      style={{ background: colors.bg }}
                    >
                      {[colors.main, colors.sub, colors.text].map((color, index) => (
                        <span key={`${color}-${index}`} className="size-[1em] rounded-full" style={{ background: color }} />
                      ))}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>
    </AnimatedModal>
  );
}


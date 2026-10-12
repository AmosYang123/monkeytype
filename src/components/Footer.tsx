"use client";

import type { MouseEvent } from "react";
import { Fa, type FaIconName } from "@/components/icons";
import { useTest } from "@/components/TestProvider";
import { cn } from "@/lib/cn";
import { showModal, type ModalId } from "@/lib/modals";
import { useConfig } from "@/components/ConfigProvider";
import { setConfig } from "@/lib/config/store";
import { openCommandline } from "@/lib/commandline-bridge";

const noop = (e: MouseEvent) => e.preventDefault();

type FooterLink = {
  icon: FaIconName;
  label: string;
  href?: string;
  external?: boolean;
  modal?: ModalId;
};

const LINKS: FooterLink[] = [
  { icon: "envelope", label: "contact", modal: "Contact" },
  { icon: "donate", label: "support", modal: "Support" },
  { icon: "code", label: "github", href: "https://github.com/monkeytypegame/monkeytype", external: true },
  { icon: "discord", label: "discord", href: "https://www.discord.gg/monkeytype", external: true },
  { icon: "twitter", label: "twitter", href: "https://x.com/monkeytype", external: true },
  { icon: "file-contract", label: "terms", href: "/terms-of-service.html", external: true },
  { icon: "shield-alt", label: "security", href: "/security-policy.html", external: true },
  { icon: "lock", label: "privacy", href: "/privacy-policy.html", external: true },
];

const ITEM = "mt-button !p-[6px] !gap-[6px] text-xs leading-[15px] h-[27px]";

function Item({ icon, label, href, external, modal }: FooterLink) {
  const content = (
    <>
      <Fa icon={icon} />
      <div>{label}</div>
    </>
  );
  if (!href) {
    return (
      <button type="button" className={ITEM} onClick={modal ? () => showModal(modal) : noop}>
        {content}
      </button>
    );
  }
  return (
    <a
      className={ITEM}
      href={href}
      onClick={external ? undefined : noop}
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
    >
      {content}
    </a>
  );
}

export function Footer() {
  const { focusMode } = useTest();
  const config = useConfig();
  const fade = focusMode && "opacity-0";
  return (
    <footer className="relative text-xs text-sub">
      <div
        className={cn(
          "mb-8 flex flex-col items-center gap-2 transition-opacity duration-250",
          !config.showKeyTips && "hidden",
          fade,
        )}
      >
        <div className="flex items-center gap-2">
          <kbd>tab &gt; enter</kbd>
          <span>- restart test</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd>escape</kbd>
          <span className="whitespace-pre"> or </span>
          <kbd>ctrl + shift + p</kbd>
          <span>- command line</span>
        </div>
      </div>
      <div
        className={cn(
          "-m-2 flex justify-between gap-8 transition-opacity duration-250",
          fade,
        )}
      >
        <div className="grid grid-cols-1 justify-items-start xs:grid-cols-2 sm:grid-cols-4 lg:flex">
          {LINKS.map((l) => (
            <Item key={l.label} {...l} />
          ))}
        </div>
        <div className="flex flex-col items-end text-right lg:flex-row">
          <button
            type="button"
            className={cn(ITEM, "items-baseline")}
            aria-label="Shift-click to toggle custom theme"
            data-balloon-pos="left"
            onClick={(event) => event.shiftKey ? setConfig("customTheme", !config.customTheme) : openCommandline("themes")}
          >
            <Fa icon="palette" />
            <div>{config.customTheme ? "custom" : config.theme.replaceAll("_", " ")}</div>
          </button>
          <button type="button" className={cn(ITEM, "items-baseline")} onClick={() => showModal("VersionHistory")}>
            <Fa icon="code-branch" />
            <div>v26.32.0</div>
          </button>
        </div>
      </div>
    </footer>
  );
}

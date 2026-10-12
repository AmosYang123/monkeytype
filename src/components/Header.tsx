"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { Fa, LogoIcon } from "@/components/icons";
import { useTest } from "@/components/TestProvider";
import { cn } from "@/lib/cn";
import { showModal } from "@/lib/modals";

const navItem = "mt-button aspect-square opacity-(--nav-focus-opacity)";

export function Header() {
  const { focusMode } = useTest();

  return (
    <header
      className="flex items-center gap-2"
      style={{ "--nav-focus-opacity": focusMode ? 0 : 1 } as CSSProperties}
    >
      <Link
        href="/"
        aria-label="Monkeytype Home"
        className="-m-2 box-content flex h-6 w-max gap-2 rounded-[0.8rem] p-2 font-lexend text-sub"
      >
        <LogoIcon
          className={cn(
            "h-full w-10 fill-current transition-colors duration-250",
            focusMode ? "text-sub" : "text-main",
          )}
        />
        <div className="hidden h-6 place-content-center text-[2rem] leading-0 sm:grid">
          <div
            className={cn(
              "-mt-[1.65em] hidden pl-[0.5em] text-[0.315em] leading-0 transition-colors duration-125 lg:block",
              focusMode ? "text-transparent" : "text-sub",
            )}
          >
            monkey see
          </div>
          <h1
            className={cn(
              "-mt-[0.11em] font-normal transition-colors duration-250",
              focusMode ? "text-sub" : "text-text",
            )}
          >
            monkeytype
          </h1>
        </div>
      </Link>
      <nav className="z-[5] flex w-full items-center gap-1 md:gap-2">
        <Link href="/" data-nav-item="test" aria-label="test" className={navItem}>
          <Fa icon="keyboard" />
        </Link>
        <Link href="/leaderboards" data-nav-item="leaderboards" aria-label="leaderboards" className={navItem}>
          <Fa icon="crown" />
        </Link>
        <Link href="/about" data-nav-item="about" aria-label="about" className={navItem}>
          <Fa icon="info" />
        </Link>
        <Link href="/settings" data-nav-item="settings" aria-label="settings" className={navItem}>
          <Fa icon="cog" />
        </Link>
        <div className="grow" />
        <button type="button" data-nav-item="alerts" aria-label="notifications" className={navItem} onClick={() => showModal("Alerts")}>
          <Fa icon="bell" />
        </button>
        <Link href="/account" data-nav-item="account" aria-label="account" className={navItem}>
          <Fa icon="user" />
        </Link>
      </nav>
    </header>
  );
}

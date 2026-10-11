"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { Fa, LogoIcon } from "@/components/icons";
import { useTest } from "@/components/TestProvider";
import { cn } from "@/lib/cn";

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
        className="-m-2 flex h-6 w-max gap-2 rounded-[0.8rem] p-2 font-lexend text-sub"
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
        <Link href="/" className={navItem}>
          <Fa icon="keyboard" />
        </Link>
        <a
          href="/leaderboards"
          className={navItem}
          onClick={(e) => e.preventDefault()}
        >
          <Fa icon="crown" />
        </a>
        <a
          href="/about"
          className={navItem}
          onClick={(e) => e.preventDefault()}
        >
          <Fa icon="info" />
        </a>
        <a
          href="/settings"
          className={navItem}
          onClick={(e) => e.preventDefault()}
        >
          <Fa icon="cog" />
        </a>
        <div className="grow" />
        <button
          type="button"
          aria-label="notifications"
          className={navItem}
          onClick={(e) => e.preventDefault()}
        >
          <Fa icon="bell" />
        </button>
        <a
          href="/login"
          className={navItem}
          onClick={(e) => e.preventDefault()}
        >
          <Fa icon="user" />
        </a>
      </nav>
    </header>
  );
}

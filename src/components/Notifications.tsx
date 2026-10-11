"use client";

import { useSyncExternalStore } from "react";
import { Fa, type FaIconName } from "@/components/icons";
import { useTest } from "@/components/TestProvider";
import { cn } from "@/lib/cn";
import {
  clearAllNotifications,
  getNotifications,
  removeNotification,
  subscribe,
  type Notification,
} from "@/lib/notifications";

// colors from monkeytype's Notifications.tsx
const LEVELS = {
  notice: { icon: "info-circle", title: "Notice", border: "rgba(0,130,251,0.985)", bg: "rgba(0,77,148,0.9)", hover: "rgba(0,77,148,0.5)" },
  success: { icon: "check-circle", title: "Success", border: "rgba(100,206,100,0.71)", bg: "rgba(0,148,0,0.9)", hover: "rgba(0,148,0,0.5)" },
  error: { icon: "times-circle", title: "Error", border: "rgba(241,51,34,0.71)", bg: "rgba(138,18,12,0.9)", hover: "rgba(138,18,12,0.5)" },
} as const;

const EMPTY: Notification[] = [];

function Item({ n, hidden }: { n: Notification; hidden: boolean }) {
  const level = LEVELS[n.level];
  return (
    <div className={cn("animate-[fadeIn_.125s_ease-out]", hidden && "pointer-events-none hidden")}>
      <div
        className="relative mb-4 grid cursor-pointer overflow-hidden rounded-2xl border-2 border-solid border-(--notif-border) bg-(--notif-bg) text-white backdrop-blur-[15px] transition-[background] duration-125 select-none hover:bg-(--notif-bg-hover)"
        style={{ "--notif-border": level.border, "--notif-bg": level.bg, "--notif-bg-hover": level.hover } as React.CSSProperties}
        onClick={() => removeNotification(n.id)}
      >
        <div className="p-4 text-sm">
          <div className="pb-2 opacity-50">
            <Fa icon={(n.icon ?? level.icon) as FaIconName} fw={n.icon !== undefined} className="mr-2 inline" />
            {n.title ?? level.title}
          </div>
          <div>{n.message}</div>
        </div>
      </div>
    </div>
  );
}

export function Notifications() {
  const items = useSyncExternalStore(subscribe, getNotifications, () => EMPTY);
  const { focusMode } = useTest();
  const sticky = items.filter((n) => n.durationMs === 0 && (!focusMode || n.important)).length;

  return (
    <div className="fixed top-[var(--banner-height,0px)] right-4 z-[99999999] grid w-[350px] pt-4" data-ui-element="notifications">
      {sticky > 1 && (
        <button type="button" className="mb-4 w-full cursor-pointer text-xs text-white" onClick={clearAllNotifications}>
          <Fa icon="times" fw={false} className="mr-1" />
          Clear all
        </button>
      )}
      {items.map((n) => (
        <Item key={n.id} n={n} hidden={focusMode && !n.important} />
      ))}
    </div>
  );
}

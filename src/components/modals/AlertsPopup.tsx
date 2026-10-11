"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { Fa, type FaIconName } from "@/components/icons";
import { AnimatedModal } from "@/components/ui/AnimatedModal";
import { cn } from "@/lib/cn";
import { hideModal } from "@/lib/modals";
import { getNotificationHistory, subscribe, type Notification, type NotificationLevel } from "@/lib/notifications";
import { ModalButton } from "./ModalButton";

const LEVEL_BAR: Record<NotificationLevel, string> = { error: "bg-error", success: "bg-main", notice: "bg-sub" };
const LEVEL_TITLE: Record<NotificationLevel, string> = { error: "Error", success: "Success", notice: "Notice" };

function Section({ icon, title, aside, children }: { icon: FaIconName; title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <div>
      <div className="flex text-xl">
        <h3 className="flex place-items-center gap-[0.5em] pb-[0.5em] text-[1em] text-sub">
          <Fa icon={icon} />
          {title}
        </h3>
        {aside}
      </div>
      <div className="grid min-h-20 items-center gap-4">{children}</div>
    </div>
  );
}

const Empty = () => <div className="place-self-center">Nothing to show</div>;
const Separator = () => <div className="h-1 rounded-sm bg-sub-alt" />;

function HistoryEntry({ n }: { n: Notification }) {
  return (
    <div className="grid h-min w-full grid-cols-[0.25rem_auto_max-content] gap-x-2 gap-y-1">
      <div className={cn("row-span-2 h-full w-1 rounded-sm transition-colors duration-125", LEVEL_BAR[n.level])} />
      <div className="text-xs text-sub">{n.title ?? LEVEL_TITLE[n.level]}</div>
      <div className="row-span-2" />
      <div className="text-xs wrap-break-word text-text">{n.message}</div>
    </div>
  );
}

const EMPTY: Notification[] = [];

/** The bell popup: a full-height panel pinned to the right edge (monkeytype's AlertsPopup). */
export function AlertsPopup() {
  const history = useSyncExternalStore(subscribe, getNotificationHistory, () => EMPTY);
  return (
    <AnimatedModal
      id="Alerts"
      modalClass="absolute top-0 right-0 block! h-full! max-h-none! max-w-[calc(100vw-5rem)]! overflow-hidden rounded-[0.25rem_0_0_0.25rem]! p-4! pt-8! mt-0! sm:max-w-[calc(350px+2rem)]!"
      wrapperClass="p-0!"
    >
      <ModalButton className="mb-8 hidden! w-full pointer-coarse:flex!" onClick={() => hideModal("Alerts")}>
        <Fa icon="times" />
        Close
      </ModalButton>
      <div className="grid h-full content-baseline gap-8 overflow-y-scroll px-4 text-xs">
        {/* signed out: monkeytype shows an empty inbox with a 0/0 counter in the error color */}
        <Section icon="inbox" title="Inbox" aside={<div className="grow text-right text-error">0/0</div>}>
          <Empty />
        </Section>
        <Separator />
        <Section icon="bullhorn" title="Announcements">
          <Empty />
        </Section>
        <Separator />
        <Section icon="comment-alt" title="Notifications">
          {history.length === 0 ? (
            <Empty />
          ) : (
            <div className="flex w-full flex-col content-start gap-4 place-self-start">
              {history.map((n) => (
                <HistoryEntry key={n.id} n={n} />
              ))}
            </div>
          )}
        </Section>
      </div>
    </AnimatedModal>
  );
}

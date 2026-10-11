"use client";

import { Fa, type FaIconName } from "@/components/icons";
import { DAILY_LANGUAGES, type LbType, type Selection } from "./data";
import { LbButton } from "./LbButton";

type Item<T> = { id: T; text: string; icon: FaIconName };

function Group<T extends string>({ items, selected, onSelect }: { items: Item<T>[]; selected: T; onSelect: (id: T) => void }) {
  return (
    <div className="mb-4 grid gap-4 rounded-xl bg-sub-alt p-4">
      {items.map((item) => (
        <LbButton key={item.id} onClick={() => onSelect(item.id)} active={item.id === selected} className="justify-start">
          <Fa icon={item.icon} fw={false} />
          {item.text}
        </LbButton>
      ))}
    </div>
  );
}

const TYPES: Item<LbType>[] = [
  { id: "allTime", text: "all-time english", icon: "globe-americas" },
  { id: "weekly", text: "weekly xp", icon: "calendar-day" },
  { id: "daily", text: "daily", icon: "sun" },
];
const MODES: Item<Selection["mode2"]>[] = [
  { id: "15", text: "time 15", icon: "clock" },
  { id: "60", text: "time 60", icon: "clock" },
];
const LANGUAGES: Item<string>[] = DAILY_LANGUAGES.map((id) => ({ id, text: id, icon: "globe" }));

export function Sidebar({ selection, onSelect }: { selection: Selection; onSelect: (patch: Partial<Selection>) => void }) {
  return (
    <>
      <Group items={TYPES} selected={selection.type} onSelect={(type) => onSelect({ type })} />
      {selection.type !== "weekly" && <Group items={MODES} selected={selection.mode2} onSelect={(mode2) => onSelect({ mode2 })} />}
      {selection.type === "daily" && <Group items={LANGUAGES} selected={selection.language} onSelect={(language) => onSelect({ language })} />}
    </>
  );
}

import { Fa, type FaIconName } from "@/components/icons";
import { cn } from "@/lib/cn";

type HeaderProps = { id?: string; className?: string; text: string; icon: FaIconName };

export function H2({ id, className, text, icon }: HeaderProps) {
  return (
    <h2 id={id} className={cn("flex items-center gap-[0.5em] pb-[0.5em] text-[2.25em] text-sub", className)}>
      <Fa icon={icon} />
      {text}
    </h2>
  );
}

export function H3({ id, className, text, icon }: HeaderProps) {
  return (
    <h3 id={id} className={cn("flex items-center gap-[0.5em] pb-[0.5em] text-[1em] text-sub", className)}>
      <Fa icon={icon} />
      {text}
    </h3>
  );
}

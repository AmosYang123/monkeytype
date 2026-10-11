"use client";

import { useRef, type ReactNode } from "react";
import { Fa, type FaIconName } from "@/components/icons";
import { cn } from "@/lib/cn";

const BUTTON_CLASS =
  "inline-flex h-min cursor-pointer appearance-none items-center justify-center gap-[0.5em] rounded border-0 p-[0.5em] text-center leading-[1.25] transition-[color,background,opacity] duration-125 ease-in-out select-none focus-visible:shadow-[0_0_0_0.1rem_var(--bg-color),_0_0_0_0.2rem_var(--text-color)] focus-visible:outline-none bg-(--themable-button-bg) text-(--themable-button-text) hover:bg-(--themable-button-hover-bg) hover:text-(--themable-button-hover-text)";
const BUTTON_VARIANT = {
  button:
    "[--themable-button-bg:var(--sub-alt-color)] [--themable-button-hover-bg:var(--text-color)] [--themable-button-hover-text:var(--bg-color)] [--themable-button-text:var(--text-color)] active:bg-sub",
  text: "[--themable-button-bg:transparent] [--themable-button-hover-bg:transparent] [--themable-button-hover-text:var(--text-color)] [--themable-button-text:var(--sub-color)] active:text-sub",
};

export function FormButton({
  icon,
  text,
  variant = "button",
  type = "button",
  disabled,
  className,
  label,
  onClick,
}: {
  icon?: FaIconName;
  text?: string;
  variant?: "button" | "text";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  /** accessible name for icon-only buttons */
  label?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(BUTTON_CLASS, BUTTON_VARIANT[variant], disabled && "pointer-events-none opacity-[0.33]", className)}
    >
      {icon && <Fa icon={icon} />}
      {text}
    </button>
  );
}

export function Separator({ text }: { text: string }) {
  const line = <div className="h-1 w-full rounded bg-sub-alt" />;
  return (
    <div className="flex flex-row place-items-center gap-4">
      {line}
      <div>{text}</div>
      {line}
    </div>
  );
}

export function Checkbox({
  name,
  label,
  checked,
  disabled,
  onChange,
}: {
  name: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div>
      <label
        className={cn(
          "group flex cursor-pointer items-center gap-[0.5em] select-none",
          disabled && "pointer-events-none text-text/33",
        )}
      >
        <input
          id={name}
          name={name}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="hidden"
        />
        <div
          className={cn(
            "duration-half relative grid h-[1.25em] w-[1.25em] shrink-0 place-items-center rounded-half bg-sub-alt transition-[background]",
            disabled && "opacity-[0.33]",
          )}
        >
          <Fa
            icon="check"
            className={cn(
              "text-em-xs transition-[color] duration-125",
              checked ? "text-main group-hover:text-text" : "text-transparent group-hover:text-bg",
            )}
          />
        </div>
        <div>{label}</div>
      </label>
    </div>
  );
}

export type FieldStatus = {
  validating?: boolean;
  /** true once the user has interacted with the field */
  touched: boolean;
  errors: string[];
  warnings?: string[];
  /** value differs from the default (empty) value */
  changed: boolean;
};

function Balloon({ text, children }: { text: string; children: ReactNode }) {
  return (
    <span
      aria-label={text}
      data-balloon-pos="left"
      data-balloon-length="large"
      className="[&[data-balloon-length=large]::after]:w-[260px] [&[data-balloon-length=large]::after]:whitespace-normal"
    >
      {children}
    </span>
  );
}

function FieldIndicator({ status }: { status: FieldStatus }) {
  const valid = status.errors.length === 0;
  let content: ReactNode = null;
  if (status.validating) {
    content = <Fa icon="circle-notch" className="animate-spin text-main [animation-duration:2s]" />;
  } else if (status.touched && !valid) {
    content = (
      <Balloon text={status.errors.join(", ")}>
        <Fa icon="times" className="text-error" />
      </Balloon>
    );
  } else if (status.warnings && status.warnings.length > 0) {
    content = (
      <Balloon text={status.warnings.join(", ")}>
        <Fa icon="exclamation-triangle" fw={false} className="text-main" />
      </Balloon>
    );
  } else if (valid && status.touched && status.changed) {
    content = <Fa icon="check" className="text-main" />;
  }
  return <div className="col-start-1 row-start-1 self-center justify-self-end pr-[0.40em]">{content}</div>;
}

export function InputField({
  name,
  value,
  onChange,
  placeholder,
  autoComplete,
  type = "text",
  disabled,
  status,
  onTouched,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete: string;
  type?: "text" | "password";
  disabled?: boolean;
  /** present only for fields that have validators (shows the indicator) */
  status?: FieldStatus;
  onTouched?: () => void;
}) {
  const wrapper = useRef<HTMLDivElement>(null);

  const shake = () => {
    if (status?.touched && status.errors.length > 0) {
      wrapper.current?.animate(
        [{ transform: "translate(2px)" }, { transform: "translate(-2px)" }, { transform: "translate(2px)" }],
        { duration: 100, iterations: 3 },
      );
    }
  };

  return (
    <div ref={wrapper} className="grid w-full">
      <input
        className={cn(
          "col-start-1 row-start-1 w-full",
          "rounded border-none bg-sub-alt p-[0.5em] text-em-base leading-[1.25em] caret-main outline-none",
          "focus-visible:shadow-[0_0_0_0.1rem_var(--bg-color),0_0_0_0.2rem_var(--text-color)]",
          "autofill-fix",
          status && "pr-[1.85em]",
        )}
        type={type}
        name={name}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        disabled={disabled}
        onChange={(e) => {
          onTouched?.();
          onChange(e.target.value);
        }}
        onBlur={() => {
          shake();
          onTouched?.();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") shake();
        }}
      />
      {status && <FieldIndicator status={status} />}
    </div>
  );
}

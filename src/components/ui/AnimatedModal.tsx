"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { hideModal, useOpenModal, type ModalId } from "@/lib/modals";

const DURATION = 125;

type Props = {
  id: ModalId;
  title?: string;
  children: ReactNode;
  /** extra classes for the card (default max-w-md) */
  modalClass?: string;
  /** extra classes for the full-screen wrapper (e.g. items-start for the command line) */
  wrapperClass?: string;
  focusFirstInput?: boolean | "select";
  closeOnEscape?: boolean;
  closeOnWrapperClick?: boolean;
  onEscape?: () => void;
  afterShow?: () => void;
  afterHide?: () => void;
};

/**
 * Port of monkeytype's AnimatedModal: a <dialog> with a 50% black backdrop that fades in
 * (125ms) while the card fades and slides up from margin-top 1rem. Chained modals only
 * animate the card (75% duration).
 */
export function AnimatedModal(props: Props) {
  const { open, chained } = useOpenModal();
  const visible = open === props.id;
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);
  useEffect(() => {
    propsRef.current = props;
  });

  // mount → open dialog → next frame flip to "shown" so CSS transitions run; reverse on hide
  useEffect(() => {
    const dialog = dialogRef.current;
    if (visible) {
      if (!dialog) {
        const id = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(id);
      }
      if (!dialog.open) dialog.showModal();
      const raf = requestAnimationFrame(() => {
        setShown(true);
        const p = propsRef.current;
        if (p.focusFirstInput) {
          const input = cardRef.current?.querySelector<HTMLInputElement | HTMLTextAreaElement>("input:not([type=hidden]), textarea");
          input?.focus();
          if (p.focusFirstInput === "select") input?.select();
        } else {
          cardRef.current?.focus();
        }
        setTimeout(() => propsRef.current.afterShow?.(), DURATION);
      });
      return () => cancelAnimationFrame(raf);
    }
    if (!dialog) return;
    const raf = requestAnimationFrame(() => setShown(false));
    const t = setTimeout(() => {
      dialog.close();
      setMounted(false);
      propsRef.current.afterHide?.();
    }, DURATION);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [visible, mounted]);

  if (!visible && !mounted) return null;

  const duration = chained ? DURATION * 0.75 : DURATION;

  return (
    <dialog
      ref={dialogRef}
      id={`${props.id}Modal`}
      className={cn(
        "fixed top-0 left-0 z-[1000] m-0 flex h-full max-h-screen w-full max-w-screen items-center justify-center border-none bg-[rgba(0,0,0,0.5)] p-8 backdrop:bg-transparent",
        props.wrapperClass,
      )}
      style={{ opacity: shown || chained ? 1 : 0, transition: `opacity ${DURATION}ms ease-out` }}
      onCancel={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if (e.key !== "Escape") return;
        e.preventDefault();
        e.stopPropagation();
        if (props.onEscape) props.onEscape();
        else if (props.closeOnEscape !== false) hideModal(props.id);
      }}
      onMouseDown={(e) => {
        if (e.target === dialogRef.current && props.closeOnWrapperClick !== false) hideModal(props.id);
      }}
    >
      <div
        ref={cardRef}
        tabIndex={-1}
        className={cn(
          "modal pointer-events-auto grid h-max max-h-full w-full max-w-md gap-4 overflow-auto overscroll-y-none rounded-2xl bg-bg p-4 text-text ring-4 ring-sub-alt focus:outline-none sm:p-8",
          props.modalClass,
        )}
        style={{
          opacity: shown ? 1 : 0,
          marginTop: shown ? 0 : "1rem",
          transition: `opacity ${duration}ms ease-out, margin-top ${duration}ms ease-out`,
        }}
      >
        {props.title && <div className="text-2xl text-sub">{props.title}</div>}
        {props.children}
      </div>
    </dialog>
  );
}

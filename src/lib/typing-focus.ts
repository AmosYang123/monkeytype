export type TypingKeyEvent = Pick<KeyboardEvent, "key" | "ctrlKey" | "metaKey" | "altKey" | "shiftKey" | "preventDefault">;

export function focusTypingOnKey(event: TypingKeyEvent, blocked: boolean, focus: () => void, type: (event: TypingKeyEvent) => void): void {
  if (blocked || event.key === "Tab" || event.key === "Enter" || event.ctrlKey || event.metaKey || event.altKey) return;
  focus();
  type(event);
}

// Which modal is open. Opening a modal while another is open "chains" them:
// the current one is stacked and comes back when the new one closes (monkeytype behavior).
import { useSyncExternalStore } from "react";

export type ModalId =
  | "Commandline"
  | "Contact"
  | "Support"
  | "VersionHistory"
  | "Alerts"
  | "CustomText"
  | "SaveCustomText"
  | "SavedTexts"
  | "WordFilter"
  | "CustomGenerator"
  | "QuoteSearch"
  | "QuoteSubmit"
  | "QuoteReport"
  | "QuoteRate"
  | "TestDuration"
  | "CustomWordAmount"
  | "MobileTestConfig"
  | "ShareTestSettings"
  | "PractiseWords"
  | "Cookies"
  | "TheRest"
  | "ImportExportSettings"
  | "SimpleModal";

type State = { open: ModalId | null; stack: ModalId[]; chained: boolean };

let state: State = { open: null, stack: [], chained: false };
const listeners = new Set<() => void>();
const set = (next: State) => {
  state = next;
  listeners.forEach((l) => l());
};

export function showModal(id: ModalId): void {
  if (state.open === id) return;
  const stacked = state.stack.indexOf(id);
  if (stacked !== -1) {
    set({ open: id, stack: state.stack.slice(0, stacked), chained: true });
    return;
  }
  if (state.open) set({ open: id, stack: [...state.stack, state.open], chained: true });
  else set({ open: id, stack: [], chained: false });
}

export function hideModal(id: ModalId): void {
  if (state.open !== id) return;
  const prev = state.stack[state.stack.length - 1] ?? null;
  set({ open: prev, stack: state.stack.slice(0, -1), chained: prev !== null });
}

export const getOpenModal = () => state.open;

export function useOpenModal(): State {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => state,
  );
}

export const useIsModalOpen = (id: ModalId) => useOpenModal().open === id;

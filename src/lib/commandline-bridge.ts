// Decouples "open the command line" (footer theme button, language button, hotkeys…)
// from the command line implementation, which listens for this event.
export const COMMANDLINE_OPEN_EVENT = "mt:commandline-open";

export type CommandlineOpenDetail = {
  /** id of a sub-list to open directly, e.g. "language", "themes", "funbox" */
  subgroup?: string;
};

export function openCommandline(subgroup?: string): void {
  window.dispatchEvent(new CustomEvent<CommandlineOpenDetail>(COMMANDLINE_OPEN_EVENT, { detail: { subgroup } }));
}

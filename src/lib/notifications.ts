// Global toast notifications (monkeytype's top-right "Notice / Success / Error" cards).
// Tiny external store so any component or plain function can call notify().
export type NotificationLevel = "notice" | "success" | "error";

export type Notification = {
  id: number;
  level: NotificationLevel;
  message: string;
  title?: string;
  icon?: string;
  /** 0 = sticky until clicked */
  durationMs: number;
  /** stays visible in focus mode */
  important?: boolean;
  createdAt: number;
};

type Listener = () => void;

let items: Notification[] = [];
let history: Notification[] = [];
let nextId = 1;
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l());

export function subscribe(l: Listener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}
export const getNotifications = () => items;
/** everything shown this session (the bell popup lists it) */
export const getNotificationHistory = () => history;

export function removeNotification(id: number): void {
  items = items.filter((n) => n.id !== id);
  emit();
}

export function clearAllNotifications(): void {
  items = [];
  emit();
}

export function notify(
  message: string,
  opts: { level?: NotificationLevel; title?: string; icon?: string; durationMs?: number; important?: boolean } = {},
): number {
  const n: Notification = {
    id: nextId++,
    level: opts.level ?? "notice",
    message,
    title: opts.title,
    icon: opts.icon,
    durationMs: opts.durationMs ?? 3000,
    important: opts.important,
    createdAt: Date.now(),
  };
  items = [n, ...items];
  history = [n, ...history].slice(0, 50);
  emit();
  if (n.durationMs > 0) setTimeout(() => removeNotification(n.id), n.durationMs);
  return n.id;
}

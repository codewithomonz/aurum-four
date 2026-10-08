import { BRAND } from "../config";

const keyOf = (key: string) => `${BRAND.storagePrefix}:${key}`;

/** Reads and validates a JSON value. Falls back when missing, invalid, or storage is unavailable. */
export function loadValue<T>(
  key: string,
  fallback: T,
  validate: (value: unknown) => value is T,
): T {
  try {
    const raw = window.localStorage.getItem(keyOf(key));
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return validate(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function saveValue(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(keyOf(key), JSON.stringify(value));
  } catch {
    // Storage can be blocked (private mode) or full. The game still works without it.
  }
}

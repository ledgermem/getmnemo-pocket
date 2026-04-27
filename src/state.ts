import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export interface SyncState {
  lastSince: number;
  lastRunAt: string;
}

export function loadState(path: string): SyncState {
  if (!existsSync(path)) {
    return { lastSince: 0, lastRunAt: "" };
  }
  const raw = JSON.parse(readFileSync(path, "utf8")) as unknown;
  if (
    typeof raw === "object" &&
    raw !== null &&
    "lastSince" in raw &&
    typeof (raw as SyncState).lastSince === "number"
  ) {
    return raw as SyncState;
  }
  return { lastSince: 0, lastRunAt: "" };
}

export function saveState(path: string, state: SyncState): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(state, null, 2), "utf8");
}

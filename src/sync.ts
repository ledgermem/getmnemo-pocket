import type { LedgerMem } from "@ledgermem/memory";
import { PocketClient, type PocketItem } from "./pocket-client.js";
import { loadState, saveState, type SyncState } from "./state.js";

export interface MemoryClient {
  add: LedgerMem["add"];
}

export interface SyncOptions {
  pocket: PocketClient;
  memory: MemoryClient;
  statePath: string;
  pageSize: number;
}

export interface SyncResult {
  itemsSynced: number;
  newSince: number;
}

function buildContent(item: PocketItem): string {
  const title = item.resolved_title || item.given_title || "(untitled)";
  const url = item.resolved_url || item.given_url || "";
  const excerpt = item.excerpt ?? "";
  return [title, url, excerpt].filter(Boolean).join("\n\n");
}

function tagList(item: PocketItem): string[] {
  if (!item.tags) return [];
  return Object.values(item.tags).map((t) => t.tag);
}

export async function syncOnce(opts: SyncOptions): Promise<SyncResult> {
  const state: SyncState = loadState(opts.statePath);
  let offset = 0;
  let itemsSynced = 0;
  let highestSince = state.lastSince;

  // Pocket pagination loop.
  // Each request returns up to pageSize items; we stop when we get < pageSize.
  while (true) {
    const response = await opts.pocket.get({
      since: state.lastSince,
      count: opts.pageSize,
      offset,
      state: "archive",
      detailType: "complete",
    });
    const items = PocketClient.itemsArray(response);
    if (items.length === 0) break;
    if (response.since > highestSince) highestSince = response.since;

    for (const item of items) {
      await opts.memory.add(buildContent(item), {
        metadata: {
          source: "pocket",
          pocketId: item.item_id,
          url: item.resolved_url || item.given_url || "",
          title: item.resolved_title || item.given_title || "",
          tags: tagList(item),
          excerpt: item.excerpt ?? "",
          addedAt: item.time_added,
        },
      });
      itemsSynced += 1;
    }
    if (items.length < opts.pageSize) break;
    offset += items.length;
  }

  saveState(opts.statePath, {
    lastSince: highestSince,
    lastRunAt: new Date().toISOString(),
  });
  return { itemsSynced, newSince: highestSince };
}

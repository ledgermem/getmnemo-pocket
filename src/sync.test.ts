import { describe, it, expect, vi, beforeEach } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PocketClient } from "./pocket-client.js";
import { syncOnce } from "./sync.js";

describe("syncOnce", () => {
  let tmpStatePath: string;

  beforeEach(() => {
    const dir = mkdtempSync(join(tmpdir(), "pocket-test-"));
    tmpStatePath = join(dir, "pocket.json");
  });

  it("ingests archived items into memory and updates state", async () => {
    const fakeFetch = vi.fn(async () =>
      new Response(
        JSON.stringify({
          status: 1,
          since: 1700000999,
          list: {
            "100": {
              item_id: "100",
              resolved_url: "https://a.example/post",
              resolved_title: "Post A",
              excerpt: "A summary",
              time_added: "1699000000",
              status: "1",
              tags: { javascript: { tag: "javascript" } },
            },
          },
        }),
        { status: 200 },
      ),
    );
    const pocket = new PocketClient("ck", "at", fakeFetch as unknown as typeof fetch);
    const memoryAdd = vi.fn(async () => undefined);
    const memory = { add: memoryAdd } as unknown as Parameters<typeof syncOnce>[0]["memory"];

    const result = await syncOnce({
      pocket,
      memory,
      statePath: tmpStatePath,
      pageSize: 30,
    });

    expect(result.itemsSynced).toBe(1);
    expect(result.newSince).toBe(1700000999);
    expect(memoryAdd).toHaveBeenCalledOnce();
    const [content, opts] = memoryAdd.mock.calls[0];
    expect(content).toContain("Post A");
    expect(opts).toMatchObject({
      metadata: { source: "pocket", pocketId: "100", url: "https://a.example/post" },
    });
  });

  it("handles empty response gracefully", async () => {
    const fakeFetch = vi.fn(async () =>
      new Response(JSON.stringify({ status: 2, since: 0, list: [] }), {
        status: 200,
      }),
    );
    const pocket = new PocketClient("ck", "at", fakeFetch as unknown as typeof fetch);
    const memory = { add: vi.fn(async () => undefined) } as unknown as Parameters<typeof syncOnce>[0]["memory"];
    const result = await syncOnce({
      pocket,
      memory,
      statePath: tmpStatePath,
      pageSize: 30,
    });
    expect(result.itemsSynced).toBe(0);
  });
});

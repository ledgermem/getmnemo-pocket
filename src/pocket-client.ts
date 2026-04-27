export interface PocketItem {
  item_id: string;
  resolved_url?: string;
  given_url?: string;
  resolved_title?: string;
  given_title?: string;
  excerpt?: string;
  time_added: string;
  status: string;
  tags?: Record<string, { tag: string }>;
}

export interface PocketResponse {
  list: Record<string, PocketItem> | [];
  since: number;
  status: number;
}

export interface PocketGetParams {
  since?: number;
  count?: number;
  offset?: number;
  state?: "unread" | "archive" | "all";
  detailType?: "simple" | "complete";
}

const ENDPOINT = "https://getpocket.com/v3/get";

export class PocketClient {
  constructor(
    private readonly consumerKey: string,
    private readonly accessToken: string,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async get(params: PocketGetParams): Promise<PocketResponse> {
    const body = {
      consumer_key: this.consumerKey,
      access_token: this.accessToken,
      state: params.state ?? "archive",
      detailType: params.detailType ?? "complete",
      count: params.count ?? 30,
      offset: params.offset ?? 0,
      since: params.since ?? 0,
    };
    const res = await this.fetchImpl(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Accept": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(
        `Pocket API ${res.status}: ${res.statusText} — ${await res.text()}`,
      );
    }
    const json = (await res.json()) as PocketResponse;
    return json;
  }

  static itemsArray(response: PocketResponse): PocketItem[] {
    if (Array.isArray(response.list)) return [];
    return Object.values(response.list);
  }
}

# @ledgermem/pocket

LedgerMem connector for [Pocket](https://getpocket.com). Pulls archived items via the Pocket v3 API and ingests them into your LedgerMem workspace.

## Install

```bash
npm install -g @ledgermem/pocket
```

## Setup

1. Create a Pocket consumer key at https://getpocket.com/developer/apps/new
2. Run the OAuth flow to obtain an access token (see Pocket docs).
3. Get your LedgerMem API key + workspace ID from the LedgerMem dashboard.
4. Copy `.env.example` to `.env` and fill in.

## Run

```bash
pocket-sync
```

The CLI is one-shot — schedule it with cron or systemd for continuous sync. State (last `since` cursor) is persisted to `~/.ledgermem/pocket.json` so subsequent runs only fetch new items.

## Env vars

| Variable | Required | Description |
| --- | --- | --- |
| `POCKET_CONSUMER_KEY` | yes | Pocket app consumer key |
| `POCKET_ACCESS_TOKEN` | yes | Pocket user access token |
| `LEDGERMEM_API_KEY` | yes | LedgerMem API key |
| `LEDGERMEM_WORKSPACE_ID` | yes | LedgerMem workspace ID |
| `POCKET_STATE_PATH` | no | Path to state file (default `~/.ledgermem/pocket.json`) |
| `POCKET_PAGE_SIZE` | no | Items per Pocket API call (default 30) |

## Memory metadata

Each ingested memory carries:

- `source: "pocket"`
- `pocketId`
- `url`
- `title`
- `tags[]`
- `excerpt`
- `addedAt`

## License

MIT

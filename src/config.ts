export interface PocketConfig {
  consumerKey: string;
  accessToken: string;
  ledgermemApiKey: string;
  ledgermemWorkspaceId: string;
  statePath: string;
  pageSize: number;
}

const REQUIRED = [
  "POCKET_CONSUMER_KEY",
  "POCKET_ACCESS_TOKEN",
  "LEDGERMEM_API_KEY",
  "LEDGERMEM_WORKSPACE_ID",
] as const;

export function loadConfig(): PocketConfig {
  const missing = REQUIRED.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
  const home = process.env.HOME ?? process.env.USERPROFILE ?? ".";
  return {
    consumerKey: process.env.POCKET_CONSUMER_KEY as string,
    accessToken: process.env.POCKET_ACCESS_TOKEN as string,
    ledgermemApiKey: process.env.LEDGERMEM_API_KEY as string,
    ledgermemWorkspaceId: process.env.LEDGERMEM_WORKSPACE_ID as string,
    statePath:
      process.env.POCKET_STATE_PATH ?? `${home}/.ledgermem/pocket.json`,
    pageSize: Number(process.env.POCKET_PAGE_SIZE ?? 30),
  };
}

import type { VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  crons: [{ path: "/api/jobs/ingest", schedule: "0 6 * * *" }],
};

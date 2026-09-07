import type { VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  // Hobby allows one scheduled run per day; active users still refresh their feed every 5 hours.
  crons: [{ path: "/api/jobs/ingest", schedule: "0 6 * * *" }],
};

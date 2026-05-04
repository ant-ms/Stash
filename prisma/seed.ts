/**
 * prisma/seed.ts — delegates to tests/seed.ts
 * Called by `prisma db seed` or `bun run prisma/seed.ts`
 */
import { spawnSync } from "child_process";

const result = spawnSync(
  "bun",
  [new URL("../tests/seed.ts", import.meta.url).pathname],
  {
    stdio: "inherit",
    env: process.env,
  }
);

process.exit(result.status ?? 0);

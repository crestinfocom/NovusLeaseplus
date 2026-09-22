import { config as loadDotenv } from "dotenv";
import { defineConfig } from "prisma/config";

// Same precedence as Next.js: .env first, .env.local wins.
loadDotenv({ path: ".env" });
loadDotenv({ path: ".env.local", override: true });

// USE_LOCAL_DB=true → Prisma CLI (db push / migrate / studio / seed)
// targets the local Docker Postgres instead of Neon. `npm run start:local`
// also force-overrides DATABASE_URL in the child env for belt-and-braces.
const useLocal =
  process.env.USE_LOCAL_DB === "true" || process.env.USE_LOCAL_DB === "1";
const localUrl =
  process.env.DATABASE_URL_LOCAL ||
  "postgresql://novuslease:novuslease@localhost:5434/novuslease?sslmode=disable";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.mjs",
  },
  datasource: {
    url: useLocal ? localUrl : process.env.DATABASE_URL,
  },
});

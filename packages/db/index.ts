import { createKysely } from "@vercel/postgres-kysely";

import type { DB } from "./prisma/types";

export { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";

export * from "./prisma/types";
export * from "./prisma/enums";

// Mock database object for build-time
const mockDb = {
  selectFrom: () => mockDb,
  select: () => mockDb,
  where: () => mockDb,
  execute: () => Promise.resolve([]),
  executeTakeFirst: () => Promise.resolve(undefined),
  insertInto: () => mockDb,
  values: () => mockDb,
  updateTable: () => mockDb,
  set: () => mockDb,
  deleteFrom: () => mockDb,
  transaction: () => mockDb,
  with: () => mockDb,
  withRecursive: () => mockDb,
  $if: () => mockDb,
  $call: () => mockDb,
} as any;

// Skip database connection during build process
export const db = process.env.SKIP_DB_CONNECTION === 'true' 
  ? mockDb
  : createKysely<DB>();

import { createKysely } from "@vercel/postgres-kysely";
import type { GeneratedAlways } from "kysely";

interface Database {
  User: {
    id: GeneratedAlways<string>;
    name: string | null;
    email: string;
    emailVerified: Date | null;
    image: string | null;
  };
  Account: {
    id: GeneratedAlways<string>;
    userId: string;
    type: string;
    provider: string;
    providerAccountId: string;
    refresh_token: string | null;
    access_token: string | null;
    expires_at: number | null;
    token_type: string | null;
    scope: string | null;
    id_token: string | null;
    session_state: string | null;
  };
  Session: {
    id: GeneratedAlways<string>;
    userId: string;
    sessionToken: string;
    expires: Date;
  };
  VerificationToken: {
    identifier: string;
    token: string;
    expires: Date;
  };
}

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
  // Add getExecutor method for KyselyAdapter compatibility
  getExecutor: () => ({
    adapter: {
      supportsReturning: false,
      // Mock as a generic adapter (not SQLite)
      constructor: { name: 'MockAdapter' }
    }
  }),
} as any;

export const db = process.env.SKIP_DB_CONNECTION === 'true' || process.env.NODE_ENV === 'development'
  ? mockDb
  : createKysely<Database>();

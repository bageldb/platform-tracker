#!/usr/bin/env node
/**
 * One-time DB initialization script.
 * Run this once when setting up a new database:
 *   DATABASE_URL=... node scripts/init-db.js
 *
 * This creates the module_state table and migrates any data
 * from the legacy tracker_state table if it exists.
 */

import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Error: DATABASE_URL environment variable is required");
  process.exit(1);
}

const sql = neon(url);

async function ensureTable() {
  console.log("Creating module_state table (if not exists)...");
  await sql`
    CREATE TABLE IF NOT EXISTS module_state (
      id         TEXT        PRIMARY KEY,
      data       JSONB       NOT NULL,
      position   INTEGER     NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log("Done.");
}

async function migrateFromLegacy() {
  const existing = await sql`SELECT COUNT(*) AS c FROM module_state`;
  if (existing[0].c !== "0") {
    console.log("module_state already has data — skipping legacy migration.");
    return;
  }

  console.log("Checking for legacy tracker_state data...");
  try {
    const rows = await sql`SELECT data FROM tracker_state WHERE id = 1`;
    const modules = rows[0]?.data;
    if (!Array.isArray(modules)) {
      console.log("No legacy data found.");
      return;
    }
    console.log(`Migrating ${modules.length} modules from tracker_state...`);
    for (let i = 0; i < modules.length; i++) {
      const m = modules[i];
      await sql`
        INSERT INTO module_state (id, data, position)
        VALUES (${m.id}, ${JSON.stringify(m)}, ${i})
        ON CONFLICT DO NOTHING
      `;
    }
    console.log("Legacy migration complete.");
  } catch {
    console.log("tracker_state not found — no legacy data to migrate.");
  }
}

await ensureTable();
await migrateFromLegacy();
console.log("DB initialization complete.");

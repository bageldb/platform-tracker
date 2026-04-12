import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS module_state (
      id         TEXT        PRIMARY KEY,
      data       JSONB       NOT NULL,
      position   INTEGER     NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

async function migrateFromLegacy() {
  const existing = await sql`SELECT COUNT(*) AS c FROM module_state`;
  if (existing[0].c !== "0") return;

  try {
    const rows = await sql`SELECT data FROM tracker_state WHERE id = 1`;
    const modules = rows[0]?.data;
    if (!Array.isArray(modules)) return;
    for (let i = 0; i < modules.length; i++) {
      const m = modules[i];
      await sql`
        INSERT INTO module_state (id, data, position)
        VALUES (${m.id}, ${JSON.stringify(m)}, ${i})
        ON CONFLICT DO NOTHING
      `;
    }
  } catch {
    // tracker_state may not exist — that's fine
  }
}

export const handler = async (event) => {
  try {
    await ensureTable();
    await migrateFromLegacy();

    if (event.httpMethod === "GET") {
      const rows = await sql`SELECT data FROM module_state ORDER BY position ASC, updated_at ASC`;
      const modules = rows.map(r => r.data);
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: modules.length > 0 ? modules : null }),
      };
    }

    return { statusCode: 405, body: "Method Not Allowed" };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

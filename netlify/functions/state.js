import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS tracker_state (
      id    INTEGER PRIMARY KEY DEFAULT 1,
      data  JSONB NOT NULL
    )
  `;
}

export const handler = async (event) => {
  try {
    await ensureTable();

    if (event.httpMethod === "GET") {
      const rows = await sql`SELECT data FROM tracker_state WHERE id = 1`;
      const data = rows[0]?.data ?? null;
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      };
    }

    if (event.httpMethod === "POST") {
      const { data } = JSON.parse(event.body);
      await sql`
        INSERT INTO tracker_state (id, data) VALUES (1, ${JSON.stringify(data)})
        ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data
      `;
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, body: "Method Not Allowed" };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

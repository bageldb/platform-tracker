import { neon } from "@neondatabase/serverless";
import { getUser } from "@netlify/identity";

const sql = neon(process.env.DATABASE_URL);

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS conversations (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL,
      title       TEXT NOT NULL DEFAULT 'New conversation',
      messages    JSONB NOT NULL DEFAULT '[]',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export default async (req) => {
  const user = await getUser(req);
  if (!user) return new Response("Unauthorized", { status: 401 });

  const uid = user.id;

  try {
    await ensureTable();

    // GET /api/conversations          → list all (id, title, updated_at)
    // GET /api/conversations?id=xxx   → get one with messages
    if (req.method === "GET") {
      const url = new URL(req.url);
      const id = url.searchParams.get("id");

      if (id) {
        const rows = await sql`
          SELECT id, title, messages, created_at, updated_at
          FROM conversations
          WHERE id = ${id} AND user_id = ${uid}
        `;
        if (!rows.length) return new Response("Not Found", { status: 404 });
        return Response.json({ conversation: rows[0] });
      }

      const rows = await sql`
        SELECT id, title, created_at, updated_at
        FROM conversations
        WHERE user_id = ${uid}
        ORDER BY updated_at DESC
        LIMIT 50
      `;
      return Response.json({ conversations: rows });
    }

    // POST → create or update
    if (req.method === "POST") {
      const { id, title, messages } = await req.json();
      await sql`
        INSERT INTO conversations (id, user_id, title, messages, updated_at)
        VALUES (${id}, ${uid}, ${title}, ${JSON.stringify(messages)}, NOW())
        ON CONFLICT (id) DO UPDATE
          SET title      = EXCLUDED.title,
              messages   = EXCLUDED.messages,
              updated_at = NOW()
        WHERE conversations.user_id = ${uid}
      `;
      return Response.json({ ok: true });
    }

    // DELETE
    if (req.method === "DELETE") {
      const { id } = await req.json();
      await sql`DELETE FROM conversations WHERE id = ${id} AND user_id = ${uid}`;
      return Response.json({ ok: true });
    }

    return new Response("Method Not Allowed", { status: 405 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
};

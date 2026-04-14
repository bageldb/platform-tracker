import { neon } from "@neondatabase/serverless";
import { getUser } from "@netlify/identity";

const sql = neon(process.env.DATABASE_URL);

export default async (req) => {
  const user = await getUser(req);
  if (!user) return new Response("Unauthorized", { status: 401 });

  try {
    if (req.method === "POST") {
      const { module, position } = await req.json();
      await sql`
        INSERT INTO module_state (id, data, position, updated_at)
        VALUES (${module.id}, ${JSON.stringify(module)}, ${position ?? 0}, NOW())
        ON CONFLICT (id) DO UPDATE
          SET data       = EXCLUDED.data,
              position   = EXCLUDED.position,
              updated_at = NOW()
      `;
      return Response.json({ ok: true });
    }

    if (req.method === "DELETE") {
      const { id } = await req.json();
      await sql`DELETE FROM module_state WHERE id = ${id}`;
      return Response.json({ ok: true });
    }

    return new Response("Method Not Allowed", { status: 405 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
};

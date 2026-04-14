import { neon } from "@neondatabase/serverless";
import { getUser } from "@netlify/identity";

const sql = neon(process.env.DATABASE_URL);

export default async (req) => {
  const user = await getUser(req);
  if (!user) return new Response("Unauthorized", { status: 401 });

  if (req.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const rows = await sql`SELECT data FROM module_state ORDER BY position ASC, updated_at ASC`;
    const modules = rows.map((r) => r.data);
    return Response.json({ data: modules.length > 0 ? modules : null });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
};

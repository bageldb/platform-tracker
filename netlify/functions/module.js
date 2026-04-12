import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export const handler = async (event) => {
  try {
    if (event.httpMethod === "POST") {
      const { module, position } = JSON.parse(event.body);
      await sql`
        INSERT INTO module_state (id, data, position, updated_at)
        VALUES (${module.id}, ${JSON.stringify(module)}, ${position ?? 0}, NOW())
        ON CONFLICT (id) DO UPDATE
          SET data       = EXCLUDED.data,
              position   = EXCLUDED.position,
              updated_at = NOW()
      `;
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    }

    if (event.httpMethod === "DELETE") {
      const { id } = JSON.parse(event.body);
      await sql`DELETE FROM module_state WHERE id = ${id}`;
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, body: "Method Not Allowed" };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

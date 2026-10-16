export async function onRequestGet({ env }) {
  const configured = Boolean(env.AI_API_URL && env.AI_API_KEY && env.AI_MODEL);
  return new Response(JSON.stringify({ ok: true, configured }), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}
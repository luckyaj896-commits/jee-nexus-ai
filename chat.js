const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
});

export async function onRequestPost({ request, env }) {
  if (!env.AI_API_URL || !env.AI_API_KEY || !env.AI_MODEL) {
    return json({ error: "AI is not configured yet. Add AI_API_URL, AI_API_KEY, and AI_MODEL as server-side secrets/settings." }, 503);
  }
  let body;
  try { body = await request.json(); } catch { return json({ error: "Send valid JSON." }, 400); }
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) return json({ error: "Please enter a question." }, 400);
  if (message.length > 6000) return json({ error: "Please keep each question under 6,000 characters." }, 413);

  const subject = ["Physics", "Chemistry", "Mathematics", "General JEE"].includes(body.subject) ? body.subject : "General JEE";
  const level = ["JEE Main", "JEE Advanced", "Build fundamentals"].includes(body.level) ? body.level : "JEE Main";
  const system = `You are Nexus Tutor, a careful, encouraging JEE preparation tutor for Indian students. Focus: ${subject}; target: ${level}. Explain reasoning step by step, define symbols, show units where relevant, and distinguish verified facts from uncertainty. When a student asks a problem, prefer a hint-first approach if requested. Do not claim a question is an official PYQ unless you can verify it. Be age-appropriate.`;
  const upstream = await fetch(env.AI_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": `Bearer ${env.AI_API_KEY}`
    },
    body: JSON.stringify({
      model: env.AI_MODEL,
      messages: [{ role: "system", content: system }, { role: "user", content: message }],
      temperature: 0.4,
      max_tokens: 1200
    })
  }).catch(() => null);
  if (!upstream) return json({ error: "Could not connect to the AI provider. Check the API URL and try again." }, 502);
  const raw = await upstream.text();
  if (!upstream.ok) {
    // Avoid forwarding provider response bodies, which can contain sensitive diagnostics.
    return json({ error: `AI provider returned HTTP ${upstream.status}. Check provider URL, model, and key in your dashboard.` }, 502);
  }
  let data;
  try { data = JSON.parse(raw); } catch { return json({ error: "The AI provider returned an unreadable response. This starter expects an OpenAI-compatible chat-completions API." }, 502); }
  const reply = data?.choices?.[0]?.message?.content;
  if (typeof reply !== "string" || !reply.trim()) return json({ error: "The provider response did not contain choices[0].message.content. Use an OpenAI-compatible chat-completions endpoint or adapt functions/api/chat.js to your provider." }, 502);
  return json({ reply: reply.trim() });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "Content-Type" } });
}
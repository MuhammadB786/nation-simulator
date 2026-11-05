// Serverless proxy: keeps your Anthropic API key on the server.
// Set ANTHROPIC_API_KEY (and optionally CLAUDE_MODEL) in Netlify → Site configuration → Environment variables.
const hits = new Map();
export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const ip = req.headers.get('x-nf-client-connection-ip') || 'anon', now = Date.now();
  const h = (hits.get(ip) || []).filter(t => now - t < 60000); h.push(now); hits.set(ip, h);
  if (h.length > 20) return Response.json({ error: 'Slow down' }, { status: 429 });
  let body; try { body = await req.json(); } catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }
  const messages = Array.isArray(body.messages) ? body.messages.slice(-4) : [];
  if (!messages.length || JSON.stringify(messages).length > 20000) return Response.json({ error: 'Bad request' }, { status: 400 });
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-5', max_tokens: Math.min(1400, body.max_tokens || 1100), system: typeof body.system === 'string' ? body.system.slice(0, 4000) : undefined, messages })
  });
  if (!r.ok) return Response.json({ error: 'Upstream ' + r.status }, { status: 502 });
  const j = await r.json();
  return Response.json({ text: (j.content || []).map(c => c.text || '').join('') });
};

/* On the published site there is no built-in Claude helper, so route AI calls through the site's own serverless function. */
(function(){
  if (window.claude && window.claude.complete) return;
  window.claude = { complete: async function (arg) {
    const body = typeof arg === 'string' ? { messages:[{ role:'user', content:arg }] } : arg;
    const r = await fetch('/api/claude', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(body) });
    if (!r.ok) throw new Error('AI unavailable (' + r.status + ')');
    const j = await r.json(); return j.text || '';
  } };
})();

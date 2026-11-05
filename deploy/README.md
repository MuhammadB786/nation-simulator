# Nation Sim — deploy

A single-page grand strategy game. `index.html` is fully self-contained; the AI game master runs through a small serverless function so your API key never reaches the browser.

## Publish on Netlify (about 5 minutes)
1. Create a free account at netlify.com.
2. Use a Git-connected Netlify build or Netlify CLI deployment so the serverless function is deployed alongside the HTML. Do not assume dropping a folder into a static uploader deploys the AI function. Run `npm run build` from the project root before deployment.
3. Site configuration → Environment variables → add `ANTHROPIC_API_KEY` with your key from console.anthropic.com. Optional: `CLAUDE_MODEL`.
4. Deploys → **Trigger deploy** so the function picks up the key.
5. Open your site URL. Site configuration → Domain management lets you rename it (e.g. `nation-sim.netlify.app`).

Without a key the game still works; outcomes fall back to the scripted results.

## Notes
- Progress saves in the player's browser (localStorage), up to 6 careers.
- The function has a process-local 20-request-per-minute check. It is not a durable or global quota; harden this before offering public paid AI access.
- Province borders load live from geoBoundaries (CC BY 4.0). Country borders: Natural Earth via world-atlas.

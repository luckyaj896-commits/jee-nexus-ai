# JEE NEXUS AI

A responsive, no-build static frontend plus Cloudflare Pages Functions backend. Includes a dashboard, local progress tracking, study missions, a starter practice set, mistake log, broad syllabus map, and an AI tutor endpoint.

## Important provider compatibility note

The AI backend currently expects an **OpenAI-compatible Chat Completions API** that accepts:
- `POST` to the endpoint in `AI_API_URL`
- `Authorization: Bearer <key>`
- JSON `{ "model": "...", "messages": [...] }`
- response text at `choices[0].message.content`

If your API uses a different request/response format, adapt `functions/api/chat.js` to that provider. Do not put an API key in `app.js`, `index.html`, or any `VITE_*` frontend variable.

## Run locally

This project uses Cloudflare Pages Functions, so run it using Wrangler rather than opening `index.html` as a file.

1. Install Node.js LTS from https://nodejs.org/
2. Unzip this project and open a terminal in the `jee-nexus-ai` folder.
3. Run:

   ```bash
   npm create cloudflare@latest -- --existing
   ```

   If the command cannot adopt the existing project, install Wrangler with `npm install --save-dev wrangler`, then use:

   ```bash
   npx wrangler pages dev .
   ```

4. For local AI testing, create a `.dev.vars` file in the project root (never commit it):

   ```dotenv
   AI_API_URL=https://YOUR-PROVIDER.example/v1/chat/completions
   AI_API_KEY=put-your-secret-key-here
   AI_MODEL=your-model-name
   ```

5. Start local server with `npx wrangler pages dev .` and open the localhost URL it prints.

## Recommended free deployment: Cloudflare Pages

1. Create a GitHub repository and upload all project files. Include `functions/` and the root `index.html`, `app.js`, and `styles.css`.
2. Sign in to Cloudflare and open **Workers & Pages**.
3. Create an application → Pages → connect to Git, then select your repository.
4. Build settings for this no-build project:
   - Framework preset: None
   - Build command: leave blank
   - Build output directory: `/` (if dashboard requires a directory, use `.`)
5. Deploy. Your site will be on a `*.pages.dev` address.
6. In your Pages project, open **Settings → Variables and Secrets**. Add these at runtime:
   - `AI_API_URL` — the provider's full OpenAI-compatible chat-completions endpoint
   - `AI_MODEL` — exact model identifier for your provider
   - `AI_API_KEY` — create as an encrypted Secret, not a plain variable
7. Redeploy if prompted, then open the site and use AI Tutor. `/api/health` should report `configured: true`.

Cloudflare Pages Functions run from the `functions/` folder. Do not upload a `functions` folder nested inside another directory by accident.

## Free-tier caveats

- Cloudflare has a free plan with usage limits; provider API usage may have separate quotas, rate limits, or charges. Check your provider's current terms.
- Hosting can be free, but neither permanent availability nor unlimited AI requests is guaranteed.
- The starter practice bank is small and educational, not an official PYQ database.
- Progress is stored in this browser's local storage. It is not synced between devices and may be lost if browser data is cleared.
- No user account system or database is included in this starter version.

## Features

- Responsive dashboard and navigation
- AI Tutor with configurable subject and target level
- Practice Arena with immediate explanations
- Daily study missions
- Mistake log
- Broad topic map for Physics, Chemistry, Mathematics
- Local progress and accuracy snapshots
- Server-side API key handling through Cloudflare Pages Functions

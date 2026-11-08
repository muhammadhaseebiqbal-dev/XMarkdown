<!-- MVP launch update: native browser and React integration added on 2026-11-08. -->
# Deploying the showcase

Static HTML/CSS/ESM examples and docs build into `dist/`. Edited source uses the shared native browser parser. The Node endpoint in `api/render.js` remains a bridge for other languages. Vercel settings are in `vercel.json`; no environment secrets are required.

```sh
npm ci
npm test
npm run build
npm run check:site
npm run site
```

Inspect <http://127.0.0.1:4320> and exercise controls, drawing, math, edits, and narrow layouts. Preview frames omit same-origin permission; asset CORS permits module imports by isolated frames.

```sh
vercel --prod
```

Use an existing authenticated scope/project. Keep `.vercel/`, environment files, credentials, and private documents out of Git. CLI deployment does not itself guarantee GitHub continuous deployment; connect the repository in Vercel separately if needed. CI contains no deployment credentials.

Update `website/config.js`, README URLs, and repository homepage when changing domains, then rebuild. The endpoint limits sources to 32,768 code units and returns no-store. Application code does not persist/log source; hosting may retain access metadata. It has no app-level authentication/rate limiter; operators should configure platform abuse protection and monitor usage. Use the existing hosting plan without automatically upgrading it.

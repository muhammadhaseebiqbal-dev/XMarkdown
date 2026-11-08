<!-- MVP launch update: native browser and React integration added on 2026-11-08. -->
# Deploying the showcase

This guide is for maintainers and forks hosting a copy of this repository's **demo website**, including its optional `/api/render` HTTP bridge. To use XMarkdown in your React application, follow the [installation and integration guide](integrations.md); the renderer runs inside your app and uses your app's normal build and hosting workflow.

Static HTML/CSS/ESM examples and docs build into `dist/`. Edited source uses the shared native browser parser. The Node endpoint in `api/render.js` remains a bridge for other languages. Vercel settings are in `vercel.json`; no environment secrets are required.

`vercel.json` defines the showcase build command, static output folder, API function duration, and HTTP/security headers. It is repository hosting configuration, excluded from the installed package. `npm run build` builds the showcase; consumers can import the package's source exports directly through their bundler.

## Build and review locally

Run these commands from a repository clone using Node.js 22+:

```sh
npm ci
npm test
npm run build
npm run check:site
npm run site
```

Inspect <http://127.0.0.1:4320> and exercise controls, drawing, math, edits, and narrow layouts. Preview frames omit same-origin permission; asset CORS permits module imports by isolated frames.

## Publish your copy on Vercel

With the Vercel CLI installed, sign in and link this checkout to your intended Vercel project/team. For a new fork, run `vercel` once and follow its project setup prompts. Review the resulting preview before publishing production:

```sh
vercel --prod
```

`vercel --prod` publishes the showcase to the linked project's production domain. Check the selected project/team before running it. Keep `.vercel/`, environment files, credentials, and private documents out of Git. CLI deployment does not itself guarantee GitHub continuous deployment; connect the repository in Vercel separately if needed. CI contains no deployment credentials.

Update `website/config.js`, README URLs, and repository homepage when changing domains, then rebuild. The endpoint limits sources to 32,768 code units and returns no-store. Application code does not persist/log source; hosting may retain access metadata. It has no app-level authentication/rate limiter; operators should configure platform abuse protection and monitor usage. Use the existing hosting plan without automatically upgrading it.

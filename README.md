# Individual portfolio (Angular)

The personal profile site: one page that shows the person behind Synapse Technologies — background, education, skills, experience, delivered portfolio works and direct contact details (email, WhatsApp, résumé). It is a separate Angular application that reuses the design system of the company site and is published on its own sub-domain, for example `https://portfolio.synapsetechs.com`.

The .NET API in the `Portfolio` repository powers **both** front ends. There is no second backend and no administration screens here: the content is published from the company dashboard — Personal Profile (name, portrait, story, timeline), Skills & Stacks, Project Works and Site Settings (public email, WhatsApp number, brand name, About Us).

## Start locally

1. Start the API from the `Portfolio` repository. It must answer on `http://localhost:8080` for the default development proxy.
2. In this directory:

```sh
npm install
npm start
```

Open `http://localhost:4300`. `/api/**`, `/hubs/**` and `/health/**` are proxied to the API by `proxy.conf.json`; change its target if your local API uses another port.

## Build and deploy

```sh
npm run build
```

The static bundle is emitted to `dist/individual-profile/browser`. Deploy that folder to the host that serves the profile sub-domain:

1. The site is served by the Cloudflare Worker `portfolio-client` (`Workers & Pages -> portfolio-client`, custom domain `portfolio.synapsetechs.org`) and `wrangler.jsonc` in this repository is its configuration: `assets.directory` points at `dist/individual-profile/browser`, and `assets.not_found_handling = "single-page-application"` answers `/index.html` with a 200 for every navigation request that matches no file, so a hard refresh or an old link such as `/about` boots the profile instead of Cloudflare's empty-body 404. The Git-connected build (`npm run build`, then `npx wrangler deploy`) applies the file on the next push; verify with `curl -o /dev/null -s -w '%{http_code}\n' https://portfolio.synapsetechs.org/about`, which answers 200 once it is live. When the repository already carries a `wrangler.toml`, add the `not_found_handling` line there instead of shipping both files. `public/_redirects` ships with comments only: the Pages-style rule `/*    /index.html   200` is rejected by Workers while the assets are uploaded (`Invalid _redirects configuration: Infinite loop detected in this rule ... [code: 100324]`), so the setting above replaces it, and the file can be deleted if it is ever in the way. `.gitattributes` keeps it at Unix line endings.
2. Serve `config.json` with `Cache-Control: no-store`; the remaining assets are content-hashed and can be cached permanently.
3. Point the sub-domain (`portfolio.synapsetechs.com` or `portfolio.synapsetechs.org`) at that host. Both are already listed in the API's `Runtime:AllowedOrigins`, so cross-origin reads work without a code change.

## Configuration

`public/config.json` is copied into the bundle and read by `src/main.ts` before Angular starts:

| Setting | Meaning |
|---|---|
| `apiBaseUrl` | Public origin of the deployed API without a trailing slash, `https://synapsetechs-api.up.railway.app`. It is ignored on `localhost`, `127.0.0.1` and `[::1]`, where the development proxy is used instead. |
| `toastDurationMs` | Lifetime of dismissible operation notifications |
| `analyticsEnabled` | Whether visits are submitted to the shared analytics endpoint, so profile traffic appears in the company dashboard |

## Content and routes

Everything on the page comes from the public API: `/api/v1/public/profile`, `/settings`, `/timeline`, `/skills`, `/catalogue` and `/projects`. Sections are anchored (`#about`, `#education`, `#skills`, `#works`, `#contact`) and the header links to them.

The page is public and never authenticates, so only CORS matters here: the sub-domain is listed in `Runtime:AllowedOrigins` and the API answers with `Access-Control-Allow-Credentials`. The session and antiforgery cookies belong to the company site and are not used by this project.

## Verification

```sh
npm run typecheck   # development build: AOT + strict template checking
npm run build       # production bundle
```

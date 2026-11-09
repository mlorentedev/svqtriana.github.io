# Publishing the MVP for review (Cloudflare Pages, free plan)

> **Status: not in use.** On 2026-11-09 it was decided not to build a staging
> environment at all. The redesign goes straight to production on GitHub Pages,
> and the review happens against the PR and the checks rather than a preview
> URL. The reason is host reachability: Cloudflare Pages has been serving IP
> bans to Spanish ISPs, so a preview on `*.pages.dev` would be invisible to
> exactly the audience reviewing it, and a preview that the reviewer cannot open
> is worse than no preview. The Cloudflare zone stays where it is — it still
> terminates DNS, TLS and Web Analytics in front of GitHub Pages, none of which
> is affected. This document is kept because it is the only written procedure
> for a preview, and the constraint that produced the decision could change.
> See [dns.md](dns.md) for the live topology.

This **is not the cutover to production**. It is a review URL so the DevOps and
whoever runs the site can see the MVP without touching `svqtriana.com`, its DNS,
its Cloudflare zone or the production repo's Pages configuration.

| Yes | No |
|---|---|
| A **separate** Cloudflare Pages project (`svqtriana-mvp`) | Changing DNS or the `svqtriana.com` zone |
| A `*.pages.dev` URL | Adding `mvp.svqtriana.com` (that does touch the zone) |
| `noindex` and `Disallow /` on the preview | `terraform apply` |
| Deleting the project when the review is over | Changing Settings → Pages on the production repo |

## Option A (recommended): direct upload, no repo connection

The fastest one, and the one that asks for the fewest permissions: Cloudflare
gets no access to the repository, nothing runs on GitHub, and every upload is an
immutable snapshot of `dist/`.

### 1. Requirements

- Node 24 and the repo locally.
- A free Cloudflare account.
- `git` (optional, only for `X-Preview-Commit`).

### 2. Authenticate

```sh
npx --yes wrangler@4 login
```

It opens the browser and creates an OAuth token for **your** user. Do not reuse
the production Terraform token: for the preview an OAuth login is enough, or a
token limited to `Account → Cloudflare Pages → Edit`.

If the account has several accounts, export the right one:

```sh
# PowerShell
$env:CLOUDFLARE_ACCOUNT_ID = "<account_id>"
```

### 3. Create the project once

```sh
npx --yes wrangler@4 pages project create svqtriana-mvp --production-branch mvp
```

### 4. Build and publish

```sh
npm ci
npm run preview:cf
```

`preview:cf` does four things, in this order:

1. `npm run build` regenerates `dist/`.
2. `npm run check:dist` checks the invariants before publishing anything.
3. `scripts/prepare-preview.mjs` prepares `dist/`:
   - it writes `_headers` with the **same CSP** as
     `infra/cloudflare/csp.txt` (the one that will apply in production), plus
     `X-Robots-Tag: noindex, nofollow`, `X-Frame-Options`, `nosniff` and
     immutable caching for `/_astro/*`;
   - it rewrites `robots.txt` with `Disallow: /` so no crawler follows the
     production sitemap from a review URL;
   - it removes `CNAME`, which only GitHub Pages understands.
4. `wrangler pages deploy dist` uploads the result.

The output prints two URLs:

```
https://svqtriana-mvp.pages.dev                 # the mvp branch (stable)
https://<hash>.svqtriana-mvp.pages.dev          # this specific deploy
```

Share the first one with the DevOps; the second is useful to point at an exact
version in a review.

### 5. Iterate

```sh
npm run preview:cf
```

**`npm run build` on its own does not publish**: it only regenerates `dist/`
locally. The `*.pages.dev` site changes when `preview:cf` runs, which rebuilds
and uploads a new deployment. The stable URL
(`https://svqtriana-mvp.pages.dev`) stays the same and serves the latest upload;
the hashed URLs of each previous deployment are kept.

If the browser shows you an old version, force a reload (Ctrl+F5). The HTML is
served without long caching and the assets carry a hash, so it should not be
needed.

## Option B (better for iterating as a team): GitHub + Pages

If the DevOps prefers to review by PR:

1. Push the repo to a **private** repository (or to a dedicated fork/mirror).
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git.
3. Build command: `npm run build`. Output directory: `dist`.
4. Environment variable: `NODE_VERSION=24` (or `24.22.2`).
5. Every push to a branch and every PR generate a preview at
   `<hash>.svqtriana-mvp.pages.dev`.

No secrets are needed: Pages builds from the repo and reads `CHANGELOG.md` for
the footer version. Connecting a Pages project does **not** change the repo or
the production Pages project; even so, if strict separation is wanted, connect a
fork and not the repo that runs the site.

> Careful: in this option the `_headers` from `prepare-preview.mjs` does not run,
> because the Pages build only runs `npm run build`. If you want the CSP and the
> `noindex` through this path too, change the build command to
> `npm run build && node scripts/prepare-preview.mjs`.

## Option C: 10-minute live demo

For a call, with no account and no project:

```sh
npm run build
node scripts/serve-dist.mjs 4321        # terminal 1
cloudflared tunnel --url http://localhost:4321   # terminal 2
```

`cloudflared` is installed separately (`winget install Cloudflare.cloudflared`
or from <https://github.com/cloudflare/cloudflared/releases>). The
`*.trycloudflare.com` URL is ephemeral and changes on every start. It is not
usable for durable sharing.

## Protecting the preview (optional, free)

If you do not want the MVP to be public:

1. Cloudflare Dashboard → Zero Trust → Access → Applications → Add an
   application → Self-hosted.
2. Application domain: `svqtriana-mvp.pages.dev` (and `*.<proyecto>.pages.dev`
   if you want to cover the hashed previews too).
3. Policy: `Emails` with the addresses of whoever is going to review, and
   **One-time PIN** login (no IdP to configure).

The Zero Trust Free plan covers up to **50 users**. Sign-up may ask for payment
details to verify the account, but the Free plan does not charge.

## Free plan limits (checked 2026-11)

| Limit | Free |
|---|---|
| Static requests and bandwidth | Unlimited |
| Builds | 500/month, 1 concurrent, 20 min per build |
| Files per site | 20 000 |
| Size per file | 25 MiB |
| Custom domains per project | 100 |
| Rules in `_headers` | 100 |
| Access users | 50 |

The site has 6 HTML files and a few hundred assets: that leaves a very wide
margin.

## Cleaning up

```sh
npx --yes wrangler@4 pages project delete svqtriana-mvp
```

And delete the Access application if you created it. There is no DNS record to
undo: **the `svqtriana.com` zone has not been touched**.

## What to review (DevOps checklist)

```sh
npm ci
npm run verify                              # types, build, invariants, Playwright
npm run build && npm run check:dist
terraform -chdir=infra/cloudflare fmt -check -recursive
terraform -chdir=infra/cloudflare init -backend=false
terraform -chdir=infra/cloudflare validate
```

On the MVP URL:

- [ ] `/`, `/nosotros`, `/productos` and `/media` return 200 with no `.html`
      and no trailing slash.
- [ ] `/robots.txt`, `/sitemap.xml`, `/ads.txt`, `/llms.txt`, `/sw.js` return
      200; a nonexistent route returns 404 with the error page.
- [ ] Canonical, `og:url` and sitemap agree and carry no `.html` and no trailing
      slash.
- [ ] `/encuentro` returns 404: the route was removed with the redesign.
- [ ] The videos are YouTube links; there are no YouTube iframes.
- [ ] Mobile menu at 375 px, closes with Escape and with a click outside.
- [ ] Console free of `Refused to load` (the preview CSP is the production one).
- [ ] Headers: `curl -sI https://svqtriana-mvp.pages.dev/ | grep -iE 'content-security-policy|x-robots-tag|x-frame-options'`.
- [ ] Mobile Lighthouse within the thresholds in `lighthouserc.json`.
- [ ] Product decisions closed: link-out to videos instead of iframes, no
      visible ads, Fraunces as display.

## What the preview does NOT prove

- **Cloudflare Web Analytics**: the beacon is injected by the production zone,
  not by a Pages project. Its absence in the preview is expected.
- **Zone headers**: they are applied by `infra/cloudflare/headers.tf`, not by
  `_headers`. The preview uses a copy generated from the same `csp.txt`; the
  rest of the zone headers are only verified after `apply` (F7).
- **GitHub Pages behaviour**: the preview serves from Pages; the route fallback
  is the same one `scripts/serve-dist.mjs` exercises, but the real production
  host stays GitHub Pages until the cutover.

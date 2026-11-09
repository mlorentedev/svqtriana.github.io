# ADR-001: GitHub Pages as the origin, Cloudflare in front

## Status

Accepted

## Date

2026-11-09

## Context

`svqtriana.com` is a static Astro site: six HTML files and a few hundred assets,
no server-side runtime. The request path, verified 2026-09-04 from the response
headers themselves, is:

```
visitor -> Cloudflare (DNS + proxy, orange cloud) -> Fastly (GitHub Pages CDN) -> GitHub Pages
```

`server: cloudflare` sits in front of `via: 1.1 varnish` and
`x-github-request-id`, which is what proves the chain rather than assuming it.

Two facts constrain the choice:

1. **GitHub Pages cannot send custom response headers.** Cloudflare can, and the
   orange cloud is what makes `infra/cloudflare/` possible at all. The CSP, HSTS,
   frame options and the `/_astro/` cache policy have no other home.
2. **The 2026-11-09 redesign needed a review surface before cutover.** That is
   what turned a settled hosting arrangement into a decision.

The site is also read mostly by a local audience in Spain, which is the detail
that eliminated the obvious alternative.

## Options Considered

1. **Cloudflare Pages as the production host.** Rejected on reachability.
   Cloudflare Pages has been serving IP bans to Spanish ISPs (recorded
   2026-11-09 from the operator's observation; not measured inside this repo —
   the decision rests on the consequence, not on the mechanism). A host the
   audience cannot reach is not a candidate regardless of its technical merits,
   and it would have removed the origin entirely.
2. **Cloudflare Pages as a preview host only, GitHub Pages in production.**
   Rejected for the same reason, one layer out: a `*.pages.dev` preview would be
   invisible to exactly the reviewers it exists for, and a preview the reviewer
   cannot open is worse than no preview. The procedure was written before this
   was understood and is kept in `docs/runbooks/preview-cloudflare.md` marked
   *not in use*, because the constraint that produced it could change.
3. **GitHub Pages as the origin, the Cloudflare zone in front, no staging
   environment.** Selected.

## Decision

- GitHub Pages serves the site, built by `.github/workflows/deploy.yml` on merge
  to `main`. Merging is publishing.
- DNS, TLS and Web Analytics stay in the Cloudflare zone in front of it,
  orange-clouded. That zone is retained deliberately: it terminates DNS and TLS
  and injects the analytics beacon, none of which is affected by the Pages
  reachability problem.
- **No staging or preview environment.** Review happens against the PR and its
  checks, not against a preview URL.
- The stricter CSP in `infra/cloudflare/csp.txt` is applied through Terraform
  after the site is live, not by the deploy workflow. The deploy path cannot
  change response headers.
- Revisit this ADR if the Pages reachability constraint changes, or if GitHub
  Pages gains custom response headers.

## Rationale

- **Reachability is the one property a public site cannot trade away.** Two of
  the three options failed on it alone, and both of them failed in a way that
  looks fine from the outside: the site is up, it is just invisible to the
  people it is for.
- **Keeping the Cloudflare zone costs nothing and buys the one capability GitHub
  Pages lacks.** Without it, the CSP, HSTS and the immutable `/_astro/` caching
  would have no implementation at all — not a worse one, none.
- **Analytics were already covered.** Cloudflare Web Analytics auto-injects from
  the production zone, so a Pages-hosted deployment would have added no
  measurement, only a second place to look.
- **Dropping the staging environment removed a class of drift rather than
  accepting one.** A preview would have needed its own CSP copy, its own
  `robots.txt` and its own `_headers` file, and would still not have proven the
  zone headers, the Web Analytics beacon or GitHub Pages' own route fallback.
  The preview could not have verified what it was introduced to verify.

## Consequences

### Positive

- Audience reachability is not at the mercy of a third-party product's abuse
  heuristics.
- Custom response headers are possible. The CSP, HSTS and `/_astro/` caching all
  live in `infra/cloudflare/` as reviewable Terraform.
- One host to reason about in production, and the deploy path is the merge.
- No preview/production divergence to keep in sync, because there is no preview.

### Negative

- **Two CDNs in the path.** Purging Cloudflare's cache does not purge Fastly's,
  and GitHub Pages sends `max-age=600` of its own.
- **Every header change is a Terraform apply against production.** Slower and
  higher blast radius than editing a file in the repo, and it is the only path
  the headers have.
- **Review happens without a URL.** Mobile layout and Lighthouse verification
  can only be done after merge.
- Cloudflare Pages' build previews and deploy hooks are unavailable, so no
  pre-merge verification of the real host is possible.

### Neutral

- `CNAME` in the repository root still matters: it tells GitHub Pages which
  custom domain to serve, independently of DNS.
- Squarespace remains registrar of record but no longer answers queries for the
  domain.
- If Cloudflare is ever removed from the path, `docs/runbooks/dns.md` holds the
  origin records to restore.

## References

- [`docs/runbooks/dns.md`](../runbooks/dns.md) — the live topology and the historical records.
- [`docs/runbooks/preview-cloudflare.md`](../runbooks/preview-cloudflare.md) — the abandoned preview procedure, marked not in use.
- [`infra/cloudflare/`](../../infra/cloudflare/) — where the headers actually live.
- [`.github/workflows/deploy.yml`](../../.github/workflows/deploy.yml) — the build and publish path.
- [`docs/lessons/2026-11-09-a-check-that-runs-before-the-deploy.md`](../lessons/2026-11-09-a-check-that-runs-before-the-deploy.md) — the gate that verified production before the deploy had finished.

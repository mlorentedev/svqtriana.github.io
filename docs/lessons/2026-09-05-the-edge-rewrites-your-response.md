# The edge modifies your response after you write it

**2026-09-05.** Three separate cases in one session, all invisible from the
repository and from a local dev server:

- the Cloudflare Web Analytics beacon, injected only for browser User-Agents,
  so a default `curl` reports it missing on a site where it is working
- an inline `<script>` from JavaScript Detections, which no CSP hash or nonce
  can allow because it carries a per-request ray id
- `robots.txt` rewritten to block eight AI crawlers, with
  `# BEGIN Cloudflare Managed content` markers around content nobody in the
  repository wrote: 8 lines in git, 68 served (issue #24)

**The silent one is the dangerous one.** The CSP case shouts in the console.
The `robots.txt` case returns 200 with a plausible-looking file, and the
crawlers simply stop arriving. It undid the whole reason the pages had been
restructured. It surfaced by chance: a weight-1 Lighthouse audit flagging
`Content-Signal` as an unknown directive, on a file not looked at since it was
written.

**The only check that works is asking production for what you think you are
serving and diffing it against the repo, with a realistic User-Agent, on a
schedule.** Nobody has to push anything for the edge to start rewriting a
response, so a check that only runs on pull requests would never see it. That
is `.github/workflows/edge-drift.yml`: daily, browser UA, diffs `robots.txt`,
`llms.txt`, `ads.txt` and `sitemap.xml` against the repository and asserts zero
inline scripts in the served HTML of all five pages.

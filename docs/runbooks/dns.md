# DNS and the request path for svqtriana.com

## Who serves what

Verified 2026-09-04:

```sh
$ dig +short NS svqtriana.com
vita.ns.cloudflare.com.
denver.ns.cloudflare.com.

$ dig +short svqtriana.com A
172.67.141.193
104.21.27.61
```

Those are Cloudflare nameservers and Cloudflare anycast addresses, not GitHub
Pages ones. So the chain is:

```
visitor -> Cloudflare (DNS + proxy) -> Fastly (GitHub Pages' CDN) -> GitHub Pages
```

Confirmed from the response itself — `server: cloudflare` in front of
`via: 1.1 varnish` and `x-github-request-id`:

```sh
$ curl -sI https://svqtriana.com/ | grep -iE 'server|via|x-github'
server: cloudflare
via: 1.1 varnish
x-github-request-id: ...
```

The orange cloud being on is what makes `infra/cloudflare/` possible at all:
GitHub Pages cannot send custom response headers, and Cloudflare can.

## What this means in practice

- **DNS records are changed in Cloudflare**, not at the registrar. Squarespace
  may still be the registrar of record, but nameserver delegation means it no
  longer answers queries for this domain.
- **The origin IPs are hidden.** Visitors never see the GitHub Pages addresses;
  they see Cloudflare's. Cloudflare holds the `185.199.108-111.153` A records
  (or a CNAME to `mlorentedev.github.io`) internally as the origin.
- **`CNAME` in the repository root still matters.** It tells GitHub Pages which
  custom domain to serve, independently of DNS.
- **Purging Cloudflare's cache does not purge Fastly's.** There are two CDNs in
  the path. GitHub Pages sends `max-age=600`, so its own layer expires quickly,
  but a Cloudflare purge only clears the outer one.

## Historical: the Squarespace records

Before delegation, DNS was answered by Squarespace with GitHub Pages' addresses
directly. Kept because it is what Cloudflare's origin settings should still
contain, and what to restore if Cloudflare is ever removed from the path:

| Host | Type  | TTL   | Data |
|------|-------|-------|------|
| @    | A     | 1 hr  | 185.199.108.153 |
| @    | A     | 1 hr  | 185.199.109.153 |
| @    | A     | 1 hr  | 185.199.110.153 |
| @    | A     | 1 hr  | 185.199.111.153 |
| www  | CNAME | 4 hrs | mlorentedev.github.io |

The apex uses `A` records rather than a CNAME because a CNAME at the apex is not
valid DNS. `www` currently answers with a 301 to the apex.

## Checking it is healthy

```sh
# Both forms reachable, http redirects to https
for h in svqtriana.com www.svqtriana.com; do
  echo "$h https=$(curl -s -o /dev/null -w '%{http_code}' https://$h/)" \
       "http=$(curl -s -o /dev/null -w '%{http_code}' http://$h/)"
done
```

Expect `svqtriana.com https=200 http=301` and `www.svqtriana.com https=301
http=301`.

## Is it safe to keep this in a public repository?

Yes, for this site — but the reasoning matters more than the answer, because it
does not generalise.

**DNS records are public by construction.** Anyone can `dig svqtriana.com`.
Writing them down leaks nothing that is not already answerable by a query.

**The thing that is genuinely sensitive is the origin address behind a proxy.**
Half the point of putting Cloudflare in front of a server is that attackers
cannot reach the server directly; publish its address and they bypass the proxy,
and with it the WAF and rate limiting, by connecting straight to the origin.

That does not apply here. The origin is GitHub Pages' `185.199.108-111.153`,
which are shared anycast addresses, documented publicly by GitHub, and serving
millions of sites. Connecting to them directly achieves nothing: they route by
`Host` header and return the same public content. **If the origin were a
personal VPS, this section would say the opposite** - the addresses would belong
in the secrets store, not in a runbook.

**What never goes in the repository, public or not:** API tokens, `zone_id`,
`account_id`, and any non-public hostname. Those are variables in
`infra/cloudflare/`, with `*.tfvars` gitignored and the token injected per
process via `dotf secrets run`.

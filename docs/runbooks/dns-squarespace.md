# DNS Configuration — Squarespace → GitHub Pages

DNS records for the `svqtriana.com` domain, managed in the Squarespace DNS
control panel, pointing the apex and `www` at GitHub Pages (served from this
repo via the `CNAME` file).

## Records

| Host | Type | Priority | TTL  | Data |
|------|------|----------|------|------|
| @    | A    | N/A      | 1 hr | 185.199.111.153 |
| @    | A    | N/A      | 1 hr | 185.199.110.153 |
| @    | A    | N/A      | 1 hr | 185.199.109.153 |
| @    | A    | N/A      | 1 hr | 185.199.108.153 |
| www  | CNAME | N/A     | 4 hrs | mlorentedev.github.io |

The four `A` records at `185.199.108-111.153` are the GitHub Pages IP addresses.
The `www` CNAME points at the GitHub Pages default host for the
`mlorentedev.github.io` account. The apex is served via the `A` records (not a
CNAME, since CNAME at the apex is not standard DNS); GitHub Pages serves the
site for the apex domain based on the `CNAME` file in this repo.

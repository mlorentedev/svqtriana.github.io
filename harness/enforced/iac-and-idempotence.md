- **Zero manual operations:** never perform ad-hoc manual changes on the Cloudflare
  zone, the DNS records or the Pages project. If it is not in `infra/cloudflare/`, it
  is not a change this repository can reproduce.
- **Strict IaC and idempotence:** every configuration or environment change MUST be
  codified as reproducible Terraform and verified idempotent — a second `apply` on an
  unchanged plan reports no changes. A dashboard change made to unblock a deploy is
  debt: codify it before closing the ticket.
- **`terraform fmt -check -recursive`, `terraform init -backend=false` and
  `terraform validate` run in CI.** A plan that only works with a local state file is
  not a plan.
- **In-flight documentation and zero debt:** lessons, runbooks and issues are recorded
  as they are learned, in `docs/lessons/`, `docs/runbooks/` and the board, never
  deferred to a later pass.

# Harness

The reviewer configuration this repository runs on, ported from the dotfiles harness
(`dotfiles/harness/`). `node scripts/check-harness.mjs` is the guard; it runs in CI as
the `guards` job of `.github/workflows/checks.yml` and is part of `npm run verify`.

| File | What it decides |
| --- | --- |
| `reviewer-pool.json` | Which models the reviewer can be, and what credential reaches each |
| `review-attestation.json` | What counts as a review, what counts as a refusal, who may clear the gate |
| `enforced/*.md` | Standing rules, in the form they are injected into an agent's context |
| `manifest.json` | What was ported and what was deliberately not, with the reason |

## Why a guard, and not just the JSON

Nothing reads these files at build time. A registry value that has drifted from the
workflow it describes still parses, still looks authoritative, and still answers the
gate's question with the wrong answer. The drift is invisible until a human remembers
that two files are related — which is the same as never.

So every coupling is asserted: `triage.standing` equals the `author_association`
allow-list in `pr-agent.yml`; the triage marker still appears in `review-attested.yml`;
every `classification.classes` entry is asked for by name in `.pr_agent.toml`; every
model configured in `.pr_agent.toml` is declared by a pool member, and no two members
declare the same model. Each of those was a real silent mismatch at some point.

The guard fails closed on purpose. Run it before you trust a green reviewer:

```sh
node scripts/check-harness.mjs
```

## The scope boundary

The dotfiles harness deploys into an agent home directory (`~/.claude`, `~/.gemini`,
`~/.codex`) and mirrors vault subpaths (`00_meta/agents`, `00_meta/skills`,
`00_meta/patterns`). This is a static site with two registries and a CI guard; porting
the deploy machinery would import a contract with no second party.

`manifest.json`'s `not_ported` lists what was left out and why. Read it before adding a
file here: if the reason no longer holds, that is the cue to port the file, and if you
port it, delete the entry in the same commit.

## Adding a pool member

A member needs `id`, `runner`, `model`, `role`, `vendor`, `why`, and either `secret_id`
or `auth` — an arm reached by neither never runs, and nothing reports it. Add
`pr_agent.model` only if `.pr_agent.toml` names the same string, and add the string to
`.pr_agent.toml` only after the secret exists in the repository.

The pool excludes the `anthropic` vendor: no Anthropic review credential is declared
here, and importing a member whose secret is not declared is the exact defect the
dotfiles SSOT records against itself. Claude-class models also implement nearly every
change in this repository, and a reviewer must not be the implementer.

## Adding a finding class

Three things move together, and the guard checks all three: the class name in
`classification.classes`, the literal `Class: <NAME>` line in `.pr_agent.toml`'s review
instructions, and the reading side in the triage query. A class the reviewer is not
asked to write cannot be read back — a gradation written as prose leaves every finding
unclassified, and an unclassified queue reads as "nothing to see".

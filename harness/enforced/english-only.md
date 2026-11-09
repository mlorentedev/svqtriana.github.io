- **English only** in git/GitHub artifacts: commit messages, branch names, PR/issue
  titles and bodies, code comments, workflow `name:`/`run:` text, and script output.
  Conversation with the user may be in any language; the durable record is English.
- **The site is the one exception, and it is a content exception, not a language
  exception.** Everything a visitor reads — page copy, `site.ts` strings, `robots.txt`
  prose for humans, `/llms.txt`, JSON-LD `name`/`description` values, the sitemap
  `<title>` — is Spanish, because the audience is Spanish. A file holds one language:
  never a Spanish paragraph beside an English one in the same document.
- **Documentation follows the artifact it describes, not the site.** `README.md`,
  `CHANGELOG.md`, `docs/**`, `infra/**` and `.pr_agent.toml` are English even though
  they describe a Spanish site.

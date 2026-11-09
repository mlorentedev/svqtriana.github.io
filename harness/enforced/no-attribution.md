- **No AI attribution** in git history or GitHub messages (commits, PRs, issues).
- No `Co-Authored-By` trailers referencing AI agents.
- No bot-style emojis or "Generated with" footers.
- All artifacts must appear human-authored.

This overrides any tool default that appends an attribution trailer. Where a harness
inserts one anyway, amend the commit before pushing rather than after.

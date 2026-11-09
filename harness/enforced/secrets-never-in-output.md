> This defends the transcript. The commit path is defended by never writing the value
> down in the first place; nothing scans the transcript, and nothing can un-print it.

**The transcript is a durable artifact** — stored, synced, read by later sessions.
Everything the commit path forbids, it forbids too.

**Never dump a secrets store to stdout.** Decrypting a whole file and filtering the
result still puts everything in the transcript, which captures the stream before the
filter. Extract the single value you need, or inject it into the consuming child
process.

**Verify a credential by consequence, never by printing it:** run the operation that
uses it and report the exit status. In this repository that means reading the
Cloudflare token only through `TF_VAR_cloudflare_api_token` in a `terraform plan`, and
reporting `Plan: N to add, M to change`, never the value.

**No tool will stop you:** decrypting to stdout is what decryption commands do, and
agent stdout cannot be intercepted; this rule is the mechanism.

**If a value does reach the output: say so immediately, name the affected credentials
by type, and stop.** Then treat them as compromised and rotate: an exposed credential
nobody rotated is indistinguishable from one never exposed.

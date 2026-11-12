#!/usr/bin/env node
/**
 * Checks the reviewer harness under harness/ against the files it is coupled to.
 *
 * Every check here exists because the coupling is silent: a registry value that
 * no longer matches the workflow still parses, still looks authoritative, and
 * still answers the gate's question with the wrong answer. Nothing reads these
 * files at build time, so without this the drift is only found by a human
 * remembering two files are related.
 *
 * Usage: node scripts/check-harness.mjs
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => readFileSync(join(ROOT, relative), 'utf8');

const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

const ATTESTATION = 'harness/review-attestation.json';
const POOL = 'harness/reviewer-pool.json';
const MANIFEST = 'harness/manifest.json';
const PR_AGENT_TOML = '.pr_agent.toml';
const PR_AGENT_WORKFLOW = '.github/workflows/pr-agent.yml';
const REVIEW_ATTESTED_WORKFLOW = '.github/workflows/review-attested.yml';

for (const file of [ATTESTATION, POOL, MANIFEST, PR_AGENT_TOML, PR_AGENT_WORKFLOW, REVIEW_ATTESTED_WORKFLOW]) {
  check(existsSync(join(ROOT, file)), `${file} is missing`);
}
if (failures.length > 0) {
  console.error(`\n${failures.length} failure(s) in the harness:\n`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

const attestation = JSON.parse(read(ATTESTATION));
const pool = JSON.parse(read(POOL));
const manifest = JSON.parse(read(MANIFEST));
const toml = read(PR_AGENT_TOML);
const workflow = read(PR_AGENT_WORKFLOW);
const attestedWorkflow = read(REVIEW_ATTESTED_WORKFLOW);

// The manifest is the inventory of what was ported from the dotfiles SSOT. Its
// only failure mode is naming a file that is not there: the enforced rules are
// prose nothing executes, so a broken path means a rule that is silently absent
// while the manifest says it is in force.
const enforcedIds = new Set();
for (const entry of manifest.enforced ?? []) {
  check(typeof entry.id === 'string' && entry.id.length > 0, `${MANIFEST}: enforced entry without id`);
  check(!enforcedIds.has(entry.id), `${MANIFEST}: duplicate enforced id ${entry.id}`);
  enforcedIds.add(entry.id);
  check(
    typeof entry.file === 'string' && entry.file.startsWith('harness/enforced/'),
    `${MANIFEST}: ${entry.id} must point inside harness/enforced/`,
  );
  if (typeof entry.file === 'string') {
    const present = existsSync(join(ROOT, entry.file));
    check(present, `${MANIFEST}: ${entry.id} names ${entry.file}, which does not exist`);
    check(present && read(entry.file).trim().length > 0, `${MANIFEST}: ${entry.id} points at an empty file`);
  }
}

// A manifest that omits a file on disk, or lists a registry other than the two
// this script validates, is an inventory of a different repository.
const onDisk = existsSync(join(ROOT, 'harness/enforced'))
  ? readdirSync(join(ROOT, 'harness/enforced')).filter((name) => name.endsWith('.md'))
  : [];
const declaredFiles = new Set((manifest.enforced ?? []).map((entry) => `harness/enforced/${entry.file?.split('/').pop()}`));
const unlisted = onDisk.filter((name) => !declaredFiles.has(`harness/enforced/${name}`));
check(unlisted.length === 0, `${MANIFEST}: ${unlisted.join(', ')} on disk but not declared in enforced`);

const registryFiles = (manifest.registries ?? []).map((entry) => entry.file).sort();
check(
  registryFiles.join(',') === [ATTESTATION, POOL].sort().join(','),
  `${MANIFEST}: registries is [${registryFiles.join(', ')}] but this script validates ${ATTESTATION} and ${POOL}`,
);

// not_ported is the record of what was deliberately left out. An entry without a
// reason is an omission dressed as a decision.
for (const entry of manifest.not_ported ?? []) {
  check(typeof entry.id === 'string' && entry.id.length > 0, `${MANIFEST}: not_ported entry without id`);
  check(
    typeof entry.why === 'string' && entry.why.length >= 40,
    `${MANIFEST}: not_ported ${entry.id} has no substantive why`,
  );
}

// Both registries are ports of the dotfiles SSOT. The $comment is what records
// which values are measured locally and which are inherited, so a copy without
// it reads as if every claim had been verified here.
for (const [file, registry] of [[ATTESTATION, attestation], [POOL, pool], [MANIFEST, manifest]]) {
  check(Array.isArray(registry.$comment) && registry.$comment.length > 0, `${file}: missing $comment`);
}

// Reviewers, and the markers that classify their output.
const logins = new Set();
for (const reviewer of attestation.reviewers ?? []) {
  check(typeof reviewer.login === 'string' && reviewer.login.length > 0, `${ATTESTATION}: reviewer without login`);
  check(!logins.has(reviewer.login), `${ATTESTATION}: duplicate reviewer ${reviewer.login}`);
  logins.add(reviewer.login);
  check(typeof reviewer.why === 'string' && reviewer.why.length > 0, `${ATTESTATION}: ${reviewer.login} has no why`);
  const declined = reviewer.declined_markers ?? [];
  const reviewed = reviewer.review_markers ?? [];
  check(Array.isArray(declined), `${ATTESTATION}: ${reviewer.login} declined_markers is not an array`);
  check(reviewed.length > 0, `${ATTESTATION}: ${reviewer.login} declares no review_marker, so it can never attest`);
  // A string in both lists makes the verdict depend on which list is read first.
  const both = declined.filter((marker) => reviewed.includes(marker));
  check(both.length === 0, `${ATTESTATION}: ${reviewer.login} lists ${both.join(', ')} as both decline and review`);
}

// triage.standing is what stops an arbitrary commenter clearing the disposition
// step a merge is held to, and the shared PR-Agent job asks the same question of
// the same set before running a slash command from a public comment. This reads
// the caller's concurrency list, which must equal the shared job's (ci-workflows
// tests that for the kit), so the shared gate itself is not read here.
const standing = attestation.triage?.standing ?? [];
const trusted = workflow.match(/contains\(fromJSON\('\[([^\]]*)\]'\)/);
check(trusted !== null, `${PR_AGENT_WORKFLOW}: no author_association allow-list found`);
if (trusted) {
  const inWorkflow = trusted[1]
    .split(',')
    .map((value) => value.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean)
    .sort();
  const inRegistry = [...standing].sort();
  check(
    inWorkflow.join(',') === inRegistry.join(','),
    `${ATTESTATION}: triage.standing is [${inRegistry.join(', ')}] but ${PR_AGENT_WORKFLOW} trusts [${inWorkflow.join(', ')}]`,
  );
}

// The triage heading is declared once and matched by regex in the older gate.
const triageMarker = attestation.triage?.marker ?? '';
check(triageMarker.startsWith('#'), `${ATTESTATION}: triage.marker must be a heading`);
const markerText = triageMarker.replace(/^#+\s*/, '');
check(
  attestedWorkflow.includes(markerText),
  `${REVIEW_ATTESTED_WORKFLOW}: does not match the triage marker "${markerText}"`,
);

// classification is only real if the reviewer is asked for the exact line: a
// gradation the model writes as prose cannot be read back, and the queue would
// report every finding as unclassified.
const classification = attestation.classification ?? {};
const prefix = classification.prefix ?? '';
const classes = classification.classes ?? [];
check(prefix.trim().length > 0, `${ATTESTATION}: classification.prefix is empty`);
check(classes.length >= 2, `${ATTESTATION}: classification.classes needs at least two classes`);
for (const name of classes) {
  check(
    toml.includes(`${prefix}${name}`),
    `${PR_AGENT_TOML}: does not ask for "${prefix}${name}", which ${ATTESTATION} reads back`,
  );
}
for (const login of classification.reviewers ?? []) {
  check(logins.has(login), `${ATTESTATION}: classification names reviewer ${login}, which is not registered`);
}

// The pool: every member needs the fields the launcher and the gate read.
const ids = new Set();
for (const member of pool.pool ?? []) {
  check(typeof member.id === 'string' && member.id.length > 0, `${POOL}: member without id`);
  check(!ids.has(member.id), `${POOL}: duplicate member ${member.id}`);
  ids.add(member.id);
  for (const field of ['runner', 'model', 'role', 'vendor', 'why']) {
    check(
      typeof member[field] === 'string' && member[field].length > 0,
      `${POOL}: ${member.id} is missing ${field}`,
    );
  }
  // An arm is reached either by a key or by a login. Naming a secret that is
  // not declared, or no credential at all, is how an arm comes to never run.
  check(
    typeof member.secret_id === 'string' || typeof member.auth === 'string',
    `${POOL}: ${member.id} declares neither secret_id nor auth`,
  );
  // The local standing rule, stricter than the SSOT's: the reviewer must not be
  // the implementer, and Claude-class models implement nearly every change here.
  check(member.vendor !== 'anthropic', `${POOL}: ${member.id} is Anthropic; this pool excludes that vendor`);
  check(
    member.signs === undefined,
    `${POOL}: ${member.id} declares signs="${member.signs}", but no second-signature rule is ported`,
  );
}

// PR-Agent's model chain comes from the shared workflow (mlorentedev/ci-workflows
// pr-agent.yml): its NaN steps take the model and fallbacks from the pinned dotf's
// embedded pool and set the model capacity through the environment, which sits above
// .pr_agent.toml. A value restated here would be silently overridden, so the toml must
// not carry one. The pool-internal role checks below still hold for this repository's
// own registry.
for (const key of ['model', 'fallback_models', 'custom_model_max_tokens']) {
  check(
    !new RegExp(`^\\s*${key}\\s*=`, 'm').test(toml),
    `${PR_AGENT_TOML}: ${key} is set by the shared workflow's environment; a value here is ` +
      `silently overridden, so remove it`,
  );
}
const ciMembers = (pool.pool ?? []).filter((member) => member.pr_agent?.model);
const primaries = ciMembers.filter((member) => member.role === 'primary');
check(
  primaries.length === 1,
  `${POOL}: expected exactly one CI member with role="primary", found ${primaries.length}`,
);
for (const member of ciMembers) {
  if (member.role === 'primary') continue;
  check(
    member.role === 'fallback',
    `${POOL}: ${member.id} is wired to CI but its role is "${member.role}", not "fallback"`,
  );
}
for (const member of pool.pool ?? []) {
  if (member.pr_agent?.model) continue;
  check(
    member.role === 'member',
    `${POOL}: ${member.id} has no pr_agent block, so CI never calls it, but its role is ` +
      `"${member.role}" — only members wired to CI can be primary or fallback`,
  );
}

// The prompt budget must sit BELOW the model capacity, otherwise the guardrail is inert
// and every diff is sent whole (run 42562380120: a 97390-token diff declared "under
// limit: 200000"). The capacity is the shared workflow's CONFIG__CUSTOM_MODEL_MAX_TOKENS,
// set on every PR-Agent step at the pinned tag; re-check it when the pin moves. The
// shared NaN step sets neither max_model_tokens nor ai_timeout, so both stay stated here.
// The job's time budget is the shared workflow's too (a 12-minute NaN step with
// retry_same_model_on_timeout off), so the chain arithmetic this file used to run
// against the caller's timeout-minutes no longer has a caller value to read.
// The capacity is tied to the exact pin it was read from, so a pin bump fails here
// until someone re-reads CONFIG__CUSTOM_MODEL_MAX_TOKENS at the new SHA and moves both.
const SHARED_MODEL_CAPACITY = 200000;
const SHARED_CALLER =
  /uses: mlorentedev\/ci-workflows\/\.github\/workflows\/pr-agent\.yml@2355330358344bb08c0b7a305be4ed6488f23d0c # v0\.6\.0$/m;
const promptBudget = Number(toml.match(/^\s*max_model_tokens\s*=\s*(\d+)/m)?.[1]);
const aiTimeout = Number(toml.match(/^\s*ai_timeout\s*=\s*(\d+)/m)?.[1]);

check(
  SHARED_CALLER.test(workflow),
  `${PR_AGENT_WORKFLOW}: must call mlorentedev/ci-workflows' pr-agent.yml at the pin ` +
    `SHARED_CALLER names; on a pin bump, re-read the capacity at the new SHA and move both`,
);
check(
  Number.isFinite(promptBudget),
  `${PR_AGENT_TOML}: max_model_tokens must be stated as an integer`,
);
check(
  Number.isFinite(aiTimeout),
  `${PR_AGENT_TOML}: [config] ai_timeout must be stated; without it PR-Agent silently ` +
    `uses upstream's 120s, which a reasoning-class model does not answer in`,
);
if (Number.isFinite(promptBudget)) {
  check(
    promptBudget < SHARED_MODEL_CAPACITY,
    `${PR_AGENT_TOML}: max_model_tokens (${promptBudget}) must be BELOW the shared ` +
      `workflow's model capacity (${SHARED_MODEL_CAPACITY}). At or above it the prompt guardrail ` +
      `never fires and every diff is sent whole — the defect behind run 42562380120.`,
  );
}

if (failures.length > 0) {
  console.error(`\n${failures.length} failure(s) in the harness:\n`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `ok: ${logins.size} reviewers, ${ids.size} pool members, ${classes.length} finding classes, ` +
    `${enforcedIds.size} enforced rules, standing set aligned`,
);

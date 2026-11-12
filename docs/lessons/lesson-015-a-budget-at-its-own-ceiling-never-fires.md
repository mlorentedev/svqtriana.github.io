---
id: "lesson-015-a-budget-at-its-own-ceiling-never-fires"
type: lesson
status: active
title: "A budget set at its own ceiling never fires"
created: "2026-11-09"
owner: manu
tags: [svqtriana, lesson]
---

# A budget set at its own ceiling never fires

## What happened

The PR reviewer is configured with two token numbers that look like a pair and
are not one. `custom_model_max_tokens` declares how much the model can hold, so
LiteLLM stops truncating prompts at the registry's stale figure.
`max_model_tokens` is the budget for one prompt, and when the diff exceeds it
PR-Agent clips the patch and reviews what fits.

Both were set to `200000`. The review of a 244-file PR then logged:

```
Tokens: 97390, total tokens under limit: 200000, returning full diff.
```

97k went out whole, twice to each of two models, and all four inference calls
were killed by `litellm.Timeout` at 120.1s to 120.7s. Eight minutes, no review.
The budget was not violated — it was set where nothing this repository produces
can reach it.

## Mechanism

A threshold has to sit strictly below the range it governs. Setting it equal to
the model's capacity makes it arithmetic decoration: the condition it guards
(`diff > budget`) cannot be true while the model is the binding constraint, so
the clipping path is dead code and the setting is indistinguishable from absent.

The same shape as a glob that matches nothing, and it fails the same way. Both
produce a configuration that reads as protective and behaves as if unwritten.
The difference is where the emptiness lives: a vacuous glob has no subjects, a
saturated budget has no reachable subjects.

This arrived as a port defect, and it was the second of its kind. The settings
came across from the SSOT with the numbers intact and the setting that makes
them safe left behind — in `e640cad` it was the CI chain roles, here it was
`CONFIG__AI_TIMEOUT`, which the SSOT sets to 360 and the port dropped, falling
back to upstream's 120. The SSOT itself keeps `200000/200000` and survives on
the longer timeout; that is a deliberate documented choice, but it means the
SSOT's own budget never fires either.

## What prevents it now

- `max_model_tokens` is `32000`, upstream's default, strictly below the
  `200000` capacity declaration.
- `scripts/check-harness.mjs` asserts `max_model_tokens < custom_model_max_tokens`
  and that the whole model chain fits the job: `chain x 2 attempts x ai_timeout
  + 300s setup <= timeout-minutes x 60`. Both were proven to fail by inverting
  each number, then restored.
- The workflow's "no review was published" step no longer asserts a single
  cause. It names the two measured shapes — `litellm.Timeout` and
  `litellm.RateLimitError` — and says which log line distinguishes them, because
  the previous text blamed concurrency exhaustion for a timeout and sent the
  diagnosis the wrong way.

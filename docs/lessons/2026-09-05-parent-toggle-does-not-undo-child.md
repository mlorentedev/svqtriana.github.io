# Turning off a parent feature does not turn off what it turned on

**2026-09-05.** Cloudflare's Bot Fight Mode enables JavaScript Detections.
Turning Bot Fight Mode off in the dashboard leaves JavaScript Detections on,
and on the Free plan it has no dashboard control of its own. The API is
unambiguous where the UI is not:

```
fight_mode = False      <- off, as the dashboard shows
enable_js  = True       <- still on, with nowhere to click
```

This cost about 40 minutes across several rounds of sending the user back to a
toggle that could not have worked, on the assumption that "it did not take
effect yet".

**Read the state from the API before concluding the user missed a switch.**
The reading also settled what the feature was: injection happened for a bare
`curl`, for a Googlebot UA and for a browser alike, and on the 404 page.
Unconditional, so never bot detection in any meaningful sense.

The setting is now declared off in `infra/cloudflare/zone-settings.tf`, with the
reason it must stay off written beside it: the injected script carries a
per-request ray id, so no CSP hash or nonce can ever allow it.

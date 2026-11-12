---
id: lesson-014-grid-column-grows-to-longest-word
type: lesson
status: active
created: "2026-11-08"
owner: manu
tags: [svqtriana, lesson]
---

# A grid column grows to the longest word

## What happened

In the redesign preview, on a real phone, the home page hero was cut off on the
right: "TEMPORADA", the eyebrow "… Desde 2019" and the buttons "Hazte socio" and
"Ver precios". In the 390 px screenshots it looked fine, because "TEMPORADA"
fitted by a few pixels. A narrower phone or a slightly larger system font was
enough for it to stop fitting.

## Mechanism

The hero is a `grid` that only defines columns from `lg` up. On mobile the
column is implicit (`auto`), and a grid item has `min-width: auto`: it cannot be
narrower than its minimum content. The `<h1>`'s minimum content is the word
"TEMPORADA", which cannot be broken, with a minimum size in `rem`
(`clamp(3.4rem, …)`) that grows with the system font. The column widens to that
word and drags everything else with it. The section's `overflow-hidden` clips
the excess instead of showing a scrollbar, so the failure reads as cut-off text.

On desktop that same mechanism is the design: the text column takes the width of
"TEMPORADA" at 7rem and the poster fills what is left. The first fix also
constrained the column on desktop, and the hero changed: smaller title, larger
poster and taller hero. It had to be undone for desktop only.

## What prevents it now

- **Mobile**: the hero column is `minmax(0, 1fr)` and the text column carries
  `min-w-0`, so it never exceeds the available width. The title is sized in
  container units (`@container` and `text-[min(15cqw,7rem)]`): "TEMPORADA" takes
  at most ~96 % of its column, whatever the screen or the system font.
- **Desktop (`lg`)**: the original columns are restored (`1.1fr 0.9fr`),
  `min-width: auto` and no containment (`container-type: normal`), so the
  column measures itself by the title again. From ~1150 px the hero is identical
  to the original (checked pixel by pixel at 1280, 1536 and 1920 px); below
  that, the title shrinks just enough that the poster does not end up at
  169 px.
- With two distinct regimes, any change to the hero is checked on mobile **and**
  on desktop, comparing screenshots with the previous version.
- `tests/overflow.spec.ts` walks all five pages at 320 and 360 px, with the font
  at 100 % and 130 %, and fails if any element overflows the screen.

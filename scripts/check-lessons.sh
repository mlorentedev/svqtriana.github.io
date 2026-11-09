#!/usr/bin/env bash
# Guard: docs/lessons/ numbering and index integrity.
# 1. No two lesson files share a number (the collision that hit web#326, dotfiles#1519, kubelab).
# 2. Every lesson file is listed in its _index.md and every indexed file exists.
# 3. When lessons live in category directories, docs/lessons/_index.md (the root index the
#    pointer stub links) must still exist.
# Lessons may live flat in docs/lessons/ or one level down in category directories
# (docs/lessons/<category>/ with a per-category _index.md); both layouts are checked.# Portable: bash and zsh, GNU and BSD find (no -printf), filenames compared as literal
# tokens (no regex built from a filename), NUL-separated so spaces cannot split them.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LESSONS_DIR="$ROOT/docs/lessons"
[ -d "$LESSONS_DIR" ] || { echo "check-lessons: docs/lessons/ not present, nothing to check"; exit 0; }
rc=0
total=0

# Both naming schemes are accepted. This guard was written for lesson-NNN-slug.md and
# this repository names its lessons YYYY-MM-DD-slug.md, so every find matched nothing and
# it printed "OK (0 lessons)" over fourteen files - a check that cannot fail (#29 in the
# harness template, defect 6 in the review of #35). The duplicate-number rule below only
# applies to the numbered scheme: a date is not a unique key, and two lessons written on
# one day are legitimate.
LESSON_NAME_PATTERNS=(-name 'lesson-[0-9]*.md' -o -name '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]-*.md')
lesson_files() { # lesson_files <dir> <maxdepth> [extra find args...]
  local dir="$1" depth="$2"
  shift 2
  find "$dir" -maxdepth "$depth" -type f \( "${LESSON_NAME_PATTERNS[@]}" \) "$@"
}

# Link targets an index may name: everything between a '(' or a '[[' and the closing
# ')' / '|' / ']]' that ends in .md, path stripped. Printed one per line; spaces allowed.
index_targets() {
  # perl, not grep: a markdown target may contain escaped or %-encoded parens and spaces,
  # which no single ERE handles; the targets come back decoded, path stripped, one per line.
  perl -ne '
    while (/\]\(\s*((?:[^()\\\s#]|\\.|%[0-9A-Fa-f]{2})*?(?:lesson-\d+|\d{4}-\d{2}-\d{2})[^()\\\s#]*?\.md)(?:#[^)\s]*)?\s*\)/g) { print "$1\n" }
    # Obsidian wikilinks may omit the .md extension; add it back so the token compares.
    while (/\[\[([^\]|\\]*?(?:lesson-\d+|\d{4}-\d{2}-\d{2})[^\]|\\]*?)(?:\\?\||\]\])/g) { my $t = $1; $t .= ".md" unless $t =~ /\.md$/; print "$t\n" }
  ' "$1" 2>/dev/null \
    | perl -pe 's/#[^\n]*$//; s/\\(.)/$1/g; s/%([0-9A-Fa-f]{2})/chr(hex($1))/ge; s#.*/##' | sort -u
}

# --- 1. duplicate numbers across the whole tree (a number is unique per repo) ---
dupes="$(lesson_files "$LESSONS_DIR" 2 -exec basename {} \; \
  | grep -oE '^lesson-[0-9]+' | sort | uniq -d || true)"
if [ -n "$dupes" ]; then
  echo "check-lessons: lesson numbers used more than once:"
  while IFS= read -r n; do
    find "$LESSONS_DIR" -maxdepth 2 -type f -name "${n}-*.md" | sed "s#^$LESSONS_DIR/#  #"
  done <<< "$dupes"
  rc=1
fi

# --- 2. index integrity, per directory that holds lesson files ---
while IFS= read -r -d '' dir; do
  index="$dir/_index.md"
  count=0
  targets=""
  [ -f "$index" ] && targets="$(index_targets "$index")"
  while IFS= read -r -d '' f; do
    count=$((count + 1))
    name="$(basename "$f")"
    if [ -f "$index" ]; then
      # Literal, whole-line comparison against the extracted targets: no regex is built
      # from the filename, so '+', '(' or a space in a name cannot change the match.
      printf '%s\n' "$targets" | grep -qxF -- "$name" \
        || { echo "check-lessons: not in ${index#"$ROOT"/}: $name"; rc=1; }
    fi
  done < <(lesson_files "$dir" 1 -print0)
  [ "$count" -gt 0 ] || continue
  total=$((total + count))
  if [ -f "$index" ]; then
    while IFS= read -r t; do
      [ -n "$t" ] || continue
      [ -f "$dir/$t" ] || { echo "check-lessons: indexed in ${index#"$ROOT"/} but missing: $t"; rc=1; }
    done <<< "$targets"
  else
    echo "check-lessons: ${dir#"$ROOT"/} has lessons but no _index.md"
    rc=1
  fi
done < <(find "$LESSONS_DIR" -maxdepth 1 -type d -print0)

# --- 3. the root index must exist whenever any lesson exists anywhere ---
if [ "$total" -gt 0 ] && [ ! -f "$LESSONS_DIR/_index.md" ]; then
  echo "check-lessons: docs/lessons/_index.md is missing (the canonical index the pointer stub links)"
  rc=1
fi

[ "$rc" -eq 0 ] && echo "check-lessons: OK ($total lessons)"
exit $rc

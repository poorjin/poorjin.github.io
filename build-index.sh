#!/bin/sh
# Reads YAML frontmatter from posts/*.md and writes posts/index.json.
# Run after adding or editing a post:  ./build-index.sh
# Requires no dependencies beyond sh, sed, and awk.

set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
OUT="$DIR/posts/index.json"

first=1
printf '[' > "$OUT"

for file in "$DIR"/posts/*.md; do
  [ -f "$file" ] || continue
  slug="$(basename "$file" .md)"

  title=""
  lede=""
  date=""
  dateShort=""
  updated=""
  updatedShort=""
  featured="false"
  tags=""

  # Read frontmatter (between --- markers)
  in_fm=0
  while IFS= read -r line; do
    case "$line" in
      ---) 
        if [ "$in_fm" -eq 1 ]; then break; fi
        in_fm=1
        continue
        ;;
    esac
    [ "$in_fm" -eq 0 ] && continue

    key="${line%%:*}"
    val="$(echo "${line#*:}" | sed 's/^ *//;s/ *$//;s/^"//;s/"$//')"

    case "$key" in
      title)        title="$val" ;;
      lede)         lede="$val" ;;
      date)         date="$val" ;;
      dateShort)    dateShort="$val" ;;
      updated)      updated="$val" ;;
      updatedShort) updatedShort="$val" ;;
      featured)     featured="$val" ;;
      tags)         tags="$val" ;;
    esac
  done < "$file"

  [ -z "$title" ] && continue

  if [ "$first" -eq 1 ]; then
    first=0
    printf '\n  {\n' >> "$OUT"
  else
    printf ',\n  {\n' >> "$OUT"
  fi
  printf '    "slug":         "%s",\n' "$slug" >> "$OUT"
  printf '    "featured":     %s,\n'   "$featured" >> "$OUT"
  printf '    "title":        "%s",\n' "$title" >> "$OUT"
  printf '    "lede":         "%s",\n' "$lede" >> "$OUT"
  printf '    "date":         "%s",\n' "$date" >> "$OUT"
  printf '    "dateShort":    "%s",\n' "$dateShort" >> "$OUT"
  printf '    "updated":      "%s",\n' "$updated" >> "$OUT"
  printf '    "updatedShort": "%s"\n'  "$updatedShort" >> "$OUT"
  printf '  }' >> "$OUT"

done

printf '\n]\n' >> "$OUT"
echo "✓ wrote $OUT ($(grep -c '"slug"' "$OUT") posts)"

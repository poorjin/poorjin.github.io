#!/bin/sh
# Stamps today's date into a post's `updated` / `updatedShort` frontmatter
# fields, then rebuilds posts/index.json.
#
# Usage:  ./bump-updated.sh <slug>
# Example: ./bump-updated.sh demo-images-and-code

set -e

if [ -z "$1" ]; then
  echo "usage: $0 <slug>" >&2
  exit 1
fi

DIR="$(cd "$(dirname "$0")" && pwd)"
slug="$1"
file="$DIR/posts/$slug.md"

if [ ! -f "$file" ]; then
  echo "error: $file not found" >&2
  exit 1
fi

long="$(date '+%B %-d, %Y')"
short="$(date '+%b %-d')"

if grep -q '^updated:' "$file"; then
  sed -i '' "s|^updated:.*|updated: \"$long\"|" "$file"
  sed -i '' "s|^updatedShort:.*|updatedShort: \"$short\"|" "$file"
else
  # Insert after the dateShort: line.
  sed -i '' "/^dateShort:/a\\
updated: \"$long\"\\
updatedShort: \"$short\"
" "$file"
fi

"$DIR/build-index.sh" >/dev/null
echo "✓ bumped $slug → updated: $long"

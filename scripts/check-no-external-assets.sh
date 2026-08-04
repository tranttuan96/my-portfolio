#!/bin/sh
# Every asset the page loads must be same-origin.
#
# Hotlinked CDN assets mean a third party can blank out the hero or the whole
# tech-stack grid without us changing a line, and they defeat the strict CSP in
# vercel.json (which would block them at runtime anyway — better to fail here,
# at build time, with a readable message).
#
# Outbound <a href="https://..."> links are fine: they are navigation, not
# loads. Only src/srcset/url()/@import are checked.

set -e

TARGETS="index.html src"
PATTERN='(src|srcset)[[:space:]]*=[[:space:]]*["'"'"']https?://|url\([[:space:]]*["'"'"']?https?://|@import[[:space:]]+["'"'"']https?://'

if hits=$(grep -rInE "$PATTERN" $TARGETS 2>/dev/null); then
  echo "✗ External asset reference(s) found — assets must be served from /public:"
  echo "$hits" | sed 's/^/    /'
  exit 1
fi

echo "✓ No external asset references"

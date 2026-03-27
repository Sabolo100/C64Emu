#!/bin/sh
set -eu

PORT="${1:-8000}"
DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"

echo "Serving $DIR on http://localhost:$PORT"
cd "$DIR"

if command -v python3 >/dev/null 2>&1; then
  exec python3 -m http.server "$PORT"
fi

if command -v python >/dev/null 2>&1; then
  exec python -m SimpleHTTPServer "$PORT"
fi

echo "Python not found. Install python3 to run local server." >&2
exit 1

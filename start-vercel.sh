#!/bin/zsh
set -e

cd "$(/usr/bin/dirname "$0")"
npx vercel dev --listen 3131

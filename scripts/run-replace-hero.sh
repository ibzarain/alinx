#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
LOG="scripts/.replace-hero-last.log"
npm run replace-hero-video 2>&1 | tee "$LOG"
echo "OK" >> "$LOG"

#!/usr/bin/env bash
set -euo pipefail

branch="$(git branch --show-current)"
if [[ -z "$branch" ]]; then
  echo "Could not detect the current git branch."
  exit 1
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "Remote 'origin' is not configured."
  exit 1
fi

echo "Running production build..."
npm run build

echo
echo "Current changes:"
git status --short

if git diff --quiet && git diff --cached --quiet && [[ -z "$(git ls-files --others --exclude-standard)" ]]; then
  echo "No changes to commit."
  exit 0
fi

message="${1:-}"
if [[ -z "$message" ]]; then
  read -r -p "Commit message: " message
fi

if [[ -z "$message" ]]; then
  echo "Commit message is required."
  exit 1
fi

echo
read -r -p "Commit all shown changes and push to origin/${branch}? [y/N] " confirm
case "$confirm" in
  y|Y|yes|YES)
    ;;
  *)
    echo "Cancelled."
    exit 0
    ;;
esac

git add -A
git commit -m "$message"
git push origin "$branch"

echo
echo "Shipped to origin/${branch}."

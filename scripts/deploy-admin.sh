#!/usr/bin/env bash
set -euo pipefail

: "${PROD_HOST:?Missing PROD_HOST}"
: "${PROD_USER:?Missing PROD_USER}"
: "${PROD_PATH:?Missing PROD_PATH}"
: "${NGINX_ROOT:?Missing NGINX_ROOT}"
: "${API_BASE:?Missing API_BASE}"

CONFIRM="${CONFIRM_DEPLOY:-0}"
SSH_OPT="-o StrictHostKeyChecking=no"
[ -n "${SSH_KEY:-}" ] && SSH_OPT="$SSH_OPT -i $SSH_KEY"

ts="$(date +%Y%m%d-%H%M%S)"
release_dir="$PROD_PATH/releases/$ts"
tarball="admin-build-$ts.tgz"

echo "==> 0) Environment"
echo "    API_BASE=$API_BASE"
echo "    PROD=$PROD_USER@$PROD_HOST"
echo "    TARGET_RELEASE=$release_dir"
echo "    NGINX_ROOT=$NGINX_ROOT (symlink)"

echo "==> 1) Build admin (prod) — leaves API/PM2 untouched"
export REACT_APP_API_BASE="$API_BASE"
export NEXT_PUBLIC_API_BASE="$API_BASE"

if [ -f "pnpm-lock.yaml" ] && command -v pnpm >/dev/null 2>&1; then
  pnpm install --frozen-lockfile
  pnpm build
elif [ -f "yarn.lock" ] && command -v yarn >/dev/null 2>&1; then
  yarn --frozen-lockfile
  yarn build
else
  # Use legacy peer deps to handle React Scripts dependency conflicts
  npm ci --legacy-peer-deps || npm install --legacy-peer-deps
  npm run build
fi

# Detect common build dirs
build=""
for d in "dist" "build" ".next" ".output/public" "out"; do
  [ -d "$d" ] && build="$d" && break
done
[ -z "$build" ] && { echo "ERR: Build output not found (dist/build/.next/.output/public/out)"; exit 1; }
echo "Build dir: $build"

echo "==> 2) Package build"
tar -C "$build" -czf "$tarball" .

echo "==> 3) Ensure remote dirs (no delete)"
ssh $SSH_OPT "$PROD_USER@$PROD_HOST" "mkdir -p '$PROD_PATH/releases' '$PROD_PATH/shared'"

echo "==> 4) Upload tarball (merge-only)"
scp $SSH_OPT "$tarball" "$PROD_USER@$PROD_HOST:$PROD_PATH/"

# Dry-run stop here
if [ "$CONFIRM" != "1" ]; then
  echo "DRY RUN COMPLETE — uploaded tarball only. Set CONFIRM_DEPLOY=1 to apply."
  exit 0
fi

echo "==> 5) Snapshot current symlink target (for rollback)"
ssh $SSH_OPT "$PROD_USER@$PROD_HOST" "\
  if [ -L '$NGINX_ROOT' ]; then \
     readlink -f '$NGINX_ROOT' || true; \
  fi" > /tmp/admin_prev_release.txt || true
prev_release="$(cat /tmp/admin_prev_release.txt || true)"
echo "Previous release: ${prev_release:-<none>}"

echo "==> 6) Unpack to new release"
ssh $SSH_OPT "$PROD_USER@$PROD_HOST" "mkdir -p '$release_dir' && tar -xzf '$PROD_PATH/$tarball' -C '$release_dir'"

echo "==> 7) Atomic symlink switch (Nginx serves new release)"
ssh $SSH_OPT "$PROD_USER@$PROD_HOST" "\
  ln -sfn '$release_dir' '$NGINX_ROOT' && \
  if command -v sudo >/dev/null 2>&1; then sudo systemctl reload nginx || true; else true; fi"

echo '==> 8) Post-deploy smoke (no PM2/DB changes)'
set +e
curl -sS -I "$API_BASE/api-docs/" | head -n 1
curl -sS -I "https://api.charged.autos" | head -n 1
set -e

echo "==> 9) Logs hint (API is PM2-managed; dashboard is static behind Nginx)"
echo "Tail API logs: ssh $PROD_USER@$PROD_HOST 'tail -n 100 /home/ubuntu/chargedapi/logs/* 2>/dev/null || true'"
echo "PM2 status:    ssh $PROD_USER@$PROD_HOST 'pm2 status || true'"

echo "DONE. New release: $release_dir"

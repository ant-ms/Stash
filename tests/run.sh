#!/usr/bin/env bash
# tests/run.sh — full test lifecycle
# Usage: bash tests/run.sh
# Env: TEST_DB_URL, TEST_SCHEMA, TEST_SERVER_PORT
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TEST_DB_URL="${TEST_DB_URL:-postgresql://postgres:postgres@localhost:5433/postgres}"
TEST_SCHEMA="${TEST_SCHEMA:-test_$(date +%s)}"
# Build the test DB URL by replacing the last path segment with the isolated test database name
TEST_DATABASE_URL="${TEST_DB_URL%/*}/${TEST_SCHEMA}"
TEST_SERVER_PORT="${TEST_SERVER_PORT:-5174}"
TEST_SERVER_URL="http://localhost:${TEST_SERVER_PORT}"
SERVER_PID=""

cleanup() {
  if [[ -n "$SERVER_PID" ]]; then
    echo "→ Stopping dev server (PID $SERVER_PID)..."
    kill "$SERVER_PID" 2>/dev/null || true
  fi
  echo "→ Dropping database ${TEST_SCHEMA}..."
  TEST_DB_URL="$TEST_DB_URL" TEST_SCHEMA="$TEST_SCHEMA" \
    pnpm --prefix "$ROOT" test:schema:drop 2>/dev/null || true
}
trap cleanup EXIT

echo "=== Starting test infra ==="
cd "$ROOT"
pnpm test:infra:up

echo "=== Creating database: ${TEST_SCHEMA} ==="
TEST_DB_URL="$TEST_DB_URL" TEST_SCHEMA="$TEST_SCHEMA" pnpm test:schema:create

echo "=== Seeding ==="
TEST_DATABASE_URL="$TEST_DATABASE_URL" pnpm test:seed

echo "=== Starting SvelteKit dev server on port ${TEST_SERVER_PORT} ==="
cd "$ROOT/_frontend"
# Kill anything already on the test port
lsof -ti :"$TEST_SERVER_PORT" | xargs kill -9 2>/dev/null || true
# Source .env for non-DB vars (API keys etc.), then override DATABASE_URL and SERVER_URL for test
(source ../.env; export DATABASE_URL="$TEST_DATABASE_URL"; export SERVER_URL="$TEST_SERVER_URL"; exec npx vite dev --port "$TEST_SERVER_PORT") &
SERVER_PID=$!

echo "→ Waiting for server at ${TEST_SERVER_URL} (PID $SERVER_PID)..."
for i in $(seq 1 60); do
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "ERROR: dev server exited unexpectedly" >&2
    exit 1
  fi
  status=$(curl -so /dev/null -w '%{http_code}' "${TEST_SERVER_URL}/" 2>/dev/null || true)
  if [[ "$status" =~ ^[23] ]]; then
    echo "→ Server ready (HTTP $status on /)."
    break
  fi
  if [[ $i -eq 60 ]]; then
    echo "ERROR: server did not respond after 180s" >&2
    exit 1
  fi
  echo "  waiting... ($i/60)"
  sleep 3
done

# Warm up the server (Vite compiles on first request)
echo "→ Warming up server..."
curl -so /dev/null "${TEST_SERVER_URL}/signin" 2>/dev/null || true
sleep 2

echo "=== Running Playwright tests ==="
cd "$ROOT"
TEST_SERVER_URL="$TEST_SERVER_URL" pnpm test:run

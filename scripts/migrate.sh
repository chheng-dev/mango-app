set -euo pipefail

# ---------- Load environment variables from .env file ----------
if [ -f .env ]; then
  echo "Loading environment variables from .env file..."
  export $(grep -v '^#' .env | grep -v '^$' | xargs)
elif [ -f .env.local ]; then
  echo "Loading environment variables from .env.local file..."
  export $(grep -v '^#' .env.local | grep -v '^$' | xargs)
fi

# ---------- Configuration (override via env or export before running) ----------
: "${DATABASE_URL:?Error: DATABASE_URL must be set in .env file or environment}"  # ensure this is set in your env
: "${MIGRATIONS_DIR:=./drizzle}"
: "${BACKUP_DIR:=./db_backups}"
: "${DRIZZLE_CONFIG:=./drizzle.config.ts}"
: "${PG_DUMP:=$(command -v pg_dump || true)}"
: "${DRIZZLE_CLI:=npx drizzle-kit}"   # change to pnpm/yarn if you prefer
: "${CI:=false}"                      # set CI=true in CI environments to skip interactive prompts
: "${SKIP_BACKUP:=false}"             # set SKIP_BACKUP=true to skip pg_dump (not recommended)
LOGFILE="./migration-logs/$(date +"%Y%m%d-%H%M%S")-migrate.log"

mkdir -p "$BACKUP_DIR"
mkdir -p "$(dirname "$LOGFILE")"

echo "--- Drizzle safe migration started: $(date +"%Y-%m-%dT%H:%M:%S%z") ---" | tee -a "$LOGFILE"

# ---------- Helper functions ----------
fail() {
  echo "ERROR: $*" | tee -a "$LOGFILE" >&2
  exit 1
}

info() {
  echo "INFO: $*" | tee -a "$LOGFILE"
}

# ---------- 1) Ensure pg_dump available for backups (unless skipped) ----------
if [ "$SKIP_BACKUP" = "false" ]; then
  if [ -z "$PG_DUMP" ]; then
    fail "pg_dump not found in PATH. Install PostgreSQL client tools or set SKIP_BACKUP=true to proceed without backup."
  fi
fi

# ---------- 2) Create a backup of the database before running migrations ----------
if [ "$SKIP_BACKUP" = "false" ]; then
  BACKUP_FILE="$BACKUP_DIR/backup-$(date +"%Y%m%d-%H%M%S").sql.gz"
  info "Creating DB backup to $BACKUP_FILE ..."
  
  # Validate DATABASE_URL format
  if ! echo "$DATABASE_URL" | grep -qE "^postgres(ql)?://"; then
    fail "DATABASE_URL doesn't look like a postgres URL: $DATABASE_URL"
  fi

  # pg_dump accepts connection string with --dbname
  if ! $PG_DUMP --dbname="$DATABASE_URL" --no-owner --no-acl -F p 2>>"$LOGFILE" | gzip > "$BACKUP_FILE"; then
    fail "pg_dump FAILED — backup unsuccessful. Aborting migrations."
  fi
  info "Backup completed: $BACKUP_FILE"
else
  info "Skipping DB backup (SKIP_BACKUP=true)."
fi

# ---------- 3) Optional safety prompt (skipped in CI) ----------
if [ "$CI" != "true" ]; then
  echo
  echo "About to run Drizzle migrations against DB at: ${DATABASE_URL}"
  echo "Migrations dir: $MIGRATIONS_DIR"
  read -r -p "Proceed with running migrations? (Y/n): " REPLY || true
  REPLY=${REPLY:-Y}
  if [[ ! "$REPLY" =~ ^[Yy] ]]; then
    info "User cancelled migration."
    exit 0
  fi
fi

# ---------- 4) Run drizzle-kit migrate ----------
info "Running drizzle-kit migrate (config: $DRIZZLE_CONFIG)..."
# Redirect both stdout and stderr to logfile but also show minimal output to console
if $DRIZZLE_CLI migrate --config "$DRIZZLE_CONFIG" 2>&1 | tee -a "$LOGFILE"; then
  info "Migrations applied successfully."
else
  fail "drizzle-kit migrate failed. Check $LOGFILE and the DB state. Consider restoring $BACKUP_FILE if needed."
fi

# ---------- 5) Show applied migration summary (from __drizzle_migrations) ----------
info "Latest applied migrations (from __drizzle_migrations):"
# Print last 20 rows from migrations table using psql if available
if command -v psql >/dev/null 2>&1; then
  if psql "$DATABASE_URL" -Atc "SELECT id, hash, created_at FROM drizzle.__drizzle_migrations ORDER BY created_at DESC LIMIT 20;" 2>/dev/null | tee -a "$LOGFILE"; then
    :
  else
    info "Could not query __drizzle_migrations table. It may not exist yet or may have a different schema."
  fi
else
  info "psql not available; cannot query __drizzle_migrations. Install psql or inspect DB manually."
fi

info "Migration script finished: $(date +"%Y-%m-%dT%H:%M:%S%z")"
exit 0

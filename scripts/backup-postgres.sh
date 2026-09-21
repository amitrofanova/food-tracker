#!/bin/bash
# Daily dump of the VDS Postgres volume into /opt/food-tracker/backup/postgres/
# Restore (example):
#   docker compose -f docker-compose.prod.yml exec -T postgres \
#     pg_restore -U foodtracker -d food_tracker --clean --if-exists --no-owner --no-acl \
#     < backup/postgres/food_tracker_YYYYMMDDThhmmssZ.dump

set -euo pipefail

APP_DIR=/opt/food-tracker
COMPOSE_FILE="$APP_DIR/docker-compose.prod.yml"
BACKUP_DIR="$APP_DIR/backup/postgres"
KEEP_DAYS=7
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
FILE="$BACKUP_DIR/food_tracker_${STAMP}.dump"

mkdir -p "$BACKUP_DIR"
chmod 700 "$APP_DIR/backup" "$BACKUP_DIR"

POSTGRES_USER=$(grep -E '^POSTGRES_USER=' "$APP_DIR/.env" | cut -d= -f2-)
POSTGRES_DB=$(grep -E '^POSTGRES_DB=' "$APP_DIR/.env" | cut -d= -f2-)
POSTGRES_USER=${POSTGRES_USER:-foodtracker}
POSTGRES_DB=${POSTGRES_DB:-food_tracker}

cd "$APP_DIR"
docker compose -f "$COMPOSE_FILE" exec -T postgres \
  pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --no-acl -Fc \
  > "$FILE.tmp"
mv "$FILE.tmp" "$FILE"
chmod 600 "$FILE"

find "$BACKUP_DIR" -name 'food_tracker_*.dump' -type f -mtime +"$KEEP_DAYS" -delete

echo "$(date -u +%FT%TZ) ok $(wc -c < "$FILE") bytes $FILE"

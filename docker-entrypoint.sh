#!/bin/sh
# Runs before the container's command. With MIGRATE_ON_START=1, applies
# pending database migrations first (safe to repeat; Prisma takes a lock).
set -e
case "${MIGRATE_ON_START:-}" in
  1 | true | on | yes)
    echo "[aalim] applying database migrations"
    node_modules/.bin/prisma migrate deploy
    ;;
esac
exec "$@"

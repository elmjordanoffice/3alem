#!/bin/sh
# Runs once, when the database volume is first created: adds the runtime role
# the app connects as (row-level security applies to it; migrations grant it access).
set -e
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<SQL
CREATE ROLE aalim_app LOGIN PASSWORD '${APP_DB_PASSWORD}';
SQL

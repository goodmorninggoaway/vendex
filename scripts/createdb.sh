#!/bin/sh
DIR="$(dirname "$0")"
source $DIR/env.sh

for SQL in `ls -v $MIGRATIONS_PATH/*.sql`;
do
    sqlite3 -init "$SQL" "$DB_FILENAME" .quit
done;

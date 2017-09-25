#!/usr/bin/env bash
psql -d postgres -f scripts/createdb.sql
psql -d vendex -f app/api/domain/dataAccess/migrations/0001_Init.sql

#!/usr/bin/env bash
psql -d postgres -f ./createdb.sql
psql -d thalba -f /Users/mjd/code/thalba-sync/lib/dataAccess/migrations/0001_Init.sql

SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid <> pg_backend_pid() AND datname = 'vendex';

DROP DATABASE if exists vendex;

CREATE DATABASE vendex WITH
    OWNER = vendex
--    ENCODING = 'UTF8'
--    LC_COLLATE = 'C'
--    LC_CTYPE = 'en_US.UTF-8'
--    TABLESPACE = pg_default
--    CONNECTION LIMIT = -1;
;

-- CREATE ROLE vendex WITH SUPERUSER CREATEDB CREATEROLE LOGIN ENCRYPTED PASSWORD 'vendex' if not exists;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON tables TO vendex;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, USAGE ON sequences TO vendex;


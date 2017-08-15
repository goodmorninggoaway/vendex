SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid <> pg_backend_pid() AND datname = 'thalba';

DROP DATABASE thalba;

CREATE DATABASE thalba WITH
    OWNER = thalba
    ENCODING = 'UTF8'
    LC_COLLATE = 'C'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;


-- CREATE ROLE thalba IF NOT EXISTS;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON tables TO thalba;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, USAGE ON sequences TO thalba;


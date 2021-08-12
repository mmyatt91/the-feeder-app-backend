\echo 'Delete and recreate feeder db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE feeder;
CREATE DATABASE feeder;
\connect feeder

\i feeder-schema.sql
\i feeder-seed.sql

\echo 'Delete and recreate feeder_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE feeder_test;
CREATE DATABASE feeder_test;
\connect feeder_test

\i feeder-schema.sql

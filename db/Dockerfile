FROM postgres:15
COPY reset.sql /docker-entrypoint-initdb.d/01_reset.sql
COPY schema.sql /docker-entrypoint-initdb.d/02_schema.sql
COPY seed.sql /docker-entrypoint-initdb.d/03_seed.sql
FROM postgres:15
COPY schema.sql /docker-entrypoint-initdb.d/01_schema.sql
COPY seed.sql /docker-entrypoint-initdb.d/02_seed.sql
FROM postgres:16

ENV POSTGRES_DB=mydb
ENV POSTGRES_USER=admin
ENV POSTGRES_PASSWORD=admin

# Copy initialization script
COPY init.sql /docker-entrypoint-initdb.d/
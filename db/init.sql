CREATE TYPE role_name AS ENUM ('ROLE_ADMIN', 'ROLE_WRITER', 'ROLE_VIEWER');

CREATE TABLE roles (
    role_id BIGSERIAL PRIMARY KEY,
    authority role_name UNIQUE NOT NULL
);

INSERT INTO roles (authority) VALUES
    ('ROLE_ADMIN'),
    ('ROLE_WRITER'),
    ('ROLE_VIEWER');
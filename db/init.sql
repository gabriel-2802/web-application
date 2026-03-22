-- Drop existing types and tables if they exist
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS writers CASCADE;
DROP TABLE IF EXISTS viewers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TYPE IF EXISTS role_name;

-- Create ENUM type for role names
CREATE TYPE role_name AS ENUM ('ROLE_ADMIN', 'ROLE_WRITER', 'ROLE_VIEWER');

-- Create roles table
CREATE TABLE roles (
    role_id BIGSERIAL PRIMARY KEY,
    authority role_name UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO roles (authority) VALUES
    ('ROLE_ADMIN'),
    ('ROLE_WRITER'),
    ('ROLE_VIEWER');

-- USERS HIERARCHY (JOINED INHERITANCE)
-- Create base users table
CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create writers table (extends users via JOINED inheritance)
CREATE TABLE writers (
    user_id BIGINT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    bio VARCHAR(2000),
    profile_image_url VARCHAR(1000),
    website_url VARCHAR(1000),
    location VARCHAR(500),
    professional_title VARCHAR(500)
);

-- Create viewers table (extends users via JOINED inheritance)
CREATE TABLE viewers (
    user_id BIGINT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    profile_image_url VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Create user_roles junction table (many-to-many relationship)
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- POSTS

CREATE TABLE posts (
    post_id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(2000),
    author_id BIGINT NOT NULL REFERENCES writers(user_id) ON DELETE CASCADE,
    collection_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- COLLECTIONS

CREATE TABLE collections (
    collection_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id BIGINT NOT NULL REFERENCES writers(user_id) ON DELETE CASCADE,
    pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint for posts.collection_id
ALTER TABLE posts
ADD CONSTRAINT fk_posts_collection
FOREIGN KEY (collection_id) REFERENCES collections(collection_id) ON DELETE SET NULL;

-- COMMENTS
CREATE TABLE comments (
    comment_id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    author_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    post_id BIGINT NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
    parent_comment_id BIGINT REFERENCES comments(comment_id) ON DELETE RESTRICT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- INDEXES FOR PERFORMANCE

-- User lookups
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- Posts full-text search
CREATE INDEX idx_posts_search ON posts USING gin(
    to_tsvector('english', title || ' ' || content)
);

-- Foreign key lookups
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_collection ON posts(collection_id);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX idx_collections_owner ON collections(owner_id);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
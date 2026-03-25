# API Documentation

This document provides comprehensive documentation for all API endpoints in the Blog Application backend.

---

## Table of Contents
1. [Authentication Controller](#authentication-controller)
2. [Post Controller](#post-controller)
3. [User Controller](#user-controller)
4. [Comment Controller](#comment-controller)
5. [Collection Controller](#collection-controller)

---

## Authentication Controller

**Base Path:** `/api/auth`

### 1. Register User
- **Endpoint:** `POST /api/auth/register`
- **Authentication Required:** No
- **Role Required:** None
- **Request Body:**
  ```json
  {
    "username": "string (3-50 chars, required, unique)",
    "email": "string (valid email, required, unique)",
    "password": "string (min 6 chars, required)",
    "adminRegisterCode": "long (optional)"
  }
  ```
- **Response Body (Success - 200):**
  ```
  "User registered successfully"
  ```
- **Response Body (Error):**
  - `409 Conflict`: If username already exists (ExistingUsernameException)
  - `400 Bad Request`: If email already exists (ExistingEmailException)
- **Validation Errors:** Username and email must be unique
- **Important:** 
  - Account is created with `email_verified = false`
  - Verification email sent to user's inbox
  - User must verify email before login
  - Verification token expires in 24 hours

---

### 2. Verify Email
- **Endpoint:** `GET /api/auth/verify-email`
- **Authentication Required:** No
- **Role Required:** None
- **Query Parameters:**
  - `token` (string, required) - Verification token from email
- **Example URL:** `/api/auth/verify-email?token=abc123xyz789`
- **Response Body (Success - 200):**
  ```
  "Email verified successfully. Your account is now active."
  ```
- **Response Body (Error):**
  - `400 Bad Request`: Invalid verification token (InvalidVerificationTokenException)
  - `400 Bad Request`: Verification token has expired (InvalidVerificationTokenException)
- **What Happens:**
  1. Token validated against database
  2. Expiration checked (must not be past 24 hours)
  3. User's `email_verified` flag set to true
  4. Verification token and expiry cleared from database
  5. Welcome email sent to user
  6. Account now active and ready for login
- **Important:** Token is single-use and expires after 24 hours

---

### 3. Login User
- **Endpoint:** `POST /api/auth/login`
- **Authentication Required:** No
- **Role Required:** None
- **Request Body:**
  ```json
  {
    "username": "string (required)",
    "password": "string (required)"
  }
  ```
- **Response Body (Success - 200):**
  ```json
  {
    "accessToken": "string (JWT token)",
    "tokenType": "Bearer"
  }
  ```
- **Response Body (Error):**
  - `401 Unauthorized`: Invalid credentials (AuthenticationException)
  - `401 Unauthorized`: Email not verified (user must verify email first)
- **Important:** 
  - User must have verified their email before login is possible
  - Verification is done via `/api/auth/verify-email?token=xxx` endpoint
  - After successful login, use JWT token in `Authorization: Bearer <token>` header

---

## Post Controller

**Base Path:** `/api/posts`

### 1. Create Post
- **Endpoint:** `POST /api/posts/create`
- **Authentication Required:** Yes (JWT Token)
- **Role Required:** `ROLE_WRITER`
- **Request Body:**
  ```json
  {
    "title": "string (required, not blank)",
    "content": "string (required, not blank)",
    "imageUrl": "string (optional)",
    "collectionId": "long (optional)"
  }
  ```
- **Response Body (Success - 200):**
  ```json
  {
    "id": "long",
    "title": "string",
    "content": "string",
    "imageUrl": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "authorId": "long",
    "authorUsername": "string",
    "collectionId": "long",
    "comments": []
  }
  ```

---

### 2. Get All Posts
- **Endpoint:** `GET /api/posts/all`
- **Authentication Required:** No
- **Role Required:** None
- **Request Body:** None
- **Response Body (Success - 200):**
  ```json
  [
    {
      "id": "long",
      "title": "string",
      "content": "string",
      "imageUrl": "string",
      "createdAt": "datetime",
      "updatedAt": "datetime",
      "authorId": "long",
      "authorUsername": "string",
      "collectionId": "long",
      "comments": []
    }
  ]
  ```

---

### 3. Get Post by ID
- **Endpoint:** `GET /api/posts/{id}`
- **Authentication Required:** No
- **Role Required:** None
- **Path Parameters:**
  - `id`: integer (post ID)
- **Request Body:** None
- **Response Body (Success - 200):**
  ```json
  {
    "id": "long",
    "title": "string",
    "content": "string",
    "imageUrl": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "authorId": "long",
    "authorUsername": "string",
    "collectionId": "long",
    "comments": []
  }
  ```

---

### 4. Update Post
- **Endpoint:** `PUT /api/posts/update/{id}`
- **Authentication Required:** Yes (JWT Token)
- **Role Required:** `ROLE_WRITER`
- **Path Parameters:**
  - `id`: integer (post ID)
- **Request Body:**
  ```json
  {
    "title": "string (required, not blank)",
    "content": "string (required, not blank)",
    "imageUrl": "string (optional)",
    "collectionId": "long (optional)"
  }
  ```
- **Response Body (Success - 200):**
  ```json
  {
    "id": "long",
    "title": "string",
    "content": "string",
    "imageUrl": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "authorId": "long",
    "authorUsername": "string",
    "collectionId": "long",
    "comments": []
  }
  ```

---

### 5. Delete Post
- **Endpoint:** `DELETE /api/posts/delete/{id}`
- **Authentication Required:** Yes (JWT Token)
- **Role Required:** `ROLE_WRITER`
- **Path Parameters:**
  - `id`: integer (post ID)
- **Request Body:** None
- **Response Body (Success - 200):**
  ```json
  {
    "id": "long",
    "title": "string",
    "content": "string",
    "imageUrl": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "authorId": "long",
    "authorUsername": "string",
    "collectionId": "long",
    "comments": []
  }
  ```

---

### 6. Search Posts
- **Endpoint:** `GET /api/posts/search/{keyword}`
- **Authentication Required:** No
- **Role Required:** None
- **Path Parameters:**
  - `keyword`: string (search keyword)
- **Request Body:** None
- **Response Body (Success - 200):**
  ```json
  [
    {
      "id": "long",
      "title": "string",
      "content": "string",
      "imageUrl": "string",
      "createdAt": "datetime",
      "updatedAt": "datetime",
      "authorId": "long",
      "authorUsername": "string",
      "collectionId": "long",
      "comments": []
    }
  ]
  ```

---

## User Controller

**Base Path:** `/api/users`
**Controller-Level Authentication:** All endpoints require authentication (JWT Token)

### 1. Get Current User Profile
- **Endpoint:** `GET /api/users/profile`
- **Authentication Required:** Yes (JWT Token)
- **Role Required:** Authenticated user (any role)
- **Request Body:** None
- **Response Body (Success - 200):**
  ```json
  {
    "id": "long",
    "username": "string",
    "email": "string",
    "userType": "string (WRITER or VIEWER)",
    "bio": "string",
    "profileImageUrl": "string",
    "websiteUrl": "string",
    "location": "string",
    "professionalTitle": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "roles": ["string"]
  }
  ```

---

### 2. Update Username
- **Endpoint:** `PUT /api/users/username`
- **Authentication Required:** Yes (JWT Token)
- **Role Required:** Authenticated user (any role)
- **Request Body:**
  ```json
  {
    "newUsername": "string (3-50 chars, required, not blank)"
  }
  ```
- **Response Body (Success - 200):**
  ```json
  {
    "id": "long",
    "username": "string",
    "email": "string",
    "userType": "string",
    "bio": "string",
    "profileImageUrl": "string",
    "websiteUrl": "string",
    "location": "string",
    "professionalTitle": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "roles": ["string"]
  }
  ```
- **Response Body (Error):**
  - `409 Conflict`: If username already taken (ExistingUsernameException)

---

### 3. Update Email
- **Endpoint:** `PUT /api/users/email`
- **Authentication Required:** Yes (JWT Token)
- **Role Required:** Authenticated user (any role)
- **Request Body:**
  ```json
  {
    "newEmail": "string (valid email, required)"
  }
  ```
- **Response Body (Success - 200):**
  ```json
  {
    "id": "long",
    "username": "string",
    "email": "string",
    "userType": "string",
    "bio": "string",
    "profileImageUrl": "string",
    "websiteUrl": "string",
    "location": "string",
    "professionalTitle": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "roles": ["string"]
  }
  ```
- **Response Body (Error):**
  - `409 Conflict`: If email already registered (ExistingEmailException)

---

### 4. Update Password
- **Endpoint:** `PUT /api/users/password`
- **Authentication Required:** Yes (JWT Token)
- **Role Required:** Authenticated user (any role)
- **Request Body:**
  ```json
  {
    "currentPassword": "string (required, not blank)",
    "newPassword": "string (min 6 chars, required, not blank)",
    "confirmPassword": "string (required, not blank)"
  }
  ```
- **Response Body (Success - 200):**
  ```
  "Password updated successfully"
  ```
- **Response Body (Error):**
  - `401 Unauthorized`: If current password is incorrect or validation fails (UnauthorizedException)

---

### 5. Update Bio (Writers Only)
- **Endpoint:** `PUT /api/users/bio`
- **Authentication Required:** Yes (JWT Token)
- **Role Required:** Authenticated user (any role, but only writers can update)
- **Request Body:**
  ```json
  {
    "bio": "string (max 2000 chars, required)"
  }
  ```
- **Response Body (Success - 200):**
  ```json
  {
    "id": "long",
    "username": "string",
    "email": "string",
    "userType": "string",
    "bio": "string",
    "profileImageUrl": "string",
    "websiteUrl": "string",
    "location": "string",
    "professionalTitle": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "roles": ["string"]
  }
  ```
- **Response Body (Error):**
  - `401 Unauthorized`: If user is not a writer (UnauthorizedException)

---

### 6. Get Writer Profile (Public)
- **Endpoint:** `GET /api/users/writers/{writerId}/profile`
- **Authentication Required:** No (Public endpoint)
- **Role Required:** None
- **Path Parameters:**
  - `writerId`: long (writer user ID)
- **Request Body:** None
- **Response Body (Success - 200):**
  ```json
  {
    "id": "long",
    "username": "string",
    "email": "string",
    "userType": "string",
    "bio": "string",
    "profileImageUrl": "string",
    "websiteUrl": "string",
    "location": "string",
    "professionalTitle": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "roles": ["string"],
    "posts": [
      {
        "id": "long",
        "title": "string",
        "content": "string",
        "imageUrl": "string",
        "createdAt": "datetime",
        "updatedAt": "datetime",
        "authorId": "long",
        "authorUsername": "string",
        "collectionId": "long",
        "comments": []
      }
    ],
    "collections": [
      {
        "id": "long",
        "name": "string",
        "description": "string",
        "owner": "string",
        "ownerId": "string",
        "pinned": "boolean",
        "createdAt": "datetime",
        "posts": []
      }
    ]
  }
  ```

---

### 7. Get Current Writer Profile
- **Endpoint:** `GET /api/users/writer-profile`
- **Authentication Required:** Yes (JWT Token)
- **Role Required:** Authenticated user (but only writers can access)
- **Request Body:** None
- **Response Body (Success - 200):**
  ```json
  {
    "id": "long",
    "username": "string",
    "email": "string",
    "userType": "string",
    "bio": "string",
    "profileImageUrl": "string",
    "websiteUrl": "string",
    "location": "string",
    "professionalTitle": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "roles": ["string"],
    "posts": [
      {
        "id": "long",
        "title": "string",
        "content": "string",
        "imageUrl": "string",
        "createdAt": "datetime",
        "updatedAt": "datetime",
        "authorId": "long",
        "authorUsername": "string",
        "collectionId": "long",
        "comments": []
      }
    ],
    "collections": [
      {
        "id": "long",
        "name": "string",
        "description": "string",
        "owner": "string",
        "ownerId": "string",
        "pinned": "boolean",
        "createdAt": "datetime",
        "posts": []
      }
    ]
  }
  ```
- **Response Body (Error):**
  - `401 Unauthorized`: If current user is not a writer (UnauthorizedException)

---

### 8. Delete Account
- **Endpoint:** `DELETE /api/users/account`
- **Authentication Required:** Yes (JWT Token)
- **Role Required:** Authenticated user (any role)
- **Request Body:** None
- **Response Body (Success - 200):**
  ```
  "Account deleted successfully"
  ```
- **Behavior:**
  - **For Writers:** All posts authored by this writer are deleted, all collections owned by this writer are deleted, all comments authored by this writer are deleted with replies promoted
  - **For Viewers:** All comments authored by this viewer are deleted with replies promoted

---

## Comment Controller

**Base Path:** `/api/comments`

### 1. Create Comment
- **Endpoint:** `POST /api/comments/create`
- **Authentication Required:** Yes (JWT Token)
- **Role Required:** `ROLE_VIEWER` or `ROLE_WRITER`
- **Request Body:**
  ```json
  {
    "content": "string (required, not blank)",
    "postId": "long (required)",
    "parentCommentId": "long (optional, for replies)"
  }
  ```
- **Response Body (Success - 200):**
  ```json
  {
    "id": "long",
    "content": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "authorId": "long",
    "authorUsername": "string",
    "postId": "long",
    "parentCommentId": "long",
    "isChildComment": "boolean",
    "hasReplies": "boolean",
    "replies": []
  }
  ```

---

### 2. Get Comments by Post (Top Level)
- **Endpoint:** `GET /api/comments/{id}`
- **Authentication Required:** No
- **Role Required:** None
- **Path Parameters:**
  - `id`: integer (post ID)
- **Request Body:** None
- **Response Body (Success - 200):**
  ```json
  [
    {
      "id": "long",
      "content": "string",
      "createdAt": "datetime",
      "updatedAt": "datetime",
      "authorId": "long",
      "authorUsername": "string",
      "postId": "long",
      "parentCommentId": "long",
      "isChildComment": "boolean",
      "hasReplies": "boolean",
      "replies": []
    }
  ]
  ```

---

### 3. Get Replies for a Comment
- **Endpoint:** `GET /api/comments/replies/{commentId}`
- **Authentication Required:** No
- **Role Required:** None
- **Path Parameters:**
  - `commentId`: integer (parent comment ID)
- **Request Body:** None
- **Response Body (Success - 200):**
  ```json
  [
    {
      "id": "long",
      "content": "string",
      "createdAt": "datetime",
      "updatedAt": "datetime",
      "authorId": "long",
      "authorUsername": "string",
      "postId": "long",
      "parentCommentId": "long",
      "isChildComment": "boolean",
      "hasReplies": "boolean",
      "replies": []
    }
  ]
  ```

---

### 4. Get Top Level Comments
- **Endpoint:** `GET /api/comments/top/{postId}`
- **Authentication Required:** No
- **Role Required:** None
- **Path Parameters:**
  - `postId`: integer (post ID)
- **Request Body:** None
- **Response Body (Success - 200):**
  ```json
  [
    {
      "id": "long",
      "content": "string",
      "createdAt": "datetime",
      "updatedAt": "datetime",
      "authorId": "long",
      "authorUsername": "string",
      "postId": "long",
      "parentCommentId": "long",
      "isChildComment": "boolean",
      "hasReplies": "boolean",
      "replies": []
    }
  ]
  ```

---

### 5. Update Comment
- **Endpoint:** `PUT /api/comments/update/{id}`
- **Authentication Required:** Yes (JWT Token)
- **Role Required:** `ROLE_VIEWER` or `ROLE_WRITER`
- **Path Parameters:**
  - `id`: integer (comment ID)
- **Request Body:**
  ```json
  {
    "content": "string (required, not blank)",
    "postId": "long (required)",
    "parentCommentId": "long (optional)"
  }
  ```
- **Response Body (Success - 200):**
  ```json
  {
    "id": "long",
    "content": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "authorId": "long",
    "authorUsername": "string",
    "postId": "long",
    "parentCommentId": "long",
    "isChildComment": "boolean",
    "hasReplies": "boolean",
    "replies": []
  }
  ```

---

### 6. Delete Comment
- **Endpoint:** `DELETE /api/comments/delete/{id}`
- **Authentication Required:** Yes (JWT Token)
- **Role Required:** `ROLE_VIEWER` or `ROLE_WRITER` (User must own the comment)
- **Path Parameters:**
  - `id`: integer (comment ID)
- **Request Body:** None
- **Response Body (Success - 200):**
  ```json
  {
    "id": "long",
    "content": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "authorId": "long",
    "authorUsername": "string",
    "postId": "long",
    "parentCommentId": "long",
    "isChildComment": "boolean",
    "hasReplies": "boolean",
    "replies": []
  }
  ```

---

### 7. Admin Delete Comment
- **Endpoint:** `DELETE /api/comments/admin/delete/{id}`
- **Authentication Required:** Yes (JWT Token)
- **Role Required:** `ROLE_ADMIN`
- **Path Parameters:**
  - `id`: integer (comment ID)
- **Request Body:** None
- **Response Body (Success - 200):**
  ```json
  {
    "id": "long",
    "content": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "authorId": "long",
    "authorUsername": "string",
    "postId": "long",
    "parentCommentId": "long",
    "isChildComment": "boolean",
    "hasReplies": "boolean",
    "replies": []
  }
  ```

---

## Collection Controller

**Base Path:** `/api/collections`

### 1. Create Collection
- **Endpoint:** `POST /api/collections/create`
- **Authentication Required:** Yes (JWT Token)
- **Role Required:** `WRITER` (authority-based)
- **Request Body:**
  ```json
  {
    "name": "string (required, not blank)",
    "description": "string (required, not blank)",
    "pinned": "boolean (optional)"
  }
  ```
- **Response Body (Success - 200):**
  ```json
  {
    "id": "long",
    "name": "string",
    "description": "string",
    "owner": "string",
    "ownerId": "string",
    "pinned": "boolean",
    "createdAt": "datetime",
    "posts": []
  }
  ```

---

### 2. Get All Collections
- **Endpoint:** `GET /api/collections/all`
- **Authentication Required:** No
- **Role Required:** None
- **Request Body:** None
- **Response Body (Success - 200):**
  ```json
  [
    {
      "id": "long",
      "name": "string",
      "description": "string",
      "owner": "string",
      "ownerId": "string",
      "pinned": "boolean",
      "createdAt": "datetime",
      "posts": [
        {
          "id": "long",
          "title": "string",
          "content": "string",
          "imageUrl": "string",
          "createdAt": "datetime",
          "updatedAt": "datetime",
          "authorId": "long",
          "authorUsername": "string",
          "collectionId": "long",
          "comments": []
        }
      ]
    }
  ]
  ```

---

### 3. Get Collection by ID
- **Endpoint:** `GET /api/collections/{id}`
- **Authentication Required:** No
- **Role Required:** None
- **Path Parameters:**
  - `id`: integer (collection ID)
- **Request Body:** None
- **Response Body (Success - 200):**
  ```json
  {
    "id": "long",
    "name": "string",
    "description": "string",
    "owner": "string",
    "ownerId": "string",
    "pinned": "boolean",
    "createdAt": "datetime",
    "posts": [
      {
        "id": "long",
        "title": "string",
        "content": "string",
        "imageUrl": "string",
        "createdAt": "datetime",
        "updatedAt": "datetime",
        "authorId": "long",
        "authorUsername": "string",
        "collectionId": "long",
        "comments": []
      }
    ]
  }
  ```

---

### 4. Update Collection
- **Endpoint:** `PUT /api/collections/update/{id}`
- **Authentication Required:** Yes (JWT Token)
- **Role Required:** `WRITER` (authority-based)
- **Path Parameters:**
  - `id`: integer (collection ID)
- **Request Body:**
  ```json
  {
    "name": "string (required, not blank)",
    "description": "string (required, not blank)",
    "pinned": "boolean (optional)"
  }
  ```
- **Response Body (Success - 200):**
  ```json
  {
    "id": "long",
    "name": "string",
    "description": "string",
    "owner": "string",
    "ownerId": "string",
    "pinned": "boolean",
    "createdAt": "datetime",
    "posts": []
  }
  ```

---

### 5. Pin Collection
- **Endpoint:** `PUT /api/collections/pin/{id}`
- **Authentication Required:** Yes (JWT Token)
- **Role Required:** `WRITER` (authority-based)
- **Path Parameters:**
  - `id`: integer (collection ID)
- **Request Body:** None
- **Response Body (Success - 200):**
  ```json
  {
    "id": "long",
    "name": "string",
    "description": "string",
    "owner": "string",
    "ownerId": "string",
    "pinned": "boolean",
    "createdAt": "datetime",
    "posts": []
  }
  ```

---

### 6. Add Posts to Collection
- **Endpoint:** `PUT /api/collections/add/{id}/posts`
- **Authentication Required:** Yes (JWT Token)
- **Role Required:** `WRITER` (authority-based)
- **Path Parameters:**
  - `id`: integer (collection ID)
- **Query Parameters:**
  - `postIds`: List of integers (post IDs to add)
- **Request Body:** None
- **Response Body (Success - 200):**
  ```json
  {
    "id": "long",
    "name": "string",
    "description": "string",
    "owner": "string",
    "ownerId": "string",
    "pinned": "boolean",
    "createdAt": "datetime",
    "posts": [
      {
        "id": "long",
        "title": "string",
        "content": "string",
        "imageUrl": "string",
        "createdAt": "datetime",
        "updatedAt": "datetime",
        "authorId": "long",
        "authorUsername": "string",
        "collectionId": "long",
        "comments": []
      }
    ]
  }
  ```

---

### 7. Remove Posts from Collection
- **Endpoint:** `PUT /api/collections/remove/{id}/posts`
- **Authentication Required:** Yes (JWT Token)
- **Role Required:** `WRITER` (authority-based)
- **Path Parameters:**
  - `id`: integer (collection ID)
- **Query Parameters:**
  - `postIds`: List of integers (post IDs to remove)
- **Request Body:** None
- **Response Body (Success - 200):**
  ```json
  {
    "id": "long",
    "name": "string",
    "description": "string",
    "owner": "string",
    "ownerId": "string",
    "pinned": "boolean",
    "createdAt": "datetime",
    "posts": [
      {
        "id": "long",
        "title": "string",
        "content": "string",
        "imageUrl": "string",
        "createdAt": "datetime",
        "updatedAt": "datetime",
        "authorId": "long",
        "authorUsername": "string",
        "collectionId": "long",
        "comments": []
      }
    ]
  }
  ```

---

### 8. Delete Collection
- **Endpoint:** `DELETE /api/collections/delete/{id}`
- **Authentication Required:** Yes (JWT Token)
- **Role Required:** `WRITER` (authority-based)
- **Path Parameters:**
  - `id`: integer (collection ID)
- **Request Body:** None
- **Response Body (Success - 200):**
  ```json
  {
    "id": "long",
    "name": "string",
    "description": "string",
    "owner": "string",
    "ownerId": "string",
    "pinned": "boolean",
    "createdAt": "datetime",
    "posts": []
  }
  ```

---

## Summary Table

| Controller | Endpoint | Method | Auth Required | Role Required |
|---|---|---|---|---|
| **Auth** | `/api/auth/register` | POST | No | None |
| **Auth** | `/api/auth/verify-email` | GET | No | None |
| **Auth** | `/api/auth/login` | POST | No | None |
| **Post** | `/api/posts/create` | POST | Yes | ROLE_WRITER |
| **Post** | `/api/posts/all` | GET | No | None |
| **Post** | `/api/posts/{id}` | GET | No | None |
| **Post** | `/api/posts/update/{id}` | PUT | Yes | ROLE_WRITER |
| **Post** | `/api/posts/delete/{id}` | DELETE | Yes | ROLE_WRITER |
| **Post** | `/api/posts/search/{keyword}` | GET | No | None |
| **User** | `/api/users/profile` | GET | Yes | Any |
| **User** | `/api/users/username` | PUT | Yes | Any |
| **User** | `/api/users/email` | PUT | Yes | Any |
| **User** | `/api/users/password` | PUT | Yes | Any |
| **User** | `/api/users/bio` | PUT | Yes | WRITER only |
| **User** | `/api/users/writers/{writerId}/profile` | GET | No | None |
| **User** | `/api/users/writer-profile` | GET | Yes | WRITER only |
| **User** | `/api/users/account` | DELETE | Yes | Any |
| **Comment** | `/api/comments/create` | POST | Yes | ROLE_VIEWER, ROLE_WRITER |
| **Comment** | `/api/comments/{id}` | GET | No | None |
| **Comment** | `/api/comments/replies/{commentId}` | GET | No | None |
| **Comment** | `/api/comments/top/{postId}` | GET | No | None |
| **Comment** | `/api/comments/update/{id}` | PUT | Yes | ROLE_VIEWER, ROLE_WRITER |
| **Comment** | `/api/comments/delete/{id}` | DELETE | Yes | ROLE_VIEWER, ROLE_WRITER |
| **Comment** | `/api/comments/admin/delete/{id}` | DELETE | Yes | ROLE_ADMIN |
| **Collection** | `/api/collections/create` | POST | Yes | WRITER |
| **Collection** | `/api/collections/all` | GET | No | None |
| **Collection** | `/api/collections/{id}` | GET | No | None |
| **Collection** | `/api/collections/update/{id}` | PUT | Yes | WRITER |
| **Collection** | `/api/collections/pin/{id}` | PUT | Yes | WRITER |
| **Collection** | `/api/collections/add/{id}/posts` | PUT | Yes | WRITER |
| **Collection** | `/api/collections/remove/{id}/posts` | PUT | Yes | WRITER |
| **Collection** | `/api/collections/delete/{id}` | DELETE | Yes | WRITER |

---

## Authentication Notes

- **Email Verification:** Users must verify their email before logging in
  - After registration, a verification email is sent to the user's inbox
  - User must click the verification link (contains token)
  - Use `/api/auth/verify-email?token=xxx` to complete verification
  - Token expires after 24 hours
  - Without verification, login will fail even with correct credentials

- **JWT Token:** All authenticated endpoints require a Bearer token in the Authorization header:
  ```
  Authorization: Bearer <access_token>
  ```
- **Token Format:** The token is obtained from the login endpoint (after email verification)
- **Roles:** The system uses both `@PreAuthorize("hasRole('ROLE_X')")` and `@PreAuthorize("hasAnyAuthority('X')")` for authorization checks

---

## Error Handling

Common HTTP status codes used in error responses:
- `200 OK`: Successful request
- `400 Bad Request`: Invalid request data or validation error
- `401 Unauthorized`: Authentication failed or insufficient permissions
- `409 Conflict`: Resource conflict (e.g., duplicate username/email)
- `404 Not Found`: Resource not found

---

**Documentation Updated:** March 25, 2026
**Email Verification:** ✅ Implemented with MailTrap
**Build Status:** ✅ SUCCESS


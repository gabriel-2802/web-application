# Admin Writer Bio Update Endpoint

## Overview
Added a new admin-only endpoint to update the bio of the single writer in the system. Since the system enforces a constraint that only one writer can exist, this endpoint provides a convenient way for admins to manage the writer's bio without requiring the writer to be authenticated.

## Endpoint Details

### Update Writer's Bio (Admin Only)
**Endpoint:** `PUT /api/users/writer/bio`

**Authentication:** Required - Admin role only (`hasRole('ADMIN')`)

**Request Body:**
```json
{
  "bio": "I am a passionate writer and technologist..."
}
```

**Validation:**
- `bio` is required and cannot be null
- Maximum length: 2000 characters

**Response:** `UserProfileResponse` with updated writer profile information

**HTTP Status Codes:**
- `200 OK` - Bio updated successfully
- `401 Unauthorized` - User not authenticated or lacks ADMIN role
- `404 Not Found` - No writer exists in the system
- `400 Bad Request` - Validation error (bio too long, null, etc.)

## Use Cases

### 1. Admin Updates Writer Bio
An admin can update the writer's bio directly without needing the writer's authentication or password:

```bash
curl -X PUT http://localhost:8080/api/users/writer/bio \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Experienced software engineer and published author specializing in technology and travel writing."
  }'
```

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "john_writer",
  "email": "john@example.com",
  "userType": "WRITER",
  "bio": "Experienced software engineer and published author specializing in technology and travel writing.",
  "profileImageUrl": "https://example.com/profile.jpg",
  "websiteUrl": "https://johnwriter.com",
  "location": "San Francisco, CA",
  "professionalTitle": "Senior Engineer & Author",
  "createdAt": null,
  "updatedAt": null,
  "roles": ["ROLE_ADMIN", "ROLE_WRITER"]
}
```

### 2. Non-Admin User Attempts Update (Fails)
A regular user or writer trying to use this endpoint will get unauthorized:

```bash
curl -X PUT http://localhost:8080/api/users/writer/bio \
  -H "Authorization: Bearer {user_token}" \
  -H "Content-Type: application/json" \
  -d '{"bio": "Hacked bio"}'
```

**Response (401 Unauthorized):**
```
Unauthorized
```

### 3. No Writer Exists (Fails)
If no writer has been created yet:

```bash
curl -X PUT http://localhost:8080/api/users/writer/bio \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{"bio": "New bio"}'
```

**Response (404 Not Found):**
```
No writer found in the system
```

## Implementation Details

### Service Method
**File:** `UserService.java`

```java
public ResponseEntity<UserProfileResponse> updateWriterBio(UpdateBioRequest updateBioRequest) 
        throws ResourceNotFoundException {
    // Find the single writer in the system
    List<AbstractUser> allUsers = userRepository.findAll();
    AbstractUser writer = allUsers.stream()
            .filter(u -> "WRITER".equals(u.getUserType()))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("No writer found in the system"));
    
    writer.setBio(updateBioRequest.bio());
    AbstractUser updatedUser = userRepository.save(writer);
    
    return ResponseEntity.ok(mapToUserProfile(updatedUser));
}
```

### Controller Endpoint
**File:** `UserController.java`

```java
@PutMapping("/writer/bio")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<UserProfileResponse> updateWriterBio(
        @Valid @RequestBody UpdateBioRequest updateBioRequest) {
    return userService.updateWriterBio(updateBioRequest);
}
```

## Comparison with Existing Bio Update Endpoints

| Endpoint | Authentication | Who Can Update | Requires |
|----------|-----------------|-----------------|----------|
| `PUT /api/users/bio` | Authenticated user | Only themselves (writers) | User to be authenticated as writer |
| `PUT /api/users/writer/bio` | Admin role | Any admin | Admin authentication |

## Related Endpoints

**Writer can update their own bio:**
```bash
PUT /api/users/bio
```

**Get writer's public profile:**
```bash
GET /api/users/writers/{writerId}/profile
```

**Get current authenticated writer's profile:**
```bash
GET /api/users/writer-profile
```

## Use Case Examples

### Scenario 1: Content Moderation
If admin needs to update the writer's bio for content moderation purposes:

```bash
curl -X PUT http://localhost:8080/api/users/writer/bio \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Updated bio with moderated content following community guidelines."
  }'
```

### Scenario 2: Initial Setup
Admin setting up the writer's bio after account creation:

```bash
curl -X PUT http://localhost:8080/api/users/writer/bio \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Welcome to our blog platform! This is the official writer account for our publication."
  }'
```

### Scenario 3: Information Update
Admin updating writer information for administrative reasons:

```bash
curl -X PUT http://localhost:8080/api/users/writer/bio \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Updated professional information as of March 2026."
  }'
```

## Files Modified

- ✅ `UserService.java` - Added `updateWriterBio()` service method
- ✅ `UserController.java` - Added `PUT /api/users/writer/bio` endpoint with `@PreAuthorize("hasRole('ADMIN')")`

## Build Status
✅ **Project compiles successfully** - No compilation errors

## Testing Recommendations

1. **Admin can update writer bio** - Should return 200 with updated profile
2. **Non-admin cannot access endpoint** - Should return 401
3. **Endpoint fails gracefully** - Should return 404 if no writer exists
4. **Bio validation works** - Should return 400 if bio exceeds 2000 characters
5. **Writer can still update own bio** - Existing `/api/users/bio` endpoint should still work


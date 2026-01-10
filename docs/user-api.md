# User API

Base path: `/api/v1/user`

## Endpoints Overview

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/profile` | Get current user profile | Yes | All |
| PATCH | `/profile` | Update user profile | Yes | All |
| POST | `/upload-images` | Upload profile/cover images | Yes | Worker, Employer, Admin |
| GET | `/workers` | Get list of workers | Yes | Employer, Admin, Guest |

---

## 1. Get User Profile

Get the authenticated user's profile.

**Endpoint:** `GET /api/v1/user/profile`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User profile retrieved successfully",
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "employer",
    "profile": "https://s3.../profile.jpg",
    "address": "123 Main St",
    "status": "active",
    "verified": true,
    "isAccountVerified": false,
    "subscription": {
      "isActive": true,
      "packageType": "premium",
      "status": "active",
      "currentPeriodEnd": 1704067200
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 2. Update Profile

Update the authenticated user's profile.

**Endpoint:** `PATCH /api/v1/user/profile`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | No | User's name |
| phone | string | No | Phone number |
| address | string | No | Address |
| image | file | No | Profile image file |
| cover | string | No | Cover image URL |
| location | object | No | `{ type: "Point", coordinates: [lng, lat] }` |
| deviceToken | string | No | FCM device token |

**Worker-specific fields:**

| Field | Type | Description |
|-------|------|-------------|
| category | string | Job category ID |
| subCategory | string | Sub-category |
| availability | string[] | Available days (e.g., `["monday", "tuesday"]`) |
| salaryType | string | "hourly" or "fixed" |
| salary | number | Expected salary |
| about | string | Bio/description |
| workOverview | string | Work overview |
| coreSkills | string[] | Skills list |
| yearsOfExperience | number | Years of experience |
| workExperiences | array | Work history |

**Employer-specific fields:**

| Field | Type | Description |
|-------|------|-------------|
| nid | boolean | Has NID verification |
| nidFront | string | NID front image URL |
| nidBack | string | NID back image URL |

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile updated successfully",
  "data": "profile_url_or_null"
}
```

---

## 3. Upload Images

Upload images for profile, cover, or NID verification.

**Endpoint:** `POST /api/v1/user/upload-images`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| images | file[] | Yes | Image files to upload |
| type | string | Yes | `profile`, `cover`, `nidFront`, or `nidBack` |

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Images uploaded successfully",
  "data": "https://s3.../uploaded-image.jpg"
}
```

---

## 4. Get Workers

Get a paginated list of workers (for employers to browse).

**Endpoint:** `GET /api/v1/user/workers`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10) |
| sortBy | string | Field to sort by |
| sortOrder | string | `asc` or `desc` |
| searchTerm | string | Search in name, email |
| category | string | Filter by category ID |
| subCategory | string | Filter by sub-category |
| address | string | Filter by address |
| isAccountVerified | string | `true` or `false` |

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Workers retrieved successfully",
  "data": {
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    },
    "data": [
      {
        "_id": "worker_id",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "profile": "https://s3.../profile.jpg",
        "category": "cleaning",
        "rating": 4.5,
        "totalReview": 25,
        "salary": 50,
        "salaryType": "hourly",
        "yearsOfExperience": 5
      }
    ]
  }
}
```

# Review API

Base path: `/api/v1/review`

## Endpoints Overview

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| POST | `/` | Create a review | Yes | Worker, Employer |
| GET | `/:id` | Get reviews for a user | Yes | Worker, Employer, Guest |
| PATCH | `/:id` | Update a review | Yes | Worker, Employer |
| DELETE | `/:id` | Delete a review | Yes | Worker, Employer |

---

## 1. Create Review

Create a review for a user after completing a booking.

**Endpoint:** `POST /api/v1/review`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| reviewedUser | string | Yes | User ID being reviewed |
| bookingId | string | Yes | Related booking ID |
| rating | number | Yes | Rating (1-5) |
| comment | string | No | Review text |

**Success Response (201):**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Review created successfully",
  "data": {
    "_id": "review_id",
    "reviewer": "user_id",
    "reviewedUser": "reviewed_user_id",
    "booking": "booking_id",
    "rating": 5,
    "comment": "Great work! Very professional.",
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

---

## 2. Get Reviews for User

Get all reviews for a specific user.

**Endpoint:** `GET /api/v1/review/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| id | string | User ID to get reviews for |

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Reviews retrieved successfully",
  "data": [
    {
      "_id": "review_id",
      "reviewer": {
        "_id": "reviewer_id",
        "name": "John Doe",
        "profile": "https://..."
      },
      "rating": 5,
      "comment": "Great work! Very professional.",
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

---

## 3. Update Review

Update an existing review (only by the reviewer).

**Endpoint:** `PATCH /api/v1/review/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| id | string | Review ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| rating | number | No | Updated rating (1-5) |
| comment | string | No | Updated comment |

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Review updated successfully",
  "data": { ... }
}
```

---

## 4. Delete Review

Delete a review (only by the reviewer).

**Endpoint:** `DELETE /api/v1/review/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Review deleted successfully",
  "data": null
}
```

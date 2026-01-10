# Notification API

Base path: `/api/v1/notification`

## Endpoints Overview

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | Get all notifications | Yes | Worker, Admin |
| GET | `/:id` | Mark notification as read | Yes | Worker, Admin |
| GET | `/all` | Mark all as read | Yes | Worker, Admin |

---

## 1. Get My Notifications

Get all notifications for the authenticated user.

**Endpoint:** `GET /api/v1/notification`

**Headers:**
```
Authorization: Bearer <access_token>
```

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
  "message": "Notifications retrieved successfully",
  "data": [
    {
      "_id": "notification_id",
      "user": "user_id",
      "title": "New Job Application",
      "message": "Jane Smith applied to your job posting",
      "type": "application",
      "isRead": false,
      "data": {
        "jobId": "job_id",
        "applicationId": "application_id"
      },
      "createdAt": "2024-01-01T10:00:00.000Z"
    }
  ]
}
```

---

## 2. Mark Notification as Read

Mark a single notification as read.

**Endpoint:** `GET /api/v1/notification/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| id | string | Notification ID |

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Notification marked as read",
  "data": { ... }
}
```

---

## 3. Mark All as Read

Mark all notifications as read.

**Endpoint:** `GET /api/v1/notification/all`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "All notifications marked as read",
  "data": null
}
```

---

## Notification Types

| Type | Description |
|------|-------------|
| `application` | New job application received |
| `booking` | Booking status update |
| `message` | New message received |
| `mention` | User was mentioned in chat |
| `review` | New review received |
| `subscription` | Subscription status change |

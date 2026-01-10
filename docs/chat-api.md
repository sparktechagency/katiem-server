# Chat API

Base path: `/api/v1/chat`

## Endpoints Overview

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | Get all chats | Yes | Worker, Employer |
| POST | `/:participant` | Create/Get chat | Yes | Worker, Employer |

---

## 1. Get All Chats

Get all chat conversations for the authenticated user.

**Endpoint:** `GET /api/v1/chat`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Chats retrieved successfully",
  "data": [
    {
      "_id": "chat_id",
      "participants": [
        {
          "_id": "user1_id",
          "name": "John Doe",
          "profile": "https://..."
        },
        {
          "_id": "user2_id",
          "name": "Jane Smith",
          "profile": "https://..."
        }
      ],
      "lastMessage": {
        "text": "Hello!",
        "createdAt": "2024-01-01T12:00:00.000Z"
      },
      "unreadCount": 3,
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

---

## 2. Create/Get Chat

Create a new chat or get existing chat with a participant.

**Endpoint:** `POST /api/v1/chat/:participant`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| participant | string | User ID to chat with |

**Success Response (200/201):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Chat retrieved successfully",
  "data": {
    "_id": "chat_id",
    "participants": [ ... ],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

> **Note:** If chat already exists, returns existing chat. If not, creates a new one.

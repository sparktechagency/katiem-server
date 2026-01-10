# Message API

Base path: `/api/v1/message`

## Endpoints Overview

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/:chatId` | Get messages in a chat | Yes | Worker, Employer |
| POST | `/:chatId` | Send a message | Yes | Worker, Employer |

---

## 1. Get Messages

Get all messages in a chat conversation.

**Endpoint:** `GET /api/v1/message/:chatId`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| chatId | string | Chat ID |

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| page | number | Page number |
| limit | number | Messages per page |

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Messages retrieved successfully",
  "data": [
    {
      "_id": "message_id",
      "chat": "chat_id",
      "sender": {
        "_id": "user_id",
        "name": "John Doe",
        "profile": "https://..."
      },
      "text": "Hello, are you available tomorrow?",
      "images": [],
      "replyTo": null,
      "mentions": [],
      "createdAt": "2024-01-01T10:00:00.000Z"
    },
    {
      "_id": "message_id_2",
      "chat": "chat_id",
      "sender": {
        "_id": "user_id_2",
        "name": "Jane Smith",
        "profile": "https://..."
      },
      "text": "Yes, I'm free at 2 PM",
      "images": [],
      "replyTo": "message_id",
      "mentions": [],
      "createdAt": "2024-01-01T10:05:00.000Z"
    }
  ]
}
```

---

## 2. Send Message

Send a message in a chat.

**Endpoint:** `POST /api/v1/message/:chatId`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| chatId | string | Chat ID |

**Request Body (Form Data):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| text | string | Yes* | Message text |
| images | file[] | No | Image attachments |
| replyTo | string | No | Message ID being replied to |
| mentions | string[] | No | User IDs mentioned (@mention) |

> *Text is required unless sending images

**Success Response (201):**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Message sent successfully",
  "data": {
    "_id": "new_message_id",
    "chat": "chat_id",
    "sender": "user_id",
    "text": "Your message here",
    "images": ["https://s3.../image.jpg"],
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

---

## Real-time Updates

Messages are also delivered in real-time via **Socket.IO**. Connect to the WebSocket server and listen for:

| Event | Description |
|-------|-------------|
| `new-message` | New message received |
| `message-read` | Message marked as read |

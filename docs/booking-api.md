# Booking API

Base path: `/api/v1/booking`

## Endpoints Overview

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | Get all bookings | Yes | Worker, Employer |
| GET | `/:id` | Get single booking | Yes | Worker, Employer |
| POST | `/:requestedTo` | Create booking | Yes | Employer |
| PATCH | `/:id` | Update booking status | Yes | Worker |
| DELETE | `/:id` | Delete booking | Yes | Employer |

---

## 1. Get All Bookings

Get all bookings for the authenticated user.

**Endpoint:** `GET /api/v1/booking`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| status | string | Filter by status |

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Bookings retrieved successfully",
  "data": [
    {
      "_id": "booking_id",
      "requestedBy": {
        "_id": "employer_id",
        "name": "John Doe"
      },
      "requestedTo": {
        "_id": "worker_id",
        "name": "Jane Smith"
      },
      "status": "pending",
      "date": "2024-01-15",
      "time": "10:00",
      "description": "House cleaning service",
      "price": 100,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 2. Get Single Booking

Get booking details by ID.

**Endpoint:** `GET /api/v1/booking/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Booking retrieved successfully",
  "data": { ... }
}
```

---

## 3. Create Booking (Employer)

Create a booking request to a worker.

**Endpoint:** `POST /api/v1/booking/:requestedTo`

**Headers:**
```
Authorization: Bearer <employer_access_token>
```

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| requestedTo | string | Worker ID to book |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| date | string | Yes | Booking date (YYYY-MM-DD) |
| time | string | Yes | Booking time (HH:mm) |
| description | string | No | Service description |
| price | number | Yes | Agreed price |
| address | string | Yes | Service address |

**Success Response (201):**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Booking created successfully",
  "data": { ... }
}
```

---

## 4. Update Booking (Worker)

Accept or reject a booking request.

**Endpoint:** `PATCH /api/v1/booking/:id`

**Headers:**
```
Authorization: Bearer <worker_access_token>
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | Yes | `accepted`, `rejected`, `completed`, `cancelled` |

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Booking updated successfully",
  "data": { ... }
}
```

---

## 5. Delete Booking (Employer)

Cancel/delete a booking.

**Endpoint:** `DELETE /api/v1/booking/:id`

**Headers:**
```
Authorization: Bearer <employer_access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Booking deleted successfully",
  "data": null
}
```

---

## Booking Statuses

| Status | Description |
|--------|-------------|
| `pending` | Waiting for worker response |
| `accepted` | Worker accepted the booking |
| `rejected` | Worker rejected the booking |
| `completed` | Service completed |
| `cancelled` | Booking cancelled |

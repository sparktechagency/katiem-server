# Dashboard API

Base path: `/api/v1/dashboard`

> **Note:** Dashboard endpoints are typically for admin users.

## Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/stats` | Get general platform stats | Yes |
| GET | `/users` | Get all users (paginated) | Yes |
| PATCH | `/users/:userId/block` | Block/unblock a user | Yes |
| PATCH | `/users/:userId/verify` | Toggle user verification | Yes |
| GET | `/monthly-revenue` | Get monthly revenue chart data | Yes |
| GET | `/monthly-subscriptions` | Get daily subscription counts | Yes |
| GET | `/monthly-user-counts` | Get employer/worker counts | Yes |

---

## 1. Get General Stats

Get platform-wide statistics.

**Endpoint:** `GET /api/v1/dashboard/stats`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "General stats retrieved successfully",
  "data": {
    "totalEmployers": 150,
    "totalWorkers": 450,
    "totalSubscription": 85,
    "totalRevenue": "12500.00"
  }
}
```

---

## 2. Get All Users

Get paginated list of all users.

**Endpoint:** `GET /api/v1/dashboard/users`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| searchTerm | string | Search by name, email |
| role | string | Filter by role |
| status | string | Filter by status (active/restricted) |

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Users retrieved successfully",
  "data": {
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 600,
      "totalPages": 60
    },
    "data": [ ... ]
  }
}
```

---

## 3. Block/Unblock User

Toggle user block status.

**Endpoint:** `PATCH /api/v1/dashboard/users/:userId/block`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User blocked successfully",
  "data": null
}
```

---

## 4. Toggle User Verification

Toggle user verification status.

**Endpoint:** `PATCH /api/v1/dashboard/users/:userId/verify`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User verified successfully",
  "data": null
}
```

---

## 5. Get Monthly Revenue (Chart Data)

Get revenue data for a year, broken down by month.

**Endpoint:** `GET /api/v1/dashboard/monthly-revenue`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| year | number | No | Year (default: current year) |

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Monthly revenue retrieved successfully",
  "data": [
    { "month": "Jan", "value": 1500.00 },
    { "month": "Feb", "value": 2300.50 },
    { "month": "Mar", "value": 1800.00 },
    { "month": "Apr", "value": 2100.00 },
    { "month": "May", "value": 2500.00 },
    { "month": "Jun", "value": 2800.00 },
    { "month": "Jul", "value": 3200.00 },
    { "month": "Aug", "value": 3500.00 },
    { "month": "Sep", "value": 3800.00 },
    { "month": "Oct", "value": 4000.00 },
    { "month": "Nov", "value": 4200.00 },
    { "month": "Dec", "value": 4500.00 }
  ]
}
```

---

## 6. Get Monthly Subscriptions (Chart Data)

Get daily subscription counts for a specific month.

**Endpoint:** `GET /api/v1/dashboard/monthly-subscriptions`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| year | number | No | Year (default: current year) |
| month | number | No | Month 1-12 (default: current month) |

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Monthly subscriptions retrieved successfully",
  "data": [
    { "date": "01", "value": 5 },
    { "date": "02", "value": 3 },
    { "date": "03", "value": 8 },
    ...
    { "date": "31", "value": 4 }
  ]
}
```

---

## 7. Get Monthly User Counts (Chart Data)

Get employer and worker registration counts for a specific month.

**Endpoint:** `GET /api/v1/dashboard/monthly-user-counts`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| year | number | No | Year (default: current year) |
| month | number | No | Month 1-12 (default: current month) |

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Monthly user counts retrieved successfully",
  "data": {
    "employers": 45,
    "workers": 120
  }
}
```

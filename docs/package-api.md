# Package API

Base path: `/api/v1/package`

## Endpoints Overview

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | Get all packages | No | Public |
| POST | `/` | Create package | Yes | Admin |
| POST | `/toggle/:packageId` | Toggle package active/inactive | Yes | Admin |
| PATCH | `/:packageId` | Update package | Yes | Admin |
| POST | `/apply-discount` | Apply discount to all packages | Yes | Admin |

---

## 1. Get All Packages

Get list of all subscription packages.

**Endpoint:** `GET /api/v1/package`

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Packages retrieved successfully",
  "data": [
    {
      "_id": "package_id",
      "type": "basic",
      "regularPrice": 9.99,
      "discountPercent": 0,
      "description": "Basic package for starters",
      "features": [
        "5 job posts per month",
        "Basic analytics"
      ],
      "limits": {
        "jobPostLimit": 5,
        "boostLimit": 0
      },
      "interval": "month",
      "currency": "usd",
      "isActive": true
    },
    {
      "_id": "package_id_2",
      "type": "premium",
      "regularPrice": 29.99,
      "discountPercent": 20,
      "description": "Premium package with all features",
      "features": [
        "Unlimited job posts",
        "Priority support",
        "Advanced analytics",
        "Instant booking"
      ],
      "limits": {
        "isJobPostLimitUnlimited": true,
        "boostLimit": 10
      },
      "isInstantBooking": true,
      "interval": "month",
      "currency": "usd",
      "isActive": true
    }
  ]
}
```

---

## 2. Create Package (Admin Only)

Create a new subscription package.

**Endpoint:** `POST /api/v1/package`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | string | Yes | Package type (unique identifier, e.g., "basic", "premium") |
| regularPrice | number | Yes | Monthly price in USD |
| description | string | No | Package description |
| features | string[] | No | List of features |
| interval | string | No | `month` or `year` (default: month) |
| discountPercent | number | No | Discount percentage (0-100) |
| isInstantBooking | boolean | No | Enable instant booking feature |
| limits | object | No | Feature limits |

**Limits Object:**

| Field | Type | Description |
|-------|------|-------------|
| jobPostLimit | number | Max job posts per month |
| isJobPostLimitUnlimited | boolean | Unlimited job posts |
| boostLimit | number | Number of job boosts |
| isBoostLimitUnlimited | boolean | Unlimited boosts |

**Success Response (201):**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Package created successfully",
  "data": { ... }
}
```

---

## 3. Toggle Package (Admin Only)

Enable or disable a package.

**Endpoint:** `POST /api/v1/package/toggle/:packageId`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| packageId | string | Package ID |

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Package toggled successfully",
  "data": {
    "isActive": false
  }
}
```

---

## 4. Update Package (Admin Only)

Update an existing package.

**Endpoint:** `PATCH /api/v1/package/:packageId`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Request Body:** Same as Create Package (all fields optional)

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Package updated successfully",
  "data": { ... }
}
```

---

## 5. Apply Discount (Admin Only)

Apply a global discount to all packages.

**Endpoint:** `POST /api/v1/package/apply-discount`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| discountPercent | number | Yes | Discount percentage (0-100) |

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Discount applied to all packages",
  "data": null
}
```

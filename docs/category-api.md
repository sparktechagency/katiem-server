# Category API

Base path: `/api/v1/category`

## Endpoints Overview

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | Get all categories | No | Public |
| GET | `/:id` | Get single category | No | Public |
| POST | `/` | Create category | Yes | Admin |
| PATCH | `/:id` | Update category | Yes | Admin |
| DELETE | `/:id` | Delete category | Yes | Admin |

---

## 1. Get All Categories

Get paginated list of all categories.

**Endpoint:** `GET /api/v1/category`

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10) |
| sortBy | string | Field to sort by |
| sortOrder | string | `asc` or `desc` |
| searchTerm | string | Search in category name |

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Categorys retrieved successfully",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 20,
    "totalPages": 2
  },
  "data": [
    {
      "_id": "category_id",
      "name": "Cleaning",
      "icon": "https://s3.../cleaning-icon.png",
      "subCategories": ["House Cleaning", "Office Cleaning"],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 2. Get Single Category

Get a category by ID.

**Endpoint:** `GET /api/v1/category/:id`

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| id | string | Category ID |

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Category retrieved successfully",
  "data": {
    "_id": "category_id",
    "name": "Cleaning",
    "icon": "https://s3.../cleaning-icon.png",
    "subCategories": ["House Cleaning", "Office Cleaning"]
  }
}
```

---

## 3. Create Category (Admin Only)

Create a new category.

**Endpoint:** `POST /api/v1/category`

**Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Category name |
| images | file | No | Category icon image |
| subCategories | string[] | No | List of sub-categories |

**Success Response (201):**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Category created successfully",
  "data": {
    "_id": "new_category_id",
    "name": "Plumbing",
    "icon": "https://s3.../plumbing-icon.png",
    "subCategories": ["Pipe Repair", "Installation"]
  }
}
```

---

## 4. Update Category (Admin Only)

Update an existing category.

**Endpoint:** `PATCH /api/v1/category/:id`

**Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: multipart/form-data
```

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| id | string | Category ID |

**Request Body (Form Data):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | No | Category name |
| images | file | No | New icon image |
| subCategories | string[] | No | Updated sub-categories |

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Category updated successfully",
  "data": { ... }
}
```

---

## 5. Delete Category (Admin Only)

Delete a category.

**Endpoint:** `DELETE /api/v1/category/:id`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| id | string | Category ID |

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Category deleted successfully",
  "data": null
}
```

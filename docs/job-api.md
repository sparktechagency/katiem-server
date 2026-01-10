# Job API

Base path: `/api/v1/job`

## Endpoints Overview

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | Get all jobs | Yes | All |
| GET | `/:id` | Get single job | Yes | All |
| GET | `/my-posted-jobs` | Get employer's posted jobs | Yes | Employer |
| POST | `/` | Create a job | Yes | Employer |
| POST | `/:id/apply` | Apply to a job | Yes | Worker |
| PATCH | `/:id` | Update a job | Yes | Employer |
| DELETE | `/:id` | Delete a job | Yes | Employer |

---

## 1. Get All Jobs

Get paginated list of all available jobs.

**Endpoint:** `GET /api/v1/job`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| sortBy | string | Field to sort by |
| sortOrder | string | `asc` or `desc` |
| searchTerm | string | Search in title, description |
| category | string | Filter by category |
| status | string | Filter by status |
| location | string | Filter by location |

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Jobs retrieved successfully",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  },
  "data": [
    {
      "_id": "job_id",
      "title": "House Cleaning Needed",
      "description": "Looking for experienced cleaner...",
      "category": "cleaning",
      "salary": 100,
      "salaryType": "fixed",
      "location": "New York",
      "status": "open",
      "employer": {
        "_id": "employer_id",
        "name": "John Doe",
        "profile": "https://..."
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 2. Get Single Job

Get job details by ID.

**Endpoint:** `GET /api/v1/job/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Job retrieved successfully",
  "data": {
    "_id": "job_id",
    "title": "House Cleaning Needed",
    "description": "Full job description...",
    "category": "cleaning",
    "subCategory": "house-cleaning",
    "salary": 100,
    "salaryType": "fixed",
    "location": "New York",
    "status": "open",
    "requirements": ["Experience required"],
    "employer": { ... },
    "applicants": 5,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 3. Get My Posted Jobs (Employer)

Get jobs posted by the authenticated employer.

**Endpoint:** `GET /api/v1/job/my-posted-jobs`

**Headers:**
```
Authorization: Bearer <employer_access_token>
```

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| status | string | Filter by job status |

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Jobs retrieved successfully",
  "data": [ ... ]
}
```

---

## 4. Create Job (Employer)

Create a new job posting.

**Endpoint:** `POST /api/v1/job`

**Headers:**
```
Authorization: Bearer <employer_access_token>
Content-Type: multipart/form-data
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Job title |
| description | string | Yes | Job description |
| category | string | Yes | Category ID |
| subCategory | string | No | Sub-category |
| salary | number | Yes | Payment amount |
| salaryType | string | Yes | `hourly` or `fixed` |
| location | string | Yes | Job location |
| requirements | string[] | No | Job requirements |
| images | file[] | No | Job images |

**Success Response (201):**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Job created successfully",
  "data": { ... }
}
```

---

## 5. Apply to Job (Worker)

Apply to a job posting.

**Endpoint:** `POST /api/v1/job/:id/apply`

**Headers:**
```
Authorization: Bearer <worker_access_token>
```

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| id | string | Job ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| coverLetter | string | No | Application message |
| proposedSalary | number | No | Worker's proposed rate |

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Application submitted successfully",
  "data": { ... }
}
```

---

## 6. Update Job (Employer)

Update a job posting.

**Endpoint:** `PATCH /api/v1/job/:id`

**Headers:**
```
Authorization: Bearer <employer_access_token>
Content-Type: multipart/form-data
```

**Request Body:** Same as Create Job (all fields optional)

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Job updated successfully",
  "data": { ... }
}
```

---

## 7. Delete Job (Employer)

Delete a job posting.

**Endpoint:** `DELETE /api/v1/job/:id`

**Headers:**
```
Authorization: Bearer <employer_access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Job deleted successfully",
  "data": null
}
```

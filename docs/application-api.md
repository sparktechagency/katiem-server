# Application API

Base path: `/api/v1/application`

## Endpoints Overview

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/:jobId` | Get applications for a job | Yes | Worker, Employer |
| GET | `/single/:id` | Get single application | Yes | Worker, Employer |
| POST | `/:jobId` | Create application | Yes | Worker |
| PATCH | `/:id` | Update application status | Yes | Employer |
| DELETE | `/:id` | Delete application | Yes | Worker |

---

## 1. Get Applications for Job

Get all applications for a specific job.

**Endpoint:** `GET /api/v1/application/:jobId`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| jobId | string | Job ID |

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Applications retrieved successfully",
  "data": [
    {
      "_id": "application_id",
      "job": "job_id",
      "applicant": {
        "_id": "worker_id",
        "name": "Jane Smith",
        "profile": "https://...",
        "rating": 4.5
      },
      "status": "pending",
      "coverLetter": "I am interested in...",
      "proposedSalary": 50,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 2. Get Single Application

Get application details by ID.

**Endpoint:** `GET /api/v1/application/single/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Application retrieved successfully",
  "data": { ... }
}
```

---

## 3. Create Application (Worker)

Apply to a job.

**Endpoint:** `POST /api/v1/application/:jobId`

**Headers:**
```
Authorization: Bearer <worker_access_token>
```

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| jobId | string | Job ID to apply for |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| coverLetter | string | No | Application message |
| proposedSalary | number | No | Proposed rate |

**Success Response (201):**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Application created successfully",
  "data": { ... }
}
```

---

## 4. Update Application (Employer)

Update application status (accept/reject).

**Endpoint:** `PATCH /api/v1/application/:id`

**Headers:**
```
Authorization: Bearer <employer_access_token>
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | Yes | `accepted`, `rejected`, `pending` |

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Application updated successfully",
  "data": { ... }
}
```

---

## 5. Delete Application (Worker)

Withdraw an application.

**Endpoint:** `DELETE /api/v1/application/:id`

**Headers:**
```
Authorization: Bearer <worker_access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Application deleted successfully",
  "data": null
}
```

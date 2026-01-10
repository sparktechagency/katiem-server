# KatieM Server API Documentation

## Overview

This documentation covers all API endpoints for the KatieM Server. Each module is documented separately for easier navigation.

**Base URL:** `/api/v1`

## Modules

- [Authentication API](./auth-api.md) - User registration, login, password management
- [User API](./user-api.md) - User profile management
- [Category API](./category-api.md) - Job categories
- [Job API](./job-api.md) - Job postings
- [Application API](./application-api.md) - Job applications
- [Booking API](./booking-api.md) - Bookings management
- [Subscription API](./subscription-api.md) - Subscription management
- [Package API](./package-api.md) - Subscription packages
- [Chat API](./chat-api.md) - Chat rooms
- [Message API](./message-api.md) - Messages
- [Notification API](./notification-api.md) - Push notifications
- [Dashboard API](./dashboard-api.md) - Admin dashboard
- [Review API](./review-api.md) - Reviews and ratings

## Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success message",
  "data": { ... }
}
```

## Error Response

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "errorMessages": [
    { "path": "fieldName", "message": "Specific error" }
  ]
}
```

## Authentication

Protected routes require a JWT token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

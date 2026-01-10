# Subscription API

Base path: `/api/v1/subscription`

> **Note:** Only users with role `employer` can access subscription endpoints.

## Endpoints Overview

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| POST | `/checkout` | Create checkout session | Yes | Employer |
| GET | `/my-subscription` | Get current subscription | Yes | Employer |
| POST | `/cancel` | Cancel subscription | Yes | Employer |
| POST | `/reactivate` | Reactivate subscription | Yes | Employer |
| POST | `/upgrade` | Upgrade/downgrade plan | Yes | Employer |
| GET | `/invoices` | Get payment invoices | Yes | Employer |
| GET | `/billing-portal` | Get Stripe billing portal URL | Yes | Employer |

---

## 1. Create Checkout Session

Create a Stripe checkout session for subscribing to a package.

**Endpoint:** `POST /api/v1/subscription/checkout`

**Headers:**
```
Authorization: Bearer <employer_access_token>
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| packageId | string | Yes | Package ID to subscribe to |

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Checkout session created successfully",
  "data": {
    "checkoutUrl": "https://checkout.stripe.com/pay/cs_...",
    "sessionId": "cs_test_..."
  }
}
```

**Usage:**
Redirect user to `checkoutUrl` to complete payment on Stripe.

---

## 2. Get My Subscription

Get the current subscription details.

**Endpoint:** `GET /api/v1/subscription/my-subscription`

**Headers:**
```
Authorization: Bearer <employer_access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Subscription retrieved successfully",
  "data": {
    "_id": "subscription_id",
    "packageType": "premium",
    "status": "active",
    "price": 29.99,
    "currency": "usd",
    "startDate": "2024-01-01T00:00:00.000Z",
    "currentPeriodStart": 1704067200,
    "currentPeriodEnd": 1706745600,
    "cancelAtPeriodEnd": false,
    "invoices": [ ... ]
  }
}
```

**No Subscription Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "No active subscription found",
  "data": null
}
```

---

## 3. Cancel Subscription

Cancel the current subscription.

**Endpoint:** `POST /api/v1/subscription/cancel`

**Headers:**
```
Authorization: Bearer <employer_access_token>
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| immediate | boolean | No | If true, cancels immediately. Default: false (cancels at period end) |

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Subscription will be canceled at the end of the billing period",
  "data": { ... }
}
```

---

## 4. Reactivate Subscription

Reactivate a subscription that was set to cancel at period end.

**Endpoint:** `POST /api/v1/subscription/reactivate`

**Headers:**
```
Authorization: Bearer <employer_access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Subscription reactivated successfully",
  "data": { ... }
}
```

---

## 5. Upgrade/Downgrade Subscription

Change to a different subscription package.

**Endpoint:** `POST /api/v1/subscription/upgrade`

**Headers:**
```
Authorization: Bearer <employer_access_token>
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| packageId | string | Yes | New package ID |

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Subscription upgraded successfully",
  "data": { ... }
}
```

> **Note:** Upgrade charges the difference immediately (proration).

---

## 6. Get Invoices

Get list of payment invoices.

**Endpoint:** `GET /api/v1/subscription/invoices`

**Headers:**
```
Authorization: Bearer <employer_access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Invoices retrieved successfully",
  "data": [
    {
      "invoiceId": "in_...",
      "invoiceUrl": "https://invoice.stripe.com/...",
      "invoicePdf": "https://invoice.stripe.com/.../pdf",
      "amountPaid": 29.99,
      "currency": "usd",
      "paidAt": 1704067200,
      "status": "paid"
    }
  ]
}
```

---

## 7. Get Billing Portal

Get Stripe billing portal URL for managing payment methods.

**Endpoint:** `GET /api/v1/subscription/billing-portal`

**Headers:**
```
Authorization: Bearer <employer_access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Billing portal URL generated successfully",
  "data": {
    "url": "https://billing.stripe.com/session/..."
  }
}
```

---

## Subscription Statuses

| Status | Description |
|--------|-------------|
| `active` | Subscription is active |
| `trialing` | In trial period |
| `past_due` | Payment failed, retrying |
| `canceled` | Subscription canceled |
| `unpaid` | Payment failed |
| `paused` | Subscription paused |

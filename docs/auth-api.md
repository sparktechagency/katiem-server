# Authentication API

Base path: `/api/v1/auth`

## Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/signup` | Register a new user | No |
| POST | `/login` | User login | No |
| POST | `/admin-login` | Admin login | No |
| POST | `/verify-account` | Verify account with OTP | No |
| POST | `/forget-password` | Request password reset OTP | No |
| POST | `/reset-password` | Reset password with token | Token |
| POST | `/resend-otp` | Resend OTP code | Temp Token |
| POST | `/change-password` | Change current password | Yes |
| POST | `/refresh-token` | Refresh access token | Cookie |
| DELETE | `/delete-account` | Delete user account | Yes |

---

## 1. Sign Up

Register a new user account. An OTP will be sent to the email for verification.

**Endpoint:** `POST /api/v1/auth/signup`

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "address": "123 Main St, City",
  "role": "employer"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | User's full name |
| email | string | Yes | Valid email address |
| phone | string | Yes | Phone number (E.164 format) |
| password | string | Yes | Min 6 characters |
| address | string | Yes | User's address |
| role | string | Yes | `employer` or `worker` |

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User created successfully",
  "data": {
    "accessToken": "temp_token...",
    "message": "Please verify your account"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "An account with this email already exists"
}
```

---

## 2. Login

Login with email/phone and password.

**Endpoint:** `POST /api/v1/auth/login`

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123",
  "deviceToken": "fcm_device_token_optional"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Optional* | Valid email address |
| phone | string | Optional* | Phone number |
| password | string | Yes | User password (min 6 chars) |
| deviceToken | string | No | FCM device token for push notifications |

> *Either email OR phone is required

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "role": "employer"
  }
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| 400 | Email or phone is required |
| 401 | Invalid credentials |
| 403 | Account not verified |
| 403 | Account is restricted |

---

## 3. Admin Login

Login endpoint specifically for admin users.

**Endpoint:** `POST /api/v1/auth/admin-login`

**Request Body:**

```json
{
  "email": "admin@example.com",
  "password": "adminpassword123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Optional* | Admin email |
| phone | string | Optional* | Admin phone |
| password | string | Yes | Admin password (min 6 chars) |

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "role": "admin"
  }
}
```

---

## 4. Verify Account

Verify account using OTP sent to email after signup.

**Endpoint:** `POST /api/v1/auth/verify-account`

**Request Body:**

```json
{
  "email": "john@example.com",
  "oneTimeCode": "123456"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Optional* | User's email |
| phone | string | Optional* | User's phone |
| oneTimeCode | string | Yes | 6-digit OTP code |

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Account verified successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "role": "employer",
    "token": null
  }
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| 400 | Invalid OTP |
| 400 | OTP expired |

---

## 5. Forget Password

Request a password reset OTP.

**Endpoint:** `POST /api/v1/auth/forget-password`

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Optional* | User's email |
| phone | string | Optional* | User's phone |

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "An OTP has been sent to your john@example.com. Please verify your email.",
  "data": {
    "token": "temp_reset_token..."
  }
}
```

---

## 6. Reset Password

Reset password using the token from forget password.

**Endpoint:** `POST /api/v1/auth/reset-password`

**Headers:**

```
Authorization: Bearer <temp_reset_token>
```

**Request Body:**

```json
{
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| newPassword | string | Yes | New password (min 8 chars) |
| confirmPassword | string | Yes | Must match newPassword |

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset successfully, please login now.",
  "data": null
}
```

---

## 7. Resend OTP

Resend OTP for account verification or password reset.

**Endpoint:** `POST /api/v1/auth/resend-otp`

**Headers:**

```
Authorization: Bearer <temp_token>
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "authType": "createAccount"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Optional* | User's email |
| phone | string | Optional* | User's phone |
| authType | string | No | `resetPassword` or `createAccount` |

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "An OTP has been sent to your john@example.com. Please verify your email."
}
```

---

## 8. Change Password

Change password for authenticated users.

**Endpoint:** `POST /api/v1/auth/change-password`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| currentPassword | string | Yes | Current password |
| newPassword | string | Yes | New password (min 8 chars) |
| confirmPassword | string | Yes | Must match newPassword |

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password changed successfully",
  "data": null
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| 400 | Passwords do not match |
| 401 | Current password is incorrect |

---

## 9. Refresh Token

Get a new access token using refresh token.

**Endpoint:** `POST /api/v1/auth/refresh-token`

**Cookies:**

```
refreshToken=<refresh_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

## 10. Delete Account

Delete the authenticated user's account.

**Endpoint:** `DELETE /api/v1/auth/delete-account`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "password": "password123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| password | string | Yes | Current password for confirmation |

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Account deleted successfully",
  "data": null
}
```

---

## Token Types

| Token | Usage | Expiry |
|-------|-------|--------|
| Access Token | API authentication | Short-lived |
| Refresh Token | Get new access token | Long-lived |
| Temp Token | OTP verification, password reset | Very short-lived |

## User Roles

| Role | Description |
|------|-------------|
| `admin` | Platform administrator |
| `employer` | Can post jobs, hire workers |
| `worker` | Can apply for jobs |

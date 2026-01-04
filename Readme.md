# BazaarWale Backend API

Base URL: `https://bazaarwale-backend.onrender.com`

## Register
**POST** `/api/user/auth/register`  
**Auth:** No

```body
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "gender": "male",
  "mobile": "1234567890"
}
```

## Login
**POST** `/api/user/auth/login`  
**Auth:** No

```body
{
  "email": "user@example.com",
  "password": "password123"
}
```

## Refresh Token
**POST** `/api/user/auth/refresh-token`  
**Auth:** No



## Reset Password - Step 1: Email
**POST** `/api/user/auth/validateresetpasswordemail`  
**Auth:** No

```body
{
  "email": "user@example.com"
}
```

## Reset Password - Step 2: OTP
**POST** `/api/user/auth/validateresetpasswordotp`  
**Auth:** No

```body
{
  "email": "user@example.com",
  "otp": "123456"
}
```

## Reset Password - Step 3: New Password
**POST** `/api/user/auth/resetpassword`  
**Auth:** No

```body
{
  "email": "user@example.com",
  "password": "newPassword123"
}
```

## Get User Data
**GET** `/api/user/profile/userdata`  
**Auth:** Yes (Bearer Token)

## Get Basic User Data
**GET** `/api/user/profile/userdatabasic`  
**Auth:** Yes (Bearer Token)

## Verify User Email
**POST** `/api/user/profile/verify-user-email`  
**Auth:** Yes (Bearer Token)

```body
{
  "email": "user@example.com"
}
```

## Verify Email OTP
**POST** `/api/user/profile/verify-user-email-otp`  
**Auth:** Yes (Bearer Token)

```body
{
  "otp": "123456"
}
```

## Delete User Account
**POST** `/api/user/profile/delete-user`  
**Auth:** Yes (Bearer Token)

## Manage Two-Factor Auth
**POST** `/api/user/profile/manage-twofactor-auth`  
**Auth:** Yes (Bearer Token)

```body
{
  "twoFactorAuth": "false"
}
```

## Manage Login Activity
**POST** `/api/user/profile/manage-login-activity`  
**Auth:** Yes (Bearer Token)

```body
{
  "loginActivity": "false"
}
```

## Update User Profile
**POST** `/api/user/profile/update-user-profile`  
**Auth:** Yes (Bearer Token)

```body
{
  "name": "Jane Smith",
  "email": "user@example.com",
  "mobile": "9876543210",
  "gender": "female"
}
```

## Change Password
**POST** `/api/user/profile/change-password`  
**Auth:** Yes (Bearer Token)

```body
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

## Add New Address
**POST** `/api/user/profile/add-address`  
**Auth:** Yes (Bearer Token)

```body
{
  "name": "Alex Johnson",
  "mobile": "5551234567",
  "streetDetails": "123 Main Street, Apartment 4B",
  "city": "New York",
  "state": "NY",
  "postalCode": "10001",
  "addressType": "home",
  "isDefault": "false"
}
```

## Contact Us
**POST** `/api/user/contact/contact`  
**Auth:** No

```body
{
  "name": "Sarah Williams",
  "email": "contact@example.com",
  "mobile": "5559876543",
  "message": "Sample message text"
}
```

## Newsletter Subscription
**POST** `/api/user/contact/newsletter`  
**Auth:** No

```body
{
  "email": "newsletter@example.com"
}
```

## Live Dashboard
**GET** `/`  
**Auth:** No

## Get Logs
**GET** `/api/logs`  
**Auth:** No

## Clear Logs
**POST** `/api/logs/clear`  
**Auth:** No

## Stop Server
**POST** `/api/server/stop`  
**Auth:** No

---

## Environment Variables

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_token_secret
NODE_ENV=development
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

---

## Authentication

### Token System

This API uses a **dual-token authentication system**:

1. **Access Token** (Bearer Token)
   - Short-lived: 10 minutes
   - Sent in `Authorization` header: `Bearer <token>`
   - Used for API authentication

2. **Refresh Token**
   - Long-lived: 7 days
   - Stored in HTTP-only cookie: `refreshToken`
   - Used to generate new access tokens

### Security Model

**Protected routes require BOTH tokens to be valid:**
- Access token in Authorization header
- Refresh token in HTTP-only cookie

If either token is missing, expired, or invalid, the request is rejected and user must login again.

### Error Codes

Authentication endpoints return specific error codes:

| Code | Meaning | Action |
|------|---------|--------|
| `TOKEN_EXPIRED` | Access token expired | Call `/refresh-token` endpoint |
| `INVALID_TOKEN` | Access token invalid/malformed | Force user to login |
| `REFRESH_TOKEN_NOT_FOUND` | No refresh token cookie | Force user to login |
| `REFRESH_TOKEN_EXPIRED` | Refresh token expired | Force user to login |
| `INVALID_REFRESH_TOKEN` | Refresh token invalid | Force user to login |
| `TOKEN_VERIFICATION_FAILED` | Other verification error | Force user to login |

### Client Requirements

**Required for all API requests:**
```javascript
// Enable cookies to be sent/received
withCredentials: true

// Add Authorization header for protected routes
headers: {
  'Authorization': 'Bearer <access_token>'
}
```

### Login Flow

1. **POST** `/api/user/auth/login`
   - Returns: `{ token, user }`
   - Sets: `refreshToken` cookie (HTTP-only)
   - Client stores `token` in localStorage/memory

2. **Make authenticated requests**
   - Send `token` in Authorization header
   - Browser automatically sends `refreshToken` cookie

3. **When access token expires:**
   - Call **POST** `/api/user/auth/refresh-token`
   - Returns: `{ token }` (new access token)
   - Update stored token

4. **When refresh token expires:**
   - User must login again

### Admin Controls

The strict security model enables:
- **Instant user blocking**: Invalidate refresh token to force immediate logout
- **Session management**: Control all active user sessions
- **Security response**: Quick termination of compromised accounts
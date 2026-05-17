# User Authentication & Management API Documentation

This document provides a comprehensive guide to all the API endpoints defined in [userRoutes.js](file:///c:/Project/Personal/Password%20Manager/backend/src/routes/userRoutes.js). 

The base path for all the endpoints listed below is: **`/api/users`**

---

## 📌 Summary Table

| HTTP Method | Endpoint | Description | Authentication | Role Allowed |
| :--- | :--- | :--- | :--- | :--- |
| **`POST`** | `/register` | Registers a new user account | **Required** (JWT) | `super-admin` |
| **`POST`** | `/login` | Authenticates a user and returns a token | None | Any |
| **`GET`** | `/me` | Retrieves current logged-in user profile | **Required** (JWT) | Any |
| **`GET`** | `/all-users` | Retrieves a list of all registered users | **Required** (JWT) | `super-admin`, `admin` |
| **`PUT`** | `/update-user-info/:email` | Updates a user's role and block status | **Required** (JWT) | `super-admin` |
| **`DELETE`** | `/delete-user/:email` | Deletes a user account by email | **Required** (JWT) | `super-admin` |
| **`PUT`** | `/change-password` | Changes the logged-in user's password | **Required** (JWT) | Any |
| **`PUT`** | `/reset-user-password/:email` | Force resets a user's password by email | **Required** (JWT) | `super-admin` |

---

## 🔒 Authorization Header
Endpoints that require authentication must include the JWT token in the `Authorization` request header:
```http
Authorization: Bearer <your_jwt_token>
```

---

## 🚀 API Endpoint Details

### 1. User Registration
* **Endpoint:** `POST /api/users/register`
* **Description:** Creates a new user profile in the database.
* **Authentication:** **Required** (JWT)
* **Access Control:** `super-admin` only

#### Request Body Parameters (JSON)
| Field | Type | Status | Description | Validation / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `firstName` | `string` | **Required** | The first name of the user | Cannot be empty, trimmed |
| `lastName` | `string` | **Required** | The last name of the user | Cannot be empty, trimmed |
| `email` | `string` | **Required** | User's unique email address | Must be valid email, unique, trimmed, auto-lowercased |
| `password` | `string` | **Required** | Secure password for the account | Minimum 6 characters |
| `phoneNumber` | `string` | **Required** | Contact phone number of the user | Cannot be empty, trimmed |

#### Example Request Body
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "securepassword123",
  "phoneNumber": "+1234567890"
}
```

#### Example Responses

##### 🟢 Success Response (201 Created)
```json
{
  "success": true,
  "user": {
    "_id": "66474b5fae5fbbd812345678",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+1234567890",
    "role": "user",
    "isBlocked": false,
    "isActive": true,
    "createdAt": "2026-05-17T06:00:00.000Z",
    "updatedAt": "2026-05-17T06:00:00.000Z"
  }
}
```

##### 🔴 Error Response: User Already Exists (400 Bad Request)
```json
{
  "success": false,
  "message": "User already exists"
}
```

##### 🔴 Error Response: Unauthorized / Access Denied (401 / 403)
```json
{
  "success": false,
  "message": "Access denied"
}
```

---

### 2. User Login
* **Endpoint:** `POST /api/users/login`
* **Description:** Authenticates user credentials and returns a JWT access token.
* **Authentication:** None
* **Access Control:** Public

#### Request Body Parameters (JSON)
| Field | Type | Status | Description |
| :--- | :--- | :--- | :--- |
| `email` | `string` | **Required** | The user's registered email |
| `password` | `string` | **Required** | The user's password |

#### Example Request Body
```json
{
  "email": "john.doe@example.com",
  "password": "securepassword123"
}
```

#### Example Responses

##### 🟢 Success Response (200 OK)
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjQ3NGI1ZmFlNWZiYmQ4MTIzNDU2NzgiLCJpYXQiOjE3Nzk4MTM2MDB9..."
}
```

##### 🔴 Error Response: Invalid Credentials (401 Unauthorized)
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### 3. Get Current User Profile
* **Endpoint:** `GET /api/users/me`
* **Description:** Retrieves the authenticated profile information of the current logged-in user.
* **Authentication:** **Required** (JWT)
* **Access Control:** Any authenticated user

#### Request Parameters
* None (uses details from the JWT token passed in the `Authorization` header).

#### Example Responses

##### 🟢 Success Response (200 OK)
```json
{
  "success": true,
  "user": {
    "_id": "66474b5fae5fbbd812345678",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+1234567890",
    "role": "user",
    "isBlocked": false,
    "isActive": true,
    "createdAt": "2026-05-17T06:00:00.000Z",
    "updatedAt": "2026-05-17T06:00:00.000Z"
  }
}
```

##### 🔴 Error Response: Invalid Token (401 Unauthorized)
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

---

### 4. Get All Users
* **Endpoint:** `GET /api/users/all-users`
* **Description:** Retrieves a complete list of all users registered in the system (passwords omitted).
* **Authentication:** **Required** (JWT)
* **Access Control:** `super-admin` and `admin` only

#### Request Parameters
* None.

#### Example Responses

##### 🟢 Success Response (200 OK)
```json
{
  "success": true,
  "count": 2,
  "users": [
    {
      "_id": "66474b5fae5fbbd812345678",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phoneNumber": "+1234567890",
      "role": "user",
      "isBlocked": false,
      "isActive": true,
      "createdAt": "2026-05-17T06:00:00.000Z",
      "updatedAt": "2026-05-17T06:00:00.000Z"
    },
    {
      "_id": "66474b5fae5fbbd812345679",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@example.com",
      "phoneNumber": "+0987654321",
      "role": "admin",
      "isBlocked": false,
      "isActive": true,
      "createdAt": "2026-05-17T05:00:00.000Z",
      "updatedAt": "2026-05-17T05:00:00.000Z"
    }
  ]
}
```

##### 🔴 Error Response: Access Denied (403 Forbidden)
```json
{
  "success": false,
  "message": "Access denied"
}
```

---

### 5. Update User Info
* **Endpoint:** `PUT /api/users/update-user-info/:email`
* **Description:** Modifies administrative properties of a specific user identifying them by email.
* **Authentication:** **Required** (JWT)
* **Access Control:** `super-admin` only

#### Path Parameters
| Field | Type | Status | Description |
| :--- | :--- | :--- | :--- |
| `email` | `string` | **Required** | The email address of the user to be updated |

#### Request Body Parameters (JSON)
> [!IMPORTANT]
> At least one of the parameters (`role` or `isBlocked`) must be provided. If both are omitted, the API will return a `400 Bad Request` with the message `"Nothing to update"`.

| Field | Type | Status | Description | Validation / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `role` | `string` | **Optional** | Set the user's role | Must be one of: `['super-admin', 'admin', 'user']` |
| `isBlocked` | `boolean` | **Optional** | Lock/Unlock user's access | Must be `true` or `false` |

#### Example Request Body
```json
{
  "role": "admin",
  "isBlocked": true
}
```

#### Example Responses

##### 🟢 Success Response (200 OK)
```json
{
  "success": true,
  "message": "User info updated successfully"
}
```

##### 🔴 Error Response: User Not Found (404 Not Found)
```json
{
  "success": false,
  "message": "User not found"
}
```

##### 🔴 Error Response: Invalid Parameters (400 Bad Request)
```json
{
  "success": false,
  "message": "Invalid role"
}
```

---

### 6. Delete User
* **Endpoint:** `DELETE /api/users/delete-user/:email`
* **Description:** Permanently deletes a user from the system by their email address.
* **Authentication:** **Required** (JWT)
* **Access Control:** `super-admin` only

#### Path Parameters
| Field | Type | Status | Description |
| :--- | :--- | :--- | :--- |
| `email` | `string` | **Required** | The email address of the user to delete |

#### Example Responses

##### 🟢 Success Response (200 OK)
```json
{
  "success": true,
  "message": "User deleted successfully",
  "user": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+1234567890"
  }
}
```

##### 🔴 Error Response: User Not Found (404 Not Found)
```json
{
  "success": false,
  "message": "User not found"
}
```

---

### 7. Change Own Password
* **Endpoint:** `PUT /api/users/change-password`
* **Description:** Allows any authenticated user to change their own login password.
* **Authentication:** **Required** (JWT)
* **Access Control:** Any authenticated user

#### Request Body Parameters (JSON)
| Field | Type | Status | Description | Validation / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `currentPassword` | `string` | **Required** | The user's current password | Must match the active password |
| `newPassword` | `string` | **Required** | The new desired password | Minimum 6 characters |

#### Example Request Body
```json
{
  "currentPassword": "oldSecurePassword123",
  "newPassword": "newSecurePassword456"
}
```

#### Example Responses

##### 🟢 Success Response (200 OK)
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

##### 🔴 Error Response: Incorrect Current Password (400 Bad Request)
```json
{
  "success": false,
  "message": "Invalid current password"
}
```

---

### 8. Force Reset User Password
* **Endpoint:** `PUT /api/users/reset-user-password/:email`
* **Description:** Allows a super-admin to administrative bypass and override any user's password.
* **Authentication:** **Required** (JWT)
* **Access Control:** `super-admin` only

#### Path Parameters
| Field | Type | Status | Description |
| :--- | :--- | :--- | :--- |
| `email` | `string` | **Required** | The email address of the user whose password to reset |

#### Request Body Parameters (JSON)
| Field | Type | Status | Description | Validation / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `newPassword` | `string` | **Required** | The new password to assign to the user | Minimum 6 characters |

#### Example Request Body
```json
{
  "newPassword": "adminAssignedPassword789"
}
```

#### Example Responses

##### 🟢 Success Response (200 OK)
```json
{
  "success": true,
  "message": "User password reset successfully"
}
```

##### 🔴 Error Response: User Not Found (404 Not Found)
```json
{
  "success": false,
  "message": "User not found"
}
```

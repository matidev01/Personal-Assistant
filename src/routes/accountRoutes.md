# Account Management API Documentation

This document provides a comprehensive guide to all the API endpoints defined in [accountRoutes.js](file:///c:/Project/Personal/Password%20Manager/backend/src/routes/accountRoutes.js).

The base path for all the endpoints listed below is: **`/api/accounts`**

---

## 📌 Summary Table

| HTTP Method | Endpoint | Description | Authentication | Access Control |
| :--- | :--- | :--- | :--- | :--- |
| **`POST`** | `/create-account` | Creates a new encrypted account credential | **Required** (JWT) | Any authenticated user |
| **`GET`** | `/all-accounts` | Retrieves all registered account credentials | **Required** (JWT) | Owner (or `super-admin` for all) |
| **`GET`** | `/single-account/:id` | Retrieves credentials of a single account | **Required** (JWT) | Owner or `super-admin` |
| **`PUT`** | `/update-account/:id` | Updates a single account's credentials | **Required** (JWT) | Owner or `super-admin` |
| **`DELETE`** | `/delete-account/:id` | Permanently deletes an account record | **Required** (JWT) | Owner or `super-admin` |

---

## 🔒 Authorization Header
Endpoints require authentication and must include the JWT token in the `Authorization` request header:
```http
Authorization: Bearer <your_jwt_token>
```

---

## 🚀 API Endpoint Details

### 1. Create Account
* **Endpoint:** `POST /api/accounts/create-account`
* **Description:** Encrypts and saves sensitive account credentials in the database.
* **Authentication:** **Required** (JWT)
* **Access Control:** Any authenticated user can create accounts.

#### Request Body Parameters (JSON)
| Field | Type | Status | Description | Validation / Encryption |
| :--- | :--- | :--- | :--- | :--- |
| `name` | `string` | **Required** | The display name of the account (e.g., "Google", "GitHub") | Cannot be empty, trimmed |
| `category` | `string` | **Required** | The category/label (e.g., "Social", "Work", "Finance") | Cannot be empty, trimmed |
| `description` | `string` | **Required** | Notes or descriptive text for the account | Cannot be empty, trimmed. **Encrypted in DB** |
| `usernameOrEmail`| `string` | **Optional** | Primary login identifier | Trimmed, auto-lowercased, defaults to null |
| `password` | `string` | **Optional** | Password for the account | Trimmed. **Encrypted in DB**, defaults to null |
| `connectedEmail` | `string` | **Optional** | Secondary/Connected email address | Trimmed, auto-lowercased, defaults to null |
| `phoneNumber` | `string` | **Optional** | Secondary/Connected phone number | Trimmed, defaults to null |
| `recoveryEmail` | `string` | **Optional** | Recovery email address | Trimmed, auto-lowercased, defaults to null |

#### Example Request Body
```json
{
  "name": "Google Account",
  "category": "Email",
  "usernameOrEmail": "user@gmail.com",
  "password": "supersecretpassword123",
  "connectedEmail": "backup@gmail.com",
  "phoneNumber": "+1234567890",
  "recoveryEmail": "recovery@gmail.com",
  "description": "Primary personal email account used for all services."
}
```

#### Example Responses

##### 🟢 Success Response (201 Created)
```json
{
  "success": true,
  "message": "Account created successfully",
  "account": {
    "_id": "66474b5fae5fbbd81234abcd",
    "name": "Google Account",
    "category": "Email"
  }
}
```

##### 🔴 Error Response: Missing Fields (400 Bad Request)
```json
{
  "success": false,
  "message": "name, category and description are required"
}
```

---

### 2. Get All Accounts
* **Endpoint:** `GET /api/accounts/all-accounts`
* **Description:** Retrieves all account credentials. 
  * *Access Scope:* If the logged-in user is a `super-admin`, it returns **all accounts in the system** (populated with the details of the creator). For other roles (e.g., `user`, `admin`), it only returns accounts **created by that specific user**.
  * *Security:* Decrypts and exposes `password` and `description` field values automatically.
* **Authentication:** **Required** (JWT)
* **Access Control:** Owner (for user's own accounts) or `super-admin` (for all system accounts).

#### Request Parameters
* None.

#### Example Responses

##### 🟢 Success Response (200 OK)
```json
{
  "success": true,
  "count": 1,
  "accounts": [
    {
      "_id": "66474b5fae5fbbd81234abcd",
      "user": "66474b5fae5fbbd812345678",
      "addedBy": "John Doe",
      "name": "Google Account",
      "category": "Email",
      "usernameOrEmail": "user@gmail.com",
      "password": "supersecretpassword123",
      "connectedEmail": "backup@gmail.com",
      "phoneNumber": "+1234567890",
      "recoveryEmail": "recovery@gmail.com",
      "description": "Primary personal email account used for all services.",
      "createdAt": "2026-05-17T06:00:00.000Z",
      "updatedAt": "2026-05-17T06:00:00.000Z"
    }
  ]
}
```

---

### 3. Get Single Account Credentials
* **Endpoint:** `GET /api/accounts/single-account/:id`
* **Description:** Retrieves the detailed credentials of a single account record.
  * *Security:* Decrypts and exposes `password` and `description` field values automatically.
* **Authentication:** **Required** (JWT)
* **Access Control:** Owner (the user who created it) or `super-admin` only.

#### Path Parameters
| Field | Type | Status | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | **Required** | The unique MongoDB ObjectId of the account record |

#### Example Responses

##### 🟢 Success Response (200 OK)
```json
{
  "success": true,
  "account": {
    "_id": "66474b5fae5fbbd81234abcd",
    "user": "66474b5fae5fbbd812345678",
    "name": "Google Account",
    "category": "Email",
    "usernameOrEmail": "user@gmail.com",
    "password": "supersecretpassword123",
    "connectedEmail": "backup@gmail.com",
    "phoneNumber": "+1234567890",
    "recoveryEmail": "recovery@gmail.com",
    "description": "Primary personal email account used for all services.",
    "createdAt": "2026-05-17T06:00:00.000Z",
    "updatedAt": "2026-05-17T06:00:00.000Z"
  }
}
```

##### 🔴 Error Response: Access Denied (403 Forbidden)
```json
{
  "success": false,
  "message": "Access denied"
}
```

##### 🔴 Error Response: Not Found (404 Not Found)
```json
{
  "success": false,
  "message": "Account not found"
}
```

---

### 4. Update Account
* **Endpoint:** `PUT /api/accounts/update-account/:id`
* **Description:** Updates the details of a single account record.
  * *Security:* Re-encrypts `password` and `description` if they are updated.
* **Authentication:** **Required** (JWT)
* **Access Control:** Owner (the user who created it) or `super-admin` only.

#### Path Parameters
| Field | Type | Status | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | **Required** | The unique MongoDB ObjectId of the account record |

#### Request Body Parameters (JSON)
> [!NOTE]
> All parameters in the request body are **Optional**. Only the provided fields will be updated.

| Field | Type | Status | Description | Validation / Encryption |
| :--- | :--- | :--- | :--- | :--- |
| `name` | `string` | **Optional** | Display name of the account | Cannot be empty if sent, trimmed |
| `category` | `string` | **Optional** | Category label | Cannot be empty if sent, trimmed |
| `usernameOrEmail`| `string` | **Optional** | Primary login identifier | Trimmed, auto-lowercased (supports clearing with `null`) |
| `password` | `string` | **Optional** | Password for the account | Trimmed. **Encrypted in DB** (supports clearing with `null`) |
| `connectedEmail` | `string` | **Optional** | Secondary email address | Trimmed, auto-lowercased (supports clearing with `null`) |
| `phoneNumber` | `string` | **Optional** | Connected phone number | Trimmed (supports clearing with `null`) |
| `recoveryEmail` | `string` | **Optional** | Recovery email address | Trimmed, auto-lowercased (supports clearing with `null`) |
| `description` | `string` | **Optional** | Notes/description | Cannot be empty if sent, trimmed. **Encrypted in DB** |

#### Example Request Body
```json
{
  "category": "Personal Email",
  "password": "newSuperSecretPassword456"
}
```

#### Example Responses

##### 🟢 Success Response (200 OK)
```json
{
  "success": true,
  "message": "Account updated successfully",
  "account": {
    "_id": "66474b5fae5fbbd81234abcd",
    "name": "Google Account",
    "category": "Personal Email",
    "usernameOrEmail": "user@gmail.com",
    "connectedEmail": "backup@gmail.com",
    "phoneNumber": "+1234567890",
    "recoveryEmail": "recovery@gmail.com",
    "description": "Primary personal email account used for all services.",
    "updatedAt": "2026-05-17T06:15:00.000Z"
  }
}
```

##### 🔴 Error Response: Empty Field (400 Bad Request)
```json
{
  "success": false,
  "message": "category cannot be empty"
}
```

---

### 5. Delete Account
* **Endpoint:** `DELETE /api/accounts/delete-account/:id`
* **Description:** Permanently deletes an account record from the database.
* **Authentication:** **Required** (JWT)
* **Access Control:** Owner (the user who created it) or `super-admin` only.

#### Path Parameters
| Field | Type | Status | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | **Required** | The unique MongoDB ObjectId of the account record |

#### Example Responses

##### 🟢 Success Response (200 OK)
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

##### 🔴 Error Response: Access Denied (403 Forbidden)
```json
{
  "success": false,
  "message": "Access denied"
}
```

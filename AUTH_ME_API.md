# /auth/me Endpoint Documentation

This document describes the `/auth/me` endpoint that validates the active token from the frontend and returns current user information.

## Endpoint Overview

**URL:** `GET /auth/me`  
**Purpose:** Validate the active JWT token and return current user information  
**Authentication:** Required (Bearer token in Authorization header)

## Request

### Headers
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

### Example Request
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

## Response

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "student",
      "isEmailVerified": true,
      "isActive": true,
      "profileImage": "https://example.com/profile.jpg",
      "phone": "+1234567890",
      "address": "123 Main St, City, Country",
      "totalTestsTaken": 15,
      "lastLoginAt": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "tokenValid": true,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Responses

#### 401 Unauthorized - No Token Provided
```json
{
  "success": false,
  "message": "Access token is required",
  "error": "No token provided"
}
```

#### 401 Unauthorized - Invalid Token
```json
{
  "success": false,
  "message": "Invalid access token",
  "error": "Token verification failed"
}
```

#### 401 Unauthorized - User Not Found
```json
{
  "success": false,
  "message": "User not found",
  "error": "User account no longer exists"
}
```

#### 403 Forbidden - Account Deactivated
```json
{
  "success": false,
  "message": "Account deactivated",
  "error": "Your account has been deactivated"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to validate token",
  "error": "Database connection error"
}
```

## Use Cases

### 1. Frontend Token Validation
Use this endpoint to validate if the stored token is still valid when the user returns to the application.

```javascript
// Frontend example
const validateToken = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      // Redirect to login
      return false;
    }

    const response = await fetch('/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      // Token is valid, user is authenticated
      setUser(data.data.user);
      return true;
    } else {
      // Token is invalid, redirect to login
      localStorage.removeItem('accessToken');
      return false;
    }
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};
```

### 2. Get Current User Information
Retrieve complete user profile information including statistics.

```javascript
// Get user profile with test statistics
const getUserProfile = async () => {
  const response = await fetch('/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.ok) {
    const data = await response.json();
    const user = data.data.user;
    
    console.log(`Welcome back, ${user.name}!`);
    console.log(`You've taken ${user.totalTestsTaken} tests`);
    console.log(`Last login: ${new Date(user.lastLoginAt).toLocaleDateString()}`);
  }
};
```

### 3. Check Account Status
Verify if the user's account is active and email is verified.

```javascript
// Check account status
const checkAccountStatus = async () => {
  const response = await fetch('/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.ok) {
    const data = await response.json();
    const user = data.data.user;
    
    if (!user.isActive) {
      alert('Your account has been deactivated. Please contact support.');
      return false;
    }
    
    if (!user.isEmailVerified) {
      alert('Please verify your email address to continue.');
      return false;
    }
    
    return true;
  }
  
  return false;
};
```

## Security Features

### 1. Token Validation
- Verifies JWT token signature and expiration
- Checks if token is properly formatted
- Validates token payload structure

### 2. User Account Validation
- Confirms user still exists in database
- Checks if account is active
- Verifies user permissions and role

### 3. Fresh Data Retrieval
- Fetches current user data from database
- Ensures data is up-to-date
- Excludes sensitive fields (password, refresh tokens)

### 4. Comprehensive Error Handling
- Provides specific error messages for different failure scenarios
- Maintains security by not exposing sensitive information
- Returns appropriate HTTP status codes

## Integration with Frontend Frameworks

### React Example
```javascript
import { useEffect, useState } from 'react';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch('/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.data.user);
        } else {
          localStorage.removeItem('accessToken');
        }
      } catch (error) {
        console.error('Auth validation error:', error);
      } finally {
        setLoading(false);
      }
    };

    validateAuth();
  }, []);

  return { user, loading };
};
```

### Vue.js Example
```javascript
// In your Vue component
export default {
  data() {
    return {
      user: null,
      loading: true
    };
  },
  
  async mounted() {
    await this.validateAuth();
  },
  
  methods: {
    async validateAuth() {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          this.loading = false;
          return;
        }

        const response = await fetch('/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          this.user = data.data.user;
        } else {
          localStorage.removeItem('accessToken');
          this.$router.push('/login');
        }
      } catch (error) {
        console.error('Auth validation error:', error);
      } finally {
        this.loading = false;
      }
    }
  }
};
```

## Testing

You can test the endpoint using the provided test script:

```bash
# Install axios if not already installed
npm install axios

# Update the test token in test-auth-me.js
# Then run the test
node test-auth-me.js
```

## Performance Considerations

1. **Caching**: The endpoint fetches fresh data from the database each time
2. **Database Queries**: Uses efficient MongoDB queries with field selection
3. **Response Size**: Excludes sensitive fields to minimize response size
4. **Error Handling**: Fast failure for invalid tokens to reduce server load

## Best Practices

1. **Regular Validation**: Call this endpoint on app startup and periodically
2. **Error Handling**: Always handle authentication errors gracefully
3. **Token Storage**: Store tokens securely (httpOnly cookies for production)
4. **User Experience**: Show loading states during token validation
5. **Fallback**: Redirect to login page when token validation fails 
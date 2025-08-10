# Dashboard API Documentation

This document describes the dashboard API endpoints that provide comprehensive statistical data and infographics for the test school backend.

## Base URL
```
http://localhost:3000/report
```

## Authentication
All dashboard endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Complete Dashboard Data
Get all dashboard data in a single request.

**Endpoint:** `GET /dashboard/complete`

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "overview": {
        "totalUsers": 150,
        "activeUsers": 45,
        "totalTestSessions": 1200,
        "completedTests": 1100,
        "averageScore": 78.5,
        "completionRate": 91.67
      },
      "recentActivity": {
        "recentTests": 85,
        "newUsers": 12,
        "period": "30 days"
      }
    },
    "trends": [...],
    "competencies": [...],
    "demographics": {...},
    "performance": {...},
    "topPerformers": [...]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Dashboard Overview Statistics
Get key performance indicators and overview statistics.

**Endpoint:** `GET /dashboard/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 150,
      "activeUsers": 45,
      "totalTestSessions": 1200,
      "completedTests": 1100,
      "averageScore": 78.5,
      "completionRate": 91.67
    },
    "recentActivity": {
      "recentTests": 85,
      "newUsers": 12,
      "period": "30 days"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. Test Trends (Last 30 Days)
Get daily test activity trends for the last 30 days.

**Endpoint:** `GET /dashboard/trends`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-15",
      "testsTaken": 15,
      "averageScore": 82.3,
      "completedTests": 14
    },
    {
      "date": "2024-01-14",
      "testsTaken": 12,
      "averageScore": 79.1,
      "completedTests": 11
    }
    // ... 28 more days
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 4. Competency Analytics
Get performance statistics grouped by competency.

**Endpoint:** `GET /dashboard/competencies`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "grammar",
      "totalTests": 450,
      "averageScore": 82.5,
      "passRate": 0.89,
      "minScore": 45,
      "maxScore": 100
    },
    {
      "_id": "vocabulary",
      "totalTests": 380,
      "averageScore": 76.2,
      "passRate": 0.82,
      "minScore": 30,
      "maxScore": 95
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 5. User Demographics
Get user distribution by role and recent activity.

**Endpoint:** `GET /dashboard/demographics`

**Response:**
```json
{
  "success": true,
  "data": {
    "roleDistribution": [
      {
        "_id": "student",
        "count": 120,
        "avgTestsTaken": 8.5
      },
      {
        "_id": "admin",
        "count": 5,
        "avgTestsTaken": 0
      },
      {
        "_id": "supervisor",
        "count": 25,
        "avgTestsTaken": 2.1
      }
    ],
    "recentActivity": [
      {
        "_id": "2024-01-15",
        "activeUsers": 45
      },
      {
        "_id": "2024-01-14",
        "activeUsers": 38
      }
      // ... 5 more days
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 6. Performance Metrics
Get detailed performance analysis including score distribution and time analysis.

**Endpoint:** `GET /dashboard/performance`

**Response:**
```json
{
  "success": true,
  "data": {
    "scoreDistribution": [
      {
        "_id": 0,
        "count": 25,
        "tests": [...]
      },
      {
        "_id": 25,
        "count": 45,
        "tests": [...]
      },
      {
        "_id": 50,
        "count": 120,
        "tests": [...]
      },
      {
        "_id": 75,
        "count": 280,
        "tests": [...]
      },
      {
        "_id": 90,
        "count": 180,
        "tests": [...]
      },
      {
        "_id": 100,
        "count": 50,
        "tests": [...]
      }
    ],
    "timeAnalysis": {
      "avgDuration": 45.2,
      "minDuration": 12.5,
      "maxDuration": 120.0
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 7. Top Performers
Get the best performing users based on their highest scores.

**Endpoint:** `GET /dashboard/top-performers?limit=10`

**Query Parameters:**
- `limit` (optional): Number of top performers to return (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "userId": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "bestScore": 98.5,
      "totalTests": 15,
      "averageScore": 92.3,
      "lastTestDate": "2024-01-15T08:30:00.000Z"
    },
    {
      "userId": "507f1f77bcf86cd799439012",
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "bestScore": 97.0,
      "totalTests": 12,
      "averageScore": 89.7,
      "lastTestDate": "2024-01-14T14:20:00.000Z"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Data Definitions

### Overview Statistics
- **totalUsers**: Total number of active users in the system
- **activeUsers**: Number of users who logged in within the last 7 days
- **totalTestSessions**: Total number of test sessions (submitted or graded)
- **completedTests**: Number of tests that have been graded
- **averageScore**: Average score across all completed tests
- **completionRate**: Percentage of test sessions that were completed

### Test Trends
- **date**: Date in YYYY-MM-DD format
- **testsTaken**: Number of tests taken on that date
- **averageScore**: Average score for tests taken on that date
- **completedTests**: Number of tests completed on that date

### Competency Analytics
- **_id**: Competency identifier
- **totalTests**: Total number of tests for this competency
- **averageScore**: Average score for this competency
- **passRate**: Percentage of tests that passed (score >= 70)
- **minScore**: Lowest score achieved for this competency
- **maxScore**: Highest score achieved for this competency

### Performance Metrics
- **scoreDistribution**: Distribution of scores in buckets (0-25, 25-50, 50-75, 75-90, 90-100)
- **timeAnalysis**: Statistics about test completion time in minutes

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (in development)"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized
- `500`: Internal Server Error

## Usage Examples

### Frontend Integration

```javascript
// Fetch complete dashboard data
const fetchDashboardData = async () => {
  try {
    const response = await fetch('/report/dashboard/complete', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
};

// Fetch specific metrics
const fetchTrends = async () => {
  const response = await fetch('/report/dashboard/trends', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
};
```

### Chart.js Integration Example

```javascript
// Using the trends data for a line chart
const trendsData = await fetchTrends();
const chartData = {
  labels: trendsData.data.map(item => item.date),
  datasets: [{
    label: 'Tests Taken',
    data: trendsData.data.map(item => item.testsTaken),
    borderColor: 'rgb(75, 192, 192)',
    tension: 0.1
  }]
};
```

## Performance Considerations

1. **Caching**: Consider implementing caching for dashboard data as it doesn't change frequently
2. **Pagination**: For large datasets, consider implementing pagination
3. **Real-time Updates**: For real-time dashboards, consider using WebSockets or Server-Sent Events
4. **Data Aggregation**: The API uses MongoDB aggregation pipelines for efficient data processing

## Security Notes

1. All endpoints require authentication
2. Consider implementing role-based access control for sensitive dashboard data
3. Rate limiting is applied to prevent abuse
4. Input validation is performed on all query parameters 
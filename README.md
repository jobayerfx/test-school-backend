# Test School Backend

A Node.js backend application built with Express.js, Mongoose, and Nodemailer for managing test sessions and providing comprehensive analytics.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or accessible via connection string)
- Email service credentials (Gmail, Outlook, etc.)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your actual values:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/test-school

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_SERVICE=gmail
```

**Important Notes:**
- For Gmail, you'll need to use an App Password instead of your regular password
- The `.env` file is already in `.gitignore` to keep your credentials secure
- You can use MongoDB Atlas by replacing the `MONGODB_URI` with your cloud connection string

## Usage

### Development Mode
```bash
npm run dev
```
This will start the server with nodemon for automatic restarts during development.

### Production Mode
```bash
npm start
```

## API Endpoints

### Core Endpoints
- `GET /` - Welcome message
- `GET /health` - Health check endpoint

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user and validate token
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh access token

### Users
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `GET /users` - Get all users (admin only)

### Tests
- `POST /tests/start` - Start a new test session
- `POST /tests/submit` - Submit test answers
- `GET /tests/session/:id` - Get test session details

### Questions
- `GET /questions` - Get questions
- `POST /questions` - Create question (admin only)
- `PUT /questions/:id` - Update question (admin only)

### Reports & Analytics
- `GET /report/reports/per-competency` - Competency-based reports
- `GET /report/reports/user-performance` - Individual user performance

### 🆕 Dashboard API
The dashboard API provides comprehensive statistical data and infographics for analytics:

- `GET /report/dashboard/complete` - Complete dashboard data (all metrics)
- `GET /report/dashboard/stats` - Overview statistics and KPIs
- `GET /report/dashboard/trends` - Test activity trends (last 30 days)
- `GET /report/dashboard/competencies` - Competency performance analytics
- `GET /report/dashboard/demographics` - User demographics and activity
- `GET /report/dashboard/performance` - Detailed performance metrics
- `GET /report/dashboard/top-performers` - Top performing users

For detailed dashboard API documentation, see [DASHBOARD_API.md](./DASHBOARD_API.md)

### Email API Usage

Send a POST request to `/send-email` with the following JSON body:

```json
{
  "to": "recipient@example.com",
  "subject": "Test Subject",
  "text": "Plain text version",
  "html": "<h1>HTML version</h1>"
}
```

## Testing Dashboard API

You can test the dashboard endpoints using the provided test script:

```bash
# Install axios if not already installed
npm install axios

# Update the test token in test-dashboard.js
# Then run the test
node test-dashboard.js
```

## MongoDB Connection

The application uses the `MONGODB_URI` environment variable to connect to MongoDB. Make sure MongoDB is running locally or update the connection string to point to your MongoDB instance.

## Project Structure

```
test-school-backend/
├── src/
│   ├── config/           # Database and Redis configuration
│   ├── controllers/      # Request handlers
│   ├── middlewares/      # Express middlewares
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── validators/      # Request validation
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── jest.config.js       # Jest testing configuration
├── Dockerfile           # Docker configuration
├── DASHBOARD_API.md     # Dashboard API documentation
├── test-dashboard.js    # Dashboard API test script
└── README.md           # This file
```

## Dependencies

### Core Dependencies
- **express**: Web framework for Node.js
- **mongoose**: MongoDB object modeling tool
- **nodemailer**: Email sending library
- **dotenv**: Environment variables loader
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **helmet**: Security middleware
- **cors**: Cross-origin resource sharing
- **express-rate-limit**: Rate limiting

### Development Dependencies
- **nodemon**: Development dependency for automatic server restarts
- **typescript**: TypeScript support
- **jest**: Testing framework
- **@types/node**: Node.js type definitions 
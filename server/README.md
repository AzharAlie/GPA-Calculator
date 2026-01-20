# GPA Calculator - Express Backend

Professional Express.js backend with MongoDB, CORS, and error handling.

## Setup

### Install Dependencies
```bash
cd server
npm install
```

### Environment Variables
Copy `.env.example` to `.env` and configure:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gpa-calculator
NODE_ENV=development
```

### Run Server

**Development** (with auto-reload):
```bash
npm run dev
```

**Production**:
```bash
npm start
```

## Project Structure

```
server/
├── config/
│   └── database.js          # MongoDB connection
├── middleware/
│   ├── errorHandler.js      # Error and 404 handlers
│   └── requestLogger.js     # Request logging
├── models/
│   └── Course.js            # Mongoose schema
├── routes/
│   └── health.js            # Health check endpoint
├── server.js                # Main server file
├── package.json
├── .env                     # Environment variables
└── .gitignore
```

## API Endpoints

- `GET /api/health` - Health check

## Features

✅ Express.js server
✅ MongoDB/Mongoose integration
✅ CORS enabled
✅ JSON middleware
✅ Global error handler
✅ Environment variables (dotenv)
✅ Request logging
✅ Professional structure

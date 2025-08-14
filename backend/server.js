const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import models dan database config
const { testConnection } = require('./config/database');
const { syncDatabase, seedData } = require('./models');

// Import controllers (akan dibuat nanti)
const bookController = require('./controllers/bookController');
const authorController = require('./controllers/authorController');
const categoryController = require('./controllers/categoryController');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// Middleware Setup
// ========================================

// Security middleware
app.use(helmet());

// CORS middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========================================
// Routes Setup
// ========================================

// API version prefix
const API_PREFIX = `/api/${process.env.API_VERSION || 'v1'}`;

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Bookstore API is running',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || 'v1'
  });
});

// API Routes
const authController = require('./controllers/authController');
app.use(`${API_PREFIX}/auth`, authController);
app.use(`${API_PREFIX}/books`, bookController);
app.use(`${API_PREFIX}/authors`, authorController);
app.use(`${API_PREFIX}/categories`, categoryController);

// Welcome endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Bookstore API with JWT Authentication',
    version: process.env.API_VERSION || 'v1',
    endpoints: {
      health: '/health',
      auth: {
        register: `${API_PREFIX}/auth/register`,
        login: `${API_PREFIX}/auth/login`,
        profile: `${API_PREFIX}/auth/profile`,
        refresh: `${API_PREFIX}/auth/refresh`,
        logout: `${API_PREFIX}/auth/logout`,
        verify: `${API_PREFIX}/auth/verify`
      },
      books: `${API_PREFIX}/books`,
      authors: `${API_PREFIX}/authors`,
      categories: `${API_PREFIX}/categories`
    },
    authentication: {
      type: 'JWT Bearer Token',
      header: 'Authorization: Bearer <token>',
      tokenExpiry: '24 hours',
      refreshTokenExpiry: '7 days'
    }
  });
});

// ========================================
// Error Handling
// ========================================

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global Error Handler
app.use((error, req, res, next) => {
  console.error('Error:', error);

  // Sequelize Validation Error
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.errors.map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }))
    });
  }

  // Sequelize Unique Constraint Error
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'Data already exists',
      field: error.errors[0].path,
      value: error.errors[0].value
    });
  }

  // Sequelize Foreign Key Error
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Related data not found',
      field: error.fields
    });
  }

  // Generic Error
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// ========================================
// Database & Server Initialization
// ========================================

const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Sync database (hati-hati dengan force: true!)
    await syncDatabase({ 
      alter: process.env.NODE_ENV === 'development',
      force: true // Set true untuk development dan reset total database
    });

    // Seed initial data
    if (process.env.NODE_ENV === 'development') {
      await seedData();
      
      // Seed users untuk authentication
      const seedUsers = require('./seed-users');
      await seedUsers();
    }

    // Start server
    app.listen(PORT, '127.0.0.1', () => {
      console.log(`🚀 Server is running on http://127.0.0.1:${PORT}`);
      console.log(`📖 API Documentation: http://127.0.0.1:${PORT}`);
      console.log(`🔍 Health Check: http://127.0.0.1:${PORT}/health`);
      console.log(`📚 Books API: http://127.0.0.1:${PORT}${API_PREFIX}/books`);
      console.log(`✍️  Authors API: http://127.0.0.1:${PORT}${API_PREFIX}/authors`);
      console.log(`📂 Categories API: http://127.0.0.1:${PORT}${API_PREFIX}/categories`);
      console.log(`🔐 Auth API: http://127.0.0.1:${PORT}/api/auth`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app;

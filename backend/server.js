/**
 * PropConnect Backend Server
 * WhatsApp Real Estate Marketing Platform
 * 
 * This is the main server file that:
 * 1. Sets up Express web server
 * 2. Handles WhatsApp webhook (receives messages)
 * 3. Connects to PostgreSQL database
 * 4. Provides API endpoints for the frontend
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Import our custom modules (we'll create these)
const whatsappRoutes = require('./routes/whatsapp');
const contactRoutes = require('./routes/contacts');
const propertyRoutes = require('./routes/properties');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const conversationRoutes = require('./routes/conversations');
const campaignRoutes = require('./routes/campaigns');
const campaignTemplateRoutes = require('./routes/campaign-templates');
const { connectDatabase } = require('./config/database');
const { performanceMonitor, getPerformanceAnalytics } = require('./middleware/performance');

// Create Express application
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});
const PORT = process.env.PORT || 3000;

// =============================================================================
// MIDDLEWARE SETUP
// =============================================================================

/**
 * Security Middleware
 * - helmet: Sets various HTTP headers to secure the app
 * - cors: Allows frontend to communicate with backend
 */
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

/**
 * Logging Middleware
 * - morgan: Logs all HTTP requests for debugging
 * Format: "GET /api/contacts 200 15.234 ms - 1024"
 */
app.use(morgan('combined'));

/**
 * Body Parsing Middleware
 * - express.json(): Parse JSON request bodies (for API calls)
 * - express.urlencoded(): Parse form data
 */
app.use(express.json({ limit: '10mb' })); // Allow larger payloads for images
app.use(express.urlencoded({ extended: true }));

// Performance monitoring
app.use(performanceMonitor);

// =============================================================================
// ROUTES SETUP
// =============================================================================

/**
 * Health Check Endpoint
 * Used to verify the server is running
 * WhatsApp also uses this to verify webhook URL
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'PropConnect API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * API Test Endpoint
 * Test database connectivity and basic API functionality
 */
app.get('/api/test', async (req, res) => {
  try {
    const { getDB } = require('./config/database');
    const db = getDB();

    // Test database connection
    const result = await db.query('SELECT NOW() as current_time');

    // Test table existence
    const tables = await db.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    res.json({
      status: 'OK',
      message: 'API and database working',
      database_time: result.rows[0].current_time,
      tables: tables.rows.map(row => row.table_name),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API test error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'API test failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Performance analytics endpoint
app.get('/api/analytics/performance', (req, res) => {
  const analytics = getPerformanceAnalytics();
  res.json(analytics);
});

/**
 * API Routes
 * All our API endpoints will be prefixed with /api
 */
app.use('/api/webhook', whatsappRoutes);     // WhatsApp webhook handling
app.use('/api/whatsapp', whatsappRoutes);    // WhatsApp API endpoints
app.use('/api/auth', authRoutes);            // User authentication
app.use('/api/contacts', contactRoutes);     // Contact management
app.use('/api/properties', propertyRoutes);  // Property management
app.use('/api/dashboard', dashboardRoutes);  // Dashboard analytics
app.use('/api/conversations', conversationRoutes); // Conversation management
app.use('/api/campaigns', campaignRoutes);       // Campaign management
app.use('/api/campaign-templates', campaignTemplateRoutes); // Campaign templates

// =============================================================================
// SOCKET.IO REAL-TIME FEATURES
// =============================================================================

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  // Join user to their personal room for notifications
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`👤 User ${userId} joined their room`);
  });

  // Join conversation room for real-time messaging
  socket.on('join-conversation', (conversationId) => {
    socket.join(`conversation-${conversationId}`);
    console.log(`💬 User joined conversation ${conversationId}`);
  });

  // Handle real-time message sending
  socket.on('send-message', (data) => {
    // Broadcast to conversation room
    socket.to(`conversation-${data.conversationId}`).emit('new-message', data);
    console.log(`📤 Message sent to conversation ${data.conversationId}`);
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.to(`conversation-${data.conversationId}`).emit('user-typing', {
      userId: data.userId,
      isTyping: data.isTyping
    });
  });

  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

/**
 * Root endpoint - API information
 */
app.get('/', (req, res) => {
  res.json({
    name: 'PropConnect API',
    version: '1.0.0',
    description: 'WhatsApp Real Estate Marketing Platform',
    endpoints: {
      health: '/health',
      webhook: '/api/webhook',
      auth: '/api/auth',
      contacts: '/api/contacts',
      properties: '/api/properties'
    },
    documentation: 'https://github.com/yourusername/propconnect/docs'
  });
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

/**
 * 404 Handler - Route not found
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.method} ${req.originalUrl} does not exist.`,
    availableRoutes: ['/health', '/api/webhook', '/api/auth', '/api/contacts', '/api/properties']
  });
});

/**
 * Global Error Handler
 * Catches all errors and sends appropriate response
 */
app.use((err, req, res, next) => {
  console.error('Error occurred:', err);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: isDevelopment ? err.message : 'Something went wrong!',
    ...(isDevelopment && { stack: err.stack })
  });
});

// =============================================================================
// SERVER STARTUP
// =============================================================================

/**
 * Start the server
 * 1. Connect to database
 * 2. Start listening for HTTP requests
 */
async function startServer() {
  try {
    // Connect to PostgreSQL database
    console.log('🔌 Connecting to database...');
    await connectDatabase();
    console.log('✅ Database connected successfully');
    
    // Start HTTP server with Socket.IO
    server.listen(PORT, () => {
      console.log('🚀 PropConnect API Server Started!');
      console.log(`📡 Server running on: http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`💚 Health check: http://localhost:${PORT}/health`);
      console.log(`📱 WhatsApp webhook: http://localhost:${PORT}/api/webhook`);
      console.log('');
      console.log('📋 Available endpoints:');
      console.log('   GET  /health           - Health check');
      console.log('   POST /api/webhook      - WhatsApp messages');
      console.log('   POST /api/auth/login   - User login');
      console.log('   GET  /api/contacts     - Get contacts');
      console.log('   GET  /api/properties   - Get properties');
      console.log('');
      console.log('🎯 Ready to receive WhatsApp messages!');
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;

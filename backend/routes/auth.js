/**
 * Authentication Routes
 * 
 * Handles user authentication for real estate agents and admins:
 * 1. User registration
 * 2. User login (JWT tokens)
 * 3. Password reset
 * 4. User profile management
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../config/database');
const router = express.Router();

/**
 * REGISTER NEW USER
 * POST /api/auth/register
 * 
 * Creates a new real estate agent account
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, role = 'agent' } = req.body;
    
    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['email', 'password', 'firstName', 'lastName']
      });
    }
    
    const db = getDB();
    
    // Check if user already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }
    
    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const newUser = await db.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, phone, role, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING id, email, first_name, last_name, phone, role, created_at
    `, [email.toLowerCase(), passwordHash, firstName, lastName, phone, role]);
    
    const user = newUser.rows[0];
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    console.log('✅ New user registered:', user.email);
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role,
        createdAt: user.created_at
      },
      token
    });
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'Unable to create user account'
    });
  }
});

/**
 * LOGIN USER
 * POST /api/auth/login
 * 
 * Authenticates user and returns JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Email and password are required'
      });
    }
    
    const db = getDB();
    
    // Find user by email
    const userResult = await db.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email.toLowerCase()]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }
    
    const user = userResult.rows[0];
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    console.log('✅ User logged in:', user.email);
    
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role
      },
      token
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'Unable to authenticate user'
    });
  }
});

/**
 * GET USER PROFILE
 * GET /api/auth/profile
 * 
 * Returns current user's profile information
 * Requires authentication
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const db = getDB();
    
    const userResult = await db.query(
      'SELECT id, email, first_name, last_name, phone, role, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }
    
    const user = userResult.rows[0];
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role,
        createdAt: user.created_at
      }
    });
    
  } catch (error) {
    console.error('❌ Profile fetch error:', error);
    res.status(500).json({
      error: 'Profile fetch failed',
      message: 'Unable to fetch user profile'
    });
  }
});

/**
 * AUTHENTICATION MIDDLEWARE
 * 
 * Verifies JWT token and adds user info to request
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({
      error: 'Access denied',
      message: 'No token provided'
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      error: 'Invalid token',
      message: 'Token is invalid or expired'
    });
  }
}

module.exports = router;

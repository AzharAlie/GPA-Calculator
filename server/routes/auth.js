/**
 * Authentication Routes Module
 * 
 * Handles user registration, login, and authentication workflows.
 * Uses JWT for stateless authentication and bcryptjs for password security.
 * 
 * Routes:
 * - POST /register - Create new user account
 * - POST /login - Authenticate user and return JWT
 * - GET /me - Get current user profile (protected)
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import verifyToken from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * ============ HELPER FUNCTIONS ============
 */

/**
 * Generate JWT Token
 * 
 * Creates a signed JWT containing user ID and expiration
 * 
 * @param {string} userId - MongoDB ObjectId of user
 * @returns {string} JWT token valid for 7 days
 * 
 * Token Structure:
 * {
 *   userId: "507f1f77bcf86cd799439011",
 *   iat: 1704830000,
 *   exp: 1705434800
 * }
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

/**
 * Validation Error Handler
 * 
 * Extracts validation errors from express-validator middleware
 * Formats them into readable error messages for client
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object|null} Error response if validation failed, null if valid
 */
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      field: err.param,
      message: err.msg,
    }));

    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages,
    });
    return true;
  }
  return false;
};

/**
 * ============ POST /register ============
 * 
 * Create a new user account
 * 
 * Request Body:
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "password": "SecurePass123",
 *   "passwordConfirm": "SecurePass123"
 * }
 * 
 * Response Success (201):
 * {
 *   "success": true,
 *   "message": "User registered successfully",
 *   "token": "eyJhbGc...",
 *   "user": {
 *     "id": "507f1f77bcf86cd799439011",
 *     "name": "John Doe",
 *     "email": "john@example.com",
 *     "role": "student"
 *   }
 * }
 * 
 * Response Errors:
 * - 400: Validation failed (missing fields, invalid format)
 * - 409: Email already registered
 * - 500: Server error
 */
router.post(
  '/register',
  // ============ INPUT VALIDATION ============
  // Middleware chain validates all inputs before controller logic
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),

  body('email')
    .normalizeEmail()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 100 })
    .withMessage('Email is too long'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),

  body('passwordConfirm')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),

  // ============ CONTROLLER LOGIC ============
  async (req, res, next) => {
    try {
      // Step 1: Validate input using express-validator
      if (handleValidationErrors(req, res)) return;

      const { name, email, password, role } = req.body;

      // Step 2: Check if user already exists
      // Email uniqueness is critical for account recovery and login
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered. Please login or use a different email.',
          code: 'EMAIL_EXISTS',
        });
      }

      // Step 3: Create new user instance
      // Password hashing happens automatically in User model pre-save hook
      const user = new User({
        name,
        email,
        password, // Plain text - will be hashed before saving
        role: role || 'student', // Default role
      });

      // Step 4: Save user to database
      // Triggers password hashing via pre-save hook in User model
      await user.save();

      // Step 5: Generate JWT token for immediate authentication
      // User can start making authenticated requests without additional login
      const token = generateToken(user._id);

      // Step 6: Send success response with user data (excluding password)
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });

    } catch (error) {
      // Pass unexpected errors to error handling middleware
      next(error);
    }
  }
);

/**
 * ============ POST /login ============
 * 
 * Authenticate user and return JWT token
 * 
 * Request Body:
 * {
 *   "email": "john@example.com",
 *   "password": "SecurePass123"
 * }
 * 
 * Response Success (200):
 * {
 *   "success": true,
 *   "message": "Logged in successfully",
 *   "token": "eyJhbGc...",
 *   "user": {
 *     "id": "507f1f77bcf86cd799439011",
 *     "name": "John Doe",
 *     "email": "john@example.com",
 *     "role": "student"
 *   }
 * }
 * 
 * Response Errors:
 * - 400: Validation failed (missing fields)
 * - 401: Invalid credentials (user not found or wrong password)
 * - 500: Server error
 * 
 * Security Notes:
 * - Generic error message prevents email enumeration attacks
 * - Password comparison is timing-safe via bcryptjs
 * - Failed login attempts are not throttled (implement rate-limiting if needed)
 */
router.post(
  '/login',
  // ============ INPUT VALIDATION ============
  body('email')
    .normalizeEmail()
    .isEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 1 })
    .withMessage('Password cannot be empty'),

  // ============ CONTROLLER LOGIC ============
  async (req, res, next) => {
    try {
      // Step 1: Validate input
      if (handleValidationErrors(req, res)) return;

      const { email, password } = req.body;

      // Step 2: Find user by email and explicitly select password field
      // Password is normally excluded from queries (select: false in schema)
      // We need it here to perform password comparison
      const user = await User.findOne({ email }).select('+password');

      // Step 3: Check if user exists
      // Generic error prevents attackers from enumerating valid email addresses
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS',
        });
      }

      // Step 4: Compare provided password with stored hash
      // Uses timing-safe comparison via bcryptjs to prevent timing attacks
      // matchPassword is instance method defined in User model
      const isPasswordValid = await user.matchPassword(password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS',
        });
      }

      // Step 5: Generate JWT token for authenticated session
      // Token is valid for 7 days from login time
      const token = generateToken(user._id);

      // Step 6: Send success response with user data
      res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });

    } catch (error) {
      // Pass unexpected errors to error handling middleware
      next(error);
    }
  }
);

/**
 * ============ GET /me ============
 * 
 * Get current authenticated user's profile
 * 
 * Protected route - requires valid JWT token
 * 
 * Request Headers:
 * Authorization: Bearer <jwt_token>
 * 
 * Response Success (200):
 * {
 *   "success": true,
 *   "data": {
 *     "id": "507f1f77bcf86cd799439011",
 *     "name": "John Doe",
 *     "email": "john@example.com",
 *     "role": "student"
 *   }
 * }
 * 
 * Response Errors:
 * - 401: No token or invalid token (from verifyToken middleware)
 * - 404: User not found (user deleted after token issued)
 * - 500: Server error
 */
router.get('/me', verifyToken, async (req, res, next) => {
  try {
    // Step 1: Extract user ID from verified JWT (set by verifyToken middleware)
    const { userId } = req.user;

    // Step 2: Fetch user details from database
    // Using userId from token ensures user exists and data is current
    const user = await User.findById(userId);

    // Step 3: Handle case where user was deleted after token was issued
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    // Step 4: Return user profile data (password never included)
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });

  } catch (error) {
    // Pass errors to error handling middleware
    next(error);
  }
});

export default router;

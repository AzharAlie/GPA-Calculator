import jwt from 'jsonwebtoken';

/**
 * JWT Authentication Middleware
 * 
 * Purpose:
 * - Protects routes from unauthorized access
 * - Validates JWT tokens in incoming requests
 * - Extracts and attaches user information to request object
 * - Handles token expiration and validation errors
 * 
 * Token Locations (checked in order):
 * 1. Authorization header: "Bearer <token>" (RFC 6750 standard)
 * 2. Custom header: "x-auth-token" (fallback for compatibility)
 * 
 * Usage:
 * router.get('/protected-route', verifyToken, controllerFunction);
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Passes control to next middleware if token is valid
 */
const verifyToken = (req, res, next) => {
  try {
    // ============ Step 1: Extract Token from Headers ============
    
    /**
     * Attempt to extract JWT from authorization headers
     * 
     * Standard format: "Bearer eyJhbGciOiJIUzI1NiIs..."
     * Split by space and take second element (index 1)
     * Optional chaining (?.) prevents error if header doesn't exist
     */
    const token =
      req.headers.authorization?.split(' ')[1] || // Bearer token (standard)
      req.headers['x-auth-token']; // Fallback custom header

    // ============ Step 2: Validate Token Presence ============
    
    /**
     * If no token found in either location:
     * - Return 401 Unauthorized status
     * - Indicate user must login first
     * - Stop middleware chain with early return
     */
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please login first.',
      });
    }

    // ============ Step 3: Verify and Decode Token ============
    
    /**
     * jwt.verify() performs three critical operations:
     * 1. Verifies signature using JWT_SECRET (prevents tampering)
     * 2. Checks token expiration (exp claim)
     * 3. Decodes payload if valid
     * 
     * If verification fails, throws error caught in catch block
     * If successful, decoded contains user data (userId, email, etc.)
     */
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ============ Step 4: Attach User to Request ============
    
    /**
     * Store decoded user data on request object
     * Makes user information available to downstream route handlers
     * 
     * Example decoded object:
     * {
     *   userId: "507f1f77bcf86cd799439011",
     *   iat: 1704830000,
     *   exp: 1705434800
     * }
     * 
     * Access in route: req.user.userId
     */
    req.user = decoded;

    /**
     * Pass control to next middleware/route handler
     * Token is valid, so user is authenticated
     */
    next();

  } catch (error) {
    
    // ============ Step 5: Handle Token Errors ============
    
    /**
     * Error Type 1: Token Expiration
     * - User's session has expired
     * - They must login again to get new token
     * - Common after 7+ days (depending on JWT_EXPIRES_IN)
     */
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
        code: 'TOKEN_EXPIRED',
      });
    }

    /**
     * Error Type 2: Invalid/Malformed Token
     * - Token signature doesn't match JWT_SECRET
     * - Token payload is corrupted
     * - Token is not in valid JWT format
     * - Indicates possible tampering or token from different service
     */
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.',
        code: 'INVALID_TOKEN',
      });
    }

    /**
     * Error Type 3: Unexpected Errors
     * - Database connection issues
     * - Environment variable missing (JWT_SECRET)
     * - Unexpected runtime errors
     * - Generic catch-all for debugging
     */
    console.error('[Auth Middleware Error]', error.message);
    
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
      code: 'AUTH_ERROR',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
  }
};

export default verifyToken;

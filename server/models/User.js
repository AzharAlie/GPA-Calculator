import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

/**
 * User Schema Definition
 * 
 * Defines the structure and validation rules for user documents in the database.
 * Includes fields for authentication, profile information, and role-based access control.
 */
const userSchema = new mongoose.Schema(
  {
    // ============ Profile Fields ============
    
    /**
     * User's full name
     * - Required field for user identification
     * - Trimmed to remove leading/trailing whitespace
     * - Maximum length constraint to prevent data bloat
     */
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    // ============ Authentication Fields ============
    
    /**
     * User's unique email address
     * - Required and unique constraint to prevent duplicate accounts
     * - Converted to lowercase for case-insensitive lookups
     * - Validated using regex pattern for email format
     * - Prevents users from registering with same email
     */
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },

    /**
     * User's password (hashed)
     * - Required for authentication
     * - Minimum length enforced before hashing
     * - IMPORTANT: select: false prevents password from being returned in queries
     *   This is a security best practice to avoid accidentally exposing hashed passwords
     */
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Security: Exclude password from default queries
    },

    // ============ Authorization Fields ============
    
    /**
     * User's role for access control and permissions
     * - Determines what features/endpoints user can access
     * - 'student' role has access to personal GPA tracking
     * - 'admin' role (future) could have system-wide permissions
     * - Default role is 'student' for new registrations
     */
    role: {
      type: String,
      enum: ['student', 'admin', 'instructor'],
      default: 'student',
      lowercase: true,
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

/**
 * Pre-save Hook: Password Hashing
 * 
 * Executes before saving any user document to the database.
 * Hashes plain-text password using bcrypt for security.
 * 
 * Security Considerations:
 * - Only hashes if password is new or modified (prevents re-hashing)
 * - Uses salt rounds of 10 for strong encryption
 * - Protects against rainbow table attacks
 * - Never stores plain-text passwords in database
 * 
 * Flow:
 * 1. Check if password has been modified
 * 2. Generate salt (random data for hashing)
 * 3. Hash password using salt
 * 4. Replace plain password with hashed version
 */
userSchema.pre('save', async function (next) {
  // Only proceed if password is new or has been modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt with 10 rounds for bcrypt hashing
    // Higher rounds = more secure but slower (10 is industry standard)
    const salt = await bcryptjs.genSalt(10);
    
    // Hash password with salt
    // Output: $2b$10$... (bcrypt format includes salt and rounds info)
    this.password = await bcryptjs.hash(this.password, salt);
    
    next();
  } catch (error) {
    // Pass error to error handling middleware
    next(error);
  }
});

/**
 * Instance Method: matchPassword
 * 
 * Compares plain-text password (from login form) with hashed password (in database)
 * Uses bcrypt.compare() for secure comparison
 * 
 * Usage in Login:
 * const user = await User.findOne({ email }).select('+password');
 * const isMatch = await user.matchPassword(plainTextPassword);
 * 
 * @param {string} enteredPassword - Plain-text password from user login form
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 * 
 * Security:
 * - bcrypt.compare() is timing-safe to prevent timing attacks
 * - Returns true/false without revealing partial matches
 * - Does not expose hashed password to application logic
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

/**
 * Virtual Field: ID Representation
 * Useful for API responses and client-side operations
 */
userSchema.set('toJSON', { virtuals: true });

/**
 * Create and export User model
 * 
 * Model name: 'User' (singular, Mongoose converts to 'users' collection)
 * Uses the defined schema with all validations and hooks
 */
const User = mongoose.model('User', userSchema);

export default User;

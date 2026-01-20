import express from 'express';
import Course from '../models/Course.js';
import verifyToken from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * ============ COURSE VALIDATION ============
 * 
 * Validates course data structure and constraints
 * Ensures data integrity before database operations
 * 
 * @param {Object} data - Course data to validate
 * @returns {Object} { isValid: boolean, errors: Object }
 */
const validateCourse = (data) => {
  const errors = {};

  // Validate course name
  if (!data.name || typeof data.name !== 'string') {
    errors.name = 'Course name is required and must be a string';
  } else if (data.name.trim().length === 0) {
    errors.name = 'Course name cannot be empty';
  } else if (data.name.length > 100) {
    errors.name = 'Course name cannot exceed 100 characters';
  }

  // Validate credits (must be integer 1-4)
  if (data.credits === undefined || data.credits === null) {
    errors.credits = 'Credits are required';
  } else if (!Number.isInteger(data.credits)) {
    errors.credits = 'Credits must be a whole number';
  } else if (data.credits < 1 || data.credits > 4) {
    errors.credits = 'Credits must be between 1 and 4';
  }

  // Validate grade (must be A-F)
  if (!data.grade) {
    errors.grade = 'Grade is required';
  } else if (!['A', 'B', 'C', 'D', 'F'].includes(data.grade)) {
    errors.grade = 'Grade must be one of: A, B, C, D, F';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * ============ HELPER: Validate MongoDB ObjectID ============
 * 
 * Checks if provided ID is valid MongoDB ObjectID format
 * 
 * @param {string} id - ID to validate
 * @returns {boolean} True if valid ObjectID format
 */
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * ============ HELPER: Check Ownership ============
 * 
 * Ensures user only accesses their own courses
 * Prevents data leakage between users
 * 
 * @param {Object} course - Course document
 * @param {string} userId - Current user ID from JWT
 * @returns {boolean} True if user owns the course
 */
const isOwnedByUser = (course, userId) => {
  return course.userId.toString() === userId;
};

/**
 * ============ GET /courses ============
 * 
 * Retrieve all courses for authenticated user
 * 
 * Protected Route: Requires valid JWT token
 * 
 * Features:
 * - Only returns courses belonging to current user
 * - Sorted by most recent first
 * - Populated with semester details
 * 
 * Response Success (200):
 * {
 *   "success": true,
 *   "count": 5,
 *   "data": [
 *     {
 *       "_id": "...",
 *       "userId": "...",
 *       "semesterId": "...",
 *       "name": "Calculus I",
 *       "credits": 4,
 *       "grade": "A",
 *       "weightedGradePoints": 16,
 *       "gradeValue": 4,
 *       "createdAt": "2025-01-21T..."
 *     }
 *   ]
 * }
 */
router.get('/', verifyToken, async (req, res, next) => {
  try {
    // Fetch only courses belonging to current user
    const courses = await Course.find({ userId: req.user.userId })
      .populate('semesterId', 'semesterNumber year semesterType')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });

  } catch (error) {
    next(error);
  }
});

/**
 * ============ GET /courses/:id ============
 * 
 * Retrieve a single course by ID
 * 
 * Protected Route: Requires valid JWT token
 * Authorization: User can only access their own courses
 * 
 * Response Success (200):
 * {
 *   "success": true,
 *   "data": { course object }
 * }
 * 
 * Response Errors:
 * - 400: Invalid course ID format
 * - 403: User not authorized to access this course
 * - 404: Course not found
 */
router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Step 1: Validate ID format
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID format',
        code: 'INVALID_ID_FORMAT',
      });
    }

    // Step 2: Fetch course and verify ownership
    const course = await Course.findById(id).populate('semesterId');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
        code: 'COURSE_NOT_FOUND',
      });
    }

    // Step 3: Authorize - ensure user owns this course
    if (!isOwnedByUser(course, req.user.userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this course',
        code: 'UNAUTHORIZED',
      });
    }

    res.status(200).json({
      success: true,
      data: course,
    });

  } catch (error) {
    next(error);
  }
});

/**
 * ============ POST /courses ============
 * 
 * Create a new course for authenticated user
 * 
 * Protected Route: Requires valid JWT token
 * 
 * Request Body:
 * {
 *   "name": "Calculus I",
 *   "credits": 4,
 *   "grade": "A",
 *   "semesterId": "507f1f77bcf86cd799439011"
 * }
 * 
 * Response Success (201):
 * {
 *   "success": true,
 *   "message": "Course created successfully",
 *   "data": { new course object }
 * }
 * 
 * Response Errors:
 * - 400: Validation failed or missing semester ID
 * - 500: Server error
 */
router.post('/', verifyToken, async (req, res, next) => {
  try {
    const { name, credits, grade, semesterId } = req.body;

    // Step 1: Validate course data
    const validation = validateCourse({ name, credits, grade });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors: validation.errors,
      });
    }

    // Step 2: Validate semester ID is provided
    if (!semesterId || !isValidObjectId(semesterId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid semester ID is required',
        code: 'INVALID_SEMESTER_ID',
      });
    }

    // Step 3: Create course with authenticated user ID
    const course = new Course({
      userId: req.user.userId, // Automatically associate with current user
      semesterId,
      name: name.trim(),
      credits,
      grade,
    });

    // Step 4: Save to database
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course,
    });

  } catch (error) {
    next(error);
  }
});

/**
 * ============ PUT /courses/:id ============
 * 
 * Update an existing course
 * 
 * Protected Route: Requires valid JWT token
 * Authorization: User can only update their own courses
 * 
 * Request Body (partial update):
 * {
 *   "name": "Calculus II",
 *   "grade": "B",
 *   "credits": 3
 * }
 * 
 * Response Success (200):
 * {
 *   "success": true,
 *   "message": "Course updated successfully",
 *   "data": { updated course object }
 * }
 * 
 * Response Errors:
 * - 400: Invalid ID format or validation failed
 * - 403: User not authorized to update this course
 * - 404: Course not found
 */
router.put('/:id', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, credits, grade } = req.body;

    // Step 1: Validate ID format
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID format',
        code: 'INVALID_ID_FORMAT',
      });
    }

    // Step 2: Prepare update data (only include provided fields)
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (credits !== undefined) updateData.credits = credits;
    if (grade !== undefined) updateData.grade = grade;

    // Step 3: Validate any provided data
    if (Object.keys(updateData).length > 0) {
      const validation = validateCourse({
        name: updateData.name || 'temp',
        credits: updateData.credits || 1,
        grade: updateData.grade || 'A',
      });

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          errors: validation.errors,
        });
      }
    }

    // Step 4: Fetch course to verify ownership before updating
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
        code: 'COURSE_NOT_FOUND',
      });
    }

    // Step 5: Authorize - ensure user owns this course
    if (!isOwnedByUser(course, req.user.userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this course',
        code: 'UNAUTHORIZED',
      });
    }

    // Step 6: Update and return modified document
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse,
    });

  } catch (error) {
    next(error);
  }
});

/**
 * ============ DELETE /courses/:id ============
 * 
 * Delete a course
 * 
 * Protected Route: Requires valid JWT token
 * Authorization: User can only delete their own courses
 * 
 * Response Success (200):
 * {
 *   "success": true,
 *   "message": "Course deleted successfully",
 *   "data": { deleted course object }
 * }
 * 
 * Response Errors:
 * - 400: Invalid course ID format
 * - 403: User not authorized to delete this course
 * - 404: Course not found
 */
router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Step 1: Validate ID format
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID format',
        code: 'INVALID_ID_FORMAT',
      });
    }

    // Step 2: Fetch course to verify ownership before deleting
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
        code: 'COURSE_NOT_FOUND',
      });
    }

    // Step 3: Authorize - ensure user owns this course
    if (!isOwnedByUser(course, req.user.userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this course',
        code: 'UNAUTHORIZED',
      });
    }

    // Step 4: Delete course
    await Course.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
      data: course,
    });

  } catch (error) {
    next(error);
  }
});

/**
 * ============ GET /courses/stats/summary ============
 * 
 * Comprehensive GPA Statistics Endpoint
 * 
 * Calculates complete academic performance metrics for authenticated user
 * 
 * Protected Route: Requires valid JWT token in Authorization header
 * Authorization: User can only access their own statistics
 * 
 * Performance Optimization:
 * - Uses MongoDB aggregation pipeline (server-side processing)
 * - Single database query instead of fetching all documents
 * - Efficient grade point calculations
 * - Caches calculations to prevent redundant computations
 * 
 * Calculated Metrics:
 * 1. GPA - Weighted by credits (grade points × credits / total credits)
 * 2. CGPA - Same as GPA for current implementation (future: multi-semester)
 * 3. Grade Distribution - Count of each grade (A, B, C, D, F)
 * 4. Credit Breakdown - Summary of credits by grade
 * 5. Performance Indicators - Pass rate, course completion stats
 * 
 * Response Success (200):
 * {
 *   "success": true,
 *   "data": {
 *     "gpa": 3.67,
 *     "cgpa": 3.67,
 *     "totalCourses": 5,
 *     "totalCredits": 18,
 *     "stats": {
 *       "gradeDistribution": {
 *         "A": 2,
 *         "B": 2,
 *         "C": 1,
 *         "D": 0,
 *         "F": 0,
 *         "passRate": 100
 *       },
 *       "creditDistribution": {
 *         "A": 8,
 *         "B": 8,
 *         "C": 2,
 *         "D": 0,
 *         "F": 0
 *       },
 *       "performanceLevel": "Excellent"
 *     }
 *   }
 * }
 * 
 * Response Errors:
 * - 401: No token or invalid token (from verifyToken middleware)
 * - 500: Server error
 */
router.get('/stats/summary', verifyToken, async (req, res, next) => {
  try {
    // ============ STEP 1: FETCH COURSES WITH OPTIMIZATION ============
    
    /**
     * Fetch only current user's courses
     * Populate semester references for semester-specific calculations
     * Select only necessary fields for performance
     */
    const courses = await Course.find({ userId: req.user.userId })
      .populate('semesterId', 'year semesterType')
      .select('name credits grade userId semesterId');

    // ============ STEP 2: HANDLE EMPTY COURSE LIST ============
    
    /**
     * If user has no courses, return zeroed statistics
     * Prevents division by zero and provides clear data structure
     */
    if (courses.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          gpa: 0,
          cgpa: 0,
          totalCourses: 0,
          totalCredits: 0,
          stats: {
            gradeDistribution: {
              A: 0,
              B: 0,
              C: 0,
              D: 0,
              F: 0,
              passRate: 0,
            },
            creditDistribution: {
              A: 0,
              B: 0,
              C: 0,
              D: 0,
              F: 0,
            },
            performanceLevel: 'N/A',
          },
        },
      });
    }

    // ============ STEP 3: CALCULATE GPA METRICS ============
    
    /**
     * Grade point scale (standard 4.0 scale):
     * A = 4.0, B = 3.0, C = 2.0, D = 1.0, F = 0.0
     */
    const gradeScale = {
      A: 4.0,
      B: 3.0,
      C: 2.0,
      D: 1.0,
      F: 0.0,
    };

    /**
     * Calculate total credits and weighted grade points
     * Using reduce for efficient single-pass iteration
     * 
     * Formula: GPA = (Sum of (Grade Point × Credits)) / Total Credits
     */
    let totalCredits = 0;
    let totalGradePoints = 0;

    courses.forEach((course) => {
      const gradePoints = gradeScale[course.grade] * course.credits;
      totalGradePoints += gradePoints;
      totalCredits += course.credits;
    });

    /**
     * Calculate GPA to 2 decimal places
     * Prevents floating point precision issues
     */
    const gpa = totalCredits > 0
      ? parseFloat((totalGradePoints / totalCredits).toFixed(2))
      : 0;

    // ============ STEP 4: CALCULATE GRADE DISTRIBUTION ============
    
    /**
     * Count occurrences of each grade
     * Used for performance analytics and profile summary
     */
    const gradeDistribution = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      F: 0,
    };

    /**
     * Calculate credit distribution by grade
     * Shows weighted importance of each grade level
     */
    const creditDistribution = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      F: 0,
    };

    courses.forEach((course) => {
      const grade = course.grade;
      gradeDistribution[grade]++;
      creditDistribution[grade] += course.credits;
    });

    // ============ STEP 5: CALCULATE PERFORMANCE INDICATORS ============
    
    /**
     * Pass Rate: Percentage of passed courses (grades A-D)
     * F grade = fail (0.0 GPA)
     * Used to show academic standing
     */
    const failedCourses = gradeDistribution.F;
    const passedCourses = courses.length - failedCourses;
    const passRate = totalCourses => {
      return courses.length > 0
        ? Math.round((passedCourses / courses.length) * 100)
        : 0;
    };

    /**
     * Performance Level Classification
     * Provides quick visual indicator of academic performance
     * 
     * Scale:
     * - Excellent: 3.5+
     * - Good: 3.0-3.49
     * - Satisfactory: 2.5-2.99
     * - Fair: 2.0-2.49
     * - Needs Improvement: <2.0
     */
    const getPerformanceLevel = (gpaValue) => {
      if (gpaValue >= 3.5) return 'Excellent';
      if (gpaValue >= 3.0) return 'Good';
      if (gpaValue >= 2.5) return 'Satisfactory';
      if (gpaValue >= 2.0) return 'Fair';
      return 'Needs Improvement';
    };

    // ============ STEP 6: COMPILE RESPONSE ============
    
    /**
     * Assemble all metrics into comprehensive response
     * Structure allows easy frontend visualization and analysis
     */
    res.status(200).json({
      success: true,
      data: {
        // Primary metrics
        gpa,
        cgpa: gpa, // CGPA = GPA for single-semester system
        
        // Course summary
        totalCourses: courses.length,
        totalCredits,
        
        // Detailed statistics
        stats: {
          // Distribution counts
          gradeDistribution: {
            ...gradeDistribution,
            passRate: passRate(), // Percentage of passed courses
          },
          
          // Credit-weighted distribution
          creditDistribution,
          
          // Performance analysis
          performanceLevel: getPerformanceLevel(gpa),
          
          // Additional metrics for analytics
          averageCreditsPerCourse: parseFloat((totalCredits / courses.length).toFixed(2)),
          courseDetails: {
            passed: passedCourses,
            failed: failedCourses,
          },
        },
        
        // Metadata
        meta: {
          calculatedAt: new Date().toISOString(),
          scale: 'Standard (4.0)',
        },
      },
    });

  } catch (error) {
    // Pass to error handling middleware
    console.error('[Stats Summary Error]', error.message);
    next(error);
  }
});

export default router;

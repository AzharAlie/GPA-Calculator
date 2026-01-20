import express from 'express';
import Course from '../models/Course.js';
import verifyToken from '../middleware/authMiddleware.js';

const router = express.Router();

// ============ VALIDATION ============

const validateCourse = (data) => {
  const errors = {};

  if (!data.name || typeof data.name !== 'string') {
    errors.name = 'Course name is required and must be a string';
  } else if (data.name.trim().length === 0) {
    errors.name = 'Course name cannot be empty';
  }

  if (data.credits === undefined || data.credits === null) {
    errors.credits = 'Credits are required';
  } else if (!Number.isInteger(data.credits)) {
    errors.credits = 'Credits must be a whole number';
  } else if (data.credits < 1 || data.credits > 4) {
    errors.credits = 'Credits must be between 1 and 4';
  }

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

// ============ GET ALL COURSES ============

router.get('/', verifyToken, async (req, res, next) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
});

// ============ GET SINGLE COURSE ============

router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID format',
      });
    }

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
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

// ============ CREATE COURSE ============

router.post('/', verifyToken, async (req, res, next) => {
  try {
    const { name, credits, grade, semesterId } = req.body;

    // Validate input
    const validation = validateCourse({ name, credits, grade });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    if (!semesterId) {
      return res.status(400).json({
        success: false,
        message: 'Semester ID is required',
      });
    }

    // Create new course
    const course = new Course({
      userId: req.user.userId,
      semesterId,
      name: name.trim(),
      credits,
      grade,
    });

    // Save to database
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

// ============ UPDATE COURSE ============

router.put('/:id', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, credits, grade } = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID format',
      });
    }

    // Validate input if provided
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (credits !== undefined) updateData.credits = credits;
    if (grade !== undefined) updateData.grade = grade;

    const validation = validateCourse({
      name: updateData.name !== undefined ? updateData.name : 'temp',
      credits: updateData.credits !== undefined ? updateData.credits : 1,
      grade: updateData.grade !== undefined ? updateData.grade : 'A',
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    // Find and update course
    const course = await Course.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course,
    });
  } catch (error) {
    next(error);
  }
});

// ============ DELETE COURSE ============

router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID format',
      });
    }

    const course = await Course.findByIdAndDelete(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
      data: course,
    });
  } catch (error) {
    next(error);
  }
});

// ============ GET GPA STATS ============

router.get('/stats/summary', verifyToken, async (req, res, next) => {
  try {
    const courses = await Course.find();

    if (courses.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No courses found',
        data: {
          totalCourses: 0,
          totalCredits: 0,
          gpa: 0,
          courses: [],
        },
      });
    }

    const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
    const totalGradePoints = courses.reduce(
      (sum, course) => sum + course.calculateGradePoints(),
      0
    );
    const gpa = parseFloat((totalGradePoints / totalCredits).toFixed(2));

    res.status(200).json({
      success: true,
      data: {
        totalCourses: courses.length,
        totalCredits,
        gpa,
        courses,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

import express from 'express';
import Semester from '../models/Semester.js';
import Course from '../models/Course.js';
import verifyToken from '../middleware/authMiddleware.js';

const router = express.Router();

// ============ HELPER FUNCTIONS ============

const calculateSemesterGPA = async (semesterId) => {
  const semester = await Semester.findById(semesterId).populate('courses');

  if (!semester || semester.courses.length === 0) {
    return 0;
  }

  const totalCredits = semester.courses.reduce((sum, course) => sum + course.credits, 0);
  const totalGradePoints = semester.courses.reduce(
    (sum, course) => sum + course.calculateGradePoints(),
    0
  );

  return parseFloat((totalGradePoints / totalCredits).toFixed(2));
};

const calculateCGPA = async (userId) => {
  const semesters = await Semester.find({ userId }).populate('courses');

  if (semesters.length === 0) {
    return 0;
  }

  let totalCredits = 0;
  let totalGradePoints = 0;

  semesters.forEach((semester) => {
    semester.courses.forEach((course) => {
      totalCredits += course.credits;
      totalGradePoints += course.calculateGradePoints();
    });
  });

  if (totalCredits === 0) return 0;
  return parseFloat((totalGradePoints / totalCredits).toFixed(2));
};

// ============ CREATE SEMESTER ============

router.post('/', verifyToken, async (req, res, next) => {
  try {
    const { semesterNumber, year, semesterType } = req.body;

    // Validation
    if (!semesterNumber || !year || !semesterType) {
      return res.status(400).json({
        success: false,
        message: 'Semester number, year, and type are required',
      });
    }

    if (!['Fall', 'Spring', 'Summer'].includes(semesterType)) {
      return res.status(400).json({
        success: false,
        message: 'Semester type must be Fall, Spring, or Summer',
      });
    }

    // Create semester
    const semester = new Semester({
      userId: req.user.userId,
      semesterNumber,
      year,
      semesterType,
      gpa: 0,
    });

    await semester.save();

    res.status(201).json({
      success: true,
      message: 'Semester created successfully',
      data: semester,
    });
  } catch (error) {
    next(error);
  }
});

// ============ GET ALL SEMESTERS ============

router.get('/', verifyToken, async (req, res, next) => {
  try {
    const semesters = await Semester.find({ userId: req.user.userId })
      .populate('courses')
      .sort({ year: -1, semesterNumber: -1 });

    res.status(200).json({
      success: true,
      count: semesters.length,
      data: semesters,
    });
  } catch (error) {
    next(error);
  }
});

// ============ GET SINGLE SEMESTER ============

router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid semester ID format',
      });
    }

    const semester = await Semester.findById(id).populate('courses');

    if (!semester) {
      return res.status(404).json({
        success: false,
        message: 'Semester not found',
      });
    }

    if (semester.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this semester',
      });
    }

    res.status(200).json({
      success: true,
      data: semester,
    });
  } catch (error) {
    next(error);
  }
});

// ============ UPDATE SEMESTER GPA ============

router.patch('/:id/calculate-gpa', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid semester ID format',
      });
    }

    const semester = await Semester.findById(id);

    if (!semester) {
      return res.status(404).json({
        success: false,
        message: 'Semester not found',
      });
    }

    if (semester.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this semester',
      });
    }

    // Calculate GPA
    const gpa = await calculateSemesterGPA(id);
    semester.gpa = gpa;
    await semester.save();

    res.status(200).json({
      success: true,
      message: 'Semester GPA calculated',
      data: {
        semesterId: semester._id,
        gpa,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ============ GET CGPA ============

router.get('/analytics/cgpa', verifyToken, async (req, res, next) => {
  try {
    const cgpa = await calculateCGPA(req.user.userId);
    const semesters = await Semester.find({ userId: req.user.userId })
      .populate('courses')
      .sort({ year: 1, semesterNumber: 1 });

    // Calculate each semester GPA
    const semesterData = await Promise.all(
      semesters.map(async (semester) => ({
        _id: semester._id,
        year: semester.year,
        semesterType: semester.semesterType,
        semesterNumber: semester.semesterNumber,
        gpa: await calculateSemesterGPA(semester._id),
        courseCount: semester.courses.length,
      }))
    );

    res.status(200).json({
      success: true,
      data: {
        cgpa,
        semesterCount: semesters.length,
        semesters: semesterData,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ============ DELETE SEMESTER ============

router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid semester ID format',
      });
    }

    const semester = await Semester.findById(id);

    if (!semester) {
      return res.status(404).json({
        success: false,
        message: 'Semester not found',
      });
    }

    if (semester.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this semester',
      });
    }

    // Delete all courses in semester
    await Course.deleteMany({ semesterId: id });

    // Delete semester
    await Semester.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Semester deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;

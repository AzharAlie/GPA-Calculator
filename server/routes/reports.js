import express from 'express';
import PDFDocument from 'pdfkit';
import Semester from '../models/Semester.js';
import User from '../models/User.js';
import verifyToken from '../middleware/authMiddleware.js';

const router = express.Router();

// ============ HELPER FUNCTIONS ============

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

const calculateSemesterGPA = (semester) => {
  if (semester.courses.length === 0) return 0;

  const totalCredits = semester.courses.reduce((sum, course) => sum + course.credits, 0);
  const totalGradePoints = semester.courses.reduce(
    (sum, course) => sum + course.calculateGradePoints(),
    0
  );

  return parseFloat((totalGradePoints / totalCredits).toFixed(2));
};

// ============ GENERATE PDF REPORT ============

router.get('/pdf/full-report', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    const semesters = await Semester.find({ userId: req.user.userId })
      .populate('courses')
      .sort({ year: 1, semesterNumber: 1 });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Calculate CGPA
    const cgpa = await calculateCGPA(req.user.userId);

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="GPA-Report-${new Date().toISOString().split('T')[0]}.pdf"`
    );

    doc.pipe(res);

    // Header
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('GPA Report', { align: 'center' });

    doc.fontSize(12).font('Helvetica').text(`Generated: ${new Date().toLocaleDateString()}`, {
      align: 'center',
    });

    doc.moveDown(0.5);

    // Student Info
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Student Information');

    doc.fontSize(11).font('Helvetica');
    doc.text(`Name: ${user.name}`);
    doc.text(`Email: ${user.email}`);

    doc.moveDown(0.5);

    // CGPA Summary
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Academic Summary');

    doc.fontSize(11).font('Helvetica');
    doc.text(`Cumulative GPA (CGPA): ${cgpa}`);
    doc.text(`Total Semesters: ${semesters.length}`);

    let totalCourses = 0;
    let totalCredits = 0;
    semesters.forEach((semester) => {
      totalCourses += semester.courses.length;
      totalCredits += semester.courses.reduce((sum, course) => sum + course.credits, 0);
    });

    doc.text(`Total Courses: ${totalCourses}`);
    doc.text(`Total Credits: ${totalCredits}`);

    doc.moveDown(1);

    // Semester Details
    semesters.forEach((semester, index) => {
      const semesterGPA = calculateSemesterGPA(semester);

      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text(`${semester.semesterType} ${semester.year} - Semester ${semester.semesterNumber}`);

      doc.fontSize(10).font('Helvetica');
      doc.text(`Semester GPA: ${semesterGPA}`);

      // Course Table Header
      doc.text('Courses:', { underline: true });

      // Course list
      semester.courses.forEach((course) => {
        const gradePoints = course.calculateGradePoints();
        doc.text(
          `  • ${course.name} | Grade: ${course.grade} | Credits: ${course.credits} | Points: ${gradePoints}`
        );
      });

      doc.moveDown(0.5);
    });

    doc.moveDown(1);

    // Footer
    doc
      .fontSize(9)
      .font('Helvetica')
      .text('This is an automatically generated report. For official records, please contact the registrar.', {
        align: 'center',
        color: '#888888',
      });

    doc.end();
  } catch (error) {
    next(error);
  }
});

// ============ GET SEMESTER PDF ============

router.get('/pdf/semester/:semesterId', verifyToken, async (req, res, next) => {
  try {
    const { semesterId } = req.params;

    const semester = await Semester.findById(semesterId).populate('courses');

    if (!semester) {
      return res.status(404).json({
        success: false,
        message: 'Semester not found',
      });
    }

    if (semester.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const user = await User.findById(req.user.userId);
    const semesterGPA = semester.courses.length
      ? parseFloat(
          (
            semester.courses.reduce((sum, course) => sum + course.calculateGradePoints(), 0) /
            semester.courses.reduce((sum, course) => sum + course.credits, 0)
          ).toFixed(2)
        )
      : 0;

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Semester-Report-${semester.semesterType}-${semester.year}.pdf"`
    );

    doc.pipe(res);

    // Header
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text(`${semester.semesterType} ${semester.year} - Semester Report`, { align: 'center' });

    doc.moveDown(0.5);

    // Student Info
    doc.fontSize(11).font('Helvetica').text(`Student: ${user.name}`, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });

    doc.moveDown(1);

    // GPA Summary
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Semester GPA', { underline: true });

    doc.fontSize(16).font('Helvetica-Bold').text(semesterGPA.toString());

    doc.moveDown(1);

    // Courses
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Courses', { underline: true });

    doc.fontSize(10).font('Helvetica');

    const totalCredits = semester.courses.reduce((sum, course) => sum + course.credits, 0);
    const totalPoints = semester.courses.reduce(
      (sum, course) => sum + course.calculateGradePoints(),
      0
    );

    semester.courses.forEach((course) => {
      doc.text(
        `${course.name.padEnd(30)} | Grade: ${course.grade.padEnd(2)} | Credits: ${course.credits} | Points: ${course.calculateGradePoints()}`
      );
    });

    doc.moveDown(0.5);
    doc.text(`Total Credits: ${totalCredits}`);
    doc.text(`Total Grade Points: ${totalPoints}`);

    doc.end();
  } catch (error) {
    next(error);
  }
});

export default router;

import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    semesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Semester',
      required: [true, 'Semester ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
      maxlength: [100, 'Course name cannot exceed 100 characters'],
    },
    credits: {
      type: Number,
      required: [true, 'Credits are required'],
      min: [1, 'Credits must be between 1 and 4'],
      max: [4, 'Credits must be between 1 and 4'],
      validate: {
        validator: Number.isInteger,
        message: 'Credits must be a whole number',
      },
    },
    grade: {
      type: String,
      enum: {
        values: ['A', 'B', 'C', 'D', 'F'],
        message: 'Grade must be one of: A, B, C, D, F',
      },
      required: [true, 'Grade is required'],
    },
  },
  { timestamps: true }
);

// Grade point mapping
const gradePointMap = {
  A: 4.0,
  B: 3.0,
  C: 2.0,
  D: 1.0,
  F: 0.0,
};

// Instance method to calculate grade points
courseSchema.methods.calculateGradePoints = function () {
  return gradePointMap[this.grade] * this.credits;
};

// Virtual to get unweighted grade point value
courseSchema.virtual('gradeValue').get(function () {
  return gradePointMap[this.grade];
});

// Virtual to get weighted grade points
courseSchema.virtual('weightedGradePoints').get(function () {
  return this.calculateGradePoints();
});

// Enable virtuals in JSON output
courseSchema.set('toJSON', { virtuals: true });

const Course = mongoose.model('Course', courseSchema);

export default Course;

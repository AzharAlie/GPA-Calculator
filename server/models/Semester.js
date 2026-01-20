import mongoose from 'mongoose';

const semesterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    semesterNumber: {
      type: Number,
      required: [true, 'Semester number is required'],
      min: [1, 'Semester must be at least 1'],
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: [2000, 'Year must be 2000 or later'],
    },
    semesterType: {
      type: String,
      enum: ['Fall', 'Spring', 'Summer'],
      required: [true, 'Semester type is required'],
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    gpa: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Virtual to calculate semester GPA
semesterSchema.virtual('semesterGPA').get(function () {
  return this.gpa;
});

// Populate courses before saving
semesterSchema.pre('save', async function (next) {
  if (this.isModified('courses') || this.isNew) {
    await this.populate('courses');
  }
  next();
});

semesterSchema.set('toJSON', { virtuals: true });

const Semester = mongoose.model('Semester', semesterSchema);

export default Semester;

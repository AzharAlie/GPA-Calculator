import { useState } from 'react'

function CourseForm({ onAddCourse }) {
  const [courseName, setCourseName] = useState('')
  const [grade, setGrade] = useState('A')
  const [credits, setCredits] = useState('3')

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!courseName.trim()) {
      alert('Please enter a course name')
      return
    }

    if (credits <= 0 || credits > 6) {
      alert('Credits must be between 1 and 6')
      return
    }

    onAddCourse({
      courseName: courseName.trim(),
      grade,
      credits
    })

    setCourseName('')
    setGrade('A')
    setCredits('3')
  }

  return (
    <form className="course-form" onSubmit={handleSubmit}>
      <h2>Add Course</h2>
      
      <div className="form-group">
        <label htmlFor="courseName">Course Name</label>
        <input
          id="courseName"
          type="text"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          placeholder="e.g., Mathematics 101"
          maxLength="50"
        />
      </div>

      <div className="form-group">
        <label htmlFor="grade">Grade</label>
        <select
          id="grade"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
        >
          <option value="A">A (4.0)</option>
          <option value="A-">A- (3.7)</option>
          <option value="B+">B+ (3.3)</option>
          <option value="B">B (3.0)</option>
          <option value="B-">B- (2.7)</option>
          <option value="C+">C+ (2.3)</option>
          <option value="C">C (2.0)</option>
          <option value="C-">C- (1.7)</option>
          <option value="D+">D+ (1.3)</option>
          <option value="D">D (1.0)</option>
          <option value="F">F (0.0)</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="credits">Credit Hours</label>
        <input
          id="credits"
          type="number"
          value={credits}
          onChange={(e) => setCredits(e.target.value)}
          min="0.5"
          max="6"
          step="0.5"
        />
      </div>

      <button type="submit" className="submit-btn">
        Add Course
      </button>
    </form>
  )
}

export default CourseForm

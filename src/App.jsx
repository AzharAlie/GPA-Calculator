import { useState } from 'react'
import './App.css'
import CourseForm from './components/CourseForm'
import CourseList from './components/CourseList'
import GPADisplay from './components/GPADisplay'

function App() {
  const [courses, setCourses] = useState([])
  const [gpa, setGPA] = useState(0)

  const addCourse = (course) => {
    const newCourses = [...courses, { ...course, id: Date.now() }]
    setCourses(newCourses)
    calculateGPA(newCourses)
  }

  const deleteCourse = (id) => {
    const newCourses = courses.filter(course => course.id !== id)
    setCourses(newCourses)
    calculateGPA(newCourses)
  }

  const calculateGPA = (courseList) => {
    if (courseList.length === 0) {
      setGPA(0)
      return
    }

    const gradePoints = {
      'A': 4.0,
      'A-': 3.7,
      'B+': 3.3,
      'B': 3.0,
      'B-': 2.7,
      'C+': 2.3,
      'C': 2.0,
      'C-': 1.7,
      'D+': 1.3,
      'D': 1.0,
      'F': 0.0
    }

    let totalPoints = 0
    let totalCredits = 0

    courseList.forEach(course => {
      const points = gradePoints[course.grade] || 0
      const credits = parseFloat(course.credits) || 0
      totalPoints += points * credits
      totalCredits += credits
    })

    const calculatedGPA = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0
    setGPA(calculatedGPA)
  }

  const clearAll = () => {
    setCourses([])
    setGPA(0)
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1>📚 GPA Calculator</h1>
        <p className="subtitle">Calculate your Grade Point Average with ease</p>
      </header>

      <div className="main-content">
        <div className="left-panel">
          <CourseForm onAddCourse={addCourse} />
        </div>

        <div className="right-panel">
          <GPADisplay gpa={gpa} totalCourses={courses.length} />
          <CourseList courses={courses} onDeleteCourse={deleteCourse} />
          {courses.length > 0 && (
            <button className="clear-btn" onClick={clearAll}>
              Clear All Courses
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default App

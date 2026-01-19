function CourseList({ courses, onDeleteCourse }) {
  return (
    <div className="course-list">
      <h2>Courses Added ({courses.length})</h2>
      {courses.length === 0 ? (
        <p className="empty-message">No courses added yet. Add one to get started!</p>
      ) : (
        <ul>
          {courses.map((course) => (
            <li key={course.id} className="course-item">
              <div className="course-info">
                <h3>{course.courseName}</h3>
                <p>Grade: <span className="grade-badge">{course.grade}</span> | Credits: <span className="credits-badge">{course.credits}</span></p>
              </div>
              <button
                className="delete-btn"
                onClick={() => onDeleteCourse(course.id)}
                title="Delete course"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default CourseList

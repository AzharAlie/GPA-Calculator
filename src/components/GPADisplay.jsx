function GPADisplay({ gpa, totalCourses }) {
  const getGPAStatus = (gpa) => {
    const gpaNum = parseFloat(gpa)
    if (gpaNum >= 3.7) return { status: 'Excellent', color: '#4CAF50' }
    if (gpaNum >= 3.3) return { status: 'Very Good', color: '#45a049' }
    if (gpaNum >= 3.0) return { status: 'Good', color: '#8bc34a' }
    if (gpaNum >= 2.7) return { status: 'Satisfactory', color: '#ffc107' }
    if (gpaNum >= 2.0) return { status: 'Average', color: '#ff9800' }
    if (gpaNum > 0) return { status: 'Below Average', color: '#f44336' }
    return { status: 'No Data', color: '#9e9e9e' }
  }

  const gpaInfo = getGPAStatus(gpa)

  return (
    <div className="gpa-display">
      <h2>Your GPA</h2>
      <div className="gpa-card" style={{ borderLeftColor: gpaInfo.color }}>
        <div className="gpa-value" style={{ color: gpaInfo.color }}>
          {gpa}
        </div>
        <div className="gpa-status">{gpaInfo.status}</div>
        <div className="gpa-info">
          {totalCourses === 0 ? (
            <p>Add courses to calculate your GPA</p>
          ) : (
            <p>Based on {totalCourses} course{totalCourses !== 1 ? 's' : ''}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default GPADisplay

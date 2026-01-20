import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import axios from 'axios';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const GpaAnalytics = ({ token }) => {
  const [cgpa, setCgpa] = useState(0);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [token]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/semesters/analytics/cgpa', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setCgpa(response.data.data.cgpa);
        setSemesters(response.data.data.semesters);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div>Error: {error}</div>;

  // Semester GPA Chart Data
  const semesterChartData = {
    labels: semesters.map((s) => `${s.semesterType} ${s.year}`),
    datasets: [
      {
        label: 'Semester GPA',
        data: semesters.map((s) => s.gpa),
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
      },
    ],
  };

  // Grade Distribution (Pie Chart)
  const gradeDistribution = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    F: 0,
  };

  semesters.forEach((semester) => {
    if (Array.isArray(semester.courses)) {
      semester.courses.forEach((course) => {
        gradeDistribution[course.grade]++;
      });
    }
  });

  const gradeChartData = {
    labels: Object.keys(gradeDistribution),
    datasets: [
      {
        data: Object.values(gradeDistribution),
        backgroundColor: [
          'rgba(75, 192, 75, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(255, 99, 132, 0.8)',
        ],
        borderColor: [
          'rgba(75, 192, 75, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const downloadPdfReport = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/reports/pdf/full-report', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `GPA-Report-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Error downloading PDF:', err);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>GPA Analytics Dashboard</h2>

      {/* CGPA Display */}
      <div
        style={{
          backgroundColor: '#f0f0f0',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center',
        }}
      >
        <h3>Cumulative GPA (CGPA)</h3>
        <h1 style={{ fontSize: '48px', color: '#2196F3', margin: '10px 0' }}>
          {cgpa.toFixed(2)}
        </h1>
        <p>Total Semesters: {semesters.length}</p>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Semester GPA Chart */}
        <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Semester GPA Trend</h3>
          {semesters.length > 0 ? (
            <Bar
              data={semesterChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 4.0,
                  },
                },
              }}
            />
          ) : (
            <p>No semester data available</p>
          )}
        </div>

        {/* Grade Distribution Chart */}
        <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Grade Distribution</h3>
          {Object.values(gradeDistribution).some((v) => v > 0) ? (
            <Pie
              data={gradeChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          ) : (
            <p>No grade data available</p>
          )}
        </div>
      </div>

      {/* Semester Details Table */}
      <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3>Semester Details</h3>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '10px',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>Semester</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>GPA</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Courses</th>
            </tr>
          </thead>
          <tbody>
            {semesters.map((semester, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>
                  {semester.semesterType} {semester.year}
                </td>
                <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>
                  {semester.gpa.toFixed(2)}
                </td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  {semester.courseCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Download PDF Button */}
      <button
        onClick={downloadPdfReport}
        style={{
          backgroundColor: '#4CAF50',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '4px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        📥 Download Full Report (PDF)
      </button>
    </div>
  );
};

export default GpaAnalytics;

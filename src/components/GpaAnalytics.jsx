import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

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
      // ============ STEP 1: RETRIEVE API URL FROM ENVIRONMENT VARIABLES ============
      // import.meta.env.VITE_API_URL is set in .env file
      // For local development: http://localhost:5000/api
      // For production: Vercel backend URL (set in .env.production or Vercel dashboard)
      const API_URL = import.meta.env.VITE_API_URL;

      // ============ STEP 2: SET LOADING STATE ============
      // Indicate to user that data is being fetched
      setLoading(true);
      setError(null);

      // ============ STEP 3: CONSTRUCT REQUEST OPTIONS ============
      // Include JWT token in Authorization header for authenticated request
      // Token is required because user's analytics are private data
      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      };

      // ============ STEP 4: MAKE API CALL ============
      // Fetch analytics from backend semester endpoint
      // Endpoint: GET /api/semesters/analytics/cgpa
      const endpoint = `${API_URL}/semesters/analytics/cgpa`;
      console.log(`[API Request] Fetching analytics from: ${endpoint}`);

      const response = await fetch(endpoint, requestOptions);

      // ============ STEP 5: CHECK IF RESPONSE WAS SUCCESSFUL ============
      // Status codes 200-299 are considered success
      // Other status codes (401, 404, 500) indicate an error
      if (!response.ok) {
        // Extract error message from response if available
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP Error: ${response.status}`
        );
      }

      // ============ STEP 6: PARSE RESPONSE JSON ============
      // Convert response body from JSON string to JavaScript object
      const jsonData = await response.json();
      console.log('[API Response] Analytics data received:', jsonData);

      // ============ STEP 7: VALIDATE RESPONSE STRUCTURE ============
      // Check if backend returned success: true
      if (jsonData.success) {
        // ============ STEP 8: UPDATE STATE WITH FETCHED DATA ============
        // Extract CGPA and semesters array from response
        setCgpa(jsonData.data.cgpa);
        setSemesters(jsonData.data.semesters);
      } else {
        throw new Error(jsonData.message || 'Failed to fetch analytics');
      }

      // ============ STEP 9: HANDLE ERRORS IN TRY-CATCH BLOCK ============
    } catch (err) {
      // Log detailed error information for debugging
      console.error('[API Error] Failed to fetch analytics:', {
        message: err.message,
        stack: err.stack,
      });

      // Set error state to display error message to user
      setError(err.message || 'Failed to load analytics. Please try again.');

      // ============ STEP 10: FINAL CLEANUP WITH FINALLY BLOCK ============
      // Stop loading indicator regardless of success or failure
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
      // ============ STEP 1: RETRIEVE API URL FROM ENVIRONMENT VARIABLES ============
      const API_URL = import.meta.env.VITE_API_URL;

      // ============ STEP 2: CONSTRUCT REQUEST OPTIONS ============
      // Set responseType to 'blob' to handle binary PDF data
      // Include JWT token for authorization
      const requestOptions = {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      };

      // ============ STEP 3: MAKE API CALL TO PDF ENDPOINT ============
      // Endpoint: GET /api/reports/pdf/full-report
      // Returns PDF file as binary blob
      const endpoint = `${API_URL}/reports/pdf/full-report`;
      console.log(`[API Request] Downloading PDF from: ${endpoint}`);

      const response = await fetch(endpoint, requestOptions);

      // ============ STEP 4: CHECK IF RESPONSE WAS SUCCESSFUL ============
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP Error: ${response.status}`
        );
      }

      // ============ STEP 5: CONVERT RESPONSE TO BLOB ============
      // PDF is returned as binary data (blob)
      // Blob is a File-like object representing binary data
      const pdfBlob = await response.blob();
      console.log('[API Response] PDF received, size:', pdfBlob.size, 'bytes');

      // ============ STEP 6: CREATE DOWNLOAD LINK ============
      // URL.createObjectURL creates a temporary URL pointing to the blob
      // This URL can be used as a download link
      const blobUrl = window.URL.createObjectURL(new Blob([pdfBlob]));

      // ============ STEP 7: CREATE AND TRIGGER DOWNLOAD ============
      // Create a temporary <a> element to trigger download
      const link = document.createElement('a');
      link.href = blobUrl;

      // Generate filename with current date
      const timestamp = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `GPA-Report-${timestamp}.pdf`);

      // Append to DOM, click, and remove (cleanup)
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      // ============ STEP 8: CLEANUP BLOB URL ============
      // Release memory by revoking the temporary blob URL
      window.URL.revokeObjectURL(blobUrl);
      console.log('[Download] PDF downloaded successfully');

      // ============ STEP 9: ERROR HANDLING ============
    } catch (err) {
      // Log error details for debugging
      console.error('[API Error] Failed to download PDF:', {
        message: err.message,
        stack: err.stack,
      });

      // Alert user that download failed
      alert(`Failed to download PDF: ${err.message}`);
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

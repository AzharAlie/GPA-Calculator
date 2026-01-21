/**
 * ============================================================================
 * API Service Usage Examples
 * ============================================================================
 * 
 * This file demonstrates how to use the api.js service functions
 * in your React components.
 * 
 * Import the functions:
 * import { getCourses, createCourse, updateCourse, deleteCourse, getCourse } from '../services/api';
 */

import React, { useState, useEffect } from 'react';
import { getCourses, createCourse, updateCourse, deleteCourse, getCourseStats } from '../services/api';

/**
 * ============================================================================
 * EXAMPLE 1: Fetch Courses with useEffect
 * ============================================================================
 * 
 * This pattern fetches data when component mounts and handles loading/error states
 */
function CoursesListExample({ token }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ============ STEP 1: CALL API FUNCTION ============
        // getCourses() automatically includes the token in Authorization header
        const response = await getCourses(token);

        // ============ STEP 2: EXTRACT DATA FROM RESPONSE ============
        // Response structure: { success: true, data: { courses: [...] } }
        if (response.success) {
          setCourses(response.data.courses);
        } else {
          throw new Error(response.message || 'Failed to fetch courses');
        }

        // ============ STEP 3: ERROR HANDLING ============
        // Errors thrown by api.js functions are caught here
      } catch (err) {
        console.error('Error fetching courses:', err);

        // ============ STEP 4: DETERMINE ERROR TYPE ============
        if (err.message.includes('401')) {
          // Unauthorized - token expired or invalid
          setError('Your session expired. Please login again.');
        } else if (err.message.includes('404')) {
          // Not found
          setError('Courses not found.');
        } else {
          // Generic error
          setError(err.message || 'Failed to load courses');
        }

        // ============ STEP 5: FINAL CLEANUP ============
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]); // Re-fetch if token changes

  // ============ RENDER BASED ON STATE ============
  if (loading) return <div>Loading courses...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h2>Your Courses ({courses.length})</h2>
      <ul>
        {courses.map((course) => (
          <li key={course._id}>
            {course.courseName} - Grade: {course.grade}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * ============================================================================
 * EXAMPLE 2: Create a New Course
 * ============================================================================
 * 
 * This pattern shows how to POST new data to the backend
 */
function AddCourseExample({ token, onCourseAdded }) {
  const [formData, setFormData] = useState({
    courseName: '',
    grade: 'A',
    credits: 3,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // ============ STEP 1: SET LOADING STATE ============
      // Disable form while request is in progress
      setLoading(true);
      setError(null);

      // ============ STEP 2: CALL CREATE FUNCTION ============
      // Pass course data and token to createCourse
      const response = await createCourse(formData, token);

      // ============ STEP 3: HANDLE SUCCESS ============
      if (response.success) {
        alert('Course added successfully!');

        // Reset form
        setFormData({ courseName: '', grade: 'A', credits: 3 });

        // Notify parent component (to refresh list)
        if (onCourseAdded) {
          onCourseAdded(response.data.course);
        }
      }

      // ============ STEP 4: ERROR HANDLING ============
    } catch (err) {
      console.error('Error creating course:', err);

      // Show specific error messages based on status code
      if (err.message.includes('400')) {
        setError('Please check your input. Grade must be A-F, credits 1-4.');
      } else if (err.message.includes('401')) {
        setError('Your session expired. Please login again.');
      } else {
        setError(err.message);
      }

      // ============ STEP 5: FINAL CLEANUP ============
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add New Course</h3>

      {error && <div className="error">{error}</div>}

      <input
        type="text"
        placeholder="Course Name"
        value={formData.courseName}
        onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
        required
        disabled={loading}
      />

      <select
        value={formData.grade}
        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
        disabled={loading}
      >
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
        <option value="D">D</option>
        <option value="F">F</option>
      </select>

      <input
        type="number"
        placeholder="Credits"
        min="1"
        max="4"
        value={formData.credits}
        onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
        disabled={loading}
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Course'}
      </button>
    </form>
  );
}

/**
 * ============================================================================
 * EXAMPLE 3: Update an Existing Course
 * ============================================================================
 * 
 * This pattern shows how to PUT updated data to the backend
 */
function EditCourseExample({ courseId, token, onCourseUpdated }) {
  const [formData, setFormData] = useState({
    courseName: '',
    grade: 'A',
    credits: 3,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      // ============ UPDATE COURSE ============
      // Pass courseId, updated data, and token to updateCourse
      const response = await updateCourse(courseId, formData, token);

      if (response.success) {
        alert('Course updated successfully!');
        if (onCourseUpdated) {
          onCourseUpdated(response.data.course);
        }
      }

    } catch (err) {
      console.error('Error updating course:', err);

      if (err.message.includes('404')) {
        setError('Course not found. It may have been deleted.');
      } else if (err.message.includes('403')) {
        setError('You are not authorized to update this course.');
      } else {
        setError(err.message);
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpdate}>
      <h3>Edit Course</h3>

      {error && <div className="error">{error}</div>}

      <input
        type="text"
        placeholder="Course Name"
        value={formData.courseName}
        onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
        disabled={loading}
      />

      <select
        value={formData.grade}
        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
        disabled={loading}
      >
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
        <option value="D">D</option>
        <option value="F">F</option>
      </select>

      <input
        type="number"
        placeholder="Credits"
        min="1"
        max="4"
        value={formData.credits}
        onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
        disabled={loading}
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Course'}
      </button>
    </form>
  );
}

/**
 * ============================================================================
 * EXAMPLE 4: Delete a Course
 * ============================================================================
 * 
 * This pattern shows how to DELETE resources from the backend
 */
function DeleteCourseExample({ courseId, token, onCourseDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    try {
      // ============ CONFIRM DELETION ============
      // Always confirm destructive operations
      if (!window.confirm('Are you sure you want to delete this course?')) {
        return;
      }

      setLoading(true);
      setError(null);

      // ============ CALL DELETE FUNCTION ============
      const response = await deleteCourse(courseId, token);

      if (response.success) {
        alert('Course deleted successfully!');
        if (onCourseDeleted) {
          onCourseDeleted(courseId);
        }
      }

    } catch (err) {
      console.error('Error deleting course:', err);

      if (err.message.includes('404')) {
        setError('Course not found or already deleted.');
      } else if (err.message.includes('409')) {
        setError('Cannot delete course. It has dependencies.');
      } else {
        setError(err.message);
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      <button onClick={handleDelete} disabled={loading}>
        {loading ? 'Deleting...' : 'Delete Course'}
      </button>
    </div>
  );
}

/**
 * ============================================================================
 * EXAMPLE 5: Multiple API Calls (Statistics)
 * ============================================================================
 * 
 * This pattern shows how to make multiple API calls and combine results
 */
function StatsExample({ token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // ============ MAKE MULTIPLE API CALLS ============
        // Fetch both courses and stats to display comprehensive view
        const coursesResponse = await getCourses(token);
        const statsResponse = await getCourseStats(token);

        // ============ COMBINE DATA ============
        if (coursesResponse.success && statsResponse.success) {
          setStats({
            courses: coursesResponse.data.courses,
            stats: statsResponse.data,
          });
        }

      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err.message);

      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  if (loading) return <div>Loading statistics...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div>
      <h2>Statistics</h2>
      <p>Total Courses: {stats.stats.totalCourses}</p>
      <p>Average GPA: {stats.stats.avgGPA.toFixed(2)}</p>
    </div>
  );
}

/**
 * ============================================================================
 * COMMON PATTERNS & BEST PRACTICES
 * ============================================================================
 * 
 * 1. ALWAYS wrap API calls in try-catch
 * 2. SET loading state before request
 * 3. CLEAR errors before new request
 * 4. CHECK response.success before using data
 * 5. DISABLE form inputs while loading
 * 6. HANDLE specific error codes (401, 404, 400)
 * 7. SHOW user-friendly error messages
 * 8. FINALLY block to clean up loading state
 * 
 * ============================================================================
 */

export {
  CoursesListExample,
  AddCourseExample,
  EditCourseExample,
  DeleteCourseExample,
  StatsExample,
};

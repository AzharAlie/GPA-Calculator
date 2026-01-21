/**
 * API Service Usage Examples
 * 
 * This file demonstrates how to use the apiService functions
 * in React components. Copy these patterns for your own components.
 */

import { useState, useEffect } from 'react';
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getGPAStats,
  loginUser,
  registerUser,
} from '../services/apiService';

/**
 * Example: Fetching Courses
 * 
 * Shows how to fetch courses on component mount
 * and handle loading/error states
 */
export const CourseListExample = ({ token }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        // Call API function
        const response = await getCourses(token);

        // Handle response
        if (response.success) {
          setCourses(response.data);
        }
      } catch (err) {
        // Handle errors with user-friendly message
        setError(err.message);
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [token]);

  if (loading) return <div>Loading courses...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Your Courses ({courses.length})</h2>
      {courses.length === 0 ? (
        <p>No courses added yet</p>
      ) : (
        <ul>
          {courses.map((course) => (
            <li key={course._id}>
              {course.name} - Grade: {course.grade}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/**
 * Example: Creating a Course
 * 
 * Shows form submission and optimistic updates
 */
export const CreateCourseExample = ({ token, onCourseCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    credits: 3,
    grade: 'A',
    semesterId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'credits' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      // Call API function
      const response = await createCourse(formData, token);

      if (response.success) {
        // Notify parent component of successful creation
        onCourseCreated(response.data);

        // Reset form
        setFormData({
          name: '',
          credits: 3,
          grade: 'A',
          semesterId: '',
        });
      }
    } catch (err) {
      setError(err.message);
      console.error('Error creating course:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        placeholder="Course name"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <select name="credits" value={formData.credits} onChange={handleChange}>
        <option value={1}>1 Credit</option>
        <option value={2}>2 Credits</option>
        <option value={3}>3 Credits</option>
        <option value={4}>4 Credits</option>
      </select>

      <select name="grade" value={formData.grade} onChange={handleChange}>
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
        <option value="D">D</option>
        <option value="F">F</option>
      </select>

      <input
        type="text"
        name="semesterId"
        placeholder="Semester ID"
        value={formData.semesterId}
        onChange={handleChange}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Add Course'}
      </button>

      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
};

/**
 * Example: Displaying GPA Stats
 * 
 * Shows how to fetch and display statistics
 */
export const GPAStatsExample = ({ token }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await getGPAStats(token);

        if (response.success) {
          setStats(response.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) return <div>Calculating GPA...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!stats) return <div>No statistics available</div>;

  return (
    <div>
      <h2>Your GPA Statistics</h2>
      <div>
        <h3>GPA: {stats.gpa}</h3>
        <p>Total Courses: {stats.totalCourses}</p>
        <p>Total Credits: {stats.totalCredits}</p>
      </div>

      <h3>Grade Distribution</h3>
      <ul>
        {Object.entries(stats.stats.gradeDistribution).map(([grade, count]) => (
          grade !== 'passRate' && <li key={grade}>{grade}: {count}</li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Example: Login Form
 * 
 * Shows authentication flow
 */
export const LoginExample = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      // Call login API
      const response = await loginUser(formData);

      if (response.success) {
        // Save token (usually to localStorage)
        localStorage.setItem('token', response.token);

        // Notify parent component
        onLoginSuccess(response.token, response.user);
      }
    } catch (err) {
      setError(err.message);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>

      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
};

/**
 * Example: Edit Course
 * 
 * Shows how to update existing data
 */
export const EditCourseExample = ({ courseId, initialData, token, onUpdateSuccess }) => {
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'credits' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      // Only send changed fields
      const updates = {};
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== initialData[key]) {
          updates[key] = formData[key];
        }
      });

      const response = await updateCourse(courseId, updates, token);

      if (response.success) {
        onUpdateSuccess(response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
      />

      <select name="grade" value={formData.grade} onChange={handleChange}>
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
        <option value="D">D</option>
        <option value="F">F</option>
      </select>

      <button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Course'}
      </button>

      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
};

/**
 * Example: Delete Course
 * 
 * Shows confirmation and deletion
 */
export const DeleteCourseExample = ({ courseId, token, onDeleteSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await deleteCourse(courseId, token);

      if (response.success) {
        onDeleteSuccess(courseId);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleDelete} disabled={loading}>
        {loading ? 'Deleting...' : 'Delete Course'}
      </button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

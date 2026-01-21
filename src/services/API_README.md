/**
 * ============================================================================
 * API Service Quick Reference
 * ============================================================================
 * 
 * Lightweight reusable HTTP functions for the GPA Calculator React app.
 * Located in: src/services/api.js
 */

/**
 * GENERIC HTTP METHODS
 * ====================
 * 
 * These provide low-level HTTP operations for any endpoint:
 * 
 * 1. apiGet(endpoint, token)
 *    - Fetch data without modifying state
 *    - Returns: Promise<Object>
 *    - Example: apiGet('/courses', token)
 * 
 * 2. apiPost(endpoint, body, token)
 *    - Create new resources
 *    - Returns: Promise<Object>
 *    - Example: apiPost('/courses', { name: 'Math' }, token)
 * 
 * 3. apiPut(endpoint, body, token)
 *    - Update existing resources (full replacement)
 *    - Returns: Promise<Object>
 *    - Example: apiPut('/courses/123', { name: 'Advanced Math' }, token)
 * 
 * 4. apiDelete(endpoint, token)
 *    - Delete resources
 *    - Returns: Promise<Object>
 *    - Example: apiDelete('/courses/123', token)
 */

/**
 * COURSE-SPECIFIC FUNCTIONS (Built on Generic Methods)
 * =====================================================
 * 
 * Convenience functions for common course operations:
 * 
 * 1. getCourses(token)
 *    - Fetch all courses for logged-in user
 *    - Returns: { success: true, data: { courses: [...] } }
 *    - Usage: const res = await getCourses(userToken);
 * 
 * 2. getCourse(courseId, token)
 *    - Fetch single course by ID
 *    - Returns: { success: true, data: { course: {...} } }
 *    - Usage: const res = await getCourse('course-123', token);
 * 
 * 3. createCourse(courseData, token)
 *    - Create new course
 *    - Expects: { courseName: string, grade: string, credits: number }
 *    - Returns: { success: true, data: { course: {...} } }
 *    - Usage: const res = await createCourse({ courseName: 'Math', grade: 'A', credits: 3 }, token);
 * 
 * 4. updateCourse(courseId, courseData, token)
 *    - Update existing course
 *    - Same format as createCourse
 *    - Returns: { success: true, data: { course: {...} } }
 *    - Usage: const res = await updateCourse('course-123', updatedData, token);
 * 
 * 5. deleteCourse(courseId, token)
 *    - Delete a course
 *    - Returns: { success: true, message: 'Course deleted successfully' }
 *    - Usage: const res = await deleteCourse('course-123', token);
 * 
 * 6. getCourseStats(token)
 *    - Get aggregate statistics
 *    - Returns: { success: true, data: { totalCourses, avgGPA, gradeDistribution } }
 *    - Usage: const res = await getCourseStats(token);
 */

/**
 * BASIC USAGE PATTERN
 * ===================
 * 
 * import { getCourses, createCourse } from '../services/api';
 * 
 * // In component:
 * try {
 *   const response = await getCourses(userToken);
 *   if (response.success) {
 *     setCourses(response.data.courses);
 *   }
 * } catch (error) {
 *   console.error('Failed:', error.message);
 * }
 */

/**
 * ERROR HANDLING EXAMPLES
 * =======================
 * 
 * 1. Network Error:
 *    "Network error: [message]"
 *    → Connection failed to backend server
 * 
 * 2. Unauthorized (401):
 *    "GET /courses failed: 401 Unauthorized - Token expired"
 *    → User needs to login
 * 
 * 3. Not Found (404):
 *    "DELETE /courses/123 failed: 404 Not Found - Course not found"
 *    → Resource doesn't exist
 * 
 * 4. Bad Request (400):
 *    "POST /courses failed: 400 Bad Request - Grade must be A-F"
 *    → Validation error
 * 
 * 5. Forbidden (403):
 *    "PUT /courses/123 failed: 403 Forbidden - Not authorized"
 *    → User doesn't own this resource
 */

/**
 * COMPONENT INTEGRATION EXAMPLES
 * ===============================
 */

// ============ EXAMPLE 1: Fetch on Mount ============
// import { getCourses } from '../services/api';
// 
// useEffect(() => {
//   const load = async () => {
//     try {
//       const res = await getCourses(token);
//       setCourses(res.data.courses);
//     } catch (err) {
//       setError(err.message);
//     }
//   };
//   load();
// }, [token]);

// ============ EXAMPLE 2: Form Submission ============
// import { createCourse } from '../services/api';
// 
// const handleSubmit = async (e) => {
//   e.preventDefault();
//   try {
//     const res = await createCourse(formData, token);
//     alert('Course added!');
//   } catch (err) {
//     setError(err.message);
//   }
// };

// ============ EXAMPLE 3: Delete with Confirmation ============
// import { deleteCourse } from '../services/api';
// 
// const handleDelete = async (courseId) => {
//   if (window.confirm('Delete course?')) {
//     try {
//       await deleteCourse(courseId, token);
//       // Refresh list or remove from state
//     } catch (err) {
//       alert('Failed: ' + err.message);
//     }
//   }
// };

// ============ EXAMPLE 4: Conditional Fetch ============
// import { getCourseStats } from '../services/api';
// 
// useEffect(() => {
//   if (token && courseIds.length > 0) {
//     getCourseStats(token)
//       .then(res => setStats(res.data))
//       .catch(err => setError(err.message));
//   }
// }, [token, courseIds]);

/**
 * ENVIRONMENT CONFIGURATION
 * ==========================
 * 
 * The API_URL is automatically set from environment variables:
 * 
 * DEVELOPMENT (.env):
 * VITE_API_URL=http://localhost:5000/api
 * 
 * PRODUCTION (.env.production):
 * VITE_API_URL=https://your-backend.vercel.app/api
 * 
 * Or set in Vercel Dashboard > Settings > Environment Variables
 */

/**
 * FILES INCLUDED
 * ==============
 * 
 * 1. src/services/api.js
 *    - Core service with all HTTP functions
 *    - ~300 lines with comprehensive comments
 * 
 * 2. src/services/api.examples.jsx
 *    - 5 complete component examples
 *    - Demonstrates patterns for common operations
 * 
 * 3. README.md (this file)
 *    - Quick reference guide
 */

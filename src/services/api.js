/**
 * ============================================================================
 * API Service Module - Core HTTP Functions
 * ============================================================================
 * 
 * Reusable API communication layer for the GPA Calculator React frontend.
 * Provides generic HTTP methods (GET, POST, PUT, DELETE) and course-specific
 * functions for common operations.
 * 
 * FEATURES:
 * - Centralized API base URL from environment variables
 * - Generic HTTP methods for any endpoint
 * - Course-specific helper functions
 * - Automatic JWT token handling
 * - Comprehensive error handling with try-catch
 * - Request/response logging for debugging
 * 
 * USAGE:
 * import { getCourses, createCourse, updateCourse, deleteCourse } from './services/api';
 * 
 * const courses = await getCourses(token);
 * const newCourse = await createCourse({ name: 'Math 101', grade: 'A', credits: 3 }, token);
 * ============================================================================
 */

/**
 * API Base URL from Vite Environment Variables
 * 
 * CONFIGURATION:
 * - Development: Set in .env file (http://localhost:5000/api)
 * - Production: Set in .env.production or Vercel dashboard
 * 
 * The variable is automatically replaced at build time by Vite
 */
const API_URL = import.meta.env.VITE_API_URL;

/**
 * ============================================================================
 * GENERIC HTTP METHODS
 * ============================================================================
 * These functions handle basic HTTP operations for any endpoint.
 * All functions support JWT authentication via token parameter.
 */

/**
 * Generic GET Request
 * 
 * Fetches data from the backend without modifying server state.
 * Use for retrieving courses, user data, analytics, etc.
 * 
 * @param {string} endpoint - API endpoint path (e.g., '/courses', '/courses/123')
 * @param {string} token - JWT authentication token (optional)
 * @returns {Promise<Object>} Parsed JSON response from server
 * @throws {Error} With descriptive message if request fails
 * 
 * EXAMPLES:
 * const courses = await apiGet('/courses', userToken);
 * const singleCourse = await apiGet('/courses/123', userToken);
 * 
 * ERROR HANDLING:
 * - Network errors: "Network error: [message]"
 * - Non-2xx status: "GET /courses failed: 404 Not Found"
 * - JSON parsing: "Failed to parse response"
 */
export const apiGet = async (endpoint, token = null) => {
  try {
    // ============ STEP 1: BUILD REQUEST HEADERS ============
    // Standard JSON headers + optional JWT token
    const headers = {
      'Content-Type': 'application/json',
    };

    // Add JWT token if provided
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // ============ STEP 2: CONSTRUCT FULL URL ============
    const url = `${API_URL}${endpoint}`;
    console.log(`[GET] ${url}`);

    // ============ STEP 3: MAKE GET REQUEST ============
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    // ============ STEP 4: CHECK RESPONSE STATUS ============
    // Fetch doesn't throw on HTTP errors, must check response.ok
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `GET ${endpoint} failed: ${response.status} ${response.statusText} - ${errorData.message || ''}`
      );
    }

    // ============ STEP 5: PARSE AND RETURN RESPONSE ============
    const data = await response.json();
    console.log(`[GET SUCCESS] ${endpoint}:`, data);
    return data;

  } catch (error) {
    // ============ STEP 6: ERROR LOGGING ============
    console.error(`[GET ERROR] ${endpoint}:`, error.message);
    throw error;
  }
};

/**
 * Generic POST Request
 * 
 * Sends data to backend to create new resources.
 * Use for creating courses, registering users, submitting forms.
 * 
 * @param {string} endpoint - API endpoint path (e.g., '/courses')
 * @param {Object} body - Request body data (will be JSON stringified)
 * @param {string} token - JWT authentication token (optional)
 * @returns {Promise<Object>} Parsed JSON response from server
 * @throws {Error} With descriptive message if request fails
 * 
 * EXAMPLES:
 * const newCourse = await apiPost('/courses', 
 *   { courseName: 'Math 101', grade: 'A', credits: 3 }, 
 *   userToken
 * );
 * 
 * ERROR HANDLING:
 * - Invalid body: Ensure body is a valid JavaScript object
 * - 400 Bad Request: Check field validation requirements
 * - 401 Unauthorized: Token expired or invalid, user needs to login
 */
export const apiPost = async (endpoint, body, token = null) => {
  try {
    // ============ STEP 1: BUILD REQUEST HEADERS ============
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // ============ STEP 2: CONSTRUCT FULL URL ============
    const url = `${API_URL}${endpoint}`;
    console.log(`[POST] ${url}`, body);

    // ============ STEP 3: MAKE POST REQUEST ============
    // Body must be JSON string (fetch handles this automatically)
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    // ============ STEP 4: CHECK RESPONSE STATUS ============
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `POST ${endpoint} failed: ${response.status} ${response.statusText} - ${errorData.message || ''}`
      );
    }

    // ============ STEP 5: PARSE AND RETURN RESPONSE ============
    const data = await response.json();
    console.log(`[POST SUCCESS] ${endpoint}:`, data);
    return data;

  } catch (error) {
    // ============ STEP 6: ERROR LOGGING ============
    console.error(`[POST ERROR] ${endpoint}:`, error.message);
    throw error;
  }
};

/**
 * Generic PUT Request
 * 
 * Sends data to backend to update existing resources (full replacement).
 * Use for updating courses, user profiles, settings.
 * 
 * @param {string} endpoint - API endpoint path (e.g., '/courses/123')
 * @param {Object} body - Updated resource data
 * @param {string} token - JWT authentication token (optional)
 * @returns {Promise<Object>} Updated resource from server
 * @throws {Error} With descriptive message if request fails
 * 
 * EXAMPLES:
 * const updated = await apiPut('/courses/123', 
 *   { courseName: 'Advanced Math', grade: 'A+', credits: 4 }, 
 *   userToken
 * );
 * 
 * ERROR HANDLING:
 * - 404 Not Found: Resource doesn't exist or was deleted
 * - 403 Forbidden: User doesn't have permission to update this resource
 * - 400 Bad Request: Invalid data fields
 */
export const apiPut = async (endpoint, body, token = null) => {
  try {
    // ============ STEP 1: BUILD REQUEST HEADERS ============
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // ============ STEP 2: CONSTRUCT FULL URL ============
    const url = `${API_URL}${endpoint}`;
    console.log(`[PUT] ${url}`, body);

    // ============ STEP 3: MAKE PUT REQUEST ============
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    // ============ STEP 4: CHECK RESPONSE STATUS ============
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `PUT ${endpoint} failed: ${response.status} ${response.statusText} - ${errorData.message || ''}`
      );
    }

    // ============ STEP 5: PARSE AND RETURN RESPONSE ============
    const data = await response.json();
    console.log(`[PUT SUCCESS] ${endpoint}:`, data);
    return data;

  } catch (error) {
    // ============ STEP 6: ERROR LOGGING ============
    console.error(`[PUT ERROR] ${endpoint}:`, error.message);
    throw error;
  }
};

/**
 * Generic DELETE Request
 * 
 * Sends request to backend to delete resources.
 * Use for deleting courses, accounts, etc.
 * 
 * @param {string} endpoint - API endpoint path (e.g., '/courses/123')
 * @param {string} token - JWT authentication token (optional)
 * @returns {Promise<Object>} Response from server (usually confirmation message)
 * @throws {Error} With descriptive message if request fails
 * 
 * EXAMPLES:
 * const result = await apiDelete('/courses/123', userToken);
 * 
 * ERROR HANDLING:
 * - 404 Not Found: Resource doesn't exist
 * - 403 Forbidden: User not authorized to delete
 * - 409 Conflict: Resource has dependencies (e.g., grade being used in calculation)
 */
export const apiDelete = async (endpoint, token = null) => {
  try {
    // ============ STEP 1: BUILD REQUEST HEADERS ============
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // ============ STEP 2: CONSTRUCT FULL URL ============
    const url = `${API_URL}${endpoint}`;
    console.log(`[DELETE] ${url}`);

    // ============ STEP 3: MAKE DELETE REQUEST ============
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    // ============ STEP 4: CHECK RESPONSE STATUS ============
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `DELETE ${endpoint} failed: ${response.status} ${response.statusText} - ${errorData.message || ''}`
      );
    }

    // ============ STEP 5: PARSE AND RETURN RESPONSE ============
    const data = await response.json();
    console.log(`[DELETE SUCCESS] ${endpoint}:`, data);
    return data;

  } catch (error) {
    // ============ STEP 6: ERROR LOGGING ============
    console.error(`[DELETE ERROR] ${endpoint}:`, error.message);
    throw error;
  }
};

/**
 * ============================================================================
 * COURSE-SPECIFIC FUNCTIONS
 * ============================================================================
 * These are convenience functions built on top of the generic HTTP methods.
 * They provide a cleaner API for common course operations.
 */

/**
 * Fetch all courses for the authenticated user
 * 
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Response with courses array in data.courses
 * @throws {Error} If request fails or user is not authenticated
 * 
 * USAGE:
 * const response = await getCourses(token);
 * const courses = response.data.courses;
 */
export const getCourses = async (token) => {
  return apiGet('/courses', token);
};

/**
 * Fetch a single course by ID
 * 
 * @param {string} courseId - The ID of the course to fetch
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Response with course in data.course
 * @throws {Error} If course not found or not authorized
 * 
 * USAGE:
 * const response = await getCourse('course-123', token);
 * const course = response.data.course;
 */
export const getCourse = async (courseId, token) => {
  return apiGet(`/courses/${courseId}`, token);
};

/**
 * Create a new course
 * 
 * @param {Object} courseData - Course information
 *   @param {string} courseData.courseName - Name of the course
 *   @param {string} courseData.grade - Letter grade (A, B, C, D, F)
 *   @param {number} courseData.credits - Credit hours (1-4)
 *   @param {string} [courseData.semesterId] - Optional semester ID
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Response with created course in data.course
 * @throws {Error} If validation fails or request fails
 * 
 * VALIDATION:
 * - courseName: Required, max 100 characters
 * - grade: Required, must be valid grade (A, B, C, D, F)
 * - credits: Required, must be between 1-4
 * 
 * USAGE:
 * const response = await createCourse({
 *   courseName: 'Mathematics 101',
 *   grade: 'A',
 *   credits: 3
 * }, token);
 */
export const createCourse = async (courseData, token) => {
  return apiPost('/courses', courseData, token);
};

/**
 * Update an existing course
 * 
 * @param {string} courseId - The ID of the course to update
 * @param {Object} courseData - Updated course information (same fields as createCourse)
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Response with updated course in data.course
 * @throws {Error} If course not found, not authorized, or validation fails
 * 
 * USAGE:
 * const response = await updateCourse('course-123', {
 *   courseName: 'Advanced Mathematics',
 *   grade: 'A+',
 *   credits: 4
 * }, token);
 */
export const updateCourse = async (courseId, courseData, token) => {
  return apiPut(`/courses/${courseId}`, courseData, token);
};

/**
 * Delete a course
 * 
 * @param {string} courseId - The ID of the course to delete
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Response with confirmation message
 * @throws {Error} If course not found or not authorized
 * 
 * NOTE:
 * - Deleting a course will recalculate semester GPA
 * - Action cannot be undone
 * 
 * USAGE:
 * const response = await deleteCourse('course-123', token);
 * console.log(response.message); // "Course deleted successfully"
 */
export const deleteCourse = async (courseId, token) => {
  return apiDelete(`/courses/${courseId}`, token);
};

/**
 * Get course statistics for the user
 * 
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Response with stats (totalCourses, avgGPA, gradeDistribution)
 * @throws {Error} If request fails
 * 
 * USAGE:
 * const response = await getCourseStats(token);
 * const stats = response.data;
 */
export const getCourseStats = async (token) => {
  return apiGet('/courses/stats/summary', token);
};

/**
 * ============================================================================
 * ERROR HANDLING BEST PRACTICES
 * ============================================================================
 * 
 * All functions throw errors that should be caught in your components:
 * 
 * try {
 *   const response = await getCourses(token);
 *   // Handle success
 * } catch (error) {
 *   // Handle specific errors:
 *   if (error.message.includes('401')) {
 *     // Token expired - redirect to login
 *   } else if (error.message.includes('404')) {
 *     // Resource not found
 *   } else {
 *     // Other errors
 *   }
 * }
 * 
 * ============================================================================
 */

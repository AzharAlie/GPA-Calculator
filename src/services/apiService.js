/**
 * API Service Module
 * 
 * Centralized API communication layer for the GPA Calculator application.
 * Handles all HTTP requests to the backend server.
 * 
 * Features:
 * - Reusable fetch functions
 * - Automatic token handling
 * - Error handling and logging
 * - Request/response formatting
 * - Base URL configuration from environment variables
 * 
 * Usage:
 * import { getCourses, createCourse, updateCourse, deleteCourse } from './services/apiService';
 * 
 * const courses = await getCourses(token);
 * const newCourse = await createCourse(courseData, token);
 */

/**
 * Base API URL from Vite environment variables
 * Set in .env file as VITE_API_URL=http://localhost:5000/api
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * ============ GENERIC FETCH FUNCTION ============
 * 
 * Core fetch wrapper that handles all HTTP requests
 * 
 * @param {string} endpoint - API endpoint (e.g., '/courses', '/courses/123')
 * @param {Object} options - Fetch options object
 *   - method: 'GET', 'POST', 'PUT', 'DELETE', 'PATCH'
 *   - headers: Custom headers object
 *   - body: Request body (automatically JSON stringified)
 *   - token: JWT token for Authorization header
 * @returns {Promise<Object>} Parsed JSON response from server
 * @throws {Error} With descriptive message and error details
 * 
 * Error Handling:
 * - Network errors are caught and re-thrown with context
 * - Non-2xx status codes are treated as errors
 * - Response parsing errors are logged
 * 
 * Example:
 * const response = await fetchAPI('/courses', {
 *   method: 'GET',
 *   token: userToken
 * });
 */
const fetchAPI = async (endpoint, options = {}) => {
  try {
    // ============ STEP 1: PREPARE REQUEST CONFIGURATION ============

    /**
     * Extract options with defaults
     * method defaults to GET if not specified
     * headers defaults to content-type application/json
     */
    const {
      method = 'GET',
      headers = {},
      body = null,
      token = null,
    } = options;

    // ============ STEP 2: SETUP REQUEST HEADERS ============

    /**
     * Build headers object with standard defaults
     * Authorization header is added if token provided
     * Content-Type is set to application/json for JSON requests
     */
    const requestHeaders = {
      'Content-Type': 'application/json',
      ...headers, // Allow custom headers to override defaults
    };

    // Add JWT token to Authorization header if provided
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }

    // ============ STEP 3: PREPARE REQUEST BODY ============

    /**
     * Only include body for non-GET requests
     * Body must be JSON stringified for transmission
     * Null body is omitted from request
     */
    const fetchConfig = {
      method,
      headers: requestHeaders,
    };

    if (body && method !== 'GET') {
      fetchConfig.body = JSON.stringify(body);
    }

    // ============ STEP 4: MAKE API CALL ============

    /**
     * Construct full URL using base URL + endpoint
     * Fetch is built-in browser API
     * Throws error on network failure (not on HTTP errors like 404, 500)
     */
    const fullURL = `${API_BASE_URL}${endpoint}`;
    
    console.log(`[API Request] ${method} ${fullURL}`);

    const response = await fetch(fullURL, fetchConfig);

    // ============ STEP 5: HANDLE HTTP ERROR RESPONSES ============

    /**
     * Fetch doesn't reject on HTTP error status codes
     * Must manually check response.ok or response.status
     * Throw error for non-2xx responses
     */
    if (!response.ok) {
      // Attempt to parse error details from response
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }

      // Create descriptive error message
      const errorMessage = errorData?.message || `HTTP ${response.status}: ${response.statusText}`;
      
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = errorData;
      
      console.error(`[API Error] ${method} ${fullURL}`, error);
      throw error;
    }

    // ============ STEP 6: PARSE RESPONSE ============

    /**
     * Parse JSON response from server
     * Most modern APIs return JSON even on 204 No Content
     * Check content-type header to be safe
     */
    const contentType = response.headers.get('content-type');
    const isJSON = contentType && contentType.includes('application/json');

    let data;
    if (isJSON) {
      data = await response.json();
    } else {
      // If not JSON, return empty object
      data = {};
    }

    console.log(`[API Response] ${method} ${fullURL}`, data);

    return data;

  } catch (error) {
    
    // ============ STEP 7: ERROR HANDLING & LOGGING ============

    /**
     * Re-throw errors with additional context
     * Log to console for debugging
     * Add error code for frontend error handling
     */
    console.error('[API Error]', {
      message: error.message,
      status: error.status,
      endpoint,
      method: options.method || 'GET',
    });

    throw error;
  }
};

/**
 * ============ COURSE ENDPOINTS ============
 * 
 * Specific API functions for course CRUD operations
 */

/**
 * Get all courses for authenticated user
 * 
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Response with courses array
 *   {
 *     "success": true,
 *     "count": 5,
 *     "data": [...]
 *   }
 * @throws {Error} If request fails or user not authenticated
 * 
 * Example:
 * const response = await getCourses(userToken);
 * const courses = response.data;
 */
export const getCourses = async (token) => {
  try {
    const response = await fetchAPI('/courses', {
      method: 'GET',
      token,
    });
    return response;
  } catch (error) {
    throw new Error(`Failed to fetch courses: ${error.message}`);
  }
};

/**
 * Get single course by ID
 * 
 * @param {string} courseId - MongoDB ObjectID of course
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Response with course data
 * @throws {Error} If course not found (404) or unauthorized (403)
 * 
 * Example:
 * const response = await getCourseById('507f1f77bcf86cd799439011', userToken);
 * const course = response.data;
 */
export const getCourseById = async (courseId, token) => {
  try {
    const response = await fetchAPI(`/courses/${courseId}`, {
      method: 'GET',
      token,
    });
    return response;
  } catch (error) {
    if (error.status === 404) {
      throw new Error('Course not found');
    }
    if (error.status === 403) {
      throw new Error('You are not authorized to access this course');
    }
    throw new Error(`Failed to fetch course: ${error.message}`);
  }
};

/**
 * Create new course for authenticated user
 * 
 * @param {Object} courseData - Course information
 *   {
 *     "name": "Calculus I",
 *     "credits": 4,
 *     "grade": "A",
 *     "semesterId": "507f1f77bcf86cd799439012"
 *   }
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Response with created course data
 * @throws {Error} If validation fails or server error
 * 
 * Example:
 * const newCourse = await createCourse({
 *   name: 'Physics I',
 *   credits: 4,
 *   grade: 'A',
 *   semesterId: '507f1f77bcf86cd799439012'
 * }, userToken);
 */
export const createCourse = async (courseData, token) => {
  try {
    // Validate required fields
    if (!courseData.name || !courseData.credits || !courseData.grade || !courseData.semesterId) {
      throw new Error('Missing required fields: name, credits, grade, semesterId');
    }

    const response = await fetchAPI('/courses', {
      method: 'POST',
      body: courseData,
      token,
    });
    return response;
  } catch (error) {
    if (error.status === 400) {
      const errorMsg = error.data?.errors
        ? Object.entries(error.data.errors)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')
        : 'Validation error';
      throw new Error(errorMsg);
    }
    throw new Error(`Failed to create course: ${error.message}`);
  }
};

/**
 * Update existing course
 * 
 * @param {string} courseId - MongoDB ObjectID of course to update
 * @param {Object} updates - Partial course data to update
 *   Can include any of: name, credits, grade
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Response with updated course data
 * @throws {Error} If course not found, unauthorized, or validation fails
 * 
 * Example:
 * const updated = await updateCourse(
 *   '507f1f77bcf86cd799439011',
 *   { grade: 'B' },
 *   userToken
 * );
 */
export const updateCourse = async (courseId, updates, token) => {
  try {
    if (!courseId) {
      throw new Error('Course ID is required');
    }

    const response = await fetchAPI(`/courses/${courseId}`, {
      method: 'PUT',
      body: updates,
      token,
    });
    return response;
  } catch (error) {
    if (error.status === 404) {
      throw new Error('Course not found');
    }
    if (error.status === 403) {
      throw new Error('You are not authorized to update this course');
    }
    if (error.status === 400) {
      throw new Error('Validation error: ' + error.data?.message);
    }
    throw new Error(`Failed to update course: ${error.message}`);
  }
};

/**
 * Delete course
 * 
 * @param {string} courseId - MongoDB ObjectID of course to delete
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Response confirming deletion
 * @throws {Error} If course not found or unauthorized
 * 
 * Example:
 * const result = await deleteCourse('507f1f77bcf86cd799439011', userToken);
 * // Returns: { success: true, message: "Course deleted successfully" }
 */
export const deleteCourse = async (courseId, token) => {
  try {
    if (!courseId) {
      throw new Error('Course ID is required');
    }

    const response = await fetchAPI(`/courses/${courseId}`, {
      method: 'DELETE',
      token,
    });
    return response;
  } catch (error) {
    if (error.status === 404) {
      throw new Error('Course not found');
    }
    if (error.status === 403) {
      throw new Error('You are not authorized to delete this course');
    }
    throw new Error(`Failed to delete course: ${error.message}`);
  }
};

/**
 * Get GPA statistics for authenticated user
 * 
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Response with GPA stats
 *   {
 *     "success": true,
 *     "data": {
 *       "gpa": 3.67,
 *       "cgpa": 3.67,
 *       "totalCourses": 5,
 *       "totalCredits": 18,
 *       "stats": {...}
 *     }
 *   }
 * @throws {Error} If request fails
 * 
 * Example:
 * const stats = await getGPAStats(userToken);
 * console.log(stats.data.gpa); // 3.67
 */
export const getGPAStats = async (token) => {
  try {
    const response = await fetchAPI('/courses/stats/summary', {
      method: 'GET',
      token,
    });
    return response;
  } catch (error) {
    throw new Error(`Failed to fetch GPA statistics: ${error.message}`);
  }
};

/**
 * ============ AUTHENTICATION ENDPOINTS ============
 */

/**
 * Register new user account
 * 
 * @param {Object} userData - User registration data
 *   {
 *     "name": "John Doe",
 *     "email": "john@example.com",
 *     "password": "SecurePass123",
 *     "passwordConfirm": "SecurePass123"
 *   }
 * @returns {Promise<Object>} Response with JWT token and user data
 *   {
 *     "success": true,
 *     "token": "eyJhbGc...",
 *     "user": { id, name, email, role }
 *   }
 * @throws {Error} If validation fails or email already registered
 * 
 * Example:
 * const result = await registerUser({
 *   name: 'Jane Smith',
 *   email: 'jane@example.com',
 *   password: 'SecurePass123',
 *   passwordConfirm: 'SecurePass123'
 * });
 */
export const registerUser = async (userData) => {
  try {
    if (!userData.name || !userData.email || !userData.password || !userData.passwordConfirm) {
      throw new Error('All fields are required');
    }

    const response = await fetchAPI('/auth/register', {
      method: 'POST',
      body: userData,
    });
    return response;
  } catch (error) {
    if (error.status === 409) {
      throw new Error('Email already registered. Please login or use a different email.');
    }
    if (error.status === 400) {
      throw new Error(error.data?.message || 'Registration validation failed');
    }
    throw new Error(`Registration failed: ${error.message}`);
  }
};

/**
 * Login user and get JWT token
 * 
 * @param {Object} credentials - Login credentials
 *   {
 *     "email": "john@example.com",
 *     "password": "SecurePass123"
 *   }
 * @returns {Promise<Object>} Response with JWT token and user data
 *   {
 *     "success": true,
 *     "token": "eyJhbGc...",
 *     "user": { id, name, email, role }
 *   }
 * @throws {Error} If credentials invalid or email not found
 * 
 * Example:
 * const result = await loginUser({
 *   email: 'john@example.com',
 *   password: 'SecurePass123'
 * });
 * const token = result.token;
 */
export const loginUser = async (credentials) => {
  try {
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }

    const response = await fetchAPI('/auth/login', {
      method: 'POST',
      body: credentials,
    });
    return response;
  } catch (error) {
    if (error.status === 401) {
      throw new Error('Invalid email or password');
    }
    if (error.status === 400) {
      throw new Error('Login validation failed');
    }
    throw new Error(`Login failed: ${error.message}`);
  }
};

/**
 * Get current authenticated user profile
 * 
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Response with user profile data
 *   {
 *     "success": true,
 *     "data": { id, name, email, role, createdAt }
 *   }
 * @throws {Error} If token invalid or user not found
 * 
 * Example:
 * const result = await getCurrentUser(userToken);
 * const user = result.data;
 */
export const getCurrentUser = async (token) => {
  try {
    const response = await fetchAPI('/auth/me', {
      method: 'GET',
      token,
    });
    return response;
  } catch (error) {
    if (error.status === 401) {
      throw new Error('Session expired. Please login again.');
    }
    if (error.status === 404) {
      throw new Error('User not found. Please login again.');
    }
    throw new Error(`Failed to fetch user profile: ${error.message}`);
  }
};

/**
 * ============ SEMESTER ENDPOINTS ============
 */

/**
 * Get all semesters for authenticated user
 * 
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Response with semesters array
 * @throws {Error} If request fails or user not authenticated
 * 
 * Example:
 * const response = await getSemesters(userToken);
 * const semesters = response.data;
 */
export const getSemesters = async (token) => {
  try {
    const response = await fetchAPI('/semesters', {
      method: 'GET',
      token,
    });
    return response;
  } catch (error) {
    throw new Error(`Failed to fetch semesters: ${error.message}`);
  }
};

/**
 * Create new semester
 * 
 * @param {Object} semesterData - Semester information
 *   {
 *     "semesterNumber": 1,
 *     "year": 2024,
 *     "semesterType": "Fall"
 *   }
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Response with created semester
 * @throws {Error} If validation fails
 */
export const createSemester = async (semesterData, token) => {
  try {
    const response = await fetchAPI('/semesters', {
      method: 'POST',
      body: semesterData,
      token,
    });
    return response;
  } catch (error) {
    throw new Error(`Failed to create semester: ${error.message}`);
  }
};

/**
 * Get CGPA analytics
 * 
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Response with CGPA and semester data
 * @throws {Error} If request fails
 */
export const getCGPAAnalytics = async (token) => {
  try {
    const response = await fetchAPI('/semesters/analytics/cgpa', {
      method: 'GET',
      token,
    });
    return response;
  } catch (error) {
    throw new Error(`Failed to fetch CGPA analytics: ${error.message}`);
  }
};

/**
 * Download full GPA report as PDF
 * 
 * @param {string} token - JWT authentication token
 * @returns {Promise<Blob>} PDF file blob
 * @throws {Error} If request fails
 * 
 * Example:
 * const pdfBlob = await downloadFullReport(userToken);
 * const url = window.URL.createObjectURL(pdfBlob);
 * const a = document.createElement('a');
 * a.href = url;
 * a.download = 'gpa-report.pdf';
 * a.click();
 */
export const downloadFullReport = async (token) => {
  try {
    const fullURL = `${API_BASE_URL}/reports/pdf/full-report`;
    
    const response = await fetch(fullURL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download report: HTTP ${response.status}`);
    }

    return await response.blob();
  } catch (error) {
    throw new Error(`Report download failed: ${error.message}`);
  }
};

export default {
  // Courses
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getGPAStats,
  
  // Auth
  registerUser,
  loginUser,
  getCurrentUser,
  
  // Semesters
  getSemesters,
  createSemester,
  getCGPAAnalytics,
  
  // Reports
  downloadFullReport,
};

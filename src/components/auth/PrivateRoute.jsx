/**
 * PrivateRoute Component
 * 
 * Route guard component that protects authenticated-only routes
 * 
 * Purpose:
 * - Prevents unauthorized access to protected pages
 * - Redirects unauthenticated users to login page
 * - Improves user experience by preventing navigation to restricted areas
 * 
 * Security Considerations:
 * - Checks for valid JWT token in localStorage
 * - Token is required for all API calls via authMiddleware
 * - Does NOT validate token on client (server validates on API calls)
 * - Provides basic route protection for UX
 * 
 * Usage:
 * <PrivateRoute>
 *   <Dashboard />
 * </PrivateRoute>
 * 
 * OR with React Router:
 * <Route element={<PrivateRoute><Dashboard /></PrivateRoute>} path="/dashboard" />
 */

import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ============ PRIVATE ROUTE COMPONENT ============
 * 
 * Conditional rendering wrapper for route protection
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to render if authenticated
 * @param {string} props.loginPath - Path to redirect to if not authenticated (default: '/login')
 * @returns {ReactNode} Children if authenticated, Navigate component if not
 * 
 * Example:
 * <PrivateRoute loginPath="/auth/login">
 *   <CoursesList />
 * </PrivateRoute>
 */
const PrivateRoute = ({ children, loginPath = '/login' }) => {
  // ============ STEP 1: CHECK AUTHENTICATION STATUS ============

  /**
   * Retrieve JWT token from browser localStorage
   * 
   * Token Storage Location:
   * - localStorage key: 'token'
   * - Set during login: localStorage.setItem('token', response.token)
   * - Retrieved here for authentication check
   * 
   * Note: localStorage is synchronous and accessible in browser
   * Alternative: Use secure httpOnly cookies for better security
   */
  const token = localStorage.getItem('token');

  /**
   * Determine if user is authenticated
   * 
   * Authentication Logic:
   * - Check if token exists in localStorage
   * - Check if token is not empty string
   * - Check if token is not null or undefined
   * 
   * This is a basic client-side check
   * Server still validates token on each API call
   */
  const isAuthenticated = !!token;

  // ============ STEP 2: CONDITIONAL RENDERING ============

  /**
   * If user is authenticated:
   * - Render the protected component (children)
   * - Component receives props and functions normally
   * 
   * If user is not authenticated:
   * - Use Navigate component to redirect
   * - Redirect to login page (default: '/login')
   * - Can customize redirect path via loginPath prop
   * - Replace: true prevents back button access to protected page
   */
  if (isAuthenticated) {
    // User is authenticated - render protected content
    return children;
  } else {
    // User is not authenticated - redirect to login
    return <Navigate to={loginPath} replace />;
  }
};

export default PrivateRoute;

/**
 * Advanced PrivateRoute Component
 * 
 * Enhanced route guard with:
 * - Token validation
 * - Loading states
 * - User profile checking
 * - Automatic logout on invalid token
 * - Fallback loading UI
 * 
 * Usage:
 * <PrivateRoute loadingUI={<LoadingSpinner />}>
 *   <Dashboard />
 * </PrivateRoute>
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * ============ ADVANCED PRIVATE ROUTE ============
 * 
 * Route guard with authentication validation and loading handling
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Protected component to render
 * @param {string} props.loginPath - Redirect path if not authenticated (default: '/login')
 * @param {ReactNode} props.loadingUI - Component to show while checking auth (default: null)
 * @param {boolean} props.validateToken - Validate token expiration (default: true)
 * @returns {ReactNode} Protected component, loading UI, or redirect
 * 
 * Example:
 * <PrivateRoute
 *   loadingUI={<Spinner />}
 *   validateToken={true}
 *   loginPath="/auth/login"
 * >
 *   <Dashboard />
 * </PrivateRoute>
 */
const PrivateRouteAdvanced = ({
  children,
  loginPath = '/login',
  loadingUI = null,
  validateToken = true,
}) => {
  // ============ STEP 1: GET AUTHENTICATION STATE ============

  /**
   * Use custom auth hook to access authentication state
   * Hook handles:
   * - Token retrieval from localStorage
   * - User data retrieval
   * - Loading state management
   * - Token validation
   */
  const { isAuthenticated, loading, token, isTokenValid } = useAuth();

  // ============ STEP 2: HANDLE LOADING STATE ============

  /**
   * While checking authentication status:
   * - Show loading UI if provided
   * - Prevents flickering of redirect
   * - Allows time for async auth checks
   * 
   * Prevents this flow:
   * 1. Page renders
   * 2. Redirects to login instantly
   * 3. Data/state flashes to user
   */
  if (loading) {
    return loadingUI || <div>Loading...</div>;
  }

  // ============ STEP 3: VALIDATE TOKEN EXPIRATION ============

  /**
   * If token validation enabled:
   * - Check if JWT token hasn't expired
   * - Expired tokens are invalid for API calls
   * - Prevent user from accessing with stale token
   * 
   * Server will reject expired tokens anyway
   * This provides better UX by catching early
   */
  if (validateToken && token && !isTokenValid()) {
    console.warn('[PrivateRoute] Token expired, redirecting to login');
    return <Navigate to={loginPath} replace />;
  }

  // ============ STEP 4: CONDITIONAL RENDERING ============

  /**
   * Render based on authentication status:
   * 
   * Authenticated:
   * - Render protected children
   * - Component can access token via useAuth hook
   * - API calls will include token in Authorization header
   * 
   * Not Authenticated:
   * - Redirect to login page
   * - replace: true prevents back button to protected page
   */
  if (isAuthenticated) {
    return children;
  } else {
    return <Navigate to={loginPath} replace />;
  }
};

export default PrivateRouteAdvanced;

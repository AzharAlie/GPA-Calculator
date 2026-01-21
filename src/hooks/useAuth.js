/**
 * Authentication Hook: useAuth
 * 
 * Custom React hook for managing authentication state and operations
 * 
 * Features:
 * - Check authentication status
 * - Get stored user data
 * - Login/logout operations
 * - Token management
 * - Automatic session cleanup
 * 
 * Usage:
 * const { isAuthenticated, user, login, logout } = useAuth();
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * ============ USE AUTH HOOK ============
 * 
 * Custom hook for authentication state management
 * 
 * @returns {Object} Authentication state and methods
 *   - isAuthenticated: boolean
 *   - user: object or null
 *   - loading: boolean
 *   - login: function
 *   - logout: function
 *   - token: string or null
 * 
 * Example:
 * const { isAuthenticated, user, login, logout } = useAuth();
 * 
 * if (isAuthenticated) {
 *   console.log('Logged in as:', user.name);
 * }
 */
export const useAuth = () => {
  // ============ STATE MANAGEMENT ============

  /**
   * Track authentication state
   * - isAuthenticated: boolean flag
   * - user: user profile object
   * - loading: while checking auth status
   * - token: JWT token string
   */
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // ============ INITIALIZE AUTHENTICATION ============

  /**
   * Check authentication status on component mount
   * Runs once when component using this hook mounts
   */
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Get token from localStorage
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken) {
          setToken(storedToken);
          setIsAuthenticated(true);

          // Restore user data if available
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // ============ LOGIN METHOD ============

  /**
   * Store authentication data after successful login
   * 
   * @param {string} newToken - JWT token from server
   * @param {Object} userData - User profile data
   */
  const login = useCallback((newToken, userData) => {
    try {
      // Store token in localStorage
      localStorage.setItem('token', newToken);

      // Store user data for quick access
      localStorage.setItem('user', JSON.stringify(userData));

      // Update state
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);

      console.log('[Auth] User logged in:', userData.email);
    } catch (error) {
      console.error('Error during login:', error);
      throw new Error('Failed to save authentication data');
    }
  }, []);

  // ============ LOGOUT METHOD ============

  /**
   * Clear authentication data on logout
   * 
   * Removes all user data from localStorage
   * Clears in-memory state
   * Allows login with different account
   */
  const logout = useCallback(() => {
    try {
      // Remove from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Clear state
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);

      console.log('[Auth] User logged out');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, []);

  // ============ CHECK TOKEN VALIDITY ============

  /**
   * Validate if current token is expired
   * Attempts JWT decode without verification
   * 
   * @returns {boolean} True if token is still valid
   */
  const isTokenValid = useCallback(() => {
    if (!token) return false;

    try {
      // Decode JWT (split by '.')
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      // Decode payload (middle part)
      const payload = JSON.parse(atob(parts[1]));

      // Check expiration time (exp is in seconds)
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();

      return expirationTime > currentTime;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }, [token]);

  // ============ REFRESH TOKEN METHOD ============

  /**
   * Refresh authentication if needed
   * Could call backend for new token
   * For now, just validates current token
   * 
   * @returns {boolean} True if token is valid
   */
  const refreshAuth = useCallback(() => {
    const isValid = isTokenValid();

    if (!isValid) {
      logout();
      return false;
    }

    return true;
  }, [isTokenValid, logout]);

  // ============ RETURN AUTH OBJECT ============

  /**
   * Return all auth state and methods
   * Makes this hook reusable across application
   */
  return {
    isAuthenticated,
    user,
    token,
    loading,
    login,
    logout,
    isTokenValid,
    refreshAuth,
  };
};

export default useAuth;

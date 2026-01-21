/**
 * React Router Setup Example
 * 
 * Shows how to configure routing with PrivateRoute protection
 * 
 * Features:
 * - Public routes (Login, Register, Home)
 * - Protected routes (Dashboard, Courses, Settings)
 * - Fallback for undefined routes
 * - Loading UI during auth check
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/auth/PrivateRoute';
import PrivateRouteAdvanced from './components/auth/PrivateRouteAdvanced';

/**
 * Page Components (placeholders)
 * In real app, import from separate component files
 */

// Public Pages
const HomePage = () => <div><h1>GPA Calculator</h1><p>Welcome!</p></div>;
const LoginPage = () => <div><h1>Login</h1><p>Login form here</p></div>;
const RegisterPage = () => <div><h1>Register</h1><p>Registration form here</p></div>;

// Protected Pages
const DashboardPage = () => <div><h1>Dashboard</h1><p>User dashboard</p></div>;
const CoursesPage = () => <div><h1>My Courses</h1><p>Courses list</p></div>;
const StatsPage = () => <div><h1>GPA Statistics</h1><p>Analytics charts</p></div>;
const SettingsPage = () => <div><h1>Settings</h1><p>User settings</p></div>;

// Error Pages
const NotFoundPage = () => <div><h1>404 - Page Not Found</h1></div>;

/**
 * Loading Component
 * Shows while checking authentication
 */
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '18px',
  }}>
    Loading...
  </div>
);

/**
 * ============ BASIC ROUTING SETUP ============
 * 
 * Using simple PrivateRoute
 */
const AppBasic = () => {
  return (
    <Router>
      <Routes>
        {/* ============ PUBLIC ROUTES ============ */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ============ PROTECTED ROUTES ============ */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <PrivateRoute>
              <CoursesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/stats"
          element={
            <PrivateRoute>
              <StatsPage />
            </PrivateRoute>
          }
        />

        {/* ============ 404 FALLBACK ============ */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

/**
 * ============ ADVANCED ROUTING SETUP ============
 * 
 * Using PrivateRouteAdvanced with loading UI and token validation
 */
const AppAdvanced = () => {
  return (
    <Router>
      <Routes>
        {/* ============ PUBLIC ROUTES ============ */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ============ PROTECTED ROUTES ============ */}
        {/* Dashboard - primary protected route */}
        <Route
          path="/dashboard"
          element={
            <PrivateRouteAdvanced
              loadingUI={<LoadingSpinner />}
              validateToken={true}
              loginPath="/login"
            >
              <DashboardPage />
            </PrivateRouteAdvanced>
          }
        />

        {/* Courses - with loading UI */}
        <Route
          path="/courses"
          element={
            <PrivateRouteAdvanced loadingUI={<LoadingSpinner />}>
              <CoursesPage />
            </PrivateRouteAdvanced>
          }
        />

        {/* Statistics - with token validation */}
        <Route
          path="/stats"
          element={
            <PrivateRouteAdvanced validateToken={true}>
              <StatsPage />
            </PrivateRouteAdvanced>
          }
        />

        {/* Settings - basic protection */}
        <Route
          path="/settings"
          element={
            <PrivateRouteAdvanced>
              <SettingsPage />
            </PrivateRouteAdvanced>
          }
        />

        {/* ============ 404 FALLBACK ============ */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

/**
 * ============ EXPORT BOTH VERSIONS ============
 * 
 * Choose which routing setup to use based on needs:
 * - AppBasic: Simple token check only
 * - AppAdvanced: Token validation + loading states
 */
export { AppBasic, AppAdvanced };

// Use in main.jsx:
// import { AppAdvanced } from './AppRouter';
// ReactDOM.render(<AppAdvanced />, document.getElementById('root'));

export default AppAdvanced;

/**
 * Authentication Usage Guide
 * 
 * Complete examples of how to use authentication components and hooks
 * in your React application.
 */

/**
 * ============ 1. LOGIN COMPONENT EXAMPLE ============
 * 
 * Shows how to login user and set authentication token
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { loginUser } from '../services/apiService';

const LoginComponent = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth(); // Get login method from hook

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call API to login
      const response = await loginUser({ email, password });

      if (response.success) {
        // Store authentication data using hook
        // This updates localStorage and auth state
        login(response.token, response.user);

        // Redirect to dashboard after successful login
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

/**
 * ============ 2. USER PROFILE DISPLAY ============
 * 
 * Shows how to use auth context to display user information
 */

const UserProfile = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <p>Please login to view profile</p>;
  }

  return (
    <div>
      <h2>User Profile</h2>
      <p>Name: {user?.name}</p>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
    </div>
  );
};

/**
 * ============ 3. LOGOUT COMPONENT ============
 * 
 * Shows how to logout and clear authentication
 */

const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear auth state and localStorage
    logout();

    // Redirect to login page
    navigate('/login');
  };

  return (
    <button onClick={handleLogout} style={{ backgroundColor: 'red', color: 'white' }}>
      Logout
    </button>
  );
};

/**
 * ============ 4. PROTECTED PAGE COMPONENT ============
 * 
 * Component that requires authentication
 * Will automatically redirect if not logged in
 */

import PrivateRouteAdvanced from '../components/auth/PrivateRouteAdvanced';

const Dashboard = () => {
  const { user, token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // useEffect to fetch data on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // API call with token
        const response = await getCourses(token);
        setCourses(response.data);
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchCourses();
    }
  }, [token]);

  return (
    <PrivateRouteAdvanced loadingUI={<div>Loading...</div>}>
      <div>
        <h1>Welcome, {user?.name}!</h1>
        <p>You have {courses.length} courses</p>
        
        {loading ? (
          <p>Loading courses...</p>
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
    </PrivateRouteAdvanced>
  );
};

/**
 * ============ 5. NAVBAR WITH CONDITIONAL RENDERING ============
 * 
 * Shows how to conditionally render nav items based on auth status
 */

const Navbar = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <nav style={{ padding: '10px', backgroundColor: '#333', color: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>GPA Calculator</h2>

        <div>
          {isAuthenticated ? (
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <span>Hello, {user?.name}</span>
              <a href="/dashboard">Dashboard</a>
              <a href="/courses">Courses</a>
              <a href="/stats">Stats</a>
              <a href="/settings">Settings</a>
              <LogoutButton />
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '20px' }}>
              <a href="/login">Login</a>
              <a href="/register">Register</a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

/**
 * ============ 6. AUTH STATE CHECK GUARD ============
 * 
 * Component that shows content only if authenticated
 */

const AuthGuard = ({ children, fallback = <p>Please login first</p> }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return isAuthenticated ? children : fallback;
};

/**
 * Example usage:
 * <AuthGuard fallback={<p>You must login to see this</p>}>
 *   <SecretContent />
 * </AuthGuard>
 */

/**
 * ============ 7. COMPLETE APP STRUCTURE ============
 * 
 * Shows how all pieces fit together
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';

const CompleteApp = () => {
  return (
    <BrowserRouter>
      <div>
        <Navbar />

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginComponent />} />
          <Route path="/register" element={<RegisterComponent />} />
          <Route path="/" element={<HomePage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRouteAdvanced loadingUI={<div>Loading...</div>}>
                <Dashboard />
              </PrivateRouteAdvanced>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

/**
 * ============ 8. KEY CONCEPTS ============
 * 
 * Authentication Flow:
 * 1. User navigates to /login
 * 2. User enters credentials
 * 3. LoginComponent calls loginUser() API
 * 4. API returns token and user data
 * 5. login() hook method stores in localStorage
 * 6. User is redirected to /dashboard
 * 7. PrivateRoute checks token exists
 * 8. Protected component renders
 * 9. API calls include token in header
 * 10. User can logout to clear auth
 * 
 * Token Storage:
 * - localStorage.token = JWT token
 * - localStorage.user = User profile JSON
 * 
 * Token Usage:
 * - Retrieved by useAuth hook
 * - Passed to API functions
 * - Included in Authorization header
 * - Validated on backend
 * 
 * Security Notes:
 * - Token is stored in localStorage (XSS vulnerable)
 * - Better: Use httpOnly cookies
 * - Server validates all tokens
 * - Client-side check is for UX only
 * - Expired tokens are handled by server
 */

export {
  LoginComponent,
  LogoutButton,
  UserProfile,
  Dashboard,
  Navbar,
  AuthGuard,
  CompleteApp,
};

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

// Public pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPassword from './pages/auth/ForgotPassword';

// Employer pages
import EmployerLayout from './pages/employer/EmployerLayout';
import EmployerDashboard from './pages/employer/EmployerDashboard';
import CompanyProfile from './pages/employer/CompanyProfile';
import PostJob from './pages/employer/PostJob';
import TalentSearch from './pages/employer/TalentSearch';
import Applications from './pages/employer/Applications';
import Messages from './pages/shared/Messages';

// Talent pages
import TalentLayout from './pages/talent/TalentLayout';
import TalentDashboard from './pages/talent/TalentDashboard';
import TalentProfile from './pages/talent/TalentProfile';
import JobBoard from './pages/talent/JobBoard';
import MyApplications from './pages/talent/MyApplications';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3500,
            style: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '14px',
              background: '#000',
              color: '#fff',
              borderRadius: '999px',
              padding: '12px 20px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            },
            success: { iconTheme: { primary: '#fff', secondary: '#000' } },
            error:   { iconTheme: { primary: '#fff', secondary: '#000' } },
          }}
        />

        <Routes>
          {/* ── Public ── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* ── Employer ── */}
          <Route
            path="/employer"
            element={
              <ProtectedRoute requiredRole="employer">
                <EmployerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<EmployerDashboard />} />
            <Route path="profile" element={<CompanyProfile />} />
            <Route path="post-job" element={<PostJob />} />
            <Route path="post-job/:id" element={<PostJob />} />
            <Route path="talent-search" element={<TalentSearch />} />
            <Route path="applications" element={<Applications />} />
            <Route path="messages" element={<Messages role="employer" />} />
          </Route>

          {/* ── Talent ── */}
          <Route
            path="/talent"
            element={
              <ProtectedRoute requiredRole="talent">
                <TalentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TalentDashboard />} />
            <Route path="profile" element={<TalentProfile />} />
            <Route path="jobs" element={<JobBoard />} />
            <Route path="applications" element={<MyApplications />} />
            <Route path="messages" element={<Messages role="talent" />} />
          </Route>

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

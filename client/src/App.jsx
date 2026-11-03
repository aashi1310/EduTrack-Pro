import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout, ProtectedRoute, RoleGuard } from './components/layout/AppLayout';
import { LoadingSpinner } from './components/common/EmptyState';

// ─── Eagerly loaded pages ────────────────────────────────────────────────────
import { LoginPage } from './pages/auth/LoginPage';

// ─── Lazy-loaded pages ───────────────────────────────────────────────────────
const AdminDashboard             = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const FacultyDashboard           = lazy(() => import('./pages/faculty/FacultyDashboard').then(m => ({ default: m.FacultyDashboard })));
const StudentDashboard           = lazy(() => import('./pages/student/StudentDashboard').then(m => ({ default: m.StudentDashboard })));

const StudentManagementPage      = lazy(() => import('./pages/students/StudentManagementPage').then(m => ({ default: m.StudentManagementPage })));
const FacultyManagementPage      = lazy(() => import('./pages/faculty/FacultyManagementPage').then(m => ({ default: m.FacultyManagementPage })));
const DepartmentManagementPage   = lazy(() => import('./pages/departments/DepartmentManagementPage').then(m => ({ default: m.DepartmentManagementPage })));
const CourseManagementPage       = lazy(() => import('./pages/courses/CourseManagementPage').then(m => ({ default: m.CourseManagementPage })));
const AcademicTermPage           = lazy(() => import('./pages/terms/AcademicTermPage').then(m => ({ default: m.AcademicTermPage })));
const EnrollmentManagementPage   = lazy(() => import('./pages/enrollments/EnrollmentManagementPage').then(m => ({ default: m.EnrollmentManagementPage })));
const AttendanceManagementPage   = lazy(() => import('./pages/attendance/AttendanceManagementPage').then(m => ({ default: m.AttendanceManagementPage })));
const ExaminationManagementPage  = lazy(() => import('./pages/examinations/ExaminationManagementPage').then(m => ({ default: m.ExaminationManagementPage })));
const ResultsManagementPage      = lazy(() => import('./pages/results/ResultsManagementPage').then(m => ({ default: m.ResultsManagementPage })));
const MarksEntryPage             = lazy(() => import('./pages/results/MarksEntryPage').then(m => ({ default: m.MarksEntryPage })));
const AcademicAnalyticsPage      = lazy(() => import('./pages/analytics/AcademicAnalyticsPage').then(m => ({ default: m.AcademicAnalyticsPage })));
const NotificationListPage       = lazy(() => import('./pages/notifications/NotificationListPage').then(m => ({ default: m.NotificationListPage })));
const AuditLogPage               = lazy(() => import('./pages/audit/AuditLogPage').then(m => ({ default: m.AuditLogPage })));
const UserProfilePage            = lazy(() => import('./pages/profile/UserProfilePage').then(m => ({ default: m.UserProfilePage })));
const SettingsPage               = lazy(() => import('./pages/profile/SettingsPage').then(m => ({ default: m.SettingsPage })));

// ─── 404 / Unauthorized ──────────────────────────────────────────────────────
function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9]">
      <div className="text-center">
        <div className="text-[80px] font-extrabold text-[#E2E8F0] leading-none">404</div>
        <h2 className="text-[24px] font-bold text-[#0F172A] mt-4">Page Not Found</h2>
        <p className="text-[14px] text-[#64748B] mt-2 mb-6">
          The route you are looking for does not exist.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg text-[13px] font-semibold transition-colors"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
}

function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9]">
      <div className="text-center">
        <div className="text-[80px] font-extrabold text-[#E2E8F0] leading-none">403</div>
        <h2 className="text-[24px] font-bold text-[#0F172A] mt-4">Access Denied</h2>
        <p className="text-[14px] text-[#64748B] mt-2 mb-6">
          You are not authorized to view this page.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg text-[13px] font-semibold transition-colors"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}

// ─── Role-aware redirect from root ───────────────────────────────────────────
function RoleRedirect() {
  // Peek at stored user to decide where to send unauthenticated root visitors
  try {
    const stored = localStorage.getItem('edutrack_user');
    if (stored) {
      const u = JSON.parse(stored);
      if (u?.role === 'ADMIN')   return <Navigate to="/admin/dashboard" replace />;
      if (u?.role === 'FACULTY') return <Navigate to="/faculty/dashboard" replace />;
      if (u?.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
    }
  } catch { /* ignore */ }
  return <Navigate to="/login" replace />;
}

// ─── Page-level suspense wrapper ─────────────────────────────────────────────
function PageFallback() {
  return <LoadingSpinner text="Loading page..." fullHeight />;
}

// ─── App root ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* ── Public routes ─────────────────────────────── */}
            <Route path="/login"        element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* ── Root redirect ─────────────────────────────── */}
            <Route path="/" element={<RoleRedirect />} />

            {/* ── Protected + shared layout ─────────────────── */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* ── ADMIN routes ────────────────────────────── */}
              <Route path="/admin/dashboard" element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <Suspense fallback={<PageFallback />}><AdminDashboard /></Suspense>
                </RoleGuard>
              } />
              <Route path="/admin/students" element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <Suspense fallback={<PageFallback />}><StudentManagementPage /></Suspense>
                </RoleGuard>
              } />
              <Route path="/admin/faculty" element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <Suspense fallback={<PageFallback />}><FacultyManagementPage /></Suspense>
                </RoleGuard>
              } />
              <Route path="/admin/departments" element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <Suspense fallback={<PageFallback />}><DepartmentManagementPage /></Suspense>
                </RoleGuard>
              } />
              <Route path="/admin/courses" element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <Suspense fallback={<PageFallback />}><CourseManagementPage /></Suspense>
                </RoleGuard>
              } />
              <Route path="/admin/terms" element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <Suspense fallback={<PageFallback />}><AcademicTermPage /></Suspense>
                </RoleGuard>
              } />
              <Route path="/admin/enrollments" element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <Suspense fallback={<PageFallback />}><EnrollmentManagementPage /></Suspense>
                </RoleGuard>
              } />
              <Route path="/admin/attendance" element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <Suspense fallback={<PageFallback />}><AttendanceManagementPage /></Suspense>
                </RoleGuard>
              } />
              <Route path="/admin/examinations" element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <Suspense fallback={<PageFallback />}><ExaminationManagementPage /></Suspense>
                </RoleGuard>
              } />
              <Route path="/admin/results" element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <Suspense fallback={<PageFallback />}><ResultsManagementPage /></Suspense>
                </RoleGuard>
              } />
              <Route path="/admin/analytics" element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <Suspense fallback={<PageFallback />}><AcademicAnalyticsPage /></Suspense>
                </RoleGuard>
              } />
              <Route path="/admin/audit-logs" element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <Suspense fallback={<PageFallback />}><AuditLogPage /></Suspense>
                </RoleGuard>
              } />

              {/* ── FACULTY routes ──────────────────────────── */}
              <Route path="/faculty/dashboard" element={
                <RoleGuard allowedRoles={['FACULTY']}>
                  <Suspense fallback={<PageFallback />}><FacultyDashboard /></Suspense>
                </RoleGuard>
              } />
              <Route path="/faculty/courses" element={
                <RoleGuard allowedRoles={['FACULTY', 'ADMIN']}>
                  <Suspense fallback={<PageFallback />}><CourseManagementPage /></Suspense>
                </RoleGuard>
              } />
              <Route path="/faculty/students" element={
                <RoleGuard allowedRoles={['FACULTY', 'ADMIN']}>
                  <Suspense fallback={<PageFallback />}><StudentManagementPage /></Suspense>
                </RoleGuard>
              } />
              <Route path="/faculty/attendance" element={
                <RoleGuard allowedRoles={['FACULTY', 'ADMIN']}>
                  <Suspense fallback={<PageFallback />}><AttendanceManagementPage /></Suspense>
                </RoleGuard>
              } />
              <Route path="/faculty/examinations" element={
                <RoleGuard allowedRoles={['FACULTY', 'ADMIN']}>
                  <Suspense fallback={<PageFallback />}><ExaminationManagementPage /></Suspense>
                </RoleGuard>
              } />
              <Route path="/faculty/marks-entry" element={
                <RoleGuard allowedRoles={['FACULTY', 'ADMIN']}>
                  <Suspense fallback={<PageFallback />}><MarksEntryPage /></Suspense>
                </RoleGuard>
              } />
              <Route path="/faculty/results" element={
                <RoleGuard allowedRoles={['FACULTY', 'ADMIN']}>
                  <Suspense fallback={<PageFallback />}><ResultsManagementPage /></Suspense>
                </RoleGuard>
              } />
              <Route path="/faculty/analytics" element={
                <RoleGuard allowedRoles={['FACULTY', 'ADMIN']}>
                  <Suspense fallback={<PageFallback />}><AcademicAnalyticsPage /></Suspense>
                </RoleGuard>
              } />

              {/* ── STUDENT routes ──────────────────────────── */}
              <Route path="/student/dashboard" element={
                <RoleGuard allowedRoles={['STUDENT']}>
                  <Suspense fallback={<PageFallback />}><StudentDashboard /></Suspense>
                </RoleGuard>
              } />
              <Route path="/student/profile" element={
                <RoleGuard allowedRoles={['STUDENT']}>
                  <Suspense fallback={<PageFallback />}><UserProfilePage /></Suspense>
                </RoleGuard>
              } />
              <Route path="/student/courses" element={
                <RoleGuard allowedRoles={['STUDENT']}>
                  <Suspense fallback={<PageFallback />}><CourseManagementPage /></Suspense>
                </RoleGuard>
              } />
              <Route path="/student/attendance" element={
                <RoleGuard allowedRoles={['STUDENT']}>
                  <Suspense fallback={<PageFallback />}><AttendanceManagementPage /></Suspense>
                </RoleGuard>
              } />
              <Route path="/student/examinations" element={
                <RoleGuard allowedRoles={['STUDENT']}>
                  <Suspense fallback={<PageFallback />}><ExaminationManagementPage /></Suspense>
                </RoleGuard>
              } />
              <Route path="/student/results" element={
                <RoleGuard allowedRoles={['STUDENT']}>
                  <Suspense fallback={<PageFallback />}><ResultsManagementPage /></Suspense>
                </RoleGuard>
              } />
              <Route path="/student/analytics" element={
                <RoleGuard allowedRoles={['STUDENT']}>
                  <Suspense fallback={<PageFallback />}><AcademicAnalyticsPage /></Suspense>
                </RoleGuard>
              } />
              <Route path="/student/settings" element={
                <RoleGuard allowedRoles={['STUDENT']}>
                  <Suspense fallback={<PageFallback />}><SettingsPage /></Suspense>
                </RoleGuard>
              } />

              {/* ── Shared routes (all authenticated roles) ─── */}
              <Route path="/notifications" element={
                <Suspense fallback={<PageFallback />}><NotificationListPage /></Suspense>
              } />
              <Route path="/profile" element={
                <Suspense fallback={<PageFallback />}><UserProfilePage /></Suspense>
              } />
              <Route path="/settings" element={
                <Suspense fallback={<PageFallback />}><SettingsPage /></Suspense>
              } />
            </Route>

            {/* ── Catch-all 404 ──────────────────────────────── */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}


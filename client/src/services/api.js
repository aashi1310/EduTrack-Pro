import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization token to outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('edutrack_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response error handler
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('edutrack_token');
      localStorage.removeItem('edutrack_user');
      window.location.href = '/login?session_expired=true';
    }
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// =============================================================================
// API SERVICE MODULES
// =============================================================================

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export const dashboardService = {
  getAdminDashboard: (params) => api.get('/dashboard/admin', { params }),
  getFacultyDashboard: () => api.get('/dashboard/faculty'),
  getStudentDashboard: () => api.get('/dashboard/student'),
};

export const studentService = {
  getStudents: (params) => api.get('/students', { params }),
  getStudentById: (id) => api.get(`/students/${id}`),
  createStudent: (data) => api.post('/students', data),
  updateStudent: (id, data) => api.patch(`/students/${id}`, data),
  updateStudentStatus: (id, status) => api.patch(`/students/${id}/status`, { status }),
  exportCsv: () => '/api/students/export/csv',
};

export const facultyService = {
  getFacultyList: (params) => api.get('/faculty', { params }),
  getFacultyById: (id) => api.get(`/faculty/${id}`),
  createFaculty: (data) => api.post('/faculty', data),
  updateFaculty: (id, data) => api.patch(`/faculty/${id}`, data),
};

export const deptService = {
  getDepartments: () => api.get('/departments'),
  createDepartment: (data) => api.post('/departments', data),
  updateDepartment: (id, data) => api.patch(`/departments/${id}`, data),
  deleteDepartment: (id) => api.delete(`/departments/${id}`),
};

export const courseService = {
  getCourses: (params) => api.get('/courses', { params }),
  createCourse: (data) => api.post('/courses', data),
  updateCourse: (id, data) => api.patch(`/courses/${id}`, data),
  getOfferings: (params) => api.get('/courses/offerings', { params }),
  createOffering: (data) => api.post('/courses/offerings', data),
  updateOffering: (id, data) => api.patch(`/courses/offerings/${id}`, data),
};

export const termService = {
  getTerms: () => api.get('/terms'),
  createTerm: (data) => api.post('/terms', data),
  updateTerm: (id, data) => api.patch(`/terms/${id}`, data),
};

export const enrollmentService = {
  getEnrollments: (params) => api.get('/enrollments', { params }),
  enrollStudent: (data) => api.post('/enrollments', data),
  updateEnrollmentStatus: (id, status) => api.patch(`/enrollments/${id}/status`, { status }),
};

export const attendanceService = {
  getSessions: (offeringId) => api.get('/attendance/sessions', { params: { offeringId } }),
  createSession: (data) => api.post('/attendance/sessions', data),
  getSessionAttendance: (sessionId) => api.get(`/attendance/sessions/${sessionId}/records`),
  recordAttendance: (sessionId, records) => api.post(`/attendance/sessions/${sessionId}/records`, { records }),
  getAttendanceSummary: (params) => api.get('/attendance/summary', { params }),
};

export const examService = {
  getExams: (params) => api.get('/exams', { params }),
  createExam: (data) => api.post('/exams', data),
  updateExam: (id, data) => api.patch(`/exams/${id}`, data),
  publishExam: (id) => api.post(`/exams/${id}/publish`),
  deleteExam: (id) => api.delete(`/exams/${id}`),
};

export const resultService = {
  getResults: (params) => api.get('/results', { params }),
  getExamMarksheet: (examId) => api.get(`/results/exam/${examId}`),
  saveMarks: (examId, entries) => api.post('/results', { examId, entries }),
  updateSingleResult: (id, data) => api.patch(`/results/${id}`, data),
  getStudentResults: (studentId, termId) => api.get(`/results/student/${studentId}`, { params: { termId } }),
};

export const analyticsService = {
  getOverview: () => api.get('/analytics/overview'),
  getDepartments: () => api.get('/analytics/departments'),
  getAttendance: () => api.get('/analytics/attendance'),
  getPerformance: () => api.get('/analytics/performance'),
  getRankings: () => api.get('/analytics/rankings'),
};

export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

export const auditService = {
  getAuditLogs: (params) => api.get('/audit-logs', { params }),
};

export const profileService = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.patch('/profile', data),
  changePassword: (data) => api.patch('/profile/password', data),
};

export default api;

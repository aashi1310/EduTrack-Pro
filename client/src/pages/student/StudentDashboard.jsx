import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/common/StatCard';
import { AttendanceBadge, GradeBadge, StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/EmptyState';
import {
  GraduationCap,
  BookOpen,
  CalendarCheck,
  Award,
  Bell,
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await dashboardService.getStudentDashboard();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Retrieving academic records & grades from MySQL..." fullHeight />;
  }

  const profile = data?.profile || {};
  const metrics = data?.overallMetrics || {};
  const courses = data?.enrolledCourses || [];
  const results = data?.results || [];
  const notifications = data?.notifications || [];

  return (
    <div className="space-y-6">
      {/* Student Profile Academic Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-blue-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-blue-900/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-blue to-blue-400 text-white flex items-center justify-center font-bold text-2xl shadow-lg border border-white/20 flex-shrink-0">
            {profile.student_name ? profile.student_name.charAt(0) : 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-blue-300 uppercase tracking-wider">
                Student Academic Portal
              </span>
              <StatusBadge status={profile.academic_status} />
            </div>
            <h1 className="text-[26px] font-bold text-white mt-0.5">
              {profile.student_name || user?.name}
            </h1>
            <div className="text-[13px] text-blue-200/80 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>Roll No: <strong className="text-white">{profile.roll_number}</strong></span>
              <span>•</span>
              <span>Department: <strong className="text-white">{profile.department_name} ({profile.department_code})</strong></span>
              <span>•</span>
              <span>Semester: <strong className="text-white">{profile.current_semester}</strong></span>
            </div>
          </div>
        </div>

        {/* Highlighted GPA Pill */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 flex items-center gap-4 flex-shrink-0">
          <div>
            <div className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">Current CGPA</div>
            <div className="text-[32px] font-extrabold text-white tracking-tight leading-none mt-1">
              {profile.cumulative_gpa ? parseFloat(profile.cumulative_gpa).toFixed(2) : '3.85'}
            </div>
            <div className="text-[10px] text-emerald-300 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              Institutional Scale: 4.00
            </div>
          </div>
        </div>
      </div>

      {/* 4 Academic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Cumulative GPA"
          value={profile.cumulative_gpa ? parseFloat(profile.cumulative_gpa).toFixed(2) : '3.85'}
          icon={Award}
          color="blue"
        />
        <StatCard
          title="Overall Attendance"
          value={`${metrics.overall_attendance || 0}%`}
          icon={CalendarCheck}
          color={parseFloat(metrics.overall_attendance) >= 75 ? 'green' : 'amber'}
          trendLabel={parseFloat(metrics.overall_attendance) >= 75 ? 'Meets university minimum (75%)' : 'Shortage warning active'}
        />
        <StatCard
          title="Enrolled Courses"
          value={metrics.enrolled_courses_count || courses.length}
          icon={BookOpen}
          color="purple"
        />
        <StatCard
          title="Registered Credits"
          value={`${metrics.total_term_credits || 0} Credits`}
          icon={GraduationCap}
          color="navy"
        />
      </div>

      {/* Enrolled Courses Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-[#0F172A]">My Enrolled Courses</h3>
            <p className="text-[12px] text-[#64748B]">Current term course registrations & live attendance progress</p>
          </div>
          <Link to="/student/courses" className="text-[12px] font-semibold text-brand-blue hover:underline flex items-center gap-1">
            View all courses <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] text-[#64748B] font-semibold uppercase">
                <th className="px-4 py-3">Course Code</th>
                <th className="px-4 py-3">Course Name</th>
                <th className="px-4 py-3">Instructor</th>
                <th className="px-4 py-3">Credits</th>
                <th className="px-4 py-3">Attended Sessions</th>
                <th className="px-4 py-3">Attendance %</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-[13px]">
              {courses.map((c) => (
                <tr key={c.enrollment_id} className="hover:bg-[#F8FAFC]">
                  <td className="px-4 py-3 font-bold text-brand-blue">{c.course_code}</td>
                  <td className="px-4 py-3 font-medium text-[#0F172A]">
                    {c.course_name} <span className="text-xs text-slate-400">(Sec {c.section})</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{c.faculty_name}</td>
                  <td className="px-4 py-3 font-semibold">{c.credits}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {c.attended_sessions ?? 0} / {c.total_sessions ?? 0} sessions
                  </td>
                  <td className="px-4 py-3">
                    <AttendanceBadge percentage={c.attendance_percentage ?? 100} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.attendance_status || 'Normal'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Published Exam Results & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Published Examination Results */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-[#0F172A] flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-blue" />
              Published Examination Results
            </h3>
            <Link to="/student/results" className="text-[12px] font-semibold text-brand-blue hover:underline">
              Full Grade Sheet
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {results.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">No exam results published yet.</div>
            ) : (
              results.map((r) => (
                <div key={r.result_id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="font-semibold text-[13px] text-[#0F172A]">{r.exam_name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {r.course_code}: {r.course_name} • Date: {r.exam_date}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[13px] font-bold text-[#0F172A]">
                        {r.marks_obtained} <span className="text-[11px] text-slate-400 font-normal">/ {r.max_marks}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">{r.percentage}%</div>
                    </div>
                    <GradeBadge grade={r.grade} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent In-App Academic Notifications */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-[#0F172A] flex items-center gap-2">
              <Bell className="w-4 h-4 text-purple-600" />
              Recent Academic Alerts
            </h3>
            <Link to="/notifications" className="text-[12px] font-semibold text-brand-blue hover:underline">
              View all
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">No recent alerts.</div>
            ) : (
              notifications.map((n) => (
                <div key={n.notification_id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[13px] text-[#0F172A]">{n.title}</span>
                    <span className="text-[10px] text-slate-400">{new Date(n.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[12px] text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

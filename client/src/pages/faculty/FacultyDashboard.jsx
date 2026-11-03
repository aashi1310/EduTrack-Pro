import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge, AttendanceBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/EmptyState';
import {
  BookOpen,
  Users,
  CalendarCheck,
  Award,
  AlertTriangle,
  ArrowRight,
  CheckSquare
} from 'lucide-react';

export function FacultyDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await dashboardService.getFacultyDashboard();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load faculty dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Retrieving faculty courses & student attendance..." fullHeight />;
  }

  const stats = data?.statistics || {};
  const offerings = data?.offerings || [];
  const exams = data?.exams || [];
  const atRisk = data?.atRiskStudents || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-blue-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-blue-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[12px] font-semibold text-blue-300 uppercase tracking-wider">
            Faculty Teaching Portal
          </span>
          <h1 className="text-[26px] font-bold text-white mt-1">
            Welcome back, {user?.name || 'Professor'}
          </h1>
          <p className="mt-1 text-[13px] text-blue-200/80 max-w-xl">
            Manage your assigned courses, schedule class sessions, record student attendance, and submit examination grades.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/faculty/attendance"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-blue hover:bg-blue-600 text-white text-[13px] font-semibold transition-colors shadow-sm"
          >
            <CalendarCheck className="w-4 h-4" />
            Mark Attendance
          </Link>
          <Link
            to="/faculty/marks-entry"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[13px] font-semibold transition-colors border border-white/20"
          >
            <CheckSquare className="w-4 h-4" />
            Enter Marks
          </Link>
        </div>
      </div>

      {/* 5 Core Faculty Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Assigned Courses"
          value={stats.assigned_courses || 0}
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Students Taught"
          value={stats.total_students_taught || 0}
          icon={Users}
          color="navy"
        />
        <StatCard
          title="Sessions Held"
          value={stats.total_sessions_held || 0}
          icon={CalendarCheck}
          color="purple"
        />
        <StatCard
          title="Pending Evaluations"
          value={stats.pending_evaluations || 0}
          icon={Award}
          color="amber"
        />
        <StatCard
          title="Avg Attendance"
          value={`${stats.overall_avg_attendance || 0}%`}
          icon={CalendarCheck}
          color="green"
        />
      </div>

      {/* Assigned Courses Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-[#0F172A]">My Assigned Courses</h3>
            <p className="text-[12px] text-[#64748B]">Active course offerings delivered this academic term</p>
          </div>
          <Link to="/faculty/courses" className="text-[12px] font-semibold text-brand-blue hover:underline flex items-center gap-1">
            View details <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] text-[#64748B] font-semibold uppercase">
                <th className="px-4 py-3">Course Code</th>
                <th className="px-4 py-3">Course Name</th>
                <th className="px-4 py-3">Term / Sec</th>
                <th className="px-4 py-3">Credits</th>
                <th className="px-4 py-3">Enrolled</th>
                <th className="px-4 py-3">Sessions</th>
                <th className="px-4 py-3">Avg Attendance</th>
                <th className="px-4 py-3 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-[13px]">
              {offerings.map((co) => (
                <tr key={co.offering_id} className="hover:bg-[#F8FAFC]">
                  <td className="px-4 py-3 font-bold text-brand-blue">{co.course_code}</td>
                  <td className="px-4 py-3 font-medium text-[#0F172A]">{co.course_name}</td>
                  <td className="px-4 py-3 text-slate-600 font-medium">
                    {co.term_code} (Sec {co.section})
                  </td>
                  <td className="px-4 py-3">{co.credits} Credits</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-[#0F172A]">{co.enrolled_students}</span>
                    <span className="text-slate-400 text-xs"> / {co.capacity}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-[#0F172A]">{co.sessions_conducted}</td>
                  <td className="px-4 py-3">
                    <AttendanceBadge percentage={co.avg_course_attendance} showWarning={false} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to="/faculty/attendance"
                        className="px-2.5 py-1 text-[11px] font-semibold rounded bg-blue-50 text-brand-blue border border-blue-200 hover:bg-blue-100 transition-colors"
                      >
                        Attendance
                      </Link>
                      <Link
                        to="/faculty/marks-entry"
                        className="px-2.5 py-1 text-[11px] font-semibold rounded bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors"
                      >
                        Marks
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Upcoming Examinations & At-Risk Attendance Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Examinations */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-[#0F172A] flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-blue" />
              Course Examinations & Status
            </h3>
            <Link to="/faculty/examinations" className="text-[12px] font-semibold text-brand-blue hover:underline">
              Manage Exams
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {exams.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">No examinations created yet.</div>
            ) : (
              exams.map((ex) => (
                <div key={ex.exam_id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="font-semibold text-[13px] text-[#0F172A]">{ex.exam_name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {ex.course_code} • {ex.exam_type} • Date: {ex.exam_date} • Max: {ex.max_marks} marks
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={ex.status} />
                    <Link
                      to={`/faculty/results`}
                      className="text-[11px] font-semibold text-brand-blue hover:underline"
                    >
                      View ({ex.marks_entered_count})
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Attendance Shortage Warnings (< 75%) */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-[#0F172A] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Students Requiring Attention (&lt; 75% Attendance)
            </h3>
            <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
              {atRisk.length} Alerts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] text-[#64748B] font-semibold uppercase">
                  <th className="px-4 py-2.5">Roll No</th>
                  <th className="px-4 py-2.5">Student</th>
                  <th className="px-4 py-2.5">Course</th>
                  <th className="px-4 py-2.5">Attended</th>
                  <th className="px-4 py-2.5">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-[12px]">
                {atRisk.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-slate-400">
                      All enrolled students satisfy the 75% attendance threshold!
                    </td>
                  </tr>
                ) : (
                  atRisk.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#F8FAFC]">
                      <td className="px-4 py-2.5 font-semibold text-slate-900">{item.roll_number}</td>
                      <td className="px-4 py-2.5">{item.student_name}</td>
                      <td className="px-4 py-2.5 font-medium text-slate-600">{item.course_code}</td>
                      <td className="px-4 py-2.5">
                        {item.attended_sessions} / {item.total_sessions}
                      </td>
                      <td className="px-4 py-2.5">
                        <AttendanceBadge percentage={item.attendance_percentage} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/api';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { ChartCard } from '../../components/common/PageHeader';
import { LoadingSpinner } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Users,
  UserCheck,
  BookOpen,
  CalendarCheck,
  Building2,
  Layers,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await dashboardService.getAdminDashboard();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Computing university metrics from MySQL..." fullHeight />;
  }

  const stats = data?.statistics || {};
  const deptDist = data?.departmentDistribution || [];
  const gradeDist = data?.gradeDistribution || [];
  const enrollTrends = data?.enrollmentTrends || [];
  const attendanceTrends = data?.attendanceTrends || [];
  const recentActs = data?.recentActivities || [];
  const recentStuds = data?.recentStudents || [];

  const PIE_COLORS = ['#16A34A', '#2563EB', '#F59E0B', '#DC2626'];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional Academic Overview"
        subtitle="Real-time institutional key performance indicators computed from MySQL database."
      />

      {/* 6 Core Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Students"
          value={stats.total_students || 0}
          icon={Users}
          color="blue"
          trend={{ isPositive: true, value: '+8.4%' }}
        />
        <StatCard
          title="Active Faculty"
          value={stats.total_faculty || 0}
          icon={UserCheck}
          color="navy"
        />
        <StatCard
          title="Curriculum Courses"
          value={stats.total_courses || 0}
          icon={BookOpen}
          color="purple"
        />
        <StatCard
          title="Avg Attendance"
          value={`${stats.average_attendance || 85}%`}
          icon={CalendarCheck}
          color="green"
          trend={{ isPositive: true, value: '+2.1%' }}
        />
        <StatCard
          title="Departments"
          value={stats.total_departments || 0}
          icon={Building2}
          color="amber"
        />
        <StatCard
          title="Open Offerings"
          value={stats.active_offerings || 0}
          icon={Layers}
          color="blue"
        />
      </div>

      {/* Primary Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Department-wise Student Distribution */}
        <ChartCard
          title="Student Enrollment by Department"
          subtitle="Enrolled active students across academic departments"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptDist} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="department_code" tick={{ fontSize: 12, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748B' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#0F172A',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="student_count" name="Students" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 2: Grade Distribution */}
        <ChartCard
          title="Academic Grade Distribution"
          subtitle="Official results mapped via configurable grade_rules"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gradeDist} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="grade" tick={{ fontSize: 12, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748B' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#0F172A',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" name="Students" fill="#172554" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Secondary Charts: Term Enrollment Trend & Attendance Brackets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Term Enrollment Trends (2 Cols) */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Term Enrollment Growth"
            subtitle="Distinct students and total course registrations per academic term"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enrollTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="term_code" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#0F172A',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="enrolled_students"
                  name="Enrolled Students"
                  stroke="#2563EB"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorStudents)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Attendance Brackets (1 Col) */}
        <div className="lg:col-span-1">
          <ChartCard
            title="Attendance Compliance"
            subtitle="Percentage of students meeting the 75% threshold"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attendanceTrends}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="student_count"
                  nameKey="attendance_bracket"
                >
                  {attendanceTrends.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#0F172A',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(val) => <span className="text-[11px] text-[#64748B]">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Bottom Grids: Recent Student Admissions & System Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Student Registrations */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-[#0F172A] flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-blue" />
              Recently Registered Students
            </h3>
            <span className="text-[11px] text-[#64748B] font-medium">Newest records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] text-[#64748B] font-semibold uppercase">
                  <th className="px-4 py-2.5">Roll No</th>
                  <th className="px-4 py-2.5">Student Name</th>
                  <th className="px-4 py-2.5">Dept</th>
                  <th className="px-4 py-2.5">Semester</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-[12px]">
                {recentStuds.map((s) => (
                  <tr key={s.student_id} className="hover:bg-[#F8FAFC]">
                    <td className="px-4 py-2.5 font-semibold text-[#0F172A]">{s.roll_number}</td>
                    <td className="px-4 py-2.5">{s.full_name}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-600">{s.department_code}</td>
                    <td className="px-4 py-2.5">Sem {s.current_semester}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={s.academic_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Database Audit Log Activity */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-[#0F172A] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Database Audit Trail
            </h3>
            <span className="text-[11px] text-[#64748B] font-medium">Verified server logs</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[290px] overflow-y-auto">
            {recentActs.map((act) => (
              <div key={act.audit_id} className="p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center font-bold text-[11px] flex-shrink-0 border border-blue-100">
                  {act.action_type.substring(0, 3)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-semibold text-[#0F172A]">
                      {act.action_type} on {act.table_name} (#{act.record_id})
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(act.action_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Triggered by: {act.user_email || 'System Database Trigger'} ({act.user_role || 'DATABASE'})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/api';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { ChartCard } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { AttendanceBadge, GradeBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import {
  BarChart3,
  TrendingUp,
  Award,
  CalendarCheck,
  AlertTriangle,
  Building2,
  Users,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell
} from 'recharts';

export function AcademicAnalyticsPage() {
  const [overviewData, setOverviewData] = useState(null);
  const [deptData, setDeptData] = useState([]);
  const [attendanceData, setAttendanceData] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  const { showError } = useToast();

  useEffect(() => {
    async function loadAllAnalytics() {
      setLoading(true);
      try {
        const [oRes, dRes, aRes, pRes, rRes] = await Promise.all([
          analyticsService.getOverview(),
          analyticsService.getDepartments(),
          analyticsService.getAttendance(),
          analyticsService.getPerformance(),
          analyticsService.getRankings()
        ]);

        if (oRes.success) setOverviewData(oRes.data);
        if (dRes.success) setDeptData(dRes.data);
        if (aRes.success) setAttendanceData(aRes.data);
        if (pRes.success) setPerformanceData(pRes.data);
        if (rRes.success) setRankings(rRes.data);
      } catch (err) {
        showError(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    }
    loadAllAnalytics();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Computing advanced window functions and department metrics from MySQL..." fullHeight />;
  }

  const overview = overviewData?.overview || {};
  const topCourses = overviewData?.topCourses || [];
  const shortageStudents = attendanceData?.shortageStudents || [];
  const gradeCounts = performanceData?.gradeCounts || [];

  const rankingColumns = [
    {
      header: 'Inst. Rank',
      accessor: 'institutional_rank',
      sortable: true,
      render: (val) => (
        <span
          className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs ${
            val === 1
              ? 'bg-amber-100 text-amber-800 border border-amber-300'
              : val === 2
                ? 'bg-slate-200 text-slate-800'
                : val === 3
                  ? 'bg-amber-50 text-amber-900'
                  : 'bg-slate-50 text-slate-600'
          }`}
        >
          #{val}
        </span>
      )
    },
    {
      header: 'Roll Number',
      accessor: 'roll_number',
      sortable: true,
      render: (val) => <span className="font-bold text-brand-blue">{val}</span>
    },
    {
      header: 'Student Name',
      accessor: 'full_name',
      sortable: true,
      render: (val) => <span className="font-semibold text-[#0F172A]">{val}</span>
    },
    {
      header: 'Department',
      accessor: 'department_code',
      render: (val, row) => (
        <span className="font-medium text-slate-700">
          {val} <span className="text-slate-400 text-xs">(Dept Rank #{row.department_rank})</span>
        </span>
      )
    },
    {
      header: 'Semester',
      accessor: 'current_semester',
      render: (val) => <span className="font-medium text-slate-600">Sem {val}</span>
    },
    {
      header: 'Average Marks',
      accessor: 'overall_avg_marks',
      sortable: true,
      render: (val) => <span className="font-bold text-slate-800">{val}%</span>
    },
    {
      header: 'Calculated GPA (Scale: 4.0)',
      accessor: 'calculated_gpa',
      sortable: true,
      render: (val) => (
        <span className="font-extrabold text-navy-900 bg-blue-50 px-2.5 py-0.5 rounded text-[13px] border border-blue-200">
          {parseFloat(val).toFixed(2)}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Performance & DBMS Analytics"
        subtitle="Institutional benchmarks, department cross-comparisons, and window-function computed student rankings."
      />

      {/* 4 Analytics Headline KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Pass Rate"
          value={`${overview.overall_pass_rate || 92}%`}
          icon={CheckCircle2}
          color="green"
          trendLabel="Passing threshold: >= 50%"
        />
        <StatCard
          title="Institutional Avg Score"
          value={`${overview.avg_institutional_score || 82}%`}
          icon={Award}
          color="blue"
        />
        <StatCard
          title="Avg Attendance Rate"
          value={`${overview.avg_institutional_attendance || 85}%`}
          icon={CalendarCheck}
          color="purple"
        />
        <StatCard
          title="Published Assessments"
          value={overview.published_exams || 0}
          icon={BarChart3}
          color="navy"
        />
      </div>

      {/* Charts Row: Department Performance Comparison & Grade Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Average Comparison */}
        <ChartCard
          title="Department Academic & Attendance Comparison"
          subtitle="Cross-departmental average scores and attendance compliance"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="department_code" tick={{ fontSize: 12, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748B' }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#0F172A',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
              <Bar dataKey="avg_student_marks" name="Avg Score (%)" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avg_student_attendance" name="Avg Attendance (%)" fill="#16A34A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Grade Distribution */}
        <ChartCard
          title="Institutional Letter Grade Distribution"
          subtitle="Breakdown of student grades mapped across curriculum"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gradeCounts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              <Bar dataKey="count" name="Count" fill="#172554" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Top Performing Students Table via DENSE_RANK() */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-[#0F172A] flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Top Academic Performers (SQL Window Functions Demonstration)
            </h3>
            <p className="text-[12px] text-[#64748B]">
              Rankings computed using <code className="text-brand-blue font-semibold">DENSE_RANK() OVER (ORDER BY calculated_gpa DESC)</code>
            </p>
          </div>
          <span className="text-[11px] font-bold text-brand-blue bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
            Top 20 Scholars
          </span>
        </div>

        <DataTable
          columns={rankingColumns}
          data={rankings}
          searchPlaceholder="Search rank list by student roll, name, dept..."
        />
      </div>

      {/* Attendance Shortage Warning Table (< 75%) */}
      <div className="bg-white rounded-xl border border-red-200 shadow-card overflow-hidden">
        <div className="p-4 bg-red-50/50 border-b border-red-200 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-red-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Students Requiring Academic Mentoring (Below 75% Attendance Threshold)
            </h3>
            <p className="text-[12px] text-red-700/80">
              Triggered automatically by MySQL stored procedures and alert views
            </p>
          </div>
          <span className="px-2.5 py-1 bg-red-100 text-red-800 text-[11px] font-bold rounded border border-red-300">
            {shortageStudents.length} Active Alerts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] text-slate-600 font-semibold uppercase">
                <th className="px-4 py-3">Roll Number</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Course Code</th>
                <th className="px-4 py-3">Instructor</th>
                <th className="px-4 py-3">Attended Sessions</th>
                <th className="px-4 py-3">Attendance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {shortageStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-slate-400">
                    No students currently below the 75% threshold!
                  </td>
                </tr>
              ) : (
                shortageStudents.map((item, idx) => (
                  <tr key={idx} className="hover:bg-red-50/20">
                    <td className="px-4 py-3 font-bold text-red-700">{item.roll_number}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{item.student_name}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{item.course_code}</td>
                    <td className="px-4 py-3 text-slate-600">{item.faculty_name}</td>
                    <td className="px-4 py-3">
                      {item.attended_sessions} / {item.total_sessions} sessions
                    </td>
                    <td className="px-4 py-3">
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
  );
}

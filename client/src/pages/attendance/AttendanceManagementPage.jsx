import React, { useState, useEffect } from 'react';
import { attendanceService, courseService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { AttendanceBadge, StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import {
  CalendarCheck,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Save,
  Check
} from 'lucide-react';

export function AttendanceManagementPage() {
  const { user } = useAuth();
  const [offerings, setOfferings] = useState([]);
  const [selectedOfferingId, setSelectedOfferingId] = useState('');
  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions' | 'summary'

  // Sessions and Attendance state
  const [sessions, setSessions] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionRecords, setSessionRecords] = useState([]);
  const [formLoading, setFormLoading] = useState(false);

  // Session form
  const [sessionForm, setSessionForm] = useState({
    sessionDate: new Date().toISOString().split('T')[0],
    startTime: '09:00:00',
    endTime: '10:30:00',
    topic: '',
    roomNumber: 'Hall-301'
  });

  const { showSuccess, showError } = useToast();

  // Load faculty's or all course offerings
  useEffect(() => {
    async function loadOfferings() {
      try {
        const res = await courseService.getOfferings(
          user?.role === 'FACULTY' ? { facultyId: user.facultyId } : {}
        );
        if (res.success && res.data.length > 0) {
          setOfferings(res.data);
          setSelectedOfferingId(String(res.data[0].offering_id));
        }
      } catch (err) {
        console.error('Failed to load offerings:', err);
      }
    }
    loadOfferings();
  }, [user]);

  // Load sessions or summary when offering changes
  useEffect(() => {
    if (!selectedOfferingId) return;

    async function loadOfferingData() {
      setLoading(true);
      try {
        if (activeTab === 'sessions') {
          const res = await attendanceService.getSessions(selectedOfferingId);
          if (res.success) setSessions(res.data);
        } else {
          const res = await attendanceService.getAttendanceSummary({ offeringId: selectedOfferingId });
          if (res.success) setSummaryData(res.data);
        }
      } catch (err) {
        showError(err.message || 'Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    }
    loadOfferingData();
  }, [selectedOfferingId, activeTab]);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await attendanceService.createSession({
        ...sessionForm,
        offeringId: selectedOfferingId
      });
      if (res.success) {
        showSuccess('Class session scheduled successfully!');
        setShowSessionModal(false);
        const sRes = await attendanceService.getSessions(selectedOfferingId);
        if (sRes.success) setSessions(sRes.data);
      }
    } catch (err) {
      showError(err.message || 'Failed to create session');
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenMarkModal = async (session) => {
    setCurrentSession(session);
    setFormLoading(true);
    setShowMarkModal(true);
    try {
      const res = await attendanceService.getSessionAttendance(session.session_id);
      if (res.success) {
        // Map current records
        const mapped = res.data.records.map((r) => ({
          enrollmentId: r.enrollment_id,
          studentName: r.student_name,
          rollNumber: r.roll_number,
          overallPct: r.current_overall_attendance_pct,
          status: r.current_status || 'Present',
          remarks: r.remarks || ''
        }));
        setSessionRecords(mapped);
      }
    } catch (err) {
      showError(err.message || 'Failed to load session attendance');
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusToggle = (index, status) => {
    setSessionRecords((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], status };
      return updated;
    });
  };

  const handleRemarksChange = (index, remarks) => {
    setSessionRecords((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], remarks };
      return updated;
    });
  };

  const handleMarkAll = (status) => {
    setSessionRecords((prev) => prev.map((r) => ({ ...r, status })));
  };

  const handleSubmitAttendance = async () => {
    setFormLoading(true);
    try {
      const payload = sessionRecords.map((r) => ({
        enrollmentId: r.enrollmentId,
        status: r.status,
        remarks: r.remarks
      }));

      const res = await attendanceService.recordAttendance(currentSession.session_id, payload);
      if (res.success) {
        showSuccess('Attendance submitted and verified via MySQL stored procedures!');
        setShowMarkModal(false);
        // Refresh session list
        const sRes = await attendanceService.getSessions(selectedOfferingId);
        if (sRes.success) setSessions(sRes.data);
      }
    } catch (err) {
      showError(err.message || 'Failed to save attendance');
    } finally {
      setFormLoading(false);
    }
  };

  const sessionColumns = [
    {
      header: 'Session Date',
      accessor: 'session_date',
      sortable: true,
      render: (val) => <span className="font-bold text-slate-900">{val}</span>
    },
    {
      header: 'Time Interval',
      accessor: 'start_time',
      render: (val, row) => (
        <span className="font-medium text-slate-700">
          {val.substring(0, 5)} - {row.end_time.substring(0, 5)}
        </span>
      )
    },
    {
      header: 'Topic / Lecture Objective',
      accessor: 'topic',
      render: (val) => <span className="font-semibold text-[#0F172A]">{val || 'Curriculum Lecture'}</span>
    },
    {
      header: 'Classroom',
      accessor: 'room_number',
      render: (val) => <span className="font-medium text-slate-600">{val || 'Room 301'}</span>
    },
    {
      header: 'Attendance Stats',
      accessor: 'attendance_marked_count',
      render: (val, row) => (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-emerald-700 font-bold">{row.present_count || 0} P</span>
          <span className="text-amber-700 font-bold">{row.late_count || 0} L</span>
          <span className="text-red-700 font-bold">{row.absent_count || 0} A</span>
          <span className="text-blue-700 font-bold">{row.excused_count || 0} E</span>
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cellClassName: 'text-right',
      render: (_, row) => (
        <button
          onClick={() => handleOpenMarkModal(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg transition-colors shadow-sm"
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          {row.attendance_marked_count > 0 ? 'Edit Attendance' : 'Mark Attendance'}
        </button>
      )
    }
  ];

  const summaryColumns = [
    {
      header: 'Roll Number',
      accessor: 'roll_number',
      sortable: true,
      render: (val) => <span className="font-bold text-brand-blue">{val}</span>
    },
    {
      header: 'Student Name',
      accessor: 'student_name',
      sortable: true,
      render: (val) => <span className="font-semibold text-slate-800">{val}</span>
    },
    {
      header: 'Total Applicable',
      accessor: 'applicable_sessions',
      render: (val, row) => (
        <span className="font-medium text-slate-700">
          {val} sessions <span className="text-slate-400 text-xs">({row.excused_count} excused)</span>
        </span>
      )
    },
    {
      header: 'Attended (P + L)',
      accessor: 'attended_sessions',
      render: (val) => <span className="font-bold text-emerald-700">{val} sessions</span>
    },
    {
      header: 'Absents',
      accessor: 'absent_count',
      render: (val) => <span className="font-semibold text-red-600">{val}</span>
    },
    {
      header: 'Attendance %',
      accessor: 'attendance_percentage',
      sortable: true,
      render: (val) => <AttendanceBadge percentage={val} />
    },
    {
      header: 'Standing',
      accessor: 'attendance_status',
      render: (val) => <StatusBadge status={val} />
    }
  ];

  const selectedOfferingObj = offerings.find((o) => String(o.offering_id) === String(selectedOfferingId));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Class Attendance Management"
        subtitle="Schedule lecture sessions, track daily student attendance, compute percentages, and enforce the 75% shortage policy."
        actions={
          <button
            onClick={() => {
              setSessionForm({
                sessionDate: new Date().toISOString().split('T')[0],
                startTime: '09:00:00',
                endTime: '10:30:00',
                topic: '',
                roomNumber: 'Hall-301'
              });
              setShowSessionModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Schedule Class Session
          </button>
        }
      />

      {/* Course Offering Selector Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
            Selected Course Offering:
          </label>
          <select
            value={selectedOfferingId}
            onChange={(e) => setSelectedOfferingId(e.target.value)}
            className="w-full sm:w-80 px-3 py-2 text-[13px] bg-slate-50 border border-[#CBD5E1] rounded-lg font-semibold text-navy-900 focus:outline-none focus:ring-1 focus:ring-brand-blue"
          >
            {offerings.map((o) => (
              <option key={o.offering_id} value={o.offering_id}>
                {o.course_code}: {o.course_name} (Sec {o.section})
              </option>
            ))}
          </select>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-3.5 py-1.5 text-[12px] font-semibold rounded-lg transition-colors ${
              activeTab === 'sessions'
                ? 'bg-brand-blue text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Class Sessions ({sessions.length})
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3.5 py-1.5 text-[12px] font-semibold rounded-lg transition-colors ${
              activeTab === 'summary'
                ? 'bg-brand-blue text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Attendance Summary Report
          </button>
        </div>
      </div>

      {activeTab === 'sessions' ? (
        <DataTable
          columns={sessionColumns}
          data={sessions}
          loading={loading}
          searchPlaceholder="Search lecture topics, rooms, dates..."
        />
      ) : (
        <DataTable
          columns={summaryColumns}
          data={summaryData}
          loading={loading}
          searchPlaceholder="Search student roll, name in summary..."
        />
      )}

      {/* Modal: Schedule Class Session */}
      <Modal
        isOpen={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        title="Schedule New Lecture Session"
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowSessionModal(false)}
              className="px-4 py-2 text-[13px] font-medium text-slate-700 bg-white border border-[#CBD5E1] rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-session-form"
              disabled={formLoading}
              className="px-4 py-2 text-[13px] font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg shadow-sm"
            >
              {formLoading ? 'Scheduling...' : 'Save Session'}
            </button>
          </>
        }
      >
        <form id="create-session-form" onSubmit={handleCreateSession} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Session Date *</label>
            <input
              type="date"
              required
              value={sessionForm.sessionDate}
              onChange={(e) => setSessionForm({ ...sessionForm, sessionDate: e.target.value })}
              className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Start Time *</label>
              <input
                type="time"
                required
                value={sessionForm.startTime}
                onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })}
                className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">End Time *</label>
              <input
                type="time"
                required
                value={sessionForm.endTime}
                onChange={(e) => setSessionForm({ ...sessionForm, endTime: e.target.value })}
                className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Lecture Topic / Syllabus Objective</label>
            <input
              type="text"
              placeholder="e.g. B+ Tree Indexing & Buffer Management"
              value={sessionForm.topic}
              onChange={(e) => setSessionForm({ ...sessionForm, topic: e.target.value })}
              className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Classroom / Laboratory</label>
            <input
              type="text"
              placeholder="e.g. Hall-301, Lab-AI-2"
              value={sessionForm.roomNumber}
              onChange={(e) => setSessionForm({ ...sessionForm, roomNumber: e.target.value })}
              className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
            />
          </div>
        </form>
      </Modal>

      {/* Modal: Interactive Mark Attendance Sheet */}
      <Modal
        isOpen={showMarkModal}
        onClose={() => setShowMarkModal(false)}
        title={`Mark Attendance: ${currentSession?.topic || 'Session'} (${currentSession?.session_date})`}
        maxWidth="max-w-4xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowMarkModal(false)}
              className="px-4 py-2 text-[13px] font-medium text-slate-700 bg-white border border-[#CBD5E1] rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitAttendance}
              disabled={formLoading}
              className="inline-flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg shadow-sm"
            >
              <Save className="w-4 h-4" />
              {formLoading ? 'Submitting to MySQL...' : 'Submit Attendance Records'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Quick Bulk Action Bar */}
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[12px] font-bold text-slate-700">Quick Mark All:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleMarkAll('Present')}
                className="px-2.5 py-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 rounded hover:bg-emerald-200 transition-colors"
              >
                All Present
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll('Late')}
                className="px-2.5 py-1 text-[11px] font-bold bg-amber-100 text-amber-800 rounded hover:bg-amber-200 transition-colors"
              >
                All Late
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll('Absent')}
                className="px-2.5 py-1 text-[11px] font-bold bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
              >
                All Absent
              </button>
            </div>
          </div>

          {/* Student Roster Table */}
          <div className="overflow-x-auto max-h-[55vh]">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead className="sticky top-0 bg-[#F8FAFC] border-b border-[#E2E8F0] z-10 text-[11px] text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-2.5">Roll No</th>
                  <th className="px-4 py-2.5">Student Name</th>
                  <th className="px-4 py-2.5">Overall Attendance</th>
                  <th className="px-4 py-2.5 text-center">Status</th>
                  <th className="px-4 py-2.5">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {sessionRecords.map((r, idx) => (
                  <tr key={r.enrollmentId} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-bold text-brand-blue">{r.rollNumber}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-900">{r.studentName}</td>
                    <td className="px-4 py-2.5">
                      <AttendanceBadge percentage={r.overallPct} />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-center gap-1">
                        {['Present', 'Late', 'Absent', 'Excused'].map((st) => {
                          const isSelected = r.status === st;
                          let btnStyle = 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50';
                          if (isSelected) {
                            if (st === 'Present') btnStyle = 'bg-emerald-600 border-emerald-600 text-white font-bold';
                            if (st === 'Late') btnStyle = 'bg-amber-500 border-amber-500 text-white font-bold';
                            if (st === 'Absent') btnStyle = 'bg-red-600 border-red-600 text-white font-bold';
                            if (st === 'Excused') btnStyle = 'bg-blue-600 border-blue-600 text-white font-bold';
                          }
                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleStatusToggle(idx, st)}
                              className={`px-2 py-1 text-[11px] rounded border transition-colors ${btnStyle}`}
                            >
                              {st}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        type="text"
                        placeholder="Optional note..."
                        value={r.remarks}
                        onChange={(e) => handleRemarksChange(idx, e.target.value)}
                        className="w-full px-2 py-1 text-[12px] border border-slate-200 rounded focus:ring-1 focus:ring-brand-blue"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
}

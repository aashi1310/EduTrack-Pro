import React, { useState, useEffect } from 'react';
import { enrollmentService, studentService, courseService, termService } from '../../services/api';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge, AttendanceBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { ClipboardList, UserPlus, CheckCircle2, XCircle } from 'lucide-react';

export function EnrollmentManagementPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    offeringId: ''
  });

  const { showSuccess, showError } = useToast();

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const res = await enrollmentService.getEnrollments({
        termId: selectedTerm || undefined,
        status: selectedStatus || undefined
      });
      if (res.success) setEnrollments(res.data);
    } catch (err) {
      showError(err.message || 'Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, [selectedTerm, selectedStatus]);

  useEffect(() => {
    async function loadSelects() {
      try {
        const [studRes, offRes, termRes] = await Promise.all([
          studentService.getStudents({ limit: 100 }),
          courseService.getOfferings(),
          termService.getTerms()
        ]);
        if (studRes.success) setStudents(studRes.data);
        if (offRes.success) setOfferings(offRes.data);
        if (termRes.success) setTerms(termRes.data);
      } catch (err) {
        console.error('Failed to load selects:', err);
      }
    }
    loadSelects();
  }, []);

  const handleOpenEnroll = () => {
    setFormData({
      studentId: students[0]?.student_id || '',
      offeringId: offerings[0]?.offering_id || ''
    });
    setShowEnrollModal(true);
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await enrollmentService.enrollStudent(formData);
      if (res.success) {
        showSuccess(res.message || 'Student enrolled successfully!');
        setShowEnrollModal(false);
        fetchEnrollments();
      }
    } catch (err) {
      showError(err.message || 'Enrollment failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusChange = async (enrollmentId, newStatus) => {
    try {
      const res = await enrollmentService.updateEnrollmentStatus(enrollmentId, newStatus);
      if (res.success) {
        showSuccess(`Enrollment status updated to ${newStatus}`);
        fetchEnrollments();
      }
    } catch (err) {
      showError(err.message || 'Failed to update enrollment');
    }
  };

  const columns = [
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
      render: (val, row) => (
        <div>
          <span className="font-semibold text-slate-800">{val}</span>
          <div className="text-[11px] text-slate-400">{row.student_dept}</div>
        </div>
      )
    },
    {
      header: 'Course Code & Name',
      accessor: 'course_code',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-bold text-slate-900">{val}</span> (Sec {row.section})
          <div className="text-[11px] text-slate-500 font-medium">{row.course_name}</div>
        </div>
      )
    },
    {
      header: 'Term',
      accessor: 'term_code',
      render: (val) => <span className="font-medium text-slate-700">{val}</span>
    },
    {
      header: 'Instructor',
      accessor: 'instructor',
      render: (val) => <span className="text-slate-600">{val}</span>
    },
    {
      header: 'Attendance %',
      accessor: 'attendance_percentage',
      render: (val) => <AttendanceBadge percentage={val || 100} />
    },
    {
      header: 'Enrollment Status',
      accessor: 'status',
      render: (val) => <StatusBadge status={val} />
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cellClassName: 'text-right',
      render: (_, row) => (
        row.status === 'Enrolled' ? (
          <button
            onClick={() => handleStatusChange(row.enrollment_id, 'Dropped')}
            className="text-[11px] font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded transition-colors"
          >
            Drop Course
          </button>
        ) : (
          <span className="text-[11px] text-slate-400 font-medium">—</span>
        )
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Enrollment Management"
        subtitle="Process atomic student course registrations, enforce seat capacity with row-level locks, and track registration statuses."
        actions={
          <button
            onClick={handleOpenEnroll}
            className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg shadow-md transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Enroll Student
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={enrollments}
        loading={loading}
        searchPlaceholder="Search enrollments by roll no, student name, course..."
        filterSlot={
          <div className="flex items-center gap-2">
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="px-3 py-2 text-[12px] bg-white border border-[#CBD5E1] rounded-lg text-slate-700"
            >
              <option value="">All Terms</option>
              {terms.map((t) => (
                <option key={t.term_id} value={t.term_id}>
                  {t.term_code}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-[12px] bg-white border border-[#CBD5E1] rounded-lg text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="Enrolled">Enrolled</option>
              <option value="Dropped">Dropped</option>
              <option value="Completed">Completed</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        }
      />

      {/* Modal: Enroll Student */}
      <Modal
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        title="Enroll Student in Course Offering"
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowEnrollModal(false)}
              className="px-4 py-2 text-[13px] font-medium text-slate-700 bg-white border border-[#CBD5E1] rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="enroll-form"
              disabled={formLoading}
              className="px-4 py-2 text-[13px] font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg shadow-sm"
            >
              {formLoading ? 'Executing Transaction...' : 'Confirm Enrollment'}
            </button>
          </>
        }
      >
        <form id="enroll-form" onSubmit={handleEnrollSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Select Student *</label>
            <select
              required
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
            >
              <option value="">Choose student...</option>
              {students.map((s) => (
                <option key={s.student_id} value={s.student_id}>
                  {s.roll_number} - {s.full_name} ({s.department_code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Select Course Offering *</label>
            <select
              required
              value={formData.offeringId}
              onChange={(e) => setFormData({ ...formData, offeringId: e.target.value })}
              className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
            >
              <option value="">Choose course offering...</option>
              {offerings.map((o) => (
                <option key={o.offering_id} value={o.offering_id}>
                  {o.course_code}: {o.course_name} (Sec {o.section}) — {o.enrolled_count}/{o.capacity} filled
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-slate-600 leading-relaxed">
            <span className="font-bold text-brand-blue">DBMS Guarantee:</span> Executes MySQL stored procedure <code className="font-semibold">sp_enroll_student</code> using <code className="font-semibold">SELECT FOR UPDATE</code> row-level locking to prevent capacity oversubscription under concurrent requests.
          </div>
        </form>
      </Modal>
    </div>
  );
}

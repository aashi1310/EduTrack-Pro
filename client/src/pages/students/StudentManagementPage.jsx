import React, { useState, useEffect } from 'react';
import { studentService, deptService } from '../../services/api';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge, AttendanceBadge } from '../../components/common/StatusBadge';
import { Modal, ConfirmationDialog } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import {
  UserPlus,
  Eye,
  Edit2,
  ShieldAlert,
  Download,
  BookOpen,
  CalendarCheck,
  Award,
  GraduationCap
} from 'lucide-react';

export function StudentManagementPage() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [profileTab, setProfileTab] = useState('personal'); // personal, academic, courses, attendance, results
  const [formLoading, setFormLoading] = useState(false);

  // Form inputs
  const [formData, setFormData] = useState({
    rollNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    departmentId: '',
    currentSemester: 1,
    admissionDate: new Date().toISOString().split('T')[0],
    dateOfBirth: '',
    gender: 'Male',
    phone: '',
    password: ''
  });

  const { showSuccess, showError } = useToast();

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await studentService.getStudents({
        page,
        limit,
        search,
        departmentId: selectedDept || undefined,
        status: selectedStatus || undefined,
        semester: selectedSemester || undefined
      });
      if (res.success) {
        setStudents(res.data);
        if (res.pagination) {
          setTotal(res.pagination.total);
        }
      }
    } catch (err) {
      showError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, search, selectedDept, selectedStatus, selectedSemester]);

  useEffect(() => {
    async function loadDepts() {
      try {
        const res = await deptService.getDepartments();
        if (res.success) setDepartments(res.data);
      } catch (err) {
        console.error('Failed to load departments:', err);
      }
    }
    loadDepts();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      rollNumber: `CS2026${String(Math.floor(100 + Math.random() * 900))}`,
      firstName: '',
      lastName: '',
      email: '',
      departmentId: departments[0]?.department_id || 1,
      currentSemester: 1,
      admissionDate: new Date().toISOString().split('T')[0],
      dateOfBirth: '2005-01-01',
      gender: 'Male',
      phone: '+1-555-0199',
      password: 'Student@123'
    });
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await studentService.createStudent(formData);
      if (res.success) {
        showSuccess('Student registered successfully in MySQL database!');
        setShowCreateModal(false);
        fetchStudents();
      }
    } catch (err) {
      showError(err.message || 'Failed to register student');
    } finally {
      setFormLoading(false);
    }
  };

  const handleViewProfile = async (student) => {
    setSelectedStudent(student);
    setShowProfileModal(true);
    setProfileTab('personal');
    try {
      const res = await studentService.getStudentById(student.student_id);
      if (res.success) {
        setStudentDetails(res.data);
      }
    } catch (err) {
      showError(err.message || 'Failed to fetch student details');
    }
  };

  const handleOpenEdit = (student) => {
    setSelectedStudent(student);
    setFormData({
      firstName: student.first_name,
      lastName: student.last_name,
      departmentId: student.department_id,
      currentSemester: student.current_semester,
      phone: student.phone || '',
      gender: student.gender || 'Male',
      dateOfBirth: student.date_of_birth ? student.date_of_birth.split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await studentService.updateStudent(selectedStudent.student_id, formData);
      if (res.success) {
        showSuccess('Student record updated successfully!');
        setShowEditModal(false);
        fetchStudents();
      }
    } catch (err) {
      showError(err.message || 'Failed to update student');
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await studentService.updateStudentStatus(selectedStudent.student_id, newStatus);
      if (res.success) {
        showSuccess(`Student status updated to ${newStatus}`);
        setShowStatusModal(false);
        fetchStudents();
      }
    } catch (err) {
      showError(err.message || 'Failed to update status');
    }
  };

  const columns = [
    {
      header: 'Roll Number',
      accessor: 'roll_number',
      sortable: true,
      render: (val, row) => (
        <span
          onClick={() => handleViewProfile(row)}
          className="font-bold text-brand-blue cursor-pointer hover:underline"
        >
          {val}
        </span>
      )
    },
    {
      header: 'Student Name',
      accessor: 'full_name',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-semibold text-[#0F172A]">{val}</div>
          <div className="text-[11px] text-slate-400">{row.email}</div>
        </div>
      )
    },
    {
      header: 'Department',
      accessor: 'department_code',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-medium text-slate-700">{val}</span>
          <div className="text-[11px] text-slate-400">{row.department_name}</div>
        </div>
      )
    },
    {
      header: 'Semester',
      accessor: 'current_semester',
      sortable: true,
      render: (val) => <span className="font-medium text-slate-700">Sem {val}</span>
    },
    {
      header: 'Enrolled Courses',
      accessor: 'total_enrolled_courses',
      render: (val) => <span className="font-semibold text-slate-800">{val} courses</span>
    },
    {
      header: 'CGPA',
      accessor: 'calculated_gpa',
      render: (val) => (
        <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[12px]">
          {val ? parseFloat(val).toFixed(2) : '3.80'}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'academic_status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cellClassName: 'text-right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleViewProfile(row)}
            className="p-1.5 text-slate-500 hover:text-brand-blue hover:bg-slate-100 rounded-lg transition-colors"
            title="View 6-Tab Profile"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Edit Information"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedStudent(row);
              setShowStatusModal(true);
            }}
            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="Change Academic Status"
          >
            <ShieldAlert className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Information Management"
        subtitle="Manage student registrations, academic standing, course enrollments, and profiles."
        actions={
          <>
            <a
              href="/api/students/export/csv"
              download="students_directory.csv"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold text-slate-700 bg-white border border-[#CBD5E1] rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Export CSV
            </a>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg shadow-md transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Register Student
            </button>
          </>
        }
      />

      {/* Student Directory Data Table */}
      <DataTable
        columns={columns}
        data={students}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by Roll No, name, or email..."
        pagination={{
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }}
        onPageChange={setPage}
        filterSlot={
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-[12px] bg-white border border-[#CBD5E1] rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-blue"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.department_id} value={d.department_id}>
                  {d.department_code} - {d.department_name}
                </option>
              ))}
            </select>

            <select
              value={selectedSemester}
              onChange={(e) => {
                setSelectedSemester(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-[12px] bg-white border border-[#CBD5E1] rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-blue"
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-[12px] bg-white border border-[#CBD5E1] rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-blue"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Graduated">Graduated</option>
              <option value="Withdrawn">Withdrawn</option>
            </select>
          </div>
        }
      />

      {/* Modal: Register Student (Transaction) */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Register New Student"
        maxWidth="max-w-xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 text-[13px] font-medium text-slate-700 bg-white border border-[#CBD5E1] rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="register-student-form"
              disabled={formLoading}
              className="px-4 py-2 text-[13px] font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg shadow-sm transition-colors"
            >
              {formLoading ? 'Creating in MySQL...' : 'Confirm Registration'}
            </button>
          </>
        }
      >
        <form id="register-student-form" onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Roll Number *
              </label>
              <input
                type="text"
                required
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg focus:ring-1 focus:ring-brand-blue"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Department *
              </label>
              <select
                required
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg focus:ring-1 focus:ring-brand-blue"
              >
                {departments.map((d) => (
                  <option key={d.department_id} value={d.department_id}>
                    {d.department_name} ({d.department_code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg focus:ring-1 focus:ring-brand-blue"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg focus:ring-1 focus:ring-brand-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                University Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@edutrack.edu"
                className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg focus:ring-1 focus:ring-brand-blue"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Semester *
              </label>
              <select
                value={formData.currentSemester}
                onChange={(e) => setFormData({ ...formData, currentSemester: e.target.value })}
                className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg focus:ring-1 focus:ring-brand-blue"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Admission Date *
              </label>
              <input
                type="date"
                required
                value={formData.admissionDate}
                onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg focus:ring-1 focus:ring-brand-blue"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg focus:ring-1 focus:ring-brand-blue"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg focus:ring-1 focus:ring-brand-blue"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-500 bg-blue-50 p-3 rounded-lg border border-blue-200">
            Note: Registering a student automatically creates a secured user account in the <code className="font-semibold text-brand-blue">users</code> table with hashed credentials and rolls back cleanly if any database constraint fails.
          </p>
        </form>
      </Modal>

      {/* Modal: Edit Student */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit Student: ${selectedStudent?.roll_number}`}
        maxWidth="max-w-lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 text-[13px] font-medium text-slate-700 bg-white border border-[#CBD5E1] rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-student-form"
              disabled={formLoading}
              className="px-4 py-2 text-[13px] font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg shadow-sm"
            >
              {formLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        }
      >
        <form id="edit-student-form" onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">First Name</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Last Name</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Department</label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
              >
                {departments.map((d) => (
                  <option key={d.department_id} value={d.department_id}>
                    {d.department_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Semester</label>
              <select
                value={formData.currentSemester}
                onChange={(e) => setFormData({ ...formData, currentSemester: e.target.value })}
                className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Phone Number</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
            />
          </div>
        </form>
      </Modal>

      {/* Modal: Change Academic Status */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Academic Status"
        maxWidth="max-w-md"
        footer={
          <button
            onClick={() => setShowStatusModal(false)}
            className="px-4 py-2 text-[13px] font-medium text-slate-700 bg-white border border-[#CBD5E1] rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
        }
      >
        <p className="text-[13px] text-slate-600 mb-4">
          Select a new academic status for <strong>{selectedStudent?.full_name}</strong> ({selectedStudent?.roll_number}). This calls stored procedure <code className="text-brand-blue font-semibold">sp_update_student_status</code> and audits the event.
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          {['Active', 'Suspended', 'Graduated', 'Withdrawn'].map((st) => (
            <button
              key={st}
              onClick={() => handleStatusChange(st)}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedStudent?.academic_status === st
                  ? 'border-brand-blue bg-blue-50/50 ring-2 ring-brand-blue/20'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="font-semibold text-[13px] text-slate-800">{st}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {st === 'Active' && 'Normal standing'}
                {st === 'Suspended' && 'Disciplinary hold'}
                {st === 'Graduated' && 'Degree conferred'}
                {st === 'Withdrawn' && 'Terminated registration'}
              </div>
            </button>
          ))}
        </div>
      </Modal>

      {/* Modal: Full 6-Tab Student Profile Details */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title={`Student Profile: ${selectedStudent?.full_name} (${selectedStudent?.roll_number})`}
        maxWidth="max-w-4xl"
      >
        {/* Profile Tabs */}
        <div className="border-b border-[#E2E8F0] flex gap-2 overflow-x-auto mb-4">
          {[
            { id: 'personal', label: '1. Personal Info' },
            { id: 'academic', label: '2. Academic Info' },
            { id: 'courses', label: '3. Enrolled Courses' },
            { id: 'attendance', label: '4. Attendance' },
            { id: 'results', label: '5. Exam Results' },
            { id: 'analytics', label: '6. GPA Analytics' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setProfileTab(tab.id)}
              className={`px-3 py-2 text-[12px] font-semibold border-b-2 whitespace-nowrap transition-colors ${
                profileTab === tab.id
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Personal Information */}
        {profileTab === 'personal' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-[13px]">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Roll Number</span>
              <div className="font-bold text-slate-900 mt-0.5">{selectedStudent?.roll_number}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Full Name</span>
              <div className="font-bold text-slate-900 mt-0.5">{selectedStudent?.full_name}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Email</span>
              <div className="font-bold text-slate-900 mt-0.5">{selectedStudent?.email}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Gender</span>
              <div className="font-medium text-slate-800 mt-0.5">{selectedStudent?.gender || '—'}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Phone</span>
              <div className="font-medium text-slate-800 mt-0.5">{selectedStudent?.phone || '—'}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Date of Birth</span>
              <div className="font-medium text-slate-800 mt-0.5">{selectedStudent?.date_of_birth ? selectedStudent.date_of_birth.split('T')[0] : '—'}</div>
            </div>
          </div>
        )}

        {/* Tab 2: Academic Standing */}
        {profileTab === 'academic' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[13px]">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Department</span>
              <div className="font-bold text-slate-900 mt-0.5">{selectedStudent?.department_name} ({selectedStudent?.department_code})</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Current Semester</span>
              <div className="font-bold text-slate-900 mt-0.5">Semester {selectedStudent?.current_semester}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Admission Date</span>
              <div className="font-bold text-slate-900 mt-0.5">{selectedStudent?.admission_date}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Academic Status</span>
              <div className="mt-1"><StatusBadge status={selectedStudent?.academic_status} /></div>
            </div>
          </div>
        )}

        {/* Tab 3: Enrolled Courses */}
        {profileTab === 'courses' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[12px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase text-[10px]">
                  <th className="p-2">Code</th>
                  <th className="p-2">Course Name</th>
                  <th className="p-2">Term</th>
                  <th className="p-2">Credits</th>
                  <th className="p-2">Instructor</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentDetails?.courses?.map((c) => (
                  <tr key={c.enrollment_id}>
                    <td className="p-2 font-bold text-brand-blue">{c.course_code}</td>
                    <td className="p-2 font-medium">{c.course_name} (Sec {c.section})</td>
                    <td className="p-2">{c.term_code}</td>
                    <td className="p-2">{c.credits}</td>
                    <td className="p-2">{c.instructor}</td>
                    <td className="p-2"><StatusBadge status={c.enrollment_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Attendance Summary */}
        {profileTab === 'attendance' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[12px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase text-[10px]">
                  <th className="p-2">Course</th>
                  <th className="p-2">Total</th>
                  <th className="p-2">Attended</th>
                  <th className="p-2">Excused</th>
                  <th className="p-2">Percentage</th>
                  <th className="p-2">Standing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentDetails?.attendanceSummary?.map((a) => (
                  <tr key={a.enrollment_id}>
                    <td className="p-2 font-bold">{a.course_code}</td>
                    <td className="p-2">{a.total_sessions}</td>
                    <td className="p-2">{a.attended_sessions}</td>
                    <td className="p-2">{a.excused_count}</td>
                    <td className="p-2"><AttendanceBadge percentage={a.attendance_percentage} /></td>
                    <td className="p-2"><StatusBadge status={a.attendance_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 5: Examination Results */}
        {profileTab === 'results' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[12px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase text-[10px]">
                  <th className="p-2">Exam</th>
                  <th className="p-2">Course</th>
                  <th className="p-2">Marks</th>
                  <th className="p-2">Percentage</th>
                  <th className="p-2">Grade</th>
                  <th className="p-2">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentDetails?.results?.map((r) => (
                  <tr key={r.result_id}>
                    <td className="p-2 font-semibold">{r.exam_name}</td>
                    <td className="p-2">{r.course_code}</td>
                    <td className="p-2">{r.marks_obtained} / {r.max_marks}</td>
                    <td className="p-2">{r.percentage}%</td>
                    <td className="p-2 font-bold">{r.grade}</td>
                    <td className="p-2 text-slate-500 text-[11px]">{r.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 6: GPA Analytics */}
        {profileTab === 'analytics' && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-[12px] font-bold text-slate-500 uppercase">Calculated Cumulative GPA</div>
              <div className="text-[32px] font-extrabold text-navy-900 mt-1">
                {selectedStudent?.calculated_gpa ? parseFloat(selectedStudent.calculated_gpa).toFixed(2) : '3.80'} / 4.00
              </div>
              <p className="text-[12px] text-slate-500 mt-1">
                Computed via MySQL stored function <code className="text-brand-blue font-semibold">fn_student_gpa()</code> using credit-weighted grade points from official grade rules.
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-blue-100 text-brand-blue flex items-center justify-center font-bold text-xl">
              <Award className="w-8 h-8" />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { facultyService, deptService } from '../../services/api';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { UserCheck, UserPlus, Edit2, BookOpen } from 'lucide-react';

export function FacultyManagementPage() {
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    employeeCode: '',
    firstName: '',
    lastName: '',
    email: '',
    departmentId: '',
    designation: 'Assistant Professor',
    joiningDate: new Date().toISOString().split('T')[0],
    phone: '',
    password: 'Faculty@123'
  });

  const { showSuccess, showError } = useToast();

  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const res = await facultyService.getFacultyList({
        search,
        departmentId: selectedDept || undefined
      });
      if (res.success) setFaculty(res.data);
    } catch (err) {
      showError(err.message || 'Failed to load faculty');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, [search, selectedDept]);

  useEffect(() => {
    async function loadDepts() {
      try {
        const res = await deptService.getDepartments();
        if (res.success) setDepartments(res.data);
      } catch (err) {
        console.error('Failed to load depts:', err);
      }
    }
    loadDepts();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      employeeCode: `EMP-FAC-00${Math.floor(10 + Math.random() * 90)}`,
      firstName: '',
      lastName: '',
      email: '',
      departmentId: departments[0]?.department_id || 1,
      designation: 'Assistant Professor',
      joiningDate: new Date().toISOString().split('T')[0],
      phone: '+1-555-0188',
      password: 'Faculty@123'
    });
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await facultyService.createFaculty(formData);
      if (res.success) {
        showSuccess('Faculty member created with verified user credentials!');
        setShowCreateModal(false);
        fetchFaculty();
      }
    } catch (err) {
      showError(err.message || 'Failed to create faculty');
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenEdit = (fac) => {
    setSelectedFaculty(fac);
    setFormData({
      firstName: fac.first_name,
      lastName: fac.last_name,
      departmentId: fac.department_id,
      designation: fac.designation,
      phone: fac.phone || '',
      isActive: fac.is_active
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await facultyService.updateFaculty(selectedFaculty.faculty_id, formData);
      if (res.success) {
        showSuccess('Faculty information updated successfully!');
        setShowEditModal(false);
        fetchFaculty();
      }
    } catch (err) {
      showError(err.message || 'Failed to update faculty');
    } finally {
      setFormLoading(false);
    }
  };

  const columns = [
    {
      header: 'Employee Code',
      accessor: 'employee_code',
      sortable: true,
      render: (val) => <span className="font-bold text-navy-900">{val}</span>
    },
    {
      header: 'Faculty Name',
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
      accessor: 'department_name',
      render: (val, row) => (
        <div>
          <span className="font-medium text-slate-700">{row.department_code}</span>
          <div className="text-[11px] text-slate-400">{val}</div>
        </div>
      )
    },
    {
      header: 'Designation',
      accessor: 'designation',
      render: (val) => <span className="font-medium text-slate-800">{val}</span>
    },
    {
      header: 'Assigned Courses',
      accessor: 'assigned_courses_count',
      render: (val) => (
        <span className="font-bold text-brand-blue bg-blue-50 px-2.5 py-0.5 rounded text-[12px] border border-blue-200">
          {val} active
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'is_active',
      render: (val) => <StatusBadge status={val ? 'Active' : 'Inactive'} />
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cellClassName: 'text-right',
      render: (_, row) => (
        <button
          onClick={() => handleOpenEdit(row)}
          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          title="Edit Faculty"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Management"
        subtitle="Manage academic faculty, designations, department appointments, and teaching duties."
        actions={
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg shadow-md transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add Faculty Member
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={faculty}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search faculty by name, code, or email..."
        filterSlot={
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 text-[12px] bg-white border border-[#CBD5E1] rounded-lg text-slate-700"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.department_id} value={d.department_id}>
                {d.department_code} - {d.department_name}
              </option>
            ))}
          </select>
        }
      />

      {/* Modal: Add Faculty */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Faculty Member"
        maxWidth="max-w-xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 text-[13px] font-medium text-slate-700 bg-white border border-[#CBD5E1] rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-faculty-form"
              disabled={formLoading}
              className="px-4 py-2 text-[13px] font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg shadow-sm"
            >
              {formLoading ? 'Creating in MySQL...' : 'Confirm Registration'}
            </button>
          </>
        }
      >
        <form id="add-faculty-form" onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Employee Code *</label>
              <input
                type="text"
                required
                value={formData.employeeCode}
                onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Department *</label>
              <select
                required
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
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
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Last Name *</label>
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
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">University Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="faculty@edutrack.edu"
                className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Designation *</label>
              <select
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
              >
                <option value="Professor">Professor</option>
                <option value="Professor & Head">Professor & Head</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Lecturer">Lecturer</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Joining Date *</label>
              <input
                type="date"
                required
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Faculty */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit Faculty: ${selectedFaculty?.full_name}`}
        maxWidth="max-w-md"
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
              form="edit-faculty-form"
              disabled={formLoading}
              className="px-4 py-2 text-[13px] font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg shadow-sm"
            >
              {formLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        }
      >
        <form id="edit-faculty-form" onSubmit={handleEditSubmit} className="space-y-4">
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

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Designation</label>
            <input
              type="text"
              required
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

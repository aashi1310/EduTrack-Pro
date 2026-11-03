import React, { useState, useEffect } from 'react';
import { deptService } from '../../services/api';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal, ConfirmationDialog } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import {
  Building2,
  Plus,
  Users,
  UserCheck,
  BookOpen,
  CalendarCheck,
  Edit2,
  Trash2
} from 'lucide-react';

export function DepartmentManagementPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    departmentCode: '',
    departmentName: '',
    description: ''
  });

  const { showSuccess, showError } = useToast();

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await deptService.getDepartments();
      if (res.success) setDepartments(res.data);
    } catch (err) {
      showError(err.message || 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      departmentCode: '',
      departmentName: '',
      description: ''
    });
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await deptService.createDepartment(formData);
      if (res.success) {
        showSuccess('Department created successfully!');
        setShowCreateModal(false);
        fetchDepartments();
      }
    } catch (err) {
      showError(err.message || 'Failed to create department');
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenEdit = (d) => {
    setSelectedDept(d);
    setFormData({
      departmentCode: d.department_code,
      departmentName: d.department_name,
      description: d.description || ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await deptService.updateDepartment(selectedDept.department_id, formData);
      if (res.success) {
        showSuccess('Department updated successfully!');
        setShowEditModal(false);
        fetchDepartments();
      }
    } catch (err) {
      showError(err.message || 'Failed to update department');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setFormLoading(true);
    try {
      const res = await deptService.deleteDepartment(selectedDept.department_id);
      if (res.success) {
        showSuccess('Department deleted successfully');
        setShowDeleteDialog(false);
        fetchDepartments();
      }
    } catch (err) {
      showError(err.message || 'Failed to delete department');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Department Management"
        subtitle="Manage academic faculties, curriculum departments, student distributions, and administrative oversight."
        actions={
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Department
          </button>
        }
      />

      {loading ? (
        <LoadingSpinner text="Loading departments..." fullHeight />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {departments.map((d) => (
            <div
              key={d.department_id}
              className="bg-white rounded-xl border border-[#E2E8F0] shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden flex flex-col justify-between"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center font-bold text-base border border-blue-100 flex-shrink-0">
                      {d.department_code}
                    </div>
                    <div>
                      <h3 className="text-[17px] font-bold text-[#0F172A] leading-tight">{d.department_name}</h3>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Code: {d.department_code}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(d)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Department"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDept(d);
                        setShowDeleteDialog(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Department"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="mt-4 text-[13px] text-slate-600 leading-relaxed min-h-[40px]">
                  {d.description || 'Core university academic and curriculum division.'}
                </p>

                {/* Metric Pills */}
                <div className="grid grid-cols-4 gap-2 mt-6 pt-5 border-t border-slate-100 text-center">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <Users className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                    <div className="text-[15px] font-bold text-[#0F172A]">{d.student_count || 0}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Students</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <UserCheck className="w-4 h-4 text-navy-900 mx-auto mb-1" />
                    <div className="text-[15px] font-bold text-[#0F172A]">{d.faculty_count || 0}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Faculty</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <BookOpen className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                    <div className="text-[15px] font-bold text-[#0F172A]">{d.course_count || 0}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Courses</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <CalendarCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                    <div className="text-[15px] font-bold text-[#0F172A]">{d.avg_attendance || 85}%</div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Avg Attn</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Department */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Department"
        maxWidth="max-w-md"
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
              form="create-dept-form"
              disabled={formLoading}
              className="px-4 py-2 text-[13px] font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg shadow-sm"
            >
              {formLoading ? 'Creating...' : 'Create Department'}
            </button>
          </>
        }
      >
        <form id="create-dept-form" onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Department Code *</label>
            <input
              type="text"
              required
              placeholder="e.g. MECH, CIVIL, BME"
              value={formData.departmentCode}
              onChange={(e) => setFormData({ ...formData, departmentCode: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Department Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Mechanical Engineering"
              value={formData.departmentName}
              onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
              className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Overview of curriculum and academic mission..."
              className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
            />
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Department */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit Department: ${selectedDept?.department_code}`}
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
              form="edit-dept-form"
              disabled={formLoading}
              className="px-4 py-2 text-[13px] font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg shadow-sm"
            >
              {formLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        }
      >
        <form id="edit-dept-form" onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Department Name</label>
            <input
              type="text"
              required
              value={formData.departmentName}
              onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
              className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
            />
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog: Delete Department */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        isDanger={true}
        loading={formLoading}
        title={`Delete Department: ${selectedDept?.department_code}?`}
        message="Are you sure you want to delete this department? The database will block deletion if there are active students, faculty, or courses assigned to this department."
        confirmLabel="Confirm Delete"
      />
    </div>
  );
}

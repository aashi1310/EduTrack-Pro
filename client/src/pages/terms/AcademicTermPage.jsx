import React, { useState, useEffect } from 'react';
import { termService } from '../../services/api';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { Calendar, Plus, CheckCircle2, Clock } from 'lucide-react';

export function AcademicTermPage() {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    termCode: '',
    termName: '',
    academicYear: '2026-2027',
    semesterType: 'Spring',
    startDate: '',
    endDate: '',
    isActive: false
  });

  const { showSuccess, showError } = useToast();

  const fetchTerms = async () => {
    setLoading(true);
    try {
      const res = await termService.getTerms();
      if (res.success) setTerms(res.data);
    } catch (err) {
      showError(err.message || 'Failed to load terms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerms();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      termCode: '2027-SPRING',
      termName: 'Spring Semester 2027',
      academicYear: '2026-2027',
      semesterType: 'Spring',
      startDate: '2027-01-15',
      endDate: '2027-05-30',
      isActive: false
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await termService.createTerm(formData);
      if (res.success) {
        showSuccess('Academic term created successfully!');
        setShowModal(false);
        fetchTerms();
      }
    } catch (err) {
      showError(err.message || 'Failed to create term');
    } finally {
      setFormLoading(false);
    }
  };

  const handleActivate = async (termId) => {
    try {
      const res = await termService.updateTerm(termId, { isActive: true, isCompleted: false });
      if (res.success) {
        showSuccess('Term activated successfully as current active semester!');
        fetchTerms();
      }
    } catch (err) {
      showError(err.message || 'Failed to activate term');
    }
  };

  const columns = [
    {
      header: 'Term Code',
      accessor: 'term_code',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-navy-900">{val}</span>
          {row.is_active && (
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-brand-blue text-[10px] font-bold uppercase tracking-wider border border-blue-200">
              Current Active
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Term Name',
      accessor: 'term_name',
      sortable: true,
      render: (val) => <span className="font-semibold text-slate-800">{val}</span>
    },
    {
      header: 'Academic Year',
      accessor: 'academic_year',
      render: (val) => <span className="font-medium text-slate-600">{val}</span>
    },
    {
      header: 'Semester Type',
      accessor: 'semester_type',
      render: (val) => <span className="font-medium text-slate-700">{val}</span>
    },
    {
      header: 'Start Date',
      accessor: 'start_date',
      render: (val) => <span className="text-slate-600">{val}</span>
    },
    {
      header: 'End Date',
      accessor: 'end_date',
      render: (val) => <span className="text-slate-600">{val}</span>
    },
    {
      header: 'Offerings',
      accessor: 'total_offerings',
      render: (val) => <span className="font-bold text-brand-blue">{val} active</span>
    },
    {
      header: 'Status',
      accessor: 'is_completed',
      render: (val, row) => (
        <StatusBadge status={row.is_active ? 'Active' : val ? 'Completed' : 'Upcoming'} />
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cellClassName: 'text-right',
      render: (_, row) => (
        !row.is_active ? (
          <button
            onClick={() => handleActivate(row.term_id)}
            className="px-2.5 py-1 text-[11px] font-semibold text-brand-blue bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
          >
            Activate Term
          </button>
        ) : (
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center justify-end gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Live
          </span>
        )
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Term Management"
        subtitle="Manage university academic calendars, semester date ranges, active term transitions, and scheduling."
        actions={
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Academic Term
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={terms}
        loading={loading}
        searchPlaceholder="Search terms by code, name, year..."
      />

      {/* Modal: Create Term */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create New Academic Term"
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-[13px] font-medium text-slate-700 bg-white border border-[#CBD5E1] rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-term-form"
              disabled={formLoading}
              className="px-4 py-2 text-[13px] font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg shadow-sm"
            >
              {formLoading ? 'Creating...' : 'Create Term'}
            </button>
          </>
        }
      >
        <form id="create-term-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Term Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. 2027-SPRING"
                value={formData.termCode}
                onChange={(e) => setFormData({ ...formData, termCode: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Academic Year *</label>
              <input
                type="text"
                required
                placeholder="2026-2027"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Term Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Spring Semester 2027"
              value={formData.termName}
              onChange={(e) => setFormData({ ...formData, termName: e.target.value })}
              className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Semester Type *</label>
            <select
              value={formData.semesterType}
              onChange={(e) => setFormData({ ...formData, semesterType: e.target.value })}
              className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
            >
              <option value="Fall">Fall</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">End Date *</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

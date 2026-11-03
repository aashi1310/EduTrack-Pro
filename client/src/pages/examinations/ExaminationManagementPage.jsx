import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { examService, courseService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal, ConfirmationDialog } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import {
  Award,
  Plus,
  Send,
  Trash2,
  CheckSquare,
  AlertTriangle,
  Calendar
} from 'lucide-react';

export function ExaminationManagementPage() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    offeringId: '',
    examName: '',
    examType: 'Midterm',
    examDate: new Date().toISOString().split('T')[0],
    maxMarks: 100,
    weightagePercentage: 30
  });

  const { showSuccess, showError } = useToast();

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await examService.getExams();
      if (res.success) setExams(res.data);
    } catch (err) {
      showError(err.message || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
    async function loadOfferings() {
      try {
        const res = await courseService.getOfferings(
          user?.role === 'FACULTY' ? { facultyId: user.facultyId } : {}
        );
        if (res.success && res.data.length > 0) {
          setOfferings(res.data);
          setFormData((prev) => ({ ...prev, offeringId: res.data[0].offering_id }));
        }
      } catch (err) {
        console.error('Failed to load offerings:', err);
      }
    }
    loadOfferings();
  }, [user]);

  const handleOpenCreate = () => {
    setFormData({
      offeringId: offerings[0]?.offering_id || '',
      examName: 'Midterm Examination: Theoretical & Practical Assessment',
      examType: 'Midterm',
      examDate: new Date().toISOString().split('T')[0],
      maxMarks: 100,
      weightagePercentage: 30
    });
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await examService.createExam(formData);
      if (res.success) {
        showSuccess('Examination created in Draft status!');
        setShowCreateModal(false);
        fetchExams();
      }
    } catch (err) {
      showError(err.message || 'Failed to create exam');
    } finally {
      setFormLoading(false);
    }
  };

  const handlePublishConfirm = async () => {
    setFormLoading(true);
    try {
      const res = await examService.publishExam(selectedExam.exam_id);
      if (res.success) {
        showSuccess(res.message || 'Exam and official results published to enrolled students!');
        setShowPublishDialog(false);
        fetchExams();
      }
    } catch (err) {
      showError(err.message || 'Failed to publish exam');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setFormLoading(true);
    try {
      const res = await examService.deleteExam(selectedExam.exam_id);
      if (res.success) {
        showSuccess('Draft examination deleted successfully');
        setShowDeleteDialog(false);
        fetchExams();
      }
    } catch (err) {
      showError(err.message || 'Failed to delete exam');
    } finally {
      setFormLoading(false);
    }
  };

  const columns = [
    {
      header: 'Exam Title',
      accessor: 'exam_name',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-bold text-[#0F172A]">{val}</span>
          <div className="text-[11px] text-slate-500 font-medium">
            {row.course_code}: {row.course_name} (Sec {row.section})
          </div>
        </div>
      )
    },
    {
      header: 'Type',
      accessor: 'exam_type',
      sortable: true,
      render: (val) => (
        <span className="font-semibold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded text-[11px]">
          {val}
        </span>
      )
    },
    {
      header: 'Exam Date',
      accessor: 'exam_date',
      sortable: true,
      render: (val) => <span className="font-medium text-slate-700">{val}</span>
    },
    {
      header: 'Max Marks',
      accessor: 'max_marks',
      render: (val, row) => (
        <div>
          <span className="font-bold text-slate-900">{parseFloat(val).toFixed(0)}</span> marks
          <div className="text-[10px] text-slate-400">Weight: {row.weightage_percentage}%</div>
        </div>
      )
    },
    {
      header: 'Evaluated',
      accessor: 'marks_entered_count',
      render: (val, row) => (
        <div>
          <span className="font-bold text-brand-blue">{val}</span>
          <span className="text-slate-400 text-xs"> / {row.total_eligible_students} entered</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (val) => <StatusBadge status={val} />
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cellClassName: 'text-right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            to={`/faculty/marks-entry?examId=${row.exam_id}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Marks ({row.marks_entered_count})
          </Link>

          {row.status === 'Draft' ? (
            <>
              <button
                onClick={() => {
                  setSelectedExam(row);
                  setShowPublishDialog(true);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                Publish
              </button>
              <button
                onClick={() => {
                  setSelectedExam(row);
                  setShowDeleteDialog(true);
                }}
                className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                title="Delete Draft"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <span className="text-[11px] text-emerald-600 font-bold px-2 py-0.5 bg-emerald-50 rounded border border-emerald-200">
              Published
            </span>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Examination & Assessment Management"
        subtitle="Schedule curriculum examinations (quizzes, midterms, practicals, endterms) and execute transactional result publications."
        actions={
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Examination
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={exams}
        loading={loading}
        searchPlaceholder="Search exams by name, course code, type..."
      />

      {/* Modal: Create Exam */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Schedule New Examination"
        maxWidth="max-w-lg"
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
              form="create-exam-form"
              disabled={formLoading}
              className="px-4 py-2 text-[13px] font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg shadow-sm"
            >
              {formLoading ? 'Creating in MySQL...' : 'Create Examination'}
            </button>
          </>
        }
      >
        <form id="create-exam-form" onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Course Offering *</label>
            <select
              required
              value={formData.offeringId}
              onChange={(e) => setFormData({ ...formData, offeringId: e.target.value })}
              className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
            >
              {offerings.map((o) => (
                <option key={o.offering_id} value={o.offering_id}>
                  {o.course_code}: {o.course_name} (Sec {o.section}) — {o.term_code}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Exam Title *</label>
            <input
              type="text"
              required
              value={formData.examName}
              onChange={(e) => setFormData({ ...formData, examName: e.target.value })}
              className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Assessment Type *</label>
              <select
                value={formData.examType}
                onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
              >
                <option value="Midterm">Midterm</option>
                <option value="Quiz">Quiz</option>
                <option value="Practical">Practical</option>
                <option value="Endterm">Endterm</option>
                <option value="Assignment">Assignment</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Exam Date *</label>
              <input
                type="date"
                required
                value={formData.examDate}
                onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Maximum Marks *</label>
              <input
                type="number"
                min="10"
                max="200"
                required
                value={formData.maxMarks}
                onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
                className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Grade Weightage (%) *</label>
              <input
                type="number"
                min="5"
                max="100"
                required
                value={formData.weightagePercentage}
                onChange={(e) => setFormData({ ...formData, weightagePercentage: e.target.value })}
                className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog: Publish Exam via sp_publish_exam */}
      <ConfirmationDialog
        isOpen={showPublishDialog}
        onClose={() => setShowPublishDialog(false)}
        onConfirm={handlePublishConfirm}
        loading={formLoading}
        title="Publish Examination Results?"
        message={`Are you sure you want to officially publish results for ${selectedExam?.exam_name}? This will execute stored procedure sp_publish_exam, set results as published, broadcast in-app student notifications, and log an immutable database audit entry.`}
        confirmLabel="Confirm & Publish"
      />

      {/* Confirmation Dialog: Delete Draft Exam */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        isDanger={true}
        loading={formLoading}
        title="Delete Draft Examination?"
        message="Are you sure you want to delete this draft examination? Any provisional marks entries will be removed."
        confirmLabel="Confirm Delete"
      />
    </div>
  );
}

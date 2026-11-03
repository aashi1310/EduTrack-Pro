import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resultService, examService, courseService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { GradeBadge, StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmationDialog } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import {
  CheckSquare,
  Save,
  Send,
  ArrowLeft,
  Award,
  AlertCircle
} from 'lucide-react';

export function MarksEntryPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(searchParams.get('examId') || '');
  const [examDetails, setExamDetails] = useState(null);
  const [marksheet, setMarksheet] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  const { showSuccess, showError } = useToast();

  // Load available exams
  useEffect(() => {
    async function loadExams() {
      try {
        const res = await examService.getExams(
          user?.role === 'FACULTY' ? { facultyId: user.facultyId } : {}
        );
        if (res.success && res.data.length > 0) {
          setExams(res.data);
          if (!selectedExamId) {
            setSelectedExamId(String(res.data[0].exam_id));
          }
        }
      } catch (err) {
        console.error('Failed to load exams:', err);
      }
    }
    loadExams();
  }, [user]);

  // Load marksheet for selected exam
  useEffect(() => {
    if (!selectedExamId) return;

    async function loadMarksheet() {
      setLoading(true);
      try {
        const res = await resultService.getExamMarksheet(selectedExamId);
        if (res.success) {
          setExamDetails(res.data.exam);
          const mapped = res.data.marksheet.map((item) => ({
            enrollmentId: item.enrollment_id,
            studentId: item.student_id,
            rollNumber: item.roll_number,
            studentName: item.student_name,
            departmentCode: item.department_code,
            marksObtained: item.marks_obtained !== null && item.marks_obtained !== undefined ? item.marks_obtained : '',
            percentage: item.percentage || 0,
            grade: item.grade || '—',
            remarks: item.remarks || '',
            isPublished: item.is_published
          }));
          setMarksheet(mapped);
        }
      } catch (err) {
        showError(err.message || 'Failed to load exam marksheet');
      } finally {
        setLoading(false);
      }
    }
    loadMarksheet();
  }, [selectedExamId]);

  const handleMarkChange = (index, value) => {
    const maxMarks = parseFloat(examDetails?.max_marks || 100);
    const marks = value === '' ? '' : parseFloat(value);

    // Calculate approximate grade locally for instant feedback
    let calculatedGrade = '—';
    let pct = 0;
    if (marks !== '' && !isNaN(marks)) {
      pct = (marks / maxMarks) * 100;
      if (pct >= 90) calculatedGrade = 'A+';
      else if (pct >= 80) calculatedGrade = 'A';
      else if (pct >= 70) calculatedGrade = 'B';
      else if (pct >= 60) calculatedGrade = 'C';
      else if (pct >= 50) calculatedGrade = 'D';
      else calculatedGrade = 'F';
    }

    setMarksheet((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        marksObtained: value,
        percentage: pct.toFixed(1),
        grade: calculatedGrade
      };
      return updated;
    });
  };

  const handleRemarksChange = (index, remarks) => {
    setMarksheet((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], remarks };
      return updated;
    });
  };

  const handleSaveMarks = async () => {
    setSaving(true);
    try {
      const entries = marksheet.map((item) => ({
        enrollmentId: item.enrollmentId,
        marksObtained: item.marksObtained === '' ? null : parseFloat(item.marksObtained),
        remarks: item.remarks
      }));

      const res = await resultService.saveMarks(selectedExamId, entries);
      if (res.success) {
        showSuccess('Student marks saved successfully! Database triggers verified grade rules.');
        // Reload marksheet
        const mRes = await resultService.getExamMarksheet(selectedExamId);
        if (mRes.success) {
          setMarksheet(mRes.data.marksheet.map((item) => ({
            enrollmentId: item.enrollment_id,
            studentId: item.student_id,
            rollNumber: item.roll_number,
            studentName: item.student_name,
            departmentCode: item.department_code,
            marksObtained: item.marks_obtained !== null && item.marks_obtained !== undefined ? item.marks_obtained : '',
            percentage: item.percentage || 0,
            grade: item.grade || '—',
            remarks: item.remarks || '',
            isPublished: item.is_published
          })));
        }
      }
    } catch (err) {
      showError(err.message || 'Validation error while saving marks.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishConfirm = async () => {
    setSaving(true);
    try {
      const res = await examService.publishExam(selectedExamId);
      if (res.success) {
        showSuccess('Examination published officially! Enrolled students can now view their grades.');
        setShowPublishDialog(false);
        // Refresh details
        const resE = await resultService.getExamMarksheet(selectedExamId);
        if (resE.success) {
          setExamDetails(resE.data.exam);
        }
      }
    } catch (err) {
      showError(err.message || 'Failed to publish exam');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Examination Marks Entry"
        subtitle="Record individual student marks, validate maximum score constraints via MySQL triggers, and publish grade reports."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/faculty/examinations')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold text-slate-700 bg-white border border-[#CBD5E1] rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              All Examinations
            </button>
            <button
              onClick={handleSaveMarks}
              disabled={saving || loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving to MySQL...' : 'Save Draft Marks'}
            </button>
            {examDetails?.status === 'Draft' && (
              <button
                onClick={() => setShowPublishDialog(true)}
                disabled={saving || loading}
                className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
              >
                <Send className="w-4 h-4" />
                Publish Results
              </button>
            )}
          </div>
        }
      />

      {/* Exam Selector & Details Header Card */}
      <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
              Select Examination:
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full md:w-96 px-3 py-2 text-[13px] bg-slate-50 border border-[#CBD5E1] rounded-lg font-semibold text-navy-900"
            >
              {exams.map((ex) => (
                <option key={ex.exam_id} value={ex.exam_id}>
                  {ex.course_code}: {ex.exam_name} ({ex.exam_type}) — Status: {ex.status}
                </option>
              ))}
            </select>
          </div>

          {examDetails && (
            <div className="flex flex-wrap items-center gap-3 text-[12px] text-slate-600">
              <span className="font-semibold text-slate-900">
                Max Marks: <strong className="text-brand-blue">{examDetails.max_marks}</strong>
              </span>
              <span>•</span>
              <span>Weightage: <strong>{examDetails.weightage_percentage}%</strong></span>
              <span>•</span>
              <span>Status: <StatusBadge status={examDetails.status} /></span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Marksheet Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-[#0F172A] flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-brand-blue" />
            Student Evaluation Marksheet ({marksheet.length} Enrolled Candidates)
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">
            Trigger <code className="text-brand-blue font-semibold">trg_result_validate</code> enforces marks &le; {examDetails?.max_marks}
          </span>
        </div>

        {loading ? (
          <div className="py-20">
            <LoadingSpinner text="Retrieving marksheet records..." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] text-slate-600 font-semibold uppercase">
                  <th className="px-4 py-3">Roll Number</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3 w-40">Marks Obtained</th>
                  <th className="px-4 py-3">Percentage</th>
                  <th className="px-4 py-3 text-center">Grade</th>
                  <th className="px-4 py-3">Instructor Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {marksheet.map((row, idx) => (
                  <tr key={row.enrollmentId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-brand-blue">{row.rollNumber}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{row.studentName}</td>
                    <td className="px-4 py-3 font-medium text-slate-600">{row.departmentCode}</td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max={examDetails?.max_marks || 100}
                          value={row.marksObtained}
                          onChange={(e) => handleMarkChange(idx, e.target.value)}
                          placeholder="0.0"
                          className="w-28 px-3 py-1.5 text-[13px] font-bold border border-[#CBD5E1] rounded-lg text-slate-900 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                        />
                        <span className="absolute left-20 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">
                          /{parseFloat(examDetails?.max_marks || 100).toFixed(0)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      {row.marksObtained !== '' ? `${row.percentage}%` : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <GradeBadge grade={row.grade !== '—' ? row.grade : null} />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={row.remarks}
                        onChange={(e) => handleRemarksChange(idx, e.target.value)}
                        placeholder="Evaluation comments..."
                        className="w-full px-3 py-1.5 text-[12px] border border-[#CBD5E1] rounded-lg text-slate-700 focus:outline-none focus:border-brand-blue"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Dialog: Publish Exam */}
      <ConfirmationDialog
        isOpen={showPublishDialog}
        onClose={() => setShowPublishDialog(false)}
        onConfirm={handlePublishConfirm}
        loading={saving}
        title="Publish Examination Results?"
        message={`Are you ready to officially publish results for ${examDetails?.exam_name}? This invokes stored procedure sp_publish_exam, generates student notifications, and locks in official grades.`}
        confirmLabel="Confirm Publication"
      />
    </div>
  );
}

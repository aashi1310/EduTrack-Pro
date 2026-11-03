import React, { useState, useEffect } from 'react';
import { resultService, examService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { GradeBadge, StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { Award, FileSpreadsheet, Download } from 'lucide-react';

export function ResultsManagementPage() {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState('');
  const [search, setSearch] = useState('');

  const { showError } = useToast();

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await resultService.getResults({
        examId: selectedExam || undefined,
        isPublished: user?.role === 'STUDENT' ? true : undefined
      });
      if (res.success) setResults(res.data);
    } catch (err) {
      showError(err.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [selectedExam]);

  useEffect(() => {
    async function loadExams() {
      try {
        const res = await examService.getExams();
        if (res.success) setExams(res.data);
      } catch (err) {
        console.error('Failed to load exams list:', err);
      }
    }
    loadExams();
  }, []);

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
          <div className="text-[11px] text-slate-400">{row.department_code}</div>
        </div>
      )
    },
    {
      header: 'Examination',
      accessor: 'exam_name',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-semibold text-slate-900">{val}</span>
          <div className="text-[11px] text-slate-500 font-medium">{row.course_code}: {row.course_name}</div>
        </div>
      )
    },
    {
      header: 'Exam Type',
      accessor: 'exam_type',
      render: (val) => <span className="font-medium text-slate-600">{val}</span>
    },
    {
      header: 'Marks Scored',
      accessor: 'marks_obtained',
      sortable: true,
      render: (val, row) => (
        <span className="font-bold text-slate-900">
          {val} <span className="text-slate-400 font-normal text-xs">/ {row.max_marks}</span>
        </span>
      )
    },
    {
      header: 'Percentage',
      accessor: 'percentage',
      sortable: true,
      render: (val) => <span className="font-semibold text-slate-800">{val}%</span>
    },
    {
      header: 'Official Grade',
      accessor: 'grade',
      sortable: true,
      render: (val) => <GradeBadge grade={val} />
    },
    {
      header: 'Remarks',
      accessor: 'remarks',
      render: (val) => <span className="text-slate-500 text-[12px]">{val || '—'}</span>
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Results & Grade Reports"
        subtitle="View officially calculated and published examination grades computed from MySQL database views."
      />

      <DataTable
        columns={columns}
        data={results}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search results by student roll, name, exam..."
        filterSlot={
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="px-3 py-2 text-[12px] bg-white border border-[#CBD5E1] rounded-lg text-slate-700"
          >
            <option value="">All Examinations</option>
            {exams.map((ex) => (
              <option key={ex.exam_id} value={ex.exam_id}>
                {ex.course_code}: {ex.exam_name}
              </option>
            ))}
          </select>
        }
      />
    </div>
  );
}

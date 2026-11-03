import React, { useState, useEffect } from 'react';
import { courseService, deptService, facultyService, termService } from '../../services/api';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import {
  BookOpen,
  Plus,
  Layers,
  Edit2,
  Users,
  CalendarCheck,
  CheckCircle2
} from 'lucide-react';

export function CourseManagementPage() {
  const [activeTab, setActiveTab] = useState('offerings'); // 'offerings' | 'catalogue'
  const [courses, setCourses] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showOfferingModal, setShowOfferingModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Forms
  const [courseForm, setCourseForm] = useState({
    courseCode: '',
    courseName: '',
    departmentId: '',
    credits: 3,
    description: ''
  });

  const [offeringForm, setOfferingForm] = useState({
    courseId: '',
    termId: '',
    facultyId: '',
    section: 'A',
    capacity: 40
  });

  const { showSuccess, showError } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [coursesRes, offeringsRes, deptsRes, facultyRes, termsRes] = await Promise.all([
        courseService.getCourses(),
        courseService.getOfferings(),
        deptService.getDepartments(),
        facultyService.getFacultyList(),
        termService.getTerms()
      ]);

      if (coursesRes.success) setCourses(coursesRes.data);
      if (offeringsRes.success) setOfferings(offeringsRes.data);
      if (deptsRes.success) setDepartments(deptsRes.data);
      if (facultyRes.success) setFaculty(facultyRes.data);
      if (termsRes.success) setTerms(termsRes.data);
    } catch (err) {
      showError(err.message || 'Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCourseSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await courseService.createCourse(courseForm);
      if (res.success) {
        showSuccess('Course created successfully in catalogue!');
        setShowCourseModal(false);
        loadData();
      }
    } catch (err) {
      showError(err.message || 'Failed to create course');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreateOfferingSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await courseService.createOffering(offeringForm);
      if (res.success) {
        showSuccess('Course offering scheduled successfully!');
        setShowOfferingModal(false);
        loadData();
      }
    } catch (err) {
      showError(err.message || 'Failed to create course offering');
    } finally {
      setFormLoading(false);
    }
  };

  const offeringColumns = [
    {
      header: 'Course Code',
      accessor: 'course_code',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-bold text-brand-blue">{val}</span>
          <div className="text-[11px] text-slate-500 font-medium">Sec {row.section}</div>
        </div>
      )
    },
    {
      header: 'Course Name',
      accessor: 'course_name',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-semibold text-[#0F172A]">{val}</span>
          <div className="text-[11px] text-slate-400">{row.department_name}</div>
        </div>
      )
    },
    {
      header: 'Academic Term',
      accessor: 'term_code',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-semibold text-slate-800">{val}</span>
          <div className="text-[11px] text-slate-400">{row.term_name}</div>
        </div>
      )
    },
    {
      header: 'Assigned Instructor',
      accessor: 'faculty_name',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-medium text-slate-800">{val}</span>
          <div className="text-[11px] text-slate-400">{row.employee_code}</div>
        </div>
      )
    },
    {
      header: 'Enrollment Capacity',
      accessor: 'enrolled_count',
      render: (val, row) => (
        <div>
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <span>{val}</span>
            <span className="text-slate-400 text-xs">/ {row.capacity} enrolled</span>
          </div>
          <div className="w-28 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
            <div
              className={`h-full ${val >= row.capacity ? 'bg-red-500' : 'bg-brand-blue'}`}
              style={{ width: `${Math.min(100, (val / row.capacity) * 100)}%` }}
            ></div>
          </div>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'offering_status',
      render: (val) => <StatusBadge status={val} />
    }
  ];

  const catalogueColumns = [
    {
      header: 'Code',
      accessor: 'course_code',
      sortable: true,
      render: (val) => <span className="font-bold text-navy-900">{val}</span>
    },
    {
      header: 'Course Name',
      accessor: 'course_name',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-semibold text-slate-900">{val}</span>
          <div className="text-[11px] text-slate-500 line-clamp-1">{row.description}</div>
        </div>
      )
    },
    {
      header: 'Department',
      accessor: 'department_code',
      render: (val, row) => (
        <span className="font-medium text-slate-700">{row.department_name} ({val})</span>
      )
    },
    {
      header: 'Credits',
      accessor: 'credits',
      sortable: true,
      render: (val) => <span className="font-bold text-brand-blue">{val} Credits</span>
    },
    {
      header: 'Total Offerings',
      accessor: 'total_offerings_count',
      render: (val) => <span className="font-semibold text-slate-700">{val} delivered</span>
    },
    {
      header: 'Status',
      accessor: 'is_active',
      render: (val) => <StatusBadge status={val ? 'Active' : 'Inactive'} />
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Management & Offerings"
        subtitle="Manage master course catalogue, credit requirements, faculty assignments, and term sections."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCourseForm({
                  courseCode: '',
                  courseName: '',
                  departmentId: departments[0]?.department_id || 1,
                  credits: 3,
                  description: ''
                });
                setShowCourseModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold text-slate-700 bg-white border border-[#CBD5E1] rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 text-slate-500" />
              New Catalogue Course
            </button>
            <button
              onClick={() => {
                setOfferingForm({
                  courseId: courses[0]?.course_id || 1,
                  termId: terms[0]?.term_id || 1,
                  facultyId: faculty[0]?.faculty_id || 1,
                  section: 'A',
                  capacity: 40
                });
                setShowOfferingModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg shadow-md transition-colors"
            >
              <Layers className="w-4 h-4" />
              Schedule Term Offering
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
        <button
          onClick={() => setActiveTab('offerings')}
          className={`flex items-center gap-2 px-4 py-2 text-[13px] font-semibold rounded-lg transition-colors ${
            activeTab === 'offerings'
              ? 'bg-brand-blue text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          Active Course Offerings ({offerings.length})
        </button>
        <button
          onClick={() => setActiveTab('catalogue')}
          className={`flex items-center gap-2 px-4 py-2 text-[13px] font-semibold rounded-lg transition-colors ${
            activeTab === 'catalogue'
              ? 'bg-brand-blue text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Course Catalogue ({courses.length})
        </button>
      </div>

      {activeTab === 'offerings' ? (
        <DataTable
          columns={offeringColumns}
          data={offerings}
          loading={loading}
          searchPlaceholder="Search offerings by code, course name, instructor..."
        />
      ) : (
        <DataTable
          columns={catalogueColumns}
          data={courses}
          loading={loading}
          searchPlaceholder="Search catalogue courses by code or title..."
        />
      )}

      {/* Modal: New Catalogue Course */}
      <Modal
        isOpen={showCourseModal}
        onClose={() => setShowCourseModal(false)}
        title="Add Course to Catalogue"
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowCourseModal(false)}
              className="px-4 py-2 text-[13px] font-medium text-slate-700 bg-white border border-[#CBD5E1] rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-course-form"
              disabled={formLoading}
              className="px-4 py-2 text-[13px] font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg shadow-sm"
            >
              {formLoading ? 'Adding...' : 'Add Course'}
            </button>
          </>
        }
      >
        <form id="create-course-form" onSubmit={handleCreateCourseSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Course Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. CS405"
                value={courseForm.courseCode}
                onChange={(e) => setCourseForm({ ...courseForm, courseCode: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Credits (1 - 6) *</label>
              <input
                type="number"
                min="1"
                max="6"
                required
                value={courseForm.credits}
                onChange={(e) => setCourseForm({ ...courseForm, credits: e.target.value })}
                className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Course Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Distributed Computing"
              value={courseForm.courseName}
              onChange={(e) => setCourseForm({ ...courseForm, courseName: e.target.value })}
              className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Department *</label>
            <select
              required
              value={courseForm.departmentId}
              onChange={(e) => setCourseForm({ ...courseForm, departmentId: e.target.value })}
              className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
            >
              {departments.map((d) => (
                <option key={d.department_id} value={d.department_id}>
                  {d.department_name} ({d.department_code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Description</label>
            <textarea
              rows={3}
              value={courseForm.description}
              onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
              placeholder="Syllabus overview and prerequisites..."
              className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
            />
          </div>
        </form>
      </Modal>

      {/* Modal: Schedule Term Offering */}
      <Modal
        isOpen={showOfferingModal}
        onClose={() => setShowOfferingModal(false)}
        title="Schedule Course Offering"
        maxWidth="max-w-lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowOfferingModal(false)}
              className="px-4 py-2 text-[13px] font-medium text-slate-700 bg-white border border-[#CBD5E1] rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-offering-form"
              disabled={formLoading}
              className="px-4 py-2 text-[13px] font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg shadow-sm"
            >
              {formLoading ? 'Scheduling...' : 'Confirm Offering'}
            </button>
          </>
        }
      >
        <form id="create-offering-form" onSubmit={handleCreateOfferingSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Select Course *</label>
            <select
              required
              value={offeringForm.courseId}
              onChange={(e) => setOfferingForm({ ...offeringForm, courseId: e.target.value })}
              className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
            >
              {courses.map((c) => (
                <option key={c.course_id} value={c.course_id}>
                  {c.course_code}: {c.course_name} ({c.credits} Credits)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Academic Term *</label>
              <select
                required
                value={offeringForm.termId}
                onChange={(e) => setOfferingForm({ ...offeringForm, termId: e.target.value })}
                className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
              >
                {terms.map((t) => (
                  <option key={t.term_id} value={t.term_id}>
                    {t.term_code} - {t.term_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Faculty Instructor *</label>
              <select
                required
                value={offeringForm.facultyId}
                onChange={(e) => setOfferingForm({ ...offeringForm, facultyId: e.target.value })}
                className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
              >
                {faculty.map((f) => (
                  <option key={f.faculty_id} value={f.faculty_id}>
                    {f.full_name} ({f.employee_code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Section (e.g. A, B) *</label>
              <input
                type="text"
                required
                value={offeringForm.section}
                onChange={(e) => setOfferingForm({ ...offeringForm, section: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Capacity Limit *</label>
              <input
                type="number"
                min="5"
                max="100"
                required
                value={offeringForm.capacity}
                onChange={(e) => setOfferingForm({ ...offeringForm, capacity: e.target.value })}
                className="w-full px-3 py-2 text-[13px] border border-[#CBD5E1] rounded-lg"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

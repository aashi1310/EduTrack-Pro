import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  ShieldCheck, 
  GraduationCap, 
  Briefcase, 
  Clock,
  Edit2
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { profileService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function UserProfilePage() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const { addToast, showSuccess, showError } = useToast();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await profileService.getProfile();
      setProfile(res.data);
      setPhone(res.data?.student_phone || res.data?.faculty_phone || '');
    } catch (err) {
      addToast(err.message || 'Failed to fetch user profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await profileService.updateProfile({ phone });
      addToast('Profile updated successfully', 'success');
      setIsEditModalOpen(false);
      fetchProfile();
    } catch (err) {
      addToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getFullName = () => {
    if (!profile) return 'User';
    if (profile.role === 'STUDENT') {
      return `${profile.student_first || ''} ${profile.student_last || ''}`.trim() || profile.email;
    }
    if (profile.role === 'FACULTY') {
      return `${profile.faculty_first || ''} ${profile.faculty_last || ''}`.trim() || profile.email;
    }
    return 'System Administrator';
  };

  const getDepartment = () => {
    if (profile?.role === 'STUDENT') return profile.student_dept;
    if (profile?.role === 'FACULTY') return profile.faculty_dept;
    return 'Institutional Operations';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-royal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal information, institutional credentials, and contact details"
        actions={
          (profile?.role === 'STUDENT' || profile?.role === 'FACULTY') && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-royal-600 rounded-lg hover:bg-royal-700 transition-colors shadow-sm"
            >
              <Edit2 className="w-4 h-4" />
              Edit Contact Info
            </button>
          )
        }
      />

      {/* Profile Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-navy-900 text-white flex items-center justify-center text-2xl font-bold font-heading shadow-md">
            {getFullName().charAt(0)}
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold text-navy-900">{getFullName()}</h2>
              <StatusBadge status={profile?.role} />
              {profile?.academic_status && (
                <StatusBadge status={profile.academic_status} />
              )}
            </div>
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              {profile?.email}
            </p>
            <p className="text-xs text-slate-400">
              Account Created: {new Date(profile?.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic / Institutional Details */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-navy-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            {profile?.role === 'STUDENT' ? (
              <GraduationCap className="w-4 h-4 text-royal-600" />
            ) : profile?.role === 'FACULTY' ? (
              <Briefcase className="w-4 h-4 text-royal-600" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-royal-600" />
            )}
            Institutional Information
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Department</span>
              <span className="font-medium text-slate-800">{getDepartment() || 'N/A'}</span>
            </div>

            {profile?.role === 'STUDENT' && (
              <>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">Roll Number</span>
                  <span className="font-mono font-medium text-navy-900">{profile.roll_number}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">Current Semester</span>
                  <span className="font-medium text-slate-800">Semester {profile.current_semester}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">Admission Date</span>
                  <span className="text-slate-800">
                    {profile.admission_date ? new Date(profile.admission_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </>
            )}

            {profile?.role === 'FACULTY' && (
              <>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">Employee Code</span>
                  <span className="font-mono font-medium text-navy-900">{profile.employee_code}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">Designation</span>
                  <span className="font-medium text-slate-800">{profile.designation}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">Joining Date</span>
                  <span className="text-slate-800">
                    {profile.joining_date ? new Date(profile.joining_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </>
            )}

            {profile?.role === 'ADMIN' && (
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Privilege Level</span>
                <span className="font-semibold text-emerald-700">SUPER_ADMIN (Full Control)</span>
              </div>
            )}
          </div>
        </div>

        {/* Contact & Personal Information */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-navy-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-royal-600" />
            Contact & Personal Details
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Institutional Email</span>
              <span className="font-medium text-slate-800">{profile?.email}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Phone Number</span>
              <span className="font-medium text-slate-800">
                {profile?.student_phone || profile?.faculty_phone || (
                  <span className="text-slate-400 italic">Not provided</span>
                )}
              </span>
            </div>

            {profile?.role === 'STUDENT' && (
              <>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">Gender</span>
                  <span className="text-slate-800 capitalize">{profile.gender || 'Not specified'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">Date of Birth</span>
                  <span className="text-slate-800">
                    {profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </>
            )}

            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Last Login</span>
              <span className="text-slate-600">
                {profile?.last_login ? new Date(profile.last_login).toLocaleString() : 'First Session'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Contact Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Update Contact Details"
      >
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-royal-500 focus:outline-none"
            />
            <p className="text-xs text-slate-400 mt-1">
              Used for university emergency notices and academic communications.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-xs font-medium text-white bg-royal-600 hover:bg-royal-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

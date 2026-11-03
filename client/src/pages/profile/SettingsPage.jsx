import React, { useState } from 'react';
import { 
  KeyRound, 
  ShieldCheck, 
  Bell, 
  Database, 
  Server, 
  CheckCircle2, 
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { profileService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export function SettingsPage() {
  const { user } = useAuth();
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Preference toggles
  const [prefs, setPrefs] = useState({
    attendanceAlerts: true,
    examNotifications: true,
    resultPublications: true,
    weeklySummaries: false,
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword.length < 6) {
      showWarning('New password must be at least 6 characters long');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showWarning('New passwords do not match');
      return;
    }

    try {
      setSavingPassword(true);
      await profileService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      showSuccess('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      showError(err.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const togglePref = (key) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    showInfo('Notification preferences saved');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Settings & Security"
        subtitle="Configure your account credentials, security preferences, and system parameters"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Password & Notifications (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          {/* Change Password Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-navy-900 flex items-center gap-2 pb-4 border-b border-slate-100">
              <KeyRound className="w-5 h-5 text-royal-600" />
              Change Password
            </h3>

            <form onSubmit={handlePasswordChange} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-royal-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  New Password (minimum 6 characters)
                </label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    required
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-royal-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Repeat new password"
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-royal-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-4 py-2 text-sm font-medium text-white bg-royal-600 hover:bg-royal-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {savingPassword ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-navy-900 flex items-center gap-2 pb-4 border-b border-slate-100">
              <Bell className="w-5 h-5 text-royal-600" />
              Notification Channels
            </h3>

            <div className="space-y-4 mt-4 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <div>
                  <div className="font-medium text-slate-800">Attendance Shortage Alerts</div>
                  <div className="text-xs text-slate-500">Receive alert when attendance dips below 75% threshold</div>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.attendanceAlerts}
                  onChange={() => togglePref('attendanceAlerts')}
                  className="w-4 h-4 text-royal-600 rounded border-slate-300 focus:ring-royal-500"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <div>
                  <div className="font-medium text-slate-800">Exam Schedules & Notices</div>
                  <div className="text-xs text-slate-500">Notices when midterms, practicals, or endterms are scheduled</div>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.examNotifications}
                  onChange={() => togglePref('examNotifications')}
                  className="w-4 h-4 text-royal-600 rounded border-slate-300 focus:ring-royal-500"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <div>
                  <div className="font-medium text-slate-800">Result Publications</div>
                  <div className="text-xs text-slate-500">Immediate notice upon official result publication</div>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.resultPublications}
                  onChange={() => togglePref('resultPublications')}
                  className="w-4 h-4 text-royal-600 rounded border-slate-300 focus:ring-royal-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: DBMS & Architecture Information */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-navy-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Database className="w-4 h-4 text-royal-600" />
              DBMS Specifications
            </h3>

            <div className="space-y-3 mt-3 text-xs">
              <div>
                <span className="text-slate-400 block">Database Engine</span>
                <span className="font-semibold text-navy-900">MySQL 26.10 LTS / InnoDB</span>
              </div>
              <div>
                <span className="text-slate-400 block">Encoding</span>
                <span className="font-mono text-slate-800">utf8mb4_unicode_ci</span>
              </div>
              <div>
                <span className="text-slate-400 block">Normalization</span>
                <span className="font-semibold text-emerald-700">3NF Normalized (16 Tables)</span>
              </div>
              <div>
                <span className="text-slate-400 block">Isolation Level</span>
                <span className="font-mono text-slate-800">REPEATABLE READ</span>
              </div>
              <div>
                <span className="text-slate-400 block">Concurrency Control</span>
                <span className="font-mono text-royal-700">Row-Level SELECT FOR UPDATE</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-navy-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <ShieldCheck className="w-4 h-4 text-royal-600" />
              Security Architecture
            </h3>

            <div className="space-y-3 mt-3 text-xs">
              <div>
                <span className="text-slate-400 block">Password Hashing</span>
                <span className="font-mono text-slate-800">bcrypt (10 salt rounds)</span>
              </div>
              <div>
                <span className="text-slate-400 block">Session Token</span>
                <span className="font-mono text-slate-800">JWT (HS256)</span>
              </div>
              <div>
                <span className="text-slate-400 block">API Security</span>
                <span className="font-mono text-slate-800">Helmet, CORS, Prepared SQL</span>
              </div>
              <div>
                <span className="text-slate-400 block">Active Role</span>
                <span className="font-semibold text-navy-900">{user?.role}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

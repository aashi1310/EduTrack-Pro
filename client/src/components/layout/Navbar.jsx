import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationService, termService } from '../../services/api';
import {
  Bell,
  ChevronRight,
  User,
  LogOut,
  Settings,
  Calendar
} from 'lucide-react';

export function Navbar({ collapsed }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeTerm, setActiveTerm] = useState(null);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Load unread notifications
  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await notificationService.getNotifications();
        if (res.success && res.data) {
          setNotifications(res.data.notifications || []);
          setUnreadCount(res.data.unreadCount || 0);
        }
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    }
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Load active academic term
  useEffect(() => {
    async function loadActiveTerm() {
      try {
        const res = await termService.getTerms();
        if (res.success && Array.isArray(res.data)) {
          const active = res.data.find((t) => t.is_active);
          if (active) setActiveTerm(active.term_name);
        }
      } catch (err) {
        console.error('Failed to load active term:', err);
      }
    }
    loadActiveTerm();
  }, []);

  // Close popovers on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  // Build Breadcrumbs from URL
  const pathnames = location.pathname.split('/').filter((x) => x);
  const breadcrumbItems = pathnames.map((segment, index) => {
    const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
    const isLast = index === pathnames.length - 1;
    const formatted = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
    return { name: formatted, path: routeTo, isLast };
  });

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-[68px] bg-white border-b border-[#E2E8F0] transition-all duration-300 flex items-center justify-between px-6 ${
        collapsed ? 'left-[76px]' : 'left-[245px]'
      }`}
    >
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-[13px] text-[#64748B]">
        <Link to="/" className="hover:text-brand-blue font-medium transition-colors">
          EduTrack
        </Link>
        {breadcrumbItems.map((item, idx) => (
          <React.Fragment key={item.path || idx}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            {item.isLast ? (
              <span className="font-semibold text-[#0F172A]">{item.name}</span>
            ) : (
              <Link to={item.path} className="hover:text-brand-blue font-medium transition-colors">
                {item.name}
              </Link>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Right Action Icons: Active Term, Notifications, User Menu */}
      <div className="flex items-center gap-4">
        {/* Active Term Pill */}
        {activeTerm && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-brand-blue text-[12px] font-medium rounded-full border border-blue-200/60">
            <Calendar className="w-3.5 h-3.5" />
            <span>{activeTerm} (Active)</span>
          </div>
        )}

        {/* Notification Bell with Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-dropdown border border-[#E2E8F0] overflow-hidden z-50">
              <div className="p-3.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
                <div className="text-[13px] font-bold text-[#0F172A]">Notifications ({unreadCount} unread)</div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-semibold text-brand-blue hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-[12px] text-slate-400">No notifications yet.</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.notification_id}
                      className={`p-3 text-[12px] hover:bg-slate-50 transition-colors ${
                        !n.is_read ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-[#0F172A]">{n.title}</div>
                        {!n.is_read && <span className="w-2 h-2 rounded-full bg-brand-blue flex-shrink-0 mt-1"></span>}
                      </div>
                      <div className="text-slate-600 mt-1 text-[11px] leading-relaxed">{n.message}</div>
                      <div className="text-[10px] text-slate-400 mt-1.5">
                        {new Date(n.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 text-center border-t border-[#E2E8F0] bg-[#F8FAFC]">
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-[12px] font-medium text-brand-blue hover:underline"
                >
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-navy-900 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[12px] font-semibold text-[#0F172A] leading-tight truncate max-w-[130px]">
                {user?.name}
              </span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">
                {user?.role}
              </span>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-dropdown border border-[#E2E8F0] py-1.5 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <div className="text-[12px] font-bold text-[#0F172A] truncate">{user?.name}</div>
                <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
              </div>

              <Link
                to={user?.role === 'STUDENT' ? '/student/profile' : '/profile'}
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-[12px] text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                My Profile
              </Link>

              <Link
                to="/settings"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-[12px] text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                Settings
              </Link>

              <div className="border-t border-slate-100 my-1"></div>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-[12px] text-rose-600 hover:bg-rose-50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

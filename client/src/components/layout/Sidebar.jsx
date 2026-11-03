import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  BookOpen,
  Calendar,
  ClipboardList,
  CalendarCheck,
  Award,
  FileSpreadsheet,
  BarChart3,
  Bell,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  CheckSquare
} from 'lucide-react';

export function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const role = user?.role || 'STUDENT';

  // Role-Specific Navigation Menus
  const adminNav = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Faculty', path: '/admin/faculty', icon: UserCheck },
    { name: 'Departments', path: '/admin/departments', icon: Building2 },
    { name: 'Courses', path: '/admin/courses', icon: BookOpen },
    { name: 'Academic Terms', path: '/admin/terms', icon: Calendar },
    { name: 'Enrollments', path: '/admin/enrollments', icon: ClipboardList },
    { name: 'Attendance', path: '/admin/attendance', icon: CalendarCheck },
    { name: 'Examinations', path: '/admin/examinations', icon: Award },
    { name: 'Results', path: '/admin/results', icon: FileSpreadsheet },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldCheck },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const facultyNav = [
    { name: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
    { name: 'My Courses', path: '/faculty/courses', icon: BookOpen },
    { name: 'Students', path: '/faculty/students', icon: Users },
    { name: 'Attendance', path: '/faculty/attendance', icon: CalendarCheck },
    { name: 'Examinations', path: '/faculty/examinations', icon: Award },
    { name: 'Marks Entry', path: '/faculty/marks-entry', icon: CheckSquare },
    { name: 'Results', path: '/faculty/results', icon: FileSpreadsheet },
    { name: 'Analytics', path: '/faculty/analytics', icon: BarChart3 },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const studentNav = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', path: '/student/profile', icon: User },
    { name: 'My Courses', path: '/student/courses', icon: BookOpen },
    { name: 'My Attendance', path: '/student/attendance', icon: CalendarCheck },
    { name: 'Examinations', path: '/student/examinations', icon: Award },
    { name: 'My Results', path: '/student/results', icon: FileSpreadsheet },
    { name: 'Academic Analytics', path: '/student/analytics', icon: BarChart3 },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  let navItems = studentNav;
  if (role === 'ADMIN') navItems = adminNav;
  if (role === 'FACULTY') navItems = facultyNav;

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out bg-[#0F1F46] border-r border-[#1E3A8A]/40 flex flex-col justify-between ${
        collapsed ? 'w-[76px]' : 'w-[245px]'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-[68px] flex items-center px-4 border-b border-blue-900/40 justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-blue-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-[17px] text-white tracking-tight leading-none">
                  EduTrack <span className="text-blue-400">Pro</span>
                </span>
                <span className="text-[10px] text-blue-200/60 uppercase font-semibold tracking-wider mt-1">
                  Academic SaaS
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-blue-300/70 hover:text-white p-1.5 rounded-lg hover:bg-blue-900/40 transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={collapsed ? item.name : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-blue text-white shadow-md'
                      : 'text-blue-200/70 hover:text-white hover:bg-blue-900/30'
                  } ${collapsed ? 'justify-center px-0' : ''}`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Status & Logout Footer */}
      <div className="p-3 border-t border-blue-900/40 bg-[#0A1633]">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-full bg-blue-800 text-blue-200 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0 border border-blue-600/30">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-white truncate">{user?.name}</div>
              <div className="text-[10px] text-blue-300/70 font-medium tracking-wide uppercase">{user?.role}</div>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={logout}
              className="text-blue-300/60 hover:text-rose-400 p-1.5 rounded-lg hover:bg-blue-900/40 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

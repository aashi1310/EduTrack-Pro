import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  GraduationCap,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  CheckCircle,
  Database,
  ArrowRight,
  BookOpen,
  Loader2
} from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('admin@edutrack.edu');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const { login } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const performLogin = useCallback(async (emailVal, passwordVal) => {
    if (!emailVal || !passwordVal) {
      showError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      const user = await login(emailVal, passwordVal);
      showSuccess(`Welcome back, ${user.name}!`);
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'FACULTY') {
        navigate('/faculty/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      showError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  }, [login, navigate, showSuccess, showError]);

  // Demo role buttons: fill credentials AND immediately submit login
  // Credentials map to real DB records (Bennett-style emails updated in DB)
  const handleDemoLogin = async (role) => {
    let demoEmail = '';
    let demoPassword = '';
    if (role === 'ADMIN') {
      // user_id: 1 — System Administrator
      demoEmail = 'admin@edutrack.edu';
      demoPassword = 'Admin@123';
    } else if (role === 'FACULTY') {
      // user_id: 2, faculty_id: 1 — Reena Gill
      demoEmail = 'reena.gill@bennett.edu.in';
      demoPassword = 'Faculty@123';
    } else if (role === 'STUDENT') {
      // user_id: 8, student_id: 1 — Aashika Jain, E23CSEU0001
      demoEmail = 'e23cseu0001@bennett.edu.in';
      demoPassword = 'Student@123';
    }
    // Update visible form fields so the user can see what's being used
    setEmail(demoEmail);
    setPassword(demoPassword);
    // Then immediately authenticate — no need to click Sign In separately
    await performLogin(demoEmail, demoPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F1F5F9]">
      {/* Left Section: Institutional Branding & Academic SaaS Hero */}
      <div className="md:w-5/12 bg-gradient-to-br from-[#0F1F46] via-[#172554] to-[#1E3A8A] text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle Decorative Background Circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>

        {/* Brand Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-blue to-blue-400 flex items-center justify-center text-white shadow-lg">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[22px] font-extrabold tracking-tight text-white">
                EduTrack <span className="text-blue-400">Pro</span>
              </span>
              <div className="text-[11px] font-semibold tracking-wider text-blue-200/70 uppercase">
                Enterprise University ERP
              </div>
            </div>
          </div>
        </div>

        {/* Main Pitch */}
        <div className="my-10 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-[11px] font-semibold mb-4">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>Advanced DBMS Architecture</span>
          </div>

          <h2 className="text-[28px] md:text-[34px] font-bold text-white leading-tight">
            Advanced Student Academic Management & Analytics
          </h2>

          <p className="mt-4 text-[13px] text-blue-100/80 leading-relaxed">
            Centralized university portal digitizing student profiles, course registrations, attendance metrics,
            examinations, result publications, and institutional analytics backed by MySQL 8.4 InnoDB.
          </p>

          {/* Value Props */}
          <div className="mt-6 space-y-2.5 text-[12px] text-blue-200/90">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Full ACID compliance with row-level locked enrollments</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Automated grade calculations & shortage triggers</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Role-based access for Administrators, Faculty & Students</span>
            </div>
          </div>
        </div>

        {/* Fast Demo Accounts Helper */}
        <div className="relative z-10 bg-blue-950/60 border border-blue-800/50 p-4 rounded-xl backdrop-blur-md">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-300 mb-2.5 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            Quick Demo Login Accounts:
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('ADMIN')}
              className="px-2.5 py-1.5 rounded-lg bg-blue-900/50 hover:bg-blue-800 disabled:opacity-50 text-[11px] font-semibold text-white border border-blue-700/50 transition-colors text-center flex items-center justify-center gap-1"
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              Admin Demo
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('FACULTY')}
              className="px-2.5 py-1.5 rounded-lg bg-blue-900/50 hover:bg-blue-800 disabled:opacity-50 text-[11px] font-semibold text-white border border-blue-700/50 transition-colors text-center flex items-center justify-center gap-1"
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              Faculty Demo
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('STUDENT')}
              className="px-2.5 py-1.5 rounded-lg bg-blue-900/50 hover:bg-blue-800 disabled:opacity-50 text-[11px] font-semibold text-white border border-blue-700/50 transition-colors text-center flex items-center justify-center gap-1"
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              Student Demo
            </button>
          </div>
        </div>
      </div>

      {/* Right Section: Clean White Authentication Form */}
      <div className="md:w-7/12 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-8 md:p-10">
          <div>
            <h1 className="text-[26px] font-bold text-[#0F172A] tracking-tight">Welcome Back</h1>
            <p className="mt-1 text-[13px] text-[#64748B]">
              Enter your verified credentials to access the academic portal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-[12px] font-semibold text-[#0F172A] uppercase tracking-wider mb-1.5">
                University Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@edutrack.edu"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-[13px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[#0F172A] placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[12px] font-semibold text-[#0F172A] uppercase tracking-wider">
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    showError('Password resets are handled by your institutional administrator.');
                  }}
                  className="text-[11px] font-medium text-brand-blue hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 text-[13px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[#0F172A] placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-blue border-slate-300 focus:ring-brand-blue"
                />
                <span className="text-[12px] text-slate-600 font-medium">Remember this workstation</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-navy-900 hover:bg-navy-800 text-white font-semibold text-[13px] shadow-md hover:shadow-lg disabled:opacity-60 transition-all flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <span>Authenticating with MySQL...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer notice */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              EduTrack Pro Academic System • Authorized University Personnel Only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

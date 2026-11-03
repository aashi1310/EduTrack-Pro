import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  Calendar,
  Award,
  AlertTriangle,
  BookOpen,
  Info,
  Clock
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { notificationService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export function NotificationListPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const { showSuccess, showError } = useToast();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications();
      setNotifications(res.data?.notifications || res.data || []);
    } catch (err) {
      showError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: 1 } : n));
      showSuccess('Marked as read');
    } catch (err) {
      showError(err.message || 'Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      showSuccess('All notifications marked as read');
    } catch (err) {
      showError(err.message || 'Failed to mark all as read');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'attendance_shortage':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'result_published':
        return <Award className="w-5 h-5 text-emerald-600" />;
      case 'exam_scheduled':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'enrollment':
        return <BookOpen className="w-5 h-5 text-indigo-600" />;
      default:
        return <Info className="w-5 h-5 text-slate-500" />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle="Stay updated with university notices, exam announcements, results, and alerts"
        actions={
          unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-navy-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            >
              <CheckCheck className="w-4 h-4 text-royal-600" />
              Mark All as Read ({unreadCount})
            </button>
          )
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setFilter('all')}
          className={`pb-3 text-sm font-medium border-b-2 px-3 transition-colors ${filter === 'all'
              ? 'border-royal-600 text-royal-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`pb-3 text-sm font-medium border-b-2 px-3 transition-colors flex items-center gap-2 ${filter === 'unread'
              ? 'border-royal-600 text-royal-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
          Unread
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notification List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-royal-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          <EmptyState
            title={filter === 'unread' ? 'No unread notifications' : 'No notifications found'}
            description={filter === 'unread' ? 'You have caught up with all academic updates.' : 'There are no active notifications for your account.'}
            icon={Bell}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((n) => (
            <div
              key={n.notification_id}
              className={`flex items-start justify-between p-4 rounded-xl border transition-all ${!n.is_read
                  ? 'bg-blue-50/40 border-blue-200 shadow-sm'
                  : 'bg-white border-slate-200'
                }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-lg shrink-0 ${!n.is_read ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>
                  {getNotificationIcon(n.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm ${!n.is_read ? 'font-semibold text-navy-900' : 'font-medium text-slate-800'}`}>
                      {n.title}
                    </h4>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-royal-600"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {n.message}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                    <span className="capitalize px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-mono text-[10px]">
                      {n.type?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {!n.is_read && (
                <button
                  onClick={() => handleMarkAsRead(n.notification_id)}
                  title="Mark as read"
                  className="p-1.5 text-slate-400 hover:text-royal-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 shrink-0"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

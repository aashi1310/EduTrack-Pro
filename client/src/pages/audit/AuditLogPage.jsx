import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Filter,
  Eye,
  RefreshCw,
  Clock,
  Database,
  ArrowRight
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { auditService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0 });
  const [filters, setFilters] = useState({
    actionType: '',
    tableName: '',
    startDate: '',
    endDate: '',
  });

  const [selectedLog, setSelectedLog] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { showSuccess, showError } = useToast();

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.actionType && { actionType: filters.actionType }),
        ...(filters.tableName && { tableName: filters.tableName }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      };

      const res = await auditService.getAuditLogs(params);
      setLogs(res.data || []);
      const paginationData = res.pagination || res.meta;
      if (paginationData) {
        setPagination(prev => ({
          ...prev,
          total: paginationData.total || 0,
        }));
      }
    } catch (err) {
      showError(err.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [pagination.page, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({
      actionType: '',
      tableName: '',
      startDate: '',
      endDate: '',
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const openLogDetails = (log) => {
    setSelectedLog(log);
    setIsDetailModalOpen(true);
  };

  const getActionBadgeColor = (action) => {
    switch (action) {
      case 'INSERT':
        return 'emerald';
      case 'UPDATE':
        return 'blue';
      case 'DELETE':
        return 'red';
      case 'PUBLISH':
        return 'purple';
      case 'ENROLL':
        return 'amber';
      default:
        return 'slate';
    }
  };

  const columns = [
    {
      header: 'Audit ID',
      accessor: 'audit_id',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-slate-700">
          #{row.audit_id}
        </span>
      ),
    },
    {
      header: 'Action',
      accessor: 'action_type',
      render: (row) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase font-mono ${row.action_type === 'INSERT' ? 'bg-emerald-100 text-emerald-800' :
            row.action_type === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
              row.action_type === 'DELETE' ? 'bg-red-100 text-red-800' :
                row.action_type === 'PUBLISH' ? 'bg-purple-100 text-purple-800' :
                  'bg-slate-100 text-slate-800'
          }`}>
          {row.action_type}
        </span>
      ),
    },
    {
      header: 'Entity / Table',
      accessor: 'table_name',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-mono text-xs text-navy-800 font-medium">
            {row.table_name}
          </span>
          <span className="text-slate-400 text-xs font-mono">
            (ID: {row.record_id || 'N/A'})
          </span>
        </div>
      ),
    },
    {
      header: 'User & Role',
      accessor: 'user_email',
      render: (row) => (
        <div>
          <div className="text-xs font-medium text-slate-900">
            {row.user_email || 'System / Trigger'}
          </div>
          {row.user_role && (
            <span className="text-[10px] text-slate-500 font-mono">
              {row.user_role}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'IP Address',
      accessor: 'ip_address',
      render: (row) => (
        <span className="font-mono text-xs text-slate-500">
          {row.ip_address || '127.0.0.1'}
        </span>
      ),
    },
    {
      header: 'Timestamp',
      accessor: 'action_time',
      render: (row) => (
        <div className="flex items-center gap-1 text-xs text-slate-600">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {new Date(row.action_time).toLocaleString()}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <button
          onClick={() => openLogDetails(row)}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-royal-700 bg-royal-50 hover:bg-royal-100 rounded-md transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          Inspect
        </button>
      ),
    },
  ];

  const parseJsonSafe = (val) => {
    if (!val) return null;
    if (typeof val === 'object') return val;
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        subtitle="Immutable database activity tracking, trigger records, and security audit log repository"
        actions={
          <button
            onClick={fetchAuditLogs}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-navy-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        }
      />

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Action Type</label>
            <select
              value={filters.actionType}
              onChange={(e) => handleFilterChange('actionType', e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 focus:ring-1 focus:ring-royal-500"
            >
              <option value="">All Actions</option>
              <option value="INSERT">INSERT</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="PUBLISH">PUBLISH</option>
              <option value="ENROLL">ENROLL</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Target Table</label>
            <select
              value={filters.tableName}
              onChange={(e) => handleFilterChange('tableName', e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 focus:ring-1 focus:ring-royal-500"
            >
              <option value="">All Tables</option>
              <option value="students">students</option>
              <option value="faculty">faculty</option>
              <option value="departments">departments</option>
              <option value="courses">courses</option>
              <option value="course_offerings">course_offerings</option>
              <option value="enrollments">enrollments</option>
              <option value="attendance">attendance</option>
              <option value="exams">exams</option>
              <option value="results">results</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">From Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 focus:ring-1 focus:ring-royal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">To Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 focus:ring-1 focus:ring-royal-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="w-full text-xs text-slate-600 hover:text-navy-900 border border-slate-200 hover:bg-slate-50 rounded-lg py-2 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        pagination={{
          page: pagination.page,
          limit: pagination.limit,
          total: pagination.total,
          onPageChange: (newPage) => setPagination(prev => ({ ...prev, page: newPage })),
        }}
      />

      {/* Inspect Detail Modal */}
      {selectedLog && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Audit Record #${selectedLog.audit_id} Details`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block">Action</span>
                <span className="font-semibold text-navy-900">{selectedLog.action_type}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Table</span>
                <span className="font-mono text-navy-900">{selectedLog.table_name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Record ID</span>
                <span className="font-mono text-navy-900">{selectedLog.record_id || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Timestamp</span>
                <span className="text-navy-900">{new Date(selectedLog.action_time).toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Old Values */}
              <div className="border border-slate-200 rounded-lg p-3 bg-red-50/20">
                <h4 className="text-xs font-semibold text-red-900 mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  Previous State (Old Values)
                </h4>
                <div className="bg-slate-900 text-slate-100 p-3 rounded-md font-mono text-[11px] overflow-auto max-h-60 leading-relaxed">
                  {selectedLog.old_values ? (
                    <pre>{JSON.stringify(parseJsonSafe(selectedLog.old_values), null, 2)}</pre>
                  ) : (
                    <span className="text-slate-500 italic">None (Record was newly inserted)</span>
                  )}
                </div>
              </div>

              {/* New Values */}
              <div className="border border-slate-200 rounded-lg p-3 bg-emerald-50/20">
                <h4 className="text-xs font-semibold text-emerald-900 mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Mutated State (New Values)
                </h4>
                <div className="bg-slate-900 text-slate-100 p-3 rounded-md font-mono text-[11px] overflow-auto max-h-60 leading-relaxed">
                  {selectedLog.new_values ? (
                    <pre>{JSON.stringify(parseJsonSafe(selectedLog.new_values), null, 2)}</pre>
                  ) : (
                    <span className="text-slate-500 italic">None (Record was deleted)</span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

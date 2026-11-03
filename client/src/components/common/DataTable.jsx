import React from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Download } from 'lucide-react';
import { LoadingSpinner, EmptyState } from './EmptyState';

export function DataTable({
  columns,
  data = [],
  loading = false,
  emptyMessage = 'No records match your criteria.',
  search = '',
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filterSlot = null,
  onExport = null,
  pagination = null,
  onPageChange = null,
  sortBy = '',
  sortOrder = 'asc',
  onSort = null,
  actions = null,
}) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card overflow-hidden">
      {/* Table Header Toolbar */}
      {(onSearchChange || filterSlot || onExport || actions) && (
        <div className="p-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
            {onSearchChange && (
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-9 pr-3 py-2 text-[13px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[#0F172A] placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                />
              </div>
            )}
            {filterSlot}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onExport && (
              <button
                onClick={onExport}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-slate-700 bg-white border border-[#CBD5E1] rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4 text-slate-500" />
                Export CSV
              </button>
            )}
            {actions}
          </div>
        </div>
      )}

      {/* Table Element */}
      <div className="overflow-x-auto min-h-[300px] relative">
        {loading ? (
          <div className="py-20">
            <LoadingSpinner text="Retrieving records from MySQL database..." />
          </div>
        ) : data.length === 0 ? (
          <EmptyState message={emptyMessage} />
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                {columns.map((col, index) => {
                  const isSorted = sortBy === col.accessor;
                  return (
                    <th
                      key={col.accessor || index}
                      onClick={() => col.sortable && onSort && onSort(col.accessor)}
                      className={`px-4 py-3 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider ${
                        col.sortable ? 'cursor-pointer select-none hover:text-[#0F172A]' : ''
                      } ${col.className || ''}`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col.header}</span>
                        {col.sortable && (
                          <span className="text-slate-400">
                            {isSorted ? (
                              sortOrder === 'desc' ? (
                                <ArrowDown className="w-3.5 h-3.5 text-brand-blue" />
                              ) : (
                                <ArrowUp className="w-3.5 h-3.5 text-brand-blue" />
                              )
                            ) : (
                              <ArrowUpDown className="w-3 h-3 opacity-50" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {data.map((row, rowIndex) => (
                <tr key={row.id || rowIndex} className="hover:bg-[#F8FAFC] transition-colors duration-150">
                  {columns.map((col, colIndex) => (
                    <td key={col.accessor || colIndex} className={`px-4 py-3 text-[13px] text-[#0F172A] ${col.cellClassName || ''}`}>
                      {col.render ? col.render(row[col.accessor], row) : row[col.accessor] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      {pagination && (
        <div className="px-4 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-[#64748B]">
          <div>
            Showing <span className="font-semibold text-[#0F172A]">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
            <span className="font-semibold text-[#0F172A]">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
            <span className="font-semibold text-[#0F172A]">{pagination.total}</span> records
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange && onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded border border-[#CBD5E1] bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-medium text-[#0F172A]">
              Page {pagination.page} of {Math.max(1, pagination.totalPages || 1)}
            </span>
            <button
              onClick={() => onPageChange && onPageChange(pagination.page + 1)}
              disabled={pagination.page >= (pagination.totalPages || 1)}
              className="p-1.5 rounded border border-[#CBD5E1] bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

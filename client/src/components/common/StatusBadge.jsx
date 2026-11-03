import React from 'react';

export function StatusBadge({ status }) {
  if (!status) return null;

  const normalized = String(status).toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';

  if (['active', 'open', 'published', 'enrolled', 'completed', 'normal'].includes(normalized)) {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (['draft', 'pending', 'late'].includes(normalized)) {
    styles = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (['suspended', 'closed', 'cancelled', 'failed', 'dropped', 'shortage', 'absent'].includes(normalized)) {
    styles = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (['graduated', 'excused'].includes(normalized)) {
    styles = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (['withdrawn'].includes(normalized)) {
    styles = 'bg-purple-50 text-purple-700 border-purple-200';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${styles}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70"></span>
      {status}
    </span>
  );
}

export function AttendanceBadge({ percentage, showWarning = true }) {
  const pct = parseFloat(percentage);
  const isShortage = pct < 75.0;

  let color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (pct < 60) {
    color = 'bg-red-50 text-red-700 border-red-200';
  } else if (pct < 75) {
    color = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <span className={`px-2 py-0.5 rounded-md text-[12px] font-semibold border ${color}`}>
        {pct.toFixed(1)}%
      </span>
      {isShortage && showWarning && (
        <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded border border-red-200 uppercase tracking-wider">
          Shortage
        </span>
      )}
    </div>
  );
}

export function GradeBadge({ grade }) {
  if (!grade) return <span className="text-slate-400 font-medium">—</span>;

  let color = 'bg-slate-100 text-slate-700 border-slate-200';
  if (grade === 'A+' || grade === 'A') {
    color = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
  } else if (grade === 'B') {
    color = 'bg-blue-100 text-blue-800 border-blue-300 font-bold';
  } else if (grade === 'C') {
    color = 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
  } else if (grade === 'D') {
    color = 'bg-orange-100 text-orange-800 border-orange-300 font-semibold';
  } else if (grade === 'F') {
    color = 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
  }

  return (
    <span className={`inline-flex items-center justify-center min-w-[28px] h-6 px-1.5 rounded text-[11px] border ${color}`}>
      {grade}
    </span>
  );
}

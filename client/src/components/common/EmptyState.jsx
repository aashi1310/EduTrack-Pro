import React from 'react';
import { Inbox } from 'lucide-react';

export function LoadingSpinner({ text = 'Loading data...', fullHeight = false }) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 ${fullHeight ? 'min-h-[400px]' : ''}`}>
      <div className="relative w-10 h-10">
        <div className="w-10 h-10 rounded-full border-2 border-slate-200"></div>
        <div className="w-10 h-10 rounded-full border-2 border-brand-blue border-t-transparent animate-spin absolute top-0 left-0"></div>
      </div>
      {text && <p className="mt-3 text-[13px] text-[#64748B] font-medium animate-pulse">{text}</p>}
    </div>
  );
}

export function EmptyState({ title = 'No records found', message = 'There is currently no data to display.', actionButton = null, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3 border border-slate-200">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-[15px] font-semibold text-[#0F172A]">{title}</h3>
      <p className="mt-1 text-[13px] text-[#64748B] max-w-sm">{message}</p>
      {actionButton && <div className="mt-4">{actionButton}</div>}
    </div>
  );
}

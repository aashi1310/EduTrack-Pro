import React from 'react';

export function PageHeader({ title, subtitle, actions = null }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-[24px] font-bold text-[#0F172A] tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-[13px] text-[#64748B]">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2.5 flex-wrap">{actions}</div>}
    </div>
  );
}

export function ChartCard({ title, subtitle, children, actions = null }) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-card flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[15px] font-semibold text-[#0F172A]">{title}</h3>
          {subtitle && <p className="text-[12px] text-[#64748B] mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="w-full h-[260px]">{children}</div>
    </div>
  );
}

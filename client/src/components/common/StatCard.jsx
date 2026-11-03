import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function StatCard({ title, value, icon: Icon, trend, trendLabel, color = 'blue' }) {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-brand-blue',
      border: 'border-blue-100',
    },
    navy: {
      bg: 'bg-slate-100',
      text: 'text-navy-900',
      border: 'border-slate-200',
    },
    green: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-100',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-card hover:shadow-card-hover transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-lg ${scheme.bg} ${scheme.text} ${scheme.border} border`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-[26px] font-bold text-[#0F172A] tracking-tight">{value}</div>
        {trend && (
          <div className={`flex items-center text-[12px] font-medium ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend.isPositive ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
            {trend.value}
          </div>
        )}
      </div>

      {trendLabel && (
        <p className="mt-1 text-[11px] text-[#64748B]">{trendLabel}</p>
      )}
    </div>
  );
}

import React from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import { UserCheck } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, action }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {action}
        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
          <UserCheck size={14} className="text-emerald-500" />
          <span>Session active ({user?.role})</span>
        </div>
      </div>
    </header>
  );
};

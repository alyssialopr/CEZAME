import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';
import {
  LayoutDashboard,
  Layers,
  BookOpen,
  Users,
  ShieldCheck,
  History,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../ui/Badge.js';

export const Sidebar: React.FC = () => {
  const { user, isSuperadmin, logout } = useAuth();

  const navItems = [
    { to: '/', label: 'Tableau de bord', icon: LayoutDashboard, exact: true },
    { to: '/categories', label: 'Catégories & Unités', icon: Layers },
    { to: '/lessons', label: 'Leçons & Quiz', icon: BookOpen },
    { to: '/users', label: 'Utilisateurs', icon: Users },
    ...(isSuperadmin ? [{ to: '/admins', label: 'Administrateurs', icon: ShieldCheck }] : []),
    { to: '/audit-logs', label: 'Journal d’Audit', icon: History },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#607FE8] to-[#8FA6FF] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Sparkles size={22} className="animate-pulse" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg text-slate-900 tracking-tight">CEZAME</h1>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Backoffice Admin
          </p>
        </div>
      </div>

      {/* Admin User Card */}
      <div className="p-4 mx-3 my-2 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
        <div className="truncate pr-2">
          <p className="text-xs font-bold text-slate-800 truncate">
            {user?.username || user?.email?.split('@')[0]}
          </p>
          <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
        </div>
        <Badge variant={isSuperadmin ? 'purple' : 'primary'}>
          {isSuperadmin ? 'Superadmin' : 'Admin'}
        </Badge>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout button footer */}
      <div className="p-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => logout()}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition"
        >
          <LogOut size={18} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

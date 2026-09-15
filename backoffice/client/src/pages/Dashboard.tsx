import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/layout/Header.js';
import api from '../services/api.js';
import { DashboardStats } from '../types/index.js';
import {
  Users,
  BookOpen,
  HelpCircle,
  Award,
  ArrowRight,
  Layers,
  PlusCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge.js';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/stats')
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Tableau de Bord"
        subtitle="Vue d’ensemble des métriques d’apprentissage et de gestion"
        action={
          <Link
            to="/lessons/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            <PlusCircle size={16} />
            <span>Nouvelle Leçon</span>
          </Link>
        }
      />

      <div className="p-8 space-y-8 flex-1">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Users */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Utilisateurs Inscrits
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {loading ? '...' : stats?.totalUsers || 0}
              </h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Comptes mobiles</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={24} />
            </div>
          </div>

          {/* Total Lessons */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Leçons Disponibles
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {loading ? '...' : stats?.totalLessons || 0}
              </h3>
              <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">
                {stats?.totalUnits || 0} unités au total
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen size={24} />
            </div>
          </div>

          {/* Total Questions */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Questions de Quiz
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {loading ? '...' : stats?.totalQuestions || 0}
              </h3>
              <p className="text-[11px] text-purple-600 font-semibold mt-0.5">
                {stats?.totalScreens || 0} fiches de cours
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <HelpCircle size={24} />
            </div>
          </div>

          {/* Completed Lessons */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Leçons Complétées
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {loading ? '...' : stats?.totalCompletedLessons || 0}
              </h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Validations apprenants</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award size={24} />
            </div>
          </div>
        </div>

        {/* Categories Breakdown & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Répartition par catégorie */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">
                  Volume de Leçons par Catégorie
                </h4>
                <p className="text-xs text-slate-500">
                  Répartition des modules pédagogiques créés
                </p>
              </div>
              <Link
                to="/categories"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>Gérer les catégories</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="space-y-4">
              {(stats?.categoryStats || []).map((cat) => {
                const percentage =
                  stats?.totalLessons && stats.totalLessons > 0
                    ? Math.round((cat.lessonCount / stats.totalLessons) * 100)
                    : 0;

                return (
                  <div key={cat.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        ></span>
                        <span>{cat.label}</span>
                      </div>
                      <span className="text-slate-500">
                        {cat.lessonCount} leçon(s) ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          backgroundColor: cat.color,
                          width: `${percentage}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}

              {(!stats?.categoryStats || stats.categoryStats.length === 0) && (
                <p className="text-xs text-slate-400 py-4 text-center">
                  Aucune catégorie configurée pour le moment.
                </p>
              )}
            </div>
          </div>

          {/* Raccourcis et Accès Rapides */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="font-extrabold text-slate-900 text-base mb-1">Actions Rapides</h4>
              <p className="text-xs text-slate-500 mb-5">
                Raccourcis vers les tâches d’administration fréquentes
              </p>

              <div className="space-y-2.5">
                <Link
                  to="/lessons/new"
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-100 transition group"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles size={18} className="text-blue-600" />
                    <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                      Créer une nouvelle leçon
                    </span>
                  </div>
                  <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-1 transition" />
                </Link>

                <Link
                  to="/categories"
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-purple-50 hover:text-purple-700 border border-slate-100 transition group"
                >
                  <div className="flex items-center gap-3">
                    <Layers size={18} className="text-purple-600" />
                    <span className="text-xs font-bold text-slate-800 group-hover:text-purple-700">
                      Gérer unités & catégories
                    </span>
                  </div>
                  <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-1 transition" />
                </Link>

                <Link
                  to="/users"
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-100 transition group"
                >
                  <div className="flex items-center gap-3">
                    <Users size={18} className="text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                      Consulter les utilisateurs
                    </span>
                  </div>
                  <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-1 transition" />
                </Link>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-100">
                <p className="text-[11px] text-blue-900 font-semibold leading-relaxed">
                  💡 <strong>Astuce :</strong> Vous pouvez prévisualiser le rendu smartphone de vos leçons en temps réel pendant la rédaction grâce au simulateur intégré.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dernières Activités (Audit Logs Recents) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-extrabold text-slate-900 text-base">Activité Récente</h4>
            <Link
              to="/audit-logs"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Voir tout le journal</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {(stats?.recentLogs || []).map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                    <Clock size={14} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">
                      <span className="text-blue-600 font-semibold">{log.admin_email || 'Admin'}</span>{' '}
                      a exécuté <Badge variant="gray">{log.action}</Badge>
                    </p>
                    <p className="text-slate-400 text-[10px] mt-0.5">
                      Cible : {log.target_type} {log.target_id ? `(${log.target_id})` : ''}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400">
                  {new Date(log.created_at).toLocaleString('fr-FR')}
                </span>
              </div>
            ))}

            {(!stats?.recentLogs || stats.recentLogs.length === 0) && (
              <p className="text-xs text-slate-400 py-4 text-center">Aucune activité récente enregistrée.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

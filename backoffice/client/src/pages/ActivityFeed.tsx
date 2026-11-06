import React, { useEffect, useState, useCallback } from 'react';
import { Header } from '../components/layout/Header.js';
import api from '../services/api.js';
import { UserActivityEvent, ActivityStats } from '../types/index.js';
import {
  Activity,
  Eye,
  MousePointerClick,
  BookOpen,
  CheckCircle2,
  User,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
} from 'lucide-react';

export const ActivityFeed: React.FC = () => {
  const [events, setEvents] = useState<UserActivityEvent[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Filtres
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedUserFilter, setSelectedUserFilter] = useState<string | null>(null);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);

  // Détails dépliés par événement ID
  const [expandedEventIds, setExpandedEventIds] = useState<Record<string, boolean>>({});

  const limit = 25;

  const fetchEvents = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', String(p));
      params.append('limit', String(limit));
      if (eventTypeFilter && eventTypeFilter !== 'all') {
        params.append('event_type', eventTypeFilter);
      }
      if (search.trim()) {
        params.append('search', search.trim());
      }
      if (selectedUserFilter) {
        params.append('user_id', selectedUserFilter);
      }

      const res = await api.get(`/activity/events?${params.toString()}`);
      setEvents(res.data.events || []);
      setTotal(res.data.total || 0);
      setPage(p);
    } catch (err) {
      console.error('Erreur chargement événements:', err);
    } finally {
      setLoading(false);
    }
  }, [eventTypeFilter, search, selectedUserFilter]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/activity/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Erreur chargement stats activity:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchEvents(1);
  }, [fetchEvents]);

  // Live Auto-Refresh (Customer.io live feed)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchEvents(page);
      fetchStats();
    }, 6000);
    return () => clearInterval(interval);
  }, [autoRefresh, page, fetchEvents]);

  const toggleExpand = (id: string) => {
    setExpandedEventIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalPages = Math.ceil(total / limit) || 1;

  const getEventBadgeInfo = (type: string, name: string) => {
    switch (type) {
      case 'screen_view':
        return { label: 'Écran', icon: Eye, color: 'bg-sky-50 text-sky-700 border-sky-200' };
      case 'click':
        return { label: 'Clic', icon: MousePointerClick, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'lesson':
        return { label: 'Leçon', icon: BookOpen, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'quiz':
        return { label: 'Quiz', icon: CheckCircle2, color: 'bg-amber-50 text-amber-700 border-amber-200' };
      default:
        return { label: name || type, icon: Activity, color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const formatRelativeTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return `il y a ${Math.max(1, diffSec)}s`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `il y a ${diffMin}m`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `il y a ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `il y a ${diffDays}j`;
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50/50">
      <Header
        title="Journal d'Activité & Analytics"
        subtitle="Suivi en direct des parcours utilisateurs, interactions et flux de test (façon Customer.io)"
      />

      <div className="p-8 space-y-6 flex-1">
        {/* Cartes d'indicateurs clés */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Événements</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {stats?.totalEvents ?? '...'}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Activity size={22} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aujourd'hui</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
                {stats?.eventsToday ?? '...'}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles size={22} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Testeurs Actifs (24h)</p>
              <h3 className="text-2xl font-extrabold text-indigo-600 mt-1">
                {stats?.activeUsersToday ?? '...'}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <User size={22} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="truncate pr-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Top Écran Visité</p>
              <h3 className="text-base font-extrabold text-slate-900 mt-1 truncate" title={stats?.topScreens[0]?.screen}>
                {stats?.topScreens[0]?.screen ? stats.topScreens[0].screen.replace(/^\//, '') : 'Aucun'}
              </h3>
              {stats?.topScreens[0] && (
                <p className="text-[11px] text-slate-500 font-medium">
                  {stats.topScreens[0].count} consultations
                </p>
              )}
            </div>
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Layers size={22} />
            </div>
          </div>
        </div>

        {/* Barre de filtres et d'action */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Recherche */}
            <div className="relative w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Rechercher action, écran..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            {/* Sélecteur de type d'événement */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              {[
                { id: 'all', label: 'Tous' },
                { id: 'screen_view', label: 'Écrans' },
                { id: 'click', label: 'Clics' },
                { id: 'lesson', label: 'Leçons' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setEventTypeFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    eventTypeFilter === tab.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Badge Utilisateur sélectionné */}
            {selectedUserFilter && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs font-semibold">
                <span>Filtré sur : {selectedUserEmail || selectedUserFilter.substring(0, 8)}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUserFilter(null);
                    setSelectedUserEmail(null);
                  }}
                  className="hover:text-rose-600 font-bold ml-1"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Outils de rafraîchissement */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                autoRefresh
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`} />
              <span>Direct (6s)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                fetchEvents(page);
                fetchStats();
              }}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* Flux d'activité chronologique */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-blue-600" />
              <h2 className="font-bold text-sm text-slate-800">
                Flux d'actions en temps réel ({total} au total)
              </h2>
            </div>
            {total > 0 && (
              <span className="text-xs text-slate-500 font-medium">
                Page {page} sur {totalPages}
              </span>
            )}
          </div>

          {events.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
                <Activity size={24} />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Aucun événement enregistré</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Les actions des utilisateurs sur l’application mobile (navigation, clics, quiz) apparaîtront automatiquement ici au fur et à mesure des tests.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {events.map((ev) => {
                const badgeInfo = getEventBadgeInfo(ev.event_type, ev.event_name);
                const isExpanded = Boolean(expandedEventIds[ev.id]);
                const IconComponent = badgeInfo.icon;
                const hasProperties = ev.properties && Object.keys(ev.properties).length > 0;

                return (
                  <div
                    key={ev.id}
                    className="p-5 hover:bg-slate-50/70 transition flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Partie Gauche : Type + Action + Contexte */}
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${badgeInfo.color}`}
                        >
                          <IconComponent size={18} />
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">
                              {ev.event_name}
                            </span>

                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${badgeInfo.color}`}
                            >
                              {badgeInfo.label}
                            </span>

                            {ev.screen_name && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-mono bg-slate-100 text-slate-700">
                                <Smartphone size={11} className="text-slate-400" />
                                {ev.screen_name}
                              </span>
                            )}
                          </div>

                          {/* Utilisateur et Session */}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <button
                              type="button"
                              onClick={() => {
                                if (ev.user_id) {
                                  setSelectedUserFilter(ev.user_id);
                                  setSelectedUserEmail(ev.user_email || ev.user_username || null);
                                }
                              }}
                              className="inline-flex items-center gap-1.5 font-medium hover:text-blue-600 transition"
                              title="Cliquer pour filtrer uniquement cet utilisateur"
                            >
                              <User size={13} className="text-slate-400" />
                              <span className="font-semibold text-slate-700 underline decoration-dotted">
                                {ev.user_username || ev.user_email}
                              </span>
                              {ev.user_email && ev.user_email !== ev.user_username && (
                                <span className="text-[11px] text-slate-400">({ev.user_email})</span>
                              )}
                            </button>

                            <span className="text-slate-300">•</span>

                            <span className="font-mono text-[11px] text-slate-400" title={`Session ID: ${ev.session_id}`}>
                              session: {ev.session_id.substring(0, 14)}...
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Partie Droite : Horodatage & Dépliable */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-xs font-semibold text-slate-700">
                            {formatRelativeTime(ev.created_at)}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {new Date(ev.created_at).toLocaleTimeString('fr-FR')}
                          </p>
                        </div>

                        {hasProperties && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(ev.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                            title={isExpanded ? 'Masquer données' : 'Voir données'}
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Aperçu ou détail dépliable des métadonnées JSON */}
                    {hasProperties && isExpanded && (
                      <div className="mt-2 p-3 bg-slate-900 rounded-xl text-slate-200 font-mono text-xs overflow-x-auto shadow-inner">
                        <pre>{JSON.stringify(ev.properties, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Footer */}
          {total > limit && (
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Affichage de {(page - 1) * limit + 1} à {Math.min(page * limit, total)} sur {total} événements
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fetchEvents(page - 1)}
                  disabled={page <= 1}
                  className="p-2 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-bold text-slate-700 px-2">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => fetchEvents(page + 1)}
                  disabled={page >= totalPages}
                  className="p-2 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

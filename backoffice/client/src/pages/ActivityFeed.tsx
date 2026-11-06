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
  BarChart3,
  SlidersHorizontal,
  Clock,
  AlertTriangle,
  ArrowRight,
  Check,
  HelpCircle,
} from 'lucide-react';

type WidgetKey = 'overview' | 'categories' | 'funnel' | 'exercises' | 'engagement';

const STORAGE_KEY = '@cezame_activity_visible_widgets';

const DEFAULT_WIDGETS: Record<WidgetKey, boolean> = {
  overview: true,
  categories: true,
  funnel: true,
  exercises: true,
  engagement: true,
};

export const ActivityFeed: React.FC = () => {
  const [events, setEvents] = useState<UserActivityEvent[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Sélecteur de widgets affichés dans l'en-tête (avec sauvegarde locale)
  const [visibleWidgets, setVisibleWidgets] = useState<Record<WidgetKey, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_WIDGETS;
  });

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

  const toggleWidget = (key: WidgetKey) => {
    const updated = { ...visibleWidgets, [key]: !visibleWidgets[key] };
    setVisibleWidgets(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const setAllWidgets = (value: boolean) => {
    const updated: Record<WidgetKey, boolean> = {
      overview: value,
      categories: value,
      funnel: value,
      exercises: value,
      engagement: value,
    };
    setVisibleWidgets(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

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
      case 'category':
        return { label: 'Catégorie', icon: Layers, color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'onboarding':
        return { label: 'Onboarding', icon: Sparkles, color: 'bg-rose-50 text-rose-700 border-rose-200' };
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

  const widgetDefinitions: { id: WidgetKey; label: string; icon: any }[] = [
    { id: 'overview', label: 'Indicateurs Clés', icon: Activity },
    { id: 'categories', label: 'Popularité Catégories', icon: BarChart3 },
    { id: 'funnel', label: 'Entonnoir (Passage Quiz)', icon: ArrowRight },
    { id: 'exercises', label: 'Difficulté & Questions', icon: HelpCircle },
    { id: 'engagement', label: 'Temps & Engagement', icon: Clock },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50/50">
      <Header
        title="Journal d'Activité & Analytics"
        subtitle="Suivi en direct des parcours utilisateurs, interactions et flux de test (façon Customer.io)"
      />

      <div className="p-8 space-y-6 flex-1">
        {/* BARRE DE CONTRÔLE DE L'EN-TÊTE : SÉLECTION DES MÉTRIQUES À AFFICHER */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mr-1">
              <SlidersHorizontal size={14} className="text-blue-600" />
              Affichage des métriques :
            </span>

            {widgetDefinitions.map((w) => {
              const active = visibleWidgets[w.id];
              const Icon = w.icon;
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => toggleWidget(w.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    active
                      ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs'
                      : 'bg-slate-50 text-slate-400 border-slate-200 line-through opacity-60 hover:opacity-100'
                  }`}
                >
                  <Icon size={13} />
                  <span>{w.label}</span>
                  {active && <Check size={12} className="text-blue-600" />}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setAllWidgets(true)}
              className="text-[11px] font-bold text-slate-500 hover:text-blue-600 px-2 py-1"
            >
              Tout afficher
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={() => setAllWidgets(false)}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 px-2 py-1"
            >
              Masquer
            </button>
          </div>
        </div>

        {/* 1. BLOC INDICATEURS CLÉS (OVERVIEW) */}
        {visibleWidgets.overview && (
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
                  {stats?.topScreens[0]?.screen ? stats.topScreens[0].screen.replace(/^\//, '') : 'Accueil'}
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
        )}

        {/* 2. BLOC POPULARITÉ DES CATÉGORIES (FINANCE VS VOITURE VS SANTÉ...) */}
        {visibleWidgets.categories && stats?.categoryStats && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <BarChart3 size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Intérêt par Thématique : Où cliquent le plus les testeurs ?
                  </h3>
                  <p className="text-xs text-slate-500">
                    Répartition des clics et lancements de leçons par matière
                  </p>
                </div>
              </div>

              {stats.firstPickStats && stats.firstPickStats.length > 0 && (
                <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-800">1er choix spontané :</span>
                  <span
                    className="font-bold px-2 py-0.5 rounded-md text-white text-[11px]"
                    style={{ backgroundColor: stats.firstPickStats[0]?.color }}
                  >
                    {stats.firstPickStats[0]?.label} ({stats.firstPickStats[0]?.count} testeurs)
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
              {stats.categoryStats.map((cat) => (
                <div
                  key={cat.id}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between space-y-2 hover:bg-slate-100/70 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">{cat.label}</span>
                    <span className="text-xs font-mono font-extrabold" style={{ color: cat.color }}>
                      {cat.percentage}%
                    </span>
                  </div>

                  {/* Barre de progression */}
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, cat.percentage)}%`, backgroundColor: cat.color }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium">
                    {cat.count} interactions
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. BLOC ENTONNOIR (FUNNEL) : PASSAGE THÉORIE -> QUIZ -> COMPLÉTION */}
        {visibleWidgets.funnel && stats?.funnel && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <ArrowRight size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Entonnoir de Conversion : Passage de la Théorie au Quiz
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mesure combien d'utilisateurs qui lancent une leçon vont jusqu'au quiz et la complètent
                  </p>
                </div>
              </div>

              {/* Taux clé mis en valeur */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-800 rounded-xl border border-indigo-200 text-xs font-bold self-start">
                <span>Taux passage Théorie ➔ Quiz :</span>
                <span className="text-sm font-black text-indigo-600">
                  {stats.funnel.transitionToQuizRate}%
                </span>
              </div>
            </div>

            {/* Étapes visuelles de l'entonnoir */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Étape 1 : Leçons Ouvertes */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs relative">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
                  <span>1. Leçon Démarrée</span>
                  <span className="font-mono text-slate-400">100%</span>
                </div>
                <h4 className="text-2xl font-black text-slate-900">{stats.funnel.opened}</h4>
                <p className="text-[11px] text-slate-500 mt-1">Lancements initiaux de leçons</p>
                <div className="w-full h-1.5 bg-blue-600 rounded-full mt-3" />
              </div>

              {/* Étape 2 : Quiz Démarré */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs relative">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
                  <span>2. Quiz Démarré</span>
                  <span className="font-mono text-indigo-600 font-extrabold">
                    {stats.funnel.transitionToQuizRate}%
                  </span>
                </div>
                <h4 className="text-2xl font-black text-indigo-600">{stats.funnel.quizStarted}</h4>
                <p className="text-[11px] text-slate-500 mt-1">Ont lu les fiches et testé le quiz</p>
                <div className="w-full h-1.5 bg-indigo-500 rounded-full mt-3" />
              </div>

              {/* Étape 3 : Leçon Terminée */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs relative">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
                  <span>3. Leçon Validée (XP)</span>
                  <span className="font-mono text-emerald-600 font-extrabold">
                    {stats.funnel.completionRate}%
                  </span>
                </div>
                <h4 className="text-2xl font-black text-emerald-600">{stats.funnel.completed}</h4>
                <p className="text-[11px] text-slate-500 mt-1">Leçons terminées avec succès</p>
                <div className="w-full h-1.5 bg-emerald-500 rounded-full mt-3" />
              </div>
            </div>

            {/* Diagnostic des abandons */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
              <span className="font-bold text-slate-800">Points d'abandon :</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Pendant la lecture des fiches : <strong>{stats.funnel.abandonedTheory} abandons</strong>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Pendant le quiz : <strong>{stats.funnel.abandonedQuiz} abandons</strong>
              </span>
            </div>
          </div>
        )}

        {/* 4. BLOC DIFFICULTÉ & QUESTIONS PIÈGES */}
        {visibleWidgets.exercises && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Taux de réussite par type d'exercice */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Taux de Réussite par Type d'Exercice
                  </h3>
                  <p className="text-xs text-slate-500">
                    Efficacité comparée entre QCM, Arnaques, Bacs, etc.
                  </p>
                </div>
              </div>

              {stats?.exerciseTypeSuccess && stats.exerciseTypeSuccess.length > 0 ? (
                <div className="space-y-3 pt-2">
                  {stats.exerciseTypeSuccess.map((ex) => (
                    <div key={ex.type} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold uppercase text-slate-700 tracking-wider text-[11px]">
                          {ex.type}
                        </span>
                        <span className="font-mono font-bold text-slate-800">
                          {ex.rate}% ({ex.correct}/{ex.total})
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            ex.rate >= 75 ? 'bg-emerald-500' : ex.rate >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.max(5, ex.rate)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">
                  En attente de réponses aux quiz par les testeurs.
                </p>
              )}
            </div>

            {/* Top Questions Pièges */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Questions les plus échouées (Questions Pièges)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Questions nécessitant une clarification pédagogique
                  </p>
                </div>
              </div>

              {stats?.mostFailedQuestions && stats.mostFailedQuestions.length > 0 ? (
                <div className="space-y-2.5 pt-2">
                  {stats.mostFailedQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs gap-3"
                    >
                      <div className="space-y-0.5 truncate pr-2">
                        <p className="font-bold text-slate-800 truncate" title={q.prompt}>
                          {q.prompt}
                        </p>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          Thème : {q.categoryId}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-700 font-bold rounded-md text-[11px]">
                          {q.failedCount} erreurs ({q.failureRate}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">
                  Aucune erreur répétée enregistrée pour le moment.
                </p>
              )}
            </div>
          </div>
        )}

        {/* 5. BLOC TEMPS & ENGAGEMENT */}
        {visibleWidgets.engagement && stats?.engagement && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Clock size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Temps & Engagement des Testeurs
                </h3>
                <p className="text-xs text-slate-500">
                  Assiduité, temps moyen par leçon et complétion du parcours initial
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                <p className="text-xs font-semibold text-purple-900">Temps Moyen par Leçon</p>
                <h4 className="text-2xl font-black text-purple-700 mt-1">
                  {stats.engagement.avgLessonMinutes} min
                </h4>
                <p className="text-[11px] text-purple-600 mt-1">Durée moyenne pour terminer cours + quiz</p>
              </div>

              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <p className="text-xs font-semibold text-emerald-900">Complétion Onboarding</p>
                <h4 className="text-2xl font-black text-emerald-700 mt-1">
                  {stats.engagement.onboardingRate}%
                </h4>
                <p className="text-[11px] text-emerald-600 mt-1">
                  {stats.engagement.onboardingCompleted} / {stats.engagement.onboardingStarted || 1} ont terminé le bilan
                </p>
              </div>

              <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                <p className="text-xs font-semibold text-amber-900">Leçons par Testeur</p>
                <h4 className="text-2xl font-black text-amber-700 mt-1">
                  {stats.engagement.avgLessonsPerUser}
                </h4>
                <p className="text-[11px] text-amber-600 mt-1">Moyenne de cours validés par utilisateur</p>
              </div>
            </div>
          </div>
        )}

        {/* BARRE DE FILTRES ET D'ACTION DU FLUX CHRONOLOGIQUE */}
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
                { id: 'lesson', label: 'Leçons' },
                { id: 'click', label: 'Clics' },
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

        {/* FLUX D'ACTIVITÉ CHRONOLOGIQUE */}
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

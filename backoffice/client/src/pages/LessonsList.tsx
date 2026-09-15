import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header.js';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.js';
import { Modal } from '../components/ui/Modal.js';
import api from '../services/api.js';
import { Lesson, Category, Unit } from '../types/index.js';
import {
  Plus,
  Edit2,
  Trash2,
  Download,
  Upload,
  BookOpen,
  Filter,
  CheckCircle,
  Clock,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

export const LessonsList: React.FC = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Suppression
  const [deleteTarget, setDeleteTarget] = useState<Lesson | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Import JSON Modal
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importCategoryId, setImportCategoryId] = useState('');
  const [importUnitId, setImportUnitId] = useState('');
  const [importJsonText, setImportJsonText] = useState('');
  const [importUnitsList, setImportUnitsList] = useState<Unit[]>([]);

  const fetchFilters = async () => {
    try {
      const [cRes, uRes] = await Promise.all([
        api.get('/content/categories'),
        api.get('/content/units'),
      ]);
      setCategories(cRes.data);
      setUnits(uRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLessons = async () => {
    setLoading(true);
    try {
      let url = '/content/lessons?';
      if (selectedCategory) url += `category_id=${selectedCategory}&`;
      if (selectedUnit) url += `unit_id=${selectedUnit}&`;
      const res = await api.get(url);
      setLessons(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchLessons();
  }, [selectedCategory, selectedUnit]);

  // Filtrer les unités pour l'import selon la catégorie choisie
  useEffect(() => {
    if (importCategoryId) {
      api
        .get(`/content/units?category_id=${importCategoryId}`)
        .then((res) => setImportUnitsList(res.data))
        .catch(console.error);
    } else {
      setImportUnitsList([]);
    }
  }, [importCategoryId]);

  const handleToggleStatus = async (lesson: Lesson) => {
    const nextStatus = lesson.status === 'published' ? 'draft' : 'published';
    try {
      await api.patch(`/content/lessons/${lesson.id}/status`, { status: nextStatus });
      setLessons(lessons.map((l) => (l.id === lesson.id ? { ...l, status: nextStatus } : l)));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur mise à jour du statut');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await api.delete(`/content/lessons/${deleteTarget.id}`);
      setDeleteTarget(null);
      await fetchLessons();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de la suppression');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportJson = async (lessonId: string, title: string) => {
    try {
      const res = await api.get(`/import-export/lessons/${lessonId}`);
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `lesson-${title.toLowerCase().replace(/\s+/g, '-')}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de l’exportation JSON');
    }
  };

  const handleImportJson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importCategoryId || !importUnitId || !importJsonText) {
      alert('Veuillez remplir tous les champs et coller le JSON');
      return;
    }

    try {
      const parsed = JSON.parse(importJsonText);
      setActionLoading(true);
      const res = await api.post('/import-export/lessons', {
        targetCategoryId: importCategoryId,
        targetUnitId: importUnitId,
        payload: parsed,
      });
      alert(res.data.message || 'Leçon importée avec succès !');
      setImportModalOpen(false);
      setImportJsonText('');
      await fetchLessons();
      if (res.data.lessonId) {
        navigate(`/lessons/${res.data.lessonId}`);
      }
    } catch (err: any) {
      alert('JSON invalide ou erreur API: ' + (err.response?.data?.error || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Leçons & Modules de Quiz"
        subtitle="Rédigez les contenus, configurez les quiz et gérez la publication"
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setImportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
            >
              <Upload size={14} />
              <span>Importer JSON</span>
            </button>
            <Link
              to="/lessons/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
            >
              <Plus size={16} />
              <span>Nouvelle Leçon</span>
            </Link>
          </div>
        }
      />

      <div className="p-8 flex-1 space-y-6">
        {/* Filtres */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Filter size={14} />
              <span>Filtres :</span>
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedUnit('');
              }}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>

            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
            >
              <option value="">Toutes les unités</option>
              {units
                .filter((u) => !selectedCategory || u.category_id === selectedCategory)
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    Unité {u.unit_number} - {u.title}
                  </option>
                ))}
            </select>
          </div>

          <span className="text-xs text-slate-500 font-semibold">
            {lessons.length} leçon(s) répertoriée(s)
          </span>
        </div>

        {/* Liste des Leçons */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Leçon & Unité</th>
                  <th className="px-6 py-3.5">Catégorie</th>
                  <th className="px-6 py-3.5">Récompense</th>
                  <th className="px-6 py-3.5">Contenu</th>
                  <th className="px-6 py-3.5">Statut</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lessons.map((lesson) => {
                  const cat = categories.find((c) => c.id === lesson.category_id);
                  const isPublished = lesson.status === 'published';

                  return (
                    <tr key={lesson.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                            {lesson.order_index}
                          </div>
                          <div>
                            <Link
                              to={`/lessons/${lesson.id}`}
                              className="font-extrabold text-slate-900 hover:text-blue-600 text-sm block"
                            >
                              {lesson.title}
                            </Link>
                            <span className="text-[11px] text-slate-400">
                              {lesson.units
                                ? `Unité ${lesson.units.unit_number} : ${lesson.units.title}`
                                : 'Sans unité'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border"
                          style={{
                            backgroundColor: `${cat?.color || '#8FA6FF'}20`,
                            borderColor: cat?.color || '#8FA6FF',
                            color: '#1E293B',
                          }}
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: cat?.color || '#8FA6FF' }}
                          ></span>
                          {cat?.label || lesson.category_id}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-bold text-amber-600">
                        <span className="inline-flex items-center gap-1">
                          <Sparkles size={14} />
                          {lesson.xp_reward} XP
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 text-slate-500 font-semibold">
                          <span className="inline-flex items-center gap-1">
                            <BookOpen size={14} className="text-slate-400" />
                            {lesson.lesson_screens?.[0]?.count ?? 0} fiches
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <HelpCircle size={14} className="text-slate-400" />
                            {lesson.lesson_questions?.[0]?.count ?? 0} quiz
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(lesson)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                            isPublished
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                          }`}
                          title="Cliquer pour basculer le statut"
                        >
                          {isPublished ? <CheckCircle size={12} /> : <Clock size={12} />}
                          <span>{isPublished ? 'Publié' : 'Brouillon'}</span>
                        </button>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleExportJson(lesson.id, lesson.title)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                            title="Exporter en JSON"
                          >
                            <Download size={15} />
                          </button>
                          <Link
                            to={`/lessons/${lesson.id}`}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                            title="Modifier"
                          >
                            <Edit2 size={15} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(lesson)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Supprimer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {!loading && lessons.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      Aucune leçon trouvée pour les filtres sélectionnés.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL IMPORT JSON */}
      <Modal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Importer une leçon (Format JSON)"
        maxWidth="2xl"
      >
        <form onSubmit={handleImportJson} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Catégorie cible</label>
              <select
                required
                value={importCategoryId}
                onChange={(e) => setImportCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Unité cible</label>
              <select
                required
                disabled={!importCategoryId}
                value={importUnitId}
                onChange={(e) => setImportUnitId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-50"
              >
                <option value="">Sélectionner une unité</option>
                {importUnitsList.map((u) => (
                  <option key={u.id} value={u.id}>
                    Unité {u.unit_number} - {u.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Contenu JSON de la leçon
            </label>
            <textarea
              required
              rows={10}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='Collez ici la structure JSON exportée (ex: {"lesson": {"title": "...", "screens": [...], "questions": [...]}})'
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setImportModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              {actionLoading ? 'Importation en cours...' : 'Importer la leçon'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRMATION SUPPRESSION */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Supprimer la leçon"
        message={`Êtes-vous sûr de vouloir supprimer définitivement la leçon "${deleteTarget?.title}" ainsi que toutes ses fiches et questions de quiz ?`}
        loading={actionLoading}
      />
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '../components/layout/Header.js';
import { PhonePreview } from '../components/preview/PhonePreview.js';
import { Modal } from '../components/ui/Modal.js';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.js';
import api from '../services/api.js';
import { Lesson, Category, Unit, LessonScreen, LessonQuestion, QuestionType } from '../types/index.js';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import {
  ArrowLeft,
  Save,
  BookOpen,
  HelpCircle,
  Plus,
  GripVertical,
  Edit2,
  Trash2,
  Lightbulb,
  Download,
  Check,
  ListOrdered,
  Link2,
  FileSearch,
  Layers,
  ShieldAlert,
  Briefcase,
} from 'lucide-react';

export const LessonEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saveLoading, setSaveLoading] = useState(false);

  // Lesson State
  const [lessonForm, setLessonForm] = useState({
    title: '',
    category_id: '',
    unit_id: '' as string | undefined,
    xp_reward: 50,
    order_index: 1,
    status: 'draft' as 'draft' | 'published',
  });

  // Screens & Questions
  const [screens, setScreens] = useState<LessonScreen[]>([]);
  const [questions, setQuestions] = useState<LessonQuestion[]>([]);

  // Active sub-tab & preview index
  const [activeTab, setActiveTab] = useState<'screens' | 'questions'>('screens');
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);

  // Modal Screen
  const [screenModalOpen, setScreenModalOpen] = useState(false);
  const [editingScreen, setEditingScreen] = useState<LessonScreen | null>(null);
  const [screenForm, setScreenForm] = useState({
    title: '',
    body: '',
    tip: '',
  });

  // Modal Question
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<LessonQuestion | null>(null);
  const [questionForm, setQuestionForm] = useState<{
    type: QuestionType;
    prompt: string;
    category: string;
    explanation: string;
    options: any;
  }>({
    type: 'qcm',
    prompt: '',
    category: 'Quiz',
    explanation: '',
    options: [
      { letter: 'A', text: '', correct: true },
      { letter: 'B', text: '', correct: false },
      { letter: 'C', text: '', correct: false },
    ],
  });

  // Confirm delete
  const [deleteScreenTarget, setDeleteScreenTarget] = useState<LessonScreen | null>(null);
  const [deleteQuestionTarget, setDeleteQuestionTarget] = useState<LessonQuestion | null>(null);

  // Charger catégories et unités
  useEffect(() => {
    Promise.all([api.get('/content/categories'), api.get('/content/units')]).then(
      ([cRes, uRes]) => {
        setCategories(cRes.data);
        setUnits(uRes.data);
        if (isNew && cRes.data.length > 0) {
          setLessonForm((prev) => ({
            ...prev,
            category_id: cRes.data[0].id,
          }));
        }
      }
    );
  }, [isNew]);

  // Charger la leçon existante
  useEffect(() => {
    if (!isNew) {
      api
        .get(`/content/lessons/${id}`)
        .then((res) => {
          const l: Lesson = res.data;
          setLessonForm({
            title: l.title,
            category_id: l.category_id,
            unit_id: l.unit_id,
            xp_reward: l.xp_reward,
            order_index: l.order_index,
            status: l.status,
          });
          setScreens(l.screens || []);
          setQuestions(l.questions || []);
        })
        .catch((err) => {
          console.error(err);
          alert('Impossible de charger la leçon');
          navigate('/lessons');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isNew, navigate]);

  // Filtrer les unités selon la catégorie de la leçon
  const filteredUnits = units.filter((u) => u.category_id === lessonForm.category_id);
  const selectedCategoryObj = categories.find((c) => c.id === lessonForm.category_id);

  // ------------------------------------
  // GESTION LEÇON PRINCIPALE
  // ------------------------------------
  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);

    try {
      if (isNew) {
        const res = await api.post('/content/lessons', lessonForm);
        navigate(`/lessons/${res.data.id}`);
      } else {
        await api.put(`/content/lessons/${id}`, lessonForm);
        alert('Leçon enregistrée avec succès');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de l’enregistrement');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleExportJson = () => {
    const fullData = {
      ...lessonForm,
      category: selectedCategoryObj?.label,
      screens,
      questions,
    };
    const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lesson-${lessonForm.title.toLowerCase().replace(/\s+/g, '-') || 'export'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ------------------------------------
  // GESTION DES FICHES DE COURS (SCREENS)
  // ------------------------------------
  const handleOpenScreenModal = (screen?: LessonScreen) => {
    if (screen) {
      setEditingScreen(screen);
      setScreenForm({
        title: screen.title,
        body: screen.body,
        tip: screen.tip || '',
      });
    } else {
      setEditingScreen(null);
      setScreenForm({ title: '', body: '', tip: '' });
    }
    setScreenModalOpen(true);
  };

  const handleSaveScreen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNew) {
      alert('Veuillez d’abord enregistrer la leçon principale.');
      return;
    }

    try {
      if (editingScreen) {
        const res = await api.put(`/content/screens/${editingScreen.id}`, {
          ...screenForm,
          order_index: editingScreen.order_index,
        });
        setScreens(screens.map((s) => (s.id === editingScreen.id ? res.data : s)));
      } else {
        const nextOrder = screens.length + 1;
        const res = await api.post(`/content/lessons/${id}/screens`, {
          ...screenForm,
          order_index: nextOrder,
        });
        setScreens([...screens, res.data]);
        setActivePreviewIndex(screens.length);
      }
      setScreenModalOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur enregistrement fiche');
    }
  };

  const handleDeleteScreen = async () => {
    if (!deleteScreenTarget) return;
    try {
      await api.delete(`/content/screens/${deleteScreenTarget.id}`);
      const updated = screens.filter((s) => s.id !== deleteScreenTarget.id);
      setScreens(updated);
      setDeleteScreenTarget(null);
      if (activePreviewIndex >= updated.length) {
        setActivePreviewIndex(Math.max(0, updated.length - 1));
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur suppression fiche');
    }
  };

  // ------------------------------------
  // GESTION DES QUESTIONS DE QUIZ
  // ------------------------------------
  const handleOpenQuestionModal = (q?: LessonQuestion) => {
    if (q) {
      setEditingQuestion(q);
      setQuestionForm({
        type: q.type || 'qcm',
        prompt: q.prompt,
        category: q.category || 'Quiz',
        explanation: q.explanation || '',
        options: q.options || [],
      });
    } else {
      setEditingQuestion(null);
      setQuestionForm({
        type: 'qcm',
        prompt: '',
        category: 'Quiz',
        explanation: '',
        options: [
          { letter: 'A', text: '', correct: true },
          { letter: 'B', text: '', correct: false },
          { letter: 'C', text: '', correct: false },
        ],
      });
    }
    setQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNew) {
      alert('Veuillez d’abord enregistrer la leçon principale.');
      return;
    }

    try {
      if (editingQuestion) {
        const res = await api.put(`/content/questions/${editingQuestion.id}`, {
          ...questionForm,
          order_index: editingQuestion.order_index,
        });
        setQuestions(questions.map((q) => (q.id === editingQuestion.id ? res.data : q)));
      } else {
        const nextOrder = questions.length + 1;
        const res = await api.post(`/content/lessons/${id}/questions`, {
          ...questionForm,
          order_index: nextOrder,
        });
        setQuestions([...questions, res.data]);
        setActivePreviewIndex(questions.length);
      }
      setQuestionModalOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur enregistrement quiz');
    }
  };

  const handleDeleteQuestion = async () => {
    if (!deleteQuestionTarget) return;
    try {
      await api.delete(`/content/questions/${deleteQuestionTarget.id}`);
      const updated = questions.filter((q) => q.id !== deleteQuestionTarget.id);
      setQuestions(updated);
      setDeleteQuestionTarget(null);
      if (activePreviewIndex >= updated.length) {
        setActivePreviewIndex(Math.max(0, updated.length - 1));
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur suppression question');
    }
  };

  // ------------------------------------
  // DRAG AND DROP REORDERING
  // ------------------------------------
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    if (sourceIndex === destIndex) return;

    if (activeTab === 'screens') {
      const items = Array.from(screens);
      const [reorderedItem] = items.splice(sourceIndex, 1);
      items.splice(destIndex, 0, reorderedItem);

      // Réaffecter les order_index
      const updated = items.map((item, idx) => ({ ...item, order_index: idx + 1 }));
      setScreens(updated);

      try {
        await api.post('/content/reorder', {
          type: 'screens',
          items: updated.map((i) => ({ id: i.id, order_index: i.order_index })),
        });
      } catch (err) {
        console.error('Erreur réordonnancement fiches', err);
      }
    } else {
      const items = Array.from(questions);
      const [reorderedItem] = items.splice(sourceIndex, 1);
      items.splice(destIndex, 0, reorderedItem);

      const updated = items.map((item, idx) => ({ ...item, order_index: idx + 1 }));
      setQuestions(updated);

      try {
        await api.post('/content/reorder', {
          type: 'questions',
          items: updated.map((i) => ({ id: i.id, order_index: i.order_index })),
        });
      } catch (err) {
        console.error('Erreur réordonnancement questions', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* HEADER DE NAVIGATION */}
      <Header
        title={isNew ? 'Nouvelle Leçon' : `Édition : ${lessonForm.title || 'Sans titre'}`}
        subtitle="Configurez les paramètres de la leçon, ses fiches explicatives et ses exercices interactifs."
        action={
          <div className="flex items-center gap-2">
            <Link
              to="/lessons"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
            >
              <ArrowLeft size={14} />
              <span>Retour</span>
            </Link>

            {!isNew && (
              <button
                type="button"
                onClick={handleExportJson}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
              >
                <Download size={14} />
                <span>Exporter JSON</span>
              </button>
            )}

            <button
              form="lesson-form"
              type="submit"
              disabled={saveLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition disabled:opacity-50"
            >
              <Save size={14} />
              <span>{saveLoading ? 'Enregistrement...' : 'Enregistrer la leçon'}</span>
            </button>
          </div>
        }
      />

      {/* GRILLE PRINCIPALE (7 COLS GAUCHE : FORMULAIRE & ONGLETS, 5 COLS DROITE : PREVIEW SMARTPHONE) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* COLONNE GAUCHE (7/12) */}
        <div className="xl:col-span-7 space-y-6">
          {/* CARTE DES PARAMÈTRES GÉNÉRAUX */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Informations Générales</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  lessonForm.status === 'published'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {lessonForm.status === 'published' ? 'Publiée' : 'Brouillon'}
              </span>
            </h3>

            <form id="lesson-form" onSubmit={handleSaveLesson} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Titre de la leçon
                </label>
                <input
                  type="text"
                  required
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  placeholder="ex: Se soigner sans galérer"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Catégorie</label>
                  <select
                    value={lessonForm.category_id}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setLessonForm({
                        ...lessonForm,
                        category_id: newCat,
                        unit_id: undefined,
                      });
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Unité parente (Optionnel)
                  </label>
                  <select
                    value={lessonForm.unit_id || ''}
                    onChange={(e) =>
                      setLessonForm({
                        ...lessonForm,
                        unit_id: e.target.value || undefined,
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    <option value="">Aucune unité</option>
                    {filteredUnits.map((u) => (
                      <option key={u.id} value={u.id}>
                        Unité {u.unit_number} : {u.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Récompense XP
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={lessonForm.xp_reward}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, xp_reward: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ordre d'affichage
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={lessonForm.order_index}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, order_index: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Statut</label>
                  <select
                    value={lessonForm.status}
                    onChange={(e) =>
                      setLessonForm({
                        ...lessonForm,
                        status: e.target.value as 'draft' | 'published',
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="draft">Brouillon</option>
                    <option value="published">Publiée</option>
                  </select>
                </div>
              </div>
            </form>
          </div>

          {/* ONGLETS FICHES VS QUESTIONS */}
          {!isNew && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('screens');
                    setActivePreviewIndex(0);
                  }}
                  className={`flex items-center gap-2 px-5 py-3 text-xs font-extrabold border-b-2 transition ${
                    activeTab === 'screens'
                      ? 'border-blue-600 text-blue-600 bg-white rounded-t-xl'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <BookOpen size={16} />
                  <span>Fiches de Cours ({screens.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('questions');
                    setActivePreviewIndex(0);
                  }}
                  className={`flex items-center gap-2 px-5 py-3 text-xs font-extrabold border-b-2 transition ${
                    activeTab === 'questions'
                      ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-xl'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <HelpCircle size={16} />
                  <span>Questions Quiz ({questions.length})</span>
                </button>
              </div>

              {/* BARRE D'ACTION DE L'ONGLET */}
              <div className="p-4 bg-white flex items-center justify-between border-b border-slate-100">
                <p className="text-xs text-slate-500">
                  {activeTab === 'screens'
                    ? 'Glissez-déposez les fiches pour modifier leur ordre de lecture.'
                    : 'Glissez-déposez les questions pour changer l’enchaînement du quiz.'}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    activeTab === 'screens' ? handleOpenScreenModal() : handleOpenQuestionModal()
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition"
                >
                  <Plus size={14} />
                  <span>{activeTab === 'screens' ? 'Ajouter une Fiche' : 'Ajouter une Question'}</span>
                </button>
              </div>

              {/* LISTE RÉORDONNABLE (DRAG AND DROP) */}
              <div className="p-4">
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="content-list">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {activeTab === 'screens'
                          ? screens.map((screen, index) => {
                              const isPreviewActive =
                                activePreviewIndex === index && activeTab === 'screens';
                              return (
                                <Draggable key={screen.id} draggableId={screen.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      onClick={() => setActivePreviewIndex(index)}
                                      className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                                        snapshot.isDragging
                                          ? 'shadow-xl bg-blue-50 border-blue-400'
                                          : isPreviewActive
                                          ? 'bg-blue-50/50 border-blue-400 shadow-sm'
                                          : 'bg-white border-slate-200 hover:border-slate-300'
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div
                                          {...provided.dragHandleProps}
                                          className="text-slate-400 hover:text-slate-600 p-1 cursor-grab"
                                        >
                                          <GripVertical size={16} />
                                        </div>
                                        <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                                          {index + 1}
                                        </div>
                                        <div>
                                          <h4 className="text-xs font-bold text-slate-900">
                                            {screen.title}
                                          </h4>
                                          <p className="text-[11px] text-slate-500 line-clamp-1 max-w-sm">
                                            {screen.body}
                                          </p>
                                          {screen.tip && (
                                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-semibold mt-0.5">
                                              <Lightbulb size={10} />
                                              Astuce incluse
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      <div
                                        className="flex items-center gap-1"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <button
                                          type="button"
                                          onClick={() => handleOpenScreenModal(screen)}
                                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                                        >
                                          <Edit2 size={14} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setDeleteScreenTarget(screen)}
                                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              );
                            })
                          : questions.map((q, index) => {
                              const isPreviewActive =
                                activePreviewIndex === index && activeTab === 'questions';
                              return (
                                <Draggable key={q.id} draggableId={q.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      onClick={() => setActivePreviewIndex(index)}
                                      className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                                        snapshot.isDragging
                                          ? 'shadow-xl bg-indigo-50 border-indigo-400'
                                          : isPreviewActive
                                          ? 'bg-indigo-50/50 border-indigo-400 shadow-sm'
                                          : 'bg-white border-slate-200 hover:border-slate-300'
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div
                                          {...provided.dragHandleProps}
                                          className="text-slate-400 hover:text-slate-600 p-1 cursor-grab"
                                        >
                                          <GripVertical size={16} />
                                        </div>
                                        <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center justify-center">
                                          {index + 1}
                                        </div>
                                        <div>
                                          <div className="flex items-center gap-2 mb-0.5">
                                            <span
                                              className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                                q.type === 'order'
                                                  ? 'bg-purple-100 text-purple-700'
                                                  : q.type === 'matching'
                                                  ? 'bg-emerald-100 text-emerald-700'
                                                  : q.type === 'document'
                                                  ? 'bg-amber-100 text-amber-800'
                                                  : q.type === 'bucket'
                                                  ? 'bg-indigo-100 text-indigo-700'
                                                  : q.type === 'scam'
                                                  ? 'bg-rose-100 text-rose-700'
                                                  : q.type === 'scenario'
                                                  ? 'bg-sky-100 text-sky-700'
                                                  : 'bg-blue-100 text-blue-700'
                                              }`}
                                            >
                                              {q.type === 'order'
                                                ? 'Ordre'
                                                : q.type === 'matching'
                                                ? 'Association'
                                                : q.type === 'document'
                                                ? 'Décryptage'
                                                : q.type === 'bucket'
                                                ? 'Tri en bac'
                                                : q.type === 'scam'
                                                ? 'Arnaque'
                                                : q.type === 'scenario'
                                                ? 'Cas pratique'
                                                : 'QCM'}
                                            </span>
                                            <h4 className="text-xs font-bold text-slate-900 truncate max-w-[280px]">
                                              {q.prompt}
                                            </h4>
                                          </div>
                                          <p className="text-[11px] text-slate-500">
                                            {q.type === 'matching'
                                              ? `${q.options?.length || 0} paires configurées`
                                              : q.type === 'order'
                                              ? `${q.options?.length || 0} étapes à ordonner`
                                              : q.type === 'document'
                                              ? `${q.options?.length || 0} lignes de document`
                                              : q.type === 'bucket'
                                              ? `${q.options?.items?.length || 0} éléments à trier`
                                              : q.type === 'scam'
                                              ? `Simulation ${q.options?.channel || 'SMS'}`
                                              : q.type === 'scenario'
                                              ? `${q.options?.options?.length || 0} décisions à choisir`
                                              : `${q.options?.length || 0} choix configurés`}{' '}
                                            • Catégorie : {q.category}
                                          </p>
                                        </div>
                                      </div>

                                      <div
                                        className="flex items-center gap-1"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <button
                                          type="button"
                                          onClick={() => handleOpenQuestionModal(q)}
                                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                                        >
                                          <Edit2 size={14} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setDeleteQuestionTarget(q)}
                                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              );
                            })}
                        {provided.placeholder}

                        {activeTab === 'screens' && screens.length === 0 && (
                          <div className="py-8 text-center text-slate-400 text-xs">
                            Aucune fiche de cours pour l’instant. Cliquez sur "Ajouter une Fiche".
                          </div>
                        )}

                        {activeTab === 'questions' && questions.length === 0 && (
                          <div className="py-8 text-center text-slate-400 text-xs">
                            Aucune question de quiz. Cliquez sur "Ajouter une Question".
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            </div>
          )}
        </div>

        {/* COLONNE DROITE (5/12) : PHONE PREVIEW INTERACTIF */}
        <div className="xl:col-span-5 flex flex-col items-center sticky top-24">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm w-full flex flex-col items-center">
            <PhonePreview
              lessonTitle={lessonForm.title}
              category={selectedCategoryObj}
              screens={screens}
              questions={questions}
              activeTab={activeTab}
              activeIndex={activePreviewIndex}
            />
          </div>
        </div>
      </div>

      {/* MODAL FICHE (SCREEN) */}
      <Modal
        isOpen={screenModalOpen}
        onClose={() => setScreenModalOpen(false)}
        title={editingScreen ? 'Modifier la Fiche de Cours' : 'Ajouter une Fiche de Cours'}
        maxWidth="xl"
      >
        <form onSubmit={handleSaveScreen} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Titre de la Fiche</label>
            <input
              type="text"
              required
              value={screenForm.title}
              onChange={(e) => setScreenForm({ ...screenForm, title: e.target.value })}
              placeholder="ex: La Sécu et ta carte Vitale"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Corps du texte pédagogique
            </label>
            <textarea
              required
              rows={6}
              value={screenForm.body}
              onChange={(e) => setScreenForm({ ...screenForm, body: e.target.value })}
              placeholder="Rédigez le texte explicatif ici..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-800 mb-1 flex items-center gap-1.5">
              <Lightbulb size={14} className="text-amber-500" />
              <span>Bon réflexe / Astuce clé (Optionnel)</span>
            </label>
            <textarea
              rows={2}
              value={screenForm.tip}
              onChange={(e) => setScreenForm({ ...screenForm, tip: e.target.value })}
              placeholder="ex: Un SMS te demande de payer ta carte Vitale ? C'est une arnaque, toujours."
              className="w-full px-3 py-2 text-xs bg-amber-50/50 border border-amber-200 rounded-xl text-amber-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setScreenModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700"
            >
              Enregistrer la fiche
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL QUESTION QUIZ */}
      <Modal
        isOpen={questionModalOpen}
        onClose={() => setQuestionModalOpen(false)}
        title={editingQuestion ? 'Modifier la Question de Quiz' : 'Ajouter une Question de Quiz'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveQuestion} className="space-y-4">
          {/* Sélecteur de type d'exercice */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Type d'exercice
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  if (questionForm.type !== 'qcm') {
                    setQuestionForm({
                      ...questionForm,
                      type: 'qcm',
                      options: [
                        { letter: 'A', text: '', correct: true },
                        { letter: 'B', text: '', correct: false },
                        { letter: 'C', text: '', correct: false },
                      ],
                    });
                  }
                }}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                  questionForm.type === 'qcm'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <HelpCircle size={14} />
                <span>QCM</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (questionForm.type !== 'order') {
                    setQuestionForm({
                      ...questionForm,
                      type: 'order',
                      options: [
                        { id: '1', text: '' },
                        { id: '2', text: '' },
                        { id: '3', text: '' },
                        { id: '4', text: '' },
                      ],
                    });
                  }
                }}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                  questionForm.type === 'order'
                    ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ListOrdered size={14} />
                <span>Ordre</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (questionForm.type !== 'matching') {
                    setQuestionForm({
                      ...questionForm,
                      type: 'matching',
                      options: [
                        { id: '1', left: '', right: '' },
                        { id: '2', left: '', right: '' },
                        { id: '3', left: '', right: '' },
                        { id: '4', left: '', right: '' },
                      ],
                    });
                  }
                }}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                  questionForm.type === 'matching'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Link2 size={14} />
                <span>Association</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (questionForm.type !== 'document') {
                    setQuestionForm({
                      ...questionForm,
                      type: 'document',
                      options: [
                        { id: '1', label: 'Salaire brut', value: '2 100,00 €', correct: false },
                        { id: '2', label: 'Net à payer avant impôt', value: '1 650,00 €', correct: true },
                        { id: '3', label: 'Cotisations santé', value: '180,00 €', correct: false },
                      ],
                    });
                  }
                }}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                  questionForm.type === 'document'
                    ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileSearch size={14} />
                <span>Décryptage</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (questionForm.type !== 'bucket') {
                    setQuestionForm({
                      ...questionForm,
                      type: 'bucket',
                      options: {
                        buckets: [
                          { id: 'b1', label: 'Besoins', color: '#3B82F6' },
                          { id: 'b2', label: 'Envies', color: '#8B5CF6' },
                          { id: 'b3', label: 'Épargne', color: '#10B981' },
                        ],
                        items: [
                          { id: '1', text: 'Loyer et charges', bucketId: 'b1' },
                          { id: '2', text: 'Sorties & loisirs', bucketId: 'b2' },
                          { id: '3', text: 'Virement Livret A', bucketId: 'b3' },
                        ],
                      },
                    });
                  }
                }}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                  questionForm.type === 'bucket'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Layers size={14} />
                <span>Tri en bac</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (questionForm.type !== 'scam') {
                    setQuestionForm({
                      ...questionForm,
                      type: 'scam',
                      options: {
                        sender: 'Alerte-Sécurité (+33 7 45 12 98 23)',
                        channel: 'sms',
                        message: 'ALERTE SÉCURITÉ : Un paiement suspect de 350€ a été détecté. Annulez-le immédiatement ici : https://espace-securite-banque.com',
                        isScam: true,
                        redFlags: [
                          "Une banque ne demande JAMAIS d'annuler une opération par SMS",
                          "Numéro de portable individuel (07)",
                          "Lien pirate non officiel"
                        ],
                      },
                    });
                  }
                }}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                  questionForm.type === 'scam'
                    ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ShieldAlert size={14} />
                <span>Arnaque</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (questionForm.type !== 'scenario') {
                    setQuestionForm({
                      ...questionForm,
                      type: 'scenario',
                      options: {
                        context: "Lucas a un imprévu : sa facture d'électricité de 90 € vient d'arriver alors qu'il ne lui reste que 40 € sur son compte avant sa paie dans 10 jours.",
                        persona: {
                          name: "Lucas",
                          role: "Jeune actif",
                        },
                        keyFacts: [
                          { label: "Solde", value: "40 €" },
                          { label: "Facture", value: "90 €" },
                        ],
                        options: [
                          {
                            id: '1',
                            text: "Contacter le fournisseur pour demander un report ou un étalement sans frais",
                            correct: true,
                            consequence: "Super réflexe ! Prévenir en amont permet d'obtenir un délai sans frais ni pénalité.",
                          },
                          {
                            id: '2',
                            text: "Laisser le prélèvement passer et payer 20 € d'agios et de frais de rejet",
                            correct: false,
                            consequence: "Mauvais calcul : un rejet engendre des frais bancaires et un rappel avec pénalité.",
                          },
                          {
                            id: '3',
                            text: "Souscrire un mini-crédit express en ligne à taux très élevé",
                            correct: false,
                            consequence: "Danger d'endettement : les taux de ces crédits rapides dépassent souvent 15 à 20%.",
                          },
                        ],
                      },
                    });
                  }
                }}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                  questionForm.type === 'scenario'
                    ? 'bg-sky-50 border-sky-500 text-sky-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Briefcase size={14} />
                <span>Cas pratique</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Intitulé / Consigne
              </label>
              <input
                type="text"
                required
                value={questionForm.prompt}
                onChange={(e) => setQuestionForm({ ...questionForm, prompt: e.target.value })}
                placeholder={
                  questionForm.type === 'order'
                    ? "ex: Remets dans le bon ordre les étapes pour déclarer un médecin..."
                    : questionForm.type === 'matching'
                    ? "ex: Associe chaque document à son rôle exact..."
                    : questionForm.type === 'document'
                    ? "ex: Sur cette fiche de paie, quelle ligne indique la somme virée sur ton compte ?"
                    : questionForm.type === 'bucket'
                    ? "ex: Classe chaque dépense dans sa catégorie budgétaire (50/30/20)..."
                    : questionForm.type === 'scam'
                    ? "ex: Tu reçois ce SMS d'alerte bancaire. Arnaque ou authentique ?"
                    : questionForm.type === 'scenario'
                    ? "ex: Aide Lucas à résoudre son imprévu financier de fin de mois..."
                    : "ex: Tu n'as pas déclaré de médecin traitant. Que se passe-t-il ?"
                }
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Catégorie Quiz</label>
              <input
                type="text"
                value={questionForm.category}
                onChange={(e) => setQuestionForm({ ...questionForm, category: e.target.value })}
                placeholder="ex: Le médecin traitant"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {/* 1. ÉDITEUR TYPE QCM */}
          {questionForm.type === 'qcm' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700">
                  Options de réponse (Cochez la bonne réponse)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const currentOpts = Array.isArray(questionForm.options) ? questionForm.options : [];
                    const nextLetter = String.fromCharCode(65 + currentOpts.length);
                    setQuestionForm({
                      ...questionForm,
                      options: [...currentOpts, { letter: nextLetter, text: '', correct: false }],
                    });
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <Plus size={14} />
                  <span>Ajouter une option</span>
                </button>
              </div>

              <div className="space-y-2">
                {(Array.isArray(questionForm.options) ? questionForm.options : []).map((opt: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                      {opt.letter || String.fromCharCode(65 + idx)}
                    </span>
                    <input
                      type="text"
                      required
                      value={opt.text || ''}
                      onChange={(e) => {
                        const newOpts = [...questionForm.options];
                        newOpts[idx] = { ...newOpts[idx], text: e.target.value };
                        setQuestionForm({ ...questionForm, options: newOpts });
                      }}
                      placeholder={`Texte de l'option ${opt.letter || String.fromCharCode(65 + idx)}`}
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newOpts = (questionForm.options as any[]).map((o: any, i: number) => ({
                          ...o,
                          correct: i === idx,
                        }));
                        setQuestionForm({ ...questionForm, options: newOpts });
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                        opt.correct
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      <Check size={12} />
                      <span>{opt.correct ? 'Correcte' : 'Fausse'}</span>
                    </button>
                    {(questionForm.options as any[]).length > 2 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newOpts = (questionForm.options as any[]).filter((_: any, i: number) => i !== idx);
                          setQuestionForm({ ...questionForm, options: newOpts });
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. ÉDITEUR TYPE ORDRE (CHRONOLOGIE) */}
          {questionForm.type === 'order' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700">
                  Étapes dans le bon ordre (L’application les mélangera automatiquement pour l'utilisateur)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const currentOpts = Array.isArray(questionForm.options) ? questionForm.options : [];
                    const nextId = String(currentOpts.length + 1);
                    setQuestionForm({
                      ...questionForm,
                      options: [...currentOpts, { id: nextId, text: '' }],
                    });
                  }}
                  className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <Plus size={14} />
                  <span>Ajouter une étape</span>
                </button>
              </div>

              <div className="space-y-2">
                {(Array.isArray(questionForm.options) ? questionForm.options : []).map((step: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      required
                      value={step.text || ''}
                      onChange={(e) => {
                        const newOpts = [...questionForm.options];
                        newOpts[idx] = { ...newOpts[idx], text: e.target.value };
                        setQuestionForm({ ...questionForm, options: newOpts });
                      }}
                      placeholder={`Étape ${idx + 1} dans l'ordre chronologique exact`}
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    />
                    {(questionForm.options as any[]).length > 2 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newOpts = (questionForm.options as any[]).filter((_: any, i: number) => i !== idx);
                          setQuestionForm({ ...questionForm, options: newOpts });
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. ÉDITEUR TYPE ASSOCIATION (MATCHING) */}
          {questionForm.type === 'matching' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700">
                  Paires à associer (Gauche ↔ Droite)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const currentOpts = Array.isArray(questionForm.options) ? questionForm.options : [];
                    const nextId = String(currentOpts.length + 1);
                    setQuestionForm({
                      ...questionForm,
                      options: [...currentOpts, { id: nextId, left: '', right: '' }],
                    });
                  }}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  <Plus size={14} />
                  <span>Ajouter une paire</span>
                </button>
              </div>

              <div className="space-y-2">
                {(Array.isArray(questionForm.options) ? questionForm.options : []).map((pair: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      required
                      value={pair.left || ''}
                      onChange={(e) => {
                        const newOpts = [...questionForm.options];
                        newOpts[idx] = { ...newOpts[idx], left: e.target.value };
                        setQuestionForm({ ...questionForm, options: newOpts });
                      }}
                      placeholder="Élément gauche (ex: Carte Vitale)"
                      className="w-1/2 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                    <span className="text-slate-400 font-bold">↔</span>
                    <input
                      type="text"
                      required
                      value={pair.right || ''}
                      onChange={(e) => {
                        const newOpts = [...questionForm.options];
                        newOpts[idx] = { ...newOpts[idx], right: e.target.value };
                        setQuestionForm({ ...questionForm, options: newOpts });
                      }}
                      placeholder="Élément droit (ex: Remboursement Sécu)"
                      className="w-1/2 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    />
                    {(questionForm.options as any[]).length > 2 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newOpts = (questionForm.options as any[]).filter((_: any, i: number) => i !== idx);
                          setQuestionForm({ ...questionForm, options: newOpts });
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. ÉDITEUR TYPE DÉCRYPTAGE DE DOCUMENT */}
          {questionForm.type === 'document' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700">
                  Lignes du document (Cochez la ligne cible à identifier)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const currentOpts = Array.isArray(questionForm.options) ? questionForm.options : [];
                    const nextId = String(currentOpts.length + 1);
                    setQuestionForm({
                      ...questionForm,
                      options: [
                        ...currentOpts,
                        { id: nextId, label: '', value: '', correct: false },
                      ],
                    });
                  }}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                >
                  <Plus size={14} />
                  <span>Ajouter une ligne</span>
                </button>
              </div>

              <div className="space-y-2">
                {(Array.isArray(questionForm.options) ? questionForm.options : []).map((field: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      required
                      value={field.label || ''}
                      onChange={(e) => {
                        const newOpts = [...questionForm.options];
                        newOpts[idx] = { ...newOpts[idx], label: e.target.value };
                        setQuestionForm({ ...questionForm, options: newOpts });
                      }}
                      placeholder="Intitulé de la ligne (ex: Salaire brut)"
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    />
                    <input
                      type="text"
                      required
                      value={field.value || ''}
                      onChange={(e) => {
                        const newOpts = [...questionForm.options];
                        newOpts[idx] = { ...newOpts[idx], value: e.target.value };
                        setQuestionForm({ ...questionForm, options: newOpts });
                      }}
                      placeholder="Montant / Mention (ex: 2 150,00 €)"
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newOpts = (questionForm.options as any[]).map((f: any, i: number) => ({
                          ...f,
                          correct: i === idx,
                        }));
                        setQuestionForm({ ...questionForm, options: newOpts });
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                        field.correct
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      <Check size={12} />
                      <span>{field.correct ? 'Cible' : 'Neutre'}</span>
                    </button>
                    {(questionForm.options as any[]).length > 2 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newOpts = (questionForm.options as any[]).filter((_: any, i: number) => i !== idx);
                          setQuestionForm({ ...questionForm, options: newOpts });
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. ÉDITEUR TYPE TRI EN BAC */}
          {questionForm.type === 'bucket' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Bacs de tri (Catégories)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const currentBuckets = questionForm.options?.buckets || [];
                      const nextId = `b${currentBuckets.length + 1}`;
                      setQuestionForm({
                        ...questionForm,
                        options: {
                          ...questionForm.options,
                          buckets: [...currentBuckets, { id: nextId, label: '', color: '#3B82F6' }],
                        },
                      });
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <Plus size={14} />
                    <span>Ajouter un bac</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {(questionForm.options?.buckets || []).map((bucket: any, bIdx: number) => (
                    <div key={bucket.id || bIdx} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: bucket.color || '#3B82F6' }} />
                      <input
                        type="text"
                        required
                        value={bucket.label || ''}
                        onChange={(e) => {
                          const newBuckets = [...(questionForm.options?.buckets || [])];
                          newBuckets[bIdx] = { ...newBuckets[bIdx], label: e.target.value };
                          setQuestionForm({
                            ...questionForm,
                            options: { ...questionForm.options, buckets: newBuckets },
                          });
                        }}
                        placeholder={`Nom du bac ${bIdx + 1} (ex: Besoins 50%)`}
                        className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
                      />
                      {(questionForm.options?.buckets || []).length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newBuckets = questionForm.options.buckets.filter((_: any, i: number) => i !== bIdx);
                            setQuestionForm({
                              ...questionForm,
                              options: { ...questionForm.options, buckets: newBuckets },
                            });
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Éléments à classer et leur bac cible
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const currentItems = questionForm.options?.items || [];
                      const defaultBucketId = questionForm.options?.buckets?.[0]?.id || 'b1';
                      const nextId = String(currentItems.length + 1);
                      setQuestionForm({
                        ...questionForm,
                        options: {
                          ...questionForm.options,
                          items: [...currentItems, { id: nextId, text: '', bucketId: defaultBucketId }],
                        },
                      });
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <Plus size={14} />
                    <span>Ajouter un élément</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {(questionForm.options?.items || []).map((item: any, itIdx: number) => (
                    <div key={item.id || itIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        value={item.text || ''}
                        onChange={(e) => {
                          const newItems = [...(questionForm.options?.items || [])];
                          newItems[itIdx] = { ...newItems[itIdx], text: e.target.value };
                          setQuestionForm({
                            ...questionForm,
                            options: { ...questionForm.options, items: newItems },
                          });
                        }}
                        placeholder="Élément à trier (ex: Loyer et électricité)"
                        className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                      />
                      <select
                        value={item.bucketId || ''}
                        onChange={(e) => {
                          const newItems = [...(questionForm.options?.items || [])];
                          newItems[itIdx] = { ...newItems[itIdx], bucketId: e.target.value };
                          setQuestionForm({
                            ...questionForm,
                            options: { ...questionForm.options, items: newItems },
                          });
                        }}
                        className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                      >
                        {(questionForm.options?.buckets || []).map((b: any) => (
                          <option key={b.id} value={b.id}>
                            Bac : {b.label}
                          </option>
                        ))}
                      </select>
                      {(questionForm.options?.items || []).length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newItems = questionForm.options.items.filter((_: any, i: number) => i !== itIdx);
                            setQuestionForm({
                              ...questionForm,
                              options: { ...questionForm.options, items: newItems },
                            });
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 6. ÉDITEUR TYPE DÉTECTEUR D'ARNAQUE */}
          {questionForm.type === 'scam' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Expéditeur simulé
                  </label>
                  <input
                    type="text"
                    required
                    value={questionForm.options?.sender || ''}
                    onChange={(e) =>
                      setQuestionForm({
                        ...questionForm,
                        options: { ...questionForm.options, sender: e.target.value },
                      })
                    }
                    placeholder="ex: Votre Banque (+33 7 45 12 98 23)"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Canal de réception
                  </label>
                  <select
                    value={questionForm.options?.channel || 'sms'}
                    onChange={(e) =>
                      setQuestionForm({
                        ...questionForm,
                        options: { ...questionForm.options, channel: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                  >
                    <option value="sms">SMS / Message texte</option>
                    <option value="email">E-mail</option>
                    <option value="notification">Notification d'application</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Texte du message simulé
                </label>
                <textarea
                  required
                  rows={3}
                  value={questionForm.options?.message || ''}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      options: { ...questionForm.options, message: e.target.value },
                    })
                  }
                  placeholder="Rédigez le texte du message avec éventuel faux lien..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              {/* Verdict : Arnaque ou Légitime */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">Ce message est réellement :</span>
                <button
                  type="button"
                  onClick={() =>
                    setQuestionForm({
                      ...questionForm,
                      options: { ...questionForm.options, isScam: true },
                    })
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                    questionForm.options?.isScam !== false
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  <ShieldAlert size={14} />
                  <span>Une Arnaque</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setQuestionForm({
                      ...questionForm,
                      options: { ...questionForm.options, isScam: false },
                    })
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                    questionForm.options?.isScam === false
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  <Check size={14} />
                  <span>Authentique</span>
                </button>
              </div>

              {/* Indices / Red flags */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Indices de détection (affichés en correction)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const currentFlags = questionForm.options?.redFlags || [];
                      setQuestionForm({
                        ...questionForm,
                        options: {
                          ...questionForm.options,
                          redFlags: [...currentFlags, ''],
                        },
                      });
                    }}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                  >
                    <Plus size={14} />
                    <span>Ajouter un indice</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {(questionForm.options?.redFlags || []).map((flag: string, fIdx: number) => (
                    <div key={fIdx} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-rose-600">🚨</span>
                      <input
                        type="text"
                        required
                        value={flag}
                        onChange={(e) => {
                          const newFlags = [...(questionForm.options?.redFlags || [])];
                          newFlags[fIdx] = e.target.value;
                          setQuestionForm({
                            ...questionForm,
                            options: { ...questionForm.options, redFlags: newFlags },
                          });
                        }}
                        placeholder="ex: Une banque ne demande jamais d'annuler une opération par SMS"
                        className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newFlags = questionForm.options.redFlags.filter((_: any, i: number) => i !== fIdx);
                          setQuestionForm({
                            ...questionForm,
                            options: { ...questionForm.options, redFlags: newFlags },
                          });
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 7. ÉDITEUR TYPE CAS PRATIQUE / SCÉNARIO */}
          {questionForm.type === 'scenario' && (
            <div className="space-y-4 p-3 bg-sky-50/50 rounded-2xl border border-sky-100">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-900 border-b border-sky-100 pb-2">
                <Briefcase size={14} className="text-sky-600" />
                <span>Configuration du Cas Pratique (Mise en situation)</span>
              </div>

              {/* Persona */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Prénom du personnage
                  </label>
                  <input
                    type="text"
                    value={questionForm.options?.persona?.name || ''}
                    onChange={(e) =>
                      setQuestionForm({
                        ...questionForm,
                        options: {
                          ...questionForm.options,
                          persona: {
                            ...(questionForm.options?.persona || {}),
                            name: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="ex: Lucas"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rôle / Situation du personnage
                  </label>
                  <input
                    type="text"
                    value={questionForm.options?.persona?.role || ''}
                    onChange={(e) =>
                      setQuestionForm({
                        ...questionForm,
                        options: {
                          ...questionForm.options,
                          persona: {
                            ...(questionForm.options?.persona || {}),
                            role: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="ex: Étudiant alternant 21 ans"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Contexte narratif */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mise en situation / Contexte narratif
                </label>
                <textarea
                  required
                  rows={3}
                  value={questionForm.options?.context || ''}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      options: { ...questionForm.options, context: e.target.value },
                    })
                  }
                  placeholder="Décrivez la situation concrète à laquelle le personnage fait face..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl leading-relaxed"
                />
              </div>

              {/* Indicateurs clés */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Indicateurs clés / Chiffres du cas (optionnel)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const currentFacts = questionForm.options?.keyFacts || [];
                      setQuestionForm({
                        ...questionForm,
                        options: {
                          ...questionForm.options,
                          keyFacts: [...currentFacts, { label: '', value: '' }],
                        },
                      });
                    }}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                  >
                    <Plus size={14} />
                    <span>Ajouter un indicateur</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {(questionForm.options?.keyFacts || []).map((fact: any, fIdx: number) => (
                    <div key={fIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={fact.label || ''}
                        onChange={(e) => {
                          const newFacts = [...(questionForm.options?.keyFacts || [])];
                          newFacts[fIdx] = { ...newFacts[fIdx], label: e.target.value };
                          setQuestionForm({
                            ...questionForm,
                            options: { ...questionForm.options, keyFacts: newFacts },
                          });
                        }}
                        placeholder="Label (ex: Solde bancaire)"
                        className="w-1/2 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
                      />
                      <input
                        type="text"
                        value={fact.value || ''}
                        onChange={(e) => {
                          const newFacts = [...(questionForm.options?.keyFacts || [])];
                          newFacts[fIdx] = { ...newFacts[fIdx], value: e.target.value };
                          setQuestionForm({
                            ...questionForm,
                            options: { ...questionForm.options, keyFacts: newFacts },
                          });
                        }}
                        placeholder="Valeur (ex: 40 €)"
                        className="w-1/2 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newFacts = questionForm.options.keyFacts.filter((_: any, i: number) => i !== fIdx);
                          setQuestionForm({
                            ...questionForm,
                            options: { ...questionForm.options, keyFacts: newFacts },
                          });
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Décisions & Conséquences */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Choix de décisions & Conséquences
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const currentOpts = questionForm.options?.options || [];
                      const nextId = String(currentOpts.length + 1);
                      setQuestionForm({
                        ...questionForm,
                        options: {
                          ...questionForm.options,
                          options: [
                            ...currentOpts,
                            { id: nextId, text: '', correct: false, consequence: '' },
                          ],
                        },
                      });
                    }}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                  >
                    <Plus size={14} />
                    <span>Ajouter une décision</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(questionForm.options?.options || []).map((opt: any, oIdx: number) => (
                    <div
                      key={opt.id || oIdx}
                      className={`p-3 rounded-xl border transition ${
                        opt.correct
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const newOpts = (questionForm.options?.options || []).map(
                                (o: any, idx: number) => ({
                                  ...o,
                                  correct: idx === oIdx,
                                })
                              );
                              setQuestionForm({
                                ...questionForm,
                                options: { ...questionForm.options, options: newOpts },
                              });
                            }}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                              opt.correct
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'
                            }`}
                          >
                            {opt.correct ? '✓ Meilleure décision' : 'Définir comme bon choix'}
                          </button>
                        </div>

                        {(questionForm.options?.options || []).length > 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newOpts = questionForm.options.options.filter(
                                (_: any, i: number) => i !== oIdx
                              );
                              setQuestionForm({
                                ...questionForm,
                                options: { ...questionForm.options, options: newOpts },
                              });
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <input
                          type="text"
                          required
                          value={opt.text || ''}
                          onChange={(e) => {
                            const newOpts = [...(questionForm.options?.options || [])];
                            newOpts[oIdx] = { ...newOpts[oIdx], text: e.target.value };
                            setQuestionForm({
                              ...questionForm,
                              options: { ...questionForm.options, options: newOpts },
                            });
                          }}
                          placeholder="Action / Décision proposée au joueur..."
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium"
                        />
                        <input
                          type="text"
                          value={opt.consequence || ''}
                          onChange={(e) => {
                            const newOpts = [...(questionForm.options?.options || [])];
                            newOpts[oIdx] = { ...newOpts[oIdx], consequence: e.target.value };
                            setQuestionForm({
                              ...questionForm,
                              options: { ...questionForm.options, options: newOpts },
                            });
                          }}
                          placeholder="Conséquence concrète / Feedback pédagogique..."
                          className="w-full px-3 py-1.5 text-[11px] bg-slate-50 border border-slate-200 rounded-lg text-slate-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Explication */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Explication Pédagogique (affichée après réponse)
            </label>
            <textarea
              rows={2}
              value={questionForm.explanation}
              onChange={(e) =>
                setQuestionForm({ ...questionForm, explanation: e.target.value })
              }
              placeholder="ex: Hors parcours de soins, la Sécu rembourse beaucoup moins."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setQuestionModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700"
            >
              Enregistrer la question
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRMATION SUPPRESSION FICHE */}
      <ConfirmDialog
        isOpen={!!deleteScreenTarget}
        onClose={() => setDeleteScreenTarget(null)}
        onConfirm={handleDeleteScreen}
        title="Supprimer la fiche"
        message={`Êtes-vous sûr de vouloir supprimer la fiche "${deleteScreenTarget?.title}" ?`}
      />

      {/* CONFIRMATION SUPPRESSION QUESTION */}
      <ConfirmDialog
        isOpen={!!deleteQuestionTarget}
        onClose={() => setDeleteQuestionTarget(null)}
        onConfirm={handleDeleteQuestion}
        title="Supprimer la question"
        message={`Êtes-vous sûr de vouloir supprimer cette question de quiz ?`}
      />
    </div>
  );
};

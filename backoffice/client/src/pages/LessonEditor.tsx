import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '../components/layout/Header.js';
import { PhonePreview } from '../components/preview/PhonePreview.js';
import { Modal } from '../components/ui/Modal.js';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.js';
import api from '../services/api.js';
import { Lesson, Category, Unit, LessonScreen, LessonQuestion, QuizOption } from '../types/index.js';
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
    unit_id: '',
    xp_reward: 50,
    order_index: 1,
    status: 'published' as 'draft' | 'published',
  });

  const [screens, setScreens] = useState<LessonScreen[]>([]);
  const [questions, setQuestions] = useState<LessonQuestion[]>([]);

  // Preview & Active Tabs
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
    prompt: string;
    category: string;
    explanation: string;
    options: QuizOption[];
  }>({
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

  // Sauvegarder les métadonnées de la leçon
  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonForm.category_id || !lessonForm.unit_id || !lessonForm.title) {
      alert('Veuillez renseigner le titre, la catégorie et l’unité');
      return;
    }

    setSaveLoading(true);
    try {
      if (isNew) {
        const res = await api.post('/content/lessons', lessonForm);
        navigate(`/lessons/${res.data.id}`, { replace: true });
      } else {
        await api.put(`/content/lessons/${id}`, lessonForm);
        alert('Leçon mise à jour avec succès !');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur enregistrement');
    } finally {
      setSaveLoading(false);
    }
  };

  // ------------------------------------
  // GESTION FICHES (SCREENS)
  // ------------------------------------
  const handleOpenScreenModal = (sc?: LessonScreen) => {
    if (sc) {
      setEditingScreen(sc);
      setScreenForm({
        title: sc.title,
        body: sc.body,
        tip: sc.tip || '',
      });
    } else {
      setEditingScreen(null);
      setScreenForm({
        title: '',
        body: '',
        tip: '',
      });
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
  // GESTION QUESTIONS (QUIZ)
  // ------------------------------------
  const handleOpenQuestionModal = (q?: LessonQuestion) => {
    if (q) {
      setEditingQuestion(q);
      setQuestionForm({
        prompt: q.prompt,
        category: q.category || 'Quiz',
        explanation: q.explanation || '',
        options: q.options || [],
      });
    } else {
      setEditingQuestion(null);
      setQuestionForm({
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
      const payload = items.map((item, index) => ({
        id: item.id,
        order_index: index + 1,
      }));
      setScreens(items.map((it, idx) => ({ ...it, order_index: idx + 1 })));
      setActivePreviewIndex(destIndex);

      try {
        await api.post('/content/reorder', { type: 'screens', items: payload });
      } catch (err) {
        console.error('Erreur reorder screens:', err);
      }
    } else {
      const items = Array.from(questions);
      const [reorderedItem] = items.splice(sourceIndex, 1);
      items.splice(destIndex, 0, reorderedItem);

      const payload = items.map((item, index) => ({
        id: item.id,
        order_index: index + 1,
      }));
      setQuestions(items.map((it, idx) => ({ ...it, order_index: idx + 1 })));
      setActivePreviewIndex(destIndex);

      try {
        await api.post('/content/reorder', { type: 'questions', items: payload });
      } catch (err) {
        console.error('Erreur reorder questions:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title={isNew ? 'Nouvelle Leçon' : `Édition : ${lessonForm.title || 'Leçon'}`}
        subtitle="Rédigez le cours, configurez les quiz et observez le rendu simulateur"
        action={
          <div className="flex items-center gap-2">
            <Link
              to="/lessons"
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              <ArrowLeft size={14} />
              <span>Retour</span>
            </Link>
            {!isNew && (
              <button
                type="button"
                onClick={() => {
                  api
                    .get(`/import-export/lessons/${id}`)
                    .then((res) => {
                      const dataStr =
                        'data:text/json;charset=utf-8,' +
                        encodeURIComponent(JSON.stringify(res.data, null, 2));
                      const a = document.createElement('a');
                      a.href = dataStr;
                      a.download = `lesson-${lessonForm.title}.json`;
                      a.click();
                      a.remove();
                    })
                    .catch(console.error);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition shadow-sm"
              >
                <Download size={14} />
                <span>Exporter JSON</span>
              </button>
            )}
            <button
              onClick={handleSaveLesson}
              disabled={saveLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50"
            >
              <Save size={14} />
              <span>{saveLoading ? 'Enregistrement...' : 'Enregistrer'}</span>
            </button>
          </div>
        }
      />

      <div className="p-8 flex-1 grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* COLONNE GAUCHE (7/12) : ÉDITEUR ET LISTE ORDONNABLE */}
        <div className="xl:col-span-7 space-y-6">
          {/* Métadonnées Leçon */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Paramètres de la Leçon
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catégorie</label>
                <select
                  value={lessonForm.category_id}
                  onChange={(e) =>
                    setLessonForm({ ...lessonForm, category_id: e.target.value, unit_id: '' })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Unité</label>
                <select
                  value={lessonForm.unit_id}
                  onChange={(e) => setLessonForm({ ...lessonForm, unit_id: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="">Sélectionner une unité</option>
                  {filteredUnits.map((u) => (
                    <option key={u.id} value={u.id}>
                      Unité {u.unit_number} - {u.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Titre de la Leçon</label>
              <input
                type="text"
                required
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                placeholder="ex: Se soigner sans galérer"
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Récompense XP</label>
                <input
                  type="number"
                  value={lessonForm.xp_reward}
                  onChange={(e) =>
                    setLessonForm({ ...lessonForm, xp_reward: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ordre dans l'unité</label>
                <input
                  type="number"
                  value={lessonForm.order_index}
                  onChange={(e) =>
                    setLessonForm({ ...lessonForm, order_index: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Statut Publication</label>
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
                  <option value="published">Publié (En ligne)</option>
                  <option value="draft">Brouillon (Masqué)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Onglets Fiches vs Questions */}
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

              {/* Barre d'action de l'onglet */}
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition"
                >
                  <Plus size={14} />
                  <span>
                    {activeTab === 'screens' ? 'Ajouter une Fiche' : 'Ajouter une Question'}
                  </span>
                </button>
              </div>

              {/* LISTE AVEC DRAG AND DROP */}
              <div className="p-4">
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="content-list">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2.5"
                      >
                        {activeTab === 'screens'
                          ? screens.map((screen, index) => {
                              const isPreviewActive =
                                activePreviewIndex === index && activeTab === 'screens';
                              return (
                                <Draggable
                                  key={screen.id}
                                  draggableId={screen.id}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      onClick={() => setActivePreviewIndex(index)}
                                      className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
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
                                          <h4 className="text-xs font-bold text-slate-900">
                                            {q.prompt}
                                          </h4>
                                          <p className="text-[11px] text-slate-500">
                                            {q.options?.length || 0} choix configurés • Catégorie :{' '}
                                            {q.category}
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
                placeholder="ex: Tu n'as pas déclaré de médecin traitant. Que se passe-t-il ?"
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

          {/* Options de réponse */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Options de réponse (Cochez la bonne réponse)
            </label>
            <div className="space-y-2">
              {questionForm.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                    {opt.letter}
                  </span>
                  <input
                    type="text"
                    required
                    value={opt.text}
                    onChange={(e) => {
                      const newOpts = [...questionForm.options];
                      newOpts[idx].text = e.target.value;
                      setQuestionForm({ ...questionForm, options: newOpts });
                    }}
                    placeholder={`Texte de l'option ${opt.letter}`}
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newOpts = questionForm.options.map((o, i) => ({
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
                </div>
              ))}
            </div>
          </div>

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

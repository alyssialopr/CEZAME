import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header.js';
import { Modal } from '../components/ui/Modal.js';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.js';
import api from '../services/api.js';
import { Category, Unit } from '../types/index.js';
import { Plus, Edit2, Trash2, FolderPlus, Layers, Hash } from 'lucide-react';
import { Badge } from '../components/ui/Badge.js';

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Catégorie
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState({
    id: '',
    label: '',
    subtitle: '',
    color: '#8FA6FF',
    border_color: '#607FE8',
    icon_name: 'FileText',
    order_index: 1,
  });

  // Modal Unité
  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [unitForm, setUnitForm] = useState({
    unit_number: 1,
    title: '',
    subtitle: '',
    order_index: 1,
  });

  // Dialog Suppressions
  const [deleteCatTarget, setDeleteCatTarget] = useState<Category | null>(null);
  const [deleteUnitTarget, setDeleteUnitTarget] = useState<Unit | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/content/categories');
      setCategories(res.data);
      if (!selectedCategory && res.data.length > 0) {
        setSelectedCategory(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnits = async (catId: string) => {
    try {
      const res = await api.get(`/content/units?category_id=${catId}`);
      setUnits(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchUnits(selectedCategory.id);
    }
  }, [selectedCategory]);

  const handleOpenCatModal = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat);
      setCatForm({
        id: cat.id,
        label: cat.label,
        subtitle: cat.subtitle || '',
        color: cat.color,
        border_color: cat.border_color || '#607FE8',
        icon_name: cat.icon_name || 'FileText',
        order_index: cat.order_index,
      });
    } else {
      setEditingCategory(null);
      setCatForm({
        id: '',
        label: '',
        subtitle: '',
        color: '#8FA6FF',
        border_color: '#607FE8',
        icon_name: 'FileText',
        order_index: categories.length + 1,
      });
    }
    setCatModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingCategory) {
        await api.put(`/content/categories/${editingCategory.id}`, catForm);
      } else {
        await api.post('/content/categories', catForm);
      }
      setCatModalOpen(false);
      await fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de l’enregistrement');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCatTarget) return;
    setActionLoading(true);
    try {
      await api.delete(`/content/categories/${deleteCatTarget.id}`);
      setDeleteCatTarget(null);
      if (selectedCategory?.id === deleteCatTarget.id) {
        setSelectedCategory(null);
      }
      await fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur suppression');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenUnitModal = (unit?: Unit) => {
    if (unit) {
      setEditingUnit(unit);
      setUnitForm({
        unit_number: unit.unit_number,
        title: unit.title,
        subtitle: unit.subtitle || '',
        order_index: unit.order_index,
      });
    } else {
      setEditingUnit(null);
      setUnitForm({
        unit_number: units.length + 1,
        title: '',
        subtitle: '',
        order_index: units.length + 1,
      });
    }
    setUnitModalOpen(true);
  };

  const handleSaveUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    setActionLoading(true);
    try {
      if (editingUnit) {
        await api.put(`/content/units/${editingUnit.id}`, unitForm);
      } else {
        await api.post('/content/units', {
          ...unitForm,
          category_id: selectedCategory.id,
        });
      }
      setUnitModalOpen(false);
      await fetchUnits(selectedCategory.id);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de l’enregistrement');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUnit = async () => {
    if (!deleteUnitTarget || !selectedCategory) return;
    setActionLoading(true);
    try {
      await api.delete(`/content/units/${deleteUnitTarget.id}`);
      setDeleteUnitTarget(null);
      await fetchUnits(selectedCategory.id);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur suppression');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Catégories & Unités"
        subtitle="Organisez les thématiques d’apprentissage et leurs progressions"
        action={
          <button
            type="button"
            onClick={() => handleOpenCatModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            <Plus size={16} />
            <span>Nouvelle Catégorie</span>
          </button>
        }
      />

      <div className="p-8 flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne gauche : Catégories */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
              Catégories ({categories.length})
            </h3>
          </div>

          <div className="space-y-3">
            {categories.map((cat) => {
              const isSelected = selectedCategory?.id === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-500 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm font-bold text-sm"
                      style={{ backgroundColor: cat.color }}
                    >
                      {cat.label.substring(0, 1)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{cat.label}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{cat.subtitle}</p>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {cat.id}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleOpenCatModal(cat)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                      title="Modifier"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteCatTarget(cat)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}

            {!loading && categories.length === 0 && (
              <p className="text-xs text-slate-400 p-4 bg-white rounded-2xl border text-center">
                Aucune catégorie trouvée. Créez-en une première.
              </p>
            )}
          </div>
        </div>

        {/* Colonne droite : Unités de la catégorie sélectionnée */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                Unités de {selectedCategory ? `"${selectedCategory.label}"` : 'la catégorie'}
              </h3>
              <p className="text-xs text-slate-500">
                {units.length} unité(s) rattachée(s)
              </p>
            </div>

            {selectedCategory && (
              <button
                type="button"
                onClick={() => handleOpenUnitModal()}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
              >
                <FolderPlus size={16} />
                <span>Ajouter une Unité</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {units.map((unit) => (
              <div
                key={unit.id}
                className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-slate-300 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-black flex items-center justify-center text-sm border border-slate-200">
                    <Hash size={14} className="text-slate-400 mr-0.5" />
                    {unit.unit_number}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-extrabold text-slate-900">{unit.title}</h4>
                      <Badge variant="gray">Ordre: {unit.order_index}</Badge>
                      <Badge variant="primary">
                        {unit.lessons?.length || 0} leçon(s)
                      </Badge>
                    </div>
                    {unit.subtitle && (
                      <p className="text-xs text-slate-500 mt-0.5">{unit.subtitle}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenUnitModal(unit)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition"
                    title="Modifier"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteUnitTarget(unit)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            {selectedCategory && units.length === 0 && (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
                <Layers size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-medium">Aucune unité pour cette catégorie.</p>
                <button
                  type="button"
                  onClick={() => handleOpenUnitModal()}
                  className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  + Créer la première unité
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL CATÉGORIE */}
      <Modal
        isOpen={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        title={editingCategory ? 'Modifier la Catégorie' : 'Créer une Catégorie'}
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Identifiant (ID)</label>
            <input
              type="text"
              required
              disabled={!!editingCategory}
              value={catForm.id}
              onChange={(e) => setCatForm({ ...catForm, id: e.target.value })}
              placeholder="ex: assurances"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Titre / Libellé</label>
            <input
              type="text"
              required
              value={catForm.label}
              onChange={(e) => setCatForm({ ...catForm, label: e.target.value })}
              placeholder="ex: Assurances & Prévoyance"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Sous-titre descriptif</label>
            <input
              type="text"
              value={catForm.subtitle}
              onChange={(e) => setCatForm({ ...catForm, subtitle: e.target.value })}
              placeholder="ex: Se prémunir des imprévus"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Couleur Principale</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={catForm.color}
                  onChange={(e) => setCatForm({ ...catForm, color: e.target.value })}
                  className="w-9 h-9 rounded-lg cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={catForm.color}
                  onChange={(e) => setCatForm({ ...catForm, color: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ordre d'affichage</label>
              <input
                type="number"
                value={catForm.order_index}
                onChange={(e) => setCatForm({ ...catForm, order_index: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCatModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
            >
              {actionLoading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL UNITÉ */}
      <Modal
        isOpen={unitModalOpen}
        onClose={() => setUnitModalOpen(false)}
        title={editingUnit ? 'Modifier l’Unité' : 'Créer une Unité'}
      >
        <form onSubmit={handleSaveUnit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Numéro d'unité</label>
              <input
                type="number"
                required
                value={unitForm.unit_number}
                onChange={(e) => setUnitForm({ ...unitForm, unit_number: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ordre de tri</label>
              <input
                type="number"
                value={unitForm.order_index}
                onChange={(e) => setUnitForm({ ...unitForm, order_index: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Titre de l'unité</label>
            <input
              type="text"
              required
              value={unitForm.title}
              onChange={(e) => setUnitForm({ ...unitForm, title: e.target.value })}
              placeholder="ex: Unité 1 - Les Fondations"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Sous-titre / Thème</label>
            <input
              type="text"
              value={unitForm.subtitle}
              onChange={(e) => setUnitForm({ ...unitForm, subtitle: e.target.value })}
              placeholder="ex: Prendre soin de soi"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setUnitModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50"
            >
              {actionLoading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DIALOGUES CONFIRMATION */}
      <ConfirmDialog
        isOpen={!!deleteCatTarget}
        onClose={() => setDeleteCatTarget(null)}
        onConfirm={handleDeleteCategory}
        title="Supprimer la catégorie"
        message={`Êtes-vous sûr de vouloir supprimer la catégorie "${deleteCatTarget?.label}" ? Cette action est irréversible.`}
        loading={actionLoading}
      />

      <ConfirmDialog
        isOpen={!!deleteUnitTarget}
        onClose={() => setDeleteUnitTarget(null)}
        onConfirm={handleDeleteUnit}
        title="Supprimer l'unité"
        message={`Êtes-vous sûr de vouloir supprimer l'unité "${deleteUnitTarget?.title}" et toutes ses leçons rattachées ?`}
        loading={actionLoading}
      />
    </div>
  );
};

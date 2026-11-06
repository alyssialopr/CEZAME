import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '../ui/Modal.js';
import {
  parseMultipleLessonFiles,
  ParsedLessonFileResult,
  ParsedLessonItem,
  getSampleLessonsJSON,
  getSampleLessonsCSV,
} from '../../utils/lessonParsers.js';
import { Category, Unit } from '../../types/index.js';
import api from '../../services/api.js';
import {
  UploadCloud,
  FileCode,
  FileSpreadsheet,
  FileCheck2,
  AlertCircle,
  Download,
  Trash2,
  BookOpen,
  HelpCircle,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Badge } from '../ui/Badge.js';

interface ImportLessonsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  units: Unit[];
  initialCategoryId?: string;
  initialUnitId?: string;
  onSuccess: () => void;
}

export const ImportLessonsModal: React.FC<ImportLessonsModalProps> = ({
  isOpen,
  onClose,
  categories,
  units,
  initialCategoryId = '',
  initialUnitId = '',
  onSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [targetCategoryId, setTargetCategoryId] = useState(initialCategoryId);
  const [targetUnitId, setTargetUnitId] = useState(initialUnitId);
  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [parsedResults, setParsedResults] = useState<ParsedLessonFileResult[]>([]);
  const [stagedLessons, setStagedLessons] = useState<ParsedLessonItem[]>([]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (initialCategoryId) setTargetCategoryId(initialCategoryId);
    if (initialUnitId) setTargetUnitId(initialUnitId);
  }, [initialCategoryId, initialUnitId]);

  useEffect(() => {
    if (targetCategoryId) {
      const filtered = units.filter((u) => u.category_id === targetCategoryId);
      setAvailableUnits(filtered);
      if (!filtered.some((u) => u.id === targetUnitId)) {
        setTargetUnitId(filtered[0]?.id || '');
      }
    } else {
      setAvailableUnits([]);
      setTargetUnitId('');
    }
  }, [targetCategoryId, units]);

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) =>
      /\.(json|csv|txt)$/i.test(f.name)
    );

    if (fileArray.length === 0) {
      alert('Veuillez sélectionner des fichiers au format .csv ou .json');
      return;
    }

    setIsProcessing(true);
    setSelectedFiles(fileArray);

    try {
      const { allLessons, results } = await parseMultipleLessonFiles(fileArray);
      setParsedResults(results);
      setStagedLessons(allLessons);
    } catch (err: any) {
      alert('Erreur lors de la lecture des fichiers : ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadTemplate = (type: 'csv' | 'json') => {
    const content = type === 'csv' ? getSampleLessonsCSV() : getSampleLessonsJSON();
    const mime = type === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json';
    const filename = `modele_lecons.${type}`;

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleConfirmImport = async () => {
    if (!targetCategoryId || !targetUnitId) {
      alert('Veuillez sélectionner une catégorie et une unité de destination.');
      return;
    }

    if (stagedLessons.length === 0) {
      alert('Aucune leçon valide trouvée dans les fichiers.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/import-export/lessons/batch', {
        targetCategoryId,
        targetUnitId,
        lessons: stagedLessons,
      });

      alert(`Succès : ${res.data.count} leçon(s) importée(s) avec succès !`);
      onSuccess();
      handleClose();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de l’importation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedFiles([]);
    setParsedResults([]);
    setStagedLessons([]);
    onClose();
  };

  const totalScreens = stagedLessons.reduce((acc, l) => acc + l.screens.length, 0);
  const totalQuestions = stagedLessons.reduce((acc, l) => acc + l.questions.length, 0);
  const totalErrors = parsedResults.reduce((acc, r) => acc + r.errors.length, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Importer des leçons (Fichiers multiples)"
      maxWidth="3xl"
    >
      <div className="space-y-5">
        {/* En-tête explicatif et boutons de modèles */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
          <div>
            <p className="font-bold text-slate-800">
              Importez une ou plusieurs leçons complètes (avec fiches et quiz)
            </p>
            <p className="text-slate-500 mt-0.5">
              Formats acceptés : <strong>.JSON</strong> ou <strong>.CSV</strong>.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDownloadTemplate('csv')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition shadow-sm"
              title="Télécharger un modèle CSV de leçons"
            >
              <Download size={13} className="text-emerald-600" />
              <span>Modèle CSV</span>
            </button>
            <button
              type="button"
              onClick={() => handleDownloadTemplate('json')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition shadow-sm"
              title="Télécharger un modèle JSON de leçons"
            >
              <Download size={13} className="text-blue-600" />
              <span>Modèle JSON</span>
            </button>
          </div>
        </div>

        {/* Sélection de Catégorie et Unité cible */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-blue-50/40 border border-blue-100 rounded-2xl">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catégorie de destination <span className="text-rose-500">*</span>
            </label>
            <select
              data-testid="import-category"
              value={targetCategoryId}
              onChange={(e) => setTargetCategoryId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-semibold"
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
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Unité de destination <span className="text-rose-500">*</span>
            </label>
            <select
              data-testid="import-unit"
              disabled={!targetCategoryId || availableUnits.length === 0}
              value={targetUnitId}
              onChange={(e) => setTargetUnitId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-semibold disabled:opacity-50"
            >
              <option value="">
                {targetCategoryId
                  ? availableUnits.length > 0
                    ? 'Sélectionner une unité'
                    : 'Aucune unité dans cette catégorie'
                  : 'Sélectionnez d’abord une catégorie'}
              </option>
              {availableUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  Unité {u.unit_number} - {u.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Zone de Drag & Drop de fichiers */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files) {
              handleFiles(e.dataTransfer.files);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
            isDragging
              ? 'border-blue-500 bg-blue-50/70'
              : selectedFiles.length > 0
              ? 'border-emerald-400 bg-emerald-50/30'
              : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/70'
          }`}
        >
          <input
            ref={fileInputRef}
            data-testid="import-files"
            type="file"
            multiple
            accept=".json,.csv,.txt"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
            }}
          />

          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition ${
              selectedFiles.length > 0
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-blue-100 text-blue-600'
            }`}
          >
            {selectedFiles.length > 0 ? (
              <FileCheck2 size={28} />
            ) : (
              <UploadCloud size={28} />
            )}
          </div>

          <div>
            <p className="text-sm font-extrabold text-slate-800">
              {selectedFiles.length > 0
                ? `${selectedFiles.length} fichier(s) prêt(s) à être importé(s)`
                : 'Glissez un ou plusieurs fichiers de leçons ici, ou cliquez pour parcourir'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Accepte plusieurs fichiers <strong>.JSON</strong> ou <strong>.CSV</strong> en une seule fois
            </p>
          </div>
        </div>

        {/* Liste des fichiers analysés */}
        {selectedFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Fichiers déposés ({selectedFiles.length})
              </h4>
              <button
                type="button"
                onClick={() => {
                  setSelectedFiles([]);
                  setParsedResults([]);
                  setStagedLessons([]);
                }}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1"
              >
                <Trash2 size={13} />
                <span>Effacer tout</span>
              </button>
            </div>

            <div className="space-y-2 max-h-36 overflow-y-auto">
              {parsedResults.map((res, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate max-w-md">
                    {res.fileName.endsWith('.csv') ? (
                      <FileSpreadsheet size={16} className="text-emerald-600 flex-shrink-0" />
                    ) : (
                      <FileCode size={16} className="text-blue-600 flex-shrink-0" />
                    )}
                    <span className="font-bold text-slate-800 truncate">{res.fileName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={res.lessons.length > 0 ? 'success' : 'danger'}>
                      {res.lessons.length} leçon(s) détectée(s)
                    </Badge>
                    {res.errors.length > 0 && (
                      <Badge variant="warning">{res.errors.length} alerte(s)</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {totalErrors > 0 && (
              <div data-testid="import-errors" className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle size={14} className="text-amber-600" />
                  <span>Certains fichiers contiennent des alertes :</span>
                </div>
                <ul className="list-disc list-inside text-[11px] text-amber-800 pl-1 space-y-0.5 max-h-24 overflow-y-auto">
                  {parsedResults.flatMap((r) =>
                    r.errors.map((err, i) => (
                      <li key={`${r.fileName}-${i}`}>
                        <strong>{r.fileName}:</strong> {err}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Prévisualisation des leçons à importer */}
        {stagedLessons.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Leçons prêtes à être créées ({stagedLessons.length})
                </h4>
                <Badge variant="primary">
                  {totalScreens} fiche(s) • {totalQuestions} quiz
                </Badge>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 rounded-2xl p-3 bg-slate-50/50">
              {stagedLessons.map((lesson, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="font-extrabold text-slate-900 text-sm">{lesson.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600">
                        <Sparkles size={12} />
                        {lesson.xp_reward} XP
                      </span>
                      <Badge variant="gray">{lesson.sourceFile}</Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium pt-1">
                    <span className="inline-flex items-center gap-1 text-slate-600">
                      <BookOpen size={13} className="text-slate-400" />
                      {lesson.screens.length} fiche(s) de cours
                    </span>
                    <span className="inline-flex items-center gap-1 text-slate-600">
                      <HelpCircle size={13} className="text-slate-400" />
                      {lesson.questions.length} question(s) de quiz
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer boutons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            {stagedLessons.length > 0
              ? `${stagedLessons.length} leçon(s) prêtes pour l'unité sélectionnée.`
              : 'Glissez vos fichiers pour commencer l’analyse.'}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
            >
              Annuler
            </button>
            <button
              type="button"
              data-testid="import-submit"
              onClick={handleConfirmImport}
              disabled={
                stagedLessons.length === 0 ||
                !targetCategoryId ||
                !targetUnitId ||
                isSubmitting ||
                isProcessing
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              <Layers size={14} />
              <span>
                {isSubmitting
                  ? 'Importation en cours...'
                  : `Créer ${stagedLessons.length} leçon(s)`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

import React, { useState, useRef } from 'react';
import { Modal } from '../ui/Modal.js';
import {
  parseMultipleQuestionFiles,
  ParsedFileResult,
  getSampleCSVTemplate,
  getSampleJSONTemplate,
} from '../../utils/questionParsers.js';
import { LessonQuestion } from '../../types/index.js';
import api from '../../services/api.js';
import {
  UploadCloud,
  FileSpreadsheet,
  FileCode,
  FileCheck2,
  AlertCircle,
  Download,
  Trash2,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { Badge } from '../ui/Badge.js';

interface ImportQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: string;
  lessonTitle: string;
  onSuccess: (newQuestions: LessonQuestion[]) => void;
}

export const ImportQuestionsModal: React.FC<ImportQuestionsModalProps> = ({
  isOpen,
  onClose,
  lessonId,
  lessonTitle,
  onSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [parsedResults, setParsedResults] = useState<ParsedFileResult[]>([]);
  const [stagedQuestions, setStagedQuestions] = useState<
    Omit<LessonQuestion, 'id' | 'lesson_id' | 'order_index'>[]
  >([]);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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
      const { allQuestions, results } = await parseMultipleQuestionFiles(fileArray);
      setParsedResults(results);
      setStagedQuestions(allQuestions);
    } catch (err: any) {
      alert('Erreur lors de la lecture des fichiers : ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadTemplate = (type: 'csv' | 'json') => {
    const content = type === 'csv' ? getSampleCSVTemplate() : getSampleJSONTemplate();
    const mime = type === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json';
    const filename = `modele_questions.${type}`;

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
    if (stagedQuestions.length === 0) {
      alert('Aucune question valide à importer.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post(`/content/lessons/${lessonId}/questions/batch`, {
        questions: stagedQuestions,
        replace: replaceExisting,
      });

      alert(`Succès : ${res.data.count} question(s) importée(s) avec succès !`);
      onSuccess(res.data.questions);
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
    setStagedQuestions([]);
    setReplaceExisting(false);
    onClose();
  };

  const totalErrors = parsedResults.reduce((acc, r) => acc + r.errors.length, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Importer des questions pour : ${lessonTitle}`}
      maxWidth="3xl"
    >
      <div className="space-y-5">
        {/* En-tête explicatif et boutons de modèles d'exemple */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
          <div>
            <p className="font-bold text-slate-800">
              Glissez-déposez un ou plusieurs fichiers (.CSV ou .JSON)
            </p>
            <p className="text-slate-500 mt-0.5">
              Vous pouvez importer des QCM préparés sur Excel ou Google Sheets.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDownloadTemplate('csv')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition shadow-sm"
              title="Télécharger un modèle CSV avec les bonnes colonnes"
            >
              <Download size={13} className="text-emerald-600" />
              <span>Modèle CSV</span>
            </button>
            <button
              type="button"
              onClick={() => handleDownloadTemplate('json')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition shadow-sm"
              title="Télécharger un modèle JSON"
            >
              <Download size={13} className="text-blue-600" />
              <span>Modèle JSON</span>
            </button>
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
                ? `${selectedFiles.length} fichier(s) sélectionné(s)`
                : 'Glissez un ou plusieurs fichiers ici, ou cliquez pour parcourir'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Formats acceptés : <strong>.CSV</strong> (séparateur virgule ou point-virgule) et <strong>.JSON</strong>
            </p>
          </div>
        </div>

        {/* Liste des fichiers analysés et résultat */}
        {selectedFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Fichiers analysés ({selectedFiles.length})
              </h4>
              <button
                type="button"
                onClick={() => {
                  setSelectedFiles([]);
                  setParsedResults([]);
                  setStagedQuestions([]);
                }}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1"
              >
                <Trash2 size={13} />
                <span>Réinitialiser</span>
              </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto">
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
                    <Badge variant={res.questions.length > 0 ? 'success' : 'danger'}>
                      {res.questions.length} question(s) valide(s)
                    </Badge>
                    {res.errors.length > 0 && (
                      <Badge variant="warning">{res.errors.length} alerte(s)</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Affichage des avertissements éventuels */}
            {totalErrors > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle size={14} className="text-amber-600" />
                  <span>Certaines lignes comportent des alertes :</span>
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

        {/* Prévisualisation des questions prêtes */}
        {stagedQuestions.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Aperçu des questions ({stagedQuestions.length})
                </h4>
                <Badge variant="primary">Prêtes à être enregistrées</Badge>
              </div>

              {/* Choix d'ajout ou de remplacement */}
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    checked={!replaceExisting}
                    onChange={() => setReplaceExisting(false)}
                    className="text-blue-600"
                  />
                  <span>Ajouter à la suite</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    checked={replaceExisting}
                    onChange={() => setReplaceExisting(true)}
                    className="text-rose-600"
                  />
                  <span className="text-rose-700">Remplacer l'existant</span>
                </label>
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-2 border border-slate-200 rounded-2xl p-3 bg-slate-50/50">
              {stagedQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900">
                      #{idx + 1} {q.prompt}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {q.category}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-0.5">
                    {q.options.map((opt: any, oIdx: number) => (
                      <span
                        key={oIdx}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                          opt.correct
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <span className="font-mono text-[10px]">{opt.letter}:</span>
                        <span>{opt.text}</span>
                        {opt.correct && <CheckCircle2 size={11} className="text-emerald-600" />}
                      </span>
                    ))}
                  </div>

                  {q.explanation && (
                    <p className="text-[10px] text-slate-400 italic pt-0.5">
                      💡 {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer boutons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            {stagedQuestions.length > 0
              ? `${stagedQuestions.length} question(s) prêtes à être injectées en base Supabase.`
              : 'Sélectionnez vos fichiers pour commencer.'}
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
              onClick={handleConfirmImport}
              disabled={stagedQuestions.length === 0 || isSubmitting || isProcessing}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              <Layers size={14} />
              <span>
                {isSubmitting
                  ? 'Importation en cours...'
                  : `Importer ${stagedQuestions.length} question(s)`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

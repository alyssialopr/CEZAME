import React, { useState } from 'react';
import { LessonScreen, LessonQuestion, Category } from '../../types/index.js';
import { Lightbulb, CheckCircle2, ChevronRight, BookOpen, HelpCircle, ListOrdered, Link2, FileText, Layers, ShieldAlert, ShieldCheck, MessageSquare, Briefcase } from 'lucide-react';

interface PhonePreviewProps {
  lessonTitle: string;
  category?: Category;
  screens: LessonScreen[];
  questions: LessonQuestion[];
  activeTab: 'screens' | 'questions';
  activeIndex: number;
}

export const PhonePreview: React.FC<PhonePreviewProps> = ({
  lessonTitle,
  category,
  screens,
  questions,
  activeTab,
  activeIndex,
}) => {
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [hasValidatedQuiz, setHasValidatedQuiz] = useState(false);

  const activeScreen = activeTab === 'screens' ? screens[activeIndex] : null;
  const activeQuestion = activeTab === 'questions' ? questions[activeIndex] : null;

  const primaryColor = category?.color || '#8FA6FF';

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        Simulateur Mobile Live
      </div>

      {/* Cadre du smartphone */}
      <div className="relative w-[310px] h-[620px] bg-slate-900 rounded-[44px] p-3 shadow-2xl ring-1 ring-slate-800/10 flex flex-col justify-between">
        {/* Encoche supérieure (Dynamic Island) */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-30 flex items-center justify-end px-2">
          <div className="w-2 h-2 rounded-full bg-slate-800"></div>
        </div>

        {/* Écran du téléphone */}
        <div className="w-full h-full bg-[#FAFAFA] rounded-[34px] overflow-hidden flex flex-col relative pt-7">
          {/* Top Bar Mobile */}
          <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: primaryColor }}
              ></span>
              <span className="text-xs font-bold text-slate-700 truncate max-w-[170px]">
                {lessonTitle || 'Titre de la leçon'}
              </span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
              {activeTab === 'screens'
                ? `Fiche ${activeIndex + 1}/${Math.max(screens.length, 1)}`
                : `Quiz ${activeIndex + 1}/${Math.max(questions.length, 1)}`}
            </span>
          </div>

          {/* Barre de progression style Duolingo/CEZAME */}
          <div className="w-full h-1.5 bg-slate-100">
            <div
              className="h-full transition-all duration-300 rounded-r-full"
              style={{
                backgroundColor: primaryColor,
                width:
                  activeTab === 'screens'
                    ? `${((activeIndex + 1) / Math.max(screens.length, 1)) * 100}%`
                    : `${((activeIndex + 1) / Math.max(questions.length, 1)) * 100}%`,
              }}
            ></div>
          </div>

          {/* Contenu affiché */}
          <div className="flex-1 p-4 overflow-y-auto">
            {activeTab === 'screens' && activeScreen ? (
              <div className="space-y-4 animate-fadeIn">
                <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  <BookOpen size={12} />
                  Fiche explicative
                </div>

                <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                  {activeScreen.title || 'Titre de la fiche'}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {activeScreen.body || 'Saisissez le texte du cours dans l’éditeur pour voir le rendu en direct ici.'}
                </p>

                {activeScreen.tip && (
                  <div className="mt-4 p-3 rounded-xl bg-amber-50/80 border border-amber-200/60 flex items-start gap-2.5 shadow-sm">
                    <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] font-bold text-amber-900 block mb-0.5">
                        Bon réflexe :
                      </span>
                      <p className="text-[11px] text-amber-800 leading-normal">{activeScreen.tip}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : activeTab === 'questions' && activeQuestion ? (
              <div className="space-y-3.5 animate-fadeIn">
                <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {activeQuestion.type === 'order' ? (
                    <>
                      <ListOrdered size={12} className="text-purple-600" />
                      <span>Ordre : {activeQuestion.category || 'Chronologie'}</span>
                    </>
                  ) : activeQuestion.type === 'matching' ? (
                    <>
                      <Link2 size={12} className="text-emerald-600" />
                      <span>Association : {activeQuestion.category || 'Vocabulaire'}</span>
                    </>
                  ) : activeQuestion.type === 'document' ? (
                    <>
                      <FileText size={12} className="text-amber-600" />
                      <span>Décryptage : {activeQuestion.category || 'Document'}</span>
                    </>
                  ) : activeQuestion.type === 'bucket' ? (
                    <>
                      <Layers size={12} className="text-indigo-600" />
                      <span>Tri en bac : {activeQuestion.category || 'Catégories'}</span>
                    </>
                  ) : activeQuestion.type === 'scam' ? (
                    <>
                      <ShieldAlert size={12} className="text-rose-600" />
                      <span>Détecteur : {activeQuestion.category || 'Arnaque'}</span>
                    </>
                  ) : (
                    <>
                      <HelpCircle size={12} className="text-blue-600" />
                      <span>Quiz : {activeQuestion.category || 'QCM'}</span>
                    </>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {activeQuestion.prompt || 'Intitulé de la question'}
                </h4>

                {/* 1. APERÇU QCM */}
                {(!activeQuestion.type || activeQuestion.type === 'qcm') && (
                  <div className="space-y-2 pt-1">
                    {(Array.isArray(activeQuestion.options) ? activeQuestion.options : []).map((opt: any, idx: number) => {
                      const isSelected = selectedQuizOption === idx;
                      const isCorrect = opt.correct;
                      let optionStyle = 'bg-white border-slate-200 text-slate-800 hover:border-slate-300';

                      if (hasValidatedQuiz) {
                        if (isCorrect) {
                          optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold';
                        } else if (isSelected && !isCorrect) {
                          optionStyle = 'bg-rose-50 border-rose-400 text-rose-900';
                        }
                      } else if (isSelected) {
                        optionStyle = 'border-indigo-600 bg-indigo-50/60 text-indigo-900 font-semibold';
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedQuizOption(idx);
                            setHasValidatedQuiz(true);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center justify-between transition shadow-sm ${optionStyle}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 flex-shrink-0">
                              {opt.letter || String.fromCharCode(65 + idx)}
                            </span>
                            <span>{opt.text || `Option ${idx + 1}`}</span>
                          </div>
                          {hasValidatedQuiz && isCorrect && (
                            <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 2. APERÇU REMETTRE DANS L'ORDRE */}
                {activeQuestion.type === 'order' && (
                  <div className="space-y-2 pt-1">
                    <p className="text-[10px] text-purple-700 font-bold">
                      Ordre chronologique configuré :
                    </p>
                    {(Array.isArray(activeQuestion.options) ? activeQuestion.options : []).map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/50 text-xs flex items-center gap-2.5 shadow-sm"
                      >
                        <span className="w-5 h-5 rounded-lg bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-slate-800 font-medium">
                          {item.text || `Étape ${idx + 1}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. APERÇU ASSOCIATION DE PAIRES */}
                {activeQuestion.type === 'matching' && (
                  <div className="space-y-2 pt-1">
                    <p className="text-[10px] text-emerald-700 font-bold">
                      Paires associées configurées :
                    </p>
                    {(Array.isArray(activeQuestion.options) ? activeQuestion.options : []).map((pair: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl border border-emerald-200 bg-emerald-50/40 text-xs flex items-center justify-between gap-1 shadow-sm"
                      >
                        <span className="font-bold text-emerald-950 bg-white px-2 py-1 rounded-lg border border-emerald-100 text-[11px] truncate max-w-[45%]">
                          {pair.left || `Item ${idx + 1}`}
                        </span>
                        <span className="text-emerald-500 font-bold text-xs">⟷</span>
                        <span className="text-slate-700 text-[11px] truncate max-w-[45%]">
                          {pair.right || `Rôle ${idx + 1}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 4. APERÇU DÉCRYPTAGE DE DOCUMENT */}
                {activeQuestion.type === 'document' && (
                  <div className="space-y-2 pt-1">
                    <div className="p-3 rounded-2xl border-2 border-slate-200 bg-white shadow-sm">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-dashed border-slate-200">
                        <div className="flex items-center gap-1.5">
                          <FileText size={14} className="text-blue-600" />
                          <span className="text-[11px] font-bold text-slate-800 truncate max-w-[150px]">
                            {activeQuestion.category || 'Document officiel'}
                          </span>
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          OFFICIEL
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {(Array.isArray(activeQuestion.options) ? activeQuestion.options : []).map((field: any, idx: number) => {
                          const isSelected = selectedQuizOption === idx;
                          const isCorrect = field.correct;
                          let rowStyle = 'bg-slate-50 border-slate-200 hover:border-slate-300';

                          if (hasValidatedQuiz) {
                            if (isCorrect) {
                              rowStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold';
                            } else if (isSelected && !isCorrect) {
                              rowStyle = 'bg-rose-50 border-rose-400 text-rose-950';
                            }
                          } else if (isSelected) {
                            rowStyle = 'border-blue-600 bg-blue-50/60 font-semibold';
                          }

                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setSelectedQuizOption(idx);
                                setHasValidatedQuiz(true);
                              }}
                              className={`w-full text-left p-2 rounded-xl border text-xs flex items-center justify-between gap-2 transition ${rowStyle}`}
                            >
                              <span className="text-[11px] font-bold text-slate-800 truncate">
                                {field.label || `Ligne ${idx + 1}`}
                              </span>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <span className="text-[11px] font-mono font-bold text-slate-700">
                                  {field.value || '—'}
                                </span>
                                {hasValidatedQuiz && isCorrect && (
                                  <CheckCircle2 size={14} className="text-emerald-600" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. APERÇU TRI EN BAC */}
                {activeQuestion.type === 'bucket' && (
                  <div className="space-y-2 pt-1">
                    <div className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/50">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Layers size={13} className="text-indigo-600" />
                        <span className="text-[10px] font-bold text-indigo-900">Bacs configurés :</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(activeQuestion.options?.buckets || []).map((b: any, bIdx: number) => (
                          <span
                            key={b.id || bIdx}
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold border"
                            style={{
                              borderColor: b.color || '#3B82F6',
                              backgroundColor: `${b.color || '#3B82F6'}15`,
                              color: b.color || '#3B82F6',
                            }}
                          >
                            {b.label || `Bac ${bIdx + 1}`}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {(activeQuestion.options?.items || []).map((item: any, itIdx: number) => {
                        const targetBucket = (activeQuestion.options?.buckets || []).find((b: any) => b.id === item.bucketId);
                        return (
                          <div
                            key={item.id || itIdx}
                            className="p-2 rounded-xl border border-slate-200 bg-white text-xs flex items-center justify-between gap-2 shadow-sm"
                          >
                            <span className="text-[11px] font-bold text-slate-800 truncate">
                              {item.text || `Élément ${itIdx + 1}`}
                            </span>
                            {targetBucket && (
                              <span
                                className="px-2 py-0.5 rounded-lg text-[9px] font-extrabold flex-shrink-0"
                                style={{
                                  backgroundColor: targetBucket.color || '#3B82F6',
                                  color: '#FFFFFF',
                                }}
                              >
                                {targetBucket.label}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 6. APERÇU DÉTECTEUR D'ARNAQUE */}
                {activeQuestion.type === 'scam' && (
                  <div className="space-y-2 pt-1">
                    <div className="p-2.5 rounded-2xl bg-slate-900 text-white shadow-sm border border-slate-800">
                      <div className="flex items-center gap-2 pb-1.5 mb-1.5 border-b border-slate-800">
                        <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center">
                          <MessageSquare size={10} className="text-slate-300" />
                        </div>
                        <div className="truncate">
                          <p className="text-[10px] font-bold text-white truncate">
                            {activeQuestion.options?.sender || 'Expéditeur inconnu'}
                          </p>
                          <p className="text-[8px] text-slate-400">
                            {activeQuestion.options?.channel === 'email' ? 'E-mail' : 'SMS'}
                          </p>
                        </div>
                      </div>

                      <div className="p-2 bg-slate-800 rounded-xl text-[10px] leading-relaxed text-slate-200 border border-slate-700">
                        {activeQuestion.options?.message || 'Message simulé'}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className={`p-2 rounded-xl border text-center text-[10px] font-black flex items-center justify-center gap-1 ${
                        activeQuestion.options?.isScam !== false
                          ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                      }`}>
                        <ShieldAlert size={12} />
                        <span>Arnaque</span>
                      </div>
                      <div className={`p-2 rounded-xl border text-center text-[10px] font-black flex items-center justify-center gap-1 ${
                        activeQuestion.options?.isScam === false
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                      }`}>
                        <ShieldCheck size={12} />
                        <span>Authentique</span>
                      </div>
                    </div>

                    {activeQuestion.options?.isScam && (activeQuestion.options?.redFlags || []).length > 0 && (
                      <div className="p-2 bg-rose-50/70 border border-rose-200 rounded-xl">
                        <p className="text-[9px] font-black text-rose-900 mb-1">Indices pièges :</p>
                        <div className="space-y-0.5">
                          {activeQuestion.options.redFlags.map((flag: string, idx: number) => (
                            <p key={idx} className="text-[9px] text-rose-800 leading-tight">
                              🚨 {flag}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 7. APERÇU CAS PRATIQUE / SCÉNARIO */}
                {activeQuestion.type === 'scenario' && (
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                        <Briefcase size={10} />
                        Cas pratique
                      </span>
                      {activeQuestion.options?.persona?.name && (
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          {activeQuestion.options.persona.name} {activeQuestion.options.persona.role ? `• ${activeQuestion.options.persona.role}` : ''}
                        </span>
                      )}
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-[10.5px] leading-relaxed text-slate-700 font-medium">
                        {activeQuestion.options?.context || 'Mise en situation'}
                      </p>

                      {Array.isArray(activeQuestion.options?.keyFacts) && activeQuestion.options.keyFacts.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-slate-100">
                          {activeQuestion.options.keyFacts.map((fact: any, fIdx: number) => (
                            <span key={fIdx} className="text-[9px] bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                              <strong>{fact.label} :</strong> {fact.value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      {(activeQuestion.options?.options || []).map((opt: any, oIdx: number) => {
                        const isSelected = selectedQuizOption === oIdx;
                        const isCorrect = opt.correct;
                        return (
                          <div
                            key={opt.id || oIdx}
                            onClick={() => {
                              setSelectedQuizOption(oIdx);
                              setHasValidatedQuiz(true);
                            }}
                            className={`p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                              hasValidatedQuiz && isCorrect
                                ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                                : hasValidatedQuiz && isSelected && !isCorrect
                                ? 'bg-rose-50 border-rose-400 text-rose-900'
                                : isSelected
                                ? 'bg-sky-50 border-sky-400 text-sky-900'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center flex-shrink-0 ${
                                hasValidatedQuiz && isCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : hasValidatedQuiz && isSelected && !isCorrect
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-slate-200 text-slate-700'
                              }`}>
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span className="text-[10.5px] font-semibold flex-1 leading-snug">
                                {opt.text}
                              </span>
                            </div>

                            {hasValidatedQuiz && (isSelected || isCorrect) && opt.consequence && (
                              <p className={`mt-1.5 text-[9.5px] pl-6 leading-tight font-medium ${
                                isCorrect ? 'text-emerald-700' : 'text-rose-700'
                              }`}>
                                {isCorrect ? '✅ ' : '⚠️ '} {opt.consequence}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {hasValidatedQuiz && activeQuestion.explanation && (
                  <div className="mt-2 p-2.5 rounded-xl bg-slate-100 text-slate-700 text-[11px] leading-relaxed border border-slate-200">
                    <strong className="block text-slate-900 mb-0.5">Explication :</strong>
                    {activeQuestion.explanation}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400">
                <p className="text-xs">Aucun élément sélectionné pour l’aperçu.</p>
              </div>
            )}
          </div>

          {/* Bottom Bar Mobile avec bouton Continuer */}
          <div className="p-3 bg-white border-t border-slate-100">
            <button
              type="button"
              className="w-full py-2.5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition"
              style={{ backgroundColor: primaryColor }}
            >
              <span>Continuer</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Barre d'accueil iPhone en bas */}
          <div className="w-28 h-1 bg-slate-300 rounded-full mx-auto my-1.5"></div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { LessonScreen, LessonQuestion, Category } from '../../types/index.js';
import { Lightbulb, CheckCircle2, ChevronRight, BookOpen, HelpCircle } from 'lucide-react';

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
                  <HelpCircle size={12} />
                  {activeQuestion.category || 'Quiz'}
                </div>

                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {activeQuestion.prompt || 'Intitulé de la question'}
                </h4>

                <div className="space-y-2 pt-1">
                  {(activeQuestion.options || []).map((opt, idx) => {
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

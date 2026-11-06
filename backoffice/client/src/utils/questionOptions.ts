import { QuizOption } from '../types/index.js';

/**
 * Normalise les options d'une question importée.
 * Seuls les QCM sont ramenés au format [{ letter, text, correct }] ; les autres types
 * (order, matching, document, bucket, scam, scenario) ont leur propre structure,
 * conservée telle quelle comme le fait l'import côté serveur.
 */
export function normalizeQuestionOptions(type: string, rawOptions: any, correctHint?: any): any {
  if (type !== 'qcm') {
    return rawOptions ?? [];
  }

  let options: QuizOption[] = [];

  // Format 1 : options = [ "texte", ... ] ou [ { letter, text, correct }, ... ]
  if (Array.isArray(rawOptions)) {
    const hasHint = correctHint?.correct !== undefined || correctHint?.correctIndex !== undefined;
    options = rawOptions.map((opt: any, oIdx: number) => {
      if (typeof opt === 'string') {
        const letter = String.fromCharCode(65 + oIdx);
        const correct = hasHint
          ? correctHint.correct === letter || correctHint.correct === opt || correctHint.correctIndex === oIdx
          : oIdx === 0;
        return { letter, text: opt, correct };
      }
      return {
        letter: opt.letter || String.fromCharCode(65 + oIdx),
        text: opt.text || '',
        correct: Boolean(opt.correct),
      };
    });
  } else if (typeof rawOptions === 'object' && rawOptions !== null) {
    // Format 2 : options = { "A": "...", "B": "..." }
    options = Object.entries(rawOptions).map(([letter, text]: [string, any]) => ({
      letter: letter.toUpperCase(),
      text: String(text),
      correct: correctHint?.correct === letter || correctHint?.correct === text,
    }));
  }

  // Au moins une option correcte
  if (options.length > 0 && !options.some((o) => o.correct)) {
    options[0].correct = true;
  }

  return options;
}

/** Une question a-t-elle assez d'options pour être jouée ? */
export function hasEnoughOptions(type: string, options: any): boolean {
  if (type === 'qcm') return Array.isArray(options) && options.length >= 2;
  if (Array.isArray(options)) return options.length > 0;
  return typeof options === 'object' && options !== null && Object.keys(options).length > 0;
}

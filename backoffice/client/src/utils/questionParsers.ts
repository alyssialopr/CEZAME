import { LessonQuestion, QuizOption } from '../types/index.js';
import { hasEnoughOptions, normalizeQuestionOptions } from './questionOptions.js';

export interface ParsedFileResult {
  fileName: string;
  questions: Omit<LessonQuestion, 'id' | 'lesson_id' | 'order_index'>[];
  errors: string[];
}

/**
 * Parse une ligne CSV en tenant compte des guillemets doubles
 */
function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Détecte si le délimiteur principal est ',' ou ';'
 */
function detectDelimiter(firstLine: string): string {
  const semiCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  return semiCount > commaCount ? ';' : ',';
}

/**
 * Parse le contenu textuel d'un fichier CSV en liste de questions
 */
export function parseCSVQuestions(content: string, fileName: string): ParsedFileResult {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const errors: string[] = [];
  const questions: Omit<LessonQuestion, 'id' | 'lesson_id' | 'order_index'>[] = [];

  if (lines.length < 2) {
    return {
      fileName,
      questions: [],
      errors: ['Le fichier CSV est vide ou ne contient aucun enregistrement.'],
    };
  }

  const delimiter = detectDelimiter(lines[0]);
  const rawHeaders = parseCSVLine(lines[0], delimiter).map((h) =>
    h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9_]/g, '_')
  );

  // Recherche des index de colonnes
  const findIndex = (possibleNames: string[]) =>
    rawHeaders.findIndex((h) => possibleNames.some((p) => h === p || h.includes(p)));

  const idxPrompt = findIndex(['prompt', 'question', 'intitule', 'titre']);
  const idxCategory = findIndex(['category', 'categorie', 'theme', 'sujet']);
  const idxExplanation = findIndex(['explanation', 'explication', 'justification', 'detail']);
  const idxCorrect = findIndex(['correct', 'bonne_reponse', 'reponse', 'solution', 'bonne']);
  const idxOptA = findIndex(['option_a', 'choix_a', 'reponse_a', 'a']);
  const idxOptB = findIndex(['option_b', 'choix_b', 'reponse_b', 'b']);
  const idxOptC = findIndex(['option_c', 'choix_c', 'reponse_c', 'c']);
  const idxOptD = findIndex(['option_d', 'choix_d', 'reponse_d', 'd']);

  if (idxPrompt === -1) {
    return {
      fileName,
      questions: [],
      errors: [
        `Colonne "question" ou "prompt" introuvable dans les en-têtes (trouvé: ${rawHeaders.join(', ')})`,
      ],
    };
  }

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i], delimiter);
    const prompt = row[idxPrompt]?.trim();
    if (!prompt) continue;

    const category = idxCategory !== -1 && row[idxCategory] ? row[idxCategory].trim() : 'Quiz';
    const explanation =
      idxExplanation !== -1 && row[idxExplanation] ? row[idxExplanation].trim() : '';

    const textA = idxOptA !== -1 ? row[idxOptA]?.trim() : '';
    const textB = idxOptB !== -1 ? row[idxOptB]?.trim() : '';
    const textC = idxOptC !== -1 ? row[idxOptC]?.trim() : '';
    const textD = idxOptD !== -1 ? row[idxOptD]?.trim() : '';

    const correctRaw = (idxCorrect !== -1 ? row[idxCorrect] || '' : '').trim().toUpperCase();

    const options: QuizOption[] = [];
    const candidates = [
      { letter: 'A', text: textA },
      { letter: 'B', text: textB },
      { letter: 'C', text: textC },
      ...(textD ? [{ letter: 'D', text: textD }] : []),
    ];

    candidates.forEach((cand) => {
      if (cand.text && cand.text.length > 0) {
        // Est-ce correct si la valeur de la colonne correct est "A", "B", ou le texte exact ?
        const isCorrect =
          correctRaw === cand.letter ||
          correctRaw === cand.text.toUpperCase() ||
          correctRaw.startsWith(cand.letter);
        options.push({
          letter: cand.letter,
          text: cand.text,
          correct: isCorrect,
        });
      }
    });

    // Si aucune option n'a été marquée correcte par défaut mais qu'on a des options, on met la première
    if (options.length > 0 && !options.some((o) => o.correct)) {
      options[0].correct = true;
    }

    if (options.length < 2) {
      errors.push(`Ligne ${i + 1} : Moins de 2 options fournies pour "${prompt.substring(0, 30)}..."`);
      continue;
    }

    questions.push({
      type: 'qcm',
      category,
      prompt,
      options,
      explanation,
    });
  }

  return { fileName, questions, errors };
}

/**
 * Parse le contenu d'un fichier JSON
 */
export function parseJSONQuestions(content: string, fileName: string): ParsedFileResult {
  const errors: string[] = [];
  const questions: Omit<LessonQuestion, 'id' | 'lesson_id' | 'order_index'>[] = [];

  try {
    const data = JSON.parse(content);
    const rawList = Array.isArray(data)
      ? data
      : Array.isArray(data?.questions)
      ? data.questions
      : Array.isArray(data?.lesson?.questions)
      ? data.lesson.questions
      : null;

    if (!rawList) {
      return {
        fileName,
        questions: [],
        errors: [
          'Format JSON invalide : doit être un tableau [ { prompt, options, ... } ] ou { "questions": [...] }',
        ],
      };
    }

    rawList.forEach((item: any, idx: number) => {
      const prompt = item.prompt || item.question || item.intitule;
      if (!prompt) {
        errors.push(`Élément #${idx + 1} : prompt / question manquant.`);
        return;
      }

      const type = item.type || 'qcm';
      const options = normalizeQuestionOptions(type, item.options, item);

      if (!hasEnoughOptions(type, options)) {
        errors.push(
          type === 'qcm'
            ? `Élément #${idx + 1} ("${prompt.substring(0, 30)}...") : au moins 2 options requises.`
            : `Élément #${idx + 1} ("${prompt.substring(0, 30)}...") : options manquantes pour le type ${type}.`
        );
        return;
      }

      questions.push({
        type,
        category: item.category || item.categorie || 'Quiz',
        prompt,
        options,
        explanation: item.explanation || item.explication || '',
      });
    });
  } catch (err: any) {
    return {
      fileName,
      questions: [],
      errors: [`Erreur de syntaxe JSON : ${err.message}`],
    };
  }

  return { fileName, questions, errors };
}

/**
 * Parse un ensemble de fichiers (JSON et CSV)
 */
export async function parseMultipleQuestionFiles(files: File[]): Promise<{
  allQuestions: Omit<LessonQuestion, 'id' | 'lesson_id' | 'order_index'>[];
  results: ParsedFileResult[];
}> {
  const results: ParsedFileResult[] = [];
  const allQuestions: Omit<LessonQuestion, 'id' | 'lesson_id' | 'order_index'>[] = [];

  for (const file of files) {
    const text = await file.text();
    const ext = file.name.split('.').pop()?.toLowerCase();

    let res: ParsedFileResult;
    if (ext === 'json') {
      res = parseJSONQuestions(text, file.name);
    } else if (ext === 'csv' || ext === 'txt') {
      res = parseCSVQuestions(text, file.name);
    } else {
      res = {
        fileName: file.name,
        questions: [],
        errors: [`Extension .${ext} non prise en charge. Utilisez des fichiers .json ou .csv.`],
      };
    }

    results.push(res);
    allQuestions.push(...res.questions);
  }

  return { allQuestions, results };
}

/**
 * Génère un template CSV d'exemple
 */
export function getSampleCSVTemplate(): string {
  return `question;categorie;option_a;option_b;option_c;bonne_reponse;explication
"Tu n'as pas déclaré de médecin traitant. Que se passe-t-il ?";"Médecin traitant";"Tu es moins bien remboursé";"On refuse de te soigner";"Rien, ça ne change rien";"A";"Hors parcours de soins, la Sécu rembourse beaucoup moins."
"Commander sa carte Vitale, combien ça coûte ?";"Carte Vitale";"Rien, elle est gratuite";"Environ 25 €";"C'est payant après 25 ans";"A";"La carte Vitale est 100% gratuite. Les demandes payantes sont des arnaques."
"Urgence vitale : quel numéro composes-tu ?";"Urgences";"Le 15 (SAMU)";"Le 3646 (Ameli)";"Ton médecin traitant";"A";"Le 15 permet de joindre le SAMU 24h/24 en cas d'urgence vitale."
`;
}

/**
 * Génère un template JSON d'exemple
 */
export function getSampleJSONTemplate(): string {
  return JSON.stringify(
    {
      questions: [
        {
          prompt: "Tu n'as pas déclaré de médecin traitant. Que se passe-t-il ?",
          category: 'Médecin traitant',
          explanation: 'Hors parcours de soins, la Sécu rembourse beaucoup moins.',
          options: [
            { letter: 'A', text: 'Tu es moins bien remboursé', correct: true },
            { letter: 'B', text: 'On refuse de te soigner', correct: false },
            { letter: 'C', text: 'Rien, ça ne change rien', correct: false },
          ],
        },
        {
          prompt: 'Commander sa carte Vitale, combien ça coûte ?',
          category: 'Carte Vitale',
          explanation: 'La carte Vitale est 100% gratuite. Les demandes payantes sont des arnaques.',
          options: [
            { letter: 'A', text: 'Rien, elle est gratuite', correct: true },
            { letter: 'B', text: 'Environ 25 €', correct: false },
            { letter: 'C', text: "C'est payant après 25 ans", correct: false },
          ],
        },
      ],
    },
    null,
    2
  );
}

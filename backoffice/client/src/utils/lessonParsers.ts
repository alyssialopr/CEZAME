import { LessonScreen, LessonQuestion } from '../types/index.js';
import { normalizeQuestionOptions } from './questionOptions.js';

export interface ParsedLessonItem {
  title: string;
  xp_reward: number;
  status?: 'draft' | 'published';
  screens: Omit<LessonScreen, 'id' | 'lesson_id'>[];
  questions: Omit<LessonQuestion, 'id' | 'lesson_id'>[];
  sourceFile: string;
}

export interface ParsedLessonFileResult {
  fileName: string;
  lessons: ParsedLessonItem[];
  errors: string[];
}

/**
 * Découpe une ligne CSV avec délimiteur et guillemets
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

function detectDelimiter(firstLine: string): string {
  const semiCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  return semiCount > commaCount ? ';' : ',';
}

/**
 * Parse un fichier CSV contenant des leçons et leurs fiches
 * Supporte : chaque ligne = une fiche liée à une leçon (regroupée par titre_lecon)
 */
export function parseCSVLessons(content: string, fileName: string): ParsedLessonFileResult {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const errors: string[] = [];
  const lessonMap = new Map<string, ParsedLessonItem>();

  if (lines.length < 2) {
    return {
      fileName,
      lessons: [],
      errors: ['Fichier CSV vide ou insuffisant.'],
    };
  }

  const delimiter = detectDelimiter(lines[0]);
  const rawHeaders = parseCSVLine(lines[0], delimiter).map((h) =>
    h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9_]/g, '_')
  );

  const findIndex = (possibleNames: string[]) =>
    rawHeaders.findIndex((h) => possibleNames.some((p) => h === p || h.includes(p)));

  const idxLessonTitle = findIndex(['lecon_titre', 'titre_lecon', 'lecon', 'lesson_title', 'lesson']);
  const idxXp = findIndex(['xp', 'xp_reward', 'recompense']);
  const idxScreenTitle = findIndex(['titre_fiche', 'fiche_titre', 'screen_title', 'fiche']);
  const idxScreenBody = findIndex(['texte_fiche', 'corps_fiche', 'screen_body', 'texte', 'contenu']);
  const idxScreenTip = findIndex(['astuce', 'conseil', 'tip', 'bon_reflexe']);

  if (idxLessonTitle === -1) {
    return {
      fileName,
      lessons: [],
      errors: [
        `Colonne "titre_lecon" ou "lecon" introuvable dans les en-têtes (trouvé: ${rawHeaders.join(', ')})`,
      ],
    };
  }

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i], delimiter);
    const lessonTitle = row[idxLessonTitle]?.trim();
    if (!lessonTitle) continue;

    const xp = idxXp !== -1 && row[idxXp] ? parseInt(row[idxXp], 10) || 50 : 50;
    const screenTitle = idxScreenTitle !== -1 ? row[idxScreenTitle]?.trim() : '';
    const screenBody = idxScreenBody !== -1 ? row[idxScreenBody]?.trim() : '';
    const screenTip = idxScreenTip !== -1 ? row[idxScreenTip]?.trim() : '';

    if (!lessonMap.has(lessonTitle)) {
      lessonMap.set(lessonTitle, {
        title: lessonTitle,
        xp_reward: xp,
        status: 'draft',
        screens: [],
        questions: [],
        sourceFile: fileName,
      });
    }

    const currentLesson = lessonMap.get(lessonTitle)!;

    if (screenTitle || screenBody) {
      currentLesson.screens.push({
        title: screenTitle || `Fiche ${currentLesson.screens.length + 1}`,
        body: screenBody || '',
        tip: screenTip || null,
        order_index: currentLesson.screens.length + 1,
      });
    }
  }

  const lessons = Array.from(lessonMap.values());
  return { fileName, lessons, errors };
}

/**
 * Parse un fichier JSON contenant une ou plusieurs leçons
 */
export function parseJSONLessons(content: string, fileName: string): ParsedLessonFileResult {
  const errors: string[] = [];
  const lessons: ParsedLessonItem[] = [];

  try {
    const data = JSON.parse(content);

    // Détecter s'il s'agit d'une liste de leçons ou d'une leçon unique
    let rawList: any[] = [];
    if (Array.isArray(data)) {
      rawList = data;
    } else if (Array.isArray(data?.lessons)) {
      rawList = data.lessons;
    } else if (data?.lesson) {
      rawList = [data.lesson];
    } else if (data?.title) {
      rawList = [data];
    } else {
      return {
        fileName,
        lessons: [],
        errors: [
          'Structure JSON non reconnue. Attendu : { "lesson": {...} } ou { "lessons": [...] } ou tableau direct [ ... ]',
        ],
      };
    }

    rawList.forEach((item: any, idx: number) => {
      const title = item.title || item.titre || item.name;
      if (!title) {
        errors.push(`Élément #${idx + 1} : Titre de leçon manquant.`);
        return;
      }

      // Screens
      const screens: Omit<LessonScreen, 'id' | 'lesson_id'>[] = [];
      const rawScreens = item.screens || item.fiches || [];
      if (Array.isArray(rawScreens)) {
        rawScreens.forEach((s: any, sIdx: number) => {
          screens.push({
            title: s.title || s.titre || `Fiche ${sIdx + 1}`,
            body: s.body || s.texte || s.content || '',
            tip: s.tip || s.astuce || s.conseil || null,
            order_index: s.order_index || sIdx + 1,
          });
        });
      }

      // Questions
      const questions: Omit<LessonQuestion, 'id' | 'lesson_id'>[] = [];
      const rawQuestions = item.questions || item.quiz || [];
      if (Array.isArray(rawQuestions)) {
        rawQuestions.forEach((q: any, qIdx: number) => {
          const prompt = q.prompt || q.question || q.intitule;
          if (!prompt) return;

          const type = q.type || 'qcm';
          const options = normalizeQuestionOptions(type, q.options, q);

          questions.push({
            type,
            category: q.category || q.categorie || 'Quiz',
            prompt,
            options,
            explanation: q.explanation || q.explication || '',
            order_index: q.order_index || qIdx + 1,
          });
        });
      }

      lessons.push({
        title,
        xp_reward: Number(item.xp_reward || item.xp) || 50,
        status: item.status === 'published' ? 'published' : 'draft',
        screens,
        questions,
        sourceFile: fileName,
      });
    });
  } catch (err: any) {
    return {
      fileName,
      lessons: [],
      errors: [`Erreur de syntaxe JSON : ${err.message}`],
    };
  }

  return { fileName, lessons, errors };
}

/**
 * Parse un ensemble de fichiers de leçons (JSON et CSV)
 */
export async function parseMultipleLessonFiles(files: File[]): Promise<{
  allLessons: ParsedLessonItem[];
  results: ParsedLessonFileResult[];
}> {
  const results: ParsedLessonFileResult[] = [];
  const allLessons: ParsedLessonItem[] = [];

  for (const file of files) {
    const text = await file.text();
    const ext = file.name.split('.').pop()?.toLowerCase();

    let res: ParsedLessonFileResult;
    if (ext === 'json') {
      res = parseJSONLessons(text, file.name);
    } else if (ext === 'csv' || ext === 'txt') {
      res = parseCSVLessons(text, file.name);
    } else {
      res = {
        fileName: file.name,
        lessons: [],
        errors: [`Extension .${ext} non supportée. Utilisez .json ou .csv.`],
      };
    }

    results.push(res);
    allLessons.push(...res.lessons);
  }

  return { allLessons, results };
}

/**
 * Génère un template JSON d'exemple avec 2 leçons complètes
 */
export function getSampleLessonsJSON(): string {
  return JSON.stringify(
    {
      lessons: [
        {
          title: 'Se soigner sans galérer',
          xp_reward: 50,
          status: 'draft',
          screens: [
            {
              title: 'La Sécu et ta carte Vitale',
              body: 'En France, l’Assurance maladie rembourse une partie de tes frais de santé. Ta carte Vitale contient tes droits : présente-la à chaque rendez-vous.',
              tip: 'Un SMS demandant de payer ta carte Vitale est toujours une arnaque.',
            },
            {
              title: 'Le médecin traitant',
              body: 'Déclarer un médecin traitant permet d’être remboursé au taux maximal par la Sécurité Sociale.',
              tip: null,
            },
          ],
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
          ],
        },
        {
          title: 'Ouvrir son premier compte bancaire',
          xp_reward: 50,
          status: 'draft',
          screens: [
            {
              title: 'Les pièces justificatives',
              body: 'Pour ouvrir un compte, tu as besoin d’une pièce d’identité valide et d’un justificatif de domicile de moins de 3 mois.',
              tip: 'Certaines banques en ligne acceptent une simple attestation d’hébergement.',
            },
          ],
          questions: [
            {
              prompt: "Quelle est la validité requise d'un justificatif de domicile ?",
              category: 'Banque',
              explanation: 'Il doit dater de moins de 3 mois pour être accepté.',
              options: [
                { letter: 'A', text: 'Moins de 3 mois', correct: true },
                { letter: 'B', text: 'Moins de 1 an', correct: false },
                { letter: 'C', text: 'Aucune limite', correct: false },
              ],
            },
          ],
        },
      ],
    },
    null,
    2
  );
}

/**
 * Génère un template CSV d'exemple
 */
export function getSampleLessonsCSV(): string {
  return `titre_lecon;xp;titre_fiche;texte_fiche;astuce_fiche
"Se soigner sans galérer";50;"La Sécu et ta carte Vitale";"L'Assurance maladie rembourse une partie des frais de santé. Présente ta carte Vitale.";"La carte Vitale est 100% gratuite."
"Se soigner sans galérer";50;"Le médecin traitant";"Tu dois déclarer un médecin traitant pour être remboursé au taux normal.";"Déclaration en 2 minutes sur ameli.fr."
"Ouvrir son compte";50;"Les pièces justificatives";"Pièce d'identité et justificatif de domicile de moins de 3 mois.";"Attestation d'hébergement possible."
`;
}

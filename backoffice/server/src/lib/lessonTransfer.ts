// Conversion des leçons entre la base et le format JSON d'import / export.

export interface ExportedScreen {
  title: string;
  body: string;
  tip: string | null;
  order_index: number;
}

export interface ExportedQuestion {
  type: string;
  category: string;
  prompt: string;
  options: unknown;
  explanation: string;
  order_index: number;
}

export function buildLessonExport(
  lesson: { title: string; category_id: string; xp_reward: number },
  screens: ExportedScreen[] | null,
  questions: ExportedQuestion[] | null,
  now: Date = new Date()
) {
  return {
    version: '1.0',
    exportedAt: now.toISOString(),
    lesson: {
      title: lesson.title,
      category_id: lesson.category_id,
      xp_reward: lesson.xp_reward,
      screens: screens || [],
      questions: questions || [],
    },
  };
}

export function exportFilename(title: string): string {
  return `lesson-${title.replace(/\s+/g, '_')}.json`;
}

// Accepte le format exporté par le serveur ({ lesson: {...} }) ou un objet de leçon à plat.
export function unwrapLessonPayload(payload: any) {
  return payload?.lesson || payload;
}

export function readLessonFields(lessonData: any) {
  const { title, xp_reward = 50, screens = [], questions = [] } = lessonData;
  return {
    title: title || 'Nouvelle Leçon Importée',
    xpReward: Number(xp_reward) || 50,
    screens,
    questions,
  };
}

export function mapImportedScreens(screens: any[], lessonId: string) {
  return screens.map((s: any, idx: number) => ({
    lesson_id: lessonId,
    order_index: s.order_index || idx + 1,
    title: s.title || `Fiche ${idx + 1}`,
    body: s.body || '',
    tip: s.tip || null,
  }));
}

export function mapImportedQuestions(questions: any[], lessonId: string) {
  return questions.map((q: any, idx: number) => ({
    lesson_id: lessonId,
    order_index: q.order_index || idx + 1,
    type: q.type || 'qcm',
    category: q.category || 'Quiz',
    prompt: q.prompt || 'Question',
    options: q.options || [],
    explanation: q.explanation || '',
  }));
}

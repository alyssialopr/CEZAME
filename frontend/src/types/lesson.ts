export type LessonProgressStatus = 'locked' | 'unlocked' | 'completed';

export type DBLesson = {
  id: string;
  unit_id: string | null;
  category_id: string;
  order_index: number;
  title: string;
  xp_reward: number;
  status?: LessonProgressStatus;
  score?: number;
};

export type DBUnit = {
  id: string;
  category_id: string;
  unit_number: number;
  title: string;
  subtitle: string | null;
  mascot_name?: string | null;
  order_index: number;
  lessons: DBLesson[];
};

export type DBLessonScreen = {
  id?: string;
  lesson_id?: string;
  order_index: number;
  title: string;
  body: string;
  tip?: string | null;
};

export type DBLessonOption = {
  letter: 'A' | 'B' | 'C';
  text: string;
  correct?: boolean;
};

export type DBLessonQuestion = {
  id?: string;
  lesson_id?: string;
  order_index: number;
  category: string;
  prompt: string;
  options: DBLessonOption[];
  explanation: string;
};

export type DBLessonDetails = DBLesson & {
  screens: DBLessonScreen[];
  questions: DBLessonQuestion[];
};

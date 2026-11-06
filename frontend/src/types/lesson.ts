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

export type QuestionType = 'qcm' | 'order' | 'matching' | 'document' | 'bucket' | 'scam' | 'scenario';

export interface DocumentField {
  id: string;
  label: string;
  value: string;
  correct?: boolean;
  hint?: string;
}

export interface BucketDefinition {
  id: string;
  label: string;
  color?: string;
}

export interface BucketItem {
  id: string;
  text: string;
  bucketId: string;
}

export interface BucketData {
  buckets: BucketDefinition[];
  items: BucketItem[];
}

export interface ScamData {
  sender: string;
  channel?: 'sms' | 'email' | 'notification';
  message: string;
  isScam: boolean;
  redFlags?: string[];
}

export interface ScenarioOption {
  id: string;
  text: string;
  correct: boolean;
  consequence?: string;
}

export interface ScenarioData {
  context: string;
  persona?: {
    name?: string;
    role?: string;
  };
  keyFacts?: { label: string; value: string }[];
  options: ScenarioOption[];
}

export type DBLessonOption = {
  letter?: 'A' | 'B' | 'C' | 'D';
  text?: string;
  correct?: boolean;
  id?: string;
  left?: string;
  right?: string;
  label?: string;
  value?: string;
  hint?: string;
};

export type DBLessonQuestion = {
  id?: string;
  lesson_id?: string;
  order_index: number;
  type?: QuestionType;
  category: string;
  prompt: string;
  options: any;
  explanation: string;
};

export type DBLessonDetails = DBLesson & {
  screens: DBLessonScreen[];
  questions: DBLessonQuestion[];
};

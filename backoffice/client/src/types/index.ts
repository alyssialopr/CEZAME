export type UserRole = 'admin' | 'superadmin' | 'user';

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'superadmin';
  username?: string;
}

export interface Category {
  id: string;
  label: string;
  subtitle?: string;
  color: string;
  border_color?: string;
  icon_name: string;
  mascot_name?: string;
  order_index: number;
  created_at?: string;
}

export interface Unit {
  id: string;
  category_id: string;
  unit_number: number;
  title: string;
  subtitle?: string;
  mascot_name?: string | null;
  order_index: number;
  created_at?: string;
  lessons?: { id: string; title: string; order_index: number; status: string }[];
}

export interface LessonScreen {
  id: string;
  lesson_id: string;
  order_index: number;
  title: string;
  body: string;
  tip?: string | null;
  created_at?: string;
}

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

export interface QuizOption {
  letter?: string;
  text?: string;
  correct?: boolean;
  id?: string;
  left?: string;
  right?: string;
  label?: string;
  value?: string;
  hint?: string;
}

export interface LessonQuestion {
  id: string;
  lesson_id: string;
  order_index: number;
  type?: QuestionType;
  category: string;
  prompt: string;
  options: any;
  explanation: string;
  created_at?: string;
}

export interface Lesson {
  id: string;
  unit_id: string;
  category_id: string;
  title: string;
  order_index: number;
  xp_reward: number;
  status: 'draft' | 'published';
  created_at?: string;
  units?: { id: string; title: string; unit_number: number; category_id?: string };
  screens?: LessonScreen[];
  questions?: LessonQuestion[];
  lesson_screens?: { count: number }[];
  lesson_questions?: { count: number }[];
}

export interface MobileUser {
  id: string;
  email: string;
  username?: string;
  created_at: string;
  last_sign_in_at?: string;
  role: string;
  completedLessonsCount: number;
  isFallback?: boolean;
  isTester?: boolean;
}

export interface AuditLog {
  id: string;
  admin_id?: string;
  admin_email?: string;
  action: string;
  target_type: string;
  target_id?: string;
  details?: Record<string, any>;
  created_at: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalCategories: number;
  totalUnits: number;
  totalLessons: number;
  totalQuestions: number;
  totalScreens: number;
  totalCompletedLessons: number;
  categoryStats: {
    id: string;
    label: string;
    color: string;
    lessonCount: number;
  }[];
  recentLogs: AuditLog[];
}

export interface UserActivityEvent {
  id: string;
  user_id: string | null;
  session_id: string;
  event_type: string;
  event_name: string;
  screen_name?: string | null;
  properties?: Record<string, any>;
  created_at: string;
  user_email?: string;
  user_username?: string;
}

export interface ActivityStats {
  totalEvents: number;
  eventsToday: number;
  activeUsersToday: number;
  totalUsers: number;
  topScreens: { screen: string; count: number }[];
  topEvents: { event: string; count: number }[];
  eventsByType: { type: string; count: number }[];
  categoryStats: {
    id: string;
    label: string;
    color: string;
    count: number;
    percentage: number;
  }[];
  firstPickStats: {
    id: string;
    label: string;
    color: string;
    count: number;
  }[];
  funnel: {
    opened: number;
    quizStarted: number;
    completed: number;
    abandonedTheory: number;
    abandonedQuiz: number;
    transitionToQuizRate: number;
    completionRate: number;
    openedPercent: number;
    quizStartedPercent: number;
    completedPercent: number;
  };
  exerciseTypeSuccess: {
    type: string;
    total: number;
    correct: number;
    rate: number;
  }[];
  mostFailedQuestions: {
    prompt: string;
    categoryId: string;
    failedCount: number;
    failureRate: number;
  }[];
  engagement: {
    avgLessonsPerUser: number;
    avgLessonMinutes: number;
    onboardingStarted: number;
    onboardingCompleted: number;
    onboardingRate: number;
  };
}


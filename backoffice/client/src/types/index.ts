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

export interface QuizOption {
  letter: string;
  text: string;
  correct: boolean;
}

export interface LessonQuestion {
  id: string;
  lesson_id: string;
  order_index: number;
  category: string;
  prompt: string;
  options: QuizOption[];
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

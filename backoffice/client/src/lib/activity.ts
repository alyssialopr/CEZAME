import { Activity, BookOpen, CheckCircle2, Eye, MousePointerClick } from 'lucide-react';

export function getEventBadgeInfo(type: string, name: string) {
  switch (type) {
    case 'screen_view':
      return { label: 'Écran', icon: Eye, color: 'bg-sky-50 text-sky-700 border-sky-200' };
    case 'click':
      return { label: 'Clic', icon: MousePointerClick, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'lesson':
      return { label: 'Leçon', icon: BookOpen, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    case 'quiz':
      return { label: 'Quiz', icon: CheckCircle2, color: 'bg-amber-50 text-amber-700 border-amber-200' };
    default:
      return { label: name || type, icon: Activity, color: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
}

export function formatRelativeTime(isoString: string, now: number = Date.now()) {
  const diffMs = now - new Date(isoString).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `il y a ${Math.max(1, diffSec)}s`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `il y a ${diffMin}m`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `il y a ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `il y a ${diffDays}j`;
}

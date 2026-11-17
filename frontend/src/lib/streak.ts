import { Database } from './database.types';

export type LevelRank = Database['public']['Enums']['level_rank'];

export const RANK_THRESHOLDS: { rank: LevelRank; minXp: number; nextXp: number | null }[] = [
  { rank: 'bronze', minXp: 0, nextXp: 200 },
  { rank: 'silver', minXp: 200, nextXp: 500 },
  { rank: 'gold', minXp: 500, nextXp: 1000 },
  { rank: 'diamond', minXp: 1000, nextXp: 2000 },
  { rank: 'rainbow', minXp: 2000, nextXp: null },
];

export function computeRankFromXp(xp: number): LevelRank {
  const safeXp = Math.max(0, xp || 0);
  for (let i = RANK_THRESHOLDS.length - 1; i >= 0; i--) {
    if (safeXp >= RANK_THRESHOLDS[i].minXp) {
      return RANK_THRESHOLDS[i].rank;
    }
  }
  return 'bronze';
}

export function computeLeagueProgress(xp: number): {
  rank: LevelRank;
  progressPercent: number;
  nextThreshold: number | null;
} {
  const safeXp = Math.max(0, xp || 0);
  const rank = computeRankFromXp(safeXp);
  const tier = RANK_THRESHOLDS.find((t) => t.rank === rank) || RANK_THRESHOLDS[0];

  if (tier.nextXp === null) {
    return { rank, progressPercent: 100, nextThreshold: null };
  }

  const span = tier.nextXp - tier.minXp;
  const currentInTier = safeXp - tier.minXp;
  const progressPercent = Math.min(100, Math.max(5, Math.round((currentInTier / span) * 100)));

  return {
    rank,
    progressPercent,
    nextThreshold: tier.nextXp,
  };
}

// Série de jours consécutifs : démarre à 1, +1 si la dernière leçon date d'hier,
// repart à 1 après un jour manqué, inchangée si une leçon a déjà été faite aujourd'hui.
export function nextStreak(currentStreak: number, lastUpdatedAt: string | Date, now: Date = new Date()): number {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastUpdate = new Date(lastUpdatedAt);
  lastUpdate.setHours(0, 0, 0, 0);

  if (currentStreak === 0) return 1;
  if (lastUpdate.getTime() === yesterday.getTime()) return currentStreak + 1;
  if (lastUpdate.getTime() < yesterday.getTime()) return 1;
  return currentStreak;
}

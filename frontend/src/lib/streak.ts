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

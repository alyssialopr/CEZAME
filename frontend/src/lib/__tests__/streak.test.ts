import { computeLeagueProgress, computeRankFromXp, nextStreak } from '@/lib/streak';

const NOW = new Date(2026, 10, 6, 15, 0, 0);
const daysAgo = (n: number) => new Date(2026, 10, 6 - n, 20, 30, 0);

describe('nextStreak', () => {
  it('démarre à 1', () => {
    expect(nextStreak(0, daysAgo(10), NOW)).toBe(1);
  });

  it("augmente si la dernière leçon date d'hier", () => {
    expect(nextStreak(4, daysAgo(1), NOW)).toBe(5);
  });

  it('reste identique le même jour', () => {
    expect(nextStreak(4, daysAgo(0), NOW)).toBe(4);
  });

  it('repart à 1 après un jour manqué', () => {
    expect(nextStreak(9, daysAgo(2), NOW)).toBe(1);
  });

  it('accepte une date ISO', () => {
    expect(nextStreak(2, daysAgo(1).toISOString(), NOW)).toBe(3);
  });
});

describe('computeRankFromXp & computeLeagueProgress', () => {
  it('calcule le rang selon les paliers XP', () => {
    expect(computeRankFromXp(0)).toBe('bronze');
    expect(computeRankFromXp(170)).toBe('bronze');
    expect(computeRankFromXp(200)).toBe('silver');
    expect(computeRankFromXp(500)).toBe('gold');
    expect(computeRankFromXp(1000)).toBe('diamond');
    expect(computeRankFromXp(2500)).toBe('rainbow');
  });

  it('calcule le pourcentage de progression dans la ligue courante', () => {
    expect(computeLeagueProgress(100)).toEqual({
      rank: 'bronze',
      progressPercent: 50,
      nextThreshold: 200,
    });
    expect(computeLeagueProgress(2200)).toEqual({
      rank: 'rainbow',
      progressPercent: 100,
      nextThreshold: null,
    });
  });
});

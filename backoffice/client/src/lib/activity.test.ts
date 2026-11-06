import { describe, it, expect } from 'vitest';
import { Activity, Eye } from 'lucide-react';
import { formatRelativeTime, getEventBadgeInfo } from './activity';

describe('formatRelativeTime', () => {
  const now = new Date('2026-11-06T12:00:00Z').getTime();
  const ago = (ms: number) => new Date(now - ms).toISOString();

  it('affiche au moins 1 seconde', () => {
    expect(formatRelativeTime(ago(0), now)).toBe('il y a 1s');
    expect(formatRelativeTime(ago(45_000), now)).toBe('il y a 45s');
  });

  it('passe aux minutes, heures puis jours', () => {
    expect(formatRelativeTime(ago(5 * 60_000), now)).toBe('il y a 5m');
    expect(formatRelativeTime(ago(3 * 3_600_000), now)).toBe('il y a 3h');
    expect(formatRelativeTime(ago(2 * 86_400_000), now)).toBe('il y a 2j');
  });
});

describe('getEventBadgeInfo', () => {
  it('donne un libellé par type connu', () => {
    expect(getEventBadgeInfo('screen_view', 'x')).toMatchObject({ label: 'Écran', icon: Eye });
    expect(getEventBadgeInfo('click', 'x').label).toBe('Clic');
    expect(getEventBadgeInfo('lesson', 'x').label).toBe('Leçon');
    expect(getEventBadgeInfo('quiz', 'x').label).toBe('Quiz');
  });

  it("retombe sur le nom puis le type de l'événement", () => {
    expect(getEventBadgeInfo('auth', 'login')).toMatchObject({ label: 'login', icon: Activity });
    expect(getEventBadgeInfo('system', '').label).toBe('system');
  });
});

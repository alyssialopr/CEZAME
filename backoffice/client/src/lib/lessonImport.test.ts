import { describe, it, expect } from 'vitest';
import { buildImportRequest } from './lessonImport';

describe('buildImportRequest', () => {
  it('construit le corps attendu par le serveur', () => {
    const json = JSON.stringify({ lesson: { title: 'Impôts', questions: [{ type: 'scam', options: { isScam: true } }] } });
    expect(buildImportRequest('finance', 'U1', json)).toEqual({
      targetCategoryId: 'finance',
      targetUnitId: 'U1',
      payload: { lesson: { title: 'Impôts', questions: [{ type: 'scam', options: { isScam: true } }] } },
    });
  });

  it('refuse un champ manquant', () => {
    expect(() => buildImportRequest('', 'U1', '{}')).toThrow('Veuillez remplir');
    expect(() => buildImportRequest('finance', 'U1', '')).toThrow('Veuillez remplir');
  });

  it('refuse un JSON invalide', () => {
    expect(() => buildImportRequest('finance', 'U1', '{pas du json')).toThrow(SyntaxError);
  });
});

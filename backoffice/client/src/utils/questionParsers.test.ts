import { describe, it, expect } from 'vitest';
import { parseJSONQuestions } from './questionParsers';

describe('parseJSONQuestions', () => {
  it('ramène les QCM au format { letter, text, correct }, y compris { "A": … }', () => {
    const r = parseJSONQuestions(
      JSON.stringify([
        { prompt: 'Q1', options: ['Oui', 'Non'], correctIndex: 1 },
        { prompt: 'Q2', options: { A: 'Vrai', B: 'Faux' }, correct: 'A' },
      ]),
      'q.json'
    );
    expect(r.errors).toEqual([]);
    expect(r.questions[0].options).toEqual([
      { letter: 'A', text: 'Oui', correct: false },
      { letter: 'B', text: 'Non', correct: true },
    ]);
    expect(r.questions[1].options).toEqual([
      { letter: 'A', text: 'Vrai', correct: true },
      { letter: 'B', text: 'Faux', correct: false },
    ]);
  });

  it('conserve les options des autres types sans les transformer', () => {
    const bucket = { buckets: [{ id: 'b1', label: 'Besoins' }], items: [{ id: 'i1', text: 'Loyer', bucketId: 'b1' }] };
    const order = [{ id: '1', text: 'A' }, { id: '2', text: 'B' }];
    const r = parseJSONQuestions(
      JSON.stringify({ questions: [{ type: 'bucket', prompt: 'Range', options: bucket }, { type: 'order', prompt: 'Ordre', options: order }] }),
      'q.json'
    );
    expect(r.errors).toEqual([]);
    expect(r.questions.map((q) => [q.type, q.options])).toEqual([
      ['bucket', bucket],
      ['order', order],
    ]);
  });

  it('refuse un QCM à une option et un exercice sans options', () => {
    const r = parseJSONQuestions(
      JSON.stringify([{ prompt: 'Q', options: ['Seule'] }, { type: 'scam', prompt: 'SMS ?' }]),
      'q.json'
    );
    expect(r.questions).toEqual([]);
    expect(r.errors).toEqual([
      expect.stringContaining('au moins 2 options'),
      expect.stringContaining('options manquantes pour le type scam'),
    ]);
  });
});

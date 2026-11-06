import { describe, it, expect } from 'vitest';
import {
  getSampleLessonsCSV,
  getSampleLessonsJSON,
  parseCSVLessons,
  parseJSONLessons,
  parseMultipleLessonFiles,
} from './lessonParsers';

describe('parseJSONLessons', () => {
  it('accepte une leçon seule, une liste, ou un export { lesson }', () => {
    const one = { title: 'Budget', screens: [], questions: [] };
    expect(parseJSONLessons(JSON.stringify(one), 'a.json').lessons).toHaveLength(1);
    expect(parseJSONLessons(JSON.stringify([one, one]), 'b.json').lessons).toHaveLength(2);
    expect(parseJSONLessons(JSON.stringify({ lessons: [one] }), 'c.json').lessons).toHaveLength(1);
    expect(parseJSONLessons(JSON.stringify({ version: '1.0', lesson: one }), 'd.json').lessons).toHaveLength(1);
  });

  it('lit les alias français et applique les valeurs par défaut', () => {
    const r = parseJSONLessons(
      JSON.stringify([{
        titre: 'Mutuelle',
        xp: '70',
        fiches: [{ titre: 'Rôle', texte: 'Complète la Sécu', astuce: 'Compare' }],
        quiz: [{ question: 'Obligatoire ?', options: ['Non', 'Oui'], explication: 'Non' }, { options: ['x'] }],
      }]),
      'm.json'
    );
    expect(r.errors).toEqual([]);
    const [l] = r.lessons;
    expect(l).toMatchObject({ title: 'Mutuelle', xp_reward: 70, status: 'draft', sourceFile: 'm.json' });
    expect(l.screens).toEqual([{ title: 'Rôle', body: 'Complète la Sécu', tip: 'Compare', order_index: 1 }]);
    // La question sans intitulé est ignorée ; la première option devient la bonne réponse.
    expect(l.questions).toHaveLength(1);
    expect(l.questions[0]).toMatchObject({ type: 'qcm', category: 'Quiz', prompt: 'Obligatoire ?', explanation: 'Non' });
    expect(l.questions[0].options).toEqual([
      { letter: 'A', text: 'Non', correct: true },
      { letter: 'B', text: 'Oui', correct: false },
    ]);
  });

  it('signale une leçon sans titre, une structure inconnue ou un JSON invalide', () => {
    expect(parseJSONLessons(JSON.stringify([{ screens: [] }]), 'x.json').errors[0]).toContain('Titre de leçon manquant');
    expect(parseJSONLessons(JSON.stringify({ foo: 1 }), 'x.json').errors[0]).toContain('Structure JSON non reconnue');
    expect(parseJSONLessons('{ pas du json', 'x.json').errors[0]).toContain('Erreur de syntaxe JSON');
  });

  it('conserve le type des questions', () => {
    const r = parseJSONLessons(JSON.stringify({ title: 'T', questions: [{ type: 'scam', prompt: 'SMS ?' }] }), 'x.json');
    expect(r.lessons[0].questions[0].type).toBe('scam');
  });

  // Défaut connu : les options objet (arnaque, tri, scénario, document) sont remplacées par [].
  // L'import unitaire (/import-export/lessons) les conserve depuis 5ef9eea, pas l'import groupé.
  it.fails("conserve les options objet des exercices autres que QCM", () => {
    const options = { sender: 'Ameli', message: 'Remboursement', isScam: true };
    const r = parseJSONLessons(JSON.stringify({ title: 'T', questions: [{ type: 'scam', prompt: 'SMS ?', options }] }), 'x.json');
    expect(r.lessons[0].questions[0].options).toEqual(options);
  });
});

describe('parseCSVLessons', () => {
  it('regroupe les fiches par leçon, avec ; ou , comme séparateur', () => {
    const csv = [
      'titre_lecon;xp;titre_fiche;texte_fiche;astuce',
      'Budget;60;Les besoins;"Loyer; courses";Note tout',
      'Budget;60;Les envies;Sorties;',
      'Épargne;;Le livret A;Disponible;',
    ].join('\n');
    const r = parseCSVLessons(csv, 'l.csv');
    expect(r.errors).toEqual([]);
    expect(r.lessons.map((l) => [l.title, l.xp_reward, l.screens.length])).toEqual([
      ['Budget', 60, 2],
      ['Épargne', 50, 1],
    ]);
    expect(r.lessons[0].screens[0]).toEqual({ title: 'Les besoins', body: 'Loyer; courses', tip: 'Note tout', order_index: 1 });
    expect(parseCSVLessons('lecon,texte\nBudget,Corps', 'v.csv').lessons[0].screens[0].body).toBe('Corps');
  });

  it('refuse un fichier vide ou sans colonne de titre', () => {
    expect(parseCSVLessons('titre_lecon', 'x.csv').errors[0]).toContain('vide');
    expect(parseCSVLessons('nom,texte\na,b', 'x.csv').errors[0]).toContain('introuvable');
  });
});

describe('parseMultipleLessonFiles', () => {
  it('cumule les leçons de plusieurs fichiers et refuse les extensions inconnues', async () => {
    const files = [
      new File([getSampleLessonsJSON()], 'modele.json'),
      new File([getSampleLessonsCSV()], 'modele.csv'),
      new File(['x'], 'notes.md'),
    ];
    const { allLessons, results } = await parseMultipleLessonFiles(files);
    expect(results.map((r) => r.errors.length)).toEqual([0, 0, 1]);
    expect(allLessons.length).toBe(results[0].lessons.length + results[1].lessons.length);
    expect(results[0].lessons.length).toBeGreaterThan(0);
    expect(results[1].lessons.length).toBeGreaterThan(0);
  });
});

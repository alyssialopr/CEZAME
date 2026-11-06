import { expect, loginAsAdmin, test } from '../../fixtures/backoffice';

const LESSONS_FILE = {
  lessons: [
    {
      title: 'Repérer une arnaque',
      xp_reward: 60,
      screens: [{ title: 'Les signaux', body: 'Urgence, lien, paiement.', tip: 'Ne clique pas.' }],
      questions: [
        {
          type: 'qcm', category: 'Arnaques', prompt: 'Un SMS te demande ta carte bancaire. Tu fais quoi ?', explanation: 'Jamais.',
          options: [{ text: 'Je supprime', correct: true }, { text: 'Je réponds', correct: false }],
        },
        {
          type: 'scam', category: 'Arnaques', prompt: 'Ce SMS est-il une arnaque ?',
          options: { sender: 'Ameli', channel: 'sms', message: 'Remboursement en attente', isScam: true, redFlags: ['Lien'] },
        },
      ],
    },
    { title: 'Lire sa fiche de paie', screens: [{ title: 'Brut et net', body: 'Le net est ce que tu touches.' }] },
  ],
};

const asFile = (name: string, content: string) => ({ name, mimeType: 'application/json', buffer: Buffer.from(content) });

test("l'import de fichiers crée les leçons dans l'unité choisie", async ({ page, api }) => {
  await loginAsAdmin(page);
  await page.goto('/lessons');

  await page.getByTestId('import-open').click();
  await page.getByTestId('import-category').selectOption('finance');
  await page.getByTestId('import-unit').selectOption('unit-finance-1');
  await page.getByTestId('import-files').setInputFiles(asFile('lecons.json', JSON.stringify(LESSONS_FILE)));
  await expect(page.getByText('Leçons prêtes à être créées (2)')).toBeVisible();
  await expect(page.getByText('2 fiche(s) • 2 quiz')).toBeVisible();

  const messages: string[] = [];
  page.on('dialog', (d) => {
    messages.push(d.message());
    void d.dismiss();
  });
  await page.getByTestId('import-submit').click();
  await expect.poll(() => messages).toEqual([expect.stringContaining('2 leçon(s) importée(s)')]);

  const [sent] = api.sent('POST', '/import-export/lessons/batch');
  expect(sent).toMatchObject({ targetCategoryId: 'finance', targetUnitId: 'unit-finance-1' });
  expect(sent.lessons.map((l: any) => [l.title, l.xp_reward, l.status])).toEqual([
    ['Repérer une arnaque', 60, 'draft'],
    ['Lire sa fiche de paie', 50, 'draft'],
  ]);
  expect(sent.lessons[0].questions.map((q: any) => q.type)).toEqual(['qcm', 'scam']);
  expect(sent.lessons[0].questions[0].options).toEqual([
    { letter: 'A', text: 'Je supprime', correct: true },
    { letter: 'B', text: 'Je réponds', correct: false },
  ]);
  expect(sent.lessons[0].questions[1].options).toEqual(LESSONS_FILE.lessons[0].questions![1].options);
  // La fenêtre se ferme et la liste se recharge avec les nouvelles leçons.
  await expect(page.getByTestId('import-files')).toHaveCount(0);
  await expect(page.getByText('Lire sa fiche de paie')).toBeVisible();
});

test("un fichier JSON invalide est signalé et rien n'est envoyé", async ({ page, api }) => {
  await loginAsAdmin(page);
  await page.goto('/lessons');
  await page.getByTestId('import-open').click();
  await page.getByTestId('import-category').selectOption('finance');
  await page.getByTestId('import-files').setInputFiles(asFile('casse.json', '{ pas du json'));

  await expect(page.getByTestId('import-errors')).toContainText('Erreur de syntaxe JSON');
  await expect(page.getByTestId('import-submit')).toBeDisabled();
  expect(api.sent('POST', '/import-export/lessons/batch')).toHaveLength(0);
});

test('un admin crée une catégorie', async ({ page, api }) => {
  await loginAsAdmin(page);
  await page.goto('/categories');

  await page.getByRole('button', { name: 'Nouvelle Catégorie' }).click();
  await page.getByPlaceholder('ex: assurances', { exact: true }).fill('assurances');
  await page.getByPlaceholder('ex: Assurances & Prévoyance').fill('Assurances & Prévoyance');
  await page.getByRole('button', { name: 'Enregistrer' }).click();

  await expect.poll(() => api.sent('POST', '/content/categories')).toHaveLength(1);
  expect(api.sent('POST', '/content/categories')[0]).toMatchObject({ id: 'assurances', label: 'Assurances & Prévoyance' });
  await expect(page.getByText('Assurances & Prévoyance')).toBeVisible();
});

import { expect, loginAsAdmin, test } from '../../fixtures/backoffice';

const LESSON_EXPORT = {
  version: '1.0',
  lesson: {
    title: 'Repérer une arnaque',
    xp_reward: 60,
    screens: [{ title: 'Les signaux', body: 'Urgence, lien, paiement.', tip: null, order_index: 1 }],
    questions: [
      {
        type: 'scam', category: 'Arnaques', prompt: 'Ce SMS est-il une arnaque ?', explanation: 'Lien raccourci.', order_index: 1,
        options: { sender: 'Ameli', channel: 'sms', message: 'Remboursement en attente', isScam: true, redFlags: ['Lien'] },
      },
      {
        type: 'bucket', category: 'Budget', prompt: 'Range ces dépenses', explanation: '', order_index: 2,
        options: { buckets: [{ id: 'b1', label: 'Besoins' }], items: [{ id: 'i1', text: 'Loyer', bucketId: 'b1' }] },
      },
    ],
  },
};

test("l'import JSON d'une leçon conserve les types d'exercice et ouvre l'éditeur", async ({ page, api }) => {
  await loginAsAdmin(page);
  await page.goto('/lessons');

  await page.getByTestId('import-open').click();
  await page.getByTestId('import-category').selectOption('finance');
  await page.getByTestId('import-unit').selectOption('unit-finance-1');
  await page.getByTestId('import-json').fill(JSON.stringify(LESSON_EXPORT));

  const dialog = page.waitForEvent('dialog');
  await page.getByTestId('import-submit').click();
  const message = await dialog;
  expect(message.message()).toContain('importée avec succès');
  await message.dismiss();

  await expect(page).toHaveURL(/\/lessons\/lesson-imported$/);
  const [sent] = api.sent('POST', '/import-export/lessons');
  expect(sent.targetCategoryId).toBe('finance');
  expect(sent.targetUnitId).toBe('unit-finance-1');
  expect(sent.payload.lesson.questions.map((q: any) => q.type)).toEqual(['scam', 'bucket']);
  expect(sent.payload.lesson.questions[1].options).toEqual(LESSON_EXPORT.lesson.questions[1].options);
});

test("un JSON invalide n'est pas envoyé", async ({ page, api }) => {
  await loginAsAdmin(page);
  await page.goto('/lessons');
  await page.getByTestId('import-open').click();
  await page.getByTestId('import-category').selectOption('finance');
  await page.getByTestId('import-unit').selectOption('unit-finance-1');
  await page.getByTestId('import-json').fill('{ pas du json');

  // L'alerte s'ouvre pendant le clic : on la ferme dès qu'elle apparaît.
  const messages: string[] = [];
  page.on('dialog', (d) => {
    messages.push(d.message());
    void d.dismiss();
  });
  await page.getByTestId('import-submit').click();
  await expect.poll(() => messages).toEqual([expect.stringContaining('JSON invalide')]);
  expect(api.sent('POST', '/import-export/lessons')).toHaveLength(0);
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

import { expect, test } from '@playwright/test';
import { SupabaseMock } from '../../fixtures/supabaseMock';
import { seedFinanceContent } from '../../fixtures/cezameData';

let db: SupabaseMock;

test.beforeEach(async ({ page }) => {
  db = new SupabaseMock();
  seedFinanceContent(db);
  await db.install(page);
});

test('un visiteur non connecté arrive sur la connexion', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByTestId('tester-login-button')).toBeVisible();
});

test("des identifiants refusés laissent l'utilisateur sur la connexion", async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('email-input').fill('inconnu@cezame.app');
  await page.getByTestId('password-input').fill('mauvais');
  await page.getByTestId('email-login-button').click();

  await expect.poll(() => db.requests.some((r) => r.path.startsWith('/auth/v1/token'))).toBe(true);
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByTestId('email-login-button')).not.toHaveAttribute('aria-disabled', 'true');
});

test("un testeur se connecte par son prénom, fait l'onboarding et reçoit sa recommandation", async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('tester-name-input').fill('Éloïse');
  await page.getByTestId('tester-login-button').click();

  // Compte de test créé, puis redirection vers l'onboarding.
  await expect(page.getByTestId('onboarding-question-ameli_account_created')).toBeVisible();
  const signup = db.requests.find((r) => r.path === '/auth/v1/signup');
  expect(signup?.body.email).toMatch(/^test_eloise_[a-z0-9]+@cezame-test\.app$/);
  expect(signup?.body.data).toEqual({ username: 'Éloïse', is_test_user: true });

  // Santé : 3 oui. Finance : 1 oui. Voiture : 3 oui. Administration : 0. Logement : 2.
  const answers: Record<number, string[]> = {
    0: ['ameli_account_created', 'vitale_card_requested', 'has_mutuelle'],
    1: ['has_identity_doc'],
    2: ['ants_account_created', 'code_passed', 'practical_exam_passed'],
    3: [],
    4: ['has_tenant_file', 'has_guarantor'],
  };
  for (let step = 0; step < 5; step++) {
    for (const key of answers[step]) {
      await page.getByTestId(`onboarding-question-${key}`).click();
    }
    await page.getByTestId('onboarding-next').click();
  }

  await expect(page.getByTestId('onboarding-score')).toHaveText('9/15');
  await expect(page.getByText('Adulte en Devenir (Sur la bonne voie)')).toBeVisible();
  await expect(page.getByText('• 📄 Administration')).toBeVisible();

  const userUpdate = db.rowsWritten('users', 'PATCH');
  expect(userUpdate).toContainEqual(expect.objectContaining({ is_onboarding_completed: true }));
  expect(db.rowsWritten('tax_return', 'POST')[0]).toMatchObject({ must_declare: false, impots_account_created: false });

  await page.getByTestId('onboarding-start').click();
  await expect(page).not.toHaveURL(/onboarding/);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('@active_category'))).toBe('administration');
});

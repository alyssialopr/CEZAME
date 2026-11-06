import { ADMIN, LEARNER, expect, loginAsAdmin, test } from '../../fixtures/backoffice';

test('une page protégée renvoie vers la connexion sans session', async ({ page }) => {
  await page.goto('/lessons');
  await expect(page).toHaveURL(/\/login$/);
});

test("un admin se connecte et arrive sur le tableau de bord", async ({ page, api }) => {
  await loginAsAdmin(page);
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText('12', { exact: true })).toBeVisible();
  expect(api.requests.find((r) => r.path === '/auth/me')).toBeTruthy();
});

test("un compte sans rôle admin reste bloqué à la connexion", async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('login-email').fill(LEARNER.email);
  await page.getByTestId('login-password').fill(LEARNER.password);
  await page.getByTestId('login-submit').click();

  await expect(page.getByTestId('login-error')).toContainText('Accès refusé');
  await expect(page).toHaveURL(/\/login$/);
});

test('un mauvais mot de passe affiche une erreur', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('login-email').fill(ADMIN.email);
  await page.getByTestId('login-password').fill('faux');
  await page.getByTestId('login-submit').click();
  await expect(page.getByTestId('login-error')).toContainText('Invalid login credentials');
});

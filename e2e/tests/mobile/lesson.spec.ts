import { expect, test } from '@playwright/test';
import { SupabaseMock } from '../../fixtures/supabaseMock';
import { LESSON_ID, seedFinanceContent, seedOnboardedUser } from '../../fixtures/cezameData';

test("un utilisateur termine une leçon : fiche, quiz, cœurs et score", async ({ page }) => {
  const db = new SupabaseMock();
  seedFinanceContent(db);
  const user = seedOnboardedUser(db);
  await db.install(page);

  await page.goto('/login');
  await page.getByTestId('email-input').fill(user.email);
  await page.getByTestId('password-input').fill(user.password);
  await page.getByTestId('email-login-button').click();

  // Choix de la catégorie puis première leçon débloquée.
  await page.getByTestId('category-card-finance').click();
  await expect(page.getByTestId('lesson-locked-lesson-budget-2')).toBeVisible();
  // Le bouton de la leçon pulse en continu : il n'est jamais « stable » pour Playwright.
  await page.getByTestId(`lesson-start-${LESSON_ID}`).click({ force: true });

  await expect(page.getByText('La règle 50/30/20')).toBeVisible();
  await page.getByTestId('lesson-content-continue').click();

  // Question 1 : bonne réponse, les cœurs restent à 5.
  await expect(page.getByText('Quelle part pour les besoins ?')).toBeVisible();
  // react-native-web rend `disabled` sous forme d'aria-disabled.
  await expect(page.getByTestId('lesson-continue')).toHaveAttribute('aria-disabled', 'true');
  await page.getByTestId('qcm-option-A').click();
  await expect(page.getByText('50 % pour les besoins.')).toBeVisible();
  await expect(page.getByTestId('lesson-hearts')).toHaveText('5');
  await page.getByTestId('lesson-continue').click();

  // Question 2 : mauvaise réponse, un cœur en moins.
  await expect(page.getByText("Où mettre l'épargne de précaution ?")).toBeVisible();
  await page.getByTestId('qcm-option-A').click();
  await expect(page.getByTestId('lesson-hearts')).toHaveText('4');
  await page.getByTestId('lesson-continue').click();

  await expect(page.getByTestId('score-title')).toHaveText('FÉLICITATIONS !');
  await expect.poll(() => db.rowsWritten('user_lesson_progress', 'POST')).toContainEqual(
    expect.objectContaining({ user_id: user.id, lesson_id: LESSON_ID, status: 'completed', score: 1 })
  );
  await expect.poll(() => db.table('progress')[0].xp).toBe(170);

  await page.getByTestId('score-continue').click();
  await expect(page.getByTestId(`lesson-completed-${LESSON_ID}`)).toBeVisible();
});

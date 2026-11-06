import { expect, test, type Locator, type Page } from '@playwright/test';
import { SupabaseMock } from '../../fixtures/supabaseMock';
import { seedFinanceContent, seedOnboardedUser } from '../../fixtures/cezameData';

/** Trou du spotlight (dernier <mask> de la page), en coordonnées page. */
async function spotlightHole(page: Page) {
  return page.evaluate(() => {
    const masks = document.querySelectorAll('mask');
    const mask = masks[masks.length - 1];
    const hole = mask?.querySelectorAll('rect')[1];
    const svg = mask?.closest('svg')?.getBoundingClientRect();
    if (!hole || !svg) return null;
    const n = (a: string) => Number(hole.getAttribute(a));
    return { x: svg.x + n('x'), y: svg.y + n('y'), width: n('width'), height: n('height') };
  });
}

/** Le trou doit être centré sur la cible et l'englober. */
async function expectSpotlightOn(page: Page, target: Locator) {
  await expect
    .poll(async () => {
      const hole = await spotlightHole(page);
      const box = await target.boundingBox();
      if (!hole || !box) return 'pas de spotlight';
      const dx = Math.abs(hole.x + hole.width / 2 - (box.x + box.width / 2));
      const dy = Math.abs(hole.y + hole.height / 2 - (box.y + box.height / 2));
      const covers = hole.width >= box.width && hole.height >= box.height;
      return dx <= 3 && dy <= 3 && covers ? 'ok' : JSON.stringify({ hole, box });
    })
    .toBe('ok');
}

for (const [name, viewport] of [
  ['téléphone', { width: 412, height: 839 }],
  // Sur grand écran l'app est dans un cadre de téléphone centré : le spotlight doit suivre.
  ['grand écran', { width: 1280, height: 800 }],
] as const) {
  test(`le tutoriel met en évidence le bon élément (${name})`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const db = new SupabaseMock();
    seedFinanceContent(db);
    const user = seedOnboardedUser(db);
    await db.install(page);
    await page.addInitScript(() => localStorage.setItem('@tutorial_pending', 'true'));

    await page.goto('/login');
    await page.getByTestId('email-input').fill(user.email);
    await page.getByTestId('password-input').fill(user.password);
    await page.getByTestId('email-login-button').click();

    // 1. La première carte de thème.
    await expect(page.getByText('Choisis un thème pour commencer ton parcours.')).toBeVisible();
    await expectSpotlightOn(page, page.getByTestId('category-card-sante'));
    // La bulle d'aide recouvre les cartes suivantes : on clique la carte mise en évidence.
    await page.getByTestId('category-card-sante').click();

    // 2. Le bouton de la première leçon (il pulse : on compare les centres).
    await expect(page.getByText('Appuie sur COMMENCER pour lancer ta première leçon.')).toBeVisible();
    const start = page.locator('[data-testid^="lesson-start-"]').first();
    await expectSpotlightOn(page, start);
  });
}

test('le spotlight suit la cible quand elle bouge', async ({ page }) => {
  const db = new SupabaseMock();
  seedFinanceContent(db);
  const user = seedOnboardedUser(db);
  await db.install(page);
  await page.addInitScript(() => localStorage.setItem('@tutorial_pending', 'true'));

  await page.goto('/login');
  await page.getByTestId('email-input').fill(user.email);
  await page.getByTestId('password-input').fill(user.password);
  await page.getByTestId('email-login-button').click();

  const card = page.getByTestId('category-card-sante');
  await expectSpotlightOn(page, card);
  // Simule un contenu chargé après coup qui pousse la carte vers le bas.
  await card.evaluate((el) => ((el as HTMLElement).style.marginTop = '60px'));
  await expectSpotlightOn(page, card);
});

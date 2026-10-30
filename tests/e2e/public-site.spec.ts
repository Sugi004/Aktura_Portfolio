import { expect, test } from '@playwright/test';

const routes = ['/', '/services', '/packages', '/reviews', '/travel', '/about', '/portfolio', '/faq', '/how-it-works', '/contact'];
const widths = [360, 390, 768, 1280];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('altura-intro-seen', '1'));
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test.describe('public pages stay aligned at responsive widths', () => {
  for (const width of widths) {
    test(`${width}px viewport has no horizontal overflow`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });

      for (const route of routes) {
        const response = await page.goto(route);
        expect(response?.status(), `${route} should load`).toBe(200);
        await expect(page.locator('main')).toBeVisible();
        const dimensions = await page.evaluate(() => ({
          viewport: document.documentElement.clientWidth,
          document: document.documentElement.scrollWidth,
          body: document.body.scrollWidth,
        }));
        expect(dimensions.document, `${route} document overflow at ${width}px: ${JSON.stringify(dimensions)}`).toBeLessThanOrEqual(width + 1);
        expect(dimensions.body, `${route} body overflow at ${width}px: ${JSON.stringify(dimensions)}`).toBeLessThanOrEqual(width + 1);
        if (route === '/packages') {
          const positions = await page.locator('.package-card').evaluateAll((elements) => elements.map((element) => ({ top: element.getBoundingClientRect().top, left: element.getBoundingClientRect().left })));
          for (let index = 0; index < positions.length - 1; index++) {
            const nextFollows = positions[index + 1].top > positions[index].top || (Math.abs(positions[index + 1].top - positions[index].top) < 1 && positions[index + 1].left > positions[index].left);
            expect(nextFollows, `Package order should follow Silver–Gold–Platinum at ${width}px`).toBe(true);
          }
        }

        if (['/', '/services', '/packages', '/reviews', '/travel', '/contact'].includes(route) && (width === 360 || width === 1280)) {
          await page.screenshot({ path: `test-results/layout-${route === '/' ? 'home' : route.slice(1)}-${width}.png`, fullPage: true });
        }
      }
    });
  }
});

test('testimonial carousel advances through the supplied testimonials', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/reviews');
  await expect(page.locator('.review-carousel .review-heading .kicker')).toHaveText('Client Reviews');
  const card = page.locator('.review-card');
  const controls = page.locator('.review-controls');
  const cardBox = await card.boundingBox();
  const controlsBox = await controls.boundingBox();
  expect(cardBox).not.toBeNull();
  expect(controlsBox).not.toBeNull();
  expect(Math.abs((cardBox!.x + cardBox!.width / 2) - 640)).toBeLessThanOrEqual(1);
  expect(Math.abs((controlsBox!.x + controlsBox!.width / 2) - 640)).toBeLessThanOrEqual(1);
  const cards = [
    ['Alexandra M.', 'Founder & Managing Director', '4.7'],
    ['Daniel R.', 'Senior Business Consultant', '4.6'],
    ['Michael T.', 'Business Owner', '5.0'],
    ['Sophia L.', 'Entrepreneur', '4.7'],
    ['James W.', 'Managing Partner', '4.6'],
  ];
  for (const [name, role, rating] of cards) {
    await expect(page.getByText(name)).toBeVisible();
    await expect(page.getByText(role)).toBeVisible();
    await expect(page.getByLabel(`${Number(rating).toFixed(1)} out of 5 stars`)).toBeVisible();
    const partialWidth = await page.locator('.review-star').nth(4).locator('.review-stars-filled').evaluate((element) => parseFloat((element as HTMLElement).style.width));
    expect(partialWidth).toBe(Number(rating) % 1 === 0 ? 100 : Math.round((Number(rating) % 1) * 100));
    if (name !== 'James W.') await page.getByRole('button', { name: 'Next testimonial' }).click();
  }
});

test('review card and pagination remain centered on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/');
  const carousel = page.locator('.reviews-home .review-carousel');
  await expect(carousel.getByText('Client Reviews', { exact: true })).toBeVisible();
  const cardBox = await carousel.locator('.review-card').boundingBox();
  const controlsBox = await carousel.locator('.review-controls').boundingBox();
  expect(cardBox).not.toBeNull();
  expect(controlsBox).not.toBeNull();
  const sectionBox = await carousel.boundingBox();
  expect(sectionBox).not.toBeNull();
  const center = sectionBox!.x + sectionBox!.width / 2;
  expect(Math.abs((cardBox!.x + cardBox!.width / 2) - center)).toBeLessThanOrEqual(1);
  expect(Math.abs((controlsBox!.x + controlsBox!.width / 2) - center)).toBeLessThanOrEqual(1);
  const arrowColors = await carousel.locator('.review-controls button').first().evaluate((element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundColor, foreground: style.color };
  });
  const pageNumberColor = await carousel.locator('.review-controls > span').evaluate((element) => getComputedStyle(element).color);
  expect(arrowColors).toEqual({ background: 'rgb(201, 164, 92)', foreground: 'rgb(7, 21, 46)' });
  expect(pageNumberColor).toBe('rgb(201, 164, 92)');
});

test('review category and rating do not collide at narrow widths', async ({ page }) => {
  for (const width of [360, 390, 668]) {
    await page.setViewportSize({ width, height: 850 });
    await page.goto('/reviews');
    const category = await page.locator('.review-category').boundingBox();
    const score = await page.locator('.review-score').boundingBox();
    expect(category).not.toBeNull();
    expect(score).not.toBeNull();
    expect(score!.y).toBeGreaterThanOrEqual(category!.y + category!.height);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(width);
  }
});

test('package cards use glass styling on the homepage and Packages page', async ({ page }) => {
  for (const route of ['/', '/packages']) {
    await page.goto(route);
    if (await page.locator('html').getAttribute('data-theme') === 'dark') await page.getByRole('button', { name: 'Switch to light mode' }).click();
    const cards = page.locator('.package-card');
    await expect(cards).toHaveCount(3);
    await expect(cards.nth(0)).toContainText('Silver');
    await expect(cards.nth(1)).toContainText('Gold');
    await expect(cards.nth(2)).toContainText('Platinum');
    const blur = await cards.first().evaluate((element) => getComputedStyle(element).backdropFilter);
    expect(blur).toContain('blur');
    const firstCard = await cards.first().boundingBox();
    expect(firstCard).not.toBeNull();
    expect(firstCard!.x).toBeGreaterThanOrEqual(0);
    expect(firstCard!.x + firstCard!.width).toBeLessThanOrEqual((await page.evaluate(() => innerWidth)) + 1);
    const cardTops = await cards.evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().top));
    if (await page.evaluate(() => innerWidth) < 760) expect(cardTops[0]).toBeLessThan(cardTops[1]);
    else expect(cardTops[0]).toBeLessThanOrEqual(cardTops[1]);
    await page.getByRole('button', { name: 'Switch to dark mode' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const darkTextColor = await cards.first().evaluate((element) => getComputedStyle(element).color);
    expect(darkTextColor).not.toBe('rgba(0, 0, 0, 0)');
    await page.screenshot({ path: `test-results/package-${route === '/' ? 'home' : 'page'}-dark.png`, fullPage: true });
  }
});

test('contact form prepares an encoded mailto draft and sends no API request', async ({ page }) => {
  const apiRequests: string[] = [];
  const pageErrors: string[] = [];
  page.on('request', (request) => { if (request.url().includes('/api/')) apiRequests.push(request.url()); });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto('/contact');
  await page.getByLabel('What can I help with?').selectOption('executive');
  await page.getByLabel('Your name').fill('Taylor Example');
  await page.getByLabel('Business email').fill('taylor@example.com');
  await page.getByLabel('Project description').fill('Please help organize my calendar and inbox.');
  const validity = await page.locator('.contact-form').evaluate((form: HTMLFormElement) => ({ valid: form.checkValidity(), invalid: [...form.elements].filter((element): element is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement => element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement).filter((element) => !element.checkValidity()).map((element) => element.name) }));
  expect(validity, 'contact fields should pass browser validation').toEqual({ valid: true, invalid: [] });
  await page.getByRole('button', { name: /Prepare email/ }).click();
  expect(page.url()).toContain('/contact');

  const emailLink = page.getByRole('link', { name: 'Open email app' });
  await expect(emailLink).toBeVisible();
  const href = await emailLink.getAttribute('href');
  expect(href).toMatch(/^mailto:alturaexecutive@gmail\.com\?/);
  const draft = new URL(href!);
  expect(draft.searchParams.get('subject')).toContain('Virtual executive assistance');
  expect(draft.searchParams.get('body')).toContain('Name: Taylor Example');
  expect(draft.searchParams.get('body')).toContain('Email: taylor@example.com');
  expect(draft.searchParams.get('body')).toContain('Please help organize my calendar and inbox.');
  expect(apiRequests).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test('database-backed admin and submission endpoints are absent', async ({ page }) => {
  expect((await page.goto('/admin'))?.status()).toBe(404);
  expect((await page.goto('/api/inquiries'))?.status()).toBe(404);
  expect((await page.goto('/api/reviews'))?.status()).toBe(404);
});

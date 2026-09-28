import { test, expect } from '@playwright/test';

const makeValidJwt = () => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
    iat: Math.floor(Date.now() / 1000),
    sub: 'test-user',
  })).toString('base64url');

  return `${header}.${payload}.signature`;
};

test.describe('core user journeys', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('shows the homepage hero and main CTA', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', {
        name: /Помогни во градењето на иднината/i,
      }),
    ).toBeVisible();

    await expect(
      page.getByRole('link', { name: /Започни да придонесуваш/i }),
    ).toHaveAttribute('href', /\/register/);

    await expect(page.getByRole('link', { name: /Дознај повеќе/i })).toBeVisible();
  });

  test('redirects unauthenticated users away from the protected dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole('heading', { name: /Добредојде назад/i }),
    ).toBeVisible();
  });

  test('logs in successfully and redirects to the dashboard', async ({ page }) => {
    const validJwt = makeValidJwt();

    await page.route('**/api/auth', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ userCanReview: false }),
        });
        return;
      }

      await route.continue();
    });

    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          jwtToken: validJwt,
          firstName: 'Ана',
          lastName: 'Андреевска',
          email: 'ana@example.com',
          createdAt: '2024-01-01T00:00:00Z',
          avatarUrl: null,
        }),
      });
    });

    await page.route('**/api/user/stats', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalPoints: 150,
          totalUploads: 12,
          totalRewards: 4,
          rank: 3,
        }),
      });
    });

    await page.goto('/login');
    await page.locator('#email').fill('ana@example.com');
    await page.locator('#password').fill('securePass123');
    await page.getByRole('button', { name: /Најави се/i }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText(/Добредојде назад, Ана/i)).toBeVisible();

    await expect.poll(async () => page.evaluate(() => localStorage.getItem('token'))).toBe(validJwt);
  });

  
  test('registers a new user by sending a verification code and submitting the form', async ({ page }) => {
    await page.route('**/api/auth/register/send-code', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    const validJwt = makeValidJwt();

    await page.route('**/api/auth', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ userCanReview: false }),
        });
        return;
      }

      await route.continue();
    });

    await page.route('**/api/auth/register', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          jwtToken: validJwt,
          firstName: 'Марко',
          lastName: 'Марковски',
          email: 'marko@example.com',
          createdAt: '2024-01-01T00:00:00Z',
          avatarUrl: null,
        }),
      });
    });

    await page.route('**/api/user/stats', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalPoints: 180,
          totalUploads: 20,
          totalRewards: 5,
          rank: 2,
        }),
      });
    });

    await page.goto('/register');
    await page.locator('#firstName').fill('Марко');
    await page.locator('#lastName').fill('Марковски');
    await page.locator('#email').fill('marko@example.com');

    await page.getByRole('button', { name: /Испрати код/i }).click();
    await expect(page.getByLabel(/Код за потврда/i)).toBeVisible();

    await page.locator('#code').fill('123456');
    await page.locator('#password').fill('securePass123');
    await page.getByRole('button', { name: /Создај сметка/i }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText(/Добредојде назад, Марко/i)).toBeVisible();
  });

  test('loads public files and can filter them by search term', async ({ page }) => {
    await page.route('**/api/content/public*', async (route) => {
      const search = new URL(route.request().url()).searchParams.get('search') || '';

      const records = [
        {
          id: 1,
          topic: 'Лексички корпус',
          type: 'TEXT',
          description: 'Колекција од македонски текстови',
          fileUrl: '/sample1.txt',
          createdAt: '2024-01-01T00:00:00Z',
          uploader: { email: 'demo@example.com' },
        },
        {
          id: 2,
          topic: 'Дијалектен запис',
          type: 'AUDIO',
          description: 'Аудио пример за разговорен македонски',
          fileUrl: '/sample2.mp3',
          createdAt: '2024-01-02T00:00:00Z',
          uploader: { email: 'demo@example.com' },
        },
      ];

      const filtered = search
        ? records.filter((record) =>
            record.topic.toLowerCase().includes(search.toLowerCase()) ||
            record.description.toLowerCase().includes(search.toLowerCase()),
          )
        : records;

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          content: filtered,
          totalPages: 1,
          totalElements: filtered.length,
        }),
      });
    });

    await page.goto('/public-files');

    await expect(page.getByRole('heading', { name: /Јавни податоци/i })).toBeVisible();
    await expect(page.getByText(/Лексички корпус/i)).toBeVisible();

    await page.getByPlaceholder('Пребарај...').fill('дијалект');

    await expect(page.getByText(/Дијалектен запис/i)).toBeVisible();
    await expect(page.getByText(/Лексички корпус/i)).toHaveCount(0);
  });
});

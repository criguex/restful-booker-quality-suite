import { test, expect } from '@playwright/test';

test.describe('Health and authentication', () => {
  test('@smoke health endpoint reports availability', async ({ request }) => {
    const response = await request.get('/ping');
    expect(response.status()).toBe(201);
    expect(await response.text()).toBe('Created');
  });

  test('@smoke valid credentials issue a non-empty token', async ({ request }) => {
    const response = await request.post('/auth', {
      data: { username: 'admin', password: 'password123' },
    });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ token: expect.stringMatching(/^[a-f0-9]{15}$/) });
  });

  test('@negative invalid credentials do not issue a token', async ({ request }) => {
    const response = await request.post('/auth', {
      data: { username: 'admin', password: 'incorrect' },
    });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ reason: 'Bad credentials' });
  });
});

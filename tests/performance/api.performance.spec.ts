import { test, expect } from '@playwright/test';

test.describe('API performance budgets @performance', () => {
  test('health check p95 stays below 500 ms across 20 samples', async ({ request }) => {
    const durations: number[] = [];
    for (let sample = 0; sample < 20; sample += 1) {
      const started = performance.now();
      const response = await request.get('/ping');
      durations.push(performance.now() - started);
      expect(response.status()).toBe(201);
    }
    durations.sort((a, b) => a - b);
    const p95 = durations[Math.ceil(durations.length * 0.95) - 1];
    expect(p95).toBeLessThan(500);
  });

  test('booking list responds below 1 second', async ({ request }) => {
    const started = performance.now();
    const response = await request.get('/booking');
    const duration = performance.now() - started;
    expect(response.status()).toBe(200);
    expect(duration).toBeLessThan(1_000);
  });
});

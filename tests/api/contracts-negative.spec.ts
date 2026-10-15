import { test, expect } from '@playwright/test';
import { createBooking, deleteBooking } from './helpers';

test.describe('Contracts, formats and negative paths', () => {
  test('@regression booking list has numeric identifiers', async ({ request }) => {
    const response = await request.get('/booking');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
    for (const item of body) expect(item).toEqual({ bookingid: expect.any(Number) });
  });

  test('@regression booking can be represented as XML', async ({ request }) => {
    test.fail(true, 'Known defect RB-001: XML response declares text/html content type');
    const created = await createBooking(request);
    try {
      const response = await request.get(`/booking/${created.id}`, {
        headers: { Accept: 'application/xml' },
      });
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/xml');
      expect(await response.text()).toContain('<booking>');
    } finally {
      await deleteBooking(request, created.id);
    }
  });

  test('@negative unknown booking returns 404', async ({ request }) => {
    expect((await request.get('/booking/999999999')).status()).toBe(404);
  });

  test('@negative unsupported response format returns 418', async ({ request }) => {
    const created = await createBooking(request);
    try {
      const response = await request.get(`/booking/${created.id}`, {
        headers: { Accept: 'application/pdf' },
      });
      expect(response.status()).toBe(418);
    } finally {
      await deleteBooking(request, created.id);
    }
  });

  test('@negative update without credentials is forbidden', async ({ request }) => {
    const created = await createBooking(request);
    try {
      const response = await request.patch(`/booking/${created.id}`, {
        data: { firstname: 'Unauthorized' },
      });
      expect(response.status()).toBe(403);
    } finally {
      await deleteBooking(request, created.id);
    }
  });

  test('@negative delete without credentials is forbidden', async ({ request }) => {
    const created = await createBooking(request);
    try {
      expect((await request.delete(`/booking/${created.id}`)).status()).toBe(403);
    } finally {
      await deleteBooking(request, created.id);
    }
  });

  test('@negative incomplete create payload is rejected', async ({ request }) => {
    const response = await request.post('/booking', {
      data: { firstname: 'Only one field' },
    });
    expect(response.status()).toBe(500);
  });
});

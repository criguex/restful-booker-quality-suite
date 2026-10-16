import { test, expect } from '@playwright/test';
import { booking, createBooking, deleteBooking } from './helpers';

const basicAuth = { Authorization: 'Basic YWRtaW46cGFzc3dvcmQxMjM=' };

test.describe('Confirmed product defects @known-defect', () => {
  test('RB-002 XML false remains false after creation', async ({ request }) => {
    test.fail(true, 'Known defect RB-002: XML string false is coerced to boolean true');
    let id: number | undefined;
    try {
      const response = await request.post('/booking', {
        headers: { 'Content-Type': 'text/xml', Accept: 'application/json' },
        data: `<booking><firstname>XML</firstname><lastname>Boolean</lastname><totalprice>100</totalprice><depositpaid>false</depositpaid><bookingdates><checkin>2026-11-10</checkin><checkout>2026-11-11</checkout></bookingdates><additionalneeds>None</additionalneeds></booking>`,
      });
      expect(response.status()).toBe(200);
      const body = await response.json();
      id = body.bookingid;
      expect(body.booking.depositpaid).toBe(false);
    } finally {
      // eslint-disable-next-line playwright/no-conditional-in-test
      if (id) await deleteBooking(request, id);
    }
  });

  test('RB-003 decimal total price preserves precision', async ({ request }) => {
    test.fail(true, 'Known defect RB-003: decimal totalprice is truncated with parseInt');
    const payload = { ...booking('decimal'), totalprice: 10.99 };
    let id: number | undefined;
    try {
      const response = await request.post('/booking', { data: payload });
      expect(response.status()).toBe(200);
      const body = await response.json();
      id = body.bookingid;
      expect(body.booking.totalprice).toBe(10.99);
    } finally {
      // eslint-disable-next-line playwright/no-conditional-in-test
      if (id) await deleteBooking(request, id);
    }
  });

  test('RB-004 invalid calendar dates are rejected', async ({ request }) => {
    test.fail(true, 'Known defect RB-004: invalid dates are stored and returned as 0NaN-aN-aN');
    const payload = {
      ...booking('invalid-date'),
      bookingdates: { checkin: 'not-a-date', checkout: '2026-02-30' },
    };
    let id: number | undefined;
    try {
      const response = await request.post('/booking', { data: payload });
      expect(response.status()).toBeGreaterThanOrEqual(400);
      expect(response.status()).toBeLessThan(500);
      // eslint-disable-next-line playwright/no-conditional-in-test
      if (response.status() === 200) id = (await response.json()).bookingid;
    } finally {
      // eslint-disable-next-line playwright/no-conditional-in-test
      if (id) await deleteBooking(request, id);
    }
  });

  for (const method of ['put', 'patch'] as const) {
    test(`RB-005 ${method.toUpperCase()} for an absent booking returns 404`, async ({
      request,
    }) => {
      test.fail(true, 'Known defect RB-005: absent update target returns 405 Method Not Allowed');
      const response = await request[method]('/booking/999999999', {
        headers: basicAuth,
        data: method === 'put' ? booking(`missing-${method}`) : { lastname: 'Missing' },
      });
      expect(response.status()).toBe(404);
    });
  }

  test('RB-006 DELETE for an absent booking returns 404', async ({ request }) => {
    test.fail(true, 'Known defect RB-006: absent delete target returns 405 Method Not Allowed');
    const response = await request.delete('/booking/999999999', { headers: basicAuth });
    expect(response.status()).toBe(404);
  });

  test('RB-008 invalid credentials return an authentication error status', async ({ request }) => {
    test.fail(true, 'Known defect RB-008: invalid credentials return HTTP 200');
    const response = await request.post('/auth', {
      data: { username: 'admin', password: 'invalid' },
    });
    expect([401, 403]).toContain(response.status());
  });

  test('@positive valid leap-day dates complete the booking lifecycle', async ({ request }) => {
    const payload = {
      ...booking('leap-day'),
      bookingdates: { checkin: '2028-02-29', checkout: '2028-03-01' },
    };
    const created = await createBooking(request, payload);
    try {
      const response = await request.get(`/booking/${created.id}`);
      expect(response.status()).toBe(200);
      expect((await response.json()).bookingdates).toEqual(payload.bookingdates);
    } finally {
      await deleteBooking(request, created.id);
    }
  });
});

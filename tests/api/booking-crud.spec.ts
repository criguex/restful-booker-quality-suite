import { test, expect } from '@playwright/test';
import { booking, createBooking, deleteBooking, token } from './helpers';

test.describe('Booking lifecycle', () => {
  test('@smoke create and retrieve a booking', async ({ request }) => {
    const created = await createBooking(request);
    try {
      const response = await request.get(`/booking/${created.id}`);
      expect(response.status()).toBe(200);
      expect(await response.json()).toEqual(created.payload);
    } finally {
      await deleteBooking(request, created.id);
    }
  });

  test('@regression full update with cookie authentication', async ({ request }) => {
    const created = await createBooking(request);
    try {
      const authToken = await token(request);
      const updated = {
        ...created.payload,
        lastname: 'Updated',
        totalprice: 350,
        depositpaid: false
      };
      const response = await request.put(`/booking/${created.id}`, {
        data: updated,
        headers: { Cookie: `token=${authToken}` }
      });
      expect(response.status()).toBe(200);
      expect(await response.json()).toEqual(updated);
    } finally {
      await deleteBooking(request, created.id);
    }
  });

  test('@regression partial update preserves omitted fields', async ({ request }) => {
    const created = await createBooking(request);
    try {
      const response = await request.patch(`/booking/${created.id}`, {
        data: { additionalneeds: 'Late checkout' },
        headers: { Authorization: 'Basic YWRtaW46cGFzc3dvcmQxMjM=' }
      });
      expect(response.status()).toBe(200);
      expect(await response.json()).toEqual({
        ...created.payload,
        additionalneeds: 'Late checkout'
      });
    } finally {
      await deleteBooking(request, created.id);
    }
  });

  test('@regression delete removes an existing booking', async ({ request }) => {
    const created = await createBooking(request);
    const deleted = await request.delete(`/booking/${created.id}`, {
      headers: { Authorization: 'Basic YWRtaW46cGFzc3dvcmQxMjM=' }
    });
    expect(deleted.status()).toBe(201);
    expect((await request.get(`/booking/${created.id}`)).status()).toBe(404);
  });

  test('@regression name filters return the created booking', async ({ request }) => {
    const payload = booking(`filter-${Date.now()}`);
    const created = await createBooking(request, payload);
    try {
      const response = await request.get('/booking', {
        params: { firstname: payload.firstname, lastname: payload.lastname }
      });
      expect(response.status()).toBe(200);
      expect(await response.json()).toContainEqual({ bookingid: created.id });
    } finally {
      await deleteBooking(request, created.id);
    }
  });
});

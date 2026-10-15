import { test, expect } from '@playwright/test';
import {
  authFailureSchema,
  authSuccessSchema,
  bookingIdsSchema,
  bookingSchema,
  createdBookingSchema,
} from '../../src/contracts/bookingSchemas';
import { expectSchema } from '../../src/support/expectSchema';
import { booking, createBooking, deleteBooking } from '../api/helpers';

test.describe('Restful Booker contracts @contract', () => {
  test('GET /booking matches the booking-id list contract', async ({ request }) => {
    const response = await request.get('/booking');
    expect(response.status()).toBe(200);
    expectSchema(bookingIdsSchema, await response.json());
  });

  test('POST /booking matches the creation contract', async ({ request }) => {
    const payload = booking();
    const response = await request.post('/booking', { data: payload });
    expect(response.status()).toBe(200);
    const body = expectSchema(createdBookingSchema, await response.json());
    expect(body.booking).toEqual(payload);
    await deleteBooking(request, body.bookingid);
  });

  test('GET /booking/:id matches the booking contract', async ({ request }) => {
    const created = await createBooking(request);
    try {
      const response = await request.get(`/booking/${created.id}`);
      expect(response.status()).toBe(200);
      expectSchema(bookingSchema, await response.json());
    } finally {
      await deleteBooking(request, created.id);
    }
  });

  test('successful authentication matches the token contract', async ({ request }) => {
    const response = await request.post('/auth', {
      data: { username: 'admin', password: 'password123' },
    });
    expect(response.status()).toBe(200);
    expectSchema(authSuccessSchema, await response.json());
  });

  test('failed authentication matches the error contract', async ({ request }) => {
    const response = await request.post('/auth', {
      data: { username: 'admin', password: 'invalid' },
    });
    expect(response.status()).toBe(200);
    expectSchema(authFailureSchema, await response.json());
  });
});

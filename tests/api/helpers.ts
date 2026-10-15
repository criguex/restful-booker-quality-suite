import { APIRequestContext, expect } from '@playwright/test';

export type Booking = {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: { checkin: string; checkout: string };
  additionalneeds: string;
};

export const booking = (suffix = Date.now().toString()): Booking => ({
  firstname: `Cristian-${suffix}`,
  lastname: 'Quality',
  totalprice: 275,
  depositpaid: true,
  bookingdates: { checkin: '2026-11-10', checkout: '2026-11-14' },
  additionalneeds: 'API automation'
});

export async function token(request: APIRequestContext): Promise<string> {
  const response = await request.post('/auth', {
    data: { username: 'admin', password: 'password123' }
  });
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.token).toEqual(expect.any(String));
  return body.token;
}

export async function createBooking(
  request: APIRequestContext,
  payload: Booking = booking()
): Promise<{ id: number; payload: Booking }> {
  const response = await request.post('/booking', { data: payload });
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.bookingid).toEqual(expect.any(Number));
  expect(body.booking).toEqual(payload);
  return { id: body.bookingid, payload };
}

export async function deleteBooking(request: APIRequestContext, id: number): Promise<void> {
  const response = await request.delete(`/booking/${id}`, {
    headers: { Authorization: 'Basic YWRtaW46cGFzc3dvcmQxMjM=' }
  });
  if (![201, 405].includes(response.status())) {
    throw new Error(`Unexpected cleanup status ${response.status()} for booking ${id}`);
  }
}

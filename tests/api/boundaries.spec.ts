import { test, expect } from '@playwright/test';
import { booking, createBooking, deleteBooking } from './helpers';

const names = [
  ['Unicode', 'Gómez-测试'],
  ['Whitespace', 'De la Cruz'],
  ['Punctuation', "O'Connor"],
] as const;

test.describe('Data boundaries and compatibility', () => {
  for (const [label, lastname] of names) {
    test(`@regression preserves ${label.toLowerCase()} guest names`, async ({ request }) => {
      const payload = { ...booking(label), lastname };
      const created = await createBooking(request, payload);
      try {
        const response = await request.get(`/booking/${created.id}`);
        expect((await response.json()).lastname).toBe(lastname);
      } finally {
        await deleteBooking(request, created.id);
      }
    });
  }

  test('@regression supports Basic authentication for a full update', async ({ request }) => {
    const created = await createBooking(request);
    try {
      const payload = { ...created.payload, totalprice: 0, additionalneeds: '' };
      const response = await request.put(`/booking/${created.id}`, {
        data: payload,
        headers: { Authorization: 'Basic YWRtaW46cGFzc3dvcmQxMjM=' },
      });
      expect(response.status()).toBe(200);
      expect(await response.json()).toEqual(payload);
    } finally {
      await deleteBooking(request, created.id);
    }
  });

  test('@negative invalid auth token cannot update data', async ({ request }) => {
    const created = await createBooking(request);
    try {
      const response = await request.patch(`/booking/${created.id}`, {
        data: { lastname: 'Compromised' },
        headers: { Cookie: 'token=invalid-token' },
      });
      expect(response.status()).toBe(403);
      expect((await (await request.get(`/booking/${created.id}`)).json()).lastname).toBe(
        created.payload.lastname,
      );
    } finally {
      await deleteBooking(request, created.id);
    }
  });
});

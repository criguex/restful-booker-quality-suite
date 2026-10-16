import { test, expect } from '@playwright/test';
import {
  bookingSchema,
  createdBookingSchema,
  isoDateSchema,
} from '../../src/contracts/bookingSchemas';

const validBooking = {
  firstname: 'Component',
  lastname: 'Contract',
  totalprice: 0,
  depositpaid: false,
  bookingdates: { checkin: '2028-02-29', checkout: '2028-03-01' },
  additionalneeds: '',
};

test.describe('Contract schema components', () => {
  test('accepts valid leap-day booking and zero-value boundaries', () => {
    expect(bookingSchema.safeParse(validBooking).success).toBe(true);
  });

  for (const value of ['2026-02-30', '2026-13-01', 'not-a-date', '2026-1-1']) {
    test(`rejects invalid ISO calendar date ${value}`, () => {
      expect(isoDateSchema.safeParse(value).success).toBe(false);
    });
  }

  test('rejects negative price and empty required names', () => {
    const invalid = { ...validBooking, firstname: '', totalprice: -1 };
    expect(bookingSchema.safeParse(invalid).success).toBe(false);
  });

  test('rejects wrong primitive types', () => {
    const invalid = { ...validBooking, depositpaid: 'false', totalprice: '10' };
    expect(bookingSchema.safeParse(invalid).success).toBe(false);
  });

  test('rejects invalid creation identifiers', () => {
    expect(createdBookingSchema.safeParse({ bookingid: 0, booking: validBooking }).success).toBe(
      false,
    );
  });
});

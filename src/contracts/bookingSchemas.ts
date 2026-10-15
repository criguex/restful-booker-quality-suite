import { z } from 'zod';

export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const bookingSchema = z.object({
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  totalprice: z.number().nonnegative(),
  depositpaid: z.boolean(),
  bookingdates: z.object({
    checkin: isoDateSchema,
    checkout: isoDateSchema,
  }),
  additionalneeds: z.string(),
});

export const createdBookingSchema = z.object({
  bookingid: z.number().int().positive(),
  booking: bookingSchema,
});

export const bookingIdsSchema = z.array(
  z.object({ bookingid: z.number().int().positive() }).strict(),
);

export const authSuccessSchema = z.object({ token: z.string().regex(/^[a-f0-9]{15}$/) }).strict();
export const authFailureSchema = z.object({ reason: z.literal('Bad credentials') }).strict();

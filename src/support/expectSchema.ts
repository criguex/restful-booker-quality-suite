import { expect } from '@playwright/test';
import { z } from 'zod';

export function expectSchema<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  expect(
    result.success,
    result.success ? undefined : `Contract violations:\n${z.prettifyError(result.error)}`,
  ).toBeTruthy();
  if (!result.success) throw result.error;
  return result.data;
}

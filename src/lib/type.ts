import { z, type ZodType } from "zod/v4";

export type Integer = number & { __integer: true };
export function Integer(value: number) {
  if (!Number.isInteger(value)) {
    throw new Error(`Value ${value} is not an integer`);
  }
  return value as Integer;
}
export const zInteger = z.int() as unknown as ZodType<Integer>;

export type ReplaceNumberWithInteger<T> = T extends number ? Integer : T;

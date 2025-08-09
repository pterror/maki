/** Whether two types are exactly equal. */
export type IsEqual<X, Y> = (<T>() => T extends X ? true : false) extends <
  T
>() => T extends Y ? true : false
  ? true
  : false;

type RemoveUndefinedFromOptionalProperties<T> = {
  [K in keyof T]: Exclude<
    RemoveUndefinedFromOptionalProperties<T[K]>,
    undefined
  >;
};

export const removeUndefinedFromOptionalProperties = <T extends object>(
  object: T
): RemoveUndefinedFromOptionalProperties<T> => object as never;

/** Assert that a value is not `null` or `undefined`. */
export const assert = <T>(value: T | null | undefined, message?: string): T => {
  if (value == null) {
    throw new Error(message ?? "Value must not be `null` or `undefined`");
  }
  return value as T;
};

/**
 * Assert that a value is not `null` or `undefined`.
 * Requires the value to possibly be `null` or `undefined` in the type.
 */
export const assertStrict = <T>(
  value: T,
  ...[message]: null extends T
    ? [message?: string] // Okay, type contains `null`
    : undefined extends T
    ? [message?: string] // Okay, type contains `undefined`
    : // Type does not contain `null` or `undefined`
      [
        message: string | undefined, // Do not error on the `message` parameter
        Error: "The type",
        t: T,
        _: "already cannot be `null` or `undefined`"
      ]
): NonNullable<T> => {
  if (value == null) {
    throw new Error(message ?? "Value must not be `null` or `undefined`");
  }
  return value as NonNullable<T>;
};

/**
 * Get the keys of an object.
 * This is unsafe because objects may have extra properties that are not
 * defined in the type.
 */
export const unsafeKeys = <T extends object>(
  object: T
): readonly (keyof T)[] => {
  return Object.keys(object) as never;
};

/**
 * Get the values of an object.
 * This is unsafe because objects may have extra properties that are not
 * defined in the type.
 */
export const unsafeValues = <T extends object>(
  object: T
): readonly T[keyof T][] => {
  return Object.values(object) as never;
};

/**
 * Get the entries of an object.
 * This is unsafe because objects may have extra properties that are not
 * defined in the type.
 */
export const unsafeEntries = <T extends object>(
  object: T
): readonly NonNullable<{ [K in keyof T]: readonly [K, T[K]] }[keyof T]>[] => {
  return Object.entries(object) as never;
};

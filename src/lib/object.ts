import type { ReplaceNumberWithInteger } from "./type";

export function unsafeReplaceOptionalWithUndefined<T>(value: T): {
  [K in keyof T]-?: T[K];
} {
  return value as ReturnType<typeof unsafeReplaceOptionalWithUndefined<T>>;
}

export function unsafeReplaceNumberWithInteger<
  T,
  KeysToReplace extends keyof T = keyof T,
>(
  value: T,
): {
  [K in keyof T]: K extends KeysToReplace
    ? ReplaceNumberWithInteger<T[K]>
    : T[K];
} {
  return value as ReturnType<
    typeof unsafeReplaceNumberWithInteger<T, KeysToReplace>
  >;
}

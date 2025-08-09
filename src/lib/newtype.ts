export type Newtype<T, Name> = T & { readonly __type: Name };

export type UnwrapNewtype<T> = T extends { __type: infer Type }
  ? T extends Newtype<infer U, Type>
    ? U
    : never
  : never;

export const newtypeConstructor =
  <T>() =>
  (value: Omit<T, "__type"> & { readonly __type?: never }): T =>
    value as T;

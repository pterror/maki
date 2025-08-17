import type { Integer } from "./nodes/interfaceTypes";

export type ReplaceNumberWithInteger<T> = T extends number ? Integer : T;

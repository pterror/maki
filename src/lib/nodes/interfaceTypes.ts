import { BaklavaInterfaceTypes, NodeInterfaceType } from "baklavajs";
import type { JSONSchema } from "zod/v4/core";
import { reactive, type Reactive } from "vue";

export const interfaceTypesById = new Map<string, NodeInterfaceType<any>>();

const interfaceTypeNames = reactive(new Set<string>());
export const allInterfaceTypeNames: Reactive<ReadonlySet<string>> =
  interfaceTypeNames;
// TODO: Reconsider whether this constant is really a good architecture decision.
// It would be better to have a more explicit way to register derived types,
// for example by creating an event system where derived types can register themselves
// when a new core type is registered.
// The problem with that approach is that we still need to keep track of all the
// derived types somewhere.
export const allInterfaceTypesRegistriesNeedingDerivedTypes = new Set<
  WeakRef<BaklavaInterfaceTypes>
>();

export function unsafeAsOptionalNodeInterfaceType<T>(
  type: NodeInterfaceType<T>,
): NodeInterfaceType<T | undefined> {
  return type as NodeInterfaceType<T | undefined>;
}

let unknownType!: NodeInterfaceType<unknown>;
let unknownListType!: NodeInterfaceType<unknown[]>;
let unknownStringDictType!: NodeInterfaceType<Record<string, unknown>>;
export function setUnknownType(type: NodeInterfaceType<unknown>) {
  unknownType = type;
}
export function setUnknownListType(type: NodeInterfaceType<unknown[]>) {
  unknownListType = type;
}
export function setUnknownStringDictType(
  type: NodeInterfaceType<Record<string, unknown>>,
) {
  unknownStringDictType = type;
}

export interface NodeInterfaceTypeOptions {
  isList?: boolean;
  isStringDict?: boolean;
}

export function nodeInterfaceType<T>(
  name: string,
  jsonSchema: JSONSchema.JSONSchema,
  { isList = false, isStringDict = false }: NodeInterfaceTypeOptions = {},
): NodeInterfaceType<T> {
  const interfaceType = new NodeInterfaceType<T>(name);
  interfaceTypeNames.add(name);
  interfaceType.schema = jsonSchema;
  if (unknownType) {
    interfaceType.addConversion(unknownType, (v) => v);
  }
  if (isList && unknownListType) {
    interfaceType.addConversion(unknownListType, (v) => v as unknown[]);
  }
  if (isStringDict && unknownStringDictType) {
    interfaceType.addConversion(
      unknownStringDictType,
      (v) => v as Record<string, unknown>,
    );
  }
  return interfaceType;
}

const listTypeMapping = new WeakMap<
  NodeInterfaceType<any>,
  NodeInterfaceType<any[]>
>();
// This is useful to keep the keys around as long as the values are used.
const listTypeReverseMapping = new WeakMap<
  NodeInterfaceType<any[]>,
  NodeInterfaceType<any>
>();
const allListTypes = new Set<WeakRef<NodeInterfaceType<any[]>>>();

export function listType<T>(
  itemType: NodeInterfaceType<T>,
): NoInfer<NodeInterfaceType<T[]>> {
  const cached = listTypeMapping.get(itemType);
  if (cached) {
    return cached as NodeInterfaceType<T[]>;
  }
  const interfaceType = nodeInterfaceType<T[]>(
    `list[${itemType.name}]`,
    { type: "array", items: itemType.schema },
    { isList: true },
  );
  listTypeMapping.set(itemType, interfaceType);
  listTypeReverseMapping.set(interfaceType, itemType);
  allListTypes.add(new WeakRef(interfaceType));
  for (const typesRef of allInterfaceTypesRegistriesNeedingDerivedTypes) {
    const types = typesRef.deref();
    if (!types) continue;
    types.addTypes(interfaceType);
  }
  return interfaceType;
}

export function lookupBaseTypeOfListType<T>(
  listType: NodeInterfaceType<T[]>,
): NodeInterfaceType<T> {
  // The base type must exist because we created it when creating the list type.
  return listTypeReverseMapping.get(listType)!;
}

export function getAllListTypes(): NodeInterfaceType<any[]>[] {
  return [...allListTypes].flatMap((ref) => {
    const value = ref.deref();
    return value ? [value] : [];
  });
}

const stringDictTypeMapping = new WeakMap<
  NodeInterfaceType<any>,
  NodeInterfaceType<Record<string, any>>
>();
const stringDictTypeReverseMapping = new WeakMap<
  NodeInterfaceType<Record<string, any>>,
  NodeInterfaceType<any>
>();
const allStringDictTypes = new Set<
  WeakRef<NodeInterfaceType<Record<string, any>>>
>();

export function stringDictType<V>(
  valueType: NodeInterfaceType<V>,
): NoInfer<NodeInterfaceType<Record<string, V>>> {
  const cached = stringDictTypeMapping.get(valueType);
  if (cached) {
    return cached as NodeInterfaceType<Record<string, V>>;
  }
  const interfaceType = nodeInterfaceType<Record<string, V>>(
    `stringDict[${valueType.name}]`,
    { type: "object", additionalProperties: valueType.schema },
    { isStringDict: true },
  );
  stringDictTypeMapping.set(valueType, interfaceType);
  stringDictTypeReverseMapping.set(interfaceType, valueType);
  allStringDictTypes.add(new WeakRef(interfaceType));
  for (const typesRef of allInterfaceTypesRegistriesNeedingDerivedTypes) {
    const types = typesRef.deref();
    if (!types) continue;
    types.addTypes(interfaceType);
  }
  return interfaceType;
}

export function lookupBaseTypeOfStringDictType<V>(
  dictType: NodeInterfaceType<Record<string, V>>,
): NodeInterfaceType<V> {
  // The base type must exist because we created it when creating the dict type.
  return stringDictTypeReverseMapping.get(dictType)!;
}

export function getAllStringDictTypes(): NodeInterfaceType<
  Record<string, any>
>[] {
  return [...allStringDictTypes].flatMap((ref) => {
    const value = ref.deref();
    return value ? [value] : [];
  });
}

export function registerDerivedInterfaceTypes(
  types: BaklavaInterfaceTypes,
): void {
  for (const type of getAllListTypes()) {
    types.addTypes(type);
  }
  for (const type of getAllStringDictTypes()) {
    types.addTypes(type);
  }
  allInterfaceTypesRegistriesNeedingDerivedTypes.add(new WeakRef(types));
}

import {
  BaklavaInterfaceTypes,
  ButtonInterface,
  CheckboxInterface,
  Editor,
  IntegerInterface,
  NodeInterface,
  NodeInterfaceType,
  NumberInterface,
  SelectInterface,
  setType,
  SliderInterface,
  TextareaInputInterface,
  TextInputInterface,
  TextInterface,
  type BaklavaInterfaceTypesOptions,
  type SelectInterfaceItem,
} from "baklavajs";
import { toJSONSchema, z, type ZodType } from "zod/v4";
import { zInstanceof } from "./zodHelpers";
import { registerCoreType, upsertBaklavaType } from "./baklava";
import type { JSONSchema } from "zod/v4/core";

// TODO: Reconsider whether this constant is really a good architecture decision.
// It would be better to have a more explicit way to register derived types,
// for example by creating an event system where derived types can register themselves
// when a new core type is registered.
// The problem with that approach is that we still need to keep track of all the
// derived types somewhere.
export const allInterfaceTypesRegistriesNeedingDerivedTypes = new Set<
  WeakRef<BaklavaInterfaceTypes>
>();

export type Integer = number & { __integer: true };
export function Integer(value: number) {
  if (!Number.isInteger(value)) {
    throw new Error(`Value ${value} is not an integer`);
  }
  return value as Integer;
}

export function unsafeAsOptionalNodeInterfaceType<T>(
  type: NodeInterfaceType<T>,
): NodeInterfaceType<T | undefined> {
  return type as NodeInterfaceType<T | undefined>;
}

export let unknownType!: NodeInterfaceType<unknown>;
export let unknownListType!: NodeInterfaceType<unknown[]>;
export let unknownStringDictType!: NodeInterfaceType<Record<string, unknown>>;

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

export function withCustomJsonSchemaFormat<T extends ZodType>(
  type: T,
  format: string,
) {
  type._zod.toJSONSchema = () => ({ format });
  return type;
}

export const zInteger = z.int() as unknown as ZodType<Integer>;
unknownType = registerCoreType(z.unknown(), "unknown");
export const undefinedType = registerCoreType(
  withCustomJsonSchemaFormat(z.undefined(), "undefined"),
  "undefined",
);
export const stringType = registerCoreType(z.string(), "string");
export const integerType = registerCoreType(zInteger, "integer");
export const numberType = registerCoreType(z.number(), "number");
export const bigintType = registerCoreType(
  withCustomJsonSchemaFormat(z.bigint(), "bigint"),
  "bigint",
);
export const booleanType = registerCoreType(z.boolean(), "boolean");
export const dateType = registerCoreType(zInstanceof(Date), "date");
export const regexType = registerCoreType(zInstanceof(RegExp), "regex");

integerType.addConversion(numberType, (v) => v);

export function registerCoreInterfaceTypes(
  editor: Editor,
  options: Required<BaklavaInterfaceTypesOptions>,
) {
  const types = new BaklavaInterfaceTypes(editor, options);
  types.addTypes(
    ...(unknownType ? [unknownType] : []),
    undefinedType,
    stringType,
    integerType,
    numberType,
    booleanType,
    dateType,
    regexType,
  );
  return types;
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

export function buttonInterface(name: string, callback: () => void) {
  return new ButtonInterface(name, callback).use(setType, undefinedType);
}

export function textInterface(name: string, defaultValue = "") {
  return new TextInterface(name, defaultValue)
    .use(setType, stringType)
    .setPort(true);
}

export function textInputInterface(name: string, defaultValue = "") {
  return new TextInputInterface(name, defaultValue).use(setType, stringType);
}

export function textareaInputInterface(name: string, defaultValue = "") {
  return new TextareaInputInterface(name, defaultValue).use(
    setType,
    stringType,
  );
}

export function numberInterface(name: string, defaultValue = 0) {
  return new NumberInterface(name, defaultValue).use(setType, numberType);
}

export function integerInterface(name: string, defaultValue = Integer(0)) {
  return new IntegerInterface(name, defaultValue).use(
    setType,
    integerType as unknown as NodeInterfaceType<number>,
  );
}

export function sliderInterface(
  name: string,
  defaultValue: number,
  min: number,
  max: number,
) {
  return new SliderInterface(name, defaultValue, min, max).use(
    setType,
    numberType,
  );
}

export function checkboxInterface(name: string, defaultValue = false) {
  return new CheckboxInterface(name, defaultValue).use(setType, booleanType);
}

export function selectInterface<T>(
  name: string,
  type: NodeInterfaceType<T>,
  options: SelectInterfaceItem<T>[],
  defaultValue: NoInfer<T> = (typeof options[0] === "object" &&
  "value" in options[0]
    ? options[0].value
    : options[0]) as T,
) {
  return new SelectInterface(name, defaultValue, options).use(setType, type);
}

export function nodeInterface<T>(
  name: string,
  type: NodeInterfaceType<T>,
  defaultValue: NoInfer<T> = undefined!,
) {
  return new NodeInterface(name, defaultValue).use(setType, type);
}

unknownListType = upsertBaklavaType(
  toJSONSchema(z.array(z.unknown())),
) as never;
unknownStringDictType = upsertBaklavaType(
  toJSONSchema(z.record(z.string(), z.unknown())),
) as never;

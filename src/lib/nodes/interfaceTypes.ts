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
import {
  toNormalizedJsonSchema,
  withCustomJsonSchemaFormat,
} from "./zodHelpers.ts";
import { Integer, zInteger } from "../type.ts";
import { z, ZodType } from "zod/v4";
import type { JSONSchema } from "zod/v4/core";
import { reactive, type Reactive } from "vue";

export const coreTypeNames = new Set<string>();
export const interfaceTypesById = new Map<string, NodeInterfaceType<any>>();

export function registerCoreType<T extends ZodType>(type: T, name: string) {
  const jsonSchema = toNormalizedJsonSchema(type);
  const id = JSON.stringify(jsonSchema);
  if (interfaceTypesById.has(id)) {
    throw new Error(
      `A core type with the same schema as ${name} is already registered.`,
    );
  }
  const interfaceType = nodeInterfaceType<z.infer<T>>(name, jsonSchema);
  coreTypeNames.add(name);
  interfaceTypesById.set(id, interfaceType);
  return interfaceType;
}

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

unknownType = registerCoreType(z.unknown(), "unknown");
unknownListType = registerCoreType(z.array(z.unknown()), "list[unknown]");
unknownStringDictType = registerCoreType(
  z.record(z.string(), z.unknown()),
  "stringDict[unknown]",
);
const undefinedType = registerCoreType(
  withCustomJsonSchemaFormat(z.undefined(), "undefined"),
  "undefined",
);
const stringType = registerCoreType(z.string(), "string");
const integerType = registerCoreType(zInteger, "integer");
const numberType = registerCoreType(z.number(), "number");
const booleanType = registerCoreType(z.boolean(), "boolean");

integerType.addConversion(numberType, (v) => v);

export function registerCoreInterfaceTypes(
  editor: Editor,
  options: Required<BaklavaInterfaceTypesOptions>,
) {
  const types = new BaklavaInterfaceTypes(editor, options);
  types.addTypes(
    unknownType!,
    unknownListType!,
    unknownStringDictType!,
    undefinedType,
    stringType,
    integerType,
    numberType,
    booleanType,
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

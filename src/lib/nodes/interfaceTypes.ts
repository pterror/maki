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
import { defineListNode, defineStringDictNode } from "./core";
import { z, type ZodType } from "zod/v4";
import { zInstanceof } from "./zodHelpers";
import { registerCoreType } from "./baklava";

const allInterfaceTypesRegistriesNeedingDerivedTypes = new Set<
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

export const unknownType = new NodeInterfaceType<unknown>("unknown");
// It should behave like `any`, but we do not want to hide type errors.
export const anyType = new NodeInterfaceType<unknown>("any");
anyType.addConversion(unknownType, (v) => v);
unknownType.addConversion(anyType, (v) => v);

export function nodeInterfaceType<T>(name: string): NodeInterfaceType<T> {
  const interfaceType = new NodeInterfaceType<T>(name);
  interfaceType.addConversion(unknownType, (v) => v);
  interfaceType.addConversion(anyType, (v) => v);
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
  const interfaceType = nodeInterfaceType<T[]>(`array[${itemType.name}]`);
  listTypeMapping.set(itemType, interfaceType);
  listTypeReverseMapping.set(interfaceType, itemType);
  allListTypes.add(new WeakRef(interfaceType));
  for (const typesRef of allInterfaceTypesRegistriesNeedingDerivedTypes) {
    const types = typesRef.deref();
    if (!types) continue;
    types.addTypes(interfaceType);
  }
  defineListNode(itemType, interfaceType, { category: "Derived Types" });
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
  );
  stringDictTypeMapping.set(valueType, interfaceType);
  stringDictTypeReverseMapping.set(interfaceType, valueType);
  allStringDictTypes.add(new WeakRef(interfaceType));
  for (const typesRef of allInterfaceTypesRegistriesNeedingDerivedTypes) {
    const types = typesRef.deref();
    if (!types) continue;
    types.addTypes(interfaceType);
  }
  defineStringDictNode(valueType, interfaceType, { category: "Derived Types" });
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

registerCoreType(z.unknown(), "unknown");
registerCoreType(z.any(), "any");
export const undefinedType = registerCoreType(
  withCustomJsonSchemaFormat(z.undefined(), "undefined"),
  "undefined",
);
export const stringType = registerCoreType(z.string(), "string");
export const integerType = registerCoreType(
  z.int() as unknown as ZodType<Integer>,
  "integer",
);
export const numberType = registerCoreType(z.number(), "number");
export const bigintType = registerCoreType(
  withCustomJsonSchemaFormat(z.bigint(), "bigint"),
  "bigint",
);
export const booleanType = registerCoreType(z.boolean(), "boolean");
export const dateType = registerCoreType(zInstanceof(Date), "date");
export const regexType = registerCoreType(zInstanceof(RegExp), "regex");

// Only `any` is allowed to have unsafe conversions.
anyType.addConversion(undefinedType, (v) => {
  if (v !== undefined) {
    throw new Error(`Cannot convert value '${JSON.stringify(v)}' to undefined`);
  }
  return v;
});
anyType.addConversion(stringType, (v) => {
  if (typeof v !== "string") {
    throw new Error(`Cannot convert value '${JSON.stringify(v)}' to string`);
  }
  return v;
});
anyType.addConversion(integerType, (v) => {
  if (typeof v !== "number" || !Number.isInteger(v)) {
    throw new Error(`Cannot convert value '${JSON.stringify(v)}' to integer`);
  }
  return Integer(v);
});
anyType.addConversion(numberType, (v) => {
  if (typeof v !== "number") {
    throw new Error(`Cannot convert value '${JSON.stringify(v)}' to number`);
  }
  return v;
});
anyType.addConversion(bigintType, (v) => {
  if (typeof v !== "bigint") {
    throw new Error(`Cannot convert value '${JSON.stringify(v)}' to bigint`);
  }
  return v;
});
anyType.addConversion(booleanType, (v) => {
  if (typeof v !== "boolean") {
    throw new Error(`Cannot convert value '${JSON.stringify(v)}' to boolean`);
  }
  return v;
});
integerType.addConversion(numberType, (v) => v);

export function registerCoreInterfaceTypes(
  editor: Editor,
  options: Required<BaklavaInterfaceTypesOptions>,
) {
  const nodeInterfaceTypes = new BaklavaInterfaceTypes(editor, options);
  nodeInterfaceTypes.addTypes(
    unknownType,
    anyType,
    undefinedType,
    stringType,
    integerType,
    numberType,
    booleanType,
    dateType,
    regexType,
  );
  return nodeInterfaceTypes;
}

export function registerDerivedInterfaceTypes(
  interfaceTypes: BaklavaInterfaceTypes,
): void {
  for (const type of getAllListTypes()) {
    interfaceTypes.addTypes(type);
  }
  for (const type of getAllStringDictTypes()) {
    interfaceTypes.addTypes(type);
  }
  allInterfaceTypesRegistriesNeedingDerivedTypes.add(
    new WeakRef(interfaceTypes),
  );
}

export function buttonInterface(name: string, callback: () => void) {
  return new ButtonInterface(name, callback).use(setType, undefinedType);
}

export function textInterface(name: string, defaultValue: string = undefined!) {
  return new TextInterface(name, defaultValue).use(setType, stringType);
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
  return new IntegerInterface(name, defaultValue).use(setType, integerType);
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
  defaultValue: NoInfer<T> = undefined!,
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

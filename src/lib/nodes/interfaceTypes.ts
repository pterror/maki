import {
  BaklavaInterfaceTypes,
  ButtonInterface,
  CheckboxInterface,
  defineNode,
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
  allEditorsNeedingDerivedNodes,
  defineListNode,
  defineStringDictNode,
} from "./core";
import {
  toJSONSchema,
  z,
  ZodIntersection,
  ZodObject,
  ZodUnion,
  type ZodType,
} from "zod/v4";
import { camelCaseToPascalCase, camelCaseToTitleCase } from "../string";
import { unsafeEntries } from "../core";

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

const zodTypesMap = new Map<string, NodeInterfaceType<any>>();

function registerCoreType<T extends ZodType>(type: T, name: string) {
  const id = JSON.stringify(toJSONSchema(type));
  const interfaceType = nodeInterfaceType<z.infer<T>>(name);
  zodTypesMap.set(id, interfaceType);
  return interfaceType;
}

export const undefinedType = registerCoreType(z.undefined(), "undefined");
export const stringType = registerCoreType(z.string(), "string");
export const integerType = registerCoreType(
  z.int() as unknown as ZodType<Integer>,
  "integer",
);
export const numberType = registerCoreType(z.number(), "number");
export const bigintType = registerCoreType(z.bigint(), "bigint");
export const booleanType = registerCoreType(z.boolean(), "boolean");
export const dateType = registerCoreType(
  z.instanceof(Date).meta({ title: "Date", id: "Date" }),
  "date",
);
export const regexType = registerCoreType(
  z.instanceof(RegExp).meta({ title: "RegExp", id: "RegExp" }),
  "regex",
);

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

export function textInputInterface(
  name: string,
  defaultValue: string = undefined!,
) {
  return new TextInputInterface(name, defaultValue).use(setType, stringType);
}

export function textareaInputInterface(
  name: string,
  defaultValue: string = undefined!,
) {
  return new TextareaInputInterface(name, defaultValue).use(
    setType,
    stringType,
  );
}

export function numberInterface(
  name: string,
  defaultValue: number = undefined!,
) {
  return new NumberInterface(name, defaultValue).use(setType, numberType);
}

export function integerInterface(
  name: string,
  defaultValue: Integer = undefined!,
) {
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

export function checkboxInterface(
  name: string,
  defaultValue: boolean = undefined!,
) {
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

export function upsertBaklavaType<T extends ZodType>(type: T) {
  const id = JSON.stringify(toJSONSchema(type));
  const existing = zodTypesMap.get(id);
  const typeName = z.globalRegistry.get(type)?.title;
  if (typeName === undefined) {
    console.error("Issue with Zod type:", type);
    throw new Error("This Zod type is missing a name.");
  }
  if (existing) {
    if (typeName !== existing.name) {
      throw new Error(
        `Zod type name mismatch. New name '${typeName}' does not match existing name '${existing.name}'.`,
      );
    }
    return existing;
  }
  const interfaceType = nodeInterfaceType<z.infer<T>>(typeName);
  zodTypesMap.set(id, interfaceType);
  if (type instanceof ZodObject) {
    const ConstructNode = defineNode({
      type: `Construct${camelCaseToPascalCase(typeName)}Node`,
      inputs: Object.fromEntries(
        unsafeEntries(type.shape).map(([key, value]) => [
          key,
          () =>
            // FIXME: checkboxinterface etc. as appropriate
            nodeInterface(camelCaseToTitleCase(key), upsertBaklavaType(value)),
        ]),
      ),
      outputs: {
        value: () => nodeInterface("Value", interfaceType),
      },
    });
    function registerConstructNode(editor: Editor) {
      editor.registerNodeType(ConstructNode, {
        category: "Object Construction",
      });
    }
    const DeconstructNode = defineNode({
      type: `Deconstruct${camelCaseToPascalCase(typeName)}Node`,
      inputs: {
        value: () => nodeInterface("Value", interfaceType),
      },
      outputs: Object.fromEntries(
        unsafeEntries(type.shape).map(
          ([key, value]: readonly [key: string, value: ZodType]) => [
            key,
            () =>
              nodeInterface(
                camelCaseToTitleCase(key),
                upsertBaklavaType(value),
              ),
          ],
        ),
      ),
    });
    function registerDeconstructNode(editor: Editor) {
      editor.registerNodeType(DeconstructNode, {
        category: "Object Deconstruction",
      });
    }
    for (const editor of allEditorsNeedingDerivedNodes) {
      const editorInstance = editor.deref();
      if (!editorInstance) continue;
      registerConstructNode(editorInstance);
      registerDeconstructNode(editorInstance);
    }
  }
  if (type instanceof ZodUnion) {
    for (const member of type.options) {
      const memberInterfaceType = upsertBaklavaType(member as ZodType);
      memberInterfaceType.addConversion(interfaceType, (v) => v);
    }
  }
  if (type instanceof ZodIntersection) {
    const leftInterfaceType = upsertBaklavaType(type.def.left as ZodType);
    interfaceType.addConversion(leftInterfaceType, (v) => v);
    const rightInterfaceType = upsertBaklavaType(type.def.right as ZodType);
    interfaceType.addConversion(rightInterfaceType, (v) => v);
  }
  return interfaceType;
}

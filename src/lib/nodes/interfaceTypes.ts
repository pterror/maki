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
  type IBaklavaViewModel,
  type SelectInterfaceItem,
} from "baklavajs";

export type Integer = number & { __integer: true };
export function Integer(value: number) {
  if (!Number.isInteger(value)) {
    throw new Error(`Value ${value} is not an integer`);
  }
  return value as Integer;
}

export function unsafeAsOptionalNodeInterfaceType<T>(
  type: NodeInterfaceType<T>
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

export function listNodeInterfaceType<T>(
  itemType: NodeInterfaceType<T>
): NodeInterfaceType<T[]> {
  const interfaceType = nodeInterfaceType<T[]>(`array[${itemType.name}]`);
  interfaceType.addConversion(unknownType, (v) => v);
  interfaceType.addConversion(anyType, (v) => v);
  return interfaceType;
}

export function stringDictNodeInterfaceType<V>(
  valueType: NodeInterfaceType<V>
): NodeInterfaceType<Record<string, V>> {
  const interfaceType = nodeInterfaceType<Record<string, V>>(
    `stringDict[${valueType.name}]`
  );
  interfaceType.addConversion(unknownType, (v) => v);
  interfaceType.addConversion(anyType, (v) => v);
  return interfaceType;
}

export const undefinedType = nodeInterfaceType<undefined>("undefined");
export const stringType = nodeInterfaceType<string>("string");
export const integerType = nodeInterfaceType<Integer>("integer");
export const numberType = nodeInterfaceType<number>("number");
export const bigintType = nodeInterfaceType<bigint>("bigint");
export const booleanType = nodeInterfaceType<boolean>("boolean");
export const stringListType = listNodeInterfaceType(stringType);
export const integerListType = listNodeInterfaceType(integerType);
export const numberListType = listNodeInterfaceType(numberType);
export const booleanListType = listNodeInterfaceType(booleanType);

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
  viewPlugin?: IBaklavaViewModel
) {
  const nodeInterfaceTypes = new BaklavaInterfaceTypes(editor, { viewPlugin });
  nodeInterfaceTypes.addTypes(
    undefinedType,
    stringType,
    integerType,
    numberType,
    booleanType,
    unknownType,
    anyType,
    stringListType,
    integerListType,
    numberListType,
    booleanListType
  );
  return nodeInterfaceTypes;
}

export function buttonInterface(name: string, callback: () => void) {
  return new ButtonInterface(name, callback).use(setType, undefinedType);
}

export function textInterface(name: string, defaultValue = "") {
  return new TextInterface(name, defaultValue).use(setType, stringType);
}

export function textInputInterface(name: string, defaultValue = "") {
  return new TextInputInterface(name, defaultValue).use(setType, stringType);
}

export function textareaInputInterface(name: string, defaultValue = "") {
  return new TextareaInputInterface(name, defaultValue).use(
    setType,
    stringType
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
  defaultValue = 0,
  min = 0,
  max = 100
) {
  return new SliderInterface(name, defaultValue, min, max).use(
    setType,
    numberType
  );
}

export function checkboxInterface(name: string, defaultValue = false) {
  return new CheckboxInterface(name, defaultValue).use(setType, booleanType);
}

export function selectInterface<T>(
  name: string,
  defaultValue: T,
  type: NodeInterfaceType<T>,
  options: SelectInterfaceItem<T>[]
) {
  return new SelectInterface(name, defaultValue, options).use(setType, type);
}

export function nodeInterface<T>(
  name: string,
  defaultValue: T,
  type: NodeInterfaceType<T>
) {
  return new NodeInterface(name, defaultValue).use(setType, type);
}

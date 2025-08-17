import { z } from "zod/v4";
import {
  Integer as UpstreamInteger,
  listNodeInterfaceType,
  nodeInterfaceType,
  stringDictNodeInterfaceType,
} from "./interfaceTypes";
import { defineListNode, defineStringDictNode } from "./core";
import type { BaklavaInterfaceTypes, Editor } from "baklavajs";

export const zodShape = (schema: z.ZodType): Record<string, z.ZodType> =>
  schema instanceof z.ZodObject ? schema.shape : {};

export const zFunction = <
  T extends (...args: never) => unknown = (...args: never) => unknown,
>() => z.custom<T>((x) => typeof x === "function");

export const Integer = z.custom<UpstreamInteger>(
  (x) => typeof x === "number" && Number.isInteger(x)
);

export const Schema = z.custom<z.ZodType>().meta({
  title: "Schema",
  description:
    "A schema that can be used to define the input and output schemas of tools.",
});
export type Schema = z.infer<typeof Schema>;

export const schemaType = nodeInterfaceType<Schema>("Schema");
export const schemaListType = listNodeInterfaceType<Schema>(schemaType);
export const schemaStringDictType =
  stringDictNodeInterfaceType<Schema>(schemaType);

export const JSONValue = z
  .union([
    z.null(),
    z.string(),
    z.number(),
    z.boolean(),
    z.record(
      z.string(),
      z.lazy((): z.ZodType<JSONValue> => JSONValue)
    ),
    z.array(z.lazy((): z.ZodType<JSONValue> => JSONValue)),
  ])
  .describe(
    "A JSON value can be a string, number, boolean, object, array, or `null`. JSON values can be serialized and deserialized by the `JSON.stringify` and `JSON.parse` methods."
  );
export type JSONValue =
  | null
  | string
  | number
  | boolean
  | { [key: string]: JSONValue }
  | JSONValue[];
export const jsonValueType = nodeInterfaceType<JSONValue>("JSONValue");
export const jsonValueStringDictType =
  stringDictNodeInterfaceType<JSONValue>(jsonValueType);
export const jsonValueStringDictStringDictType = stringDictNodeInterfaceType<
  Record<string, JSONValue>
>(jsonValueStringDictType);

export const JSONArray = z.array(JSONValue);
export type JSONArray = z.infer<typeof JSONArray>;
export const jsonValueListType =
  listNodeInterfaceType<JSONValue>(jsonValueType);

export const { node: JSONValueListNode, register: registerJSONValueListNode } =
  defineListNode(jsonValueType, jsonValueListType, () => null, {
    category: "JSON",
  });

export const {
  node: JSONValueStringDictNode,
  register: registerJSONValueStringDictNode,
} = defineStringDictNode(jsonValueType, jsonValueStringDictType, () => null, {
  category: "JSON",
});

export const {
  node: JSONValueStringDictStringDictNode,
  register: registerJSONValueStringDictStringDictNode,
} = defineStringDictNode(
  jsonValueStringDictType,
  jsonValueStringDictStringDictType,
  () => ({}),
  { category: "JSON" }
);

export function registerSharedTypesInterfaceTypes(
  types: BaklavaInterfaceTypes
) {
  types.addTypes(
    schemaType,
    schemaListType,
    schemaStringDictType,
    jsonValueType,
    jsonValueListType,
    jsonValueStringDictType,
    jsonValueStringDictStringDictType
  );
}

export function registerSharedTypesNodes(editor: Editor) {
  registerJSONValueListNode(editor);
  registerJSONValueStringDictNode(editor);
  registerJSONValueStringDictStringDictNode(editor);
}

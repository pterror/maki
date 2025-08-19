import { z } from "zod/v4";
import {
  Integer as UpstreamInteger,
  nodeInterfaceType,
} from "./interfaceTypes";
import type { BaklavaInterfaceTypes } from "baklavajs";

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

export const JSONArray = z.array(JSONValue);
export type JSONArray = z.infer<typeof JSONArray>;

export function registerSharedTypesInterfaceTypes(
  types: BaklavaInterfaceTypes
) {
  types.addTypes(schemaType, jsonValueType);
}

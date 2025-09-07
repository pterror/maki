import { z } from "zod/v4";
import { nodeInterfaceType } from "./interfaceTypes";
import type { Schema } from "./zodHelpers";

export const schemaType = nodeInterfaceType<Schema>("Schema", {
  format: "zod-schema",
});

export const JSONValue = z
  .union([
    z.null(),
    z.string(),
    z.number(),
    z.boolean(),
    z.record(
      z.string(),
      z.lazy((): z.ZodType<JSONValue> => JSONValue),
    ),
    z.array(z.lazy((): z.ZodType<JSONValue> => JSONValue)),
  ])
  .describe(
    "A JSON value can be a string, number, boolean, object, array, or `null`. JSON values can be serialized and deserialized by the `JSON.stringify` and `JSON.parse` methods.",
  );
export type JSONValue =
  | null
  | string
  | number
  | boolean
  | { [key: string]: JSONValue }
  | JSONValue[];
export const jsonValueType = nodeInterfaceType<JSONValue>("JSONValue", {
  format: "json-value",
});

export const JSONArray = z.array(JSONValue);
export type JSONArray = z.infer<typeof JSONArray>;

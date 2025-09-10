import { z } from "zod/v4";
import { zCustom } from "./zodHelpers.ts";
import type { JSONSchema } from "zod/v4/core";

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

export const JSONArray = z.array(JSONValue);
export type JSONArray = z.infer<typeof JSONArray>;

export const Schema = zCustom<JSONSchema.JSONSchema>("json-schema").meta({
  title: "JSON Schema",
  description:
    "A schema that can be used to define the input and output schemas of tools.",
});
export type Schema = z.infer<typeof Schema>;

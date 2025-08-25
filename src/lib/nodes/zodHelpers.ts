import type { JSONSchema } from "zod/v4/core";
import {
  withCustomJsonSchemaFormat,
  Integer as UpstreamInteger,
} from "./interfaceTypes";
import { toJSONSchema, z, type ZodType } from "zod/v4";
import { unsafeEntries } from "../core";

export function normalizeJsonSchema(schema: JSONSchema.JSONSchema) {
  delete schema.$schema;
  delete schema.description;
  switch (schema.type) {
    case "object":
      if (schema.properties) {
        for (const [, childSchema] of unsafeEntries(schema.properties)) {
          if (typeof childSchema === "boolean") continue;
          normalizeJsonSchema(childSchema);
        }
      }
      break;
    case "array":
      if (Array.isArray(schema.items)) {
        for (const childSchema of schema.items) {
          if (typeof childSchema === "boolean") continue;
          normalizeJsonSchema(childSchema);
        }
      } else if (typeof schema.items === "object") {
        normalizeJsonSchema(schema.items);
      }
      break;
  }
  if (schema.allOf) {
    for (const childSchema of schema.allOf) {
      normalizeJsonSchema(childSchema);
    }
  }
  if (schema.anyOf) {
    for (const childSchema of schema.anyOf) {
      normalizeJsonSchema(childSchema);
    }
  }
  return schema;
}

export function toNormalizedJsonSchema(schema: z.ZodType) {
  return normalizeJsonSchema(toJSONSchema(schema));
}

export const zodShape = (schema: z.ZodType): Record<string, z.ZodType> =>
  schema instanceof z.ZodObject ? schema.shape : {};

export const zInstanceof = <Class extends typeof z.core.util.Class>(
  ctor: Class,
  name?: string,
) =>
  withCustomJsonSchemaFormat(z.instanceof(ctor), name ?? ctor.name).meta({
    title: name ?? ctor.name,
  });

export const zCustom = <T>(
  name: string,
  predicate?: (value: unknown) => boolean,
) =>
  withCustomJsonSchemaFormat(z.custom<T>(predicate), name).meta({
    title: name,
  });

export const zFunction = <
  T extends (...args: never) => unknown = (...args: never) => unknown,
>() => zCustom<T>("function", (x) => typeof x === "function");

export const Integer = z.int() as unknown as ZodType<UpstreamInteger>;
// TODO: Consider whether zod schemas are required, or whether JSON Schemas should be used directly.

export const Schema = zCustom<z.ZodType>("zod-schema").meta({
  title: "Schema",
  description:
    "A schema that can be used to define the input and output schemas of tools.",
});
export type Schema = z.infer<typeof Schema>;

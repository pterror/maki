import type { JSONSchema } from "zod/v4/core";
import { toJSONSchema, z, type ZodType } from "zod/v4";
import { unsafeEntries } from "../core.ts";

export function normalizeJsonSchema(schema: JSONSchema.JSONSchema) {
  delete schema.$schema;
  delete schema.description;
  delete schema["x-generic"];
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

export function zodShape(schema: z.ZodType): Record<string, z.ZodType> {
  return schema instanceof z.ZodObject ? schema.shape : {};
}

export function zInstanceof<Class extends typeof z.core.util.Class>(
  ctor: Class,
  name?: string,
) {
  return withCustomJsonSchemaFormat(z.instanceof(ctor), name ?? ctor.name).meta(
    { title: name ?? ctor.name },
  );
}

export function zCustom<T>(
  name: string,
  predicate?: (value: unknown) => boolean,
) {
  return withCustomJsonSchemaFormat(z.custom<T>(predicate), name).meta({
    title: name,
  });
}

export function zFunction<
  T extends (...args: never) => unknown = (...args: never) => unknown,
>() {
  return zCustom<T>("function", (x) => typeof x === "function");
}

export function zFormattedString(format: string) {
  const result = z.string();
  result._zod.bag.format = format;
  result.format = format;
  return result;
}

export function withCustomJsonSchemaFormat<T extends ZodType>(
  type: T,
  format: string,
) {
  type._zod.toJSONSchema = () => ({ format });
  return type;
}

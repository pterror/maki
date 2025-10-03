import type { JSONSchema } from "zod/v4/core";
import { toJSONSchema, z, type ZodType } from "zod/v4";
import { unsafeEntries } from "../core.ts";

export function normalizeJsonSchema(schema: JSONSchema.JSONSchema) {
  delete schema.$schema;
  delete schema.description;
  delete schema["x-generic"];
  switch (schema.type) {
    case "object": {
      if (schema.properties) {
        for (const [, childSchema] of unsafeEntries(schema.properties)) {
          if (typeof childSchema === "boolean") continue;
          normalizeJsonSchema(childSchema);
        }
      }
      if (schema.additionalProperties === true) {
        delete schema.additionalProperties;
      }
      if (Object.keys(schema.properties ?? {}).length === 0) {
        delete schema.properties;
      }
      if (schema.required?.length === 0) {
        delete schema.required;
      }
      if (schema.minProperties === 0) {
        delete schema.minProperties;
      }
      if (Object.keys(schema).length === 1 && schema.type === "object") {
        delete schema.type;
      }
      break;
    }
    case "array": {
      if (Array.isArray(schema.items)) {
        for (const childSchema of schema.items) {
          if (typeof childSchema === "boolean") continue;
          normalizeJsonSchema(childSchema);
        }
      } else if (typeof schema.items === "object") {
        normalizeJsonSchema(schema.items);
      }
      if (schema.minItems === 0) {
        delete schema.minItems;
      }
      break;
    }
    case "integer": {
      if (
        schema.minimum === Number.MIN_SAFE_INTEGER &&
        schema.maximum === Number.MAX_SAFE_INTEGER
      ) {
        delete schema.minimum;
        delete schema.maximum;
      }
      break;
    }
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

import type { JSONSchema } from "zod/v4/core";

export function recursivelyWalkSchema(
  schema: JSONSchema._JSONSchema,
  callback: (schema: JSONSchema._JSONSchema) => "skip" | "stop" | undefined,
): "skip" | "stop" | undefined {
  const result = callback(schema);
  if (result === "stop") return "stop";
  if (result === "skip") return;
  if (typeof schema === "boolean") return;
  if (schema.additionalItems) {
    if (recursivelyWalkSchema(schema.additionalItems, callback) === "stop") {
      return "stop";
    }
  }
  if (schema.additionalProperties) {
    if (
      recursivelyWalkSchema(schema.additionalProperties, callback) === "stop"
    ) {
      return "stop";
    }
  }
  if (schema.oneOf) {
    for (const member of schema.oneOf) {
      if (recursivelyWalkSchema(member, callback) === "stop") {
        return "stop";
      }
    }
  }
  if (schema.anyOf) {
    for (const member of schema.anyOf) {
      if (recursivelyWalkSchema(member, callback) === "stop") {
        return "stop";
      }
    }
  }
  if (schema.allOf) {
    for (const member of schema.allOf) {
      if (recursivelyWalkSchema(member, callback) === "stop") {
        return "stop";
      }
    }
  }
  if (schema.not) {
    if (recursivelyWalkSchema(schema.not, callback) === "stop") {
      return "stop";
    }
  }
  switch (schema.type) {
    case "array": {
      if (schema.items) {
        if (Array.isArray(schema.items)) {
          for (const item of schema.items) {
            if (recursivelyWalkSchema(item, callback) === "stop") {
              return "stop";
            }
          }
        } else {
          if (recursivelyWalkSchema(schema.items, callback) === "stop") {
            return "stop";
          }
        }
      }
      break;
    }
    case "object": {
      if (schema.properties) {
        for (const property of Object.values(schema.properties)) {
          if (recursivelyWalkSchema(property, callback) === "stop") {
            return "stop";
          }
        }
      }
      break;
    }
    case "string":
    case "number":
    case "integer":
    case "boolean":
    case "null":
    case undefined: {
      // Primitive types do not contain other schemas.
      break;
    }
  }
  return;
}

export function recursivelyWalkSchemasInSync(
  referenceSchema: JSONSchema._JSONSchema,
  schema: JSONSchema._JSONSchema | undefined,
  callback: (
    referenceSchema: JSONSchema._JSONSchema,
    schema: JSONSchema._JSONSchema | undefined,
  ) => "skip" | "stop" | undefined,
): "skip" | "stop" | undefined {
  const result = callback(referenceSchema, schema);
  if (result === "stop") return "stop";
  if (result === "skip") return;
  if (typeof referenceSchema === "boolean") return;
  if (typeof schema === "boolean" || !schema) schema = {};
  if (referenceSchema.additionalItems) {
    if (
      recursivelyWalkSchemasInSync(
        referenceSchema.additionalItems,
        schema.additionalItems,
        callback,
      ) === "stop"
    ) {
      return "stop";
    }
  }
  if (referenceSchema.additionalProperties) {
    if (
      recursivelyWalkSchemasInSync(
        referenceSchema.additionalProperties,
        schema.additionalProperties,
        callback,
      ) === "stop"
    ) {
      return "stop";
    }
  }
  if (referenceSchema.oneOf) {
    for (const _member of referenceSchema.oneOf) {
      // TODO: `recursivelyWalkSchemasInSync` matching schemas either by heuristic or by assignability.
    }
  }
  if (referenceSchema.anyOf) {
    for (const _member of referenceSchema.anyOf) {
      // TODO: `recursivelyWalkSchemasInSync` matching schemas either by heuristic or by assignability.
    }
  }
  if (referenceSchema.allOf) {
    for (const member of referenceSchema.allOf) {
      // This is an intersection type, the concrete schema must match all members.
      if (recursivelyWalkSchemasInSync(member, schema, callback) === "stop") {
        return "stop";
      }
    }
  }
  if (referenceSchema.not) {
    if (
      recursivelyWalkSchemasInSync(
        referenceSchema.not,
        schema.not,
        callback,
      ) === "stop"
    ) {
      return "stop";
    }
  }
  switch (referenceSchema.type) {
    case "array": {
      if (referenceSchema.items) {
        const fallbackSchemaItem = Array.isArray(schema.items)
          ? schema.additionalItems
          : schema.items;
        const schemaItems = Array.isArray(schema.items)
          ? schema.items
          : undefined;
        if (Array.isArray(referenceSchema.items)) {
          for (let i = 0; i < referenceSchema.items.length; i += 1) {
            const item = referenceSchema.items[i];
            if (!item) continue;
            if (
              recursivelyWalkSchemasInSync(
                item,
                schemaItems?.[i] ?? fallbackSchemaItem,
                callback,
              ) === "stop"
            ) {
              return "stop";
            }
          }
        } else {
          if (
            recursivelyWalkSchemasInSync(
              referenceSchema.items,
              Array.isArray(schema.items)
                ? schema.additionalItems
                : schema.items,
              callback,
            ) === "stop"
          ) {
            return "stop";
          }
        }
      }
      break;
    }
    case "object": {
      if (referenceSchema.properties) {
        for (const [key, property] of Object.entries(
          referenceSchema.properties,
        )) {
          if (
            recursivelyWalkSchemasInSync(
              property,
              schema.properties?.[key] ?? schema.additionalProperties,
              callback,
            ) === "stop"
          ) {
            return "stop";
          }
        }
      }
      break;
    }
    case "string":
    case "number":
    case "integer":
    case "boolean":
    case "null":
    case undefined: {
      // Primitive types do not contain other schemas.
      break;
    }
  }
  return;
}

export function recursivelyTransformSchema(
  schema: JSONSchema._JSONSchema,
  callback: (schema: JSONSchema._JSONSchema) => JSONSchema._JSONSchema,
): JSONSchema._JSONSchema {
  if (typeof schema === "boolean") return callback(schema) ?? schema;
  let resultSchema = schema;
  function cow(
    oldSchema: JSONSchema._JSONSchema,
    newSchema: JSONSchema._JSONSchema,
    callback: (schema: JSONSchema._JSONSchema) => void,
  ) {
    if (newSchema === oldSchema) return;
    if (resultSchema === schema) {
      resultSchema = { ...schema };
    }
    callback(newSchema);
  }
  if (resultSchema.additionalItems) {
    cow(
      resultSchema.additionalItems,
      recursivelyTransformSchema(resultSchema.additionalItems, callback),
      (result) => {
        resultSchema.additionalItems = result;
      },
    );
  }
  if (resultSchema.additionalProperties) {
    cow(
      resultSchema.additionalProperties,
      recursivelyTransformSchema(resultSchema.additionalProperties, callback),
      (result) => {
        resultSchema.additionalProperties = result;
      },
    );
  }
  if (resultSchema.oneOf) {
    let alreadyReplaced = false;
    for (let i = 0; i < resultSchema.oneOf.length; i += 1) {
      const member = resultSchema.oneOf[i];
      if (!member) continue;
      const newMember = recursivelyTransformSchema(member, callback);
      if (newMember === member) continue;
      if (alreadyReplaced) {
        resultSchema.oneOf[i] =
          typeof newMember === "object" ? newMember : member;
      } else {
        cow(member, newMember, () => {
          resultSchema.oneOf = [...(resultSchema.oneOf ?? [])];
          resultSchema.oneOf[i] =
            typeof newMember === "object" ? newMember : member;
        });
      }
    }
  }
  if (resultSchema.anyOf) {
    let alreadyReplaced = false;
    for (let i = 0; i < resultSchema.anyOf.length; i += 1) {
      const member = resultSchema.anyOf[i];
      if (!member) continue;
      const newMember = recursivelyTransformSchema(member, callback);
      if (newMember === member) continue;
      if (alreadyReplaced) {
        resultSchema.anyOf[i] =
          typeof newMember === "object" ? newMember : member;
      } else {
        cow(member, newMember, () => {
          resultSchema.anyOf = [...(resultSchema.anyOf ?? [])];
          resultSchema.anyOf[i] =
            typeof newMember === "object" ? newMember : member;
        });
      }
    }
  }
  if (resultSchema.allOf) {
    let alreadyReplaced = false;
    for (let i = 0; i < resultSchema.allOf.length; i += 1) {
      const member = resultSchema.allOf[i];
      if (!member) continue;
      const newMember = recursivelyTransformSchema(member, callback);
      if (newMember === member) continue;
      if (alreadyReplaced) {
        resultSchema.allOf[i] =
          typeof newMember === "object" ? newMember : member;
      } else {
        cow(member, newMember, () => {
          resultSchema.allOf = [...(resultSchema.allOf ?? [])];
          resultSchema.allOf[i] =
            typeof newMember === "object" ? newMember : member;
        });
      }
    }
  }
  if (resultSchema.not) {
    cow(
      resultSchema.not,
      recursivelyTransformSchema(resultSchema.not, callback),
      (result) => {
        resultSchema.not = result;
      },
    );
  }
  switch (resultSchema.type) {
    case "array": {
      if (resultSchema.items) {
        if (Array.isArray(resultSchema.items)) {
          let alreadyReplaced = false;
          for (let i = 0; i < resultSchema.items.length; i += 1) {
            const item = resultSchema.items[i];
            if (!item) continue;
            const newItem = recursivelyTransformSchema(item, callback);
            if (newItem === item) continue;
            if (alreadyReplaced) {
              resultSchema.items[i] =
                typeof newItem === "object" ? newItem : item;
            } else {
              const resultItems = resultSchema.items;
              cow(item, newItem, () => {
                resultSchema.items = [...resultItems];
                resultSchema.items[i] =
                  typeof newItem === "object" ? newItem : item;
              });
            }
          }
        } else {
          cow(
            resultSchema.items,
            recursivelyTransformSchema(resultSchema.items, callback),
            (result) => {
              resultSchema.items = result;
            },
          );
        }
      }
      break;
    }
    case "object": {
      if (resultSchema.properties) {
        let alreadyReplaced = false;
        const entries = Object.entries(resultSchema.properties);
        for (let i = 0; i < entries.length; i += 1) {
          const entry = entries[i];
          if (!entry) continue;
          const [key, property] = entry;
          const newProperty = recursivelyTransformSchema(property, callback);
          if (newProperty === property) continue;
          if (alreadyReplaced) {
            resultSchema.properties[key] =
              typeof newProperty === "object" ? newProperty : property;
          } else {
            cow(property, newProperty, () => {
              resultSchema.properties = { ...resultSchema.properties };
              resultSchema.properties[key] =
                typeof newProperty === "object" ? newProperty : property;
            });
          }
        }
      }
      break;
    }
    case "string":
    case "number":
    case "integer":
    case "boolean":
    case "null":
    case undefined: {
      // Primitive types do not contain other schemas.
      break;
    }
  }
  return callback(resultSchema) ?? resultSchema;
}

export function schemaRecursiveSome(
  schema: JSONSchema._JSONSchema,
  predicate: (schema: JSONSchema._JSONSchema) => boolean,
): boolean {
  let found = false;
  recursivelyWalkSchema(schema, (s) => {
    if (!predicate(s)) return;
    found = true;
    return "stop";
  });
  return found;
}

export function doesSchemaContainGeneric(schema: JSONSchema._JSONSchema) {
  return schemaRecursiveSome(
    schema,
    (s) => typeof s === "object" && s["x-generic"] !== undefined,
  );
}

export function extractGenericTypesFromSchema(
  genericSchema: JSONSchema._JSONSchema,
  concreteSchema: JSONSchema._JSONSchema,
  parameters: Record<string, JSONSchema._JSONSchema> = {},
) {
  recursivelyWalkSchemasInSync(genericSchema, concreteSchema, (s, c) => {
    if (
      typeof s === "object" &&
      typeof s["x-generic"] === "string" &&
      c !== undefined
    ) {
      // TODO: The value should be from the concrete schema, but this is tricky
      // because the structure might differ (e.g. union vs single type).
      parameters[s["x-generic"]] = c;
    }
    return undefined;
  });
  return parameters;
}

export function substituteGenericTypesIntoSchema(
  genericSchema: JSONSchema._JSONSchema,
  parameters: Record<string, JSONSchema._JSONSchema>,
) {
  return recursivelyTransformSchema(structuredClone(genericSchema), (s) => {
    if (typeof s === "object" && typeof s["x-generic"] === "string") {
      const replacement = parameters[s["x-generic"]];
      if (replacement) return replacement;
    }
    return s;
  });
}

export function getTypeNameFromSchema(
  schema: JSONSchema._JSONSchema,
): string | undefined {
  if (typeof schema === "boolean") {
    if (schema) return "unknown";
    return "never";
  }
  if (schema.title) return schema.title;
  if (schema.$ref) return schema.$ref.replace(/^#\/definitions\//, "");
  const itemType = Array.isArray(schema.items)
    ? undefined
    : (schema.items ?? schema.additionalItems);
  if (schema.type === "array" && typeof itemType === "object") {
    const itemTypeName = getTypeNameFromSchema(itemType);
    return `list[${itemTypeName ?? "unknown"}]`;
  }
  if (
    schema.type === "object" &&
    typeof schema.additionalProperties === "object"
  ) {
    const valueTypeName = getTypeNameFromSchema(schema.additionalProperties);
    return `stringDict[${valueTypeName ?? "unknown"}]`;
  }
  if (schema.anyOf ?? schema.oneOf) {
    return (schema.anyOf ?? schema.oneOf ?? [])
      .map((s) => getTypeNameFromSchema(s) ?? "unknown")
      .join(" | ");
  }
  if (schema.allOf) {
    return schema.allOf
      .map((s) => getTypeNameFromSchema(s) ?? "unknown")
      .join(" & ");
  }
  if (schema.not) {
    const notTypeName = getTypeNameFromSchema(schema.not);
    return notTypeName ? `not ${notTypeName}` : undefined;
  }
  if (Object.keys(schema).length === 0) {
    // An empty schema matches anything, so "unknown" is the appropriate type.
    return "unknown";
  }
  if (schema.type !== "object" && schema.type !== "array") {
    // It is a primitive, its base type will be close enough.
    return schema.type;
  }
  return undefined;
}

import { z } from "zod/v4";
import { createNodeDefinition } from "./node";
import { Schema } from "./sharedTypes";

export const Literal = z.union([
  z.string(),
  z.number(),
  z.bigint(),
  z.boolean(),
  z.null(),
  z.undefined(),
]);
export type Literal = z.infer<typeof Literal>;

export const literalSchemaNode = createNodeDefinition({
  id: "schema-literal",
  tags: ["schema.literal"],
  input: z.object({ value: Literal }),
  output: z.object({ value: Schema }),
  function: async ({ value }) => ({ value: z.literal(value) }),
});

export const objectSchemaNode = createNodeDefinition({
  id: "schema-object",
  tags: ["schema.object"],
  input: z.object({ properties: z.record(z.string(), Schema) }),
  output: z.object({ value: Schema }),
  function: async ({ properties }) => ({ value: z.object(properties) }),
});

export const arraySchemaNode = createNodeDefinition({
  id: "schema-array",
  tags: ["schema.array"],
  input: z.object({ itemSchema: Schema }),
  output: z.object({ value: Schema }),
  function: async ({ itemSchema }) => ({ value: z.array(itemSchema) }),
});

export const unionSchemaNode = createNodeDefinition({
  id: "schema-union",
  tags: ["schema.union"],
  input: z.object({ schemas: z.array(Schema) }),
  output: z.object({ value: Schema }),
  function: async ({ schemas }) => ({ value: z.union(schemas) }),
});

export const intersectionSchemaNode = createNodeDefinition({
  id: "schema-intersection",
  tags: ["schema.intersection"],
  input: z.object({ firstSchema: Schema, secondSchema: Schema }),
  output: z.object({ value: Schema }),
  function: async ({ firstSchema, secondSchema }) => ({
    value: z.intersection(firstSchema, secondSchema),
  }),
});

export const tupleSchemaNode = createNodeDefinition({
  id: "schema-tuple",
  tags: ["schema.tuple"],
  input: z.object({ itemSchemas: z.array(Schema) }),
  output: z.object({ value: Schema }),
  function: async ({ itemSchemas }) => ({
    value: z.tuple(itemSchemas as [Schema, ...Schema[]]),
  }),
});

export const recordSchemaNode = createNodeDefinition({
  id: "schema-record",
  tags: ["schema.record"],
  input: z.object({ valueSchema: Schema }),
  output: z.object({ value: Schema }),
  function: async ({ valueSchema }) => ({
    value: z.record(z.string(), valueSchema),
  }),
});

export const enumSchemaNode = createNodeDefinition({
  id: "schema-enum",
  tags: ["schema.enum"],
  input: z.object({ values: z.array(z.string()) }),
  output: z.object({ value: Schema }),
  function: async ({ values }) => ({ value: z.enum(values) }),
});

export const unknownSchemaNode = createNodeDefinition({
  id: "schema-unknown",
  tags: ["schema.unknown"],
  input: z.object({}),
  output: z.object({ value: Schema }),
  function: async () => ({ value: z.unknown() }),
});

export const optionalSchemaNode = createNodeDefinition({
  id: "schema-optional",
  tags: ["schema.optional"],
  input: z.object({ value: Schema }),
  output: z.object({ value: Schema }),
  function: async ({ value }) => ({ value: value.optional() }),
});

export const nullableSchemaNode = createNodeDefinition({
  id: "schema-nullable",
  tags: ["schema.nullable"],
  input: z.object({ value: Schema }),
  output: z.object({ value: Schema }),
  function: async ({ value }) => ({ value: value.nullable() }),
});

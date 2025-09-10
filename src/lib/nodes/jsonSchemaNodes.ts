import { z } from "zod/v4";
import { registerMcpServerTool } from "../mcpServer.ts";
import { Schema } from "./sharedTypes.ts";

registerMcpServerTool(
  "schema-const",
  {
    title: "Const JSON Schema",
    description: "A JSON Schema that matches a single constant value.",
    inputSchema: z.object({
      value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
    }),
    outputSchema: z.object({
      schema: Schema,
    }),
    annotations: { baklavaCategory: "JSON Schema" },
  },
  ({ value }) => ({ schema: { const: value } }),
);

registerMcpServerTool(
  "schema-enum",
  {
    title: "Enum JSON Schema",
    description: "A JSON Schema that matches a set of constant values.",
    inputSchema: z.object({
      values: z.array(z.union([z.string(), z.number(), z.boolean(), z.null()])),
    }),
    outputSchema: z.object({
      schema: Schema,
    }),
    annotations: { baklavaCategory: "JSON Schema" },
  },
  ({ values }) => ({ schema: { enum: values } }),
);

registerMcpServerTool(
  "schema-boolean",
  {
    title: "Boolean JSON Schema",
    description: "A JSON Schema that matches a boolean value.",
    inputSchema: z.object({}),
    outputSchema: z.object({
      schema: Schema,
    }),
    annotations: { baklavaCategory: "JSON Schema" },
  },
  () => ({ schema: { type: "boolean" as const } }),
);

registerMcpServerTool(
  "schema-integer",
  {
    title: "Integer JSON Schema",
    description: "A JSON Schema that matches an integer value.",
    inputSchema: z.object({}),
    outputSchema: z.object({
      schema: Schema,
    }),
    annotations: { baklavaCategory: "JSON Schema" },
  },
  () => ({ schema: { type: "integer" as const } }),
);

registerMcpServerTool(
  "schema-number",
  {
    title: "Number JSON Schema",
    description: "A JSON Schema that matches a number value.",
    inputSchema: z.object({}),
    outputSchema: z.object({
      schema: Schema,
    }),
    annotations: { baklavaCategory: "JSON Schema" },
  },
  () => ({ schema: { type: "number" as const } }),
);

registerMcpServerTool(
  "schema-string",
  {
    title: "String JSON Schema",
    description: "A JSON Schema that matches a string value.",
    inputSchema: z.object({}),
    outputSchema: z.object({
      schema: Schema,
    }),
    annotations: { baklavaCategory: "JSON Schema" },
  },
  () => ({ schema: { type: "string" as const } }),
);

registerMcpServerTool(
  "schema-null",
  {
    title: "Null JSON Schema",
    description: "A JSON Schema that matches a null value.",
    inputSchema: z.object({}),
    outputSchema: z.object({
      schema: Schema,
    }),
    annotations: { baklavaCategory: "JSON Schema" },
  },
  () => ({ schema: { type: "null" as const } }),
);

registerMcpServerTool(
  "schema-array",
  {
    title: "Array JSON Schema",
    description: "A JSON Schema that matches an array of values.",
    inputSchema: z.object({
      items: Schema.optional(),
    }),
    outputSchema: z.object({
      schema: Schema,
    }),
    annotations: { baklavaCategory: "JSON Schema" },
  },
  ({ items }) => ({ schema: { type: "array" as const, items } }),
);

registerMcpServerTool(
  "schema-tuple",
  {
    title: "Tuple JSON Schema",
    description: "A JSON Schema that matches a tuple of values.",
    inputSchema: z.object({
      items: z.array(Schema),
      additionalItems: Schema.optional(),
    }),
    outputSchema: z.object({
      schema: Schema,
    }),
    annotations: { baklavaCategory: "JSON Schema" },
  },
  ({ items, additionalItems }) => ({
    schema: { type: "array" as const, items, additionalItems },
  }),
);

registerMcpServerTool(
  "schema-object",
  {
    title: "Object JSON Schema",
    description: "A JSON Schema that matches an object with properties.",
    inputSchema: z.object({
      properties: z.record(z.string(), Schema).optional(),
      required: z.array(z.string()).optional(),
      additionalProperties: z.union([Schema, z.boolean()]).optional(),
    }),
    outputSchema: z.object({
      schema: Schema,
    }),
    annotations: { baklavaCategory: "JSON Schema" },
  },
  ({ properties, required, additionalProperties }) => ({
    schema: {
      type: "object" as const,
      properties,
      required,
      additionalProperties,
    },
  }),
);

registerMcpServerTool(
  "schema-anyof",
  {
    title: "AnyOf JSON Schema",
    description: "A JSON Schema that matches any of the provided schemas.",
    inputSchema: z.object({
      schemas: z.array(Schema),
    }),
    outputSchema: z.object({
      schema: Schema,
    }),
    annotations: { baklavaCategory: "JSON Schema" },
  },
  ({ schemas }) => ({ schema: { anyOf: schemas } }),
);

registerMcpServerTool(
  "schema-allof",
  {
    title: "AllOf JSON Schema",
    description: "A JSON Schema that matches all of the provided schemas.",
    inputSchema: z.object({
      schemas: z.array(Schema),
    }),
    outputSchema: z.object({
      schema: Schema,
    }),
    annotations: { baklavaCategory: "JSON Schema" },
  },
  ({ schemas }) => ({ schema: { allOf: schemas } }),
);

registerMcpServerTool(
  "schema-oneof",
  {
    title: "OneOf JSON Schema",
    description:
      "A JSON Schema that matches exactly one of the provided schemas.",
    inputSchema: z.object({
      schemas: z.array(Schema),
    }),
    outputSchema: z.object({
      schema: Schema,
    }),
    annotations: { baklavaCategory: "JSON Schema" },
  },
  ({ schemas }) => ({ schema: { oneOf: schemas } }),
);

registerMcpServerTool(
  "schema-not",
  {
    title: "Not JSON Schema",
    description: "A JSON Schema that matches anything not matching the schema.",
    inputSchema: z.object({
      schema: Schema,
    }),
    outputSchema: z.object({
      schema: Schema,
    }),
    annotations: { baklavaCategory: "JSON Schema" },
  },
  ({ schema }) => ({ schema: { not: schema } }),
);

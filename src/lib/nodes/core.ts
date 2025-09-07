import { Integer, zInteger } from "./interfaceTypes";
import { registerMcpServerTool } from "./mcp";
import { z } from "zod/v4";
import { zFormattedString } from "./zodHelpers";

// Note that inputs can be inlined, so these are not strictly necessary for the core functionality,
// but they are useful for literals that need to stay in sync across multiple nodes.
registerMcpServerTool(
  "literal-boolean",
  {
    title: "Boolean (Literal)",
    description: "A literal boolean value (true/false)",
    inputSchema: z.object({
      value: z.boolean(),
    }),
    outputSchema: z.object({
      value: z.boolean(),
    }),
    annotations: { baklavaCategory: "Constants" },
  },
  ({ value }) => ({ value }),
);

registerMcpServerTool(
  "literal-string",
  {
    title: "String (Literal)",
    description: "A literal string value",
    inputSchema: z.object({
      value: z.string(),
    }),
    outputSchema: z.object({
      value: z.string(),
    }),
    annotations: { baklavaCategory: "Constants" },
  },
  ({ value }) => ({ value }),
);

registerMcpServerTool(
  "literal-integer",
  {
    title: "Integer (Literal)",
    description: "A literal integer value",
    inputSchema: z.object({
      value: zInteger,
    }),
    outputSchema: z.object({
      value: zInteger,
    }),
    annotations: { baklavaCategory: "Constants" },
  },
  ({ value }) => ({ value }),
);

registerMcpServerTool(
  "literal-number",
  {
    title: "Number (Literal)",
    description: "A literal number value",
    inputSchema: z.object({
      value: z.number(),
    }),
    outputSchema: z.object({
      value: z.number(),
    }),
    annotations: { baklavaCategory: "Constants" },
  },
  ({ value }) => ({ value }),
);

registerMcpServerTool(
  "to-json",
  {
    title: "To JSON",
    description: "Converts an arbitrary value to a JSON string",
    inputSchema: z.object({
      value: z.unknown(),
    }),
    outputSchema: z.object({
      value: zFormattedString("text-display"),
    }),
    annotations: { baklavaCategory: "Data Transformation" },
  },
  ({ value }) => ({ value: JSON.stringify(value) ?? "" }),
);

registerMcpServerTool(
  "number-add",
  {
    title: "Add (Numbers)",
    description: "Adds two numbers",
    inputSchema: z.object({
      a: z.number(),
      b: z.number(),
    }),
    outputSchema: z.object({
      result: z.number(),
    }),
    annotations: { baklavaCategory: "Math" },
  },
  ({ a, b }) => ({ result: a + b }),
);

registerMcpServerTool(
  "number-subtract",
  {
    title: "Subtract (Numbers)",
    description: "Subtracts two numbers",
    inputSchema: z.object({
      a: z.number(),
      b: z.number(),
    }),
    outputSchema: z.object({
      result: z.number(),
    }),
    annotations: { baklavaCategory: "Math" },
  },
  ({ a, b }) => ({ result: a - b }),
);

registerMcpServerTool(
  "number-multiply",
  {
    title: "Multiply (Numbers)",
    description: "Multiplies two numbers",
    inputSchema: z.object({
      a: z.number(),
      b: z.number(),
    }),
    outputSchema: z.object({
      result: z.number(),
    }),
    annotations: { baklavaCategory: "Math" },
  },
  ({ a, b }) => ({ result: a * b }),
);

registerMcpServerTool(
  "number-divide",
  {
    title: "Divide (Numbers)",
    description: "Divides two numbers",
    inputSchema: z.object({
      a: z.number(),
      b: z.number(),
    }),
    outputSchema: z.object({
      result: z.number(),
    }),
    annotations: { baklavaCategory: "Math" },
  },
  ({ a, b }) => ({ result: a / b }),
);

registerMcpServerTool(
  "number-modulo",
  {
    title: "Modulo (Numbers)",
    description: "Calculates the modulo of two numbers",
    inputSchema: z.object({
      a: z.number(),
      b: z.number(),
    }),
    outputSchema: z.object({
      result: z.number(),
    }),
    annotations: { baklavaCategory: "Math" },
  },
  ({ a, b }) => ({ result: a % b }),
);

registerMcpServerTool(
  "number-power",
  {
    title: "Power (Numbers)",
    description: "Calculates the power of a number",
    inputSchema: z.object({
      base: z.number(),
      exponent: z.number(),
    }),
    outputSchema: z.object({
      result: z.number(),
    }),
    annotations: { baklavaCategory: "Math" },
  },
  ({ base, exponent }) => ({ result: Math.pow(base, exponent) }),
);

registerMcpServerTool(
  "integer-add",
  {
    title: "Add (Integers)",
    description: "Adds two integers",
    inputSchema: z.object({
      a: zInteger,
      b: zInteger,
    }),
    outputSchema: z.object({
      result: zInteger,
    }),
    annotations: { baklavaCategory: "Math" },
  },
  ({ a, b }) => ({ result: Integer(a + b) }),
);

registerMcpServerTool(
  "integer-subtract",
  {
    title: "Subtract (Integers)",
    description: "Subtracts two integers",
    inputSchema: z.object({
      a: zInteger,
      b: zInteger,
    }),
    outputSchema: z.object({
      result: zInteger,
    }),
    annotations: { baklavaCategory: "Math" },
  },
  ({ a, b }) => ({ result: Integer(a - b) }),
);

registerMcpServerTool(
  "integer-multiply",
  {
    title: "Multiply (Integers)",
    description: "Multiplies two integers",
    inputSchema: z.object({
      a: zInteger,
      b: zInteger,
    }),
    outputSchema: z.object({
      result: zInteger,
    }),
    annotations: { baklavaCategory: "Math" },
  },
  ({ a, b }) => ({ result: Integer(a * b) }),
);

registerMcpServerTool(
  "integer-divide",
  {
    title: "Divide (Integers)",
    description: "Divides two integers. Truncates the result.",
    inputSchema: z.object({
      a: zInteger,
      b: zInteger,
    }),
    outputSchema: z.object({
      result: zInteger,
    }),
    annotations: { baklavaCategory: "Math" },
  },
  ({ a, b }) => ({ result: Integer(Math.trunc(a / b)) }),
);

registerMcpServerTool(
  "integer-modulo",
  {
    title: "Modulo (Integers)",
    description: "Calculates the modulo of two integers",
    inputSchema: z.object({
      a: zInteger,
      b: zInteger,
    }),
    outputSchema: z.object({
      result: zInteger,
    }),
    annotations: { baklavaCategory: "Math" },
  },
  ({ a, b }) => ({ result: Integer(a % b) }),
);

registerMcpServerTool(
  "integer-power",
  {
    title: "Power (Integers)",
    description: "Calculates the power of an integer. Truncates the result.",
    inputSchema: z.object({
      base: zInteger,
      exponent: zInteger,
    }),
    outputSchema: z.object({
      result: zInteger,
    }),
    annotations: { baklavaCategory: "Math" },
  },
  ({ base, exponent }) => ({
    result: Integer(Math.trunc(Math.pow(base, exponent))),
  }),
);

registerMcpServerTool(
  "text-display",
  {
    title: "Display Text",
    description: "Displays a text string",
    inputSchema: z.object({
      text: z.string(),
    }),
    outputSchema: z.object({
      text: zFormattedString("text-display"),
    }),
    annotations: { baklavaCategory: "Display" },
  },
  ({ text }) => ({ text }),
);

registerMcpServerTool(
  "random-choice",
  {
    title: "Random Choice",
    description: "Chooses a random item from a list",
    inputSchema: z.object({
      list: z.array(z.unknown().meta({ "x-generic": "T" })),
    }),
    outputSchema: z.object({
      choice: z.unknown().meta({ "x-generic": "T" }),
    }),
    annotations: { baklavaCategory: "Random" },
  },
  ({ list }) => ({
    choice: list[Math.floor(Math.random() * list.length)],
  }),
);

registerMcpServerTool(
  "list-get",
  {
    title: "Get Item (List)",
    description: "Gets an item from a list by position",
    inputSchema: z.object({
      list: z.array(z.unknown().meta({ "x-generic": "T" })),
      index: zInteger,
    }),
    outputSchema: z.object({
      item: z.unknown().meta({ "x-generic": "T" }),
    }),
    annotations: { baklavaCategory: "List" },
  },
  ({ list, index }) => ({ item: list[index] }),
);

registerMcpServerTool(
  "string-dict-get",
  {
    title: "Get Item (String Dict)",
    description: "Gets an item from a string dictionary by key",
    inputSchema: z.object({
      dict: z.record(z.string(), z.unknown()),
      key: z.string(),
    }),
    outputSchema: z.object({
      value: z.unknown(),
    }),
    annotations: { baklavaCategory: "String Dict" },
  },
  ({ dict, key }) => ({ value: dict[key] }),
);

registerMcpServerTool(
  "list-join",
  {
    title: "Join (List)",
    description: "Joins a list, inserting another list between every sublist",
    inputSchema: z.object({
      list: z.array(z.array(z.unknown().meta({ "x-generic": "T" }))),
      separator: z.array(z.unknown().meta({ "x-generic": "T" })),
    }),
    outputSchema: z.object({
      list: z.array(z.unknown().meta({ "x-generic": "T" })),
    }),
    annotations: { baklavaCategory: "List" },
  },
  ({ list, separator }) => ({
    list: list.flatMap((sublist, i) =>
      i ? [...separator, ...sublist] : sublist,
    ),
  }),
);

registerMcpServerTool(
  "string-list-join",
  {
    title: "Join (String List)",
    description: "Joins a list into a single string",
    inputSchema: z.object({
      list: z.array(z.string()),
      separator: z.string(),
    }),
    outputSchema: z.object({
      string: z.string(),
    }),
    annotations: { baklavaCategory: "List" },
  },
  ({ list, separator }) => ({ string: list.join(separator) }),
);

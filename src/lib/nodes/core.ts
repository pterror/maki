import { z } from "zod/v4";
import { createNodeDefinition } from "./node";

// FIXME: Actually implement.
const intrinsicGetInput = (s: string) => null!;
const intrinsicSetOutput = (s: string, v: unknown) => {
  console.warn(`Setting output '${s}' to value '${v}' is not implemented.`);
};

export const coreInputNode = createNodeDefinition({
  id: "core-input",
  tags: ["core"],
  input: z.object({ name: z.string() }),
  output: z.object({ value: z.unknown() }),
  function: async ({ name }) => ({ value: intrinsicGetInput(name) }),
});

export const coreOutputNode = createNodeDefinition({
  id: "core-output",
  tags: ["core"],
  input: z.object({ name: z.string(), value: z.unknown() }),
  output: z.object({}),
  function: async ({ name, value }) => {
    intrinsicSetOutput(name, value);
    return {};
  },
});

// TODO: Note that literal inputs should implicitly be allowed to be inlined,
// so these are not strictly necessary for the core functionality,
// but they are useful for literals that need to stay in sync for multiple nodes.

export const coreUndefinedLiteralNode = createNodeDefinition({
  id: "core-literal-undefined",
  tags: ["core.literal.undefined"],
  input: z.object({}),
  output: z.object({ value: z.undefined() }),
  function: async () => ({ value: undefined }),
});

export const coreNullLiteralNode = createNodeDefinition({
  id: "core-literal-null",
  tags: ["core.literal.null"],
  input: z.object({}),
  output: z.object({ value: z.null() }),
  function: async () => ({ value: null }),
});

export const coreTruthLiteralNode = createNodeDefinition({
  id: "core-literal-truth",
  tags: ["core.literal.truth"],
  input: z.object({ value: z.boolean() }),
  output: z.object({ value: z.boolean() }),
  function: async ({ value }) => ({ value }),
});

export const coreIntegerLiteralNode = createNodeDefinition({
  id: "core-literal-integer",
  tags: ["core.literal.number.integer"],
  input: z.object({ value: z.number().int() }),
  output: z.object({ value: z.number().int() }),
  function: async ({ value }) => ({ value }),
});

export const coreNumberLiteralNode = createNodeDefinition({
  id: "core-literal-number",
  tags: ["core.literal.number"],
  input: z.object({ value: z.number() }),
  output: z.object({ value: z.number() }),
  function: async ({ value }) => ({ value }),
});

export const coreTextLiteralNode = createNodeDefinition({
  id: "core-literal-text",
  tags: ["core.literal.text"],
  input: z.object({ value: z.string() }),
  output: z.object({ value: z.string() }),
  function: async ({ value }) => ({ value }),
});

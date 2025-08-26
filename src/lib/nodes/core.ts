import {
  defineDynamicNode,
  Editor,
  NodeInterfaceType,
  type IRegisterNodeTypeOptions,
} from "baklavajs";
import {
  Integer,
  integerType,
  nodeInterface,
  stringType,
} from "./interfaceTypes";
import { registerMcpServerTool } from "./mcp";
import { z, ZodType } from "zod/v4";

export const allEditorsNeedingDerivedNodes = new Set<WeakRef<Editor>>();

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
      value: z.int() as unknown as ZodType<Integer>,
    }),
    outputSchema: z.object({
      value: z.int() as unknown as ZodType<Integer>,
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

const allListNodeRegisterFunctions = new Set<(editor: Editor) => void>();

export function defineListNode<T>(
  type: NodeInterfaceType<T>,
  listType: NodeInterfaceType<T[]>,
  options: IRegisterNodeTypeOptions,
) {
  const node = defineDynamicNode({
    type: "CoreListNode",
    inputs: {
      size: () => nodeInterface("Size", integerType, Integer(0)),
    },
    outputs: {
      items: () => nodeInterface("Items", listType, []),
    },
    onUpdate({ size }) {
      return {
        inputs: {
          size: () => nodeInterface("Size", integerType, Integer(0)),
          ...Object.fromEntries(
            Array.from({ length: size }, (_, i) => [
              `element${i}`,
              nodeInterface(`${i}`, undefined!, type),
            ]),
          ),
        },
      };
    },
    calculate(inputs) {
      return {
        items: Array.from(
          { length: inputs.size },
          (_, i) => inputs[`element${i}`] as T,
        ),
      };
    },
  });
  const register = function registerCoreListNode(editor: Editor) {
    editor.registerNodeType(node, options);
  };
  allListNodeRegisterFunctions.add(register);
  for (const editorRef of allEditorsNeedingDerivedNodes) {
    const editor = editorRef.deref();
    if (!editor) continue;
    register(editor);
  }
  return { node, register };
}

const allStringDictNodeRegisterFunctions = new Set<(editor: Editor) => void>();

export function defineStringDictNode<V>(
  valueType: NodeInterfaceType<V>,
  dictType: NodeInterfaceType<Record<string, V>>,
  options: IRegisterNodeTypeOptions,
) {
  const node = defineDynamicNode({
    type: "CoreStringDictNode",
    inputs: {
      size: () => nodeInterface("Size", integerType, Integer(0)),
    },
    outputs: {
      items: () => nodeInterface("Items", dictType, {}),
    },
    onUpdate({ size }) {
      return {
        inputs: {
          size: () => nodeInterface("Size", integerType, Integer(0)),
          ...Object.fromEntries(
            Array(size)
              .fill(null)
              .flatMap((_, i) => [
                [`key${i}`, nodeInterface(`Key ${i}`, stringType, "")],
                [
                  `value${i}`,
                  nodeInterface(`Value ${i}`, valueType, undefined),
                ],
              ]),
          ),
        },
      };
    },
    calculate(inputs) {
      const items: Record<string, V> = Object.fromEntries(
        Array.from({ length: inputs.size }, (_, i) => [
          inputs[`key${i}`] as string,
          inputs[`value${i}`] as V,
        ]),
      );
      return { items };
    },
  });
  const register = function registerCoreStringDictNode(editor: Editor) {
    editor.registerNodeType(node, options);
  };
  allStringDictNodeRegisterFunctions.add(register);
  for (const editorRef of allEditorsNeedingDerivedNodes) {
    const editor = editorRef.deref();
    if (!editor) continue;
    register(editor);
  }
  return { node, register };
}

export function registerDerivedNodes(editor: Editor) {
  allEditorsNeedingDerivedNodes.add(new WeakRef(editor));
  for (const register of allListNodeRegisterFunctions) {
    register(editor);
  }
  for (const register of allStringDictNodeRegisterFunctions) {
    register(editor);
  }
}

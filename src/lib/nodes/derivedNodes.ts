import {
  Editor,
  NodeInterfaceType,
  type IRegisterNodeTypeOptions,
  defineDynamicNode,
} from "baklavajs";
import {
  nodeInterface,
  integerType,
  Integer,
  textInputInterface,
  integerInterface,
} from "./interfaceTypes";
import { nodeInterfaceTypeToNodeInterface } from "./baklava";

export const allEditorsNeedingDerivedNodes = new Set<WeakRef<Editor>>();

const allListNodeRegisterFunctions = new Set<(editor: Editor) => void>();

const CreateListNode = defineDynamicNode({
  type: "Create (List)",
  inputs: {
    size: () => nodeInterface("size", integerType, Integer(0)),
  },
  outputs: {},
  onUpdate(inputs, outputs) {
    const inputType = this;
    // FIXME: Debug why `inputs.size` has an outdated value (always 0)
    const size = outputs.items.length;
    return {
      inputs: Object.fromEntries(
        Array.from({ length: size }, (_, i) => [
          `item${i}`,
          () => nodeInterfaceTypeToNodeInterface(`Item ${i}`, type),
        ]),
      ),
      outputs: {
        items: 0,
      },
    };
  },
  calculate(inputs) {
    return {
      items: Array.from({ length: inputs.size }, (_, i) => inputs[`item${i}`]),
    };
  },
});

export function defineListNode<T>(
  type: NodeInterfaceType<T>,
  listType: NodeInterfaceType<T[]>,
  options: IRegisterNodeTypeOptions,
) {
  const node = defineDynamicNode({
    type: `Create List (${type.name})`,
    inputs: {
      size: () => integerInterface("Size"),
    },
    outputs: {
      items: () => nodeInterface("Items", listType, []),
    },
    onUpdate({ size }) {
      return {
        inputs: Object.fromEntries(
          Array.from({ length: size }, (_, i) => [
            `item${i}`,
            () => nodeInterfaceTypeToNodeInterface(`Item ${i}`, type),
          ]),
        ),
      };
    },
    calculate(inputs) {
      return {
        items: Array.from(
          { length: inputs.size },
          (_, i) => inputs[`item${i}`] as T,
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
  // FIXME: This node acts really funky when disconnecting and reconnecting wires
  // in other parts of the graph. This needs to be investigated and fixed.
  const node = defineDynamicNode({
    type: `Create String Dict (${valueType.name})`,
    inputs: {
      size: () => integerInterface("Size"),
    },
    outputs: {
      items: () => nodeInterface("Items", dictType, {}),
    },
    onUpdate({ size }) {
      // FIXME: Debug why `inputs.size` has an outdated value (always 0)
      return {
        inputs: Object.fromEntries(
          Array(size)
            .fill(null)
            .flatMap((_, i) => [
              [`key${i}`, () => textInputInterface(`Key ${i}`)],
              [
                `value${i}`,
                () => nodeInterfaceTypeToNodeInterface(`Value ${i}`, valueType),
              ],
            ]),
        ),
      };
    },
    calculate(inputs) {
      const items: Record<string, V> = Object.fromEntries(
        Array.from({ length: inputs.size }, (_, i) => [
          (inputs[`key${i}`] as string | undefined) ?? String(i),
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

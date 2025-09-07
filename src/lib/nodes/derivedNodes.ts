import {
  Editor,
  NodeInterfaceType,
  defineDynamicNode,
  DynamicNode,
  SelectInterface,
  type IRegisterNodeTypeOptions,
} from "baklavajs";
import {
  nodeInterface,
  integerType,
  Integer,
  textInputInterface,
  integerInterface,
  selectInterface,
  stringType,
  unknownListType,
} from "./interfaceTypes";
import {
  jsonSchemaToNodeInterface,
  jsonSchemaToOutputNodeInterface,
  nodeInterfaceTypeToNodeInterface,
} from "./baklava";
import { toRaw } from "vue";

export const allEditorsNeedingDerivedNodes = new Set<WeakRef<Editor>>();

const allListNodeRegisterFunctions = new Set<(editor: Editor) => void>();

export const CreateListNode = defineDynamicNode({
  type: "Create (List)",
  inputs: {
    size: () => integerInterface("size"),
    type: () => selectInterface("type", stringType, ["unknown"], "unknown"),
  },
  outputs: {
    items: () => nodeInterface("items", unknownListType),
  },
  onPlaced() {
    // @ts-expect-error We are intentionally accessing a private property.
    const interfaceTypes = toRaw(this.graph?.interfaceTypes.types) as
      | Map<string, NodeInterfaceType<any>>
      | undefined;
    const typeInterface = this.inputs.type as SelectInterface;
    typeInterface.items = [...(interfaceTypes?.keys() ?? [])];
  },
  onUpdate({ size, type }) {
    const self = this as unknown as DynamicNode<unknown, unknown>;
    // @ts-expect-error We are intentionally accessing a private property.
    const interfaceTypes = toRaw(self.graph?.interfaceTypes.types) as
      | Map<string, NodeInterfaceType<any>>
      | undefined;
    const newType = interfaceTypes?.get(type)?.schema;
    if (!newType) return {};
    if (self.outputs.items) {
      self.outputs.items.type = `list[${type}]`;
    }
    return {
      inputs: Object.fromEntries(
        Array.from({ length: size }, (_, i) => [
          `item${i}`,
          () => jsonSchemaToNodeInterface(`item${i}`, newType),
        ]),
      ),
      forceUpdateInputs: Array.from(
        { length: size },
        (_, i) => `item${i}`,
      ).filter((k) => self.inputs[k]?.type !== type),
    };
  },
  calculate(inputs) {
    return {
      items: Array.from({ length: inputs.size }, (_, i) => inputs[`item${i}`]),
    };
  },
});
export function registerListNode(editor: Editor) {
  editor.registerNodeType(CreateListNode, { category: "Constants" });
}

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
  for (const editorRef of allEditorsNeedingDerivedNodes) {
    const editor = editorRef.deref();
    if (!editor) continue;
    register(editor);
  }
  return { node, register };
}

export function registerDerivedNodes(editor: Editor) {
  registerListNode(editor);
  allEditorsNeedingDerivedNodes.add(new WeakRef(editor));
  for (const register of allListNodeRegisterFunctions) {
    register(editor);
  }
}

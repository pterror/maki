import {
  Editor,
  NodeInterfaceType,
  defineDynamicNode,
  DynamicNode,
  SelectInterface,
  NodeInterface,
  setType,
  IntegerInterface,
  TextInputInterface,
} from "baklavajs";
import { jsonSchemaToNodeInterface, upsertBaklavaType } from "./baklava.ts";
import { toRaw } from "vue";
import { allEditorsNeedingDerivedNodes } from "./allEditorsNeedingDerivedNodes.ts";
import { zInteger } from "../type.ts";
import { toJSONSchema } from "zod/v4";

export const CreateListNode = defineDynamicNode({
  type: "List (Literal)",
  inputs: {
    size: () =>
      new IntegerInterface("size", 0).use(
        setType,
        upsertBaklavaType(toJSONSchema(zInteger)) as NodeInterfaceType<number>,
      ),
    type: () =>
      new SelectInterface("type", "unknown", ["unknown"]).use(
        setType,
        upsertBaklavaType({ type: "string" }) as NodeInterfaceType<string>,
      ),
  },
  outputs: {
    items: () =>
      new NodeInterface<readonly unknown[]>("items", null!).use(
        setType,
        upsertBaklavaType({ type: "array", items: {} }) as NodeInterfaceType<
          readonly unknown[]
        >,
      ),
  },
  onPlaced() {
    // @ts-expect-error We are intentionally accessing a private property.
    const interfaceTypes = toRaw(this.graph?.interfaceTypes.types) as
      | Map<string, NodeInterfaceType<any>>
      | undefined;
    const typeInterface = this.inputs.type as SelectInterface;
    typeInterface.items = [...(interfaceTypes?.keys() ?? [])].sort();
  },
  onUpdate({ size, type }) {
    const self = this as unknown as DynamicNode<unknown, unknown>;
    // @ts-expect-error We are intentionally accessing a private property.
    const interfaceTypes = toRaw(self.graph?.interfaceTypes.types) as
      | Map<string, NodeInterfaceType<any>>
      | undefined;
    const newType = interfaceTypes?.get(type)?.schema;
    if (!newType) return {};
    upsertBaklavaType({ type: "array", items: newType });
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

export const CreateStringDictNode = defineDynamicNode({
  type: "String Dict (Literal)",
  inputs: {
    size: () =>
      new IntegerInterface("size", 0).use(
        setType,
        upsertBaklavaType(toJSONSchema(zInteger)) as NodeInterfaceType<number>,
      ),
    type: () =>
      new SelectInterface("type", "unknown", ["unknown"]).use(
        setType,
        upsertBaklavaType({ type: "string" }) as NodeInterfaceType<string>,
      ),
  },
  outputs: {
    items: () =>
      new NodeInterface<Record<string, unknown>>("items", null!).use(
        setType,
        upsertBaklavaType({
          type: "object",
          additionalProperties: {},
        }) as NodeInterfaceType<Record<string, unknown>>,
      ),
  },
  onPlaced() {
    // @ts-expect-error We are intentionally accessing a private property.
    const interfaceTypes = toRaw(this.graph?.interfaceTypes.types) as
      | Map<string, NodeInterfaceType<any>>
      | undefined;
    const typeInterface = this.inputs.type as SelectInterface;
    typeInterface.items = [...(interfaceTypes?.keys() ?? [])].sort();
  },
  onUpdate({ size, type }) {
    const self = this as unknown as DynamicNode<unknown, unknown>;
    // @ts-expect-error We are intentionally accessing a private property.
    const interfaceTypes = toRaw(self.graph?.interfaceTypes.types) as
      | Map<string, NodeInterfaceType<any>>
      | undefined;
    const newType = interfaceTypes?.get(type)?.schema;
    if (!newType) return {};
    upsertBaklavaType({ type: "object", additionalProperties: newType });
    if (self.outputs.items) {
      self.outputs.items.type = `stringDict[${type}]`;
    }
    return {
      inputs: Object.fromEntries(
        Array(size)
          .fill(null)
          .flatMap((_, i) => [
            [
              `key${i}`,
              () =>
                new TextInputInterface(`key${i}`, "").use(
                  setType,
                  upsertBaklavaType({
                    type: "string",
                  }) as NodeInterfaceType<string>,
                ),
            ],
            [
              `value${i}`,
              () => jsonSchemaToNodeInterface(`value${i}`, newType),
            ],
          ]),
      ),
      forceUpdateInputs: Array.from(
        { length: size },
        (_, i) => `value${i}`,
      ).filter((k) => self.inputs[k]?.type !== type),
    };
  },
  calculate(inputs) {
    return {
      items: Object.fromEntries(
        Array.from({ length: inputs.size }, (_, i): [string, unknown] => [
          inputs[`key${i}`] ?? String(i),
          inputs[`value${i}`],
        ]),
      ),
    };
  },
});
export function registerStringDictNode(editor: Editor) {
  editor.registerNodeType(CreateStringDictNode, { category: "Constants" });
}

export function registerDerivedNodes(editor: Editor) {
  registerListNode(editor);
  registerStringDictNode(editor);
  allEditorsNeedingDerivedNodes.add(new WeakRef(editor));
}

import {
  defineDynamicNode,
  defineNode,
  Editor,
  NodeInterfaceType,
  type IRegisterNodeTypeOptions,
} from "baklavajs";
import {
  anyType,
  booleanType,
  checkboxInterface,
  Integer,
  integerInterface,
  integerType,
  nodeInterface,
  numberInterface,
  sliderInterface,
  textInterface,
} from "./interfaceTypes";

// Note that inputs can be inlined, so these are not strictly necessary for the core functionality,
// but they are useful for literals that need to stay in sync across multiple nodes.
export const CoreBooleanNode = defineNode({
  type: "CoreBooleanNode",
  inputs: {
    value: () => checkboxInterface("Value"),
  },
  outputs: {
    value: () => nodeInterface("Value", false, booleanType),
  },
  calculate(args) {
    return args;
  },
});
export function registerCoreBooleanNode(editor: Editor) {
  editor.registerNodeType(CoreBooleanNode, { category: "Constants" });
}

export const CoreStringNode = defineNode({
  type: "CoreTextNode",
  inputs: {
    value: () => textInterface("Value"),
  },
  outputs: {
    value: () => nodeInterface("Value", "", anyType),
  },
  calculate(args) {
    return args;
  },
});
export function registerCoreStringNode(editor: Editor) {
  editor.registerNodeType(CoreStringNode, { category: "Constants" });
}

export const CoreIntegerNode = defineNode({
  type: "CoreIntegerNode",
  inputs: {
    value: () => integerInterface("Value"),
  },
  outputs: {
    value: () => nodeInterface("Value", 0, anyType),
  },
  calculate(args) {
    return args;
  },
});
export function registerCoreIntegerNode(editor: Editor) {
  editor.registerNodeType(CoreIntegerNode, { category: "Constants" });
}

export const CoreNumberNode = defineNode({
  type: "CoreNumberNode",
  inputs: {
    value: () => numberInterface("Value"),
  },
  outputs: {
    value: () => nodeInterface("Value", 0, anyType),
  },
  calculate(args) {
    return args;
  },
});
export function registerCoreNumberNode(editor: Editor) {
  editor.registerNodeType(CoreNumberNode, { category: "Constants" });
}

export const CoreSliderNode = defineNode({
  type: "CoreSliderNode",
  inputs: {
    value: () => sliderInterface("Value"),
  },
  outputs: {
    value: () => nodeInterface("Value", 0, anyType),
  },
  calculate(args) {
    return args;
  },
});
export function registerCoreSliderNode(editor: Editor) {
  editor.registerNodeType(CoreSliderNode, { category: "Constants" });
}

export function defineListNode<T>(
  type: NodeInterfaceType<T>,
  listType: NodeInterfaceType<readonly T[]>,
  makeDefaultValue: () => T,
  options: IRegisterNodeTypeOptions
) {
  const node = defineDynamicNode({
    type: "CoreListNode",
    inputs: {
      length: () => nodeInterface("Length", Integer(0), integerType),
    },
    outputs: {
      items: () => nodeInterface("Items", [], listType),
    },
    onUpdate({ length }) {
      return {
        inputs: {
          length: () => nodeInterface("Length", Integer(0), integerType),
          ...Object.fromEntries(
            Array.from({ length }, (_, i) => [
              `element${i}`,
              nodeInterface(`${i}`, makeDefaultValue(), type),
            ])
          ),
        },
      };
    },
    calculate(inputs) {
      const items: readonly T[] = Array.from(
        { length: inputs.length },
        (_, i) => inputs[`element${i}`] as T
      );
      return { items };
    },
  });
  const register = function registerCoreListNode(editor: Editor) {
    editor.registerNodeType(node, options);
  };
  return { node, register };
}

export function registerCoreNodes(editor: Editor) {
  registerCoreBooleanNode(editor);
  registerCoreStringNode(editor);
  registerCoreIntegerNode(editor);
  registerCoreNumberNode(editor);
  registerCoreSliderNode(editor);
}

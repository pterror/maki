import { z } from "zod/v4";
import {
  type Newtype,
  type UnwrapNewtype,
} from "../newtype";
import {
  assertStrict,
  unsafeEntries,
  unsafeValues,
  type IsEqual,
} from "../core";
import { zodShape } from "./sharedTypes";

export type NodeId<Input extends z.ZodType, Output extends z.ZodType> = Newtype<
  string,
  { type: "NodeId"; input: Input; output: Output }
>;
const NodeId = <Input extends z.ZodType, Output extends z.ZodType>(
  value: string & { readonly __type?: never }
) => value as unknown as NodeId<Input, Output>;
export type AnyNodeId = NodeId<z.ZodType, z.ZodType>;

export type NodeDefinitionId<
  Input extends z.ZodType,
  Output extends z.ZodType
> = Newtype<string, { type: "NodeDefinitionId"; input: Input; output: Output }>;
const NodeDefinitionId = <Input extends z.ZodType, Output extends z.ZodType>(
  value: string & { readonly __type?: never }
) => value as unknown as NodeDefinitionId<Input, Output>;
export type AnyNodeDefinitionId = NodeDefinitionId<z.ZodType, z.ZodType>;

export interface NodeDefinitionBase<
  Input extends z.ZodType,
  Output extends z.ZodType
> {
  /** Should be an object type. */
  readonly input: Input;
  /** Should be an object type. */
  readonly output: Output;
  readonly function: (input: z.infer<Input>) => Promise<z.infer<Output>>;
}

export interface NodeDefinition<
  Input extends z.ZodType,
  Output extends z.ZodType
> extends NodeDefinitionBase<Input, Output> {
  readonly id: NodeDefinitionId<Input, Output>;
  /** Should be an object type. */
  readonly input: Input;
  /** Should be an object type. */
  readonly output: Output;
  readonly tags: readonly string[];
}

export interface NodeDefinitionRegistry {
  readonly definitions: Record<string, NodeDefinition<z.ZodType, z.ZodType>>;
}

export const createNodeRegistry = (): NodeDefinitionRegistry => ({
  definitions: {},
});

export const globalNodeDefinitionRegistry = createNodeRegistry();

export const addNodeDefinitionToRegistry = <
  Input extends z.ZodType,
  Output extends z.ZodType
>(
  registry: NodeDefinitionRegistry,
  definition: NodeDefinition<Input, Output>
): NodeDefinitionRegistry => {
  registry.definitions[definition.id] = definition;
  return registry;
};

export interface CreateNodeDefinitionOptions {
  /** Defaults to `true`. */
  readonly addToGlobalRegistry?: boolean;
}

export const createNodeDefinition = <
  Input extends z.ZodType,
  Output extends z.ZodType
>(
  definition: NodeDefinitionBase<Input, Output> & {
    readonly id: UnwrapNewtype<NodeDefinitionId<Input, Output>>;
    readonly tags?: readonly string[];
  },
  { addToGlobalRegistry = true }: CreateNodeDefinitionOptions = {}
): NodeDefinition<Input, Output> => {
  const result: NodeDefinition<Input, Output> = {
    ...definition,
    id: NodeDefinitionId<Input, Output>(definition.id),
    tags: definition.tags ?? [],
  };
  if (addToGlobalRegistry) {
    addNodeDefinitionToRegistry(globalNodeDefinitionRegistry, result);
  }
  return result;
};

export interface GraphNode<Input extends z.ZodType, Output extends z.ZodType> {
  readonly id: NodeId<Input, Output>;
  readonly inputIds: Record<string, AnyNodeId>;
  readonly outputIds: Record<string, AnyNodeId>;
  readonly definitionId: NodeDefinitionId<Input, Output>;
}

export type AnyGraphNode = GraphNode<z.ZodType, z.ZodType>;

export const createNode = <Input extends z.ZodType, Output extends z.ZodType>(
  node: Omit<GraphNode<Input, Output>, "id" | "inputIds" | "outputIds"> & {
    readonly id: UnwrapNewtype<NodeId<Input, Output>>;
  },
  graph: Graph | undefined
): GraphNode<Input, Output> => {
  const result: GraphNode<Input, Output> = {
    ...node,
    id: NodeId(node.id),
    inputIds: {},
    outputIds: {},
  };
  if (graph) {
    graph.nodes[result.id] = result;
  }
  return result;
};

export const getNodeDefinition = <
  Input extends z.ZodType,
  Output extends z.ZodType
>(
  node: GraphNode<Input, Output>
): NodeDefinition<Input, Output> => {
  // TODO: Use a local registry (somehow?) when desired.
  return assertStrict(
    globalNodeDefinitionRegistry.definitions[node.definitionId],
    "Node definition not found"
  ) as NodeDefinition<Input, Output>;
};

export const getNodeInputDefinitions = <
  Input extends z.ZodType,
  Output extends z.ZodType
>(
  node: GraphNode<Input, Output>
): Record<string, z.ZodType> => zodShape(getNodeDefinition(node).input);

export const getNodeOutputDefinitions = <
  Input extends z.ZodType,
  Output extends z.ZodType
>(
  node: GraphNode<Input, Output>
): Record<string, z.ZodType> => zodShape(getNodeDefinition(node).output);

export interface Graph {
  readonly nodes: Record<AnyNodeId, AnyGraphNode>;
  readonly cachedValues: Record<AnyNodeId, unknown>;
}

export const createGraph = (): Graph => ({ nodes: {}, cachedValues: {} });

export const addNodeToGraph = <
  Input extends z.ZodType,
  Output extends z.ZodType
>(
  graph: Graph,
  node: GraphNode<Input, Output>
): Graph => {
  graph.nodes[node.id] = node;
  return graph;
};

export const removeNodeFromGraph = (
  graph: Graph,
  node: AnyGraphNode
): Graph => {
  delete graph.nodes[node.id];
  for (const [key, nodeId] of unsafeEntries(node.inputIds)) {
    const otherNode = graph.nodes[nodeId];
    if (!otherNode) continue;
    if (otherNode.outputIds[key] !== node.id) continue;
    delete otherNode.outputIds[key];
  }
  for (const [key, nodeId] of unsafeEntries(node.outputIds)) {
    const otherNode = graph.nodes[nodeId];
    if (!otherNode) continue;
    if (otherNode.inputIds[key] !== node.id) continue;
    delete otherNode.inputIds[key];
  }
  return graph;
};

export const connectNodes = <
  Output1 extends z.ZodType,
  Input2 extends z.ZodType,
  SourceOutput extends z.ZodType extends Output1
    ? string
    : string & keyof z.infer<Output1>,
  TargetInput extends z.ZodType extends Input2
    ? string
    : string & keyof z.infer<Input2>
>(
  graph: Graph,
  source: GraphNode<any, Output1>,
  sourceOutput: SourceOutput,
  target: GraphNode<Input2, any>,
  targetInput: TargetInput,
  ..._errors: z.ZodType extends Output1
    ? [] // No errors, source output type is not statically known
    : z.ZodType extends Input2
    ? [] // No errors, target input type is not statically known
    : [z.infer<Output1>, z.infer<Input2>] extends [
        Record<SourceOutput, infer T>,
        Record<TargetInput, infer U>
      ]
    ? IsEqual<T, U> extends true
      ? [] // No errors, types match
      : [
          never,
          Error: "Source output type",
          t: T,
          _: "does not match target input type",
          u: U
        ]
    : [
        never,
        Error: "Source output type or target input type does not have the given field name.",
        _: "This should not be possible due to the type constraints.",
        sourceOutput: z.infer<Output1>,
        targetInput: z.infer<Input2>
      ]
) => {
  // Connect the source output to the target input
  const sourceDefinition = getNodeDefinition(source);
  const targetDefinition = getNodeDefinition(target);
  const sourceOutputType = zodShape(sourceDefinition.output)[sourceOutput];
  const targetInputType = zodShape(targetDefinition.input)[targetInput];
  if (!sourceOutputType)
    throw new Error(
      `Invalid source output: ${source.id} output '${sourceOutput}'`
    );
  if (!targetInputType)
    throw new Error(
      `Invalid target input: ${target.id} input '${targetInput}'`
    );
  if (sourceOutputType !== targetInputType)
    throw new Error(
      `Type mismatch: ${source.id} output '${sourceOutput}' type '${sourceOutputType}' does not match ${target.id} input '${targetInput}' type '${targetInputType}'`
    );
  // Disconnect existing connections if necessary
  const existingSourceOutputId = source.outputIds[sourceOutput];
  const existingSourceOutput =
    existingSourceOutputId != null
      ? graph.nodes[existingSourceOutputId]
      : undefined;
  if (existingSourceOutput?.id !== target.id) {
    for (const input in existingSourceOutput?.inputIds) {
      if (existingSourceOutput.inputIds[input] === source.id) {
        delete existingSourceOutput.inputIds[input];
      }
    }
  }
  const existingTargetInputId = target.inputIds[targetInput];
  const existingTargetInput =
    existingTargetInputId != null
      ? graph.nodes[existingTargetInputId]
      : undefined;
  if (existingTargetInput?.id !== source.id) {
    for (const output in existingTargetInput?.outputIds) {
      if (existingTargetInput.outputIds[output] === target.id) {
        delete existingTargetInput.outputIds[output];
      }
    }
  }
  source.outputIds[sourceOutput] = target.id;
  target.inputIds[targetInput] = source.id;
  return true as never;
};

export interface ExecuteGraphNodeOptions {
  /**
   * When `true`, skips the cache and always re-executes ancestors.
   * Defaults to `false`.
   */
  readonly skipCache?: boolean;
  readonly evaluateAncestorsIfNeeded?: boolean;
  readonly evaluateDescendantsIfNeeded?: boolean;
}

export const clearGraphValueCache = (graph: Graph): Graph => {
  for (const key in graph.cachedValues) {
    delete graph.cachedValues[key as AnyNodeId];
  }
  return graph;
};

// TODO: Parallelize execution of nodes where possible.
export const executeGraphNode = async <
  Input extends z.ZodType,
  Output extends z.ZodType
>(
  graph: Graph,
  nodeId: NodeId<Input, Output>,
  {
    skipCache = false,
    evaluateAncestorsIfNeeded = false,
    evaluateDescendantsIfNeeded = false,
  }: ExecuteGraphNodeOptions = {}
): Promise<z.infer<Output>> => {
  const node = assertStrict(
    graph.nodes[nodeId],
    `Node '${nodeId}' not found in graph`
  );
  const definition = getNodeDefinition(node);
  const inputShape = zodShape(definition.input);
  const cachedValue = graph.cachedValues[nodeId];
  if (cachedValue) return cachedValue as z.infer<Output>;
  const input = {} as z.infer<Input>;
  for (const [key, inputId] of unsafeEntries(node.inputIds)) {
    const inputNode = graph.nodes[inputId];
    if (!inputNode) {
      const inputSchema = inputShape[key];
      if (inputSchema?.safeParse(undefined).success) {
        // Allow optional inputs to be unconnected.
        continue;
      }
      throw new Error(
        `Input node '${inputId}' not found for node '${node.id}'`
      );
    }
    let inputValue = graph.cachedValues[inputNode.id];
    if (!(inputNode.id in graph.cachedValues)) {
      if (skipCache) {
        throw new Error(
          `Input value for node '${inputNode.id}' not cached, cannot execute node '${node.id}' with \`skipCache: true\``
        );
      }
      if (!evaluateAncestorsIfNeeded) {
        throw new Error(
          `Input value for node '${inputNode.id}' not cached, cannot execute node '${node.id}' without \`evaluateAncestorsIfNeeded: true\``
        );
      }
      inputValue = await executeGraphNode(graph, inputNode.id, {
        skipCache,
        evaluateAncestorsIfNeeded,
        /** This node is a descendant, and we do not want to execute siblings. */
        evaluateDescendantsIfNeeded: false,
      });
      graph.cachedValues[inputNode.id] = inputValue;
    }
    input[key as keyof z.infer<Input>] = inputValue as never;
  }
  const result = await definition.function(input);
  graph.cachedValues[nodeId] = result;
  if (evaluateDescendantsIfNeeded) {
    for (const outputId of unsafeValues(node.outputIds)) {
      const outputNode = graph.nodes[outputId];
      if (!outputNode) {
        // Allow outputs to be unconnected.
        continue;
      }
      if (!(outputNode.id in graph.cachedValues)) {
        await executeGraphNode(graph, outputNode.id, {
          skipCache,
          evaluateAncestorsIfNeeded: false,
          evaluateDescendantsIfNeeded: true,
        });
      }
    }
  }
  return result as never;
};

export interface NodeInputSpecifier {
  readonly nodeId: AnyNodeId;
  readonly name: string;
  readonly matchLevel: "unconnected" | "connected";
}

export interface NodeOutputSpecifier {
  readonly nodeId: AnyNodeId;
  readonly name: string;
  readonly matchLevel: "unconnected" | "connected";
}

export const findAllValidNodeInputs = <
  Input extends z.ZodType,
  Output extends z.ZodType
>(
  graph: Graph,
  nodeId: NodeId<Input, Output>,
  outputName: z.ZodType extends Output ? string : string & keyof z.infer<Output>
): readonly NodeInputSpecifier[] => {
  const node = graph.nodes[nodeId];
  if (!node) return [];
  const definition = getNodeDefinition(node);
  const outputShape = zodShape(definition.output);
  const outputType = assertStrict(
    outputShape[outputName],
    `Output '${outputName}' not found in node '${node.id}'`
  );
  const matchingInputs: NodeInputSpecifier[] = [];
  for (const otherNode of unsafeValues(graph.nodes)) {
    const inputShape = zodShape(getNodeDefinition(otherNode).input);
    for (const inputKey in inputShape) {
      if (inputShape[inputKey] === outputType) {
        matchingInputs.push({
          nodeId: otherNode.id,
          name: inputKey,
          matchLevel:
            otherNode.inputIds[inputKey] != null ? "connected" : "unconnected",
        });
      }
    }
  }
  return matchingInputs;
};

export const findAllValidNodeOutputs = <
  Input extends z.ZodType,
  Output extends z.ZodType
>(
  graph: Graph,
  nodeId: NodeId<Input, Output>,
  inputName: z.ZodType extends Input ? string : string & keyof z.infer<Input>
): readonly NodeOutputSpecifier[] => {
  const node = graph.nodes[nodeId];
  if (!node) return [];
  const definition = getNodeDefinition(node);
  const inputShape = zodShape(definition.input);
  const inputType = assertStrict(
    inputShape[inputName],
    `Input '${inputName}' not found in node '${node.id}'`
  );
  const matchingOutputs: NodeOutputSpecifier[] = [];
  for (const otherNode of unsafeValues(graph.nodes)) {
    const outputShape = zodShape(getNodeDefinition(otherNode).output);
    for (const outputKey in outputShape) {
      if (outputShape[outputKey] === inputType) {
        matchingOutputs.push({
          nodeId: otherNode.id,
          name: outputKey,
          matchLevel:
            otherNode.outputIds[outputKey] != null
              ? "connected"
              : "unconnected",
        });
      }
    }
  }
  return matchingOutputs;
};

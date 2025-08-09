import type { ToolCallOptions } from "ai";
import {
  anthropicLanguageModelNode,
  bedrockLanguageModelNode,
  generateTextNode,
} from "./nodes/generate";
import {
  connectNodes,
  createGraph,
  createNode,
  type AnyGraphNode,
} from "./nodes/node";

type what = Omit<keyof ToolCallOptions, "prompt">

const graph = createGraph();

const bedrockNodeImpl = createNode(
  { id: "model-language-bedrock", definitionId: bedrockLanguageModelNode.id },
  graph
);

const anthropicNodeImpl = createNode(
  {
    id: "model-language-anthropic",
    definitionId: anthropicLanguageModelNode.id,
  },
  graph
);

const generateTextNodeImpl = createNode(
  { id: "generate-text", definitionId: generateTextNode.id },
  graph
);

connectNodes(graph, bedrockNodeImpl, "model", generateTextNodeImpl, "model");

if (false) {
  connectNodes(
    graph,
    bedrockNodeImpl as AnyGraphNode,
    "model",
    generateTextNodeImpl as AnyGraphNode,
    "model"
  );
}

import { bedrock } from "@ai-sdk/amazon-bedrock";
import { anthropic } from "@ai-sdk/anthropic";
import { assemblyai } from "@ai-sdk/assemblyai";
import { azure } from "@ai-sdk/azure";
import { cerebras } from "@ai-sdk/cerebras";
import { cohere } from "@ai-sdk/cohere";
import { deepgram } from "@ai-sdk/deepgram";
import { deepinfra } from "@ai-sdk/deepinfra";
import { deepseek } from "@ai-sdk/deepseek";
import { elevenlabs } from "@ai-sdk/elevenlabs";
import { fal } from "@ai-sdk/fal";
import { fireworks } from "@ai-sdk/fireworks";
import { gateway } from "@ai-sdk/gateway";
import { gladia } from "@ai-sdk/gladia";
import { google } from "@ai-sdk/google";
import { vertex } from "@ai-sdk/google-vertex";
import { groq } from "@ai-sdk/groq";
import { hume } from "@ai-sdk/hume";
import { lmnt } from "@ai-sdk/lmnt";
import { luma } from "@ai-sdk/luma";
import { mistral } from "@ai-sdk/mistral";
import { openai } from "@ai-sdk/openai";
import { perplexity } from "@ai-sdk/perplexity";
import { replicate } from "@ai-sdk/replicate";
import { revai } from "@ai-sdk/revai";
import { togetherai } from "@ai-sdk/togetherai";
import { vercel } from "@ai-sdk/vercel";
import { xai } from "@ai-sdk/xai";
import {
  generateText,
  embed,
  experimental_generateImage as generateImage,
  experimental_transcribe as transcribe,
  experimental_generateSpeech as generateSpeech,
  type TelemetrySettings as UpstreamTelemetrySettings,
  type LanguageModel as UpstreamLanguageModel,
  type EmbeddingModel,
  type ImageModel as UpstreamImageModel,
  type SpeechModel as UpstreamSpeechModel,
  type TranscriptionModel as UpstreamTranscriptionModel,
  type JSONSchema7 as UpstreamJSONSchema7,
  type Output as UpstreamOutput,
  type Tool as UpstreamTool,
  NoSuchToolError,
  InvalidToolInputError,
} from "ai";
import { z } from "zod/v4";
import { createNodeDefinition } from "./node";
import { assertStrict } from "../core";
import { zFunction } from "./sharedTypes";

const ModelParameters = z.object({ modelId: z.string() }).readonly();
type ModelParameters = z.infer<typeof ModelParameters>;

const LanguageModel = z
  .custom<Exclude<UpstreamLanguageModel, string>>()
  .register(z.globalRegistry, {
    id: "LanguageModel",
    title: "LanguageModel",
    description: "Common interface for language models.",
  });
type LanguageModel = z.infer<typeof LanguageModel>;
const LanguageModelResult = z.object({ model: LanguageModel }).readonly();
type LanguageModelResult = z.infer<typeof LanguageModelResult>;

const TextEmbeddingModel = z
  .custom<EmbeddingModel<string>>()
  .register(z.globalRegistry, {
    id: "TextEmbeddingModel",
    title: "TextEmbeddingModel",
    description: "Common interface for text embedding models.",
  });
type TextEmbeddingModel = z.infer<typeof TextEmbeddingModel>;
const TextEmbeddingModelResult = z.object({ model: TextEmbeddingModel });
type TextEmbeddingModelResult = z.infer<typeof TextEmbeddingModelResult>;

const ImageModel = z.custom<UpstreamImageModel>().register(z.globalRegistry, {
  id: "ImageModel",
  title: "ImageModel",
  description: "Common interface for image models.",
});
type ImageModel = z.infer<typeof ImageModel>;
const ImageModelResult = z.object({ model: ImageModel }).readonly();
type ImageModelResult = z.infer<typeof ImageModelResult>;

const SpeechModel = z.custom<UpstreamSpeechModel>().register(z.globalRegistry, {
  id: "SpeechModel",
  title: "SpeechModel",
  description: "Common interface for speech models.",
});
type SpeechModel = z.infer<typeof SpeechModel>;
const SpeechModelResult = z.object({ model: SpeechModel }).readonly();
type SpeechModelResult = z.infer<typeof SpeechModelResult>;

const TranscriptionModel = z
  .custom<UpstreamTranscriptionModel>()
  .register(z.globalRegistry, {
    id: "TranscriptionModel",
    title: "TranscriptionModel",
    description: "Common interface for transcription models.",
  });
type TranscriptionModel = z.infer<typeof TranscriptionModel>;
const TranscriptionModelResult = z.object({ model: TranscriptionModel });
type TranscriptionModelResult = z.infer<typeof TranscriptionModelResult>;

const JSONValue = z
  .union([
    z.null(),
    z.string(),
    z.number(),
    z.boolean(),
    z.record(
      z.string(),
      z.lazy((): z.ZodType<JSONValue> => JSONValue)
    ),
    z.array(z.lazy((): z.ZodType<JSONValue> => JSONValue)),
  ])
  .describe(
    "A JSON value can be a string, number, boolean, object, array, or `null`. JSON values can be serialized and deserialized by the `JSON.stringify` and `JSON.parse` methods."
  );
type JSONValue =
  | null
  | string
  | number
  | boolean
  | { [key: string]: JSONValue }
  | JSONValue[];

const JSONArray = z.array(JSONValue);
type JSONArray = z.infer<typeof JSONArray>;

const ProviderMetadata = z
  .record(z.string(), z.record(z.string(), JSONValue))
  .meta({
    title: "ProviderMetadata",
    description: `\
Additional provider-specific metadata.
Metadata are additional outputs from the provider.
They are passed through to the provider from the AI SDK
and enable provider-specific functionality
that can be fully encapsulated in the provider.

This enables us to quickly ship provider-specific functionality
without affecting the core AI SDK.

The outer record is keyed by the provider name, and the inner
record is keyed by the provider-specific metadata key.

\`\`\`ts
{
  "anthropic": {
    "cacheControl": { "type": "ephemeral" }
  }
}
\`\`\``,
  });
type ProviderMetadata = z.infer<typeof ProviderMetadata>;

const ProviderOptions = z
  .record(z.string(), z.record(z.string(), JSONValue))
  .meta({
    title: "ProviderOptions",
    description: `\
Additional provider-specific options.
Options are additional input to the provider.
They are passed through to the provider from the AI SDK
and enable provider-specific functionality
that can be fully encapsulated in the provider.

This enables us to quickly ship provider-specific functionality
without affecting the core AI SDK.

The outer record is keyed by the provider name, and the inner
record is keyed by the provider-specific metadata key.

\`\`\`ts
{
  "anthropic": {
    "cacheControl": { "type": "ephemeral" }
  }
}
\`\`\``,
  });
type ProviderOptions = z.infer<typeof ProviderOptions>;

const ContentPartSourceUrl = z
  .object({
    type: z.literal("source"),
    sourceType: z
      .literal("url")
      .describe("The type of source - URL sources reference web content."),
    id: z.string().describe("The ID of the source."),
    url: z.string().describe("The URL of the source."),
    title: z.string().optional().describe("The title of the source."),
    providerMetadata: ProviderMetadata.optional().describe(
      "Additional provider metadata for the source."
    ),
  })
  .meta({ title: "ContentPartSourceUrl" });
type ContentPartSourceUrl = z.infer<typeof ContentPartSourceUrl>;

const ContentPartSourceDocument = z
  .object({
    type: z.literal("source"),
    sourceType: z
      .literal("document")
      .describe(
        "The type of source - document sources reference files/documents."
      ),
    id: z.string().describe("The ID of the source."),
    mediaType: z
      .string()
      .describe("IANA media type of the document (e.g., 'application/pdf')."),
    title: z.string().describe("The title of the document."),
    filename: z
      .string()
      .optional()
      .describe("Optional filename of the document."),
    providerMetadata: ProviderMetadata.optional().describe(
      "Additional provider metadata for the source."
    ),
  })
  .meta({ title: "ContentPartSourceDocument" });
type ContentPartSourceDocument = z.infer<typeof ContentPartSourceDocument>;

const GeneratedFile = z
  .object({
    base64: z.string(),
    uint8Array: z.instanceof(Uint8Array<ArrayBufferLike>),
    mediaType: z.string(),
  })
  .meta({
    title: "GeneratedFile",
    description: "A generated file.",
  });
type GeneratedFile = z.infer<typeof GeneratedFile>;

const ContentPartText = z
  .object({
    type: z.literal("text"),
    text: z.string(),
    providerMetadata: ProviderMetadata.optional(),
  })
  .meta({ title: "ContentPartText" });
type ContentPartText = z.infer<typeof ContentPartText>;

const ContentPartReasoning = z
  .object({
    type: z.literal("reasoning"),
    text: z.string(),
    providerMetadata: ProviderMetadata.optional(),
  })
  .meta({ title: "ContentPartReasoning" });
type ContentPartReasoning = z.infer<typeof ContentPartReasoning>;

const ContentPartSource = z
  .discriminatedUnion("sourceType", [
    ContentPartSourceUrl,
    ContentPartSourceDocument,
  ])
  .meta({
    title: "ContentPartSource",
    description: `\
A source that has been used as input to generate the response.
It can be a URL or a document.
Sources are used to provide context to the model and can be referenced in the generated text.`,
  });
type ContentPartSource = z.infer<typeof ContentPartSource>;

const ContentPartFile = z
  .object({
    type: z.literal("file"),
    file: GeneratedFile,
    providerMetadata: ProviderMetadata.optional(),
  })
  .meta({
    title: "ContentPartFile",
  });
type ContentPartFile = z.infer<typeof ContentPartFile>;

const ContentPartToolCall = z
  .object({
    type: z.literal("tool-call"),
    toolCallId: z.string(),
    toolName: z.string(),
    input: z.unknown(),
    providerExecuted: z.boolean().optional(),
    dynamic: z.boolean().optional(),
    providerMetadata: ProviderMetadata.optional(),
  })
  .meta({ title: "ContentPartToolCall" });
type ContentPartToolCall = z.infer<typeof ContentPartToolCall>;

const ContentPartToolResult = z
  .object({
    type: z.literal("tool-result"),
    toolCallId: z.string(),
    toolName: z.string(),
    input: z.unknown(),
    output: z.unknown(),
    providerExecuted: z.boolean().optional(),
    dynamic: z.boolean().optional(),
    providerMetadata: ProviderMetadata.optional(),
  })
  .meta({ title: "ContentPartToolResult" });
type ContentPartToolResult = z.infer<typeof ContentPartToolResult>;

const ContentPartToolError = z
  .object({
    type: z.literal("tool-error"),
    toolCallId: z.string(),
    toolName: z.string(),
    input: z.unknown(),
    error: z.unknown(),
    providerExecuted: z.boolean().optional(),
    dynamic: z.boolean().optional(),
    providerMetadata: ProviderMetadata.optional(),
  })
  .meta({
    title: "ContentPartToolError",
  });
type ContentPartToolError = z.infer<typeof ContentPartToolError>;

const ContentPart = z
  .discriminatedUnion("type", [
    ContentPartText,
    ContentPartReasoning,
    ContentPartSource,
    ContentPartFile,
    ContentPartToolCall,
    ContentPartToolResult,
    ContentPartToolError,
  ])
  .meta({ title: "ContentPart" });
type ContentPart = z.infer<typeof ContentPart>;

const DataContent = z
  .union([
    z.string(),
    z.instanceof(Uint8Array<ArrayBufferLike>),
    z.instanceof(ArrayBuffer),
    z.instanceof(Buffer),
    z.instanceof(URL),
  ])
  .meta({
    title: "DataContent",
    description:
      "Data content that can be used in image or file parts of a prompt. It can be a base64-encoded string, a Uint8Array, an ArrayBuffer.",
  });
type DataContent = z.infer<typeof DataContent>;

const TextPart = z
  .object({
    type: z.literal("text"),
    text: z.string().describe("The text content."),
    providerOptions: ProviderOptions.optional(),
  })
  .meta({
    title: "TextPart",
    description: "Text content part of a prompt. It contains a string of text.",
  });
type TextPart = z.infer<typeof TextPart>;

const ImagePart = z
  .object({
    type: z.literal("image"),
    image: DataContent.or(z.instanceof(URL)).describe(`\
Image data. Can either be:
- data: a base64-encoded string, a Uint8Array, an ArrayBuffer, or a Buffer
- URL: a URL that points to the image`),
    mediaType: z
      .string()
      .optional()
      .describe(
        "Optional IANA media type of the image. See https://www.iana.org/assignments/media-types/media-types.xhtml"
      ),
    providerOptions: ProviderOptions.optional(),
  })
  .meta({
    title: "ImagePart",
    description: "Image content part of a prompt. It contains an image.",
  });
type ImagePart = z.infer<typeof ImagePart>;

const FilePart = z
  .object({
    type: z.literal("file"),
    data: DataContent.or(z.instanceof(URL)).describe(`\
File data. Can either be:
- data: a base64-encoded string, a Uint8Array, an ArrayBuffer, or a Buffer
- URL: a URL that points to the file`),
    filename: z.string().optional().describe("Optional filename of the file."),
    mediaType: z.string().describe(`\
IANA media type of the file.
See https://www.iana.org/assignments/media-types/media-types.xhtml`),
    providerOptions: ProviderOptions.optional(),
  })
  .meta({
    title: "FilePart",
    description: "File content part of a prompt. It contains a file.",
  });
type FilePart = z.infer<typeof FilePart>;

const ReasoningPart = z
  .object({
    type: z.literal("reasoning"),
    text: z.string(),
    providerOptions: ProviderOptions.optional(),
  })
  .meta({ title: "ReasoningPart" });
type ReasoningPart = z.infer<typeof ReasoningPart>;

const ToolCallPart = z
  .object({
    type: z.literal("tool-call"),
    toolCallId: z
      .string()
      .describe(
        "ID of the tool call. This ID is used to match the tool call with the tool result."
      ),
    toolName: z.string().describe("Name of the tool that is being called."),
    input: z
      .unknown()
      .describe(
        "Arguments of the tool call. This is a JSON-serializable object that matches the tool's input schema."
      ),
    providerOptions: ProviderOptions.optional(),
    providerExecuted: z
      .boolean()
      .optional()
      .describe("Whether the tool call was executed by the provider."),
  })
  .meta({
    title: "ToolCallPart",
    description:
      "Tool call content part of a prompt. It contains a tool call (usually generated by the AI model).",
  });
type ToolCallPart = z.infer<typeof ToolCallPart>;

const ToolResultOutputText = z.object({
  type: z.literal("text"),
  value: z.string().describe("Text content of the tool result."),
});
type ToolResultOutputText = z.infer<typeof ToolResultOutputText>;

const ToolResultOutputJSON = z.object({
  type: z.literal("json"),
  value: JSONValue.describe("JSON content of the tool result."),
});
type ToolResultOutputJSON = z.infer<typeof ToolResultOutputJSON>;

const ToolResultOutputErrorText = z.object({
  type: z.literal("error-text"),
  value: z.string().describe("Error text content of the tool result."),
});
type ToolResultOutputErrorText = z.infer<typeof ToolResultOutputErrorText>;

const ToolResultOutputErrorJSON = z.object({
  type: z.literal("error-json"),
  value: JSONValue.describe("Error JSON content of the tool result."),
});
type ToolResultOutputErrorJSON = z.infer<typeof ToolResultOutputErrorJSON>;

const ToolResultOutputContentText = z.object({
  type: z.literal("text"),
  text: z.string().describe("Text content of the tool result part."),
});
type ToolResultOutputContentText = z.infer<typeof ToolResultOutputContentText>;

const ToolResultOutputContentMedia = z.object({
  type: z.literal("media"),
  data: z
    .string()
    .describe(
      "Base-64 encoded media data of the tool result part."
    ),
  mediaType: z
    .string()
    .describe(
      "IANA media type of the tool result part. See https://www.iana.org/assignments/media-types/media-types.xhtml"
    ),
});
type ToolResultOutputContentMedia = z.infer<typeof ToolResultOutputContentMedia>;

const ToolResultOutputContent = z.object({
  type: z.literal("content"),
  value: z.array(z.discriminatedUnion("type", [
    ToolResultOutputContentText,
    ToolResultOutputContentMedia,
  ])),
});
type ToolResultOutputContent = z.infer<typeof ToolResultOutputContent>;

const ToolResultOutput = z.discriminatedUnion("type", [
  ToolResultOutputText,
  ToolResultOutputJSON,
  ToolResultOutputErrorText,
  ToolResultOutputErrorJSON,
  ToolResultOutputContent,
]).meta({
  title: "ToolResultOutput",
  description: "Output of a tool call."
});
type ToolResultOutput = z.infer<typeof ToolResultOutput>;

const ToolResultPart = z
  .object({
    type: z.literal("tool-result"),
    toolCallId: z
      .string()
      .describe("ID of the tool call that this result is associated with."),
    toolName: z
      .string()
      .describe("Name of the tool that generated this result."),
    output: ToolResultOutput
      .describe("Result of the tool call. This is a JSON-serializable object."),
    providerOptions: ProviderOptions.optional(),
  })
  .meta({
    title: "ToolResultPart",
    description:
      "Tool result content part of a prompt. It contains the result of the tool call with the matching ID.",
  });
type ToolResultPart = z.infer<typeof ToolResultPart>;

const FinishReason = z
  .enum([
    "stop",
    "length",
    "content-filter",
    "tool-calls",
    "error",
    "other",
    "unknown",
  ])
  .meta({
    title: "FinishReason",
    description: `\
Reason why a language model finished generating a response.

Can be one of the following:
- \`stop\`: model generated stop sequence
- \`length\`: model generated maximum number of tokens
- \`content-filter\`: content filter violation stopped the model
- \`tool-calls\`: model triggered tool calls
- \`error\`: model stopped because of an error
- \`other\`: model stopped for other reasons
- \`unknown\`: the model has not transmitted a finish reason`,
  });
type FinishReason = z.infer<typeof FinishReason>;

const AssistantContent = z
  .union([
    z.string(),
    z.array(
      z.union([TextPart, FilePart, ReasoningPart, ToolCallPart, ToolResultPart])
    ),
  ])
  .meta({
    title: "AssistantContent",
    description: `\
Content of an assistant message.
It can be a string or an array of text, image, reasoning, redacted reasoning, and tool call parts.`,
  });
type AssistantContent = z.infer<typeof AssistantContent>;

const AssistantModelMessage = z
  .object({
    role: z.literal("assistant"),
    content: AssistantContent,
    providerOptions: ProviderOptions.optional(),
  })
  .meta({
    title: "AssistantModelMessage",
    description:
      "An assistant message. It can contain text, tool calls, or a combination of text and tool calls.",
  });
type AssistantModelMessage = z.infer<typeof AssistantModelMessage>;

const ToolContent = z.array(ToolResultPart).meta({
  title: "ToolContent",
  description:
    "Content of a tool message. It is an array of tool result parts.",
});
type ToolContent = z.infer<typeof ToolContent>;

const ToolModelMessage = z
  .object({
    role: z.literal("tool"),
    content: ToolContent,
    providerOptions: ProviderOptions.optional(),
  })
  .meta({
    title: "ToolModelMessage",
    description:
      "A tool message. It contains the result of one or more tool calls.",
  });
type ToolModelMessage = z.infer<typeof ToolModelMessage>;

const ResponseMessage = z
  .discriminatedUnion("role", [AssistantModelMessage, ToolModelMessage])
  .meta({
    title: "ResponseMessage",
    description:
      "A message that was generated during the generation process. It can be either an assistant message or a tool message.",
  });
type ResponseMessage = z.infer<typeof ResponseMessage>;

const LanguageModelUsage = z
  .object({
    inputTokens: z
      .number()
      .optional()
      .describe("The number of input (prompt) tokens used."),
    outputTokens: z
      .number()
      .optional()
      .describe("The number of output (completion) tokens used."),
    totalTokens: z
      .number()
      .optional()
      .describe(
        "The total number of tokens as reported by the provider. This number might be different from the sum of `inputTokens` and `outputTokens` and e.g. include reasoning tokens or other overhead."
      ),
    reasoningTokens: z
      .number()
      .optional()
      .describe("The number of reasoning tokens used."),
    cachedInputTokens: z
      .number()
      .optional()
      .describe("The number of cached input tokens."),
  })
  .meta({
    title: "LanguageModelUsage",
    description: `\
Usage information for a language model call.

If your API return additional usage information, you can add it to the provider metadata under your provider's key.`,
  });
type LanguageModelUsage = z.infer<typeof LanguageModelUsage>;

const LanguageModelRequestMetadata = z
  .object({
    body: z
      .unknown()
      .optional()
      .describe("Request HTTP body that was sent to the provider API."),
  })
  .meta({
    title: "LanguageModelRequestMetadata",
    description:
      "Metadata about the request sent to the language model provider API.",
  });
type LanguageModelRequestMetadata = z.infer<
  typeof LanguageModelRequestMetadata
>;

const LanguageModelResponseMetadata = z
  .object({
    id: z.string().describe("ID for the generated response."),
    timestamp: z
      .instanceof(Date)
      .describe("Timestamp for the start of the generated response."),
    modelId: z
      .string()
      .describe(
        "The ID of the response model that was used to generate the response."
      ),
    headers: z
      .record(z.string(), z.string())
      .optional()
      .describe(
        "Response headers (available only for providers that use HTTP requests)."
      ),
  })
  .meta({
    title: "LanguageModelResponseMetadata",
    description:
      "Metadata about the response received from the language model provider API.",
  });
type LanguageModelResponseMetadata = z.infer<
  typeof LanguageModelResponseMetadata
>;

const LanguageModelResponseMetadataWithMessagesAndBody =
  LanguageModelResponseMetadata.extend({
    messages: z.array(ResponseMessage).describe(
      `\
The response messages that were generated during the call. It consists of an assistant message, potentially containing tool calls.

When there are tool results, there is an additional tool message with the tool results that are available. If there are tools that do not have execute functions, they are not included in the tool results and need to be added separately.`
    ),
    body: z
      .unknown()
      .optional()
      .describe(
        "Response body (available only for providers that use HTTP requests)."
      ),
  }).meta({
    title: "LanguageModelResponseMetadataWithMessagesAndBody",
    description:
      "Metadata about the response received from the language model provider API",
  });
type LanguageModelResponseMetadataWithMessagesAndBody = z.infer<
  typeof LanguageModelResponseMetadataWithMessagesAndBody
>;

export const JSONSchema7 = z.custom<UpstreamJSONSchema7>().meta({
  id: "JSONSchema7",
  title: "JSONSchema7",
  description: `\
A JSON Schema 7 object that describes the input schema of a tool and/or the output schema of the LLM.
It is used to validate the input of the tool and to provide suggestions for the input.`,
});
export type JSONSchema7 = z.infer<typeof JSONSchema7>;

const FunctionTool = z
  .object({
    type: z.literal("function"),
    name: z
      .string()
      .describe("The name of the tool. Unique within this model call."),
    description: z
      .string()
      .optional()
      .describe(
        "A description of the tool. The language model uses this to understand the tool's purpose and to provide better completion suggestions."
      ),
    inputSchema: JSONSchema7.describe(
      "The parameters that the tool expects. The language model uses this to understand the tool's input requirements and to provide matching suggestions."
    ),
    providerOptions: ProviderOptions.optional(),
  })
  .meta({
    title: "FunctionTool",
    description: `\
A tool has a name, a description, and a set of parameters.

Note: this is **not** the user-facing tool definition. The AI SDK methods will
map the user-facing tool definitions to this format.`,
  });
type FunctionTool = z.infer<typeof FunctionTool>;

const ProviderDefinedTool = z.object({
  type: z.literal("provider-defined"),
  id: z
    .string()
    .describe(
      "The ID of the tool. Should follow the format `<provider-name>.<unique-tool-name>`."
    ),
  name: z
    .string()
    .describe("The name of the tool that the user must use in the tool set."),
  args: z
    .record(z.string(), z.unknown())
    .describe(
      "The arguments for configuring the tool. Must match the expected arguments defined by the provider for this tool."
    ),
});
type ProviderDefinedTool = z.infer<typeof ProviderDefinedTool>;

const CallWarningUnsupportedSetting = z.object({
  type: z.literal("unsupported-setting"),
  // Workaround for a bug in `ai` which incorrectly uses `Omit` instead of `Exclude`.
  // See https://github.com/vercel/ai/issues/7906 to track the issue.
  // Once fixed, we can remove this workaround.
  setting: z.custom<Omit<string, "prompt">>((x) => typeof x),
  details: z.string().optional(),
});
type CallWarningUnsupportedSetting = z.infer<
  typeof CallWarningUnsupportedSetting
>;

const CallWarningUnsupportedTool = z.object({
  type: z.literal("unsupported-tool"),
  tool: z.union([FunctionTool, ProviderDefinedTool]),
  details: z.string().optional(),
});
type CallWarningUnsupportedTool = z.infer<typeof CallWarningUnsupportedTool>;

const CallWarningOther = z
  .object({
    type: z.literal("other"),
    message: z.string(),
  })
  .meta({ title: "CallWarningOther" });
type CallWarningOther = z.infer<typeof CallWarningOther>;

const CallWarning = z
  .discriminatedUnion("type", [
    CallWarningUnsupportedSetting,
    CallWarningUnsupportedTool,
    CallWarningOther,
  ])
  .meta({
    title: "CallWarning",
    description:
      "Warning from the model provider for this call. The call will proceed, but e.g. some settings might not be supported, which can lead to suboptimal results.",
  });
type CallWarning = z.infer<typeof CallWarning>;

const StepResult = z
  .object({
    content: z
      .array(ContentPart)
      .describe("The content that was generated in the last step."),
    text: z
      .string()
      .describe("The generated text that was generated in the last step."),
    reasoning: z
      .array(ReasoningPart)
      .describe(
        "The full reasoning that the model has generated in the last step."
      ),
    reasoningText: z
      .string()
      .optional()
      .describe(
        "The reasoning text that the model has generated in the last step. Can be undefined if the model has only generated text."
      ),
    files: z
      .array(GeneratedFile)
      .describe(
        "The files that were generated in the last step. Empty array if no files were generated."
      ),
    sources: z
      .array(ContentPartSource)
      .describe("Sources that have been used as references in the last step."),
    toolCalls: z
      .array(ContentPartToolCall)
      .describe("The tool calls that were made in the last step."),
    staticToolCalls: z
      .array(ContentPartToolCall)
      .describe("The static tool calls that were made in the last step."),
    dynamicToolCalls: z
      .array(ContentPartToolCall)
      .describe("The dynamic tool calls that were made in the last step."),
    toolResults: z
      .array(ContentPartToolResult)
      .describe("The results of the tool calls from the last step."),
    staticToolResults: z
      .array(ContentPartToolResult)
      .describe("The static tool results that were made in the last step."),
    dynamicToolResults: z
      .array(ContentPartToolResult)
      .describe("The dynamic tool results that were made in the last step."),
    finishReason: FinishReason,
    usage: LanguageModelUsage,
    warnings: z
      .array(CallWarning)
      .optional()
      .describe(
        "Warnings from the model provider (e.g. unsupported settings)."
      ),
    request: LanguageModelRequestMetadata,
    response: LanguageModelResponseMetadataWithMessagesAndBody,
    providerMetadata: ProviderMetadata.optional(),
  })
  .meta({
    title: "StepResult",
    description: "The result of a single step in the generation process.",
  });
type StepResult = z.infer<typeof StepResult>;

const GenerateTextResult = StepResult.extend({
  totalUsage: LanguageModelUsage,
  steps: z.array(StepResult).readonly(),
  experimental_output: z
    .unknown()
    .describe(
      "The generated structured output. It uses the `experimental_output` specification."
    ),
}).meta({
  title: "GenerateTextResult",
  description: `\
The result of a \`generateText\` call.
It contains the generated text, the tool calls that were made during the generation, and the results of the tool calls.`,
});
type GenerateTextResult = z.infer<typeof GenerateTextResult>;

const Embedding = z.array(z.number()).meta({
  title: "Embedding",
  description:
    "An embedding is a vector, i.e. an array of numbers. It is e.g. used to represent a text as a vector of word embeddings.",
});
type Embedding = z.infer<typeof Embedding>;

const EmbeddingModelUsage = z
  .object({
    tokens: z
      .number()
      .describe("The number of tokens used in the embedding.")
      .optional(),
  })
  .meta({
    title: "EmbeddingModelUsage",
    description: "Represents the number of tokens used in an embedding.",
  });
type EmbeddingModelUsage = z.infer<typeof EmbeddingModelUsage>;

const TextEmbeddingResult = z
  .object({
    // This is the generic parameter `VALUE` of the `EmbedResult` interface.
    // For text embeddings, it is always a string.
    value: z.string().describe("The value that was embedded."),
    embedding: Embedding,
    usage: EmbeddingModelUsage,
    providerMetadata: ProviderMetadata.optional(),
    response: z
      .object({
        headers: z
          .record(z.string(), z.string())
          .optional()
          .describe("The response headers."),
        body: z.unknown().optional().describe("The response body."),
      })
      .optional()
      .describe("Optional response data."),
  })
  .meta({
    title: "TextEmbeddingResult",
    description:
      "The result of an `embed` call for text embeddings. It contains the embedding, the value, and additional information.",
  });
type TextEmbeddingResult = z.infer<typeof TextEmbeddingResult>;

const GenerationWarningUnsupportedSetting = z
  .object({
    type: z.literal("unsupported-setting"),
    setting: z.string().describe("The name of the unsupported setting."),
    details: z
      .string()
      .optional()
      .describe("Additional details about the warning."),
  })
  .meta({ title: "GenerationWarningUnsupportedSetting" });
type GenerationWarningUnsupportedSetting = z.infer<
  typeof GenerationWarningUnsupportedSetting
>;

const GenerationWarningOther = z
  .object({
    type: z.literal("other"),
    message: z.string().describe("The warning message."),
  })
  .meta({ title: "ImageGenerationWarningOther" });
type GenerationWarningOther = z.infer<typeof GenerationWarningOther>;

// NOTE: Split this type back up when the types of generation warnings diverge between image and speech models.
const GenerationWarning = z
  .discriminatedUnion("type", [
    GenerationWarningUnsupportedSetting,
    GenerationWarningOther,
  ])
  .meta({
    title: "GenerationWarning",
    description:
      "A warning from the model provider for this call. The call will proceed, but e.g. some settings might not be supported, which can lead to suboptimal results.",
  });
type GenerationWarning = z.infer<typeof GenerationWarning>;

const ImageModelResponseMetadata = z
  .object({
    timestamp: z
      .instanceof(Date)
      .describe("Timestamp for the start of the response."),
    modelId: z
      .string()
      .describe(
        "The ID of the response model that was used to generate the response."
      ),
    headers: z
      .record(z.string(), z.string())
      .optional()
      .describe("Response headers from the provider API."),
  })
  .meta({
    title: "ImageModelResponseMetadata",
    description:
      "Metadata about the response received from the image model provider API.",
  });
type ImageModelResponseMetadata = z.infer<typeof ImageModelResponseMetadata>;

const ImageModelProviderMetadata = z
  .record(
    z.string(),
    z
      .object({
        images: JSONArray,
      })
      .and(JSONValue)
  )
  .meta({
    title: "ImageModelProviderMetadata",
    description:
      "Provider-specific metadata for image models. It contains the images that were generated and any additional metadata that the provider wants to include.",
  });
type ImageModelProviderMetadata = z.infer<typeof ImageModelProviderMetadata>;

const GenerateImageResult = z
  .object({
    image: GeneratedFile.describe("The first image that was generated."),
    images: z.array(GeneratedFile).describe("The images that were generated."),
    warnings: z
      .array(GenerationWarning)
      .describe("Warnings for the call, e.g. unsupported settings."),
    responses: z
      .array(ImageModelResponseMetadata)
      .describe(
        "Response metadata from the provider. There may be multiple responses if we made multiple calls to the model."
      ),
    providerMetadata: ImageModelProviderMetadata.describe(
      "Provider-specific metadata. They are passed through from the provider to the AI SDK and enable provider-specific results that can be fully encapsulated in the provider."
    ),
  })
  .meta({
    title: "GenerateImageResult",
    description:
      "The result of a `generateImage` call. It contains the generated images and additional information.",
  });
type GenerateImageResult = z.infer<typeof GenerateImageResult>;

const GeneratedAudioFile = GeneratedFile.extend({
  format: z
    .string()
    .describe("Audio format of the file (e.g., 'mp3', 'wav', etc.)"),
}).meta({
  title: "GeneratedAudioFile",
  description: "A generated audio file.",
});
type GeneratedAudioFile = z.infer<typeof GeneratedAudioFile>;

const SpeechModelResponseMetadata = z
  .object({
    timestamp: z
      .instanceof(Date)
      .describe("Timestamp for the start of the generated response."),
    modelId: z
      .string()
      .describe(
        "The ID of the response model that was used to generate the response."
      ),
    headers: z
      .record(z.string(), z.string())
      .optional()
      .describe("Response headers from the provider API."),
    body: z
      .unknown()
      .optional()
      .describe("Response body from the provider API."),
  })
  .meta({
    title: "SpeechModelResponseMetadata",
    description:
      "Metadata about the response received from the speech model provider API.",
  });
type SpeechModelResponseMetadata = z.infer<typeof SpeechModelResponseMetadata>;

const GenerateSpeechResult = z
  .object({
    audio: GeneratedAudioFile.describe(
      "The audio data as a base64 encoded string or binary data."
    ),
    warnings: z
      .array(GenerationWarning)
      .describe("Warnings for the call, e.g. unsupported settings."),
    responses: z
      .array(SpeechModelResponseMetadata)
      .describe(
        "Response metadata from the provider. There may be multiple responses if we made multiple calls to the model."
      ),
    providerMetadata: ProviderMetadata.describe(
      "Provider metadata from the provider."
    ),
  })
  .meta({
    title: "GenerateSpeechResult",
    description:
      "The result of a `generateSpeech` call. It contains the audio data and additional information.",
  });
type GenerateSpeechResult = z.infer<typeof GenerateSpeechResult>;

const TranscriptionModelResponseMetadata = z
  .object({
    timestamp: z
      .instanceof(Date)
      .describe("Timestamp for the start of the generated response."),
    modelId: z
      .string()
      .describe(
        "The ID of the response model that was used to generate the response."
      ),
    headers: z
      .record(z.string(), z.string())
      .optional()
      .describe("Response headers from the provider API."),
  })
  .meta({
    title: "TranscriptionModelResponseMetadata",
    description:
      "Metadata about the response received from the transcription model provider API.",
  });
type TranscriptionModelResponseMetadata = z.infer<
  typeof TranscriptionModelResponseMetadata
>;

const TranscriptionSegment = z
  .object({
    text: z.string().describe("The text content of this segment."),
    startSecond: z
      .number()
      .describe("The start time of this segment in seconds."),
    endSecond: z.number().describe("The end time of this segment in seconds."),
  })
  .meta({
    title: "TranscriptionSegment",
    description: "A segment of the transcription with timing information.",
  });
type TranscriptionSegment = z.infer<typeof TranscriptionSegment>;

const TranscriptionResult = z
  .object({
    text: z.string().describe("The complete transcribed text from the audio."),
    segments: z
      .array(TranscriptionSegment)
      .describe(
        "Array of transcript segments with timing information. Each segment represents a portion of the transcribed text with start and end times."
      ),
    language: z
      .string()
      .optional()
      .describe(
        "The detected language of the audio content, as an ISO-639-1 code (e.g., 'en' for English). May be undefined if the language couldn't be detected."
      ),
    durationInSeconds: z
      .number()
      .optional()
      .describe(
        "The total duration of the audio file in seconds. May be undefined if the duration couldn't be determined."
      ),
    warnings: z
      .array(GenerationWarning)
      .describe("Warnings for the call, e.g. unsupported settings."),
    responses: z
      .array(TranscriptionModelResponseMetadata)
      .describe(
        "Response metadata from the provider. There may be multiple responses if we made multiple calls to the model."
      ),
    providerMetadata: ProviderMetadata,
  })
  .meta({
    title: "TranscriptionResult",
    description:
      "The result of a `transcribe` call. It contains the transcribed text, segments, and additional information.",
  });
type TranscriptionResult = z.infer<typeof TranscriptionResult>;

const SystemModelMessage = z
  .object({
    role: z.literal("system"),
    content: z.string(),
    providerOptions: ProviderOptions.optional(),
  })
  .meta({
    title: "SystemModelMessage",
    description:
      "A system message. It can contain system information.\n\n**Note:** using the `system` part of the prompt is strongly preferred to increase the resilience against prompt injection attacks, and because not all providers support several system messages.",
  });
type SystemModelMessage = z.infer<typeof SystemModelMessage>;

const UserContent = z
  .union([z.string(), z.array(TextPart.or(ImagePart).or(FilePart))])
  .meta({
    title: "UserContent",
    description:
      "Content of a user message. It can be a string or an array of text and image parts.",
  });
type UserContent = z.infer<typeof UserContent>;

const UserModelMessage = z
  .object({
    role: z.literal("user"),
    content: UserContent,
    providerOptions: ProviderOptions.optional(),
  })
  .meta({
    title: "UserModelMessage",
    description:
      "A user message. It can contain text or a combination of text and images.",
  });
type UserModelMessage = z.infer<typeof UserModelMessage>;

const ModelMessage = z
  .discriminatedUnion("role", [
    SystemModelMessage,
    UserModelMessage,
    AssistantModelMessage,
    ToolModelMessage,
  ])
  .meta({
    title: "ModelMessage",
    description:
      "A message that can be used in the `messages` field of a prompt. It can be a user message, an assistant message, or a tool message.",
  });
type ModelMessage = z.infer<typeof ModelMessage>;

const CallSettings = z
  .object({
    maxOutputTokens: z
      .int()
      .min(0)
      .optional()
      .describe("Maximum number of tokens to generate."),
    temperature: z
      .number()
      .optional()
      .describe(
        "Temperature setting. The range depends on the provider and model."
      ),
    topP: z
      .number()
      .optional()
      .describe(
        "Nucleus sampling. This is a number between 0 and 1. E.g. 0.1 would mean that only tokens with the top 10% probability mass are considered."
      ),
    topK: z
      .number()
      .optional()
      .describe(
        "Only sample from the top K options for each subsequent token. Used to remove 'long tail' low probability responses."
      ),
    presencePenalty: z
      .number()
      .optional()
      .describe(
        "Presence penalty setting. It affects the likelihood of the model to repeat information that is already in the prompt."
      ),
    frequencyPenalty: z
      .number()
      .optional()
      .describe(
        "Frequency penalty setting. It affects the likelihood of the model to repeatedly use the same words or phrases."
      ),
    stopSequences: z
      .array(z.string())
      .optional()
      .describe(
        "Stop sequences for the model. If set, the model will stop generating text when one of the stop sequences is generated."
      ),
    seed: z
      .number()
      .int()
      .optional()
      .describe(
        "The seed (integer) to use for random sampling. If set and supported by the model, calls will generate deterministic results."
      ),
    maxRetries: z
      .number()
      .int()
      .min(0)
      .default(2)
      .optional()
      .describe("Maximum number of retries. Set to 0 to disable retries."),
    abortSignal: z
      .instanceof(AbortSignal)
      .optional()
      .describe("Abort signal for the call."),
    headers: z
      .record(z.string(), z.string().optional())
      .optional()
      .describe(
        "Additional HTTP headers to be sent with the request. Only applicable for HTTP-based providers."
      ),
  })
  .meta({
    title: "CallSettings",
    description:
      "Settings for a call to a language model or a tool. It includes parameters like temperature, topP, and stop sequences.",
  });
type CallSettings = z.infer<typeof CallSettings>;

const Prompt = z
  .object({
    system: z.string().optional().describe(
      "System message to include in the prompt. Can be used with `prompt` or `messages`."
    ),
    prompt: z
      .union([z.string(), z.array(ModelMessage)])
      .optional()
      .describe(
        "A prompt. It can be either a text prompt or a list of messages. You can either use `prompt` or `messages` but not both."
      ),
    messages: z
      .array(ModelMessage)
      .optional()
      .describe(
        "A list of messages. You can either use `prompt` or `messages` but not both."
      ),
  })
  .meta({
    title: "Prompt",
    description:
      "Prompt part of the AI function options. It contains a system message, a simple text prompt, or a list of messages.",
  });
type Prompt = z.infer<typeof Prompt>;

const ToolChoice = z
  .union([
    z.literal("auto"),
    z.literal("none"),
    z.literal("required"),
    z.object({ type: z.literal("tool"), toolName: z.string() }),
  ])
  .meta({
    title: "ToolChoice",
    description: `\
Tool choice for the generation. It supports the following settings:
- \`auto\` (default): the model can choose whether and which tools to call.
- \`required\`: the model must call a tool. It can choose which tool to call.
- \`none\`: the model must not call tools
- \`{ type: 'tool', toolName: string (typed) }\`: the model must call the specified tool`,
  });
type ToolChoice = z.infer<typeof ToolChoice>;

const StopCondition = zFunction<
  (options: { steps: Array<StepResult> }) => PromiseLike<boolean> | boolean
>().meta({
  title: "StopCondition",
  description:
    "A function that determines whether to stop the generation based on the current steps.",
});
type StopCondition = z.infer<typeof StopCondition>;

const AttributeValue = z
  .union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.string().nullable().optional()),
    z.array(z.number().nullable().optional()),
    z.array(z.boolean().nullable().optional()),
  ])
  .meta({
    title: "AttributeValue",
    description:
      "Attribute values may be any non-nullish primitive value except an object.\n\n`null` or `undefined` attribute values are invalid and will result in undefined behavior.",
  });
type AttributeValue = z.infer<typeof AttributeValue>;

const Tracer = z.custom<UpstreamTelemetrySettings["tracer"]>().meta({
  title: "Tracer",
  description: "An interface for creating spans in the telemetry system.",
});
type Tracer = z.infer<typeof Tracer>;

const TelemetrySettings = z
  .object({
    isEnabled: z
      .boolean()
      .optional()
      .describe(
        "Enable or disable telemetry. Disabled by default while experimental."
      ),
    recordInputs: z
      .boolean()
      .optional()
      .describe(
        "Enable or disable input recording. Enabled by default.\n\nYou might want to disable input recording to avoid recording sensitive information, to reduce data transfers, or to increase performance."
      ),
    recordOutputs: z
      .boolean()
      .optional()
      .describe(
        "Enable or disable output recording. Enabled by default.\n\nYou might want to disable output recording to avoid recording sensitive information, to reduce data transfers, or to increase performance."
      ),
    functionId: z
      .string()
      .optional()
      .describe(
        "Identifier for this function. Used to group telemetry data by function."
      ),
    metadata: z
      .record(z.string(), AttributeValue)
      .optional()
      .describe("Additional information to include in the telemetry data."),
    tracer: Tracer.optional(),
  })
  .meta({
    title: "TelemetrySettings",
    description:
      "Configuration for telemetry. It is experimental and subject to change.",
  });
type TelemetrySettings = z.infer<typeof TelemetrySettings>;

const Output = z.custom<UpstreamOutput.Output<unknown, unknown>>().meta({
  title: "Output",
  description:
    "Specification for parsing structured outputs from the LLM response. It is experimental and subject to change.",
  id: "Output",
});
type Output = z.infer<typeof Output>;

type PrepareStepResult =
  | {
      model?: LanguageModel | string;
      toolChoice?: ToolChoice;
      activeTools?: Array<string>;
      system?: string;
      messages?: Array<ModelMessage>;
    }
  | undefined;

const PrepareStepFunction = zFunction<
  (options: {
    steps: Array<StepResult>;
    stepNumber: number;
    model: LanguageModel | string;
    messages: Array<ModelMessage>;
  }) => PromiseLike<PrepareStepResult> | PrepareStepResult
>().meta({
  title: "PrepareStepFunction",
  description:
    "A function that is called before each step to prepare the settings for the step.",
});
type PrepareStepFunction = z.infer<typeof PrepareStepFunction>;

const ToolCallOptions = z
  .object({
    toolCallId: z
      .string()
      .describe(
        "The ID of the tool call. You can use it e.g. when sending tool-call related information with stream data."
      ),
    messages: z
      .array(ModelMessage)
      .describe(
        "Messages that were sent to the language model to initiate the response that contained the tool call.\nThe messages **do not** include the system prompt nor the assistant response that contained the tool call."
      ),
    abortSignal: z
      .instanceof(AbortSignal)
      .optional()
      .describe(
        "An optional abort signal that indicates that the overall operation should be aborted."
      ),
  })
  .meta({
    title: "ToolCallOptions",
    description:
      "Options for a tool call, including the tool call ID, messages, and an optional abort signal.",
  });
type ToolCallOptions = z.infer<typeof ToolCallOptions>;

const Tool = z.custom<UpstreamTool>().meta({
  title: "Tool",
  description:
    "A tool that can be called by the language model. It can be a function tool or a provider-defined tool.",
});
type Tool = z.infer<typeof Tool>;

const ToolSet = z.record(z.string(), Tool).meta({
  title: "ToolSet",
  description:
    "A set of tools that can be called by the language model. It is a record of tool names to tool definitions.",
});
type ToolSet = z.infer<typeof ToolSet>;

const ToolCallRepairFunction = zFunction<
  (options: {
    system: string | undefined;
    messages: ModelMessage[];
    toolCall: ContentPartToolCall;
    tools: ToolSet;
    inputSchema: (options: { toolName: string }) => JSONSchema7;
    error: NoSuchToolError | InvalidToolInputError;
  }) => Promise<(Omit<ContentPartToolCall, 'input'> & { input: string; }) | null>
>().meta({
  title: "ToolCallRepairFunction",
  description:
    "A function that attempts to repair a tool call that failed to parse.\n\nIt receives the error and the context as arguments and returns the repaired tool call JSON as text.",
});
type ToolCallRepairFunction = z.infer<typeof ToolCallRepairFunction>;

const GenerateTextOnStepFinishCallback = zFunction<
  (stepResult: StepResult) => Promise<void> | void
>().meta({
  title: "GenerateTextOnStepFinishCallback",
  description:
    "Callback that is called when each step (LLM call) is finished, including intermediate steps.",
});
type GenerateTextOnStepFinishCallback = z.infer<
  typeof GenerateTextOnStepFinishCallback
>;


  const GenerateTextParameters = CallSettings.extend(Prompt.shape)
    .extend({
      model: LanguageModel,
      tools: ToolSet.optional().describe(
        "The tools that the model can call. The model needs to support calling tools."
      ),
      toolChoice: ToolChoice.optional().describe(
        "The tool choice strategy. Default: 'auto'."
      ),
      stopWhen: z
        .union([StopCondition, z.array(StopCondition)]).describe(
          "Condition for stopping the generation when there are tool results in the last step. When the condition is an array, any of the conditions can be met to stop the generation. Default: `stepCountIs(1)`"),
      experimental_telemetry: TelemetrySettings.optional(),
      providerOptions: ProviderOptions.optional(),
      activeTools: z.array(z.string()).optional().describe(
        "Limits the tools that are available for the model to call without changing the tool call and result types in the result."
      ),
      experimental_output: Output.optional().describe(
        "Specification for parsing structured outputs from the LLM response."
      ),
      prepareStep: PrepareStepFunction.optional(),
      experimental_repairToolCall: ToolCallRepairFunction.optional(),
      onStepFinish: GenerateTextOnStepFinishCallback.optional(),
    })
    .meta({
      title: "GenerateTextParameters",
      description: "Parameters for the `generateText` function.",
    });
type GenerateTextParameters = z.infer<typeof GenerateTextParameters>;


const TextEmbedParameters = z
  .object({
    model: TextEmbeddingModel,
    value: z.string().describe(
      "The value that should be embedded."
    ),
    maxRetries: z
      .int()
      .min(0)
      .optional()
      .describe("Maximum number of retries per embedding model call. Set to 0 to disable retries."),
    abortSignal: z
      .instanceof(AbortSignal)
      .optional()
      .describe("Abort signal for the embedding call."),
    headers: z
      .record(z.string(), z.string())
      .optional()
      .describe(
        "Additional headers to include in the request. Only applicable for HTTP-based providers."
      ),
    providerOptions: ProviderOptions.optional(),
    experimental_telemetry: TelemetrySettings.optional(),
  })
  .meta({
    title: "TextEmbedParameters",
    description:
      "Parameters for the `embed` function for text embeddings. It includes the model, value, and additional options.",
  });
type TextEmbedParameters = z.infer<typeof TextEmbedParameters>;

// TODO: Add the rest of the parameters to all `generate` nodes

export const generateTextNode = createNodeDefinition({
  id: "generate-text",
  tags: ["generate.text"],
  input: GenerateTextParameters,
  output: GenerateTextResult,
  function: async (params) => generateText(params),
});

export const textEmbeddingNode = createNodeDefinition({
  id: "text-embedding",
  tags: ["text.embedding"],
  input: TextEmbedParameters,
  output: TextEmbeddingResult,
  function: embed<string>,
});

export const generateImageNode = createNodeDefinition({
  id: "generate-image",
  tags: ["generate.image"],
  input: z.object({ model: ImageModel, prompt: z.string() }),
  output: GenerateImageResult,
  function: generateImage,
});

export const generateSpeechNode = createNodeDefinition({
  id: "generate-speech",
  tags: ["generate.speech"],
  input: z.object({ model: SpeechModel, text: z.string() }),
  output: GenerateSpeechResult,
  function: generateSpeech,
});

export const transcribeNode = createNodeDefinition({
  id: "transcribe",
  tags: ["transcribe"],
  // TODO: Figure out UI for `DataContent` and `URL` inputs
  input: z.object({
    model: TranscriptionModel,
    audio: DataContent.or(z.instanceof(URL)),
  }),
  output: TranscriptionResult,
  function: transcribe,
});

export const bedrockLanguageModelNode = createNodeDefinition({
  id: "model-language-bedrock",
  tags: ["model.language", "provider.amazonbedrock"],
  input: ModelParameters,
  output: LanguageModelResult,
  function: async ({ modelId }) => ({ model: bedrock.languageModel(modelId) }),
});

export const bedrockTextEmbeddingModelNode = createNodeDefinition({
  id: "model-textembedding-bedrock",
  tags: ["model.textembedding", "provider.amazonbedrock"],
  input: ModelParameters,
  output: TextEmbeddingModelResult,
  function: async ({ modelId }) => ({
    model: bedrock.textEmbeddingModel(modelId),
  }),
});

export const bedrockImageModelNode = createNodeDefinition({
  id: "model-image-bedrock",
  tags: ["model.image", "provider.amazonbedrock"],
  input: ModelParameters,
  output: ImageModelResult,
  function: async ({ modelId }) => ({ model: bedrock.imageModel(modelId) }),
});

export const bedrockSpeechModelNode = createNodeDefinition({
  id: "model-speech-bedrock",
  tags: ["model.speech", "provider.amazonbedrock"],
  input: ModelParameters,
  output: SpeechModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      bedrock.speechModel,
      "Amazon Bedrock does not support speech synthesis"
    )(modelId),
  }),
});

export const bedrockTranscriptionModelNode = createNodeDefinition({
  id: "model-transcription-bedrock",
  tags: ["model.transcription", "provider.amazonbedrock"],
  input: ModelParameters,
  output: TranscriptionModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      bedrock.transcriptionModel,
      "Amazon Bedrock does not support transcription"
    )(modelId),
  }),
});

export const anthropicLanguageModelNode = createNodeDefinition({
  id: "model-language-anthropic",
  tags: ["model.language", "provider.anthropic"],
  input: ModelParameters,
  output: LanguageModelResult,
  function: async ({ modelId }) => ({
    model: anthropic.languageModel(modelId),
  }),
});

export const anthropicTextEmbeddingModelNode = createNodeDefinition({
  id: "model-textembedding-anthropic",
  tags: ["model.textembedding", "provider.anthropic"],
  input: ModelParameters,
  output: TextEmbeddingModelResult,
  function: async ({ modelId }) => ({
    model: anthropic.textEmbeddingModel(modelId),
  }),
});

export const anthropicImageModelNode = createNodeDefinition({
  id: "model-image-anthropic",
  tags: ["model.image", "provider.anthropic"],
  input: ModelParameters,
  output: ImageModelResult,
  function: async ({ modelId }) => ({
    model: anthropic.imageModel(modelId),
  }),
});

export const anthropicSpeechModelNode = createNodeDefinition({
  id: "model-speech-anthropic",
  tags: ["model.speech", "provider.anthropic"],
  input: ModelParameters,
  output: SpeechModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      anthropic.speechModel,
      "Anthropic does not support speech synthesis"
    )(modelId),
  }),
});

export const anthropicTranscriptionModelNode = createNodeDefinition({
  id: "model-transcription-anthropic",
  tags: ["model.transcription", "provider.anthropic"],
  input: ModelParameters,
  output: TranscriptionModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      anthropic.transcriptionModel,
      "Anthropic does not support transcription"
    )(modelId),
  }),
});

export const assemblyaiLanguageModelNode = createNodeDefinition({
  id: "model-language-assemblyai",
  tags: ["model.language", "provider.assemblyai"],
  input: ModelParameters,
  output: LanguageModelResult,
  function: async ({ modelId }) => ({
    model: assemblyai.languageModel(modelId),
  }),
});

export const assemblyaiTextEmbeddingModelNode = createNodeDefinition({
  id: "model-textembedding-assemblyai",
  tags: ["model.textembedding", "provider.assemblyai"],
  input: ModelParameters,
  output: TextEmbeddingModelResult,
  function: async ({ modelId }) => ({
    model: assemblyai.textEmbeddingModel(modelId),
  }),
});

export const assemblyaiImageModelNode = createNodeDefinition({
  id: "model-image-assemblyai",
  tags: ["model.image", "provider.assemblyai"],
  input: ModelParameters,
  output: ImageModelResult,
  function: async ({ modelId }) => ({
    model: assemblyai.imageModel(modelId),
  }),
});

export const assemblyaiSpeechModelNode = createNodeDefinition({
  id: "model-speech-assemblyai",
  tags: ["model.speech", "provider.assemblyai"],
  input: ModelParameters,
  output: SpeechModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      assemblyai.speechModel,
      "AssemblyAI does not support speech synthesis"
    )(modelId),
  }),
});

export const assemblyaiTranscriptionModelNode = createNodeDefinition({
  id: "model-transcription-assemblyai",
  tags: ["model.transcription", "provider.assemblyai"],
  input: ModelParameters,
  output: TranscriptionModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      assemblyai.transcriptionModel,
      "AssemblyAI does not support transcription"
    )(modelId),
  }),
});

export const azureLanguageModelNode = createNodeDefinition({
  id: "model-language-azure",
  tags: ["model.language", "provider.azure"],
  input: ModelParameters,
  output: LanguageModelResult,
  function: async ({ modelId }) => ({
    model: azure.languageModel(modelId),
  }),
});

export const azureTextEmbeddingModelNode = createNodeDefinition({
  id: "model-textembedding-azure",
  tags: ["model.textembedding", "provider.azure"],
  input: ModelParameters,
  output: TextEmbeddingModelResult,
  function: async ({ modelId }) => ({
    model: azure.textEmbeddingModel(modelId),
  }),
});

export const azureImageModelNode = createNodeDefinition({
  id: "model-image-azure",
  tags: ["model.image", "provider.azure"],
  input: ModelParameters,
  output: ImageModelResult,
  function: async ({ modelId }) => ({
    model: azure.imageModel(modelId),
  }),
});

export const azureSpeechModelNode = createNodeDefinition({
  id: "model-speech-azure",
  tags: ["model.speech", "provider.azure"],
  input: ModelParameters,
  output: SpeechModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      azure.speechModel,
      "Azure does not support speech synthesis"
    )(modelId),
  }),
});

export const azureTranscriptionModelNode = createNodeDefinition({
  id: "model-transcription-azure",
  tags: ["model.transcription", "provider.azure"],
  input: ModelParameters,
  output: TranscriptionModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      azure.transcriptionModel,
      "Azure does not support transcription"
    )(modelId),
  }),
});

export const cerebrasLanguageModelNode = createNodeDefinition({
  id: "model-language-cerebras",
  tags: ["model.language", "provider.cerebras"],
  input: ModelParameters,
  output: LanguageModelResult,
  function: async ({ modelId }) => ({
    model: cerebras.languageModel(modelId),
  }),
});

export const cerebrasTextEmbeddingModelNode = createNodeDefinition({
  id: "model-textembedding-cerebras",
  tags: ["model.textembedding", "provider.cerebras"],
  input: ModelParameters,
  output: TextEmbeddingModelResult,
  function: async ({ modelId }) => ({
    model: cerebras.textEmbeddingModel(modelId),
  }),
});

export const cerebrasImageModelNode = createNodeDefinition({
  id: "model-image-cerebras",
  tags: ["model.image", "provider.cerebras"],
  input: ModelParameters,
  output: ImageModelResult,
  function: async ({ modelId }) => ({
    model: cerebras.imageModel(modelId),
  }),
});

export const cerebrasSpeechModelNode = createNodeDefinition({
  id: "model-speech-cerebras",
  tags: ["model.speech", "provider.cerebras"],
  input: ModelParameters,
  output: SpeechModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      cerebras.speechModel,
      "Cerebras does not support speech synthesis"
    )(modelId),
  }),
});

export const cerebrasTranscriptionModelNode = createNodeDefinition({
  id: "model-transcription-cerebras",
  tags: ["model.transcription", "provider.cerebras"],
  input: ModelParameters,
  output: TranscriptionModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      cerebras.transcriptionModel,
      "Cerebras does not support transcription"
    )(modelId),
  }),
});

export const cohereLanguageModelNode = createNodeDefinition({
  id: "model-language-cohere",
  tags: ["model.language", "provider.cohere"],
  input: ModelParameters,
  output: LanguageModelResult,
  function: async ({ modelId }) => ({
    model: cohere.languageModel(modelId),
  }),
});

export const cohereTextEmbeddingModelNode = createNodeDefinition({
  id: "model-textembedding-cohere",
  tags: ["model.textembedding", "provider.cohere"],
  input: ModelParameters,
  output: TextEmbeddingModelResult,
  function: async ({ modelId }) => ({
    model: cohere.textEmbeddingModel(modelId),
  }),
});

export const cohereImageModelNode = createNodeDefinition({
  id: "model-image-cohere",
  tags: ["model.image", "provider.cohere"],
  input: ModelParameters,
  output: ImageModelResult,
  function: async ({ modelId }) => ({
    model: cohere.imageModel(modelId),
  }),
});

export const cohereSpeechModelNode = createNodeDefinition({
  id: "model-speech-cohere",
  tags: ["model.speech", "provider.cohere"],
  input: ModelParameters,
  output: SpeechModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      cohere.speechModel,
      "Cohere does not support speech synthesis"
    )(modelId),
  }),
});

export const cohereTranscriptionModelNode = createNodeDefinition({
  id: "model-transcription-cohere",
  tags: ["model.transcription", "provider.cohere"],
  input: ModelParameters,
  output: TranscriptionModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      cohere.transcriptionModel,
      "Cohere does not support transcription"
    )(modelId),
  }),
});

export const deepgramLanguageModelNode = createNodeDefinition({
  id: "model-language-deepgram",
  tags: ["model.language", "provider.deepgram"],
  input: ModelParameters,
  output: LanguageModelResult,
  function: async ({ modelId }) => ({
    model: deepgram.languageModel(modelId),
  }),
});

export const deepgramTextEmbeddingModelNode = createNodeDefinition({
  id: "model-textembedding-deepgram",
  tags: ["model.textembedding", "provider.deepgram"],
  input: ModelParameters,
  output: TextEmbeddingModelResult,
  function: async ({ modelId }) => ({
    model: deepgram.textEmbeddingModel(modelId),
  }),
});

export const deepgramImageModelNode = createNodeDefinition({
  id: "model-image-deepgram",
  tags: ["model.image", "provider.deepgram"],
  input: ModelParameters,
  output: ImageModelResult,
  function: async ({ modelId }) => ({
    model: deepgram.imageModel(modelId),
  }),
});

export const deepgramSpeechModelNode = createNodeDefinition({
  id: "model-speech-deepgram",
  tags: ["model.speech", "provider.deepgram"],
  input: ModelParameters,
  output: SpeechModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      deepgram.speechModel,
      "Deepgram does not support speech synthesis"
    )(modelId),
  }),
});

export const deepgramTranscriptionModelNode = createNodeDefinition({
  id: "model-transcription-deepgram",
  tags: ["model.transcription", "provider.deepgram"],
  input: ModelParameters,
  output: TranscriptionModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      deepgram.transcriptionModel,
      "Deepgram does not support transcription"
    )(modelId),
  }),
});

export const deepinfraLanguageModelNode = createNodeDefinition({
  id: "model-language-deepinfra",
  tags: ["model.language", "provider.deepinfra"],
  input: ModelParameters,
  output: LanguageModelResult,
  function: async ({ modelId }) => ({
    model: deepinfra.languageModel(modelId),
  }),
});

export const deepinfraTextEmbeddingModelNode = createNodeDefinition({
  id: "model-textembedding-deepinfra",
  tags: ["model.textembedding", "provider.deepinfra"],
  input: ModelParameters,
  output: TextEmbeddingModelResult,
  function: async ({ modelId }) => ({
    model: deepinfra.textEmbeddingModel(modelId),
  }),
});

export const deepinfraImageModelNode = createNodeDefinition({
  id: "model-image-deepinfra",
  tags: ["model.image", "provider.deepinfra"],
  input: ModelParameters,
  output: ImageModelResult,
  function: async ({ modelId }) => ({
    model: deepinfra.imageModel(modelId),
  }),
});

export const deepinfraSpeechModelNode = createNodeDefinition({
  id: "model-speech-deepinfra",
  tags: ["model.speech", "provider.deepinfra"],
  input: ModelParameters,
  output: SpeechModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      deepinfra.speechModel,
      "Deepinfra does not support speech synthesis"
    )(modelId),
  }),
});

export const deepinfraTranscriptionModelNode = createNodeDefinition({
  id: "model-transcription-deepinfra",
  tags: ["model.transcription", "provider.deepinfra"],
  input: ModelParameters,
  output: TranscriptionModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      deepinfra.transcriptionModel,
      "Deepinfra does not support transcription"
    )(modelId),
  }),
});

export const deepseekLanguageModelNode = createNodeDefinition({
  id: "model-language-deepseek",
  tags: ["model.language", "provider.deepseek"],
  input: ModelParameters,
  output: LanguageModelResult,
  function: async ({ modelId }) => ({
    model: deepseek.languageModel(modelId),
  }),
});

export const deepseekTextEmbeddingModelNode = createNodeDefinition({
  id: "model-textembedding-deepseek",
  tags: ["model.textembedding", "provider.deepseek"],
  input: ModelParameters,
  output: TextEmbeddingModelResult,
  function: async ({ modelId }) => ({
    model: deepseek.textEmbeddingModel(modelId),
  }),
});

export const deepseekImageModelNode = createNodeDefinition({
  id: "model-image-deepseek",
  tags: ["model.image", "provider.deepseek"],
  input: ModelParameters,
  output: ImageModelResult,
  function: async ({ modelId }) => ({
    model: deepseek.imageModel(modelId),
  }),
});

export const deepseekSpeechModelNode = createNodeDefinition({
  id: "model-speech-deepseek",
  tags: ["model.speech", "provider.deepseek"],
  input: ModelParameters,
  output: SpeechModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      deepseek.speechModel,
      "Deepseek does not support speech synthesis"
    )(modelId),
  }),
});

export const deepseekTranscriptionModelNode = createNodeDefinition({
  id: "model-transcription-deepseek",
  tags: ["model.transcription", "provider.deepseek"],
  input: ModelParameters,
  output: TranscriptionModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      deepseek.transcriptionModel,
      "Deepseek does not support transcription"
    )(modelId),
  }),
});

export const elevenlabsLanguageModelNode = createNodeDefinition({
  id: "model-language-elevenlabs",
  tags: ["model.language", "provider.elevenlabs"],
  input: ModelParameters,
  output: LanguageModelResult,
  function: async ({ modelId }) => ({
    model: elevenlabs.languageModel(modelId),
  }),
});

export const elevenlabsTextEmbeddingModelNode = createNodeDefinition({
  id: "model-textembedding-elevenlabs",
  tags: ["model.textembedding", "provider.elevenlabs"],
  input: ModelParameters,
  output: TextEmbeddingModelResult,
  function: async ({ modelId }) => ({
    model: elevenlabs.textEmbeddingModel(modelId),
  }),
});

export const elevenlabsImageModelNode = createNodeDefinition({
  id: "model-image-elevenlabs",
  tags: ["model.image", "provider.elevenlabs"],
  input: ModelParameters,
  output: ImageModelResult,
  function: async ({ modelId }) => ({
    model: elevenlabs.imageModel(modelId),
  }),
});

export const elevenlabsSpeechModelNode = createNodeDefinition({
  id: "model-speech-elevenlabs",
  tags: ["model.speech", "provider.elevenlabs"],
  input: ModelParameters,
  output: SpeechModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      elevenlabs.speechModel,
      "ElevenLabs does not support speech synthesis"
    )(modelId),
  }),
});

export const elevenlabsTranscriptionModelNode = createNodeDefinition({
  id: "model-transcription-elevenlabs",
  tags: ["model.transcription", "provider.elevenlabs"],
  input: ModelParameters,
  output: TranscriptionModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      elevenlabs.transcriptionModel,
      "ElevenLabs does not support transcription"
    )(modelId),
  }),
});

export const falLanguageModelNode = createNodeDefinition({
  id: "model-language-fal",
  tags: ["model.language", "provider.fal"],
  input: ModelParameters,
  output: LanguageModelResult,
  function: async ({ modelId }) => ({
    model: fal.languageModel(modelId),
  }),
});

export const falTextEmbeddingModelNode = createNodeDefinition({
  id: "model-textembedding-fal",
  tags: ["model.textembedding", "provider.fal"],
  input: ModelParameters,
  output: TextEmbeddingModelResult,
  function: async ({ modelId }) => ({
    model: fal.textEmbeddingModel(modelId),
  }),
});

export const falImageModelNode = createNodeDefinition({
  id: "model-image-fal",
  tags: ["model.image", "provider.fal"],
  input: ModelParameters,
  output: ImageModelResult,
  function: async ({ modelId }) => ({
    model: fal.imageModel(modelId),
  }),
});

export const falSpeechModelNode = createNodeDefinition({
  id: "model-speech-fal",
  tags: ["model.speech", "provider.fal"],
  input: ModelParameters,
  output: SpeechModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      fal.speechModel,
      "Fal does not support speech synthesis"
    )(modelId),
  }),
});

export const falTranscriptionModelNode = createNodeDefinition({
  id: "model-transcription-fal",
  tags: ["model.transcription", "provider.fal"],
  input: ModelParameters,
  output: TranscriptionModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      fal.transcriptionModel,
      "Fal does not support transcription"
    )(modelId),
  }),
});

export const fireworksLanguageModelNode = createNodeDefinition({
  id: "model-language-fireworks",
  tags: ["model.language", "provider.fireworks"],
  input: ModelParameters,
  output: LanguageModelResult,
  function: async ({ modelId }) => ({
    model: fireworks.languageModel(modelId),
  }),
});

export const fireworksTextEmbeddingModelNode = createNodeDefinition({
  id: "model-textembedding-fireworks",
  tags: ["model.textembedding", "provider.fireworks"],
  input: ModelParameters,
  output: TextEmbeddingModelResult,
  function: async ({ modelId }) => ({
    model: fireworks.textEmbeddingModel(modelId),
  }),
});

export const fireworksImageModelNode = createNodeDefinition({
  id: "model-image-fireworks",
  tags: ["model.image", "provider.fireworks"],
  input: ModelParameters,
  output: ImageModelResult,
  function: async ({ modelId }) => ({
    model: fireworks.imageModel(modelId),
  }),
});

export const fireworksSpeechModelNode = createNodeDefinition({
  id: "model-speech-fireworks",
  tags: ["model.speech", "provider.fireworks"],
  input: ModelParameters,
  output: SpeechModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      fireworks.speechModel,
      "Fireworks does not support speech synthesis"
    )(modelId),
  }),
});

export const fireworksTranscriptionModelNode = createNodeDefinition({
  id: "model-transcription-fireworks",
  tags: ["model.transcription", "provider.fireworks"],
  input: ModelParameters,
  output: TranscriptionModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      fireworks.transcriptionModel,
      "Fireworks does not support transcription"
    )(modelId),
  }),
});

export const gatewayLanguageModelNode = createNodeDefinition({
  id: "model-language-gateway",
  tags: ["model.language", "provider.gateway"],
  input: ModelParameters,
  output: LanguageModelResult,
  function: async ({ modelId }) => ({
    model: gateway.languageModel(modelId),
  }),
});

export const gatewayTextEmbeddingModelNode = createNodeDefinition({
  id: "model-textembedding-gateway",
  tags: ["model.textembedding", "provider.gateway"],
  input: ModelParameters,
  output: TextEmbeddingModelResult,
  function: async ({ modelId }) => ({
    model: gateway.textEmbeddingModel(modelId),
  }),
});

export const gatewayImageModelNode = createNodeDefinition({
  id: "model-image-gateway",
  tags: ["model.image", "provider.gateway"],
  input: ModelParameters,
  output: ImageModelResult,
  function: async ({ modelId }) => ({
    model: gateway.imageModel(modelId),
  }),
});

export const gatewaySpeechModelNode = createNodeDefinition({
  id: "model-speech-gateway",
  tags: ["model.speech", "provider.gateway"],
  input: ModelParameters,
  output: SpeechModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      gateway.speechModel,
      "Gateway does not support speech synthesis"
    )(modelId),
  }),
});

export const gatewayTranscriptionModelNode = createNodeDefinition({
  id: "model-transcription-gateway",
  tags: ["model.transcription", "provider.gateway"],
  input: ModelParameters,
  output: TranscriptionModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      gateway.transcriptionModel,
      "Gateway does not support transcription"
    )(modelId),
  }),
});

export const gladiaLanguageModelNode = createNodeDefinition({
  id: "model-language-gladia",
  tags: ["model.language", "provider.gladia"],
  input: ModelParameters,
  output: LanguageModelResult,
  function: async ({ modelId }) => ({
    model: gladia.languageModel(modelId),
  }),
});

export const gladiaTextEmbeddingModelNode = createNodeDefinition({
  id: "model-textembedding-gladia",
  tags: ["model.textembedding", "provider.gladia"],
  input: ModelParameters,
  output: TextEmbeddingModelResult,
  function: async ({ modelId }) => ({
    model: gladia.textEmbeddingModel(modelId),
  }),
});

export const gladiaImageModelNode = createNodeDefinition({
  id: "model-image-gladia",
  tags: ["model.image", "provider.gladia"],
  input: ModelParameters,
  output: ImageModelResult,
  function: async ({ modelId }) => ({
    model: gladia.imageModel(modelId),
  }),
});

export const gladiaSpeechModelNode = createNodeDefinition({
  id: "model-speech-gladia",
  tags: ["model.speech", "provider.gladia"],
  input: ModelParameters,
  output: SpeechModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      gladia.speechModel,
      "Gladia does not support speech synthesis"
    )(modelId),
  }),
});

export const gladiaTranscriptionModelNode = createNodeDefinition({
  id: "model-transcription-gladia",
  tags: ["model.transcription", "provider.gladia"],
  input: ModelParameters,
  output: TranscriptionModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      gladia.transcriptionModel,
      "Gladia does not support transcription"
    )(modelId),
  }),
});

export const googleLanguageModelNode = createNodeDefinition({
  id: "model-language-google",
  tags: ["model.language", "provider.google"],
  input: ModelParameters,
  output: LanguageModelResult,
  function: async ({ modelId }) => ({
    model: google.languageModel(modelId),
  }),
});

export const googleTextEmbeddingModelNode = createNodeDefinition({
  id: "model-textembedding-google",
  tags: ["model.textembedding", "provider.google"],
  input: ModelParameters,
  output: TextEmbeddingModelResult,
  function: async ({ modelId }) => ({
    model: google.textEmbeddingModel(modelId),
  }),
});

export const googleImageModelNode = createNodeDefinition({
  id: "model-image-google",
  tags: ["model.image", "provider.google"],
  input: ModelParameters,
  output: ImageModelResult,
  function: async ({ modelId }) => ({
    model: google.imageModel(modelId),
  }),
});

export const googleSpeechModelNode = createNodeDefinition({
  id: "model-speech-google",
  tags: ["model.speech", "provider.google"],
  input: ModelParameters,
  output: SpeechModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      google.speechModel,
      "Google does not support speech synthesis"
    )(modelId),
  }),
});

export const googleTranscriptionModelNode = createNodeDefinition({
  id: "model-transcription-google",
  tags: ["model.transcription", "provider.google"],
  input: ModelParameters,
  output: TranscriptionModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      google.transcriptionModel,
      "Google does not support transcription"
    )(modelId),
  }),
});

export const vertexLanguageModelNode = createNodeDefinition({
  id: "model-language-vertex",
  tags: ["model.language", "provider.vertex"],
  input: ModelParameters,
  output: LanguageModelResult,
  function: async ({ modelId }) => ({
    model: vertex.languageModel(modelId),
  }),
});

export const vertexTextEmbeddingModelNode = createNodeDefinition({
  id: "model-textembedding-vertex",
  tags: ["model.textembedding", "provider.vertex"],
  input: ModelParameters,
  output: TextEmbeddingModelResult,
  function: async ({ modelId }) => ({
    model: vertex.textEmbeddingModel(modelId),
  }),
});

export const vertexImageModelNode = createNodeDefinition({
  id: "model-image-vertex",
  tags: ["model.image", "provider.vertex"],
  input: ModelParameters,
  output: ImageModelResult,
  function: async ({ modelId }) => ({
    model: vertex.imageModel(modelId),
  }),
});

export const vertexSpeechModelNode = createNodeDefinition({
  id: "model-speech-vertex",
  tags: ["model.speech", "provider.vertex"],
  input: ModelParameters,
  output: SpeechModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      vertex.speechModel,
      "Vertex does not support speech synthesis"
    )(modelId),
  }),
});

export const vertexTranscriptionModelNode = createNodeDefinition({
  id: "model-transcription-vertex",
  tags: ["model.transcription", "provider.vertex"],
  input: ModelParameters,
  output: TranscriptionModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      vertex.transcriptionModel,
      "Vertex does not support transcription"
    )(modelId),
  }),
});

export const groqLanguageModelNode = createNodeDefinition({
  id: "model-language-groq",
  tags: ["model.language", "provider.groq"],
  input: ModelParameters,
  output: LanguageModelResult,
  function: async ({ modelId }) => ({
    model: groq.languageModel(modelId),
  }),
});

export const groqTextEmbeddingModelNode = createNodeDefinition({
  id: "model-textembedding-groq",
  tags: ["model.textembedding", "provider.groq"],
  input: ModelParameters,
  output: TextEmbeddingModelResult,
  function: async ({ modelId }) => ({
    model: groq.textEmbeddingModel(modelId),
  }),
});

export const groqImageModelNode = createNodeDefinition({
  id: "model-image-groq",
  tags: ["model.image", "provider.groq"],
  input: ModelParameters,
  output: ImageModelResult,
  function: async ({ modelId }) => ({
    model: groq.imageModel(modelId),
  }),
});

export const groqSpeechModelNode = createNodeDefinition({
  id: "model-speech-groq",
  tags: ["model.speech", "provider.groq"],
  input: ModelParameters,
  output: SpeechModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      groq.speechModel,
      "Groq does not support speech synthesis"
    )(modelId),
  }),
});

export const groqTranscriptionModelNode = createNodeDefinition({
  id: "model-transcription-groq",
  tags: ["model.transcription", "provider.groq"],
  input: ModelParameters,
  output: TranscriptionModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      groq.transcriptionModel,
      "Groq does not support transcription"
    )(modelId),
  }),
});

export const humeSpeechModelNode = createNodeDefinition({
  id: "model-speech-hume",
  tags: ["model.speech", "provider.hume"],
  input: ModelParameters,
  output: SpeechModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      hume.speechModel,
      "Hume does not support speech synthesis"
    )(modelId),
  }),
});

export const lmntSpeechModelNode = createNodeDefinition({
  id: "model-speech-lmnt",
  tags: ["model.speech", "provider.lmnt"],
  input: ModelParameters,
  output: SpeechModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      lmnt.speechModel,
      "LMNT does not support speech synthesis"
    )(modelId),
  }),
});

export const lumaLanguageModelNode = createNodeDefinition({
  id: "model-language-luma",
  tags: ["model.language", "provider.luma"],
  input: ModelParameters,
  output: LanguageModelResult,
  function: async ({ modelId }) => ({
    model: luma.languageModel(modelId),
  }),
});

export const lumaTextEmbeddingModelNode = createNodeDefinition({
  id: "model-textembedding-luma",
  tags: ["model.textembedding", "provider.luma"],
  input: ModelParameters,
  output: TextEmbeddingModelResult,
  function: async ({ modelId }) => ({
    model: luma.textEmbeddingModel(modelId),
  }),
});

export const lumaImageModelNode = createNodeDefinition({
  id: "model-image-luma",
  tags: ["model.image", "provider.luma"],
  input: ModelParameters,
  output: ImageModelResult,
  function: async ({ modelId }) => ({
    model: luma.imageModel(modelId),
  }),
});

export const lumaSpeechModelNode = createNodeDefinition({
  id: "model-speech-luma",
  tags: ["model.speech", "provider.luma"],
  input: ModelParameters,
  output: SpeechModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      luma.speechModel,
      "Luma does not support speech synthesis"
    )(modelId),
  }),
});

export const lumaTranscriptionModelNode = createNodeDefinition({
  id: "model-transcription-luma",
  tags: ["model.transcription", "provider.luma"],
  input: ModelParameters,
  output: TranscriptionModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      luma.transcriptionModel,
      "Luma does not support transcription"
    )(modelId),
  }),
});

export const mistralLanguageModelNode = createNodeDefinition({
  id: "model-language-mistral",
  tags: ["model.language", "provider.mistral"],
  input: ModelParameters,
  output: LanguageModelResult,
  function: async ({ modelId }) => ({
    model: mistral.languageModel(modelId),
  }),
});

export const mistralTextEmbeddingModelNode = createNodeDefinition({
  id: "model-textembedding-mistral",
  tags: ["model.textembedding", "provider.mistral"],
  input: ModelParameters,
  output: TextEmbeddingModelResult,
  function: async ({ modelId }) => ({
    model: mistral.textEmbeddingModel(modelId),
  }),
});

export const mistralImageModelNode = createNodeDefinition({
  id: "model-image-mistral",
  tags: ["model.image", "provider.mistral"],
  input: ModelParameters,
  output: ImageModelResult,
  function: async ({ modelId }) => ({
    model: mistral.imageModel(modelId),
  }),
});

export const mistralSpeechModelNode = createNodeDefinition({
  id: "model-speech-mistral",
  tags: ["model.speech", "provider.mistral"],
  input: ModelParameters,
  output: SpeechModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      mistral.speechModel,
      "Mistral does not support speech synthesis"
    )(modelId),
  }),
});

export const mistralTranscriptionModelNode = createNodeDefinition({
  id: "model-transcription-mistral",
  tags: ["model.transcription", "provider.mistral"],
  input: ModelParameters,
  output: TranscriptionModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      mistral.transcriptionModel,
      "Mistral does not support transcription"
    )(modelId),
  }),
});

export const openaiLanguageModelNode = createNodeDefinition({
  id: "model-language-openai",
  tags: ["model.language", "provider.openai"],
  input: ModelParameters,
  output: LanguageModelResult,
  function: async ({ modelId }) => ({
    model: openai.languageModel(modelId),
  }),
});

export const openaiTextEmbeddingModelNode = createNodeDefinition({
  id: "model-textembedding-openai",
  tags: ["model.textembedding", "provider.openai"],
  input: ModelParameters,
  output: TextEmbeddingModelResult,
  function: async ({ modelId }) => ({
    model: openai.textEmbeddingModel(modelId),
  }),
});

export const openaiImageModelNode = createNodeDefinition({
  id: "model-image-openai",
  tags: ["model.image", "provider.openai"],
  input: ModelParameters,
  output: ImageModelResult,
  function: async ({ modelId }) => ({
    model: openai.imageModel(modelId),
  }),
});

export const openaiSpeechModelNode = createNodeDefinition({
  id: "model-speech-openai",
  tags: ["model.speech", "provider.openai"],
  input: ModelParameters,
  output: SpeechModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      openai.speechModel,
      "OpenAI does not support speech synthesis"
    )(modelId),
  }),
});

export const openaiTranscriptionModelNode = createNodeDefinition({
  id: "model-transcription-openai",
  tags: ["model.transcription", "provider.openai"],
  input: ModelParameters,
  output: TranscriptionModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      openai.transcriptionModel,
      "OpenAI does not support transcription"
    )(modelId),
  }),
});

export const perplexityLanguageModelNode = createNodeDefinition({
  id: "model-language-perplexity",
  tags: ["model.language", "provider.perplexity"],
  input: ModelParameters,
  output: LanguageModelResult,
  function: async ({ modelId }) => ({
    model: perplexity.languageModel(modelId),
  }),
});

export const perplexityTextEmbeddingModelNode = createNodeDefinition({
  id: "model-textembedding-perplexity",
  tags: ["model.textembedding", "provider.perplexity"],
  input: ModelParameters,
  output: TextEmbeddingModelResult,
  function: async ({ modelId }) => ({
    model: perplexity.textEmbeddingModel(modelId),
  }),
});

export const perplexityImageModelNode = createNodeDefinition({
  id: "model-image-perplexity",
  tags: ["model.image", "provider.perplexity"],
  input: ModelParameters,
  output: ImageModelResult,
  function: async ({ modelId }) => ({
    model: perplexity.imageModel(modelId),
  }),
});

export const perplexitySpeechModelNode = createNodeDefinition({
  id: "model-speech-perplexity",
  tags: ["model.speech", "provider.perplexity"],
  input: ModelParameters,
  output: SpeechModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      perplexity.speechModel,
      "Perplexity does not support speech synthesis"
    )(modelId),
  }),
});

export const perplexityTranscriptionModelNode = createNodeDefinition({
  id: "model-transcription-perplexity",
  tags: ["model.transcription", "provider.perplexity"],
  input: ModelParameters,
  output: TranscriptionModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      perplexity.transcriptionModel,
      "Perplexity does not support transcription"
    )(modelId),
  }),
});

export const replicateLanguageModelNode = createNodeDefinition({
  id: "model-language-replicate",
  tags: ["model.language", "provider.replicate"],
  input: ModelParameters,
  output: LanguageModelResult,
  function: async ({ modelId }) => ({
    model: replicate.languageModel(modelId),
  }),
});

export const replicateTextEmbeddingModelNode = createNodeDefinition({
  id: "model-textembedding-replicate",
  tags: ["model.textembedding", "provider.replicate"],
  input: ModelParameters,
  output: TextEmbeddingModelResult,
  function: async ({ modelId }) => ({
    model: replicate.textEmbeddingModel(modelId),
  }),
});

export const replicateImageModelNode = createNodeDefinition({
  id: "model-image-replicate",
  tags: ["model.image", "provider.replicate"],
  input: ModelParameters,
  output: ImageModelResult,
  function: async ({ modelId }) => ({
    model: replicate.imageModel(modelId),
  }),
});

export const replicateSpeechModelNode = createNodeDefinition({
  id: "model-speech-replicate",
  tags: ["model.speech", "provider.replicate"],
  input: ModelParameters,
  output: SpeechModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      replicate.speechModel,
      "Replicate does not support speech synthesis"
    )(modelId),
  }),
});

export const replicateTranscriptionModelNode = createNodeDefinition({
  id: "model-transcription-replicate",
  tags: ["model.transcription", "provider.replicate"],
  input: ModelParameters,
  output: TranscriptionModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      replicate.transcriptionModel,
      "Replicate does not support transcription"
    )(modelId),
  }),
});

export const revaiLanguageModelNode = createNodeDefinition({
  id: "model-language-revai",
  tags: ["model.language", "provider.revai"],
  input: ModelParameters,
  output: LanguageModelResult,
  function: async ({ modelId }) => ({
    model: revai.languageModel(modelId),
  }),
});

export const revaiTextEmbeddingModelNode = createNodeDefinition({
  id: "model-textembedding-revai",
  tags: ["model.textembedding", "provider.revai"],
  input: ModelParameters,
  output: TextEmbeddingModelResult,
  function: async ({ modelId }) => ({
    model: revai.textEmbeddingModel(modelId),
  }),
});

export const revaiImageModelNode = createNodeDefinition({
  id: "model-image-revai",
  tags: ["model.image", "provider.revai"],
  input: ModelParameters,
  output: ImageModelResult,
  function: async ({ modelId }) => ({
    model: revai.imageModel(modelId),
  }),
});

export const revaiSpeechModelNode = createNodeDefinition({
  id: "model-speech-revai",
  tags: ["model.speech", "provider.revai"],
  input: ModelParameters,
  output: SpeechModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      revai.speechModel,
      "Revai does not support speech synthesis"
    )(modelId),
  }),
});

export const revaiTranscriptionModelNode = createNodeDefinition({
  id: "model-transcription-revai",
  tags: ["model.transcription", "provider.revai"],
  input: ModelParameters,
  output: TranscriptionModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      revai.transcriptionModel,
      "Revai does not support transcription"
    )(modelId),
  }),
});

export const togetheraiLanguageModelNode = createNodeDefinition({
  id: "model-language-togetherai",
  tags: ["model.language", "provider.togetherai"],
  input: ModelParameters,
  output: LanguageModelResult,
  function: async ({ modelId }) => ({
    model: togetherai.languageModel(modelId),
  }),
});

export const togetheraiTextEmbeddingModelNode = createNodeDefinition({
  id: "model-textembedding-togetherai",
  tags: ["model.textembedding", "provider.togetherai"],
  input: ModelParameters,
  output: TextEmbeddingModelResult,
  function: async ({ modelId }) => ({
    model: togetherai.textEmbeddingModel(modelId),
  }),
});

export const togetheraiImageModelNode = createNodeDefinition({
  id: "model-image-togetherai",
  tags: ["model.image", "provider.togetherai"],
  input: ModelParameters,
  output: ImageModelResult,
  function: async ({ modelId }) => ({
    model: togetherai.imageModel(modelId),
  }),
});

export const togetheraiSpeechModelNode = createNodeDefinition({
  id: "model-speech-togetherai",
  tags: ["model.speech", "provider.togetherai"],
  input: ModelParameters,
  output: SpeechModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      togetherai.speechModel,
      "TogetherAI does not support speech synthesis"
    )(modelId),
  }),
});

export const togetheraiTranscriptionModelNode = createNodeDefinition({
  id: "model-transcription-togetherai",
  tags: ["model.transcription", "provider.togetherai"],
  input: ModelParameters,
  output: TranscriptionModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      togetherai.transcriptionModel,
      "TogetherAI does not support transcription"
    )(modelId),
  }),
});

export const vercelLanguageModelNode = createNodeDefinition({
  id: "model-language-vercel",
  tags: ["model.language", "provider.vercel"],
  input: ModelParameters,
  output: LanguageModelResult,
  function: async ({ modelId }) => ({
    model: vercel.languageModel(modelId),
  }),
});

export const vercelTextEmbeddingModelNode = createNodeDefinition({
  id: "model-textembedding-vercel",
  tags: ["model.textembedding", "provider.vercel"],
  input: ModelParameters,
  output: TextEmbeddingModelResult,
  function: async ({ modelId }) => ({
    model: vercel.textEmbeddingModel(modelId),
  }),
});

export const vercelImageModelNode = createNodeDefinition({
  id: "model-image-vercel",
  tags: ["model.image", "provider.vercel"],
  input: ModelParameters,
  output: ImageModelResult,
  function: async ({ modelId }) => ({
    model: vercel.imageModel(modelId),
  }),
});

export const vercelSpeechModelNode = createNodeDefinition({
  id: "model-speech-vercel",
  tags: ["model.speech", "provider.vercel"],
  input: ModelParameters,
  output: SpeechModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      vercel.speechModel,
      "Vercel does not support speech synthesis"
    )(modelId),
  }),
});

export const vercelTranscriptionModelNode = createNodeDefinition({
  id: "model-transcription-vercel",
  tags: ["model.transcription", "provider.vercel"],
  input: ModelParameters,
  output: TranscriptionModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      vercel.transcriptionModel,
      "Vercel does not support transcription"
    )(modelId),
  }),
});

export const xaiLanguageModelNode = createNodeDefinition({
  id: "model-language-xai",
  tags: ["model.language", "provider.xai"],
  input: ModelParameters,
  output: LanguageModelResult,
  function: async ({ modelId }) => ({
    model: xai.languageModel(modelId),
  }),
});

export const xaiTextEmbeddingModelNode = createNodeDefinition({
  id: "model-textembedding-xai",
  tags: ["model.textembedding", "provider.xai"],
  input: ModelParameters,
  output: TextEmbeddingModelResult,
  function: async ({ modelId }) => ({
    model: xai.textEmbeddingModel(modelId),
  }),
});

export const xaiImageModelNode = createNodeDefinition({
  id: "model-image-xai",
  tags: ["model.image", "provider.xai"],
  input: ModelParameters,
  output: ImageModelResult,
  function: async ({ modelId }) => ({
    model: xai.imageModel(modelId),
  }),
});

export const xaiSpeechModelNode = createNodeDefinition({
  id: "model-speech-xai",
  tags: ["model.speech", "provider.xai"],
  input: ModelParameters,
  output: SpeechModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      xai.speechModel,
      "XAI does not support speech synthesis"
    )(modelId),
  }),
});

export const xaiTranscriptionModelNode = createNodeDefinition({
  id: "model-transcription-xai",
  tags: ["model.transcription", "provider.xai"],
  input: ModelParameters,
  output: TranscriptionModelResult,
  function: async ({ modelId }) => ({
    model: assertStrict(
      xai.transcriptionModel,
      "XAI does not support transcription"
    )(modelId),
  }),
});

import {
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
import { JSONArray, JSONValue, zFunction } from "./sharedTypes";
import {
  booleanType,
  nodeInterfaceType,
  numberType,
  stringType,
} from "./interfaceTypes";
import type { BaklavaInterfaceTypes } from "baklavajs";

export const LanguageModel = z
  .custom<Exclude<UpstreamLanguageModel, string>>()
  .register(z.globalRegistry, {
    id: "LanguageModel",
    title: "LanguageModel",
    description: "Common interface for language models.",
  });
export type LanguageModel = z.infer<typeof LanguageModel>;
export const languageModelType =
  nodeInterfaceType<LanguageModel>("LanguageModel");

export const TextEmbeddingModel = z
  .custom<EmbeddingModel<string>>()
  .register(z.globalRegistry, {
    id: "TextEmbeddingModel",
    title: "TextEmbeddingModel",
    description: "Common interface for text embedding models.",
  });
export type TextEmbeddingModel = z.infer<typeof TextEmbeddingModel>;
export const textEmbeddingModelType =
  nodeInterfaceType<TextEmbeddingModel>("TextEmbeddingModel");

export const ImageModel = z
  .custom<UpstreamImageModel>()
  .register(z.globalRegistry, {
    id: "ImageModel",
    title: "ImageModel",
    description: "Common interface for image models.",
  });
export type ImageModel = z.infer<typeof ImageModel>;
export const imageModelType = nodeInterfaceType<ImageModel>("ImageModel");

export const SpeechModel = z
  .custom<UpstreamSpeechModel>()
  .register(z.globalRegistry, {
    id: "SpeechModel",
    title: "SpeechModel",
    description: "Common interface for speech models.",
  });
export type SpeechModel = z.infer<typeof SpeechModel>;
export const speechModelType = nodeInterfaceType<SpeechModel>("SpeechModel");

export const TranscriptionModel = z
  .custom<UpstreamTranscriptionModel>()
  .register(z.globalRegistry, {
    id: "TranscriptionModel",
    title: "TranscriptionModel",
    description: "Common interface for transcription models.",
  });
export type TranscriptionModel = z.infer<typeof TranscriptionModel>;
export const transcriptionModelType =
  nodeInterfaceType<TranscriptionModel>("TranscriptionModel");

export const ProviderMetadata = z
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
export type ProviderMetadata = z.infer<typeof ProviderMetadata>;

export const ProviderOptions = z
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
export type ProviderOptions = z.infer<typeof ProviderOptions>;

export const ContentPartSourceUrl = z
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
export type ContentPartSourceUrl = z.infer<typeof ContentPartSourceUrl>;

export const ContentPartSourceDocument = z
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
export type ContentPartSourceDocument = z.infer<
  typeof ContentPartSourceDocument
>;

export const GeneratedFile = z
  .object({
    base64: z.string(),
    uint8Array: z.instanceof(Uint8Array<ArrayBufferLike>),
    mediaType: z.string(),
  })
  .meta({
    title: "GeneratedFile",
    description: "A generated file.",
  });
export type GeneratedFile = z.infer<typeof GeneratedFile>;
export const generatedFileType =
  nodeInterfaceType<GeneratedFile>("GeneratedFile");

export const ContentPartText = z
  .object({
    type: z.literal("text"),
    text: z.string(),
    providerMetadata: ProviderMetadata.optional(),
  })
  .meta({ title: "ContentPartText" });
export type ContentPartText = z.infer<typeof ContentPartText>;

export const ContentPartReasoning = z
  .object({
    type: z.literal("reasoning"),
    text: z.string(),
    providerMetadata: ProviderMetadata.optional(),
  })
  .meta({ title: "ContentPartReasoning" });
export type ContentPartReasoning = z.infer<typeof ContentPartReasoning>;

export const ContentPartSource = z
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
export type ContentPartSource = z.infer<typeof ContentPartSource>;
export const contentPartSourceType =
  nodeInterfaceType<ContentPartSource>("ContentPartSource");

export const ContentPartFile = z
  .object({
    type: z.literal("file"),
    file: GeneratedFile,
    providerMetadata: ProviderMetadata.optional(),
  })
  .meta({
    title: "ContentPartFile",
  });
export type ContentPartFile = z.infer<typeof ContentPartFile>;

export const ContentPartToolCall = z
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
export type ContentPartToolCall = z.infer<typeof ContentPartToolCall>;
export const contentPartToolCallType = nodeInterfaceType<ContentPartToolCall>(
  "ContentPartToolCall"
);

export const ContentPartToolResult = z
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
export type ContentPartToolResult = z.infer<typeof ContentPartToolResult>;
export const contentPartToolResultType =
  nodeInterfaceType<ContentPartToolResult>("ContentPartToolResult");

export const ContentPartToolError = z
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
export type ContentPartToolError = z.infer<typeof ContentPartToolError>;

export const ContentPart = z
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
export type ContentPart = z.infer<typeof ContentPart>;
export const contentPartType = nodeInterfaceType<ContentPart>("ContentPart");

export const DataContent = z
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
export type DataContent = z.infer<typeof DataContent>;
export const dataContentType = nodeInterfaceType<DataContent>("DataContent");

export const urlType = nodeInterfaceType<URL>("URL");

export const dataContentOrUrlType = nodeInterfaceType<DataContent | URL>(
  "DataContentOrURL"
);
dataContentType.addConversion(dataContentOrUrlType, (v) => v);
urlType.addConversion(dataContentOrUrlType, (v) => v);

export const TextPart = z
  .object({
    type: z.literal("text"),
    text: z.string().describe("The text content."),
    providerOptions: ProviderOptions.optional(),
  })
  .meta({
    title: "TextPart",
    description: "Text content part of a prompt. It contains a string of text.",
  });
export type TextPart = z.infer<typeof TextPart>;

export const ImagePart = z
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
export type ImagePart = z.infer<typeof ImagePart>;

export const FilePart = z
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
export type FilePart = z.infer<typeof FilePart>;

export const ReasoningPart = z
  .object({
    type: z.literal("reasoning"),
    text: z.string(),
    providerOptions: ProviderOptions.optional(),
  })
  .meta({ title: "ReasoningPart" });
export type ReasoningPart = z.infer<typeof ReasoningPart>;
export const reasoningPartType =
  nodeInterfaceType<ReasoningPart>("ReasoningPart");

export const ToolCallPart = z
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
export type ToolCallPart = z.infer<typeof ToolCallPart>;

export const ToolResultOutputText = z.object({
  type: z.literal("text"),
  value: z.string().describe("Text content of the tool result."),
});
export type ToolResultOutputText = z.infer<typeof ToolResultOutputText>;

export const ToolResultOutputJSON = z.object({
  type: z.literal("json"),
  value: JSONValue.describe("JSON content of the tool result."),
});
export type ToolResultOutputJSON = z.infer<typeof ToolResultOutputJSON>;

export const ToolResultOutputErrorText = z.object({
  type: z.literal("error-text"),
  value: z.string().describe("Error text content of the tool result."),
});
export type ToolResultOutputErrorText = z.infer<
  typeof ToolResultOutputErrorText
>;

export const ToolResultOutputErrorJSON = z.object({
  type: z.literal("error-json"),
  value: JSONValue.describe("Error JSON content of the tool result."),
});
export type ToolResultOutputErrorJSON = z.infer<
  typeof ToolResultOutputErrorJSON
>;

export const ToolResultOutputContentText = z.object({
  type: z.literal("text"),
  text: z.string().describe("Text content of the tool result part."),
});
export type ToolResultOutputContentText = z.infer<
  typeof ToolResultOutputContentText
>;

export const ToolResultOutputContentMedia = z.object({
  type: z.literal("media"),
  data: z
    .string()
    .describe("Base-64 encoded media data of the tool result part."),
  mediaType: z
    .string()
    .describe(
      "IANA media type of the tool result part. See https://www.iana.org/assignments/media-types/media-types.xhtml"
    ),
});
export type ToolResultOutputContentMedia = z.infer<
  typeof ToolResultOutputContentMedia
>;

export const ToolResultOutputContent = z.object({
  type: z.literal("content"),
  value: z.array(
    z.discriminatedUnion("type", [
      ToolResultOutputContentText,
      ToolResultOutputContentMedia,
    ])
  ),
});
export type ToolResultOutputContent = z.infer<typeof ToolResultOutputContent>;

export const ToolResultOutput = z
  .discriminatedUnion("type", [
    ToolResultOutputText,
    ToolResultOutputJSON,
    ToolResultOutputErrorText,
    ToolResultOutputErrorJSON,
    ToolResultOutputContent,
  ])
  .meta({
    title: "ToolResultOutput",
    description: "Output of a tool call.",
  });
export type ToolResultOutput = z.infer<typeof ToolResultOutput>;

export const ToolResultPart = z
  .object({
    type: z.literal("tool-result"),
    toolCallId: z
      .string()
      .describe("ID of the tool call that this result is associated with."),
    toolName: z
      .string()
      .describe("Name of the tool that generated this result."),
    output: ToolResultOutput.describe(
      "Result of the tool call. This is a JSON-serializable object."
    ),
    providerOptions: ProviderOptions.optional(),
  })
  .meta({
    title: "ToolResultPart",
    description:
      "Tool result content part of a prompt. It contains the result of the tool call with the matching ID.",
  });
export type ToolResultPart = z.infer<typeof ToolResultPart>;

export const FinishReason = z
  .literal([
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
export type FinishReason = z.infer<typeof FinishReason>;
export const finishReasonType = nodeInterfaceType<FinishReason>("FinishReason");

export const AssistantContent = z
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
export type AssistantContent = z.infer<typeof AssistantContent>;

export const AssistantModelMessage = z
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
export type AssistantModelMessage = z.infer<typeof AssistantModelMessage>;

export const ToolContent = z.array(ToolResultPart).meta({
  title: "ToolContent",
  description:
    "Content of a tool message. It is an array of tool result parts.",
});
export type ToolContent = z.infer<typeof ToolContent>;

export const ToolModelMessage = z
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
export type ToolModelMessage = z.infer<typeof ToolModelMessage>;

export const ResponseMessage = z
  .discriminatedUnion("role", [AssistantModelMessage, ToolModelMessage])
  .meta({
    title: "ResponseMessage",
    description:
      "A message that was generated during the generation process. It can be either an assistant message or a tool message.",
  });
export type ResponseMessage = z.infer<typeof ResponseMessage>;

export const LanguageModelUsage = z
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
export type LanguageModelUsage = z.infer<typeof LanguageModelUsage>;
export const languageModelUsageType =
  nodeInterfaceType<LanguageModelUsage>("LanguageModelUsage");

export const LanguageModelRequestMetadata = z
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
export type LanguageModelRequestMetadata = z.infer<
  typeof LanguageModelRequestMetadata
>;
export const languageModelRequestMetadataType =
  nodeInterfaceType<LanguageModelRequestMetadata>(
    "LanguageModelRequestMetadata"
  );

export const LanguageModelResponseMetadata = z
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
export type LanguageModelResponseMetadata = z.infer<
  typeof LanguageModelResponseMetadata
>;
export const languageModelResponseMetadataType =
  nodeInterfaceType<LanguageModelResponseMetadata>(
    "LanguageModelResponseMetadata"
  );

export const LanguageModelResponseMetadataWithMessagesAndBody =
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
export type LanguageModelResponseMetadataWithMessagesAndBody = z.infer<
  typeof LanguageModelResponseMetadataWithMessagesAndBody
>;
export const languageModelResponseMetadataWithMessagesAndBodyType =
  nodeInterfaceType<LanguageModelResponseMetadataWithMessagesAndBody>(
    "LanguageModelResponseMetadataWithMessagesAndBody"
  );
languageModelResponseMetadataWithMessagesAndBodyType.addConversion(
  languageModelResponseMetadataType,
  (v) => v
);

export const JSONSchema7 = z.custom<UpstreamJSONSchema7>().meta({
  id: "JSONSchema7",
  title: "JSONSchema7",
  description: `\
A JSON Schema 7 object that describes the input schema of a tool and/or the output schema of the LLM.
It is used to validate the input of the tool and to provide suggestions for the input.`,
});
export type JSONSchema7 = z.infer<typeof JSONSchema7>;

export const FunctionTool = z
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
export type FunctionTool = z.infer<typeof FunctionTool>;

export const ProviderDefinedTool = z.object({
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
export type ProviderDefinedTool = z.infer<typeof ProviderDefinedTool>;

export const CallWarningUnsupportedSetting = z.object({
  type: z.literal("unsupported-setting"),
  // Workaround for a bug in `ai` which incorrectly uses `Omit` instead of `Exclude`.
  // See https://github.com/vercel/ai/issues/7906 to track the issue.
  // Once fixed, we can remove this workaround.
  setting: z.custom<Omit<string, "prompt">>((x) => typeof x),
  details: z.string().optional(),
});
export type CallWarningUnsupportedSetting = z.infer<
  typeof CallWarningUnsupportedSetting
>;

export const CallWarningUnsupportedTool = z.object({
  type: z.literal("unsupported-tool"),
  tool: z.union([FunctionTool, ProviderDefinedTool]),
  details: z.string().optional(),
});
export type CallWarningUnsupportedTool = z.infer<
  typeof CallWarningUnsupportedTool
>;

export const CallWarningOther = z
  .object({
    type: z.literal("other"),
    message: z.string(),
  })
  .meta({ title: "CallWarningOther" });
export type CallWarningOther = z.infer<typeof CallWarningOther>;

export const CallWarning = z
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
export type CallWarning = z.infer<typeof CallWarning>;
export const callWarningType = nodeInterfaceType<CallWarning>("CallWarning");

export const StepResult = z
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
export type StepResult = z.infer<typeof StepResult>;
export const stepResultType = nodeInterfaceType<StepResult>("StepResult");

export const GenerateTextResult = StepResult.extend({
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
export type GenerateTextResult = z.infer<typeof GenerateTextResult>;
export const generateTextResultType =
  nodeInterfaceType<GenerateTextResult>("GenerateTextResult");
generateTextResultType.addConversion(stepResultType, (v) => v);

export const Embedding = z.array(z.number()).meta({
  title: "Embedding",
  description:
    "An embedding is a vector, i.e. an array of numbers. It is e.g. used to represent a text as a vector of word embeddings.",
});
export type Embedding = z.infer<typeof Embedding>;

export const EmbeddingModelUsage = z
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
export type EmbeddingModelUsage = z.infer<typeof EmbeddingModelUsage>;
export const embeddingModelUsageType = nodeInterfaceType<EmbeddingModelUsage>(
  "EmbeddingModelUsage"
);

export const TextEmbeddingResponse = z.object({
  headers: z
    .record(z.string(), z.string())
    .optional()
    .describe("The response headers."),
  body: z.unknown().optional().describe("The response body."),
});
export type TextEmbeddingResponse = z.infer<typeof TextEmbeddingResponse>;
export const textEmbeddingResponseType =
  nodeInterfaceType<TextEmbeddingResponse>("TextEmbeddingResponse");

export const TextEmbeddingResult = z
  .object({
    // This is the generic parameter `VALUE` of the `EmbedResult` interface.
    // For text embeddings, it is always a string.
    value: z.string().describe("The value that was embedded."),
    embedding: Embedding,
    usage: EmbeddingModelUsage,
    providerMetadata: ProviderMetadata.optional(),
    response: TextEmbeddingResponse.optional().describe(
      "Optional response data."
    ),
  })
  .meta({
    title: "TextEmbeddingResult",
    description:
      "The result of an `embed` call for text embeddings. It contains the embedding, the value, and additional information.",
  });
export type TextEmbeddingResult = z.infer<typeof TextEmbeddingResult>;

export const GenerationWarningUnsupportedSetting = z
  .object({
    type: z.literal("unsupported-setting"),
    setting: z.string().describe("The name of the unsupported setting."),
    details: z
      .string()
      .optional()
      .describe("Additional details about the warning."),
  })
  .meta({ title: "GenerationWarningUnsupportedSetting" });
export type GenerationWarningUnsupportedSetting = z.infer<
  typeof GenerationWarningUnsupportedSetting
>;

export const GenerationWarningOther = z
  .object({
    type: z.literal("other"),
    message: z.string().describe("The warning message."),
  })
  .meta({ title: "ImageGenerationWarningOther" });
export type GenerationWarningOther = z.infer<typeof GenerationWarningOther>;

// NOTE: Split this type back up when the types of generation warnings diverge between image and speech models.
export const GenerationWarning = z
  .discriminatedUnion("type", [
    GenerationWarningUnsupportedSetting,
    GenerationWarningOther,
  ])
  .meta({
    title: "GenerationWarning",
    description:
      "A warning from the model provider for this call. The call will proceed, but e.g. some settings might not be supported, which can lead to suboptimal results.",
  });
export type GenerationWarning = z.infer<typeof GenerationWarning>;
export const generationWarningType =
  nodeInterfaceType<GenerationWarning>("GenerationWarning");

export const ImageModelResponseMetadata = z
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
export type ImageModelResponseMetadata = z.infer<
  typeof ImageModelResponseMetadata
>;
export const imageModelResponseMetadataType =
  nodeInterfaceType<ImageModelResponseMetadata>("ImageModelResponseMetadata");

export const ImageModelProviderMetadata = z
  .record(z.string(), z.object({ images: JSONArray }).and(JSONValue))
  .meta({
    title: "ImageModelProviderMetadata",
    description:
      "Provider-specific metadata for image models. It contains the images that were generated and any additional metadata that the provider wants to include.",
  });
export type ImageModelProviderMetadata = z.infer<
  typeof ImageModelProviderMetadata
>;
export const imageModelProviderMetadataType =
  nodeInterfaceType<ImageModelProviderMetadata>("ImageModelProviderMetadata");

export const GenerateImageParameters = z
  .object({
    model: ImageModel.describe("The image model to use for generating images."),
    prompt: z
      .string()
      .describe("The prompt that should be used to generate the image."),
    n: z
      .int()
      .optional()
      .default(1)
      .describe("Number of images to generate. Default: 1."),
    size: z
      .string()
      .optional()
      .describe(
        "Size of the images to generate. Must have the format `{width}x{height}`. If not provided, the default size will be used."
      ),
    aspectRatio: z
      .string()
      .optional()
      .describe(
        "Aspect ratio of the images to generate. Must have the format `{width}:{height}`. If not provided, the default aspect ratio will be used."
      ),
    seed: z
      .int()
      .optional()
      .describe(
        "Seed for the image generation. If not provided, the default seed will be used."
      ),
    providerOptions: ProviderOptions.optional(),
    maxRetries: z
      .int()
      .optional()
      .default(2)
      .describe(
        "Maximum number of retries per image generation call. Set to 0 to disable retries."
      ),
    abortSignal: z.instanceof(AbortSignal),
    headers: z
      .record(z.string(), z.string())
      .optional()
      .describe(
        "Additional headers to include in the request. Only applicable for HTTP-based providers."
      ),
  })
  .meta({
    title: "GenerateImageParameters",
    description:
      "Parameters for the `generateImage` call. It contains the model, prompt, and additional options.",
  });
export type GenerateImageParameters = z.infer<typeof GenerateImageParameters>;

export const GenerateImageResult = z
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
export type GenerateImageResult = z.infer<typeof GenerateImageResult>;

export const GeneratedAudioFile = GeneratedFile.extend({
  format: z
    .string()
    .describe("Audio format of the file (e.g., 'mp3', 'wav', etc.)"),
}).meta({
  title: "GeneratedAudioFile",
  description: "A generated audio file.",
});
export type GeneratedAudioFile = z.infer<typeof GeneratedAudioFile>;
export const generatedAudioFileType =
  nodeInterfaceType<GeneratedAudioFile>("GeneratedAudioFile");
generatedAudioFileType.addConversion(generatedFileType, (v) => v);

export const SpeechModelResponseMetadata = z
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
export type SpeechModelResponseMetadata = z.infer<
  typeof SpeechModelResponseMetadata
>;
export const speechModelResponseMetadataType =
  nodeInterfaceType<SpeechModelResponseMetadata>("SpeechModelResponseMetadata");

export const GenerateSpeechParameters = z
  .object({
    model: SpeechModel.describe(
      "The speech model to use for generating speech."
    ),
    text: z.string().describe("The text to convert to speech."),
    voice: z
      .string()
      .optional()
      .describe("The voice to use for speech generation."),
    outputFormat: z
      .string()
      .optional()
      .describe(
        "The desired output format for the audio e.g. 'mp3', 'wav', etc."
      ),
    instructions: z
      .string()
      .optional()
      .describe(
        "Instructions for the speech generation e.g. 'Speak in a slow and steady tone'."
      ),
    speed: z
      .number()
      .optional()
      .describe("The speed of the speech generation."),
    language: z
      .string()
      .optional()
      .describe(
        "The language for speech generation. This should be an ISO 639-1 language code (e.g. 'en', 'es', 'fr') or 'auto' for automatic language detection. Provider support varies."
      ),
    providerOptions: ProviderOptions.optional(),
    maxRetries: z
      .int()
      .optional()
      .default(2)
      .describe(
        "Maximum number of retries per speech model call. Set to 0 to disable retries."
      ),
    abortSignal: z.instanceof(AbortSignal).optional(),
    headers: z
      .record(z.string(), z.string())
      .optional()
      .describe(
        "Additional headers to include in the request. Only applicable for HTTP-based providers."
      ),
  })
  .meta({
    title: "GenerateSpeechParameters",
    description:
      "Parameters for the `generateSpeech` call. It contains the model, text, and additional options.",
  });
export type GenerateSpeechParameters = z.infer<typeof GenerateSpeechParameters>;

export const GenerateSpeechResult = z
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
export type GenerateSpeechResult = z.infer<typeof GenerateSpeechResult>;

export const TranscriptionModelResponseMetadata = z
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
export type TranscriptionModelResponseMetadata = z.infer<
  typeof TranscriptionModelResponseMetadata
>;

export const TranscriptionSegment = z
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
export type TranscriptionSegment = z.infer<typeof TranscriptionSegment>;

export const TranscriptionResult = z
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
export type TranscriptionResult = z.infer<typeof TranscriptionResult>;

export const SystemModelMessage = z
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
export type SystemModelMessage = z.infer<typeof SystemModelMessage>;

export const UserContent = z
  .union([z.string(), z.array(TextPart.or(ImagePart).or(FilePart))])
  .meta({
    title: "UserContent",
    description:
      "Content of a user message. It can be a string or an array of text and image parts.",
  });
export type UserContent = z.infer<typeof UserContent>;

export const UserModelMessage = z
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
export type UserModelMessage = z.infer<typeof UserModelMessage>;

export const ModelMessage = z
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
export type ModelMessage = z.infer<typeof ModelMessage>;

export const CallSettings = z
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
export type CallSettings = z.infer<typeof CallSettings>;

export const Prompt = z
  .object({
    system: z
      .string()
      .optional()
      .describe(
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
export type Prompt = z.infer<typeof Prompt>;

export const ToolChoiceKind = z.literal(["auto", "none", "required", "tool"]);
export type ToolChoiceKind = z.infer<typeof ToolChoiceKind>;
export const toolChoiceKindType =
  nodeInterfaceType<ToolChoiceKind>("ToolChoiceKind");

export const ToolChoice = z
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
export type ToolChoice = z.infer<typeof ToolChoice>;
export const toolChoiceType = nodeInterfaceType<ToolChoice>("ToolChoice");

export const StopCondition = zFunction<
  (options: { steps: Array<StepResult> }) => PromiseLike<boolean> | boolean
>().meta({
  title: "StopCondition",
  description:
    "A function that determines whether to stop the generation based on the current steps.",
});
export type StopCondition = z.infer<typeof StopCondition>;
export const stopConditionType =
  nodeInterfaceType<StopCondition>("StopCondition");

export const AttributeValue = z
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
export type AttributeValue = z.infer<typeof AttributeValue>;
export const attributeValueType =
  nodeInterfaceType<AttributeValue>("AttributeValue");
stringType.addConversion(attributeValueType, (v) => v);
numberType.addConversion(attributeValueType, (v) => v);
booleanType.addConversion(attributeValueType, (v) => v);

export const Tracer = z.custom<UpstreamTelemetrySettings["tracer"]>().meta({
  title: "Tracer",
  description: "An interface for creating spans in the telemetry system.",
});
export type Tracer = z.infer<typeof Tracer>;

export const TelemetrySettings = z
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
export type TelemetrySettings = z.infer<typeof TelemetrySettings>;
export const telemetrySettingsType =
  nodeInterfaceType<TelemetrySettings>("TelemetrySettings");

export const Output = z.custom<UpstreamOutput.Output<unknown, unknown>>().meta({
  title: "Output",
  description:
    "Specification for parsing structured outputs from the LLM response. It is experimental and subject to change.",
  id: "Output",
});
export type Output = z.infer<typeof Output>;
export const outputType = nodeInterfaceType<Output>("Output");

export type PrepareStepResult =
  | {
      model?: LanguageModel | string;
      toolChoice?: ToolChoice;
      activeTools?: Array<string>;
      system?: string;
      messages?: Array<ModelMessage>;
    }
  | undefined;

export const PrepareStepFunction = zFunction<
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
export type PrepareStepFunction = z.infer<typeof PrepareStepFunction>;
export const prepareStepFunctionType = nodeInterfaceType<PrepareStepFunction>(
  "PrepareStepFunction"
);

export const ToolCallOptions = z
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
export type ToolCallOptions = z.infer<typeof ToolCallOptions>;

// TODO: Add the proper structure for `Tool`.
export const Tool = z.custom<UpstreamTool>().meta({
  title: "Tool",
  description:
    "A tool that can be called by the language model. It can be a function tool or a provider-defined tool.",
});
export type Tool = z.infer<typeof Tool>;
export const toolType = nodeInterfaceType<Tool>("Tool");

export const ToolSet = z.record(z.string(), Tool).meta({
  title: "ToolSet",
  description:
    "A set of tools that can be called by the language model. It is a record of tool names to tool definitions.",
});
export type ToolSet = z.infer<typeof ToolSet>;

export const ToolCallRepairFunction = zFunction<
  (options: {
    system: string | undefined;
    messages: ModelMessage[];
    toolCall: ContentPartToolCall;
    tools: ToolSet;
    inputSchema: (options: { toolName: string }) => JSONSchema7;
    error: NoSuchToolError | InvalidToolInputError;
  }) => Promise<(Omit<ContentPartToolCall, "input"> & { input: string }) | null>
>().meta({
  title: "ToolCallRepairFunction",
  description:
    "A function that attempts to repair a tool call that failed to parse.\n\nIt receives the error and the context as arguments and returns the repaired tool call JSON as text.",
});
export type ToolCallRepairFunction = z.infer<typeof ToolCallRepairFunction>;
export const toolCallRepairFunctionType =
  nodeInterfaceType<ToolCallRepairFunction>("ToolCallRepairFunction");

export const GenerateTextOnStepFinishCallback = zFunction<
  (stepResult: StepResult) => Promise<void> | void
>().meta({
  title: "GenerateTextOnStepFinishCallback",
  description:
    "Callback that is called when each step (LLM call) is finished, including intermediate steps.",
});
export type GenerateTextOnStepFinishCallback = z.infer<
  typeof GenerateTextOnStepFinishCallback
>;
export const generateTextOnStepFinishCallbackType =
  nodeInterfaceType<GenerateTextOnStepFinishCallback>(
    "GenerateTextOnStepFinishCallback"
  );

export const GenerateTextParameters = CallSettings.extend(Prompt.shape)
  .extend({
    model: LanguageModel,
    tools: ToolSet.optional().describe(
      "The tools that the model can call. The model needs to support calling tools."
    ),
    toolChoice: ToolChoice.optional().describe(
      "The tool choice strategy. Default: 'auto'."
    ),
    stopWhen: z
      .union([StopCondition, z.array(StopCondition)])
      .describe(
        "Condition for stopping the generation when there are tool results in the last step. When the condition is an array, any of the conditions can be met to stop the generation. Default: `stepCountIs(1)`"
      ),
    experimental_telemetry: TelemetrySettings.optional(),
    providerOptions: ProviderOptions.optional(),
    activeTools: z
      .array(z.string())
      .optional()
      .describe(
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
export type GenerateTextParameters = z.infer<typeof GenerateTextParameters>;

export const abortSignalType = nodeInterfaceType<AbortSignal>("AbortSignal");

export const TextEmbeddingParameters = z
  .object({
    model: TextEmbeddingModel,
    value: z.string().describe("The value that should be embedded."),
    maxRetries: z
      .int()
      .min(0)
      .optional()
      .describe(
        "Maximum number of retries per embedding model call. Set to 0 to disable retries."
      ),
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
    title: "TextEmbeddingParameters",
    description:
      "Parameters for the `embed` function for text embeddings. It includes the model, value, and additional options.",
  });
export type TextEmbeddingParameters = z.infer<typeof TextEmbeddingParameters>;

export function registerAiGenerationInterfaceTypes(
  types: BaklavaInterfaceTypes
) {
  types.addTypes(
    attributeValueType,
    generateTextOnStepFinishCallbackType,
    imageModelType,
    languageModelType,
    outputType,
    prepareStepFunctionType,
    speechModelType,
    stopConditionType,
    telemetrySettingsType,
    textEmbeddingModelType,
    toolCallRepairFunctionType,
    toolChoiceType,
    toolType,
    transcriptionModelType,
    generatedFileType,
    contentPartSourceType,
    contentPartType,
    reasoningPartType,
    contentPartToolCallType,
    contentPartToolResultType,
    finishReasonType,
    dataContentType,
    urlType,
    dataContentOrUrlType,
    generationWarningType,
    imageModelResponseMetadataType,
    imageModelProviderMetadataType,
    embeddingModelUsageType,
    textEmbeddingResponseType,
    callWarningType,
    generateTextResultType,
    stepResultType,
    languageModelUsageType,
    languageModelRequestMetadataType,
    toolChoiceKindType,
    abortSignalType,
    generatedAudioFileType,
    speechModelResponseMetadataType
  );
}

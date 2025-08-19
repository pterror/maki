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
} from "ai";
import { assertStrict } from "../core";
import { defineNode, Editor } from "baklavajs";
import {
  checkboxInterface,
  dateType,
  integerInterface,
  integerType,
  listType,
  nodeInterface,
  numberInterface,
  numberType,
  selectInterface,
  stringDictType,
  stringType,
  textInterface,
  unknownType,
  unsafeAsOptionalNodeInterfaceType,
} from "./interfaceTypes";
import {
  attributeValueType,
  languageModelType,
  stopConditionType,
  telemetrySettingsType,
  toolChoiceType,
  imageModelType,
  textEmbeddingModelType,
  transcriptionModelType,
  speechModelType,
  outputType,
  prepareStepFunctionType,
  toolCallRepairFunctionType,
  generateTextOnStepFinishCallbackType,
  toolType,
  toolChoiceKindType,
  finishReasonType,
  languageModelUsageType,
  contentPartType,
  reasoningPartType,
  generatedFileType,
  contentPartSourceType,
  contentPartToolCallType,
  contentPartToolResultType,
  callWarningType,
  languageModelRequestMetadataType,
  languageModelResponseMetadataWithMessagesAndBodyType,
  stepResultType,
  abortSignalType,
  embeddingModelUsageType,
  textEmbeddingResponseType,
  dataContentOrUrlType,
  generationWarningType,
  imageModelResponseMetadataType,
  imageModelProviderMetadataType,
  generatedAudioFileType,
  speechModelResponseMetadataType,
} from "./aiGenerationTypes";
import { jsonValueType } from "./sharedTypes";
import {
  unsafeReplaceNumberWithInteger,
  unsafeReplaceOptionalWithUndefined,
} from "../object";

// TODO: Add rest of inputs for `generateImage`, `generateSpeech` , and `transcribe`

export const TelemetrySettingsNode = defineNode({
  type: "TelemetrySettingsNode",
  inputs: {
    isEnabled: () => checkboxInterface("Enabled", undefined!),
    recordInputs: () => checkboxInterface("Record Inputs", undefined!),
    recordOutputs: () => checkboxInterface("Record Outputs", undefined!),
    functionId: () => textInterface("Function Id", undefined!),
    metadata: () =>
      nodeInterface("Metadata", undefined!, stringDictType(attributeValueType)),
  },
  outputs: {
    telemetry: () =>
      nodeInterface("Telemetry", undefined!, telemetrySettingsType),
  },
  calculate({ isEnabled, recordInputs, recordOutputs, functionId, metadata }) {
    return {
      telemetry: {
        ...(isEnabled !== undefined && { isEnabled }),
        ...(recordInputs !== undefined && { recordInputs }),
        ...(recordOutputs !== undefined && { recordOutputs }),
        ...(functionId !== undefined && { functionId }),
        ...(metadata !== undefined && { metadata }),
      },
    };
  },
});

export const ToolChoiceNode = defineNode({
  type: "ToolChoiceNode",
  inputs: {
    type: () =>
      selectInterface("Type", "auto", toolChoiceKindType, [
        "auto",
        "none",
        "required",
        "tool",
      ]),
    toolName: () => textInterface("Tool Name", ""),
  },
  outputs: {
    toolChoice: () => nodeInterface("Tool Choice", "auto", toolChoiceType),
  },
  calculate({ type, toolName }) {
    if (type === "tool") {
      if (!toolName) {
        throw new Error("Tool name must be provided when type is 'tool'");
      }
      return { toolChoice: { type: "tool" as const, toolName } };
    }
    return { toolChoice: type };
  },
});

export const DeconstructGeneratedFileNode = defineNode({
  type: "DeconstructGeneratedFileNode",
  inputs: {
    file: () => nodeInterface("File", undefined!, generatedFileType),
  },
  outputs: {
    base64: () => nodeInterface("Base64", undefined!, stringType),
    uint8Array: () =>
      nodeInterface("Uint8Array", undefined!, listType(numberType)),
    mediaType: () => nodeInterface("Media Type", undefined!, stringType),
  },
});
export function registerDeconstructGeneratedFileNode(editor: Editor) {
  editor.registerNodeType(DeconstructGeneratedFileNode, {
    category: "AI Generation Utilities",
  });
}

export const DeconstructGeneratedAudioFileNode = defineNode({
  type: "DeconstructGeneratedAudioFileNode",
  inputs: {
    file: () => nodeInterface("File", undefined!, generatedAudioFileType),
  },
  outputs: {
    base64: () => nodeInterface("Base64", undefined!, stringType),
    uint8Array: () =>
      nodeInterface("Uint8Array", undefined!, listType(numberType)),
    mediaType: () => nodeInterface("Media Type", undefined!, stringType),
    format: () => nodeInterface("Format", undefined!, stringType),
  },
});
export function registerDeconstructGeneratedAudioFileNode(editor: Editor) {
  editor.registerNodeType(DeconstructGeneratedAudioFileNode, {
    category: "AI Generation Utilities",
  });
}

export const DeconstructSpeechModelResponseMetadataNode = defineNode({
  type: "DeconstructSpeechModelResponseMetadataNode",
  inputs: {
    response: () =>
      nodeInterface("Response", undefined!, speechModelResponseMetadataType),
  },
  outputs: {
    timestamp: () =>
      nodeInterface(
        "Timestamp",
        undefined,
        unsafeAsOptionalNodeInterfaceType(dateType)
      ),
    modelId: () =>
      nodeInterface(
        "Model Id",
        undefined,
        unsafeAsOptionalNodeInterfaceType(stringType)
      ),
    headers: () =>
      nodeInterface(
        "Headers",
        undefined,
        unsafeAsOptionalNodeInterfaceType(stringDictType(stringType))
      ),
    body: () => nodeInterface("Body", undefined, unknownType),
  },
  calculate({ response }) {
    return unsafeReplaceOptionalWithUndefined(response);
  },
});
export function registerDeconstructSpeechModelResponseNode(editor: Editor) {
  editor.registerNodeType(DeconstructSpeechModelResponseMetadataNode, {
    category: "AI Generation Utilities",
  });
}

export const DeconstructLanguageModelUsageNode = defineNode({
  type: "DeconstructLanguageModelUsageNode",
  inputs: {
    usage: () => nodeInterface("Usage", undefined!, languageModelUsageType),
  },
  outputs: {
    inputTokens: () =>
      nodeInterface(
        "Input Tokens",
        undefined,
        unsafeAsOptionalNodeInterfaceType(integerType)
      ),
    outputTokens: () =>
      nodeInterface(
        "Output Tokens",
        undefined,
        unsafeAsOptionalNodeInterfaceType(integerType)
      ),
    totalTokens: () =>
      nodeInterface(
        "Total Tokens",
        undefined,
        unsafeAsOptionalNodeInterfaceType(integerType)
      ),
    reasoningTokens: () =>
      nodeInterface(
        "Reasoning Tokens",
        undefined,
        unsafeAsOptionalNodeInterfaceType(integerType)
      ),
    cachedInputTokens: () =>
      nodeInterface(
        "Cached Input Tokens",
        undefined,
        unsafeAsOptionalNodeInterfaceType(integerType)
      ),
  },
  calculate({ usage }) {
    return unsafeReplaceOptionalWithUndefined(
      unsafeReplaceNumberWithInteger(usage)
    );
  },
});
export function registerDeconstructLanguageModelUsageNode(editor: Editor) {
  editor.registerNodeType(DeconstructLanguageModelUsageNode, {
    category: "AI Generation Utilities",
  });
}

export const DeconstructEmbeddingModelUsageNode = defineNode({
  type: "DeconstructEmbeddingModelUsageNode",
  inputs: {
    usage: () => nodeInterface("Usage", undefined!, embeddingModelUsageType),
  },
  outputs: {
    tokens: () =>
      nodeInterface(
        "Tokens",
        undefined,
        unsafeAsOptionalNodeInterfaceType(integerType)
      ),
  },
  calculate({ usage }) {
    return unsafeReplaceOptionalWithUndefined(
      unsafeReplaceNumberWithInteger(usage)
    );
  },
});
export function registerDeconstructEmbeddingModelUsageNode(editor: Editor) {
  editor.registerNodeType(DeconstructEmbeddingModelUsageNode, {
    category: "AI Generation Utilities",
  });
}

export const DeconstructTextEmbeddingResponseType = defineNode({
  type: "DeconstructTextEmbeddingResponseType",
  inputs: {
    response: () =>
      nodeInterface(
        "Response",
        undefined,
        unsafeAsOptionalNodeInterfaceType(textEmbeddingResponseType)
      ),
  },
  outputs: {
    headers: () =>
      nodeInterface(
        "Headers",
        undefined,
        unsafeAsOptionalNodeInterfaceType(stringDictType(stringType))
      ),
    body: () => nodeInterface("Body", undefined, unknownType),
  },
  calculate({ response }) {
    return unsafeReplaceOptionalWithUndefined(response);
  },
});
export function registerDeconstructTextEmbeddingResponseNode(editor: Editor) {
  editor.registerNodeType(DeconstructTextEmbeddingResponseType, {
    category: "AI Generation Utilities",
  });
}

export const GenerateTextNode = defineNode({
  type: "GenerateTextNode",
  inputs: {
    model: () => nodeInterface("Model", undefined!, languageModelType),
    tools: () =>
      nodeInterface("Tool Set", undefined!, stringDictType(toolType)),
    toolChoice: () => nodeInterface("Tool Choice", undefined!, toolChoiceType),
    stopWhen: () =>
      nodeInterface("Stop Condition", undefined!, stopConditionType),
    extraStopWhens: () =>
      nodeInterface(
        "Extra Stop Conditions",
        undefined!,
        listType(stopConditionType)
      ),
    experimental_telemetry: () =>
      nodeInterface("Telemetry", undefined!, telemetrySettingsType),
    providerOptions: () =>
      nodeInterface(
        "Provider Options",
        undefined!,
        stringDictType(stringDictType(jsonValueType))
      ),
    activeTools: () =>
      nodeInterface("Active Tools", undefined!, listType(stringType)),
    experimental_output: () => nodeInterface("Output", undefined!, outputType),
    prepareStep: () =>
      nodeInterface("Prepare Step", undefined!, prepareStepFunctionType),
    repairToolCall: () =>
      nodeInterface("Repair Tool Call", undefined!, toolCallRepairFunctionType),
    onStepFinish: () =>
      nodeInterface(
        "On Step Finish",
        undefined!,
        generateTextOnStepFinishCallbackType
      ),
  },
  outputs: {
    content: () => nodeInterface("Content", [], listType(contentPartType)),
    text: () => nodeInterface("Text", "", stringType),
    reasoning: () =>
      nodeInterface("Reasoning", [], listType(reasoningPartType)),
    reasoningText: () =>
      nodeInterface(
        "Reasoning Text",
        undefined,
        unsafeAsOptionalNodeInterfaceType(stringType)
      ),
    files: () => nodeInterface("Files", [], listType(generatedFileType)),
    sources: () =>
      nodeInterface("Sources", [], listType(contentPartSourceType)),
    toolCalls: () =>
      nodeInterface("Tool Calls", [], listType(contentPartToolCallType)),
    staticToolCalls: () =>
      nodeInterface("Static Tool Calls", [], listType(contentPartToolCallType)),
    dynamicToolCalls: () =>
      nodeInterface(
        "Dynamic Tool Calls",
        [],
        listType(contentPartToolCallType)
      ),
    toolResults: () =>
      nodeInterface("Tool Results", [], listType(contentPartToolResultType)),
    staticToolResults: () =>
      nodeInterface(
        "Static Tool Results",
        [],
        listType(contentPartToolResultType)
      ),
    dynamicToolResults: () =>
      nodeInterface(
        "Dynamic Tool Results",
        [],
        listType(contentPartToolResultType)
      ),
    finishReason: () =>
      nodeInterface("Finish Reason", "unknown", finishReasonType),
    usage: () => nodeInterface("Usage", {}, languageModelUsageType),
    totalUsage: () => nodeInterface("Total Usage", {}, languageModelUsageType),
    warnings: () =>
      nodeInterface(
        "Warnings",
        undefined,
        unsafeAsOptionalNodeInterfaceType(listType(callWarningType))
      ),
    request: () =>
      nodeInterface(
        "Request Metadata",
        undefined!,
        languageModelRequestMetadataType
      ),
    response: () =>
      nodeInterface(
        "Response Metadata",
        undefined!,
        languageModelResponseMetadataWithMessagesAndBodyType
      ),
    providerMetadata: () =>
      nodeInterface(
        "Provider Metadata",
        undefined,
        unsafeAsOptionalNodeInterfaceType(
          stringDictType(stringDictType(jsonValueType))
        )
      ),
    steps: () => nodeInterface("Steps", [], listType(stepResultType)),
    experimental_output: () =>
      nodeInterface("Output (Experimental)", undefined!, unknownType),
  },
  async calculate({ stopWhen, extraStopWhens, repairToolCall, ...rest }) {
    return await generateText({
      ...rest,
      // @ts-expect-error This is intentional, this input is `null` by default
      ...((stopWhen ?? extraStopWhens) && {
        stopWhen: [...(stopWhen ? [stopWhen] : []), ...extraStopWhens],
      }),
      ...(repairToolCall && {
        experimental_repairToolCall: repairToolCall,
      }),
    });
  },
});
export function registerGenerateTextNode(editor: Editor) {
  editor.registerNodeType(GenerateTextNode, {
    category: "AI Generation",
  });
}

export const TextEmbeddingNode = defineNode({
  type: "TextEmbeddingNode",
  inputs: {
    model: () => nodeInterface("Model", undefined!, textEmbeddingModelType),
    value: () => textInterface("Value"),
    maxRetries: () => integerInterface("Max Retries", undefined!),
    abortSignal: () =>
      nodeInterface("Abort Signal", undefined!, abortSignalType),
    headers: () =>
      nodeInterface("Headers", undefined!, stringDictType(stringType)),
    providerOptions: () =>
      nodeInterface(
        "Provider Options",
        undefined!,
        stringDictType(stringDictType(jsonValueType))
      ),
    experimental_telemetry: () =>
      nodeInterface("Telemetry", undefined!, telemetrySettingsType),
  },
  outputs: {
    value: () => nodeInterface("Value", undefined!, stringType),
    embedding: () =>
      nodeInterface("Embedding", undefined!, listType(numberType)),
    usage: () => nodeInterface("Usage", undefined!, embeddingModelUsageType),
    providerMetadata: () =>
      nodeInterface(
        "Provider Metadata",
        undefined,
        unsafeAsOptionalNodeInterfaceType(
          stringDictType(stringDictType(jsonValueType))
        )
      ),
    response: () =>
      nodeInterface(
        "Response",
        undefined,
        unsafeAsOptionalNodeInterfaceType(textEmbeddingResponseType)
      ),
  },
  async calculate(args) {
    return unsafeReplaceOptionalWithUndefined(await embed<string>(args));
  },
});
export function registerTextEmbeddingNode(editor: Editor) {
  editor.registerNodeType(TextEmbeddingNode, {
    category: "AI Generation",
  });
}

export const GenerateImageNode = defineNode({
  type: "GenerateImageNode",
  inputs: {
    model: () => nodeInterface("Model", undefined!, imageModelType),
    prompt: () => textInterface("Prompt"),
    n: () => integerInterface("Number of Images", undefined!),
    width: () => integerInterface("Width", undefined!),
    height: () => integerInterface("Height", undefined!),
    aspectRatioWidth: () => integerInterface("Aspect Ratio Width", undefined!),
    aspectRatioHeight: () =>
      integerInterface("Aspect Ratio Height", undefined!),
    seed: () => integerInterface("Seed", undefined!),
    providerOptions: () =>
      nodeInterface(
        "Provider Options",
        undefined!,
        stringDictType(stringDictType(jsonValueType))
      ),
    maxRetries: () => integerInterface("Max Retries", undefined!),
    abortSignal: () =>
      nodeInterface("Abort Signal", undefined!, abortSignalType),
    headers: () =>
      nodeInterface("Headers", undefined!, stringDictType(stringType)),
  },
  outputs: {
    image: () => nodeInterface("Image", undefined!, generatedFileType),
    images: () =>
      nodeInterface("Images", undefined!, listType(generatedFileType)),
    warnings: () =>
      nodeInterface("Warnings", [], listType(generationWarningType)),
    responses: () =>
      nodeInterface("Responses", [], listType(imageModelResponseMetadataType)),
    providerMetadata: () =>
      nodeInterface("Provider Metadata", {}, imageModelProviderMetadataType),
  },
  async calculate({
    width,
    height,
    aspectRatioWidth,
    aspectRatioHeight,
    ...rest
  }) {
    return generateImage({
      ...rest,
      ...(width !== undefined &&
        height !== undefined && { size: `${width}x${height}` }),
      ...(aspectRatioWidth !== undefined &&
        aspectRatioHeight !== undefined && {
          aspectRatio: `${aspectRatioWidth}:${aspectRatioHeight}`,
        }),
    });
  },
});
export function registerGenerateImageNode(editor: Editor) {
  editor.registerNodeType(GenerateImageNode, {
    category: "AI Generation",
  });
}

export const GenerateSpeechNode = defineNode({
  type: "GenerateSpeechNode",
  inputs: {
    model: () => nodeInterface("Model", undefined!, speechModelType),
    text: () => textInterface("Text"),
    voice: () => textInterface("Voice", undefined!),
    speed: () => numberInterface("Speed", undefined!),
    language: () => textInterface("Language", undefined!),
    providerOptions: () =>
      nodeInterface(
        "Provider Options",
        undefined!,
        stringDictType(stringDictType(jsonValueType))
      ),
    maxRetries: () => integerInterface("Max Retries", undefined!),
    abortSignal: () =>
      nodeInterface("Abort Signal", undefined!, abortSignalType),
    headers: () =>
      nodeInterface("Headers", undefined!, stringDictType(stringType)),
  },
  outputs: {
    audio: () => nodeInterface("Audio", undefined!, generatedAudioFileType),
    warnings: () =>
      nodeInterface("Warnings", [], listType(generationWarningType)),
    responses: () =>
      nodeInterface("Responses", [], listType(speechModelResponseMetadataType)),
    providerMetadata: () =>
      nodeInterface(
        "Provider Metadata",
        {},
        stringDictType(stringDictType(jsonValueType))
      ),
  },
  calculate: generateSpeech,
});
export function registerGenerateSpeechNode(editor: Editor) {
  editor.registerNodeType(GenerateSpeechNode, {
    category: "AI Generation",
  });
}

export const TranscribeNode = defineNode({
  type: "TranscribeNode",
  inputs: {
    model: () => nodeInterface("Model", undefined!, transcriptionModelType),
    audio: () => nodeInterface("Audio", undefined!, dataContentOrUrlType),
    // TODO: Add the rest of the inputs for `transcribe`.
  },
  outputs: TranscriptionResult,
  calculate: transcribe,
});
export function registerTranscribeNode(editor: Editor) {
  editor.registerNodeType(TranscribeNode, {
    category: "AI Generation",
  });
}

export const BedrockLanguageModelNode = defineNode({
  type: "BedrockLanguageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, languageModelType),
  },
  calculate({ modelId }) {
    return { model: bedrock.languageModel(modelId) };
  },
});
export function registerBedrockLanguageModelNode(editor: Editor) {
  editor.registerNodeType(BedrockLanguageModelNode, {
    category: "AI Generation",
  });
}

export const BedrockTextEmbeddingModelNode = defineNode({
  type: "BedrockTextEmbeddingModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, textEmbeddingModelType),
  },
  calculate({ modelId }) {
    return { model: bedrock.textEmbeddingModel(modelId) };
  },
});
export function registerBedrockTextEmbeddingModelNode(editor: Editor) {
  editor.registerNodeType(BedrockTextEmbeddingModelNode, {
    category: "AI Generation",
  });
}

export const BedrockImageModelNode = defineNode({
  type: "BedrockImageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, imageModelType),
  },
  calculate({ modelId }) {
    return { model: bedrock.imageModel(modelId) };
  },
});
export function registerBedrockImageModelNode(editor: Editor) {
  editor.registerNodeType(BedrockImageModelNode, {
    category: "AI Generation",
  });
}

export const BedrockSpeechModelNode = defineNode({
  type: "BedrockSpeechModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, speechModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        bedrock.speechModel,
        "Amazon Bedrock does not support speech synthesis"
      )(modelId),
    };
  },
});
export function registerBedrockSpeechModelNode(editor: Editor) {
  editor.registerNodeType(BedrockSpeechModelNode, {
    category: "AI Generation",
  });
}

export const BedrockTranscriptionModelNode = defineNode({
  type: "BedrockTranscriptionModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, transcriptionModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        bedrock.transcriptionModel,
        "Amazon Bedrock does not support transcription"
      )(modelId),
    };
  },
});
export function registerBedrockTranscriptionModelNode(editor: Editor) {
  editor.registerNodeType(BedrockTranscriptionModelNode, {
    category: "AI Generation",
  });
}

/** Use `registerAiGenerationNodes` instead if you want to register all providers. */
export function registerAiBedrockProviderNodes(editor: Editor) {
  registerBedrockLanguageModelNode(editor);
  registerBedrockTextEmbeddingModelNode(editor);
  registerBedrockImageModelNode(editor);
  registerBedrockSpeechModelNode(editor);
  registerBedrockTranscriptionModelNode(editor);
}

export const AnthropicLanguageModelNode = defineNode({
  type: "AnthropicLanguageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, languageModelType),
  },
  calculate({ modelId }) {
    return { model: anthropic.languageModel(modelId) };
  },
});
export function registerAnthropicLanguageModelNode(editor: Editor) {
  editor.registerNodeType(AnthropicLanguageModelNode, {
    category: "AI Generation",
  });
}

export const AnthropicTextEmbeddingModelNode = defineNode({
  type: "AnthropicTextEmbeddingModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, textEmbeddingModelType),
  },
  calculate({ modelId }) {
    return { model: anthropic.textEmbeddingModel(modelId) };
  },
});
export function registerAnthropicTextEmbeddingModelNode(editor: Editor) {
  editor.registerNodeType(AnthropicTextEmbeddingModelNode, {
    category: "AI Generation",
  });
}

export const AnthropicImageModelNode = defineNode({
  type: "AnthropicImageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, imageModelType),
  },
  calculate({ modelId }) {
    return { model: anthropic.imageModel(modelId) };
  },
});
export function registerAnthropicImageModelNode(editor: Editor) {
  editor.registerNodeType(AnthropicImageModelNode, {
    category: "AI Generation",
  });
}

export const AnthropicSpeechModelNode = defineNode({
  type: "AnthropicSpeechModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, speechModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        anthropic.speechModel,
        "Anthropic does not support speech synthesis"
      )(modelId),
    };
  },
});
export function registerAnthropicSpeechModelNode(editor: Editor) {
  editor.registerNodeType(AnthropicSpeechModelNode, {
    category: "AI Generation",
  });
}

export const AnthropicTranscriptionModelNode = defineNode({
  type: "AnthropicTranscriptionModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, transcriptionModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        anthropic.transcriptionModel,
        "Anthropic does not support transcription"
      )(modelId),
    };
  },
});
export function registerAnthropicTranscriptionModelNode(editor: Editor) {
  editor.registerNodeType(AnthropicTranscriptionModelNode, {
    category: "AI Generation",
  });
}

/** Use `registerAiGenerationNodes` instead if you want to register all providers. */
export function registerAiAnthropicProviderNodes(editor: Editor) {
  registerAnthropicLanguageModelNode(editor);
  registerAnthropicTextEmbeddingModelNode(editor);
  registerAnthropicImageModelNode(editor);
  registerAnthropicSpeechModelNode(editor);
  registerAnthropicTranscriptionModelNode(editor);
}

export const AssemblyaiLanguageModelNode = defineNode({
  type: "AssemblyaiLanguageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, languageModelType),
  },
  calculate({ modelId }) {
    return { model: assemblyai.languageModel(modelId) };
  },
});
export function registerAssemblyaiLanguageModelNode(editor: Editor) {
  editor.registerNodeType(AssemblyaiLanguageModelNode, {
    category: "AI Generation",
  });
}

export const AssemblyaiTextEmbeddingModelNode = defineNode({
  type: "AssemblyaiTextEmbeddingModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, textEmbeddingModelType),
  },
  calculate({ modelId }) {
    return { model: assemblyai.textEmbeddingModel(modelId) };
  },
});
export function registerAssemblyaiTextEmbeddingModelNode(editor: Editor) {
  editor.registerNodeType(AssemblyaiTextEmbeddingModelNode, {
    category: "AI Generation",
  });
}

export const AssemblyaiImageModelNode = defineNode({
  type: "AssemblyaiImageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, imageModelType),
  },
  calculate({ modelId }) {
    return { model: assemblyai.imageModel(modelId) };
  },
});
export function registerAssemblyaiImageModelNode(editor: Editor) {
  editor.registerNodeType(AssemblyaiImageModelNode, {
    category: "AI Generation",
  });
}

export const AssemblyaiSpeechModelNode = defineNode({
  type: "AssemblyaiSpeechModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, speechModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        assemblyai.speechModel,
        "AssemblyAI does not support speech synthesis"
      )(modelId),
    };
  },
});
export function registerAssemblyaiSpeechModelNode(editor: Editor) {
  editor.registerNodeType(AssemblyaiSpeechModelNode, {
    category: "AI Generation",
  });
}

export const AssemblyaiTranscriptionModelNode = defineNode({
  type: "AssemblyaiTranscriptionModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, transcriptionModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        assemblyai.transcriptionModel,
        "AssemblyAI does not support transcription"
      )(modelId),
    };
  },
});

export function registerAssemblyaiTranscriptionModelNode(editor: Editor) {
  editor.registerNodeType(AssemblyaiTranscriptionModelNode, {
    category: "AI Generation",
  });
}

/** Use `registerAiGenerationNodes` instead if you want to register all providers. */
export function registerAiAssemblyaiProviderNodes(editor: Editor) {
  registerAssemblyaiLanguageModelNode(editor);
  registerAssemblyaiTextEmbeddingModelNode(editor);
  registerAssemblyaiImageModelNode(editor);
  registerAssemblyaiSpeechModelNode(editor);
  registerAssemblyaiTranscriptionModelNode(editor);
}

export const AzureLanguageModelNode = defineNode({
  type: "AzureLanguageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, languageModelType),
  },
  calculate({ modelId }) {
    return { model: azure.languageModel(modelId) };
  },
});
export function registerAzureLanguageModelNode(editor: Editor) {
  editor.registerNodeType(AzureLanguageModelNode, {
    category: "AI Generation",
  });
}

export const AzureTextEmbeddingModelNode = defineNode({
  type: "AzureTextEmbeddingModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, textEmbeddingModelType),
  },
  calculate({ modelId }) {
    return { model: azure.textEmbeddingModel(modelId) };
  },
});
export function registerAzureTextEmbeddingModelNode(editor: Editor) {
  editor.registerNodeType(AzureTextEmbeddingModelNode, {
    category: "AI Generation",
  });
}

export const AzureImageModelNode = defineNode({
  type: "AzureImageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, imageModelType),
  },
  calculate({ modelId }) {
    return { model: azure.imageModel(modelId) };
  },
});
export function registerAzureImageModelNode(editor: Editor) {
  editor.registerNodeType(AzureImageModelNode, {
    category: "AI Generation",
  });
}

export const AzureSpeechModelNode = defineNode({
  type: "AzureSpeechModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, speechModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        azure.speechModel,
        "Azure does not support speech synthesis"
      )(modelId),
    };
  },
});
export function registerAzureSpeechModelNode(editor: Editor) {
  editor.registerNodeType(AzureSpeechModelNode, {
    category: "AI Generation",
  });
}

export const AzureTranscriptionModelNode = defineNode({
  type: "AzureTranscriptionModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, transcriptionModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        azure.transcriptionModel,
        "Azure does not support transcription"
      )(modelId),
    };
  },
});
export function registerAzureTranscriptionModelNode(editor: Editor) {
  editor.registerNodeType(AzureTranscriptionModelNode, {
    category: "AI Generation",
  });
}

/** Use `registerAiGenerationNodes` instead if you want to register all providers. */
export function registerAiAzureProviderNodes(editor: Editor) {
  registerAzureLanguageModelNode(editor);
  registerAzureTextEmbeddingModelNode(editor);
  registerAzureImageModelNode(editor);
  registerAzureSpeechModelNode(editor);
  registerAzureTranscriptionModelNode(editor);
}

export const CerebrasLanguageModelNode = defineNode({
  type: "CerebrasLanguageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, languageModelType),
  },
  calculate({ modelId }) {
    return { model: cerebras.languageModel(modelId) };
  },
});
export function registerCerebrasLanguageModelNode(editor: Editor) {
  editor.registerNodeType(CerebrasLanguageModelNode, {
    category: "AI Generation",
  });
}

export const CerebrasTextEmbeddingModelNode = defineNode({
  type: "CerebrasTextEmbeddingModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, textEmbeddingModelType),
  },
  calculate({ modelId }) {
    return { model: cerebras.textEmbeddingModel(modelId) };
  },
});
export function registerCerebrasTextEmbeddingModelNode(editor: Editor) {
  editor.registerNodeType(CerebrasTextEmbeddingModelNode, {
    category: "AI Generation",
  });
}

export const CerebrasImageModelNode = defineNode({
  type: "CerebrasImageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, imageModelType),
  },
  calculate({ modelId }) {
    return { model: cerebras.imageModel(modelId) };
  },
});
export function registerCerebrasImageModelNode(editor: Editor) {
  editor.registerNodeType(CerebrasImageModelNode, {
    category: "AI Generation",
  });
}

export const CerebrasSpeechModelNode = defineNode({
  type: "CerebrasSpeechModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, speechModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        cerebras.speechModel,
        "Cerebras does not support speech synthesis"
      )(modelId),
    };
  },
});
export function registerCerebrasSpeechModelNode(editor: Editor) {
  editor.registerNodeType(CerebrasSpeechModelNode, {
    category: "AI Generation",
  });
}

export const CerebrasTranscriptionModelNode = defineNode({
  type: "CerebrasTranscriptionModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, transcriptionModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        cerebras.transcriptionModel,
        "Cerebras does not support transcription"
      )(modelId),
    };
  },
});
export function registerCerebrasTranscriptionModelNode(editor: Editor) {
  editor.registerNodeType(CerebrasTranscriptionModelNode, {
    category: "AI Generation",
  });
}

/** Use `registerAiGenerationNodes` instead if you want to register all providers. */
export function registerAiCerebrasProviderNodes(editor: Editor) {
  registerCerebrasLanguageModelNode(editor);
  registerCerebrasTextEmbeddingModelNode(editor);
  registerCerebrasImageModelNode(editor);
  registerCerebrasSpeechModelNode(editor);
  registerCerebrasTranscriptionModelNode(editor);
}

export const CohereLanguageModelNode = defineNode({
  type: "CohereLanguageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, languageModelType),
  },
  calculate({ modelId }) {
    return { model: cohere.languageModel(modelId) };
  },
});
export function registerCohereLanguageModelNode(editor: Editor) {
  editor.registerNodeType(CohereLanguageModelNode, {
    category: "AI Generation",
  });
}

export const CohereTextEmbeddingModelNode = defineNode({
  type: "CohereTextEmbeddingModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, textEmbeddingModelType),
  },
  calculate({ modelId }) {
    return { model: cohere.textEmbeddingModel(modelId) };
  },
});
export function registerCohereTextEmbeddingModelNode(editor: Editor) {
  editor.registerNodeType(CohereTextEmbeddingModelNode, {
    category: "AI Generation",
  });
}

export const CohereImageModelNode = defineNode({
  type: "CohereImageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, imageModelType),
  },
  calculate({ modelId }) {
    return { model: cohere.imageModel(modelId) };
  },
});
export function registerCohereImageModelNode(editor: Editor) {
  editor.registerNodeType(CohereImageModelNode, {
    category: "AI Generation",
  });
}

export const CohereSpeechModelNode = defineNode({
  type: "CohereSpeechModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, speechModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        cohere.speechModel,
        "Cohere does not support speech synthesis"
      )(modelId),
    };
  },
});
export function registerCohereSpeechModelNode(editor: Editor) {
  editor.registerNodeType(CohereSpeechModelNode, {
    category: "AI Generation",
  });
}

export const CohereTranscriptionModelNode = defineNode({
  type: "CohereTranscriptionModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, transcriptionModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        cohere.transcriptionModel,
        "Cohere does not support transcription"
      )(modelId),
    };
  },
});
export function registerCohereTranscriptionModelNode(editor: Editor) {
  editor.registerNodeType(CohereTranscriptionModelNode, {
    category: "AI Generation",
  });
}

/** Use `registerAiGenerationNodes` instead if you want to register all providers. */
export function registerAiCohereProviderNodes(editor: Editor) {
  registerCohereLanguageModelNode(editor);
  registerCohereTextEmbeddingModelNode(editor);
  registerCohereImageModelNode(editor);
  registerCohereSpeechModelNode(editor);
  registerCohereTranscriptionModelNode(editor);
}

export const DeepgramLanguageModelNode = defineNode({
  type: "DeepgramLanguageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, languageModelType),
  },
  calculate({ modelId }) {
    return { model: deepgram.languageModel(modelId) };
  },
});
export function registerDeepgramLanguageModelNode(editor: Editor) {
  editor.registerNodeType(DeepgramLanguageModelNode, {
    category: "AI Generation",
  });
}

export const DeepgramTextEmbeddingModelNode = defineNode({
  type: "DeepgramTextEmbeddingModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, textEmbeddingModelType),
  },
  calculate({ modelId }) {
    return { model: deepgram.textEmbeddingModel(modelId) };
  },
});
export function registerDeepgramTextEmbeddingModelNode(editor: Editor) {
  editor.registerNodeType(DeepgramTextEmbeddingModelNode, {
    category: "AI Generation",
  });
}

export const DeepgramImageModelNode = defineNode({
  type: "DeepgramImageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, imageModelType),
  },
  calculate({ modelId }) {
    return { model: deepgram.imageModel(modelId) };
  },
});
export function registerDeepgramImageModelNode(editor: Editor) {
  editor.registerNodeType(DeepgramImageModelNode, {
    category: "AI Generation",
  });
}

export const DeepgramSpeechModelNode = defineNode({
  type: "DeepgramSpeechModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, speechModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        deepgram.speechModel,
        "Deepgram does not support speech synthesis"
      )(modelId),
    };
  },
});
export function registerDeepgramSpeechModelNode(editor: Editor) {
  editor.registerNodeType(DeepgramSpeechModelNode, {
    category: "AI Generation",
  });
}

export const DeepgramTranscriptionModelNode = defineNode({
  type: "DeepgramTranscriptionModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, transcriptionModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        deepgram.transcriptionModel,
        "Deepgram does not support transcription"
      )(modelId),
    };
  },
});
export function registerDeepgramTranscriptionModelNode(editor: Editor) {
  editor.registerNodeType(DeepgramTranscriptionModelNode, {
    category: "AI Generation",
  });
}

/** Use `registerAiGenerationNodes` instead if you want to register all providers. */
export function registerAiDeepgramProviderNodes(editor: Editor) {
  registerDeepgramLanguageModelNode(editor);
  registerDeepgramTextEmbeddingModelNode(editor);
  registerDeepgramImageModelNode(editor);
  registerDeepgramSpeechModelNode(editor);
  registerDeepgramTranscriptionModelNode(editor);
}

export const DeepinfraLanguageModelNode = defineNode({
  type: "DeepinfraLanguageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, languageModelType),
  },
  calculate({ modelId }) {
    return { model: deepinfra.languageModel(modelId) };
  },
});
export function registerDeepinfraLanguageModelNode(editor: Editor) {
  editor.registerNodeType(DeepinfraLanguageModelNode, {
    category: "AI Generation",
  });
}

export const DeepinfraTextEmbeddingModelNode = defineNode({
  type: "DeepinfraTextEmbeddingModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, textEmbeddingModelType),
  },
  calculate({ modelId }) {
    return { model: deepinfra.textEmbeddingModel(modelId) };
  },
});
export function registerDeepinfraTextEmbeddingModelNode(editor: Editor) {
  editor.registerNodeType(DeepinfraTextEmbeddingModelNode, {
    category: "AI Generation",
  });
}

export const DeepinfraImageModelNode = defineNode({
  type: "DeepinfraImageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, imageModelType),
  },
  calculate({ modelId }) {
    return { model: deepinfra.imageModel(modelId) };
  },
});
export function registerDeepinfraImageModelNode(editor: Editor) {
  editor.registerNodeType(DeepinfraImageModelNode, {
    category: "AI Generation",
  });
}

export const DeepinfraSpeechModelNode = defineNode({
  type: "DeepinfraSpeechModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, speechModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        deepinfra.speechModel,
        "Deepinfra does not support speech synthesis"
      )(modelId),
    };
  },
});
export function registerDeepinfraSpeechModelNode(editor: Editor) {
  editor.registerNodeType(DeepinfraSpeechModelNode, {
    category: "AI Generation",
  });
}

export const DeepinfraTranscriptionModelNode = defineNode({
  type: "DeepinfraTranscriptionModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, transcriptionModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        deepinfra.transcriptionModel,
        "Deepinfra does not support transcription"
      )(modelId),
    };
  },
});
export function registerDeepinfraTranscriptionModelNode(editor: Editor) {
  editor.registerNodeType(DeepinfraTranscriptionModelNode, {
    category: "AI Generation",
  });
}

export const DeepseekLanguageModelNode = defineNode({
  type: "DeepseekLanguageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, languageModelType),
  },
  calculate({ modelId }) {
    return { model: deepseek.languageModel(modelId) };
  },
});
export function registerDeepseekLanguageModelNode(editor: Editor) {
  editor.registerNodeType(DeepseekLanguageModelNode, {
    category: "AI Generation",
  });
}

export const DeepseekTextEmbeddingModelNode = defineNode({
  type: "DeepseekTextEmbeddingModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, textEmbeddingModelType),
  },
  calculate({ modelId }) {
    return { model: deepseek.textEmbeddingModel(modelId) };
  },
});
export function registerDeepseekTextEmbeddingModelNode(editor: Editor) {
  editor.registerNodeType(DeepseekTextEmbeddingModelNode, {
    category: "AI Generation",
  });
}

export const DeepseekImageModelNode = defineNode({
  type: "DeepseekImageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, imageModelType),
  },
  calculate({ modelId }) {
    return { model: deepseek.imageModel(modelId) };
  },
});
export function registerDeepseekImageModelNode(editor: Editor) {
  editor.registerNodeType(DeepseekImageModelNode, {
    category: "AI Generation",
  });
}

export const DeepseekSpeechModelNode = defineNode({
  type: "DeepseekSpeechModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, speechModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        deepseek.speechModel,
        "Deepseek does not support speech synthesis"
      )(modelId),
    };
  },
});
export function registerDeepseekSpeechModelNode(editor: Editor) {
  editor.registerNodeType(DeepseekSpeechModelNode, {
    category: "AI Generation",
  });
}

export const DeepseekTranscriptionModelNode = defineNode({
  type: "DeepseekTranscriptionModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, transcriptionModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        deepseek.transcriptionModel,
        "Deepseek does not support transcription"
      )(modelId),
    };
  },
});
export function registerDeepseekTranscriptionModelNode(editor: Editor) {
  editor.registerNodeType(DeepseekTranscriptionModelNode, {
    category: "AI Generation",
  });
}

/** Use `registerAiGenerationNodes` instead if you want to register all providers. */
export function registerAiDeepseekProviderNodes(editor: Editor) {
  registerDeepseekLanguageModelNode(editor);
  registerDeepseekTextEmbeddingModelNode(editor);
  registerDeepseekImageModelNode(editor);
  registerDeepseekSpeechModelNode(editor);
  registerDeepseekTranscriptionModelNode(editor);
}

export const ElevenlabsLanguageModelNode = defineNode({
  type: "ElevenlabsLanguageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, languageModelType),
  },
  calculate({ modelId }) {
    return { model: elevenlabs.languageModel(modelId) };
  },
});
export function registerElevenlabsLanguageModelNode(editor: Editor) {
  editor.registerNodeType(ElevenlabsLanguageModelNode, {
    category: "AI Generation",
  });
}

export const ElevenlabsTextEmbeddingModelNode = defineNode({
  type: "ElevenlabsTextEmbeddingModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, textEmbeddingModelType),
  },
  calculate({ modelId }) {
    return { model: elevenlabs.textEmbeddingModel(modelId) };
  },
});
export function registerElevenlabsTextEmbeddingModelNode(editor: Editor) {
  editor.registerNodeType(ElevenlabsTextEmbeddingModelNode, {
    category: "AI Generation",
  });
}

export const ElevenlabsImageModelNode = defineNode({
  type: "ElevenlabsImageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, imageModelType),
  },
  calculate({ modelId }) {
    return { model: elevenlabs.imageModel(modelId) };
  },
});
export function registerElevenlabsImageModelNode(editor: Editor) {
  editor.registerNodeType(ElevenlabsImageModelNode, {
    category: "AI Generation",
  });
}

export const ElevenlabsSpeechModelNode = defineNode({
  type: "ElevenlabsSpeechModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, speechModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        elevenlabs.speechModel,
        "ElevenLabs does not support speech synthesis"
      )(modelId),
    };
  },
});
export function registerElevenlabsSpeechModelNode(editor: Editor) {
  editor.registerNodeType(ElevenlabsSpeechModelNode, {
    category: "AI Generation",
  });
}

export const ElevenlabsTranscriptionModelNode = defineNode({
  type: "ElevenlabsTranscriptionModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, transcriptionModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        elevenlabs.transcriptionModel,
        "ElevenLabs does not support transcription"
      )(modelId),
    };
  },
});
export function registerElevenlabsTranscriptionModelNode(editor: Editor) {
  editor.registerNodeType(ElevenlabsTranscriptionModelNode, {
    category: "AI Generation",
  });
}

/** Use `registerAiGenerationNodes` instead if you want to register all providers. */
export function registerAiElevenlabsProviderNodes(editor: Editor) {
  registerElevenlabsLanguageModelNode(editor);
  registerElevenlabsTextEmbeddingModelNode(editor);
  registerElevenlabsImageModelNode(editor);
  registerElevenlabsSpeechModelNode(editor);
  registerElevenlabsTranscriptionModelNode(editor);
}

export const FalLanguageModelNode = defineNode({
  type: "FalLanguageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, languageModelType),
  },
  calculate({ modelId }) {
    return { model: fal.languageModel(modelId) };
  },
});
export function registerFalLanguageModelNode(editor: Editor) {
  editor.registerNodeType(FalLanguageModelNode, {
    category: "AI Generation",
  });
}

export const FalTextEmbeddingModelNode = defineNode({
  type: "FalTextEmbeddingModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, textEmbeddingModelType),
  },
  calculate({ modelId }) {
    return { model: fal.textEmbeddingModel(modelId) };
  },
});
export function registerFalTextEmbeddingModelNode(editor: Editor) {
  editor.registerNodeType(FalTextEmbeddingModelNode, {
    category: "AI Generation",
  });
}

export const FalImageModelNode = defineNode({
  type: "FalImageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, imageModelType),
  },
  calculate({ modelId }) {
    return { model: fal.imageModel(modelId) };
  },
});
export function registerFalImageModelNode(editor: Editor) {
  editor.registerNodeType(FalImageModelNode, {
    category: "AI Generation",
  });
}

export const FalSpeechModelNode = defineNode({
  type: "FalSpeechModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, speechModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        fal.speechModel,
        "Fal does not support speech synthesis"
      )(modelId),
    };
  },
});
export function registerFalSpeechModelNode(editor: Editor) {
  editor.registerNodeType(FalSpeechModelNode, {
    category: "AI Generation",
  });
}

export const FalTranscriptionModelNode = defineNode({
  type: "FalTranscriptionModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, transcriptionModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        fal.transcriptionModel,
        "Fal does not support transcription"
      )(modelId),
    };
  },
});
export function registerFalTranscriptionModelNode(editor: Editor) {
  editor.registerNodeType(FalTranscriptionModelNode, {
    category: "AI Generation",
  });
}

/** Use `registerAiGenerationNodes` instead if you want to register all providers. */
export function registerAiFalProviderNodes(editor: Editor) {
  registerFalLanguageModelNode(editor);
  registerFalTextEmbeddingModelNode(editor);
  registerFalImageModelNode(editor);
  registerFalSpeechModelNode(editor);
  registerFalTranscriptionModelNode(editor);
}

export const FireworksLanguageModelNode = defineNode({
  type: "FireworksLanguageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, languageModelType),
  },
  calculate({ modelId }) {
    return { model: fireworks.languageModel(modelId) };
  },
});
export function registerFireworksLanguageModelNode(editor: Editor) {
  editor.registerNodeType(FireworksLanguageModelNode, {
    category: "AI Generation",
  });
}

export const FireworksTextEmbeddingModelNode = defineNode({
  type: "FireworksTextEmbeddingModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, textEmbeddingModelType),
  },
  calculate({ modelId }) {
    return { model: fireworks.textEmbeddingModel(modelId) };
  },
});
export function registerFireworksTextEmbeddingModelNode(editor: Editor) {
  editor.registerNodeType(FireworksTextEmbeddingModelNode, {
    category: "AI Generation",
  });
}

export const FireworksImageModelNode = defineNode({
  type: "FireworksImageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, imageModelType),
  },
  calculate({ modelId }) {
    return { model: fireworks.imageModel(modelId) };
  },
});
export function registerFireworksImageModelNode(editor: Editor) {
  editor.registerNodeType(FireworksImageModelNode, {
    category: "AI Generation",
  });
}

export const FireworksSpeechModelNode = defineNode({
  type: "FireworksSpeechModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, speechModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        fireworks.speechModel,
        "Fireworks does not support speech synthesis"
      )(modelId),
    };
  },
});
export function registerFireworksSpeechModelNode(editor: Editor) {
  editor.registerNodeType(FireworksSpeechModelNode, {
    category: "AI Generation",
  });
}

export const FireworksTranscriptionModelNode = defineNode({
  type: "FireworksTranscriptionModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, transcriptionModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        fireworks.transcriptionModel,
        "Fireworks does not support transcription"
      )(modelId),
    };
  },
});
export function registerFireworksTranscriptionModelNode(editor: Editor) {
  editor.registerNodeType(FireworksTranscriptionModelNode, {
    category: "AI Generation",
  });
}

/** Use `registerAiGenerationNodes` instead if you want to register all providers. */
export function registerAiFireworksProviderNodes(editor: Editor) {
  registerFireworksLanguageModelNode(editor);
  registerFireworksTextEmbeddingModelNode(editor);
  registerFireworksImageModelNode(editor);
  registerFireworksSpeechModelNode(editor);
  registerFireworksTranscriptionModelNode(editor);
}

export const GatewayLanguageModelNode = defineNode({
  type: "GatewayLanguageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, languageModelType),
  },
  calculate({ modelId }) {
    return { model: gateway.languageModel(modelId) };
  },
});
export function registerGatewayLanguageModelNode(editor: Editor) {
  editor.registerNodeType(GatewayLanguageModelNode, {
    category: "AI Generation",
  });
}

export const GatewayTextEmbeddingModelNode = defineNode({
  type: "GatewayTextEmbeddingModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, textEmbeddingModelType),
  },
  calculate({ modelId }) {
    return { model: gateway.textEmbeddingModel(modelId) };
  },
});
export function registerGatewayTextEmbeddingModelNode(editor: Editor) {
  editor.registerNodeType(GatewayTextEmbeddingModelNode, {
    category: "AI Generation",
  });
}

export const GatewayImageModelNode = defineNode({
  type: "GatewayImageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, imageModelType),
  },
  calculate({ modelId }) {
    return { model: gateway.imageModel(modelId) };
  },
});
export function registerGatewayImageModelNode(editor: Editor) {
  editor.registerNodeType(GatewayImageModelNode, {
    category: "AI Generation",
  });
}

export const GatewaySpeechModelNode = defineNode({
  type: "GatewaySpeechModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, speechModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        gateway.speechModel,
        "Gateway does not support speech synthesis"
      )(modelId),
    };
  },
});
export function registerGatewaySpeechModelNode(editor: Editor) {
  editor.registerNodeType(GatewaySpeechModelNode, {
    category: "AI Generation",
  });
}

export const GatewayTranscriptionModelNode = defineNode({
  type: "GatewayTranscriptionModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, transcriptionModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        gateway.transcriptionModel,
        "Gateway does not support transcription"
      )(modelId),
    };
  },
});
export function registerGatewayTranscriptionModelNode(editor: Editor) {
  editor.registerNodeType(GatewayTranscriptionModelNode, {
    category: "AI Generation",
  });
}

/** Use `registerAiGenerationNodes` instead if you want to register all providers. */
export function registerAiGatewayProviderNodes(editor: Editor) {
  registerGatewayLanguageModelNode(editor);
  registerGatewayTextEmbeddingModelNode(editor);
  registerGatewayImageModelNode(editor);
  registerGatewaySpeechModelNode(editor);
  registerGatewayTranscriptionModelNode(editor);
}

export const GladiaLanguageModelNode = defineNode({
  type: "GladiaLanguageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, languageModelType),
  },
  calculate({ modelId }) {
    return { model: gladia.languageModel(modelId) };
  },
});
export function registerGladiaLanguageModelNode(editor: Editor) {
  editor.registerNodeType(GladiaLanguageModelNode, {
    category: "AI Generation",
  });
}

export const GladiaTextEmbeddingModelNode = defineNode({
  type: "GladiaTextEmbeddingModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, textEmbeddingModelType),
  },
  calculate({ modelId }) {
    return { model: gladia.textEmbeddingModel(modelId) };
  },
});
export function registerGladiaTextEmbeddingModelNode(editor: Editor) {
  editor.registerNodeType(GladiaTextEmbeddingModelNode, {
    category: "AI Generation",
  });
}

export const GladiaImageModelNode = defineNode({
  type: "GladiaImageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, imageModelType),
  },
  calculate({ modelId }) {
    return { model: gladia.imageModel(modelId) };
  },
});
export function registerGladiaImageModelNode(editor: Editor) {
  editor.registerNodeType(GladiaImageModelNode, {
    category: "AI Generation",
  });
}

export const GladiaSpeechModelNode = defineNode({
  type: "GladiaSpeechModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, speechModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        gladia.speechModel,
        "Gladia does not support speech synthesis"
      )(modelId),
    };
  },
});
export function registerGladiaSpeechModelNode(editor: Editor) {
  editor.registerNodeType(GladiaSpeechModelNode, {
    category: "AI Generation",
  });
}

export const GladiaTranscriptionModelNode = defineNode({
  type: "GladiaTranscriptionModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, transcriptionModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        gladia.transcriptionModel,
        "Gladia does not support transcription"
      )(modelId),
    };
  },
});
export function registerGladiaTranscriptionModelNode(editor: Editor) {
  editor.registerNodeType(GladiaTranscriptionModelNode, {
    category: "AI Generation",
  });
}

/** Use `registerAiGenerationNodes` instead if you want to register all providers. */
export function registerAiGladiaProviderNodes(editor: Editor) {
  registerGladiaLanguageModelNode(editor);
  registerGladiaTextEmbeddingModelNode(editor);
  registerGladiaImageModelNode(editor);
  registerGladiaSpeechModelNode(editor);
  registerGladiaTranscriptionModelNode(editor);
}

export const GoogleLanguageModelNode = defineNode({
  type: "GoogleLanguageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, languageModelType),
  },
  calculate({ modelId }) {
    return { model: google.languageModel(modelId) };
  },
});
export function registerGoogleLanguageModelNode(editor: Editor) {
  editor.registerNodeType(GoogleLanguageModelNode, {
    category: "AI Generation",
  });
}

export const GoogleTextEmbeddingModelNode = defineNode({
  type: "GoogleTextEmbeddingModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, textEmbeddingModelType),
  },
  calculate({ modelId }) {
    return { model: google.textEmbeddingModel(modelId) };
  },
});
export function registerGoogleTextEmbeddingModelNode(editor: Editor) {
  editor.registerNodeType(GoogleTextEmbeddingModelNode, {
    category: "AI Generation",
  });
}

export const GoogleImageModelNode = defineNode({
  type: "GoogleImageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, imageModelType),
  },
  calculate({ modelId }) {
    return { model: google.imageModel(modelId) };
  },
});
export function registerGoogleImageModelNode(editor: Editor) {
  editor.registerNodeType(GoogleImageModelNode, {
    category: "AI Generation",
  });
}

export const GoogleSpeechModelNode = defineNode({
  type: "GoogleSpeechModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, speechModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        google.speechModel,
        "Google does not support speech synthesis"
      )(modelId),
    };
  },
});
export function registerGoogleSpeechModelNode(editor: Editor) {
  editor.registerNodeType(GoogleSpeechModelNode, {
    category: "AI Generation",
  });
}

export const GoogleTranscriptionModelNode = defineNode({
  type: "GoogleTranscriptionModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, transcriptionModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        google.transcriptionModel,
        "Google does not support transcription"
      )(modelId),
    };
  },
});
export function registerGoogleTranscriptionModelNode(editor: Editor) {
  editor.registerNodeType(GoogleTranscriptionModelNode, {
    category: "AI Generation",
  });
}

/** Use `registerAiGenerationNodes` instead if you want to register all providers. */
export function registerAiGoogleProviderNodes(editor: Editor) {
  registerGoogleLanguageModelNode(editor);
  registerGoogleTextEmbeddingModelNode(editor);
  registerGoogleImageModelNode(editor);
  registerGoogleSpeechModelNode(editor);
  registerGoogleTranscriptionModelNode(editor);
}

export const VertexLanguageModelNode = defineNode({
  type: "VertexLanguageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, languageModelType),
  },
  calculate({ modelId }) {
    return { model: vertex.languageModel(modelId) };
  },
});
export function registerVertexLanguageModelNode(editor: Editor) {
  editor.registerNodeType(VertexLanguageModelNode, {
    category: "AI Generation",
  });
}

export const VertexTextEmbeddingModelNode = defineNode({
  type: "VertexTextEmbeddingModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, textEmbeddingModelType),
  },
  calculate({ modelId }) {
    return { model: vertex.textEmbeddingModel(modelId) };
  },
});
export function registerVertexTextEmbeddingModelNode(editor: Editor) {
  editor.registerNodeType(VertexTextEmbeddingModelNode, {
    category: "AI Generation",
  });
}

export const VertexImageModelNode = defineNode({
  type: "VertexImageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, imageModelType),
  },
  calculate({ modelId }) {
    return { model: vertex.imageModel(modelId) };
  },
});
export function registerVertexImageModelNode(editor: Editor) {
  editor.registerNodeType(VertexImageModelNode, {
    category: "AI Generation",
  });
}

export const VertexSpeechModelNode = defineNode({
  type: "VertexSpeechModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, speechModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        vertex.speechModel,
        "Vertex does not support speech synthesis"
      )(modelId),
    };
  },
});
export function registerVertexSpeechModelNode(editor: Editor) {
  editor.registerNodeType(VertexSpeechModelNode, {
    category: "AI Generation",
  });
}

export const VertexTranscriptionModelNode = defineNode({
  type: "VertexTranscriptionModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, transcriptionModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        vertex.transcriptionModel,
        "Vertex does not support transcription"
      )(modelId),
    };
  },
});
export function registerVertexTranscriptionModelNode(editor: Editor) {
  editor.registerNodeType(VertexTranscriptionModelNode, {
    category: "AI Generation",
  });
}

/** Use `registerAiGenerationNodes` instead if you want to register all providers. */
export function registerAiVertexProviderNodes(editor: Editor) {
  registerVertexLanguageModelNode(editor);
  registerVertexTextEmbeddingModelNode(editor);
  registerVertexImageModelNode(editor);
  registerVertexSpeechModelNode(editor);
  registerVertexTranscriptionModelNode(editor);
}

export const GroqLanguageModelNode = defineNode({
  type: "GroqLanguageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, languageModelType),
  },
  calculate({ modelId }) {
    return { model: groq.languageModel(modelId) };
  },
});
export function registerGroqLanguageModelNode(editor: Editor) {
  editor.registerNodeType(GroqLanguageModelNode, {
    category: "AI Generation",
  });
}

export const GroqTextEmbeddingModelNode = defineNode({
  type: "GroqTextEmbeddingModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, textEmbeddingModelType),
  },
  calculate({ modelId }) {
    return { model: groq.textEmbeddingModel(modelId) };
  },
});
export function registerGroqTextEmbeddingModelNode(editor: Editor) {
  editor.registerNodeType(GroqTextEmbeddingModelNode, {
    category: "AI Generation",
  });
}

export const GroqImageModelNode = defineNode({
  type: "GroqImageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, imageModelType),
  },
  calculate({ modelId }) {
    return { model: groq.imageModel(modelId) };
  },
});
export function registerGroqImageModelNode(editor: Editor) {
  editor.registerNodeType(GroqImageModelNode, {
    category: "AI Generation",
  });
}

export const GroqSpeechModelNode = defineNode({
  type: "GroqSpeechModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, speechModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        groq.speechModel,
        "Groq does not support speech synthesis"
      )(modelId),
    };
  },
});
export function registerGroqSpeechModelNode(editor: Editor) {
  editor.registerNodeType(GroqSpeechModelNode, {
    category: "AI Generation",
  });
}

export const GroqTranscriptionModelNode = defineNode({
  type: "GroqTranscriptionModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, transcriptionModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        groq.transcriptionModel,
        "Groq does not support transcription"
      )(modelId),
    };
  },
});
export function registerGroqTranscriptionModelNode(editor: Editor) {
  editor.registerNodeType(GroqTranscriptionModelNode, {
    category: "AI Generation",
  });
}

/** Use `registerAiGenerationNodes` instead if you want to register all providers. */
export function registerAiGroqProviderNodes(editor: Editor) {
  registerGroqLanguageModelNode(editor);
  registerGroqTextEmbeddingModelNode(editor);
  registerGroqImageModelNode(editor);
  registerGroqSpeechModelNode(editor);
  registerGroqTranscriptionModelNode(editor);
}

export const HumeSpeechModelNode = defineNode({
  type: "HumeSpeechModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, speechModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        hume.speechModel,
        "Hume does not support speech synthesis"
      )(modelId),
    };
  },
});
export function registerHumeSpeechModelNode(editor: Editor) {
  editor.registerNodeType(HumeSpeechModelNode, {
    category: "AI Generation",
  });
}

/** Use `registerAiGenerationNodes` instead if you want to register all providers. */
export function registerAiHumeProviderNodes(editor: Editor) {
  registerHumeSpeechModelNode(editor);
}

export const LmntSpeechModelNode = defineNode({
  type: "LmntSpeechModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, speechModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        lmnt.speechModel,
        "LMNT does not support speech synthesis"
      )(modelId),
    };
  },
});
export function registerLmntSpeechModelNode(editor: Editor) {
  editor.registerNodeType(LmntSpeechModelNode, {
    category: "AI Generation",
  });
}

export function registerAiLmntProviderNodes(editor: Editor) {
  registerLmntSpeechModelNode(editor);
}

export const LumaLanguageModelNode = defineNode({
  type: "LumaLanguageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, languageModelType),
  },
  calculate({ modelId }) {
    return { model: luma.languageModel(modelId) };
  },
});
export function registerLumaLanguageModelNode(editor: Editor) {
  editor.registerNodeType(LumaLanguageModelNode, {
    category: "AI Generation",
  });
}

export const LumaTextEmbeddingModelNode = defineNode({
  type: "LumaTextEmbeddingModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, textEmbeddingModelType),
  },
  calculate({ modelId }) {
    return { model: luma.textEmbeddingModel(modelId) };
  },
});
export function registerLumaTextEmbeddingModelNode(editor: Editor) {
  editor.registerNodeType(LumaTextEmbeddingModelNode, {
    category: "AI Generation",
  });
}

export const LumaImageModelNode = defineNode({
  type: "LumaImageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, imageModelType),
  },
  calculate({ modelId }) {
    return { model: luma.imageModel(modelId) };
  },
});
export function registerLumaImageModelNode(editor: Editor) {
  editor.registerNodeType(LumaImageModelNode, {
    category: "AI Generation",
  });
}

export const LumaSpeechModelNode = defineNode({
  type: "LumaSpeechModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, speechModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        luma.speechModel,
        "Luma does not support speech synthesis"
      )(modelId),
    };
  },
});
export function registerLumaSpeechModelNode(editor: Editor) {
  editor.registerNodeType(LumaSpeechModelNode, {
    category: "AI Generation",
  });
}

export const LumaTranscriptionModelNode = defineNode({
  type: "LumaTranscriptionModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, transcriptionModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        luma.transcriptionModel,
        "Luma does not support transcription"
      )(modelId),
    };
  },
});
export function registerLumaTranscriptionModelNode(editor: Editor) {
  editor.registerNodeType(LumaTranscriptionModelNode, {
    category: "AI Generation",
  });
}

/** Use `registerAiGenerationNodes` instead if you want to register all providers. */
export function registerAiLumaProviderNodes(editor: Editor) {
  registerLumaLanguageModelNode(editor);
  registerLumaTextEmbeddingModelNode(editor);
  registerLumaImageModelNode(editor);
  registerLumaSpeechModelNode(editor);
  registerLumaTranscriptionModelNode(editor);
}

export const MistralLanguageModelNode = defineNode({
  type: "MistralLanguageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, languageModelType),
  },
  calculate({ modelId }) {
    return { model: mistral.languageModel(modelId) };
  },
});
export function registerMistralLanguageModelNode(editor: Editor) {
  editor.registerNodeType(MistralLanguageModelNode, {
    category: "AI Generation",
  });
}

export const MistralTextEmbeddingModelNode = defineNode({
  type: "MistralTextEmbeddingModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, textEmbeddingModelType),
  },
  calculate({ modelId }) {
    return { model: mistral.textEmbeddingModel(modelId) };
  },
});
export function registerMistralTextEmbeddingModelNode(editor: Editor) {
  editor.registerNodeType(MistralTextEmbeddingModelNode, {
    category: "AI Generation",
  });
}

export const MistralImageModelNode = defineNode({
  type: "MistralImageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, imageModelType),
  },
  calculate({ modelId }) {
    return { model: mistral.imageModel(modelId) };
  },
});
export function registerMistralImageModelNode(editor: Editor) {
  editor.registerNodeType(MistralImageModelNode, {
    category: "AI Generation",
  });
}

export const MistralSpeechModelNode = defineNode({
  type: "MistralSpeechModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, speechModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        mistral.speechModel,
        "Mistral does not support speech synthesis"
      )(modelId),
    };
  },
});
export function registerMistralSpeechModelNode(editor: Editor) {
  editor.registerNodeType(MistralSpeechModelNode, {
    category: "AI Generation",
  });
}

export const MistralTranscriptionModelNode = defineNode({
  type: "MistralTranscriptionModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, transcriptionModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        mistral.transcriptionModel,
        "Mistral does not support transcription"
      )(modelId),
    };
  },
});
export function registerMistralTranscriptionModelNode(editor: Editor) {
  editor.registerNodeType(MistralTranscriptionModelNode, {
    category: "AI Generation",
  });
}

/** Use `registerAiGenerationNodes` instead if you want to register all providers. */
export function registerAiMistralProviderNodes(editor: Editor) {
  registerMistralLanguageModelNode(editor);
  registerMistralTextEmbeddingModelNode(editor);
  registerMistralImageModelNode(editor);
  registerMistralSpeechModelNode(editor);
  registerMistralTranscriptionModelNode(editor);
}

export const OpenaiLanguageModelNode = defineNode({
  type: "OpenaiLanguageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, languageModelType),
  },
  calculate({ modelId }) {
    return { model: openai.languageModel(modelId) };
  },
});
export function registerOpenaiLanguageModelNode(editor: Editor) {
  editor.registerNodeType(OpenaiLanguageModelNode, {
    category: "AI Generation",
  });
}

export const OpenaiTextEmbeddingModelNode = defineNode({
  type: "OpenaiTextEmbeddingModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, textEmbeddingModelType),
  },
  calculate({ modelId }) {
    return { model: openai.textEmbeddingModel(modelId) };
  },
});
export function registerOpenaiTextEmbeddingModelNode(editor: Editor) {
  editor.registerNodeType(OpenaiTextEmbeddingModelNode, {
    category: "AI Generation",
  });
}

export const OpenaiImageModelNode = defineNode({
  type: "OpenaiImageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, imageModelType),
  },
  calculate({ modelId }) {
    return { model: openai.imageModel(modelId) };
  },
});
export function registerOpenaiImageModelNode(editor: Editor) {
  editor.registerNodeType(OpenaiImageModelNode, {
    category: "AI Generation",
  });
}

export const OpenaiSpeechModelNode = defineNode({
  type: "OpenaiSpeechModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, speechModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        openai.speechModel,
        "OpenAI does not support speech synthesis"
      )(modelId),
    };
  },
});
export function registerOpenaiSpeechModelNode(editor: Editor) {
  editor.registerNodeType(OpenaiSpeechModelNode, {
    category: "AI Generation",
  });
}

export const OpenaiTranscriptionModelNode = defineNode({
  type: "OpenaiTranscriptionModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, transcriptionModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        openai.transcriptionModel,
        "OpenAI does not support transcription"
      )(modelId),
    };
  },
});
export function registerOpenaiTranscriptionModelNode(editor: Editor) {
  editor.registerNodeType(OpenaiTranscriptionModelNode, {
    category: "AI Generation",
  });
}

/** Use `registerAiGenerationNodes` instead if you want to register all providers. */
export function registerAiOpenaiProviderNodes(editor: Editor) {
  registerOpenaiLanguageModelNode(editor);
  registerOpenaiTextEmbeddingModelNode(editor);
  registerOpenaiImageModelNode(editor);
  registerOpenaiSpeechModelNode(editor);
  registerOpenaiTranscriptionModelNode(editor);
}

export const PerplexityLanguageModelNode = defineNode({
  type: "PerplexityLanguageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, languageModelType),
  },
  calculate({ modelId }) {
    return { model: perplexity.languageModel(modelId) };
  },
});
export function registerPerplexityLanguageModelNode(editor: Editor) {
  editor.registerNodeType(PerplexityLanguageModelNode, {
    category: "AI Generation",
  });
}

export const PerplexityTextEmbeddingModelNode = defineNode({
  type: "PerplexityTextEmbeddingModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, textEmbeddingModelType),
  },
  calculate({ modelId }) {
    return { model: perplexity.textEmbeddingModel(modelId) };
  },
});
export function registerPerplexityTextEmbeddingModelNode(editor: Editor) {
  editor.registerNodeType(PerplexityTextEmbeddingModelNode, {
    category: "AI Generation",
  });
}

export const PerplexityImageModelNode = defineNode({
  type: "PerplexityImageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, imageModelType),
  },
  calculate({ modelId }) {
    return { model: perplexity.imageModel(modelId) };
  },
});
export function registerPerplexityImageModelNode(editor: Editor) {
  editor.registerNodeType(PerplexityImageModelNode, {
    category: "AI Generation",
  });
}

export const PerplexitySpeechModelNode = defineNode({
  type: "PerplexitySpeechModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, speechModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        perplexity.speechModel,
        "Perplexity does not support speech synthesis"
      )(modelId),
    };
  },
});
export function registerPerplexitySpeechModelNode(editor: Editor) {
  editor.registerNodeType(PerplexitySpeechModelNode, {
    category: "AI Generation",
  });
}

export const PerplexityTranscriptionModelNode = defineNode({
  type: "PerplexityTranscriptionModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, transcriptionModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        perplexity.transcriptionModel,
        "Perplexity does not support transcription"
      )(modelId),
    };
  },
});
export function registerPerplexityTranscriptionModelNode(editor: Editor) {
  editor.registerNodeType(PerplexityTranscriptionModelNode, {
    category: "AI Generation",
  });
}

/** Use `registerAiGenerationNodes` instead if you want to register all providers. */
export function registerAiPerplexityProviderNodes(editor: Editor) {
  registerPerplexityLanguageModelNode(editor);
  registerPerplexityTextEmbeddingModelNode(editor);
  registerPerplexityImageModelNode(editor);
  registerPerplexitySpeechModelNode(editor);
  registerPerplexityTranscriptionModelNode(editor);
}

export const ReplicateLanguageModelNode = defineNode({
  type: "ReplicateLanguageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, languageModelType),
  },
  calculate({ modelId }) {
    return { model: replicate.languageModel(modelId) };
  },
});
export function registerReplicateLanguageModelNode(editor: Editor) {
  editor.registerNodeType(ReplicateLanguageModelNode, {
    category: "AI Generation",
  });
}

export const ReplicateTextEmbeddingModelNode = defineNode({
  type: "ReplicateTextEmbeddingModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, textEmbeddingModelType),
  },
  calculate({ modelId }) {
    return { model: replicate.textEmbeddingModel(modelId) };
  },
});
export function registerReplicateTextEmbeddingModelNode(editor: Editor) {
  editor.registerNodeType(ReplicateTextEmbeddingModelNode, {
    category: "AI Generation",
  });
}

export const ReplicateImageModelNode = defineNode({
  type: "ReplicateImageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, imageModelType),
  },
  calculate({ modelId }) {
    return { model: replicate.imageModel(modelId) };
  },
});
export function registerReplicateImageModelNode(editor: Editor) {
  editor.registerNodeType(ReplicateImageModelNode, {
    category: "AI Generation",
  });
}

export const ReplicateSpeechModelNode = defineNode({
  type: "ReplicateSpeechModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, speechModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        replicate.speechModel,
        "Replicate does not support speech synthesis"
      )(modelId),
    };
  },
});
export function registerReplicateSpeechModelNode(editor: Editor) {
  editor.registerNodeType(ReplicateSpeechModelNode, {
    category: "AI Generation",
  });
}

export const ReplicateTranscriptionModelNode = defineNode({
  type: "ReplicateTranscriptionModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, transcriptionModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        replicate.transcriptionModel,
        "Replicate does not support transcription"
      )(modelId),
    };
  },
});
export function registerReplicateTranscriptionModelNode(editor: Editor) {
  editor.registerNodeType(ReplicateTranscriptionModelNode, {
    category: "AI Generation",
  });
}

/** Use `registerAiGenerationNodes` instead if you want to register all providers. */
export function registerAiReplicateProviderNodes(editor: Editor) {
  registerReplicateLanguageModelNode(editor);
  registerReplicateTextEmbeddingModelNode(editor);
  registerReplicateImageModelNode(editor);
  registerReplicateSpeechModelNode(editor);
  registerReplicateTranscriptionModelNode(editor);
}

export const RevaiLanguageModelNode = defineNode({
  type: "RevaiLanguageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, languageModelType),
  },
  calculate({ modelId }) {
    return { model: revai.languageModel(modelId) };
  },
});
export function registerRevaiLanguageModelNode(editor: Editor) {
  editor.registerNodeType(RevaiLanguageModelNode, {
    category: "AI Generation",
  });
}

export const RevaiTextEmbeddingModelNode = defineNode({
  type: "RevaiTextEmbeddingModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, textEmbeddingModelType),
  },
  calculate({ modelId }) {
    return { model: revai.textEmbeddingModel(modelId) };
  },
});
export function registerRevaiTextEmbeddingModelNode(editor: Editor) {
  editor.registerNodeType(RevaiTextEmbeddingModelNode, {
    category: "AI Generation",
  });
}

export const RevaiImageModelNode = defineNode({
  type: "RevaiImageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, imageModelType),
  },
  calculate({ modelId }) {
    return { model: revai.imageModel(modelId) };
  },
});
export function registerRevaiImageModelNode(editor: Editor) {
  editor.registerNodeType(RevaiImageModelNode, {
    category: "AI Generation",
  });
}

export const RevaiSpeechModelNode = defineNode({
  type: "RevaiSpeechModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, speechModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        revai.speechModel,
        "Revai does not support speech synthesis"
      )(modelId),
    };
  },
});
export function registerRevaiSpeechModelNode(editor: Editor) {
  editor.registerNodeType(RevaiSpeechModelNode, {
    category: "AI Generation",
  });
}

export const RevaiTranscriptionModelNode = defineNode({
  type: "RevaiTranscriptionModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, transcriptionModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        revai.transcriptionModel,
        "Revai does not support transcription"
      )(modelId),
    };
  },
});
export function registerRevaiTranscriptionModelNode(editor: Editor) {
  editor.registerNodeType(RevaiTranscriptionModelNode, {
    category: "AI Generation",
  });
}

/** Use `registerAiGenerationNodes` instead if you want to register all providers. */
export function registerAiRevaiProviderNodes(editor: Editor) {
  registerRevaiLanguageModelNode(editor);
  registerRevaiTextEmbeddingModelNode(editor);
  registerRevaiImageModelNode(editor);
  registerRevaiSpeechModelNode(editor);
  registerRevaiTranscriptionModelNode(editor);
}

export const TogetheraiLanguageModelNode = defineNode({
  type: "TogetheraiLanguageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, languageModelType),
  },
  calculate({ modelId }) {
    return { model: togetherai.languageModel(modelId) };
  },
});
export function registerTogetheraiLanguageModelNode(editor: Editor) {
  editor.registerNodeType(TogetheraiLanguageModelNode, {
    category: "AI Generation",
  });
}

export const TogetheraiTextEmbeddingModelNode = defineNode({
  type: "TogetheraiTextEmbeddingModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, textEmbeddingModelType),
  },
  calculate({ modelId }) {
    return { model: togetherai.textEmbeddingModel(modelId) };
  },
});
export function registerTogetheraiTextEmbeddingModelNode(editor: Editor) {
  editor.registerNodeType(TogetheraiTextEmbeddingModelNode, {
    category: "AI Generation",
  });
}

export const TogetheraiImageModelNode = defineNode({
  type: "TogetheraiImageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, imageModelType),
  },
  calculate({ modelId }) {
    return { model: togetherai.imageModel(modelId) };
  },
});
export function registerTogetheraiImageModelNode(editor: Editor) {
  editor.registerNodeType(TogetheraiImageModelNode, {
    category: "AI Generation",
  });
}

export const TogetheraiSpeechModelNode = defineNode({
  type: "TogetheraiSpeechModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, speechModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        togetherai.speechModel,
        "TogetherAI does not support speech synthesis"
      )(modelId),
    };
  },
});
export function registerTogetheraiSpeechModelNode(editor: Editor) {
  editor.registerNodeType(TogetheraiSpeechModelNode, {
    category: "AI Generation",
  });
}

export const TogetheraiTranscriptionModelNode = defineNode({
  type: "TogetheraiTranscriptionModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, transcriptionModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        togetherai.transcriptionModel,
        "TogetherAI does not support transcription"
      )(modelId),
    };
  },
});
export function registerTogetheraiTranscriptionModelNode(editor: Editor) {
  editor.registerNodeType(TogetheraiTranscriptionModelNode, {
    category: "AI Generation",
  });
}

/** Use `registerAiGenerationNodes` instead if you want to register all providers. */
export function registerAiTogetheraiProviderNodes(editor: Editor) {
  registerTogetheraiLanguageModelNode(editor);
  registerTogetheraiTextEmbeddingModelNode(editor);
  registerTogetheraiImageModelNode(editor);
  registerTogetheraiSpeechModelNode(editor);
  registerTogetheraiTranscriptionModelNode(editor);
}

export const VercelLanguageModelNode = defineNode({
  type: "VercelLanguageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, languageModelType),
  },
  calculate({ modelId }) {
    return { model: vercel.languageModel(modelId) };
  },
});
export function registerVercelLanguageModelNode(editor: Editor) {
  editor.registerNodeType(VercelLanguageModelNode, {
    category: "AI Generation",
  });
}

export const VercelTextEmbeddingModelNode = defineNode({
  type: "VercelTextEmbeddingModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, textEmbeddingModelType),
  },
  calculate({ modelId }) {
    return { model: vercel.textEmbeddingModel(modelId) };
  },
});
export function registerVercelTextEmbeddingModelNode(editor: Editor) {
  editor.registerNodeType(VercelTextEmbeddingModelNode, {
    category: "AI Generation",
  });
}

export const VercelImageModelNode = defineNode({
  type: "VercelImageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, imageModelType),
  },
  calculate({ modelId }) {
    return { model: vercel.imageModel(modelId) };
  },
});
export function registerVercelImageModelNode(editor: Editor) {
  editor.registerNodeType(VercelImageModelNode, {
    category: "AI Generation",
  });
}

export const VercelSpeechModelNode = defineNode({
  type: "VercelSpeechModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, speechModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        vercel.speechModel,
        "Vercel does not support speech synthesis"
      )(modelId),
    };
  },
});
export function registerVercelSpeechModelNode(editor: Editor) {
  editor.registerNodeType(VercelSpeechModelNode, {
    category: "AI Generation",
  });
}

export const VercelTranscriptionModelNode = defineNode({
  type: "VercelTranscriptionModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, transcriptionModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        vercel.transcriptionModel,
        "Vercel does not support transcription"
      )(modelId),
    };
  },
});
export function registerVercelTranscriptionModelNode(editor: Editor) {
  editor.registerNodeType(VercelTranscriptionModelNode, {
    category: "AI Generation",
  });
}

/** Use `registerAiGenerationNodes` instead if you want to register all providers. */
export function registerAiVercelProviderNodes(editor: Editor) {
  registerVercelLanguageModelNode(editor);
  registerVercelTextEmbeddingModelNode(editor);
  registerVercelImageModelNode(editor);
  registerVercelSpeechModelNode(editor);
  registerVercelTranscriptionModelNode(editor);
}

export const XaiLanguageModelNode = defineNode({
  type: "XaiLanguageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, languageModelType),
  },
  calculate({ modelId }) {
    return { model: xai.languageModel(modelId) };
  },
});
export function registerXaiLanguageModelNode(editor: Editor) {
  editor.registerNodeType(XaiLanguageModelNode, {
    category: "AI Generation",
  });
}

export const XaiTextEmbeddingModelNode = defineNode({
  type: "XaiTextEmbeddingModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, textEmbeddingModelType),
  },
  calculate({ modelId }) {
    return { model: xai.textEmbeddingModel(modelId) };
  },
});
export function registerXaiTextEmbeddingModelNode(editor: Editor) {
  editor.registerNodeType(XaiTextEmbeddingModelNode, {
    category: "AI Generation",
  });
}

export const XaiImageModelNode = defineNode({
  type: "XaiImageModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, imageModelType),
  },
  calculate({ modelId }) {
    return { model: xai.imageModel(modelId) };
  },
});
export function registerXaiImageModelNode(editor: Editor) {
  editor.registerNodeType(XaiImageModelNode, {
    category: "AI Generation",
  });
}

export const XaiSpeechModelNode = defineNode({
  type: "XaiSpeechModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, speechModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        xai.speechModel,
        "XAI does not support speech synthesis"
      )(modelId),
    };
  },
});
export function registerXaiSpeechModelNode(editor: Editor) {
  editor.registerNodeType(XaiSpeechModelNode, {
    category: "AI Generation",
  });
}

export const XaiTranscriptionModelNode = defineNode({
  type: "XaiTranscriptionModelNode",
  inputs: {
    modelId: () => textInterface("Model Id"),
  },
  outputs: {
    model: () => nodeInterface("Model", undefined!, transcriptionModelType),
  },
  calculate({ modelId }) {
    return {
      model: assertStrict(
        xai.transcriptionModel,
        "XAI does not support transcription"
      )(modelId),
    };
  },
});
export function registerXaiTranscriptionModelNode(editor: Editor) {
  editor.registerNodeType(XaiTranscriptionModelNode, {
    category: "AI Generation",
  });
}

/** Use `registerAiGenerationNodes` instead if you want to register all providers. */
export function registerAiXaiProviderNodes(editor: Editor) {
  registerXaiLanguageModelNode(editor);
  registerXaiTextEmbeddingModelNode(editor);
  registerXaiImageModelNode(editor);
  registerXaiSpeechModelNode(editor);
  registerXaiTranscriptionModelNode(editor);
}

export function registerAiGenerationNodes(editor: Editor) {
  registerDeconstructLanguageModelUsageNode(editor);
  registerDeconstructEmbeddingModelUsageNode(editor);
  registerDeconstructTextEmbeddingResponseNode(editor);
  registerDeconstructGeneratedFileNode(editor);
  registerDeconstructGeneratedAudioFileNode(editor);
  registerDeconstructSpeechModelResponseNode(editor);

  registerGenerateTextNode(editor);
  registerTextEmbeddingNode(editor);
  registerGenerateImageNode(editor);
  registerGenerateSpeechNode(editor);
  registerTranscribeNode(editor);

  registerAiBedrockProviderNodes(editor);
  registerAiAnthropicProviderNodes(editor);
  registerAiAssemblyaiProviderNodes(editor);
  registerAiAzureProviderNodes(editor);
  registerAiCerebrasProviderNodes(editor);
  registerAiCohereProviderNodes(editor);
  registerAiDeepgramProviderNodes(editor);
  registerAiDeepseekProviderNodes(editor);
  registerAiElevenlabsProviderNodes(editor);
  registerAiFalProviderNodes(editor);
  registerAiFireworksProviderNodes(editor);
  registerAiGatewayProviderNodes(editor);
  registerAiGladiaProviderNodes(editor);
  registerAiGoogleProviderNodes(editor);
  registerAiVertexProviderNodes(editor);
  registerAiGroqProviderNodes(editor);
  registerAiHumeProviderNodes(editor);
  registerAiLmntProviderNodes(editor);
  registerAiLumaProviderNodes(editor);
  registerAiMistralProviderNodes(editor);
  registerAiOpenaiProviderNodes(editor);
  registerAiPerplexityProviderNodes(editor);
  registerAiReplicateProviderNodes(editor);
  registerAiRevaiProviderNodes(editor);
  registerAiTogetheraiProviderNodes(editor);
  registerAiVercelProviderNodes(editor);
  registerAiXaiProviderNodes(editor);
}

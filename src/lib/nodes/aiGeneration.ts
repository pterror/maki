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
  experimental_generateImage as generateImage,
  experimental_transcribe as transcribe,
  experimental_generateSpeech as generateSpeech,
} from "ai";
import { assertStrict } from "../core";
import {
  GenerateTextParameters,
  GenerateTextResult,
  GenerateImageParameters,
  GenerateImageResult,
  GenerateSpeechParameters,
  GenerateSpeechResult,
  TranscribeParameters,
  TranscribeResult,
  LanguageModel,
  ImageModel,
  TextEmbeddingModel,
  TranscriptionModel,
  SpeechModel,
} from "./aiGenerationTypes";
import { registerMcpServerTool } from "./mcp";
import { z } from "zod/v4";

registerMcpServerTool(
  "generate-text",
  {
    title: "Generate Text",
    description: "Generates text based on the provided input.",
    inputSchema: GenerateTextParameters,
    outputSchema: GenerateTextResult,
    annotations: {
      baklavaCategory: "AI Generation",
    },
  },
  generateText,
);

registerMcpServerTool(
  "text-embedding",
  {
    title: "Text Embedding",
    description: "Embeds text into a vector representation.",
    inputSchema: GenerateTextParameters,
    outputSchema: GenerateTextResult,
    annotations: {
      baklavaCategory: "AI Generation",
    },
  },
  generateText,
);

registerMcpServerTool(
  "generate-image",
  {
    title: "Generate Image",
    description: "Generates an image based on the provided prompt.",
    inputSchema: GenerateImageParameters,
    outputSchema: GenerateImageResult,
    annotations: {
      baklavaCategory: "AI Generation",
    },
  },
  generateImage,
);

registerMcpServerTool(
  "generate-speech",
  {
    title: "Generate Speech",
    description: "Generates speech based on the provided text.",
    inputSchema: GenerateSpeechParameters,
    outputSchema: GenerateSpeechResult,
    annotations: {
      baklavaCategory: "AI Generation",
    },
  },
  generateSpeech,
);

registerMcpServerTool(
  "transcribe",
  {
    title: "Transcribe",
    description: "Transcribes audio to text.",
    inputSchema: TranscribeParameters,
    outputSchema: TranscribeResult,
    annotations: {
      baklavaCategory: "AI Generation",
    },
  },
  transcribe,
);

registerMcpServerTool(
  "BedrockLanguageModel",
  {
    title: "BedrockLanguageModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: LanguageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: bedrock.languageModel(modelId),
  }),
);

registerMcpServerTool(
  "BedrockTextEmbeddingModel",
  {
    title: "BedrockTextEmbeddingModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TextEmbeddingModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: bedrock.textEmbeddingModel(modelId),
  }),
);

registerMcpServerTool(
  "BedrockImageModel",
  {
    title: "BedrockImageModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: ImageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: bedrock.imageModel(modelId),
  }),
);

registerMcpServerTool(
  "BedrockSpeechModel",
  {
    title: "BedrockSpeechModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: SpeechModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      bedrock.speechModel,
      "Amazon Bedrock does not support speech synthesis",
    )(modelId),
  }),
);

registerMcpServerTool(
  "BedrockTranscriptionModel",
  {
    title: "BedrockTranscriptionModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TranscriptionModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      bedrock.transcriptionModel,
      "Amazon Bedrock does not support transcription",
    )(modelId),
  }),
);

registerMcpServerTool(
  "AnthropicLanguageModel",
  {
    title: "AnthropicLanguageModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: LanguageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: anthropic.languageModel(modelId),
  }),
);

registerMcpServerTool(
  "AnthropicTextEmbeddingModel",
  {
    title: "AnthropicTextEmbeddingModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TextEmbeddingModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: anthropic.textEmbeddingModel(modelId),
  }),
);

registerMcpServerTool(
  "AnthropicImageModel",
  {
    title: "AnthropicImageModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: ImageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: anthropic.imageModel(modelId),
  }),
);

registerMcpServerTool(
  "AnthropicSpeechModel",
  {
    title: "AnthropicSpeechModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: SpeechModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      anthropic.speechModel,
      "Anthropic does not support speech synthesis",
    )(modelId),
  }),
);

registerMcpServerTool(
  "AnthropicTranscriptionModel",
  {
    title: "AnthropicTranscriptionModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TranscriptionModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      anthropic.transcriptionModel,
      "Anthropic does not support transcription",
    )(modelId),
  }),
);

registerMcpServerTool(
  "AssemblyaiLanguageModel",
  {
    title: "AssemblyaiLanguageModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: LanguageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assemblyai.languageModel(modelId),
  }),
);

registerMcpServerTool(
  "AssemblyaiTextEmbeddingModel",
  {
    title: "AssemblyaiTextEmbeddingModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TextEmbeddingModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assemblyai.textEmbeddingModel(modelId),
  }),
);

registerMcpServerTool(
  "AssemblyaiImageModel",
  {
    title: "AssemblyaiImageModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: ImageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assemblyai.imageModel(modelId),
  }),
);

registerMcpServerTool(
  "AssemblyaiSpeechModel",
  {
    title: "AssemblyaiSpeechModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: SpeechModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      assemblyai.speechModel,
      "AssemblyAI does not support speech synthesis",
    )(modelId),
  }),
);

registerMcpServerTool(
  "AssemblyaiTranscriptionModel",
  {
    title: "AssemblyaiTranscriptionModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TranscriptionModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      assemblyai.transcriptionModel,
      "AssemblyAI does not support transcription",
    )(modelId),
  }),
);

registerMcpServerTool(
  "AzureLanguageModel",
  {
    title: "AzureLanguageModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: LanguageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: azure.languageModel(modelId),
  }),
);

registerMcpServerTool(
  "AzureTextEmbeddingModel",
  {
    title: "AzureTextEmbeddingModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TextEmbeddingModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: azure.textEmbeddingModel(modelId),
  }),
);

registerMcpServerTool(
  "AzureImageModel",
  {
    title: "AzureImageModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: ImageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: azure.imageModel(modelId) }),
);

registerMcpServerTool(
  "AzureSpeechModel",
  {
    title: "AzureSpeechModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: SpeechModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      azure.speechModel,
      "Azure does not support speech synthesis",
    )(modelId),
  }),
);

registerMcpServerTool(
  "AzureTranscriptionModel",
  {
    title: "AzureTranscriptionModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TranscriptionModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      azure.transcriptionModel,
      "Azure does not support transcription",
    )(modelId),
  }),
);

registerMcpServerTool(
  "CerebrasLanguageModel",
  {
    title: "CerebrasLanguageModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: LanguageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: cerebras.languageModel(modelId),
  }),
);

registerMcpServerTool(
  "CerebrasTextEmbeddingModel",
  {
    title: "CerebrasTextEmbeddingModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TextEmbeddingModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: cerebras.textEmbeddingModel(modelId),
  }),
);

registerMcpServerTool(
  "CerebrasImageModel",
  {
    title: "CerebrasImageModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: ImageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: cerebras.imageModel(modelId),
  }),
);

registerMcpServerTool(
  "CerebrasSpeechModel",
  {
    title: "CerebrasSpeechModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: SpeechModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      cerebras.speechModel,
      "Cerebras does not support speech synthesis",
    )(modelId),
  }),
);

registerMcpServerTool(
  "CerebrasTranscriptionModel",
  {
    title: "CerebrasTranscriptionModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TranscriptionModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      cerebras.transcriptionModel,
      "Cerebras does not support transcription",
    )(modelId),
  }),
);

registerMcpServerTool(
  "CohereLanguageModel",
  {
    title: "CohereLanguageModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: LanguageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: cohere.languageModel(modelId),
  }),
);

registerMcpServerTool(
  "CohereTextEmbeddingModel",
  {
    title: "CohereTextEmbeddingModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TextEmbeddingModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: cohere.textEmbeddingModel(modelId),
  }),
);

registerMcpServerTool(
  "CohereImageModel",
  {
    title: "CohereImageModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: ImageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: cohere.imageModel(modelId) }),
);

registerMcpServerTool(
  "CohereSpeechModel",
  {
    title: "CohereSpeechModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: SpeechModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      cohere.speechModel,
      "Cohere does not support speech synthesis",
    )(modelId),
  }),
);

registerMcpServerTool(
  "CohereTranscriptionModel",
  {
    title: "CohereTranscriptionModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TranscriptionModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      cohere.transcriptionModel,
      "Cohere does not support transcription",
    )(modelId),
  }),
);

registerMcpServerTool(
  "DeepgramLanguageModel",
  {
    title: "DeepgramLanguageModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: LanguageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: deepgram.languageModel(modelId),
  }),
);

registerMcpServerTool(
  "DeepgramTextEmbeddingModel",
  {
    title: "DeepgramTextEmbeddingModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TextEmbeddingModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: deepgram.textEmbeddingModel(modelId),
  }),
);

registerMcpServerTool(
  "DeepgramImageModel",
  {
    title: "DeepgramImageModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: ImageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: deepgram.imageModel(modelId),
  }),
);

registerMcpServerTool(
  "DeepgramSpeechModel",
  {
    title: "DeepgramSpeechModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: SpeechModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      deepgram.speechModel,
      "Deepgram does not support speech synthesis",
    )(modelId),
  }),
);

registerMcpServerTool(
  "DeepgramTranscriptionModel",
  {
    title: "DeepgramTranscriptionModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TranscriptionModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      deepgram.transcriptionModel,
      "Deepgram does not support transcription",
    )(modelId),
  }),
);

registerMcpServerTool(
  "DeepinfraLanguageModel",
  {
    title: "DeepinfraLanguageModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: LanguageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: deepinfra.languageModel(modelId),
  }),
);

registerMcpServerTool(
  "DeepinfraTextEmbeddingModel",
  {
    title: "DeepinfraTextEmbeddingModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TextEmbeddingModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: deepinfra.textEmbeddingModel(modelId),
  }),
);

registerMcpServerTool(
  "DeepinfraImageModel",
  {
    title: "DeepinfraImageModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: ImageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: deepinfra.imageModel(modelId),
  }),
);

registerMcpServerTool(
  "DeepinfraSpeechModel",
  {
    title: "DeepinfraSpeechModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: SpeechModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      deepinfra.speechModel,
      "Deepinfra does not support speech synthesis",
    )(modelId),
  }),
);

registerMcpServerTool(
  "DeepinfraTranscriptionModel",
  {
    title: "DeepinfraTranscriptionModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TranscriptionModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      deepinfra.transcriptionModel,
      "Deepinfra does not support transcription",
    )(modelId),
  }),
);

registerMcpServerTool(
  "DeepseekLanguageModel",
  {
    title: "DeepseekLanguageModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: LanguageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: deepseek.languageModel(modelId),
  }),
);

registerMcpServerTool(
  "DeepseekTextEmbeddingModel",
  {
    title: "DeepseekTextEmbeddingModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TextEmbeddingModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: deepseek.textEmbeddingModel(modelId),
  }),
);

registerMcpServerTool(
  "DeepseekImageModel",
  {
    title: "DeepseekImageModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: ImageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: deepseek.imageModel(modelId),
  }),
);

registerMcpServerTool(
  "DeepseekSpeechModel",
  {
    title: "DeepseekSpeechModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: SpeechModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      deepseek.speechModel,
      "Deepseek does not support speech synthesis",
    )(modelId),
  }),
);

registerMcpServerTool(
  "DeepseekTranscriptionModel",
  {
    title: "DeepseekTranscriptionModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TranscriptionModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      deepseek.transcriptionModel,
      "Deepseek does not support transcription",
    )(modelId),
  }),
);

registerMcpServerTool(
  "ElevenlabsLanguageModel",
  {
    title: "ElevenlabsLanguageModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: LanguageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: elevenlabs.languageModel(modelId),
  }),
);

registerMcpServerTool(
  "ElevenlabsTextEmbeddingModel",
  {
    title: "ElevenlabsTextEmbeddingModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TextEmbeddingModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: elevenlabs.textEmbeddingModel(modelId),
  }),
);

registerMcpServerTool(
  "ElevenlabsImageModel",
  {
    title: "ElevenlabsImageModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: ImageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: elevenlabs.imageModel(modelId),
  }),
);

registerMcpServerTool(
  "ElevenlabsSpeechModel",
  {
    title: "ElevenlabsSpeechModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: SpeechModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      elevenlabs.speechModel,
      "ElevenLabs does not support speech synthesis",
    )(modelId),
  }),
);

registerMcpServerTool(
  "ElevenlabsTranscriptionModel",
  {
    title: "ElevenlabsTranscriptionModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TranscriptionModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      elevenlabs.transcriptionModel,
      "ElevenLabs does not support transcription",
    )(modelId),
  }),
);

registerMcpServerTool(
  "FalLanguageModel",
  {
    title: "FalLanguageModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: LanguageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: fal.languageModel(modelId) }),
);

registerMcpServerTool(
  "FalTextEmbeddingModel",
  {
    title: "FalTextEmbeddingModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TextEmbeddingModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: fal.textEmbeddingModel(modelId),
  }),
);

registerMcpServerTool(
  "FalImageModel",
  {
    title: "FalImageModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: ImageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: fal.imageModel(modelId) }),
);

registerMcpServerTool(
  "FalSpeechModel",
  {
    title: "FalSpeechModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: SpeechModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      fal.speechModel,
      "Fal does not support speech synthesis",
    )(modelId),
  }),
);

registerMcpServerTool(
  "FalTranscriptionModel",
  {
    title: "FalTranscriptionModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TranscriptionModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      fal.transcriptionModel,
      "Fal does not support transcription",
    )(modelId),
  }),
);

registerMcpServerTool(
  "FireworksLanguageModel",
  {
    title: "FireworksLanguageModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: LanguageModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: fireworks.languageModel(modelId) }),
);

registerMcpServerTool(
  "FireworksTextEmbeddingModel",
  {
    title: "FireworksTextEmbeddingModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: TextEmbeddingModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: fireworks.textEmbeddingModel(modelId) }),
);

registerMcpServerTool(
  "FireworksImageModel",
  {
    title: "FireworksImageModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: ImageModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: fireworks.imageModel(modelId) }),
);

registerMcpServerTool(
  "FireworksSpeechModel",
  {
    title: "FireworksSpeechModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: SpeechModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      fireworks.speechModel,
      "Fireworks does not support speech synthesis",
    )(modelId),
  }),
);

registerMcpServerTool(
  "FireworksTranscriptionModel",
  {
    title: "FireworksTranscriptionModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: TranscriptionModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      fireworks.transcriptionModel,
      "Fireworks does not support transcription",
    )(modelId),
  }),
);

registerMcpServerTool(
  "GatewayLanguageModel",
  {
    title: "GatewayLanguageModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: LanguageModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: gateway.languageModel(modelId) }),
);

registerMcpServerTool(
  "GatewayTextEmbeddingModel",
  {
    title: "GatewayTextEmbeddingModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: TextEmbeddingModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: gateway.textEmbeddingModel(modelId) }),
);

registerMcpServerTool(
  "GatewayImageModel",
  {
    title: "GatewayImageModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: ImageModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: gateway.imageModel(modelId) }),
);

registerMcpServerTool(
  "GatewaySpeechModel",
  {
    title: "GatewaySpeechModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: SpeechModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      gateway.speechModel,
      "Gateway does not support speech synthesis",
    )(modelId),
  }),
);

registerMcpServerTool(
  "GatewayTranscriptionModel",
  {
    title: "GatewayTranscriptionModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: TranscriptionModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      gateway.transcriptionModel,
      "Gateway does not support transcription",
    )(modelId),
  }),
);

registerMcpServerTool(
  "GladiaLanguageModel",
  {
    title: "GladiaLanguageModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: LanguageModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: gladia.languageModel(modelId) }),
);

registerMcpServerTool(
  "GladiaTextEmbeddingModel",
  {
    title: "GladiaTextEmbeddingModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: TextEmbeddingModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: gladia.textEmbeddingModel(modelId) }),
);

registerMcpServerTool(
  "GladiaImageModel",
  {
    title: "GladiaImageModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: ImageModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: gladia.imageModel(modelId) }),
);

registerMcpServerTool(
  "GladiaSpeechModel",
  {
    title: "GladiaSpeechModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: SpeechModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      gladia.speechModel,
      "Gladia does not support speech synthesis",
    )(modelId),
  }),
);

registerMcpServerTool(
  "GladiaTranscriptionModel",
  {
    title: "GladiaTranscriptionModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: TranscriptionModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      gladia.transcriptionModel,
      "Gladia does not support transcription",
    )(modelId),
  }),
);

registerMcpServerTool(
  "GoogleLanguageModel",
  {
    title: "GoogleLanguageModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: LanguageModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: google.languageModel(modelId) }),
);

registerMcpServerTool(
  "GoogleTextEmbeddingModel",
  {
    title: "GoogleTextEmbeddingModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: TextEmbeddingModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: google.textEmbeddingModel(modelId) }),
);

registerMcpServerTool(
  "GoogleImageModel",
  {
    title: "GoogleImageModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: ImageModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: google.imageModel(modelId) }),
);

registerMcpServerTool(
  "GoogleSpeechModel",
  {
    title: "GoogleSpeechModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: SpeechModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      google.speechModel,
      "Google does not support speech synthesis",
    )(modelId),
  }),
);

registerMcpServerTool(
  "GoogleTranscriptionModel",
  {
    title: "GoogleTranscriptionModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: TranscriptionModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      google.transcriptionModel,
      "Google does not support transcription",
    )(modelId),
  }),
);

registerMcpServerTool(
  "VertexLanguageModel",
  {
    title: "VertexLanguageModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: LanguageModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: vertex.languageModel(modelId) }),
);

registerMcpServerTool(
  "VertexTextEmbeddingModel",
  {
    title: "VertexTextEmbeddingModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: TextEmbeddingModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: vertex.textEmbeddingModel(modelId) }),
);

registerMcpServerTool(
  "VertexImageModel",
  {
    title: "VertexImageModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: ImageModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: vertex.imageModel(modelId) }),
);

registerMcpServerTool(
  "VertexSpeechModel",
  {
    title: "VertexSpeechModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: SpeechModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      vertex.speechModel,
      "Vertex does not support speech synthesis",
    )(modelId),
  }),
);

registerMcpServerTool(
  "VertexTranscriptionModel",
  {
    title: "VertexTranscriptionModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: TranscriptionModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      vertex.transcriptionModel,
      "Vertex does not support transcription",
    )(modelId),
  }),
);

registerMcpServerTool(
  "GroqLanguageModel",
  {
    title: "GroqLanguageModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: LanguageModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: groq.languageModel(modelId) }),
);

registerMcpServerTool(
  "GroqTextEmbeddingModel",
  {
    title: "GroqTextEmbeddingModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: TextEmbeddingModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: groq.textEmbeddingModel(modelId) }),
);

registerMcpServerTool(
  "GroqImageModel",
  {
    title: "GroqImageModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: ImageModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: groq.imageModel(modelId) }),
);

registerMcpServerTool(
  "GroqSpeechModel",
  {
    title: "GroqSpeechModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: SpeechModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      groq.speechModel,
      "Groq does not support speech synthesis",
    )(modelId),
  }),
);

registerMcpServerTool(
  "GroqTranscriptionModel",
  {
    title: "GroqTranscriptionModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: TranscriptionModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      groq.transcriptionModel,
      "Groq does not support transcription",
    )(modelId),
  }),
);

registerMcpServerTool(
  "HumeSpeechModel",
  {
    title: "HumeSpeechModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: SpeechModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => {
    return {
      model: assertStrict(
        hume.speechModel,
        "Hume does not support speech synthesis",
      )(modelId),
    };
  },
);

registerMcpServerTool(
  "LmntSpeechModel",
  {
    title: "LmntSpeechModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: SpeechModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      lmnt.speechModel,
      "LMNT does not support speech synthesis",
    )(modelId),
  }),
);

registerMcpServerTool(
  "LumaLanguageModel",
  {
    title: "LumaLanguageModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: LanguageModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: luma.languageModel(modelId) }),
);

registerMcpServerTool(
  "LumaTextEmbeddingModel",
  {
    title: "LumaTextEmbeddingModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: TextEmbeddingModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: luma.textEmbeddingModel(modelId) }),
);

registerMcpServerTool(
  "LumaImageModel",
  {
    title: "LumaImageModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: ImageModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: luma.imageModel(modelId) }),
);

registerMcpServerTool(
  "LumaSpeechModel",
  {
    title: "LumaSpeechModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: SpeechModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      luma.speechModel,
      "Luma does not support speech synthesis",
    )(modelId),
  }),
);

registerMcpServerTool(
  "LumaTranscriptionModel",
  {
    title: "LumaTranscriptionModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: TranscriptionModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      luma.transcriptionModel,
      "Luma does not support transcription",
    )(modelId),
  }),
);

registerMcpServerTool(
  "MistralLanguageModel",
  {
    title: "MistralLanguageModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: LanguageModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: mistral.languageModel(modelId) }),
);

registerMcpServerTool(
  "MistralTextEmbeddingModel",
  {
    title: "MistralTextEmbeddingModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: TextEmbeddingModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: mistral.textEmbeddingModel(modelId) }),
);

registerMcpServerTool(
  "MistralImageModel",
  {
    title: "MistralImageModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: ImageModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: mistral.imageModel(modelId) }),
);

registerMcpServerTool(
  "MistralSpeechModel",
  {
    title: "MistralSpeechModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: SpeechModel }),
    annotations: { baklavaCategory: "AI Generation" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      mistral.speechModel,
      "Mistral does not support speech synthesis",
    )(modelId),
  }),
);

registerMcpServerTool(
  "MistralTranscriptionModel",
  {
    title: "MistralTranscriptionModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TranscriptionModel }),
    annotations: { baklavaCategory: "AI Generation" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      mistral.transcriptionModel,
      "Mistral does not support transcription",
    )(modelId),
  }),
);

registerMcpServerTool(
  "OpenaiLanguageModel",
  {
    title: "OpenaiLanguageModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: LanguageModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: openai.languageModel(modelId) }),
);

registerMcpServerTool(
  "OpenaiTextEmbeddingModel",
  {
    title: "OpenaiTextEmbeddingModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: TextEmbeddingModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: openai.textEmbeddingModel(modelId) }),
);

registerMcpServerTool(
  "OpenaiImageModel",
  {
    title: "OpenaiImageModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: ImageModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: openai.imageModel(modelId) }),
);

registerMcpServerTool(
  "OpenaiSpeechModel",
  {
    title: "OpenaiSpeechModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: SpeechModel }),
    annotations: { baklavaCategory: "AI Generation" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      openai.speechModel,
      "OpenAI does not support speech synthesis",
    )(modelId),
  }),
);

registerMcpServerTool(
  "OpenaiTranscriptionModel",
  {
    title: "OpenaiTranscriptionModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TranscriptionModel }),
    annotations: { baklavaCategory: "AI Generation" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      openai.transcriptionModel,
      "OpenAI does not support transcription",
    )(modelId),
  }),
);

registerMcpServerTool(
  "PerplexityLanguageModel",
  {
    title: "PerplexityLanguageModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: LanguageModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: perplexity.languageModel(modelId) }),
);

registerMcpServerTool(
  "PerplexityTextEmbeddingModel",
  {
    title: "PerplexityTextEmbeddingModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: TextEmbeddingModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: perplexity.textEmbeddingModel(modelId) }),
);

registerMcpServerTool(
  "PerplexityImageModel",
  {
    title: "PerplexityImageModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: ImageModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: perplexity.imageModel(modelId) }),
);

registerMcpServerTool(
  "PerplexitySpeechModel",
  {
    title: "PerplexitySpeechModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: SpeechModel }),
    annotations: { baklavaCategory: "AI Generation" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      perplexity.speechModel,
      "Perplexity does not support speech synthesis",
    )(modelId),
  }),
);

registerMcpServerTool(
  "PerplexityTranscriptionModel",
  {
    title: "PerplexityTranscriptionModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TranscriptionModel }),
    annotations: { baklavaCategory: "AI Generation" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      perplexity.transcriptionModel,
      "Perplexity does not support transcription",
    )(modelId),
  }),
);

registerMcpServerTool(
  "ReplicateLanguageModel",
  {
    title: "ReplicateLanguageModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: LanguageModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: replicate.languageModel(modelId) }),
);

registerMcpServerTool(
  "ReplicateTextEmbeddingModel",
  {
    title: "ReplicateTextEmbeddingModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: TextEmbeddingModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: replicate.textEmbeddingModel(modelId) }),
);

registerMcpServerTool(
  "ReplicateImageModel",
  {
    title: "ReplicateImageModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: ImageModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: replicate.imageModel(modelId) }),
);

registerMcpServerTool(
  "ReplicateSpeechModel",
  {
    title: "ReplicateSpeechModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: SpeechModel }),
    annotations: { baklavaCategory: "AI Generation" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      replicate.speechModel,
      "Replicate does not support speech synthesis",
    )(modelId),
  }),
);

registerMcpServerTool(
  "ReplicateTranscriptionModel",
  {
    title: "ReplicateTranscriptionModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TranscriptionModel }),
    annotations: { baklavaCategory: "AI Generation" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      replicate.transcriptionModel,
      "Replicate does not support transcription",
    )(modelId),
  }),
);

registerMcpServerTool(
  "RevaiLanguageModel",
  {
    title: "RevaiLanguageModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: LanguageModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: revai.languageModel(modelId) }),
);

registerMcpServerTool(
  "RevaiTextEmbeddingModel",
  {
    title: "RevaiTextEmbeddingModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: TextEmbeddingModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: revai.textEmbeddingModel(modelId) }),
);

registerMcpServerTool(
  "RevaiImageModel",
  {
    title: "RevaiImageModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: ImageModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: revai.imageModel(modelId) }),
);

registerMcpServerTool(
  "RevaiSpeechModel",
  {
    title: "RevaiSpeechModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: SpeechModel }),
    annotations: { baklavaCategory: "AI Generation" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      revai.speechModel,
      "Revai does not support speech synthesis",
    )(modelId),
  }),
);

registerMcpServerTool(
  "RevaiTranscriptionModel",
  {
    title: "RevaiTranscriptionModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TranscriptionModel }),
    annotations: { baklavaCategory: "AI Generation" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      revai.transcriptionModel,
      "Revai does not support transcription",
    )(modelId),
  }),
);

registerMcpServerTool(
  "TogetheraiLanguageModel",
  {
    title: "TogetheraiLanguageModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: LanguageModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: togetherai.languageModel(modelId) }),
);

registerMcpServerTool(
  "TogetheraiTextEmbeddingModel",
  {
    title: "TogetheraiTextEmbeddingModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: TextEmbeddingModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: togetherai.textEmbeddingModel(modelId) }),
);

registerMcpServerTool(
  "TogetheraiImageModel",
  {
    title: "TogetheraiImageModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: ImageModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: togetherai.imageModel(modelId) }),
);

registerMcpServerTool(
  "TogetheraiSpeechModel",
  {
    title: "TogetheraiSpeechModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: SpeechModel }),
    annotations: { baklavaCategory: "AI Generation" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      togetherai.speechModel,
      "TogetherAI does not support speech synthesis",
    )(modelId),
  }),
);

registerMcpServerTool(
  "TogetheraiTranscriptionModel",
  {
    title: "TogetheraiTranscriptionModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TranscriptionModel }),
    annotations: { baklavaCategory: "AI Generation" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      togetherai.transcriptionModel,
      "TogetherAI does not support transcription",
    )(modelId),
  }),
);

registerMcpServerTool(
  "VercelLanguageModel",
  {
    title: "VercelLanguageModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: LanguageModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: vercel.languageModel(modelId) }),
);

registerMcpServerTool(
  "VercelTextEmbeddingModel",
  {
    title: "VercelTextEmbeddingModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: TextEmbeddingModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: vercel.textEmbeddingModel(modelId) }),
);

registerMcpServerTool(
  "VercelImageModel",
  {
    title: "VercelImageModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: ImageModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: vercel.imageModel(modelId) }),
);

registerMcpServerTool(
  "VercelSpeechModel",
  {
    title: "VercelSpeechModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: SpeechModel }),
    annotations: { baklavaCategory: "AI Generation" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      vercel.speechModel,
      "Vercel does not support speech synthesis",
    )(modelId),
  }),
);

registerMcpServerTool(
  "VercelTranscriptionModel",
  {
    title: "VercelTranscriptionModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TranscriptionModel }),
    annotations: { baklavaCategory: "AI Generation" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      vercel.transcriptionModel,
      "Vercel does not support transcription",
    )(modelId),
  }),
);

registerMcpServerTool(
  "XaiLanguageModel",
  {
    title: "XaiLanguageModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: LanguageModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: xai.languageModel(modelId) }),
);

registerMcpServerTool(
  "XaiTextEmbeddingModel",
  {
    title: "XaiTextEmbeddingModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: TextEmbeddingModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: xai.textEmbeddingModel(modelId) }),
);

registerMcpServerTool(
  "XaiImageModel",
  {
    title: "XaiImageModel",
    description: "TODO",
    inputSchema: z.object({
      modelId: z.string(),
    }),
    outputSchema: z.object({
      model: ImageModel,
    }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: xai.imageModel(modelId) }),
);

registerMcpServerTool(
  "XaiSpeechModel",
  {
    title: "XaiSpeechModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: SpeechModel }),
    annotations: { baklavaCategory: "AI Generation" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      xai.speechModel,
      "XAI does not support speech synthesis",
    )(modelId),
  }),
);

registerMcpServerTool(
  "XaiTranscriptionModel",
  {
    title: "XaiTranscriptionModel",
    description: "TODO",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TranscriptionModel }),
    annotations: { baklavaCategory: "AI Generation" },
  },
  ({ modelId }) => ({
    model: assertStrict(
      xai.transcriptionModel,
      "XAI does not support transcription",
    )(modelId),
  }),
);

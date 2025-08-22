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
    annotations: { baklavaCategory: "AI Generation" },
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
    annotations: { baklavaCategory: "AI Generation" },
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
    annotations: { baklavaCategory: "AI Generation" },
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
    annotations: { baklavaCategory: "AI Generation" },
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
    annotations: { baklavaCategory: "AI Generation" },
  },
  transcribe,
);

registerMcpServerTool(
  "bedrock-language-model",
  {
    title: "Bedrock Language Model",
    description: "Provides access to Amazon Bedrock language models.",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: LanguageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: bedrock.languageModel(modelId),
  }),
);

registerMcpServerTool(
  "bedrock-text-embedding-model",
  {
    title: "Bedrock Text Embedding Model",
    description: "Provides access to Amazon Bedrock text embedding models.",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TextEmbeddingModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: bedrock.textEmbeddingModel(modelId),
  }),
);

registerMcpServerTool(
  "bedrock-image-model",
  {
    title: "Bedrock Image Model",
    description: "Provides access to Amazon Bedrock image generation models.",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: ImageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: bedrock.imageModel(modelId),
  }),
);

registerMcpServerTool(
  "bedrock-speech-model",
  {
    title: "Bedrock Speech Model",
    description: "Provides access to Amazon Bedrock speech synthesis models.",
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
  "bedrock-transcription-model",
  {
    title: "Bedrock Transcription Model",
    description: "Provides access to Amazon Bedrock transcription models.",
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
  "anthropic-language-model",
  {
    title: "Anthropic Language Model",
    description: "Provides access to Anthropic language models.",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: LanguageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: anthropic.languageModel(modelId),
  }),
);

registerMcpServerTool(
  "anthropic-text-embedding-model",
  {
    title: "Anthropic Text Embedding Model",
    description: "Provides access to Anthropic text embedding models.",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TextEmbeddingModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: anthropic.textEmbeddingModel(modelId),
  }),
);

registerMcpServerTool(
  "anthropic-image-model",
  {
    title: "Anthropic Image Model",
    description: "Provides access to Anthropic image generation models.",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: ImageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: anthropic.imageModel(modelId),
  }),
);

registerMcpServerTool(
  "anthropic-speech-model",
  {
    title: "Anthropic Speech Model",
    description: "Provides access to Anthropic speech synthesis models.",
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
  "anthropic-transcription-model",
  {
    title: "Anthropic Transcription Model",
    description: "Provides access to Anthropic transcription models.",
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
  "assemblyai-language-model",
  {
    title: "AssemblyAI Language Model",
    description: "Provides access to AssemblyAI language models.",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: LanguageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assemblyai.languageModel(modelId),
  }),
);

registerMcpServerTool(
  "assemblyai-text-embedding-model",
  {
    title: "AssemblyAI Text Embedding Model",
    description: "Provides access to AssemblyAI text embedding models.",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TextEmbeddingModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assemblyai.textEmbeddingModel(modelId),
  }),
);

registerMcpServerTool(
  "assemblyai-image-model",
  {
    title: "AssemblyAI Image Model",
    description: "Provides access to AssemblyAI image generation models.",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: ImageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: assemblyai.imageModel(modelId),
  }),
);

registerMcpServerTool(
  "assemblyai-speech-model",
  {
    title: "AssemblyAI Speech Model",
    description: "Provides access to AssemblyAI speech synthesis models.",
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
  "assemblyai-transcription-model",
  {
    title: "AssemblyAI Transcription Model",
    description: "Provides access to AssemblyAI transcription models.",
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
  "azure-language-model",
  {
    title: "Azure Language Model",
    description: "Provides access to Azure language models.",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: LanguageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: azure.languageModel(modelId),
  }),
);

registerMcpServerTool(
  "azure-text-embedding-model",
  {
    title: "Azure Text Embedding Model",
    description: "Provides access to Azure text embedding models.",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TextEmbeddingModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: azure.textEmbeddingModel(modelId),
  }),
);

registerMcpServerTool(
  "azure-image-model",
  {
    title: "Azure Image Model",
    description: "Provides access to Azure image generation models.",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: ImageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: azure.imageModel(modelId) }),
);

registerMcpServerTool(
  "azure-speech-model",
  {
    title: "Azure Speech Model",
    description: "Provides access to Azure speech synthesis models.",
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
  "azure-transcription-model",
  {
    title: "Azure Transcription Model",
    description: "Provides access to Azure transcription models.",
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
  "cerebras-language-model",
  {
    title: "Cerebras Language Model",
    description: "Provides access to Cerebras language models.",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: LanguageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: cerebras.languageModel(modelId),
  }),
);

registerMcpServerTool(
  "cerebras-text-embedding-model",
  {
    title: "Cerebras Text Embedding Model",
    description: "Provides access to Cerebras text embedding models.",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TextEmbeddingModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: cerebras.textEmbeddingModel(modelId),
  }),
);

registerMcpServerTool(
  "cerebras-image-model",
  {
    title: "Cerebras Image Model",
    description: "Provides access to Cerebras image generation models.",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: ImageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: cerebras.imageModel(modelId),
  }),
);

registerMcpServerTool(
  "cerebras-speech-model",
  {
    title: "Cerebras Speech Model",
    description: "Provides access to Cerebras speech synthesis models.",
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
  "cerebras-transcription-model",
  {
    title: "Cerebras Transcription Model",
    description: "Provides access to Cerebras transcription models.",
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
  "cohere-language-model",
  {
    title: "Cohere Language Model",
    description: "Provides access to Cohere language models.",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: LanguageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: cohere.languageModel(modelId),
  }),
);

registerMcpServerTool(
  "cohere-text-embedding-model",
  {
    title: "Cohere Text Embedding Model",
    description: "Provides access to Cohere text embedding models.",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TextEmbeddingModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: cohere.textEmbeddingModel(modelId),
  }),
);

registerMcpServerTool(
  "cohere-image-model",
  {
    title: "Cohere Image Model",
    description: "Provides access to Cohere image generation models.",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: ImageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: cohere.imageModel(modelId) }),
);

registerMcpServerTool(
  "cohere-speech-model",
  {
    title: "Cohere Speech Model",
    description: "Provides access to Cohere speech synthesis models.",
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
  "cohere-transcription-model",
  {
    title: "Cohere Transcription Model",
    description: "Provides access to Cohere transcription models.",
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
  "deepgram-language-model",
  {
    title: "Deepgram Language Model",
    description: "Provides access to Deepgram language models.",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: LanguageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: deepgram.languageModel(modelId),
  }),
);

registerMcpServerTool(
  "deepgram-text-embedding-model",
  {
    title: "Deepgram Text Embedding Model",
    description: "Provides access to Deepgram text embedding models.",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TextEmbeddingModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: deepgram.textEmbeddingModel(modelId),
  }),
);

registerMcpServerTool(
  "deepgram-image-model",
  {
    title: "Deepgram Image Model",
    description: "Provides access to Deepgram image generation models.",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: ImageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: deepgram.imageModel(modelId),
  }),
);

registerMcpServerTool(
  "deepgram-speech-model",
  {
    title: "Deepgram Speech Model",
    description: "Provides access to Deepgram speech synthesis models.",
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
  "deepgram-transcription-model",
  {
    title: "Deepgram Transcription Model",
    description: "Provides access to Deepgram transcription models.",
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
  "deepinfra-language-model",
  {
    title: "Deepinfra Language Model",
    description: "Provides access to Deepinfra language models.",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: LanguageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: deepinfra.languageModel(modelId),
  }),
);

registerMcpServerTool(
  "deepinfra-text-embedding-model",
  {
    title: "Deepinfra Text Embedding Model",
    description: "Provides access to Deepinfra text embedding models.",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TextEmbeddingModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: deepinfra.textEmbeddingModel(modelId),
  }),
);

registerMcpServerTool(
  "deepinfra-image-model",
  {
    title: "Deepinfra Image Model",
    description: "Provides access to Deepinfra image generation models.",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: ImageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: deepinfra.imageModel(modelId),
  }),
);

registerMcpServerTool(
  "deepinfra-speech-model",
  {
    title: "Deepinfra Speech Model",
    description: "Provides access to Deepinfra speech synthesis models.",
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
  "deepinfra-transcription-model",
  {
    title: "Deepinfra Transcription Model",
    description: "Provides access to Deepinfra transcription models.",
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
  "deepseek-language-model",
  {
    title: "Deepseek Language Model",
    description: "Provides access to Deepseek language models.",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: LanguageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: deepseek.languageModel(modelId),
  }),
);

registerMcpServerTool(
  "deepseek-text-embedding-model",
  {
    title: "Deepseek Text Embedding Model",
    description: "Provides access to Deepseek text embedding models.",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TextEmbeddingModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: deepseek.textEmbeddingModel(modelId),
  }),
);

registerMcpServerTool(
  "deepseek-image-model",
  {
    title: "Deepseek Image Model",
    description: "Provides access to Deepseek image generation models.",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: ImageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: deepseek.imageModel(modelId),
  }),
);

registerMcpServerTool(
  "deepseek-speech-model",
  {
    title: "Deepseek Speech Model",
    description: "Provides access to Deepseek speech synthesis models.",
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
  "deepseek-transcription-model",
  {
    title: "Deepseek Transcription Model",
    description: "Provides access to Deepseek transcription models.",
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
  "elevenlabs-language-model",
  {
    title: "ElevenLabs Language Model",
    description: "Provides access to ElevenLabs language models.",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: LanguageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: elevenlabs.languageModel(modelId),
  }),
);

registerMcpServerTool(
  "elevenlabs-text-embedding-model",
  {
    title: "ElevenLabs Text Embedding Model",
    description: "Provides access to ElevenLabs text embedding models.",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TextEmbeddingModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: elevenlabs.textEmbeddingModel(modelId),
  }),
);

registerMcpServerTool(
  "elevenlabs-image-model",
  {
    title: "ElevenLabs Image Model",
    description: "Provides access to ElevenLabs image generation models.",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: ImageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: elevenlabs.imageModel(modelId),
  }),
);

registerMcpServerTool(
  "elevenlabs-speech-model",
  {
    title: "ElevenLabs Speech Model",
    description: "Provides access to ElevenLabs speech synthesis models.",
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
  "elevenlabs-transcription-model",
  {
    title: "ElevenLabs Transcription Model",
    description: "Provides access to ElevenLabs transcription models.",
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
  "fal-language-model",
  {
    title: "Fal Language Model",
    description: "Provides access to Fal language models.",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: LanguageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: fal.languageModel(modelId) }),
);

registerMcpServerTool(
  "fal-text-embedding-model",
  {
    title: "Fal Text Embedding Model",
    description: "Provides access to Fal text embedding models.",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: TextEmbeddingModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({
    model: fal.textEmbeddingModel(modelId),
  }),
);

registerMcpServerTool(
  "fal-image-model",
  {
    title: "Fal Image Model",
    description: "Provides access to Fal image generation models.",
    inputSchema: z.object({ modelId: z.string() }),
    outputSchema: z.object({ model: ImageModel }),
    annotations: { baklavaCategory: "AI Models" },
  },
  ({ modelId }) => ({ model: fal.imageModel(modelId) }),
);

registerMcpServerTool(
  "fal-speech-model",
  {
    title: "Fal Speech Model",
    description: "Provides access to Fal speech synthesis models.",
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
  "fal-transcription-model",
  {
    title: "Fal Transcription Model",
    description: "Provides access to Fal transcription models.",
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
  "fireworks-language-model",
  {
    title: "Fireworks Language Model",
    description: "Provides access to Fireworks language models.",
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
  "fireworks-text-embedding-model",
  {
    title: "Fireworks Text Embedding Model",
    description: "Provides access to Fireworks text embedding models.",
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
  "fireworks-image-model",
  {
    title: "Fireworks Image Model",
    description: "Provides access to Fireworks image generation models.",
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
  "fireworks-speech-model",
  {
    title: "Fireworks Speech Model",
    description: "Provides access to Fireworks speech synthesis models.",
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
  "fireworks-transcription-model",
  {
    title: "Fireworks Transcription Model",
    description: "Provides access to Fireworks transcription models.",
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
  "gateway-language-model",
  {
    title: "Gateway Language Model",
    description: "Provides access to Gateway language models.",
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
  "gateway-text-embedding-model",
  {
    title: "Gateway Text Embedding Model",
    description: "Provides access to Gateway text embedding models.",
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
  "gateway-image-model",
  {
    title: "Gateway Image Model",
    description: "Provides access to Gateway image generation models.",
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
  "gateway-speech-model",
  {
    title: "Gateway Speech Model",
    description: "Provides access to Gateway speech synthesis models.",
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
  "gateway-transcription-model",
  {
    title: "Gateway Transcription Model",
    description: "Provides access to Gateway transcription models.",
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
  "gladia-language-model",
  {
    title: "Gladia Language Model",
    description: "Provides access to Gladia language models.",
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
  "gladia-text-embedding-model",
  {
    title: "Gladia Text Embedding Model",
    description: "Provides access to Gladia text embedding models.",
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
  "gladia-image-model",
  {
    title: "Gladia Image Model",
    description: "Provides access to Gladia image generation models.",
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
  "gladia-speech-model",
  {
    title: "Gladia Speech Model",
    description: "Provides access to Gladia speech synthesis models.",
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
  "gladia-transcription-model",
  {
    title: "Gladia Transcription Model",
    description: "Provides access to Gladia transcription models.",
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
  "google-language-model",
  {
    title: "Google Language Model",
    description: "Provides access to Google language models.",
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
  "google-text-embedding-model",
  {
    title: "Google Text Embedding Model",
    description: "Provides access to Google text embedding models.",
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
  "google-image-model",
  {
    title: "Google Image Model",
    description: "Provides access to Google image generation models.",
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
  "google-speech-model",
  {
    title: "Google Speech Model",
    description: "Provides access to Google speech synthesis models.",
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
  "google-transcription-model",
  {
    title: "Google Transcription Model",
    description: "Provides access to Google transcription models.",
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
  "vertex-language-model",
  {
    title: "Vertex Language Model",
    description: "Provides access to Vertex language models.",
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
  "vertex-text-embedding-model",
  {
    title: "Vertex Text Embedding Model",
    description: "Provides access to Vertex text embedding models.",
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
  "vertex-image-model",
  {
    title: "Vertex Image Model",
    description: "Provides access to Vertex image generation models.",
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
  "vertex-speech-model",
  {
    title: "Vertex Speech Model",
    description: "Provides access to Vertex speech synthesis models.",
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
  "vertex-transcription-model",
  {
    title: "Vertex Transcription Model",
    description: "Provides access to Vertex transcription models.",
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
  "groq-language-model",
  {
    title: "Groq Language Model",
    description: "Provides access to Groq language models.",
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
  "groq-text-embedding-model",
  {
    title: "Groq Text Embedding Model",
    description: "Provides access to Groq text embedding models.",
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
  "groq-image-model",
  {
    title: "Groq Image Model",
    description: "Provides access to Groq image generation models.",
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
  "groq-speech-model",
  {
    title: "Groq Speech Model",
    description: "Provides access to Groq speech synthesis models.",
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
  "groq-transcription-model",
  {
    title: "Groq Transcription Model",
    description: "Provides access to Groq transcription models.",
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
  "hume-speech-model",
  {
    title: "Hume Speech Model",
    description: "Provides access to Hume speech synthesis models.",
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
  "lmnt-speech-model",
  {
    title: "LMNT Speech Model",
    description: "Provides access to LMNT speech synthesis models.",
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
  "luma-language-model",
  {
    title: "Luma Language Model",
    description: "Provides access to Luma language models.",
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
  "luma-text-embedding-model",
  {
    title: "Luma Text Embedding Model",
    description: "Provides access to Luma text embedding models.",
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
  "luma-image-model",
  {
    title: "Luma Image Model",
    description: "Provides access to Luma image generation models.",
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
  "luma-speech-model",
  {
    title: "Luma Speech Model",
    description: "Provides access to Luma speech synthesis models.",
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
  "luma-transcription-model",
  {
    title: "Luma Transcription Model",
    description: "Provides access to Luma transcription models.",
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
  "mistral-language-model",
  {
    title: "Mistral Language Model",
    description: "Provides access to Mistral language models.",
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
  "mistral-text-embedding-model",
  {
    title: "Mistral Text Embedding Model",
    description: "Provides access to Mistral text embedding models.",
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
  "mistral-image-model",
  {
    title: "Mistral Image Model",
    description: "Provides access to Mistral image generation models.",
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
  "mistral-speech-model",
  {
    title: "Mistral Speech Model",
    description: "Provides access to Mistral speech synthesis models.",
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
  "mistral-transcription-model",
  {
    title: "Mistral Transcription Model",
    description: "Provides access to Mistral transcription models.",
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
  "openai-language-model",
  {
    title: "OpenAI Language Model",
    description: "Provides access to OpenAI language models.",
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
  "openai-text-embedding-model",
  {
    title: "OpenAI Text Embedding Model",
    description: "Provides access to OpenAI text embedding models.",
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
  "openai-image-model",
  {
    title: "OpenAI Image Model",
    description: "Provides access to OpenAI image generation models.",
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
  "openai-speech-model",
  {
    title: "OpenAI Speech Model",
    description: "Provides access to OpenAI speech synthesis models.",
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
  "openai-transcription-model",
  {
    title: "OpenAI Transcription Model",
    description: "Provides access to OpenAI transcription models.",
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
  "perplexity-language-model",
  {
    title: "Perplexity Language Model",
    description: "Provides access to Perplexity language models.",
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
  "perplexity-text-embedding-model",
  {
    title: "Perplexity Text Embedding Model",
    description: "Provides access to Perplexity text embedding models.",
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
  "perplexity-image-model",
  {
    title: "Perplexity Image Model",
    description: "Provides access to Perplexity image generation models.",
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
  "perplexity-speech-model",
  {
    title: "Perplexity Speech Model",
    description: "Provides access to Perplexity speech synthesis models.",
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
  "perplexity-transcription-model",
  {
    title: "Perplexity Transcription Model",
    description: "Provides access to Perplexity transcription models.",
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
  "replicate-language-model",
  {
    title: "Replicate Language Model",
    description: "Provides access to Replicate language models.",
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
  "replicate-text-embedding-model",
  {
    title: "Replicate Text Embedding Model",
    description: "Provides access to Replicate text embedding models.",
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
  "replicate-image-model",
  {
    title: "Replicate Image Model",
    description: "Provides access to Replicate image generation models.",
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
  "replicate-speech-model",
  {
    title: "Replicate Speech Model",
    description: "Provides access to Replicate speech synthesis models.",
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
  "replicate-transcription-model",
  {
    title: "Replicate Transcription Model",
    description: "Provides access to Replicate transcription models.",
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
  "revai-language-model",
  {
    title: "RevAI Language Model",
    description: "Provides access to RevAI language models.",
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
  "revai-text-embedding-model",
  {
    title: "RevAI Text Embedding Model",
    description: "Provides access to RevAI text embedding models.",
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
  "revai-image-model",
  {
    title: "RevAI Image Model",
    description: "Provides access to RevAI image generation models.",
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
  "revai-speech-model",
  {
    title: "RevAI Speech Model",
    description: "Provides access to RevAI speech synthesis models.",
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
  "revai-transcription-model",
  {
    title: "RevAI Transcription Model",
    description: "Provides access to RevAI transcription models.",
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
  "togetherai-language-model",
  {
    title: "TogetherAI Language Model",
    description: "Provides access to TogetherAI language models.",
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
  "togetherai-text-embedding-model",
  {
    title: "TogetherAI Text Embedding Model",
    description: "Provides access to TogetherAI text embedding models.",
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
  "togetherai-image-model",
  {
    title: "TogetherAI Image Model",
    description: "Provides access to TogetherAI image generation models.",
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
  "togetherai-speech-model",
  {
    title: "TogetherAI Speech Model",
    description: "Provides access to TogetherAI speech synthesis models.",
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
  "togetherai-transcription-model",
  {
    title: "TogetherAI Transcription Model",
    description: "Provides access to TogetherAI transcription models.",
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
  "vercel-language-model",
  {
    title: "Vercel Language Model",
    description: "Provides access to Vercel language models.",
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
  "vercel-text-embedding-model",
  {
    title: "Vercel Text Embedding Model",
    description: "Provides access to Vercel text embedding models.",
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
  "vercel-image-model",
  {
    title: "Vercel Image Model",
    description: "Provides access to Vercel image generation models.",
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
  "vercel-speech-model",
  {
    title: "Vercel Speech Model",
    description: "Provides access to Vercel speech synthesis models.",
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
  "vercel-transcription-model",
  {
    title: "Vercel Transcription Model",
    description: "Provides access to Vercel transcription models.",
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
  "xai-language-model",
  {
    title: "XAI Language Model",
    description: "Provides access to XAI language models.",
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
  "xai-text-embedding-model",
  {
    title: "XAI Text Embedding Model",
    description: "Provides access to XAI text embedding models.",
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
  "xai-image-model",
  {
    title: "XAI Image Model",
    description: "Provides access to XAI image generation models.",
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
  "xai-speech-model",
  {
    title: "XAI Speech Model",
    description: "Provides access to XAI speech synthesis models.",
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
  "xai-transcription-model",
  {
    title: "XAI Transcription Model",
    description: "Provides access to XAI transcription models.",
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

// We'll dynamically import `pipeline` to avoid loading heavy native bindings at module import time.

export type LLMKey = 'mistral' | 'openhermes' | 'gpt4o' | 'llama3_2' | 'llama3_1' | 'flan' | string;

// Recommended model map. These are suggestions; some models are large and may require
// authentication or server-side hosting. Use a full model id (owner/model) to override.
export const recommendedModels: Record<string, { id: string; task?: string }> = {
  mistral: { id: 'mistralai/mistral-7b-instruct', task: 'text-generation' },
  openhermes: { id: 'OpenAssistant/oa-OpenHermes-1.0', task: 'text-generation' },
  gpt4o: { id: 'OpenAI/gpt-4o-mini', task: 'text-generation' },
  llama3_2: { id: 'meta-llama/Llama-3-2.0', task: 'text-generation' },
  llama3_1: { id: 'meta-llama/Llama-3-1.0', task: 'text-generation' },
  flan: { id: 'google/flan-t5-small', task: 'text-generation' },
};

export function resolveModelId(keyOrId: LLMKey): string {
  if (!keyOrId) return '';
  const key = String(keyOrId);
  if (recommendedModels[key]) return recommendedModels[key].id;
  // If it's already a full model id (contains '/'), return as-is.
  if (key.includes('/')) return key;
  // Fallback to key as id
  return key;
}

export function resolveTaskForModel(keyOrId: LLMKey, fallback: string): string {
  const key = String(keyOrId);
  if (recommendedModels[key] && recommendedModels[key].task)
    return recommendedModels[key].task as string;
  return fallback;
}

export async function createPipeline(
  task: string,
  modelKeyOrId: LLMKey,
  device: string | undefined
): Promise<unknown> {
  const modelId = resolveModelId(modelKeyOrId);
  // Dynamically import transformers.pipeline to avoid top-level native bindings.
  const transformers = await import('@huggingface/transformers');
  const pipelineFn = (transformers as unknown as { pipeline?: unknown }).pipeline as unknown;
  if (typeof pipelineFn !== 'function') {
    throw new Error('transformers.pipeline is not available');
  }
  // Call pipeline as unknown and return the result

  // @ts-ignore - runtime call to unknown pipeline
  return pipelineFn(task, modelId, { device: device || undefined });
}

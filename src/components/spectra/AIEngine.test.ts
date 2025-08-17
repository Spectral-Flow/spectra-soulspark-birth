import { describe, it, expect } from 'vitest';
import { spectraAI } from './AIEngine';

describe('SpectraAIEngine fallback', () => {
  it('returns fallback response when not initialized', async () => {
    // ensure not initialized (use bracket access to avoid private modifier)
    (spectraAI as unknown as { isInitialized?: boolean })['isInitialized'] = false;

    const res = await spectraAI.generateResponse('Hello', []);
    expect(res).toHaveProperty('text');
    expect(res.metadata.model).toBe('fallback');
  });
});

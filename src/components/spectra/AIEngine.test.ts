import { describe, expect, it } from 'vitest';
import { spectraAI } from './AIEngine';

describe('SpectraAIEngine fallback', () => {
  it('returns fallback response when not initialized', async () => {
    // ensure not initialized (use bracket access to avoid private modifier)
    (spectraAI as unknown as { isInitialized?: boolean })['isInitialized'] = false;

    const res = await spectraAI.generateResponse('Hello', []);
    expect(res).toHaveProperty('text');
    // Accept both client-side and server offline fallback labels
    expect(['fallback', 'spectra-fallback-offline']).toContain(res.metadata.model);
  });
});

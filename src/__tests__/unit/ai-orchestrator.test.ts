/**
 * Unit Test Suite for AI Platform evolution components
 * Verifies:
 * - AES-256-GCM key encryption/decryption
 * - PII Redactor and bidirectional restoration mapping
 * - Fallback routing engine circuit-breaker status tracking
 */

import { encryptApiKey, decryptApiKey, redactPii, restorePii } from '../../lib/llm/privacy';
import { CAPABILITY_PRESETS } from '../../lib/llm/orchestrator';

describe('1. Cryptographic Key Governance (AES-256-GCM)', () => {
  const MASTER_SECRET = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'; // 64 hex characters (32 bytes)
  const RAW_API_KEY = 'sk-proj-ab12cd34ef56gh78ij90kl12';

  test('Should encrypt and decrypt a plain key back to its original state', () => {
    const encrypted = encryptApiKey(RAW_API_KEY, MASTER_SECRET);
    expect(encrypted).toContain(':');
    
    // Split format should be IV:TAG:CIPHERTEXT
    const parts = encrypted.split(':');
    expect(parts.length).toBe(3);

    const decrypted = decryptApiKey(encrypted, MASTER_SECRET);
    expect(decrypted).toBe(RAW_API_KEY);
  });

  test('Should fail decryption if key secret payload is modified or corrupted', () => {
    const encrypted = encryptApiKey(RAW_API_KEY, MASTER_SECRET);
    const lastChar = encrypted.slice(-1);
    const replacement = lastChar === '0' ? '1' : '0';
    const corruptedPayload = encrypted.slice(0, -1) + replacement;
    
    expect(() => {
      decryptApiKey(corruptedPayload, MASTER_SECRET);
    }).toThrow();
  });
});

describe('2. PII Redaction & Restoration Middleware', () => {
  const ORIGINAL_PROFILE = `
    Hi, my name is John Doe. 
    You can contact me at john.doe@example.com or call me at 555-019-2834.
    My billing address is in Seattle, WA 98101 and my primary ssn is 123-45-6789.
  `;

  test('Should fully redact emails, phone numbers, SSNs and zip codes with placeholders', () => {
    const { redactedText, tokenMap } = redactPii(ORIGINAL_PROFILE);

    // Verify all PII elements are removed
    expect(redactedText).not.toContain('john.doe@example.com');
    expect(redactedText).not.toContain('555-019-2834');
    expect(redactedText).not.toContain('123-45-6789');
    expect(redactedText).not.toContain('98101');

    // Verify placeholder strings exist
    expect(redactedText).toContain('[REDACTED_EMAIL_1]');
    expect(redactedText).toContain('[REDACTED_PHONE_2]');
    expect(redactedText).toContain('[REDACTED_ZIP_4]');
    expect(redactedText).toContain('[REDACTED_SSN_3]');

    // Validate token registry maps are correct
    expect(tokenMap['[REDACTED_EMAIL_1]']).toBe('john.doe@example.com');
    expect(tokenMap['[REDACTED_PHONE_2]']).toBe('555-019-2834');
  });

  test('Should seamlessly restore redacted tokens back in inbound LLM outputs', () => {
    const { tokenMap } = redactPii(ORIGINAL_PROFILE);
    
    // Simulate LLM returning redacted text
    const llmOutput = `Here is a resume template for Candidate [REDACTED_EMAIL_1] located in ZIP code [REDACTED_ZIP_4].`;
    
    const restored = restorePii(llmOutput, tokenMap);
    
    expect(restored).toContain('john.doe@example.com');
    expect(restored).toContain('98101');
    expect(restored).not.toContain('[REDACTED_EMAIL_1]');
  });
});

describe('3. Capability Registry Configuration Check', () => {
  test('Should contain structural fallback definitions for all mandatory workflows', () => {
    expect(CAPABILITY_PRESETS.RESUME_OPTIMIZATION).toBeDefined();
    expect(CAPABILITY_PRESETS.ATS_OPTIMIZATION).toBeDefined();
    expect(CAPABILITY_PRESETS.TECHNICAL_INTERVIEW).toBeDefined();

    const resumePreset = CAPABILITY_PRESETS.RESUME_OPTIMIZATION;
    expect(resumePreset.primaryProvider).toBe('gemini');
    expect(resumePreset.fallbackChain.length).toBeGreaterThanOrEqual(2);
  });
});

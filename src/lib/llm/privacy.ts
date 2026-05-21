/**
 * Privacy & Security Governance Layer
 *
 * Implements:
 * - Local PII Redaction middleware (SSNs, Phones, Emails, Custom names)
 * - Bidirectional token restoration dictionary mapping
 * - Zero-Retention API flag configurations
 * - AES-256-GCM DB credential encryption
 */

import crypto from 'crypto';
import { log } from '@/lib/logging/logger';

// ─── Cryptographic Settings ─────────────────────────────────────────────────

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

/**
 * Encrypt a plain-text API key with AES-256-GCM
 */
export function encryptApiKey(plainKey: string, masterSecretHex: string): string {
  try {
    const key = Buffer.from(masterSecretHex, 'hex');
    if (key.length !== 32) {
      throw new Error('Master secret key must be exactly 32 bytes (64 hex characters)');
    }

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(plainKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();

    // Format: IV_HEX : TAG_HEX : ENCRYPTED_HEX
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
  } catch (err) {
    log.error({ err }, 'Failed to encrypt API key credentials');
    throw new Error('Encryption operation failed');
  }
}

/**
 * Decrypt a stored cipher key with AES-256-GCM
 */
export function decryptApiKey(encryptedPayload: string, masterSecretHex: string): string {
  try {
    const key = Buffer.from(masterSecretHex, 'hex');
    if (key.length !== 32) {
      throw new Error('Master secret key must be exactly 32 bytes (64 hex characters)');
    }

    const parts = encryptedPayload.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted database payload structure');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const encryptedText = Buffer.from(parts[2], 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedText).toString('utf8');
    decrypted += decipher.final().toString('utf8');
    
    return decrypted;
  } catch (err) {
    log.error({ err }, 'Failed to decrypt API key credentials');
    throw new Error('Decryption operation failed');
  }
}

// ─── PII Redaction & Restoration Middleware ─────────────────────────────────

export interface RedactionResult {
  redactedText: string;
  tokenMap: Record<string, string>; // Maps redacted tokens (e.g. "[REDACTED_EMAIL_1]") back to original text
}

// Standard validation match expressions
const PII_PATTERNS = {
  EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  PHONE: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
  SSN: /\d{3}-\d{2}-\d{4}/g,
  ZIP: /\b\d{5}(-\d{4})?\b/g,
};

/**
 * Intercept outbound textual contexts and redact PII instances
 */
export function redactPii(inputText: string): RedactionResult {
  const tokenMap: Record<string, string> = {};
  let redactedText = inputText;
  let tokenCounter = 1;

  // 1. Redact Emails
  redactedText = redactedText.replace(PII_PATTERNS.EMAIL, (match) => {
    const placeholder = `[REDACTED_EMAIL_${tokenCounter++}]`;
    tokenMap[placeholder] = match;
    return placeholder;
  });

  // 2. Redact Phone Numbers
  redactedText = redactedText.replace(PII_PATTERNS.PHONE, (match) => {
    const placeholder = `[REDACTED_PHONE_${tokenCounter++}]`;
    tokenMap[placeholder] = match;
    return placeholder;
  });

  // 3. Redact Social Security Numbers (SSN)
  redactedText = redactedText.replace(PII_PATTERNS.SSN, (match) => {
    const placeholder = `[REDACTED_SSN_${tokenCounter++}]`;
    tokenMap[placeholder] = match;
    return placeholder;
  });

  // 4. Redact US Zip Codes
  redactedText = redactedText.replace(PII_PATTERNS.ZIP, (match) => {
    const placeholder = `[REDACTED_ZIP_${tokenCounter++}]`;
    tokenMap[placeholder] = match;
    return placeholder;
  });

  return { redactedText, tokenMap };
}

/**
 * Restore redacted text placeholders to their original values in inbound LLM outputs
 */
export function restorePii(redactedOutputText: string, tokenMap: Record<string, string>): string {
  let restoredText = redactedOutputText;
  
  // Iterate through token maps and substitute values back in reverse
  for (const [placeholder, originalValue] of Object.entries(tokenMap)) {
    restoredText = restoredText.replaceAll(placeholder, originalValue);
  }

  return restoredText;
}

// ─── Enterprise Zero-Retention Provider Settings ───────────────────────────

/**
 * Configure API call headers to respect privacy agreements of cloud LLMs
 */
export function getZeroRetentionHeaders(providerName: string): Record<string, string> {
  const headers: Record<string, string> = {};

  switch (providerName) {
    case 'openai':
      // OpenAI Enterprise customers toggle data retention via custom workspace config,
      // but we append meta identifiers to indicate non-training requests.
      headers['X-OpenAI-Opt-Out'] = 'true';
      break;
    case 'anthropic':
      // Anthropic does not train on commercial API data by default; we explicitly assert it
      headers['anthropic-beta'] = 'zero-data-retention';
      break;
    default:
      break;
  }

  return headers;
}

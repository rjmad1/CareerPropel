const DANGEROUS_PATTERNS = [
  /ignore previous instructions/gi,
  /forget everything/gi,
  /system prompt/gi,
  /secret instructions/gi,
  /roleplay as/gi,
  /pretend you are/gi,
  /act as if/gi,
  /disregard all/gi,
]

const PROMPT_BOUNDARY = {
  start: '--- USER INPUT START ---',
  end: '--- USER INPUT END ---',
}

interface SanitizeOptions {
  maxLength?: number
  allowInjectionWarnings?: boolean
}

export function sanitizePrompt(
  input: string,
  options: SanitizeOptions = {}
): string {
  const { maxLength = 2000, allowInjectionWarnings = true } = options

  let sanitized = input.trim()

  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength).trim()
  }

  let hasInjectionAttempt = false
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(sanitized)) {
      hasInjectionAttempt = true
      sanitized = sanitized.replace(pattern, '')
    }
  }

  if (hasInjectionAttempt && allowInjectionWarnings) {
    console.warn('Potential prompt injection detected and sanitized', {
      original: input.substring(0, 100),
      timestamp: new Date().toISOString(),
    })
  }

  return `${PROMPT_BOUNDARY.start}\n${sanitized}\n${PROMPT_BOUNDARY.end}`
}

export function validateInterviewPrepInput(input: string): {
  valid: boolean
  error?: string
} {
  const maxLength = 5000
  const minLength = 10

  if (input.length < minLength) {
    return {
      valid: false,
      error: 'Input is too short. Provide at least 10 characters.',
    }
  }

  if (input.length > maxLength) {
    return {
      valid: false,
      error: `Input is too long. Maximum ${maxLength} characters allowed.`,
    }
  }

  const codePatterns = [
    /eval\(/gi,
    /exec\(/gi,
    /system\(/gi,
    /__.*__/g,
    /require\(/gi,
    /import\s+/gi,
  ]

  for (const pattern of codePatterns) {
    if (pattern.test(input)) {
      return {
        valid: false,
        error: 'Input contains potentially unsafe content.',
      }
    }
  }

  return { valid: true }
}

export function sanitizeUserFeedback(feedback: string): string {
  let sanitized = feedback.replace(/<[^>]*>/g, '')

  // Escape special characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')

  return sanitized.trim()
}

export function validateLLMBoundaries(content: string): boolean {
  return (
    content.includes(PROMPT_BOUNDARY.start) &&
    content.includes(PROMPT_BOUNDARY.end)
  )
}

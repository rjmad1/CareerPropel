import { AnthropicProvider } from '@/lib/llm/anthropic';
import { createLogger } from '@/lib/logging/logger';
import { GENERIC_OPENER_PATTERNS } from '../constants';
import { GeneratedOutreach, OutreachRequest, SafetyCheck, WarmPath } from '../types';

const logger = createLogger({ component: 'outreach-generation' });

const SYSTEM_PROMPT = `You are an expert career coach writing personalized outreach messages for job seekers.

STRICT RULES — you must follow every one:
1. Never use generic openers like "Hi [Name], I saw your profile..." or "Hope this finds you well"
2. Only mention mutual connections or shared history that is explicitly provided in the context
3. Never fabricate referrals, shared experiences, or relationships not in the context
4. Keep LinkedIn messages under 200 words; emails under 300 words
5. Be specific about the role, company, and why this person in particular
6. Professional but human — not a cover letter, not spam
7. End with a clear, low-friction call to action (a question or brief ask)
8. Output ONLY valid JSON matching the schema, no extra text

Output JSON schema:
{
  "subject": "string (email only, omit for LinkedIn)",
  "message": "string (baseline draft)",
  "personalizedMessage": "string (final personalized version)",
  "tone": "PROFESSIONAL" | "WARM" | "CASUAL"
}`;

export class OutreachGenerationService {
  private _llm: AnthropicProvider | null = null;

  private get llm(): AnthropicProvider {
    this._llm ??= new AnthropicProvider();
    return this._llm;
  }

  async generateOutreach(req: OutreachRequest): Promise<GeneratedOutreach> {
    const userPrompt = this.buildUserPrompt(req);

    logger.info(
      { contactId: req.contactId, channel: req.channel, step: req.sequenceStep },
      'Generating outreach',
    );

    let raw: string;
    try {
      const result = await this.llm.callLLM(
        [{ role: 'user', content: userPrompt }],
        {
          systemPrompt: SYSTEM_PROMPT,
          model: 'claude-sonnet-4-6',
          maxTokens: 1024,
          temperature: 0.7,
        },
      );
      raw = result.content;
    } catch (err) {
      logger.error({ err }, 'LLM call failed for outreach generation');
      throw err;
    }

    let parsed: { subject?: string; message: string; personalizedMessage: string; tone: string };
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Try to extract JSON from response if wrapped in markdown
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Could not parse outreach JSON from LLM');
      parsed = JSON.parse(jsonMatch[0]);
    }

    const safetyChecks = this.validateSafety(parsed.personalizedMessage, req.context.warmPath ? [req.context.warmPath] : []);

    return {
      subject: parsed.subject,
      message: parsed.message,
      personalizedMessage: parsed.personalizedMessage,
      tone: (parsed.tone as GeneratedOutreach['tone']) ?? 'PROFESSIONAL',
      safetyChecks,
      approved: false, // always requires human approval
    };
  }

  validateSafety(message: string, warmPaths: WarmPath[]): SafetyCheck[] {
    const checks: SafetyCheck[] = [];

    // Rule 1: No generic openers
    const hasGenericOpener = GENERIC_OPENER_PATTERNS.some((p) => p.test(message));
    checks.push({
      rule: 'NO_GENERIC_OPENER',
      passed: !hasGenericOpener,
      reason: hasGenericOpener ? 'Message contains a generic opener pattern' : undefined,
    });

    // Rule 2: No hallucinated references
    // Check if message mentions mutual connections that don't exist in verified warm paths
    const verifiedMutuals = warmPaths
      .filter((wp) => wp.type === 'MUTUAL_CONNECTION' && wp.verified)
      .map((wp) => wp.description.toLowerCase());

    const mentionsMutual = /mutual connection|we both know|introduced by|referred by/i.test(message);
    const hasMutualClaim = mentionsMutual && verifiedMutuals.length === 0;
    checks.push({
      rule: 'NO_HALLUCINATED_REFS',
      passed: !hasMutualClaim,
      reason: hasMutualClaim ? 'Message claims a mutual connection but none are verified' : undefined,
    });

    // Rule 3: No fabricated referrals
    const hasFabricatedReferral = /they (?:referred|recommended|suggested) me|asked me to reach out/i.test(message)
      && warmPaths.filter((wp) => wp.verified).length === 0;
    checks.push({
      rule: 'NO_FABRICATED_REFERRALS',
      passed: !hasFabricatedReferral,
      reason: hasFabricatedReferral ? 'Message implies a referral that cannot be verified' : undefined,
    });

    // Rule 4: Human approval always required (always false = always blocked until approved)
    checks.push({
      rule: 'REQUIRE_HUMAN_APPROVAL',
      passed: false,
      reason: 'All outreaches require human review before sending',
    });

    return checks;
  }

  private buildUserPrompt(req: OutreachRequest): string {
    const lines: string[] = [
      `Channel: ${req.channel}`,
      `Sequence step: ${req.sequenceStep} (0=initial, 1+=follow-up)`,
      req.context.contactName ? `Contact name: ${req.context.contactName}` : '',
      req.context.contactRole ? `Contact role: ${req.context.contactRole}` : '',
      req.context.company ? `Company: ${req.context.company}` : '',
      req.context.jobTitle ? `Role I'm pursuing: ${req.context.jobTitle}` : '',
      req.context.candidateStrengths?.length
        ? `My key strengths: ${req.context.candidateStrengths.join(', ')}`
        : '',
      req.context.warmPath
        ? `Warm path (verified=${req.context.warmPath.verified}): ${req.context.warmPath.description}`
        : 'No verified warm path — do NOT invent one',
      req.context.mutualConnections?.length
        ? `Verified mutual connections: ${req.context.mutualConnections.join(', ')}`
        : '',
      req.sequenceStep > 0
        ? `This is a follow-up. Be brief, add new value, reference no response to previous message.`
        : '',
    ].filter(Boolean);

    return lines.join('\n');
  }
}

export const outreachGenerationService = new OutreachGenerationService();

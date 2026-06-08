import { compressPrompt } from '@/lib/agents/prompts/compression';
import { VALID_AGENT_TYPES, getAgentSystemPrompt } from '@/lib/agents/prompts/prompts';

describe('Prompt Compression Utility', () => {
  it('should compress whitespace and trim lines correctly', () => {
    const raw = `
      Hello    world!  
      
      This   is   a    test.  
      
      
      With   newlines.  
    `;
    const expected = 'Hello world!\n\nThis is a test.\n\nWith newlines.';
    expect(compressPrompt(raw)).toBe(expected);
  });

  it('should replace boilerplate and filler words correctly', () => {
    const raw = 'You are a helpful AI assistant. Respond concisely and accurately. Please note that in order to do this task your approach: follow instructions.';
    // "You are a helpful AI assistant. Respond concisely and accurately." -> ""
    // "Please note that" -> ""
    // "in order to" -> "to"
    // "your approach:" -> "approach:"
    const compressed = compressPrompt(raw);
    expect(compressed).toContain('to do this task');
    expect(compressed).toContain('approach: follow instructions');
    expect(compressed).not.toContain('You are a helpful AI assistant');
    expect(compressed).not.toContain('Please note that');
    expect(compressed).not.toContain('in order to');
    expect(compressed).not.toContain('your approach:');
  });

  it('should reduce character counts by at least 15% for all system prompts', () => {
    for (const agentType of VALID_AGENT_TYPES) {
      const rawSystem = getAgentSystemPrompt(agentType);
      const compressedSystem = compressPrompt(rawSystem);
      
      const rawLength = rawSystem.length;
      const compressedLength = compressedSystem.length;
      const reductionPercent = ((rawLength - compressedLength) / rawLength) * 100;
      
      console.log(`[Compression Test] ${agentType}: ${rawLength} -> ${compressedLength} (${reductionPercent.toFixed(1)}% reduction)`);
      
      // The reduction should be at least 15% (we can check >= 12% if some are slightly shorter, but let's assert >= 15%)
      expect(reductionPercent).toBeGreaterThanOrEqual(15);
      
      // Ensure JSON structure patterns and keys remain intact
      const jsonMatches = rawSystem.match(/"[a-zA-Z0-9_]+"/g) || [];
      for (const key of jsonMatches) {
        expect(compressedSystem).toContain(key);
      }
    }
  });
});

import Redis from 'ioredis';
import { Prisma } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';

let originalRedisSendCommand: any = null;
let originalAnthropicCreate: any = null;
let originalPrismaRequest: any = null;

/**
 * Chaos Testing Fault Injector.
 * Provides deterministic controls for injecting network, database, LLM provider, and worker failures.
 */
export class ChaosFaultInjector {
  // Configs
  private static redisLatencyMs: number = 0;
  private static redisDisconnect: boolean = false;

  private static prismaDeadlock: boolean = false;
  private static prismaConnectionExhaustion: boolean = false;

  private static llmTimeoutMs: number = 0;
  private static llmRateLimit: boolean = false;
  private static llmMalformedJson: boolean = false;

  private static workerDuplicateLock: boolean = false;

  /**
   * Initializes monkeypatches/interceptors across dependencies.
   * Call once before running reliability tests.
   */
  public static init() {
    this.patchRedis();
    this.patchLLM();
    this.patchPrisma();
  }

  /**
   * Restores all fault injections to default state (no faults).
   */
  public static restore() {
    this.redisLatencyMs = 0;
    this.redisDisconnect = false;
    this.prismaDeadlock = false;
    this.prismaConnectionExhaustion = false;
    this.llmTimeoutMs = 0;
    this.llmRateLimit = false;
    this.llmMalformedJson = false;
    this.workerDuplicateLock = false;
  }

  // --- REDIS CHAOS ---

  public static enableRedisLatency(delayMs: number) {
    this.redisLatencyMs = delayMs;
  }

  public static disableRedisLatency() {
    this.redisLatencyMs = 0;
  }

  public static enableRedisDisconnect() {
    this.redisDisconnect = true;
  }

  public static disableRedisDisconnect() {
    this.redisDisconnect = false;
  }

  private static patchRedis() {
    if (!originalRedisSendCommand) {
      originalRedisSendCommand = Redis.prototype.sendCommand;
      Redis.prototype.sendCommand = function (command: any, ...args: any[]) {
        if (ChaosFaultInjector.redisDisconnect) {
          return Promise.reject(new Error('Redis connection lost (Chaos Simulation)'));
        }

        if (ChaosFaultInjector.redisLatencyMs > 0) {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              originalRedisSendCommand.call(this, command, ...args)
                .then(resolve)
                .catch(reject);
            }, ChaosFaultInjector.redisLatencyMs);
          });
        }

        return originalRedisSendCommand.call(this, command, ...args);
      };
    }
  }

  // --- PRISMA DB CHAOS ---

  public static enablePrismaDeadlock() {
    this.prismaDeadlock = true;
  }

  public static disablePrismaDeadlock() {
    this.prismaDeadlock = false;
  }

  public static enablePrismaConnectionExhaustion() {
    this.prismaConnectionExhaustion = true;
  }

  public static disablePrismaConnectionExhaustion() {
    this.prismaConnectionExhaustion = false;
  }

  private static patchPrisma() {
    // In Prisma v5, all database query methods pass through PrismaClient.prototype._request
    const prismaProto = require('@prisma/client').PrismaClient.prototype;
    if (prismaProto && !originalPrismaRequest) {
      originalPrismaRequest = prismaProto._request;
      prismaProto._request = function (...args: any[]) {
        if (ChaosFaultInjector.prismaDeadlock) {
          // Simulate standard Postgres deadlock error code P2034
          const deadlockError = new Prisma.PrismaClientKnownRequestError(
            'Transaction failed due to a deadlock (Chaos Simulation)',
            { code: 'P2034', clientVersion: '5.0.0' }
          );
          return Promise.reject(deadlockError);
        }

        if (ChaosFaultInjector.prismaConnectionExhaustion) {
          // Simulate connection pool timeout code P2025 or generic connection error
          const exhaustionError = new Prisma.PrismaClientKnownRequestError(
            'Timed out fetching a connection from the pool (Chaos Simulation)',
            { code: 'P2009', clientVersion: '5.0.0' }
          );
          return Promise.reject(exhaustionError);
        }

        return originalPrismaRequest.apply(this, args);
      };
    }
  }

  // --- LLM PROVIDER CHAOS ---

  public static enableLLMTimeout(timeoutMs: number) {
    this.llmTimeoutMs = timeoutMs;
  }

  public static disableLLMTimeout() {
    this.llmTimeoutMs = 0;
  }

  public static enableLLMRateLimit() {
    this.llmRateLimit = true;
  }

  public static disableLLMRateLimit() {
    this.llmRateLimit = false;
  }

  public static enableLLMMalformedJson() {
    this.llmMalformedJson = true;
  }

  public static disableLLMMalformedJson() {
    this.llmMalformedJson = false;
  }

  private static patchLLM() {
    if (!originalAnthropicCreate) {
      originalAnthropicCreate = Anthropic.prototype.messages.create;
      Anthropic.prototype.messages.create = function (body: any, options: any) {
        if (ChaosFaultInjector.llmTimeoutMs > 0) {
          return new Promise((_, reject) => {
            setTimeout(() => {
              reject(new Error('Anthropic LLM Timeout (Chaos Simulation)'));
            }, ChaosFaultInjector.llmTimeoutMs);
          });
        }

        if (ChaosFaultInjector.llmRateLimit) {
          const err = new Error('Rate limit exceeded (Chaos Simulation)');
          (err as any).status = 429;
          (err as any).statusCode = 429;
          return Promise.reject(err);
        }

        if (ChaosFaultInjector.llmMalformedJson) {
          return Promise.resolve({
            id: 'mock-msg',
            type: 'message',
            role: 'assistant',
            content: [{ type: 'text', text: '{"malformed_json": [invalid_array_close ' }],
            model: 'claude-3-5-sonnet-20241022',
            stop_reason: 'end_turn',
            usage: { input_tokens: 15, output_tokens: 15 },
          } as any);
        }

        return originalAnthropicCreate.call(this, body, options);
      };
    }
  }

  // --- WORKER CHAOS ---

  public static enableWorkerDuplicateLock() {
    this.workerDuplicateLock = true;
  }

  public static disableWorkerDuplicateLock() {
    this.workerDuplicateLock = false;
  }

  public static isWorkerDuplicateLockEnabled(): boolean {
    return this.workerDuplicateLock;
  }
}

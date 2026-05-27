/**
 * Runtime process health metrics.
 *
 * Exposes:
 *  - V8 heap / RSS memory
 *  - Event loop lag (sampled via setImmediate delta)
 *  - Uptime
 *  - Redis reconnect counter (incremented by the Redis client)
 *  - Node.js version
 */

// ── Event loop lag sampler ──────────────────────────────────────────────────

let _lagMs = 0;
let _lagSampleCount = 0;

function sampleEventLoopLag() {
  const before = Date.now();
  setImmediate(() => {
    _lagMs = Date.now() - before;
    _lagSampleCount += 1;
  });
}

/** Start sampling event loop lag every 5 s (no-op if already started) */
let _samplerStarted = false;
export function startEventLoopSampler() {
  if (_samplerStarted) return;
  _samplerStarted = true;
  const interval = setInterval(sampleEventLoopLag, 5_000);
  // Allow the Node process to exit without waiting for this timer
  if (interval.unref) interval.unref();
  sampleEventLoopLag(); // sample immediately
}

// ── Redis reconnect tracking ────────────────────────────────────────────────

let _redisReconnects = 0;

export function recordRedisReconnect() {
  _redisReconnects += 1;
}

// ── Snapshot ────────────────────────────────────────────────────────────────

export interface RuntimeSnapshot {
  uptimeSeconds:     number;
  eventLoopLagMs:    number;
  lagSampleCount:    number;
  redisReconnects:   number;
  nodeVersion:       string;
  memory: {
    heapUsedMb:   number;
    heapTotalMb:  number;
    rssMb:        number;
    externalMb:   number;
  };
  snapshotAt: string;
}

export function getRuntimeSnapshot(): RuntimeSnapshot {
  const mem = process.memoryUsage();
  const toMb = (bytes: number) => Number((bytes / 1024 / 1024).toFixed(2));

  return {
    uptimeSeconds:   Math.floor(process.uptime()),
    eventLoopLagMs:  _lagMs,
    lagSampleCount:  _lagSampleCount,
    redisReconnects: _redisReconnects,
    nodeVersion:     process.version,
    memory: {
      heapUsedMb:  toMb(mem.heapUsed),
      heapTotalMb: toMb(mem.heapTotal),
      rssMb:       toMb(mem.rss),
      externalMb:  toMb(mem.external),
    },
    snapshotAt: new Date().toISOString(),
  };
}

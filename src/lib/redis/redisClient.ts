import Redis from 'ioredis';

// Single Redis instance (connection pooling handled by ioredis)
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null, // Required for blocking operations
  enableReadyCheck: false,
  db: parseInt(process.env.REDIS_DB || '0'),
});

redis.on('error', (err) => {
  console.error('Redis Client Error', err);
});

redis.on('connect', () => {
  console.log('Redis Client Connected');
});

export { redis };
export type RedisClient = typeof redis;

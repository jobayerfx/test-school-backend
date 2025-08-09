// config/redis.ts
import { RedisOptions } from 'ioredis';
import { QueueEvents, Worker, Queue } from 'bullmq';
import IORedis from 'ioredis';

const redisConfig: RedisOptions = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // Required for BullMQ to work with Redis 6+
  enableReadyCheck: false,
};

export const redisConnection = new IORedis(redisConfig);

// Utility to create a BullMQ queue
export const createQueue = (name: string) => {
  return new Queue(name, {
    connection: redisConnection,
  });
};

// Utility to create a BullMQ worker
export const createWorker = <T>(
  name: string,
  processor: (job: any) => Promise<T>
) => {
  return new Worker(name, processor, {
    connection: redisConnection,
  });
};

// Utility to create queue events listener
export const createQueueEvents = (name: string) => {
  return new QueueEvents(name, {
    connection: redisConnection,
  });
};

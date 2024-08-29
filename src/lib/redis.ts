import { Redis } from "@upstash/redis";

export const getRedisClient = (): Redis => {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  return redis;
};

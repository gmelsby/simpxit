import { createClient } from 'redis';
import { logger } from '../app.js';

const redisClient = await createClient({
  url: process.env.REDIS_URL,
})
  .on('error', err => logger.error('Redis Client Error', err))
  .connect();

export default redisClient;
import { createClient } from 'redis';
import { logger } from '../app.js';

const client = await createClient({
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD
})
  .on('error', err => logger.error('Redis Client Error', err))
  .connect();

export async function setKey() {
  await client.set('key', 'value');
  const result = await client.get('key');
  console.log(result);
}
import { CoinbasePro } from 'coinbase-pro-node';
import * as Redis from 'ioredis';

/**
 * Coinbase Production client
 */
export function CoinbaseClient(): CoinbasePro {
  return new CoinbasePro({
    apiKey: process.env.COINBASE_PRO_API_KEY || "",
    apiSecret: process.env.COINBASE_PRO_API_SECRET || "",
    passphrase: process.env.COINBASE_PRO_PASSPHRASE || "",
    useSandbox: false,
  });
}

/**
 * Redis client
 */
export function RedisClient(): Redis.Redis {
  return new Redis(process.env.REDIS_URL);
}

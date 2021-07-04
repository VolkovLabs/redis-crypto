/**
 * Currency
 */
export const DefaultCurrency = process.env.COINBASE_PRO_CURRENCY || "USD";

/**
 * Stream Length
 */
export const StreamLength = process.env.REDIS_STREAM_LEN || 5000;

/**
 * Balance Timeout
 */
export const BalanceTimeout = process.env.BALANCE_TIMEOUT || 30000;

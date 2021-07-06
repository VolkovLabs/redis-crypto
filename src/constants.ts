/**
 * Currency
 */
export const DefaultCurrency = process.env.COINBASE_CURRENCY || "USD";

/**
 * Currency
 */
export const DefaultTickers = process.env.COINBASE_TICKERS?.split(",") || [
  "BTC",
  "ETH",
];

/**
 * Stream Length
 */
export const StreamLength = process.env.REDIS_STREAM_LEN || 5000;

/**
 * Balance Timeout
 */
export const BalanceTimeout = process.env.BALANCE_TIMEOUT || 30000;

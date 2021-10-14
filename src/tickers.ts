import { WebSocketChannelName, WebSocketEvent } from 'coinbase-pro-node';
import { CoinbaseClient, RedisClient } from './clients';
import { DefaultTickers, StreamLength } from './constants';

/**
 * Coinbase client
 */
const client = CoinbaseClient();

/**
 * Redis client
 */
const redis = RedisClient();

/**
 * Main
 */
async function main(): Promise<void> {
  /**
   * Get Tickers Set
   */
  let tickers = await redis
    .smembers("tickers")
    .catch((err) => console.log(err));

  if (!tickers || !tickers.length) {
    tickers = DefaultTickers;
    await redis
      .sadd("tickers", DefaultTickers)
      .catch((err) => console.log(err));
    console.log("Tickers from configuration file added");
  }

  /**
   * Channel
   */
  const channel = {
    name: WebSocketChannelName.TICKER,
    product_ids: tickers,
  };

  /**
   * Subscribe on Open
   */
  client.ws.on(WebSocketEvent.ON_OPEN, () => {
    console.log("Web sockets opened", channel);
    client.ws.subscribe([channel]);
  });

  /**
   * Disconnect if no more subscriptions on WS subscription updates
   */
  client.ws.on(WebSocketEvent.ON_SUBSCRIPTION_UPDATE, (subscriptions) => {
    if (subscriptions.channels.length === 0) {
      client.ws.disconnect();
    }
  });

  /**
   * Updates
   */
  client.ws.on(WebSocketEvent.ON_MESSAGE_TICKER, async (ticker: any) => {
    const fields: string[] = [];
    Object.keys(ticker).forEach((key) => {
      fields.push(key, ticker[key]);
    });

    /**
     * Add to Stream
     */
    await redis
      .xadd(
        `ticker:${ticker.product_id}`,
        "MAXLEN",
        "~",
        Number(StreamLength),
        "*",
        fields
      )
      .catch((err) => console.log(err));
  });

  /**
   * Connect
   */
  client.ws.connect();
}

/**
 * Main
 */
main().catch(console.error);

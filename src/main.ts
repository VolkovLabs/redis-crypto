import { WebSocketChannelName, WebSocketEvent } from 'coinbase-pro-node';
import { CoinbaseClient, RedisClient } from './clients';
import { BalanceTimeout, DefaultCurrency, DefaultTickers, StreamLength } from './constants';

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
    console.log("Tickers not found in the database and was added");
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

  /**
   * Balance
   */
  balance().catch(console.error);
}

/**
 * Balance
 */
async function balance(): Promise<void> {
  /**
   * List Accounts
   */
  let accounts = await client.rest.account.listAccounts();
  if (!accounts.length) {
    setTimeout(balance, Number(BalanceTimeout));
    return console.log("Accounts not found");
  }

  /**
   * Filter only positive balances
   */
  accounts = accounts.filter((account) => Number(account.balance));

  let total = 0;
  let balances: { [id: string]: string } = {};

  await Promise.all(
    accounts.map(async (account) => {
      let balance = Number(account.balance);
      const cur = `${account.currency}-${DefaultCurrency}`;

      /**
       * Get ticker value using API
       */
      if (account.currency !== DefaultCurrency) {
        const ticker = await client.rest.product.getProductTicker(cur);
        balance *= Number(ticker.price);
      }

      await redis
        .send_command(
          "TS.ADD",
          `balance:${cur}`,
          "*",
          balance,
          "LABELS",
          "currency",
          cur,
          "type",
          "balance"
        )
        .catch((err) => console.log(err));

      total += balance;
      balances[cur] = String(balance);
    })
  );

  /**
   * Total
   */
  await redis
    .send_command(
      "TS.ADD",
      `balance:TOTAL`,
      "*",
      total,
      "LABELS",
      "type",
      "total"
    )
    .catch((err) => console.log(err));

  /**
   * Balances
   */
  await redis
    .multi()
    .del("balances")
    .hset("balances", balances)
    .exec()
    .catch((err) => console.log(err));

  /**
   * Timeout
   */
  setTimeout(balance, Number(BalanceTimeout));
}

/**
 * Main
 */
main().catch(console.error);

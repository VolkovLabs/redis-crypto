import { CoinbaseClient, RedisClient } from './clients';
import { BalanceTimeout, DefaultCurrency } from './constants';

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
   * List Accounts
   */
  let accounts = await client.rest.account.listAccounts();
  if (!accounts.length) {
    setTimeout(main, Number(BalanceTimeout));
    return console.log("Accounts not found");
  }

  /**
   * Filter only positive balances
   */
  accounts = accounts.filter((account) => Number(account.balance));

  let total = 0;
  let available = 0;
  let hold = 0;
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
      } else {
        hold += Number(account.hold);
        available += Number(account.available);
      }

      await redis
        .send_command(
          "TS.ADD",
          `coinbase:${cur}`,
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
      `coinbase:TOTAL`,
      "*",
      total,
      "LABELS",
      "type",
      "total"
    )
    .catch((err) => console.log(err));

  await redis
    .send_command(
      "TS.ADD",
      `coinbase:AVAILABLE`,
      "*",
      available,
      "LABELS",
      "type",
      "available"
    )
    .catch((err) => console.log(err));

  await redis
    .send_command(
      "TS.ADD",
      `coinbase:HOLD`,
      "*",
      hold,
      "LABELS",
      "type",
      "hold"
    )
    .catch((err) => console.log(err));

  /**
   * Balances
   */
  await redis
    .multi()
    .del("coinbase")
    .hset("coinbase", balances)
    .exec()
    .catch((err) => console.log(err));

  /**
   * Timeout
   */
  setTimeout(main, Number(BalanceTimeout));
}

/**
 * Main
 */
main().catch(console.error);

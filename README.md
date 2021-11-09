# Analyzing cryptocurrency historical data using Redis, Prophet and Grafana

![Coinbase](https://raw.githubusercontent.com/volkovlabs/redis-crypto/main/images/home.png)

[![Grafana 8](https://img.shields.io/badge/Grafana-8-orange)](https://www.grafana.com)
[![Redis Data Source](https://img.shields.io/badge/dynamic/json?color=blue&label=Redis%20Data%20Source&query=%24.version&url=https%3A%2F%2Fgrafana.com%2Fapi%2Fplugins%2Fredis-datasource)](https://grafana.com/grafana/plugins/redis-datasource)
[![Redis Application plugin](https://img.shields.io/badge/dynamic/json?color=blue&label=Redis%20Application%20plug-in&query=%24.version&url=https%3A%2F%2Fgrafana.com%2Fapi%2Fplugins%2Fredis-app)](https://grafana.com/grafana/plugins/redis-app)
[![Docker](https://github.com/volkovlabs/redis-crypto/actions/workflows/docker.yml/badge.svg)](https://github.com/volkovlabs/redis-crypto/actions/workflows/docker.yml)

## Introduction

This project demonstrates how to analyze cryptocurrency data stored as [RedisTimeSeries](https://oss.redislabs.com/redistimeseries/) using serverless engine [RedisGears](https://oss.redislabs.com/redisgears/) and [Redis Data Source](https://github.com/RedisGrafana/grafana-redis-datasource) to visualize time series and data in Grafana.

![Redis-Crypto](https://raw.githubusercontent.com/volkovlabs/redis-crypto/main/images/redis-crypto.png)

Read the full store on Volkov Labs blog soon.

## Demo

Demo is available on [crypto.volkovlabs.io](https://crypto.volkovlabs.io):

- [Home dashboard](https://crypto.volkovlabs.io)
- [Tickers dashboard](https://crypto.volkovlabs.io/d/3Bd882z7z/tickers)

## Requirements

- [Docker](https://docker.com) to start Redis and Grafana.

## Configure and start application

To start application please provide Coinbase API credentials and URL for Redis instance in file `coinbase.env`. File `coinbase.env.example` can be used as example.

```bash
## Coinbase API
COINBASE_PRO_API_KEY=f2XXXXXXXXXXXXXXXXXXXX47
COINBASE_PRO_API_SECRET=ecXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX==
COINBASE_PRO_PASSPHRASE=XXXXXXXXXXX
COINBASE_PRO_SANDBOX=false

## Coinbase Tickers
COINBASE_CURRENCY=USD
COINBASE_TICKERS=BTC-USD,ETH-USD,ADA-USD,DOGE-USD,SOL-USD

## Redis URL
REDIS_URL=redis://host.docker.internal:6379
REDIS_STREAM_LEN=5000

## Balance
BALANCE_TIMEOUT=30000
```

## Start Grafana

Grafana can be started using Docker Compose or installed locally with [Redis plugins for Grafana](https://redisgrafana.github.io).

```bash
docker-compose pull
docker-compose up
```

When starting using Docker Compose, dashboard and plugins will be auto-provisioned and available in Grafana.

## Start Redis with RedisTimeSeries, RedisGears modules

This project is using Docker image with Redis, RedisTimeSeries, RedisGears and installed Prophet libraries.

```bash
docker run -p 6379:6379 --name=redis-prophet ghcr.io/redisgrafana/redis-prophet:latest
```

This container can be started using Docker Compose with Grafana or Redis Enterprise cluster can be used instead.

## Start Coinbase application on Linux with Redis and Grafana pre-installed

```yaml
version: "3.4"

services:
  crypto:
    container_name: crypto
    image: ghcr.io/volkovlabs/crypto-app:latest
    network_mode: host
    env_file:
      - ./coinbase.env
```

## Learn more

- Redis plugins for Grafana [Documentation](https://redisgrafana.github.io/)

## Contributing

- Fork the repository.
- Find an issue to work on and submit a pull request.
- Could not find an issue? Look for documentation, bugs, typos, and missing features.

## License

- Apache License Version 2.0, see [LICENSE](https://github.com/volkovlabs/redis-crypto/blob/main/LICENSE).

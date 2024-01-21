---
title: Building with Aave market data
description: Learn how to build widgets that use Aave markets data with ghooey and Alpine
---

Aave markets data (assets reserves, incentives, etc) are stored in the Alpine global store `aaveMarkets`.

## How to use it

- Prerequisite: in the markup, add `x-data` to give the DOM node + its descendants access to this global store
- in your markup, use `$store.aaveMarkets.<property name>` to access any value defined in the store

## `$store.aaveMarkets` Store Structure

### 1.`$store.aaveMarkets.fetchStatus`

- **Type:** `string`
- **Description:** Represents the status of the Aave markets query.
- **Possible Values:** `"idle"`, `"pending"`, `"success"`, `"refreshing"`
- **Defaults to:** `"idle"`

### 2. `$store.aaveMarkets.markets`

- **Type:** `Array`
- **Description:** Contains detailed markets data.
- **Defaults to:** `undefined`
- **Value Set by:** `fetchMarketsData` function.

## Store Methods

### `$store.aaveMarkets.fetchMarketsData`

- **Type:** `Promise<void>`
- **Description:** Initiates a query to retrieve Aave markets data. Refer to [Aave Utilities documentation](https://github.com/aave/aave-utilities#markets-data) for detailed description.
- **Automatic Execution:** Initialized during store initialization and triggered whenever a `Supply`, `Borrow`, `Repay`, or `Withdraw` event occurs.

### `$store.aaveMarkets.watchContractsEvents`

- **Type:** `Promise<void>`
- **Description:** Actively listens to `Supply`, `Borrow`, `Repay`, and `Withdraw` events.
- **Automatic Execution:** Initialized during store initialization.
- **Functionality:** Calls `fetchMarketsData` in response to these events and dispatches custom events on the `window` object.

---

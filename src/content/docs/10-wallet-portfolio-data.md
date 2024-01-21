---
title: Get any Ethereum address's Aave portfolio data
description: Learn how to build widgets that display and use the Aave portfolio data of any Ethereum address with ghooey and Alpine
---

The `walletAavePortfolio` data slice provides a re-usable Alpine.js data slice for fetching both Aave market data and a given wallet address's portfolio on Aave.

## Data Slice Structure

### `fetchStatus`

- _Type:_ String
- _Description:_ Represents the status of the bundled read request. Can be `'idle'`, `'pending'`, or `'success'`. Defaults to `'idle'`.

### `summary`

- _Type:_ ExtendedUserSummary | Undefined
- _Description:_ Wallet address portfolio summary + Aave market data summary. Defaults to `undefined` and is updated by the `getSummary()` method.

### `address`

- _Type:_ String | Undefined
- _Description:_ Ethereum address to get the summary of. Defaults to `undefined`. Set or update it in the markup with `x-bind`, `x-init`, or `x-data`.

## Methods

The `walletAavePortfolio` data slice provides the following method:

### `getSummary(): Promise<void>`

This method fetches market data + Aave portfolio for a given Ethereum address.

#### Usage:

Put `x-data='walletAavePortfolio'` to give the DOM node + its descendants access to this data slice.

#### Parameters:

- _None_

## Example

The snippet below showcases a simple implementation of a widget that displays the Aave portfolio of a given Ethereum address.

```html
<div
  x-data="walletAavePortfolio"
  x-init="address = '0xE665CEf14cB016b37014D0BDEAB4A693c3F46Cc0'"
  x-effect="getSummary()"
>
  <template x-if="fetchStatus === 'pending' ">
    <span x-text="'Loading ' + address + ' summary...'"></span>
  </template>
  <template x-if="fetchStatus === 'success' ">
    <article x-data="{ profile: address }">
      <span x-text="'Summary for ' + profile"></span>
      <section>
        <h1>Net worth (in USD)</h1>
        <p x-text="$formatNumber(summary.netWorthUSD, { style: 'currency', currency: 'USD', })"></p>
      </section>
      <section>
        <h1>Total collateral value (in USD)</h1>
        <p x-text="$formatNumber(summary.totalCollateralUSD, { style: 'currency', currency: 'USD'})"></p>
      </section>
      <section>
        <h1>Total amount available to borrow (in USD)</h1>
        <p x-text="$formatNumber(summary.availableBorrowsUSD, { style: 'currency', currency: 'USD'})"></p>
      </section>
      <section>
        <h1>Current health factor</h1>
        <p x-text="$formatNumber(summary.healthFactor)"></p>
      </section>

      <section>
        <h1>Collateral usage</h1>
        <p x-text="$formatNumber(summary.collateralUsage, { style: 'percent' })"></p>
      </section>
      <section>
        <h1>Supplying</h1>
        <ul x-data="{ positions: summary.userReservesData.filter(data => parseFloat(data.underlyingBalanceUSD) > 0) }">
          <template x-for="position in positions">
            <li>
              <span x-text="$formatERC20Balance(position.underlyingBalance, position.reserve.symbol)"></span>
            </li>
            <span
              x-text="'(' + $formatNumber(position.underlyingBalanceUSD, { style: 'currency', currency: 'USD' }) +')'"
            ></span>
          </template>
        </ul>
      </section>
    </article>
  </template>
</div>
```

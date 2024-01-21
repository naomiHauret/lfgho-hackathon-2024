---
title: Withdraw from a supply pool
description: Learn how to build widgets that lets users withdraw their assets from an Aave supply pool with ghooey and Alpine
---

The `aaveWithdrawAsset` data slice provides a re-usable Alpine.js data slice for enabling the current user to withdraw their asset from the Aave pool via the `withdraw()` contract method.

## Data Slice Structure

### `status`

- _Type:_ String
- _Description:_ Represents the status of the contract write request. Can be `'idle'`, `'signaturePending'`, `'transactionPending'`, `'transactionSuccessful'`, or `'error'`. Defaults to `'idle'`.

### `amount`

- _Type:_ Number
- _Description:_ Amount of the asset to withdraw from the pool. Defaults to `0`. Set or update it in the markup with `x-bind`, `x-init`, or `x-data`.

### `token`

- _Type:_ Object or Undefined
- _Description:_ Reserve asset information the user wishes to withdraw. Defaults to `undefined`. Set or update it in the markup with `x-bind`, `x-init`, or `x-data`.

### `txsHashes`

- _Type:_ Any
- _Description:_ Hash(es) of the transactions. Defaults to `undefined` and is defined within the `withdrawAsset` function.

## Methods

The `aaveWithdrawAsset` data slice provides the following method:

### `withdrawAsset(): Promise<void>`

This method allows the current user to withdraw their underlying asset from an Aave V3 pool via the `withdraw()` contract method.

#### Parameters:

- `args.amount` - (Optional) Amount of reserve asset to withdraw.
- `args.reserve` - (Optional) Token the user wishes to withdraw from the supply pool.

---

## Example

The snippet below showcases a simple implementation of a widget that allows the user to withdraw their DAI for the supply pool.

```html
<section
  x-data="aaveWithdrawAsset"
  x-init="`"
  market="DAI"
  ;
  token="$aaveAssetBySymbol(market);"
  amount="1;"
  userAssetData="$store.currentUser?.aavePortfolio?.summary.userReservesData.filter(reserve"
  =""
>
  token.UNDERLYING.toLowerCase() === reserve.underlyingAsset.toLowerCase())[0]; ` >
  <form @submit.prevent="withdrawAsset()">
    <div>
      <label for="withdraw">Amount to withdraw</label>
      <input x-model.number="amount" min="0.000001" id="withdraw" type="number" placeholder="1.00" step="0.000001" />
      <button>Withdraw</button>
    </div>
    <span x-text="status"></span>
  </form>
</section>
```

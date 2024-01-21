---
title: Borrowing liquidity from a pool
description: Learn how to build widgets that lets users borrow liquidity from Aave pools  with ghooey and Alpine
---

The `aaveBorrowReserveAsset` data slice provides a re-usable Alpine.js data slice for enabling the current user to borrow a reserve asset from an Aave V3 pool using the `borrow()` contract method.

## Data Slice Structure

### `status`

- _Type:_ String
- _Description:_ Represents the status of the contract write request. Can be `'idle'`, `'signaturePending'`, `'transactionPending'`, `'transactionSuccessful'`, or `'error'`. Defaults to `'idle'`.

### `amount`

- _Type:_ Number
- _Description:_ Amount of reserve asset to borrow from the pool. Defaults to `0`. Set or update it in the markup with `x-bind`, `x-init`, or `x-data`.

### `interestRateMode`

- _Type:_ Enum (`InterestRate`)
- _Description:_ Interest rate mode. Defaults to `InterestRateMode.None`.

### `token`

- _Type:_ Object or Undefined
- _Description:_ Reserve asset information the user wishes to borrow. Defaults to `undefined`. Set or update it in the markup with `x-bind`, `x-init`, or `x-data`.

### `txsHashes`

- _Type:_ Any
- _Description:_ Hash(es) of the transactions. Defaults to `undefined` and is defined within the `borrowReserveAsset` function.

## Methods

The `aaveBorrowReserveAsset` data slice provides the following method:

- `borrow(): Promise<void>`
  - This method allows the current user to borrow assets from an Aave V3 pool using the `borrow()` contract method. The user must have a collateralized position (hold a positive balance of aToken in their wallet) for the method to succeed.
  - **Parameters:**
    - `amount`: (Optional) Amount of reserve asset to borrow.
    - `reserve`: (Optional) Object with properties `{ UNDERLYING: string, decimals: number }` representing the reserve from which the user wishes to borrow.
  - **Returns:** A Promise that resolves when the transaction is successful and rejects on error.

## Additional Information

- The user must have a collateralized position (hold a positive balance of aToken in their wallet) for the `borrow()` method to succeed.
- [Aave Utilities Documentation on Borrow](https://github.com/aave/aave-utilities/tree/master#borrow)

---

## Example

The snippet below showcases a simple implementation of a widget that allows the user to borrow GHO against their collateral.

```html
<section
  x-data="aaveBorrowReserveAsset"
  x-init="`"
  market="GHO"
  ;
  token="$aaveAssetBySymbol(market);"
  interestRateMode="Variable"
  ;
  amount="1;"
  userAssetData="$store.currentUser?.aavePortfolio?.summary.userReservesData.filter(reserve"
  =""
>
  token.UNDERLYING.toLowerCase() === reserve.underlyingAsset.toLowerCase())[0]; maxBorrowableAmount =
  parseFloat(userAssetData.reserve.maxGhoMintAmount) < parseFloat(userAssetData.reserve.formattedAvailableLiquidity) ?
  parseFloat(userAssetData.reserve.maxGhoMintAmount): parseFloat(userAssetData.reserve.formattedAvailableLiquidity) ` >
  <form @submit.prevent="borrow()">
    <div>
      <label for="borrow">Amount to borrow</label>
      <input
        x-model.number="amount"
        min="0.000001"
        id="borrow"
        type="number"
        placeholder="1.00"
        max="maxBorrowableAmount"
        step="0.000001"
      />
      <span x-text="'You can borrow up to ' +  $formatERC20Balance(maxBorrowableAmount, 'GHO')"> </span>
      <button>Borrow</button>
    </div>
    <span x-text="status"></span>
  </form>
</section>
```

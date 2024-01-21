---
title: Repaying debt
description: Learn how to build widgets that lets repay Aave loans with ghooey and Alpine
---

The `aaveRepayDebt` data slice provides a re-usable Alpine.js data slice for enabling the current user to repay their debt via either the `repayWithPermit()` or `repayWithATokens()` contract methods.

## Data Slice Structure

### `status`

- _Type:_ String
- _Description:_ Represents the status of the contract write request. Can be `'idle'`, `'signaturePending'`, `'transactionPending'`, `'transactionSuccessful'`, or `'error'`. Defaults to `'idle'`.

### `amount`

- _Type:_ Number
- _Description:_ Amount spent on repaying the debt. Defaults to `0`. Set or update it in the markup with `x-bind`, `x-init`, or `x-data`.

### `interestRateMode`

- _Type:_ Enumeration (InterestRate)
- _Description:_ Borrow rate mode. Defaults to variable. Set in the markup.

### `token`

- _Type:_ Object or Undefined
- _Description:_ Reserve asset information the user wishes to borrow. Defaults to `undefined`. Set or update it in the markup with `x-bind`, `x-init`, or `x-data`.

### `txsHashes`

- _Type:_ Any
- _Description:_ Hash(es) of the transactions. Defaults to `undefined` and is defined within the `repayDebt` function.

## Methods

The `aaveRepayDebt` data slice provides the following methods:

### `repayDebt(args: { onBehalfOfAddress?: string }): Promise<void>`

This method allows the current user to repay their debt via the `repayWithPermit()` contract method. The user must have a collateralized position (hold a positive balance of aToken in their wallet), or the method will fail.

#### Parameters:

- `args.amount` - (Optional) Amount of tokens used to repay the debt.
- `args.reserve` - (Optional) Reserve from which the user wishes to borrow.

### `repayDebtWithAToken(): Promise<void>`

This method allows the current user to repay their debt via the `repayWithATokens()` contract method.

---

## Example

The snippet below showcases a simple implementation of a widget that allows the user to repay their GHO against debt using their GHO balance.

```html
<template x-if="$store.currentUser.account && $store.currentUser.aavePortfolio.summary">
  <section
    x-data="aaveRepayDebt"
    x-init=`
      token = $aaveAssetBySymbol('GHO');
      amount = 0;
      userAssetData = $store.currentUser?.aavePortfolio?.summary.userReservesData.filter(reserve =>  token.UNDERLYING.toLowerCase() === reserve.underlyingAsset.toLowerCase())[0];
      interestRateMode = userAssetData?.reserve?.borrowRateMode;
    `
  >
    <form @submit.prevent="repayDebt()">
      <div>
        <label for="repayWithAmount">Repay this amount using my balance:</label>
        <input
          x-model.number="amount"
          min="0.000001"
          id="repayWithAmount"
          type="number"
          placeholder="1.00"
          step="0.000001"
        />
      </div>
      <button>Repay</button>
    </form>
    <span x-text="status"></span>
  </section>
</template>
```

---
title: Lending assets on Aave pools
description: Learn how to build widgets that lets users supply liquidity to Aave pools with minimum gas-fees with ghooey and Alpine
---

The `aaveSupply` data slice provides a re-usable Alpine.js data slice for enabling the current user to supply an ERC20 token ([ERC-2612 compatible](https://eips.ethereum.org/EIPS/eip-2612)) to an Aave V3 pool using the `supplyWithPermit()` contract method.

## Data Slice Structure

### `status`

- _Type:_ String
- _Description:_ Represents the status of the contract write request. Can be `'idle'`, `'signaturePending'`, `'transactionPending'`, `'transactionSuccessful'`, or `'error'`. Defaults to `'idle'`.

### `amount`

- _Type:_ Number
- _Description:_ Amount of ERC20 tokens to supply to the pool. Defaults to `0`. Set or update it in the markup with `x-bind`, `x-init`, or `x-data`.

### `token`

- _Type:_ Object or Undefined
- _Description:_ ERC20 token information to supply to the pool. Defaults to `undefined`. Set or update it in the markup with `x-bind`, `x-init`, or `x-data`.

### `txsHashes`

- _Type:_ Any
- _Description:_ Hash(es) of the transactions. Defaults to `undefined` and is defined within the `supplyTokens` function.

### Methods

The `aaveSupply` data slice provides the following method:

- `supplyTokens(args: { onBehalfOfAddress?: string }): Promise<void>`
  - This method allows users to supply ERC20 tokens to an Aave V3 pool using the `supplyWithPermit()` contract method. It handles the entire process, including signature generation, transaction execution, and transaction confirmation.
  - Parameters:
    - `onBehalfOfAddress`: (Optional) Allows the user to supply an asset on behalf of another wallet.
  - Returns: A Promise that resolves when the transaction is successful and rejects on error.

### Usage

To use the `aaveSupply` data slice, add `x-data='aaveSupply'` to the DOM node and its descendants. Use `@click="supplyTokens()"` to trigger the `supplyTokens` method.

For detailed implementation and usage, refer to the [Alpine.js documentation on data](https://alpinejs.dev/directives/data) and [Alpine.js documentation on global data](https://alpinejs.dev/globals/alpine-data).

### Additional Information

- The ERC20 token supplied must be ERC-2612 compatible and cannot be GHO (GHO cannot be supplied for now).
- [Aave Utilities Documentation on Supply with Permit](https://github.com/aave/aave-utilities/tree/master#supply-with-permit)
- [Aave Interface Permit Configuration](https://github.com/aave/interface/blob/main/src/ui-config/permitConfig.ts)

## Example

The snippet below showcases a simple implementation of a widget that allows the user to supply their DAI.

```html
<section x-data="aaveSupply" x-init="token = $aaveAssetBySymbol('DAI'); amount = 0;">
  <form @submit.prevent="supplyToken()">
    <div>
      <label for="supplyAmount">Supply</label>
      <input
        x-model.number="amount"
        min="0.000001"
        id="supplyAmount"
        type="number"
        placeholder="1.00"
        step="0.000001"
      />
    </div>
    <button>Lend</button>
  </form>
  <span x-text="status"></span>
</section>
```

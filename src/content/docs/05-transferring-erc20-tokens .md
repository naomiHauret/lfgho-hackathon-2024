---
title: Transferring ERC-20 tokens like GHO
description: Learn how to build widgets that lets users transfer their ERC-20 tokens with minimum gas-fees with ghooey and Alpine
---

The `erc20Transfer` data slice provides a re-usable Alpine.js data slice to facilitate the transfer of ERC20 tokens from the current user's wallet to another Ethereum address. Developers can use this data slice by adding `x-data='erc20Transfer'` to the DOM node and its descendants.

## Data Slice Structure

The `erc20Transfer` data slice provides the following properties:

### `status`

- **Type:** String
- **Description:** Represents the status of the contract write request. Can be `'idle'`, `'signaturePending'`, `'transactionPending'`, `'transactionSuccessful'`, or `'error'`. Defaults to `'idle'`.

### `txHash`

- **Type:** Any
- **Description:** Hash of the transaction. Defaults to `undefined` and is defined within the `transferTokens` function.

### `token`

- **Type:** Object or Undefined
- **Description:** ERC20 token information to transfer. Defaults to `undefined`. Set or update it in the markup with `x-bind`, `x-init`, or `x-data`.

### `amount`

- **Type:** Number
- **Description:** Amount of ERC20 tokens to transfer. Defaults to `0`. Set or update it in the markup with `x-bind`, `x-init`, or `x-data`.

### `recipientAddress`

- **Type:** Undefined or String
- **Description:** Ethereum address to which ERC20 tokens must be sent. Defaults to `undefined`. Set or update it in the markup with `x-bind`, `x-init`, or `x-data`.

## Methods

The `erc20Transfer` data slice provides the following method:

`transferTokens(args: { token?: { UNDERLYING: string; decimals: number }; amount?: number; recipientAddress: string }): Promise<void>`

This method allows users to send ERC20 tokens to another Ethereum address using the ERC20 `transfer()` method. It handles the entire process, including signature generation and transaction execution.

#### Parameters:

- `token`: (Optional) ERC20 token information, including `UNDERLYING` address and `decimals`.
- `amount`: (Optional) Amount of ERC20 tokens to transfer.
- `recipientAddress`: Ethereum address to receive the ERC20 tokens.

#### Returns:

- A Promise that resolves when the transaction is successful and rejects on error.

## Usage

To use the `erc20Transfer` data slice, add `x-data='erc20Transfer'` to the DOM node and its descendants. Use `@click="transferTokens()"` to trigger the transferTokens method.

---

## Example

The snippet below showcases a simple implementation of a "Pay" button.

```html
<section x-data="{...erc20Transfer(), token: $aaveAssetBySymbol('GHO') }">
  <button
    x-text="status === 'signaturePending' ? 'Sign transfer to continue' : status === 'transactionPending' ? 'Transferring...' : 'Pay ' + $formatERC20Balance(amount, 'GHO')"
    x-data="{ amount: 0.5, sendTo: '0xe90406d09418C4EdBD7735c62F9FED7294954905'}"
    :aria-disabled="['signaturePending','transactionPending'].includes(status) || $store.currentUser.assets.fetchStatus === 'pending' || parseFloat($store.currentUser.assets?.balances?.GHO?.formatted ?? 0) <= 0 ? true : false"
    class="aria-[disabled='true']:opacity-50 aria-[disabled='true']:pointer-events-none"
    @click="transferTokens({ token, amount, recipientAddress: sendTo})"
  ></button>
  <template x-if="$store.currentUser.assets?.balances?.GHO?.formatted">
    <p
      :class="$store.currentUser.assets?.balances?.GHO?.fetchStatus === 'refreshing' && 'animate-pulse'"
      x-text="'Balance: ' + $formatERC20Balance($store.currentUser.assets?.balances?.GHO?.formatted, 'GHO')"
    ></p>
  </template>
  <template
    x-if="['pending', 'refreshing'].includes($store.currentUser.assets?.fetchStatus) || ($store.currentUser.assets?.balances?.GHO?.fetchStatus === 'pending' && !store.currentUser.assets?.balances?.GHO?.formatted)"
  >
    <p x-text="'Fetching GHO balance...'"></p>
  </template>
</section>
```

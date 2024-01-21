---
title: Get the balance of a specific ERC-20 token for a specific Ethereum address
description: Learn how to build widgets that display and use the ERC-20 balance data of any Ethereum address with ghooey and Alpine
---

The `erc20BalanceOf` data slice provides a re-usable Alpine.js data slice for fetching the balance of a specific ERC20 token for a given Ethereum address.

## Data Slice Structure

### `fetchStatus`

- _Type:_ String
- _Description:_ Represents the status of the read request. Can be `'idle'`, `'pending'`, or `'success'`. Defaults to `'idle'`.

### `balance`

- _Type:_ Undefined | { value: BigNumber; formatted: string }
- _Description:_ Balance of the ERC20 token for the given wallet address. Provides both the raw value and a formatted value. Defaults to `undefined` and is updated by the `getTokenBalanceForAddress()` method.

## Methods

The `erc20BalanceOf` data slice provides the following method:

### `getTokenBalanceForAddress(args: { tokenAddress: string; tokenDecimal: number; walletAddress: string }): Promise<void>`

This method fetches the balance of a given ERC20 token for a specific Ethereum address.

#### Usage:

Put `x-data='erc20BalanceOf'` to give the DOM node + its descendants access to this data slice.

#### Parameters:

- `args.walletAddress`: Ethereum address for which we want to get the balance of the given ERC20 token.
- `args.tokenDecimal`: Number of decimals of the ERC20 token. Necessary to format the output.
- `args.tokenAddress`: Contract address of the ERC20 token we want to get the balance of for the given Ethereum address.

---

## Example

The snippet below showcases a simple implementation of a widget that balance of every Aave featured ERC20 held by the Ethereum address `0xE665CEf14cB016b37014D0BDEAB4A693c3F46Cc0`.

```html
<ul>
  <template x-for="(value, index) in $aaveAssetsDictionary">
    <li
      x-data="erc20BalanceOf"
      x-init=`
        getTokenBalanceForAddress({
            tokenAddress: value.UNDERLYING,
            tokenDecimal: value.decimal,
            walletAddress: '0xE665CEf14cB016b37014D0BDEAB4A693c3F46Cc0'
        })
     `
    >
      <template x-if="fetchStatus === 'pending'">
        <span x-text="'Loading ' + index + ' balance for '+ walletAddress +' ...'"></span>
      </template>
      <template x-if="balance">
        <span x-text="$formatERC20Balance(balance.formatted, index)"></span>
      </template>
    </li>
  </template>
</ul>
```

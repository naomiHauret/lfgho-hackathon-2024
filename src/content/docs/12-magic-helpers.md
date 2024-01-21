---
title: Easily format data and access Aave supported tokens with magic helpers
description: Learn how to use magic helpers to build widgets more easily with ghooey and Alpine
---

`ghooey` implements 4 magic properties to expose essential utilities functions that can be used in the markup of your widgets.

## Aave-specific helper functions and utilities

### `$aaveAssetsDictionary()`

Use this custom property in your markup to get complete the list of assets (ERC20 tokens) supported by Aave V3 along with their metadata.

Example :

```html
<ul>
  <template x-for="assetSymbol in Object.keys($aaveAssetsDictionary)">
    <li x-text="assetSymbol"></li>
  </template>
</ul>
```

### `$aaveAssetBySymbol()`

Use this custom property in your markup to expose and access an asset by its symbol from the markup more easily

Example: `<span x-text="$aaveAssetBySymbol('GHO')?.UNDERLYING"></span>`

## Regular helper functions and utilities

### `$formatERC20Balance()`

Use this custom property in your markup to localize and format an Aave supported ERC-20 token amount

Example: `<p x-text="$formatERC20Balance("183983.23289329", 'DAI')"></p>`

### `$formatNumber()`

Use this custom property in your markup to localize and format numbers in a specific format.

Examples:

- Display as formatted percentage: `<p x-text="$formatNumber('0.23', { style: 'percent'})"></p>`
- Display as formatted currency with currency code `<p x-text="$formatNumber(summary.availableBorrowsUSD, { style: 'currency', currency: 'USD'})"></p>`
- Display as a regular formatted number `<p x-text="$formatNumber(summary.healthFactor)"></p>`

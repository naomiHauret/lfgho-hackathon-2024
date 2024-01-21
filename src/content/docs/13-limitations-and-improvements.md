---
title: Current limitations and improvements
description: Learn what ghooey can't do and what it could do better
---

## Unsupported features

Currently, `ghooey` doesn't feature credit delegation yet.

## Wallet connectors

Currently, `ghooey` relies on injected wallet and the API and events they expose to perform any task that requires a wallet signature.

## Library size

Due to using libraries that are quite heavy under the hood themselves, `ghooey.min.js` is quite heavy (roughly 1.8MB). Possible iterations to improve its size would be :

- Use `viem` instead of `ethers` v5, which would also require to stop using `aave-utilities` ;
- Let developers decide which data slices, helpers and global stores to use instead of importing them all. This would be a fairly straightforward improvement, as `ghooey` main file looks like this :

```ts
import {
  registerStoreAaveMarkets,
  registerStoreCurrentUser,
  registerMagic$formatERC20Balance,
  registerMagic$assetsDictionary,
  registerMagic$assetBySymbol,
  registerDataAaveSupplyPool,
  registerDataERC20BalanceOf,
  registerDataERC20Transfer,
  registerDataWalletAavePortfolio,
  registerMagic$formatNumber,
  registerDataAaveBorrowReserveAsset,
  registerDataAaveRepayDebt,
  registerDataAaveWithdrawAsset,
} from './alpinejs'

// Stores ("$store.<store-name>.<key>")
const STORE_CURRENT_USER = 'currentUser'
const STORE_AAVE_MARKET = 'aaveMarkets'

// Data slices (x-data="<slice-name>")
const DATA_SLICE_WALLET_AAVE_PORTFOLIO = 'walletAavePortfolio'
const DATA_SLICE_AAVE_SUPPLY = 'aaveSupply'
const DATA_SLICE_ERC20_TRANSFER = 'erc20Transfer'
const DATA_SLICE_ERC20_BALANCE_OF = 'erc20BalanceOf'
const DATA_SLICE_AAVE_BORROW_RESERVE_ASSET = 'aaveBorrowReserveAsset'
const DATA_SLICE_AAVE_REPAY_DEBT = 'aaveRepayDebt'
const DATA_SLICE_AAVE_WITHDRAW_ASSET = 'aaveWithdrawAsset'

// Magic custom directives ("$<directive name>")
const MAGIC_FORMAT_ERC20_BALANCE = 'formatERC20Balance'
const MAGIC_FORMAT_NUMBER = 'formatNumber'
const MAGIC_AAVE_ASSETS_DICTIONARY = 'aaveAssetsDictionary'
const MAGIC_AAVE_ASSET_BY_SYMBOL = 'aaveAssetBySymbol'

/**
 * Initialize ghooey primitives
 */
export function setupGhooey() {
  document.addEventListener('alpine:init', async () => {
    registerStoreCurrentUser(STORE_CURRENT_USER)
    registerStoreAaveMarkets(STORE_AAVE_MARKET)
    registerDataWalletAavePortfolio(DATA_SLICE_WALLET_AAVE_PORTFOLIO)
    registerDataAaveSupplyPool(DATA_SLICE_AAVE_SUPPLY)
    registerDataAaveBorrowReserveAsset(DATA_SLICE_AAVE_BORROW_RESERVE_ASSET)
    registerDataERC20Transfer(DATA_SLICE_ERC20_TRANSFER)
    registerDataERC20BalanceOf(DATA_SLICE_ERC20_BALANCE_OF)
    registerDataAaveRepayDebt(DATA_SLICE_AAVE_REPAY_DEBT)
    registerDataAaveWithdrawAsset(DATA_SLICE_AAVE_WITHDRAW_ASSET)
    registerMagic$formatERC20Balance(MAGIC_FORMAT_ERC20_BALANCE)
    registerMagic$formatNumber(MAGIC_FORMAT_NUMBER)
    registerMagic$assetsDictionary(MAGIC_AAVE_ASSETS_DICTIONARY)
    registerMagic$assetBySymbol(MAGIC_AAVE_ASSET_BY_SYMBOL)
  })
}
```

## Compatibility with other front-end frameworks

In theory, Alpine can work with any existing markup. It might however require slight modifications to function within a React/Next application for instance, [but it should be possible](https://github.com/alpinejs/alpine/issues/201).

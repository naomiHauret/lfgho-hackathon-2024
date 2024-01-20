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
    /**
     * Declare & register global stores
     * @see https://alpinejs.dev/essentials/state#global-state
     * @see https://alpinejs.dev/globals/alpine-store
     */

    // Currently connected user (window.ethereum) ; get currently connected user's balance & detailed Aave portfolio ; smart contracts events
    registerStoreCurrentUser(STORE_CURRENT_USER)

    // Aave market data
    registerStoreAaveMarkets(STORE_AAVE_MARKET)

    /**
     * Declare & register custom data slices
     * @see https://alpinejs.dev/globals/alpine-data
     * @see https://alpinejs.dev/directives/data
     * @see https://alpinejs.dev/magics/data
     */
    // Get Aave market data ; Get a wallet Aave portfolio
    registerDataWalletAavePortfolio(DATA_SLICE_WALLET_AAVE_PORTFOLIO)

    // Supply ERC-2612 compatible ERC20 token to a given Aave pool
    registerDataAaveSupplyPool(DATA_SLICE_AAVE_SUPPLY)

    // Borrow from Aave reserve
    registerDataAaveBorrowReserveAsset(DATA_SLICE_AAVE_BORROW_RESERVE_ASSET)

    // Transfer ERC20 token to another Ethereum address
    registerDataERC20Transfer(DATA_SLICE_ERC20_TRANSFER)

    // Get the balance of a specific ERC20 token balance for a given Ethereum address
    registerDataERC20BalanceOf(DATA_SLICE_ERC20_BALANCE_OF)

    // Enable the user to repay their debt
    registerDataAaveRepayDebt(DATA_SLICE_AAVE_REPAY_DEBT)
    /**
     * Declare & register custom magic extensions
     * @see https://alpinejs.dev/advanced/extending#custom-magics
     */
    // Localize & format ERC-20 balance
    registerMagic$formatERC20Balance(MAGIC_FORMAT_ERC20_BALANCE)

    // Localize and format number
    registerMagic$formatNumber(MAGIC_FORMAT_NUMBER)

    // Get complete list of assets (ERC20 tokens) supported by Aave V3 + their metadata
    registerMagic$assetsDictionary(MAGIC_AAVE_ASSETS_DICTIONARY)

    // Get Aave asset (ERC20 token) by its symbol (eg: 'DAI')
    registerMagic$assetBySymbol(MAGIC_AAVE_ASSET_BY_SYMBOL)
  })
}

import { AaveV3Sepolia, IERC20_ABI } from '@bgd-labs/aave-address-book'
import { fetchMarketsData, fetchUserData, getWalletBalanceProvider, provider } from '../../helpers'
import { BigNumber, Contract } from 'ethers'
import {
  formatReserves,
  formatUserSummaryAndIncentives,
  normalize,
  valueToBigNumber,
  type FormatUserSummaryResponse,
} from '@aave/math-utils'
import { POOL_ABI } from '../../abi/Pool'
import type { WalletBalanceProvider } from '@aave/contract-helpers'

interface ExtendedUserSummary extends FormatUserSummaryResponse {
  collateralUsage: string
}

interface StoreCurrentUser {
  getWalletBalanceProvider: () => WalletBalanceProvider
  status: string
  account: undefined | string
  assets: {
    fetchStatus: string
    balances: {
      [symbol: string]: {
        fetchStatus: string
        formatted?: string
        value?: BigNumber
      }
    }
  }
  aavePortfolio: {
    fetchStatus: string
    summary: ExtendedUserSummary | undefined
  }
  init: () => Promise<void>
  watchContractsEvents: () => Promise<void>
  fetchAssets: () => Promise<void>
  getAavePortfolio: () => Promise<void>
  fetchSingleAsset: () => (tokenAddress: string) => Promise<void>
  connect: () => Promise<void>
  checkAccount: () => Promise<void>
}

/**
 * Register a global store to:
 * - easily access and update the currently connected wallet, its portfolio and erc20 balances ;
 * - watch specific onchain events ;
 * 
 * Usage: put `x-data` to give the DOM node + its descendants access to this global store
 * Usage: use "$store.currentUser.<property defined below>" to access any value defined in the store

 * @see https://alpinejs.dev/globals/alpine-store
 */
export function registerStoreCurrentUser(storeName: string) {
  window.Alpine.store<StoreCurrentUser>(storeName, {
    /**
     * Return the wallet balance provider context
     */
    getWalletBalanceProvider,
    /**
     * Wheter or not the user is connected with a wallet
     */
    status: window.ethereum.isConnected() ? 'connected' : 'disconnected',
    /**
     * Ethereum address of the currently connected user
     */
    account: undefined,
    /**
     * ERC20 tokens featured on Aave and held by the current user
     */
    assets: {
      /**
       * Status of the get balance of ERC20 tokens query (overall)
       */
      fetchStatus: 'idle',
      /**
       * Balance of ERC20 tokens held by the current user
       * each asset has their own `fetchStatus` as well
       */
      balances: {},
    },
    /**
     * Formatted Aave summary (currently supplying, currently borrowing, etc)
     */
    aavePortfolio: {
      fetchStatus: 'idle',
      summary: undefined,
    },
    /**
     * Run on initialization.
     * - Check whether or not the current user has a wallet connected ;
     * - Fetch the current wallet
     * - Register contract events watcher
     * - Fetch tokens balance ; Fetch Aave portfolio summary
     *
     * @see https://alpinejs.dev/directives/init
     */
    async init() {
      await this.checkAccount()
      // Whenever window.ethereum detects the current connect wallet changed
      // Update current user wallet, watch onchain events, fetch balances and portfolio summmary
      window.ethereum.on('accountsChanged', async (data) => {
        if (data[0]) {
          this.account = data[0]
          this.watchContractsEvents()
          await Promise.allSettled([await this.fetchAssets(), await this.getAavePortfolio()])
        }
      })

      window.ethereum.on('chainChanged', (chainId: string) => {
        console.log('chain changed', chainId)
      })
      window.ethereum.on('connect', (connectInfo) => {
        console.log('connectInfo', connectInfo)
      })
      window.ethereum.on('disconnect', (data) => {
        console.log('disconnect', data)
      })
    },
    /**
     * On specific contract events, re-run specific functions defined in our global state.
     * This is to make sure the data displayed is the updated after an onchain action performed by the user
     */
    async watchContractsEvents() {
      // ERC20 Transfer
      // Watch transfers that involve the current user for each Aave supported ERC20 token
      for (const [key, asset] of Object.entries(AaveV3Sepolia.ASSETS)) {
        const erc20Contract = new Contract(asset.UNDERLYING, IERC20_ABI, provider)
        erc20Contract.on('Transfer', async (from, to, value, event) => {
          if ([from.toLowerCase(), to.toLowerCase()].includes(this.account)) {
            // Refetch balance of asset that was transferred
            await this.fetchSingleAsset(asset.UNDERLYING)
            // Dispatch a custom event here ; this can be used on the frontend with x-on directive !
            window.dispatchEvent(
              new CustomEvent('ERC20_TRANSFER', {
                detail: {
                  token: {
                    address: asset.UNDERLYING,
                    symbol: key,
                    amount: normalize(value.toString(), asset.decimals ?? 18),
                  },
                  fromAddress: from.toLowerCase(),
                  toAddress: to.toLowerCase(),
                },
              }),
            )
          }
        })
      }

      // Pool Supply
      //  Watch supply events that involve the current user
      const poolContract = new Contract(AaveV3Sepolia.POOL, POOL_ABI, provider)
      poolContract.on(
        'Supply',
        async (reserve: string, user: string, onBehalfOf: string, amount: BigNumber, referralCode: number) => {
          if (user.toString() === this.account) {
            const tokenSymbol = Object.keys(AaveV3Sepolia.ASSETS).filter(
              (asset) => AaveV3Sepolia.ASSETS[asset].UNDERLYING.toLowerCase() === reserve.toLowerCase(),
            )?.[0]
            // Refetch balance of asset that was supplied along with the portfolio summary
            await Promise.allSettled([await this.fetchSingleAsset(reserve), await this.getAavePortfolio()])
            // Dispatch a custom event
            window.dispatchEvent(
              new CustomEvent('POOL_SUPPLY', {
                detail: {
                  token: {
                    address: AaveV3Sepolia.ASSETS[tokenSymbol].UNDERLYING,
                    symbol: tokenSymbol,
                    amount: normalize(amount.toString(), AaveV3Sepolia.ASSETS[tokenSymbol].decimals ?? 18),
                  },
                },
              }),
            )
          }
        },
      )
    },
    /**
     * Fetch the balances of underlying ERC20 tokens featured on Aave for the current user
     */
    async fetchAssets() {
      const previousStatus = this.assets.fetchStatus
      this.assets.fetchStatus = previousStatus === 'success' ? 'refreshing' : 'pending'
      const assetsContractsData = Object.keys(AaveV3Sepolia.ASSETS).map((symbol) => {
        return {
          symbol,
          ...AaveV3Sepolia.ASSETS[symbol],
        }
      })
      const balanceProvider: WalletBalanceProvider = this.getWalletBalanceProvider()
      const balances = await balanceProvider.batchBalanceOf(
        [this.account],
        [...assetsContractsData.map((asset) => asset.UNDERLYING)],
      )
      assetsContractsData.map((asset, i) => {
        this.assets.balances[asset.symbol] = {
          fetchStatus: 'success',
          value: balances[i],
          formatted: normalize(balances[i].toString(), asset.decimals ?? 18),
        }
      })
      this.assets.fetchStatus = 'success'
    },
    /**
     * Fetch the balances of underlying ERC20 tokens held by the current user
     * @param {string} tokenAddress - ERC20 token to get the balance of for the currently connected user
     */
    async fetchSingleAsset(tokenAddress: string) {
      const assetSymbol = Object.keys(AaveV3Sepolia.ASSETS).find(
        (symbol) => AaveV3Sepolia.ASSETS[symbol].UNDERLYING === tokenAddress,
      )
      const asset = AaveV3Sepolia.ASSETS[assetSymbol]
      this.assets.balances[assetSymbol] = {
        ...this.assets.balances[`${assetSymbol}`],
        fetchStatus: 'refreshing',
      }
      const balanceProvider: WalletBalanceProvider = this.getWalletBalanceProvider()
      const balance = await balanceProvider.balanceOf(this.account, tokenAddress)
      this.assets.balances[assetSymbol] = {
        fetchStatus: 'success',
        value: balance,
        formatted: normalize(balance.toString(), asset.decimals ?? 18),
      }
    },
    /**
     * Fetch Aave summary of current user
     * @see https://github.com/aave/aave-utilities#user-data
     */
    async getAavePortfolio(): Promise<void> {
      const previousStatus = this.aavePortfolio.fetchStatus
      this.aavePortfolio.fetchStatus = previousStatus === 'success' ? 'refreshing' : 'pending'
      const [reservesData, userData] = await Promise.allSettled([
        await fetchMarketsData(),
        await fetchUserData(`${this.account}`),
      ])
      const { reserves, reserveIncentives } = reservesData.value
      const { userReserves, userIncentives } = userData.value
      const currentTimestamp = Math.floor(Date.now() / 1000)
      const reservesArray = reserves.reservesData
      const baseCurrencyData = reserves.baseCurrencyData
      const userReservesArray = userReserves.userReserves
      const formattedPoolReserves = formatReserves({
        reserves: reservesArray,
        currentTimestamp,
        marketReferenceCurrencyDecimals: baseCurrencyData.marketReferenceCurrencyDecimals,
        marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
      })

      const summary = formatUserSummaryAndIncentives({
        currentTimestamp,
        marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
        marketReferenceCurrencyDecimals: baseCurrencyData.marketReferenceCurrencyDecimals,
        userReserves: userReservesArray,
        formattedReserves: formattedPoolReserves,
        userEmodeCategoryId: userReserves.userEmodeCategoryId,
        reserveIncentives,
        userIncentives,
      })

      const maxBorrowAmount = valueToBigNumber(summary?.totalBorrowsMarketReferenceCurrency || '0').plus(
        summary?.availableBorrowsMarketReferenceCurrency || '0',
      )

      const collateralUsage = maxBorrowAmount.eq(0)
        ? '0'
        : valueToBigNumber(summary?.totalBorrowsMarketReferenceCurrency || '0')
            .div(maxBorrowAmount)
            .toFixed()

      this.aavePortfolio.summary = {
        ...summary,
        collateralUsage,
      }
      this.aavePortfolio.fetchStatus = 'success'
      // console.log(this.aavePortfolio)
    },
    /**
     * Check if a wallet already connected to the website previously.
     * If so, request its data, register on-chain events watcher and fetch both assets balances and Aave portfolio
     * Updates `status` and `account`
     */
    async checkAccount() {
      this.status = 'reconnecting'
      const [account] = await window.ethereum.request({ method: 'eth_accounts' })
      if (account) {
        this.account = account
        this.status = 'connected'
        this.watchContractsEvents()
        await Promise.allSettled([await this.fetchAssets(), await this.getAavePortfolio()])
      } else {
        this.status = 'disconnected'
      }
    },
    /**
     * Connect using an injected web3 wallet ;
     * Updates `status` and `account`
     */
    async connect() {
      this.status = 'connecting'
      const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
      if (account) {
        this.account = account
        this.status = 'connected'
      } else {
        this.status = 'disconnected'
      }
    },
  })
}

import { formatReserves, valueToBigNumber, formatUserSummaryAndIncentives, normalize } from '@aave/math-utils'
import { WalletBalanceProvider, Pool, type EthereumTransactionTypeExtended } from '@aave/contract-helpers'
import { AaveV3Sepolia, IERC20_ABI } from '@bgd-labs/aave-address-book'
import { providers, Contract, utils, BigNumber } from 'ethers'
import { POOL_ABI } from './abi/Pool'
import { submitTransaction, getWalletBalanceProvider, provider, fetchMarketsData, fetchUserData } from './helpers'
import {
  registerMagic$formatERC20Balance,
  registerMagic$assetsDictionary,
  registerMagic$assetBySymbol,
} from './alpinejs/magics'
import {
  registerDataAaveSupplyPool,
  registerDataERC20Transfer,
  registerDataWalletAavePortfolio,
} from './alpinejs/data-contexts'
/**
 * Enable Ghooey elements via Alpine
 */
export function setupGhooey() {
  document.addEventListener('alpine:init', async () => {
    // Global store for current user wallet data
    window.Alpine.store('currentUser', {
      getWalletBalanceProvider,
      status: window.ethereum.isConnected() ? 'connected' : 'disconnected',
      account: undefined,
      // ERC20 token held by the current user
      assets: {
        fetchStatus: 'idle',
        balances: {},
      },
      // Aave summary (currently supplying, currently borrowing, etc)
      aavePortfolio: {
        fetchStatus: 'idle',
      },
      async init() {
        // On page load, check if user has connected their wallet previously
        await this.checkAccount()

        // Whenever window.ethereum detects the current connect wallet changed
        // Update current user wallet and client in the store
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
       * Contract events
       */
      async watchContractsEvents() {
        // Watch transfers that involve the current user for each Aave supported ERC20 token
        for (const [key, asset] of Object.entries(AaveV3Sepolia.ASSETS)) {
          const erc20Contract = new Contract(asset.UNDERLYING, IERC20_ABI, provider)
          erc20Contract.on('Transfer', async (from, to, value, event) => {
            if ([from.toLowerCase(), to.toLowerCase()].includes(this.account)) {
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

        // Watch supply events that involve the current user
        const poolContract = new Contract(AaveV3Sepolia.POOL, POOL_ABI, provider)
        poolContract.on(
          'Supply',
          async (reserve: string, user: string, onBehalfOf: string, amount: BigNumber, referralCode: number) => {
            if (user.toString() === this.account) {
              const tokenSymbol = Object.keys(AaveV3Sepolia.ASSETS).filter(
                (asset) => AaveV3Sepolia.ASSETS[asset].UNDERLYING.toLowerCase() === reserve.toLowerCase(),
              )?.[0]
              await Promise.allSettled([await this.fetchSingleAsset(reserve), await this.getAavePortfolio()])
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
       * Fetch the balances of underlying ERC20 tokens held by the current user
       */
      async fetchAssets() {
        this.assets.fetchStatus = this.assets.fetchStatus === 'success' ? 'refresh' : 'pending'
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
       */
      async fetchSingleAsset(tokenAddress: string) {
        const assetSymbol = Object.keys(AaveV3Sepolia.ASSETS).find(
          (symbol) => AaveV3Sepolia.ASSETS[symbol].UNDERLYING === tokenAddress,
        )
        const asset = AaveV3Sepolia.ASSETS[assetSymbol]
        this.assets.balances[assetSymbol] = {
          ...this.assets.balances[`${assetSymbol}`],
          fetchStatus: 'refresh',
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
       * DUPLICATE of the data slice but it makes our lives easier to keep data synced so whatever
       */
      async getAavePortfolio(): Promise<void> {
        this.aavePortfolio.fetchStatus = 'pending'
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
      },
      /**
       * Check if a wallet already connected to the website ; reconnect it if so and fetch assets
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
       * Connect using a web3 wallet
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

    // Re-usable data slice for ERC20 getBalance
    window.Alpine.data('erc20SingleBalance', () => ({
      fetchStatus: 'idle',
      balance: undefined,
      async getTokenBalanceForAddress(args: { tokenAddress: string; tokenDecimal: number; walletAddress: string }) {
        this.fetchStatus = 'pending'
        const storeCurrentUser = window.Alpine.store('currentUser')
        const balanceProvider = storeCurrentUser.getWalletBalanceProvider()
        const balance = await balanceProvider.balanceOf(args.walletAddress, args.tokenAddress)
        this.balance = {
          value: balance,
          formatted: normalize(balance.toString(), args?.tokenDecimal ?? 18),
        }
        this.fetchStatus = 'success'
      },
    }))

    registerDataWalletAavePortfolio()
    registerDataAaveSupplyPool()
    registerDataERC20Transfer()

    /**
     * Declare & register custom magic extensions
     * @see https://alpinejs.dev/advanced/extending#custom-magics
     */
    registerMagic$formatERC20Balance()
    registerMagic$assetsDictionary()
    registerMagic$assetBySymbol()
  })
}

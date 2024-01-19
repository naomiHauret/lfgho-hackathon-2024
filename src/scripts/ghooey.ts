import {
  formatReserves,
  valueToBigNumber,
  formatUserSummaryAndIncentives,
  type ReservesIncentiveDataHumanized,
  type UserReservesIncentivesDataHumanized,
  normalize,
} from '@aave/math-utils'
import {
  UiPoolDataProvider,
  UiIncentiveDataProvider,
  ChainId,
  type ReservesDataHumanized,
  type UserReserveDataHumanized,
  ERC20_2612Service,
  WalletBalanceProvider,
} from '@aave/contract-helpers'
import { AaveV3Sepolia, IERC20_ABI } from '@bgd-labs/aave-address-book'
import { providers, Contract, utils } from 'ethers'

const provider = new providers.JsonRpcProvider('https://ethereum-sepolia.publicnode.com', {
  name: 'Sepolia',
  chainId: 11155111,
})

const erc20_2612DataProviderContract = new ERC20_2612Service(provider)

function getWalletBalanceProvider() {
  return new WalletBalanceProvider({
    walletBalanceProviderAddress: AaveV3Sepolia.WALLET_BALANCE_PROVIDER,
    provider,
  })
}

/**
 * View contract.
 * Provides read-access to reserves data (including market base currency data) and user reserves
 */
const poolDataProviderContract = new UiPoolDataProvider({
  uiPoolDataProviderAddress: AaveV3Sepolia.UI_POOL_DATA_PROVIDER,
  provider,
  chainId: ChainId.sepolia,
})

/**
 * View contract.
 * Provides read-access to all reserve incentives (APRs), and user incentives
 */
const incentiveDataProviderContract = new UiIncentiveDataProvider({
  uiIncentiveDataProviderAddress: AaveV3Sepolia.UI_INCENTIVE_DATA_PROVIDER,
  provider,
  chainId: ChainId.sepolia,
})

/**
 * Fetch Aave market data
 *  - `reserves`: Information about pool reserves and market base currency data.
 *  - `userReserves`: Information about the user's Aave positions and active eMode category.
 * @see aave-utilities docs https://github.com/aave/aave-utilities
 */
async function fetchMarketsData(): Promise<{
  reserves: ReservesDataHumanized
  reserveIncentives: ReservesIncentiveDataHumanized[]
}> {
  const [reserves, reserveIncentives] = await Promise.allSettled([
    await poolDataProviderContract.getReservesHumanized({
      lendingPoolAddressProvider: AaveV3Sepolia.POOL_ADDRESSES_PROVIDER,
    }),
    await incentiveDataProviderContract.getReservesIncentivesDataHumanized({
      lendingPoolAddressProvider: AaveV3Sepolia.POOL_ADDRESSES_PROVIDER,
    }),
  ])

  return {
    reserves: reserves?.value,
    reserveIncentives: reserveIncentives?.value,
  }
}

/**
 * Fetches various Aave-related data for a given user account.
 * @param accountAddress - The Ethereum address of the user.
 * @returns An object containing different sets of Aave data:
 *  - `userReserves`: Information about the user's Aave positions and active eMode category.
 *  - `userIncentives`: Dictionary of claimable user incentives.
 * @see aave-utilities docs https://github.com/aave/aave-utilities
 */
async function fetchUserData(accountAddress: string): Promise<{
  userReserves: {
    userReserves: UserReserveDataHumanized[]
    userEmodeCategoryId: number
  }
  userIncentives: UserReservesIncentivesDataHumanized[]
}> {
  const [userReserves, userIncentives] = await Promise.allSettled([
    await poolDataProviderContract.getUserReservesHumanized({
      lendingPoolAddressProvider: AaveV3Sepolia.POOL_ADDRESSES_PROVIDER,
      user: accountAddress,
    }),
    await incentiveDataProviderContract.getUserReservesIncentivesDataHumanized({
      lendingPoolAddressProvider: AaveV3Sepolia.POOL_ADDRESSES_PROVIDER,
      user: accountAddress,
    }),
  ])

  return {
    userReserves: userReserves?.value,
    userIncentives: userIncentives?.value,
  }
}

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
      assets: {
        fetchStatus: 'idle',
        balances: {},
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
            await this.fetchAssets()
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
       * Check if a wallet already connected to the website ; reconnect it if so and fetch assets
       */
      async checkAccount() {
        this.status = 'reconnecting'
        const [account] = await window.ethereum.request({ method: 'eth_accounts' })
        if (account) {
          this.account = account
          this.status = 'connected'
          this.watchContractsEvents()
          await this.fetchAssets()
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

    // Re-usable data slice for wallet address Aave data + markets data
    window.Alpine.data('walletAaveDataSummary', () => ({
      fetchStatus: 'idle',
      summary: undefined,
      address: undefined,

      async getSummary(): Promise<void> {
        this.fetchStatus = 'pending'
        const [reservesData, userData] = await Promise.allSettled([
          await fetchMarketsData(),
          await fetchUserData(`${this.address}`),
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
        /*
            - @param `currentTimestamp` Current UNIX timestamp in seconds, Math.floor(Date.now() / 1000)
            - @param `marketReferencePriceInUsd` Input from [Fetching Protocol Data](#fetching-protocol-data), `reserves.baseCurrencyData.marketReferencePriceInUsd`
            - @param `marketReferenceCurrencyDecimals` Input from [Fetching Protocol Data](#fetching-protocol-data), `reserves.baseCurrencyData.marketReferenceCurrencyDecimals`
            - @param `userReserves` Input from [Fetching Protocol Data](#fetching-protocol-data), combination of `userReserves.userReserves` and `reserves.reservesArray`
            - @param `userEmodeCategoryId` Input from [Fetching Protocol Data](#fetching-protocol-data), `userReserves.userEmodeCategoryId`
            - @param `reserveIncentives` Input from [Fetching Protocol Data](#fetching-protocol-data), `reserveIncentives`
            - @param `userIncentives` Input from [Fetching Protocol Data](#fetching-protocol-data), `userIncentives`
            */

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
        this.summary = {
          ...summary,
          collateralUsage,
        }
        this.fetchStatus = 'success'
      },
    }))

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

    // Re-usable data slice for using the `transfer` function of ERC20
    window.Alpine.data('erc20Transfer', () => ({
      status: 'idle',
      txHash: undefined,
      async transferToken(args: { tokenAddress: string; tokenDecimals: number; amount: number; toAddress?: string }) {
        try {
          this.txHash = undefined
          this.status = 'signaturePending'
          const storeCurrentUser = window.Alpine.store('currentUser')
          const walletProvider = new providers.Web3Provider(window.ethereum)
          const signer = walletProvider.getSigner(storeCurrentUser.account)
          const contract = new Contract(args.tokenAddress, IERC20_ABI, signer)
          const amount = utils.parseUnits(args.amount.toString(), args.tokenDecimals)
          const tx = await contract.transfer(args.toAddress, amount)
          this.status = 'transactionPending'
          await tx.wait()
          this.txHash = tx.hash
          this.status = 'transactionSuccessful'
        } catch (e) {
          console.error(e)
          this.status = 'error'
        }
      },
    }))


    /**
     * Alpine.js magic helper to format numerical values easily with Intl.NumberFormat()
     * Use it in your markup with an Alpine directive
     * For instance: `<p x-text="$formatNumber("183983.23289329", { style: 'currency', currency: 'USD'})"></p>`
     * The snippet above will format the value to be a price in USD using the user's locale numerical representation
     *
     * @see https://alpinejs.dev/advanced/extending#magic-properties
     */
    window.Alpine.magic('formatNumber', () => {
      return (subject, options) => new Intl.NumberFormat(navigator.language, options).format(subject)
    })

    /**
     * Alpine.js magic helper to format ERC20 token balance easily with Intl.NumberFormat()
     * Use it in your markup with an Alpine directive
     * For instance: `<p x-text="$formatERC20Balance("183983.23289329", 'DAI')"></p>`
     * The snippet above will format the balance in the user's locale numerical representation along with the token symbol
     *
     * @see https://alpinejs.dev/advanced/extending#magic-properties
     */
    window.Alpine.magic('formatERC20Balance', () => {
      return (subject, symbol) =>
        new Intl.NumberFormat(navigator.language, { style: 'currency', currency: 'USD' })
          .format(subject)
          .replace('$US', symbol)
    })

    /**
     * Alpine.js magic helper to expose and access an asset by its symbol from the markup more easily
     * Use it in your markup with an Alpine directive
     * For instance: `<span x-text="$assetBySymbol('GHO')?.UNDERLYING">`
     * The snippet above will display the contract address of the ERC-20 token GHO
     *
     * @see https://alpinejs.dev/advanced/extending#magic-properties
     */
    window.Alpine.magic('assetBySymbol', () => {
      return (subject) => AaveV3Sepolia.ASSETS[subject]
    })

    /**
     * Alpine.js magic helper to expose and access the dictionary of assets more easily from the markup more easily
     * Use it in your markup with an Alpine directive
     * For instance: `<template x-for="assetSymbol in Object.keys($assetsDictionary)">`
     *
     * @see https://alpinejs.dev/advanced/extending#magic-properties
     */
    window.Alpine.magic('assetsDictionary', () => {
      return (subject) => AaveV3Sepolia.ASSETS
    })
  })
}

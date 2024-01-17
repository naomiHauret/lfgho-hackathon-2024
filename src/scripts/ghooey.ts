import { sepolia } from 'viem/chains'
import { http, createWalletClient } from 'viem'
import {
  formatReserves,
  valueToBigNumber,
  formatUserSummaryAndIncentives,
  type ReservesIncentiveDataHumanized,
  type UserReservesIncentivesDataHumanized,
} from '@aave/math-utils'
import {
  UiPoolDataProvider,
  UiIncentiveDataProvider,
  ChainId,
  type ReservesDataHumanized,
  type UserReserveDataHumanized,
} from '@aave/contract-helpers'
import { AaveV3Sepolia } from '@bgd-labs/aave-address-book'
import { providers } from 'ethers'

const provider = new providers.JsonRpcProvider('https://ethereum-sepolia.publicnode.com')

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
 * Fetches various Aave-related data for a given user account.
 * @param accountAddress - The Ethereum address of the user.
 * @returns An object containing different sets of Aave data:
 *  - `reserves`: Information about pool reserves and market base currency data.
 *  - `userReserves`: Information about the user's Aave positions and active eMode category.
 *  - `reserveIncentives`: Information about incentive tokens with price feed and emission APR.
 *  - `userIncentives`: Dictionary of claimable user incentives.
 * @see aave-utilities docs https://github.com/aave/aave-utilities
 */

async function fetchContractData(accountAddress: string): Promise<{
  reserves: ReservesDataHumanized
  userReserves: {
    userReserves: UserReserveDataHumanized[]
    userEmodeCategoryId: number
  }
  reserveIncentives: ReservesIncentiveDataHumanized[]
  userIncentives: UserReservesIncentivesDataHumanized[]
}> {
  // Fetch pool reserves and market base currency data
  const reserves = await poolDataProviderContract.getReservesHumanized({
    lendingPoolAddressProvider: AaveV3Sepolia.POOL_ADDRESSES_PROVIDER,
  })

  // Fetch user's Aave positions and active eMode category
  const userReserves = await poolDataProviderContract.getUserReservesHumanized({
    lendingPoolAddressProvider: AaveV3Sepolia.POOL_ADDRESSES_PROVIDER,
    user: accountAddress,
  })

  // Fetch information about incentive tokens with price feed and emission APR
  const reserveIncentives = await incentiveDataProviderContract.getReservesIncentivesDataHumanized({
    lendingPoolAddressProvider: AaveV3Sepolia.POOL_ADDRESSES_PROVIDER,
  })

  // Fetch dictionary of claimable user incentives
  const userIncentives = await incentiveDataProviderContract.getUserReservesIncentivesDataHumanized({
    lendingPoolAddressProvider: AaveV3Sepolia.POOL_ADDRESSES_PROVIDER,
    user: accountAddress,
  })

  return { reserves, userReserves, reserveIncentives, userIncentives }
}

/**
 * Enable Ghooey elements via Alpine
 */
export function setupGhooey() {
  document.addEventListener('alpine:init', async () => {
    // Global store for current user wallet data
    window.Alpine.store('currentUser', {
      status: window.ethereum.isConnected() ? 'connected' : 'disconnected',
      walletClient: undefined,
      account: undefined,
      async init() {
        // On page load, check if user has connected their wallet previously
        await this.checkAccount()

        // Whenever window.ethereum detects the current connect wallet changed
        // Update current user wallet and client in the store
        window.ethereum.on('accountsChanged', async (data) => {
          this.account = data[0]
          this.walletClient = createWalletClient({
            account: this.account,
            chain: sepolia,
            transport: http('https://ethereum-sepolia.publicnode.com'),
          })
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
      async checkAccount() {
        this.status = 'reconnecting'
        const [account] = await window.ethereum.request({ method: 'eth_accounts' })
        if (account) {
          this.account = account
          this.walletClient = createWalletClient({
            account,
            chain: sepolia,
            transport: http('https://ethereum-sepolia.publicnode.com'),
          })
          this.status = 'connected'
        } else {
          this.status = 'disconnected'
        }
      },
      async connect() {
        this.status = 'connecting'
        const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
        this.account = account
        this.walletClient = createWalletClient({
          account,
          chain: sepolia,
          transport: http('https://ethereum-sepolia.publicnode.com'),
        })
        this.status = 'connected'
      },
    })

    // Re-usable data slice for wallet address Aave position
    window.Alpine.data('walletAaveDataSummary', () => ({
      fetchStatus: 'idle',
      summary: undefined,
      address: undefined,

      async getSummary(): Promise<void> {
        this.fetchStatus = 'pending'

        const { reserves, userReserves, reserveIncentives, userIncentives } = await fetchContractData(`${this.address}`)
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

        console.log(this.summary)
      },
    }))

    // Directive to format number in a more elegant way in the markup while still saying flexible
    window.Alpine.magic('formatNumber', () => {
      return (subject, options) => new Intl.NumberFormat(navigator.language, options).format(subject)
    })
  })
}

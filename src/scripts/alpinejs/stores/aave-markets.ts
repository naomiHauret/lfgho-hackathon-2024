import { formatReservesAndIncentives, type ReserveDataWithPrice } from '@aave/math-utils'
import { fetchMarketsData, provider } from '../../helpers'
import { Contract } from 'ethers'
import { AaveV3Sepolia } from '@bgd-labs/aave-address-book'
import { POOL_ABI } from '../../abi/Pool'

interface StoreAaveMarkets {
  fetchStatus: string
  markets: ReserveDataWithPrice | undefined
  fetchMarketsData: () => Promise<void>
  watchContractsEvents: () => Promise<void>
  init: () => Promise<void>
}

/**
 * Register a global store to:
 * 
 * Usage: put `x-data` to give the DOM node + its descendants access to this global store
 * Usage: use "$store.aaveMarkets.<property defined below>" to access any value defined in the store

 * @see https://alpinejs.dev/globals/alpine-store
 */
export function registerStoreAaveMarkets(storeName: string) {
  window.Alpine.store<StoreAaveMarkets>(storeName, {
    /**
     * Status of the get Aave markets query
     */
    fetchStatus: 'idle',
    /**
     * Aave markets data. Defaults to `undefined`.
     * Value set in `fetchMarketsData()`
     */
    markets: undefined,
    /**
     * Run on initialization.
     * - Fetch Aave markets data
     * - Register contract events watcher
     *
     * @see https://alpinejs.dev/directives/init
     */
    async init() {
      await fetchMarketsData()
    },
    /**
     * On specific contract events, re-run specific functions defined in our global state.
     * This is to make sure the data displayed is the updated after an onchain action performed by the user
     */
    async watchContractsEvents() {
      // Pool Supply
      //  Watch supply events that involve the current user
      const poolContract = new Contract(AaveV3Sepolia.POOL, POOL_ABI, provider)
      poolContract.on('Supply', async () => {
        // Refetch Aave markets data
        await fetchMarketsData()
      })
    },
    /**
     * Fetch Aave markets data
     * @see https://github.com/aave/aave-utilities#markets-data
     */
    async fetchMarketsData(): Promise<void> {
      const previousStatus = this.fetchStatus
      this.fetchStatus = previousStatus === 'success' ? 'refreshing' : 'pending'
      const reservesData = await fetchMarketsData()
      const { reserves, reserveIncentives } = reservesData
      const currentTimestamp = Math.floor(Date.now() / 1000)
      const reservesArray = reserves.reservesData
      const baseCurrencyData = reserves.baseCurrencyData
      const formattedPoolReserves = formatReservesAndIncentives({
        reserves: reservesArray,
        currentTimestamp,
        marketReferenceCurrencyDecimals: baseCurrencyData.marketReferenceCurrencyDecimals,
        marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
        reserveIncentives,
      })
      this.markets = formattedPoolReserves
      this.fetchStatus = 'success'
    },
  })
}

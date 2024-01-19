import {
  formatReserves,
  formatUserSummaryAndIncentives,
  valueToBigNumber,
  type FormatUserSummaryResponse,
} from '@aave/math-utils'
import { fetchMarketsData, fetchUserData } from '../../helpers'
interface ExtendedUserSummary extends FormatUserSummaryResponse {
  collateralUsage: string
}
interface SliceDataWalletAavePortfolio {
  fetchStatus: string
  summary: ExtendedUserSummary | undefined
  address: string | undefined
  getSummary: Promise<void>
}

/**
 * Register a re-usable data slice that helps us fetch both Aave market data + a given wallet address portfolio on Aave
 * Usage: put `x-data='wallet-aave-portfolio` to give the DOM node + its descendants access to this data slice
 * @see https://alpinejs.dev/directives/data
 * @see https://alpinejs.dev/globals/alpine-data
 */
export function registerDataWalletAavePortfolio() {
  window.Alpine.data<SliceDataWalletAavePortfolio>('wallet-aave-portfolio', () => ({
    /**
     * Status of the bundled read request.
     * Can be `'idle'`, `'pending'`, `'success'`
     * Defaults to `'idle'`.
     */
    fetchStatus: 'idle',
    /**
     *  Wallet address portfolio summary + Aave market data summary.
     * Defaults to `undefined`. Updated by `getSummary()`
     */
    summary: undefined,
    /**
     * Ethereum address to get the summary of
     * Defaults to `undefined`. Set/update it in the markup with `x-bind`, `x-init` or `x-data`
     */
    address: undefined,
    /**
     * Fetches market data + Aave portfolio for a given Ethereum address
     * @see https://github.com/aave/aave-utilities
     */
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
}

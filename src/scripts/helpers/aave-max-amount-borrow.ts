// Credit: https://github.com/aave/interface/blob/main/src/utils/getMaxAmountAvailableToBorrow.ts
// I barely changed anything to the original file

import { type FormatUserSummaryAndIncentivesResponse, valueToBigNumber } from '@aave/math-utils'
import BigNumber from 'bignumber.js'
import { constants } from 'ethers'

// Subset of ComputedReserveData
interface PoolReserveBorrowSubset {
  borrowCap: string
  availableLiquidityUSD: string
  totalDebt: string
  isFrozen: boolean
  decimals: number
  formattedAvailableLiquidity: string
  formattedPriceInMarketReferenceCurrency: string
  borrowCapUSD: string
}

function roundToTokenDecimals(inputValue: string, tokenDecimals: number) {
  const [whole, decimals] = inputValue.split('.')

  // If there are no decimal places or the number of decimal places is within the limit
  if (!decimals || decimals.length <= tokenDecimals) {
    return inputValue
  }

  // Truncate the decimals to the specified number of token decimals
  const adjustedDecimals = decimals.slice(0, tokenDecimals)

  // Combine the whole and adjusted decimal parts
  return whole + '.' + adjustedDecimals
}

/**
 * Calculates the maximum amount of GHO a user can mint
 * @param user
 */
export function getMaxGhoMintAmount(
  user: FormatUserSummaryAndIncentivesResponse,
  poolReserve: PoolReserveBorrowSubset,
) {
  const userAvailableBorrows = valueToBigNumber(user?.availableBorrowsMarketReferenceCurrency || 0)

  const availableBorrowCap =
    poolReserve.borrowCap === '0'
      ? valueToBigNumber(constants.MaxUint256.toString())
      : valueToBigNumber(Number(poolReserve.borrowCap)).minus(valueToBigNumber(poolReserve.totalDebt))

  const maxAmountUserCanMint = BigNumber.max(BigNumber.min(userAvailableBorrows, availableBorrowCap), 0)

  const shouldAddMargin =
    /**
     * When a user has borrows we assume the debt is increasing faster then the supply.
     * That's a simplification that might not be true, but doesn't matter in most cases.
     */
    user.totalBorrowsMarketReferenceCurrency !== '0' ||
    /**
     * When borrow cap could be reached and debt accumulates the debt would be surpassed.
     */
    (poolReserve.borrowCapUSD && poolReserve.totalDebt !== '0' && maxAmountUserCanMint.gte(availableBorrowCap)) ||
    /**
     * When the user would be able to borrow all the remaining ceiling we need to add a margin as existing debt.
     */
    (user.isInIsolationMode &&
      user.isolatedReserve?.isolationModeTotalDebt !== '0' &&
      // TODO: would be nice if userFormatter contained formatted reserve as this math is done twice now
      valueToBigNumber(user.isolatedReserve?.debtCeiling || '0')
        .minus(user.isolatedReserve?.isolationModeTotalDebt || '0')
        .shiftedBy(-(user.isolatedReserve?.debtCeilingDecimals || 0))
        .multipliedBy('0.99')
        .lt(user.availableBorrowsUSD))

  const amountWithMargin = shouldAddMargin ? maxAmountUserCanMint.multipliedBy('0.99') : maxAmountUserCanMint
  return roundToTokenDecimals(amountWithMargin.toString(10), 18)
}

export function assetCanBeBorrowedByUser(asset, user) {
  if (!asset.borrowingEnabled || !asset.isActive || asset.isFrozen || asset.isPaused) return false
  if (user?.isInEmode && asset.eModeCategoryId !== user.userEmodeCategoryId) return false
  if (user?.isInIsolationMode && !asset.borrowableInIsolation) return false
  return true
}

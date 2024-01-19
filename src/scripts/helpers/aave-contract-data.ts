import type {
  ReservesDataHumanized,
  ReservesIncentiveDataHumanized,
  UserReserveDataHumanized,
  UserReservesIncentivesDataHumanized,
} from '@aave/contract-helpers'
import { incentiveDataProviderContract, poolDataProviderContract } from './contract-providers'
import { AaveV3Sepolia } from '@bgd-labs/aave-address-book'

/**
 * Fetch Aave market data
 *  - `reserves`: Information about pool reserves and market base currency data.
 *  - `userReserves`: Information about the user's Aave positions and active eMode category.
 * @see aave-utilities docs https://github.com/aave/aave-utilities
 */
export async function fetchMarketsData(): Promise<{
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
export async function fetchUserData(accountAddress: string): Promise<{
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

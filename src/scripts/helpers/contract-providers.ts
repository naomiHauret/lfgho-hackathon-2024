import { AaveV3Sepolia } from '@bgd-labs/aave-address-book'
import { provider } from './wallet-providers'
import { ChainId, UiIncentiveDataProvider, UiPoolDataProvider } from '@aave/contract-helpers'

/**
 * View contract.
 * Provides read-access to reserves data (including market base currency data) and user reserves
 */
export const poolDataProviderContract = new UiPoolDataProvider({
  uiPoolDataProviderAddress: AaveV3Sepolia.UI_POOL_DATA_PROVIDER,
  provider,
  chainId: ChainId.sepolia,
})

/**
 * View contract.
 * Provides read-access to all reserve incentives (APRs), and user incentives
 */
export const incentiveDataProviderContract = new UiIncentiveDataProvider({
  uiIncentiveDataProviderAddress: AaveV3Sepolia.UI_INCENTIVE_DATA_PROVIDER,
  provider,
  chainId: ChainId.sepolia,
})

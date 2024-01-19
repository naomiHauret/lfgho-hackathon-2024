import { WalletBalanceProvider } from '@aave/contract-helpers'
import { AaveV3Sepolia } from '@bgd-labs/aave-address-book'
import { providers } from 'ethers'

export const provider = new providers.JsonRpcProvider('https://ethereum-sepolia.publicnode.com', {
  name: 'Sepolia',
  chainId: 11155111,
})

export function getWalletBalanceProvider() {
  return new WalletBalanceProvider({
    walletBalanceProviderAddress: AaveV3Sepolia.WALLET_BALANCE_PROVIDER,
    provider,
  })
}

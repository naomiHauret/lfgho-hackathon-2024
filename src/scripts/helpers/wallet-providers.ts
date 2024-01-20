import { WalletBalanceProvider } from '@aave/contract-helpers'
import { AaveV3Sepolia } from '@bgd-labs/aave-address-book'
import { providers } from 'ethers'

const RPC_PROVIDER_URL = 'https://ethereum-sepolia.publicnode.com' // Alt: https://ethereum-sepolia.publicnode.com ; https://1rpc.io/sepolia
export const provider = new providers.JsonRpcProvider(RPC_PROVIDER_URL, {
  name: 'Sepolia',
  chainId: 11155111,
})

export function getWalletBalanceProvider() {
  return new WalletBalanceProvider({
    walletBalanceProviderAddress: AaveV3Sepolia.WALLET_BALANCE_PROVIDER,
    provider,
  })
}

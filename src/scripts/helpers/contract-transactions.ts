import type { EthereumTransactionTypeExtended } from '@aave/contract-helpers'
import { BigNumber, providers } from 'ethers'

/**
 * Generate the transaction data needed to perform protocol interactions with Aave smart contracts
 * @see https://github.com/aave/aave-utilities/tree/master#transactions-setup
 */
export async function submitTransaction(args: {
  provider: providers.Web3Provider
  tx: EthereumTransactionTypeExtended
}) {
  const extendedTxData = await args.tx.tx()
  const { from, ...txData } = extendedTxData
  const signer = args.provider.getSigner(from)
  const txResponse = await signer.sendTransaction({
    ...txData,
    value: txData.value ? BigNumber.from(txData.value) : undefined,
  })
  return txResponse
}

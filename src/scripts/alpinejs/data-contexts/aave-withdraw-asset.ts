import { provider, submitTransaction } from '../../helpers'
import { AaveV3Sepolia } from '@bgd-labs/aave-address-book'
import { providers } from 'ethers'
import { Pool, type EthereumTransactionTypeExtended, InterestRate } from '@aave/contract-helpers'

interface SliceDataAaveWithdrawAsset {
  withdrawAsset: () => Promise<void>
  status: string
  amount: number
  txsHashes: any
  token:
    | {
        decimals: number
        UNDERLYING: string
        A_TOKEN: string
        S_TOKEN?: string
        V_TOKEN?: string
        INTEREST_RATE_STRATEGY?: string
        ORACLE?: string
        STATA_TOKEN?: string
      }
    | undefined
}

/**
 * Register a re-usable data slice that enables the current user to withdraw their asset from the Aave pool via the `withdraw()` contract method
 * Usage: put `x-data='aaveWithdrawAsset'` to give the DOM node + its descendants access to this data slice
 * eg: use `@click="withdrawAsset()"` to call the `withdraw()` methodReserve from which
 * @see https://github.com/aave/aave-utilities/tree/master#withdraw
 * @see https://alpinejs.dev/directives/data
 * @see https://alpinejs.dev/globals/alpine-data
 */
export function registerDataAaveWithdrawAsset(sliceName: string) {
  window.Alpine.data<SliceDataAaveWithdrawAsset>(sliceName, () => ({
    /**
     * Status of the contract write request.
     * Can be `'idle'`, `'signaturePending'`, `'transactionPending'`, `'transactionSuccessful'` or `'error'` .
     * Defaults to `'idle'`.
     */
    status: 'idle',
    /**
     * Amount of asset to withdraw from the pool.
     * Defaults to `0`. Set/update it in the markup with `x-bind`, `x-init` or `x-data`
     */
    amount: 0,
    /**
     * Reserve asset the user wishes to withdraw.
     * Defaults to `undefined`. Set/update it in the markup with `x-bind`, `x-init` or `x-data`
     */
    token: undefined,
    /**
     * Hash(es) of the transactions.
     * Defaults to `undefined` (defined from within the `withdraw` function).
     */
    txsHashes: undefined,
    /**
     * Allow current user to withdraw their underlying asset from an Aave V3 pool via  the `withdraw()` contract method.
     * @see https://github.com/aave/aave-utilities/tree/master#withdraw-(v3)
     * @param args.amount - {number} - Optional. Amount of reserve asset to withdraw
     * @param args.reserve - {{ UNDERLYING: string, A_TOKEN: string, decimals: number}} - Optional. Token the user wishes to withdraw from the supply pool
     */
    async withdrawAsset() {
      try {
        this.txsHashes = undefined
        this.status = 'signaturePending'

        const storeCurrentUser = window.Alpine.store('currentUser')
        const walletProvider = new providers.Web3Provider(window.ethereum)
        const poolContractProvider = new Pool(provider, {
          POOL: AaveV3Sepolia.POOL,
          WETH_GATEWAY: AaveV3Sepolia.WETH_GATEWAY,
        })

        const data = {
          user: storeCurrentUser.account,
          amount: this.amount.toString(),
          reserve: this.token.UNDERLYING,
          aTokenAddress: this.token.A_TOKEN,
        }

        const txs: EthereumTransactionTypeExtended[] = await poolContractProvider.withdraw({
          ...data,
        })

        this.status = 'transactionPending'
        const resultTxs = await Promise.allSettled(
          txs.map(async (tx) => {
            return await submitTransaction({
              provider: walletProvider,
              tx,
            })
          }),
        )
        if (resultTxs.filter((tx) => tx.status === 'rejected')?.length > 0) {
          this.status = 'error'
          return
        }
        this.txsHashes = resultTxs.filter((tx) => {
          if (tx.status === 'fulfilled') return tx?.value?.hash
        })
        await Promise.allSettled(
          resultTxs.map(async (tx) => {
            if (tx.status === 'fulfilled') await tx?.value?.wait()
          }),
        )

        this.status = 'transactionSuccessful'
      } catch (e) {
        console.error(e)
        this.status = 'error'
      }
    },
  }))
}

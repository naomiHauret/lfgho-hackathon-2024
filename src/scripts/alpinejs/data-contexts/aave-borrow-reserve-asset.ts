import { provider, submitTransaction } from '../../helpers'
import { AaveV3Sepolia } from '@bgd-labs/aave-address-book'
import { providers } from 'ethers'
import { Pool, type EthereumTransactionTypeExtended, InterestRate } from '@aave/contract-helpers'

interface SliceDataAaveBorrowReserveAsset {
  borrow: () => Promise<void>
  status: string
  amount: number
  interestRateMode: InterestRate
  txsHashes: any
  token:
    | {
        decimals: number
        UNDERLYING: string
        A_TOKEN?: string
        S_TOKEN?: string
        V_TOKEN?: string
        INTEREST_RATE_STRATEGY?: string
        ORACLE?: string
        STATA_TOKEN?: string
      }
    | undefined
}

/**
 * Register a re-usable data slice that enables the current user to borrow a reserver asset from an Aave pool via the `borrow()` contract method
 * Usage: put `x-data='aaveBorrowReserveAsset'` to give the DOM node + its descendants access to this data slice
 * eg: use `@click="borrow()"` to call the `borrow()` method
 * @see https://github.com/aave/aave-utilities/tree/master#borrow
 * @see https://alpinejs.dev/directives/data
 * @see https://alpinejs.dev/globals/alpine-data
 */
export function registerDataAaveBorrowReserveAsset(sliceName: string) {
  window.Alpine.data<SliceDataAaveBorrowReserveAsset>(sliceName, () => ({
    /**
     * Status of the contract write request.
     * Can be `'idle'`, `'signaturePending'`, `'transactionPending'`, `'transactionSuccessful'` or `'error'` .
     * Defaults to `'idle'`.
     */
    status: 'idle',
    /**
     * Amount of reserve asset to borrow from the pool.
     * Defaults to `0`. Set/update it in the markup with `x-bind`, `x-init` or `x-data`
     */
    amount: 0,
    /**
     * Interest rate mode.
     * Defaults to InterestRateMode.None
     */
    interestRateMode: InterestRate.None,
    /**
     * Reserve asset the user wishes to borrow.
     * Defaults to `undefined`. Set/update it in the markup with `x-bind`, `x-init` or `x-data`
     */
    token: undefined,
    /**
     * Hash(es) of the transactions.
     * Defaults to `undefined` (defined from within the `borrowReserveAsset` function).
     */
    txsHashes: undefined,
    /**
     * Allow current user to borrow assets from an Aave V3 pool via  the `borrow()` contract method.
     * **The user must have a collateralized position (= hold a positive balance of aToken in their wallet) or the method will fail !**
     * @see https://github.com/aave/aave-utilities/tree/master#borrow-(v3)
     * @param args.amount - {number} - Optional. Amount of reserve asset to borrow
     * @param args.reserve - {{ UNDERLYING: string, decimals: number}} - Optional. Reserve from which the user wishes to borrow
     */
    async borrow() {
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
          interestRateMode: this.interestRateMode,
        }

        const txs: EthereumTransactionTypeExtended[] = await poolContractProvider.borrow({
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

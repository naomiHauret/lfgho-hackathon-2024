import { provider, submitTransaction } from '../../helpers'
import { AaveV3Sepolia } from '@bgd-labs/aave-address-book'
import { providers } from 'ethers'
import { Pool, type EthereumTransactionTypeExtended, InterestRate } from '@aave/contract-helpers'

interface SliceDataAaveRepayDebt {
  repayDebt: () => Promise<void>
  repayDebtWithAToken: () => Promise<void>
  status: string
  amount: number
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
 * Register a re-usable data slice that enables the current user to repat their debt via either the `repayWithPermit()` or `repayWithATokens()` contract methods
 * Usage: put `x-data='aaveRepayDebt'` to give the DOM node + its descendants access to this data slice
 * eg: use `@click="repay()"` to call the `repay()` method
 * @see https://github.com/aave/aave-utilities/tree/master#repayWithPermit
 * @see https://github.com/aave/aave-utilities/tree/master#repaywithatokens
 * @see https://alpinejs.dev/directives/data
 * @see https://alpinejs.dev/globals/alpine-data
 */
export function registerDataAaveRepayDebt(sliceName: string) {
  window.Alpine.data<SliceDataAaveRepayDebt>(sliceName, () => ({
    /**
     * Status of the contract write request.
     * Can be `'idle'`, `'signaturePending'`, `'transactionPending'`, `'transactionSuccessful'` or `'error'` .
     * Defaults to `'idle'`.
     */
    status: 'idle',
    /**
     * Amount spent on repaying the debt
     * Defaults to `0`. Set/update it in the markup with `x-bind`, `x-init` or `x-data`
     */
    amount: 0,
    /**
     * Borrow rate mode.
     * Default to variable. Set in the markup
     */
    interestRateMode: InterestRate.Variable,
    /**
     * Reserve asset the user wishes to borrow.
     * Defaults to `undefined`. Set/update it in the markup with `x-bind`, `x-init` or `x-data`
     */
    token: undefined,
    /**
     * Hash(es) of the transactions.
     */
    txsHashes: undefined,
    /**
     * Allow current user to borrow assets from an Aave V3 pool via  the `repayWithPermit()` contract method.
     * **The user must have a collateralized position (= hold a positive balance of aToken in their wallet) or the method will fail !**
     * @see https://github.com/aave/aave-utilities/tree/master#borrow-(v3)
     * @param args.amount - {number} - Optional. Amount of tokens used to repay the debt
     * @param args.reserve - {{ UNDERLYING: string, decimals: number}} - Optional. Reserve from which the user wishes to borrow
     */
    async repayDebt(args: { onBehalfOfAddress?: string }) {
      try {
        this.txsHashes = undefined
        this.status = 'signaturePending'

        const storeCurrentUser = window.Alpine.store('currentUser')
        const walletProvider = new providers.Web3Provider(window.ethereum)
        const poolContractProvider = new Pool(provider, {
          POOL: AaveV3Sepolia.POOL,
          WETH_GATEWAY: AaveV3Sepolia.WETH_GATEWAY,
        })
        const deadline = Math.round(Date.now() / 600 + 3600).toString() // deadline = 10 minutes
        const repayDebtData = {
          user: storeCurrentUser.account,
          amount: this.amount.toString(),
          reserve: this.token.UNDERLYING,
          interestRateMode: this.interestRateMode,
          deadline,
          onBehalfOf: args?.onBehalfOfAddress ?? storeCurrentUser.account,
        }
        const approval: string = await poolContractProvider.signERC20Approval(repayDebtData)
        const signature = await walletProvider.send('eth_signTypedData_v4', [storeCurrentUser.account, approval])
        const txData = {
          ...repayDebtData,
          signature,
        }

        const txs: EthereumTransactionTypeExtended[] = await poolContractProvider.repayWithPermit(txData)
        this.status = 'transactionPending'
        const resultTxs = await Promise.allSettled(
          txs.map(async (tx) => {
            const result = await submitTransaction({
              provider: walletProvider,
              tx,
            })
            return result
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

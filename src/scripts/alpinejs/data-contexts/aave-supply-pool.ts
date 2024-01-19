import { normalize } from '@aave/math-utils'
import { provider, submitTransaction } from '../../helpers'
import { AaveV3Sepolia } from '@bgd-labs/aave-address-book'
import { providers } from 'ethers'
import { Pool, type EthereumTransactionTypeExtended } from '@aave/contract-helpers'

interface SliceDataAaveSupplyPool {
  supplyTokens: () => Promise<void>
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
 * Register a re-usable data slice that enables the current user to supply a ERC20 token (ERC-2612 compatible) to an Aave pool via the `supplyWithPermit()` contract method
 * Usage: put `x-data='aaveSupply'` to give the DOM node + its descendants access to this data slice
 * eg: use `@click="supplyTokens()"` to call the `supplyTokens()` method
 * @see https://github.com/aave/aave-utilities/tree/master#supply-with-permit
 * @see https://alpinejs.dev/directives/data
 * @see https://alpinejs.dev/globals/alpine-data
 */
export function registerDataAaveSupplyPool(sliceName: string) {
  window.Alpine.data<SliceDataAaveSupplyPool>(sliceName, () => ({
    /**
     * Status of the contract write request.
     * Can be `'idle'`, `'signaturePending'`, `'transactionPending'`, `'transactionSuccessful'` or `'error'` .
     * Defaults to `'idle'`.
     */
    status: 'idle',
    /**
     * Amount of ERC20 token to supply to the pool.
     * Defaults to `0`. Set/update it in the markup with `x-bind`, `x-init` or `x-data`
     */
    amount: 0,
    /**
     * ERC20 token to supply to the pool.
     * Defaults to `undefined`. Set/update it in the markup with `x-bind`, `x-init` or `x-data`
     */
    token: undefined,
    /**
     * Hash(es) of the transactions.
     * Defaults to `undefined` (defined from within the `supplyTokens` function).
     */
    txsHashes: undefined,
    /**
     * Allow users to supply ERC20 tokens to an Aave V3 pool via `supplyWithPermit()` contract method.
     * Token **must be ERC-2612 compatible** and **cannot be GHO** (GHO cannot be supplied for now)
     * @see https://github.com/aave/interface/blob/main/src/ui-config/permitConfig.ts
     * @param args.onBehalfOfAddress - {string} - Optional. Allow user to supply an asset on the behalf of another wallet
     */
    async supplyTokens(args: { onBehalfOfAddress?: string }) {
      try {
        this.txsHashes = undefined
        this.status = 'signaturePending'

        const storeCurrentUser = window.Alpine.store('currentUser')
        const walletProvider = new providers.Web3Provider(window.ethereum)
        const poolContractProvider = new Pool(provider, {
          POOL: AaveV3Sepolia.POOL,
          WETH_GATEWAY: AaveV3Sepolia.WETH_GATEWAY,
        })

        const tokenAddress = `${this.token.UNDERLYING}`
        const deadline = Math.round(Date.now() / 600 + 3600).toString() // deadline = 10 minutes
        const supplyData = {
          user: storeCurrentUser.account,
          reserve: tokenAddress,
          amount: this.amount.toString(),
          deadline,
        }
        const approval: string = await poolContractProvider.signERC20Approval(supplyData)
        const signature = await walletProvider.send('eth_signTypedData_v4', [storeCurrentUser.account, approval])

        const txData = {
          ...supplyData,
        }
        // The transaction data can also contain a referral code but its disabled for now
        // Could be passed to the function in the future when enabled again
        const txs: EthereumTransactionTypeExtended[] = await poolContractProvider.supplyWithPermit({
          ...txData,
          signature,
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
          this.status = 'failure'
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

        // Dispatch a custom event on window.
        // This event can be used by Alpine x-on directive to do something extra.
        window.dispatchEvent(
          new CustomEvent('POOL_SUPPLY', {
            detail: {
              token: {
                symbol: Object.keys(AaveV3Sepolia.ASSETS).filter(
                  (asset) => AaveV3Sepolia.ASSETS[asset].UNDERLYING === this.token.UNDERLYING,
                )?.[0],
                address: this.token.UNDERLYING,
                amount: normalize(this.amount.toString(), this.token.decimals ?? 18),
              },
            },
          }),
        )
      } catch (e) {
        console.error(e)
        this.status = 'error'
      }
    },
  }))
}

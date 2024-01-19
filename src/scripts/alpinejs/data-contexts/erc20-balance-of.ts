import { normalize } from '@aave/math-utils'
import type { BigNumber } from 'ethers'

interface SliceDataERC20BalanceOf {
  fetchStatus: string
  balance: undefined | { value: BigNumber; formatted: string }
  getTokenBalanceForAddress: () => Promise<void>
}

/**
 * Register a re-usable data slice that helps us fetch the balance of a specific ERC20 token for a specific Ethereum address
 * Usage: put `x-data='erc20BalanceOf'` to give the DOM node + its descendants access to this data slice
 * @see https://alpinejs.dev/directives/data
 * @see https://alpinejs.dev/globals/alpine-data
 */
export function registerDataERC20BalanceOf(sliceName: string) {
  window.Alpine.data<SliceDataERC20BalanceOf>(sliceName, () => ({
    /**
     * Status of the read request.
     * Can be `'idle'`, `'pending'`, `'success'`
     * Defaults to `'idle'`.
     */
    fetchStatus: 'idle',
    /**
     * Balance of the ERC20 token for the given wallet address.
     * Provides both raw value and a formatted value.
     * Defaults to `undefined`. Updated by `getTokenBalanceForAddress()`
     */
    balance: undefined,
    /**
     * Get the balance of a given ERC20 token for a given Ethereum address
     * @param {string} args.walletAddress - Ethereum address for which we want to get the balance of the given ERC20 token
     * @param {number} args.tokenDecimal - Number of decimals of the ERC20 token. Necessary to format the output.
     * @param {string} args.tokenAddress - Contract address of the ERC20 token we want to get the balance of for the given Ethereum address
     */
    async getTokenBalanceForAddress(args: { tokenAddress: string; tokenDecimal: number; walletAddress: string }) {
      this.fetchStatus = 'pending'
      const storeCurrentUser = window.Alpine.store('currentUser')
      const balanceProvider = storeCurrentUser.getWalletBalanceProvider()
      const balance = await balanceProvider.balanceOf(args.walletAddress, args.tokenAddress)
      this.balance = {
        value: balance,
        formatted: normalize(balance.toString(), args?.tokenDecimal ?? 18),
      }
      this.fetchStatus = 'success'
    },
  }))
}

import { IERC20_ABI } from '@bgd-labs/aave-address-book'
import { Contract, providers, utils } from 'ethers'

interface SliceDataERC20Transfer {
  transferTokens(args: {
    token?: {
      UNDERLYING: string
      decimals: number
    }
    amount?: number
    recipientAddress: string
  }): Promise<void>
  status: string
  amount: number
  txHash: any
  recipientAddress: undefined | string
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
 * Register a re-usable data slice that enables the current user to transfer a ERC20 token to another Ethereum address using the `transfer()` method from the ERC20 contract.
 * Usage: put `x-data='erc20erc20Transfer'` to give the DOM node + its descendants access to this data slice
 * eg: use `@click="transferTokens()"` to call the `transferTokens()`
 * @see https://docs.openzeppelin.com/contracts/2.x/api/token/erc20#IERC20-Transfer-address-address-uint256-
 * @see https://alpinejs.dev/directives/data
 * @see https://alpinejs.dev/globals/alpine-data
 */
export function registerDataERC20Transfer(sliceName: string) {
  // Re-usable data slice for using the `transfer` function of ERC20
  window.Alpine.data<SliceDataERC20Transfer>(sliceName, () => ({
    /**
     * Status of the contract write request.
     * Can be `'idle'`, `'signaturePending'`, `'transactionPending'`, `'transactionSuccessful'` or `'error'` .
     * Defaults to `'idle'`.
     */
    status: 'idle',
    /**
     * Hash of the transaction.
     * Defaults to `undefined` (defined from within the `transferToken` function).
     */
    txHash: undefined,
    /**
     * ERC20 token to transfer.
     * Defaults to `undefined`Set/update it in the markup with `x-bind`, `x-init` or `x-data`
     */
    token: undefined,
    /**
     * Amount of ERC20 token to transfer.
     * Defaults to `0`. Set/update it in the markup with `x-bind`, `x-init` or `x-data`
     */
    amount: 0,
    /**
     * Ethereum address to which the ERC20 tokens must be sent to. Set/update it in the markup with `x-bind`, `x-init` or `x-data`
     * Defaults to `undefined`
     */
    recipientAddress: undefined,
    /**
     * Allow users to send ERC20 tokens to another Ethereum address using ERC20 `transfer()` method.
     * @see https://docs.openzeppelin.com/contracts/2.x/api/token/erc20#IERC20-Transfer-address-address-uint256-
     */
    async transferTokens(args: {
      token?: {
        UNDERLYING: string
        decimals: number
      }
      amount?: number
      recipientAddress: string
    }) {
      try {
        this.txHash = undefined
        this.status = 'signaturePending'
        const storeCurrentUser = window.Alpine.store('currentUser')
        const walletProvider = new providers.Web3Provider(window.ethereum)
        const signer = walletProvider.getSigner(storeCurrentUser.account)
        if (args?.token) this.token = args.token
        if (args?.amount) this.amount = args.amount
        if (args?.recipientAddress) this.recipientAddress = args.recipientAddress
        const tokenAddress = this.token?.UNDERLYING
        const tokenDecimals = this.token?.decimals
        const contract = new Contract(tokenAddress, IERC20_ABI, signer)
        const amount = utils.parseUnits(this.amount?.toString(), tokenDecimals)
        const tx = await contract.transfer(this.recipientAddress, amount)
        this.status = 'transactionPending'
        await tx.wait()
        this.txHash = tx.hash
        this.status = 'transactionSuccessful'
      } catch (e) {
        console.error(e)
        this.status = 'error'
      }
    },
  }))
}

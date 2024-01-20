interface SliceDataAaveCreditDelegation {
  delegateCredit: () => Promise<void>
  status: string
  txsHashes: any
  delegatee: string | undefined
  debtTokenAddress: string | undefined
  amount: number
}

/**
 * Register a re-usable data slice that enables the current user to delegate their credit power to another Ethereum address
 * Usage: put `x-data='aaveCreditDelegation'` to give the DOM node + its descendants access to this data slice
 * eg: use `@click="delegateCredit()"` to call the `delegateCredit()` method
 * @see https://github.com/aave/aave-utilities/tree/master#credit-delegation
 * @see https://docs.aave.com/developers/tokens/debttoken
 * @see https://alpinejs.dev/directives/data
 * @see https://alpinejs.dev/globals/alpine-data
 */
export function registerDataAaveCreditDelegation(sliceName: string) {
  window.Alpine.data<SliceDataAaveCreditDelegation>(sliceName, () => ({
    /**
     * Ethereum address to delegate the credit to
     * Defaults to `undefined`. Set in the markup.
     */
    delegatee: undefined,
    /**
     * Contract address of the debt token.
     * Debt tokens are interest-accruing tokens that are minted and burned on borrow and repay, representing the debt owed by the token holder.
     * @see https://docs.aave.com/developers/tokens/debttoken#delegationwithsig
     */
    debtTokenAddress: undefined,
    /**
     * Amount of debtToken
     * Defaults to `0`. Set in the markup.
     */
    amount: 0,
    /**
     * Status of the contract write request.
     * Can be `'idle'`, `'signaturePending'`, `'transactionPending'`, `'transactionSuccessful'` or `'error'` .
     * Defaults to `'idle'`.
     */
    status: 'idle',
    /**
     * Hash(es) of the transactions.
     * Defaults to `undefined` (defined from within the `CreditDelegation` function).
     */
    txsHashes: undefined,
    /**
     * Allow current user to borrow assets from an Aave V3 pool via  the `borrow()` contract method.
     * **The user must have a collateralized position (= hold a positive balance of aToken in their wallet) or the method will fail !**
     * @see https://github.com/aave/aave-utilities/tree/master#borrow-(v3)
     * @param args.amount - {number} - Optional. Amount of reserve asset to borrow
     * @param args.reserve - {{ UNDERLYING: string, decimals: number}} - Optional. Reserve from which the user wishes to borrow
     */
    async delegateCredit() {
      try {
        this.txsHashes = undefined
        this.status = 'signaturePending'

        this.status = 'transactionSuccessful'
      } catch (e) {
        console.error(e)
        this.status = 'error'
      }
    },
  }))
}

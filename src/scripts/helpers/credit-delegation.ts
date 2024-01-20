// Credit: https://github.com/aave/aave-v3-core/blob/6070e82d962d9b12835c88e68210d0e63f08d035/helpers/contracts-helpers.ts#L71
export function buildDelegationWithSigParams(chainId, token, revision, tokenName, delegatee, nonce, deadline, value) {
  return {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      DelegationWithSig: [
        { name: 'delegatee', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
    },
    primaryType: 'DelegationWithSig' as const,
    domain: {
      name: tokenName,
      version: revision,
      chainId: chainId,
      verifyingContract: token,
    },
    message: {
      delegatee,
      value,
      nonce,
      deadline,
    },
  }
}

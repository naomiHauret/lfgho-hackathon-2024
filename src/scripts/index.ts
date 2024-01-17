import { sepolia } from 'viem/chains'
import { http, createWalletClient } from 'viem'

/**
 * Enable Ghooey elements via Alpine
 */
export function setupGhooey() {
  document.addEventListener('alpine:init', async () => {
    // Global store for current user wallet data
    Alpine.store('currentUser', {
      status: window.ethereum.isConnected() ? 'connected' : 'disconnected',
      walletClient: undefined,
      account: undefined,
      async init() {
        await this.checkAccount()
        window.ethereum.on('accountsChanged', async (data) => {
          this.account = data[0]
          this.walletClient = createWalletClient({
            account: this.account,
            chain: sepolia,
            transport: http('https://ethereum-sepolia.publicnode.com'),
          })
        })

        window.ethereum.on('chainChanged', (chainId: string) => {
          console.log('chain changed', chainId)
        })
        window.ethereum.on('connect', (connectInfo) => {
          console.log('connectInfo', connectInfo)
        })
        window.ethereum.on('disconnect', (data) => {
          console.log('disconnect', data)
        })
      },
      async checkAccount() {
        this.status = 'reconnecting'
        const [account] = await window.ethereum.request({ method: 'eth_accounts' })
        if (account) {
          this.account = account
          this.walletClient = createWalletClient({
            account,
            chain: sepolia,
            transport: http('https://ethereum-sepolia.publicnode.com'),
          })
          this.status = 'connected'
        } else {
          this.status = 'disconnected'
        }
      },
      async connect() {
        this.status = 'connecting'
        const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
        this.account = account
        this.walletClient = createWalletClient({
          account,
          chain: sepolia,
          transport: http('https://ethereum-sepolia.publicnode.com'),
        })
        this.status = 'connected'
      },
    })
  })
}

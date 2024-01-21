---
title: Building with the current user's Aave portfolio data
description: Learn how to build widgets that use the current user's Aave portfolio data with ghooey and Alpine
---

The `currentUser` global store facilitates easy access and management of information related to the currently connected wallet, its held Aave-featured ERC20 token balances, and Aave portfolio. Developers can utilize this store to streamline their interaction with on-chain events and retrieve real-time updates.

## How to use it

- Prerequisite: in the markup, add `x-data` to give the DOM node + its descendants access to this global store
- in your markup, use `$store.currentUser.<property name>` to access any value defined in the store

## `$store.currentUser` Store Structure

The `currentUser` store provides the following properties:

### `$store.currentUser.status`

- **Type:** String
- **Description:** Represents the connection status of the user's wallet (`connected` or `disconnected`).

### `$store.currentUser.account`

- **Type:** String or Undefined
- **Description:** Ethereum address of the currently connected user.

### `$store.currentUser.assets`

- **Type:** Object
- **Description:** ERC20 tokens featured on Aave and held by the current user.
  - `fetchStatus`: Status of the overall ERC20 tokens balance query.
  - `balances`: Object containing the balance of each ERC20 token.
    - `symbol`: ERC20 token symbol.
    - `fetchStatus`: Status of the balance query for the specific token.
    - `formatted`: Formatted balance value.
    - `value`: BigNumber representing the balance.

### `$store.currentUser.aavePortfolio`

- **Type:** Object
- **Description:** Formatted Aave summary of the current user's portfolio.
  - `fetchStatus`: Status of the Aave portfolio summary query.
  - `summary`: Extended user summary (reserves, incentives) including collateral usage.

## Store Methods

`$store.currentUser` store provides the following methods:

### `init()`

- **Description:** Initializes the store by checking the current user's account, registering contract events watcher, and fetching token balances and Aave portfolio summary.

This method is called automatically when the store is initialized, you shouldn't need to call it.

### `watchContractsEvents()`

- **Description:** Listens to specific on-chain events and triggers related functions in the global state to ensure updated data display.

This method is called in `init()` and should only be called once ; as such, you should not use it in your markup.

### `$store.currentUser.fetchAssets()`

- **Description:** Fetches the balances of underlying ERC20 tokens featured on Aave for the current user.

### `$store.currentUser.fetchSingleAsset()`

- **Description:** Fetches the balance of a single underlying ERC20 token held by the current user.

### `$store.currentUser.getAavePortfolio()`

- **Description:** Fetches the Aave summary of the current user's portfolio.

### `$store.currentUser.checkAccount()`

- **Description:** Checks if a wallet is already connected and fetches data, registers on-chain events watcher, and fetches both asset balances and Aave portfolio accordingly.

### `$store.currentUser.connect()`

- **Description:** Connects to the wallet using an injected web3 wallet and updates the connection status and account.

---

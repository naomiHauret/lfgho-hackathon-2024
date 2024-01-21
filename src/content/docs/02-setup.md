---
title: Setup
description: Learn how to setup ghooey and Alpine to start building rich widgets for the Aave ecosystem
---

Being built on top of Alpine, `ghooey` can be easily added into a codebase and does not require any build step.

To get started, you need to :

1. Install Alpine via a CDN
2. Add `ghooey` like so if you installed Alpine through a CDN :

```html
<html>
  <!-- ... -->

  <!-- mandatory: add ghooey -->
  <script src="/path/to/public-folder/ghooey.js" defer></script>

  <!-- optional: add your own alpine extensions -->
  <script src="/path/public-folder/my-alpine-custom-directives-and-extensions.js" defer></script>

  <!-- mandatory: add Alpine -->
  <script src="/path/to/alpine.js" defer></script>

  <!-- ... -->
  <body x-data></body>
</html>
```

You can start building widgets to help users borrow/lend on Aave or transfer tokens like GHO with Alpine directives and predefined methods.

## Alpine.js basics

Alpine.js, the foundation on which `ghooey` is built, provides a lightweight, easy-to-use solution for adding dynamic behavior to your web pages via your HTML markup. Getting started with Alpine only takes a few hours, thanks to a straightforward documentation and abundance of learning resources (videos, articles, podcasts, conferences...).

To use `ghooey`, it's essential to be familiar with some of Alpine's key concepts.

We will review key concepts below, but advise you to review [Alpine documentation](https://alpinejs.dev/start-here) as well for more information.

- **Declarative Syntax** : Alpine.js leverages a declarative approach, allowing you to define data and behavior directly in your HTML.

- **Directives**: Directivesdirectives are specific data-attributes set in the markup and prefixed with `x-`. They provide a way to apply behavior to elements. There are 15 attributes in Alpine.

```html
<div x-data="{ greeting: 'Hello, Alpine!' }">
  <p x-text="greeting"></p>
  <button x-on:click="greeting = 'Hi there!'">Change Greeting</button>
</div>
```

In this example, the paragraph's text content is dynamically bound to the property `greeting`, defined in the directive `x-data` and initialized with the value `'Hello, Alpine!'`. Clicking the button triggers a change in the greeting and will display `'Hi there!'` instead of `'Hello, Alpine!'`.

- **Global stores**: Alpine makes it easy to create make data available to every component on the page thanks to **global stores.**. Data and functions defined in a `Alpine.store(...)` method can be referenced and used easily **anywhere** in the markup using the magic `$store()` property. `ghooey` defines and exposes 2 global stores: `currentUser` and `aaveMarkets`.

- **Local states**: Alpine provides re-usable local data and contexts. Data and functions defined in a `Alpine.data(...)` method can be passed and used easily in HTML block thanks to the `x-data` directive. `ghooey` defines and exposes 7 re-usable data slices.

### Aave specific re-usable states

- `walletAavePortfolio`, to get the detailed summary of the Aave portfolio of a given Ethereum wallet ;

- `aaveSupply` enables connected users to supply a ERC20 token that's ERC-2612 compatible to an Aave pool ;

- `aaveBorrowReserveAsset` enables connected users to borrow a reserve asset from an Aave pool (**requires the user to have supplied to a pool**) ;

- `aaveRepayDebt` enables connected users to repay their Aave loan using their balance of the same token they borrowed ;

- `aaveRepayDebt` enables connected users to repay their Aave loan using their balance of the same token they borrowed ;

- `aaveWithdrawAsset` enables connected users to withdraw the assets they supplied to an Aave pool ;

- `aaveCredit` - WIP - will enable connected users to delegate their borrowing power to other Ethereum addresses (which can mean other users or smart contracts).

### ERC-20 re-usable states

- `erc20Transfer`, to enable connected users to transfer an Aave featured ERC20 token to another Ethereum address
- `erc20BalanceOf`, to get the balance of a specific ERC20 token for a specific Ethereum address

## Events

`ghooey` watches multiple onchain events to refresh the displayed data (user portfolio and Aave markets data). It also dispatches custom events on `window` that you can leverage in your own application (to perform a request to your API for instance).

Here is a list of all custom events :

- `"ERC20_TRANSFER"` - dispatched when a `"Transfer"` onchain event involving the currently connected wallet address occurs ;

- `"USER_SUPPLY_POOL"` - dispatched when a `"Supply"` onchain event involving the currently connected wallet address occurs ;

- `"USER_BORROW_FROM_RESERVE"` - dispatched when a `"Borrow"` onchain event involving the currently connected wallet address occurs ;

- `"USER_REPAY_DEBT"` - dispatched when a `"Repay"` onchain event involving the currently connected wallet address occurs ;

- `"USER_WITHDRAW_ASSETS"` - dispatched when a `"Withdraw"` onchain event involving the currently connected wallet address occurs ;

---

By extending Alpine with global stores and reusable states, ghooey gives to developers access to custom properties and attributes which, under the hood and with the help of the `aave-utilities` package, unlock performing onchain operations (like `borrow()` or `supplyWithPermit()`).
Typically, one reusable exposes an Aave functionality, along with useful user indicators, like `fetchStatus` for instance.

This overview should allow you to quickly build a widget for your product, from a simple button that will send a tip with a fixed amount of a specific ERC20 token to a complete stable-rate loan provider.

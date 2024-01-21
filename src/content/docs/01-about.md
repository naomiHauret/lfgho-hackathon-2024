---
title: Motivations
description: ghooey is a toolkit for web2 codebases to grow the adoption of web3 through Aave widgets
---

# ghooey - why, what and how

`ghooey` is a versatile toolkit designed for effortlessly constructing interactive websites atop the robust **Aave protocol** using nothing but HTML markup.

> **Aave** stands as a decentralized, non-custodial liquidity market protocol, where users can engage as either suppliers or borrowers. Suppliers contribute liquidity to earn passive income, while borrowers can access overcollateralized (perpetual) or undercollateralized (one-block liquidity) loans.

By seamlessly integrating `ghooey` into their websites, developers gain the ability to create tailor-made widgets, facilitating user onboarding onto the Aave ecosystem. These widgets allow end-users to:

- Monitor their Aave portfolio
- Deposit and borrow liquidity from Aave markets
- Transfer liquidities and delegate their borrowing powers to other users

## Tech stack matters, actually

### Modern DeFi, Dated TradFi: tooling contrast

Although the usage of blockchain and DeFi by the finance and banking sectors seems to increase year by year, several industries still remain conservative in regards to technological evolution, which makes them slow to adopt new tools and paradigms for their online experiences.

As of January 2024, [W3Techs](https://w3techs.com/technologies/overview/content_management) reports that **WordPress** (still) dominates, being used by **43.1%** of all websites worldwide, followed by Shopify (4.2%), Wix, Squarespace, Joomla, and Drupal, which means half of all websites run on PHP.

<div class="mx-auto">
  <img src="/cms_usage.png" alt="A chart that display the percentages of websites using various content management systems" />
</div>

Furthermore, **jQuery is employed by over 80% of all websites**, and continues to be a staple in web developer education. In contrast, web3 protocols like Aave often adopt more modern tech stacks such as Next.js/Nuxt.js, React.js/Vue.js, signaling a shift towards contemporary technologies.

While the topic of tech stacks might appear nerdy or trivial, this discussion holds the key to significantly increasing the adoption of web3 in mainstream industries: if it wants to foster growth and onboard the next billion users, **web3 needs to address developers first and offer tools that are easy to integrate and work with within existing products**.

### What building on web3 means

For neobanks, integrating DeFi features into online products is a straightforward endeavor. However, for established entities and their sometimes dated practices, updating an existing front-end to incorporate new web3 features proves to be quite the challenge:

- **Interacting with smart contracts from the front-end demands a unique skill set,** encompassing familiarity with web3 concepts and tools such as smart contracts, wallets, gas fees, signatures, and specific libraries (e.g., ethers v5/ethers v6/wagmi/viem/web3.js).

- In many pre-built UI kits, components often **operate in isolation,** making data accessible only through a specific way (e.g., consuming a Context in React) or being confined to the underlying framework, hindering seamless integration with existing products. To be able to use those UI kits, the codebase often needs to be written entirely in that underlying framework.

- The underlying styling solutions in certain UI kits necessitate learning new libraries of a quite consequent size, present significant technical trade-offs (e.g., heaviness, inaccessibility, non-SSR-friendly), and offer **limited customization** or are difficult to customize.

- Some UI kits may require a build/bundling step with a tool incompatible with the underlying tech stack.

This non-exhaustive list highlights the pressing need for web3 building blocks that cater to a broader audience of developers — developers that, despite not using the latest trend, work with libraries and frameworks that power over 80% of all websites. Onboarding these developers - and products they maintain - is crucial for promoting the use and growth of web3 protocols like Aave. As such, the tools and developer products created must satisfy two key requirements:

- [x] Easy setup and seamless integration with pre-existing websites
- [x] Quick comprehension and user-friendliness for developers accustomed to fundamentally different front-end frameworks

The future is at the crossroads of boring web2 and edge web3. **This is why tools we need to build developer toolkits like `ghooey`.**

## _What_ is `ghooey` ?

`ghooey` is a drop-in front-end toolkit, equipped with primitives that make building on top of the Aave ecosystem less difficult.

Designed to address the challenge of integrating web3 features into existing web2 codebases, `ghooey` prioritizes freedom, usability, and reliability to simplify the development and creation of interactive DeFi widgets that use Aave.

### How does it work ?

`ghooey` is built on top of Alpine.js, a lightweight, minimal and extensible JavaScript framework that allows to write declarative code directly from our markup to build interactive websites.

A simple yet powerful library, Alpine can be learned in a couple of hours and doesn't require any specific setup besides adding a script to the page. As such, its the perfect base to build upon. Essentially, `ghooey` is a single JavaScript file that, by leveraging Alpine stores (global state), contexts (local state) and magics (inline functions), let developers build widgets that can interact with the Aave ecosystem via aave-utilities under the hood.

The markup and style of those widgets are completely customizable: the developers just need to use Alpine directives (like `x-data`, `x-init`...) and reference the proper stores and states.

For instance, the snippet below can showcase a "Pay" button that will :

- Display a "Connect your wallet" message if they aren't connected through an injected web3 wallet ;
- Display the GHO balance of the connected user
- Display a button they can use to transfer 0.5 GHO
- Perform the transfer operation and update the UI to reflect the various steps
- Automatically update their balance after the transfer

All this with just HTML markup and no additional JavaScript.

```html
<template x-if="!$store.currentUser.account">
  <p>Connect your wallet to pay</p>
</template>
<template x-if="$store.currentUser.account">
  <section x-data="{...erc20Transfer(), token: $aaveAssetBySymbol('GHO') }">
    <button
      x-text="status === 'signaturePending' ? 'Sign transfer to continue' : status === 'transactionPending' ? 'Transferring...' : 'Pay ' + $formatERC20Balance(amount, 'GHO')"
      x-data="{ amount: 0.5, sendTo: '0xe90406d09418C4EdBD7735c62F9FED7294954905'}"
      :aria-disabled="['signaturePending','transactionPending'].includes(status) || $store.currentUser.assets.fetchStatus === 'pending' || parseFloat($store.currentUser.assets?.balances?.GHO?.formatted ?? 0) <= 0 ? true : false"
      class="aria-[disabled='true']:opacity-50 aria-[disabled='true']:pointer-events-none"
      @click="transferTokens({ token, amount, recipientAddress: sendTo})"
    ></button>
    <template x-if="$store.currentUser.assets?.balances?.GHO?.formatted">
      <p
        :class="$store.currentUser.assets?.balances?.GHO?.fetchStatus === 'refreshing' && 'animate-pulse'"
        x-text="'Balance: ' + $formatERC20Balance($store.currentUser.assets?.balances?.GHO?.formatted, 'GHO')"
      ></p>
    </template>
    <template
      x-if="['pending', 'refreshing'].includes($store.currentUser.assets?.fetchStatus) || ($store.currentUser.assets?.balances?.GHO?.fetchStatus === 'pending' && !store.currentUser.assets?.balances?.GHO?.formatted)"
    >
      <p x-text="'Fetching GHO balance...'"></p>
    </template>
  </section>
</template>
```

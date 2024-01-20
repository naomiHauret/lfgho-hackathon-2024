# ghooey

LFGHO 2024 hackathon entry.

`ghooey` is a drop-in toolkit that includes both primitives and customizable widgets. With `ghooey`, developers can easily put together and customize a delightful front-end experience to assist their users with the Aave ecosystem and perform tasks such as :

- View the assets they are currently lending and borrowing ;
- Delegating their borrowing capacities to another wallet/smart contract address ;
- Borrow GHO on another user's behalf ;
- Repay previously mentioned loan ;

## Why ghooey ?

Building a front-end for a web3 protocol can be a daunting experience.

- **Interacting with smart contracts from the front-end is a skillset in itself** that requires not only to **be familiar with web3** (eg: what's a smart contract, what's a wallet, how to setup a wallet, what are gas fees and signatures, how to get gas...) **but also being able to use specific tools and concepts** (finding the ABI of a contract for a specific network, ethers v5/ethers v6/wagmi/viem/web3.js, wallet libraries, what parameters to pass to a contract method etc.)

- In many UI kits, the components tend to operate in isolation and/or can only work within the underlying framework

- The underlying styling solution of certain UI kits require to learn a new library, offer little customization/are very hard to customize, or have major technical trade-offs (too heavy, not accessible, not SSR-friendly...)

- Dependency clashes are a painful reality (eg: your website is using React 16 but the UI Kit supports v18 onwards and onwards ; the UI kit uses a CSS-in-JS library not compatible with your front-end library etc)

- Aave V3 offers a rich, tested TypeScript SDK that offers all the necessary functions to interact with the protocol

- According to W3Techs (World Wide Web Technology Surveys), as of January 2024, Wordpress is used by **43.1%** of all websites on the Internet (followed by Shopify with 4.2%, Wix, Squarespace, Joomla and Drupal). More than 1/2 websites relies on PHP. jQuery is still used by over 80% of all websites and is still taught to web developers.

| If web3 technology wants to grow, **it has to be compatible and easy to bootstramp and use for developers**. A no-build, template friendly and back-end agnostic toolkit is essential to promote the use and growth of web3 tools.

**This is where ghooey can fit. ghooey is a drop-in front-end toolkit that includes both primitives and customizable widgets to interact with the Aave ecosystem with no compromise between freedom, usability and reliability**.

Built with Alpine.js, a lightweight, minimal javascript framework that works with your existing markup, **ghooey** makes building a custom front-end that interacts with Aave a breeze: setup Alpine and drop the following script at the end of the `<body>` tag of your website.

```html
<body>
  <!-- > ... <-->
  <script src="/path/to/public-folder/ghooey.js">
    setupGhooey()
  </script>
</body>
```

Now, you can use Alpine directives based on ghooey snippets in your markup to unlock Aave features for your users on your website.

For instance, by using the snippet below, a user with their wallet connected will see :

1. A loading indicator for their summary
2. Their wallet summary which contains the total amount in USD they can borrown, and their collateral usage in %.

```html
<body x-data>
  <!-- > ... <-->
  <div x-data="walletAavePortfolio" x-init="address = $store.currentUser.account" x-effect="getSummary()">
    <template x-if="fetchStatus === 'pending' ">
      <span x-text="'Loading ' + address + ' summary...'"></span>
    </template>
    <template x-if="fetchStatus === 'success' ">
      <article x-data="{ profile: address }">
        <span x-text="'Summary for ' + profile"></span>
        <section>
          <h1>Total amount available to borrow (in USD)</h1>
          <p
            x-text="new Intl.NumberFormat(navigator.language, { style: 'currency', currency: 'USD', }).format(summary.availableBorrowsUSD)"
          ></p>
        </section>
        <section>
          <h1>Collateral usage</h1>
          <p
            x-text="new Intl.NumberFormat(navigator.language, { style: 'percent' }).format(summary.collateralUsage)"
          ></p>
        </section>
      </article>
    </template>
  </div>
  <!-- > ... <-->
</body>
```

The markup and style are completely customizable: the developers just need to use Alpine directives (like `x-data`, `x-init`...)

### How does it work ?

The main script (`ghooey.js`) uses `window.ethereum` events to interact and watch the current user's wallet, as well as Alpine stores (global state) and contexts (local state) to interact with Aave smart contracts (read/write).

Any Aave related data (market reserves, user positions etc) uses a mix of `@aave/contract-helpers`, `@aave/math-utils`, and `@bgd-labs/aave-address-book`.

### Who is ghooey for ?

`ghooey` is primarily aimed at developers that have an existing codebase built on the "boring" web and would like to quickly implement a widget instead of a full-blown dapp while avoiding common the pitfalls of many web3 component libraries..

Alternatively, ghooey could also be used by developers who want to prototype a UI for a smart contract feature without setting up an entire app using Vite/Next, or having to be fluent in modern front-end frameworks.

---

This project was bootstraped with the minimal template from Astro starter kit.

# Astro Starter Kit: Minimal

```sh
npm create astro@latest -- --template minimal
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/minimal)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/minimal)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/minimal/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

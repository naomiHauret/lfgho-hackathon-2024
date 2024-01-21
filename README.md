# ghooey

<img src="/logo.png" style="margin:auto; padding-bottom:32px;"/>

[Website](https://ghooey.netlify.app/) | [Docs](https://ghooey.netlify.app/00-overview) | [Example widgets](https://ghooey.netlify.app/examples/)

`ghooey` is a solo proof-of-concept built in ~ 5 days during the **[LFGHO 2024 hackathon](https://ethglobal.com/events/lfgho)** built primarily with [`Alpine.js`](https://alpinejs.dev/) and [`aave-utilities`](https://github.com/aave/aave-utilities), with a documentation website built with [Astro](https://astro.build/) and [Starlight](https://starlight.astro.build/).

`ghooey` is designed to be a **versatile drop-in front-end toolkit** to help developers **build and integrate Aave widgets in their existing codebase** with just a bit of HTML markup.

> The baseline is to help promote the growth the adoption of web3 protocols in web2 products through **developer experience**.

By seamlessly integrating `ghooey` into their websites, developers would gain the ability to create tailor-made widgets, facilitating user onboarding onto the Aave ecosystem. It implements the rails to integrate the following features that would allow users to :

- Monitor their Aave portfolio
- Deposit and borrow liquidity from Aave markets
- Transfer liquidities and delegate their borrowing powers to other users

> The name **ghooey** is actually a play on words :
>
> - **GUI**, _Graphical User Interface_
> - **gooey**, as this toolkit aims to offer flexibility in terms of how to implement a feature
> - **GHO**, the Aave stablecoin and focus of the hackathon

But why would `ghooey` be useful to the Aave ecosystem exactly ? Let's explore the motivations behind this hackathon idea.

### Modern DeFi, Dated TradFi: tooling contrast

Although the usage of blockchain and DeFi by the finance and banking sectors seems to increase year by year, several industries still remain conservative in regards to technological evolution, which makes them slow to adopt new tools and paradigms for their online experiences.

As of January 2024, [W3Techs](https://w3techs.com/technologies/overview/content_management) reports that **WordPress** (still) dominates, being used by **43.1%** of all websites worldwide, followed by Shopify (4.2%), Wix, Squarespace, Joomla, and Drupal, which means half of all websites run on PHP.

<div style="margin:auto;">
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

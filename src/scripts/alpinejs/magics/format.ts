/**
 * Alpine.js magic helper to format ERC20 token balance easily with Intl.NumberFormat()
 * Use it in your markup with an Alpine directive
 * For instance: `<p x-text="$formatERC20Balance("183983.23289329", 'DAI')"></p>`
 * The snippet above will format the balance in the user's locale numerical representation along with the token symbol
 *
 * @see https://alpinejs.dev/advanced/extending#magic-properties
 */
export function registerMagic$formatERC20Balance() {
  window.Alpine.magic('formatERC20Balance', () => {
    return (subject, symbol) =>
      new Intl.NumberFormat(navigator.language, { style: 'currency', currency: 'USD' })
        .format(subject)
        .replace('$US', symbol)
  })
}

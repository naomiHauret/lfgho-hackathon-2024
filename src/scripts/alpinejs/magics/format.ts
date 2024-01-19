/**
 * Alpine.js magic helper to format ERC20 token balance easily with Intl.NumberFormat()
 * Use it in your markup with an Alpine directive
 * For instance: `<p x-text="$formatERC20Balance("183983.23289329", 'DAI')"></p>`
 * The snippet above will format the balance in the user's locale numerical representation along with the token symbol
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
 * @see https://alpinejs.dev/advanced/extending#magic-properties
 */
export function registerMagic$formatERC20Balance(directiveName: string) {
  window.Alpine.magic(directiveName, () => {
    return (subject, symbol) =>
      new Intl.NumberFormat(navigator.language, { style: 'currency', currency: 'USD' })
        .format(subject)
        .replace('$US', symbol)
  })
}

/**
 * Alpine.js magic helper to format numbers easily with Intl.NumberFormat()
 * Use it in your markup with an Alpine directive
 * For instance: `<p x-text="$formatNumber('0.23', { style: 'percent'})"></p>`
 * The snippet above will format the number in the user's locale numerical representation
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
 * @see https://alpinejs.dev/advanced/extending#magic-properties
 */
export function registerMagic$formatNumber(directiveName: string) {
  window.Alpine.magic(directiveName, () => {
    return (subject, options) => new Intl.NumberFormat(navigator.language, options).format(subject)
  })
}

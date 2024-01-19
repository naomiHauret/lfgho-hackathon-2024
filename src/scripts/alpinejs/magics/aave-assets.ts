import { AaveV3Sepolia } from '@bgd-labs/aave-address-book'

/**
 * Alpine.js magic helper to expose and access an asset by its symbol from the markup more easily
 * Use it in your markup with an Alpine directive
 * For instance: `<span x-text="$assetBySymbol('GHO')?.UNDERLYING">`
 * The snippet above will display the contract address of the ERC-20 token GHO
 *
 * @see https://alpinejs.dev/advanced/extending#magic-properties
 */
export function registerMagic$assetBySymbol() {
  window.Alpine.magic('assetBySymbol', () => {
    return (subject) => AaveV3Sepolia.ASSETS[subject]
  })
}

/**
 * Alpine.js magic helper to expose and access the dictionary of assets more easily from the markup more easily
 * Use it in your markup with an Alpine directive
 * For instance: `<template x-for="assetSymbol in Object.keys($assetsDictionary)">`
 *
 * @see https://alpinejs.dev/advanced/extending#magic-properties
 */
export function registerMagic$assetsDictionary() {
  window.Alpine.magic('assetsDictionary', () => {
    return (subject) => AaveV3Sepolia.ASSETS
  })
}

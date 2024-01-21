import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";

import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), starlight({
    title: 'ghooey - Aave drop-in toolkit for your markup',
    customCss: [
      './src/styles/custom.css',
    ],
  })]
});
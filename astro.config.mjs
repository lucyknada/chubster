// @ts-check
import { defineConfig } from 'astro/config';

import solidJs from '@astrojs/solid-js';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  integrations: [solidJs()],
  output: 'server',

  adapter: node({
    mode: 'standalone'
  })
});
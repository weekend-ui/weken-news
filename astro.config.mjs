import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://weken.news',
  integrations: [
    tailwind(),
  ],
});

import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
    files: {
      routes: 'src/ui/routes',
      lib: 'src/ui/lib',
      appTemplate: 'src/ui/app.html',
      assets: 'src/ui/static'
    },
    paths: {
      base: '/basketball-legends'
    }
  },
  preprocess: vitePreprocess()
};

export default config;

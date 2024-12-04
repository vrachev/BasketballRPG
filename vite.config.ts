import type { Plugin, ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const configureResponseHeaders: Plugin = {
  name: 'configure-response-headers',
  configureServer: (server: ViteDevServer) => {
    server.middlewares.use((_req: IncomingMessage, res: ServerResponse, next: () => void) => {
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      next();
    });
  },
};

export default defineConfig({
  plugins: [sveltekit(), configureResponseHeaders],
  optimizeDeps: {
    exclude: ['sqlocal'],
  },
});

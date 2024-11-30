import type { Handle } from '@sveltejs/kit';

// sqlite-wasm requires these headers to be set to enable OPFS.
// Without OPFS, sqlite cannot persist files across sessions, only in-memory.
export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);

  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');

  return response;
}; 

import adapter from '@sveltejs/adapter-vercel'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
    csp: {
      directives: {
        'default-src': ['self'],
        'script-src': ['self', 'wasm-unsafe-eval'],
        'worker-src': ['self'],
        'connect-src': ['self'],
        'style-src': ['self', 'unsafe-inline'],
        'img-src': ['self'],
        'media-src': ['self']
      }
    }
  }
}

export default config

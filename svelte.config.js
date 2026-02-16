import adapter from '@sveltejs/adapter-vercel'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
    csp: {
      directives: {
        'default-src': ['self'],
        'script-src': ['self', 'wasm-unsafe-eval', 'https://va.vercel-scripts.com'],
        'worker-src': ['self'],
        'connect-src': ['self', 'https://va.vercel-scripts.com', 'https://vitals.vercel-insights.com'],
        'style-src': ['self', 'unsafe-inline'],
        'img-src': ['self', 'data:'],
        'media-src': ['self']
      }
    }
  }
}

export default config

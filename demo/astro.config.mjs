import { defineConfig } from 'astro/config';
import { r2Comments } from 'astro-r2-comments';

// Mock R2 bucket for local development
// In production, you'd use the actual Cloudflare R2 bucket
const mockR2Bucket = {
  _storage: new Map(),

  async get(key) {
    const data = this._storage.get(key);
    if (!data) return null;
    return {
      text: async () => data,
      json: async () => JSON.parse(data),
    };
  },

  async put(key, value) {
    this._storage.set(key, value);
  },

  async delete(key) {
    this._storage.delete(key);
  },

  async list({ prefix }) {
    const objects = [];
    for (const [key] of this._storage.entries()) {
      if (key.startsWith(prefix)) {
        objects.push({ key });
      }
    }
    return { objects };
  },
};

// https://astro.build/config
export default defineConfig({
  output: 'hybrid',
  adapter: undefined, // In production, use @astrojs/cloudflare
  integrations: [
    r2Comments({
      bucket: mockR2Bucket,
      prefix: 'comments/',
      requireApproval: false,
      enableSpamFilter: true,
    }),
  ],
  vite: {
    resolve: {
      alias: {
        'astro-r2-comments': '../packages/r2-comments/index.ts',
        'astro-r2-comments/endpoints/get': '../packages/r2-comments/src/endpoints/get.ts',
        'astro-r2-comments/endpoints/submit': '../packages/r2-comments/src/endpoints/submit.ts',
      },
      preserveSymlinks: true,
    },
  },
});

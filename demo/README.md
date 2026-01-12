# Astro R2 Comments Demo

This is a demo site for the `astro-r2-comments` integration.

## Development

```bash
# From the root of the monorepo
npm run start
```

## Mock Storage

In development, this demo uses a mock R2 bucket implementation. In production with Cloudflare Pages/Workers, you would configure an actual R2 bucket.

## Production Setup

To use this in production with Cloudflare:

1. Install the Cloudflare adapter:
   ```bash
   npm install @astrojs/cloudflare
   ```

2. Update `astro.config.mjs`:
   ```js
   import cloudflare from '@astrojs/cloudflare';

   export default defineConfig({
     output: 'server',
     adapter: cloudflare(),
     integrations: [
       r2Comments({
         bucket: undefined, // Will be accessed via runtime
       }),
     ],
   });
   ```

3. Configure the R2 bucket binding in `wrangler.toml`:
   ```toml
   [[r2_buckets]]
   binding = "COMMENTS_BUCKET"
   bucket_name = "your-comments-bucket"
   ```

4. Access the bucket in the integration via `locals.runtime.env.COMMENTS_BUCKET`

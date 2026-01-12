# Quick Start

Get comments working in your Astro site in 3 steps:

## 1. Install

```bash
npm install astro-r2-comments
```

## 2. Add the Integration

In `astro.config.mjs`:

```js
import { r2Comments } from 'astro-r2-comments';

export default defineConfig({
  integrations: [
    r2Comments({
      bucket: undefined, // Uses runtime binding
    }),
  ],
});
```

## 3. Add to Your Pages

```astro
---
import { R2Comment } from 'astro-r2-comments';
---

<R2Comment id={post.slug} />
```

Done! That's literally it.

## What You Get

- Comment display
- Comment submission form
- Spam filtering
- All data stored in your R2 bucket
- Zero runtime dependencies

## Customization

```astro
<!-- Just comments, no form -->
<R2Comment id={post.slug} showForm={false} />

<!-- Custom styling -->
<R2Comment id={post.slug} class="my-comments" />
```

## Production Setup

Configure your R2 bucket in `wrangler.toml`:

```toml
[[r2_buckets]]
binding = "COMMENTS_BUCKET"
bucket_name = "my-comments"
```

That's it. Simple, serverless comments for your Astro site.

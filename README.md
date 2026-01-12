# Astro R2 Comments

An Astro integration for adding a comment system that stores comments in Cloudflare R2.

## Features

- Store comments in Cloudflare R2 storage
- Pre-built UI components (customizable)
- Optional comment approval workflow
- Basic spam filtering
- TypeScript support
- Zero external dependencies (besides Astro and R2)

## Installation

```bash
npm install astro-r2-comments
```

## Usage

### 1. Add the Integration

Update your `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import { r2Comments } from 'astro-r2-comments';

export default defineConfig({
  output: 'server', // or 'hybrid'
  adapter: cloudflare(),
  integrations: [
    r2Comments({
      bucket: undefined, // Accessed via runtime
      prefix: 'comments/', // Optional: R2 storage prefix
      requireApproval: false, // Optional: require approval before showing
      enableSpamFilter: true, // Optional: basic spam detection
    }),
  ],
});
```

### 2. Configure R2 Bucket

Create a `wrangler.toml` in your project root:

```toml
name = "my-astro-site"
compatibility_date = "2024-01-01"

[[r2_buckets]]
binding = "COMMENTS_BUCKET"
bucket_name = "my-comments-bucket"
```

### 3. Update Endpoints to Access R2

The integration provides endpoints, but you need to ensure they can access the R2 bucket from `locals.runtime.env`:

The endpoints at `/api/comments/[postId]` (GET) and `/api/comments/submit` (POST) will automatically be injected.

### 4. Add Comments to Your Pages

```astro
---
import { R2Comment } from 'astro-r2-comments';
---

<html>
  <head>
    <title>My Blog Post</title>
  </head>
  <body>
    <article>
      <h1>My Blog Post</h1>
      <p>Content goes here...</p>
    </article>

    <R2Comment id="my-blog-post-slug" />
  </body>
</html>
```

That's it! The component will automatically display existing comments and provide a form for new ones.

## Component API

### `<R2Comment>` (Recommended)

The main component that includes both the comment list and submission form.

```astro
import { R2Comment } from 'astro-r2-comments';

<R2Comment id="unique-post-id" />
```

**Props:**
- `id` (required): Unique identifier for the post/page
- `showForm` (optional): Whether to show the comment form (default: `true`)
- `class` (optional): Additional CSS class

**Examples:**

```astro
<!-- Basic usage -->
<R2Comment id={post.slug} />

<!-- Comments only, no form -->
<R2Comment id={post.slug} showForm={false} />

<!-- With custom styling -->
<R2Comment id={post.slug} class="my-custom-comments" />
```

### Advanced Components

For more control, you can use individual components:

```astro
import { CommentList, CommentForm } from 'astro-r2-comments';

<!-- Display only the comment list -->
<CommentList postId="unique-post-id" />

<!-- Display only the comment form -->
<CommentForm postId="unique-post-id" />
```

## API Endpoints

The integration automatically adds these endpoints:

- `GET /api/comments/[postId]` - Fetch comments for a post
- `POST /api/comments/submit` - Submit a new comment

### Submit Comment

```bash
POST /api/comments/submit
Content-Type: application/json

{
  "postId": "my-post",
  "author": "John Doe",
  "email": "john@example.com",
  "content": "Great article!"
}
```

## Configuration

### Options

```typescript
interface R2CommentsOptions {
  bucket: R2Bucket; // R2 bucket instance (use undefined for runtime access)
  prefix?: string; // Storage prefix (default: 'comments/')
  requireApproval?: boolean; // Require approval (default: false)
  enableSpamFilter?: boolean; // Enable spam detection (default: false)
}
```

## Storage Structure

Comments are stored in R2 with the following structure:

```
comments/
  └── {postId}/
      ├── {commentId-1}.json
      ├── {commentId-2}.json
      └── ...
```

Each comment is stored as a JSON file:

```json
{
  "id": "1704067200000-abc123",
  "postId": "my-blog-post",
  "author": "John Doe",
  "email": "john@example.com",
  "content": "Great article!",
  "timestamp": 1704067200000,
  "approved": true
}
```

## Customization

### Styling

The components include basic styles. You can override them by targeting the CSS classes:

```css
/* Main container */
.r2-comments { }

/* Comment list */
.r2-comments-list { }
.r2-comment { }
.r2-comment-author { }
.r2-comment-date { }
.r2-comment-content { }

/* Comment form */
.r2-comment-form { }
.r2-form { }
.r2-form-group { }
```

### Custom Components

You can build your own components using the storage API:

```typescript
import { R2CommentStorage } from 'astro-r2-comments';

const storage = new R2CommentStorage({ bucket: myBucket });
const comments = await storage.getCommentsForPost('my-post');
```

## Development

See the [demo](./demo) directory for a working example with mock R2 storage.

## License

MIT

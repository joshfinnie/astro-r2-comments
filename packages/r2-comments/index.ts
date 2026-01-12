// Main integration
export { r2Comments } from './src/integration.js';
export type { R2CommentsOptions } from './src/integration.js';

// Main component - this is what users will typically import
export { default as R2Comment } from './src/components/R2Comment.astro';

// Individual components (for advanced usage)
export { default as CommentList } from './src/components/CommentList.astro';
export { default as CommentForm } from './src/components/CommentForm.astro';
export { default as Comments } from './src/components/Comments.astro';

// Storage API (for advanced usage)
export { R2CommentStorage } from './src/lib/r2-client.js';
export type { Comment, R2CommentStorageOptions } from './src/lib/r2-client.js';

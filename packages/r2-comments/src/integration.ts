import type { R2Bucket } from '@cloudflare/workers-types';
import type { AstroIntegration } from 'astro';

export interface R2CommentsOptions {
  /**
   * Cloudflare R2 bucket instance for storing comments
   */
  bucket: R2Bucket;

  /**
   * Prefix for comment storage in R2 (default: 'comments/')
   */
  prefix?: string;

  /**
   * Require approval before comments are visible (default: false)
   */
  requireApproval?: boolean;

  /**
   * Enable spam filtering (default: false)
   */
  enableSpamFilter?: boolean;
}

export function r2Comments(options: R2CommentsOptions): AstroIntegration {
  if (!options.bucket) {
    throw new Error('R2 bucket is required for astro-r2-comments');
  }

  return {
    name: 'astro-r2-comments',
    hooks: {
      'astro:config:setup': ({ injectRoute, updateConfig }) => {
        console.log('Initializing astro-r2-comments integration...');

        // Store options in Astro config for runtime access
        updateConfig({
          vite: {
            define: {
              __R2_COMMENTS_CONFIG__: JSON.stringify({
                prefix: options.prefix || 'comments/',
                requireApproval: options.requireApproval || false,
                enableSpamFilter: options.enableSpamFilter || false,
              }),
            },
          },
        });

        // Inject API routes for comment operations
        injectRoute({
          pattern: '/api/comments/[postId]',
          entrypoint: 'astro-r2-comments/endpoints/get',
        });

        injectRoute({
          pattern: '/api/comments/submit',
          entrypoint: 'astro-r2-comments/endpoints/submit',
        });
      },
    },
  };
}

import type { APIRoute } from 'astro';
import { R2CommentStorage } from '../lib/r2-client.js';

export const GET: APIRoute = async ({ params, locals }) => {
  const { postId } = params;

  if (!postId) {
    return new Response(
      JSON.stringify({ error: 'Post ID is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Access R2 bucket from Cloudflare runtime
    // @ts-expect-error - runtime types vary by adapter
    const bucket = locals?.runtime?.env?.COMMENTS_BUCKET;

    if (!bucket) {
      return new Response(
        JSON.stringify({ error: 'R2 bucket not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const storage = new R2CommentStorage({ bucket });
    const comments = await storage.getCommentsForPost(postId);

    // Filter out unapproved comments if approval is required
    const config = typeof __R2_COMMENTS_CONFIG__ !== 'undefined'
      ? __R2_COMMENTS_CONFIG__
      : { requireApproval: false };

    const filteredComments = config.requireApproval
      ? comments.filter((c) => c.approved)
      : comments;

    return new Response(
      JSON.stringify({ comments: filteredComments }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching comments:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch comments' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

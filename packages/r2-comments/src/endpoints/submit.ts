import type { APIRoute } from 'astro';
import { R2CommentStorage } from '../lib/r2-client.js';
import type { Comment } from '../lib/r2-client.js';

interface CommentSubmission {
  postId: string;
  author: string;
  email?: string;
  content: string;
}

function validateCommentSubmission(data: unknown): data is CommentSubmission {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const submission = data as CommentSubmission;

  return (
    typeof submission.postId === 'string' &&
    submission.postId.length > 0 &&
    typeof submission.author === 'string' &&
    submission.author.length > 0 &&
    typeof submission.content === 'string' &&
    submission.content.length > 0 &&
    (submission.email === undefined || typeof submission.email === 'string')
  );
}

function sanitizeContent(content: string): string {
  // Basic XSS prevention - strip HTML tags
  return content.replace(/<[^>]*>/g, '');
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const data = await request.json();

    if (!validateCommentSubmission(data)) {
      return new Response(
        JSON.stringify({ error: 'Invalid comment data' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

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

    const config = typeof __R2_COMMENTS_CONFIG__ !== 'undefined'
      ? __R2_COMMENTS_CONFIG__
      : { requireApproval: false, enableSpamFilter: false };

    // Create comment object
    const comment: Comment = {
      id: storage.generateCommentId(),
      postId: data.postId,
      author: data.author.trim(),
      email: data.email?.trim(),
      content: sanitizeContent(data.content.trim()),
      timestamp: Date.now(),
      approved: !config.requireApproval, // Auto-approve if not required
    };

    // Basic spam detection
    if (config.enableSpamFilter) {
      const spamIndicators = [
        /https?:\/\//gi, // Multiple URLs
        /\b(viagra|cialis|casino|crypto|bitcoin)\b/gi, // Common spam words
      ];

      const urlCount = (comment.content.match(/https?:\/\//gi) || []).length;
      const hasSpamWords = spamIndicators.some((pattern) =>
        pattern.test(comment.content)
      );

      if (urlCount > 2 || hasSpamWords) {
        comment.approved = false; // Mark for review
      }
    }

    await storage.saveComment(comment);

    return new Response(
      JSON.stringify({
        success: true,
        comment: {
          id: comment.id,
          pending: !comment.approved,
        },
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error saving comment:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to save comment' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

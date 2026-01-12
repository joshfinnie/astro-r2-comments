import type { R2Bucket } from '@cloudflare/workers-types';

export interface Comment {
  id: string;
  postId: string;
  author: string;
  email?: string;
  content: string;
  timestamp: number;
  approved?: boolean;
}

export interface R2CommentStorageOptions {
  bucket: R2Bucket;
  prefix?: string;
}

export class R2CommentStorage {
  private bucket: R2Bucket;
  private prefix: string;

  constructor(options: R2CommentStorageOptions) {
    this.bucket = options.bucket;
    this.prefix = options.prefix || 'comments/';
  }

  private getCommentKey(postId: string, commentId: string): string {
    return `${this.prefix}${postId}/${commentId}.json`;
  }

  private getPostCommentsPrefix(postId: string): string {
    return `${this.prefix}${postId}/`;
  }

  async saveComment(comment: Comment): Promise<void> {
    const key = this.getCommentKey(comment.postId, comment.id);
    await this.bucket.put(key, JSON.stringify(comment), {
      httpMetadata: {
        contentType: 'application/json',
      },
    });
  }

  async getComment(postId: string, commentId: string): Promise<Comment | null> {
    const key = this.getCommentKey(postId, commentId);
    const object = await this.bucket.get(key);

    if (!object) {
      return null;
    }

    const text = await object.text();
    return JSON.parse(text) as Comment;
  }

  async getCommentsForPost(postId: string): Promise<Comment[]> {
    const prefix = this.getPostCommentsPrefix(postId);
    const listed = await this.bucket.list({ prefix });

    const comments: Comment[] = [];

    for (const object of listed.objects) {
      const obj = await this.bucket.get(object.key);
      if (obj) {
        const text = await obj.text();
        comments.push(JSON.parse(text) as Comment);
      }
    }

    // Sort by timestamp, newest first
    return comments.sort((a, b) => b.timestamp - a.timestamp);
  }

  async deleteComment(postId: string, commentId: string): Promise<void> {
    const key = this.getCommentKey(postId, commentId);
    await this.bucket.delete(key);
  }

  generateCommentId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

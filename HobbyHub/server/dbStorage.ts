import { eq, asc, desc, like } from 'drizzle-orm';
import { db } from './db';
import { IStorage } from './storage';
import {
  users, posts, comments,
  type User, type InsertUser,
  type Post, type InsertPost,
  type Comment, type InsertComment
} from '@shared/schema';

export class DBStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  // Post methods
  async getPosts(): Promise<Post[]> {
    return db.select().from(posts);
  }

  async getPostById(id: number): Promise<Post | undefined> {
    const result = await db.select().from(posts).where(eq(posts.id, id));
    return result[0];
  }

  async searchPosts(searchTerm: string): Promise<Post[]> {
    if (!searchTerm) {
      return this.getPosts();
    }
    
    return db.select()
      .from(posts)
      .where(like(posts.title, `%${searchTerm}%`));
  }

  async createPost(post: InsertPost): Promise<Post> {
    const result = await db.insert(posts).values(post).returning();
    return result[0];
  }

  async updatePost(id: number, post: Partial<InsertPost>): Promise<Post | undefined> {
    const result = await db.update(posts)
      .set(post)
      .where(eq(posts.id, id))
      .returning();
    
    return result[0];
  }

  async deletePost(id: number): Promise<boolean> {
    // First, delete all comments associated with this post
    await db.delete(comments).where(eq(comments.postId, id));
    
    // Then delete the post
    const result = await db.delete(posts).where(eq(posts.id, id)).returning();
    return result.length > 0;
  }

  async upvotePost(id: number): Promise<Post | undefined> {
    // Get the current post to get the upvotes count
    const currentPost = await this.getPostById(id);
    if (!currentPost) return undefined;
    
    // Increment the upvotes count
    const result = await db.update(posts)
      .set({ upvotes: currentPost.upvotes + 1 })
      .where(eq(posts.id, id))
      .returning();
    
    return result[0];
  }

  // Comment methods
  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    return db.select()
      .from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(asc(comments.createdAt));
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const result = await db.insert(comments).values(comment).returning();
    return result[0];
  }

  async deleteComment(id: number): Promise<boolean> {
    const result = await db.delete(comments).where(eq(comments.id, id)).returning();
    return result.length > 0;
  }

  // My Posts features
  async getPostsByUserId(userId: string): Promise<Post[]> {
    return db.select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt));
  }
}
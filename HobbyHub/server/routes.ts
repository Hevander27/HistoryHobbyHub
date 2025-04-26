import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPostSchema, 
  insertCommentSchema 
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Post routes
  app.get("/api/posts", async (req: Request, res: Response) => {
    try {
      const { search, sortBy } = req.query;
      
      let posts = search 
        ? await storage.searchPosts(search as string)
        : await storage.getPosts();
      
      // Sort posts if sortBy parameter is provided
      if (sortBy === "upvotes") {
        posts.sort((a, b) => b.upvotes - a.upvotes);
      } else {
        // Default: sort by creation time (newest first)
        posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      
      res.json(posts);
    } catch (error) {
      console.error("Error getting posts:", error);
      res.status(500).json({ message: "Failed to get posts" });
    }
  });

  app.get("/api/posts/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const post = await storage.getPostById(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json(post);
    } catch (error) {
      console.error("Error getting post:", error);
      res.status(500).json({ message: "Failed to get post" });
    }
  });

  app.post("/api/posts", async (req: Request, res: Response) => {
    try {
      const validationResult = insertPostSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const post = await storage.createPost(validationResult.data);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.patch("/api/posts/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      // Validate request body against post schema
      const validationResult = insertPostSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const updatedPost = await storage.updatePost(id, validationResult.data);
      if (!updatedPost) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json(updatedPost);
    } catch (error) {
      console.error("Error updating post:", error);
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  app.delete("/api/posts/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const success = await storage.deletePost(id);
      if (!success) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  app.post("/api/posts/:id/upvote", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const updatedPost = await storage.upvotePost(id);
      if (!updatedPost) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json(updatedPost);
    } catch (error) {
      console.error("Error upvoting post:", error);
      res.status(500).json({ message: "Failed to upvote post" });
    }
  });

  // Comment routes
  app.get("/api/posts/:id/comments", async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const comments = await storage.getCommentsByPostId(postId);
      res.json(comments);
    } catch (error) {
      console.error("Error getting comments:", error);
      res.status(500).json({ message: "Failed to get comments" });
    }
  });

  app.post("/api/comments", async (req: Request, res: Response) => {
    try {
      const validationResult = insertCommentSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const comment = await storage.createComment(validationResult.data);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // My Posts feature - Get posts by user ID
  app.get("/api/users/:userId/posts", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const posts = await storage.getPostsByUserId(userId);
      
      // Sort posts (newest first)
      posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      res.json(posts);
    } catch (error) {
      console.error("Error getting user posts:", error);
      res.status(500).json({ message: "Failed to get user posts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

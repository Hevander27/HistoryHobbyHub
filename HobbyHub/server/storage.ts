import { 
  users, type User, type InsertUser,
  posts, type Post, type InsertPost,
  comments, type Comment, type InsertComment
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User methods (kept from original schema)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Post methods
  getPosts(): Promise<Post[]>;
  getPostById(id: number): Promise<Post | undefined>;
  searchPosts(searchTerm: string): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, post: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  upvotePost(id: number): Promise<Post | undefined>;
  getPostsByUserId(userId: string): Promise<Post[]>; // Added for My Posts feature
  
  // Comment methods
  getCommentsByPostId(postId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private posts: Map<number, Post>;
  private comments: Map<number, Comment>;
  private userId: number;
  private postId: number;
  private commentId: number;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.comments = new Map();
    this.userId = 1;
    this.postId = 1;
    this.commentId = 1;
    
    // Initialize with sample history posts
    this.initSampleData();
  }

  private initSampleData() {
    // Sample post data
    const samplePosts: InsertPost[] = [
      {
        title: "Who is your favorite Founding Father?",
        content: "Mine is Thomas Jefferson! What about you?",
        imageUrl: "https://i.imgur.com/0OpthtU.jpg"
      },
      {
        title: "I'm in love with the Holy Roman Empire",
        content: "The complexity and structure of the Holy Roman Empire has fascinated me for years. Does anyone else find this period particularly interesting?",
        imageUrl: "https://i.imgur.com/example1.jpg"
      },
      {
        title: "Was Caesar overrated?",
        content: "Julius Caesar is often portrayed as one of history's greatest leaders, but was he really that exceptional? Let's discuss!",
        imageUrl: "https://i.imgur.com/example2.jpg"
      },
      {
        title: "Favorite historical documentaries?",
        content: "I'm looking for recommendations on good historical documentaries to watch this weekend. Any suggestions?",
        imageUrl: ""
      }
    ];
    
    // Create sample posts with different timestamps and upvotes
    const now = new Date();
    
    // Post 1 - 21 hours ago with 3 upvotes
    const post1Time = new Date(now);
    post1Time.setHours(post1Time.getHours() - 21);
    const post1 = this.createPostInternal(samplePosts[0], post1Time);
    post1.upvotes = 3;
    
    // Post 2 - 5 days ago with 23 upvotes
    const post2Time = new Date(now);
    post2Time.setDate(post2Time.getDate() - 5);
    const post2 = this.createPostInternal(samplePosts[1], post2Time);
    post2.upvotes = 23;
    
    // Post 3 - 1 week ago with 11 upvotes
    const post3Time = new Date(now);
    post3Time.setDate(post3Time.getDate() - 7);
    const post3 = this.createPostInternal(samplePosts[2], post3Time);
    post3.upvotes = 11;
    
    // Post 4 - 1 week ago with 7 upvotes
    const post4Time = new Date(now);
    post4Time.setDate(post4Time.getDate() - 7);
    const post4 = this.createPostInternal(samplePosts[3], post4Time);
    post4.upvotes = 7;
    
    // Add comments to the first post
    this.createCommentInternal({
      postId: 1,
      content: "Did you forget about Ben Franklin?"
    });
    
    this.createCommentInternal({
      postId: 1,
      content: "It's got to be George Washington!"
    });
  }

  private createPostInternal(post: InsertPost, createdAt: Date): Post {
    const id = this.postId++;
    const newPost: Post = {
      id,
      title: post.title,
      content: post.content || "",
      imageUrl: post.imageUrl || "",
      upvotes: 0,
      createdAt,
      userId: post.userId || null
    };
    this.posts.set(id, newPost);
    return newPost;
  }

  private createCommentInternal(comment: InsertComment): Comment {
    const id = this.commentId++;
    const newComment: Comment = {
      id,
      postId: comment.postId,
      content: comment.content,
      createdAt: new Date()
    };
    this.comments.set(id, newComment);
    return newComment;
  }

  // User methods (kept from original)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Post methods
  async getPosts(): Promise<Post[]> {
    return Array.from(this.posts.values());
  }

  async getPostById(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async searchPosts(searchTerm: string): Promise<Post[]> {
    if (!searchTerm) return this.getPosts();
    
    const term = searchTerm.toLowerCase();
    return Array.from(this.posts.values()).filter(post => 
      post.title.toLowerCase().includes(term)
    );
  }

  async createPost(post: InsertPost): Promise<Post> {
    return this.createPostInternal(post, new Date());
  }

  async updatePost(id: number, post: Partial<InsertPost>): Promise<Post | undefined> {
    const existingPost = this.posts.get(id);
    if (!existingPost) return undefined;

    const updatedPost: Post = {
      ...existingPost,
      ...post,
    };
    
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async deletePost(id: number): Promise<boolean> {
    // Delete post
    const deleted = this.posts.delete(id);
    
    // Delete all comments for this post
    for (const [commentId, comment] of this.comments.entries()) {
      if (comment.postId === id) {
        this.comments.delete(commentId);
      }
    }
    
    return deleted;
  }

  async upvotePost(id: number): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    const updatedPost = { ...post, upvotes: post.upvotes + 1 };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  // Comment methods
  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.postId === postId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    return this.createCommentInternal(comment);
  }

  async deleteComment(id: number): Promise<boolean> {
    return this.comments.delete(id);
  }

  // My Posts feature
  async getPostsByUserId(userId: string): Promise<Post[]> {
    if (!userId) return [];
    
    return Array.from(this.posts.values())
      .filter(post => post.userId && post.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const storage = new MemStorage();

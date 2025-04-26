import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useUser } from "@/hooks/use-user-context";
import PostCard from "@/components/posts/PostCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Post } from "@shared/schema";

// This component is similar to Home.tsx but specifically for user's own posts
const MyPosts = () => {
  const [, setLocation] = useLocation();
  const { userId } = useUser();

  // Fetch posts for this user
  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: [`/api/users/${userId}/posts`],
    enabled: !!userId, // Only run query if userId exists
  });

  // Navigate to create post page
  const handleCreatePost = () => {
    setLocation("/create");
  };

  if (!userId) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <h1 className="text-2xl font-bold mb-4">My Posts</h1>
      
      <Alert className="mb-6 bg-neutral-light">
        <Info className="h-4 w-4" />
        <AlertDescription>
          This page shows posts you've created in this browser. A unique ID has been assigned to track your posts.
        </AlertDescription>
      </Alert>

      {/* Posts Feed */}
      <div className="space-y-4">
        {isLoading ? (
          // Skeleton loading state
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-4">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-6 w-full max-w-md mb-2" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))
        ) : posts && posts.length > 0 ? (
          // Render posts
          posts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          // No posts state
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h3 className="text-xl font-medium mb-2">No posts found</h3>
            <p className="text-neutral-dark mb-4">
              You haven't created any posts yet.
            </p>
            <Button onClick={handleCreatePost}>
              Create your first post
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPosts;
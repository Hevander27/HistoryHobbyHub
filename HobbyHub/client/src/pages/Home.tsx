import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import PostCard from "@/components/posts/PostCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Post } from "@shared/schema";

const Home = () => {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const searchTerm = searchParams.get("search") || "";
  const [sortOrder, setSortOrder] = useState<"newest" | "popular">("newest");

  // Format the API endpoint based on sorting and search parameters
  const endpoint = `/api/posts?${
    searchTerm ? `search=${encodeURIComponent(searchTerm)}&` : ""
  }sortBy=${sortOrder === "popular" ? "upvotes" : "createdAt"}`;

  // Fetch posts with sorting and filtering
  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: [endpoint],
  });

  // Update URL when sort order changes without triggering a re-fetch
  useEffect(() => {
    if (sortOrder && searchTerm) {
      setLocation(`/?search=${encodeURIComponent(searchTerm)}&sortBy=${sortOrder}`, {
        replace: true,
      });
    } else if (sortOrder) {
      setLocation(`/?sortBy=${sortOrder}`, { replace: true });
    }
  }, [sortOrder, searchTerm, setLocation]);

  const handleSortByNewest = () => {
    setSortOrder("newest");
  };

  const handleSortByPopular = () => {
    setSortOrder("popular");
  };

  return (
    <div className="animate-fadeIn">
      {/* Sorting Controls */}
      <div className="mb-6 flex items-center">
        <span className="mr-2 text-neutral-dark">Order by:</span>
        <div className="flex space-x-2">
          <Button
            variant={sortOrder === "newest" ? "default" : "outline"}
            size="sm"
            className={
              sortOrder === "newest"
                ? "bg-primary text-white rounded-full"
                : "text-neutral-dark rounded-full border border-neutral-medium"
            }
            onClick={handleSortByNewest}
          >
            Newest
          </Button>
          <Button
            variant={sortOrder === "popular" ? "default" : "outline"}
            size="sm"
            className={
              sortOrder === "popular"
                ? "bg-primary text-white rounded-full"
                : "text-neutral-dark rounded-full border border-neutral-medium"
            }
            onClick={handleSortByPopular}
          >
            Most Popular
          </Button>
        </div>
      </div>

      {/* Search results notification */}
      {searchTerm && (
        <div className="mb-4">
          <h2 className="text-lg font-medium">
            Search results for: <span className="italic">"{searchTerm}"</span>
          </h2>
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {isLoading ? (
          // Skeleton loading state
          Array.from({ length: 5 }).map((_, index) => (
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
              {searchTerm
                ? `No posts matching "${searchTerm}" were found.`
                : "There are no posts yet."}
            </p>
            <Button onClick={() => setLocation("/create")}>
              Create the first post
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

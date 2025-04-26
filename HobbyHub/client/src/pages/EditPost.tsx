import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import PostForm from "@/components/posts/PostForm";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { InsertPost } from "@shared/schema";

const EditPost = () => {
  const { id } = useParams();
  const postId = Number(id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch the post details
  const { data: post, isLoading } = useQuery({
    queryKey: [`/api/posts/${postId}`],
  });

  const updatePostMutation = useMutation({
    mutationFn: async (postData: Partial<InsertPost>) => {
      const res = await apiRequest("PATCH", `/api/posts/${postId}`, postData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Post updated",
        description: "Your post has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setLocation(`/posts/${postId}`);
    },
    onError: (error) => {
      toast({
        title: "Failed to update post",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (values: InsertPost) => {
    updatePostMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-6 text-red-500">Post not found</h1>
        <p>The post you're trying to edit doesn't exist or has been deleted.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold mb-6">Update Post</h1>
      <PostForm 
        defaultValues={{
          title: post.title,
          content: post.content,
          imageUrl: post.imageUrl
        }}
        onSubmit={handleSubmit} 
        submitLabel="Update Post" 
      />
    </div>
  );
};

export default EditPost;

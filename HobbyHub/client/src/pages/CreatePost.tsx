import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import PostForm from "@/components/posts/PostForm";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user-context";
import type { InsertPost } from "@shared/schema";

const CreatePost = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { userId } = useUser();

  const createPostMutation = useMutation({
    mutationFn: async (postData: InsertPost) => {
      const res = await apiRequest("POST", "/api/posts", postData);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Post created",
        description: "Your post has been published successfully.",
      });
      setLocation(`/posts/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Failed to create post",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (values: InsertPost) => {
    // Add the userId to the post data
    const postData = {
      ...values,
      userId: userId
    };
    createPostMutation.mutate(postData);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Post</h1>
      <PostForm 
        onSubmit={handleSubmit} 
        submitLabel="Create Post" 
      />
    </div>
  );
};

export default CreatePost;

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import CommentSection from "@/components/posts/CommentSection";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ThumbsUp, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

const PostDetail = () => {
  const { id } = useParams();
  const postId = Number(id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch the post details
  const { data: post, isLoading } = useQuery({
    queryKey: [`/api/posts/${postId}`],
  });

  // Upvote post mutation
  const upvoteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/posts/${postId}/upvote`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to upvote",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/posts/${postId}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Failed to delete post",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleUpvote = () => {
    upvoteMutation.mutate();
  };

  const handleEdit = () => {
    setLocation(`/posts/${postId}/edit`);
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate();
    setIsDeleteDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-8 w-full max-w-md mb-4" />
            <Skeleton className="h-32 w-full mb-6" />
            <Skeleton className="h-56 w-full mb-6" />
            <div className="border-t border-b border-neutral-medium py-3 px-2">
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
          <div className="px-6 pb-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4 mb-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-4 text-red-500">Post not found</h1>
        <p>The post you're looking for doesn't exist or has been deleted.</p>
        <Button className="mt-4" onClick={() => setLocation("/")}>
          Back to Home
        </Button>
      </div>
    );
  }

  const formattedDate = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
  });

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="text-sm text-neutral-dark mb-2">
            Posted {formattedDate}
          </div>

          <h1 className="text-2xl font-bold mb-4">{post.title}</h1>

          {post.content && (
            <div className="mb-6">
              <p>{post.content}</p>
            </div>
          )}

          {post.imageUrl && (
            <div className="mb-6">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="rounded-lg max-h-[400px] w-auto"
              />
            </div>
          )}

          <div className="flex items-center justify-between border-t border-b border-neutral-medium py-3 px-2">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUpvote}
                disabled={upvoteMutation.isPending}
                className="flex items-center hover:bg-neutral-light p-2 rounded-full transition-colors"
              >
                <ThumbsUp className="mr-1 h-4 w-4" />
                <span>{post.upvotes}</span>
                <span className="ml-1">upvotes</span>
              </Button>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="flex items-center text-neutral-dark hover:bg-neutral-light p-2 rounded-full transition-colors"
              >
                <Edit className="mr-1 h-4 w-4" />
                <span>Edit</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="flex items-center text-destructive hover:bg-neutral-light p-2 rounded-full transition-colors"
              >
                <Trash2 className="mr-1 h-4 w-4" />
                <span>Delete</span>
              </Button>
            </div>
          </div>
        </div>

        <CommentSection postId={postId} />
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PostDetail;

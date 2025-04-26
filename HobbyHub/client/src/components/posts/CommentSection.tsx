import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insertCommentSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Send } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface CommentSectionProps {
  postId: number;
}

const CommentSection = ({ postId }: CommentSectionProps) => {
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch comments for this post
  const { data: comments, isLoading } = useQuery({
    queryKey: [`/api/posts/${postId}/comments`],
  });

  // Create new comment
  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const comment = { postId, content };
      const validatedComment = insertCommentSchema.parse(comment);
      const res = await apiRequest("POST", "/api/comments", validatedComment);
      return res.json();
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add comment",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleAddComment = () => {
    if (newComment.trim()) {
      commentMutation.mutate(newComment);
    }
  };

  const handleCommentKeyup = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newComment.trim()) {
      commentMutation.mutate(newComment);
    }
  };

  return (
    <div className="px-6 pb-6">
      <h3 className="text-lg font-medium mb-4">Comments</h3>
      
      <div className="space-y-4 mb-6">
        {isLoading ? (
          // Loading state
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="border-l-4 border-neutral-medium pl-4 py-2">
              <Skeleton className="h-5 w-full max-w-md" />
            </div>
          ))
        ) : comments?.length > 0 ? (
          // Comments list
          comments.map((comment: any) => (
            <div key={comment.id} className="border-l-4 border-neutral-medium pl-4 py-2">
              <p className="text-neutral-dark">- {comment.content}</p>
              <small className="text-xs text-neutral-dark">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </small>
            </div>
          ))
        ) : (
          <p className="text-neutral-dark italic">No comments yet. Be the first to comment!</p>
        )}
      </div>
      
      <div className="relative">
        <Input 
          type="text" 
          placeholder="Leave a comment..." 
          className="w-full p-3 pr-12 border border-neutral-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyUp={handleCommentKeyup}
          disabled={commentMutation.isPending}
        />
        <button 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary hover:text-secondary"
          onClick={handleAddComment}
          disabled={commentMutation.isPending || !newComment.trim()}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default CommentSection;

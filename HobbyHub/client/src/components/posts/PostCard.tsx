import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Post } from "@shared/schema";

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const formattedDate = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
  });

  return (
    <Card className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <Link href={`/posts/${post.id}`}>
        <CardContent className="p-4">
          <div className="text-sm text-neutral-dark mb-2">
            Posted {formattedDate}
          </div>
          <h2 className="text-xl font-semibold mb-1">{post.title}</h2>
          <div className="flex items-center text-neutral-dark">
            <ThumbsUp className="h-4 w-4 mr-1" />
            <span>{post.upvotes}</span>
            <span className="ml-1">upvotes</span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default PostCard;

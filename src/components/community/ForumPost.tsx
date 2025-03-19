import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquare, Flag, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface ForumPostProps {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
  };
  date: string;
  likes: number;
  replies: number;
  tags?: string[];
  isLiked?: boolean;
  onLike?: (id: string) => void;
  onReply?: (id: string) => void;
  onReport?: (id: string) => void;
  onShare?: (id: string) => void;
  "aria-posinset"?: number;
  "aria-setsize"?: number;
}

const ForumPost = ({
  id,
  title,
  content,
  author,
  date,
  likes,
  replies,
  tags = [],
  isLiked = false,
  onLike,
  onReply,
  onReport,
  onShare,
  ...rest
}: ForumPostProps) => {
  const { t } = useTranslation();
  const handleLike = () => onLike?.(id);
  const handleReply = () => onReply?.(id);
  const handleReport = () => onReport?.(id);
  const handleShare = () => onShare?.(id);

  // Fix for date handling - check if date is a valid date string first
  const getFormattedDate = () => {
    try {
      // Check if it's a valid date first
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        // If it's not a valid date, just return the original string
        return { formattedDate: date, readableDate: date };
      }
      return {
        formattedDate: dateObj.toISOString(),
        readableDate: dateObj.toLocaleDateString(),
      };
    } catch (e) {
      // Fallback if there's any error
      return { formattedDate: date, readableDate: date };
    }
  };

  const { formattedDate, readableDate } = getFormattedDate();

  return (
    <Card role="article" aria-labelledby={`post-title-${id}`} {...rest}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={author.avatar}
                alt={`${author.name}'s profile picture`}
              />
              <AvatarFallback aria-hidden="true">
                {author.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold" id={`post-title-${id}`}>
                {title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">
                  {author.name}
                </span>
                <span
                  className="text-sm text-muted-foreground"
                  aria-hidden="true"
                >
                  •
                </span>
                <time
                  className="text-sm text-muted-foreground"
                  dateTime={formattedDate}
                >
                  {readableDate}
                </time>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-foreground whitespace-pre-line">{content}</p>

        {tags && tags.length > 0 && (
          <div
            className="flex flex-wrap gap-2 mt-3"
            aria-label={t("community.postTags", "Post tags")}
          >
            {tags.map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t border-border/40 pt-3 flex justify-between">
        <div className="flex gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-1 text-xs ${isLiked ? "text-primary" : ""}`}
                  onClick={handleLike}
                  aria-pressed={isLiked}
                >
                  <ThumbsUp
                    className={`h-4 w-4 ${isLiked ? "fill-primary" : ""}`}
                    aria-hidden="true"
                  />
                  {likes > 0 && <span>{likes}</span>}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isLiked
                  ? t("community.unlike", "Unlike this post")
                  : t("community.like", "Like this post")}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-xs"
                  onClick={handleReply}
                >
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  {replies > 0 && <span>{replies}</span>}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {t("community.reply", "Reply to this post")}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleReport}>
                  <Flag className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">
                    {t("community.report", "Report this post")}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {t("community.report", "Report this post")}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">
                    {t("community.share", "Share this post")}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {t("community.share", "Share this post")}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ForumPost;

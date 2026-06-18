import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import SpotlightCard from "@/components/fx/spotlight-card";
import type { PostMeta } from "@/types/blog";

export function PostCard({ post }: { post: PostMeta }) {
  return (
    <SpotlightCard className="h-full">
      <Link
        href={`/blog/${post.slug}`}
        className="group flex h-full flex-col gap-2 rounded-xl border p-5 transition-colors hover:bg-muted/50"
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <time dateTime={post.date}>{post.date}</time>
          {post.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
        <h3 className="font-heading text-lg font-semibold group-hover:underline">
          {post.title}
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{post.summary}</p>
      </Link>
    </SpotlightCard>
  );
}

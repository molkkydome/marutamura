import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ExternalLink, MessageCircle, Reply, Send, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const postId = parseInt(id ?? "0");
  const { user, isAuthenticated } = useAuth();

  const { data: post, isLoading } = trpc.posts.get.useQuery({ id: postId });
  const { data: comments = [] } = trpc.comments.list.useQuery({ postId });

  const utils = trpc.useUtils();

  const deleteMutation = trpc.posts.delete.useMutation({
    onSuccess: () => {
      toast.success("投稿を削除しました");
      window.history.back();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-12 flex justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-12 text-center text-muted-foreground">
          投稿が見つかりません
        </div>
      </div>
    );
  }

  const displayName = post.userNickname || post.userName || "匿名";
  const isOwner = user?.id === post.userId;
  const isAdmin = user?.role === "admin";

  // スレッド構造を構築
  const topComments = comments.filter((c) => !c.parentId);
  const getChildren = (parentId: number) =>
    comments.filter((c) => c.parentId === parentId);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8 max-w-3xl mx-auto">
        {/* 戻るボタン */}
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1.5 mb-6 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            一覧に戻る
          </Button>
        </Link>

        {/* 投稿カード */}
        <div className="bg-card rounded-3xl overflow-hidden shadow-lg border border-border/50 mb-8">
          {/* カテゴリーバナー */}
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{ backgroundColor: post.categoryColor + "20" }}
          >
            <div className="flex items-center gap-2">
              <span
                className="px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: post.categoryColor }}
              >
                {post.categoryEmoji} {post.categoryName}
              </span>
            </div>
            {(isOwner || isAdmin) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm("この投稿を削除しますか？")) {
                    deleteMutation.mutate({ id: postId });
                  }
                }}
                className="text-muted-foreground hover:text-destructive gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                削除
              </Button>
            )}
          </div>

          {/* 画像 */}
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full max-h-96 object-cover"
            />
          )}

          {/* コンテンツ */}
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-3">{post.title}</h1>
            {post.description && (
              <p className="text-muted-foreground leading-relaxed mb-4 whitespace-pre-wrap">
                {post.description}
              </p>
            )}
            {post.linkUrl && (
              <a
                href={post.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-sm font-medium mb-4"
              >
                <ExternalLink className="w-4 h-4" />
                {post.linkTitle || post.linkUrl}
              </a>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t border-border/50">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                {displayName.charAt(0)}
              </div>
              <span className="font-medium text-foreground">{displayName}</span>
              <span>·</span>
              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ja })}</span>
            </div>
          </div>
        </div>

        {/* コメントセクション */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">コメント ({comments.length})</h2>
          </div>

          {/* コメント投稿フォーム */}
          {isAuthenticated && (
            <CommentForm postId={postId} onSuccess={() => utils.comments.list.invalidate({ postId })} />
          )}

          {/* コメント一覧 */}
          {topComments.length > 0 ? (
            <div className="space-y-3">
              {topComments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  children={getChildren(comment.id)}
                  postId={postId}
                  currentUserId={user?.id}
                  isAdmin={isAdmin}
                  onDelete={() => utils.comments.list.invalidate({ postId })}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              まだコメントがありません。最初のコメントを投稿しよう！
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── コメントフォーム ────────────────────────────────────────────────────────

function CommentForm({
  postId,
  parentId,
  onSuccess,
  onCancel,
  placeholder = "コメントを書く...",
}: {
  postId: number;
  parentId?: number;
  onSuccess: () => void;
  onCancel?: () => void;
  placeholder?: string;
}) {
  const [content, setContent] = useState("");
  const createMutation = trpc.comments.create.useMutation({
    onSuccess: () => {
      setContent("");
      onSuccess();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="bg-card rounded-2xl p-4 border border-border/50">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="rounded-xl resize-none border-0 bg-muted/50 focus-visible:ring-1"
        rows={3}
        maxLength={1000}
      />
      <div className="flex justify-end gap-2 mt-3">
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            キャンセル
          </Button>
        )}
        <Button
          size="sm"
          onClick={() =>
            createMutation.mutate({ postId, content: content.trim(), parentId })
          }
          disabled={!content.trim() || createMutation.isPending}
          className="gap-1.5 bg-gradient-to-r from-primary to-accent text-white border-0 hover:opacity-90"
        >
          <Send className="w-4 h-4" />
          送信
        </Button>
      </div>
    </div>
  );
}

// ── コメントアイテム ────────────────────────────────────────────────────────

type CommentData = {
  id: number;
  postId: number;
  userId: number;
  parentId: number | null;
  content: string;
  createdAt: Date;
  userNickname: string | null;
  userName: string | null;
};

function CommentItem({
  comment,
  children,
  postId,
  currentUserId,
  isAdmin,
  onDelete,
}: {
  comment: CommentData;
  children: CommentData[];
  postId: number;
  currentUserId?: number;
  isAdmin?: boolean;
  onDelete: () => void;
}) {
  const [showReply, setShowReply] = useState(false);
  const utils = trpc.useUtils();
  const displayName = comment.userNickname || comment.userName || "匿名";
  const isOwner = currentUserId === comment.userId;

  const deleteMutation = trpc.comments.delete.useMutation({
    onSuccess: () => {
      onDelete();
      utils.comments.list.invalidate({ postId });
    },
  });

  return (
    <div className="bg-card rounded-2xl p-4 border border-border/50">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-accent/60 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {displayName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{displayName}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ja })}
            </span>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => setShowReply(!showReply)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <Reply className="w-3.5 h-3.5" />
              返信
            </button>
            {(isOwner || isAdmin) && (
              <button
                onClick={() => deleteMutation.mutate({ id: comment.id })}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                削除
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 返信フォーム */}
      {showReply && (
        <div className="mt-3 ml-11">
          <CommentForm
            postId={postId}
            parentId={comment.id}
            onSuccess={() => {
              setShowReply(false);
              utils.comments.list.invalidate({ postId });
            }}
            onCancel={() => setShowReply(false)}
            placeholder={`${displayName}さんに返信...`}
          />
        </div>
      )}

      {/* 子コメント */}
      {children.length > 0 && (
        <div className="mt-3 ml-11 space-y-2">
          {children.map((child) => (
            <div key={child.id} className="bg-muted/50 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {(child.userNickname || child.userName || "?").charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-xs">
                      {child.userNickname || child.userName || "匿名"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(child.createdAt), { addSuffix: true, locale: ja })}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{child.content}</p>
                </div>
                {(currentUserId === child.userId || isAdmin) && (
                  <button
                    onClick={() => deleteMutation.mutate({ id: child.id })}
                    className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

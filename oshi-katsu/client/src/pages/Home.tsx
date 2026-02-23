import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import {
  ExternalLink,
  ImagePlus,
  Link2,
  MessageCircle,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

type PostFormData = {
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  linkTitle: string;
};

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [postCategoryId, setPostCategoryId] = useState<number | null>(null);
  const [form, setForm] = useState<PostFormData>({
    title: "",
    description: "",
    imageUrl: "",
    linkUrl: "",
    linkTitle: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const { data: categories = [] } = trpc.categories.list.useQuery();
  const { data: posts = [], isLoading: postsLoading } = selectedCategoryId
    ? trpc.posts.listByCategory.useQuery({ categoryId: selectedCategoryId })
    : trpc.posts.list.useQuery();

  const myPostQuery = trpc.posts.myPostInCategory.useQuery(
    { categoryId: postCategoryId! },
    { enabled: isAuthenticated && postCategoryId !== null }
  );

  const uploadMutation = trpc.posts.uploadImage.useMutation();
  const createMutation = trpc.posts.create.useMutation({
    onSuccess: () => {
      utils.posts.list.invalidate();
      utils.posts.listByCategory.invalidate();
      setShowPostForm(false);
      resetForm();
      toast.success("投稿しました！");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const resetForm = () => {
    setForm({ title: "", description: "", imageUrl: "", linkUrl: "", linkTitle: "" });
    setImageFile(null);
    setImagePreview("");
    setPostCategoryId(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!postCategoryId || !form.title.trim()) return;

    let imageUrl = form.imageUrl;
    if (imageFile && imagePreview) {
      setIsUploading(true);
      try {
        const base64 = imagePreview.split(",")[1];
        const result = await uploadMutation.mutateAsync({
          base64,
          mimeType: imageFile.type,
          fileName: imageFile.name,
        });
        imageUrl = result.url;
      } catch {
        toast.error("画像のアップロードに失敗しました");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    createMutation.mutate({
      categoryId: postCategoryId,
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      imageUrl: imageUrl || undefined,
      linkUrl: form.linkUrl.trim() || undefined,
      linkTitle: form.linkTitle.trim() || undefined,
    });
  };

  const openPostForm = (categoryId: number) => {
    if (!isAuthenticated) {
      window.location.href = "/join";
      return;
    }
    setPostCategoryId(categoryId);
    setShowPostForm(true);
  };

  const selectedCategory = categories.find((c) => c.id === postCategoryId);
  const alreadyPosted = myPostQuery.data !== undefined && myPostQuery.data !== null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ヒーローセクション */}
      <section
        className="relative py-16 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.95 0.04 295) 0%, oklch(0.97 0.03 340) 50%, oklch(0.96 0.03 200) 100%)",
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {["📚", "🎬", "🎵", "🌟", "💬", "🎨", "📺", "💡"].map((emoji, i) => (
            <div
              key={i}
              className="absolute text-3xl opacity-15"
              style={{
                left: `${5 + i * 12}%`,
                top: `${10 + (i % 4) * 20}%`,
                transform: `rotate(${-20 + i * 8}deg)`,
              }}
            >
              {emoji}
            </div>
          ))}
        </div>
        <div className="container relative text-center">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium text-primary mb-4 shadow-sm">
            <Sparkles className="w-4 h-4" />
            今年の1つを共有しよう
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-4">
            あなたの「推し」を教えて
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            本、映画、音楽、言葉…今年いちばん心に刺さったものを、みんなと共有しよう。
          </p>
          {!isAuthenticated && !loading && (
            <div className="mt-6">
              <Link href="/join">
                <Button className="h-12 px-8 rounded-full bg-gradient-to-r from-primary to-accent text-white border-0 hover:opacity-90 shadow-lg text-base font-semibold gap-2">
                  <Plus className="w-5 h-5" />
                  招待コードで参加
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* カテゴリーフィルター */}
      <section className="sticky top-16 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 py-3">
        <div className="container">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedCategoryId(null)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategoryId === null
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-md"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              すべて
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() =>
                  setSelectedCategoryId(selectedCategoryId === cat.id ? null : cat.id)
                }
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategoryId === cat.id
                    ? "text-white shadow-md"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
                style={
                  selectedCategoryId === cat.id
                    ? { backgroundColor: cat.color }
                    : {}
                }
              >
                <span>{cat.emoji}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* メインコンテンツ */}
      <main className="container py-8">
        {/* カテゴリー別投稿エリア */}
        {selectedCategoryId === null ? (
          <div className="space-y-12">
            {categories.map((cat) => {
              const catPosts = posts.filter((p) => p.categoryId === cat.id);
              return (
                <section key={cat.id}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                        style={{ backgroundColor: cat.color + "20" }}
                      >
                        {cat.emoji}
                      </span>
                      <h2 className="text-xl font-bold">{cat.name}</h2>
                      <span className="text-sm text-muted-foreground">
                        {catPosts.length}件
                      </span>
                    </div>
                    {isAuthenticated && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openPostForm(cat.id)}
                        className="gap-1.5 rounded-full border-2 hover:border-primary hover:text-primary"
                      >
                        <Plus className="w-4 h-4" />
                        投稿する
                      </Button>
                    )}
                  </div>
                  {catPosts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {catPosts.map((post) => (
                        <PostCard key={post.id} post={post} categoryColor={cat.color} />
                      ))}
                    </div>
                  ) : (
                    <div
                      className="rounded-2xl border-2 border-dashed p-8 text-center"
                      style={{ borderColor: cat.color + "40" }}
                    >
                      <p className="text-muted-foreground text-sm">
                        まだ投稿がありません
                      </p>
                      {isAuthenticated && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openPostForm(cat.id)}
                          className="mt-2 gap-1.5"
                          style={{ color: cat.color }}
                        >
                          <Plus className="w-4 h-4" />
                          最初の投稿をする
                        </Button>
                      )}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        ) : (
          <div>
            {(() => {
              const cat = categories.find((c) => c.id === selectedCategoryId);
              return (
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{cat?.emoji}</span>
                    <h2 className="text-2xl font-bold">{cat?.name}</h2>
                    <span className="text-muted-foreground">{posts.length}件</span>
                  </div>
                  {isAuthenticated && (
                    <Button
                      onClick={() => openPostForm(selectedCategoryId)}
                      className="gap-1.5 rounded-full bg-gradient-to-r from-primary to-accent text-white border-0 hover:opacity-90"
                    >
                      <Plus className="w-4 h-4" />
                      投稿する
                    </Button>
                  )}
                </div>
              );
            })()}
            {postsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="rounded-2xl bg-muted animate-pulse h-64" />
                ))}
              </div>
            ) : posts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {posts.map((post) => {
                  const cat = categories.find((c) => c.id === post.categoryId);
                  return (
                    <PostCard key={post.id} post={post} categoryColor={cat?.color ?? "#888"} />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                まだ投稿がありません
              </div>
            )}
          </div>
        )}
      </main>

      {/* 投稿フォームダイアログ */}
      <Dialog open={showPostForm} onOpenChange={(open) => { if (!open) { setShowPostForm(false); resetForm(); } }}>
        <DialogContent className="max-w-lg rounded-3xl p-0 overflow-hidden">
          <div
            className="p-6 pb-4"
            style={{
              background: `linear-gradient(135deg, ${selectedCategory?.color ?? "#7209B7"}20, ${selectedCategory?.color ?? "#F72585"}10)`,
            }}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <span className="text-2xl">{selectedCategory?.emoji}</span>
                {selectedCategory?.name}に投稿
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {alreadyPosted && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-sm text-amber-700">
                このカテゴリーにはすでに投稿があります。編集は投稿詳細ページから行えます。
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                タイトル <span className="text-destructive">*</span>
              </label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="今年いちばんの推しは？"
                className="rounded-xl"
                maxLength={200}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">コメント</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="どんなところが好き？なぜ推すの？"
                className="rounded-xl resize-none"
                rows={3}
                maxLength={2000}
              />
            </div>

            {/* 画像アップロード */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">画像</label>
              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden">
                  <img src={imagePreview} alt="preview" className="w-full h-48 object-cover" />
                  <button
                    onClick={() => { setImageFile(null); setImagePreview(""); }}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
                >
                  <ImagePlus className="w-6 h-6" />
                  <span className="text-sm">画像を選択</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>

            {/* リンク */}
            <div>
              <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                <Link2 className="w-4 h-4" />
                リンク
              </label>
              <Input
                value={form.linkUrl}
                onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                placeholder="https://..."
                className="rounded-xl mb-2"
              />
              <Input
                value={form.linkTitle}
                onChange={(e) => setForm({ ...form, linkTitle: e.target.value })}
                placeholder="リンクのタイトル（任意）"
                className="rounded-xl"
                maxLength={200}
              />
            </div>
          </div>

          <div className="p-6 pt-0 flex gap-3">
            <Button
              variant="outline"
              onClick={() => { setShowPostForm(false); resetForm(); }}
              className="flex-1 rounded-2xl"
            >
              キャンセル
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!form.title.trim() || alreadyPosted || createMutation.isPending || isUploading}
              className="flex-1 rounded-2xl bg-gradient-to-r from-primary to-accent text-white border-0 hover:opacity-90"
            >
              {createMutation.isPending || isUploading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                "投稿する ✨"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── 投稿カード ─────────────────────────────────────────────────────────────

type PostCardProps = {
  post: {
    id: number;
    title: string;
    description: string | null;
    imageUrl: string | null;
    linkUrl: string | null;
    linkTitle: string | null;
    createdAt: Date;
    userNickname: string | null;
    userName: string | null;
    categoryName: string;
    categoryEmoji: string;
    categoryColor: string;
  };
  categoryColor: string;
};

function PostCard({ post, categoryColor }: PostCardProps) {
  const displayName = post.userNickname || post.userName || "匿名";

  return (
    <Link href={`/posts/${post.id}`}>
      <div
        className="group bg-card rounded-2xl overflow-hidden shadow-sm border border-border/50 card-hover cursor-pointer h-full flex flex-col"
      >
        {/* 画像 */}
        {post.imageUrl ? (
          <div className="relative h-48 overflow-hidden">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div
              className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white shadow-sm"
              style={{ backgroundColor: categoryColor }}
            >
              {post.categoryEmoji} {post.categoryName}
            </div>
          </div>
        ) : (
          <div
            className="h-24 flex items-center justify-center text-4xl"
            style={{ backgroundColor: categoryColor + "15" }}
          >
            {post.categoryEmoji}
          </div>
        )}

        {/* コンテンツ */}
        <div className="p-4 flex flex-col flex-1">
          {!post.imageUrl && (
            <div
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white mb-2 self-start"
              style={{ backgroundColor: categoryColor }}
            >
              {post.categoryEmoji} {post.categoryName}
            </div>
          )}
          <h3 className="font-bold text-base leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          {post.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">
              {post.description}
            </p>
          )}
          {post.linkUrl && (
            <div className="flex items-center gap-1 text-xs text-primary mb-3">
              <ExternalLink className="w-3 h-3" />
              <span className="truncate">{post.linkTitle || post.linkUrl}</span>
            </div>
          )}
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
            <span className="text-xs font-medium text-muted-foreground">
              {displayName}
            </span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageCircle className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

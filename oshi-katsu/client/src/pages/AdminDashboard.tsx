import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import {
  Copy,
  Edit2,
  Link2,
  Plus,
  Settings,
  Tag,
  ToggleLeft,
  ToggleRight,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

const PRESET_COLORS = [
  "#FF6B9D", "#C77DFF", "#4CC9F0", "#F72585",
  "#7209B7", "#3A0CA3", "#4361EE", "#06D6A0",
  "#FB8500", "#023E8A", "#E63946", "#2DC653",
];

const PRESET_EMOJIS = [
  "📚","🎨","🎬","📺","🎵","🌟","💡","💬",
  "🎮","🍕","✈️","🏆","💎","🔥","🌈","🎭",
];

export default function AdminDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  const utils = trpc.useUtils();
  const { data: categories = [] } = trpc.categories.listAll.useQuery();
  const { data: users = [] } = trpc.admin.users.useQuery();
  const { data: invites = [] } = trpc.invites.list.useQuery();

  const [showCatForm, setShowCatForm] = useState(false);
  const [editCat, setEditCat] = useState<{
    id?: number; name: string; emoji: string; color: string; sortOrder: number;
  } | null>(null);

  const createCatMutation = trpc.categories.create.useMutation({
    onSuccess: () => {
      utils.categories.listAll.invalidate();
      utils.categories.list.invalidate();
      setShowCatForm(false);
      setEditCat(null);
      toast.success("カテゴリーを作成しました");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateCatMutation = trpc.categories.update.useMutation({
    onSuccess: () => {
      utils.categories.listAll.invalidate();
      utils.categories.list.invalidate();
      setShowCatForm(false);
      setEditCat(null);
      toast.success("カテゴリーを更新しました");
    },
    onError: (err) => toast.error(err.message),
  });

  const createInviteMutation = trpc.invites.create.useMutation({
    onSuccess: (data) => {
      utils.invites.list.invalidate();
      toast.success(
        <div>
          <p className="font-medium">招待コードを発行しました</p>
          <p className="text-sm font-mono mt-1">{data.code}</p>
        </div>
      );
    },
    onError: (err) => toast.error(err.message),
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-12 flex justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    navigate("/");
    return null;
  }

  const handleSaveCat = () => {
    if (!editCat?.name.trim()) return;
    if (editCat.id) {
      updateCatMutation.mutate({
        id: editCat.id,
        name: editCat.name,
        emoji: editCat.emoji,
        color: editCat.color,
        sortOrder: editCat.sortOrder,
      });
    } else {
      createCatMutation.mutate({
        name: editCat.name,
        emoji: editCat.emoji,
        color: editCat.color,
        sortOrder: editCat.sortOrder,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8 max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">管理者ダッシュボード</h1>
            <p className="text-sm text-muted-foreground">コミュニティの管理を行います</p>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "メンバー数", value: users.length, icon: Users, color: "#4CC9F0" },
            { label: "カテゴリー数", value: categories.filter(c => c.isActive).length, icon: Tag, color: "#C77DFF" },
            { label: "招待コード", value: invites.filter(i => i.isActive).length, icon: Link2, color: "#06D6A0" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + "20" }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <span className="text-sm text-muted-foreground">{label}</span>
              </div>
              <p className="text-3xl font-bold gradient-text">{value}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="categories">
          <TabsList className="rounded-2xl bg-secondary mb-6">
            <TabsTrigger value="categories" className="rounded-xl gap-1.5">
              <Tag className="w-4 h-4" />カテゴリー
            </TabsTrigger>
            <TabsTrigger value="invites" className="rounded-xl gap-1.5">
              <Link2 className="w-4 h-4" />招待コード
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-xl gap-1.5">
              <Users className="w-4 h-4" />メンバー
            </TabsTrigger>
          </TabsList>

          {/* カテゴリー管理 */}
          <TabsContent value="categories">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">カテゴリー一覧</h2>
              <Button
                size="sm"
                onClick={() => {
                  setEditCat({ name: "", emoji: "✨", color: "#FF6B9D", sortOrder: categories.length + 1 });
                  setShowCatForm(true);
                }}
                className="gap-1.5 rounded-full bg-gradient-to-r from-primary to-accent text-white border-0 hover:opacity-90"
              >
                <Plus className="w-4 h-4" />
                追加
              </Button>
            </div>
            <div className="space-y-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-card rounded-2xl p-4 border border-border/50 flex items-center gap-4"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: cat.color + "20" }}
                  >
                    {cat.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{cat.name}</span>
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">順序: {cat.sortOrder}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateCatMutation.mutate({ id: cat.id, isActive: !cat.isActive })
                      }
                      className="text-muted-foreground hover:text-primary transition-colors"
                      title={cat.isActive ? "無効化" : "有効化"}
                    >
                      {cat.isActive ? (
                        <ToggleRight className="w-6 h-6 text-primary" />
                      ) : (
                        <ToggleLeft className="w-6 h-6" />
                      )}
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditCat({
                          id: cat.id,
                          name: cat.name,
                          emoji: cat.emoji,
                          color: cat.color,
                          sortOrder: cat.sortOrder,
                        });
                        setShowCatForm(true);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* 招待コード管理 */}
          <TabsContent value="invites">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">招待コード一覧</h2>
              <Button
                size="sm"
                onClick={() =>
                  createInviteMutation.mutate({ origin: window.location.origin })
                }
                disabled={createInviteMutation.isPending}
                className="gap-1.5 rounded-full bg-gradient-to-r from-primary to-accent text-white border-0 hover:opacity-90"
              >
                <Plus className="w-4 h-4" />
                発行
              </Button>
            </div>
            <div className="space-y-2">
              {invites.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">招待コードがありません</p>
              ) : (
                invites.map((invite) => (
                  <div
                    key={invite.id}
                    className="bg-card rounded-2xl p-4 border border-border/50 flex items-center gap-4"
                  >
                    <code
                      className="font-mono text-base font-bold tracking-widest px-3 py-1 rounded-xl"
                      style={{
                        backgroundColor: invite.isActive ? "oklch(0.92 0.04 295)" : "oklch(0.92 0.01 0)",
                        color: invite.isActive ? "oklch(0.35 0.18 295)" : "oklch(0.55 0.01 0)",
                      }}
                    >
                      {invite.code}
                    </code>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">
                        {invite.isActive ? (
                          <span className="text-green-600 font-medium">有効</span>
                        ) : (
                          <span className="text-muted-foreground">使用済み</span>
                        )}
                        {" · "}
                        {formatDistanceToNow(new Date(invite.createdAt), { addSuffix: true, locale: ja })}
                      </p>
                    </div>
                    {invite.isActive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const url = `${window.location.origin}/join?code=${invite.code}`;
                          navigator.clipboard.writeText(url);
                          toast.success("招待URLをコピーしました");
                        }}
                        className="gap-1.5 text-muted-foreground hover:text-primary"
                      >
                        <Copy className="w-4 h-4" />
                        URLコピー
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* メンバー管理 */}
          <TabsContent value="users">
            <h2 className="text-lg font-semibold mb-4">メンバー一覧</h2>
            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="bg-card rounded-2xl p-4 border border-border/50 flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold flex-shrink-0">
                    {(u.nickname || u.name || "?").charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{u.nickname || u.name || "未設定"}</span>
                      {u.role === "admin" && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          管理者
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      参加: {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true, locale: ja })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* カテゴリー編集ダイアログ */}
      <Dialog open={showCatForm} onOpenChange={(open) => { if (!open) { setShowCatForm(false); setEditCat(null); } }}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>
              {editCat?.id ? "カテゴリーを編集" : "カテゴリーを追加"}
            </DialogTitle>
          </DialogHeader>
          {editCat && (
            <div className="space-y-4 mt-2">
              {/* プレビュー */}
              <div className="flex items-center justify-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-md"
                  style={{ backgroundColor: editCat.color + "20" }}
                >
                  {editCat.emoji}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">カテゴリー名</label>
                <Input
                  value={editCat.name}
                  onChange={(e) => setEditCat({ ...editCat, name: e.target.value })}
                  placeholder="例：映画"
                  className="rounded-xl"
                  maxLength={64}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">絵文字</label>
                <div className="grid grid-cols-8 gap-2 mb-2">
                  {PRESET_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setEditCat({ ...editCat, emoji })}
                      className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all ${
                        editCat.emoji === emoji
                          ? "ring-2 ring-primary bg-primary/10 scale-110"
                          : "hover:bg-secondary"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <Input
                  value={editCat.emoji}
                  onChange={(e) => setEditCat({ ...editCat, emoji: e.target.value })}
                  placeholder="または直接入力"
                  className="rounded-xl"
                  maxLength={8}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">カラー</label>
                <div className="grid grid-cols-6 gap-2 mb-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setEditCat({ ...editCat, color })}
                      className={`w-9 h-9 rounded-xl transition-all ${
                        editCat.color === color ? "ring-2 ring-offset-2 ring-foreground scale-110" : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <Input
                  value={editCat.color}
                  onChange={(e) => setEditCat({ ...editCat, color: e.target.value })}
                  placeholder="#FF6B9D"
                  className="rounded-xl font-mono"
                  maxLength={32}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">表示順</label>
                <Input
                  type="number"
                  value={editCat.sortOrder}
                  onChange={(e) => setEditCat({ ...editCat, sortOrder: parseInt(e.target.value) || 0 })}
                  className="rounded-xl"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => { setShowCatForm(false); setEditCat(null); }}
                  className="flex-1 rounded-2xl"
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleSaveCat}
                  disabled={!editCat.name.trim() || createCatMutation.isPending || updateCatMutation.isPending}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-primary to-accent text-white border-0 hover:opacity-90"
                >
                  {editCat.id ? "更新する" : "追加する"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

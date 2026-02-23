import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { CategoryBadge } from "@/components/MemphisDecorations";
import { Link } from "wouter";
import { Users, Search } from "lucide-react";
import { useState } from "react";

const CATEGORY_FILTERS = [
  { value: "all", label: "すべて" },
  { value: "health", label: "🏃 健康" },
  { value: "study", label: "📚 勉強" },
  { value: "work", label: "💼 仕事" },
  { value: "hobby", label: "🎨 趣味" },
  { value: "relationship", label: "❤️ 人間関係" },
  { value: "finance", label: "💰 お金" },
  { value: "other", label: "✨ その他" },
];

export default function Community() {
  const { data: feed, isLoading } = trpc.community.feed.useQuery();
  const { data: members } = trpc.community.members.useQuery();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = (feed ?? []).filter((g) => {
    const matchSearch = g.title.toLowerCase().includes(search.toLowerCase()) ||
      (g.userName ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || g.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="container py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-black flex items-center gap-2">
          <Users size={24} />
          仲間の目標
        </h1>
        <span
          className="ml-auto text-xs font-black px-2.5 py-1 border-2 border-black rounded-full"
          style={{ background: "var(--color-mint)" }}
        >
          {members?.length ?? 0}人
        </span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          className="w-full border-2 border-black rounded-xl pl-9 pr-4 py-3 text-sm font-semibold bg-input focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="目標や名前で検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        {CATEGORY_FILTERS.map((f) => (
          <button
            key={f.value}
            className="memphis-btn flex-shrink-0 px-3 py-1.5 text-xs font-black whitespace-nowrap"
            style={{
              background: categoryFilter === f.value ? "var(--color-coral)" : "var(--card)",
              color: categoryFilter === f.value ? "white" : "inherit",
            }}
            onClick={() => setCategoryFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Members strip */}
      {members && members.length > 0 && (
        <div>
          <h2 className="text-sm font-black mb-2">部員一覧</h2>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4">
            {members.map((m) => (
              <div key={m.id} className="flex flex-col items-center gap-1 flex-shrink-0">
                <div
                  className="w-12 h-12 rounded-full border-[2.5px] border-black flex items-center justify-center font-black text-base"
                  style={{ background: "var(--color-lilac)", boxShadow: "2px 2px 0 black" }}
                >
                  {m.name?.[0] ?? "?"}
                </div>
                <span className="text-[10px] font-bold max-w-[48px] truncate">{m.name ?? "匿名"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feed */}
      <section>
        <h2 className="text-base font-black mb-3">
          みんなの目標 ({filtered.length})
        </h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="memphis-card h-24 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="memphis-card p-8 text-center">
            <p className="text-3xl mb-2">🔍</p>
            <p className="font-bold text-sm">該当する目標がありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((g) => (
              <CommunityCard key={g.id} goal={g} currentUserId={user?.id} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const CHEER_EMOJIS = ["👏", "🔥", "💪", "🌟"];

function CommunityCard({ goal, currentUserId }: {
  goal: {
    id: number;
    title: string;
    description?: string | null;
    category: string;
    deadline?: Date | null;
    isCompleted: boolean;
    userName?: string | null;
    userId: number;
  };
  currentUserId?: number;
}) {
  const utils = trpc.useUtils();
  const { data: cheersData } = trpc.cheers.getForGoal.useQuery({ goalId: goal.id });
  const cheerGoal = trpc.cheers.cheerGoal.useMutation({
    onSuccess: () => {
      utils.cheers.getForGoal.invalidate({ goalId: goal.id });
      utils.community.feed.invalidate();
    },
  });

  const isOwner = currentUserId === goal.userId;
  const myCheer = cheersData?.find((c) => c.fromUserId === currentUserId);

  return (
    <div className="memphis-card p-4 space-y-3">
      {/* User info */}
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center text-xs font-black flex-shrink-0"
          style={{ background: "var(--color-lilac)" }}
        >
          {goal.userName?.[0] ?? "?"}
        </div>
        <span className="text-xs font-bold flex-1">{goal.userName ?? "匿名"}</span>
        {goal.isCompleted && (
          <span className="text-xs font-black px-2 py-0.5 border-2 border-black rounded-full" style={{ background: "var(--color-yellow)" }}>
            🎉 達成！
          </span>
        )}
      </div>

      {/* Goal */}
      <Link href={`/goals/${goal.id}`}>
        <div className="cursor-pointer">
          <p className="font-black text-sm">{goal.title}</p>
          {goal.description && (
            <p className="text-xs font-semibold text-muted-foreground mt-1 line-clamp-2">{goal.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <CategoryBadge category={goal.category} />
            {goal.deadline && (
              <span className="text-xs font-semibold text-muted-foreground">
                {new Date(goal.deadline).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}まで
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Cheer actions */}
      {!isOwner && currentUserId && (
        <div className="flex gap-2 pt-1 border-t-2 border-dashed border-black/20">
          {CHEER_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              className="memphis-btn w-9 h-9 text-base flex items-center justify-center"
              style={{
                background: myCheer?.emoji === emoji ? "var(--color-yellow)" : "var(--muted)",
              }}
              onClick={() => cheerGoal.mutate({ goalId: goal.id, emoji })}
            >
              {emoji}
            </button>
          ))}
          <span className="ml-auto text-xs font-bold self-center text-muted-foreground">
            {cheersData?.length ?? 0} 応援
          </span>
        </div>
      )}
      {isOwner && cheersData && cheersData.length > 0 && (
        <div className="flex gap-1 pt-1 border-t-2 border-dashed border-black/20 flex-wrap">
          {cheersData.map((c) => (
            <span key={c.id} className="text-sm">{c.emoji}</span>
          ))}
          <span className="text-xs font-bold self-center text-muted-foreground ml-1">
            {cheersData.length}人が応援中！
          </span>
        </div>
      )}
    </div>
  );
}

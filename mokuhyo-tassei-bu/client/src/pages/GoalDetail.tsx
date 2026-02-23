import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { CategoryBadge, ProgressRing } from "@/components/MemphisDecorations";
import { Link, useParams, useLocation } from "wouter";
import { ArrowLeft, Edit, Trash2, Plus, Send, CheckSquare, Square } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const CHEER_EMOJIS = ["👏", "🔥", "💪", "🌟", "❤️", "🎉"];

export default function GoalDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0");
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [newItem, setNewItem] = useState("");
  const [comment, setComment] = useState("");
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.goals.get.useQuery({ id }, { enabled: !!id });

  const toggleItem = trpc.checklist.toggleItem.useMutation({
    onMutate: async (vars) => {
      await utils.goals.get.cancel({ id });
      const prev = utils.goals.get.getData({ id });
      utils.goals.get.setData({ id }, (old) => {
        if (!old) return old;
        return {
          ...old,
          checklist: old.checklist.map((item) =>
            item.id === vars.id ? { ...item, isChecked: vars.isChecked } : item
          ),
          progress: vars.isChecked
            ? Math.min(100, old.progress + Math.round(100 / old.checklist.length))
            : Math.max(0, old.progress - Math.round(100 / old.checklist.length)),
        };
      });
      return { prev };
    },
    onError: (_, __, ctx) => {
      if (ctx?.prev) utils.goals.get.setData({ id }, ctx.prev);
    },
    onSettled: () => utils.goals.get.invalidate({ id }),
  });

  const addItem = trpc.checklist.addItem.useMutation({
    onSuccess: () => {
      setNewItem("");
      utils.goals.get.invalidate({ id });
    },
  });

  const deleteItem = trpc.checklist.deleteItem.useMutation({
    onSuccess: () => utils.goals.get.invalidate({ id }),
  });

  const cheerGoal = trpc.cheers.cheerGoal.useMutation({
    onSuccess: () => utils.goals.get.invalidate({ id }),
  });

  const commentGoal = trpc.cheers.commentGoal.useMutation({
    onSuccess: () => {
      setComment("");
      utils.goals.get.invalidate({ id });
    },
  });

  const deleteGoal = trpc.goals.delete.useMutation({
    onSuccess: () => {
      toast.success("目標を削除しました");
      navigate("/goals");
    },
  });

  const markComplete = trpc.goals.update.useMutation({
    onSuccess: () => {
      toast.success("🎉 目標達成おめでとう！");
      utils.goals.get.invalidate({ id });
    },
  });

  if (isLoading) {
    return (
      <div className="container py-6 space-y-4">
        <div className="memphis-card h-40 animate-pulse" />
        <div className="memphis-card h-60 animate-pulse" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container py-8 text-center">
        <p className="font-bold">目標が見つかりません</p>
        <Link href="/goals"><button className="memphis-btn mt-4 px-4 py-2 font-black" style={{ background: "var(--color-yellow)" }}>戻る</button></Link>
      </div>
    );
  }

  const { goal, checklist, progress, cheers, comments } = data;
  const isOwner = user?.id === goal.userId;
  const myCheer = cheers.find((c) => c.fromUserId === user?.id);

  return (
    <div className="container py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/goals">
          <button className="memphis-btn w-9 h-9 flex items-center justify-center" style={{ background: "var(--color-yellow)" }}>
            <ArrowLeft size={18} />
          </button>
        </Link>
        <h1 className="flex-1 text-xl font-black truncate">{goal.title}</h1>
        {isOwner && (
          <div className="flex gap-2">
            <Link href={`/goals/${id}/edit`}>
              <button className="memphis-btn w-9 h-9 flex items-center justify-center" style={{ background: "var(--color-mint)" }}>
                <Edit size={16} />
              </button>
            </Link>
            <button
              className="memphis-btn w-9 h-9 flex items-center justify-center"
              style={{ background: "var(--color-coral)" }}
              onClick={() => {
                if (confirm("目標を削除しますか？")) deleteGoal.mutate({ id });
              }}
            >
              <Trash2 size={16} color="white" />
            </button>
          </div>
        )}
      </div>

      {/* Goal info card */}
      <div className="memphis-card p-5">
        <div className="flex items-center gap-4 mb-4">
          <ProgressRing percent={progress} size={72} />
          <div className="flex-1">
            <CategoryBadge category={goal.category} />
            {goal.deadline && (
              <p className="text-xs font-semibold text-muted-foreground mt-1">
                期限: {new Date(goal.deadline).toLocaleDateString("ja-JP")}
              </p>
            )}
            {goal.isCompleted && (
              <p className="text-sm font-black mt-1" style={{ color: "var(--color-coral)" }}>🎉 達成済み！</p>
            )}
          </div>
        </div>
        {goal.description && (
          <p className="text-sm font-semibold text-muted-foreground">{goal.description}</p>
        )}
        {isOwner && !goal.isCompleted && progress === 100 && (
          <button
            className="memphis-btn w-full mt-4 py-3 font-black text-white"
            style={{ background: "var(--color-coral)" }}
            onClick={() => markComplete.mutate({ id, isCompleted: true })}
          >
            🎉 目標達成を記録する！
          </button>
        )}
      </div>

      {/* Checklist */}
      <div className="memphis-card p-5">
        <h2 className="text-base font-black mb-4 flex items-center gap-2">
          <CheckSquare size={18} /> チェックリスト
        </h2>
        <div className="space-y-2 mb-4">
          {checklist.length === 0 && (
            <p className="text-sm font-semibold text-muted-foreground text-center py-2">
              タスクを追加しましょう
            </p>
          )}
          {checklist.map((item) => (
            <div key={item.id} className="flex items-center gap-3 group">
              <button
                onClick={() => isOwner && toggleItem.mutate({ id: item.id, goalId: id, isChecked: !item.isChecked })}
                className="flex-shrink-0"
                disabled={!isOwner}
              >
                {item.isChecked ? (
                  <CheckSquare size={22} style={{ color: "var(--color-coral)" }} />
                ) : (
                  <Square size={22} className="text-muted-foreground" />
                )}
              </button>
              <span className={`flex-1 text-sm font-semibold ${item.isChecked ? "line-through text-muted-foreground" : ""}`}>
                {item.title}
              </span>
              {isOwner && (
                <button
                  onClick={() => deleteItem.mutate({ id: item.id, goalId: id })}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} className="text-muted-foreground" />
                </button>
              )}
            </div>
          ))}
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <input
              className="flex-1 border-2 border-black rounded-xl px-3 py-2 text-sm font-semibold bg-input focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="新しいタスクを追加..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newItem.trim()) {
                  addItem.mutate({ goalId: id, title: newItem.trim(), order: checklist.length });
                }
              }}
            />
            <button
              className="memphis-btn w-10 h-10 flex items-center justify-center text-white"
              style={{ background: "var(--color-coral)" }}
              onClick={() => {
                if (newItem.trim()) addItem.mutate({ goalId: id, title: newItem.trim(), order: checklist.length });
              }}
            >
              <Plus size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Cheers */}
      <div className="memphis-card p-5">
        <h2 className="text-base font-black mb-3">応援 🎉 ({cheers.length})</h2>
        {isAuthenticated && !isOwner && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {CHEER_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                className="memphis-btn w-10 h-10 text-lg flex items-center justify-center"
                style={{
                  background: myCheer?.emoji === emoji ? "var(--color-yellow)" : "var(--color-mint)",
                }}
                onClick={() => cheerGoal.mutate({ goalId: id, emoji })}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
        {cheers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {cheers.map((c) => (
              <div key={c.id} className="flex items-center gap-1 bg-muted rounded-full px-2 py-1 border border-black">
                <span className="text-sm">{c.emoji}</span>
                <span className="text-xs font-bold">{c.userName ?? "?"}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comments */}
      <div className="memphis-card p-5">
        <h2 className="text-base font-black mb-3">コメント 💬 ({comments.length})</h2>
        <div className="space-y-3 mb-4">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div
                className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center text-xs font-black flex-shrink-0"
                style={{ background: "var(--color-lilac)" }}
              >
                {c.userName?.[0] ?? "?"}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold">{c.userName ?? "匿名"}</p>
                <p className="text-sm font-semibold">{c.content}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(c.createdAt).toLocaleDateString("ja-JP")}
                </p>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-sm font-semibold text-muted-foreground text-center py-2">
              最初のコメントを送ろう！
            </p>
          )}
        </div>
        {isAuthenticated && !isOwner && (
          <div className="flex gap-2">
            <input
              className="flex-1 border-2 border-black rounded-xl px-3 py-2 text-sm font-semibold bg-input focus:outline-none"
              placeholder="応援メッセージを送る..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && comment.trim()) {
                  commentGoal.mutate({ goalId: id, content: comment.trim() });
                }
              }}
            />
            <button
              className="memphis-btn w-10 h-10 flex items-center justify-center text-white"
              style={{ background: "var(--color-coral)" }}
              onClick={() => {
                if (comment.trim()) commentGoal.mutate({ goalId: id, content: comment.trim() });
              }}
            >
              <Send size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

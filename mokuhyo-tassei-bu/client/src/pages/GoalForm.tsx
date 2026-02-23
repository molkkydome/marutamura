import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link, useParams, useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "health", label: "🏃 健康", color: "var(--color-mint)" },
  { value: "study", label: "📚 勉強", color: "var(--color-sky)" },
  { value: "work", label: "💼 仕事", color: "var(--color-yellow)" },
  { value: "hobby", label: "🎨 趣味", color: "var(--color-lilac)" },
  { value: "relationship", label: "❤️ 人間関係", color: "var(--color-coral)" },
  { value: "finance", label: "💰 お金", color: "var(--color-mint)" },
  { value: "other", label: "✨ その他", color: "var(--color-peach)" },
] as const;

type Category = (typeof CATEGORIES)[number]["value"];

export default function GoalForm() {
  const params = useParams<{ id: string }>();
  const id = params.id ? parseInt(params.id) : undefined;
  const isEdit = !!id;
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("other");
  const [deadline, setDeadline] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const { data: existing } = trpc.goals.get.useQuery({ id: id! }, { enabled: isEdit });

  useEffect(() => {
    if (existing?.goal) {
      const g = existing.goal;
      setTitle(g.title);
      setDescription(g.description ?? "");
      setCategory(g.category as Category);
      setDeadline(g.deadline ? new Date(g.deadline).toISOString().split("T")[0] : "");
      setIsPublic(g.isPublic);
    }
  }, [existing]);

  const createGoal = trpc.goals.create.useMutation({
    onSuccess: (data) => {
      toast.success("目標を作成しました！🎯");
      navigate(`/goals/${data.id}`);
    },
    onError: () => toast.error("作成に失敗しました"),
  });

  const updateGoal = trpc.goals.update.useMutation({
    onSuccess: () => {
      toast.success("目標を更新しました！");
      navigate(`/goals/${id}`);
    },
    onError: () => toast.error("更新に失敗しました"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      deadline: deadline ? new Date(deadline).getTime() : undefined,
      isPublic,
    };
    if (isEdit && id) {
      updateGoal.mutate({ id, ...payload });
    } else {
      createGoal.mutate(payload);
    }
  };

  if (!isAuthenticated) {
    return <div className="container py-8 text-center font-bold">ログインが必要です</div>;
  }

  const isPending = createGoal.isPending || updateGoal.isPending;

  return (
    <div className="container py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={isEdit ? `/goals/${id}` : "/goals"}>
          <button className="memphis-btn w-9 h-9 flex items-center justify-center" style={{ background: "var(--color-yellow)" }}>
            <ArrowLeft size={18} />
          </button>
        </Link>
        <h1 className="text-2xl font-black">{isEdit ? "目標を編集" : "新しい目標 🎯"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div className="memphis-card p-5 space-y-2">
          <label className="text-sm font-black">目標タイトル *</label>
          <input
            className="w-full border-2 border-black rounded-xl px-4 py-3 text-base font-semibold bg-input focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="例：毎日30分ランニングする"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
          />
        </div>

        {/* Description */}
        <div className="memphis-card p-5 space-y-2">
          <label className="text-sm font-black">詳細・メモ</label>
          <textarea
            className="w-full border-2 border-black rounded-xl px-4 py-3 text-sm font-semibold bg-input focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            placeholder="目標の詳細や動機を書いてみよう..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Category */}
        <div className="memphis-card p-5 space-y-3">
          <label className="text-sm font-black">カテゴリ</label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                className="memphis-btn py-2.5 px-3 text-sm font-black text-left"
                style={{
                  background: category === c.value ? c.color : "var(--card)",
                  borderWidth: category === c.value ? "2.5px" : "2px",
                }}
                onClick={() => setCategory(c.value)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Deadline */}
        <div className="memphis-card p-5 space-y-2">
          <label className="text-sm font-black">期限（任意）</label>
          <input
            type="date"
            className="w-full border-2 border-black rounded-xl px-4 py-3 text-base font-semibold bg-input focus:outline-none focus:ring-2 focus:ring-ring"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        {/* Public toggle */}
        <div className="memphis-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black">仲間に公開する</p>
              <p className="text-xs font-semibold text-muted-foreground">コミュニティに表示されます</p>
            </div>
            <button
              type="button"
              className="memphis-btn w-14 h-7 relative"
              style={{ background: isPublic ? "var(--color-coral)" : "var(--muted)" }}
              onClick={() => setIsPublic(!isPublic)}
            >
              <span
                className="absolute top-0.5 w-6 h-6 rounded-lg border-2 border-black bg-white transition-all"
                style={{ left: isPublic ? "calc(100% - 28px)" : "2px" }}
              />
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending || !title.trim()}
          className="memphis-btn w-full py-4 text-lg font-black text-white disabled:opacity-50"
          style={{ background: "var(--color-coral)" }}
        >
          {isPending ? "保存中..." : isEdit ? "更新する" : "目標を作る！🎯"}
        </button>
      </form>
    </div>
  );
}

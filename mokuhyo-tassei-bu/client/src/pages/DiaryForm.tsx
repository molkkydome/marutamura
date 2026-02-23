import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link, useParams, useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const MOODS = [
  { value: "great", label: "🌟 最高！", color: "var(--color-yellow)" },
  { value: "good", label: "😊 良い", color: "var(--color-mint)" },
  { value: "neutral", label: "😐 普通", color: "var(--color-sky)" },
  { value: "bad", label: "😔 辛い", color: "var(--color-lilac)" },
  { value: "terrible", label: "😭 最悪", color: "var(--color-coral)" },
] as const;

type Mood = (typeof MOODS)[number]["value"];

export default function DiaryForm() {
  const params = useParams<{ id: string }>();
  const id = params.id ? parseInt(params.id) : undefined;
  const isEdit = !!id;
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<Mood>("neutral");
  const [isPublic, setIsPublic] = useState(false);

  const { data: existing } = trpc.diary.get.useQuery({ id: id! }, { enabled: isEdit });

  useEffect(() => {
    if (existing?.entry) {
      const e = existing.entry;
      setTitle(e.title ?? "");
      setContent(e.content);
      setMood((e.mood as Mood) ?? "neutral");
      setIsPublic(e.isPublic);
    }
  }, [existing]);

  const createEntry = trpc.diary.create.useMutation({
    onSuccess: () => {
      toast.success("日記を書きました！📔");
      navigate("/diary");
    },
    onError: () => toast.error("保存に失敗しました"),
  });

  const updateEntry = trpc.diary.update.useMutation({
    onSuccess: () => {
      toast.success("日記を更新しました！");
      navigate("/diary");
    },
    onError: () => toast.error("更新に失敗しました"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    const payload = {
      title: title.trim() || undefined,
      content: content.trim(),
      mood,
      isPublic,
    };
    if (isEdit && id) {
      updateEntry.mutate({ id, ...payload });
    } else {
      createEntry.mutate(payload);
    }
  };

  if (!isAuthenticated) {
    return <div className="container py-8 text-center font-bold">ログインが必要です</div>;
  }

  const isPending = createEntry.isPending || updateEntry.isPending;

  return (
    <div className="container py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/diary">
          <button className="memphis-btn w-9 h-9 flex items-center justify-center" style={{ background: "var(--color-yellow)" }}>
            <ArrowLeft size={18} />
          </button>
        </Link>
        <h1 className="text-2xl font-black">{isEdit ? "日記を編集" : "日記を書く 📔"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Mood */}
        <div className="memphis-card p-5 space-y-3">
          <label className="text-sm font-black">今日の気分は？</label>
          <div className="flex gap-2 flex-wrap">
            {MOODS.map((m) => (
              <button
                key={m.value}
                type="button"
                className="memphis-btn px-3 py-2 text-sm font-black flex-1 min-w-[80px]"
                style={{
                  background: mood === m.value ? m.color : "var(--card)",
                  borderWidth: mood === m.value ? "2.5px" : "2px",
                }}
                onClick={() => setMood(m.value)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="memphis-card p-5 space-y-2">
          <label className="text-sm font-black">タイトル（任意）</label>
          <input
            className="w-full border-2 border-black rounded-xl px-4 py-3 text-base font-semibold bg-input focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="例：初めてのランニング"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
          />
        </div>

        {/* Content */}
        <div className="memphis-card p-5 space-y-2">
          <label className="text-sm font-black">今日の記録 *</label>
          <textarea
            className="w-full border-2 border-black rounded-xl px-4 py-3 text-sm font-semibold bg-input focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            placeholder="今日何があった？何を感じた？何を学んだ？自由に書いてみよう..."
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground text-right font-semibold">{content.length}文字</p>
        </div>

        {/* Public toggle */}
        <div className="memphis-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black">仲間に公開する</p>
              <p className="text-xs font-semibold text-muted-foreground">コミュニティで応援してもらえます</p>
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
          disabled={isPending || !content.trim()}
          className="memphis-btn w-full py-4 text-lg font-black text-white disabled:opacity-50"
          style={{ background: "var(--color-coral)" }}
        >
          {isPending ? "保存中..." : isEdit ? "更新する" : "日記を保存する！📔"}
        </button>
      </form>
    </div>
  );
}

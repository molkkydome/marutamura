import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { MoodBadge } from "@/components/MemphisDecorations";
import { Link } from "wouter";
import { Plus, BookOpen, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Diary() {
  const { isAuthenticated } = useAuth();
  const { data: entries, isLoading } = trpc.diary.list.useQuery(undefined, { enabled: isAuthenticated });
  const utils = trpc.useUtils();

  const deleteEntry = trpc.diary.delete.useMutation({
    onSuccess: () => {
      toast.success("日記を削除しました");
      utils.diary.list.invalidate();
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="container py-8 text-center">
        <p className="font-bold mb-4">ログインが必要です</p>
        <a href={getLoginUrl()} className="memphis-btn px-6 py-3 font-black text-white inline-block" style={{ background: "var(--color-coral)" }}>
          ログイン
        </a>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black flex items-center gap-2">
          <BookOpen size={24} />
          振り返り日記
        </h1>
        <Link href="/diary/new">
          <button
            className="memphis-btn w-10 h-10 flex items-center justify-center text-white"
            style={{ background: "var(--color-coral)" }}
          >
            <Plus size={20} />
          </button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="memphis-card h-28 animate-pulse" />)}
        </div>
      ) : !entries || entries.length === 0 ? (
        <div className="memphis-card p-8 text-center">
          <p className="text-4xl mb-3">📔</p>
          <p className="font-black text-base mb-1">日記がありません</p>
          <p className="text-sm font-semibold text-muted-foreground mb-4">
            今日の気持ちや学びを記録しよう
          </p>
          <Link href="/diary/new">
            <button
              className="memphis-btn px-6 py-3 font-black text-white"
              style={{ background: "var(--color-coral)" }}
            >
              最初の日記を書く！
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="memphis-card p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <MoodBadge mood={entry.mood ?? "neutral"} />
                    <span className="text-xs font-semibold text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleDateString("ja-JP", {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </span>
                  </div>
                  {entry.title && (
                    <p className="font-black text-sm truncate">{entry.title}</p>
                  )}
                  <p className="text-sm font-semibold text-muted-foreground line-clamp-2 mt-1">
                    {entry.content}
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Link href={`/diary/${entry.id}/edit`}>
                    <button
                      className="memphis-btn w-8 h-8 flex items-center justify-center"
                      style={{ background: "var(--color-mint)" }}
                    >
                      <BookOpen size={14} />
                    </button>
                  </Link>
                  <button
                    className="memphis-btn w-8 h-8 flex items-center justify-center"
                    style={{ background: "var(--color-coral)" }}
                    onClick={() => {
                      if (confirm("日記を削除しますか？")) {
                        deleteEntry.mutate({ id: entry.id });
                      }
                    }}
                  >
                    <Trash2 size={14} color="white" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

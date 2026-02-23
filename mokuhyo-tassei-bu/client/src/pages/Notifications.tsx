import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Bell, CheckCheck } from "lucide-react";
import { Link } from "wouter";

const TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  cheer:             { icon: "👏", color: "var(--color-yellow)" },
  comment:           { icon: "💬", color: "var(--color-mint)" },
  deadline_reminder: { icon: "⏰", color: "var(--color-coral)" },
  goal_completed:    { icon: "🎉", color: "var(--color-lilac)" },
  system:            { icon: "📢", color: "var(--color-sky)" },
};

export default function Notifications() {
  const { isAuthenticated } = useAuth();
  const { data: notifications, isLoading } = trpc.notifications.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const utils = trpc.useUtils();

  const markRead = trpc.notifications.markRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
  });

  const markAllRead = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
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

  const unread = (notifications ?? []).filter((n) => !n.isRead);

  return (
    <div className="container py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black flex items-center gap-2">
          <Bell size={24} />
          通知
          {unread.length > 0 && (
            <span
              className="text-sm font-black px-2 py-0.5 border-2 border-black rounded-full text-white"
              style={{ background: "var(--color-coral)" }}
            >
              {unread.length}
            </span>
          )}
        </h1>
        {unread.length > 0 && (
          <button
            className="memphis-btn px-3 py-1.5 text-xs font-black flex items-center gap-1"
            style={{ background: "var(--color-mint)" }}
            onClick={() => markAllRead.mutate()}
          >
            <CheckCheck size={14} />
            全て既読
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="memphis-card h-20 animate-pulse" />)}
        </div>
      ) : !notifications || notifications.length === 0 ? (
        <div className="memphis-card p-8 text-center">
          <p className="text-4xl mb-3">🔔</p>
          <p className="font-black text-base mb-1">通知はありません</p>
          <p className="text-sm font-semibold text-muted-foreground">
            仲間から応援が届くとここに表示されます
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const config = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.system;
            const target = n.relatedGoalId
              ? `/goals/${n.relatedGoalId}`
              : n.relatedDiaryId
              ? `/diary/${n.relatedDiaryId}/edit`
              : undefined;

            const content = (
              <div
                key={n.id}
                className="memphis-card p-4 flex gap-3 cursor-pointer"
                style={{
                  background: n.isRead ? "var(--card)" : config.color,
                  opacity: n.isRead ? 0.8 : 1,
                }}
                onClick={() => {
                  if (!n.isRead) markRead.mutate({ id: n.id });
                }}
              >
                <div
                  className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: n.isRead ? "var(--muted)" : "white" }}
                >
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm">{n.title}</p>
                  <p className="text-xs font-semibold text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(n.createdAt).toLocaleDateString("ja-JP", {
                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
                {!n.isRead && (
                  <div className="w-2.5 h-2.5 rounded-full bg-black flex-shrink-0 mt-1" />
                )}
              </div>
            );

            return target ? (
              <Link key={n.id} href={target}>{content}</Link>
            ) : (
              <div key={n.id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}

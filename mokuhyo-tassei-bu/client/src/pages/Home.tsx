import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { CategoryBadge, ProgressRing } from "@/components/MemphisDecorations";
import { Link } from "wouter";
import { Plus, Target, BookOpen, Users, Zap } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-black border-t-transparent animate-spin" style={{ borderTopColor: "var(--color-coral)" }} />
          <p className="font-bold text-sm">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return <Dashboard user={user} />;
}

function LandingPage() {
  return (
    <div className="min-h-dvh flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        {/* Logo */}
        <div className="relative mb-8">
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center border-[3px] border-black"
            style={{ background: "var(--color-coral)", boxShadow: "5px 5px 0 black" }}
          >
            <span className="text-4xl">🎯</span>
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 border-black" style={{ background: "var(--color-yellow)" }} />
          <div className="absolute -bottom-2 -left-2 w-4 h-4 border-2 border-black rotate-45" style={{ background: "var(--color-mint)" }} />
        </div>

        <h1 className="text-5xl font-black mb-2 leading-tight" style={{ textShadow: "3px 3px 0 rgba(0,0,0,0.15)" }}>
          目標達成部
        </h1>
        <p className="text-base font-bold text-muted-foreground mb-2">
          仲間と一緒に、目標を叶えよう！
        </p>
        <div className="flex items-center gap-2 mb-8">
          <div className="w-2 h-2 rounded-full bg-black" />
          <div className="w-2 h-2 rotate-45 bg-black" />
          <div className="w-2 h-2 rounded-full bg-black" />
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-10">
          {[
            { icon: "🎯", label: "目標設定", color: "var(--color-mint)" },
            { icon: "📈", label: "進捗管理", color: "var(--color-yellow)" },
            { icon: "👏", label: "仲間と応援", color: "var(--color-lilac)" },
            { icon: "📔", label: "振り返り日記", color: "var(--color-sky)" },
          ].map((f) => (
            <div
              key={f.label}
              className="memphis-card p-4 flex flex-col items-center gap-2"
              style={{ background: f.color }}
            >
              <span className="text-2xl">{f.icon}</span>
              <span className="text-xs font-black">{f.label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <a
          href={getLoginUrl()}
          className="memphis-btn w-full max-w-sm py-4 text-lg font-black text-white flex items-center justify-center gap-2"
          style={{ background: "var(--color-coral)" }}
        >
          <Zap size={20} />
          今すぐ参加する！
        </a>
        <p className="text-xs text-muted-foreground mt-3 font-semibold">
          Manus アカウントでログイン
        </p>
      </div>
    </div>
  );
}

function Dashboard({ user }: { user: { name?: string | null } | null }) {
  const { data: goals, isLoading: goalsLoading } = trpc.goals.list.useQuery();
  const { data: publicFeed } = trpc.community.feed.useQuery();

  const myGoals = goals ?? [];
  const activeGoals = myGoals.filter((g) => !g.isCompleted);
  const completedGoals = myGoals.filter((g) => g.isCompleted);
  const recentCommunity = (publicFeed ?? []).slice(0, 3);

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black leading-tight">
            やあ、{user?.name?.split(" ")[0] ?? "部員"}さん！
          </h1>
          <p className="text-sm font-semibold text-muted-foreground">今日も一緒に頑張ろう 💪</p>
        </div>
        <Link href="/profile">
          <button
            className="w-11 h-11 rounded-full border-[2.5px] border-black flex items-center justify-center font-black text-lg"
            style={{ background: "var(--color-lilac)", boxShadow: "2px 2px 0 black" }}
          >
            {user?.name?.[0] ?? "?"}
          </button>
        </Link>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "進行中", value: activeGoals.length, color: "var(--color-mint)" },
          { label: "達成済", value: completedGoals.length, color: "var(--color-yellow)" },
          { label: "全目標", value: myGoals.length, color: "var(--color-lilac)" },
        ].map((s) => (
          <div
            key={s.label}
            className="memphis-card p-3 text-center"
            style={{ background: s.color }}
          >
            <div className="text-2xl font-black">{s.value}</div>
            <div className="text-xs font-bold">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Active Goals */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-black flex items-center gap-2">
            <Target size={18} />
            進行中の目標
          </h2>
          <Link href="/goals">
            <span className="text-xs font-bold underline">すべて見る</span>
          </Link>
        </div>

        {goalsLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="memphis-card p-4 animate-pulse h-20" />
            ))}
          </div>
        ) : activeGoals.length === 0 ? (
          <div className="memphis-card p-6 text-center">
            <p className="text-3xl mb-2">🎯</p>
            <p className="font-bold text-sm">まだ目標がありません</p>
            <Link href="/goals/new">
              <button
                className="memphis-btn mt-3 px-4 py-2 text-sm font-black text-white"
                style={{ background: "var(--color-coral)" }}
              >
                最初の目標を作る！
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activeGoals.slice(0, 3).map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        )}
      </section>

      {/* Community Feed */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-black flex items-center gap-2">
            <Users size={18} />
            仲間の目標
          </h2>
          <Link href="/community">
            <span className="text-xs font-bold underline">すべて見る</span>
          </Link>
        </div>
        {recentCommunity.length === 0 ? (
          <div className="memphis-card p-4 text-center text-sm font-bold text-muted-foreground">
            まだ仲間の目標がありません
          </div>
        ) : (
          <div className="space-y-3">
            {recentCommunity.map((g) => (
              <CommunityGoalCard key={g.id} goal={g} />
            ))}
          </div>
        )}
      </section>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 pb-4">
        <Link href="/goals/new">
          <button
            className="memphis-btn w-full py-3 font-black text-sm text-white flex items-center justify-center gap-2"
            style={{ background: "var(--color-coral)" }}
          >
            <Plus size={16} />
            目標を追加
          </button>
        </Link>
        <Link href="/diary/new">
          <button
            className="memphis-btn w-full py-3 font-black text-sm flex items-center justify-center gap-2"
            style={{ background: "var(--color-yellow)" }}
          >
            <BookOpen size={16} />
            日記を書く
          </button>
        </Link>
      </div>
    </div>
  );
}

function GoalCard({ goal }: { goal: { id: number; title: string; category: string; deadline?: Date | null; isCompleted: boolean } }) {
  const { data } = trpc.goals.get.useQuery({ id: goal.id });
  const progress = data?.progress ?? 0;

  return (
    <Link href={`/goals/${goal.id}`}>
      <div className="memphis-card p-4 flex items-center gap-4 cursor-pointer">
        <ProgressRing percent={progress} size={56} />
        <div className="flex-1 min-w-0">
          <p className="font-black text-sm truncate">{goal.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <CategoryBadge category={goal.category} />
            {goal.deadline && (
              <span className="text-xs font-semibold text-muted-foreground">
                {new Date(goal.deadline).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}まで
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function CommunityGoalCard({ goal }: { goal: { id: number; title: string; category: string; userName?: string | null; userAvatar?: string | null } }) {
  return (
    <Link href={`/goals/${goal.id}`}>
      <div className="memphis-card p-4 cursor-pointer">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-7 h-7 rounded-full border-2 border-black flex items-center justify-center text-xs font-black"
            style={{ background: "var(--color-lilac)" }}
          >
            {goal.userName?.[0] ?? "?"}
          </div>
          <span className="text-xs font-bold">{goal.userName ?? "匿名"}</span>
        </div>
        <p className="font-black text-sm">{goal.title}</p>
        <div className="mt-1">
          <CategoryBadge category={goal.category} />
        </div>
      </div>
    </Link>
  );
}

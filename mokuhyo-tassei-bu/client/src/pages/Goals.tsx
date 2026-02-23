import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { CategoryBadge, ProgressRing } from "@/components/MemphisDecorations";
import { Link } from "wouter";
import { Plus, CheckCircle2, Clock } from "lucide-react";

export default function Goals() {
  const { isAuthenticated } = useAuth();
  const { data: goals, isLoading } = trpc.goals.list.useQuery(undefined, { enabled: isAuthenticated });

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

  const active = (goals ?? []).filter((g) => !g.isCompleted);
  const completed = (goals ?? []).filter((g) => g.isCompleted);

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">マイ目標 🎯</h1>
        <Link href="/goals/new">
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
          {[1, 2, 3].map((i) => <div key={i} className="memphis-card h-24 animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* Active goals */}
          <section>
            <h2 className="text-base font-black flex items-center gap-2 mb-3">
              <Clock size={16} /> 進行中 ({active.length})
            </h2>
            {active.length === 0 ? (
              <div className="memphis-card p-6 text-center">
                <p className="text-3xl mb-2">🌱</p>
                <p className="font-bold text-sm mb-3">まだ目標がありません</p>
                <Link href="/goals/new">
                  <button className="memphis-btn px-4 py-2 text-sm font-black text-white" style={{ background: "var(--color-coral)" }}>
                    目標を作る！
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {active.map((g) => <GoalItem key={g.id} goal={g} />)}
              </div>
            )}
          </section>

          {/* Completed goals */}
          {completed.length > 0 && (
            <section>
              <h2 className="text-base font-black flex items-center gap-2 mb-3">
                <CheckCircle2 size={16} /> 達成済み ({completed.length})
              </h2>
              <div className="space-y-3">
                {completed.map((g) => <GoalItem key={g.id} goal={g} completed />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function GoalItem({ goal, completed = false }: {
  goal: { id: number; title: string; category: string; deadline?: Date | null; isCompleted: boolean };
  completed?: boolean;
}) {
  const { data } = trpc.goals.get.useQuery({ id: goal.id });
  const progress = data?.progress ?? 0;

  return (
    <Link href={`/goals/${goal.id}`}>
      <div
        className="memphis-card p-4 flex items-center gap-4 cursor-pointer"
        style={{ opacity: completed ? 0.75 : 1 }}
      >
        <ProgressRing percent={progress} size={56} />
        <div className="flex-1 min-w-0">
          <p className={`font-black text-sm truncate ${completed ? "line-through" : ""}`}>{goal.title}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <CategoryBadge category={goal.category} />
            {goal.deadline && !completed && (
              <span className="text-xs font-semibold text-muted-foreground">
                {new Date(goal.deadline).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}まで
              </span>
            )}
            {completed && (
              <span className="text-xs font-bold" style={{ color: "var(--color-coral)" }}>✓ 達成！</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

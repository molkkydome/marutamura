import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, LogOut, Save } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const utils = trpc.useUtils();

  const { data: goals } = trpc.goals.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: diaries } = trpc.diary.list.useQuery(undefined, { enabled: isAuthenticated });

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setBio((user as { bio?: string | null }).bio ?? "");
    }
  }, [user]);

  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("プロフィールを更新しました！");
      utils.auth.me.invalidate();
    },
    onError: () => toast.error("更新に失敗しました"),
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

  const activeGoals = (goals ?? []).filter((g) => !g.isCompleted).length;
  const completedGoals = (goals ?? []).filter((g) => g.isCompleted).length;
  const diaryCount = (diaries ?? []).length;

  return (
    <div className="container py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/">
          <button className="memphis-btn w-9 h-9 flex items-center justify-center" style={{ background: "var(--color-yellow)" }}>
            <ArrowLeft size={18} />
          </button>
        </Link>
        <h1 className="text-2xl font-black">プロフィール</h1>
      </div>

      {/* Avatar & Name */}
      <div className="memphis-card p-6 flex flex-col items-center gap-4">
        <div
          className="w-24 h-24 rounded-2xl border-[3px] border-black flex items-center justify-center text-4xl font-black"
          style={{ background: "var(--color-lilac)", boxShadow: "4px 4px 0 black" }}
        >
          {user?.name?.[0] ?? "?"}
        </div>
        <div className="text-center">
          <p className="font-black text-xl">{user?.name ?? "名前未設定"}</p>
          <p className="text-sm font-semibold text-muted-foreground">{user?.email ?? ""}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "進行中", value: activeGoals, color: "var(--color-mint)" },
          { label: "達成済", value: completedGoals, color: "var(--color-yellow)" },
          { label: "日記", value: diaryCount, color: "var(--color-lilac)" },
        ].map((s) => (
          <div key={s.label} className="memphis-card p-3 text-center" style={{ background: s.color }}>
            <div className="text-2xl font-black">{s.value}</div>
            <div className="text-xs font-bold">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Edit form */}
      <div className="memphis-card p-5 space-y-4">
        <h2 className="text-base font-black">プロフィール編集</h2>

        <div className="space-y-2">
          <label className="text-sm font-black">名前</label>
          <input
            className="w-full border-2 border-black rounded-xl px-4 py-3 text-base font-semibold bg-input focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="あなたの名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-black">自己紹介</label>
          <textarea
            className="w-full border-2 border-black rounded-xl px-4 py-3 text-sm font-semibold bg-input focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            placeholder="目標や意気込みを書いてみよう..."
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={300}
          />
        </div>

        <button
          className="memphis-btn w-full py-3 font-black text-white flex items-center justify-center gap-2"
          style={{ background: "var(--color-coral)" }}
          onClick={() => updateProfile.mutate({ name: name || undefined, bio: bio || undefined })}
          disabled={updateProfile.isPending}
        >
          <Save size={16} />
          {updateProfile.isPending ? "保存中..." : "保存する"}
        </button>
      </div>

      {/* Logout */}
      <button
        className="memphis-btn w-full py-3 font-black flex items-center justify-center gap-2"
        style={{ background: "var(--muted)" }}
        onClick={() => logout()}
      >
        <LogOut size={16} />
        ログアウト
      </button>
    </div>
  );
}

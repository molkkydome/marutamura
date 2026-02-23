import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      logout();
      navigate("/");
    },
  });

  const displayName = user?.nickname || user?.name || "ゲスト";

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg gradient-text hidden sm:block">
              今年の1つ
            </span>
          </Link>

          {/* 右側 */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:block">
                  <span className="font-medium text-foreground">{displayName}</span> さん
                </span>
                {user?.role === "admin" && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="gap-1.5">
                      <Settings className="w-4 h-4" />
                      <span className="hidden sm:inline">管理</span>
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logoutMutation.mutate()}
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">ログアウト</span>
                </Button>
              </>
            ) : (
              <Link href="/join">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-primary to-accent text-white border-0 hover:opacity-90 shadow-md"
                >
                  参加する
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

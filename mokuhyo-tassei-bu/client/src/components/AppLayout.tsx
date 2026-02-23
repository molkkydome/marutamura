import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { BookOpen, Home, Bell, Target, Users } from "lucide-react";
import { Link, useLocation } from "wouter";
import { MemphisBackground } from "./MemphisDecorations";

const NAV_ITEMS = [
  { path: "/", icon: Home, label: "ホーム" },
  { path: "/goals", icon: Target, label: "目標" },
  { path: "/community", icon: Users, label: "仲間" },
  { path: "/diary", icon: BookOpen, label: "日記" },
  { path: "/notifications", icon: Bell, label: "通知" },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();
  const { data: unreadCount } = trpc.notifications.unreadCount.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  return (
    <div className="min-h-dvh relative">
      <MemphisBackground />
      <div className="relative z-10 bottom-nav-safe">
        {children}
      </div>

      {/* Bottom Navigation */}
      {isAuthenticated && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-50"
          style={{
            background: "oklch(99% 0.01 55)",
            borderTop: "2.5px solid oklch(15% 0 0)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          <div className="max-w-[480px] mx-auto flex items-center justify-around px-2 py-2">
            {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
              const isActive = path === "/" ? location === "/" : location.startsWith(path);
              const isBell = path === "/notifications";
              return (
                <Link key={path} href={path}>
                  <button
                    className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all"
                    style={{
                      background: isActive ? "var(--color-coral)" : "transparent",
                      border: isActive ? "2px solid oklch(15% 0 0)" : "2px solid transparent",
                      boxShadow: isActive ? "2px 2px 0 oklch(15% 0 0)" : "none",
                      minWidth: 52,
                    }}
                  >
                    <div className="relative">
                      <Icon
                        size={22}
                        strokeWidth={isActive ? 2.5 : 2}
                        color={isActive ? "white" : "oklch(35% 0 0)"}
                      />
                      {isBell && unreadCount && unreadCount > 0 ? (
                        <span
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center text-white"
                          style={{ background: "oklch(55% 0.22 30)", border: "1.5px solid black" }}
                        >
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      ) : null}
                    </div>
                    <span
                      className="text-[10px] font-bold"
                      style={{ color: isActive ? "white" : "oklch(35% 0 0)" }}
                    >
                      {label}
                    </span>
                  </button>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}

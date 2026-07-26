import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Users, PlusCircle, ScanLine, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();

  const nav =
    user?.role === "admin"
      ? [
          { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { to: "/passes", label: "Passes", icon: Users },
          { to: "/passes/new", label: "New Pass", icon: PlusCircle },
          { to: "/scanner", label: "Scanner", icon: ScanLine },
        ]
      : [
          { to: "/scanner", label: "Scanner", icon: ScanLine },
          { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        ];

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 border-r bg-sidebar hidden md:flex flex-col">
        <div className="p-5 flex items-center gap-2 border-b">
          <div
            className="h-9 w-9 rounded-lg flex items-center justify-center text-primary-foreground"
            style={{ background: "var(--gradient-hero)" }}
          >
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-sm">QR Entry</div>
            <div className="text-xs text-muted-foreground">Visitor pass system</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((n) => {
            const active = pathname === n.to;
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  active
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t space-y-2">
          <div className="px-2 text-xs">
            <div className="font-medium truncate">{user?.name}</div>
            <div className="text-muted-foreground capitalize">{user?.role}</div>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <header className="md:hidden sticky top-0 z-10 bg-background/80 backdrop-blur border-b px-4 py-3 flex items-center justify-between">
          <div className="font-semibold">QR Entry</div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </header>
        <div className="p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

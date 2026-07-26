import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — QR Entry" },
      { name: "description", content: "Sign in to the visitor pass management dashboard." },
    ],
  }),
  component: Login,
});

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}`);
      navigate({ to: user.role === "admin" ? "/dashboard" : "/scanner" });
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div
        className="hidden md:flex flex-col justify-between p-10 text-primary-foreground"
        style={{ background: "var(--gradient-hero)" }}
      >
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="h-5 w-5" /> QR Entry
        </Link>
        <div>
          <h2 className="text-3xl font-semibold">Secure visitor management</h2>
          <p className="mt-2 opacity-90 max-w-sm">
            Generate encrypted QR passes, approve visitors, and verify entry at the gate — all in
            one place.
          </p>
        </div>
        <div className="text-xs opacity-75">© {new Date().getFullYear()} QR Entry</div>
      </div>
      <div className="flex items-center justify-center p-6">
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5">
          <div>
            <h1 className="text-2xl font-semibold">Sign in</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Use your admin or security credentials.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
          <div className="text-xs text-muted-foreground text-center rounded-md bg-muted p-3">
            Demo: <b>admin@example.com</b> / admin123 · <b>security@example.com</b> / security123
          </div>
        </form>
      </div>
    </div>
  );
}

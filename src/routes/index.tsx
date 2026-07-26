import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, ScanLine, BarChart3, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QR Entry — Secure Visitor Pass Generator" },
      {
        name: "description",
        content:
          "A modern platform to generate, approve and verify secure QR-based entry passes for visitors.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <div
              className="h-8 w-8 rounded-md flex items-center justify-center text-primary-foreground"
              style={{ background: "var(--gradient-hero)" }}
            >
              <ShieldCheck className="h-4 w-4" />
            </div>
            QR Entry
          </div>
          <Link to="/login">
            <Button size="sm">Sign in</Button>
          </Link>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Secure QR entry passes,
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "var(--gradient-hero)" }}
          >
            generated in seconds.
          </span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          A modern visitor management system for offices, campuses, apartments and events. Approve
          visitors, generate encrypted QR passes, and verify at the gate.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/login">
            <Button size="lg" style={{ boxShadow: "var(--shadow-elegant)" }}>
              Get started
            </Button>
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20 grid md:grid-cols-3 gap-6">
        {[
          { icon: QrCode, title: "Encrypted QR", body: "Every pass carries a UUID-encoded QR — no PII visible." },
          { icon: ScanLine, title: "Fast gate scan", body: "Security scans with camera or upload. Entry/exit tracked live." },
          { icon: BarChart3, title: "Live analytics", body: "Dashboard shows today's visitors, approvals and trends." },
        ].map((f) => (
          <div key={f.title} className="rounded-xl border bg-card p-6">
            <f.icon className="h-6 w-6 text-primary" />
            <div className="mt-4 font-semibold">{f.title}</div>
            <div className="mt-1 text-sm text-muted-foreground">{f.body}</div>
          </div>
        ))}
      </section>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle2, Clock, XCircle, LogIn, AlertCircle } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — QR Entry" }] }),
  component: Dashboard,
});

type DashboardData = {
  stats: {
    todayCount: number;
    approved: number;
    pending: number;
    rejected: number;
    inside: number;
    expired: number;
  };
  daily: { _id: string; count: number }[];
  recent: any[];
};

const cards = [
  { key: "todayCount", label: "Today's Visitors", icon: Users, color: "text-primary" },
  { key: "approved", label: "Approved", icon: CheckCircle2, color: "text-emerald-600" },
  { key: "pending", label: "Pending", icon: Clock, color: "text-amber-600" },
  { key: "rejected", label: "Rejected", icon: XCircle, color: "text-red-600" },
  { key: "inside", label: "Visitors Inside", icon: LogIn, color: "text-blue-600" },
  { key: "expired", label: "Expired", icon: AlertCircle, color: "text-muted-foreground" },
] as const;

function Dashboard() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => api("/api/analytics/dashboard"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of today's visitor activity.</p>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => {
          const Icon = c.icon;
          const value = data?.stats?.[c.key] ?? (isLoading ? "…" : 0);
          return (
            <Card key={c.key}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{c.label}</span>
                  <Icon className={`h-4 w-4 ${c.color}`} />
                </div>
                <div className="mt-2 text-2xl font-semibold">{value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Passes created (last 7 days)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.daily ?? []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="_id" fontSize={11} />
                <YAxis fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent passes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data?.recent ?? []).slice(0, 6).map((p) => (
              <div key={p._id} className="flex items-center justify-between text-sm">
                <div className="min-w-0">
                  <div className="font-medium truncate">{p.visitorName}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {p.purpose} · {p.hostName}
                  </div>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {p.status.replace("_", " ")}
                </Badge>
              </div>
            ))}
            {!isLoading && !data?.recent?.length && (
              <div className="text-sm text-muted-foreground">No passes yet.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

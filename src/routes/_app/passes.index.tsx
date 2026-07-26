import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import QRCode from "qrcode";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, X, Trash2, QrCode as QrIcon, Download, Search } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/passes/")({
  head: () => ({ meta: [{ title: "Passes — QR Entry" }] }),
  component: PassesPage,
});

const statusColor: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  checked_in: "bg-blue-100 text-blue-800",
  checked_out: "bg-slate-100 text-slate-800",
  expired: "bg-muted text-muted-foreground",
  cancelled: "bg-muted text-muted-foreground",
};

function PassesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [q, setQ] = useState("");
  const [qrPass, setQrPass] = useState<any>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["passes", q],
    queryFn: () => api<{ items: any[]; total: number }>(`/api/passes?q=${encodeURIComponent(q)}`),
  });

  const mutate = (path: string, method = "POST") =>
    useMutation({
      mutationFn: (id: string) => api(`/api/passes/${id}${path}`, { method }),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["passes"] });
        qc.invalidateQueries({ queryKey: ["dashboard"] });
      },
      onError: (e: any) => toast.error(e.message),
    });

  const approve = mutate("/approve");
  const reject = mutate("/reject");
  const del = useMutation({
    mutationFn: (id: string) => api(`/api/passes/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["passes"] });
      toast.success("Deleted");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const openQr = async (p: any) => {
    setQrPass(p);
    const url = await QRCode.toDataURL(p.passId, { width: 320, margin: 2 });
    setQrDataUrl(url);
  };

  const downloadQr = () => {
    if (!qrDataUrl || !qrPass) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `${qrPass.passNumber || qrPass.passId}.png`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Passes</h1>
          <p className="text-sm text-muted-foreground">Manage visitor entry passes.</p>
        </div>
        {isAdmin && (
          <Link to="/passes/new">
            <Button>New pass</Button>
          </Link>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
        <Input
          placeholder="Search name, mobile, host, pass #"
          className="pl-9"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pass #</TableHead>
                <TableHead>Visitor</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Loading…
                  </TableCell>
                </TableRow>
              )}
              {data?.items?.map((p) => (
                <TableRow key={p._id}>
                  <TableCell className="font-mono text-xs">{p.passNumber}</TableCell>
                  <TableCell>
                    <div className="font-medium">{p.visitorName}</div>
                    <div className="text-xs text-muted-foreground">{p.mobile}</div>
                  </TableCell>
                  <TableCell className="text-sm">{p.purpose}</TableCell>
                  <TableCell className="text-sm">
                    {p.hostName}
                    {p.department ? ` · ${p.department}` : ""}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(p.visitDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${statusColor[p.status]} capitalize`} variant="secondary">
                      {p.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="sm" variant="ghost" onClick={() => openQr(p)}>
                      <QrIcon className="h-4 w-4" />
                    </Button>
                    {isAdmin && p.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => approve.mutate(p._id)}
                        >
                          <Check className="h-4 w-4 text-emerald-600" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => reject.mutate(p._id)}>
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </>
                    )}
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm("Delete this pass?")) del.mutate(p._id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && !data?.items?.length && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No passes found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!qrPass} onOpenChange={(v) => !v && setQrPass(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{qrPass?.visitorName}</DialogTitle>
          </DialogHeader>
          {qrPass && (
            <div className="text-center space-y-3">
              <div className="text-xs text-muted-foreground font-mono">{qrPass.passNumber}</div>
              {qrDataUrl && (
                <img src={qrDataUrl} alt="QR" className="mx-auto rounded-lg border" />
              )}
              <div className="text-sm">
                <div>
                  <b>Purpose:</b> {qrPass.purpose}
                </div>
                <div>
                  <b>Host:</b> {qrPass.hostName}
                </div>
                <div>
                  <b>Status:</b> {qrPass.status}
                </div>
              </div>
              <Button className="w-full" onClick={downloadQr}>
                <Download className="h-4 w-4 mr-2" /> Download QR
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

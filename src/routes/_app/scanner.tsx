import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, LogIn, LogOut } from "lucide-react";

export const Route = createFileRoute("/_app/scanner")({
  head: () => ({ meta: [{ title: "Scanner — QR Entry" }] }),
  component: Scanner,
});

function Scanner() {
  const scannerId = "qr-reader";
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [manual, setManual] = useState("");
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    return () => {
      scannerRef.current?.stop().catch(() => {});
    };
  }, []);

  const start = async () => {
    if (scanning) return;
    try {
      const html5 = new Html5Qrcode(scannerId);
      scannerRef.current = html5;
      await html5.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decoded) => {
          html5.stop().then(() => setScanning(false));
          verify(decoded);
        },
        () => {},
      );
      setScanning(true);
    } catch (e: any) {
      toast.error(e.message || "Camera access failed");
    }
  };

  const stop = async () => {
    try {
      await scannerRef.current?.stop();
      await scannerRef.current?.clear();
    } catch {}
    setScanning(false);
  };

  const verify = async (code: string) => {
    try {
      const r = await api<{ pass: any; warnings: any }>("/api/scanner/verify", {
        method: "POST",
        body: JSON.stringify({ code }),
      });
      setResult(r);
    } catch (e: any) {
      toast.error(e.message);
      setResult(null);
    }
  };

  const action = async (kind: "entry" | "exit") => {
    if (!result?.pass?.passId) return;
    try {
      const r = await api<{ pass: any }>(`/api/scanner/${kind}`, {
        method: "POST",
        body: JSON.stringify({ code: result.pass.passId, device: "web" }),
      });
      toast.success(`${kind === "entry" ? "Entry" : "Exit"} recorded`);
      setResult({ ...result, pass: r.pass });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Scanner</h1>
        <p className="text-sm text-muted-foreground">Scan a visitor's QR pass to verify.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Camera</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div
              id={scannerId}
              className="rounded-lg overflow-hidden bg-black/90 aspect-square w-full max-w-sm mx-auto"
            />
            <div className="flex gap-2">
              {!scanning ? (
                <Button onClick={start} className="flex-1">
                  Start camera
                </Button>
              ) : (
                <Button onClick={stop} variant="outline" className="flex-1">
                  Stop
                </Button>
              )}
            </div>
            <div className="pt-2 border-t">
              <div className="text-xs text-muted-foreground mb-2">Or enter pass ID manually</div>
              <div className="flex gap-2">
                <Input
                  placeholder="Pass ID (UUID)"
                  value={manual}
                  onChange={(e) => setManual(e.target.value)}
                />
                <Button variant="secondary" onClick={() => manual && verify(manual)}>
                  Verify
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Result</CardTitle>
          </CardHeader>
          <CardContent>
            {!result && (
              <div className="text-sm text-muted-foreground">
                Scan a QR or enter a pass ID to see visitor details.
              </div>
            )}
            {result && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl font-semibold">{result.pass.visitorName}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {result.pass.passNumber}
                    </div>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {result.pass.status.replace("_", " ")}
                  </Badge>
                </div>

                <div className="text-sm space-y-1">
                  <div>
                    <b>Purpose:</b> {result.pass.purpose}
                  </div>
                  <div>
                    <b>Host:</b> {result.pass.hostName}
                  </div>
                  <div>
                    <b>Mobile:</b> {result.pass.mobile}
                  </div>
                  <div>
                    <b>Visit date:</b> {new Date(result.pass.visitDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="space-y-2">
                  {result.warnings?.expired && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-md p-2">
                      <AlertTriangle className="h-4 w-4" /> Pass expired
                    </div>
                  )}
                  {result.warnings?.alreadyInside && (
                    <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-md p-2">
                      <AlertTriangle className="h-4 w-4" /> Visitor is already inside
                    </div>
                  )}
                  {result.warnings?.notApproved && (
                    <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-md p-2">
                      <AlertTriangle className="h-4 w-4" /> Pass is not approved
                    </div>
                  )}
                  {!result.warnings?.expired && !result.warnings?.notApproved && (
                    <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-md p-2">
                      <CheckCircle2 className="h-4 w-4" /> Pass valid
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1"
                    onClick={() => action("entry")}
                    disabled={result.warnings?.expired || result.warnings?.notApproved}
                  >
                    <LogIn className="h-4 w-4 mr-2" /> Allow entry
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => action("exit")}
                    disabled={result.pass.status !== "checked_in"}
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Mark exit
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

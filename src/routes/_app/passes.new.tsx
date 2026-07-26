import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_app/passes/new")({
  head: () => ({ meta: [{ title: "New pass — QR Entry" }] }),
  component: NewPass,
});

const schema = z.object({
  visitorName: z.string().min(2, "Required"),
  mobile: z.string().min(6, "Invalid"),
  email: z.string().email().optional().or(z.literal("")),
  organization: z.string().optional(),
  purpose: z.string().min(2, "Required"),
  hostName: z.string().min(2, "Required"),
  department: z.string().optional(),
  vehicleNumber: z.string().optional(),
  idProofType: z.string().optional(),
  idNumber: z.string().optional(),
  visitDate: z.string().min(1, "Required"),
  visitTime: z.string().optional(),
  expectedExitTime: z.string().optional(),
  validityDate: z.string().optional(),
  numberOfVisitors: z.coerce.number().int().min(1),
  emergencyContact: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function NewPass() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      numberOfVisitors: 1,
      visitDate: new Date().toISOString().slice(0, 10),
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const r = await api<{ pass: any }>("/api/passes", {
        method: "POST",
        body: JSON.stringify(data),
      });
      toast.success(`Pass created: ${r.pass.passNumber}`);
      navigate({ to: "/passes" });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">New visitor pass</h1>
        <p className="text-sm text-muted-foreground">
          Fill in visitor details. A unique QR pass will be generated automatically.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Visitor details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
            <Field label="Visitor name" error={errors.visitorName?.message}>
              <Input {...register("visitorName")} />
            </Field>
            <Field label="Mobile" error={errors.mobile?.message}>
              <Input {...register("mobile")} />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <Input type="email" {...register("email")} />
            </Field>
            <Field label="Organization">
              <Input {...register("organization")} />
            </Field>
            <Field label="Purpose of visit" error={errors.purpose?.message}>
              <Input {...register("purpose")} />
            </Field>
            <Field label="Host name" error={errors.hostName?.message}>
              <Input {...register("hostName")} />
            </Field>
            <Field label="Department">
              <Input {...register("department")} />
            </Field>
            <Field label="Vehicle number">
              <Input {...register("vehicleNumber")} />
            </Field>
            <Field label="ID proof type">
              <Input placeholder="Aadhaar / Passport / DL" {...register("idProofType")} />
            </Field>
            <Field label="ID number">
              <Input {...register("idNumber")} />
            </Field>
            <Field label="Visit date" error={errors.visitDate?.message}>
              <Input type="date" {...register("visitDate")} />
            </Field>
            <Field label="Visit time">
              <Input type="time" {...register("visitTime")} />
            </Field>
            <Field label="Expected exit">
              <Input type="time" {...register("expectedExitTime")} />
            </Field>
            <Field label="Validity date">
              <Input type="date" {...register("validityDate")} />
            </Field>
            <Field label="Number of visitors">
              <Input type="number" min={1} {...register("numberOfVisitors")} />
            </Field>
            <Field label="Emergency contact">
              <Input {...register("emergencyContact")} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Notes">
                <Textarea rows={3} {...register("notes")} />
              </Field>
            </div>
            <div className="md:col-span-2 flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => navigate({ to: "/passes" })}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating…" : "Create pass"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

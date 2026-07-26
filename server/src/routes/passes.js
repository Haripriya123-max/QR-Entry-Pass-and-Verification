import { Router } from "express";
import { z } from "zod";
import Pass from "../models/Pass.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = Router();

const passSchema = z.object({
  visitorName: z.string().min(2),
  mobile: z.string().min(6),
  email: z.string().email().optional().or(z.literal("")),
  organization: z.string().optional(),
  purpose: z.string().min(2),
  hostName: z.string().min(2),
  department: z.string().optional(),
  vehicleNumber: z.string().optional(),
  idProofType: z.string().optional(),
  idNumber: z.string().optional(),
  visitDate: z.string(),
  visitTime: z.string().optional(),
  expectedExitTime: z.string().optional(),
  validityDate: z.string().optional(),
  numberOfVisitors: z.number().int().min(1).default(1),
  emergencyContact: z.string().optional(),
  notes: z.string().optional(),
  photo: z.string().optional(),
});

router.use(auth);

// List with search / filter / pagination
router.get("/", async (req, res) => {
  const { q, status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (q) {
    filter.$or = [
      { visitorName: new RegExp(q, "i") },
      { mobile: new RegExp(q, "i") },
      { hostName: new RegExp(q, "i") },
      { department: new RegExp(q, "i") },
      { passNumber: new RegExp(q, "i") },
      { passId: new RegExp(q, "i") },
    ];
  }
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Pass.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    Pass.countDocuments(filter),
  ]);
  res.json({ items, total, page: Number(page), limit: Number(limit) });
});

router.get("/:id", async (req, res) => {
  const pass = await Pass.findOne({ $or: [{ passId: req.params.id }, { _id: req.params.id }] });
  if (!pass) return res.status(404).json({ error: "Not found" });
  res.json({ pass });
});

router.post("/", requireRole("admin"), async (req, res) => {
  const data = passSchema.parse(req.body);
  const pass = await Pass.create({
    ...data,
    visitDate: new Date(data.visitDate),
    validityDate: data.validityDate ? new Date(data.validityDate) : undefined,
    createdBy: req.user.id,
  });
  res.status(201).json({ pass });
});

router.put("/:id", requireRole("admin"), async (req, res) => {
  const data = passSchema.partial().parse(req.body);
  const pass = await Pass.findByIdAndUpdate(req.params.id, data, { new: true });
  if (!pass) return res.status(404).json({ error: "Not found" });
  res.json({ pass });
});

router.delete("/:id", requireRole("admin"), async (req, res) => {
  await Pass.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

router.post("/:id/approve", requireRole("admin"), async (req, res) => {
  const pass = await Pass.findByIdAndUpdate(
    req.params.id,
    { status: "approved", approvedBy: req.user.id },
    { new: true },
  );
  res.json({ pass });
});

router.post("/:id/reject", requireRole("admin"), async (req, res) => {
  const pass = await Pass.findByIdAndUpdate(req.params.id, { status: "rejected" }, { new: true });
  res.json({ pass });
});

export default router;

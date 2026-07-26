import { Router } from "express";
import { z } from "zod";
import Pass from "../models/Pass.js";
import EntryLog from "../models/EntryLog.js";


const router = Router();
import { auth, requireRole } from "../middleware/auth.js";

router.use(auth);
router.use(requireRole("security"));

const codeSchema = z.object({ code: z.string().min(4), device: z.string().optional() });

router.post("/verify", async (req, res) => {
  const { code } = codeSchema.parse(req.body);
  const pass = await Pass.findOne({ passId: code });
  if (!pass) return res.status(404).json({ error: "Pass not found" });
  const now = new Date();

let expired = false;

if (pass.validityDate) {
  const expiry = new Date(pass.validityDate);

  if (pass.expectedExitTime) {
    const [hour, minute] = pass.expectedExitTime.split(":").map(Number);
    expiry.setHours(hour, minute, 59, 999);
  } else {
    // If no exit time is provided, expire at the end of the day
    expiry.setHours(23, 59, 59, 999);
  }

  expired = now > expiry;
}
  res.json({
    pass,
    warnings: {
      expired,
      alreadyInside: pass.status === "checked_in",
      notApproved: !["approved", "checked_in", "checked_out"].includes(pass.status),
    },
  });
});

router.post("/entry", async (req, res) => {
  const { code, device } = codeSchema.parse(req.body);
  const pass = await Pass.findOne({ passId: code });
  if (!pass) return res.status(404).json({ error: "Pass not found" });
  if (pass.status !== "approved" && pass.status !== "checked_out")
    return res.status(400).json({ error: `Cannot enter: pass is ${pass.status}` });
  pass.status = "checked_in";
  pass.checkedInAt = new Date();
  await pass.save();
  await EntryLog.create({ pass: pass._id, action: "entry", guard: req.user.id, device });
  res.json({ pass });
});

router.post("/exit", async (req, res) => {
  const { code, device } = codeSchema.parse(req.body);
  const pass = await Pass.findOne({ passId: code });
  if (!pass) return res.status(404).json({ error: "Pass not found" });
  if (pass.status !== "checked_in")
    return res.status(400).json({ error: "Visitor is not checked in" });
  pass.status = "checked_out";
  pass.checkedOutAt = new Date();
  await pass.save();
  await EntryLog.create({ pass: pass._id, action: "exit", guard: req.user.id, device });
  res.json({ pass });
});

router.get("/history", async (req, res) => {
  const logs = await EntryLog.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .populate("pass", "visitorName passNumber passId hostName")
    .populate("guard", "name")
    .lean();
  res.json({ logs });
});

export default router;

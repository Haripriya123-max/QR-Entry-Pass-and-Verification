import { Router } from "express";
import Pass from "../models/Pass.js";
import { auth } from "../middleware/auth.js";

const router = Router();
router.use(auth);

router.get("/dashboard", async (_req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [todayCount, approved, pending, rejected, inside, expired, byStatus, recent] = await Promise.all([
    Pass.countDocuments({ createdAt: { $gte: startOfDay } }),
    Pass.countDocuments({ status: "approved" }),
    Pass.countDocuments({ status: "pending" }),
    Pass.countDocuments({ status: "rejected" }),
    Pass.countDocuments({ status: "checked_in" }),
    Pass.countDocuments({ status: "expired" }),
    Pass.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Pass.find().sort({ createdAt: -1 }).limit(8).lean(),
  ]);

  // Last 7 days entries
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  weekAgo.setHours(0, 0, 0, 0);
  const daily = await Pass.aggregate([
    { $match: { createdAt: { $gte: weekAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    stats: { todayCount, approved, pending, rejected, inside, expired },
    byStatus,
    daily,
    recent,
  });
});

export default router;

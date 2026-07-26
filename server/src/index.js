import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import passRoutes from "./routes/passes.js";
import scannerRoutes from "./routes/scanner.js";
import analyticsRoutes from "./routes/analytics.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(",") ?? "*", credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(rateLimit({ windowMs: 60_000, max: 200 }));

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/passes", passRoutes);
app.use("/api/scanner", scannerRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

const port = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("[db] connected");
    app.listen(port, () => console.log(`[api] listening on :${port}`));
  })
  .catch((e) => {
    console.error("[db] connection failed", e);
    process.exit(1);
  });

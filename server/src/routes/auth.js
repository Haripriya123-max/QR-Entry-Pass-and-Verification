import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";

const router = Router();

const signToken = (user) =>
  jwt.sign({ sub: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

router.post("/register", async (req, res) => {
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["admin", "security"]).optional(),
  });
  const data = schema.parse(req.body);
  const exists = await User.findOne({ email: data.email });
  if (exists) return res.status(409).json({ error: "Email in use" });
  const user = await User.create({
    name: data.name,
    email: data.email,
    role: data.role || "security",
    passwordHash: await User.hashPassword(data.password),
  });
  res.json({ token: signToken(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

router.post("/login", async (req, res) => {
  const schema = z.object({ email: z.string().email(), password: z.string().min(1) });
  const { email, password } = schema.parse(req.body);
  const user = await User.findOne({ email });
  if (!user || !(await user.verifyPassword(password)))
    return res.status(401).json({ error: "Invalid credentials" });
  res.json({ token: signToken(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

router.get("/me", auth, (req, res) => res.json({ user: req.user }));

export default router;

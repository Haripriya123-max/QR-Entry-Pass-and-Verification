import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import Pass from "../models/Pass.js";

await mongoose.connect(process.env.MONGO_URI);

await User.deleteMany({});
await Pass.deleteMany({});

const admin = await User.create({
  name: "Admin",
  email: "admin@example.com",
  role: "admin",
  passwordHash: await User.hashPassword("admin123"),
});
await User.create({
  name: "Security Guard",
  email: "security@example.com",
  role: "security",
  passwordHash: await User.hashPassword("security123"),
});

await Pass.create([
  {
    visitorName: "Alice Smith",
    mobile: "9999911111",
    purpose: "Interview",
    hostName: "Bob Manager",
    department: "HR",
    visitDate: new Date(),
    status: "approved",
    createdBy: admin._id,
  },
  {
    visitorName: "John Doe",
    mobile: "9999922222",
    purpose: "Delivery",
    hostName: "Reception",
    department: "Ops",
    visitDate: new Date(),
    status: "pending",
    createdBy: admin._id,
  },
]);

console.log("Seeded. Login:");
console.log("  admin@example.com / admin123");
console.log("  security@example.com / security123");
process.exit(0);

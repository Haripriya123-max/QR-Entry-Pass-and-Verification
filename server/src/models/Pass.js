import mongoose from "mongoose";
import crypto from "crypto";

const passSchema = new mongoose.Schema(
  {
    passId: { type: String, unique: true, index: true, default: () => crypto.randomUUID() },
    passNumber: { type: String, unique: true, index: true },
    visitorName: { type: String, required: true },
    photo: String,
    mobile: { type: String, required: true },
    email: String,
    organization: String,
    purpose: { type: String, required: true },
    hostName: { type: String, required: true },
    department: String,
    vehicleNumber: String,
    idProofType: String,
    idNumber: String,
    visitDate: { type: Date, required: true },
    visitTime: String,
    expectedExitTime: String,
    validityDate: Date,
    numberOfVisitors: { type: Number, default: 1, min: 1 },
    emergencyContact: String,
    notes: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "expired", "checked_in", "checked_out", "cancelled"],
      default: "pending",
      index: true,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    checkedInAt: Date,
    checkedOutAt: Date,
  },
  { timestamps: true },
);

passSchema.pre("save", async function () {
  if (!this.passNumber) {
    const count = await mongoose.model("Pass").countDocuments();
    this.passNumber = `VP-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;
  }
});

export default mongoose.model("Pass", passSchema);

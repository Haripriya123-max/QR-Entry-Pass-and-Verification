import mongoose from "mongoose";

const entryLogSchema = new mongoose.Schema(
  {
    pass: { type: mongoose.Schema.Types.ObjectId, ref: "Pass", required: true, index: true },
    action: { type: String, enum: ["entry", "exit", "denied"], required: true },
    guard: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    device: String,
    note: String,
  },
  { timestamps: true },
);

export default mongoose.model("EntryLog", entryLogSchema);

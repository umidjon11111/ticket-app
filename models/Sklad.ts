import mongoose from "mongoose";

const SkladSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Sklad || mongoose.model("Sklad", SkladSchema);

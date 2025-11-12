import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    roles: { type: [String], default: ["user"] }
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);

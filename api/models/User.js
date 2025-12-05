import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, index: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: { type: String, required: true },
    roles: { type: [String], default: ["user"] },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);

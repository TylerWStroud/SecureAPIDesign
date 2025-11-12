import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Product" },
    productName: { type: String, required: true },
    status: { type: String, enum: ["pending", "processing", "completed"], default: "pending" },
    orderNumber: { type: String, unique: true }
  },
  { timestamps: true }
);

orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model("Order").countDocuments();
    this.orderNumber = `ORD-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

export default mongoose.models.Order || mongoose.model("Order", orderSchema);

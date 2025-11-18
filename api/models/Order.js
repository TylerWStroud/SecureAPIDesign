import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Product" },
    productName: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["pending", "processing", "completed"], default: "pending" },
    orderNumber: { type: String, unique: true }
  },
  { timestamps: true }
);

orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    // Find the highest order number to avoid duplicates
    const lastOrder = await this.constructor
      .findOne({}, { orderNumber: 1 })
      .sort({ orderNumber: -1 })
      .lean();

    let nextNumber = 1;
    if (lastOrder && lastOrder.orderNumber) {
      // Extract the number from "ORD-XXXX" format
      const match = lastOrder.orderNumber.match(/ORD-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    this.orderNumber = `ORD-${String(nextNumber).padStart(4, "0")}`;
  }
  next();
});

export default mongoose.models.Order || mongoose.model("Order", orderSchema);

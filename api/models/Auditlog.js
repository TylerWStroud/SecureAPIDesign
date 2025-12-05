import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // allows for unauthenticated actions to be logged
    },
    username: { type: String }, // store username for easier reference
    action: {
      type: String,
      required: true,
      enum: [
        "USER_SIGNUP",
        "USER_LOGIN",
        "USER_LOGIN_FAILED",
        "USER_LOGOUT",
        "ORDER_CREATED",
        "ORDER_DELETED",
        "PRODUCT_CREATED",
        "PRODUCT_DELETED",
        "USER_CREATED", //admin action: admin created a user
        "EMAIL_VERIFIED",
        "UNAUTHORIZED_ACCESS",
      ],
    },
    details: {
      type: mongoose.Schema.Types.Mixed, // flexible field to store additional info
      default: {},
    },
    ipAddress: { type: String },
    userAgent: { type: String },
    statusCode: { type: Number }, // HTTP status code associated with the action
    success: { type: Boolean, default: true },
    errorMessage: { type: String }, // store error message if action failed
  },
  { timestamps: true } // adds createdAt and updatedAt fields
);

// Index for faster queries
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

export default mongoose.models.AuditLog ||
  mongoose.model("AuditLog", auditLogSchema);

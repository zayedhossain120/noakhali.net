import mongoose, { Schema, models, model } from "mongoose";

export type ComplaintStatus =
  | "PENDING"
  | "OPEN"
  | "UNDER_REVIEW"
  | "RESOLVED"
  | "REJECTED";

export interface IComplaint {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  area: string;
  reporterName?: string;
  reporterContact?: string;
  status: ComplaintStatus;
  adminNote?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    area: { type: String, required: true, trim: true },
    reporterName: { type: String, trim: true },
    reporterContact: { type: String, trim: true },
    status: {
      type: String,
      enum: ["PENDING", "OPEN", "UNDER_REVIEW", "RESOLVED", "REJECTED"],
      default: "PENDING",
    },
    adminNote: { type: String },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

ComplaintSchema.index({ status: 1 });
ComplaintSchema.index({ category: 1 });
ComplaintSchema.index({ area: 1 });
ComplaintSchema.index({ title: "text", description: "text", area: "text" });

export default models.Complaint || model<IComplaint>("Complaint", ComplaintSchema);

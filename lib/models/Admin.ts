import mongoose, { Schema, models, model } from "mongoose";

export type AdminRole = "SUPER_ADMIN" | "ADMIN";

export interface IAdmin {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string; // bcrypt hash
  role: AdminRole;
  createdBy: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: { type: String, enum: ["SUPER_ADMIN", "ADMIN"], default: "ADMIN" },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin", default: null },
  },
  { timestamps: true }
);

export default models.Admin || model<IAdmin>("Admin", AdminSchema);

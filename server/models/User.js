import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    fullName: { type: String, default: "" },
    age: { type: Number, default: null },
    gender: { type: String, enum: ["male", "female", "other", "prefer_not_to_say"], default: null },
    weight: { type: Number, default: null },
    height: { type: Number, default: null },
    fitnessLevel: { type: String, enum: ["beginner", "intermediate", "advanced", "expert"], default: null },
    goal: {
      type: String,
      enum: ["weight_loss", "muscle_gain", "maintenance", "endurance", "strength"],
      default: null,
    },
    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },
    joinedDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);

import mongoose from "mongoose";

const userGoalsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    dailySteps: { type: Number, min: 0, max: 50000, default: 0 },
    dailyCalories: { type: Number, min: 0, max: 10000, default: 0 },
    weeklyWorkouts: { type: Number, min: 0, max: 14, default: 0 },
    weightGoal: { type: Number, min: 0, max: 300, default: 0 },
    sleepGoal: { type: Number, min: 0, max: 24, default: 0 },
    hydrationGoal: { type: Number, min: 0, max: 10, default: 0 },
    customGoals: { type: String, maxlength: 500, default: "" },
    preferredUnits: {
      weight: { type: String, enum: ["kg", "lbs"], default: "kg" },
      distance: { type: String, enum: ["km", "mi"], default: "km" },
    },
  },
  { timestamps: true }
);

export default mongoose.model("UserGoals", userGoalsSchema);

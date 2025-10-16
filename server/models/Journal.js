import mongoose from "mongoose";

const journalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: String, // Storing as "YYYY-MM-DD" for easy lookup
    required: true,
  },
  entry: {
    type: String,
    default: "",
  },
  moodRating: {
    type: Number,
    default: 3,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export default mongoose.model("Journal", journalSchema);

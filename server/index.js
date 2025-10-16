import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

// Route imports
import authRoutes from "./routes/authRoutes.js";
import habitRoutes from "./routes/habitRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import journalRoutes from "./routes/journalRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import goalsRoutes from "./routes/goalsRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";

const app = express();
app.use(express.json());

// ✅ Dynamic & Safe CORS Config
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:8081",
  "https://well-nest-eta.vercel.app",
  "https://well-nest-three.vercel.app",
  "https://well-nest-gx1f2xdnh-vamsi-krishnas-projects-67b52aa7.vercel.app",
  "https://well-nest-j9b1cum4q-vamsi-krishnas-projects-67b52aa7.vercel.app",
  "https://wellnest-35bfakack-vamsi-krishnas-projects-67b52aa7.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      /https:\/\/wellnest-[a-z0-9-]+\.vercel\.app/.test(origin) // ✅ matches all Vercel previews
    ) {
      callback(null, true);
    } else {
      callback(new Error("❌ CORS Blocked: " + origin));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// ✅ API routes
app.use("/api/auth", authRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/chatbot", chatbotRoutes);

// ✅ MongoDB connection and server start
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

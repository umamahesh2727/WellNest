import FoodLog from "../models/FoodLog.js";
import User from "../models/User.js";
import { getUserTimezoneRange } from "../utils/dateHelpers.js";

// ✅ Get All Food Logs
export const getUserFoodLogs = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const foodLogs = await FoodLog.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(foodLogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Create Food Log
export const createFoodLog = async (req, res) => {
  try {
    const { name, calories, protein, carbs, fats, mealType, date } = req.body;

    if (!name || typeof name !== "string" || calories < 0 || protein < 0 || carbs < 0 || fats < 0) {
      return res.status(400).json({
        error: "Invalid input: name is required, and numbers cannot be negative.",
      });
    }

    const user = await User.findById(req.user.id);
    const timezone = user.timezone;
    const { start } = getUserTimezoneRange(new Date(date), timezone);

    const today = getUserTimezoneRange(new Date(), timezone).start;
    if (start > today) {
      return res.status(400).json({ message: "Cannot add food logs for future dates." });
    }

    const foodLog = await FoodLog.create({
      userId: req.user.id,
      name,
      calories,
      protein,
      carbs,
      fats,
      mealType,
      date: start,
    });

    res.status(201).json(foodLog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete Food Log
export const deleteFoodLog = async (req, res) => {
  try {
    await FoodLog.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: "Food log deleted." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

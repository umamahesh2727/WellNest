import Habit from "../models/Habit.js";
import User from "../models/User.js";

// ✅ Get All Habits
export const getUserHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user.id });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Create Habit
export const createHabit = async (req, res) => {
  try {
    const {
      name,
      frequency,
      times,
      unit,
      reminderTime,
      enableReminder,
      startDate,
      endDate,
      createdDate,
      emoji,
    } = req.body;

    if (!name || times < 1) {
      return res.status(400).json({
        error: "Invalid input: name required, times must be at least 1.",
      });
    }

    const newHabit = await Habit.create({
      userId: req.user.id,
      name,
      frequency,
      times,
      unit,
      reminderTime,
      enableReminder,
      startDate,
      endDate,
      createdDate,
      emoji,
    });

    res.status(201).json(newHabit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update Habit Completion (toggle)
// ✅ Update Habit Completion (toggle)
export const updateHabitCompletion = async (req, res) => {
  try {
    const habitId = req.params.id;
    const { date } = req.body;

    if (!date) return res.status(400).json({ error: "Date is required." });

    const habit = await Habit.findOne({ _id: habitId, userId: req.user.id });
    if (!habit) return res.status(404).json({ error: "Habit not found." });

    const alreadyCompleted = habit.completedDates.includes(date);

    if (!alreadyCompleted) {
      habit.completedDates.push(date);
    } else {
      habit.completedDates = habit.completedDates.filter((d) => d !== date);
    }

    await habit.save();
    res.json(habit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete Habit
export const deleteHabit = async (req, res) => {
  try {
    await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: "Habit deleted." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

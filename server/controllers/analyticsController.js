import Habit from "../models/Habit.js";
import FoodLog from "../models/FoodLog.js";
import Journal from "../models/Journal.js";
import UserGoals from "../models/UserGoals.js";
import { getUserTimezoneRange } from "../utils/dateHelpers.js";
import User from "../models/User.js";

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// ---------------- DAILY ----------------
export const getDailyAnalytics = async (req, res) => {
  const user = await User.findById(req.user.id);
  const timezone = user.timezone;
  const today = new Date();
  const { start: monday } = getUserTimezoneRange(today, timezone);
  monday.setDate(monday.getDate() - monday.getDay() + 1);
  monday.setHours(0, 0, 0, 0);

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  const habits = await Habit.find({ userId: req.user.id });
  const foodLogs = await FoodLog.find({ userId: req.user.id });

  const data = days.map((dateStr) => {
    const dateObj = new Date(dateStr);
    const totalHabits = habits.filter(
      (h) =>
        new Date(h.startDate) <= dateObj &&
        (!h.endDate || new Date(h.endDate) >= dateObj)
    ).length;
    const completedHabits = habits.filter((h) =>
      h.completedDates.includes(dateStr)
    ).length;
    const calories = foodLogs
      .filter((log) => log.date.toISOString().split("T")[0] === dateStr)
      .reduce((acc, log) => acc + (log.calories || 0), 0);
    return {
      date: dateStr,
      habitsPercent: totalHabits ? (completedHabits / totalHabits) * 100 : 0,
      calories,
      active: completedHabits > 0 || calories > 0,
    };
  });

  const activeDays = data.filter((d) => d.active).length;
  const totalCompleted = data.reduce((acc, d) => acc + d.habitsPercent, 0);
  const totalCalories = data.reduce((acc, d) => acc + d.calories, 0);

  res.json({
    labels: days.map((d) => d.substring(5)),
    datasets: data.map((d) => ({
      date: d.date.split("-")[2],
      habitsPercent: d.habitsPercent,
      calories: d.calories,
    })),
    totalCalories,
    activeDays,
    avgCompletion: Math.round(totalCompleted / (days.length || 1)),
    totalProtein: foodLogs.reduce((acc, log) => acc + (log.protein || 0), 0),
    totalCarbs: foodLogs.reduce((acc, log) => acc + (log.carbs || 0), 0),
    totalFats: foodLogs.reduce((acc, log) => acc + (log.fats || 0), 0),
  });
};

// ---------------- MONTHLY ----------------
export const getMonthlyAnalytics = async (req, res) => {
  const userId = req.user.id;
  const user = await User.findById(userId);
  const timezone = user.timezone;

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = getDaysInMonth(year, month);

  const days = Array.from({ length: daysInMonth }).map((_, i) => {
    const d = new Date(year, month, i + 1);
    return d.toISOString().split("T")[0];
  });

  const habits = await Habit.find({ userId });
  const foodLogs = await FoodLog.find({ userId });

  const data = days.map((dateStr) => {
    const dateObj = new Date(dateStr);

    const totalHabits = habits.filter(
      (h) =>
        new Date(h.startDate) <= dateObj &&
        (!h.endDate || new Date(h.endDate) >= dateObj)
    ).length;

    const completedHabits = habits.filter((h) =>
      h.completedDates.includes(dateStr)
    ).length;

    const calories = foodLogs
      .filter((log) => log.date.toISOString().split("T")[0] === dateStr)
      .reduce((acc, log) => acc + (log.calories || 0), 0);

    return {
      date: dateStr,
      habitsPercent: totalHabits ? (completedHabits / totalHabits) * 100 : 0,
      calories,
      active: completedHabits > 0 || calories > 0,
    };
  });

  const activeDays = data.filter((d) => d.active).length;
  const totalCompleted = data.reduce((acc, d) => acc + d.habitsPercent, 0);
  const totalCalories = data.reduce((acc, d) => acc + d.calories, 0);

  res.json({
    labels: days.map((d) => d.substring(5)),
    datasets: data.map((d) => ({
      date: d.date.split("-")[2], // only day of month
      habitsPercent: d.habitsPercent,
      calories: d.calories,
    })),
    totalCalories,
    activeDays,
    avgCompletion: Math.round(totalCompleted / (days.length || 1)),
  });
};

// ---------------- YEARLY ----------------
export const getYearlyAnalytics = async (req, res) => {
  const user = await User.findById(req.user.id);
  const timezone = user.timezone;
  const months = Array.from({ length: 12 }).map((_, i) => i);
  const habits = await Habit.find({ userId: req.user.id });
  const foodLogs = await FoodLog.find({ userId: req.user.id });

  const data = months.map((monthIdx) => {
    const daysInMonth = getDaysInMonth(new Date().getFullYear(), monthIdx);
    let completed = 0;
    let total = 0;
    let calories = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = new Date(new Date().getFullYear(), monthIdx, day)
        .toISOString()
        .split("T")[0];
      const totalHabits = habits.filter(
        (h) =>
          new Date(h.startDate) <= new Date(dateStr) &&
          (!h.endDate || new Date(h.endDate) >= new Date(dateStr))
      ).length;
      const completedHabits = habits.filter((h) =>
        h.completedDates.includes(dateStr)
      ).length;
      calories += foodLogs
        .filter((log) => log.date.toISOString().split("T")[0] === dateStr)
        .reduce((acc, log) => acc + (log.calories || 0), 0);
      total += totalHabits;
      completed += completedHabits;
    }

    return {
      month: monthIdx,
      habitsPercent: total ? (completed / total) * 100 : 0,
      calories,
      active: completed > 0 || calories > 0,
    };
  });

  const activeDays = months.reduce((total, monthIdx) => {
    const daysInMonth = getDaysInMonth(new Date().getFullYear(), monthIdx);
    let count = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = new Date(new Date().getFullYear(), monthIdx, day)
        .toISOString()
        .split("T")[0];
      const isActive =
        habits.some((h) => h.completedDates.includes(dateStr)) ||
        foodLogs.some((f) => f.date.toISOString().split("T")[0] === dateStr);
      if (isActive) count++;
    }
    return total + count;
  }, 0);

  res.json({
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: data.map((d, idx) => ({
      month: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ][idx],
      habitsPercent: d.habitsPercent,
      calories: d.calories,
    })),
    totalCalories: data.reduce((acc, d) => acc + d.calories, 0),
    activeDays,
    avgCompletion: Math.round(
      data.reduce((acc, d) => acc + d.habitsPercent, 0) / 12
    ),
  });
};

// ---------------- SUMMARY ----------------
export const getSummaryForDate = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const timezone = user.timezone;

    const dateStr = req.query.date;
    if (!dateStr) {
      return res.status(400).json({ error: "Missing date." });
    }

    const { start, end } = getUserTimezoneRange(new Date(dateStr), timezone);

    const allHabits = await Habit.find({ userId });

    const habitsList = allHabits
      .filter((h) => {
        const startDate = new Date(h.startDate);
        const endDate = h.endDate ? new Date(h.endDate) : null;
        return start >= startDate && (!endDate || start <= endDate);
      })
      .map((h) => ({
        _id: h._id,
        name: h.name,
        emoji: h.emoji,
        isCompleted: h.completedDates.includes(dateStr),
      }));

    // ✅ Fixed: match the full day range instead of exact match
    const foodLogs = await FoodLog.find({
      userId,
      date: { $gte: start, $lt: end },
    });

    const foodByMealType = foodLogs.reduce((acc, item) => {
      if (!acc[item.mealType]) acc[item.mealType] = [];
      acc[item.mealType].push(item);
      return acc;
    }, {});

    const journalEntry =
      (await Journal.findOne({ userId, date: dateStr })) ||
      (await Journal.findOne({ userId, date: { $gte: start, $lt: end } })) ||
      null;

    const userGoals = await UserGoals.findOne({ userId });
    const caloriesGoal = userGoals?.calories || 2000;

    const caloriesToday = foodLogs.reduce(
      (total, log) => total + (log.calories || 0),
      0
    );

    const totalProtein = foodLogs.reduce(
      (acc, log) => acc + (log.protein || 0),
      0
    );
    const totalCarbs = foodLogs.reduce((acc, log) => acc + (log.carbs || 0), 0);
    const totalFats = foodLogs.reduce((acc, log) => acc + (log.fats || 0), 0);

    res.json({
      date: dateStr,
      habitsList,
      caloriesConsumed: caloriesToday,
      caloriesGoal,
      foodList: foodLogs,
      foodByMealType,
      totalProtein,
      totalCarbs,
      totalFats,
      journalEntry,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

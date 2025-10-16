import Habit from "../models/Habit.js";
import FoodLog from "../models/FoodLog.js";
import UserGoals from "../models/UserGoals.js";
import User from "../models/User.js";
import { getUserTimezoneRange } from "../utils/dateHelpers.js";

// format 'YYYY-MM-DD' in the user's timezone (no UTC shift)
const formatDateInTZ = (d, tz) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);

export const getStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const timezone = user.timezone;

    // start/end boundaries for *today* in user's timezone
    const { start: todayStart, end: todayEnd } = getUserTimezoneRange(
      new Date(),
      timezone
    );
    const todayISO = formatDateInTZ(todayStart, timezone); // 'YYYY-MM-DD'

    // ---------- HABITS FOR TODAY ----------
    const habits = (await Habit.find({ userId: user._id })) || [];

    // A habit is “active today” if its [startDate, endDate] overlaps today's range.
    const todayHabits = habits.filter((h) => {
      const start = h.startDate ? new Date(h.startDate) : null;
      const end = h.endDate ? new Date(h.endDate) : null;

      if (start && start > todayEnd) return false; // starts after today
      if (end && end < todayStart) return false; // ended before today
      return true; // overlaps today
    });

    const totalHabitsToday = todayHabits.length;

    // ✅ Compare strings directly — your DB stores 'YYYY-MM-DD'
    const completedHabitsToday = todayHabits.filter((h) =>
      (h.completedDates || []).includes(todayISO)
    ).length;

    const habitsPercent = totalHabitsToday
      ? Math.round((completedHabitsToday / totalHabitsToday) * 100)
      : 0;

    // ---------- FOOD CALORIES TODAY ----------
    const userGoals = await UserGoals.findOne({ userId: user._id });
    const dailyCaloriesGoal = userGoals?.calories || 2000;

    const foodLogsToday = await FoodLog.find({
      userId: user._id,
      date: { $gte: todayStart, $lt: todayEnd },
    });

    const caloriesToday = foodLogsToday.reduce(
      (total, log) => total + (log.calories || 0),
      0
    );

    const caloriesPercent = dailyCaloriesGoal
      ? Math.round(
          (Math.min(caloriesToday, dailyCaloriesGoal) / dailyCaloriesGoal) * 100
        )
      : 0;

    const todayGoalPercent = Math.round((habitsPercent + caloriesPercent) / 2);

    // ---------- STREAK (walk backwards by TZ days using string dates) ----------
    const completedDatesSet = new Set();
    habits.forEach((h) =>
      (h.completedDates || []).forEach((d) => completedDatesSet.add(d))
    );

    let streak = 0;
    let cursor = new Date(todayStart); // start-of-day in TZ as UTC instant
    while (true) {
      const cursorISO = formatDateInTZ(cursor, timezone); // 'YYYY-MM-DD' in TZ
      if (!completedDatesSet.has(cursorISO)) break;
      streak++;
      cursor = new Date(cursor.getTime() - 24 * 60 * 60 * 1000); // go to previous day
    }

    res.json({
      streak,
      caloriesToday,
      todayGoalPercent,
      habitsHit: `${completedHabitsToday} / ${totalHabitsToday}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Updated chatbotController.js
import dotenv from "dotenv";
dotenv.config();
import Habit from "../models/Habit.js";
import FoodLog from "../models/FoodLog.js";
import Journal from "../models/Journal.js";
import UserGoals from "../models/UserGoals.js";
import User from "../models/User.js";
import { DateTime } from "luxon";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const getToday = (timeZone) =>
  DateTime.now().setZone(timeZone).startOf("day").toISODate();

const formatDate = (jsDate, timeZone) =>
  DateTime.fromJSDate(jsDate).setZone(timeZone).toISODate();

const filterByDate = (data, date, timeZone) =>
  data.filter((item) => formatDate(item.date, timeZone) === date);

const filterByRange = (data, startDate, endDate, timeZone) =>
  data.filter((item) => {
    const d = DateTime.fromJSDate(item.date).setZone(timeZone).toISODate();
    return d >= startDate && d <= endDate;
  });

const buildChatPrompt = (ctx) => {
  return `
You're WellNest AI. Speak like a chill fitness buddy, not a formal assistant.

Give your reply in **under 100 words**, **include real stats** (habit %, calories, macros, mood, journal), and **encourage** or **tease** based on the data.

Always call the user **"Buddy"**, never use their name.

Here's today’s context:
- Habit completion: ${ctx.habitCompletion}% (${ctx.completedHabits}/${
    ctx.totalHabits
  })
- Calories: ${ctx.totalCaloriesToday} kcal
- Macros: P ${ctx.totalProtein}g / C ${ctx.totalCarbs}g / F ${ctx.totalFats}g
- Mood rating: ${ctx.mood}
- Journal: "${ctx.journalEntry || "No journal today."}"
- Weekly Cal: ${ctx.weeklyCalories}, Monthly Cal: ${
    ctx.monthlyCalories
  }, Yearly Cal: ${ctx.yearlyCalories}
- Goals: ${ctx.goalsText}

Speak like a real person who knows this data and actually cares , speak cool and little as possible and be informative. 
Use emojis sparingly but effectively. Be concise, hype me up or tease me if needed. No robotic tone.
  `;
};

export const chatWithAssistant = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized request." });
    }

    const userId = req.user.id;
    const user = await User.findById(userId);
    const timeZone = user?.timezone || "Asia/Kolkata";
    const today = getToday(timeZone);
    const startOfWeek = DateTime.now()
      .setZone(timeZone)
      .startOf("week")
      .toISODate();
    const startOfMonth = DateTime.now()
      .setZone(timeZone)
      .startOf("month")
      .toISODate();
    const startOfYear = DateTime.now()
      .setZone(timeZone)
      .startOf("year")
      .toISODate();

    const [habits, foodLogs, journal, goals] = await Promise.all([
      Habit.find({ userId }),
      FoodLog.find({ userId }),
      Journal.findOne({ userId, date: today }),
      UserGoals.findOne({ userId }),
    ]);

    const todayHabits = habits.filter((h) => {
      const start = DateTime.fromJSDate(new Date(h.startDate)).toISODate();
      const end = h.endDate
        ? DateTime.fromJSDate(new Date(h.endDate)).toISODate()
        : null;
      return start <= today && (!end || today <= end);
    });

    const completedHabits = todayHabits.filter((h) =>
      h.completedDates.includes(today)
    );
    const habitCompletion = todayHabits.length
      ? Math.round((completedHabits.length / todayHabits.length) * 100)
      : 0;

    const foodToday = filterByDate(foodLogs, today, timeZone);
    const totalCaloriesToday = foodToday.reduce(
      (sum, f) => sum + (f.calories || 0),
      0
    );
    const totalProtein = foodToday.reduce(
      (sum, f) => sum + (f.protein || 0),
      0
    );
    const totalCarbs = foodToday.reduce((sum, f) => sum + (f.carbs || 0), 0);
    const totalFats = foodToday.reduce((sum, f) => sum + (f.fats || 0), 0);

    const foodWeekly = filterByRange(foodLogs, startOfWeek, today, timeZone);
    const foodMonthly = filterByRange(foodLogs, startOfMonth, today, timeZone);
    const foodYearly = filterByRange(foodLogs, startOfYear, today, timeZone);

    const weeklyCalories = foodWeekly.reduce(
      (sum, f) => sum + (f.calories || 0),
      0
    );
    const monthlyCalories = foodMonthly.reduce(
      (sum, f) => sum + (f.calories || 0),
      0
    );
    const yearlyCalories = foodYearly.reduce(
      (sum, f) => sum + (f.calories || 0),
      0
    );

    const mood = journal?.moodRating || "Not recorded";
    const journalEntry = journal?.entry || "";
    const goalsText = goals
      ? [
          goals.dailySteps && `Steps:${goals.dailySteps}`,
          goals.dailyCalories && `Cal:${goals.dailyCalories}`,
          goals.weeklyWorkouts && `Workouts/wk:${goals.weeklyWorkouts}`,
          goals.hydrationGoal && `Hydration:${goals.hydrationGoal}`,
          goals.sleepGoal && `Sleep:${goals.sleepGoal}`,
          goals.weightGoal && `Weight:${goals.weightGoal}`,
        ]
          .filter(Boolean)
          .join(", ")
      : "Not set";

    const prompt = buildChatPrompt({
      habitCompletion,
      completedHabits: completedHabits.length,
      totalHabits: todayHabits.length,
      totalCaloriesToday,
      totalProtein,
      totalCarbs,
      totalFats,
      mood,
      journalEntry,
      weeklyCalories,
      monthlyCalories,
      yearlyCalories,
      goalsText,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // faster + cheaper, still good
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "You are WellNest AI — a concise, supportive fitness buddy. Keep replies under 100 words, include the user’s real stats, sound friendly (not formal), 1–3 emojis max.",
        },
        { role: "user", content: prompt },
      ],
    });

    res.json({ reply: response.choices[0].message.content.trim() });
  } catch (err) {
    console.error("Chatbot error:", err.message);
    res.status(500).json({
      error:
        "Could not generate personalized response. Please try again later.",
    });
  }
};

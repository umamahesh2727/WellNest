import mongoose from "mongoose";
import dotenv from "dotenv";
import Habit from "./models/Habit.js";
import FoodLog from "./models/FoodLog.js";
import Journal from "./models/Journal.js";
import UserGoals from "./models/UserGoals.js";

dotenv.config();
mongoose.connect(process.env.MONGO_URI);

const userId = "687bb023e9c1167c5b2da34e";

const seedDummyData = async () => {
  try {
    await Habit.deleteMany({ userId });
    await FoodLog.deleteMany({ userId });
    await Journal.deleteMany({ userId });
    await UserGoals.deleteMany({ userId });

    const habitNames = ["Meditation", "Workout", "Reading", "Yoga", "Hydration", "Walking", "Gratitude"];
    const emojis = ["🧘", "💪", "📖", "🚴", "💧", "😄", "🎯"];
    const foodItems = ["Eggs", "Chicken", "Rice", "Milk", "Veggies", "Oats", "Fruit", "Paneer", "Fish", "Tofu"];
    const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snacks"];
    const journalSamples = [
      "✅ Morning habits:\n- Meditation 🧘\n- Workout 💪\n- Hydration 💧\nNotes: Energy was good today.",
      "Feeling tired today. Only hydration done.\nMood: 💤",
      "Full energy!\n- Morning workout ✅\n- Evening reading ✅\nFeeling good 😄",
      "Lazy day 😴\nBarely did hydration.\nNotes: Bad sleep.",
      "Productive today!\n✅ Meditation, ✅ Workout, ✅ Hydration, ✅ Reading 📖",
      "Mood dipped. Low consistency.\nNotes: Work stress hit.",
      "Steady progress. 🏃\n- Yoga ✅\n- Gratitude ✅\n- Walking ✅\nFeeling motivated!"
    ];

    const habits = [];
    const foodLogs = [];
    const journals = [];

    // All habits exist every day over 90 days
    habitNames.forEach((habitName, index) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 90);
      const completedDates = [];

      for (let j = 0; j < 90; j++) {
        const dateObj = new Date();
        dateObj.setDate(dateObj.getDate() - j);
        const dateStr = dateObj.toISOString().split("T")[0];
        const completionChance = Math.random();

        if (completionChance > 0.3 || (j % 7 < 4)) {
          completedDates.push(dateStr); // more likely to complete at least 4 days a week
        }
      }

      habits.push({
        userId,
        name: habitName,
        frequency: "daily",
        times: 1,
        unit: "Minutes",
        startDate: startDate.toISOString().split("T")[0],
        endDate: null,
        createdDate: startDate.toISOString().split("T")[0],
        completedDates,
        emoji: emojis[index],
      });
    });

    await Habit.insertMany(habits);

    for (let i = 0; i < 90; i++) {
      const dateObj = new Date();
      dateObj.setDate(dateObj.getDate() - i);
      const dateStr = dateObj.toISOString().split("T")[0];

      const mealCount = 2 + Math.floor(Math.random() * 3);
      for (let j = 0; j < mealCount; j++) {
        foodLogs.push({
          userId,
          name: foodItems[Math.floor(Math.random() * foodItems.length)],
          mealType: mealTypes[Math.floor(Math.random() * mealTypes.length)],
          calories: 250 + Math.floor(Math.random() * 450),
          protein: Math.floor(Math.random() * 30),
          carbs: Math.floor(Math.random() * 60),
          fats: Math.floor(Math.random() * 20),
          date: dateStr,
        });
      }

      journals.push({
        userId,
        date: dateStr,
        entry: journalSamples[Math.floor(Math.random() * journalSamples.length)],
        moodRating: Math.floor(Math.random() * 5) + 1,
      });
    }

    await FoodLog.insertMany(foodLogs);
    await Journal.insertMany(journals);

    await UserGoals.create({
      userId,
      dailySteps: 10000,
      dailyCalories: 2000,
      weeklyWorkouts: 5,
      weightGoal: 70,
      sleepGoal: 8,
      hydrationGoal: 3,
      customGoals: "Mindfulness, habits, healthy eating, hydration, consistent movement 🌿",
    });

    console.log("✅ Realistic habits, food, journals for 90 days seeded successfully.");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedDummyData();

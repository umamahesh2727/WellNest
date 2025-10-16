import { useState } from "react";
import { Calendar, BarChart3, TrendingUp, ArrowLeft } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";

const COLORS = ["#6366f1", "#8b5cf6", "#06b6d4"];

const mealIcons = {
  Breakfast: "🥓",
  Lunch: "🍽️",
  Dinner: "🍜",
  Snack: "🍼",
};

const GoalAnalytics = () => {
  const [activeTab, setActiveTab] = useState("weekly");
  const [selectedAnalyticsDate, setSelectedAnalyticsDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showSpecificDateView, setShowSpecificDateView] = useState(false);

  const tabs = [
    { id: "weekly", label: "Weekly", icon: Calendar },
    { id: "monthly", label: "Monthly", icon: BarChart3 },
    { id: "yearly", label: "Yearly", icon: TrendingUp },
  ];

  const { data: analyticsData = {}, isLoading } = useQuery({
    queryKey: ["analytics", activeTab],
    queryFn: async () =>
      (await axiosInstance.get(`/analytics/${activeTab}`)).data,
  });

  const { data: summaryData } = useQuery({
    queryKey: ["analytics-summary", selectedAnalyticsDate],
    queryFn: async () =>
      (
        await axiosInstance.get(
          `/analytics/summary?date=${selectedAnalyticsDate}`
        )
      ).data,
    enabled: showSpecificDateView,
  });

  if (isLoading || !analyticsData) {
    return (
      <div className="text-center text-slate-300">Loading Analytics...</div>
    );
  }

  if (showSpecificDateView && summaryData) {
    return (
      <div className="glass-card p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setShowSpecificDateView(false)}
            className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Analytics</span>
          </button>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <input
              type="date"
              value={selectedAnalyticsDate}
              onChange={(e) => setSelectedAnalyticsDate(e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
            />
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-white mb-6 gradient-text-light">
          Daily Summary -{" "}
          {new Date(selectedAnalyticsDate)
            .toLocaleDateString("en-GB")
            .replaceAll("/", "-")}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">
              ✅ Habits Status
            </h3>
            {summaryData.habitsList.length === 0 ? (
              <p className="text-slate-400 text-center">
                No habits for this date
              </p>
            ) : (
              summaryData.habitsList.map((habit) => (
                <div
                  key={habit._id}
                  className="flex items-center space-x-3 p-2 rounded-lg bg-white/5"
                >
                  <span className="text-xl">{habit.emoji}</span>
                  <span
                    className={`flex-1 ${
                      habit.isCompleted
                        ? "text-green-400 line-through"
                        : "text-slate-300"
                    }`}
                  >
                    {habit.name}
                  </span>
                  <span
                    className={`text-sm px-2 py-1 rounded-full ${
                      habit.isCompleted
                        ? "bg-green-500/20 text-green-400"
                        : "bg-slate-500/20 text-slate-400"
                    }`}
                  >
                    {habit.isCompleted ? "✓ Done" : "Pending"}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">
              🍽️ Food Log
            </h3>
            {Object.keys(summaryData.foodByMealType || {}).length === 0 ? (
              <p className="text-slate-400 text-center">
                No food logged for this date.
              </p>
            ) : (
              Object.entries(summaryData.foodByMealType).map(
                ([meal, items]) => (
                  <div key={meal} className="mb-3">
                    <h4 className="text-slate-300 font-semibold">
                      {mealIcons[meal] || "•"} {meal}:
                    </h4>
                    <ul className="list-disc list-inside text-slate-400">
                      {items.map((item) => (
                        <li key={item._id}>
                          {item.name} ({item.calories} cal)
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              )
            )}
            <h3 className="text-lg font-semibold text-white mb-4 mt-6">
              📓 Journal Entry
            </h3>
            <p className="text-slate-400 whitespace-pre-wrap min-h-[50px]">
              {summaryData.journalEntry?.entry?.trim()
                ? summaryData.journalEntry.entry
                : "No journal entry for this date."}
            </p>
            {summaryData.journalEntry?.moodRating && (
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-slate-400 text-sm">Mood Rating:</span>
                {[1, 2, 3, 4, 5].map((r) => (
                  <div
                    key={r}
                    className={`w-3 h-3 rounded-full ${
                      r <= summaryData.journalEntry.moodRating
                        ? "bg-indigo-400"
                        : "bg-slate-600"
                    }`}
                  />
                ))}
                <span className="ml-2 text-indigo-400 text-sm">
                  {summaryData.journalEntry.moodRating}/5
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white gradient-text-light">
          Analytics
        </h2>
        <button
          onClick={() => setShowSpecificDateView(true)}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg shadow-lg"
        >
          View Specific Date
        </button>
      </div>

      <div className="flex space-x-1 mb-6 bg-white/5 p-1 rounded-xl border border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg text-sm ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/10"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">
            Habit Consistency
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.datasets}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey={activeTab === "yearly" ? "month" : "date"}
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fontSize: 10 }}
                />
                <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 10 }} />
                <Bar
                  dataKey="habitsPercent"
                  fill="url(#habitGradient)"
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient
                    id="habitGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">
            {activeTab === "weekly" ? "Calorie Distribution" : "Food Trends"}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === "weekly" ? (
                <LineChart data={analyticsData.datasets}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis
                    dataKey={activeTab === "yearly" ? "month" : "date"}
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fontSize: 10 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="calories"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    dot={{ fill: "#06b6d4", r: 4 }}
                  />
                </LineChart>
              ) : activeTab === "monthly" || activeTab === "yearly" ? (
                <LineChart data={analyticsData.datasets}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis
                    dataKey={activeTab === "yearly" ? "month" : "date"}
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fontSize: 10 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="calories"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    dot={{ fill: "#06b6d4", r: 4 }}
                  />
                </LineChart>
              ) : analyticsData.totalProtein > 0 ||
                analyticsData.totalCarbs > 0 ||
                analyticsData.totalFats > 0 ? (
                <RechartsPieChart>
                  <Pie
                    data={[
                      { name: "Protein", value: analyticsData.totalProtein },
                      { name: "Carbs", value: analyticsData.totalCarbs },
                      { name: "Fats", value: analyticsData.totalFats },
                    ].filter((macro) => macro.value > 0)}
                    dataKey="value"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    label={({ name }) => name}
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Legend />
                </RechartsPieChart>
              ) : (
                <div className="text-slate-400 text-center">
                  No macros data to show.
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
          <div className="text-2xl font-bold text-indigo-400">
            {analyticsData.activeDays}
          </div>
          <div className="text-sm text-slate-400">Active Days</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
          <div className="text-2xl font-bold text-indigo-400">
            {analyticsData.totalCalories}
          </div>
          <div className="text-sm text-slate-400">Total Calories</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
          <div className="text-2xl font-bold text-indigo-400">
            {analyticsData.avgCompletion}%
          </div>
          <div className="text-sm text-slate-400">Avg Completion</div>
        </div>
      </div>
    </div>
  );
};

export default GoalAnalytics;

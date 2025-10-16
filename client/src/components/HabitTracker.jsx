import React, { useState } from "react";
import { Calendar, X } from "lucide-react";
import { DateTime } from "luxon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";

const emojis = ["🧘", "💧", "🏃", "🍎", "📖", "💪", "🚴", "🎯", "⚡", "🌟"];
const units = [
  "Minutes",
  "Hours",
  "Litres",
  "Glasses",
  "Pages",
  "Times",
  "Steps",
  "Reps",
  "Grams",
  "Kilometers",
];
const frequencies = ["Daily", "Weekly", "Monthly"];
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const HabitTracker = () => {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: "",
    emoji: "🧘",
    customEmoji: "",
    frequency: "Daily",
    selectedDays: [],
    value: 1,
    unit: "Minutes",
    time: "",
    reminders: false,
    startDate: new Date().toLocaleDateString("en-CA"),
    endDate: "",
  });

  const { data } = useQuery({
    queryKey: ["habits"],
    queryFn: async () => {
      const res = await axiosInstance.get("/habits");
      return res.data || [];
    },
  });

  const habits = Array.isArray(data) ? data : [];

  const createHabit = useMutation({
    mutationFn: async (habit) => {
      await axiosInstance.post("/habits", habit);
    },
    onSuccess: () => queryClient.invalidateQueries(["habits"]),
  });

  const updateHabit = useMutation({
    mutationFn: async ({ id, date }) => {
      await axiosInstance.patch(`/habits/${id}`, { date });
    },
    onSuccess: () => queryClient.invalidateQueries(["habits"]),
  });

  const deleteHabit = useMutation({
    mutationFn: async (id) => {
      await axiosInstance.delete(`/habits/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries(["habits"]),
  });

  const isFutureDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inputDate = new Date(date);
    inputDate.setHours(0, 0, 0, 0);
    return inputDate > today;
  };

  const getHabitsForDate = (selectedDateStr) =>
    habits.filter((h) => {
      const start = DateTime.fromISO(h.startDate || "").startOf("day");
      const end = h.endDate ? DateTime.fromISO(h.endDate).startOf("day") : null;

      const selected = DateTime.fromISO(selectedDateStr).startOf("day");

      if (!start.isValid) return false;

      return !end ? selected >= start : selected >= start && selected <= end;
    });

  const isCurrentDate = selectedDate === new Date().toISOString().split("T")[0];
  const currentHabits = getHabitsForDate(selectedDate);
  const completedCount = currentHabits.filter((h) =>
    h.completedDates?.includes(selectedDate)
  ).length;

  const resetForm = () => {
    setNewHabit({
      name: "",
      emoji: "🧘",
      customEmoji: "",
      frequency: "Daily",
      selectedDays: [],
      value: 1,
      unit: "Minutes",
      time: "",
      reminders: false,
      startDate: new Date().toLocaleDateString("en-CA"),
      endDate: "",
    });
  };

  const addHabit = async () => {
    if (newHabit.name.trim()) {
      await createHabit.mutateAsync({
        name: newHabit.name,
        frequency: newHabit.frequency,
        times: newHabit.value,
        unit: newHabit.unit,
        reminderTime: newHabit.time,
        enableReminder: newHabit.reminders,
        startDate: newHabit.startDate,
        endDate: newHabit.endDate,
        createdDate: selectedDate,
        emoji: newHabit.customEmoji || newHabit.emoji,
      });
      resetForm();
      setShowAddForm(false);
    }
  };

  return (
    <div className="glass-card p-4 sm:p-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-white gradient-text-light">
          Habit Tracker
        </h2>
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
          />
        </div>
      </div>

      {currentHabits.length > 0 && (
        <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-300">Progress</span>
            <span className="text-indigo-400 font-medium">
              {completedCount}/{currentHabits.length} completed
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 mt-2">
            <div
              className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2 rounded-full"
              style={{
                width: `${
                  currentHabits.length > 0
                    ? (completedCount / currentHabits.length) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="space-y-3 sm:space-y-4 flex-1 overflow-y-auto">
        {currentHabits.map((habit) => {
          const isCompletedToday = habit.completedDates?.includes(selectedDate);
          return (
            <div
              key={habit._id}
              className="habit-item flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <button
                onClick={() =>
                  !isFutureDate(selectedDate) &&
                  updateHabit.mutate({
                    id: habit._id,
                    date: selectedDate,
                  })
                }
                disabled={isFutureDate(selectedDate)}
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg border-2 flex items-center justify-center ${
                  isCompletedToday
                    ? "bg-gradient-to-r from-indigo-500 to-blue-500 border-indigo-400 shadow-lg"
                    : isFutureDate(selectedDate)
                    ? "border-slate-600 bg-white/5 cursor-not-allowed opacity-50"
                    : "border-slate-400 bg-white/10 hover:border-indigo-400 hover:shadow-lg"
                }`}
              >
                {isCompletedToday && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                )}
              </button>

              <span className="text-lg sm:text-xl mr-2 sm:mr-3">
                {habit.emoji}
              </span>
              <span
                className={`flex-1 font-medium ${
                  isCompletedToday
                    ? "text-slate-300 line-through opacity-75"
                    : "text-slate-200"
                }`}
              >
                {habit.name}
              </span>

              <div
                className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                  isCompletedToday
                    ? "bg-gradient-to-r from-indigo-500/20 to-blue-500/20 text-indigo-300 border border-indigo-400/30"
                    : "bg-white/10 text-slate-400 border border-white/20"
                }`}
              >
                {isCompletedToday ? "Done" : "Pending"}
              </div>

              <button
                onClick={() => deleteHabit.mutate(habit._id)}
                className="ml-2 p-1 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/20">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-3 border-2 border-dashed rounded-xl border-slate-600 text-slate-400 hover:border-indigo-500 hover:text-indigo-400 hover:bg-white/5"
          >
            + Add New Habit
          </button>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Create New Habit
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              value={newHabit.name}
              onChange={(e) =>
                setNewHabit({ ...newHabit, name: e.target.value })
              }
              placeholder="e.g., Drink Water, Read Books..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400"
            />

            <div className="flex flex-wrap gap-2">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() =>
                    setNewHabit({ ...newHabit, emoji, customEmoji: "" })
                  }
                  className={`p-3 rounded-xl text-xl ${
                    newHabit.emoji === emoji && !newHabit.customEmoji
                      ? "bg-indigo-500/30 border-2 border-indigo-400 shadow-lg scale-110"
                      : "bg-white/10 border border-white/20 hover:bg-white/20"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <input
              type="text"
              maxLength="3"
              value={newHabit.customEmoji}
              onChange={(e) =>
                setNewHabit({ ...newHabit, customEmoji: e.target.value })
              }
              placeholder="Custom emoji 🎨 or ABC"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 text-center text-lg"
            />

            <Select
              value={newHabit.frequency}
              onValueChange={(value) =>
                setNewHabit({ ...newHabit, frequency: value, selectedDays: [] })
              }
            >
              <SelectTrigger className="flex-1 rounded-xl bg-white/10 border border-white/20 text-white px-4 py-3 h-12">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>

              <SelectContent className="bg-slate-800 text-white">
                {frequencies.map((freq) => (
                  <SelectItem key={freq} value={freq}>
                    {freq}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {newHabit.frequency === "Weekly" && (
              <div className="flex flex-wrap gap-2">
                {weekDays.map((day) => (
                  <button
                    key={day}
                    onClick={() => {
                      const updatedDays = newHabit.selectedDays.includes(day)
                        ? newHabit.selectedDays.filter((d) => d !== day)
                        : [...newHabit.selectedDays, day];
                      setNewHabit({ ...newHabit, selectedDays: updatedDays });
                    }}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      newHabit.selectedDays.includes(day)
                        ? "bg-indigo-500/30 border border-indigo-400 text-indigo-300"
                        : "bg-white/10 border border-white/20 text-slate-300"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            )}

            <div className="flex space-x-3">
              <input
                type="number"
                min="1"
                value={newHabit.value}
                onChange={(e) =>
                  setNewHabit({
                    ...newHabit,
                    value: parseInt(e.target.value) || 1,
                  })
                }
                className="w-24 px-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
              />
              <Select
                value={newHabit.unit}
                onValueChange={(value) =>
                  setNewHabit({ ...newHabit, unit: value })
                }
              >
                <SelectTrigger className="flex-1 rounded-xl bg-white/10 border border-white/20 text-white px-4 py-3 h-12">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 text-white">
                  {units.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <input
              type="time"
              value={newHabit.time}
              onChange={(e) =>
                setNewHabit({ ...newHabit, time: e.target.value })
              }
              className="w-full px-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
            />

            <Switch
              checked={newHabit.reminders}
              onCheckedChange={(checked) =>
                setNewHabit({ ...newHabit, reminders: checked })
              }
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={newHabit.startDate}
                onChange={(e) =>
                  setNewHabit({ ...newHabit, startDate: e.target.value })
                }
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />

              <input
                type="date"
                value={newHabit.endDate}
                onChange={(e) =>
                  setNewHabit({ ...newHabit, endDate: e.target.value })
                }
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={addHabit}
                disabled={!newHabit.name.trim()}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl"
              >
                Create Habit
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                className="flex-1 py-3 bg-white/10 text-slate-300 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitTracker;

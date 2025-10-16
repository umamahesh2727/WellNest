import { useState, useEffect } from "react";
import {
  X,
  Target,
  TrendingUp,
  Heart,
  Moon,
  Droplets,
  Activity,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";


const UserGoalsModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();

  const defaultGoals = {
    dailySteps: "",
    dailyCalories: "",
    weeklyWorkouts: "",
    weightGoal: "",
    sleepHours: "",
    hydrationLiters: "",
    customGoals: "",
    preferredUnits: {
      weight: "kg",
      distance: "km",
    },
  };

  const { data: userGoals } = useQuery({
    queryKey: ["userGoals"],
    queryFn: async () => {
      const res = await axiosInstance.get("/goals");
      return res.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (goalsData) => {
      await axiosInstance.post("/goals", {
        dailySteps: goalsData.dailySteps,
        dailyCalories: goalsData.dailyCalories,
        weeklyWorkouts: goalsData.weeklyWorkouts,
        weightGoal: goalsData.weightGoal,
        sleepGoal: goalsData.sleepHours,
        hydrationGoal: goalsData.hydrationLiters,
        customGoals: goalsData.customGoals,
        preferredUnits: goalsData.preferredUnits,
      });
    },
    onSuccess: () => queryClient.invalidateQueries(["userGoals"]),
  });

  const [goals, setGoals] = useState(defaultGoals);

  useEffect(() => {
    if (userGoals) {
      setGoals({
        dailySteps: userGoals.dailySteps || "",
        dailyCalories: userGoals.dailyCalories || "",
        weeklyWorkouts: userGoals.weeklyWorkouts || "",
        weightGoal: userGoals.weightGoal || "",
        sleepHours: userGoals.sleepGoal || "",
        hydrationLiters: userGoals.hydrationGoal || "",
        customGoals: userGoals.customGoals || "",
        preferredUnits: {
          weight: userGoals.preferredUnits?.weight || "kg",
          distance: userGoals.preferredUnits?.distance || "km",
        },
      });
    }
  }, [userGoals]);

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setGoals((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setGoals((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(goals);
    onClose();
  };

  const handleReset = () => {
    setGoals(defaultGoals);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center min-h-screen p-4 animate-fade-in">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/30 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in mx-auto my-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700/30">
          <div className="flex items-center space-x-3">
            <Target className="w-6 h-6 text-indigo-400" />
            <h2 className="text-2xl font-bold text-white">
              Set Your Health Goals
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GoalInput
              label="Daily Step Goal"
              icon={<Activity className="w-4 h-4 text-indigo-400" />}
              field="dailySteps"
              value={goals.dailySteps}
              onChange={handleInputChange}
              unit="steps per day"
            />
            <GoalInput
              label="Daily Calorie Intake Goal"
              icon={<TrendingUp className="w-4 h-4 text-indigo-400" />}
              field="dailyCalories"
              value={goals.dailyCalories}
              onChange={handleInputChange}
              unit="calories per day"
            />
            <GoalInput
              label="Weekly Workout Days"
              icon={<Activity className="w-4 h-4 text-indigo-400" />}
              field="weeklyWorkouts"
              value={goals.weeklyWorkouts}
              onChange={handleInputChange}
              unit="days per week"
            />
            <GoalInput
              label="Weight Goal"
              icon={<Target className="w-4 h-4 text-indigo-400" />}
              field="weightGoal"
              value={goals.weightGoal}
              onChange={handleInputChange}
              unit={goals?.preferredUnits?.weight || "kg"}
            />
            <GoalInput
              label="Sleep Goal"
              icon={<Moon className="w-4 h-4 text-indigo-400" />}
              field="sleepHours"
              value={goals.sleepHours}
              onChange={handleInputChange}
              unit="hours per night"
            />
            <GoalInput
              label="Hydration Goal"
              icon={<Droplets className="w-4 h-4 text-indigo-400" />}
              field="hydrationLiters"
              value={goals.hydrationLiters}
              onChange={handleInputChange}
              unit="liters per day"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-slate-300">
              <Heart className="w-4 h-4 text-indigo-400" />
              <span>Custom Personal Goals</span>
            </label>
            <textarea
              value={goals.customGoals}
              onChange={(e) => handleInputChange("customGoals", e.target.value)}
              placeholder="Add any other personal health goals or notes here..."
              rows={4}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-smooth resize-none"
            />
            <span className="text-xs text-slate-400">
              Optional: Any additional goals you'd like to track
            </span>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium text-slate-300">
              Preferred Units
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UnitSelect
                label="Weight Unit"
                field="preferredUnits.weight"
                value={goals?.preferredUnits?.weight}
                onChange={handleInputChange}
                options={[
                  { label: "Kilograms (kg)", value: "kg" },
                  { label: "Pounds (lbs)", value: "lbs" },
                ]}
              />
              <UnitSelect
                label="Distance Unit"
                field="preferredUnits.distance"
                value={goals?.preferredUnits?.distance}
                onChange={handleInputChange}
                options={[
                  { label: "Kilometers (km)", value: "km" },
                  { label: "Miles", value: "miles" },
                ]}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-700/30">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-3 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-700 transition-smooth border border-slate-600/30"
            >
              Reset to Default
            </button>
            <div className="flex gap-3 sm:ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-white/10 text-slate-300 rounded-xl hover:bg-white/20 transition-smooth border border-white/20"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-smooth shadow-lg shadow-indigo-500/30 font-medium"
              >
                Save Goals
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const GoalInput = ({ label, icon, field, value, onChange, unit }) => (
  <div className="space-y-2">
    <label className="flex items-center space-x-2 text-sm font-medium text-slate-300">
      {icon}
      <span>{label}</span>
    </label>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(field, e.target.value)}
      placeholder={`e.g., ${unit}`}
      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-smooth"
    />
    <span className="text-xs text-slate-400">{unit}</span>
  </div>
);

const UnitSelect = ({ label, field, value, onChange, options }) => (
  <div className="space-y-2">
    <label className="text-xs text-slate-400">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(field, e.target.value)}
      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-smooth"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default UserGoalsModal;

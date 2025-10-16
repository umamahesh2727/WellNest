// TOP OF FILE
import { useState } from "react";
import { Calendar, Plus, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";

// ✅ Load env keys
const APP_ID = import.meta.env.VITE_NUTRITIONIX_APP_ID;
const API_KEY = import.meta.env.VITE_NUTRITIONIX_API_KEY;

const FoodLogger = () => {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFood, setNewFood] = useState({
    name: "",
    calories: "",
    mealType: "Breakfast",
    protein: "",
    carbs: "",
    fats: "",
  });

  const fetchFoodMacros = async () => {
    if (!newFood.name.trim()) return;
    try {
      const res = await fetch(
        "https://trackapi.nutritionix.com/v2/natural/nutrients",
        {
          method: "POST",
          headers: {
            "x-app-id": APP_ID,
            "x-app-key": API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: newFood.name }),
        }
      );

      const data = await res.json();
      const food = data.foods?.[0];
      if (!food) return;

      setNewFood((prev) => ({
        ...prev,
        calories: food.nf_calories || "",
        protein: food.nf_protein || "",
        carbs: food.nf_total_carbohydrate || "",
        fats: food.nf_total_fat || "",
      }));
    } catch (err) {
      console.error("Error fetching food macros:", err);
    }
  };

  const { data: foodsData = [] } = useQuery({
    queryKey: ["foods"],
    queryFn: async () => {
      const res = await axiosInstance.get("/food");
      return res.data || [];
    },
  });

  const foods = foodsData.filter(
    (food) => new Date(food.date).toLocaleDateString("en-CA") === selectedDate
  );

  const totalCalories = foods.reduce((sum, food) => sum + food.calories, 0);

  const createFood = useMutation({
    mutationFn: async (food) => {
      await axiosInstance.post("/food", food);
    },
    onSuccess: () => queryClient.invalidateQueries(["foods"]),
  });

  const deleteFood = useMutation({
    mutationFn: async (id) => {
      await axiosInstance.delete(`/food/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries(["foods"]),
  });

  const addFood = async () => {
    if (!newFood.name.trim() || !newFood.calories) return;

    await createFood.mutateAsync({
      name: newFood.name,
      calories: parseInt(newFood.calories),
      protein: parseFloat(newFood.protein) || 0,
      carbs: parseFloat(newFood.carbs) || 0,
      fats: parseFloat(newFood.fats) || 0,
      mealType: newFood.mealType,
      date: selectedDate,
    });

    setNewFood({
      name: "",
      calories: "",
      mealType: "Breakfast",
      protein: "",
      carbs: "",
      fats: "",
    });
    setShowAddForm(false);
  };

  const isCurrentDate = selectedDate === new Date().toLocaleDateString("en-CA");

  const groupedFoods = foods.reduce((acc, food) => {
    if (!acc[food.mealType]) acc[food.mealType] = [];
    acc[food.mealType].push(food);
    return acc;
  }, {});

  return (
    <div className="glass-card hover:shadow-indigo-500/20 p-4 sm:p-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-white gradient-text-light">
            Food Logger
          </h2>
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-bold text-indigo-400">
              {totalCalories}
            </div>
            <div className="text-slate-300 text-xs sm:text-sm">
              Total Calories
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toLocaleDateString("en-CA")}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
          />
        </div>
      </div>

      <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center justify-center w-full py-3 border-2 border-dashed rounded-xl border-slate-600 text-slate-400 hover:border-indigo-500 hover:text-indigo-400 hover:bg-white/5"
          >
            <Plus className="w-4 h-4 mr-2" />
            Log Food
          </button>
        ) : (
          <div className="space-y-3">
            {/* 🍱 Food name + Autofill button */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newFood.name}
                onChange={(e) =>
                  setNewFood({ ...newFood, name: e.target.value })
                }
                placeholder="Food name..."
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
              />
              <button
                type="button"
                onClick={fetchFoodMacros}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
              >
                Autofill
              </button>
            </div>

            <div className="flex space-x-3">
              <input
                type="number"
                value={newFood.calories}
                onChange={(e) =>
                  setNewFood({ ...newFood, calories: e.target.value })
                }
                placeholder="Calories"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
              />
              <select
                value={newFood.mealType}
                onChange={(e) =>
                  setNewFood({ ...newFood, mealType: e.target.value })
                }
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-slate-800"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snack">Snack</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300 font-medium">
                Macros (optional)
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col">
                  <label className="text-xs text-slate-400 mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newFood.protein}
                    onChange={(e) =>
                      setNewFood({ ...newFood, protein: e.target.value })
                    }
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-slate-400 mb-1">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newFood.carbs}
                    onChange={(e) =>
                      setNewFood({ ...newFood, carbs: e.target.value })
                    }
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-slate-400 mb-1">
                    Fats (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newFood.fats}
                    onChange={(e) =>
                      setNewFood({ ...newFood, fats: e.target.value })
                    }
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={addFood}
                className="flex-1 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg"
              >
                Add Food
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewFood({
                    name: "",
                    calories: "",
                    mealType: "Breakfast",
                    protein: "",
                    carbs: "",
                    fats: "",
                  });
                }}
                className="flex-1 py-2 bg-white/10 text-slate-300 rounded-lg border border-white/20"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rest of the table (unchanged) */}
      <div className="space-y-4 flex-1 overflow-y-auto">
        {Object.keys(groupedFoods).length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No food logged for {selectedDate}
          </div>
        ) : (
          Object.entries(groupedFoods).map(([mealType, mealFoods]) => (
            <div
              key={mealType}
              className="bg-white/5 rounded-xl border border-white/10"
            >
              <div className="p-3 bg-slate-700">
                <h3 className="font-semibold text-white text-lg">{mealType}</h3>
                <p className="text-sm text-slate-200">
                  {mealFoods.reduce((sum, food) => sum + food.calories, 0)}{" "}
                  calories
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-3 text-slate-300 text-sm">
                        Food
                      </th>
                      <th className="text-right p-3 text-slate-300 text-sm">
                        Calories
                      </th>
                      <th className="text-right p-3 text-slate-300 text-sm">
                        Macros
                      </th>
                      <th className="text-right p-3 text-slate-300 text-sm">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mealFoods.map((food) => (
                      <tr
                        key={food._id}
                        className="border-b border-white/5 hover:bg-white/5"
                      >
                        <td className="p-3 text-slate-200">{food.name}</td>
                        <td className="p-3 text-right text-indigo-400">
                          {food.calories}
                        </td>
                        <td className="p-3 text-right text-slate-400 text-xs">
                          <div className="space-y-1">
                            {food.protein > 0 && <div>P: {food.protein}g</div>}
                            {food.carbs > 0 && <div>C: {food.carbs}g</div>}
                            {food.fats > 0 && <div>F: {food.fats}g</div>}
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => deleteFood.mutate(food._id)}
                            className="p-1 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FoodLogger;

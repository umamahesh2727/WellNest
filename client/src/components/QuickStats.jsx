  import { useQuery } from "@tanstack/react-query";
  import axiosInstance from "../axiosInstance";


  const QuickStats = () => {
    const { data, isLoading, isError } = useQuery({
      queryKey: ["stats"],
      queryFn: async () => {
        const res = await axiosInstance.get("/stats");
        return res.data;
      },
    });

    if (isLoading) return <div>Loading stats...</div>;
    if (isError || !data) return <div>Failed to load stats.</div>;

    return (
      <div className="glass-card hover:shadow-indigo-500/20 transition-all duration-300 p-4 sm:p-6 h-full flex flex-col">
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-6 gradient-text-light">
          Quick Stats
        </h2>
        <div className="grid grid-cols-2 gap-4 flex-1 content-center">
          <div className="flex flex-col justify-center items-center p-4 bg-white/5 rounded-xl border border-white/10 h-full">
            <div className="text-2xl sm:text-3xl font-bold text-indigo-400 mb-2">
              {data.streak}
            </div>
            <div className="text-slate-300 text-sm text-center">Day Streak</div>
          </div>
          <div className="flex flex-col justify-center items-center p-4 bg-white/5 rounded-xl border border-white/10 h-full">
            <div className="text-2xl sm:text-3xl font-bold text-indigo-400 mb-2">
              {data.todayGoalPercent} %
            </div>
            <div className="text-slate-300 text-sm text-center">Today's Goal</div>
          </div>
          <div className="flex flex-col justify-center items-center p-4 bg-white/5 rounded-xl border border-white/10 h-full">
            <div className="text-2xl sm:text-3xl font-bold text-slate-300 mb-2">
              {data.caloriesToday}
            </div>
            <div className="text-slate-300 text-sm text-center">
              Calories Today
            </div>
          </div>
          <div className="flex flex-col justify-center items-center p-4 bg-white/5 rounded-xl border border-white/10 h-full">
            <div className="text-2xl sm:text-3xl font-bold text-slate-300 mb-2">
              {data.habitsHit}
            </div>
            <div className="text-slate-300 text-sm text-center">Habits Hit</div>
          </div>
        </div>
      </div>
    );
  };

  export default QuickStats;

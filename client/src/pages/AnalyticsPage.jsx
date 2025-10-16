import Navigation from "../components/Navigation";
import GoalAnalytics from "../components/GoalAnalytics";
import ChatAssistant from "../components/ChatAssistant";
import VoiceAssistant from "../components/VoiceAssistant";

const AnalyticsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <Navigation />

      <div className="fixed bottom-6 right-28 z-40">
        <VoiceAssistant />
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-100 mb-2 bg-gradient-to-r from-indigo-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Analytics
          </h1>
          <p className="text-lg sm:text-xl text-slate-400">Track your progress and insights</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <GoalAnalytics />
        </div>
      </div>

      <ChatAssistant />
    </div>
  );
};

export default AnalyticsPage;

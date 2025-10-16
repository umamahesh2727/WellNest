// ✅ Updated Dashboard.jsx
import { useRef } from "react";
import Navigation from "../components/Navigation";
import HabitTracker from "../components/HabitTracker";
import FoodLogger from "../components/FoodLogger";
import JournalWidget from "../components/JournalWidget";
import ChatAssistant from "../components/ChatAssistant";
import QuickStats from "../components/QuickStats";
import VoiceAssistant from "../components/VoiceAssistant";

const Dashboard = () => {
  const chatRef = useRef(null);

  // ✅ Connect VoiceAssistant to ChatAssistant
  const handleVoiceInput = (spokenText) => {
    if (chatRef.current) {
      chatRef.current.handleVoiceFromOutside(spokenText);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <Navigation />

      {/* ✅ Floating Mic Button */}
      <div className="fixed bottom-6 right-28 z-50">
        <VoiceAssistant onTextCaptured={handleVoiceInput} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-100 mb-2 bg-gradient-to-r from-indigo-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Welcome to WellNest
          </h1>
          <p className="text-lg sm:text-xl text-slate-400">
            A smarter way to build a healthier you
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="min-h-fit">
              <HabitTracker />
            </div>
            <div className="min-h-fit">
              <FoodLogger />
            </div>
            <div className="h-96">
              <JournalWidget />
            </div>
            <div className="h-96">
              <QuickStats />
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Chat Assistant with voice connection */}
      <ChatAssistant ref={chatRef} />
    </div>
  );
};

export default Dashboard;

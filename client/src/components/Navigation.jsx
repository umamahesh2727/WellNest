import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import UserGoalsModal from "./UserGoalsModal";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const getCurrentTab = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "dashboard";
    if (path === "/habit") return "habit";
    if (path === "/food") return "food";
    if (path === "/analytics") return "analytics";
    return "dashboard";
  };

  const currentTab = getCurrentTab();

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setIsMenuOpen(false);
  };

  const handleProfileSettings = () => {
    setShowGoalsModal(true);
    setShowUserMenu(false);
    setIsMenuOpen(false);
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", path: "/dashboard" },
    { id: "habit", label: "Habits", path: "/habit" },
    { id: "food", label: "Food", path: "/food" },
    { id: "analytics", label: "Analytics", path: "/analytics" },
  ];

  return (
    <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/30 sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-slate-100">WellNest</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  currentTab === item.id
                    ? "text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 shadow-lg shadow-indigo-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                {item.label}
              </button>
            ))}

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                <img
                  src={
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format"
                  }
                  alt={"User"}
                  className="w-8 h-8 rounded-full border-2 border-indigo-400 shadow-lg"
                />
                <div className="text-left hidden lg:block">
                  <div className="text-sm font-medium text-slate-200">
                    {user?.fullName || "User Name"}
                  </div>
                  <div className="text-xs text-slate-400">
                    {user?.email || "email@example.com"}
                  </div>
                </div>
                <svg
                  className="w-4 h-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800/95 backdrop-blur-xl border border-slate-700/30 rounded-xl shadow-2xl shadow-black/20 z-50">
                  <div className="p-3 border-b border-slate-700/30">
                    <div className="text-sm font-medium text-slate-200">
                      {user?.fullName || "User Name"}
                    </div>
                    <div className="text-xs text-slate-400">
                      {user?.email || "email@example.com"}
                    </div>
                  </div>
                  <div className="py-2">
                    <button
                      onClick={handleProfileSettings}
                      className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 transition-colors"
                    >
                      Goal Settings
                    </button>
                    <button
                      onClick={() => {
                        navigate("/profile");
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 transition-colors"
                    >
                      Profile Info
                    </button>
                    <hr className="my-2 border-slate-700/30" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700/50 transition-colors"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-slate-200 p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-700/30">
            <div className="flex items-center space-x-3 px-4 py-3 mb-4 bg-slate-800/30 rounded-lg">
              <img
                src={
                  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format"
                }
                alt={"User"}
                className="w-10 h-10 rounded-full border-2 border-indigo-400"
              />
              <div>
                <div className="text-sm font-medium text-slate-200">
                  {user?.fullName || "User Name"}
                </div>
                <div className="text-xs text-slate-400">
                  {user?.email || "email@example.com"}
                </div>
              </div>
            </div>

            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                  currentTab === item.id
                    ? "text-indigo-400 bg-indigo-500/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                {item.label}
              </button>
            ))}

            <button
              onClick={handleProfileSettings}
              className="block w-full text-left px-4 py-3 text-slate-300 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
            >
              Goal Settings
            </button>

            <button
              onClick={() => {
                navigate("/profile");
                setShowUserMenu(false);
                setIsMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-3 text-slate-300 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
            >
              Profile Info
            </button>

            <hr className="my-4 border-slate-700/30" />
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-3 text-red-400 hover:text-red-300 hover:bg-slate-800/50 transition-colors"
            >
              Log Out
            </button>
          </div>
        )}
      </div>

      <UserGoalsModal
        isOpen={showGoalsModal}
        onClose={() => setShowGoalsModal(false)}
      />
    </nav>
  );
};

export default Navigation;

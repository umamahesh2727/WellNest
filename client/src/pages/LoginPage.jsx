// src/pages/LoginPage.jsx
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    await register(email, password);
  };

  const handleGoogleSignIn = () => {
    alert("This is just a demo. Google Sign-In not implemented.");
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const toggleForm = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <div className="w-full max-w-md">
        <div className="glass-card p-8 border border-white/20 backdrop-blur-xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold gradient-text-light mb-2">WellNest</h1>
            <p className="text-slate-400 text-lg">Your wellness journey starts here</p>
          </div>

          {!isSignUp ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
              />
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl"
              >
                Sign In to WellNest
              </button>

              <div className="relative flex items-center justify-center my-6">
                <div className="border-t border-white/20 w-full"></div>
                <span className="bg-slate-950 px-4 text-slate-400 text-sm">or</span>
                <div className="border-t border-white/20 w-full"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-3 bg-white text-gray-700 rounded-xl flex items-center justify-center gap-3"
              >
                <span>Sign in with Google (Demo)</span>
              </button>

              <div className="text-center text-sm mt-6">
                <span className="text-slate-400">New here? </span>
                <button
                  type="button"
                  onClick={toggleForm}
                  className="text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Create Account
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignUpSubmit} className="space-y-6">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
              />
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl"
              >
                Sign Up to WellNest
              </button>

              <div className="text-center text-sm mt-6">
                <span className="text-slate-400">Already have an account? </span>
                <button
                  type="button"
                  onClick={toggleForm}
                  className="text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-slate-300 text-sm text-center">Demo Credentials:</p>
            <p className="text-slate-400 text-xs text-center">
              Use any email and password, or click Google Sign-In
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

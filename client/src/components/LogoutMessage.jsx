
import React from 'react';

const LogoutMessage = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold gradient-text-light mb-4 animate-fade-in">
          See you soon, Buddy!
        </h1>
        <div className="flex justify-center space-x-1 mt-8">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-gradient-to-t from-indigo-500 to-blue-400 rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.3}s`,
                animationDuration: '1.5s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LogoutMessage;

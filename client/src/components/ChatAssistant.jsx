import {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import axiosInstance from "../axiosInstance";

const ChatAssistant = forwardRef((props, ref) => {
  const [voiceInputTriggered, setVoiceInputTriggered] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chatMessages");
    return saved
      ? JSON.parse(saved)
      : [{ text: "Hi there! How can I help you today?", isBot: true }];
  });
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // ChatAssistant.jsx (inside useImperativeHandle)
  useImperativeHandle(ref, () => ({
    handleVoiceFromOutside(spokenText) {
      console.log("🎤 Voice input received in ChatAssistant:", spokenText);
      const msg = (spokenText || "").trim();
      if (!msg) return;
      setInputText("");
      sendMessage(msg, true); // ✅ pass true for voice
    },
  }));

  const speakOutLoud = (text) => {
    if (!text || typeof window === "undefined") return;

    const synth = window.speechSynthesis;
    synth.cancel();

    const cleanText = text.replace(/[🌀-🫐]/gu, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "en-US";
    utterance.pitch = 1;
    utterance.rate = 1;
    utterance.volume = 1;

    const chooseAndSpeak = () => {
      const voices = synth.getVoices();
      const voice =
        voices.find((v) => v.name?.includes?.("Google US English")) ||
        voices.find((v) => v.lang === "en-US") ||
        voices[0];
      if (voice) utterance.voice = voice;
      setTimeout(() => synth.speak(utterance), 120); // avoid race w/ mic
    };

    if (synth.getVoices().length === 0) {
      const once = () => {
        synth.removeEventListener("voiceschanged", once);
        chooseAndSpeak();
      };
      synth.addEventListener("voiceschanged", once);
    } else {
      chooseAndSpeak();
    }
  };

  const sendMessage = async (msg = inputText, fromVoice = false) => {
    const trimmed = (msg || "").trim();
    if (!trimmed) return;

    // Add user message
    const userMessage = { text: trimmed, isBot: false };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await axiosInstance.post("/chatbot", { message: trimmed });

      // Add bot reply
      const botMessage = { text: res.data.reply, isBot: true };
      setMessages((prev) => [...prev, botMessage]);

      // ✅ Speak out loud only if voice triggered
      if (fromVoice) {
        setTimeout(() => speakOutLoud(res.data.reply), 300);
      }
    } catch (error) {
      const botMessage = {
        text: "Something went wrong. Please try again later.",
        isBot: true,
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setInputText("");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-20 h-20 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full shadow-2xl shadow-indigo-500/40 flex items-center justify-center text-white hover:from-indigo-700 hover:to-blue-700 transition-bounce z-50 neon-glow floating-element"
      >
        {isOpen ? (
          <svg
            className="w-8 h-8 rotate-90"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z" />
          </svg>
        ) : (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-28 right-6 w-96 bg-slate-900/95 backdrop-blur-xl border border-slate-700/40 rounded-2xl shadow-2xl z-50 slide-in neon-glow">
          <div className="p-6 border-b border-slate-700/40">
            <h3 className="text-xl font-bold text-slate-100 gradient-text">
              AI Assistant
            </h3>
          </div>

          <div className="p-4 h-80 overflow-y-auto space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.isBot ? "justify-start" : "justify-end"
                } fade-in-delayed`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {message.isBot && (
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0 floating-element shadow-lg shadow-indigo-500/30">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                    </svg>
                  </div>
                )}
                <div
                  className={`max-w-xs px-4 py-3 rounded-2xl transition-smooth hover:scale-105 ${
                    message.isBot
                      ? "bg-slate-800/70 text-slate-200 border border-slate-700/50 backdrop-blur-sm"
                      : "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/30"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef}></div>
          </div>

          <div className="p-4 border-t border-slate-700/40">
            <div className="flex space-x-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-smooth backdrop-blur-sm"
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={() => sendMessage()}
                className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl text-white hover:from-indigo-700 hover:to-blue-700 transition-bounce shadow-lg shadow-indigo-500/30 neon-glow"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default ChatAssistant;

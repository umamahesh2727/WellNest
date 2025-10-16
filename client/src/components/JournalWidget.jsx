import { useState } from "react";
import { Calendar, Edit3, Save } from "lucide-react";
import axiosInstance from "../axiosInstance";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Textarea } from "./ui/textarea";

const JournalWidget = () => {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [currentEntry, setCurrentEntry] = useState("");
  const [currentMoodRating, setCurrentMoodRating] = useState(3);
  const [isEditing, setIsEditing] = useState(false);
  const [isRatingMood, setIsRatingMood] = useState(false);

  const { data: journals = [] } = useQuery({
    queryKey: ["journals"],
    queryFn: async () => {
      const res = await axiosInstance.get("/journal");
      return res.data || [];
    },
  });

  const selectedJournal = journals.find((j) => j.date === selectedDate);

  const createOrUpdateJournal = useMutation({
    mutationFn: async (journalData) => {
      await axiosInstance.post("/journal", journalData);
    },
    onSuccess: () => queryClient.invalidateQueries(["journals"]),
  });

  const saveEntry = async () => {
    if (!isRatingMood) {
      setIsRatingMood(true);
    } else {
      await createOrUpdateJournal.mutateAsync({
        date: selectedDate,
        entry: currentEntry,
        moodRating: currentMoodRating,
      });
      setIsEditing(false);
      setIsRatingMood(false);
    }
  };

  const isCurrentDate = selectedDate === new Date().toLocaleDateString("en-CA");

  return (
    <div className="glass-card p-4 sm:p-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-white gradient-text-light flex items-center">
          <Edit3 className="w-5 h-5 mr-2 text-indigo-400" />
          Journal Entry
        </h2>
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setCurrentEntry("");
              setCurrentMoodRating(3);
              setIsEditing(false);
              setIsRatingMood(false);
            }}
            max={new Date().toLocaleDateString("en-CA")} // Disables future dates
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
          />
        </div>
      </div>

      <div className="space-y-4 flex-1 flex flex-col">
        {!isEditing && selectedJournal ? (
          <div className="bg-white/5 rounded-xl border border-white/10 p-4 flex flex-col space-y-4 max-h-64 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Mood Rating:</span>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <div
                    key={rating}
                    className={`w-3 h-3 rounded-full ${
                      rating <= selectedJournal.moodRating
                        ? "bg-indigo-400"
                        : "bg-slate-600"
                    }`}
                  />
                ))}
                <span className="ml-2 text-indigo-400 text-sm">
                  {selectedJournal.moodRating}/5
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-64">
              <p className="text-slate-200 whitespace-pre-wrap break-words leading-relaxed">
                {selectedJournal.entry}
              </p>
            </div>

            <button
              onClick={() => {
                setIsEditing(true);
                setCurrentEntry(selectedJournal.entry);
                setCurrentMoodRating(selectedJournal.moodRating);
              }}
              className="mt-3 flex items-center space-x-2 text-indigo-400 text-sm"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Entry</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3 flex-1 flex flex-col">
            {isRatingMood && (
              <div className="space-y-2">
                <label className="text-sm text-slate-300 font-medium">
                  How did today feel for you?
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setCurrentMoodRating(rating)}
                      className={`w-8 h-8 rounded-full ${
                        rating <= currentMoodRating
                          ? "bg-indigo-500 hover:bg-indigo-400"
                          : "bg-slate-600 hover:bg-slate-500"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-slate-300 text-sm">
                    {currentMoodRating}/5
                  </span>
                </div>
              </div>
            )}

            {!isRatingMood && (
              <Textarea
                value={currentEntry}
                onChange={(e) => setCurrentEntry(e.target.value)}
                placeholder="Write your thoughts, reflections, or summary of your day here..."
                className="w-full h-48 bg-white/10 border border-white/20 text-white placeholder-slate-400 resize-none rounded-xl px-4 py-3"
              />
            )}

            <div className="flex space-x-3">
              <button
                onClick={saveEntry}
                disabled={!currentEntry.trim()}
                className={`flex-1 py-2 rounded-lg ${
                  isRatingMood
                    ? "bg-gradient-to-r from-green-600 to-green-700"
                    : "bg-gradient-to-r from-indigo-600 to-blue-600"
                } text-white`}
              >
                {isRatingMood ? "Save Entry" : "Write Your Day"}
              </button>
              {(isEditing || isRatingMood) && (
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setIsRatingMood(false);
                    setCurrentEntry("");
                  }}
                  className="px-4 py-2 bg-white/10 text-slate-300 rounded-lg border border-white/20 text-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}

        {!selectedJournal && !isEditing && (
          <div className="text-center flex-1 flex flex-col justify-center">
            <p className="text-slate-400">No journal entry for this date</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalWidget;

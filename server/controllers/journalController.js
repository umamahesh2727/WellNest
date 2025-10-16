import Journal from "../models/Journal.js";

export const createOrUpdateJournal = async (req, res) => {
  try {
    const { date, entry, moodRating } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const givenDate = new Date(date);
    givenDate.setHours(0, 0, 0, 0);

    if (givenDate > today) {
      return res.status(400).json({ error: "Cannot create or update journal for future dates." });
    }

    const existing = await Journal.findOne({ userId: req.user.id, date });

    if (existing) {
      existing.entry = entry;
      existing.moodRating = moodRating;
      existing.timestamp = new Date();
      await existing.save();
      return res.json(existing);
    }

    const newJournal = await Journal.create({
      userId: req.user.id,
      date,
      entry,
      moodRating,
    });
    res.status(201).json(newJournal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserJournals = async (req, res) => {
  try {
    const journals = await Journal.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(journals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getJournalByDate = async (req, res) => {
  try {
    const journal = await Journal.findOne({ userId: req.user.id, date: req.params.date });
    if (!journal) return res.status(404).json({ message: "No journal entry for this date." });
    res.json(journal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

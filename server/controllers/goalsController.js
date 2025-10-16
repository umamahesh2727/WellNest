import UserGoals from "../models/UserGoals.js";

// ✅ Create or Update Goals
export const createOrUpdateGoals = async (req, res) => {
  try {
    const existingGoals = await UserGoals.findOne({ userId: req.user.id });

    if (existingGoals) {
      Object.assign(existingGoals, req.body);
      await existingGoals.save();
      return res.json(existingGoals);
    }

    const newGoals = await UserGoals.create({
      userId: req.user.id,
      ...req.body,
    });

    res.status(201).json(newGoals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get User Goals
export const getUserGoals = async (req, res) => {
  try {
    const goals = await UserGoals.findOne({ userId: req.user.id });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Reset Goals
export const resetGoals = async (req, res) => {
  try {
    await UserGoals.findOneAndDelete({ userId: req.user.id });
    res.json({ message: "Goals reset to default." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

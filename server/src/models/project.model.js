const mongoose = require("mongoose");

// The only difficulty values the app uses (the form offers them, the AI output is checked against them,
// and the client renders exactly these)
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    tagline: { type: String, required: true },
    description: { type: String, required: true },
    features: { type: [String], default: [] },
    techStack: { type: String, required: true },
    difficulty: { type: String, enum: DIFFICULTIES, required: true },
    estimatedTime: String,
    resumeValue: String,
    domain: { type: String, default: "" },
    // which AI model answered (for debugging); hidden from queries unless asked for with select('+aiProvider')
    aiProvider: { type: String, select: false },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // an ownerless project could never be deleted with its user
    },
  },
  { timestamps: true },
);

// Compound index for fast queries sorting user's projects by creation date
projectSchema.index({ user: 1, createdAt: -1 });

const projectModel = mongoose.model("Project", projectSchema);
projectModel.DIFFICULTIES = DIFFICULTIES;

module.exports = projectModel;

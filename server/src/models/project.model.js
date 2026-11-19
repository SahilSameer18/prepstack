const mongoose = require("mongoose");

const { DIFFICULTIES } = require("../services/ai.service.js");

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
projectSchema.index({ user: 1, _id: -1 }); // the list is read newest first by _id, 20 at a time

const projectModel = mongoose.model("Project", projectSchema);
projectModel.DIFFICULTIES = DIFFICULTIES;

module.exports = projectModel;

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  tagline: { type: String, required: true },
  description: { type: String, required: true },
  features: { type: [String], default: [] },
  techStack: { type: String, required: true },
  difficulty: { type: String, required: true },
  estimatedTime: String,
  resumeValue: String,
  domain: { type: String, default: '' },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true })

const projectModel = mongoose.model("Project", projectSchema);

module.exports = projectModel;
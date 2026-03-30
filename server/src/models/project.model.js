const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: String,
  tagline: String,
  description: String,
  features: [String],
  techStack: String,
  difficulty: String,
  estimatedTime: String,
  resumeValue: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true })

const projectModel = mongoose.model("Project", projectSchema);

module.exports = projectModel;
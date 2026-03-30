const mongoose = require('mongoose');

// schema for dsa problem
const dsaProblemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  link: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', 'Basic'],
    default: 'Medium'
  }
});

// schema for dsa topic
const dsaTopicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  problems: [dsaProblemSchema]
});

// schema for dsa sheet
const dsaSheetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true
  },
  topics: [dsaTopicSchema]
}, {
  timestamps: true
});

const DSASheet = mongoose.model('DSASheet', dsaSheetSchema);

module.exports = DSASheet;
 
import mongoose from 'mongoose';

const aiInsightSchema = new mongoose.Schema({
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  summary: {
    english: {
      type: String,
      default: '',
    },
    romanUrdu: {
      type: String,
      default: '',
    },
  },
  abnormalValues: [{
    parameter: String,
    value: String,
    normalRange: String,
    severity: {
      type: String,
      enum: ['low', 'high', 'critical'],
    },
  }],
  doctorQuestions: [String],
  dietaryRecommendations: {
    foodsToAvoid: [String],
    recommendedFoods: [String],
  },
  homeRemedies: [String],
  disclaimer: {
    type: String,
    default: 'This AI analysis is for informational purposes only and should not be considered medical advice. Please consult with a qualified healthcare professional for proper diagnosis and treatment.',
  },
  rawResponse: {
    type: String,
  },
  analysisDate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

const AIInsight = mongoose.model('AIInsight', aiInsightSchema);

export default AIInsight;

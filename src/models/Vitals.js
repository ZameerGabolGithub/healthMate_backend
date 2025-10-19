 
import mongoose from 'mongoose';

const vitalsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  bloodPressure: {
    systolic: {
      type: Number,
      min: 70,
      max: 250,
    },
    diastolic: {
      type: Number,
      min: 40,
      max: 150,
    },
    unit: {
      type: String,
      default: 'mmHg',
    },
  },
  bloodSugar: {
    value: {
      type: Number,
      min: 20,
      max: 600,
    },
    type: {
      type: String,
      enum: ['fasting', 'random', 'postprandial'],
    },
    unit: {
      type: String,
      default: 'mg/dL',
    },
  },
  weight: {
    value: {
      type: Number,
      min: 20,
      max: 300,
    },
    unit: {
      type: String,
      default: 'kg',
    },
  },
  temperature: {
    value: {
      type: Number,
      min: 95,
      max: 110,
    },
    unit: {
      type: String,
      default: 'F',
    },
  },
  heartRate: {
    value: {
      type: Number,
      min: 40,
      max: 200,
    },
    unit: {
      type: String,
      default: 'bpm',
    },
  },
  notes: {
    type: String,
    maxlength: 500,
  },
}, {
  timestamps: true,
});

const Vitals = mongoose.model('Vitals', vitalsSchema);

export default Vitals;

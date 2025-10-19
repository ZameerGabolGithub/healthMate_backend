 
import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
    enum: ['lab_report', 'prescription', 'xray', 'ultrasound', 'other'],
  },
  mimeType: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  reportDate: {
    type: Date,
    required: true,
  },
  thumbnail: {
    type: String,
  },
  cloudinaryPublicId: {
    type: String,
    required: true,
  },
  isAnalyzed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const File = mongoose.model('File', fileSchema);

export default File;

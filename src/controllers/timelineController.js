 
import File from '../models/File.js';
import Vitals from '../models/Vitals.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

/**
 * @desc    Get unified timeline (files + vitals)
 * @route   GET /api/timeline
 * @access  Private
 */
export const getTimeline = async (req, res) => {
  try {
    const { startDate, endDate, limit = 50 } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
    }

    // Get files
    const filesQuery = { userId: req.user._id };
    if (Object.keys(dateFilter).length > 0) {
      filesQuery.reportDate = dateFilter;
    }

    const files = await File.find(filesQuery)
      .select('fileName fileType fileUrl thumbnail reportDate uploadDate isAnalyzed')
      .lean();

    // Get vitals
    const vitalsQuery = { userId: req.user._id };
    if (Object.keys(dateFilter).length > 0) {
      vitalsQuery.date = dateFilter;
    }

    const vitals = await Vitals.find(vitalsQuery)
      .select('date bloodPressure bloodSugar weight temperature heartRate notes')
      .lean();

    // Merge and format timeline
    const timeline = [
      ...files.map(file => ({
        type: 'file',
        date: file.reportDate,
        data: {
          id: file._id,
          fileName: file.fileName,
          fileType: file.fileType,
          fileUrl: file.fileUrl,
          thumbnail: file.thumbnail,
          uploadDate: file.uploadDate,
          isAnalyzed: file.isAnalyzed,
        },
      })),
      ...vitals.map(vital => ({
        type: 'vitals',
        date: vital.date,
        data: {
          id: vital._id,
          bloodPressure: vital.bloodPressure,
          bloodSugar: vital.bloodSugar,
          weight: vital.weight,
          temperature: vital.temperature,
          heartRate: vital.heartRate,
          notes: vital.notes,
        },
      })),
    ];

    // Sort by date (newest first)
    timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Apply limit
    const limitedTimeline = timeline.slice(0, parseInt(limit));

    return successResponse(res, 200, 'Timeline retrieved successfully', {
      timeline: limitedTimeline,
      totalItems: timeline.length,
    });

  } catch (error) {
    console.error('Get timeline error:', error);
    return errorResponse(res, 500, 'Error retrieving timeline');
  }
};

/**
 * @desc    Get timeline statistics
 * @route   GET /api/timeline/stats
 * @access  Private
 */
export const getTimelineStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Count files by type
    const fileStats = await File.aggregate([
      { $match: { userId } },
      { $group: { _id: '$fileType', count: { $sum: 1 } } },
    ]);

    // Count vitals entries
    const vitalsCount = await Vitals.countDocuments({ userId });

    // Count analyzed files
    const analyzedCount = await File.countDocuments({ userId, isAnalyzed: true });

    // Total files
    const totalFiles = await File.countDocuments({ userId });

    return successResponse(res, 200, 'Statistics retrieved successfully', {
      stats: {
        totalFiles,
        analyzedFiles: analyzedCount,
        vitalsEntries: vitalsCount,
        filesByType: fileStats,
      },
    });

  } catch (error) {
    console.error('Get stats error:', error);
    return errorResponse(res, 500, 'Error retrieving statistics');
  }
};

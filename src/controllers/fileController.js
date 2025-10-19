 
import File from '../models/File.js';
import AIInsight from '../models/AIInsight.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';
import { successResponse, errorResponse, isValidObjectId, formatFileSize } from '../utils/helpers.js';

/**
 * @desc    Upload file to Cloudinary
 * @route   POST /api/files/upload
 * @access  Private
 */
export const uploadFile = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return errorResponse(res, 400, 'Please upload a file');
    }

    const { fileType, reportDate } = req.body;

    // Validation
    if (!fileType || !reportDate) {
      // Delete uploaded file
      fs.unlinkSync(req.file.path);
      return errorResponse(res, 400, 'Please provide file type and report date');
    }

    const validFileTypes = ['lab_report', 'prescription', 'xray', 'ultrasound', 'other'];
    if (!validFileTypes.includes(fileType)) {
      fs.unlinkSync(req.file.path);
      return errorResponse(res, 400, 'Invalid file type');
    }

    // Upload to Cloudinary
    const resourceType = req.file.mimetype === 'application/pdf' ? 'raw' : 'image';
    
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'healthmate-reports',
      resource_type: resourceType,
    });

    // Delete local file
    fs.unlinkSync(req.file.path);

    // Save file info to database
    const file = await File.create({
      userId: req.user._id,
      fileName: req.file.originalname,
      fileUrl: result.secure_url,
      fileType: fileType,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      reportDate: reportDate,
      cloudinaryPublicId: result.public_id,
      thumbnail: result.resource_type === 'image' ? result.secure_url : null,
    });

    return successResponse(res, 201, 'File uploaded successfully', {
      file: {
        id: file._id,
        fileName: file.fileName,
        fileUrl: file.fileUrl,
        fileType: file.fileType,
        fileSize: formatFileSize(file.fileSize),
        reportDate: file.reportDate,
        uploadDate: file.uploadDate,
        thumbnail: file.thumbnail,
      },
    });

  } catch (error) {
    // Delete local file if exists
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Upload error:', error);
    return errorResponse(res, 500, 'Error uploading file');
  }
};

/**
 * @desc    Get all user files
 * @route   GET /api/files
 * @access  Private
 */
export const getFiles = async (req, res) => {
  try {
    const { fileType, sortBy = '-reportDate', page = 1, limit = 10 } = req.query;

    const query = { userId: req.user._id };
    
    if (fileType) {
      query.fileType = fileType;
    }

    const files = await File.find(query)
      .sort(sortBy)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await File.countDocuments(query);

    return successResponse(res, 200, 'Files retrieved successfully', {
      files,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
      },
    });

  } catch (error) {
    console.error('Get files error:', error);
    return errorResponse(res, 500, 'Error retrieving files');
  }
};

/**
 * @desc    Get single file by ID
 * @route   GET /api/files/:id
 * @access  Private
 */
export const getFileById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, 'Invalid file ID');
    }

    const file = await File.findById(id);

    if (!file) {
      return errorResponse(res, 404, 'File not found');
    }

    // Check if file belongs to user
    if (file.userId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized to access this file');
    }

    // Get AI insights if available
    const insights = await AIInsight.findOne({ fileId: id });

    return successResponse(res, 200, 'File retrieved successfully', {
      file,
      insights,
    });

  } catch (error) {
    console.error('Get file error:', error);
    return errorResponse(res, 500, 'Error retrieving file');
  }
};

/**
 * @desc    Delete file
 * @route   DELETE /api/files/:id
 * @access  Private
 */
export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, 'Invalid file ID');
    }

    const file = await File.findById(id);

    if (!file) {
      return errorResponse(res, 404, 'File not found');
    }

    // Check ownership
    if (file.userId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized to delete this file');
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(file.cloudinaryPublicId, {
      resource_type: file.mimeType === 'application/pdf' ? 'raw' : 'image',
    });

    // Delete AI insights
    await AIInsight.deleteOne({ fileId: id });

    // Delete file record
    await File.deleteOne({ _id: id });

    return successResponse(res, 200, 'File deleted successfully');

  } catch (error) {
    console.error('Delete file error:', error);
    return errorResponse(res, 500, 'Error deleting file');
  }
};

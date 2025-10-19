 
import Vitals from '../models/Vitals.js';
import { successResponse, errorResponse, isValidObjectId } from '../utils/helpers.js';

/**
 * @desc    Add vitals entry
 * @route   POST /api/vitals
 * @access  Private
 */
export const addVitals = async (req, res) => {
  try {
    const { date, bloodPressure, bloodSugar, weight, temperature, heartRate, notes } = req.body;

    // Validation
    if (!date) {
      return errorResponse(res, 400, 'Date is required');
    }

    // Check if at least one vital is provided
    if (!bloodPressure && !bloodSugar && !weight && !temperature && !heartRate) {
      return errorResponse(res, 400, 'Please provide at least one vital measurement');
    }

    // Create vitals entry
    const vitals = await Vitals.create({
      userId: req.user._id,
      date,
      bloodPressure,
      bloodSugar,
      weight,
      temperature,
      heartRate,
      notes,
    });

    return successResponse(res, 201, 'Vitals added successfully', {
      vitals,
    });

  } catch (error) {
    console.error('Add vitals error:', error);
    // Mongoose validation error -> return 400 with details
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((e) => e.message);
      return errorResponse(res, 400, 'Validation failed', errors);
    }
    return errorResponse(res, 500, 'Error adding vitals');
  }
};

/**
 * @desc    Get all vitals for user
 * @route   GET /api/vitals
 * @access  Private
 */
export const getVitals = async (req, res) => {
  try {
    const { startDate, endDate, sortBy = '-date', page = 1, limit = 20 } = req.query;

    const query = { userId: req.user._id };

    // Date filtering
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const vitals = await Vitals.find(query)
      .sort(sortBy)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Vitals.countDocuments(query);

    return successResponse(res, 200, 'Vitals retrieved successfully', {
      vitals,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
      },
    });

  } catch (error) {
    console.error('Get vitals error:', error);
    return errorResponse(res, 500, 'Error retrieving vitals');
  }
};

/**
 * @desc    Get single vitals entry
 * @route   GET /api/vitals/:id
 * @access  Private
 */
export const getVitalsById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, 'Invalid vitals ID');
    }

    const vitals = await Vitals.findById(id);

    if (!vitals) {
      return errorResponse(res, 404, 'Vitals not found');
    }

    // Check ownership
    if (vitals.userId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized');
    }

    return successResponse(res, 200, 'Vitals retrieved successfully', {
      vitals,
    });

  } catch (error) {
    console.error('Get vitals error:', error);
    return errorResponse(res, 500, 'Error retrieving vitals');
  }
};

/**
 * @desc    Update vitals entry
 * @route   PUT /api/vitals/:id
 * @access  Private
 */
export const updateVitals = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, 'Invalid vitals ID');
    }

    const vitals = await Vitals.findById(id);

    if (!vitals) {
      return errorResponse(res, 404, 'Vitals not found');
    }

    // Check ownership
    if (vitals.userId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized');
    }

    const { date, bloodPressure, bloodSugar, weight, temperature, heartRate, notes } = req.body;

    // Update fields
    if (date) vitals.date = date;
    if (bloodPressure) vitals.bloodPressure = bloodPressure;
    if (bloodSugar) vitals.bloodSugar = bloodSugar;
    if (weight) vitals.weight = weight;
    if (temperature) vitals.temperature = temperature;
    if (heartRate) vitals.heartRate = heartRate;
    if (notes !== undefined) vitals.notes = notes;

    await vitals.save();

    return successResponse(res, 200, 'Vitals updated successfully', {
      vitals,
    });

  } catch (error) {
    console.error('Update vitals error:', error);
    return errorResponse(res, 500, 'Error updating vitals');
  }
};

/**
 * @desc    Delete vitals entry
 * @route   DELETE /api/vitals/:id
 * @access  Private
 */
export const deleteVitals = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, 'Invalid vitals ID');
    }

    const vitals = await Vitals.findById(id);

    if (!vitals) {
      return errorResponse(res, 404, 'Vitals not found');
    }

    // Check ownership
    if (vitals.userId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized');
    }

    await Vitals.deleteOne({ _id: id });

    return successResponse(res, 200, 'Vitals deleted successfully');

  } catch (error) {
    console.error('Delete vitals error:', error);
    return errorResponse(res, 500, 'Error deleting vitals');
  }
};

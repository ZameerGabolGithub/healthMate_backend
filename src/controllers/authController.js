 
import User from '../models/User.js';
import { successResponse, errorResponse, isValidEmail, calculateAge } from '../utils/helpers.js';
import { generateToken } from '../middleware/auth.js';

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { fullName, email, password, dateOfBirth, gender, phoneNumber, emergencyContact } = req.body;

    // Simple validation
    if (!fullName || !email || !password || !dateOfBirth || !gender) {
      return errorResponse(res, 400, 'Please provide all required fields');
    }

    if (!isValidEmail(email)) {
      return errorResponse(res, 400, 'Please provide a valid email');
    }

    if (password.length < 8) {
      return errorResponse(res, 400, 'Password must be at least 8 characters');
    }

    // Check age
    const age = calculateAge(dateOfBirth);
    if (age < 13) {
      return errorResponse(res, 400, 'You must be at least 13 years old');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 400, 'Email already registered');
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      password,
      dateOfBirth,
      gender,
      phoneNumber,
      emergencyContact,
    });

    // Generate token
    const token = generateToken(user._id);

    // Return response
    return successResponse(res, 201, 'User registered successfully', {
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
      },
    });

  } catch (error) {
    console.error('Register error:', error);
    return errorResponse(res, 500, 'Error registering user');
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return errorResponse(res, 400, 'Please provide email and password');
    }

    if (!isValidEmail(email)) {
      return errorResponse(res, 400, 'Please provide a valid email');
    }

    // Find user (include password for comparison)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    // Generate token
    const token = generateToken(user._id);

    // Return response
    return successResponse(res, 200, 'Login successful', {
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 500, 'Error logging in');
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    return successResponse(res, 200, 'User profile retrieved', {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        phoneNumber: user.phoneNumber,
        emergencyContact: user.emergencyContact,
        createdAt: user.createdAt,
      },
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return errorResponse(res, 500, 'Error retrieving profile');
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req, res) => {
  try {
    const { fullName, phoneNumber, emergencyContact } = req.body;

    const user = await User.findById(req.user._id);

    if (fullName) user.fullName = fullName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (emergencyContact) user.emergencyContact = emergencyContact;

    await user.save();

    return successResponse(res, 200, 'Profile updated successfully', {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        emergencyContact: user.emergencyContact,
      },
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse(res, 500, 'Error updating profile');
  }
};

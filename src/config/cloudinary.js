import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

// Load environment variables early to ensure process.env values are available
dotenv.config();

// Helper to mask values when logging
const mask = (s) => {
  if (!s) return 'MISSING';
  if (s.length <= 8) return '********';
  return `${s.slice(0, 4)}...${s.slice(-4)}`;
};

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

console.log('✅ Cloudinary configured (cloud:', !!process.env.CLOUDINARY_CLOUD_NAME, ', api_key:', !!process.env.CLOUDINARY_API_KEY, ')');

export default cloudinary;

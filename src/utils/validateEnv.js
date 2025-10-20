import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Validate required environment variables
 */
export const validateEnv = () => {
  const required = [
    'MONGODB_URI',
    'JWT_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'GEMINI_API_KEY'
  ];

  const missing = [];
  const warnings = [];

  required.forEach(key => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  // Check JWT_SECRET strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    warnings.push('JWT_SECRET should be at least 32 characters for security');
  }

  if (process.env.JWT_SECRET === 'nothing' || process.env.JWT_SECRET === 'your_production_jwt_secret_change_this_to_random_string_min_32_chars') {
    warnings.push('⚠️  CRITICAL: JWT_SECRET is using a default value! Change it immediately!');
  }

  // Check NODE_ENV
  if (!process.env.NODE_ENV) {
    warnings.push('NODE_ENV not set, defaulting to development');
  }

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\n💡 Please check your .env file or environment configuration');
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️  Environment Warnings:');
    warnings.forEach(warning => console.warn(`   ${warning}`));
    console.warn('');
  }

  console.log('✅ Environment variables validated successfully\n');
};

export default validateEnv;

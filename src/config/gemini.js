import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Return a generative model instance. Accept model name for flexibility.
export const getGeminiModel = (modelName = 'gemini-1.5-flash') => {
  return genAI.getGenerativeModel({ model: modelName });
};

console.log('✅ Gemini AI initialized');

export default genAI;

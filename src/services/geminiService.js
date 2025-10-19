import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const analyzeMedicalReport = async (fileUrl) => {
  // 1. Download file buffer from Cloudinary
  const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
  const base64Data = Buffer.from(response.data).toString('base64');
  const mimeType = fileUrl.endsWith('.pdf')
    ? 'application/pdf'
    : fileUrl.endsWith('.png')
      ? 'image/png'
      : 'image/jpeg';

  // 2. Build prompt for structured JSON output
  const prompt = `You are a compassionate medical AI. Analyze this report and return JSON:
{
  "summaryEnglish": "...",
  "summaryUrdu": "...",
  "abnormalValues": [
    {"parameter":"…","value":"…","normalRange":"…","severity":"High/Low"}
  ],
  "doctorQuestions":["…","…","…"],
  "foodsToAvoid":["…","…","…"],
  "foodsToEat":["…","…","…"],
  "homeRemedies":["…","…"],
  "disclaimer":"…"
}`;

  // 3. Call Gemini 1.5 Flash model
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent([
    prompt,
    { inlineData: { data: base64Data, mimeType } }
  ]);

  // 4. Strip markdown and parse JSON
  let text = result.response.text()
    .replace(/``````/g, '');
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid AI response');
  return JSON.parse(jsonMatch[0]);
  
};

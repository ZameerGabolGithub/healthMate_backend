import File from '../models/File.js';
import AIInsight from '../models/AIInsight.js';
import ai from '../config/gemini.js';
import { successResponse, errorResponse, isValidObjectId } from '../utils/helpers.js';
import https from 'https';
import http from 'http';
import { getGeminiModel } from '../config/gemini.js';


/**
 * Download file from URL to buffer
 */
const downloadFileToBuffer = (url) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    });
  });
};

/**
 * Convert buffer to base64
 */
const bufferToBase64 = (buffer) => {
  return buffer.toString('base64');
};

/**
 * @desc    Analyze file with Gemini AI
 * @route   POST /api/ai/analyze/:fileId
 * @access  Private
 */
export const analyzeFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!isValidObjectId(fileId)) {
      return errorResponse(res, 400, 'Invalid file ID');
    }

    // Get file
    const file = await File.findById(fileId);

    if (!file) {
      return errorResponse(res, 404, 'File not found');
    }

    // Check ownership
    if (file.userId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized to analyze this file');
    }

    // Check if already analyzed
    const existingInsight = await AIInsight.findOne({ fileId });
    if (existingInsight) {
      return successResponse(res, 200, 'File already analyzed', {
        insights: existingInsight,
      });
    }

    console.log('🤖 Starting AI analysis for file:', file.fileName);

    // Download file from Cloudinary
    const fileBuffer = await downloadFileToBuffer(file.fileUrl);
    const base64Data = bufferToBase64(fileBuffer);

    // Create bilingual prompt for medical analysis (require strict JSON only)
    const prompt = `You are a medical AI assistant. Analyze this medical report and provide a comprehensive analysis in both English and Roman Urdu (Urdu written in English alphabet).

IMPORTANT: RETURN ONLY A SINGLE VALID JSON OBJECT in the exact schema described below. Do NOT include any surrounding explanation, markdown, code fences, or extra text. If you cannot produce JSON, return an empty JSON object {}.

Please provide your response in the following JSON format:

{
  "summary": {
    "english": "Detailed summary in English explaining what this report shows in simple, easy-to-understand language",
    "romanUrdu": "Report ki tafseel Roman Urdu mein (aasan alfaaz mein)"
  },
  "abnormalValues": [
    {
      "parameter": "Test name",
      "value": "Current value",
      "normalRange": "Normal range",
      "severity": "low/high/critical"
    }
  ],
  "doctorQuestions": [
    "Question 1 to ask your doctor",
    "Question 2 to ask your doctor",
    "Question 3 to ask your doctor"
  ],
  "dietaryRecommendations": {
    "foodsToAvoid": ["Food 1", "Food 2", "Food 3"],
    "recommendedFoods": ["Food 1", "Food 2", "Food 3"]
  },
  "homeRemedies": [
    "Home remedy 1",
    "Home remedy 2",
    "Home remedy 3"
  ]
}

Important:
- Identify ALL abnormal values with their severity
- Provide 3-5 practical questions to ask the doctor
- Give specific dietary advice based on the report
- Suggest safe home remedies (clearly mark they are not medical advice)
- Use simple, non-technical language
- Roman Urdu should be natural and conversational

Analyze the medical report now:`;

    // Get model and generate content with Gemini
    const model = getGeminiModel('gemini-2.0-flash-exp');
    const response = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: file.mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
    });

    console.log('\u2705 AI analysis completed');

    // Attempt to capture and log the raw response for debugging
    let rawResponseStr = '';
    try {
      rawResponseStr = JSON.stringify(response);
    } catch (err) {
      // Fallback to toString
      try { rawResponseStr = String(response); } catch (e) { rawResponseStr = '[unserializable response]'; }
    }
    console.log('Raw AI response (truncated):', rawResponseStr.slice(0, 2000));

    // SDK may return different shapes; try to extract text
    let analysisText = '';
    if (response && typeof response === 'object') {
      // Common SDK shapes: response.output[0].content[0].text or response.response[0].content[0].text
      if (response.output && response.output[0] && response.output[0].content && response.output[0].content[0]) {
        analysisText = response.output[0].content[0].text || '';
      } else if (response.response && response.response[0] && response.response[0].content && response.response[0].content[0]) {
        analysisText = response.response[0].content[0].text || '';
      } else if (typeof response.text === 'function') {
        analysisText = response.text();
      } else if (response.text) {
        analysisText = response.text;
      } else if (response[0] && response[0].text) {
        analysisText = response[0].text;
      }
    } else if (typeof response === 'string') {
      analysisText = response;
    }

    // Parse JSON from response (remove markdown code blocks if present)
    analysisText = (analysisText || '').replace(/``````\n?/g, '').trim();
    
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback response if parsing fails
      analysis = {
        summary: {
          english: analysisText.substring(0, 500),
          romanUrdu: "AI analysis ko parse karne mein masla hua. Kripya dobara koshish karein.",
        },
        abnormalValues: [],
        doctorQuestions: ["Please consult your doctor about this report"],
        dietaryRecommendations: {
          foodsToAvoid: [],
          recommendedFoods: [],
        },
        homeRemedies: [],
      };
    }

    // Save insights to database (include rawResponse for debugging)
    const insight = await AIInsight.create({
      fileId: file._id,
      userId: req.user._id,
      summary: analysis.summary || { english: '', romanUrdu: '' },
      abnormalValues: analysis.abnormalValues || [],
      doctorQuestions: analysis.doctorQuestions || [],
      dietaryRecommendations: analysis.dietaryRecommendations || { foodsToAvoid: [], recommendedFoods: [] },
      homeRemedies: analysis.homeRemedies || [],
      rawResponse: rawResponseStr,
    });

    // Update file status
    file.isAnalyzed = true;
    await file.save();

    return successResponse(res, 200, 'File analyzed successfully', {
      insights: insight,
    });

  } catch (error) {
    console.error('AI analysis error:', error);
    return errorResponse(res, 500, 'Error analyzing file: ' + error.message);
  }
};

/**
 * @desc    Get AI insights for a file
 * @route   GET /api/ai/insights/:fileId
 * @access  Private
 */
export const getInsights = async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!isValidObjectId(fileId)) {
      return errorResponse(res, 400, 'Invalid file ID');
    }

    // Get file to check ownership
    const file = await File.findById(fileId);

    if (!file) {
      return errorResponse(res, 404, 'File not found');
    }

    if (file.userId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized');
    }

    // Get insights
    const insights = await AIInsight.findOne({ fileId });

    if (!insights) {
      return errorResponse(res, 404, 'No insights found. Please analyze the file first.');
    }

    // Include file info for frontend preview
    const fileInfo = {
      fileUrl: file.fileUrl,
      thumbnail: file.thumbnail || file.fileUrl,
      fileName: file.fileName,
      fileType: file.fileType,
    };

    return successResponse(res, 200, 'Insights retrieved successfully', {
      insights,
      file: fileInfo,
    });

  } catch (error) {
    console.error('Get insights error:', error);
    return errorResponse(res, 500, 'Error retrieving insights');
  }
};

/**
 * @desc    Delete AI insights
 * @route   DELETE /api/ai/insights/:fileId
 * @access  Private
 */
export const deleteInsights = async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!isValidObjectId(fileId)) {
      return errorResponse(res, 400, 'Invalid file ID');
    }

    // Get file to check ownership
    const file = await File.findById(fileId);

    if (!file) {
      return errorResponse(res, 404, 'File not found');
    }

    if (file.userId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized');
    }

    // Delete insights
    const result = await AIInsight.deleteOne({ fileId });

    if (result.deletedCount === 0) {
      return errorResponse(res, 404, 'No insights found');
    }

    // Update file status
    file.isAnalyzed = false;
    await file.save();

    return successResponse(res, 200, 'Insights deleted successfully');

  } catch (error) {
    console.error('Delete insights error:', error);
    return errorResponse(res, 500, 'Error deleting insights');
  }
};

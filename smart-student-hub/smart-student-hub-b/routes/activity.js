const express = require("express");
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Activity = require("../models/Activity");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Gemini API configuration
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const fs = require('fs');
const path = require('path');

// Function to analyze certificate with Gemini AI
async function analyzeCertificateWithGemini(certificatePath, activityData) {
  try {
    console.log("📁 Reading certificate file:", certificatePath);
    
    // Check if file exists
    if (!fs.existsSync(certificatePath)) {
      throw new Error('Certificate file not found');
    }
    
    // Read the certificate file
    const certificateBuffer = fs.readFileSync(certificatePath);
    const fileExtension = path.extname(certificatePath).toLowerCase();
    
    console.log("📄 File extension:", fileExtension, "Size:", certificateBuffer.length, "bytes");
    
    // Determine MIME type
    let mimeType;
    switch (fileExtension) {
      case '.pdf':
        mimeType = 'application/pdf';
        break;
      case '.jpg':
      case '.jpeg':
        mimeType = 'image/jpeg';
        break;
      case '.png':
        mimeType = 'image/png';
        break;
      default:
        throw new Error('Unsupported file type. Please upload PDF, JPG, or PNG files.');
    }

    // Convert buffer to base64
    const base64Data = certificateBuffer.toString('base64');
    console.log("🔄 Converted to base64, length:", base64Data.length);

    // Check if Gemini API key exists
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("🤖 Gemini model initialized");

    // Create the prompt for certificate analysis
    const prompt = `
    Analyze this certificate and verify its authenticity and relevance to the submitted activity details.
    
    Activity Details Submitted:
    - Title: ${activityData.title}
    - Type: ${activityData.type}
    - Date: ${activityData.date}
    - Credits: ${activityData.credits}
    - Description: ${activityData.description}
    
    Please analyze the certificate and provide:
    1. Whether the certificate appears authentic (check for proper formatting, logos, signatures, etc.)
    2. If the certificate content matches the submitted activity details
    3. Extract key information: organization name, course/event name, completion date, participant name
    4. Provide a decision: "approved", "rejected", or "needs-review"
    5. Give a confidence score (0-100)
    6. List any discrepancies or concerns
    
    Respond in JSON format:
    {
      "decision": "approved|rejected|needs-review",
      "confidence": 85,
      "metadata": {
        "organization": "extracted organization name",
        "courseName": "extracted course/event name",
        "completionDate": "extracted date",
        "participantName": "extracted participant name",
        "certificateType": "course completion|participation|achievement|other"
      },
      "analysis": {
        "authenticity": "appears authentic|suspicious|unclear",
        "contentMatch": "matches|partial match|no match",
        "discrepancies": ["list of any issues found"],
        "reasoning": "explanation of the decision"
      }
    }
    `;

    console.log("📤 Sending request to Gemini API...");
    
    // Generate content with the image
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    console.log("📥 Received response from Gemini API");
    console.log("Response text:", text.substring(0, 200) + "...");
    
    // Parse the JSON response
    let aiAnalysis;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiAnalysis = JSON.parse(jsonMatch[0]);
        console.log("✅ Successfully parsed AI response");
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.error('❌ Error parsing AI response:', parseError);
      console.log("Raw response:", text);
      // Fallback response
      aiAnalysis = {
        decision: "needs-review",
        confidence: 50,
        metadata: {
          organization: "Could not extract",
          courseName: activityData.title,
          completionDate: activityData.date,
          participantName: "Could not extract",
          certificateType: "unknown"
        },
        analysis: {
          authenticity: "unclear",
          contentMatch: "unclear",
          discrepancies: ["AI analysis failed - manual review required"],
          reasoning: "Technical error in AI analysis"
        }
      };
    }

    return aiAnalysis;

  } catch (error) {
    console.error('❌ Error in Gemini AI analysis:', error);
    
    // Return a fallback response for any errors
    return {
      decision: "needs-review",
      confidence: 0,
      metadata: {
        organization: "Analysis failed",
        courseName: activityData.title,
        completionDate: activityData.date,
        participantName: "Could not extract",
        certificateType: "unknown"
      },
      analysis: {
        authenticity: "unclear",
        contentMatch: "unclear",
        discrepancies: [`AI analysis error: ${error.message}`],
        reasoning: "Technical error prevented analysis"
      }
    };
  }
}

// POST /api/activities/upload-certificate
router.post("/upload-certificate", [authMiddleware, upload.single('certificate')], async (req, res) => {
  try {
    const { title, type, date, credits, description } = req.body;

    if (!title || !type || !date || !credits || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Certificate file is required" });
    }

    // Analyze certificate with Gemini AI
    let aiAnalysis, aiDecision, aiMetadata;
    
    try {
      console.log("🔍 Starting AI analysis for certificate:", req.file.path);
      aiAnalysis = await analyzeCertificateWithGemini(req.file.path, {
        title,
        type,
        date,
        credits,
        description
      });
      
      aiDecision = aiAnalysis.decision;
      aiMetadata = aiAnalysis.metadata;
      console.log("✅ AI Analysis completed:", aiDecision);
    } catch (aiError) {
      console.error("❌ AI Analysis failed:", aiError.message);
      // Fallback values if AI analysis fails
      aiDecision = "needs-review";
      aiMetadata = {
        organization: "Analysis failed",
        courseName: title,
        completionDate: date,
        participantName: "Could not extract",
        certificateType: "unknown"
      };
      aiAnalysis = {
        analysis: {
          authenticity: "unclear",
          contentMatch: "unclear", 
          discrepancies: [`AI analysis error: ${aiError.message}`],
          reasoning: "Technical error prevented analysis",
          confidence: 0
        }
      };
    }

    const newActivity = new Activity({
      title,
      type,
      date,
      credits,
      description,
      studentId: req.user.userId,
      certificatePath: req.file.path,
      aiDecision,
      aiMetadata,
      aiAnalysis: aiAnalysis.analysis, // Store full AI analysis
      status: aiDecision === "approved" ? "approved" : "pending", // Auto-approve if AI is confident
    });

    await newActivity.save();
    res.status(201).json({ message: "Activity submitted successfully", activity: newActivity });
  } catch (err) {
    console.error("❌ Error creating activity:", err.message);
    res.status(500).json({ message: "Error creating activity", error: err.message });
  }
});

// POST /api/activities → Add activity (without certificate)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, type, date, credits, description, proofUrl} = req.body;

    // ✅ Validate required fields
    if (!title || !type || !date || !credits || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

     const newActivity = new Activity({
      title,
      type,
      date,
      credits,
      description,
      proofUrl: proofUrl || "", // optional
      studentId: req.user.userId, // from JWT
    });

    await newActivity.save();
    res.status(201).json({ message: "Activity submitted successfully", activity: newActivity });
  } catch (err) {
    console.error("❌ Error creating activity:", err.message);
    res.status(500).json({ message: "Error creating activity", error: err.message });
  }
});

// ✅ Get all activities (with optional filters)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const activities = await Activity.find({ studentId: req.user.userId }).sort({ date: -1 });
    res.json({ activities });
  } catch (err) {
    console.error("❌ Error fetching activities:", err.message);
    res.status(500).json({ message: "Error fetching activities" });
  }
});

// ✅ Update activity
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const activity = await Activity.findOneAndUpdate(
      { _id: req.params.id, studentId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!activity) return res.status(404).json({ message: "Activity not found" });
    res.json(activity);
  } catch (err) {
    res.status(400).json({ message: "Error updating activity", error: err.message });
  }
});

// ✅ Delete activity
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const activity = await Activity.findOneAndDelete({
      _id: req.params.id,
      studentId: req.user.userId,
    });

    if (!activity) return res.status(404).json({ message: "Activity not found" });
    res.json({ message: "Activity deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting activity", error: err.message });
  }
});

module.exports = router;

const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["competition", "certification", "internship", "research", "workshop", "volunteering"],
      required: true,
    },
    status: {
      type: String,
      enum: ["approved", "pending", "rejected", "ai-approved", "ai-rejected"],
      default: "pending",
    },
    date: { type: Date, required: true },
    credits: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    proofUrl: { type: String }, // file/certificate link
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    certificatePath: { type: String },
    aiMetadata: { type: mongoose.Schema.Types.Mixed },
    aiDecision: { 
      type: String,
      enum: ["approved", "rejected", "needs-review"]
    },
    aiAnalysis: {
      authenticity: { type: String },
      contentMatch: { type: String },
      discrepancies: [{ type: String }],
      reasoning: { type: String },
      confidence: { type: Number, min: 0, max: 100 }
    },
    blockchainHash: { type: String },
    transactionId: { type: String },
    ipfsCid: { type: String },
    approvedBy: { type: String },
    approvedDate: { type: Date },
    rejectedBy: { type: String },
    rejectedDate: { type: Date },
    reason: { type: String }, // rejection reason
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", ActivitySchema);

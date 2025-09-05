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
      enum: ["approved", "pending", "rejected"],
      default: "pending",
    },
    date: { type: Date, required: true },
    credits: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    proofUrl: { type: String}, // file/certificate link
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", ActivitySchema);

const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ["Workshop", "Seminar", "Competition", "Hackathon", "Conference"], required: true },
  date: { type: Date, required: true },
  time: { type: String },
  location: { type: String },
  capacity: { type: Number, default: 100 },
  credits: { type: Number, default: 0 },
  department: { type: String, default: "all" },
  description: { type: String },
  status: { type: String, enum: ["active", "completed", "cancelled"], default: "active" },
  registered: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],  // student IDs (legacy)
  registrations: [
    {
      studentId: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
      department: { type: String, required: true },
      year: { type: String, required: true },
      phone: { type: String },
      registeredAt: { type: Date, default: Date.now }
    }
  ],
  feedback: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, min: 1, max: 5 },
      comment: String
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Event", EventSchema);

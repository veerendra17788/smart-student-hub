const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection with improved error handling and timeout settings
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000, // 10 second timeout
  socketTimeoutMS: 45000, // 45 second socket timeout
})
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => {
  console.error("❌ MongoDB Connection Failed:", err.message);
  console.log("🔄 Using fallback mode - API will return demo data");
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/activity", require("./routes/activity"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/student", require("./routes/student"));
app.use("/api/academic-calendar", require("./routes/academicCalendar"));
app.use("/api/faculty", require("./routes/facultyStudent"));
app.use("/api/faculty/dashboard", require("./routes/facultyDashboard"));
app.use("/api/faculty/analytics", require("./routes/facultyAnalytics"));
app.use("/api/portfolio", require("./routes/portfolio"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/ai", require("./routes/aiRecommendations"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port http://localhost:${PORT}`));

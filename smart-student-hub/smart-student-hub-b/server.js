const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();

const app = express();
// Configure CORS with specific origins and methods
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://smart-student-hub.vercel.app',
  'https://smart-student-hub-git-main-veerendra17788s-projects.vercel.app',
  'https://smart-student-hub-137x.onrender.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));
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
app.use("/api/faculty", require("./routes/faculty"));
app.use("/api/faculty/students", require("./routes/facultyStudent"));
app.use("/api/faculty/dashboard", require("./routes/facultyDashboard"));
app.use("/api/faculty/analytics", require("./routes/facultyAnalytics"));
app.use("/api/portfolio", require("./routes/portfolio"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/ai", require("./routes/aiRecommendations"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port http://localhost:${PORT}`));

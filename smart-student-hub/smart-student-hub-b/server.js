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

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => console.error("❌ MongoDB Error:", err));

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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port http://localhost:${PORT}`));

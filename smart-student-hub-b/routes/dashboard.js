const express = require("express");
const auth = require("../middleware/auth");

const router = express.Router();

// Example: student/faculty/admin dashboard
router.get("/", auth, (req, res) => {
  res.json({
    message: `Welcome ${req.user.role}!`,
    userId: req.user.userId,
    role: req.user.role,
  });
});

module.exports = router;

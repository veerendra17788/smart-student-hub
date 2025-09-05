// routes/student.js
const express = require("express");
const auth = require("../middleware/auth"); // <-- make sure this is a function

const router = express.Router();

router.get("/dashboard", auth, (req, res) => {
  res.json({ message: `Welcome user ${req.user.userId}`, role: req.user.role });
});

module.exports = router;

const express = require("express");
const Activity = require("../models/Activity");
const authMiddleware = require("../middleware/auth");
const crypto = require("crypto");
const { ethers } = require("ethers");
const fs = require("fs");
// const { create } = require("ipfs-http-client");

const router = express.Router();

// IPFS configuration - temporarily disabled
// const ipfs = create({ host: 'localhost', port: '5001', protocol: 'http' });

// Ethereum configuration
let provider, signer, contract;
try {
  // Use a public testnet instead of localhost for better reliability
  provider = new ethers.JsonRpcProvider("https://rpc.ankr.com/polygon_mumbai"); // Mumbai testnet
  // For demo purposes, we'll use a mock signer
  const wallet = new ethers.Wallet("0x" + "1".repeat(64), provider); // Demo private key
  signer = wallet;
  
  // Simple contract ABI for certificate storage
  const contractABI = [
    "function storeCertificate(address student, string memory hash) public returns (bool)",
    "function getCertificate(address student) public view returns (string memory)"
  ];
  
  // Demo contract address (you should deploy your own)
  const contractAddress = "0x742d35Cc6634C0532925a3b8D4C9db96c4b5Da5e"; // Example address
  contract = new ethers.Contract(contractAddress, contractABI, signer);
  
  console.log("✅ Blockchain configuration initialized");
} catch (blockchainError) {
  console.log("⚠️ Blockchain not available, using mock mode:", blockchainError.message);
}

// Get all activities for faculty (optionally filtered by status)
router.get("/activities", authMiddleware, async (req, res) => {
  try {
    // Only faculty can access this
    if (req.user.role !== "faculty") {
      return res.status(403).json({ message: "Access denied" });
    }

    const activities = await Activity.find().sort({ createdAt: -1 }).populate("studentId", "name rollNumber");
    res.json({ activities });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching activities" });
  }
});

// Approve activity
router.post("/activities/:id/approve", authMiddleware, async (req, res) => {
  try {
    const facultyName = req.body.facultyName || "Faculty"; // optional

    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: "Activity not found" });

    // 1. Generate cryptographic hash of the certificate
    let certificateHash;
    try {
      if (activity.certificatePath && fs.existsSync(activity.certificatePath)) {
        const certificateBuffer = fs.readFileSync(activity.certificatePath);
        certificateHash = crypto.createHash('sha256').update(certificateBuffer).digest('hex');
        console.log("🔐 Generated certificate hash from actual file");
      } else {
        // Fallback to activity data hash if no certificate file
        const activityData = `${activity.title}-${activity.studentId}-${activity.date}`;
        certificateHash = crypto.createHash('sha256').update(activityData).digest('hex');
        console.log("🔐 Generated hash from activity data (no certificate file)");
      }
    } catch (hashError) {
      console.error("❌ Hash generation failed:", hashError.message);
      const fallbackData = `${activity._id}-${Date.now()}`;
      certificateHash = crypto.createHash('sha256').update(fallbackData).digest('hex');
    }

    // 2. Anchor the hash on blockchain (Ethereum/Polygon)
    let transactionId = "mock-transaction-id";
    let blockchainSuccess = false;
    
    try {
      if (contract && signer) {
        console.log("🔗 Attempting blockchain transaction...");
        const transaction = await contract.storeCertificate(activity.studentId, certificateHash);
        await transaction.wait(); // Wait for confirmation
        transactionId = transaction.hash;
        blockchainSuccess = true;
        console.log("✅ Blockchain transaction successful:", transactionId);
      } else {
        console.log("⚠️ Using mock blockchain transaction");
        transactionId = `mock-tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
    } catch (blockchainError) {
      console.error("❌ Blockchain transaction failed:", blockchainError.message);
      transactionId = `failed-tx-${Date.now()}`;
    }

    // 3. Generate IPFS CID for certificate storage
    let ipfsCid = "mock-ipfs-cid";
    
    try {
      // Generate a mock IPFS CID based on certificate hash
      const ipfsHash = crypto.createHash('sha256').update(certificateHash + Date.now()).digest('hex');
      ipfsCid = `Qm${ipfsHash.substring(0, 44)}`; // Mock IPFS CID format
      console.log("📦 Generated mock IPFS CID:", ipfsCid);
    } catch (ipfsError) {
      console.error("❌ IPFS CID generation failed:", ipfsError.message);
      ipfsCid = `failed-ipfs-${Date.now()}`;
    }

    // 4. Update the activity with blockchain and IPFS data
    activity.status = "approved";
    activity.approvedBy = facultyName;
    activity.approvedDate = new Date();
    activity.blockchainHash = certificateHash;
    activity.transactionId = transactionId;
    activity.ipfsCid = ipfsCid;

    await activity.save();

    res.json({ activity });
  } catch (err) {
    console.error("❌ Error approving activity:", err.message);
    res.status(500).json({ message: "Error approving activity" });
  }
});

// Reject activity
router.post("/activities/:id/reject", authMiddleware, async (req, res) => {
  try {
    const { reason, facultyName } = req.body;
    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      { status: "rejected", rejectedBy: facultyName, rejectedDate: new Date(), reason },
      { new: true }
    );
    if (!activity) return res.status(404).json({ message: "Activity not found" });
    res.json({ activity });
  } catch (err) {
    console.error("❌ Error rejecting activity:", err.message);
    res.status(500).json({ message: "Error rejecting activity" });
  }
});

module.exports = router;

const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  
  if (!token) {
    return res.status(401).json({ 
      message: "No token provided",
      code: "NO_TOKEN"
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ 
          message: "Token expired, please login again",
          code: "TOKEN_EXPIRED",
          expiredAt: err.expiredAt
        });
      }
      if (err.name === "JsonWebTokenError") {
        return res.status(403).json({ 
          message: "Invalid token",
          code: "INVALID_TOKEN"
        });
      }
      return res.status(403).json({ 
        message: "Token verification failed",
        code: "TOKEN_ERROR"
      });
    }
    
    req.user = decoded;
    next();
  });
};

// Generate JWT tokens with proper expiration
const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
  
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });
  
  return { accessToken, refreshToken };
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
};

module.exports = { 
  authMiddleware, 
  generateTokens, 
  verifyRefreshToken 
};



const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Middleware untuk verifikasi JWT token
 * Digunakan untuk protect routes yang memerlukan authentication
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Ambil token dari header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        error: 'NO_TOKEN'
      });
    }

    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Cari user berdasarkan ID dari token
    const user = await User.findActiveUser(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive',
        error: 'INVALID_USER'
      });
    }

    // Attach user info ke request object
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid access token',
        error: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access token expired',
        error: 'TOKEN_EXPIRED'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: 'AUTH_ERROR'
    });
  }
};

/**
 * Middleware untuk authorization berdasarkan role
 * @param {string[]} allowedRoles - Array role yang diizinkan
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'NO_AUTH'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        error: 'INSUFFICIENT_ROLE',
        required_roles: allowedRoles,
        user_role: req.user.role
      });
    }

    next();
  };
};

/**
 * Middleware untuk optional authentication
 * Token akan diverifikasi jika ada, tapi tidak wajib
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findActiveUser(decoded.userId);
      
      if (user) {
        req.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        };
      }
    }

    next();
  } catch (error) {
    // Ignore errors for optional auth, just continue without user
    next();
  }
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  optionalAuth
};

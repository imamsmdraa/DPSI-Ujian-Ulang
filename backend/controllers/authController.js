const express = require('express');
const { User } = require('../models');
const JWTUtils = require('../utils/jwt');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

/**
 * POST /api/v1/auth/register
 * Register user baru
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, fullName, role = 'user' } = req.body;

    // Validasi input
    if (!username || !email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, password, and fullName are required',
        error: 'MISSING_FIELDS'
      });
    }

    // Cek apakah username atau email sudah ada
    const existingUser = await User.findByUsernameOrEmail(username) || 
                         await User.findByUsernameOrEmail(email);
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Username or email already exists',
        error: 'USER_EXISTS'
      });
    }

    // Buat user baru
    const userData = {
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password,
      fullName: fullName.trim(),
      role: ['admin', 'user'].includes(role) ? role : 'user'
    };

    const newUser = await User.createUser(userData);

    // Generate tokens
    const tokenData = JWTUtils.generateTokenPair(newUser);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: tokenData
    });

  } catch (error) {
    console.error('Register error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: 'VALIDATION_ERROR',
        details: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during registration',
      error: 'REGISTER_ERROR'
    });
  }
});

/**
 * POST /api/v1/auth/login
 * Login user
 */
router.post('/login', async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    // Validasi input
    if (!usernameOrEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username/email and password are required',
        error: 'MISSING_CREDENTIALS'
      });
    }

    // Cari user berdasarkan username atau email
    const user = await User.findByUsernameOrEmail(usernameOrEmail.toLowerCase().trim());
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        error: 'INVALID_CREDENTIALS'
      });
    }

    // Cek apakah user aktif
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated',
        error: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Verifikasi password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        error: 'INVALID_CREDENTIALS'
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate tokens
    const tokenData = JWTUtils.generateTokenPair(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: tokenData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login',
      error: 'LOGIN_ERROR'
    });
  }
});

/**
 * POST /api/v1/auth/refresh
 * Refresh access token menggunakan refresh token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
        error: 'MISSING_REFRESH_TOKEN'
      });
    }

    // Verifikasi refresh token
    const decoded = JWTUtils.verifyToken(refreshToken);
    
    // Cari user
    const user = await User.findActiveUser(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive',
        error: 'INVALID_USER'
      });
    }

    // Generate new token pair
    const tokenData = JWTUtils.generateTokenPair(user);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: tokenData
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
        error: 'INVALID_REFRESH_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired',
        error: 'REFRESH_TOKEN_EXPIRED'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during token refresh',
      error: 'REFRESH_ERROR'
    });
  }
});

/**
 * GET /api/v1/auth/profile
 * Get user profile (protected route)
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findActiveUser(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error getting profile',
      error: 'PROFILE_ERROR'
    });
  }
});

/**
 * PUT /api/v1/auth/profile
 * Update user profile (protected route)
 */
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { fullName, email } = req.body;
    const userId = req.user.id;

    const user = await User.findActiveUser(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    // Update fields yang diizinkan
    if (fullName !== undefined) {
      user.fullName = fullName.trim();
    }
    
    if (email !== undefined) {
      // Cek apakah email sudah digunakan user lain
      const existingUser = await User.findOne({
        where: {
          email: email.toLowerCase().trim(),
          id: { [require('sequelize').Op.ne]: userId }
        }
      });
      
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email already used by another user',
          error: 'EMAIL_EXISTS'
        });
      }
      
      user.email = email.toLowerCase().trim();
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.toJSON()
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: 'VALIDATION_ERROR',
        details: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error updating profile',
      error: 'UPDATE_PROFILE_ERROR'
    });
  }
});

/**
 * POST /api/v1/auth/logout
 * Logout user (protected route)
 */
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Dalam implementasi production, token bisa disimpan di blacklist
    // Untuk sekarang, client side akan menghapus token
    
    res.status(200).json({
      success: true,
      message: 'Logout successful',
      data: null
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout',
      error: 'LOGOUT_ERROR'
    });
  }
});

/**
 * GET /api/v1/auth/verify
 * Verify token validity (protected route)
 */
router.get('/verify', authenticateToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    data: {
      user: req.user,
      tokenValid: true
    }
  });
});

module.exports = router;

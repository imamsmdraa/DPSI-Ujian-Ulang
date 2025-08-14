const jwt = require('jsonwebtoken');

/**
 * Utility functions untuk JWT operations
 */
class JWTUtils {
  /**
   * Generate JWT access token
   * @param {Object} payload - Data yang akan disimpan di token
   * @param {string} expiresIn - Durasi token (default: 24h)
   * @returns {string} JWT token
   */
  static generateAccessToken(payload, expiresIn = '24h') {
    return jwt.sign(payload, process.env.JWT_SECRET, { 
      expiresIn,
      issuer: 'bookstore-api',
      audience: 'bookstore-users'
    });
  }

  /**
   * Generate JWT refresh token
   * @param {Object} payload - Data yang akan disimpan di token
   * @param {string} expiresIn - Durasi token (default: 7d)
   * @returns {string} JWT refresh token
   */
  static generateRefreshToken(payload, expiresIn = '7d') {
    return jwt.sign(payload, process.env.JWT_SECRET, { 
      expiresIn,
      issuer: 'bookstore-api',
      audience: 'bookstore-users'
    });
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token to verify
   * @returns {Object} Decoded payload
   */
  static verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }

  /**
   * Generate token pair (access + refresh)
   * @param {Object} user - User object
   * @returns {Object} { accessToken, refreshToken, expiresIn }
   */
  static generateTokenPair(user) {
    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role
    };

    const accessToken = this.generateAccessToken(payload, '24h');
    const refreshToken = this.generateRefreshToken(payload, '7d');

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 24 * 60 * 60, // 24 hours in seconds
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        lastLogin: user.lastLogin
      }
    };
  }

  /**
   * Extract token from Authorization header
   * @param {string} authHeader - Authorization header value
   * @returns {string|null} Token or null
   */
  static extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.split(' ')[1];
  }

  /**
   * Get token expiration time
   * @param {string} token - JWT token
   * @returns {Date|null} Expiration date or null
   */
  static getTokenExpiration(token) {
    try {
      const decoded = jwt.decode(token);
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token is expired
   * @param {string} token - JWT token
   * @returns {boolean} True if expired
   */
  static isTokenExpired(token) {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) return true;
    return new Date() >= expiration;
  }
}

module.exports = JWTUtils;

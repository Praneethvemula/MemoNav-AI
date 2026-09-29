const jwt = require('jsonwebtoken');
const { UserRepo } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'memonav_ai_super_secret_jwt_key_2026';

async function protect(req, res, next) {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Handle demo mode bypass or header
  if (!token && (req.headers['x-demo-user'] === 'true' || req.query.demo === 'true')) {
    req.user = {
      id: 'demo_user_123',
      _id: 'demo_user_123',
      name: 'Demo Vision User',
      email: 'demo@memonav.ai',
      preferredLanguage: 'English',
      accessibilityPreference: 'voice_first'
    };
    return next();
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await UserRepo.findById(decoded.id);
    if (!user) {
      // In case fallback restarted with demo token
      req.user = { id: decoded.id, _id: decoded.id, name: 'MemoNav User', email: decoded.email || 'user@memonav.ai' };
      return next();
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
  }
}

module.exports = {
  protect,
  JWT_SECRET
};

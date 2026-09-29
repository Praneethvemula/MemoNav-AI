const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserRepo, UserPreferenceRepo } = require('../models');
const { JWT_SECRET } = require('../middleware/authMiddleware');

function createToken(userId, email) {
  return jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '30d' });
}

async function register(req, res, next) {
  try {
    const { name, email, password, preferredLanguage, accessibilityPreference } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const existing = await UserRepo.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await UserRepo.create({
      name,
      email,
      password: hashedPassword,
      preferredLanguage: preferredLanguage || 'English',
      accessibilityPreference: accessibilityPreference || 'voice_first'
    });

    const userId = user._id || user.id;

    // Create initial preferences for user
    await UserPreferenceRepo.updateOrCreate(userId, {
      language: preferredLanguage || 'English',
      highContrast: accessibilityPreference === 'high_contrast',
      largeText: accessibilityPreference === 'large_text',
      instructionStyle: 'short',
      voiceSpeed: 'normal'
    });

    const token = createToken(userId, user.email);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        preferredLanguage: user.preferredLanguage,
        accessibilityPreference: user.accessibilityPreference
      }
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await UserRepo.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const userId = user._id || user.id;
    const token = createToken(userId, user.email);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        preferredLanguage: user.preferredLanguage,
        accessibilityPreference: user.accessibilityPreference
      }
    });
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const user = await UserRepo.findById(userId);
    const preferences = await UserPreferenceRepo.findOne({ userId });

    res.json({
      success: true,
      user: {
        id: userId,
        name: user ? user.name : req.user.name,
        email: user ? user.email : req.user.email,
        preferredLanguage: user ? user.preferredLanguage : 'English',
        accessibilityPreference: user ? user.accessibilityPreference : 'voice_first'
      },
      preferences: preferences || {}
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  getMe
};

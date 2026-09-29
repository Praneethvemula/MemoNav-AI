const { EmergencyContactRepo } = require('../models');

async function getContacts(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const contacts = await EmergencyContactRepo.find({ userId });
    res.json({
      success: true,
      contacts
    });
  } catch (err) {
    next(err);
  }
}

async function createContact(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { name, relationship, phoneNumber, email, isPrimary } = req.body;

    if (!name || !phoneNumber) {
      return res.status(400).json({ success: false, message: 'Contact name and phone number are required.' });
    }

    const contact = await EmergencyContactRepo.create({
      userId,
      name,
      relationship: relationship || 'Family',
      phoneNumber,
      email: email || '',
      isPrimary: Boolean(isPrimary)
    });

    res.status(201).json({
      success: true,
      message: 'Emergency contact added.',
      contact
    });
  } catch (err) {
    next(err);
  }
}

async function removeContact(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    await EmergencyContactRepo.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'Contact removed.'
    });
  } catch (err) {
    next(err);
  }
}

async function triggerAlert(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { latitude, longitude, address } = req.body;
    const contacts = await EmergencyContactRepo.find({ userId });

    // In a live system, SMS/WebPush gateway is triggered here.
    // For MemoNav AI, we log the alert and return full payload for user confirmation & direct dialing.
    console.log(`🚨 [EMERGENCY ALERT] User ${userId} triggered SOS at [${latitude}, ${longitude}]`);

    res.json({
      success: true,
      message: 'Emergency SOS activated. Emergency contacts prepared for calling and dispatch.',
      location: { latitude, longitude, address },
      contactsNotifiedCount: contacts.length,
      primaryContact: contacts.find(c => c.isPrimary) || contacts[0] || null
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getContacts,
  createContact,
  removeContact,
  triggerAlert
};

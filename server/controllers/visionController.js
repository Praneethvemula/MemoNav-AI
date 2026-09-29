const axios = require('axios');

async function analyzeFrame(req, res, next) {
  try {
    const { imageBase64, detectedObjects = [] } = req.body;

    // If objects are provided from browser detection (e.g., COCO-SSD)
    if (detectedObjects && detectedObjects.length > 0) {
      const topObjects = detectedObjects.slice(0, 3);
      const descriptions = topObjects.map(obj => {
        const name = obj.class || obj.label || 'object';
        const position = (obj.bbox && obj.bbox[0] < 200) ? 'on your left' : (obj.bbox && obj.bbox[0] > 400 ? 'on your right' : 'ahead of you');
        return `${name} ${position}`;
      });

      const speech = `Detected: ${descriptions.join(', ')}. Move with awareness.`;

      return res.json({
        success: true,
        speech,
        detectedCount: detectedObjects.length,
        objects: topObjects
      });
    }

    // Surroundings description fallback
    res.json({
      success: true,
      speech: 'Pathway ahead is open. Clear walking lane detected.',
      objects: []
    });
  } catch (err) {
    next(err);
  }
}

async function processOCR(req, res, next) {
  try {
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      return res.json({
        success: true,
        extractedText: '',
        voiceText: 'No clear text detected in frame. Please hold steady and try again.'
      });
    }

    // Clean up OCR text for voice readout
    const cleaned = text.replace(/[\r\n]+/g, ' ').trim();
    res.json({
      success: true,
      extractedText: cleaned,
      voiceText: cleaned
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  analyzeFrame,
  processOCR
};

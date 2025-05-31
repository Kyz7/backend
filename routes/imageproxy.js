// routes/imageProxy.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/proxy-image', async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ message: 'URL parameter is required' });
  }

  try {
    // Validate that the URL is from serpapi.com to prevent abuse
    if (!url.includes('serpapi.com')) {
      return res.status(400).json({ message: 'Only SerpAPI image URLs are allowed' });
    }

    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // Set appropriate headers for CORS
    res.set({
      'Content-Type': response.headers['content-type'] || 'image/jpeg',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    });

    // Pipe the image data to the response
    response.data.pipe(res);
  } catch (error) {
    console.error('Error proxying image:', error.message);
    res.status(500).json({ message: 'Failed to proxy image' });
  }
});

module.exports = router;
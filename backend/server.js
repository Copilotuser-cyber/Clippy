const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Your Hugging Face token
const HF_TOKEN = process.env.HF_TOKEN;

// Health check endpoint
app.get('/api', (req, res) => {
  res.json({ message: 'AI Nexus Backend is running!' });
});

// Proxy endpoint for Hugging Face
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await fetch(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: message,
          parameters: {
            max_length: 1000,
            temperature: 0.7,
            do_sample: true
          }
        }),
      }
    );

    const data = await response.json();
    
    let aiResponse;
    if (data[0] && data[0].generated_text) {
      aiResponse = data[0].generated_text;
    } else if (data.generated_text) {
      aiResponse = data.generated_text;
    } else if (data.error) {
      aiResponse = "The AI model is currently loading. Please try again in 10-20 seconds.";
    } else {
      aiResponse = "I'm not sure how to respond to that. Could you try rephrasing?";
    }

    res.json({ response: aiResponse });
  } catch (error) {
    console.error('Backend error:', error);
    res.status(500).json({ 
      response: "I'm having trouble connecting right now. Please try again later." 
    });
  }
});

// Premium chat endpoint
app.post('/api/premium-chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await fetch(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: message,
          parameters: {
            max_length: 1000,
            temperature: 0.7,
            do_sample: true
          }
        }),
      }
    );

    const data = await response.json();
    
    let aiResponse;
    if (data[0] && data[0].generated_text) {
      aiResponse = data[0].generated_text;
    } else if (data.generated_text) {
      aiResponse = data.generated_text;
    } else if (data.error) {
      aiResponse = "The premium AI model is loading. Please try again shortly.";
    } else {
      aiResponse = "I'm not sure how to respond to that. Could you try rephrasing?";
    }

    res.json({ response: aiResponse });
  } catch (error) {
    console.error('Premium chat error:', error);
    res.status(500).json({ 
      response: "Premium service is temporarily unavailable. Please try again later." 
    });
  }
});

module.exports = app;

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Initialize Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Initialize Google Sheets
let sheets = null;
if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
  const auth = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    null,
    process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/spreadsheets.readonly']
  );
  sheets = google.sheets({ version: 'v4', auth });
}

// Store connected spreadsheets per session (in production, use proper session management)
const connectedSheets = new Map();

// API Routes
app.post('/api/connect-spreadsheet', async (req, res) => {
  const { url } = req.body;
  
  if (!url || !url.includes('docs.google.com/spreadsheets')) {
    return res.status(400).json({ error: 'Invalid Google Sheets URL' });
  }

  // Extract spreadsheet ID from URL
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) {
    return res.status(400).json({ error: 'Could not extract spreadsheet ID' });
  }

  const spreadsheetId = match[1];
  const sessionId = req.headers['x-session-id'] || 'default';
  
  try {
    // Test connection by getting spreadsheet metadata
    if (sheets) {
      const response = await sheets.spreadsheets.get({
        spreadsheetId: spreadsheetId,
      });
      
      connectedSheets.set(sessionId, {
        id: spreadsheetId,
        title: response.data.properties.title,
        url: url
      });
      
      res.json({ 
        success: true, 
        message: `Connected to "${response.data.properties.title}"`,
        spreadsheetId: spreadsheetId
      });
    } else {
      // If no Google credentials, simulate connection
      connectedSheets.set(sessionId, {
        id: spreadsheetId,
        url: url
      });
      res.json({ 
        success: true, 
        message: 'Connected to spreadsheet (demo mode)',
        spreadsheetId: spreadsheetId
      });
    }
  } catch (error) {
    console.error('Error connecting to spreadsheet:', error);
    res.status(400).json({ 
      error: 'Could not connect to spreadsheet. Please check permissions.' 
    });
  }
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  const sessionId = req.headers['x-session-id'] || 'default';
  const connectedSheet = connectedSheets.get(sessionId);
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    let sheetData = null;
    
    // Fetch sheet data if connected
    if (connectedSheet && sheets) {
      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: connectedSheet.id,
          range: 'A1:Z1000', // Adjust range as needed
        });
        sheetData = response.data.values;
      } catch (error) {
        console.error('Error fetching sheet data:', error);
      }
    }

    // Prepare context for Anthropic
    let systemPrompt = `You are a CPA (Cost Per Acquisition) Calculator assistant. You help users analyze marketing data, calculate CPA metrics, ROI, and provide optimization recommendations.`;
    
    if (sheetData) {
      systemPrompt += `\n\nThe user has connected a Google Spreadsheet with the following data:\n${JSON.stringify(sheetData.slice(0, 10))}...\n\nUse this data to provide specific, accurate calculations and insights.`;
    } else if (connectedSheet) {
      systemPrompt += `\n\nThe user has connected a spreadsheet but I cannot access the data. Provide helpful guidance about CPA calculations and ask for specific data points if needed.`;
    } else {
      systemPrompt += `\n\nNo spreadsheet is connected. Encourage the user to connect their Google Spreadsheet for personalized analysis.`;
    }

    // Call Anthropic API
    if (process.env.ANTHROPIC_API_KEY) {
      const completion = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: message
          }
        ]
      });

      res.json({ 
        response: completion.content[0].text,
        hasSpreadsheet: !!connectedSheet
      });
    } else {
      // Fallback to demo responses if no API key
      const demoResponse = generateDemoResponse(message, !!connectedSheet);
      res.json({ 
        response: demoResponse,
        hasSpreadsheet: !!connectedSheet,
        isDemo: true
      });
    }
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ 
      error: 'An error occurred processing your request',
      details: error.message 
    });
  }
});

// Helper function for demo responses
function generateDemoResponse(message, hasSpreadsheet) {
  const lowerMessage = message.toLowerCase();
  
  if (!hasSpreadsheet) {
    return 'Please connect your Google Spreadsheet first to get personalized CPA analysis. Click the "Connect" button above and enter your spreadsheet URL.';
  }
  
  if (lowerMessage.includes('cpa') || lowerMessage.includes('cost per acquisition')) {
    return 'Based on your spreadsheet data, I can analyze your CPA metrics. Your average CPA appears to be in a healthy range. Would you like me to break down the CPA by campaign or time period?';
  } else if (lowerMessage.includes('roi')) {
    return 'I can help you calculate ROI from your spreadsheet data. To provide accurate ROI calculations, I need to know which campaigns and time periods you want to analyze.';
  } else {
    return 'I can help you with CPA calculations, ROI analysis, budget optimization, and campaign performance metrics using your spreadsheet data. What would you like to analyze?';
  }
}

// Serve index-api.html for all other routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index-api.html'));
});

app.listen(PORT, () => {
  console.log(`CPA Calculator API server running on http://localhost:${PORT}`);
  console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Anthropic API: ${process.env.ANTHROPIC_API_KEY ? 'Connected' : 'Not configured (demo mode)'}`);
  console.log(`Google Sheets API: ${sheets ? 'Connected' : 'Not configured (demo mode)'}`);
});

# CPA Calculator - vibecodingtest

A ChatGPT-like CPA (Cost Per Acquisition) Calculator with Google Sheets integration.

## 🎯 Two Versions Available

### 1. Demo Version (No API Required)
- **Branch**: `demo-version`
- **Port**: 5001
- **Features**: Simulated responses, no real API calls
- **Use Case**: Testing UI/UX, demonstrations, development

### 2. Production Version (API Integrated)
- **Branch**: `master`
- **Port**: 5001 (configurable via .env)
- **Features**: Real Anthropic LLM integration, Google Sheets API
- **Use Case**: Production deployment with actual data processing

## 🚀 Getting Started

### Running the Demo Version (No API Keys Needed)
```bash
# Switch to demo branch
git checkout demo-version

# Install dependencies
npm install

# Run the server
node index.js
# Or use npm script
npm run dev

# Open browser at http://localhost:5001
```

### Running the Production Version (API Keys Required)
```bash
# Stay on master branch
git checkout master

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your API keys
# - Add your Anthropic API key
# - Add your Google Service Account credentials

# Run the server
node index.js
# Or use npm script
npm run dev

# Open browser at http://localhost:5001
```

## 🔧 Configuration

### Environment Variables (Production Version)
- `ANTHROPIC_API_KEY`: Your Anthropic Claude API key
- `GOOGLE_CLIENT_EMAIL`: Google service account email
- `GOOGLE_PRIVATE_KEY`: Google service account private key
- `PORT`: Server port (default: 5001)
- `NODE_ENV`: Environment (development/production)

## 📦 Deployment

### Vercel Deployment
- Automatically deploys from the main branch
- Environment variables must be set in Vercel dashboard

### Render Deployment
- Configured via render.yaml
- Environment variables must be set in Render dashboard

## 🏗️ Project Structure
```
vibecodingtest/
├── public/
│   ├── index.html      # Chat interface
│   ├── css/
│   │   └── style.css   # ChatGPT-like styling
│   └── js/
│       └── app.js      # Frontend logic
├── api/                # API routes (production version)
├── index.js            # Server file
├── package.json        # Dependencies
├── .env.example        # Environment template
├── vercel.json         # Vercel config
└── render.yaml         # Render config
```

## 🔄 Switching Between Versions

```bash
# To use demo version (no API)
git checkout demo-version

# To use production version (with API)
git checkout master

# Always restart the server after switching
```

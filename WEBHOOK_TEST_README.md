# Webhook Test Server

A simple Python Flask server to test webhook notifications from the Namada Analytics Dashboard.

## Features

- 🚨 Receives webhook POST requests from your dashboard
- 📊 Beautiful web interface to view incoming webhooks
- 🔄 Auto-refreshes to show new webhooks
- 📝 Stores last 50 webhooks in memory
- 🎨 Windows 95-style retro interface
- 🧹 Clear all webhooks with one click

## Installation

1. Make sure you have Python 3.7+ installed
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

1. **Start the server:**
   ```bash
   python webhook-test-server.py
   ```

2. **The web interface will automatically open** at `http://localhost:5000`

3. **Configure your dashboard:**
   - Go to your Namada Analytics Dashboard
   - Create an alert with webhook notification
   - Set the webhook URL to: `http://localhost:5000/webhook`

4. **Test webhooks:**
   - When alerts trigger in your dashboard, you'll see the webhook data appear in the web interface
   - Click on any webhook to expand and view the full JSON data

## Endpoints

- **`GET /`** - Main web interface
- **`POST /webhook`** - Webhook endpoint (receives alerts from dashboard)
- **`GET /status`** - Server status API
- **`POST /clear`** - Clear all stored webhooks
- **`GET /health`** - Health check endpoint

## Webhook Data Format

The server expects JSON data in this format (from your dashboard):

```json
{
  "alert": {
    "id": "alert-123",
    "name": "High Block Time Alert",
    "description": "Block time is above threshold",
    "type": "block-height",
    "condition": "above",
    "threshold": 1000000
  },
  "trigger": {
    "id": "trigger-456",
    "message": "Block height is above 1000000 (Current: 1000123)",
    "value": 1000123,
    "timestamp": 1640995200000
  },
  "network": {
    "timestamp": "2024-01-01T12:00:00.000Z",
    "source": "Namada Analytics Dashboard"
  }
}
```

## Troubleshooting

- **Port 5000 already in use:** Change the port in the script or kill the process using that port
- **Webhooks not appearing:** Check that your dashboard is sending to the correct URL
- **Server won't start:** Make sure Flask is installed (`pip install Flask`)

## Development

To modify the server:
- Edit `webhook-test-server.py`
- The HTML template is embedded in the Python file
- Webhook data is stored in memory (not persistent)

## Security Note

This is a development/testing tool. Do not use in production without proper security measures. 
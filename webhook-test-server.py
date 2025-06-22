#!/usr/bin/env python3
"""
Namada Analytics Dashboard - Webhook Test Server

A simple Flask server to test webhook notifications from the Namada Analytics Dashboard.
Run this server and configure your dashboard to send webhooks to http://localhost:5000/webhook

Usage:
    python webhook-test-server.py
"""

from flask import Flask, request, jsonify, render_template_string
import json
import datetime
import threading
import webbrowser
from collections import deque
import os

app = Flask(__name__)

# Store webhook data in memory (last 50 webhooks)
webhook_data = deque(maxlen=50)

# HTML template for the web interface
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Namada Analytics - Webhook Test Server</title>
    <style>
        body {
            font-family: 'Courier New', monospace;
            background: #c0c0c0;
            margin: 0;
            padding: 20px;
            color: #000;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            background: #000080;
            color: white;
            padding: 15px;
            margin-bottom: 20px;
            border: 2px solid #000;
            box-shadow: 2px 2px 0 #000;
        }
        .status {
            background: #fff;
            border: 2px solid #000;
            padding: 15px;
            margin-bottom: 20px;
            box-shadow: 2px 2px 0 #000;
        }
        .webhook-list {
            background: #fff;
            border: 2px solid #000;
            box-shadow: 2px 2px 0 #000;
        }
        .webhook-item {
            border-bottom: 1px solid #ccc;
            padding: 15px;
            cursor: pointer;
        }
        .webhook-item:hover {
            background: #f0f0f0;
        }
        .webhook-item:last-child {
            border-bottom: none;
        }
        .webhook-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .webhook-timestamp {
            font-size: 12px;
            color: #666;
        }
        .webhook-type {
            background: #ff6b35;
            color: white;
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: bold;
        }
        .webhook-content {
            background: #f8f8f8;
            border: 1px solid #ddd;
            padding: 10px;
            border-radius: 3px;
            font-size: 12px;
            white-space: pre-wrap;
            max-height: 200px;
            overflow-y: auto;
            display: none;
        }
        .webhook-content.expanded {
            display: block;
        }
        .clear-btn {
            background: #ff0000;
            color: white;
            border: 2px solid #000;
            padding: 8px 16px;
            cursor: pointer;
            font-weight: bold;
            box-shadow: 2px 2px 0 #000;
        }
        .clear-btn:hover {
            background: #cc0000;
        }
        .instructions {
            background: #fff;
            border: 2px solid #000;
            padding: 15px;
            margin-bottom: 20px;
            box-shadow: 2px 2px 0 #000;
        }
        .instructions h3 {
            margin-top: 0;
            color: #000080;
        }
        .instructions code {
            background: #f0f0f0;
            padding: 2px 4px;
            border-radius: 2px;
        }
        .no-webhooks {
            text-align: center;
            padding: 40px;
            color: #666;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚨 Namada Analytics - Webhook Test Server</h1>
            <p>Test webhook notifications from your Namada Analytics Dashboard</p>
        </div>

        <div class="instructions">
            <h3>How to use:</h3>
            <ol>
                <li>This server is running on <code>http://localhost:5000</code></li>
                <li>In your Namada Analytics Dashboard, create an alert with webhook notification</li>
                <li>Set the webhook URL to: <code>http://localhost:5000/webhook</code></li>
                <li>When alerts trigger, you'll see the webhook data here</li>
                <li>Click on any webhook to expand and view the full data</li>
            </ol>
        </div>

        <div class="status">
            <h3>Server Status</h3>
            <p><strong>Status:</strong> <span style="color: green;">🟢 Running</span></p>
            <p><strong>Webhook Endpoint:</strong> <code>http://localhost:5000/webhook</code></p>
            <p><strong>Total Webhooks Received:</strong> {{ webhook_count }}</p>
            <p><strong>Last Webhook:</strong> {{ last_webhook_time }}</p>
            <button class="clear-btn" onclick="clearWebhooks()">Clear All Webhooks</button>
        </div>

        <div class="webhook-list">
            <h3 style="margin: 0; padding: 15px; border-bottom: 2px solid #000;">Received Webhooks</h3>
            {% if webhooks %}
                {% for webhook in webhooks %}
                <div class="webhook-item" onclick="toggleWebhook('webhook-{{ loop.index }}')">
                    <div class="webhook-header">
                        <div>
                            <strong>{{ webhook.alert_name }}</strong>
                            <span class="webhook-type">{{ webhook.alert_type }}</span>
                        </div>
                        <div class="webhook-timestamp">{{ webhook.timestamp }}</div>
                    </div>
                    <div class="webhook-content" id="webhook-{{ loop.index }}">
{{ webhook.formatted_data }}
                    </div>
                </div>
                {% endfor %}
            {% else %}
                <div class="no-webhooks">
                    <p>No webhooks received yet...</p>
                    <p>Create an alert in your dashboard and set the webhook URL to test!</p>
                </div>
            {% endif %}
        </div>
    </div>

    <script>
        function toggleWebhook(id) {
            const content = document.getElementById(id);
            content.classList.toggle('expanded');
        }

        function clearWebhooks() {
            if (confirm('Are you sure you want to clear all webhooks?')) {
                fetch('/clear', { method: 'POST' })
                    .then(() => window.location.reload());
            }
        }

        // Auto-refresh every 5 seconds
        setInterval(() => {
            fetch('/status')
                .then(response => response.json())
                .then(data => {
                    if (data.webhook_count !== {{ webhook_count }}) {
                        window.location.reload();
                    }
                });
        }, 5000);
    </script>
</body>
</html>
"""

@app.route('/')
def index():
    """Main web interface"""
    webhook_count = len(webhook_data)
    last_webhook_time = "Never" if not webhook_data else webhook_data[-1]['timestamp']
    
    # Format webhooks for display
    webhooks = []
    for i, webhook in enumerate(reversed(webhook_data)):
        formatted_data = json.dumps(webhook['data'], indent=2)
        webhooks.append({
            'alert_name': webhook['data'].get('alert', {}).get('name', 'Unknown Alert'),
            'alert_type': webhook['data'].get('alert', {}).get('type', 'unknown'),
            'timestamp': webhook['timestamp'],
            'formatted_data': formatted_data
        })
    
    return render_template_string(HTML_TEMPLATE, 
                                webhook_count=webhook_count,
                                last_webhook_time=last_webhook_time,
                                webhooks=webhooks)

@app.route('/webhook', methods=['POST'])
def webhook():
    """Webhook endpoint that receives POST requests"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data received'}), 400
        
        # Store webhook data
        webhook_info = {
            'timestamp': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'data': data,
            'headers': dict(request.headers)
        }
        webhook_data.append(webhook_info)
        
        print(f"📨 Webhook received at {webhook_info['timestamp']}")
        print(f"   Alert: {data.get('alert', {}).get('name', 'Unknown')}")
        print(f"   Type: {data.get('alert', {}).get('type', 'unknown')}")
        
        return jsonify({'status': 'success', 'message': 'Webhook received'}), 200
    
    except Exception as e:
        print(f"❌ Error processing webhook: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/status')
def status():
    """API endpoint for checking server status"""
    return jsonify({
        'status': 'running',
        'webhook_count': len(webhook_data),
        'last_webhook': webhook_data[-1]['timestamp'] if webhook_data else None
    })

@app.route('/clear', methods=['POST'])
def clear_webhooks():
    """Clear all stored webhook data"""
    webhook_data.clear()
    return jsonify({'status': 'success', 'message': 'Webhooks cleared'})

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.datetime.now().isoformat()})

def open_browser():
    """Open the web interface in the default browser"""
    import time
    time.sleep(1)  # Wait for server to start
    webbrowser.open('http://localhost:5000')

if __name__ == '__main__':
    print("🚀 Starting Namada Analytics Webhook Test Server...")
    print("📡 Server will be available at: http://localhost:5000")
    print("🔗 Webhook endpoint: http://localhost:5000/webhook")
    print("📊 Web interface will open automatically")
    print("=" * 50)
    
    # Start browser in a separate thread
    browser_thread = threading.Thread(target=open_browser)
    browser_thread.daemon = True
    browser_thread.start()
    
    # Start Flask server
    app.run(host='0.0.0.0', port=9999, debug=False) 
# Namada Analytics Dashboard API Documentation

## Overview

The Namada Analytics Dashboard provides a comprehensive REST API for accessing blockchain metrics, privacy analytics, governance data, and cross-chain information. All endpoints return JSON responses and support both GET and POST methods where applicable.

## Base URL

```
http://localhost:3001/api/analytics
```

## Authentication

Currently, the API does not require authentication for demo purposes. In production, consider implementing API key authentication or OAuth2.

## Endpoints

### 1. Network Statistics

**GET** `/api/analytics?endpoint=network-stats`

Returns current network statistics including block height, epoch, and validator information.

**Response:**
```json
{
  "success": true,
  "data": {
    "latestBlock": 5123456,
    "currentEpoch": 123,
    "totalValidators": 150,
    "blockTime": "2024-01-15T10:30:00.000Z",
    "averageBlockTime": "3.45",
    "totalTransactions": 7500000,
    "activeAddresses": 25000
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Validator Statistics

**GET** `/api/analytics?endpoint=validator-stats`

Returns validator-related metrics and statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalValidators": 150,
    "activeValidators": 120,
    "totalVotingPower": 8500000,
    "averageVotingPower": 75000,
    "topValidator": {
      "address": "validator-42",
      "votingPower": 450000,
      "commission": "12.5"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. Time Series Data

**GET** `/api/analytics?endpoint=time-series&limit=100&timeframe=24h`

Returns historical time series data for various metrics.

**Parameters:**
- `limit` (optional): Number of data points to return (default: 100, max: 1000)
- `timeframe` (optional): Time range for data (1h, 24h, 7d, 30d)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "timestamp": 1705312200000,
      "blockHeight": 5123456,
      "blockTime": 3.2,
      "activeValidators": 120,
      "totalVotingPower": 8500000,
      "averageVotingPower": 75000
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 4. Privacy Metrics (MASP Analytics)

**GET** `/api/analytics?endpoint=privacy-metrics`

Returns Multi-Asset Shielded Pool (MASP) analytics and privacy metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalShieldedBalance": 12500000,
    "activeShieldedAddresses": 3500,
    "anonymitySetSize": 8500,
    "privacyTransactions24h": 750,
    "averageAnonymitySet": 75,
    "shieldedTokenTypes": 8,
    "privacyTransactions": [
      {
        "id": "privacy-1705312200000-1",
        "type": "shield",
        "amount": "1250.50",
        "denom": "NAM",
        "timestamp": 1705312200000,
        "anonymitySet": 850,
        "fee": "0.0025"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 5. Governance Data

**GET** `/api/analytics?endpoint=governance`

Returns governance proposals, voting data, and participation metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "proposals": [
      {
        "id": "proposal-1",
        "title": "Increase Minimum Validator Commission",
        "description": "This proposal aims to improve the Namada ecosystem.",
        "status": "active",
        "votingStart": 1705312200000,
        "votingEnd": 1705917000000,
        "totalVotes": 850000,
        "yesVotes": 600000,
        "noVotes": 200000,
        "abstainVotes": 50000,
        "turnout": 15.5,
        "proposer": "validator-42",
        "deposit": "500.00"
      }
    ],
    "stats": {
      "totalProposals": 20,
      "activeProposals": 3,
      "passedProposals": 12,
      "totalVotingPower": 10000000,
      "averageTurnout": 18.5,
      "participationRate": 22.3
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 6. Cross-Chain Analytics

**GET** `/api/analytics?endpoint=cross-chain`

Returns Inter-Blockchain Communication (IBC) and cross-chain bridge data.

**Response:**
```json
{
  "success": true,
  "data": {
    "ibcTransfers": [
      {
        "id": "ibc-1705312200000-1",
        "sourceChain": "Cosmos Hub",
        "destinationChain": "Namada",
        "amount": "2500.00",
        "denom": "ATOM",
        "timestamp": 1705312200000,
        "status": "completed",
        "fee": "0.0025"
      }
    ],
    "bridgeActivity": {
      "totalTransfers": 8500,
      "totalVolume": 75000000,
      "activeBridges": 8,
      "averageTransferSize": 8500
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 7. All Data (Combined)

**GET** `/api/analytics?endpoint=all&limit=100`

Returns all available data in a single request.

**Response:**
```json
{
  "success": true,
  "data": {
    "networkStats": { /* network statistics */ },
    "validatorStats": { /* validator statistics */ },
    "timeSeries": [ /* time series data */ ],
    "privacyMetrics": { /* privacy metrics */ },
    "governance": { /* governance data */ },
    "crossChain": { /* cross-chain data */ }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## POST Endpoints

### 1. Subscribe to Updates

**POST** `/api/analytics`

Subscribe to real-time updates for specific metrics.

**Request Body:**
```json
{
  "action": "subscribe",
  "data": {
    "endpoints": ["network-stats", "validator-stats"],
    "callbackUrl": "https://your-app.com/webhook",
    "interval": 30000
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully subscribed to updates",
  "subscriptionId": "sub-1705312200000"
}
```

### 2. Create Alert

**POST** `/api/analytics`

Create a custom alert for specific conditions.

**Request Body:**
```json
{
  "action": "alert",
  "data": {
    "name": "High Block Time Alert",
    "type": "block-height",
    "condition": "above",
    "threshold": 10,
    "notificationMethod": "webhook",
    "webhookUrl": "https://your-app.com/alert-webhook"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Alert created successfully",
  "alertId": "alert-1705312200000"
}
```

### 3. Test Webhook

**POST** `/api/analytics`

Test a webhook URL to ensure it's properly configured.

**Request Body:**
```json
{
  "action": "test-webhook",
  "data": {
    "webhookUrl": "https://your-app.com/webhook",
    "alertData": {
      "name": "Test Alert",
      "description": "Test webhook notification",
      "type": "block-height",
      "condition": "above",
      "threshold": 1000000
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook test successful",
  "statusCode": 200,
  "statusText": "OK"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Webhook test failed",
  "statusCode": 404,
  "statusText": "Not Found"
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error description",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `404`: Endpoint not found
- `500`: Internal Server Error

## Rate Limiting

Currently, no rate limiting is implemented. In production, consider implementing:
- Rate limiting per IP address
- Rate limiting per API key
- Different limits for different endpoints

## Data Formats

### Timestamps
All timestamps are returned in ISO 8601 format (UTC):
```
2024-01-15T10:30:00.000Z
```

### Numbers
- Large numbers are returned as strings to preserve precision
- Decimal numbers use standard JavaScript number format
- Percentages are returned as decimal values (0.15 = 15%)

### Currencies
- All currency amounts are in the smallest unit (e.g., satoshis for Bitcoin)
- Denomination is specified in the `denom` field

## WebSocket Support (Future)

Planned WebSocket endpoints for real-time data streaming:

```
ws://localhost:3001/api/analytics/ws
```

**Supported channels:**
- `network-stats`: Real-time network statistics
- `validator-stats`: Real-time validator updates
- `privacy-metrics`: Real-time privacy transaction data
- `governance`: Real-time proposal and voting updates

## SDK Examples

### JavaScript/TypeScript

```javascript
// Fetch network statistics
const response = await fetch('/api/analytics?endpoint=network-stats');
const data = await response.json();

// Create an alert
const alertResponse = await fetch('/api/analytics', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    action: 'alert',
    data: {
      name: 'High Block Time',
      type: 'block-height',
      condition: 'above',
      threshold: 10,
      notificationMethod: 'webhook',
      webhookUrl: 'https://your-app.com/webhook'
    }
  })
});
```

### Python

```python
import requests

# Fetch network statistics
response = requests.get('http://localhost:3001/api/analytics?endpoint=network-stats')
data = response.json()

# Create an alert
alert_data = {
    "action": "alert",
    "data": {
        "name": "High Block Time",
        "type": "block-height",
        "condition": "above",
        "threshold": 10,
        "notificationMethod": "webhook",
        "webhookUrl": "https://your-app.com/webhook"
    }
}
response = requests.post('http://localhost:3001/api/analytics', json=alert_data)
```

## Changelog

### Version 1.0.0 (Current)
- Initial API implementation
- Network statistics endpoint
- Validator statistics endpoint
- Time series data endpoint
- Privacy metrics endpoint
- Governance data endpoint
- Cross-chain analytics endpoint
- Alert system endpoints
- Webhook support

### Planned Features
- WebSocket real-time streaming
- GraphQL endpoint
- Authentication and authorization
- Rate limiting
- Data export endpoints
- Historical data archives
- Custom metric endpoints

## Support

For API support and questions:
- Create an issue in the GitHub repository
- Check the documentation for common issues
- Review the example implementations

## License

This API is part of the Namada Analytics Dashboard project and follows the same license terms. 

## New Transfer Flow Network API Endpoints

### 8. Transfer Flow Network

#### 8.1 Get Transfer Flows
**GET** `/api/analytics?endpoint=transfer-flows`

Returns transfer flow data with filtering and pagination support.

**Parameters:**
- `timeframe` (optional): Time range (1h, 24h, 7d, 30d) - default: 24h
- `token` (optional): Filter by token type (all, NAM, ATOM, OSMO) - default: all
- `status` (optional): Filter by status (all, completed, pending, failed) - default: all
- `limit` (optional): Number of results per page - default: 50
- `offset` (optional): Pagination offset - default: 0

**Response:**
```json
{
  "success": true,
  "data": {
    "flows": [
      {
        "id": "1",
        "source": "namada1abc123def456ghi789jkl012mno345pqr678stu901vwx234yza567",
        "destination": "namada1def456ghi789jkl012mno345pqr678stu901vwx234yza567abc123",
        "amount": "1250.50",
        "token": "NAM",
        "timestamp": "2024-01-15T10:30:00Z",
        "status": "completed",
        "type": "internal",
        "txHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
      }
    ],
    "pagination": {
      "total": 1250,
      "limit": 50,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

#### 8.2 Get Network Nodes
**GET** `/api/analytics?endpoint=network-nodes`

Returns network node information including validators, exchanges, bridges, and wallets.

**Parameters:**
- `type` (optional): Filter by node type (all, validator, exchange, bridge, wallet) - default: all
- `status` (optional): Filter by status (all, active, inactive) - default: all

**Response:**
```json
{
  "success": true,
  "data": {
    "nodes": [
      {
        "id": "1",
        "name": "Validator Alpha",
        "type": "validator",
        "volume": 5000,
        "connections": 15,
        "status": "active",
        "address": "namada1validatoralpha123456789abcdefghijklmnopqrstuvwxyz",
        "uptime": 99.8,
        "commission": 0.05
      }
    ],
    "summary": {
      "total": 8,
      "active": 7,
      "inactive": 1,
      "totalVolume": 49000,
      "totalConnections": 104
    }
  }
}
```

#### 8.3 Get Flow Metrics
**GET** `/api/analytics?endpoint=flow-metrics`

Returns comprehensive transfer flow analytics and metrics.

**Parameters:**
- `timeframe` (optional): Time range for metrics (1h, 24h, 7d, 30d) - default: 24h

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTransfers": 1250,
    "totalVolume": 45000,
    "averageTransferSize": 36,
    "activeConnections": 70,
    "ibcTransfers": 180,
    "crossChainTransfers": 95,
    "successRate": 94.2,
    "averageTransferTime": 2.5,
    "topTokens": [
      {
        "token": "NAM",
        "volume": 35000,
        "transfers": 980
      }
    ],
    "topSources": [
      {
        "address": "namada1abc...xyz",
        "volume": 5000,
        "transfers": 45
      }
    ],
    "topDestinations": [
      {
        "address": "namada1pqr...stu",
        "volume": 4500,
        "transfers": 42
      }
    ],
    "hourlyData": [
      {
        "hour": "10:00",
        "transfers": 82,
        "volume": 3500
      }
    ]
  }
}
```

#### 8.4 Get Flow Details
**GET** `/api/analytics?endpoint=flow-details`

Returns detailed information about a specific transfer flow.

**Parameters:**
- `id` (required): Flow ID
- `txHash` (optional): Transaction hash (alternative to ID)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "source": "namada1abc123def456ghi789jkl012mno345pqr678stu901vwx234yza567",
    "destination": "namada1def456ghi789jkl012mno345pqr678stu901vwx234yza567abc123",
    "amount": "1250.50",
    "token": "NAM",
    "timestamp": "2024-01-15T10:30:00Z",
    "status": "completed",
    "type": "internal",
    "txHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "blockHeight": 1234567,
    "gasUsed": 150000,
    "gasPrice": "0.000001",
    "fee": "0.15",
    "confirmations": 12,
    "route": [
      {
        "chain": "Namada",
        "address": "namada1abc123def456ghi789jkl012mno345pqr678stu901vwx234yza567"
      }
    ],
    "events": [
      {
        "type": "transfer",
        "timestamp": "2024-01-15T10:30:05Z",
        "description": "Token transfer initiated"
      }
    ],
    "metadata": {
      "memo": "Payment for services",
      "tags": ["internal", "payment"],
      "sourceApp": "Namada Wallet",
      "destinationApp": "Namada Wallet"
    }
  }
}
```

## Webhook Receiver

A webhook testing endpoint is available at `/webhook-receiver.html` for testing alert configurations. This page:

- Displays the current webhook URL for easy copying
- Shows received webhook notifications in real-time
- Provides a test button to simulate webhook notifications
- Stores webhook history in localStorage
- Features a Windows 95-style interface matching the dashboard

### Using the Webhook Receiver

1. Open `/webhook-receiver.html` in your browser
2. Copy the displayed URL
3. Use this URL as the webhook URL in your alert configuration
4. Create an alert with webhook notification method
5. Test the webhook using the "Test" button in the alert system

### Webhook Payload Format

All webhook notifications follow this structure:

```json
{
  "alert": {
    "id": "alert-1705312200000",
    "name": "High Block Time Alert",
    "description": "Alert when block time exceeds threshold",
    "type": "block-height",
    "condition": "above",
    "threshold": 1000000
  },
  "trigger": {
    "id": "trigger-1705312200000",
    "message": "High Block Time Alert: block height is above 1000000 (Current: 1000001)",
    "value": 1000001,
    "timestamp": 1705312200000
  },
  "network": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "source": "Namada Analytics Dashboard"
  }
}
```

## Alert System Features

The alert system provides comprehensive monitoring capabilities:

### Alert Types
- **Block Height**: Monitor current block height
- **Voting Power**: Track total voting power changes
- **Validator Count**: Monitor active validator count
- **Privacy Metrics**: Track shielded balance and transactions
- **Governance**: Monitor active proposals and voting
- **Cross-Chain**: Track IBC transfers and bridge activity

### Alert Conditions
- **Above**: Trigger when value exceeds threshold
- **Below**: Trigger when value falls below threshold
- **Equals**: Trigger when value equals threshold
- **Changes**: Trigger when value changes from previous check

### Notification Methods
- **Browser Notifications**: Native browser notifications
- **Webhook**: HTTP POST to specified URL

### Advanced Features
- **Cooldown Periods**: Prevent spam with configurable cooldowns
- **Real-time Monitoring**: Automatic checking every 30 seconds
- **Alert History**: Track all triggers and notifications
- **Webhook Testing**: Built-in webhook validation
- **Status Indicators**: Visual feedback for webhook status
- **Statistics**: Comprehensive alert and trigger statistics 
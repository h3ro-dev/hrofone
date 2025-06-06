# Integration API Documentation

## Overview

The Integration API provides RESTful endpoints for managing external service connections in HR of One. All endpoints require authentication and return JSON responses.

## Base URL

```
https://api.hrofone.com/v1
```

## Authentication

All API requests must include an authentication token in the header:

```http
Authorization: Bearer YOUR_API_TOKEN
```

## Endpoints

### List Integrations

Get all configured integrations for the current account.

```http
GET /integrations
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "quickbooks-123",
      "name": "QuickBooks",
      "status": "connected"
    },
    {
      "id": "gusto-456",
      "name": "Gusto",
      "status": "connected"
    }
  ]
}
```

### Get Integration Status

Get detailed status information for a specific integration.

```http
GET /integrations/:id/status
```

**Parameters:**
- `id` (string): Integration ID

**Response:**

```json
{
  "success": true,
  "data": {
    "status": "connected",
    "lastSync": "2024-01-20T10:30:00Z",
    "metadata": {
      "id": "quickbooks",
      "name": "QuickBooks",
      "description": "Connect to QuickBooks for accounting and payroll data",
      "category": "accounting",
      "supportedFeatures": ["oauth2", "webhooks", "real-time-sync"]
    }
  }
}
```

### Register Integration

Configure a new integration connection.

```http
POST /integrations
```

**Request Body:**

```json
{
  "id": "unique-integration-id",
  "name": "QuickBooks Production",
  "type": "quickbooks",
  "credentials": {
    "clientId": "your-client-id",
    "clientSecret": "your-client-secret",
    "authorizationCode": "auth-code-from-oauth",
    "redirectUri": "https://app.hrofone.com/integrations/oauth/callback"
  },
  "settings": {
    "syncInterval": 3600,
    "webhookUrl": "https://app.hrofone.com/webhooks/quickbooks"
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Integration registered successfully"
}
```

### Sync Data

Trigger a manual data synchronization for an integration.

```http
POST /integrations/:id/sync
```

**Parameters:**
- `id` (string): Integration ID

**Request Body:**

```json
{
  "entityType": "employee"
}
```

**Supported Entity Types:**
- `employee`
- `payroll`
- `benefits`
- `time_off`
- `time_tracking`
- `expense`
- `document`
- `compliance`

**Response:**

```json
{
  "success": true,
  "data": {
    "success": true,
    "itemsSynced": 45,
    "errors": [],
    "timestamp": "2024-01-20T10:35:00Z",
    "duration": 2500
  }
}
```

### Handle Webhook

Receive webhook notifications from integrated services.

```http
POST /integrations/:id/webhook
```

**Parameters:**
- `id` (string): Integration ID

**Request Body:**
Varies by integration provider

**Response:**

```json
{
  "success": true
}
```

### Remove Integration

Delete an integration and all associated data.

```http
DELETE /integrations/:id
```

**Parameters:**
- `id` (string): Integration ID

**Response:**

```json
{
  "success": true,
  "message": "Integration removed successfully"
}
```

### OAuth Callback

Handle OAuth 2.0 callback from integration providers.

```http
GET /integrations/oauth/callback
```

**Query Parameters:**
- `code` (string): Authorization code
- `state` (string): State parameter containing integration info

**Response:**
Redirects to integration setup completion page

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common Error Codes

- `400` - Bad Request: Invalid parameters or request body
- `401` - Unauthorized: Missing or invalid authentication
- `403` - Forbidden: Insufficient permissions
- `404` - Not Found: Resource not found
- `429` - Too Many Requests: Rate limit exceeded
- `500` - Internal Server Error: Server error

## Rate Limiting

API requests are limited to:
- 1000 requests per hour per account
- 100 requests per minute per integration

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1611144000
```

## Webhooks

Configure webhook endpoints to receive real-time updates from integrations.

### Webhook Security

Verify webhook authenticity using signature validation:

```javascript
const crypto = require('crypto');

function validateWebhook(payload, signature, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return hash === signature;
}
```

### Webhook Events

Common webhook events:
- `employee.created`
- `employee.updated`
- `employee.deleted`
- `payroll.processed`
- `benefits.enrolled`
- `timeoff.requested`
- `timeoff.approved`

## Examples

### Node.js Example

```javascript
const axios = require('axios');

const API_TOKEN = 'your-api-token';
const BASE_URL = 'https://api.hrofone.com/v1';

// List all integrations
async function listIntegrations() {
  try {
    const response = await axios.get(`${BASE_URL}/integrations`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}

// Sync employee data
async function syncEmployees(integrationId) {
  try {
    const response = await axios.post(
      `${BASE_URL}/integrations/${integrationId}/sync`,
      { entityType: 'employee' },
      {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}
```

### Python Example

```python
import requests

API_TOKEN = 'your-api-token'
BASE_URL = 'https://api.hrofone.com/v1'

headers = {
    'Authorization': f'Bearer {API_TOKEN}',
    'Content-Type': 'application/json'
}

# Register a new integration
def register_integration(config):
    response = requests.post(
        f'{BASE_URL}/integrations',
        json=config,
        headers=headers
    )
    
    return response.json()

# Get integration status
def get_integration_status(integration_id):
    response = requests.get(
        f'{BASE_URL}/integrations/{integration_id}/status',
        headers=headers
    )
    
    return response.json()
```

## Support

For API support, contact:
- Email: api-support@hrofone.com
- Documentation: https://docs.hrofone.com
- Status Page: https://status.hrofone.com
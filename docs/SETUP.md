# Kommo CRM MCP - Setup Guide

> **Last Updated:** 2026-01-12  
> **Purpose:** Complete guide for OAuth 2.0 configuration and setup

---

## 📋 Prerequisites

- Kommo account with API access
- OAuth 2.0 credentials (Client ID and Client Secret)
- Node.js 18+ (if using as a library)

---

## 🔑 OAuth 2.0 Configuration

### Step 1: Create Integration in Kommo

1. Go to **Kommo Settings** → **Integrations**
2. Click **"Create integration"** or select your existing integration
3. Configure the necessary scopes (read/write for contacts, leads, deals, etc.)

### Step 2: Get OAuth Credentials

In the **"Keys and Scopes"** tab:

- **Integration ID** → Use as `clientId`
- **Secret Key** → Use as `clientSecret`
- **Redirect URI** → Configure (must match the one configured in Kommo)

### Step 3: Get Authorization Code or Refresh Token

**Option A: Authorization Code (First time)**
- In **"Keys and Scopes"**, look for **"Authorization code (valid for 20 minutes)"**
- Copy the code (starts with `def50`)
- Use it as `refreshToken` initially
- The system will automatically exchange it for permanent tokens

**Option B: Refresh Token (If you already have one)**
- If you've already exchanged before, use your `refreshToken`
- The system will use it to refresh the `accessToken` when it expires

**Option C: Long-lived Token (Testing only)**
- In **"Keys and Scopes"**, click **"Generate long-lived token"**
- Copy the generated token
- Use it as `accessToken` (testing only - tokens expire and don't auto-refresh)

---

## ⚙️ Configuration

### Configuration Schema

```typescript
import { kommoConfigSchema, type KommoConfig } from '@syncra/kommo-mcp';

const config: KommoConfig = {
  baseUrl: 'https://your-domain.kommo.com', // or https://your-domain.kommo.com/api/v4
  accessToken: 'your-oauth2-access-token',
};

// Validate configuration
const validated = kommoConfigSchema.parse(config);
```

### Base URL Format

- ✅ Correct: `https://your-domain.kommo.com`
- ✅ Correct: `https://your-domain.kommo.com/api/v4` (MCP will normalize)
- ❌ Incorrect: `https://your-domain.kommo.com/api/v4/` (trailing slash is fine, but not required)

**Note:** The MCP automatically normalizes the base URL to include `/api/v4` if needed.

### Configuration Properties

```typescript
type KommoConfig = {
  baseUrl: string;      // Kommo API base URL
  accessToken: string;  // OAuth 2.0 access token
};
```

---

## 🤖 Using as MCP Server (Claude Desktop)

To use this package as an MCP server in Claude Desktop or other MCP clients, add it to your configuration file.

### automatic Configuration (npx)

This is the easiest way to use the server without installing it globally.

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "kommo-crm": {
      "command": "npx",
      "args": [
        "-y",
        "@syncraengine/kommo-mcp"
      ],
      "env": {
        "KOMMO_BASE_URL": "https://your-domain.kommo.com",
        "KOMMO_ACCESS_TOKEN": "your-long-lived-token"
      }
    }
  }
}
```

### Manual Configuration (Source)

If you have cloned the repository locally:

```json
{
  "mcpServers": {
    "kommo-crm": {
      "command": "node",
      "args": [
        "C:/path/to/kommo-mcp/dist/cjs/bin/mcp-server.js"
      ],
      "env": {
        "KOMMO_BASE_URL": "https://your-domain.kommo.com",
        "KOMMO_ACCESS_TOKEN": "your-long-lived-token"
      }
    }
  }
}
```

---

## 🔄 Authentication Flow

### First Time (With Authorization Code)

1. Get the authorization code (`def50...`) from Kommo Settings
2. Configure it as `refreshToken` (temporary)
3. The system automatically:
   - Exchanges the code for `accessToken` and `refreshToken`
   - Saves tokens in memory
   - Uses the `accessToken` for requests

### Automatic Token Refresh

1. When the `accessToken` expires (or is about to expire)
2. The system automatically:
   - Uses the `refreshToken` to get a new `accessToken`
   - Updates tokens in memory
   - Continues using the new `accessToken`

**Note:** Token refresh must be handled by the consuming application. The MCP only uses the provided `accessToken`. The consuming application should implement refresh logic using the `refreshToken`.

---

## 📝 Usage Examples

### Basic Usage

```typescript
import { searchContactByPhone, type KommoConfig } from '@syncra/kommo-mcp';

const config: KommoConfig = {
  baseUrl: 'https://your-domain.kommo.com',
  accessToken: 'your-access-token',
};

const result = await searchContactByPhone(
  {
    phone: '+1234567890',
    name: 'John Doe', // optional
  },
  config
);

if (result.success) {
  console.log(`Found ${result.totalFound} contacts`);
  result.contacts.forEach(contact => {
    console.log(`Contact: ${contact.name} (ID: ${contact.id})`);
  });
}
```

### Error Handling

```typescript
const result = await searchContactByPhone(params, config);

if (!result.success) {
  console.error('Error:', result.error);
  // Handle error
  return;
}

// Use result safely
result.contacts.forEach(/* ... */);
```

---

## 🐛 Debugging

### Enable Debug Logging

Set the environment variable `KOMMO_DEBUG=true` to enable debug logging:

```bash
export KOMMO_DEBUG=true
```

This will log:
- Request URLs
- Request methods
- Request bodies (truncated)
- Response status codes

### Common Issues

#### 401 Unauthorized
- **Cause:** Invalid or expired access token
- **Solution:** Refresh the access token using your refresh token

#### 404 Not Found
- **Cause:** Invalid endpoint or resource doesn't exist
- **Solution:** Check the endpoint URL and resource ID

#### 500 Internal Server Error
- **Cause:** Kommo API error (may indicate duplicate links, invalid data, etc.)
- **Solution:** Check the request data and verify resource state

---

## ✅ Verification

To verify your configuration is correct, try a simple operation:

```typescript
import { listPipelines, type KommoConfig } from '@syncra/kommo-mcp';

const config: KommoConfig = {
  baseUrl: 'https://your-domain.kommo.com',
  accessToken: 'your-access-token',
};

const result = await listPipelines(config);

if (result.success) {
  console.log('✅ Configuration is correct!');
  console.log(`Found ${result.pipelines.length} pipelines`);
} else {
  console.error('❌ Configuration error:', result.error);
}
```

---

## 📚 References

- **Kommo API Documentation:** https://developers.kommo.com/reference/kommo-api-reference
- **Current Status:** See `docs/STATUS.md`
- **Roadmap:** See `docs/ROADMAP.md`
- **Known Issues:** See `docs/KNOWN_ISSUES.md`
- **Main README:** See `README.md`

---

**Last Updated:** 2026-01-12

# Kommo CRM MCP Server & SDK

> **Model Context Protocol (MCP)** server and TypeScript/JavaScript SDK for **Kommo CRM (formerly AmoCRM) API v4**.

[![npm version](https://img.shields.io/npm/v/@syncraengine/kommo-mcp)](https://www.npmjs.com/package/@syncraengine/kommo-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This package provides a dual-purpose solution:
1.  **MCP Server:** Connect Kommo CRM to AI agents like Claude Desktop, providing them with tools to manage Leads, Contacts, Companies, Tasks, and more.
2.  **SDK:** A type-safe, complete TypeScript SDK for interacting with the Kommo API v4 in your own applications.

---

## 🚀 Features

-   **Complete CRUD:** Full management of **Leads, Contacts, Companies, Deals, Tasks, and Notes**.
-   **Advanced Features:**
    -   Manage **Pipelines and Statuses** (read and write).
    -   Handle **Custom Fields** intelligently (search by name, metadata awareness, create/update).
    -   **Catalogs & Products** support (including linking products to leads).
    -   **Analytics & Intelligence:** Lead timeline, context summaries, status detection, pipeline stats, conversion rates.
    -   **Batch Operations:** Bulk create, update, and move leads efficiently.
    -   **Governance:** Account validation, missing fields detection.
    -   **Users & Roles:** User management and availability tracking.
    -   **Messaging:** Chat history, send messages, thread management.
-   **AI-Ready:** Designed with semantic tools optimized for LLM usage.
-   **Type-Safe:** Built with TypeScript and Zod for robust validation.
-   **Dual Build:** Supports both ESM (`import`) and CommonJS (`require`).

---

## 📦 Installation

```bash
npm install @syncraengine/kommo-mcp
```

---

## 🤖 Usage as MCP Server (Claude Desktop)

To use this with Claude Desktop or any MCP client, add the following configuration to your `claude_desktop_config.json` (Mac: `~/Library/Application Support/Claude/`, Windows: `%APPDATA%\Claude\`).

### Configuration

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
        "KOMMO_SUBDOMAIN": "your-subdomain",
        "KOMMO_ACCESS_TOKEN": "your-long-lived-access-token"
      }
    }
  }
}
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `KOMMO_ACCESS_TOKEN` | OAuth 2.0 Access Token (Long-lived recommended for MCP) | ✅ Yes |
| `KOMMO_SUBDOMAIN` | Your Kommo subdomain (e.g., `mycompany` for `mycompany.kommo.com`) | ✅ Yes (or BASE_URL) |
| `KOMMO_BASE_URL` | Full URL (e.g., `https://mycompany.kommo.com`) | Optional |

---

## 📚 Usage as Library (SDK)

You can use the exported functions directly in your TypeScript/Node.js projects.

```typescript
import { 
  searchContactByPhone, 
  createLead, 
  getKommoConfig,
  type KommoConfig 
} from '@syncraengine/kommo-mcp';

// 1. Configure
const config: KommoConfig = {
  baseUrl: 'https://your-subdomain.kommo.com',
  accessToken: process.env.KOMMO_ACCESS_TOKEN!
};

// 2. Use functions
async function main() {
  // Search for a contact
  const searchResult = await searchContactByPhone({ phone: '+1234567890' }, config);
  
  if (searchResult.success && searchResult.contacts.length > 0) {
    const contact = searchResult.contacts[0];
    console.log(`Found contact: ${contact.name}`);
    
    // Create a lead for this contact
    const leadResult = await createLead({
      name: 'New Deal from Website',
      price: 500,
      _embedded: {
        contacts: [{ id: contact.id }]
      }
    }, config);
    
    console.log('Lead created:', leadResult);
  }
}

main();
```

---

## 🛠️ Available Tools (MCP)

The server exposes **66 tools** to the AI, covering:

*   **Contacts:** `kommo_search_contact_by_phone`, `kommo_create_contact`, `kommo_update_contact`, `kommo_list_contacts`, etc.
*   **Leads:** `kommo_list_leads`, `kommo_create_lead`, `kommo_update_lead`, `kommo_update_lead_custom_fields`, etc.
*   **Companies:** `kommo_search_company`, `kommo_create_company`, `kommo_update_company`, `kommo_list_companies`.
*   **Deals:** `kommo_list_deals`, `kommo_create_deal`, `kommo_update_deal`, `kommo_search_deal`.
*   **Tasks:** `kommo_list_tasks`, `kommo_create_task`, `kommo_update_task`, `kommo_get_task`.
*   **Notes:** `kommo_list_notes`, `kommo_create_note`, `kommo_get_note`, `kommo_update_note`.
*   **Pipelines:** `kommo_list_pipelines`, `kommo_get_pipeline_statuses`, `kommo_create_pipeline`, `kommo_update_pipeline`, `kommo_create_status`, `kommo_update_status`.
*   **Products:** `kommo_list_catalogs`, `kommo_list_catalog_elements`, `kommo_link_product_to_lead`, `kommo_unlink_product_from_lead`.
*   **Analytics & Intelligence:** `kommo_get_lead_timeline`, `kommo_get_lead_context_summary`, `kommo_detect_lead_status`, `kommo_find_inactive_leads`, `kommo_get_pipeline_stats`, `kommo_get_conversion_rates`, `kommo_get_user_performance`.
*   **Batch Operations:** `kommo_bulk_create_leads`, `kommo_bulk_update_leads`, `kommo_bulk_move_leads`.
*   **Governance:** `kommo_validate_account_setup`, `kommo_check_missing_fields`.
*   **Users:** `kommo_list_users`, `kommo_get_user`, `kommo_list_roles`, `kommo_get_user_availability`.
*   **Custom Fields:** `kommo_create_custom_field`, `kommo_update_custom_field`, `kommo_get_select_field_options`.
*   **Messaging:** `kommo_chat_send_message`, `kommo_chat_get_history`, `kommo_chat_upsert_thread`.

---

## 👨‍💻 Development

If you want to contribute or modify the package:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/syncraengine/kommo-mcp.git
    cd kommo-mcp
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Build:**
    ```bash
    npm run build
    ```
    This generates both ESM (`dist/esm`) and CommonJS (`dist/cjs`) builds.

4.  **Test locally (MCP):**
    You can use the [MCP Inspector](https://github.com/modelcontextprotocol/inspector) to test the server.
    ```bash
    npx @modelcontextprotocol/inspector npx tsx src/bin/mcp-server.ts
    ```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by [Eduardo Mendez](https://github.com/E0DUAR/kommo-mcp)

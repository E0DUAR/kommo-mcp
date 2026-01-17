# Kommo CRM MCP - Best Practices

> **Last Updated:** 2026-01-12  
> **Purpose:** Best practices and patterns for using the Kommo CRM MCP

---

## Configuration

### Validate Configuration

Always validate configuration with the schema before using:

```typescript
import { kommoConfigSchema, type KommoConfig } from '@syncraengine/kommo-mcp';

const config: KommoConfig = {
  baseUrl: 'https://your-domain.kommo.com',
  accessToken: 'your-token',
};

const validated = kommoConfigSchema.parse(config);
```

### Base URL Format

The MCP automatically normalizes base URLs. You can provide:
- `https://your-domain.kommo.com` (preferred)
- `https://your-domain.kommo.com/api/v4` (also works)

The `/api/v4` path is automatically added if missing.

---

## Error Handling

### Always Check Success

All functions return a result object with a `success` boolean:

```typescript
const result = await searchContactByPhone(params, config);

if (!result.success) {
  console.error('Error:', result.error);
  return;
}

// Use result safely
result.contacts.forEach(contact => {
  // Process contact
});
```

### Common Error Scenarios

- **401 Unauthorized**: Invalid or expired access token
- **404 Not Found**: Resource doesn't exist or endpoint is incorrect
- **500 Internal Server Error**: Often indicates duplicate links or invalid data
- **Rate Limiting**: Kommo API may throttle requests

---

## Linking Entities

### Use Embedded Links When Creating

When creating entities, prefer using `_embedded` to link related entities:

```typescript
// Preferred: Link when creating
const lead = await createLead({
  name: 'New Lead',
  pipeline_id: 123,
  _embedded: {
    contacts: [{ id: contactId }]
  }
}, config);

// Less efficient: Create then link
const lead = await createLead({ name: 'New Lead' }, config);
await linkLeadToContact(lead.id, contactId, config);
```

Linking functions automatically verify existing links before creating, but using `_embedded` is more efficient.

### Link Verification

All linking functions (`linkLeadToContact`, `linkContactToCompany`, etc.) verify existing links before creating new ones. This ensures deterministic behavior and prevents duplicate links.

---

## 🧠 MCP Prompt Engineering

When using this tool with an AI assistant (like Claude), use these patterns for best results.

### Complex Workflows

Instead of asking for single actions, describe the goal and let the AI chain the tools.

**Example Prompt:**
> "Find the contact with email 'alice@example.com'. If she exists, create a new deal for her called 'Enterprise License' in the 'Sales' pipeline with a value of 5000. Also add a note to the deal saying 'Customer interested in Q3 deployment'."

**The AI will:**
1. Call `kommo_search_contact` to find the ID.
2. Call `kommo_create_deal` using the contact ID in `_embedded`.
3. Call `kommo_create_note` using the new deal ID.

### Context Retrieval

Before making updates, ask the AI to fetch the current state.

**Example Prompt:**
> "Get the details for Deal #12345, including its associated contacts. Then, update the deal status to 'Negotiation' and add a task for the primary contact to 'Follow up on contract'.

### Data Formatting

The AI is aware of the schemas. You can provide unstructured data and it will map it correctly.

**Example Prompt:**
> "Create a new lead for 'TechCorp'. It's a hot lead, value around 10k. The contact person is John Doe (john@techcorp.com, +15550199)."

---

## Pagination

### Use Pagination for Large Datasets

The Kommo API limits results to 250 items per page. Use pagination for large datasets:

```typescript
let page = 1;
const allLeads = [];

while (true) {
  const result = await listLeads({ page, limit: 250 }, config);
  
  if (!result.success || result.leads.length === 0) {
    break;
  }
  
  allLeads.push(...result.leads);
  
  if (result.leads.length < 250) {
    break; // Last page
  }
  
  page++;
}
```

### Pagination Helpers

Use the `normalizePagination` utility for consistent pagination handling:

```typescript
import { normalizePagination } from '@syncraengine/kommo-mcp';

const pagination = normalizePagination({ page: 1, limit: 50 });
// Returns normalized page and limit values
```

---

## Notes API

### Entity-Scoped Notes

In Kommo API v4, notes are always scoped to an entity type. You must specify `entityType` when creating, reading, or updating notes:

```typescript
// Create note for a contact
await createNote({
  text: 'Customer called about pricing',
  entityType: 'contacts',
  entityId: contactId
}, config);

// List notes for a contact
const notes = await listNotes({
  entityType: 'contacts',
  entity_id: contactId
}, config);

// Get specific note
const note = await getNote({
  noteId: noteId,
  entityType: 'contacts'
}, config);
```

### Note Type Field

The `note_type` field is optional. If not provided, Kommo uses its default value. You don't need to specify it unless you want a specific type.

---

## Custom Fields

### Working with Custom Fields

Custom fields can be accessed by ID or by name (for leads):

```typescript
// Get custom fields with values
const fields = await getLeadCustomFields(leadId, config);

// Search for a specific field by name or ID
const field = await searchLeadCustomField(leadId, 'Field Name', config);

// Update custom fields using names (automatic ID mapping)
await updateLeadCustomFields(leadId, {
  'Field Name': 'New Value'
}, config);
```

### Select Fields

For select fields, use `getSelectFieldOptions` to get valid options:

```typescript
const options = await getSelectFieldOptions(leadId, fieldId, config);
// Returns array of valid enum_id values
```

---

## Performance Considerations

### Batch Operations

When possible, batch operations are more efficient:

```typescript
// Create multiple entities in a single request when supported
// Use _embedded to link multiple related entities at creation time
```

### Caching

Consider caching frequently accessed data (pipelines, custom field metadata) to reduce API calls.

### Rate Limiting

Be aware of Kommo API rate limits. Implement appropriate delays or request throttling for bulk operations.

---

## Type Safety

### Use TypeScript Types

All functions are fully typed. Use TypeScript types for better IDE support and error checking:

```typescript
import type { KommoContact, KommoLead } from '@syncraengine/kommo-mcp';

function processContact(contact: KommoContact) {
  // Type-safe access to contact properties
  console.log(contact.name, contact.id);
}
```

### Zod Validation

All input parameters are validated with Zod schemas. Invalid input will throw validation errors before making API requests.

---

## Debugging

### Enable Debug Logging

Set the `KOMMO_DEBUG` environment variable to enable detailed logging:

```bash
export KOMMO_DEBUG=true
```

This will log:
- Request URLs
- HTTP methods
- Request bodies (truncated)
- Response status codes

### Common Issues

- **Pipeline filter not working**: The `pipeline_id` filter may not work correctly. Filter results client-side if needed.
- **HTML responses on errors**: Some errors return HTML instead of JSON. The client handles this gracefully.
- **404 on notes endpoints**: Remember that notes are entity-scoped. Use the correct endpoint format.

---

## Architecture Principles

### MCP Isolation

This MCP is designed to be completely isolated:
- No dependencies on parent codebase
- Configuration injected via parameters
- Ready for extraction to standalone package

### Semantic Actions

Future versions will provide semantic actions (e.g., `registerNewOpportunity()`) in addition to raw API wrappers, optimized for AI consumption.

---

## References

- **Setup Guide**: See `docs/guides/SETUP.md`
- **Known Issues**: See `docs/reference/KNOWN_ISSUES.md`
- **Context Template**: See `docs/templates/CONTEXT_TEMPLATE.md`
- **Kommo API Docs**: https://developers.kommo.com/reference/kommo-api-reference

---

**Last Updated:** 2026-01-12

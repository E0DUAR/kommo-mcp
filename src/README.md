# Kommo CRM MCP

A comprehensive, isolated MCP (Model Context Protocol) client for Kommo CRM API v4.

## Features

- **Complete API Coverage**: All major entities (Contacts, Leads, Companies, Deals, Tasks, Notes, Pipelines, Catalogs, Products)
- **Full CRUD Operations**: Read and write operations for all entities
- **Advanced Lead Features**: Custom field editing, select fields with metadata, product management
- **Type-Safe**: Built with TypeScript and Zod validation
- **MCP Isolation**: Zero dependencies on parent codebase - ready for extraction
- **Well Documented**: Comprehensive JSDoc and examples
- **83+ Functions**: Complete implementation covering all major use cases

## Installation

This module is currently part of the Syncra Engine codebase, but is designed to be extracted to a standalone package.

```bash
# Future: npm install @syncra/kommo-mcp
```

## Configuration

You need OAuth 2.0 credentials from Kommo:

```typescript
import { kommoConfigSchema, type KommoConfig } from '@syncra/kommo-mcp';

const config: KommoConfig = {
  baseUrl: 'https://your-domain.kommo.com', // or https://your-domain.kommo.com/api/v4
  accessToken: 'your-oauth2-access-token',
};

// Validate configuration
const validated = kommoConfigSchema.parse(config);
```

## Quick Start

### Search for a Contact

```typescript
import { searchContactByPhone, type KommoConfig } from '@syncra/kommo-mcp';

const result = await searchContactByPhone(
  {
    phone: '+573001234567',
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

### Create a Contact

```typescript
import { createContact, type KommoConfig } from '@syncra/kommo-mcp';

const result = await createContact(
  {
    name: 'John Doe',
    first_name: 'John',
    last_name: 'Doe',
    custom_fields_values: [
      {
        field_id: 123,
        values: [{ value: '+573001234567' }],
      },
    ],
  },
  config
);

if (result.success && result.contact) {
  console.log(`Created contact with ID: ${result.contact.id}`);
}
```

### List Leads with Filters

```typescript
import { listLeads, type KommoConfig } from '@syncra/kommo-mcp';

const result = await listLeads(
  {
    status_id: 142, // Filter by status
    responsible_user_id: 123, // Filter by user
    page: 1,
    limit: 50,
  },
  config
);

if (result.success) {
  console.log(`Found ${result.totalFound} leads`);
  result.leads.forEach(lead => {
    console.log(`Lead: ${lead.name} (Status: ${lead.status_id})`);
  });
}
```

## API Reference

### Contacts

#### Read Operations

- `searchContactByPhone(params, config)` - Search by phone number
- `searchContactByEmail(params, config)` - Search by email
- `getContact(params, config)` - Get by ID
- `listContacts(filters, config)` - List with filters
- `getContactCustomFields(contactId, config)` - Get custom fields

#### Write Operations

- `createContact(data, config)` - Create new contact
- `updateContact(contactId, data, config)` - Update contact
- `linkContactToCompany(contactId, companyId, config)` - Link to company

### Leads

#### Read Operations

- `searchLead(params, config)` - Search leads
- `getLead(params, config)` - Get by ID
- `listLeads(filters, config)` - List with filters
- `getLeadsByContact(contactId, config)` - Get leads for a contact
- `getLeadCustomFields(leadId, config)` - Get custom fields with values
- `searchLeadCustomField(leadId, fieldNameOrId, config)` - Search custom field by name or ID
- `getLeadCustomFieldsMetadata(leadId, config)` - Get all custom field definitions
- `getSelectFieldOptions(leadId, fieldId, config)` - Get options for select fields
- `getLeadProducts(leadId, config)` - Get products installed in a lead

#### Write Operations

- `createLead(data, config)` - Create new lead
- `updateLead(leadId, data, config)` - Update lead
- `updateLeadStatus(leadId, statusId, config)` - Update status
- `updateLeadCustomFields(leadId, fields, config)` - Update custom fields by name
- `linkLeadToContact(leadId, contactId, config)` - Link to contact (verifies existing links)
- `linkProductToLead(leadId, productId, config)` - Install product in lead (verifies existing links)
- `unlinkProductFromLead(leadId, productId, config)` - Uninstall product from lead

### Companies

#### Read Operations

- `searchCompany(params, config)` - Search companies
- `getCompany(params, config)` - Get by ID
- `listCompanies(filters, config)` - List with filters
- `searchCompanyByDomain(domain, config)` - Search by domain

#### Write Operations

- `createCompany(data, config)` - Create new company
- `updateCompany(companyId, data, config)` - Update company

### Deals

#### Read Operations

- `searchDeal(params, config)` - Search deals
- `getDeal(params, config)` - Get by ID
- `listDeals(filters, config)` - List with filters
- `getDealsByContact(contactId, config)` - Get deals for a contact
- `getDealsByCompany(companyId, config)` - Get deals for a company

#### Write Operations

- `createDeal(data, config)` - Create new deal
- `updateDeal(dealId, data, config)` - Update deal
- `updateDealStage(dealId, stageId, config)` - Update stage
- `linkDealToContact(dealId, contactId, config)` - Link to contact
- `linkDealToCompany(dealId, companyId, config)` - Link to company

### Tasks

#### Read Operations

- `getTask(params, config)` - Get by ID
- `listTasks(filters, config)` - List with filters
- `getTasksByContact(contactId, config)` - Get tasks for a contact
- `getTasksByLead(leadId, config)` - Get tasks for a lead
- `getTasksByDeal(dealId, config)` - Get tasks for a deal

#### Write Operations

- `createTask(data, config)` - Create new task
- `updateTask(taskId, data, config)` - Update task
- `completeTask(taskId, config)` - Complete task
- `linkTaskToContact(taskId, contactId, config)` - Link to contact
- `linkTaskToLead(taskId, leadId, config)` - Link to lead
- `linkTaskToDeal(taskId, dealId, config)` - Link to deal

### Notes

#### Read Operations

- `getNote(params, config)` - Get by ID (requires `noteId` and `entityType` in params)
- `listNotes(filters, config)` - List with filters (requires `entityType` in filters)
- `getNotesByContact(contactId, config)` - Get notes for a contact
- `getNotesByLead(leadId, config)` - Get notes for a lead
- `getNotesByDeal(dealId, config)` - Get notes for a deal

#### Write Operations

- `createNote(data, config)` - Create new note (requires `text`, `entityType`, and `entityId` in data)
- `updateNote(data, config)` - Update note (requires `noteId` and `entityType` in data)
- `linkNoteToContact(noteId, contactId, config)` - ⚠️ Deprecated: Notes cannot be linked after creation in v4
- `linkNoteToLead(noteId, leadId, config)` - ⚠️ Deprecated: Notes cannot be linked after creation in v4
- `linkNoteToDeal(noteId, dealId, config)` - ⚠️ Deprecated: Notes cannot be linked after creation in v4

**Note:** In Kommo API v4, notes are always scoped to an entity type (leads, contacts, companies). 
You must specify the entity type when creating, reading, or updating notes.

### Pipelines

#### Read Operations

- `listPipelines(config)` - List all pipelines
- `getPipeline(params, config)` - Get pipeline by ID
- `searchPipelineByName(params, config)` - Search pipelines by name
- `getPipelineStatuses(params, config)` - Get all stages of a pipeline

**Note:** Pipelines are read-only. Writing operations are planned for Phase 3.

### Catalogs

#### Read Operations

- `listCatalogs(config)` - List all catalogs
- `getCatalog(params, config)` - Get catalog by ID
- `searchCatalog(params, config)` - Search catalog by name/type
- `getCatalogCustomFields(params, config)` - Get catalog custom fields

**Note:** Catalogs are read-only. Writing operations are planned for Phase 3.

### Catalog Elements (Products)

#### Read Operations

- `listCatalogElements(params, config)` - List products in a catalog
- `getCatalogElement(params, config)` - Get product by ID
- `searchCatalogElement(params, config)` - Search product by name

#### Write Operations

- `createCatalogElement(catalogId, data, config)` - Create new product
- `updateCatalogElement(catalogId, productId, data, config)` - Update product

## Error Handling

All operations return a result object with a `success` boolean:

```typescript
const result = await searchContactByPhone(params, config);

if (!result.success) {
  console.error('Error:', result.error);
  return;
}

// Use result.contacts safely
result.contacts.forEach(/* ... */);
```

## Architecture

This MCP follows strict isolation rules:

- **No dependencies** on parent codebase (`src/core/`, `src/features/`)
- **Configuration injection** - Config passed as parameters (no env imports)
- **Modular structure** - Each entity in its own directory
- **Type-safe** - Full TypeScript support with Zod validation

### Structure

```
kommo-crm/
├── index.ts              # Main exports
├── types.ts              # Shared types
├── client.ts             # HTTP client
├── utils/                # Utilities (formatters, pagination)
└── entities/
    ├── contacts/
    │   ├── read.ts
    │   ├── write.ts
    │   ├── types.ts
    │   └── formatters.ts
    ├── leads/
    ├── companies/
    ├── deals/
    ├── tasks/
    └── notes/
```

## Best Practices

1. **Validate Configuration**: Always validate config with `kommoConfigSchema`
2. **Handle Errors**: Check `success` field in all results
3. **Use Pagination**: Use `list*` functions with pagination for large datasets
4. **Type Safety**: Use TypeScript types for all operations
5. **Error Messages**: Provide meaningful error messages to users

## Limitations

- API v4 only (no support for older versions)
- Maximum 250 items per page (Kommo API limit)
- Requires valid OAuth 2.0 access token
- Some endpoints may return HTML on errors (handled gracefully)
- Pipeline filter may not work correctly (filter client-side when needed)

## Documentation

For detailed documentation, see the `docs/` directory:

- **Status & Current Phase**: See `docs/STATUS.md`
- **Roadmap**: See `docs/ROADMAP.md`
- **Setup Guide**: See `docs/SETUP.md`
- **Best Practices**: See `docs/BEST_PRACTICES.md`
- **Known Issues**: See `docs/KNOWN_ISSUES.md`
- **Context Template**: See `docs/CONTEXT_TEMPLATE.md` (for project-specific context)

## Current Status

**Phase 1: MVP + AI Ready** - ✅ **COMPLETED**

- ✅ Complete CRUD for 7 base entities
- ✅ Pipelines (read-only)
- ✅ Catalogs (read-only)
- ✅ Products (complete CRUD)
- ✅ Advanced lead editing (custom fields, select fields)
- ✅ Product installation in leads
- ✅ OAuth 2.0 working
- ✅ 83+ functions implemented

See `docs/STATUS.md` for detailed status information.

## License

[To be determined - part of Syncra Engine]

## Contributing

[Future: When extracted to standalone package]

## Support

For issues related to:
- **Kommo API**: See [Kommo API Documentation](https://developers.kommo.com/reference/kommo-api-reference)
- **This MCP**: See `docs/KNOWN_ISSUES.md` for resolved issues and solutions
- **Setup Help**: See `docs/SETUP.md` for configuration guide

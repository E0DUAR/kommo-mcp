import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { 
  ListToolsRequestSchema, 
  CallToolRequestSchema 
} from '@modelcontextprotocol/sdk/types.js';
import { getKommoConfig } from './config.js';
import * as handlers from './handlers.js';

/**
 * Register all Kommo tools with the MCP server.
 */
export function registerKommoTools(server: Server): void {
  // Contacts
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'kommo_search_contact_by_phone',
          description: 'Search for contacts by phone number',
          inputSchema: {
            type: 'object',
            properties: {
              phone: { type: 'string', description: 'Phone number' },
              name: { type: 'string', description: 'Optional: Name' },
            },
            required: ['phone'],
          },
        },
        {
          name: 'kommo_search_contact_by_email',
          description: 'Search for contacts by email',
          inputSchema: {
            type: 'object',
            properties: {
              email: { type: 'string', description: 'Email address' },
            },
            required: ['email'],
          },
        },
        {
          name: 'kommo_get_contact',
          description: 'Get a contact by ID',
          inputSchema: {
            type: 'object',
            properties: {
              contactId: { type: 'number', description: 'Contact ID' },
            },
            required: ['contactId'],
          },
        },
        {
          name: 'kommo_create_contact',
          description: 'Create a new contact',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Contact name' },
              first_name: { type: 'string' },
              last_name: { type: 'string' },
              responsible_user_id: { type: 'number' },
            },
            required: ['name'],
          },
        },
        {
          name: 'kommo_list_leads',
          description: 'List leads with filters',
          inputSchema: {
            type: 'object',
            properties: {
              status_id: { type: 'number' },
              pipeline_id: { type: 'number' },
              responsible_user_id: { type: 'number' },
              page: { type: 'number' },
              limit: { type: 'number' },
            },
          },
        },
        {
          name: 'kommo_get_lead',
          description: 'Get a lead by ID',
          inputSchema: {
            type: 'object',
            properties: {
              leadId: { type: 'number' },
            },
            required: ['leadId'],
          },
        },
        {
          name: 'kommo_create_lead',
          description: 'Create a new lead',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              price: { type: 'number' },
              status_id: { type: 'number' },
              pipeline_id: { type: 'number' },
            },
          },
        },
        {
          name: 'kommo_update_lead',
          description: 'Update an existing lead',
          inputSchema: {
            type: 'object',
            properties: {
              leadId: { type: 'number' },
              name: { type: 'string' },
              price: { type: 'number' },
              status_id: { type: 'number' },
            },
            required: ['leadId'],
          },
        },
        {
          name: 'kommo_search_lead',
          description: 'Search for leads by query',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string' },
              pipeline_id: { type: 'number' },
            },
            required: ['query'],
          },
        },
        {
          name: 'kommo_list_pipelines',
          description: 'List all pipelines',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'kommo_create_task',
          description: 'Create a new task',
          inputSchema: {
            type: 'object',
            properties: {
              text: { type: 'string' },
              complete_till: { type: 'number', description: 'Unix timestamp' },
              entity_id: { type: 'number' },
              entity_type: { type: 'string', enum: ['leads', 'contacts', 'companies'] },
            },
            required: ['text', 'complete_till', 'entity_id', 'entity_type'],
          },
        },
        {
          name: 'kommo_update_lead_custom_fields',
          description: 'Update lead custom fields by name',
          inputSchema: {
            type: 'object',
            properties: {
              leadId: { type: 'number' },
              fields: { type: 'object', description: 'Map of field name to value' },
            },
            required: ['leadId', 'fields'],
          },
        },
        {
          name: 'kommo_search_company',
          description: 'Search for companies by query',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string' },
            },
            required: ['query'],
          },
        },
        {
          name: 'kommo_get_company',
          description: 'Get a company by ID',
          inputSchema: {
            type: 'object',
            properties: {
              companyId: { type: 'number' },
            },
            required: ['companyId'],
          },
        },
        {
          name: 'kommo_list_companies',
          description: 'List all companies',
          inputSchema: {
            type: 'object',
            properties: {
              page: { type: 'number' },
              limit: { type: 'number' },
            },
          },
        },
        {
          name: 'kommo_create_company',
          description: 'Create a new company',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              responsible_user_id: { type: 'number' },
            },
            required: ['name'],
          },
        },
        {
          name: 'kommo_list_deals',
          description: 'List deals with filters',
          inputSchema: {
            type: 'object',
            properties: {
              page: { type: 'number' },
              limit: { type: 'number' },
              responsible_user_id: { type: 'number' },
            },
          },
        },
        {
          name: 'kommo_create_deal',
          description: 'Create a new deal',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              price: { type: 'number' },
              status_id: { type: 'number' },
              pipeline_id: { type: 'number' },
            },
            required: ['name'],
          },
        },
        {
          name: 'kommo_list_catalogs',
          description: 'List all catalogs (e.g., Products, Services)',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'kommo_list_catalog_elements',
          description: 'List elements (products) within a catalog',
          inputSchema: {
            type: 'object',
            properties: {
              catalog_id: { type: 'number' },
              page: { type: 'number' },
              limit: { type: 'number' },
            },
            required: ['catalog_id'],
          },
        },
        {
          name: 'kommo_link_product_to_lead',
          description: 'Link a product/catalog element to a lead',
          inputSchema: {
            type: 'object',
            properties: {
              leadId: { type: 'number' },
              productId: { type: 'number' },
              quantity: { type: 'number' },
            },
            required: ['leadId', 'productId'],
          },
        },
        {
          name: 'kommo_list_notes',
          description: 'List notes for a specific entity',
          inputSchema: {
            type: 'object',
            properties: {
              entityType: { type: 'string', enum: ['leads', 'contacts', 'companies'] },
              entityId: { type: 'number' },
              page: { type: 'number' },
              limit: { type: 'number' },
            },
            required: ['entityType'],
          },
        },
        {
          name: 'kommo_create_note',
          description: 'Create a new note for an entity',
          inputSchema: {
            type: 'object',
            properties: {
              entityType: { type: 'string', enum: ['leads', 'contacts', 'companies'] },
              entityId: { type: 'number' },
              text: { type: 'string' },
            },
            required: ['entityType', 'entityId', 'text'],
          },
        },
        {
          name: 'kommo_get_pipeline_statuses',
          description: 'Get all statuses (stages) for a specific pipeline',
          inputSchema: {
            type: 'object',
            properties: {
              pipelineId: { type: 'number' },
            },
            required: ['pipelineId'],
          },
        },
        {
          name: 'kommo_link_lead_to_contact',
          description: 'Link a lead to a contact',
          inputSchema: {
            type: 'object',
            properties: {
              leadId: { type: 'number' },
              contactId: { type: 'number' },
            },
            required: ['leadId', 'contactId'],
          },
        },
        {
          name: 'kommo_get_leads_by_contact',
          description: 'Get all leads associated with a contact',
          inputSchema: {
            type: 'object',
            properties: {
              contactId: { type: 'number' },
            },
            required: ['contactId'],
          },
        },
        {
          name: 'kommo_unlink_product_from_lead',
          description: 'Unlink a product/catalog element from a lead',
          inputSchema: {
            type: 'object',
            properties: {
              leadId: { type: 'number' },
              productId: { type: 'number' },
            },
            required: ['leadId', 'productId'],
          },
        },
        {
          name: 'kommo_get_select_field_options',
          description: 'Get valid options for a select/dropdown custom field',
          inputSchema: {
            type: 'object',
            properties: {
              leadId: { type: 'number' },
              fieldId: { type: 'number' },
            },
            required: ['leadId', 'fieldId'],
          },
        },
        {
          name: 'kommo_list_contacts',
          description: 'List contacts with filters',
          inputSchema: {
            type: 'object',
            properties: {
              page: { type: 'number' },
              limit: { type: 'number' },
              query: { type: 'string' },
              responsible_user_id: { type: 'number' },
            },
          },
        },
        {
          name: 'kommo_update_contact',
          description: 'Update an existing contact',
          inputSchema: {
            type: 'object',
            properties: {
              contactId: { type: 'number' },
              name: { type: 'string' },
              first_name: { type: 'string' },
              last_name: { type: 'string' },
            },
            required: ['contactId'],
          },
        },
        {
          name: 'kommo_update_company',
          description: 'Update an existing company',
          inputSchema: {
            type: 'object',
            properties: {
              companyId: { type: 'number' },
              name: { type: 'string' },
              responsible_user_id: { type: 'number' },
            },
            required: ['companyId'],
          },
        },
        {
          name: 'kommo_search_deal',
          description: 'Search for deals by query',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string' },
            },
            required: ['query'],
          },
        },
        {
          name: 'kommo_get_deal',
          description: 'Get a deal by ID',
          inputSchema: {
            type: 'object',
            properties: {
              dealId: { type: 'number' },
            },
            required: ['dealId'],
          },
        },
        {
          name: 'kommo_update_deal',
          description: 'Update an existing deal',
          inputSchema: {
            type: 'object',
            properties: {
              dealId: { type: 'number' },
              name: { type: 'string' },
              price: { type: 'number' },
              status_id: { type: 'number' },
            },
            required: ['dealId'],
          },
        },
        {
          name: 'kommo_list_tasks',
          description: 'List tasks with filters',
          inputSchema: {
            type: 'object',
            properties: {
              entity_type: { type: 'string', enum: ['leads', 'contacts', 'companies'] },
              entity_id: { type: 'number' },
              is_completed: { type: 'boolean' },
            },
          },
        },
        {
          name: 'kommo_get_task',
          description: 'Get a task by ID',
          inputSchema: {
            type: 'object',
            properties: {
              taskId: { type: 'number' },
            },
            required: ['taskId'],
          },
        },
        {
          name: 'kommo_update_task',
          description: 'Update an existing task',
          inputSchema: {
            type: 'object',
            properties: {
              taskId: { type: 'number' },
              text: { type: 'string' },
              is_completed: { type: 'boolean' },
            },
            required: ['taskId'],
          },
        },
        {
          name: 'kommo_get_note',
          description: 'Get a specific note',
          inputSchema: {
            type: 'object',
            properties: {
              noteId: { type: 'number' },
              entityType: { type: 'string', enum: ['leads', 'contacts', 'companies'] },
            },
            required: ['noteId', 'entityType'],
          },
        },
        {
          name: 'kommo_update_note',
          description: 'Update an existing note',
          inputSchema: {
            type: 'object',
            properties: {
              noteId: { type: 'number' },
              entityType: { type: 'string', enum: ['leads', 'contacts', 'companies'] },
              text: { type: 'string' },
            },
            required: ['noteId', 'entityType', 'text'],
          },
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const config = getKommoConfig();

    switch (name) {
      case 'kommo_search_contact_by_phone':
        return await handlers.handleSearchContactByPhone(args as any, config);
      case 'kommo_search_contact_by_email':
        return await handlers.handleSearchContactByEmail(args as any, config);
      case 'kommo_get_contact':
        return await handlers.handleGetContact(args as any, config);
      case 'kommo_create_contact':
        return await handlers.handleCreateContact(args as any, config);
      case 'kommo_list_leads':
        return await handlers.handleListLeads(args as any, config);
      case 'kommo_get_lead':
        return await handlers.handleGetLead(args as any, config);
      case 'kommo_create_lead':
        return await handlers.handleCreateLead(args as any, config);
      case 'kommo_update_lead':
        return await handlers.handleUpdateLead(args as any, config);
      case 'kommo_search_lead':
        return await handlers.handleSearchLead(args as any, config);
      case 'kommo_list_pipelines':
        return await handlers.handleListPipelines(config);
      case 'kommo_create_task':
        return await handlers.handleCreateTask(args as any, config);
      case 'kommo_update_lead_custom_fields':
        return await handlers.handleUpdateLeadCustomFields(args as any, config);
      case 'kommo_search_company':
        return await handlers.handleSearchCompany(args as any, config);
      case 'kommo_get_company':
        return await handlers.handleGetCompany(args as any, config);
      case 'kommo_list_companies':
        return await handlers.handleListCompanies(args as any, config);
      case 'kommo_create_company':
        return await handlers.handleCreateCompany(args as any, config);
      case 'kommo_list_deals':
        return await handlers.handleListDeals(args as any, config);
      case 'kommo_create_deal':
        return await handlers.handleCreateDeal(args as any, config);
      case 'kommo_list_catalogs':
        return await handlers.handleListCatalogs(config);
      case 'kommo_list_catalog_elements':
        return await handlers.handleListCatalogElements(args as any, config);
      case 'kommo_link_product_to_lead':
        return await handlers.handleLinkProductToLead(args as any, config);
      case 'kommo_list_notes':
        return await handlers.handleListNotes(args as any, config);
      case 'kommo_create_note':
        return await handlers.handleCreateNote(args as any, config);
      case 'kommo_get_pipeline_statuses':
        return await handlers.handleGetPipelineStatuses(args as any, config);
      case 'kommo_link_lead_to_contact':
        return await handlers.handleLinkLeadToContact(args as any, config);
      case 'kommo_get_leads_by_contact':
        return await handlers.handleGetLeadsByContact(args as any, config);
      case 'kommo_unlink_product_from_lead':
        return await handlers.handleUnlinkProductFromLead(args as any, config);
      case 'kommo_get_select_field_options':
        return await handlers.handleGetSelectFieldOptions(args as any, config);
      case 'kommo_list_contacts':
        return await handlers.handleListContacts(args as any, config);
      case 'kommo_update_contact':
        return await handlers.handleUpdateContact(args as any, config);
      case 'kommo_update_company':
        return await handlers.handleUpdateCompany(args as any, config);
      case 'kommo_search_deal':
        return await handlers.handleSearchDeal(args as any, config);
      case 'kommo_get_deal':
        return await handlers.handleGetDeal(args as any, config);
      case 'kommo_update_deal':
        return await handlers.handleUpdateDeal(args as any, config);
      case 'kommo_list_tasks':
        return await handlers.handleListTasks(args as any, config);
      case 'kommo_get_task':
        return await handlers.handleGetTask(args as any, config);
      case 'kommo_update_task':
        return await handlers.handleUpdateTask(args as any, config);
      case 'kommo_get_note':
        return await handlers.handleGetNote(args as any, config);
      case 'kommo_update_note':
        return await handlers.handleUpdateNote(args as any, config);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });
}
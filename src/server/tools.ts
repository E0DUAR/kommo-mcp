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
    const config = getKommoConfig();
    const tools: any[] = [
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
              pipeline_id: { type: 'number' },
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
          description: 'Get all statuses (stages) for a specific pipeline. IMPORTANT: Use this to find a valid status_id before moving a lead to a different pipeline.',
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
              pipeline_id: { type: 'number' },
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

        {
          name: 'kommo_get_lead_timeline',
          description: 'Get a chronological timeline of all lead activity (notes, tasks, history)',
          inputSchema: {
            type: 'object',
            properties: {
              leadId: { type: 'number' },
            },
            required: ['leadId'],
          },
        },
        {
          name: 'kommo_get_lead_context_summary',
          description: 'Get a structured summary of the lead for AI context (status, interactions, next steps)',
          inputSchema: {
            type: 'object',
            properties: {
              leadId: { type: 'number' },
            },
            required: ['leadId'],
          },
        },
        {
          name: 'kommo_detect_lead_status',
          description: 'Detect the semantic status of a lead (active, drifting, cold, closed) based on activity',
          inputSchema: {
            type: 'object',
            properties: {
              leadId: { type: 'number' },
            },
            required: ['leadId'],
          },
        },
        {
          name: 'kommo_find_inactive_leads',
          description: 'Find leads that have been inactive for a certain number of days',
          inputSchema: {
            type: 'object',
            properties: {
              days: { type: 'number' },
            },
            required: ['days'],
          },
        },
        {
          name: 'kommo_bulk_create_leads',
          description: 'Bulk create leads in a single request',
          inputSchema: {
            type: 'object',
            properties: {
              leads: {
                type: 'array',
                items: { type: 'object' } // Simplified schema, relying on validation in handler
              },
            },
            required: ['leads'],
          },
        },
        {
          name: 'kommo_bulk_update_leads',
          description: 'Bulk update leads in a single request',
          inputSchema: {
            type: 'object',
            properties: {
              updates: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['id']
                }
              },
            },
            required: ['updates'],
          },
        },
        {
          name: 'kommo_bulk_move_leads',
          description: 'Bulk move leads to a specific status',
          inputSchema: {
            type: 'object',
            properties: {
              leadIds: {
                type: 'array',
                items: { type: 'number' }
              },
              statusId: { type: 'number' },
              pipelineId: { type: 'number' },
            },
            required: ['leadIds', 'statusId'],
          },
        },
        {
          name: 'kommo_assign_lead_to_user',
          description: 'Assign a lead to a specific user (semantic wrapper)',
          inputSchema: {
            type: 'object',
            properties: {
              leadId: { type: 'number' },
              userId: { type: 'number' },
            },
            required: ['leadId', 'userId'],
          },
        },
        {
          name: 'kommo_get_pipeline_stats',
          description: 'Get general statistics for a pipeline or all pipelines',
          inputSchema: {
            type: 'object',
            properties: {
              pipelineId: { type: 'number' },
              dateRange: {
                type: 'object',
                properties: {
                  from: { type: 'number' },
                  to: { type: 'number' },
                },
              },
            },
          },
        },
        {
          name: 'kommo_get_conversion_rates',
          description: 'Get conversion rates between stages for a pipeline',
          inputSchema: {
            type: 'object',
            properties: {
              pipelineId: { type: 'number' },
            },
            required: ['pipelineId'],
          },
        },
        {
          name: 'kommo_get_lost_reasons_stats',
          description: 'Analyze reasons for lost leads (Placeholder for Phase 3)',
          inputSchema: {
            type: 'object',
            properties: {
              pipelineId: { type: 'number' },
            },
            required: ['pipelineId'],
          },
        },
        {
          name: 'kommo_get_user_performance',
          description: 'Get performance metrics for a specific user',
          inputSchema: {
            type: 'object',
            properties: {
              userId: { type: 'number' },
            },
            required: ['userId'],
          },
        },
        // Phase 3: Structure Configuration
        {
          name: 'kommo_create_pipeline',
          description: 'Create a new pipeline',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              sort: { type: 'number' },
              is_main: { type: 'boolean' },
            },
            required: ['name'],
          },
        },
        {
          name: 'kommo_update_pipeline',
          description: 'Update an existing pipeline',
          inputSchema: {
            type: 'object',
            properties: {
              pipelineId: { type: 'number' },
              name: { type: 'string' },
              sort: { type: 'number' },
              is_main: { type: 'boolean' },
              is_archive: { type: 'boolean' },
            },
            required: ['pipelineId'],
          },
        },
        {
          name: 'kommo_create_status',
          description: 'Create a new status in a pipeline',
          inputSchema: {
            type: 'object',
            properties: {
              pipelineId: { type: 'number' },
              name: { type: 'string' },
              sort: { type: 'number' },
              color: { type: 'string' },
            },
            required: ['pipelineId', 'name'],
          },
        },
        {
          name: 'kommo_update_status',
          description: 'Update a status',
          inputSchema: {
            type: 'object',
            properties: {
              pipelineId: { type: 'number' },
              statusId: { type: 'number' },
              name: { type: 'string' },
              sort: { type: 'number' },
              color: { type: 'string' },
            },
            required: ['pipelineId', 'statusId'],
          },
        },
        // Phase 3: Custom Fields
        {
          name: 'kommo_create_custom_field',
          description: 'Create a new custom field',
          inputSchema: {
            type: 'object',
            properties: {
              entityType: { type: 'string', enum: ['leads', 'contacts', 'companies', 'customers', 'segments'] },
              name: { type: 'string' },
              type: { type: 'string', enum: ['text', 'numeric', 'checkbox', 'select', 'multiselect', 'date', 'url', 'textarea', 'radiobutton', 'streetaddress'] },
              enums: { type: 'array', items: { type: 'object', properties: { value: { type: 'string' }, sort: { type: 'number' } } } },
            },
            required: ['entityType', 'name', 'type'],
          },
        },
        {
          name: 'kommo_update_custom_field',
          description: 'Update a custom field',
          inputSchema: {
            type: 'object',
            properties: {
              entityType: { type: 'string', enum: ['leads', 'contacts', 'companies', 'customers', 'segments'] },
              fieldId: { type: 'number' },
              name: { type: 'string' },
            },
            required: ['entityType', 'fieldId'],
          },
        },
        // Phase 3: Users
        {
          name: 'kommo_list_users',
          description: 'List all users in the account',
          inputSchema: {
            type: 'object',
            properties: {
              active: { type: 'boolean', description: 'Filter by active users' },
            },
          },
        },
        {
          name: 'kommo_get_user',
          description: 'Get details of a specific user',
          inputSchema: {
            type: 'object',
            properties: {
              userId: { type: 'number', description: 'The Kommo User ID' },
            },
            required: ['userId'],
          },
        },
        {
          name: 'kommo_list_roles',
          description: 'List all roles defined in the account',
          inputSchema: {
            type: 'object',
          },
        },
        {
          name: 'kommo_get_user_availability',
          description: 'Check user load (number of active leads assigned)',
          inputSchema: {
            type: 'object',
            properties: {
              userId: { type: 'number', description: 'The Kommo User ID' },
            },
            required: ['userId'],
          },
        },
        // Phase 3: Governance & Diagnostics
        {
          name: 'kommo_validate_account_setup',
          description: 'Perform a health check of the CRM account (pipelines, users, fields)',
          inputSchema: {
            type: 'object',
          },
        },
        {
          name: 'kommo_check_missing_fields',
          description: 'Find entities missing critical data in specific fields',
          inputSchema: {
            type: 'object',
            properties: {
              entityType: { type: 'string', enum: ['leads', 'contacts', 'companies'] },
              fieldIds: { 
                type: 'array', 
                items: { type: ['number', 'string'] },
                description: 'Array of Field IDs (numbers) or standard field names like "name", "price"' 
              },
            },
            required: ['entityType', 'fieldIds'],
          },
        },
      ];

    // Add Messaging Tools conditionally
    if (config.messagingGatewayUrl && config.messagingGatewayApiKey) {
      tools.push(
        {
          name: 'kommo_chat_send_message',
          description: 'Send a message to a contact via a specific channel (WhatsApp, Telegram, etc.)',
          inputSchema: {
            type: 'object',
            properties: {
              channel: { type: 'string', enum: ['whatsapp', 'telegram', 'instagram', 'facebook'] },
              to: {
                type: 'object',
                properties: {
                  contactId: { type: 'number' },
                  phone: { type: 'string' },
                  chatId: { type: 'string' },
                },
                required: ['contactId'],
              },
              message: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['text'] },
                  text: { type: 'string' },
                },
                required: ['type', 'text'],
              },
            },
            required: ['channel', 'to', 'message'],
          },
        },
        {
          name: 'kommo_chat_get_history',
          description: 'Get conversation history for a contact',
          inputSchema: {
            type: 'object',
            properties: {
              channel: { type: 'string', enum: ['whatsapp', 'telegram', 'instagram', 'facebook'] },
              contactId: { type: 'number' },
              limit: { type: 'number', default: 20 },
              cursor: { type: 'string' },
            },
            required: ['channel', 'contactId'],
          },
        },
        {
          name: 'kommo_chat_upsert_thread',
          description: 'Prepare or retrieve a chat thread for a contact',
          inputSchema: {
            type: 'object',
            properties: {
              channel: { type: 'string', enum: ['whatsapp', 'telegram', 'instagram', 'facebook'] },
              identity: {
                type: 'object',
                properties: {
                  phone: { type: 'string' },
                  email: { type: 'string' },
                },
              },
              profile: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                },
              },
            },
            required: ['channel', 'identity'],
          },
        },
        {
          name: 'kommo_check_messaging_gateway_health',
          description: 'Check the health status of the Messaging Gateway',
          inputSchema: {
            type: 'object',
            properties: {},
            required: [],
          },
        }
      );
    }

    return { tools };
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
      case 'kommo_get_lead_timeline':
        return await handlers.handleGetLeadTimeline(args as any, config);
      case 'kommo_get_lead_context_summary':
        return await handlers.handleGetLeadContextSummary(args as any, config);
      case 'kommo_detect_lead_status':
        return await handlers.handleDetectLeadStatus(args as any, config);
      case 'kommo_find_inactive_leads':
        return await handlers.handleFindInactiveLeads(args as any, config);
      case 'kommo_bulk_create_leads':
        return await handlers.handleBulkCreateLeads(args as any, config);
      case 'kommo_bulk_update_leads':
        return await handlers.handleBulkUpdateLeads(args as any, config);
      case 'kommo_bulk_move_leads':
        return await handlers.handleBulkMoveLeads(args as any, config);
      case 'kommo_assign_lead_to_user':
        return await handlers.handleAssignLeadToUser(args as any, config);
      case 'kommo_get_pipeline_stats':
        return await handlers.handleGetPipelineStats(args as any, config);
      case 'kommo_get_conversion_rates':
        return await handlers.handleGetConversionRates(args as any, config);
      case 'kommo_get_lost_reasons_stats':
        return await handlers.handleGetLostReasonsStats(args as any, config);
      case 'kommo_get_user_performance':
        return await handlers.handleGetUserPerformance(args as any, config);
      case 'kommo_create_pipeline':
        return await handlers.handleCreatePipeline(args as any, config);
      case 'kommo_update_pipeline':
        return await handlers.handleUpdatePipeline(args as any, config);
      case 'kommo_create_status':
        return await handlers.handleCreateStatus(args as any, config);
      case 'kommo_update_status':
        return await handlers.handleUpdateStatus(args as any, config);
      case 'kommo_create_custom_field':
        return await handlers.handleCreateCustomField(args as any, config);
      case 'kommo_update_custom_field':
        return await handlers.handleUpdateCustomField(args as any, config);
      case 'kommo_list_users':
        return await handlers.handleListUsers(args as any, config);
      case 'kommo_get_user':
        return await handlers.handleGetUser(args as any, config);
      case 'kommo_list_roles':
        return await handlers.handleListRoles(config);
      case 'kommo_get_user_availability':
        return await handlers.handleGetUserAvailability(args as any, config);
      case 'kommo_validate_account_setup':
        return await handlers.handleValidateAccountSetup(config);
      case 'kommo_check_missing_fields':
        return await handlers.handleCheckMissingFields(args as any, config);
      
      // Messaging Tools
      case 'kommo_chat_send_message':
        return await handlers.handleChatSendMessage(args as any, config);
      case 'kommo_chat_get_history':
        return await handlers.handleChatGetHistory(args as any, config);
      case 'kommo_chat_upsert_thread':
        return await handlers.handleChatUpsertThread(args as any, config);
      case 'kommo_check_messaging_gateway_health':
        return await handlers.handleCheckMessagingGatewayHealth(config);
        
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });
}
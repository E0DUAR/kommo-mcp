/**
 * Kommo CRM Tool - Shared Types & Schemas
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 * Treat this as an external NPM package.
 * 
 * This file contains shared types and schemas used across the Kommo MCP.
 * Entity-specific types are in entities/{entity}/types.ts
 * 
 * @see docs/ARCHITECTURE.md - Section on MCP Isolation
 */

import { z } from 'zod';

// ============================================
// Configuration Schema
// ============================================

/**
 * Configuration for Kommo API connection.
 * Supports OAuth 2.0 (access token) authentication.
 * Passed in to maintain isolation (no env imports).
 */
export const kommoConfigSchema = z.object({
  /** Kommo API base URL (usually https://YOUR_DOMAIN.kommo.com or https://YOUR_DOMAIN.kommo.com/api/v4) */
  baseUrl: z.string().url('Base URL must be a valid URL'),
  
  /** Access token for OAuth 2.0 authentication */
  accessToken: z.string().min(1, 'Access token is required'),
}).refine(
  (data) => data.baseUrl.includes('kommo'),
  { message: 'Base URL should be a Kommo domain' }
);

export type KommoConfig = z.infer<typeof kommoConfigSchema>;

// ============================================
// Re-export Entity Types (for backward compatibility)
// ============================================

import {
  type KommoContact,
  type CustomFieldValue,
  type SearchContactByPhoneParams,
  type SearchContactByEmailParams,
  type GetContactParams,
  type ListContactsFilters,
  type SearchContactResult,
  type GetContactResult,
  type ListContactsResult,
} from './entities/contacts/types.js';

export type {
  KommoContact,
  CustomFieldValue,
  SearchContactByPhoneParams,
  SearchContactByEmailParams,
  GetContactParams,
  ListContactsFilters,
  SearchContactResult,
  GetContactResult,
  ListContactsResult,
} from './entities/contacts/types.js';

// Legacy type aliases for backward compatibility
export type SearchContactParams = any;
export { searchContactByPhoneParamsSchema as searchContactParamsSchema } from './entities/contacts/types.js';
export { getContactParamsSchema } from './entities/contacts/types.js';
export { kommoContactSchema, customFieldValueSchema } from './entities/contacts/types.js';
export { searchContactResultSchema, getContactResultSchema } from './entities/contacts/types.js';

// ============================================
// Tool Descriptions (for AI SDK)
// ============================================

/**
 * Description for the AI model to understand when to use searchContact.
 */
export const SEARCH_CONTACT_TOOL_DESCRIPTION = `
Search for a contact in Kommo CRM by phone number.

REQUIRED: You MUST provide a "phone" parameter with the phone number to search for.

Use this tool when the user:
- Provides a phone number and asks to find their contact information
- Asks about a customer's details or history
- Needs to verify if a contact exists in the CRM

The phone number can be provided in any format (with or without country code, with or without spaces/special characters).

Returns matching contacts from Kommo CRM.

Example: searchContact({ phone: "+573001234567" })
`.trim();

/**
 * Description for the AI model to understand when to use getContact.
 */
export const GET_CONTACT_TOOL_DESCRIPTION = `
Get detailed information about a specific contact in Kommo CRM by their ID.

REQUIRED: You MUST provide a "contactId" parameter with the Kommo contact ID.

Use this tool when:
- You already know the contact ID and need full details
- The user references a specific contact by ID

Returns the full contact record with all custom fields and metadata.

Example: getContact({ contactId: 12345 })
`.trim();

/**
 * Description for the AI model to understand when to use listPipelines.
 */
export const LIST_PIPELINES_TOOL_DESCRIPTION = `
List all available pipelines in Kommo CRM.

Use this tool when:
- The user asks to see all pipelines
- The user wants to know what pipelines are available
- You need to find a pipeline by name (use searchPipelineByName instead if you know the name)

Returns a list of all pipelines with their IDs and names.

Example: listPipelines()
`.trim();

/**
 * Description for the AI model to understand when to use getPipeline.
 */
export const GET_PIPELINE_TOOL_DESCRIPTION = `
Get detailed information about a specific pipeline in Kommo CRM by its ID.

REQUIRED: You MUST provide a "pipelineId" parameter with the Kommo pipeline ID.

Use this tool when:
- You already know the pipeline ID and need full details
- The user references a specific pipeline by ID
- You need to see pipeline metadata (name, stages count, etc.)

Returns the full pipeline record with metadata.

Example: getPipeline({ pipelineId: 12676060 })
`.trim();

/**
 * Description for the AI model to understand when to use searchPipelineByName.
 */
export const SEARCH_PIPELINE_BY_NAME_TOOL_DESCRIPTION = `
Search for pipelines in Kommo CRM by name (partial match, case-insensitive).

REQUIRED: You MUST provide a "name" parameter with the pipeline name to search for.

Use this tool when:
- The user provides a pipeline name and asks to find it
- The user asks "show me the pipeline called X"
- You need to find a pipeline by its name to get its ID

Returns matching pipelines. You can then use the pipeline ID with other tools.

Example: searchPipelineByName({ name: "Logística Mastershop" })
`.trim();

/**
 * Description for the AI model to understand when to use getPipelineStatuses.
 */
export const GET_PIPELINE_STATUSES_TOOL_DESCRIPTION = `
Get all stages/statuses for a specific pipeline in Kommo CRM.

REQUIRED: You MUST provide a "pipelineId" parameter with the Kommo pipeline ID.

Use this tool when:
- The user asks about the stages of a pipeline
- The user wants to see all available stages for a pipeline
- You need to know what stages a lead can be moved to
- The user asks "what stages does pipeline X have?"

Returns all stages/statuses with their IDs, names, sort order, and colors.

Example: getPipelineStatuses({ pipelineId: 12676060 })
`.trim();

/**
 * Description for the AI model to understand when to use getLeadCustomFields.
 */
export const GET_LEAD_CUSTOM_FIELDS_TOOL_DESCRIPTION = `
Get custom fields (with their IDs and names) for a specific lead in Kommo CRM.

IMPORTANT: Kommo API only returns custom fields that HAVE VALUES. If a custom field exists but has no value, it won't appear in the response.

REQUIRED: You MUST provide a "leadId" parameter with the Kommo lead ID.

Use this tool when:
- The user asks to see the fields of a lead
- You need to know what custom fields a lead has (that have values) before editing
- The user wants to see field IDs and names for a lead

Returns custom fields with their field_id, field_name, field_type, and current values.
Note: Only fields with values are returned. Empty fields won't appear.

If you need to see all available fields (even empty ones), you may need to update the lead first with values in those fields, or use known field IDs from the pipeline.

Example: getLeadCustomFields({ leadId: 21640674 })
`.trim();

/**
 * Description for the AI model to understand when to use updateLead.
 */
export const UPDATE_LEAD_TOOL_DESCRIPTION = `
Update/edit a lead in Kommo CRM. You can update any field including custom fields, responsible user, price, status, etc.

REQUIRED: You MUST provide a "leadId" parameter with the Kommo lead ID.

Optional parameters you can update:
- name: Lead name
- price: Lead price/value
- responsible_user_id: User responsible for the lead
- status_id: Current stage/status ID
- pipeline_id: Pipeline ID
- custom_fields_values: Array of custom field values (each with field_id and values array)

For custom fields, use the format:
{
  field_id: number,
  values: [{ value: string }]
}

Use this tool when:
- The user asks to edit/update a lead
- The user wants to change lead information
- The user wants to update custom fields using field IDs
- The user wants to change the responsible user

NOTE: For updating custom fields by NAME, use updateLeadCustomFields instead.

Example: updateLead({ leadId: 21640674, name: "New Name", price: 150000, responsible_user_id: 123 })
`.trim();

/**
 * Description for the AI model to understand when to use searchLeadCustomField.
 */
export const SEARCH_LEAD_CUSTOM_FIELD_TOOL_DESCRIPTION = `
Search for a custom field in a lead by name or ID.

REQUIRED: You MUST provide:
- leadId: Kommo lead ID
- searchTerm: Field name (partial match, case-insensitive) or field ID (number)

Use this tool when:
- The user asks "what fields does this lead have?"
- You need to find a field ID by its name
- You need to verify if a field exists in a lead
- Before updating a field, you want to check its current value

NOTE: Kommo API only returns fields that have values. If a field exists but has no value, it won't be found.

Returns field information including field_id, field_name, field_type, and current values.

Example: searchLeadCustomField({ leadId: 21640674, searchTerm: "Nombre" })
Example: searchLeadCustomField({ leadId: 21640674, searchTerm: 2099831 })
`.trim();

/**
 * Description for the AI model to understand when to use getSelectFieldOptions.
 */
export const GET_SELECT_FIELD_OPTIONS_TOOL_DESCRIPTION = `
Get available options for a select/dropdown custom field in Kommo CRM.

REQUIRED: You MUST provide:
- fieldId: Field ID of the select field

Use this tool when:
- The user wants to know what values are valid for a select field
- You need to see all available options for a dropdown field
- An update failed with "NotSupportedChoice" error and you need to find valid options
- The user asks "what are the options for field X?"

This tool gets options directly from custom fields metadata (GET /api/v4/leads/custom_fields).
It returns ALL possible options for the select field, not just values currently in use.

Returns field information including field_id, field_name, field_code, field_type, and a list of all valid options with their enum_id, value, color, and sort order.

Example: getSelectFieldOptions({ fieldId: 2099839 })
`.trim();

/**
 * Description for the AI model to understand when to use updateLeadCustomFields.
 */
export const UPDATE_LEAD_CUSTOM_FIELDS_TOOL_DESCRIPTION = `
Update custom fields in a lead using field NAMES or IDs.

REQUIRED: You MUST provide:
- leadId: Kommo lead ID
- fields: Object mapping field names/IDs to values

This tool is SMART - it can:
1. Accept field names (e.g., "Nombre", "Apellido") and automatically find their IDs
2. Accept field IDs directly (e.g., 2099831)
3. Handle fields that don't have values yet (Kommo API limitation)
4. Automatically handle select/dropdown fields by finding valid options and matching values

Use this tool when:
- The user says "update my lead with this data" and provides field names
- The user provides data in a natural format (e.g., { "Nombre": "Juan", "Ciudad": "Bogotá" })
- You need to update multiple custom fields at once
- The user gives you field names instead of IDs
- The user wants to update select fields (the tool will automatically find valid options)

The function will automatically:
- Search for fields by name and map them to IDs
- Use field IDs directly if provided
- Attempt to update fields even if they don't have values yet
- For select fields, find valid options and match the provided value (case-insensitive, partial match)

Example: updateLeadCustomFields({ 
  leadId: 21640674, 
  fields: { 
    "Nombre": "Juan", 
    "Apellido": "Pérez",
    2099835: "juan@example.com" // Can also use IDs
  } 
})
`.trim();
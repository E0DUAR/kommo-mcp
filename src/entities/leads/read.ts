/**
 * Kommo CRM - Leads Read Operations
 * 
 * All read operations for Leads entity.
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import { kommoRequest, type KommoConfig } from '../../client.js';
import {
  searchLeadParamsSchema,
  getLeadParamsSchema,
  listLeadsFiltersSchema,
  type SearchLeadParams,
  type GetLeadParams,
  type ListLeadsFilters,
  type SearchLeadResult,
  type GetLeadResult,
  type ListLeadsResult,
  type KommoLead,
} from './types.js';
import { normalizePagination, type KommoPaginatedResponse } from '../../utils/pagination.js';

/**
 * Search for leads in Kommo CRM.
 * 
 * @param params - Search parameters (query string)
 * @param config - Kommo API configuration
 * @returns Search results with matching leads
 */
export async function searchLead(
  params: SearchLeadParams,
  config: KommoConfig
): Promise<SearchLeadResult> {
  const validatedParams = searchLeadParamsSchema.parse(params);
  
  try {
    // Make API request
    const data = await kommoRequest<KommoPaginatedResponse<KommoLead>>(
      '/leads',
      config,
      {
        method: 'GET',
        query: { query: validatedParams.query },
      }
    );

    // Handle 204 No Content
    if (data === null) {
      return {
        success: true,
        leads: [],
        totalFound: 0,
      };
    }

    // Extract leads from _embedded
    const leads: KommoLead[] = data._embedded?.leads ?? [];
    const totalFound = leads.length;

    return {
      success: true,
      leads,
      totalFound,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      leads: [],
      totalFound: 0,
      error: `Search error: ${message}`,
    };
  }
}

/**
 * Get detailed information about a specific lead by ID.
 * 
 * @param params - Get parameters (lead ID)
 * @param config - Kommo API configuration
 * @returns Lead data if found
 */
export async function getLead(
  params: GetLeadParams,
  config: KommoConfig
): Promise<GetLeadResult> {
  const validatedParams = getLeadParamsSchema.parse(params);
  
  try {
    // Make API request
    const lead = await kommoRequest<KommoLead>(
      `/leads/${validatedParams.leadId}`,
      config,
      {
        method: 'GET',
      }
    );

    if (!lead) {
      return {
        success: false,
        error: `Lead with ID ${validatedParams.leadId} not found`,
      };
    }

    return {
      success: true,
      lead,
    };

  } catch (error) {
    if (error instanceof Error && 'statusCode' in error && (error as { statusCode: number }).statusCode === 404) {
      return {
        success: false,
        error: `Lead with ID ${validatedParams.leadId} not found`,
      };
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      error: `Get lead error: ${message}`,
    };
  }
}

/**
 * List leads with optional filters and pagination.
 * 
 * @param filters - Optional filters and pagination
 * @param config - Kommo API configuration
 * @returns List of leads
 */
export async function listLeads(
  filters: ListLeadsFilters | undefined,
  config: KommoConfig
): Promise<ListLeadsResult> {
  const validatedFilters = listLeadsFiltersSchema.parse(filters ?? {});
  
  try {
    // Normalize pagination
    const { page, limit } = normalizePagination({
      page: validatedFilters.page,
      limit: validatedFilters.limit,
    });

    // Build query parameters
    const query: Record<string, string | number> = {
      page,
      limit,
    };

    if (validatedFilters.responsible_user_id !== undefined) {
      query.responsible_user_id = validatedFilters.responsible_user_id;
    }
    if (validatedFilters.status_id !== undefined) {
      query.status_id = validatedFilters.status_id;
    }
    if (validatedFilters.pipeline_id !== undefined) {
      query.pipeline_id = validatedFilters.pipeline_id;
    }
    if (validatedFilters.group_id !== undefined) {
      query.group_id = validatedFilters.group_id;
    }
    if (validatedFilters.contact_id !== undefined) {
      query.contact_id = validatedFilters.contact_id;
    }
    if (validatedFilters.created_at_from !== undefined) {
      query.created_at_from = validatedFilters.created_at_from;
    }
    if (validatedFilters.created_at_to !== undefined) {
      query.created_at_to = validatedFilters.created_at_to;
    }
    if (validatedFilters.updated_at_from !== undefined) {
      query.updated_at_from = validatedFilters.updated_at_from;
    }
    if (validatedFilters.updated_at_to !== undefined) {
      query.updated_at_to = validatedFilters.updated_at_to;
    }
    if (validatedFilters.query) {
      query.query = validatedFilters.query;
    }

    // Make API request
    const data = await kommoRequest<KommoPaginatedResponse<KommoLead>>(
      '/leads',
      config,
      {
        method: 'GET',
        query,
      }
    );

    // Handle 204 No Content
    if (data === null) {
      return {
        success: true,
        leads: [],
        totalFound: 0,
        page,
      };
    }

    // Extract leads from _embedded
    const leads: KommoLead[] = data._embedded?.leads ?? [];
    const totalFound = data._page?.total_items ?? leads.length;
    const totalPages = data._page?.total_pages ?? 1;

    return {
      success: true,
      leads,
      totalFound,
      page,
      totalPages,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      leads: [],
      totalFound: 0,
      error: `List leads error: ${message}`,
    };
  }
}

/**
 * Get leads associated with a specific contact.
 * 
 * @param contactId - Contact ID
 * @param config - Kommo API configuration
 * @returns List of leads associated with the contact
 */
export async function getLeadsByContact(
  contactId: number,
  config: KommoConfig
): Promise<ListLeadsResult> {
  return listLeads({ contact_id: contactId }, config);
}

/**
 * Get custom fields for a specific lead.
 * 
 * IMPORTANT: Kommo API only returns custom fields that have values.
 * If a custom field doesn't have a value, it won't appear in the response.
 * 
 * To see all available custom fields for a pipeline, you need to:
 * 1. First update the lead with values in those fields, OR
 * 2. Use the field IDs you know exist in the pipeline
 * 
 * @param leadId - Lead ID
 * @param config - Kommo API configuration
 * @returns Custom fields data with field IDs and names (only fields with values)
 */
export async function getLeadCustomFields(
  leadId: number,
  config: KommoConfig
): Promise<{
  success: boolean;
  customFields?: Array<{
    field_id: number;
    field_name?: string;
    field_code?: string;
    field_type?: string;
    values: Array<{
      value: string;
      enum_code?: string;
      enum_id?: number;
    }>;
  }>;
  /** Pipeline ID of the lead (useful for getting all field definitions) */
  pipelineId?: number;
  /** Note: Only fields with values are returned. Empty fields won't appear. */
  note?: string;
  error?: string;
}> {
  try {
    // Get the lead first to extract custom fields
    const result = await getLead({ leadId }, config);
    
    if (!result.success || !result.lead) {
      return {
        success: false,
        error: result.error ?? `Lead with ID ${leadId} not found`,
      };
    }

    const customFields = result.lead.custom_fields_values ?? [];
    
    // If no custom fields found, it means either:
    // 1. The lead has no custom fields configured, OR
    // 2. The custom fields exist but have no values (Kommo doesn't return empty fields)
    const note = customFields.length === 0
      ? 'No custom fields with values found. Custom fields may exist but have no values (Kommo API only returns fields with values).'
      : undefined;

    return {
      success: true,
      customFields,
      pipelineId: result.lead.pipeline_id,
      note,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      error: `Get lead custom fields error: ${message}`,
    };
  }
}

/**
 * Search for a custom field in a lead by name or ID.
 * 
 * This function searches through the custom fields that have values in the lead.
 * If the field doesn't have a value, it won't be found (Kommo API limitation).
 * 
 * @param leadId - Lead ID
 * @param searchTerm - Field name (partial match, case-insensitive) or field ID
 * @param config - Kommo API configuration
 * @returns Custom field data if found
 */
export async function searchLeadCustomField(
  leadId: number,
  searchTerm: string | number,
  config: KommoConfig
): Promise<{
  success: boolean;
  field?: {
    field_id: number;
    field_name?: string;
    field_code?: string;
    field_type?: string;
    values: Array<{
      value: string;
      enum_code?: string;
      enum_id?: number;
    }>;
  };
  error?: string;
}> {
  try {
    const result = await getLeadCustomFields(leadId, config);
    
    if (!result.success || !result.customFields) {
      return {
        success: false,
        error: result.error ?? 'Failed to get custom fields',
      };
    }

    // Search by ID (if searchTerm is a number)
    if (typeof searchTerm === 'number' || !isNaN(Number(searchTerm))) {
      const fieldId = typeof searchTerm === 'number' ? searchTerm : Number(searchTerm);
      const field = result.customFields.find(f => f.field_id === fieldId);
      
      if (field) {
        return {
          success: true,
          field,
        };
      }
    }

    // Search by name (partial match, case-insensitive)
    const searchName = String(searchTerm).toLowerCase();
    const field = result.customFields.find(f => {
      const fieldName = f.field_name?.toLowerCase() || '';
      const fieldCode = f.field_code?.toLowerCase() || '';
      return fieldName.includes(searchName) || fieldCode.includes(searchName);
    });

    if (field) {
      return {
        success: true,
        field,
      };
    }

    return {
      success: false,
      error: `Custom field not found: ${searchTerm}. Note: Only fields with values are searchable (Kommo API limitation).`,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      error: `Search custom field error: ${message}`,
    };
  }
}

/**
 * Get information about a specific custom field by ID.
 * 
 * This function attempts to get field information by updating the lead
 * with a temporary value, then reading it back to get full field metadata.
 * 
 * WARNING: This will update the lead. Use with caution.
 * 
 * @param leadId - Lead ID
 * @param fieldId - Field ID
 * @param config - Kommo API configuration
 * @returns Custom field information including type, name, and options (if select field)
 */
export async function getLeadCustomFieldInfo(
  leadId: number,
  fieldId: number,
  config: KommoConfig
): Promise<{
  success: boolean;
  field?: {
    field_id: number;
    field_name?: string;
    field_code?: string;
    field_type?: string;
    values?: Array<{
      value: string;
      enum_code?: string;
      enum_id?: number;
    }>;
  };
  /** Current value in the lead (if any) */
  currentValue?: string;
  error?: string;
}> {
  try {
    // First, try to get the field from existing custom fields
    const existingFields = await getLeadCustomFields(leadId, config);
    
    if (existingFields.success && existingFields.customFields) {
      const existingField = existingFields.customFields.find(f => f.field_id === fieldId);
      
      if (existingField) {
        return {
          success: true,
          field: existingField,
          currentValue: existingField.values[0]?.value,
        };
      }
    }

    // If field not found, we can't get its info without updating the lead
    // This is a Kommo API limitation - we return what we can
    return {
      success: false,
      error: `Field ${fieldId} not found in lead. Field may exist but has no value (Kommo API only returns fields with values). To get field info, first update the lead with a value in this field.`,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      error: `Get custom field info error: ${message}`,
    };
  }
}

/**
 * Discover all custom fields for a lead by attempting to update them with temporary values.
 * 
 * This function discovers fields that don't have values yet by:
 * 1. Saving current field values
 * 2. Attempting to update each field ID with a temporary value
 * 3. Reading back the field information
 * 4. Restoring original values
 * 
 * NOTE: This will temporarily modify the lead. Fields that are select/dropdown
 * may fail if the temporary value is not a valid option.
 * 
 * @param leadId - Lead ID
 * @param fieldIds - Array of field IDs to discover (optional, will try to discover all if not provided)
 * @param config - Kommo API configuration
 * @returns All discovered custom fields with their metadata
 */
export async function discoverAllLeadCustomFields(
  leadId: number,
  fieldIds?: number[],
  config?: KommoConfig
): Promise<{
  success: boolean;
  fields?: Array<{
    field_id: number;
    field_name?: string;
    field_code?: string;
    field_type?: string;
  }>;
  failedFields?: Array<{
    field_id: number;
    error: string;
  }>;
  error?: string;
}> {
  // This function requires importing updateLead, which would create a circular dependency
  // So we'll implement it differently - as a helper that can be called from outside
  // For now, return an error suggesting to use the discovery script approach
  return {
    success: false,
    error: 'This function requires updateLead which would create circular dependency. Use discoverLeadCustomFieldsByUpdating instead.',
  };
}

/**
 * Get custom fields metadata (definitions) for leads.
 * This includes ALL custom fields with their types, codes, and enum options for select fields.
 * 
 * IMPORTANT: This endpoint returns the metadata/definitions, not the values in a specific lead.
 * Use this to get all possible options for select fields.
 * 
 * @param config - Kommo API configuration
 * @returns Custom fields metadata with all field definitions
 */
export async function getLeadCustomFieldsMetadata(
  config: KommoConfig
): Promise<{
  success: boolean;
  fields?: Array<{
    id: number;
    name: string;
    code?: string;
    type: string;
    enums?: Array<{
      id: number;
      value: string;
      color?: string;
      sort?: number;
    }>;
  }>;
  error?: string;
}> {
  try {
    const response = await kommoRequest<{
      _embedded?: {
        custom_fields?: Array<{
          id: number;
          name: string;
          code?: string;
          type: string;
          enums?: Array<{
            id: number;
            value: string;
            color?: string;
            sort?: number;
          }> | null;
        }>;
      };
    }>(
      '/leads/custom_fields',
      config,
      {
        method: 'GET',
      }
    );

    // Extract fields from _embedded.custom_fields
    const fields = response?._embedded?.custom_fields;

    if (!fields || !Array.isArray(fields)) {
      return {
        success: false,
        error: 'Invalid response format from custom fields endpoint: missing _embedded.custom_fields',
      };
    }

    return {
      success: true,
      fields: fields.filter(f => (f as any).enums && Array.isArray((f as any).enums) && (f as any).enums.length > 0) as any, // Filter out fields without enums
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      error: `Get custom fields metadata error: ${message}`,
    };
  }
}

/**
 * Get available options for a select/dropdown custom field from custom fields metadata.
 * 
 * This function gets valid options for a select field by:
 * 1. Fetching custom fields metadata (GET /api/v4/leads/custom_fields)
 * 2. Finding the field by ID
 * 3. Extracting all enum options from the field definition
 * 4. Returning the list of valid options with their enum_id
 * 
 * This is the CORRECT way to get options - from metadata, not from other leads.
 * 
 * @param fieldId - Field ID of the select field
 * @param config - Kommo API configuration
 * @returns List of valid options for the select field
 */
export async function getSelectFieldOptions(
  fieldId: number,
  config: KommoConfig
): Promise<{
  success: boolean;
  fieldId: number;
  fieldName?: string;
  fieldCode?: string;
  fieldType?: string;
  options?: Array<{
    value: string;
    enum_id: number;
    color?: string;
    sort?: number;
  }>;
  error?: string;
}> {
  try {
    // Get custom fields metadata
    const metadataResult = await getLeadCustomFieldsMetadata(config);
    
    if (!metadataResult.success || !metadataResult.fields) {
      return {
        success: false,
        fieldId,
        error: metadataResult.error ?? 'Failed to get custom fields metadata',
      };
    }

    // Find the field by ID
    const field = metadataResult.fields.find(f => f.id === fieldId);
    
    if (!field) {
      return {
        success: false,
        fieldId,
        error: `Field with ID ${fieldId} not found in custom fields metadata`,
      };
    }

    // Check if it's a select or multiselect field
    if (field.type !== 'select' && field.type !== 'multiselect') {
      return {
        success: false,
        fieldId,
        fieldName: field.name,
        fieldCode: field.code,
        fieldType: field.type,
        error: `Field "${field.name}" is not a select field (type: ${field.type})`,
      };
    }

    // Extract options from enums (enums is an array, not an object)
    const options: Array<{
      value: string;
      enum_id: number;
      color?: string;
      sort?: number;
    }> = [];

    if (field.enums && Array.isArray(field.enums)) {
      for (const enumData of field.enums) {
        options.push({
          value: enumData.value,
          enum_id: enumData.id, // enum_id is in the 'id' field
          color: enumData.color,
          sort: enumData.sort,
        });
      }
    }

    // Sort by sort order if available
    options.sort((a, b) => {
      if (a.sort !== undefined && b.sort !== undefined) {
        return a.sort - b.sort;
      }
      return a.value.localeCompare(b.value);
    });

    return {
      success: true,
      fieldId,
      fieldName: field.name,
      fieldCode: field.code,
      fieldType: field.type,
      options: options.length > 0 ? options : undefined,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      fieldId,
      error: `Get select field options error: ${message}`,
    };
  }
}

/**
 * Get all products (catalog elements) linked to a lead.
 * 
 * @param leadId - Lead ID
 * @param config - Kommo API configuration
 * @returns List of products linked to the lead
 */
export async function getLeadProducts(
  leadId: number,
  config: KommoConfig
): Promise<{
  success: boolean;
  products?: Array<{
    id: number;
    name: string;
    catalog_id: number;
    quantity?: number;
    custom_fields_values?: Array<{
      field_id: number;
      field_name?: string;
      values: Array<{
        value: string;
        enum_id?: number;
      }>;
    }>;
  }>;
  error?: string;
}> {
  try {
    // Get lead with catalog_elements embedded
    const lead = await kommoRequest<{
      id: number;
      _embedded?: {
        catalog_elements?: Array<{
          id: number;
          name: string;
          catalog_id: number;
          custom_fields_values?: Array<{
            field_id: number;
            field_name?: string;
            values: Array<{
              value: string;
              enum_id?: number;
            }>;
          }>;
        }>;
        links?: Array<{
          to_entity_id: number;
          to_entity_type: string;
          metadata?: {
            quantity?: number;
            catalog_id?: number;
          };
        }>;
      };
    }>(
      `/leads/${leadId}?with=catalog_elements`,
      config,
      {
        method: 'GET',
      }
    );

    if (!lead) {
      return {
        success: false,
        error: `Lead with ID ${leadId} not found`,
      };
    }

    // Extract products from _embedded.catalog_elements
    const catalogElements = lead._embedded?.catalog_elements ?? [];
    const links = lead._embedded?.links ?? [];

    // Map catalog elements with their link metadata (quantity, etc.)
    const products = catalogElements.map(element => {
      // Find the link for this element to get metadata
      const link = links.find(
        l => l.to_entity_id === element.id && l.to_entity_type === 'catalog_elements'
      );

      return {
        id: element.id,
        name: element.name,
        catalog_id: element.catalog_id,
        quantity: link?.metadata?.quantity,
        custom_fields_values: element.custom_fields_values,
      };
    });

    return {
      success: true,
      products,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      error: `Get lead products error: ${message}`,
    };
  }
}
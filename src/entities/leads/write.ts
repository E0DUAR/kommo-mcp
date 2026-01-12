/**
 * Kommo CRM - Leads Write Operations
 * 
 * All write operations for Leads entity.
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import { kommoRequest, type KommoConfig } from '../../client.js';
import { kommoLeadSchema, type KommoLead } from './types.js';
import { z } from 'zod';

/**
 * Data for creating a new lead.
 */
export const createLeadDataSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  price: z.number().optional(),
  responsible_user_id: z.number().optional(),
  group_id: z.number().optional(),
  status_id: z.number().optional(),
  pipeline_id: z.number().optional(),
  custom_fields_values: z.array(z.object({
    field_id: z.number(),
    values: z.array(z.object({
      value: z.string(),
      enum_id: z.number().optional(),
    })),
  })).optional(),
  _embedded: z.object({
    contacts: z.array(z.object({ id: z.number() })).optional(),
    companies: z.array(z.object({ id: z.number() })).optional(),
  }).optional(),
});

export type CreateLeadData = z.infer<typeof createLeadDataSchema>;

/**
 * Data for updating a lead.
 */
export const updateLeadDataSchema = createLeadDataSchema.partial();

export type UpdateLeadData = z.infer<typeof updateLeadDataSchema>;

/**
 * Result of a create/update lead operation.
 */
export interface LeadWriteResult {
  success: boolean;
  lead?: KommoLead;
  leadId?: number;
  error?: string;
}

/**
 * Create a new lead in Kommo CRM.
 */
export async function createLead(
  data: CreateLeadData,
  config: KommoConfig
): Promise<LeadWriteResult> {
  const validatedData = createLeadDataSchema.parse(data);
  
  try {
    const response = await kommoRequest<{ _embedded: { leads: KommoLead[] } }>(
      '/leads',
      config,
      {
        method: 'POST',
        body: [validatedData],
      }
    );

    // Debug: Log response structure if needed
    if (process.env.KOMMO_DEBUG === 'true') {
      console.log('[Kommo Debug] Create lead response:', JSON.stringify(response, null, 2));
    }

    const lead = response?._embedded?.leads?.[0];

    if (!lead) {
      return {
        success: false,
        error: 'Failed to create lead: No lead returned in response',
      };
    }

    return {
      success: true,
      lead,
      leadId: lead.id,
    };

  } catch (error) {
    let message = error instanceof Error ? error.message : 'Unknown error';
    
    // Include response body if available for debugging
    if (error && typeof error === 'object' && 'responseBody' in error) {
      const responseBody = (error as { responseBody?: string }).responseBody;
      if (responseBody) {
        message += `\nResponse body (first 500 chars): ${responseBody.substring(0, 500)}`;
      }
    }
    
    return {
      success: false,
      error: `Create lead error: ${message}`,
    };
  }
}

/**
 * Update an existing lead in Kommo CRM.
 */
export async function updateLead(
  leadId: number,
  data: UpdateLeadData,
  config: KommoConfig
): Promise<LeadWriteResult> {
  const validatedData = updateLeadDataSchema.parse(data);
  
  try {
    const response = await kommoRequest<{ _embedded: { leads: KommoLead[] } }>(
      '/leads',
      config,
      {
        method: 'PATCH',
        body: [{
          id: leadId,
          ...validatedData,
        }],
      }
    );

    const lead = response?._embedded?.leads?.[0];

    if (!lead) {
      return {
        success: false,
        error: 'Failed to update lead: No lead returned in response',
      };
    }

    return {
      success: true,
      lead,
      leadId: lead.id,
    };

  } catch (error) {
    if (error instanceof Error && 'statusCode' in error && (error as { statusCode: number }).statusCode === 404) {
      return {
        success: false,
        error: `Lead with ID ${leadId} not found`,
      };
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      error: `Update lead error: ${message}`,
    };
  }
}

/**
 * Update lead custom fields by field names or IDs.
 * 
 * This function allows updating custom fields using either:
 * - Field names (will be searched and mapped to IDs)
 * - Field IDs (used directly)
 * 
 * The function will:
 * 1. First try to find fields by name in existing custom fields
 * 2. If not found, try to use the field ID directly
 * 3. For fields that don't exist yet, attempt to update them anyway (they may exist but have no value)
 * 
 * @param leadId - Lead ID
 * @param fields - Map of field names/IDs to values
 * @param config - Kommo API configuration
 * @returns Success status
 * 
 * @example
 * ```typescript
 * await updateLeadCustomFields(123, {
 *   'Nombre': 'Juan',
 *   2099833: 'Pérez', // Can also use field ID directly
 *   'Ciudad': 'Bogotá'
 * }, config);
 * ```
 */
export async function updateLeadCustomFields(
  leadId: number,
  fields: Record<string | number, string>,
  config: KommoConfig
): Promise<{
  success: boolean;
  updatedFields?: number;
  errors?: Array<{ field: string | number; error: string }>;
  error?: string;
}> {
  try {
    // Dynamic import to avoid circular dependency
    const { getLeadCustomFields, searchLeadCustomField } = await import('./read.js');
    
    // Get existing custom fields to build a name-to-ID map
    const existingFields = await getLeadCustomFields(leadId, config);
    const nameToIdMap = new Map<string, number>();
    
    if (existingFields.success && existingFields.customFields) {
      existingFields.customFields.forEach(field => {
        if (field.field_name) {
          nameToIdMap.set(field.field_name.toLowerCase(), field.field_id);
        }
        if (field.field_code) {
          nameToIdMap.set(field.field_code.toLowerCase(), field.field_id);
        }
      });
    }

    // Build custom_fields_values array
    const customFieldsValues: Array<{
      field_id: number;
      values: Array<{ value: string; enum_id?: number; enum_code?: string }>;
    }> = [];

    const errors: Array<{ field: string | number; error: string }> = [];
    const { getSelectFieldOptions } = await import('./read.js');

    for (const [fieldKey, value] of Object.entries(fields)) {
      let fieldId: number | undefined;

      // Check if it's already a number (field ID)
      if (typeof fieldKey === 'number' || !isNaN(Number(fieldKey))) {
        fieldId = typeof fieldKey === 'number' ? fieldKey : Number(fieldKey);
      } else {
        // Search by name
        const searchResult = await searchLeadCustomField(leadId, fieldKey, config);
        if (searchResult.success && searchResult.field) {
          fieldId = searchResult.field.field_id;
        } else {
          // Try to find in name map
          const lowerKey = fieldKey.toLowerCase();
          fieldId = nameToIdMap.get(lowerKey);
        }
      }

      if (fieldId) {
        // Before adding, check if this might be a select field and try to map text → enum_id
        // This prevents "NotSupportedChoice" errors
        const optionsResult = await getSelectFieldOptions(fieldId, config);
        
        if (optionsResult.success && optionsResult.options && optionsResult.options.length > 0) {
          // This is a select field - try to match the provided value
          const searchValue = String(value).toLowerCase().trim();
          // Normalize: remove special chars, extra spaces
          const normalize = (s: string) => s.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
          const normalizedSearch = normalize(searchValue);
          
          const matchedOption = optionsResult.options.find(opt => {
            const optValue = opt.value.toLowerCase().trim();
            const normalizedOpt = normalize(optValue);
            
            // Exact match
            if (optValue === searchValue || normalizedOpt === normalizedSearch) {
              return true;
            }
            
            // Contains match (either direction)
            if (optValue.includes(searchValue) || searchValue.includes(optValue)) {
              return true;
            }
            
            // Normalized contains match
            if (normalizedOpt.includes(normalizedSearch) || normalizedSearch.includes(normalizedOpt)) {
              return true;
            }
            
            // Word-based match: check if all significant words from search are in option
            const searchWords = normalizedSearch.split(/\s+/).filter(w => w.length > 2);
            if (searchWords.length > 0) {
              const allWordsMatch = searchWords.every(word => normalizedOpt.includes(word));
              if (allWordsMatch) {
                return true;
              }
            }
            
            return false;
          });
          
          if (matchedOption) {
            // Found a match - use enum_id with value
            customFieldsValues.push({
              field_id: fieldId,
              values: [{
                value: matchedOption.value,
                enum_id: matchedOption.enum_id,
              }],
            });
          } else {
            // No match found - add to errors with suggestions
            const suggestions = optionsResult.options.slice(0, 5).map(opt => opt.value).join(', ');
            errors.push({
              field: fieldKey,
              error: `Value "${value}" is not valid for select field "${optionsResult.fieldName || fieldId}". Valid options include: ${suggestions}${optionsResult.options.length > 5 ? '...' : ''}`,
            });
          }
        } else {
          // Not a select field or couldn't get options - use value as-is
          customFieldsValues.push({
            field_id: fieldId,
            values: [{ value: String(value) }],
          });
        }
      } else {
        // Even if not found, try to use as ID if it looks like a number
        // This handles cases where the field exists but has no value yet
        const numericKey = typeof fieldKey === 'number' ? fieldKey : Number(fieldKey);
        if (!isNaN(numericKey)) {
          // Try to get options for this field ID to see if it's a select field
          const optionsResult = await getSelectFieldOptions(numericKey, config);
          
          if (optionsResult.success && optionsResult.options && optionsResult.options.length > 0) {
            // This is a select field - try to match the provided value
            const searchValue = String(value).toLowerCase().trim();
            // Normalize: remove special chars, extra spaces
            const normalize = (s: string) => s.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
            const normalizedSearch = normalize(searchValue);
            
            const matchedOption = optionsResult.options.find(opt => {
              const optValue = opt.value.toLowerCase().trim();
              const normalizedOpt = normalize(optValue);
              
              // Exact match
              if (optValue === searchValue || normalizedOpt === normalizedSearch) {
                return true;
              }
              
              // Contains match (either direction)
              if (optValue.includes(searchValue) || searchValue.includes(optValue)) {
                return true;
              }
              
              // Normalized contains match
              if (normalizedOpt.includes(normalizedSearch) || normalizedSearch.includes(normalizedOpt)) {
                return true;
              }
              
              // Word-based match: check if all significant words from search are in option
              const searchWords = normalizedSearch.split(/\s+/).filter(w => w.length > 2);
              if (searchWords.length > 0) {
                const allWordsMatch = searchWords.every(word => normalizedOpt.includes(word));
                if (allWordsMatch) {
                  return true;
                }
              }
              
              return false;
            });
            
            if (matchedOption) {
              // Found a match - use enum_id with value
              customFieldsValues.push({
                field_id: numericKey,
                values: [{
                  value: matchedOption.value,
                  enum_id: matchedOption.enum_id,
                }],
              });
            } else {
              // No match found - add to errors with suggestions
              const suggestions = optionsResult.options.slice(0, 5).map(opt => opt.value).join(', ');
              errors.push({
                field: fieldKey,
                error: `Value "${value}" is not valid for select field "${optionsResult.fieldName || numericKey}". Valid options include: ${suggestions}${optionsResult.options.length > 5 ? '...' : ''}`,
              });
            }
          } else {
            // Not a select field or couldn't get options - use value as-is
            customFieldsValues.push({
              field_id: numericKey,
              values: [{ value: String(value) }],
            });
          }
        } else {
          errors.push({
            field: fieldKey,
            error: `Field not found: ${fieldKey}. Field may not exist or may not have a value yet (Kommo API limitation). Try using the field ID directly.`,
          });
        }
      }
    }

    // If we have fields to update, try to update the lead
    if (customFieldsValues.length > 0) {
      let updateResult = await updateLead(
        leadId,
        { custom_fields_values: customFieldsValues },
        config
      );

      // Note: We now map text → enum_id BEFORE attempting the update,
      // so "NotSupportedChoice" errors should be rare. But if one occurs,
      // it means the field wasn't detected as select or the mapping failed.

      if (!updateResult.success) {
        return {
          success: false,
          error: updateResult.error,
          updatedFields: 0,
          errors: errors.length > 0 ? errors : undefined,
        };
      }

      return {
        success: true,
        updatedFields: customFieldsValues.length,
        errors: errors.length > 0 ? errors : undefined,
      };
    }

    return {
      success: false,
      updatedFields: 0,
      errors,
      error: 'No fields could be mapped to field IDs',
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      error: `Update lead custom fields error: ${message}`,
    };
  }
}

/**
 * Update lead status.
 */
export async function updateLeadStatus(
  leadId: number,
  statusId: number,
  config: KommoConfig
): Promise<LeadWriteResult> {
  return updateLead(leadId, { status_id: statusId }, config);
}

/**
 * Link a lead to a contact.
 * 
 * This function checks for existing links first to avoid errors.
 * If the contact is already linked, it returns success without making a new request.
 * 
 * **Recommended:** Use `_embedded.contacts` when creating the lead instead of calling this function.
 * 
 * @param leadId - Lead ID
 * @param contactId - Contact ID to link
 * @param config - Kommo API configuration
 * @returns Success status
 */
export async function linkLeadToContact(
  leadId: number,
  contactId: number,
  config: KommoConfig
): Promise<{ success: boolean; error?: string }> {
  try {
    // First, check if the contact is already linked
    const linksResponse = await kommoRequest<{
      _embedded?: {
        links?: Array<{
          to_entity_id: number;
          to_entity_type: string;
        }>;
      };
    }>(
      `/leads/${leadId}/links`,
      config,
      {
        method: 'GET',
      }
    );

    // Check if contact is already linked
    const existingLinks = linksResponse?._embedded?.links ?? [];
    const isAlreadyLinked = existingLinks.some(
      (link) => link.to_entity_id === contactId && link.to_entity_type === 'contacts'
    );

    if (isAlreadyLinked) {
      // Contact is already linked, return success
      return {
        success: true,
      };
    }

    // Contact is not linked, create the link
    await kommoRequest(
      `/leads/${leadId}/link`,
      config,
      {
        method: 'POST',
        body: {
          to_entity_id: contactId,
          to_entity_type: 'contacts',
        },
      }
    );

    return {
      success: true,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      error: `Link lead to contact error: ${message}`,
    };
  }
}

/**
 * Link a product (catalog element) to a lead.
 * 
 * This function checks for existing links first to avoid errors.
 * If the product is already linked, it returns success without making a new request.
 * 
 * @param leadId - Lead ID
 * @param productElementId - Catalog element (product) ID to link
 * @param catalogId - Catalog ID (required for metadata)
 * @param quantity - Quantity of the product (optional, defaults to 1)
 * @param config - Kommo API configuration
 * @returns Success status
 */
export async function linkProductToLead(
  leadId: number,
  productElementId: number,
  catalogId: number,
  quantity: number = 1,
  config: KommoConfig
): Promise<{ success: boolean; error?: string }> {
  try {
    // First, check if the product is already linked
    const linksResponse = await kommoRequest<{
      _embedded?: {
        links?: Array<{
          to_entity_id: number;
          to_entity_type: string;
        }>;
      };
    }>(
      `/leads/${leadId}/links`,
      config,
      {
        method: 'GET',
      }
    );

    // Check if product is already linked
    const existingLinks = linksResponse?._embedded?.links ?? [];
    const isAlreadyLinked = existingLinks.some(
      (link) => link.to_entity_id === productElementId && link.to_entity_type === 'catalog_elements'
    );

    if (isAlreadyLinked) {
      // Product is already linked, return success
      return {
        success: true,
      };
    }

    // Product is not linked, create the link
    // IMPORTANT: Kommo API expects an ARRAY of link objects, not a single object
    await kommoRequest(
      `/leads/${leadId}/link`,
      config,
      {
        method: 'POST',
        body: [
          {
            to_entity_id: productElementId,
            to_entity_type: 'catalog_elements',
            metadata: {
              quantity: quantity,
              catalog_id: catalogId,
            },
          },
        ],
      }
    );

    return {
      success: true,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      error: `Link product to lead error: ${message}`,
    };
  }
}

/**
 * Unlink a product (catalog element) from a lead.
 * 
 * @param leadId - Lead ID
 * @param productElementId - Catalog element (product) ID to unlink
 * @param config - Kommo API configuration
 * @returns Success status
 */
export async function unlinkProductFromLead(
  leadId: number,
  productElementId: number,
  config: KommoConfig
): Promise<{ success: boolean; error?: string }> {
  try {
    // IMPORTANT: Kommo API expects an ARRAY of link objects, not a single object
    await kommoRequest(
      `/leads/${leadId}/unlink`,
      config,
      {
        method: 'POST',
        body: [
          {
            to_entity_id: productElementId,
            to_entity_type: 'catalog_elements',
          },
        ],
      }
    );

    return {
      success: true,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      error: `Unlink product from lead error: ${message}`,
    };
  }
}
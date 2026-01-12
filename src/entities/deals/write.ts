/**
 * Kommo CRM - Deals Write Operations
 * 
 * All write operations for Deals entity.
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import { kommoRequest, type KommoConfig } from '../../client.js';
import { kommoDealSchema, type KommoDeal } from './types.js';
import { z } from 'zod';

/**
 * Data for creating a new deal.
 */
export const createDealDataSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().optional(),
  responsible_user_id: z.number().optional(),
  group_id: z.number().optional(),
  status_id: z.number().optional(),
  pipeline_id: z.number().optional(),
  stage_id: z.number().optional(),
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

export type CreateDealData = z.infer<typeof createDealDataSchema>;

/**
 * Data for updating a deal.
 */
export const updateDealDataSchema = createDealDataSchema.partial();

export type UpdateDealData = z.infer<typeof updateDealDataSchema>;

/**
 * Result of a create/update deal operation.
 */
export interface DealWriteResult {
  success: boolean;
  deal?: KommoDeal;
  dealId?: number;
  error?: string;
}

/**
 * Create a new deal in Kommo CRM.
 */
export async function createDeal(
  data: CreateDealData,
  config: KommoConfig
): Promise<DealWriteResult> {
  const validatedData = createDealDataSchema.parse(data);
  
  try {
    const response = await kommoRequest<{ _embedded: { leads: KommoDeal[] } }>(
      '/leads',
      config,
      {
        method: 'POST',
        body: [validatedData],
      }
    );

    const deal = response?._embedded?.leads?.[0];

    if (!deal) {
      return {
        success: false,
        error: 'Failed to create deal: No deal returned in response',
      };
    }

    return {
      success: true,
      deal,
      dealId: deal.id,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      error: `Create deal error: ${message}`,
    };
  }
}

/**
 * Update an existing deal in Kommo CRM.
 */
export async function updateDeal(
  dealId: number,
  data: UpdateDealData,
  config: KommoConfig
): Promise<DealWriteResult> {
  const validatedData = updateDealDataSchema.parse(data);
  
  try {
    const response = await kommoRequest<{ _embedded: { leads: KommoDeal[] } }>(
      '/leads',
      config,
      {
        method: 'PATCH',
        body: [{
          id: dealId,
          ...validatedData,
        }],
      }
    );

    const deal = response?._embedded?.leads?.[0];

    if (!deal) {
      return {
        success: false,
        error: 'Failed to update deal: No deal returned in response',
      };
    }

    return {
      success: true,
      deal,
      dealId: deal.id,
    };

  } catch (error) {
    if (error instanceof Error && 'statusCode' in error && (error as { statusCode: number }).statusCode === 404) {
      return {
        success: false,
        error: `Deal with ID ${dealId} not found`,
      };
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      error: `Update deal error: ${message}`,
    };
  }
}

/**
 * Update deal stage.
 */
export async function updateDealStage(
  dealId: number,
  stageId: number,
  config: KommoConfig
): Promise<DealWriteResult> {
  return updateDeal(dealId, { stage_id: stageId }, config);
}

/**
 * Link a deal to a contact.
 * 
 * This function checks for existing links first to avoid errors.
 * If the contact is already linked, it returns success without making a new request.
 * 
 * **Recommended:** Use `_embedded.contacts` when creating the deal instead of calling this function.
 * 
 * @param dealId - Deal ID
 * @param contactId - Contact ID to link
 * @param config - Kommo API configuration
 * @returns Success status
 */
export async function linkDealToContact(
  dealId: number,
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
      `/leads/${dealId}/links`,
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
      `/leads/${dealId}/link`,
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
      error: `Link deal to contact error: ${message}`,
    };
  }
}

/**
 * Link a deal to a company.
 */
export async function linkDealToCompany(
  dealId: number,
  companyId: number,
  config: KommoConfig
): Promise<{ success: boolean; error?: string }> {
  try {
    await kommoRequest(
      `/leads/${dealId}/link`,
      config,
      {
        method: 'POST',
        body: {
          to_entity_id: companyId,
          to_entity_type: 'companies',
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
      error: `Link deal to company error: ${message}`,
    };
  }
}

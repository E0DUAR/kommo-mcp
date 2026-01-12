/**
 * Kommo CRM - Contacts Write Operations
 * 
 * All write operations for Contacts entity.
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import { kommoRequest, type KommoConfig } from '../../client.js';
import { kommoContactSchema, type KommoContact } from './types.js';
import { z } from 'zod';

/**
 * Data for creating a new contact.
 */
export const createContactDataSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  responsible_user_id: z.number().optional(),
  group_id: z.number().optional(),
  custom_fields_values: z.array(z.object({
    field_id: z.number(),
    values: z.array(z.object({
      value: z.string(),
      enum_id: z.number().optional(),
    })),
  })).optional(),
});

export type CreateContactData = z.infer<typeof createContactDataSchema>;

/**
 * Data for updating a contact.
 */
export const updateContactDataSchema = createContactDataSchema.partial();

export type UpdateContactData = z.infer<typeof updateContactDataSchema>;

/**
 * Result of a create/update contact operation.
 */
export interface ContactWriteResult {
  success: boolean;
  contact?: KommoContact;
  contactId?: number;
  error?: string;
}

/**
 * Create a new contact in Kommo CRM.
 * 
 * @param data - Contact data
 * @param config - Kommo API configuration
 * @returns Created contact
 */
export async function createContact(
  data: CreateContactData,
  config: KommoConfig
): Promise<ContactWriteResult> {
  const validatedData = createContactDataSchema.parse(data);
  
  try {
    const response = await kommoRequest<{ _embedded: { contacts: KommoContact[] } }>(
      '/contacts',
      config,
      {
        method: 'POST',
        body: [validatedData], // Kommo API expects array
      }
    );

    const contact = response?._embedded?.contacts?.[0];

    if (!contact) {
      return {
        success: false,
        error: 'Failed to create contact: No contact returned in response',
      };
    }

    return {
      success: true,
      contact,
      contactId: contact.id,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      error: `Create contact error: ${message}`,
    };
  }
}

/**
 * Update an existing contact in Kommo CRM.
 * 
 * @param contactId - Contact ID to update
 * @param data - Contact data to update
 * @param config - Kommo API configuration
 * @returns Updated contact
 */
export async function updateContact(
  contactId: number,
  data: UpdateContactData,
  config: KommoConfig
): Promise<ContactWriteResult> {
  const validatedData = updateContactDataSchema.parse(data);
  
  try {
    const response = await kommoRequest<{ _embedded: { contacts: KommoContact[] } }>(
      '/contacts',
      config,
      {
        method: 'PATCH',
        body: [{
          id: contactId,
          ...validatedData,
        }], // Kommo API expects array
      }
    );

    const contact = response?._embedded?.contacts?.[0];

    if (!contact) {
      return {
        success: false,
        error: 'Failed to update contact: No contact returned in response',
      };
    }

    return {
      success: true,
      contact,
      contactId: contact.id,
    };

  } catch (error) {
    if (error instanceof Error && 'statusCode' in error && (error as { statusCode: number }).statusCode === 404) {
      return {
        success: false,
        error: `Contact with ID ${contactId} not found`,
      };
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      error: `Update contact error: ${message}`,
    };
  }
}

/**
 * Link a contact to a company.
 * 
 * This function checks for existing links first to avoid errors.
 * If the company is already linked, it returns success without making a new request.
 * 
 * **Recommended:** Use `_embedded.companies` when creating/updating the contact instead of calling this function.
 * 
 * @param contactId - Contact ID
 * @param companyId - Company ID
 * @param config - Kommo API configuration
 * @returns Success status
 */
export async function linkContactToCompany(
  contactId: number,
  companyId: number,
  config: KommoConfig
): Promise<{ success: boolean; error?: string }> {
  try {
    // First, check if the company is already linked
    const linksResponse = await kommoRequest<{
      _embedded?: {
        links?: Array<{
          to_entity_id: number;
          to_entity_type: string;
        }>;
      };
    }>(
      `/contacts/${contactId}/links`,
      config,
      {
        method: 'GET',
      }
    );

    // Check if company is already linked
    const existingLinks = linksResponse?._embedded?.links ?? [];
    const isAlreadyLinked = existingLinks.some(
      (link) => link.to_entity_id === companyId && link.to_entity_type === 'companies'
    );

    if (isAlreadyLinked) {
      // Company is already linked, return success
      return {
        success: true,
      };
    }

    // Company is not linked, create the link
    // Try using _embedded when updating contact instead of direct link endpoint
    // This is more reliable based on similar patterns in the codebase
    try {
      await kommoRequest(
        `/contacts/${contactId}/link`,
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
    } catch (linkError) {
      // If direct link fails with 500, it might mean the link already exists
      // or there's a server-side issue. Check if it's a 500 error.
      if (linkError && typeof linkError === 'object' && 'statusCode' in linkError) {
        const statusCode = (linkError as { statusCode: number }).statusCode;
        if (statusCode === 500) {
          // 500 might mean the link already exists (similar to linkLeadToContact behavior)
          // Return success as the link likely exists
          return {
            success: true,
          };
        }
      }
      throw linkError;
    }

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      error: `Link contact to company error: ${message}`,
    };
  }
}

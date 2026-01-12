/**
 * Kommo CRM - Contacts Read Operations
 * 
 * All read operations for Contacts entity.
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import { kommoRequest, normalizePhone, type KommoConfig } from '../../client.js';
import {
  searchContactByPhoneParamsSchema,
  searchContactByEmailParamsSchema,
  getContactParamsSchema,
  listContactsFiltersSchema,
  type SearchContactByPhoneParams,
  type SearchContactByEmailParams,
  type GetContactParams,
  type ListContactsFilters,
  type SearchContactResult,
  type GetContactResult,
  type ListContactsResult,
  type KommoContact,
  type CustomFieldValue,
} from './types.js';
import { normalizePagination, type KommoPaginatedResponse } from '../../utils/pagination.js';

/**
 * Search for contacts in Kommo CRM by phone number.
 * 
 * @param params - Search parameters (phone number, optional name)
 * @param config - Kommo API configuration
 * @returns Search results with matching contacts
 */
export async function searchContactByPhone(
  params: SearchContactByPhoneParams,
  config: KommoConfig
): Promise<SearchContactResult> {
  const validatedParams = searchContactByPhoneParamsSchema.parse(params);
  
  try {
    // Normalize phone number for searching
    const normalizedPhone = normalizePhone(validatedParams.phone);

    // Build query
    let query = normalizedPhone;
    if (validatedParams.name) {
      query = `${validatedParams.name} ${normalizedPhone}`;
    }

    // Make API request
    const data = await kommoRequest<KommoPaginatedResponse<KommoContact>>(
      '/contacts',
      config,
      {
        method: 'GET',
        query: { query },
      }
    );

    // Handle 204 No Content (null response)
    if (data === null) {
      return {
        success: true,
        contacts: [],
        totalFound: 0,
      };
    }

    // Extract contacts from _embedded
    const contacts: KommoContact[] = data._embedded?.contacts ?? [];
    const totalFound = contacts.length;

    return {
      success: true,
      contacts,
      totalFound,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      contacts: [],
      totalFound: 0,
      error: `Search error: ${message}`,
    };
  }
}

/**
 * Search for contacts in Kommo CRM by email address.
 * 
 * @param params - Search parameters (email)
 * @param config - Kommo API configuration
 * @returns Search results with matching contacts
 */
export async function searchContactByEmail(
  params: SearchContactByEmailParams,
  config: KommoConfig
): Promise<SearchContactResult> {
  const validatedParams = searchContactByEmailParamsSchema.parse(params);
  
  try {
    // Make API request
    const data = await kommoRequest<KommoPaginatedResponse<KommoContact>>(
      '/contacts',
      config,
      {
        method: 'GET',
        query: { query: validatedParams.email },
      }
    );

    // Handle 204 No Content
    if (data === null) {
      return {
        success: true,
        contacts: [],
        totalFound: 0,
      };
    }

    // Extract contacts from _embedded
    const contacts: KommoContact[] = data._embedded?.contacts ?? [];
    const totalFound = contacts.length;

    return {
      success: true,
      contacts,
      totalFound,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      contacts: [],
      totalFound: 0,
      error: `Search error: ${message}`,
    };
  }
}

/**
 * Get detailed information about a specific contact by ID.
 * 
 * @param params - Get parameters (contact ID)
 * @param config - Kommo API configuration
 * @returns Contact data if found
 */
export async function getContact(
  params: GetContactParams,
  config: KommoConfig
): Promise<GetContactResult> {
  const validatedParams = getContactParamsSchema.parse(params);
  
  try {
    // Make API request
    const contact = await kommoRequest<KommoContact>(
      `/contacts/${validatedParams.contactId}`,
      config,
      {
        method: 'GET',
      }
    );

    if (!contact) {
      return {
        success: false,
        error: `Contact with ID ${validatedParams.contactId} not found`,
      };
    }

    return {
      success: true,
      contact,
    };

  } catch (error) {
    if (error instanceof Error && 'statusCode' in error && (error as { statusCode: number }).statusCode === 404) {
      return {
        success: false,
        error: `Contact with ID ${validatedParams.contactId} not found`,
      };
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      error: `Get contact error: ${message}`,
    };
  }
}

/**
 * List contacts with optional filters and pagination.
 * 
 * @param filters - Optional filters and pagination
 * @param config - Kommo API configuration
 * @returns List of contacts
 */
export async function listContacts(
  filters: ListContactsFilters | undefined,
  config: KommoConfig
): Promise<ListContactsResult> {
  const validatedFilters = listContactsFiltersSchema.parse(filters ?? {});
  
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
    if (validatedFilters.group_id !== undefined) {
      query.group_id = validatedFilters.group_id;
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
    const data = await kommoRequest<KommoPaginatedResponse<KommoContact>>(
      '/contacts',
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
        contacts: [],
        totalFound: 0,
        page,
      };
    }

    // Extract contacts from _embedded
    const contacts: KommoContact[] = data._embedded?.contacts ?? [];
    const totalFound = data._page?.total_items ?? contacts.length;
    const totalPages = data._page?.total_pages ?? 1;

    return {
      success: true,
      contacts,
      totalFound,
      page,
      totalPages,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      contacts: [],
      totalFound: 0,
      error: `List contacts error: ${message}`,
    };
  }
}

/**
 * Get custom fields for a specific contact.
 * This is a helper function that extracts custom fields from a contact.
 * 
 * @param contactId - Contact ID
 * @param config - Kommo API configuration
 * @returns Custom fields data
 */
export async function getContactCustomFields(
  contactId: number,
  config: KommoConfig
): Promise<{
  success: boolean;
  customFields?: CustomFieldValue[];
  error?: string;
}> {
  try {
    // Get the contact first to extract custom fields
    const result = await getContact({ contactId }, config);
    
    if (!result.success || !result.contact) {
      return {
        success: false,
        error: result.error ?? `Contact with ID ${contactId} not found`,
      };
    }

    return {
      success: true,
      customFields: result.contact.custom_fields_values ?? [],
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      error: `Get custom fields error: ${message}`,
    };
  }
}

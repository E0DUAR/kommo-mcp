/**
 * Kommo CRM - Catalog Elements (Products) Read Operations
 * 
 * All read operations for Catalog Elements entity.
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import { kommoRequest, type KommoConfig } from '../../client.js';
import {
  listCatalogElementsParamsSchema,
  getCatalogElementParamsSchema,
  searchCatalogElementParamsSchema,
  type ListCatalogElementsParams,
  type GetCatalogElementParams,
  type SearchCatalogElementParams,
  type ListCatalogElementsResult,
  type GetCatalogElementResult,
  type SearchCatalogElementResult,
  type KommoCatalogElement,
} from './types.js';
import { normalizePagination, type KommoPaginatedResponse } from '../../utils/pagination.js';

/**
 * List all elements (products) in a catalog.
 * 
 * @param params - List parameters (catalog ID, pagination)
 * @param config - Kommo API configuration
 * @returns List of catalog elements
 */
export async function listCatalogElements(
  params: ListCatalogElementsParams,
  config: KommoConfig
): Promise<ListCatalogElementsResult> {
  const validatedParams = listCatalogElementsParamsSchema.parse(params);
  
  try {
    // Normalize pagination
    const { page, limit } = normalizePagination({
      page: validatedParams.page,
      limit: validatedParams.limit,
    });

    // Build query parameters
    const query: Record<string, string | number> = {
      page,
      limit,
    };

    // Make API request
    const data = await kommoRequest<KommoPaginatedResponse<KommoCatalogElement>>(
      `/catalogs/${validatedParams.catalogId}/elements`,
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
        elements: [],
        totalFound: 0,
        page,
      };
    }

    // Extract elements from _embedded
    const elements: KommoCatalogElement[] = data._embedded?.elements ?? [];
    const totalFound = data._page?.total_items ?? elements.length;
    const totalPages = data._page?.total_pages ?? 1;

    return {
      success: true,
      elements,
      totalFound,
      page,
      totalPages,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      elements: [],
      totalFound: 0,
      error: `List catalog elements error: ${message}`,
    };
  }
}

/**
 * Get detailed information about a specific catalog element (product) by ID.
 * 
 * @param params - Get parameters (catalog ID, element ID)
 * @param config - Kommo API configuration
 * @returns Catalog element data if found
 */
export async function getCatalogElement(
  params: GetCatalogElementParams,
  config: KommoConfig
): Promise<GetCatalogElementResult> {
  const validatedParams = getCatalogElementParamsSchema.parse(params);
  
  try {
    // Try to get from list first (Kommo might not have direct GET endpoint)
    const listResult = await listCatalogElements(
      { catalogId: validatedParams.catalogId, limit: 250 },
      config
    );

    if (!listResult.success) {
      return {
        success: false,
        error: listResult.error ?? 'Failed to list catalog elements',
      };
    }

    // Find the element by ID
    const element = listResult.elements.find(e => e.id === validatedParams.elementId);

    if (!element) {
      return {
        success: false,
        error: `Catalog element with ID ${validatedParams.elementId} not found in catalog ${validatedParams.catalogId}`,
      };
    }

    return {
      success: true,
      element,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      error: `Get catalog element error: ${message}`,
    };
  }
}

/**
 * Search for catalog elements (products) by name.
 * 
 * @param params - Search parameters (catalog ID, query string)
 * @param config - Kommo API configuration
 * @returns Search results with matching catalog elements
 */
export async function searchCatalogElement(
  params: SearchCatalogElementParams,
  config: KommoConfig
): Promise<SearchCatalogElementResult> {
  const validatedParams = searchCatalogElementParamsSchema.parse(params);
  
  try {
    // List all elements in the catalog
    const listResult = await listCatalogElements(
      { catalogId: validatedParams.catalogId, limit: 250 },
      config
    );

    if (!listResult.success) {
      return {
        success: false,
        elements: [],
        totalFound: 0,
        error: listResult.error,
      };
    }

    // Filter by name (case-insensitive partial match)
    const searchQuery = validatedParams.query.toLowerCase();
    const matchingElements = listResult.elements.filter(element => {
      const elementName = element.name?.toLowerCase() || '';
      return elementName.includes(searchQuery);
    });

    return {
      success: true,
      elements: matchingElements,
      totalFound: matchingElements.length,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      elements: [],
      totalFound: 0,
      error: `Search catalog element error: ${message}`,
    };
  }
}

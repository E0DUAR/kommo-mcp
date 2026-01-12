/**
 * Kommo CRM - Catalogs Read Operations
 * 
 * All read operations for Catalogs entity.
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import { kommoRequest, type KommoConfig } from '../../client.js';
import {
  getCatalogParamsSchema,
  searchCatalogParamsSchema,
  getCatalogCustomFieldsParamsSchema,
  type GetCatalogParams,
  type SearchCatalogParams,
  type GetCatalogCustomFieldsParams,
  type ListCatalogsResult,
  type GetCatalogResult,
  type SearchCatalogResult,
  type GetCatalogCustomFieldsResult,
  type KommoCatalog,
  type KommoCatalogCustomField,
} from './types.js';
import { type KommoPaginatedResponse } from '../../utils/pagination.js';

/**
 * List all catalogs in Kommo CRM.
 * 
 * @param config - Kommo API configuration
 * @returns List of all catalogs
 */
export async function listCatalogs(
  config: KommoConfig
): Promise<ListCatalogsResult> {
  try {
    const data = await kommoRequest<KommoPaginatedResponse<KommoCatalog> | KommoCatalog[]>(
      '/catalogs',
      config,
      {
        method: 'GET',
      }
    );

    // Handle 204 No Content
    if (data === null) {
      return {
        success: true,
        catalogs: [],
        totalFound: 0,
      };
    }

    // Handle different response formats
    let catalogs: KommoCatalog[] = [];
    if (Array.isArray(data)) {
      catalogs = data;
    } else if ('_embedded' in data && data._embedded?.catalogs) {
      catalogs = data._embedded.catalogs;
    } else if ('_embedded' in data && Array.isArray(data._embedded)) {
      catalogs = data._embedded as KommoCatalog[];
    }

    const totalFound = catalogs.length;

    return {
      success: true,
      catalogs,
      totalFound,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      catalogs: [],
      totalFound: 0,
      error: `List catalogs error: ${message}`,
    };
  }
}

/**
 * Get detailed information about a specific catalog by ID.
 * 
 * @param params - Get parameters (catalog ID)
 * @param config - Kommo API configuration
 * @returns Catalog data if found
 */
export async function getCatalog(
  params: GetCatalogParams,
  config: KommoConfig
): Promise<GetCatalogResult> {
  const validatedParams = getCatalogParamsSchema.parse(params);
  
  try {
    const catalog = await kommoRequest<KommoCatalog>(
      `/catalogs/${validatedParams.catalogId}`,
      config,
      {
        method: 'GET',
      }
    );

    if (!catalog) {
      return {
        success: false,
        error: `Catalog with ID ${validatedParams.catalogId} not found`,
      };
    }

    return {
      success: true,
      catalog,
    };

  } catch (error) {
    if (error instanceof Error && 'statusCode' in error && (error as { statusCode: number }).statusCode === 404) {
      return {
        success: false,
        error: `Catalog with ID ${validatedParams.catalogId} not found`,
      };
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      error: `Get catalog error: ${message}`,
    };
  }
}

/**
 * Search for catalogs by name and/or type.
 * 
 * @param params - Search parameters (name, optional type)
 * @param config - Kommo API configuration
 * @returns Search results with matching catalogs
 */
export async function searchCatalog(
  params: SearchCatalogParams,
  config: KommoConfig
): Promise<SearchCatalogResult> {
  const validatedParams = searchCatalogParamsSchema.parse(params);
  
  try {
    // First, list all catalogs
    const listResult = await listCatalogs(config);
    
    if (!listResult.success) {
      return {
        success: false,
        catalogs: [],
        totalFound: 0,
        error: listResult.error,
      };
    }

    // Filter by name and/or type (case-insensitive partial match)
    const searchName = validatedParams.name.toLowerCase();
    const matchingCatalogs = listResult.catalogs.filter(catalog => {
      const catalogName = catalog.name?.toLowerCase() || '';
      const nameMatch = catalogName.includes(searchName);
      
      if (validatedParams.type) {
        const catalogType = catalog.type?.toLowerCase() || '';
        const typeMatch = catalogType === validatedParams.type.toLowerCase();
        return nameMatch && typeMatch;
      }
      
      return nameMatch;
    });

    return {
      success: true,
      catalogs: matchingCatalogs,
      totalFound: matchingCatalogs.length,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      catalogs: [],
      totalFound: 0,
      error: `Search catalog error: ${message}`,
    };
  }
}

/**
 * Get custom fields (field definitions) for a catalog.
 * This is useful for understanding what fields are available for catalog elements (products).
 * 
 * @param params - Get parameters (catalog ID)
 * @param config - Kommo API configuration
 * @returns Custom fields definitions for the catalog
 */
export async function getCatalogCustomFields(
  params: GetCatalogCustomFieldsParams,
  config: KommoConfig
): Promise<GetCatalogCustomFieldsResult> {
  const validatedParams = getCatalogCustomFieldsParamsSchema.parse(params);
  
  try {
    const response = await kommoRequest<{
      _embedded?: {
        custom_fields?: KommoCatalogCustomField[];
      };
    }>(
      `/catalogs/${validatedParams.catalogId}/custom_fields`,
      config,
      {
        method: 'GET',
      }
    );

    const customFields = response?._embedded?.custom_fields;

    if (!customFields || !Array.isArray(customFields)) {
      return {
        success: false,
        error: 'Invalid response format from custom fields endpoint: missing _embedded.custom_fields',
      };
    }

    return {
      success: true,
      customFields,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      error: `Get catalog custom fields error: ${message}`,
    };
  }
}

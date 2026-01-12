/**
 * Kommo CRM - Companies Read Operations
 * 
 * All read operations for Companies entity.
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import { kommoRequest, type KommoConfig } from '../../client.js';
import {
  searchCompanyParamsSchema,
  getCompanyParamsSchema,
  listCompaniesFiltersSchema,
  type SearchCompanyParams,
  type GetCompanyParams,
  type ListCompaniesFilters,
  type SearchCompanyResult,
  type GetCompanyResult,
  type ListCompaniesResult,
  type KommoCompany,
} from './types.js';
import { normalizePagination, type KommoPaginatedResponse } from '../../utils/pagination.js';

/**
 * Search for companies in Kommo CRM.
 * 
 * @param params - Search parameters (query string)
 * @param config - Kommo API configuration
 * @returns Search results with matching companies
 */
export async function searchCompany(
  params: SearchCompanyParams,
  config: KommoConfig
): Promise<SearchCompanyResult> {
  const validatedParams = searchCompanyParamsSchema.parse(params);
  
  try {
    const data = await kommoRequest<KommoPaginatedResponse<KommoCompany>>(
      '/companies',
      config,
      {
        method: 'GET',
        query: { query: validatedParams.query },
      }
    );

    if (data === null) {
      return {
        success: true,
        companies: [],
        totalFound: 0,
      };
    }

    const companies: KommoCompany[] = data._embedded?.companies ?? [];
    const totalFound = companies.length;

    return {
      success: true,
      companies,
      totalFound,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      companies: [],
      totalFound: 0,
      error: `Search error: ${message}`,
    };
  }
}

/**
 * Get detailed information about a specific company by ID.
 */
export async function getCompany(
  params: GetCompanyParams,
  config: KommoConfig
): Promise<GetCompanyResult> {
  const validatedParams = getCompanyParamsSchema.parse(params);
  
  try {
    const company = await kommoRequest<KommoCompany>(
      `/companies/${validatedParams.companyId}`,
      config,
      {
        method: 'GET',
      }
    );

    if (!company) {
      return {
        success: false,
        error: `Company with ID ${validatedParams.companyId} not found`,
      };
    }

    return {
      success: true,
      company,
    };

  } catch (error) {
    if (error instanceof Error && 'statusCode' in error && (error as { statusCode: number }).statusCode === 404) {
      return {
        success: false,
        error: `Company with ID ${validatedParams.companyId} not found`,
      };
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      error: `Get company error: ${message}`,
    };
  }
}

/**
 * List companies with optional filters and pagination.
 */
export async function listCompanies(
  filters: ListCompaniesFilters | undefined,
  config: KommoConfig
): Promise<ListCompaniesResult> {
  const validatedFilters = listCompaniesFiltersSchema.parse(filters ?? {});
  
  try {
    const { page, limit } = normalizePagination({
      page: validatedFilters.page,
      limit: validatedFilters.limit,
    });

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

    const data = await kommoRequest<KommoPaginatedResponse<KommoCompany>>(
      '/companies',
      config,
      {
        method: 'GET',
        query,
      }
    );

    if (data === null) {
      return {
        success: true,
        companies: [],
        totalFound: 0,
        page,
      };
    }

    const companies: KommoCompany[] = data._embedded?.companies ?? [];
    const totalFound = data._page?.total_items ?? companies.length;
    const totalPages = data._page?.total_pages ?? 1;

    return {
      success: true,
      companies,
      totalFound,
      page,
      totalPages,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      companies: [],
      totalFound: 0,
      error: `List companies error: ${message}`,
    };
  }
}

/**
 * Search for a company by domain.
 */
export async function searchCompanyByDomain(
  domain: string,
  config: KommoConfig
): Promise<SearchCompanyResult> {
  return searchCompany({ query: domain }, config);
}

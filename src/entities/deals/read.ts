/**
 * Kommo CRM - Deals Read Operations
 * 
 * All read operations for Deals entity.
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import { kommoRequest, type KommoConfig } from '../../client.js';
import {
  searchDealParamsSchema,
  getDealParamsSchema,
  listDealsFiltersSchema,
  type SearchDealParams,
  type GetDealParams,
  type ListDealsFilters,
  type SearchDealResult,
  type GetDealResult,
  type ListDealsResult,
  type KommoDeal,
} from './types.js';
import { normalizePagination, type KommoPaginatedResponse } from '../../utils/pagination.js';

/**
 * Search for deals in Kommo CRM.
 */
export async function searchDeal(
  params: SearchDealParams,
  config: KommoConfig
): Promise<SearchDealResult> {
  const validatedParams = searchDealParamsSchema.parse(params);
  
  try {
    const data = await kommoRequest<KommoPaginatedResponse<KommoDeal>>(
      '/leads',
      config,
      {
        method: 'GET',
        query: { query: validatedParams.query },
      }
    );

    if (data === null) {
      return {
        success: true,
        deals: [],
        totalFound: 0,
      };
    }

    const deals: KommoDeal[] = data._embedded?.leads ?? [];
    const totalFound = deals.length;

    return {
      success: true,
      deals,
      totalFound,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      deals: [],
      totalFound: 0,
      error: `Search error: ${message}`,
    };
  }
}

/**
 * Get detailed information about a specific deal by ID.
 */
export async function getDeal(
  params: GetDealParams,
  config: KommoConfig
): Promise<GetDealResult> {
  const validatedParams = getDealParamsSchema.parse(params);
  
  try {
    const deal = await kommoRequest<KommoDeal>(
      `/leads/${validatedParams.dealId}`,
      config,
      {
        method: 'GET',
      }
    );

    if (!deal) {
      return {
        success: false,
        error: `Deal with ID ${validatedParams.dealId} not found`,
      };
    }

    return {
      success: true,
      deal,
    };

  } catch (error) {
    if (error instanceof Error && 'statusCode' in error && (error as { statusCode: number }).statusCode === 404) {
      return {
        success: false,
        error: `Deal with ID ${validatedParams.dealId} not found`,
      };
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      error: `Get deal error: ${message}`,
    };
  }
}

/**
 * List deals with optional filters and pagination.
 */
export async function listDeals(
  filters: ListDealsFilters | undefined,
  config: KommoConfig
): Promise<ListDealsResult> {
  const validatedFilters = listDealsFiltersSchema.parse(filters ?? {});
  
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
    if (validatedFilters.status_id !== undefined) {
      query.status_id = validatedFilters.status_id;
    }
    if (validatedFilters.pipeline_id !== undefined) {
      query.pipeline_id = validatedFilters.pipeline_id;
    }
    if (validatedFilters.stage_id !== undefined) {
      query.stage_id = validatedFilters.stage_id;
    }
    if (validatedFilters.group_id !== undefined) {
      query.group_id = validatedFilters.group_id;
    }
    if (validatedFilters.contact_id !== undefined) {
      query.contact_id = validatedFilters.contact_id;
    }
    if (validatedFilters.company_id !== undefined) {
      query.company_id = validatedFilters.company_id;
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

    const data = await kommoRequest<KommoPaginatedResponse<KommoDeal>>(
      '/leads',
      config,
      {
        method: 'GET',
        query,
      }
    );

    if (data === null) {
      return {
        success: true,
        deals: [],
        totalFound: 0,
        page,
      };
    }

    const deals: KommoDeal[] = data._embedded?.leads ?? [];
    const totalFound = data._page?.total_items ?? deals.length;
    const totalPages = data._page?.total_pages ?? 1;

    return {
      success: true,
      deals,
      totalFound,
      page,
      totalPages,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      deals: [],
      totalFound: 0,
      error: `List deals error: ${message}`,
    };
  }
}

/**
 * Get deals associated with a specific contact.
 */
export async function getDealsByContact(
  contactId: number,
  config: KommoConfig
): Promise<ListDealsResult> {
  return listDeals({ contact_id: contactId }, config);
}

/**
 * Get deals associated with a specific company.
 */
export async function getDealsByCompany(
  companyId: number,
  config: KommoConfig
): Promise<ListDealsResult> {
  return listDeals({ company_id: companyId }, config);
}

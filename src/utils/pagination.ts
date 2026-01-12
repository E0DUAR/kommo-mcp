/**
 * Kommo CRM - Pagination Utilities
 * 
 * Utility functions for handling pagination in Kommo API responses.
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

/**
 * Pagination parameters for list operations.
 */
export interface PaginationParams {
  /** Page number (1-based) */
  page?: number;
  /** Items per page */
  limit?: number;
}

/**
 * Normalize pagination parameters.
 */
export function normalizePagination(params?: PaginationParams): {
  page: number;
  limit: number;
} {
  const page = Math.max(1, params?.page ?? 1);
  const limit = Math.min(250, Math.max(1, params?.limit ?? 50)); // Kommo max is 250

  return { page, limit };
}

/**
 * Extract pagination info from Kommo API response.
 * Kommo API responses typically have _links with pagination info.
 */
export interface PaginationLinks {
  self?: { href: string };
  first?: { href: string };
  last?: { href: string };
  prev?: { href: string };
  next?: { href: string };
}

export interface KommoPaginatedResponse<T> {
  _embedded?: {
    [key: string]: T[];
  };
  _links?: PaginationLinks;
  _page?: {
    number: number;
    size: number;
    total_pages: number;
    total_items: number;
  };
}

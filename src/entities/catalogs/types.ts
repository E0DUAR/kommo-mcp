/**
 * Kommo CRM - Catalogs Types & Schemas
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import { z } from 'zod';

// ============================================
// Catalog Schema
// ============================================

/**
 * Kommo Catalog (List) schema.
 * Based on Kommo API v4: GET /api/v4/catalogs
 */
export const kommoCatalogSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string().optional(),
  sort: z.number().optional(),
  can_add_elements: z.boolean().optional(),
  can_link_multiple: z.boolean().optional(),
  request_id: z.string().optional(),
  _embedded: z.object({
    custom_fields: z.array(z.any()).optional(),
  }).optional(),
});

export type KommoCatalog = z.infer<typeof kommoCatalogSchema>;

// ============================================
// Catalog Custom Field Schema
// ============================================

/**
 * Kommo Catalog Custom Field schema.
 * Based on Kommo API v4: GET /api/v4/catalogs/{id}/custom_fields
 */
export const kommoCatalogCustomFieldSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string().optional(),
  type: z.string(),
  sort: z.number().optional(),
  is_api_only: z.boolean().optional(),
  enums: z.array(z.object({
    id: z.number(),
    value: z.string(),
    color: z.string().optional(),
    sort: z.number().optional(),
  })).nullable().optional(),
});

export type KommoCatalogCustomField = z.infer<typeof kommoCatalogCustomFieldSchema>;

// ============================================
// Parameter Schemas
// ============================================

export const getCatalogParamsSchema = z.object({
  catalogId: z.number().int().positive('Catalog ID must be a positive integer'),
});

export type GetCatalogParams = z.infer<typeof getCatalogParamsSchema>;

export const searchCatalogParamsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().optional(),
});

export type SearchCatalogParams = z.infer<typeof searchCatalogParamsSchema>;

export const getCatalogCustomFieldsParamsSchema = z.object({
  catalogId: z.number().int().positive('Catalog ID must be a positive integer'),
});

export type GetCatalogCustomFieldsParams = z.infer<typeof getCatalogCustomFieldsParamsSchema>;

// ============================================
// Result Types
// ============================================

export interface ListCatalogsResult {
  success: boolean;
  catalogs: KommoCatalog[];
  totalFound: number;
  error?: string;
}

export interface GetCatalogResult {
  success: boolean;
  catalog?: KommoCatalog;
  error?: string;
}

export interface SearchCatalogResult {
  success: boolean;
  catalogs: KommoCatalog[];
  totalFound: number;
  error?: string;
}

export interface GetCatalogCustomFieldsResult {
  success: boolean;
  customFields?: KommoCatalogCustomField[];
  error?: string;
}

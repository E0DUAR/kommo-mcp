/**
 * Kommo CRM - Catalog Elements (Products) Types & Schemas
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import { z } from 'zod';

// ============================================
// Catalog Element (Product) Schema
// ============================================

/**
 * Kommo Catalog Element (Product) schema.
 * Based on Kommo API v4: GET /api/v4/catalogs/{id}/elements
 */
export const kommoCatalogElementSchema = z.object({
  id: z.number(),
  name: z.string(),
  catalog_id: z.number().optional(),
  custom_fields_values: z.array(z.object({
    field_id: z.number(),
    field_name: z.string().optional(),
    field_code: z.string().optional(),
    field_type: z.string().optional(),
    values: z.array(z.object({
      value: z.string(),
      enum_id: z.number().optional(),
      enum_code: z.string().optional(),
    })),
  })).optional(),
  request_id: z.string().optional(),
});

export type KommoCatalogElement = z.infer<typeof kommoCatalogElementSchema>;

// ============================================
// Parameter Schemas
// ============================================

export const listCatalogElementsParamsSchema = z.object({
  catalogId: z.number().int().positive('Catalog ID must be a positive integer'),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(250).optional(),
});

export type ListCatalogElementsParams = z.infer<typeof listCatalogElementsParamsSchema>;

export const getCatalogElementParamsSchema = z.object({
  catalogId: z.number().int().positive('Catalog ID must be a positive integer'),
  elementId: z.number().int().positive('Element ID must be a positive integer'),
});

export type GetCatalogElementParams = z.infer<typeof getCatalogElementParamsSchema>;

export const searchCatalogElementParamsSchema = z.object({
  catalogId: z.number().int().positive('Catalog ID must be a positive integer'),
  query: z.string().min(1, 'Query is required'),
});

export type SearchCatalogElementParams = z.infer<typeof searchCatalogElementParamsSchema>;

// ============================================
// Create/Update Schemas
// ============================================

export const createCatalogElementDataSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  custom_fields_values: z.array(z.object({
    field_id: z.number(),
    values: z.array(z.object({
      value: z.string(),
      enum_id: z.number().optional(),
      enum_code: z.string().optional(),
    })),
  })).optional(),
});

export type CreateCatalogElementData = z.infer<typeof createCatalogElementDataSchema>;

export const updateCatalogElementDataSchema = createCatalogElementDataSchema.partial();

export type UpdateCatalogElementData = z.infer<typeof updateCatalogElementDataSchema>;

// ============================================
// Result Types
// ============================================

export interface ListCatalogElementsResult {
  success: boolean;
  elements: KommoCatalogElement[];
  totalFound: number;
  page?: number;
  totalPages?: number;
  error?: string;
}

export interface GetCatalogElementResult {
  success: boolean;
  element?: KommoCatalogElement;
  error?: string;
}

export interface SearchCatalogElementResult {
  success: boolean;
  elements: KommoCatalogElement[];
  totalFound: number;
  error?: string;
}

export interface CatalogElementWriteResult {
  success: boolean;
  element?: KommoCatalogElement;
  elementId?: number;
  error?: string;
}

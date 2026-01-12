/**
 * Kommo CRM - Deals Types
 * 
 * Type definitions specific to Deals/Opportunities entity.
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import { z } from 'zod';

/**
 * Kommo deal custom field value.
 */
export const dealCustomFieldValueSchema = z.object({
  field_id: z.number(),
  field_name: z.string().optional(),
  field_code: z.string().optional(),
  field_type: z.string().optional(),
  values: z.array(z.object({
    value: z.string(),
    enum_code: z.string().optional(),
    enum_id: z.number().optional(),
  })),
});

/**
 * Kommo deal data structure.
 */
export const kommoDealSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number().optional(),
  responsible_user_id: z.number().optional(),
  group_id: z.number().optional(),
  status_id: z.number().optional(),
  pipeline_id: z.number().optional(),
  stage_id: z.number().optional(),
  created_by: z.number().optional(),
  updated_by: z.number().optional(),
  created_at: z.number().optional(),
  updated_at: z.number().optional(),
  closed_at: z.number().optional(),
  closest_task_at: z.number().optional(),
  is_deleted: z.boolean().optional(),
  account_id: z.number().optional(),
  custom_fields_values: z.array(dealCustomFieldValueSchema).optional(),
  _embedded: z.object({
    contacts: z.array(z.object({ id: z.number() })).optional(),
    companies: z.array(z.object({ id: z.number() })).optional(),
  }).optional(),
});

export type KommoDeal = z.infer<typeof kommoDealSchema>;
export type DealCustomFieldValue = z.infer<typeof dealCustomFieldValueSchema>;

/**
 * Parameters for searching deals.
 */
export const searchDealParamsSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
});

export type SearchDealParams = z.infer<typeof searchDealParamsSchema>;

/**
 * Parameters for getting a deal by ID.
 */
export const getDealParamsSchema = z.object({
  dealId: z.number().int().positive('Deal ID must be a positive integer'),
});

export type GetDealParams = z.infer<typeof getDealParamsSchema>;

/**
 * Filters for listing deals.
 */
export const listDealsFiltersSchema = z.object({
  responsible_user_id: z.number().optional(),
  status_id: z.number().optional(),
  pipeline_id: z.number().optional(),
  stage_id: z.number().optional(),
  group_id: z.number().optional(),
  contact_id: z.number().optional(),
  company_id: z.number().optional(),
  created_at_from: z.number().optional(),
  created_at_to: z.number().optional(),
  updated_at_from: z.number().optional(),
  updated_at_to: z.number().optional(),
  query: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(250).optional(),
});

export type ListDealsFilters = z.infer<typeof listDealsFiltersSchema>;

/**
 * Result of a deal search operation.
 */
export const searchDealResultSchema = z.object({
  success: z.boolean(),
  deals: z.array(kommoDealSchema),
  totalFound: z.number(),
  error: z.string().optional(),
});

export type SearchDealResult = z.infer<typeof searchDealResultSchema>;

/**
 * Result of a get deal operation.
 */
export const getDealResultSchema = z.object({
  success: z.boolean(),
  deal: kommoDealSchema.optional(),
  error: z.string().optional(),
});

export type GetDealResult = z.infer<typeof getDealResultSchema>;

/**
 * Result of a list deals operation.
 */
export const listDealsResultSchema = z.object({
  success: z.boolean(),
  deals: z.array(kommoDealSchema),
  totalFound: z.number(),
  page: z.number().optional(),
  totalPages: z.number().optional(),
  error: z.string().optional(),
});

export type ListDealsResult = z.infer<typeof listDealsResultSchema>;

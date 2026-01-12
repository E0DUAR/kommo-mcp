/**
 * Kommo CRM - Companies Types
 * 
 * Type definitions specific to Companies entity.
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import { z } from 'zod';

/**
 * Kommo company custom field value.
 */
export const companyCustomFieldValueSchema = z.object({
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
 * Kommo company data structure.
 */
export const kommoCompanySchema = z.object({
  id: z.number(),
  name: z.string(),
  responsible_user_id: z.number().optional(),
  group_id: z.number().optional(),
  created_by: z.number().optional(),
  updated_by: z.number().optional(),
  created_at: z.number().optional(),
  updated_at: z.number().optional(),
  is_deleted: z.boolean().optional(),
  account_id: z.number().optional(),
  custom_fields_values: z.array(companyCustomFieldValueSchema).optional(),
});

export type KommoCompany = z.infer<typeof kommoCompanySchema>;
export type CompanyCustomFieldValue = z.infer<typeof companyCustomFieldValueSchema>;

/**
 * Parameters for searching companies.
 */
export const searchCompanyParamsSchema = z.object({
  /** Search query (name, domain, etc.) */
  query: z.string().min(1, 'Search query is required'),
});

export type SearchCompanyParams = z.infer<typeof searchCompanyParamsSchema>;

/**
 * Parameters for getting a company by ID.
 */
export const getCompanyParamsSchema = z.object({
  /** Kommo company ID */
  companyId: z.number().int().positive('Company ID must be a positive integer'),
});

export type GetCompanyParams = z.infer<typeof getCompanyParamsSchema>;

/**
 * Filters for listing companies.
 */
export const listCompaniesFiltersSchema = z.object({
  /** Filter by responsible user ID */
  responsible_user_id: z.number().optional(),
  /** Filter by group ID */
  group_id: z.number().optional(),
  /** Filter by created date (timestamp) */
  created_at_from: z.number().optional(),
  created_at_to: z.number().optional(),
  /** Filter by updated date (timestamp) */
  updated_at_from: z.number().optional(),
  updated_at_to: z.number().optional(),
  /** Search query */
  query: z.string().optional(),
  /** Page number (1-based) */
  page: z.number().int().positive().optional(),
  /** Items per page (max 250) */
  limit: z.number().int().positive().max(250).optional(),
});

export type ListCompaniesFilters = z.infer<typeof listCompaniesFiltersSchema>;

/**
 * Result of a company search operation.
 */
export const searchCompanyResultSchema = z.object({
  success: z.boolean(),
  companies: z.array(kommoCompanySchema),
  totalFound: z.number(),
  error: z.string().optional(),
});

export type SearchCompanyResult = z.infer<typeof searchCompanyResultSchema>;

/**
 * Result of a get company operation.
 */
export const getCompanyResultSchema = z.object({
  success: z.boolean(),
  company: kommoCompanySchema.optional(),
  error: z.string().optional(),
});

export type GetCompanyResult = z.infer<typeof getCompanyResultSchema>;

/**
 * Result of a list companies operation.
 */
export const listCompaniesResultSchema = z.object({
  success: z.boolean(),
  companies: z.array(kommoCompanySchema),
  totalFound: z.number(),
  page: z.number().optional(),
  totalPages: z.number().optional(),
  error: z.string().optional(),
});

export type ListCompaniesResult = z.infer<typeof listCompaniesResultSchema>;

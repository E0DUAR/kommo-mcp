/**
 * Kommo CRM - Leads Types
 * 
 * Type definitions specific to Leads entity.
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import { z } from 'zod';

/**
 * Kommo lead custom field value (similar to contacts).
 */
export const leadCustomFieldValueSchema = z.object({
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
 * Kommo lead data structure.
 */
export const kommoLeadSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  price: z.number().optional(),
  responsible_user_id: z.number().optional(),
  group_id: z.number().optional(),
  status_id: z.number().optional(),
  pipeline_id: z.number().optional(),
  created_by: z.number().optional(),
  updated_by: z.number().optional(),
  created_at: z.number().optional(),
  updated_at: z.number().optional(),
  closed_at: z.number().optional(),
  closest_task_at: z.number().optional(),
  is_deleted: z.boolean().optional(),
  account_id: z.number().optional(),
  custom_fields_values: z.array(leadCustomFieldValueSchema).optional(),
  _embedded: z.object({
    contacts: z.array(z.object({ id: z.number() })).optional(),
    companies: z.array(z.object({ id: z.number() })).optional(),
  }).optional(),
});

export type KommoLead = z.infer<typeof kommoLeadSchema>;
export type LeadCustomFieldValue = z.infer<typeof leadCustomFieldValueSchema>;

/**
 * Parameters for searching leads.
 */
export const searchLeadParamsSchema = z.object({
  /** Search query (name, phone, email, etc.) */
  query: z.string().min(1, 'Search query is required'),
});

export type SearchLeadParams = z.infer<typeof searchLeadParamsSchema>;

/**
 * Parameters for getting a lead by ID.
 */
export const getLeadParamsSchema = z.object({
  /** Kommo lead ID */
  leadId: z.number().int().positive('Lead ID must be a positive integer'),
});

export type GetLeadParams = z.infer<typeof getLeadParamsSchema>;

/**
 * Filters for listing leads.
 */
export const listLeadsFiltersSchema = z.object({
  /** Filter by responsible user ID */
  responsible_user_id: z.number().optional(),
  /** Filter by status ID */
  status_id: z.number().optional(),
  /** Filter by pipeline ID */
  pipeline_id: z.number().optional(),
  /** Filter by group ID */
  group_id: z.number().optional(),
  /** Filter by contact ID */
  contact_id: z.number().optional(),
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

export type ListLeadsFilters = z.infer<typeof listLeadsFiltersSchema>;

/**
 * Result of a lead search operation.
 */
export const searchLeadResultSchema = z.object({
  success: z.boolean(),
  leads: z.array(kommoLeadSchema),
  totalFound: z.number(),
  error: z.string().optional(),
});

export type SearchLeadResult = z.infer<typeof searchLeadResultSchema>;

/**
 * Result of a get lead operation.
 */
export const getLeadResultSchema = z.object({
  success: z.boolean(),
  lead: kommoLeadSchema.optional(),
  error: z.string().optional(),
});

export type GetLeadResult = z.infer<typeof getLeadResultSchema>;

/**
 * Result of a list leads operation.
 */
export const listLeadsResultSchema = z.object({
  success: z.boolean(),
  leads: z.array(kommoLeadSchema),
  totalFound: z.number(),
  page: z.number().optional(),
  totalPages: z.number().optional(),
  error: z.string().optional(),
});

export type ListLeadsResult = z.infer<typeof listLeadsResultSchema>;

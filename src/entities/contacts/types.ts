/**
 * Kommo CRM - Contacts Types
 * 
 * Type definitions specific to Contacts entity.
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import { z } from 'zod';

/**
 * Kommo contact custom field value.
 */
export const customFieldValueSchema = z.object({
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
 * Kommo contact data structure.
 */
export const kommoContactSchema = z.object({
  id: z.number(),
  name: z.string(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  responsible_user_id: z.number().optional(),
  group_id: z.number().optional(),
  created_by: z.number().optional(),
  updated_by: z.number().optional(),
  created_at: z.number().optional(),
  updated_at: z.number().optional(),
  is_deleted: z.boolean().optional(),
  account_id: z.number().optional(),
  custom_fields_values: z.array(customFieldValueSchema).optional(),
});

export type KommoContact = z.infer<typeof kommoContactSchema>;
export type CustomFieldValue = z.infer<typeof customFieldValueSchema>;

/**
 * Parameters for searching contacts by phone.
 */
export const searchContactByPhoneParamsSchema = z.object({
  /** Phone number to search for (with or without country code) */
  phone: z.string().min(1, 'Phone number is required'),
  
  /** Optional: Name to search for (additional filter) */
  name: z.string().optional(),
});

export type SearchContactByPhoneParams = z.infer<typeof searchContactByPhoneParamsSchema>;

/**
 * Parameters for searching contacts by email.
 */
export const searchContactByEmailParamsSchema = z.object({
  /** Email address to search for */
  email: z.string().email('Email must be a valid email address'),
});

export type SearchContactByEmailParams = z.infer<typeof searchContactByEmailParamsSchema>;

/**
 * Parameters for getting a contact by ID.
 */
export const getContactParamsSchema = z.object({
  /** Kommo contact ID */
  contactId: z.number().int().positive('Contact ID must be a positive integer'),
});

export type GetContactParams = z.infer<typeof getContactParamsSchema>;

/**
 * Filters for listing contacts.
 */
export const listContactsFiltersSchema = z.object({
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

export type ListContactsFilters = z.infer<typeof listContactsFiltersSchema>;

/**
 * Result of a contact search operation.
 */
export const searchContactResultSchema = z.object({
  /** Whether the search was successful */
  success: z.boolean(),
  
  /** Array of matching contacts */
  contacts: z.array(kommoContactSchema),
  
  /** Total number of contacts found */
  totalFound: z.number(),
  
  /** Error message if search failed */
  error: z.string().optional(),
});

export type SearchContactResult = z.infer<typeof searchContactResultSchema>;

/**
 * Result of a get contact operation.
 */
export const getContactResultSchema = z.object({
  /** Whether the operation was successful */
  success: z.boolean(),
  
  /** Contact data if found */
  contact: kommoContactSchema.optional(),
  
  /** Error message if operation failed */
  error: z.string().optional(),
});

export type GetContactResult = z.infer<typeof getContactResultSchema>;

/**
 * Result of a list contacts operation.
 */
export const listContactsResultSchema = z.object({
  /** Whether the operation was successful */
  success: z.boolean(),
  
  /** Array of contacts */
  contacts: z.array(kommoContactSchema),
  
  /** Total number of contacts */
  totalFound: z.number(),
  
  /** Current page */
  page: z.number().optional(),
  
  /** Total pages */
  totalPages: z.number().optional(),
  
  /** Error message if operation failed */
  error: z.string().optional(),
});

export type ListContactsResult = z.infer<typeof listContactsResultSchema>;

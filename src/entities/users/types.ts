/**
 * Kommo CRM - Users Types
 * 
 * Type definitions specific to Users entity.
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import { z } from 'zod';

/**
 * Kommo user data structure.
 */
export const kommoUserSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().optional(),
  lang: z.string().optional(),
  rights: z.any().optional(),
  uuid: z.string().optional(),
  role_id: z.number().optional(),
});

export type KommoUser = z.infer<typeof kommoUserSchema>;

/**
 * Parameters for getting a user by ID.
 */
export const getUserParamsSchema = z.object({
  /** Kommo user ID */
  userId: z.number().int().positive('User ID must be a positive integer'),
});

export type GetUserParams = z.infer<typeof getUserParamsSchema>;

/**
 * Parameters for listing users.
 */
export const listUsersParamsSchema = z.object({
  /** Filter by active status (not directly supported by API but useful for logic) */
  active: z.boolean().optional(),
});

export type ListUsersParams = z.infer<typeof listUsersParamsSchema>;

/**
 * Result of listing users.
 */
export const listUsersResultSchema = z.object({
  success: z.boolean(),
  users: z.array(kommoUserSchema),
  error: z.string().optional(),
});

export type ListUsersResult = z.infer<typeof listUsersResultSchema>;

/**
 * Result of getting a user.
 */
export const getUserResultSchema = z.object({
  success: z.boolean(),
  user: kommoUserSchema.optional(),
  error: z.string().optional(),
});

export type GetUserResult = z.infer<typeof getUserResultSchema>;

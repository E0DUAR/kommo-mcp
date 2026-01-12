/**
 * Kommo CRM - Tasks Types
 * 
 * Type definitions specific to Tasks entity.
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import { z } from 'zod';

/**
 * Kommo task data structure.
 */
export const kommoTaskSchema = z.object({
  id: z.number(),
  text: z.string().optional(),
  task_type_id: z.number().optional(),
  responsible_user_id: z.number().optional(),
  created_by: z.number().optional(),
  updated_by: z.number().optional(),
  created_at: z.number().optional(),
  updated_at: z.number().optional(),
  complete_till: z.number().optional(),
  is_completed: z.boolean().optional(),
  entity_id: z.number().optional(),
  entity_type: z.string().optional(),
  result: z.string().optional(),
  account_id: z.number().optional(),
});

export type KommoTask = z.infer<typeof kommoTaskSchema>;

/**
 * Parameters for getting a task by ID.
 */
export const getTaskParamsSchema = z.object({
  taskId: z.number().int().positive('Task ID must be a positive integer'),
});

export type GetTaskParams = z.infer<typeof getTaskParamsSchema>;

/**
 * Filters for listing tasks.
 */
export const listTasksFiltersSchema = z.object({
  responsible_user_id: z.number().optional(),
  task_type_id: z.number().optional(),
  entity_id: z.number().optional(),
  entity_type: z.string().optional(),
  is_completed: z.boolean().optional(),
  complete_till_from: z.number().optional(),
  complete_till_to: z.number().optional(),
  created_at_from: z.number().optional(),
  created_at_to: z.number().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(250).optional(),
});

export type ListTasksFilters = z.infer<typeof listTasksFiltersSchema>;

/**
 * Result of a get task operation.
 */
export const getTaskResultSchema = z.object({
  success: z.boolean(),
  task: kommoTaskSchema.optional(),
  error: z.string().optional(),
});

export type GetTaskResult = z.infer<typeof getTaskResultSchema>;

/**
 * Result of a list tasks operation.
 */
export const listTasksResultSchema = z.object({
  success: z.boolean(),
  tasks: z.array(kommoTaskSchema),
  totalFound: z.number(),
  page: z.number().optional(),
  totalPages: z.number().optional(),
  error: z.string().optional(),
});

export type ListTasksResult = z.infer<typeof listTasksResultSchema>;

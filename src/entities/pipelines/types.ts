/**
 * Kommo CRM - Pipelines Types
 * 
 * Type definitions specific to Pipelines entity.
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import { z } from 'zod';

/**
 * Kommo pipeline stage/status data structure.
 */
export const kommoPipelineStatusSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  sort: z.number().optional(),
  is_editable: z.boolean().optional(),
  pipeline_id: z.number().optional(),
  color: z.string().optional(),
  type: z.number().optional(),
  account_id: z.number().optional(),
});

export type KommoPipelineStatus = z.infer<typeof kommoPipelineStatusSchema>;

/**
 * Kommo pipeline data structure.
 */
export const kommoPipelineSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  sort: z.number().optional(),
  is_main: z.boolean().optional(),
  is_unsorted_on: z.boolean().optional(),
  is_archive: z.boolean().optional(),
  account_id: z.number().optional(),
  _embedded: z.object({
    statuses: z.array(kommoPipelineStatusSchema).optional(),
  }).optional(),
});

export type KommoPipeline = z.infer<typeof kommoPipelineSchema>;

/**
 * Parameters for getting a pipeline by ID.
 */
export const getPipelineParamsSchema = z.object({
  /** Kommo pipeline ID */
  pipelineId: z.number().int().positive('Pipeline ID must be a positive integer'),
});

export type GetPipelineParams = z.infer<typeof getPipelineParamsSchema>;

/**
 * Parameters for searching pipelines by name.
 */
export const searchPipelineParamsSchema = z.object({
  /** Pipeline name to search for */
  name: z.string().min(1, 'Pipeline name is required'),
});

export type SearchPipelineParams = z.infer<typeof searchPipelineParamsSchema>;

/**
 * Parameters for getting pipeline stages/statuses.
 */
export const getPipelineStatusesParamsSchema = z.object({
  /** Kommo pipeline ID */
  pipelineId: z.number().int().positive('Pipeline ID must be a positive integer'),
});

export type GetPipelineStatusesParams = z.infer<typeof getPipelineStatusesParamsSchema>;

/**
 * Result of listing pipelines.
 */
export const listPipelinesResultSchema = z.object({
  success: z.boolean(),
  pipelines: z.array(kommoPipelineSchema),
  totalFound: z.number(),
  error: z.string().optional(),
});

export type ListPipelinesResult = z.infer<typeof listPipelinesResultSchema>;

/**
 * Result of getting a pipeline.
 */
export const getPipelineResultSchema = z.object({
  success: z.boolean(),
  pipeline: kommoPipelineSchema.optional(),
  error: z.string().optional(),
});

export type GetPipelineResult = z.infer<typeof getPipelineResultSchema>;

/**
 * Result of searching pipelines by name.
 */
export const searchPipelineResultSchema = z.object({
  success: z.boolean(),
  pipelines: z.array(kommoPipelineSchema),
  totalFound: z.number(),
  error: z.string().optional(),
});

export type SearchPipelineResult = z.infer<typeof searchPipelineResultSchema>;

/**
 * Result of getting pipeline statuses/stages.
 */
export const getPipelineStatusesResultSchema = z.object({
  success: z.boolean(),
  statuses: z.array(kommoPipelineStatusSchema),
  totalFound: z.number(),
  error: z.string().optional(),
});

export type GetPipelineStatusesResult = z.infer<typeof getPipelineStatusesResultSchema>;

/**
 * Kommo CRM - Notes Types
 * 
 * Type definitions specific to Notes entity.
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import { z } from 'zod';

/**
 * Kommo note data structure.
 */
export const kommoNoteSchema = z.object({
  id: z.number(),
  text: z.string().optional(),
  note_type: z.string().optional(),
  responsible_user_id: z.number().optional(),
  created_by: z.number().optional(),
  updated_by: z.number().optional(),
  created_at: z.number().optional(),
  updated_at: z.number().optional(),
  entity_id: z.number().optional(),
  entity_type: z.string().optional(),
  account_id: z.number().optional(),
});

export type KommoNote = z.infer<typeof kommoNoteSchema>;

/**
 * Parameters for getting a note by ID.
 * Notes in Kommo v4 are scoped to an entity type.
 */
export const getNoteParamsSchema = z.object({
  noteId: z.number().int().positive('Note ID must be a positive integer'),
  entityType: z.enum(['leads', 'contacts', 'companies'], {
    errorMap: () => ({ message: 'Entity type must be one of: leads, contacts, companies' }),
  }),
});

export type GetNoteParams = z.infer<typeof getNoteParamsSchema>;

/**
 * Filters for listing notes.
 * In Kommo v4, notes are always scoped to an entity type.
 * If entity_id is provided, returns notes for that specific entity.
 */
export const listNotesFiltersSchema = z.object({
  entityType: z.enum(['leads', 'contacts', 'companies'], {
    errorMap: () => ({ message: 'Entity type must be one of: leads, contacts, companies' }),
  }),
  entityId: z.number().int().positive().optional(),
  responsible_user_id: z.number().optional(),
  note_type: z.string().optional(),
  created_at_from: z.number().optional(),
  created_at_to: z.number().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(250).optional(),
});

export type ListNotesFilters = z.infer<typeof listNotesFiltersSchema>;

/**
 * Result of a get note operation.
 */
export const getNoteResultSchema = z.object({
  success: z.boolean(),
  note: kommoNoteSchema.optional(),
  error: z.string().optional(),
});

export type GetNoteResult = z.infer<typeof getNoteResultSchema>;

/**
 * Result of a list notes operation.
 */
export const listNotesResultSchema = z.object({
  success: z.boolean(),
  notes: z.array(kommoNoteSchema),
  totalFound: z.number(),
  page: z.number().optional(),
  totalPages: z.number().optional(),
  error: z.string().optional(),
});

export type ListNotesResult = z.infer<typeof listNotesResultSchema>;

/**
 * Data for creating a new note.
 * In Kommo v4, notes must be created for a specific entity type and entity ID.
 */
export const createNoteDataSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  entityType: z.enum(['leads', 'contacts', 'companies'], {
    errorMap: () => ({ message: 'Entity type must be one of: leads, contacts, companies' }),
  }),
  entityId: z.number().int().positive('Entity ID must be a positive integer'),
  note_type: z.string().default('common'), // Default to "common" (valid note type in Kommo API)
  responsible_user_id: z.number().optional(),
});

export type CreateNoteData = z.infer<typeof createNoteDataSchema>;

/**
 * Data for updating a note.
 * Entity type and ID are required to identify which entity's notes to update.
 */
export const updateNoteDataSchema = z.object({
  noteId: z.number().int().positive('Note ID must be a positive integer'),
  entityType: z.enum(['leads', 'contacts', 'companies'], {
    errorMap: () => ({ message: 'Entity type must be one of: leads, contacts, companies' }),
  }),
  text: z.string().min(1).optional(),
  note_type: z.string().optional(),
  responsible_user_id: z.number().optional(),
});

export type UpdateNoteData = z.infer<typeof updateNoteDataSchema>;

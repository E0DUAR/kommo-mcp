/**
 * Kommo CRM - Notes Read Operations
 * 
 * All read operations for Notes entity.
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import { kommoRequest, type KommoConfig } from '../../client.js';
import {
  getNoteParamsSchema,
  listNotesFiltersSchema,
  type GetNoteParams,
  type ListNotesFilters,
  type GetNoteResult,
  type ListNotesResult,
  type KommoNote,
} from './types.js';
import { normalizePagination, type KommoPaginatedResponse } from '../../utils/pagination.js';

/**
 * Get detailed information about a specific note by ID.
 * 
 * In Kommo v4, notes are scoped to an entity type.
 * The endpoint is: GET /api/v4/{entityType}/notes/{noteId}
 */
export async function getNote(
  params: GetNoteParams,
  config: KommoConfig
): Promise<GetNoteResult> {
  const validatedParams = getNoteParamsSchema.parse(params);
  
  try {
    // Kommo v4 requires entity-scoped endpoints: /{entityType}/notes/{noteId}
    const endpoint = `/${validatedParams.entityType}/notes/${validatedParams.noteId}`;
    
    const note = await kommoRequest<KommoNote>(
      endpoint,
      config,
      {
        method: 'GET',
      }
    );

    if (!note) {
      return {
        success: false,
        error: `Note with ID ${validatedParams.noteId} not found`,
      };
    }

    return {
      success: true,
      note,
    };

  } catch (error) {
    if (error instanceof Error && 'statusCode' in error && (error as { statusCode: number }).statusCode === 404) {
      return {
        success: false,
        error: `Note with ID ${validatedParams.noteId} not found`,
      };
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      error: `Get note error: ${message}`,
    };
  }
}

/**
 * List notes with optional filters and pagination.
 * 
 * In Kommo v4, notes are scoped to an entity type.
 * If entityId is provided, returns notes for that specific entity.
 * Endpoints:
 * - GET /api/v4/{entityType}/notes (all notes of that type)
 * - GET /api/v4/{entityType}/{entityId}/notes (notes for specific entity)
 */
export async function listNotes(
  filters: ListNotesFilters,
  config: KommoConfig
): Promise<ListNotesResult> {
  const validatedFilters = listNotesFiltersSchema.parse(filters);
  
  try {
    const { page, limit } = normalizePagination({
      page: validatedFilters.page,
      limit: validatedFilters.limit,
    });

    // Build endpoint based on whether entityId is provided
    let endpoint: string;
    if (validatedFilters.entityId) {
      // Notes for a specific entity: /{entityType}/{entityId}/notes
      endpoint = `/${validatedFilters.entityType}/${validatedFilters.entityId}/notes`;
    } else {
      // All notes of this entity type: /{entityType}/notes
      endpoint = `/${validatedFilters.entityType}/notes`;
    }

    const query: Record<string, string | number> = {
      page,
      limit,
    };

    if (validatedFilters.responsible_user_id !== undefined) {
      query.responsible_user_id = validatedFilters.responsible_user_id;
    }
    if (validatedFilters.note_type !== undefined) {
      query.note_type = validatedFilters.note_type;
    }
    if (validatedFilters.created_at_from !== undefined) {
      query.created_at_from = validatedFilters.created_at_from;
    }
    if (validatedFilters.created_at_to !== undefined) {
      query.created_at_to = validatedFilters.created_at_to;
    }

    const data = await kommoRequest<KommoPaginatedResponse<KommoNote>>(
      endpoint,
      config,
      {
        method: 'GET',
        query,
      }
    );

    if (data === null) {
      return {
        success: true,
        notes: [],
        totalFound: 0,
        page,
      };
    }

    const notes: KommoNote[] = data._embedded?.notes ?? [];
    const totalFound = data._page?.total_items ?? notes.length;
    const totalPages = data._page?.total_pages ?? 1;

    return {
      success: true,
      notes,
      totalFound,
      page,
      totalPages,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      notes: [],
      totalFound: 0,
      error: `List notes error: ${message}`,
    };
  }
}

/**
 * Get notes associated with a specific contact.
 */
export async function getNotesByContact(
  contactId: number,
  config: KommoConfig
): Promise<ListNotesResult> {
  return listNotes({ entityType: 'contacts', entityId: contactId }, config);
}

/**
 * Get notes associated with a specific lead.
 */
export async function getNotesByLead(
  leadId: number,
  config: KommoConfig
): Promise<ListNotesResult> {
  return listNotes({ entityType: 'leads', entityId: leadId }, config);
}

/**
 * Get notes associated with a specific deal.
 * Note: Deals in Kommo are actually leads, so we use entityType 'leads'.
 */
export async function getNotesByDeal(
  dealId: number,
  config: KommoConfig
): Promise<ListNotesResult> {
  return listNotes({ entityType: 'leads', entityId: dealId }, config);
}

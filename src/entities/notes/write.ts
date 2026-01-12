/**
 * Kommo CRM - Notes Write Operations
 * 
 * All write operations for Notes entity.
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import { kommoRequest, type KommoConfig } from '../../client.js';
import { 
  kommoNoteSchema, 
  type KommoNote,
  createNoteDataSchema,
  type CreateNoteData,
  updateNoteDataSchema,
  type UpdateNoteData,
} from './types.js';

/**
 * Result of a create/update note operation.
 */
export interface NoteWriteResult {
  success: boolean;
  note?: KommoNote;
  noteId?: number;
  error?: string;
}

/**
 * Create a new note in Kommo CRM.
 * 
 * In Kommo v4, notes are scoped to an entity type (leads, contacts, companies).
 * The endpoint is: POST /api/v4/{entityType}/notes
 */
export async function createNote(
  data: CreateNoteData,
  config: KommoConfig
): Promise<NoteWriteResult> {
  const validatedData = createNoteDataSchema.parse(data);
  
  try {
    // Kommo v4 requires entity-scoped endpoints: /{entityType}/notes
    const endpoint = `/${validatedData.entityType}/notes`;
    
    // Prepare body with entity_id included
    const notePayload: Record<string, unknown> = {
      text: validatedData.text,
      entity_id: validatedData.entityId,
      note_type: validatedData.note_type, // Required by Kommo API - default is "common"
    };
    
    if (validatedData.responsible_user_id !== undefined) {
      notePayload.responsible_user_id = validatedData.responsible_user_id;
    }

    const response = await kommoRequest<{ _embedded: { notes: KommoNote[] } }>(
      endpoint,
      config,
      {
        method: 'POST',
        body: [notePayload],
      }
    );

    const note = response?._embedded?.notes?.[0];

    if (!note) {
      return {
        success: false,
        error: 'Failed to create note: No note returned in response',
      };
    }

    return {
      success: true,
      note,
      noteId: note.id,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      error: `Create note error: ${message}`,
    };
  }
}

/**
 * Update an existing note in Kommo CRM.
 * 
 * In Kommo v4, notes are scoped to an entity type.
 * The endpoint is: PATCH /api/v4/{entityType}/notes/{noteId}
 */
export async function updateNote(
  data: UpdateNoteData,
  config: KommoConfig
): Promise<NoteWriteResult> {
  const validatedData = updateNoteDataSchema.parse(data);
  
  try {
    // Kommo v4 requires entity-scoped endpoints: /{entityType}/notes/{noteId}
    const endpoint = `/${validatedData.entityType}/notes/${validatedData.noteId}`;
    
    // Prepare body without noteId and entityType (they're in the URL)
    const notePayload: Record<string, unknown> = {};
    if (validatedData.text !== undefined) notePayload.text = validatedData.text;
    if (validatedData.note_type !== undefined) notePayload.note_type = validatedData.note_type;
    if (validatedData.responsible_user_id !== undefined) notePayload.responsible_user_id = validatedData.responsible_user_id;

    const response = await kommoRequest<{ _embedded: { notes: KommoNote[] } }>(
      endpoint,
      config,
      {
        method: 'PATCH',
        body: [notePayload],
      }
    );

    const note = response?._embedded?.notes?.[0];

    if (!note) {
      return {
        success: false,
        error: 'Failed to update note: No note returned in response',
      };
    }

    return {
      success: true,
      note,
      noteId: note.id,
    };

  } catch (error) {
    if (error instanceof Error && 'statusCode' in error && (error as { statusCode: number }).statusCode === 404) {
      return {
        success: false,
        error: `Note with ID ${validatedData.noteId} not found`,
      };
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      error: `Update note error: ${message}`,
    };
  }
}

/**
 * @deprecated Notes in Kommo v4 are created for a specific entity and cannot be "linked" later.
 * Use createNote with the correct entityType and entityId instead.
 * 
 * This function is kept for backward compatibility but will not work as expected.
 */
export async function linkNoteToContact(
  noteId: number,
  contactId: number,
  config: KommoConfig
): Promise<NoteWriteResult> {
  return {
    success: false,
    error: 'Notes in Kommo v4 cannot be linked after creation. Create the note with entityType="contacts" and entityId instead.',
  };
}

/**
 * @deprecated Notes in Kommo v4 are created for a specific entity and cannot be "linked" later.
 * Use createNote with the correct entityType and entityId instead.
 * 
 * This function is kept for backward compatibility but will not work as expected.
 */
export async function linkNoteToLead(
  noteId: number,
  leadId: number,
  config: KommoConfig
): Promise<NoteWriteResult> {
  return {
    success: false,
    error: 'Notes in Kommo v4 cannot be linked after creation. Create the note with entityType="leads" and entityId instead.',
  };
}

/**
 * @deprecated Notes in Kommo v4 are created for a specific entity and cannot be "linked" later.
 * Use createNote with the correct entityType and entityId instead.
 * 
 * This function is kept for backward compatibility but will not work as expected.
 */
export async function linkNoteToDeal(
  noteId: number,
  dealId: number,
  config: KommoConfig
): Promise<NoteWriteResult> {
  return {
    success: false,
    error: 'Notes in Kommo v4 cannot be linked after creation. Create the note with entityType="leads" and entityId instead.',
  };
}

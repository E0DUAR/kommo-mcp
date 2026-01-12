/**
 * Kommo CRM - Tasks Read Operations
 * 
 * All read operations for Tasks entity.
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import { kommoRequest, type KommoConfig } from '../../client.js';
import {
  getTaskParamsSchema,
  listTasksFiltersSchema,
  type GetTaskParams,
  type ListTasksFilters,
  type GetTaskResult,
  type ListTasksResult,
  type KommoTask,
} from './types.js';
import { normalizePagination, type KommoPaginatedResponse } from '../../utils/pagination.js';

/**
 * Get detailed information about a specific task by ID.
 */
export async function getTask(
  params: GetTaskParams,
  config: KommoConfig
): Promise<GetTaskResult> {
  const validatedParams = getTaskParamsSchema.parse(params);
  
  try {
    const task = await kommoRequest<KommoTask>(
      `/tasks/${validatedParams.taskId}`,
      config,
      {
        method: 'GET',
      }
    );

    if (!task) {
      return {
        success: false,
        error: `Task with ID ${validatedParams.taskId} not found`,
      };
    }

    return {
      success: true,
      task,
    };

  } catch (error) {
    if (error instanceof Error && 'statusCode' in error && (error as { statusCode: number }).statusCode === 404) {
      return {
        success: false,
        error: `Task with ID ${validatedParams.taskId} not found`,
      };
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      error: `Get task error: ${message}`,
    };
  }
}

/**
 * List tasks with optional filters and pagination.
 */
export async function listTasks(
  filters: ListTasksFilters | undefined,
  config: KommoConfig
): Promise<ListTasksResult> {
  const validatedFilters = listTasksFiltersSchema.parse(filters ?? {});
  
  try {
    const { page, limit } = normalizePagination({
      page: validatedFilters.page,
      limit: validatedFilters.limit,
    });

    const query: Record<string, string | number | boolean> = {
      page,
      limit,
    };

    if (validatedFilters.responsible_user_id !== undefined) {
      query.responsible_user_id = validatedFilters.responsible_user_id;
    }
    if (validatedFilters.task_type_id !== undefined) {
      query.task_type_id = validatedFilters.task_type_id;
    }
    if (validatedFilters.entity_id !== undefined) {
      query.entity_id = validatedFilters.entity_id;
    }
    if (validatedFilters.entity_type !== undefined) {
      query.entity_type = validatedFilters.entity_type;
    }
    if (validatedFilters.is_completed !== undefined) {
      query.is_completed = validatedFilters.is_completed;
    }
    if (validatedFilters.complete_till_from !== undefined) {
      query.complete_till_from = validatedFilters.complete_till_from;
    }
    if (validatedFilters.complete_till_to !== undefined) {
      query.complete_till_to = validatedFilters.complete_till_to;
    }
    if (validatedFilters.created_at_from !== undefined) {
      query.created_at_from = validatedFilters.created_at_from;
    }
    if (validatedFilters.created_at_to !== undefined) {
      query.created_at_to = validatedFilters.created_at_to;
    }

    const data = await kommoRequest<KommoPaginatedResponse<KommoTask>>(
      '/tasks',
      config,
      {
        method: 'GET',
        query,
      }
    );

    if (data === null) {
      return {
        success: true,
        tasks: [],
        totalFound: 0,
        page,
      };
    }

    const tasks: KommoTask[] = data._embedded?.tasks ?? [];
    const totalFound = data._page?.total_items ?? tasks.length;
    const totalPages = data._page?.total_pages ?? 1;

    return {
      success: true,
      tasks,
      totalFound,
      page,
      totalPages,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      tasks: [],
      totalFound: 0,
      error: `List tasks error: ${message}`,
    };
  }
}

/**
 * Get tasks associated with a specific contact.
 */
export async function getTasksByContact(
  contactId: number,
  config: KommoConfig
): Promise<ListTasksResult> {
  return listTasks({ entity_id: contactId, entity_type: 'contacts' }, config);
}

/**
 * Get tasks associated with a specific lead.
 */
export async function getTasksByLead(
  leadId: number,
  config: KommoConfig
): Promise<ListTasksResult> {
  return listTasks({ entity_id: leadId, entity_type: 'leads' }, config);
}

/**
 * Get tasks associated with a specific deal.
 */
export async function getTasksByDeal(
  dealId: number,
  config: KommoConfig
): Promise<ListTasksResult> {
  return listTasks({ entity_id: dealId, entity_type: 'leads' }, config);
}

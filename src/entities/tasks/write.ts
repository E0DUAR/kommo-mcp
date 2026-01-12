/**
 * Kommo CRM - Tasks Write Operations
 * 
 * All write operations for Tasks entity.
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import { kommoRequest, type KommoConfig } from '../../client.js';
import { kommoTaskSchema, type KommoTask } from './types.js';
import { z } from 'zod';

/**
 * Data for creating a new task.
 */
export const createTaskDataSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  task_type_id: z.number().optional(),
  responsible_user_id: z.number().optional(),
  complete_till: z.number().optional(),
  entity_id: z.number().optional(),
  entity_type: z.string().optional(),
  result: z.string().optional(),
  is_completed: z.boolean().optional(),
});

export type CreateTaskData = z.infer<typeof createTaskDataSchema>;

/**
 * Data for updating a task.
 */
export const updateTaskDataSchema = createTaskDataSchema.partial();

export type UpdateTaskData = z.infer<typeof updateTaskDataSchema>;

/**
 * Result of a create/update task operation.
 */
export interface TaskWriteResult {
  success: boolean;
  task?: KommoTask;
  taskId?: number;
  error?: string;
}

/**
 * Create a new task in Kommo CRM.
 */
export async function createTask(
  data: CreateTaskData,
  config: KommoConfig
): Promise<TaskWriteResult> {
  const validatedData = createTaskDataSchema.parse(data);
  
  try {
    const response = await kommoRequest<{ _embedded: { tasks: KommoTask[] } }>(
      '/tasks',
      config,
      {
        method: 'POST',
        body: [validatedData],
      }
    );

    const task = response?._embedded?.tasks?.[0];

    if (!task) {
      return {
        success: false,
        error: 'Failed to create task: No task returned in response',
      };
    }

    return {
      success: true,
      task,
      taskId: task.id,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      error: `Create task error: ${message}`,
    };
  }
}

/**
 * Update an existing task in Kommo CRM.
 */
export async function updateTask(
  taskId: number,
  data: UpdateTaskData,
  config: KommoConfig
): Promise<TaskWriteResult> {
  const validatedData = updateTaskDataSchema.parse(data);
  
  try {
    const response = await kommoRequest<{ _embedded: { tasks: KommoTask[] } }>(
      '/tasks',
      config,
      {
        method: 'PATCH',
        body: [{
          id: taskId,
          ...validatedData,
        }],
      }
    );

    const task = response?._embedded?.tasks?.[0];

    if (!task) {
      return {
        success: false,
        error: 'Failed to update task: No task returned in response',
      };
    }

    return {
      success: true,
      task,
      taskId: task.id,
    };

  } catch (error) {
    if (error instanceof Error && 'statusCode' in error && (error as { statusCode: number }).statusCode === 404) {
      return {
        success: false,
        error: `Task with ID ${taskId} not found`,
      };
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      error: `Update task error: ${message}`,
    };
  }
}

/**
 * Complete a task.
 */
export async function completeTask(
  taskId: number,
  config: KommoConfig
): Promise<TaskWriteResult> {
  // @ts-ignore - is_completed is a special field for tasks
  return updateTask(taskId, { is_completed: true }, config);
}

/**
 * Link a task to a contact.
 */
export async function linkTaskToContact(
  taskId: number,
  contactId: number,
  config: KommoConfig
): Promise<TaskWriteResult> {
  return updateTask(taskId, { entity_id: contactId, entity_type: 'contacts' }, config);
}

/**
 * Link a task to a lead.
 */
export async function linkTaskToLead(
  taskId: number,
  leadId: number,
  config: KommoConfig
): Promise<TaskWriteResult> {
  return updateTask(taskId, { entity_id: leadId, entity_type: 'leads' }, config);
}

/**
 * Link a task to a deal.
 */
export async function linkTaskToDeal(
  taskId: number,
  dealId: number,
  config: KommoConfig
): Promise<TaskWriteResult> {
  return updateTask(taskId, { entity_id: dealId, entity_type: 'leads' }, config);
}

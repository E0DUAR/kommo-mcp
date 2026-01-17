/**
 * Kommo CRM - Pipelines & Statuses Write Operations
 * 
 * Functions to manage CRM structure (Pipelines and their Stages/Statuses).
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import { type KommoConfig, kommoRequest } from '../../client.js';

// --- Interfaces ---

export interface CreateStatusData {
    name: string;
    sort?: number;
    color?: string; // hex code
}

export interface UpdateStatusData {
    name?: string;
    sort?: number;
    color?: string;
}

export interface CreatePipelineData {
    name: string;
    sort?: number;
    is_main?: boolean;
    _embedded?: {
        statuses: CreateStatusData[];
    };
}

export interface UpdatePipelineData {
    name?: string;
    sort?: number;
    is_main?: boolean;
    is_archive?: boolean;
}

// --- Pipelines ---

/**
 * Create a new pipeline.
 */
export async function createPipeline(
    data: CreatePipelineData,
    config: KommoConfig
): Promise<{ success: boolean; pipeline?: any; error?: string }> {
    try {
        // Kommo API expects an array
        const payload = [data];

        const response = await kommoRequest<any>(
            '/leads/pipelines',
            config,
            {
                method: 'POST',
                body: payload,
            }
        );

        if (response._embedded?.pipelines?.[0]) {
            return { success: true, pipeline: response._embedded.pipelines[0] };
        }
        return { success: false, error: 'Pipeline created but no data returned' };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error creating pipeline' };
    }
}

/**
 * Update an existing pipeline.
 */
export async function updatePipeline(
    pipelineId: number,
    data: UpdatePipelineData,
    config: KommoConfig
): Promise<{ success: boolean; pipeline?: any; error?: string }> {
    try {
        const payload = [
            {
                id: pipelineId,
                ...data
            }
        ];

        const response = await kommoRequest<any>(
            '/leads/pipelines',
            config,
            {
                method: 'PATCH',
                body: payload,
            }
        );

        if (response._embedded?.pipelines?.[0]) {
            return { success: true, pipeline: response._embedded.pipelines[0] };
        }
        return { success: false, error: 'Pipeline updated but no data returned' };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error updating pipeline' };
    }
}


// --- Statuses (Stages) ---

/**
 * Create a new status in a pipeline.
 */
export async function createStatus(
    pipelineId: number,
    data: CreateStatusData,
    config: KommoConfig
): Promise<{ success: boolean; status?: any; error?: string }> {
    try {
        const payload = [data];

        const response = await kommoRequest<any>(
            `/leads/pipelines/${pipelineId}/statuses`,
            config,
            {
                method: 'POST',
                body: payload,
            }
        );

        if (response._embedded?.statuses?.[0]) {
            return { success: true, status: response._embedded.statuses[0] };
        }
        return { success: false, error: 'Status created but no data returned' };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error creating status' };
    }
}

/**
 * Update a status.
 */
export async function updateStatus(
    pipelineId: number,
    statusId: number,
    data: UpdateStatusData,
    config: KommoConfig
): Promise<{ success: boolean; status?: any; error?: string }> {
    try {
        const response = await kommoRequest<any>(
            `/leads/pipelines/${pipelineId}/statuses/${statusId}`,
            config,
            {
                method: 'PATCH',
                body: data,
            }
        );

        if (response.id) {
            return { success: true, status: response };
        }
        return { success: false, error: 'Status updated but no data returned' };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error updating status' };
    }
}

/**
 * Delete a status.
 */
export async function deleteStatus(
    pipelineId: number,
    statusId: number,
    config: KommoConfig
): Promise<{ success: boolean; error?: string }> {
    try {
        await kommoRequest<any>(
            `/leads/pipelines/${pipelineId}/statuses/${statusId}`,
            config,
            {
                method: 'DELETE',
            }
        );

        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error deleting status' };
    }
}

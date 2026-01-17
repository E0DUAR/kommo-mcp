/**
 * Kommo CRM - Custom Fields Write Operations
 * 
 * Functions to manage Custom Fields for entities (leads, contacts, companies, customers).
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import { type KommoConfig, kommoRequest } from '../../client.js';

// --- Interfaces ---

export type CustomFieldType =
    | 'text'
    | 'numeric'
    | 'checkbox'
    | 'select'
    | 'multiselect'
    | 'date'
    | 'url'
    | 'textarea'
    | 'radiobutton'
    | 'streetaddress';

export type EntityType = 'leads' | 'contacts' | 'companies' | 'customers' | 'segments';

export interface CreateCustomFieldData {
    name: string;
    type: CustomFieldType;
    enums?: { value: string; sort: number }[]; // For select/multiselect
    is_api_only?: boolean;
}

export interface UpdateCustomFieldData {
    name?: string;
    enums?: { value: string; sort: number; id?: number }[];
    is_api_only?: boolean;
}

// --- Functions ---

/**
 * Create a new custom field.
 */
export async function createCustomField(
    entityType: EntityType,
    data: CreateCustomFieldData,
    config: KommoConfig
): Promise<{ success: boolean; field?: any; error?: string }> {
    try {
        const payload = [data];

        const response = await kommoRequest<any>(
            `/${entityType}/custom_fields`,
            config,
            {
                method: 'POST',
                body: payload,
            }
        );

        if (response._embedded?.custom_fields?.[0]) {
            return { success: true, field: response._embedded.custom_fields[0] };
        }
        return { success: false, error: 'Custom field created but no data returned' };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error creating custom field' };
    }
}

/**
 * Update an existing custom field.
 */
export async function updateCustomField(
    entityType: EntityType,
    fieldId: number,
    data: UpdateCustomFieldData,
    config: KommoConfig
): Promise<{ success: boolean; field?: any; error?: string }> {
    try {
        const payload = [
            {
                id: fieldId,
                ...data
            }
        ];

        const response = await kommoRequest<any>(
            `/${entityType}/custom_fields`,
            config,
            {
                method: 'PATCH',
                body: payload,
            }
        );

        if (response._embedded?.custom_fields?.[0]) {
            return { success: true, field: response._embedded.custom_fields[0] };
        }
        return { success: false, error: 'Custom field updated but no data returned' };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error updating custom field' };
    }
}

/**
 * Delete a custom field.
 */
export async function deleteCustomField(
    entityType: EntityType,
    fieldId: number,
    config: KommoConfig
): Promise<{ success: boolean; error?: string }> {
    try {
        await kommoRequest<any>(
            `/${entityType}/custom_fields/${fieldId}`,
            config,
            {
                method: 'DELETE',
            }
        );

        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error deleting custom field' };
    }
}

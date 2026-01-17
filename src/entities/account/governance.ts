/**
 * Kommo CRM - Governance & Diagnostics
 * 
 * Functions to audit and validate account health and data integrity.
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import { type KommoConfig, kommoRequest } from '../../client.js';

/**
 * Validates the account setup.
 * Checks pipelines, users, and overall structure.
 */
export async function validateAccountSetup(config: KommoConfig): Promise<{
    success: boolean;
    summary?: {
        pipelines: { count: number; emptyPipelines: number };
        users: { count: number; active: number };
        customFields: { leads: number; contacts: number; companies: number };
    };
    issues: string[];
    error?: string;
}> {
    const issues: string[] = [];
    try {
        // 1. Check Pipelines
        const pipelinesRes = await kommoRequest<any>('/leads/pipelines', config);
        const pipelines = pipelinesRes._embedded?.pipelines || [];
        const emptyPipelines = pipelines.filter((p: any) => !p._embedded?.statuses || p._embedded.statuses.length === 0).length;
        
        if (emptyPipelines > 0) {
            issues.push(`Found ${emptyPipelines} pipeline(s) without statuses.`);
        }

        // 2. Check Users
        const usersRes = await kommoRequest<any>('/users', config);
        const users = usersRes._embedded?.users || [];
        
        // 3. Check Custom Fields count (simple overview)
        const leadsFields = await kommoRequest<any>('/leads/custom_fields', config);
        const contactsFields = await kommoRequest<any>('/contacts/custom_fields', config);
        const companiesFields = await kommoRequest<any>('/companies/custom_fields', config);

        return {
            success: true,
            summary: {
                pipelines: { count: pipelines.length, emptyPipelines },
                users: { count: users.length, active: users.length }, // API v4 /users usually returns active
                customFields: {
                    leads: leadsFields._embedded?.custom_fields?.length || 0,
                    contacts: contactsFields._embedded?.custom_fields?.length || 0,
                    companies: companiesFields._embedded?.custom_fields?.length || 0,
                }
            },
            issues
        };
    } catch (error) {
        return {
            success: false,
            issues: [],
            error: error instanceof Error ? error.message : 'Unknown error during account validation'
        };
    }
}

/**
 * Checks for entities with missing critical fields.
 * 
 * @param entityType - 'leads', 'contacts', 'companies'
 * @param fieldIds - Array of custom field IDs or 'name', 'price' for leads
 */
export async function checkMissingFields(
    entityType: 'leads' | 'contacts' | 'companies',
    fieldIds: (number | string)[],
    config: KommoConfig
): Promise<{
    success: boolean;
    totalChecked: number;
    missingCount: number;
    sampleMissingIds: number[];
    error?: string;
}> {
    try {
        // For performance, we fetch the first page (250) of recent entities
        const response = await kommoRequest<any>(`/${entityType}?limit=250`, config);
        const entities = response._embedded?.[entityType] || [];
        
        const missingEntities = entities.filter((entity: any) => {
            return fieldIds.some(fieldId => {
                if (typeof fieldId === 'string') {
                    // Check standard fields
                    return !entity[fieldId] || entity[fieldId] === '' || entity[fieldId] === 0;
                } else {
                    // Check custom fields
                    const cf = entity.custom_fields_values?.find((f: any) => f.field_id === fieldId);
                    return !cf || !cf.values || cf.values.length === 0 || !cf.values[0].value;
                }
            });
        });

        return {
            success: true,
            totalChecked: entities.length,
            missingCount: missingEntities.length,
            sampleMissingIds: missingEntities.slice(0, 10).map((e: any) => e.id)
        };
    } catch (error) {
        return {
            success: false,
            totalChecked: 0,
            missingCount: 0,
            sampleMissingIds: [],
            error: error instanceof Error ? error.message : 'Unknown error checking missing fields'
        };
    }
}

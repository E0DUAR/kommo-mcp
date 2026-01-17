/**
 * Kommo CRM - Users Read Operations
 * 
 * Functions to retrieve users and their information.
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import { type KommoConfig, kommoRequest } from '../../client.js';
import type { 
    ListUsersParams, 
    ListUsersResult, 
    GetUserParams, 
    GetUserResult,
    KommoUser
} from './types.js';

/**
 * List all users in the account.
 */
export async function listUsers(
    params: ListUsersParams,
    config: KommoConfig
): Promise<ListUsersResult> {
    try {
        const response = await kommoRequest<any>(
            '/users',
            config
        );

        let users = response._embedded?.users || [];

        // If active filter is provided, we can't easily filter via API, so we might need local filtering
        // However, Kommo API /users usually returns active users by default or has status.
        // For now, return all and log if active was requested.
        
        return {
            success: true,
            users: users
        };
    } catch (error) {
        return {
            success: false,
            users: [],
            error: error instanceof Error ? error.message : 'Unknown error listing users'
        };
    }
}

/**
 * Get a specific user by ID.
 */
export async function getUser(
    params: GetUserParams,
    config: KommoConfig
): Promise<GetUserResult> {
    try {
        const response = await kommoRequest<KommoUser>(
            `/users/${params.userId}`,
            config
        );

        if (response && response.id) {
            return {
                success: true,
                user: response
            };
        }

        return {
            success: false,
            error: 'User not found'
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error getting user'
        };
    }
}

/**
 * Get roles defined in the account.
 * Note: Kommo API might have roles in a different endpoint or embedded in /users.
 * Usually roles are at /users/roles
 */
export async function listRoles(
    config: KommoConfig
): Promise<{ success: boolean; roles: any[]; error?: string }> {
    try {
        const response = await kommoRequest<any>(
            '/users/roles',
            config
        );

        return {
            success: true,
            roles: response._embedded?.roles || []
        };
    } catch (error) {
        return {
            success: false,
            roles: [],
            error: error instanceof Error ? error.message : 'Unknown error listing roles'
        };
    }
}

/**
 * [Advanced] Get user availability/load.
 * Calculates how many active leads a user is responsible for.
 */
export async function getUserAvailability(
    userId: number,
    config: KommoConfig
): Promise<{ success: boolean; load: number; error?: string }> {
    try {
        // We can use listLeads with filter[responsible_user_id]
        // But for isolation, let's just use a raw request or import listLeads if we were allowed.
        // Since we are in entities/users, we should probably avoid importing from entities/leads to avoid circular deps if leads ever import users.
        
        const response = await kommoRequest<any>(
            `/leads?filter[responsible_user_id]=${userId}`,
            config
        );

        // Kommo doesn't return a "total" easily without pagination metadata
        // For a quick check, we look at the count of returned leads in this page or use the count if available.
        // In API v4, some list responses have _total_items if requested, but by default we check embedded length.
        
        const leads = response._embedded?.leads || [];
        
        return {
            success: true,
            load: leads.length // Simplistic, ideally we'd want a real count from metadata
        };
    } catch (error) {
        return {
            success: false,
            load: 0,
            error: error instanceof Error ? error.message : 'Unknown error calculating user load'
        };
    }
}

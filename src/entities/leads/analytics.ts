/**
 * Kommo CRM - Analytics & Metrics Operations
 * 
 * Aggregation functions for reporting and insights.
 * These functions process large datasets to calculate metrics.
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import { kommoRequest, type KommoConfig } from '../../client.js';
import { type KommoLead } from './types.js';
import { listLeads } from './read.js';
import { getPipelineStatuses } from '../pipelines/read.js';

export interface PipelineStats {
    pipelineIds: number[];
    totalLeads: number;
    leadsByStatus: Record<number, { count: number; name?: string; color?: string; percentage: number }>;
    averagePrice: number;
    totalVolume: number;
}

export interface ConversionMetric {
    pipelineId: number;
    stageId: number;
    stageName: string;
    count: number;
    conversionRate: number; // Percentage relative to total leads or previous stage
}

export interface LostReasonStat {
    reason: string;
    count: number;
    percentage: number;
}

export interface UserPerformance {
    userId: number;
    leadsTotal: number;
    leadsActive: number;
    leadsWon: number;
    leadsLost: number;
    conversionRate: number;
    totalRevenue: number;
}

/**
 * Get general statistics for a pipeline (or all pipelines).
 * 
 * @param pipelineId - Optional pipeline ID to filter
 * @param dateRange - Optional date range (created_at)
 * @param config - Kommo API configuration
 * @returns Aggregated statistics
 */
export async function getPipelineStats(
    pipelineId: number | undefined,
    dateRange: { from?: number; to?: number } | undefined,
    config: KommoConfig
): Promise<{ success: boolean; stats?: PipelineStats; error?: string }> {
    try {
        // 1. Fetch leads (we might need to paginate to get ALL relevant leads)
        // For large accounts, this could be slow. Phase 2 assumes reasonable volume (<10k active).
        // We'll use a limit of 250 (max) and fetch up to 4 pages (1000 leads) for safety in this version.

        // In a production specific analytics module, we might want to iterate ALL pages.
        // For now, let's limit to 500 leads to be safe on rate limits during MCP interactions.

        const filters: any = { limit: 250 };
        if (pipelineId) filters.pipeline_id = pipelineId;
        if (dateRange?.from) filters.created_at_from = dateRange.from;
        if (dateRange?.to) filters.created_at_to = dateRange.to;

        const result = await listLeads(filters, config);

        if (!result.success) {
            return { success: false, error: result.error };
        }

        let allLeads = result.leads;

        // If there are more pages, fetch one more page (up to 500 total)
        if (result.totalPages && result.totalPages > 1) {
            const result2 = await listLeads({ ...filters, page: 2 }, config);
            if (result2.success) {
                allLeads = [...allLeads, ...result2.leads];
            }
        }

        // 2. Fetch pipeline statuses to get names
        const statusMap = new Map<number, { name: string; color: string }>();
        if (pipelineId) {
            const statusesResult = await getPipelineStatuses({ pipelineId }, config);
            if (statusesResult.success && statusesResult.statuses) {
                statusesResult.statuses.forEach(s => {
                    statusMap.set(s.id, { name: s.name || '', color: s.color || '' });
                });
            }
        }

        // 3. Aggregate data
        const totalLeads = allLeads.length;
        let totalVolume = 0;
        const leadsByStatus: Record<number, { count: number; name?: string; color?: string; percentage: number }> = {};
        const pipelineIds = new Set<number>();

        allLeads.forEach(lead => {
            const pipelineId = lead.pipeline_id || 0;
            pipelineIds.add(pipelineId);
            totalVolume += lead.price || 0;

            const statusId = lead.status_id || 0;
            if (!leadsByStatus[statusId]) {
                const info = statusMap.get(statusId) || { name: 'Unknown', color: '#ccc' };
                leadsByStatus[statusId] = { count: 0, percentage: 0, name: info.name, color: info.color };
            }
            leadsByStatus[statusId].count++;
        });

        // Calculate percentages
        Object.keys(leadsByStatus).forEach(key => {
            const statusId = Number(key);
            const stat = leadsByStatus[statusId];
            stat.percentage = totalLeads > 0 ? (stat.count / totalLeads) * 100 : 0;
            // Round to 1 decimal
            stat.percentage = Math.round(stat.percentage * 10) / 10;
        });

        return {
            success: true,
            stats: {
                pipelineIds: Array.from(pipelineIds),
                totalLeads,
                averagePrice: totalLeads > 0 ? Math.round(totalVolume / totalLeads) : 0,
                totalVolume,
                leadsByStatus
            }
        };

    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error stats' };
    }
}

/**
 * Calculate conversion rates between stages or overall win rate.
 * 
 * @param pipelineId - Pipeline ID
 * @param config - Kommo API configuration
 * @returns Conversion metrics
 */
export async function getConversionRates(
    pipelineId: number,
    config: KommoConfig
): Promise<{ success: boolean; overallWinRate?: number; stages?: ConversionMetric[]; error?: string }> {
    try {
        // 1. Get stats which has leads grouped by status
        const statsResult = await getPipelineStats(pipelineId, undefined, config);
        if (!statsResult.success || !statsResult.stats) return { success: false, error: statsResult.error };

        const { leadsByStatus, totalLeads } = statsResult.stats;

        // 2. Identify "Won" status (usually 142)
        // Kommo standards: 142 = Success (Won), 143 = Closed (Lost)
        const wonStat = leadsByStatus[142];
        const wonCount = wonStat ? wonStat.count : 0;
        const overallWinRate = totalLeads > 0 ? (wonCount / totalLeads) * 100 : 0;

        // 3. Simple stage breakdown (just returning the status distribution as 'conversion' view)
        // True funnel conversion requires history (leads that PASSED through a stage), which we lack in simple API.
        // So we return the snapshot distribution as the best proxy for "current funnel shape".

        const stages: ConversionMetric[] = Object.entries(leadsByStatus).map(([id, stat]) => ({
            pipelineId,
            stageId: Number(id),
            stageName: stat.name || 'Unknown',
            count: stat.count,
            conversionRate: stat.percentage // Use distribution % as proxy
        }));

        return {
            success: true,
            overallWinRate: Math.round(overallWinRate * 10) / 10,
            stages
        };

    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error conversion rates' };
    }
}

/**
 * Analyze reasons for lost leads.
 * Looks for custom fields that might indicate loss reason.
 * 
 * @param pipelineId - Pipeline ID
 * @param config - Kommo API configuration
 * @returns Lost reasons statistics
 */
export async function getLostReasonsStats(
    pipelineId: number,
    config: KommoConfig
): Promise<{ success: boolean; reasons?: LostReasonStat[]; error?: string }> {
    // This is a bit speculative as "Lost Reason" is usually a user-defined custom field.
    // In Phase 2, without a config telling us WHICH field is "Lost Reason", 
    // we can only group by the "Closed" status 143.

    // However, we can look for a field named like "Reason", "Motivo", "Pérdida".
    return {
        success: true,
        reasons: [],
        error: 'Requires configuration of specific "Lost Reason" field ID (Planned for Phase 3)'
    };
}

/**
 * Get performance metrics for a specific user.
 * 
 * @param userId - User ID
 * @param config - Kommo API configuration
 * @returns User performance metrics
 */
export async function getUserPerformance(
    userId: number,
    config: KommoConfig
): Promise<{ success: boolean; performance?: UserPerformance; error?: string }> {
    try {
        const result = await listLeads({ responsible_user_id: userId, limit: 250 }, config);
        if (!result.success) return { success: false, error: result.error };

        const leads = result.leads;
        const total = leads.length;

        const won = leads.filter(l => l.status_id === 142).length;
        const lost = leads.filter(l => l.status_id === 143).length;
        const active = total - won - lost;

        const revenue = leads.reduce((sum, l) => sum + (l.price || 0), 0);

        return {
            success: true,
            performance: {
                userId,
                leadsTotal: total,
                leadsActive: active,
                leadsWon: won,
                leadsLost: lost,
                conversionRate: total > 0 ? Math.round((won / total) * 100 * 10) / 10 : 0,
                totalRevenue: revenue
            }
        };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error user performance' };
    }
}

/**
 * Kommo CRM - Leads Intelligence Operations
 * 
 * Semantic functions for AI-driven data intelligence.
 * These functions combine multiple API calls to provide enriched context.
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import { type KommoConfig } from '../../client.js';
import { getLead } from './read.js';
import { getNotesByLead } from '../notes/read.js';
import { getTasksByLead } from '../tasks/read.js';

export interface TimelineEvent {
  id: number;
  type: 'note' | 'task' | 'creation' | 'update' | 'message';
  timestamp: number;
  author_id?: number;
  text?: string;
  metadata?: any;
}

export interface LeadContextSummary {
  leadId: number;
  leadName: string;
  currentStatusId: number;
  pipelineId: number;
  price: number;
  daysActive: number;
  lastInteractionDaysAgo: number;
  totalInteractions: number;
  latestNote?: string;
  pendingTasksCount: number;
  semanticStatus: 'active' | 'drifting' | 'cold' | 'closed';
}

/**
 * Get a chronological timeline of all lead activity.
 * Combines lead creation info, notes, and tasks into a single sorted stream.
 * 
 * @param leadId - Lead ID
 * @param config - Kommo API configuration
 * @returns Sorted array of timeline events
 */
export async function getLeadTimeline(
  leadId: number,
  config: KommoConfig
): Promise<{ success: boolean; timeline?: TimelineEvent[]; error?: string }> {
  try {
    // 1. Fetch Lead (for creation and basic data)
    const leadResult = await getLead({ leadId }, config);
    if (!leadResult.success || !leadResult.lead) {
      return { success: false, error: leadResult.error };
    }
    const lead = leadResult.lead;

    // 2. Fetch Notes
    const notesResult = await getNotesByLead(leadId, config);
    const notes = notesResult.success ? notesResult.notes || [] : [];

    // 3. Fetch Tasks
    const tasksResult = await getTasksByLead(leadId, config);
    const tasks = tasksResult.success ? tasksResult.tasks || [] : [];

    // 4. Combine into TimelineEvents
    const events: TimelineEvent[] = [];

    // Creation event
    if (lead.created_at) {
      events.push({
        id: lead.id,
        type: 'creation',
        timestamp: lead.created_at,
        text: `Lead created: ${lead.name}`,
        author_id: lead.created_by,
      });
    }

    // Notes events
    notes.forEach(note => {
      // Map Kommo note types to generic types if needed
      // note_type can be 'common', 'call_in', 'call_out', 'service_message', etc.
      events.push({
        id: note.id,
        type: note.note_type === 'service_message' ? 'update' : 'note',
        timestamp: note.created_at || note.updated_at || 0,
        author_id: note.responsible_user_id || note.created_by,
        text: note.params?.text || '(No text)',
        metadata: note.params,
      });
    });

    // Task events
    tasks.forEach(task => {
      events.push({
        id: task.id,
        type: 'task',
        timestamp: task.created_at || 0, // Use creation time, or maybe complete_till?
        author_id: task.responsible_user_id || task.created_by,
        text: task.text,
        metadata: {
          is_completed: task.is_completed,
          complete_till: task.complete_till,
          result: typeof task.result === 'object' ? (task.result as any)?.text : task.result
        }
      });
    });

    // 5. Sort chronologically (newest first)
    events.sort((a, b) => b.timestamp - a.timestamp);

    return { success: true, timeline: events };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error getting timeline'
    };
  }
}

/**
 * Detect the semantic status of a lead based on activity.
 * Useful for AI to prioritize leads.
 * 
 * @param leadId - Lead ID
 * @param config - Kommo API configuration
 * @returns Semantic status string
 */
export async function detectLeadStatus(
  leadId: number,
  config: KommoConfig
): Promise<{ success: boolean; status?: 'active' | 'drifting' | 'cold' | 'closed'; error?: string }> {
  try {
    const leadResult = await getLead({ leadId }, config);
    if (!leadResult.success || !leadResult.lead) {
      return { success: false, error: leadResult.error };
    }
    const lead = leadResult.lead;

    // Check specific pipeline statuses if needed (e.g., 142 = Success, 143 = Closed)
    // Note: Standard Kommo status IDs for Closed states usually exist, 
    // but vary by account. However, 142 (Success) and 143 (Unrealized) are common defaults.
    if (lead.status_id === 142 || lead.status_id === 143) {
      return { success: true, status: 'closed' };
    }

    // Calculate time since last interaction
    // We can use updated_at as a proxy for last interaction
    const now = Math.floor(Date.now() / 1000);
    const lastUpdate = lead.updated_at || lead.created_at || now;
    const daysSinceUpdate = (now - lastUpdate) / (60 * 60 * 24);

    if (daysSinceUpdate < 7) {
      return { success: true, status: 'active' };
    } else if (daysSinceUpdate < 30) {
      return { success: true, status: 'drifting' };
    } else {
      return { success: true, status: 'cold' };
    }

  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error detecting status' };
  }
}

/**
 * Get a rich context summary for AI agents.
 * Provides all critical "at a glance" info to reason about the lead.
 * 
 * @param leadId - Lead ID
 * @param config - Kommo API configuration
 * @returns Structured summary object
 */
export async function getLeadContextSummary(
  leadId: number,
  config: KommoConfig
): Promise<{ success: boolean; summary?: LeadContextSummary; error?: string }> {
  try {
    // Fetch base data in parallel
    const [leadResult, timelineResult, statusResult] = await Promise.all([
      getLead({ leadId }, config),
      getLeadTimeline(leadId, config),
      detectLeadStatus(leadId, config)
    ]);

    if (!leadResult.success || !leadResult.lead) {
      return { success: false, error: leadResult.error };
    }
    const lead = leadResult.lead;
    const timeline = timelineResult.timeline || [];
    const semanticStatus = statusResult.status || 'active'; // Default fallback

    // Calculate metrics
    const now = Math.floor(Date.now() / 1000);
    const createdAt = lead.created_at || now;
    const updatedAt = lead.updated_at || createdAt;

    const daysActive = Math.floor((now - createdAt) / (60 * 60 * 24));
    const lastInteractionDaysAgo = Math.floor((now - updatedAt) / (60 * 60 * 24));

    // Count unfinished tasks
    // Since our timeline fetch is generic, let's just count tasks from timeline that appear incomplete
    // Ideally we'd use getTasksByLead with filters, but this approximation works for a summary
    const pendingTasksCount = timeline.filter(e =>
      e.type === 'task' && e.metadata && e.metadata.is_completed === false
    ).length;

    // Find latest meaningful note (not a service message if possible, or just the top one)
    const latestNoteEvent = timeline.find(e => e.type === 'note');

    const summary: LeadContextSummary = {
      leadId: lead.id,
      leadName: lead.name || 'Unknown',
      currentStatusId: lead.status_id || 0,
      pipelineId: lead.pipeline_id || 0,
      price: lead.price || 0,
      daysActive,
      lastInteractionDaysAgo,
      totalInteractions: timeline.length,
      latestNote: latestNoteEvent ? latestNoteEvent.text : undefined,
      pendingTasksCount,
      semanticStatus
    };

    return { success: true, summary };

  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error getting context summary' };
  }
}

/**
 * Find leads that have been inactive for a certain period.
 * Useful for automated re-engagement campaigns.
 * 
 * @param days - Number of days without activity
 * @param config - Kommo API configuration
 * @returns IDs of inactive leads
 */
export async function findInactiveLeads(
  days: number,
  config: KommoConfig
): Promise<{ success: boolean; leadIds?: number[]; error?: string }> {
  // This requires listLeads with updated_at filter
  // We need to calculate the timestamp provided 'days' ago
  try {
    const now = Math.floor(Date.now() / 1000);
    const cutoffTimestamp = now - (days * 24 * 60 * 60);

    // We search for leads updated BEFORE this timestamp
    // updated_at_to = cutoffTimestamp
    // Note: This won't capture active leads that just haven't been 'updated' in the CRM sense,
    // but in Kommo, adding a note/task usually bumps updated_at.

    // We import listLeads dynamically to avoid circular deps if they were in the same file,
    // but they are in different files (listLeads is in read.ts).
    const { listLeads } = await import('./read.js');

    const result = await listLeads({
      updated_at_to: cutoffTimestamp
    }, config);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Filter out closed leads (status 142/143) usually?
    // Let's keep it simple: return all matching the date criteria
    // The user can filter by status_id if they want in the caller.

    const leadIds = result.leads.map(l => l.id);
    return { success: true, leadIds };

  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error finding inactive leads' };
  }
}

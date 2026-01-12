/**
 * Kommo CRM - Leads Formatting Utilities
 * 
 * Formatting functions specific to Leads.
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import type { SearchLeadResult, KommoLead } from './types.js';

/**
 * Format lead data into a readable string for the AI model.
 */
export function formatLeadAsText(lead: KommoLead): string {
  const parts: string[] = [];

  // Basic info
  parts.push(`Lead ID: ${lead.id}`);
  if (lead.name) {
    parts.push(`Name: ${lead.name}`);
  }
  if (lead.price) {
    parts.push(`Price: ${lead.price}`);
  }

  // Status and pipeline
  if (lead.status_id) {
    parts.push(`Status ID: ${lead.status_id}`);
  }
  if (lead.pipeline_id) {
    parts.push(`Pipeline ID: ${lead.pipeline_id}`);
  }

  // Timestamps
  if (lead.created_at) {
    const createdAt = new Date(lead.created_at * 1000).toLocaleDateString();
    parts.push(`Created: ${createdAt}`);
  }
  if (lead.closed_at) {
    const closedAt = new Date(lead.closed_at * 1000).toLocaleDateString();
    parts.push(`Closed: ${closedAt}`);
  }

  return parts.join('\n');
}

/**
 * Format search results into a context string for the AI model.
 */
export function formatSearchResultsAsContext(result: SearchLeadResult): string {
  if (!result.success || result.leads.length === 0) {
    return result.error 
      ? `Error searching Kommo CRM: ${result.error}`
      : 'No leads found in Kommo CRM matching the search criteria.';
  }

  if (result.leads.length === 1) {
    return `Found 1 lead in Kommo CRM:\n\n${formatLeadAsText(result.leads[0])}`;
  }

  const formattedLeads = result.leads
    .slice(0, 5)
    .map((lead, index) => {
      return `[Lead ${index + 1}]\n${formatLeadAsText(lead)}`;
    });

  return `Found ${result.totalFound} lead(s) in Kommo CRM:\n\n${formattedLeads.join('\n\n---\n\n')}`;
}

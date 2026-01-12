/**
 * Kommo CRM - Contacts Formatting Utilities
 * 
 * Formatting functions specific to Contacts.
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import type { SearchContactResult, KommoContact } from './types.js';
import { formatContactAsText } from '../../utils/formatters.js';

/**
 * Format search results into a context string for the AI model.
 */
export function formatSearchResultsAsContext(result: SearchContactResult): string {
  if (!result.success || result.contacts.length === 0) {
    return result.error 
      ? `Error searching Kommo CRM: ${result.error}`
      : 'No contacts found in Kommo CRM matching the search criteria.';
  }

  if (result.contacts.length === 1) {
    return `Found 1 contact in Kommo CRM:\n\n${formatContactAsText(result.contacts[0])}`;
  }

  const formattedContacts = result.contacts
    .slice(0, 5) // Limit to 5 contacts
    .map((contact, index) => {
      return `[Contact ${index + 1}]\n${formatContactAsText(contact)}`;
    });

  return `Found ${result.totalFound} contact(s) in Kommo CRM:\n\n${formattedContacts.join('\n\n---\n\n')}`;
}

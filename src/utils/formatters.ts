/**
 * Kommo CRM - Formatting Utilities
 * 
 * Utility functions for formatting Kommo data for display/logging.
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import type { KommoContact } from '../types.js';

/**
 * Format contact data into a readable string for the AI model.
 * Extracts key information from Kommo contact structure.
 */
export function formatContactAsText(contact: KommoContact): string {
  const parts: string[] = [];

  // Basic info
  parts.push(`Contact ID: ${contact.id}`);
  parts.push(`Name: ${contact.name}`);
  
  if (contact.first_name || contact.last_name) {
    parts.push(`Full Name: ${contact.first_name || ''} ${contact.last_name || ''}`.trim());
  }

  // Extract phone numbers from custom fields
  const phoneFields = contact.custom_fields_values?.filter(
    (field) => field.field_code === 'PHONE' || 
               field.field_name?.toLowerCase().includes('phone') ||
               field.field_name?.toLowerCase().includes('teléfono')
  ) ?? [];

  if (phoneFields.length > 0) {
    const phones = phoneFields.flatMap(
      (field) => field.values.map((v) => v.value)
    );
    parts.push(`Phone: ${phones.join(', ')}`);
  }

  // Extract emails from custom fields
  const emailFields = contact.custom_fields_values?.filter(
    (field) => field.field_code === 'EMAIL' ||
               field.field_name?.toLowerCase().includes('email') ||
               field.field_name?.toLowerCase().includes('correo')
  ) ?? [];

  if (emailFields.length > 0) {
    const emails = emailFields.flatMap(
      (field) => field.values.map((v) => v.value)
    );
    parts.push(`Email: ${emails.join(', ')}`);
  }

  // Additional custom fields (limit to first 5)
  const otherFields = contact.custom_fields_values?.filter(
    (field) => 
      field.field_code !== 'PHONE' && 
      field.field_code !== 'EMAIL' &&
      !field.field_name?.toLowerCase().includes('phone') &&
      !field.field_name?.toLowerCase().includes('teléfono') &&
      !field.field_name?.toLowerCase().includes('email') &&
      !field.field_name?.toLowerCase().includes('correo')
  ).slice(0, 5) ?? [];

  if (otherFields.length > 0) {
    parts.push('\nAdditional Information:');
    for (const field of otherFields) {
      const fieldName = field.field_name || field.field_code || 'Unknown';
      const values = field.values.map((v) => v.value).join(', ');
      if (values) {
        parts.push(`  - ${fieldName}: ${values}`);
      }
    }
  }

  // Timestamps
  if (contact.created_at) {
    const createdAt = new Date(contact.created_at * 1000).toLocaleDateString();
    parts.push(`Created: ${createdAt}`);
  }

  return parts.join('\n');
}

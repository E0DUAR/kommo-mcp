import type { KommoConfig } from '../types.js';

/**
 * Get Kommo configuration from environment variables.
 */
export function getKommoConfig(): KommoConfig {
  const baseUrl = process.env.KOMMO_BASE_URL;
  const subdomain = process.env.KOMMO_SUBDOMAIN;
  const accessToken = process.env.KOMMO_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error('KOMMO_ACCESS_TOKEN environment variable is required');
  }

  if (!baseUrl && !subdomain) {
    throw new Error('Either KOMMO_BASE_URL or KOMMO_SUBDOMAIN environment variable is required');
  }

  const finalBaseUrl = baseUrl || `https://${subdomain}.kommo.com`;

  return {
    baseUrl: finalBaseUrl,
    accessToken,
  };
}
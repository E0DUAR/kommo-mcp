/**
 * Kommo CRM - HTTP Client
 * 
 * Centralized HTTP client for Kommo API requests.
 * Handles authentication, error handling, and response parsing.
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 * 
 * @see docs/ARCHITECTURE.md - Section on MCP Isolation
 */

import { kommoConfigSchema, type KommoConfig } from './types.js';

export { kommoConfigSchema, type KommoConfig };
/**
 * Options for making API requests.
 */
export interface KommoRequestOptions {
  /** HTTP method */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Request body (will be JSON stringified) */
  body?: unknown;
  /** Query parameters */
  query?: Record<string, string | number | boolean | undefined>;
  /** Additional headers */
  headers?: Record<string, string>;
}

/**
 * Normalize base URL to ensure it ends with /api/v4
 */
function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith('/api/v4')
    ? baseUrl
    : baseUrl.replace(/\/+$/, '') + '/api/v4';
}

/**
 * Make a request to the Kommo API.
 * 
 * @param endpoint - API endpoint (e.g., '/contacts', '/contacts/123')
 * @param config - Kommo API configuration
 * @param options - Request options
 * @returns Parsed JSON response or throws error
 * 
 * @example
 * ```typescript
 * const data = await kommoRequest('/contacts', config, {
 *   method: 'GET',
 *   query: { query: 'phone:1234567890' },
 * });
 * ```
 */
export async function kommoRequest<T = unknown>(
  endpoint: string,
  config: KommoConfig,
  options: KommoRequestOptions = {}
): Promise<T> {
  // Validate config
  const validatedConfig = kommoConfigSchema.parse(config);
  const apiBaseUrl = normalizeBaseUrl(validatedConfig.baseUrl);

  // Build URL - manually construct to preserve /api/v4 path
  // new URL() with absolute path ignores base path, so we construct manually
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${apiBaseUrl.replace(/\/+$/, '')}${cleanEndpoint}`;
  const url = new URL(fullUrl);
  
  // Debug: Log the actual URL being used
  if (process.env.KOMMO_DEBUG === 'true') {
    console.log(`[Kommo Debug] Base URL: ${validatedConfig.baseUrl}`);
    console.log(`[Kommo Debug] Normalized API URL: ${apiBaseUrl}`);
    console.log(`[Kommo Debug] Endpoint: ${endpoint}`);
    console.log(`[Kommo Debug] Final URL: ${url.toString()}`);
  }

  // Add query parameters
  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    }
  }

  // Build headers
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${validatedConfig.accessToken}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Build fetch options
  const fetchOptions: RequestInit = {
    method: options.method || 'GET',
    headers,
  };

  // Add body if provided
  if (options.body !== undefined) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  // Make request
  // Debug logging for troubleshooting
  if (process.env.KOMMO_DEBUG === 'true') {
    console.log(`[Kommo Debug] ${options.method || 'GET'} ${url.toString()}`);
    if (options.body) {
      console.log(`[Kommo Debug] Body: ${JSON.stringify(options.body).substring(0, 200)}...`);
    }
  }
  
  const response = await fetch(url.toString(), fetchOptions);

  // Handle 204 No Content (common when no results found)
  if (response.status === 204) {
    return null as T;
  }

  // Get response text
  const responseText = await response.text();

  // Handle errors
  if (!response.ok) {
    const errorMessage = responseText 
      ? responseText.substring(0, 500)
      : `HTTP ${response.status} ${response.statusText}`;
    
    throw new KommoAPIError(
      response.status,
      errorMessage,
      url.toString()
    );
  }

  // Parse JSON response
  if (!responseText || responseText.trim() === '') {
    return null as T;
  }

  // Parse JSON response
  // Kommo API returns application/hal+json, not application/json
  // We'll let JSON.parse handle validation - if it's HTML, it will fail gracefully
  try {
    return JSON.parse(responseText) as T;
  } catch (parseError) {
    const trimmedText = responseText.trim();
    
    // More precise HTML detection: check for HTML tags, not just <!
    // HTML typically starts with <!DOCTYPE or <html, and contains HTML tags
    const looksLikeHTML = (
      trimmedText.startsWith('<!DOCTYPE') ||
      trimmedText.startsWith('<html') ||
      (trimmedText.startsWith('<!') && (
        trimmedText.toLowerCase().includes('<html') ||
        trimmedText.toLowerCase().includes('<body') ||
        trimmedText.toLowerCase().includes('<!doctype')
      ))
    );
    
    if (looksLikeHTML) {
      throw new KommoAPIError(
        response.status,
        `API returned HTML instead of JSON. This usually means authentication failed or URL is incorrect. Status: ${response.status}`,
        url.toString(),
        responseText.substring(0, 500)
      );
    }
    
    // Otherwise, it's a JSON parsing error
    // Log first chars for debugging
    const preview = responseText.substring(0, 200).replace(/\n/g, '\\n');
    throw new KommoAPIError(
      response.status,
      `Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}. Preview: ${preview}`,
      url.toString(),
      responseText.substring(0, 500)
    );
  }
}

/**
 * Make a request to the Messaging Gateway.
 * 
 * @param endpoint - Gateway endpoint (e.g., '/v1/messages/send')
 * @param config - Kommo configuration containing gateway info
 * @param options - Request options
 */
export async function messagingRequest<T = unknown>(
  endpoint: string,
  config: KommoConfig,
  options: KommoRequestOptions = {}
): Promise<T> {
  const validatedConfig = kommoConfigSchema.parse(config);

  if (!validatedConfig.messagingGatewayUrl || !validatedConfig.messagingGatewayApiKey) {
    throw new Error('Messaging Gateway URL and API Key must be configured to use messaging features.');
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${validatedConfig.messagingGatewayUrl.replace(/\/+$/, '')}${cleanEndpoint}`;
  const url = new URL(fullUrl);

  // Add query parameters
  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    }
  }

  // Build headers
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${validatedConfig.messagingGatewayApiKey}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const fetchOptions: RequestInit = {
    method: options.method || 'POST', // Default to POST for gateway calls
    headers,
  };

  if (options.body !== undefined) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  if (process.env.KOMMO_DEBUG === 'true') {
    console.log(`[Messaging Debug] ${fetchOptions.method} ${url.toString()}`);
  }

  const response = await fetch(url.toString(), fetchOptions);
  const responseText = await response.text();

  if (!response.ok) {
    const statusCode = response.status;
    let errorMessage = responseText.substring(0, 500) || response.statusText;
    
    switch (statusCode) {
      case 401:
        errorMessage = 'API Key inválida o faltante';
        break;
      case 404:
        errorMessage = 'Contacto no existe en Kommo';
        break;
      case 429:
        errorMessage = 'Rate limit alcanzado, esperar y reintentar';
        break;
      case 500:
        errorMessage = 'Error del Gateway, revisar logs';
        break;
      case 502:
        errorMessage = 'Gateway no puede comunicarse con Kommo o canal';
        break;
      case 503:
        errorMessage = 'Gateway temporalmente no disponible';
        break;
    }
    
    throw new MessagingGatewayError(
      statusCode,
      errorMessage,
      url.toString()
    );
  }

  try {
    return JSON.parse(responseText) as T;
  } catch (e) {
    return responseText as unknown as T;
  }
}

/**
 * Error class for Kommo API errors.
 */
export class KommoAPIError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly message: string,
    public readonly url?: string,
    public readonly responseBody?: string
  ) {
    super(message);
    this.name = 'KommoAPIError';
  }

  toString(): string {
    return `KommoAPIError (${this.statusCode}): ${this.message}${this.url ? ` - ${this.url}` : ''}`;
  }
}

/**
 * Error class for Messaging Gateway errors.
 * Provides specific error messages based on HTTP status codes.
 */
export class MessagingGatewayError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly message: string,
    public readonly url?: string,
    public readonly responseBody?: string
  ) {
    super(message);
    this.name = 'MessagingGatewayError';
  }

  toString(): string {
    return `MessagingGatewayError (${this.statusCode}): ${this.message}${this.url ? ` - ${this.url}` : ''}`;
  }
}

/**
 * Normalize phone number for searching.
 * Removes common formatting (spaces, dashes, parentheses, plus sign).
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-()\+]/g, '');
}

/**
 * Kommo CRM - Catalog Elements (Products) Write Operations
 * 
 * All write operations for Catalog Elements entity.
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import { kommoRequest, type KommoConfig } from '../../client.js';
import {
  createCatalogElementDataSchema,
  updateCatalogElementDataSchema,
  type CreateCatalogElementData,
  type UpdateCatalogElementData,
  type CatalogElementWriteResult,
  type KommoCatalogElement,
} from './types.js';
import { z } from 'zod';

/**
 * Create a new catalog element (product) in a catalog.
 * 
 * @param catalogId - Catalog ID
 * @param data - Element data (name, custom fields)
 * @param config - Kommo API configuration
 * @returns Created element
 */
export async function createCatalogElement(
  catalogId: number,
  data: CreateCatalogElementData,
  config: KommoConfig
): Promise<CatalogElementWriteResult> {
  const validatedData = createCatalogElementDataSchema.parse(data);
  
  try {
    const response = await kommoRequest<{ _embedded: { elements: KommoCatalogElement[] } }>(
      `/catalogs/${catalogId}/elements`,
      config,
      {
        method: 'POST',
        body: [validatedData],
      }
    );

    const element = response?._embedded?.elements?.[0];

    if (!element) {
      return {
        success: false,
        error: 'Failed to create catalog element: No element returned in response',
      };
    }

    return {
      success: true,
      element,
      elementId: element.id,
    };

  } catch (error) {
    let message = error instanceof Error ? error.message : 'Unknown error';
    
    // Include response body if available for debugging
    if (error && typeof error === 'object' && 'responseBody' in error) {
      const responseBody = (error as { responseBody?: string }).responseBody;
      if (responseBody) {
        message = `${message} - Response: ${responseBody}`;
      }
    }

    return {
      success: false,
      error: `Create catalog element error: ${message}`,
    };
  }
}

/**
 * Update a catalog element (product).
 * 
 * @param catalogId - Catalog ID
 * @param elementId - Element ID to update
 * @param data - Updated element data
 * @param config - Kommo API configuration
 * @returns Updated element
 */
export async function updateCatalogElement(
  catalogId: number,
  elementId: number,
  data: UpdateCatalogElementData,
  config: KommoConfig
): Promise<CatalogElementWriteResult> {
  const validatedData = updateCatalogElementDataSchema.parse(data);
  
  try {
    // Kommo API uses PATCH for bulk updates
    // We need to include the element ID in the update data
    const updatePayload = {
      id: elementId,
      ...validatedData,
    };

    const response = await kommoRequest<{ _embedded: { elements: KommoCatalogElement[] } }>(
      `/catalogs/${catalogId}/elements`,
      config,
      {
        method: 'PATCH',
        body: [updatePayload],
      }
    );

    const element = response?._embedded?.elements?.[0];

    if (!element) {
      return {
        success: false,
        error: 'Failed to update catalog element: No element returned in response',
      };
    }

    return {
      success: true,
      element,
      elementId: element.id,
    };

  } catch (error) {
    let message = error instanceof Error ? error.message : 'Unknown error';
    
    // Include response body if available for debugging
    if (error && typeof error === 'object' && 'responseBody' in error) {
      const responseBody = (error as { responseBody?: string }).responseBody;
      if (responseBody) {
        message = `${message} - Response: ${responseBody}`;
      }
    }

    return {
      success: false,
      error: `Update catalog element error: ${message}`,
    };
  }
}

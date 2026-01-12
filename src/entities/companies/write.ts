/**
 * Kommo CRM - Companies Write Operations
 * 
 * All write operations for Companies entity.
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import { kommoRequest, type KommoConfig } from '../../client.js';
import { kommoCompanySchema, type KommoCompany } from './types.js';
import { z } from 'zod';

/**
 * Data for creating a new company.
 */
export const createCompanyDataSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  responsible_user_id: z.number().optional(),
  group_id: z.number().optional(),
  custom_fields_values: z.array(z.object({
    field_id: z.number(),
    values: z.array(z.object({
      value: z.string(),
      enum_id: z.number().optional(),
    })),
  })).optional(),
});

export type CreateCompanyData = z.infer<typeof createCompanyDataSchema>;

/**
 * Data for updating a company.
 */
export const updateCompanyDataSchema = createCompanyDataSchema.partial();

export type UpdateCompanyData = z.infer<typeof updateCompanyDataSchema>;

/**
 * Result of a create/update company operation.
 */
export interface CompanyWriteResult {
  success: boolean;
  company?: KommoCompany;
  companyId?: number;
  error?: string;
}

/**
 * Create a new company in Kommo CRM.
 */
export async function createCompany(
  data: CreateCompanyData,
  config: KommoConfig
): Promise<CompanyWriteResult> {
  const validatedData = createCompanyDataSchema.parse(data);
  
  try {
    const response = await kommoRequest<{ _embedded: { companies: KommoCompany[] } }>(
      '/companies',
      config,
      {
        method: 'POST',
        body: [validatedData],
      }
    );

    const company = response?._embedded?.companies?.[0];

    if (!company) {
      return {
        success: false,
        error: 'Failed to create company: No company returned in response',
      };
    }

    return {
      success: true,
      company,
      companyId: company.id,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      error: `Create company error: ${message}`,
    };
  }
}

/**
 * Update an existing company in Kommo CRM.
 */
export async function updateCompany(
  companyId: number,
  data: UpdateCompanyData,
  config: KommoConfig
): Promise<CompanyWriteResult> {
  const validatedData = updateCompanyDataSchema.parse(data);
  
  try {
    const response = await kommoRequest<{ _embedded: { companies: KommoCompany[] } }>(
      '/companies',
      config,
      {
        method: 'PATCH',
        body: [{
          id: companyId,
          ...validatedData,
        }],
      }
    );

    const company = response?._embedded?.companies?.[0];

    if (!company) {
      return {
        success: false,
        error: 'Failed to update company: No company returned in response',
      };
    }

    return {
      success: true,
      company,
      companyId: company.id,
    };

  } catch (error) {
    if (error instanceof Error && 'statusCode' in error && (error as { statusCode: number }).statusCode === 404) {
      return {
        success: false,
        error: `Company with ID ${companyId} not found`,
      };
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      error: `Update company error: ${message}`,
    };
  }
}

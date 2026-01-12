/**
 * Kommo CRM - Pipelines Read Operations
 * 
 * All read operations for Pipelines entity.
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import { kommoRequest, type KommoConfig } from '../../client.js';
import {
  getPipelineParamsSchema,
  searchPipelineParamsSchema,
  getPipelineStatusesParamsSchema,
  type GetPipelineParams,
  type SearchPipelineParams,
  type GetPipelineStatusesParams,
  type ListPipelinesResult,
  type GetPipelineResult,
  type SearchPipelineResult,
  type GetPipelineStatusesResult,
  type KommoPipeline,
  type KommoPipelineStatus,
} from './types.js';
import { type KommoPaginatedResponse } from '../../utils/pagination.js';

/**
 * List all pipelines in Kommo CRM.
 * 
 * @param config - Kommo API configuration
 * @returns List of all pipelines
 */
export async function listPipelines(
  config: KommoConfig
): Promise<ListPipelinesResult> {
  try {
    // Try the standard endpoint first
    let data: KommoPaginatedResponse<KommoPipeline> | KommoPipeline[] | null = null;
    
    try {
      // Try /api/v4/leads/pipelines (as suggested by web search)
      data = await kommoRequest<KommoPaginatedResponse<KommoPipeline>>(
        '/leads/pipelines',
        config,
        {
          method: 'GET',
        }
      );
    } catch (error) {
      // If that fails, try /api/v4/pipelines
      try {
        data = await kommoRequest<KommoPaginatedResponse<KommoPipeline>>(
          '/pipelines',
          config,
          {
            method: 'GET',
          }
        );
      } catch (secondError) {
        // If both fail, return error
        const message = secondError instanceof Error ? secondError.message : 'Unknown error';
        return {
          success: false,
          pipelines: [],
          totalFound: 0,
          error: `List pipelines error: ${message}`,
        };
      }
    }

    // Handle 204 No Content
    if (data === null) {
      return {
        success: true,
        pipelines: [],
        totalFound: 0,
      };
    }

    // Handle paginated response
    let pipelines: KommoPipeline[] = [];
    if (Array.isArray(data)) {
      pipelines = data;
    } else if ('_embedded' in data && data._embedded?.pipelines) {
      pipelines = data._embedded.pipelines;
    } else if ('_embedded' in data && Array.isArray(data._embedded)) {
      pipelines = data._embedded as KommoPipeline[];
    }

    const totalFound = pipelines.length;

    return {
      success: true,
      pipelines,
      totalFound,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      pipelines: [],
      totalFound: 0,
      error: `List pipelines error: ${message}`,
    };
  }
}

/**
 * Get detailed information about a specific pipeline by ID.
 * 
 * @param params - Get parameters (pipeline ID)
 * @param config - Kommo API configuration
 * @returns Pipeline data if found
 */
export async function getPipeline(
  params: GetPipelineParams,
  config: KommoConfig
): Promise<GetPipelineResult> {
  const validatedParams = getPipelineParamsSchema.parse(params);
  
  try {
    // Try the standard endpoint first
    let pipeline: KommoPipeline | null = null;
    
    try {
      // Try /api/v4/leads/pipelines/{id}
      pipeline = await kommoRequest<KommoPipeline>(
        `/leads/pipelines/${validatedParams.pipelineId}`,
        config,
        {
          method: 'GET',
        }
      );
    } catch (error) {
      // If that fails, try /api/v4/pipelines/{id}
      try {
        pipeline = await kommoRequest<KommoPipeline>(
          `/pipelines/${validatedParams.pipelineId}`,
          config,
          {
            method: 'GET',
          }
        );
      } catch (secondError) {
        // If both fail, return error
        const message = secondError instanceof Error ? secondError.message : 'Unknown error';
        return {
          success: false,
          error: `Get pipeline error: ${message}`,
        };
      }
    }

    if (!pipeline) {
      return {
        success: false,
        error: 'Pipeline not found',
      };
    }

    return {
      success: true,
      pipeline,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      error: `Get pipeline error: ${message}`,
    };
  }
}

/**
 * Search for pipelines by name.
 * 
 * @param params - Search parameters (pipeline name)
 * @param config - Kommo API configuration
 * @returns Search results with matching pipelines
 */
export async function searchPipelineByName(
  params: SearchPipelineParams,
  config: KommoConfig
): Promise<SearchPipelineResult> {
  const validatedParams = searchPipelineParamsSchema.parse(params);
  
  try {
    // First, list all pipelines
    const listResult = await listPipelines(config);
    
    if (!listResult.success) {
      return {
        success: false,
        pipelines: [],
        totalFound: 0,
        error: listResult.error,
      };
    }

    // Filter by name (case-insensitive partial match)
    const searchName = validatedParams.name.toLowerCase();
    const matchingPipelines = listResult.pipelines.filter(pipeline => {
      const pipelineName = pipeline.name?.toLowerCase() || '';
      return pipelineName.includes(searchName);
    });

    return {
      success: true,
      pipelines: matchingPipelines,
      totalFound: matchingPipelines.length,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      pipelines: [],
      totalFound: 0,
      error: `Search pipeline error: ${message}`,
    };
  }
}

/**
 * Get all stages/statuses for a specific pipeline.
 * 
 * @param params - Get parameters (pipeline ID)
 * @param config - Kommo API configuration
 * @returns List of pipeline stages/statuses
 */
export async function getPipelineStatuses(
  params: GetPipelineStatusesParams,
  config: KommoConfig
): Promise<GetPipelineStatusesResult> {
  const validatedParams = getPipelineStatusesParamsSchema.parse(params);
  
  try {
    // Try the standard endpoint first
    let statuses: KommoPipelineStatus[] = [];
    
    try {
      // Try /api/v4/leads/pipelines/{id}/statuses (as suggested by web search)
      const data = await kommoRequest<KommoPaginatedResponse<KommoPipelineStatus> | KommoPipelineStatus[]>(
        `/leads/pipelines/${validatedParams.pipelineId}/statuses`,
        config,
        {
          method: 'GET',
        }
      );

      if (data === null) {
        return {
          success: true,
          statuses: [],
          totalFound: 0,
        };
      }

      // Handle different response formats
      if (Array.isArray(data)) {
        statuses = data;
      } else if ('_embedded' in data && data._embedded?.statuses) {
        statuses = data._embedded.statuses;
      } else if ('_embedded' in data && Array.isArray(data._embedded)) {
        statuses = data._embedded as KommoPipelineStatus[];
      }
    } catch (error) {
      // If that fails, try getting the pipeline and extracting statuses from _embedded
      try {
        const pipelineResult = await getPipeline(
          { pipelineId: validatedParams.pipelineId },
          config
        );

        if (pipelineResult.success && pipelineResult.pipeline) {
          statuses = pipelineResult.pipeline._embedded?.statuses || [];
        } else {
          const message = pipelineResult.error || 'Unknown error';
          return {
            success: false,
            statuses: [],
            totalFound: 0,
            error: `Get pipeline statuses error: ${message}`,
          };
        }
      } catch (secondError) {
        // If both fail, return error
        const message = secondError instanceof Error ? secondError.message : 'Unknown error';
        return {
          success: false,
          statuses: [],
          totalFound: 0,
          error: `Get pipeline statuses error: ${message}`,
        };
      }
    }

    return {
      success: true,
      statuses,
      totalFound: statuses.length,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      statuses: [],
      totalFound: 0,
      error: `Get pipeline statuses error: ${message}`,
    };
  }
}

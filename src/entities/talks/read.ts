/**
 * Kommo CRM - Talks Read Operations
 * 
 * Read operations for messaging via the Messaging Gateway.
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import { messagingRequest, MessagingGatewayError, type KommoConfig } from '../../client.js';
import {
  getChatHistoryParamsSchema,
  getChatHistoryResponseSchema,
  type GetChatHistoryParams,
  type GetChatHistoryResponse,
  type MessagingResult,
} from './types.js';

/**
 * Get chat history for a contact via the Messaging Gateway.
 * 
 * The Gateway retrieves messages from:
 * - Kommo Online Chats API (preferred, already synchronized)
 * - Gateway cache (if available)
 * - Channel provider API (WhatsApp/Telegram) as fallback
 * 
 * Messages are returned in chronological order (oldest first).
 * 
 * @param params - History parameters (channel, contact ID, pagination)
 * @param config - Kommo configuration (must include Gateway URL and API Key)
 * @returns Result with array of messages and optional cursor for pagination
 * 
 * @example
 * ```typescript
 * const result = await kommoChatGetHistory({
 *   channel: 'whatsapp',
 *   contactId: 123,
 *   limit: 30
 * }, config);
 * 
 * if (result.success && result.data) {
 *   console.log(`Found ${result.data.items.length} messages`);
 *   // Use result.data.nextCursor for pagination
 * }
 * ```
 */
export async function kommoChatGetHistory(
  params: GetChatHistoryParams,
  config: KommoConfig
): Promise<MessagingResult<GetChatHistoryResponse>> {
  try {
    // Validate parameters
    const validatedParams = getChatHistoryParamsSchema.parse(params);

    // Check that Gateway is configured
    if (!config.messagingGatewayUrl || !config.messagingGatewayApiKey) {
      return {
        success: false,
        error: 'Messaging Gateway is not configured. Please set SYNC_MESSAGING_URL and SYNC_MESSAGING_API_KEY environment variables.',
      };
    }

    // Call Gateway API
    const response = await messagingRequest<GetChatHistoryResponse>(
      '/v1/messages/history',
      config,
      {
        method: 'POST',
        body: {
          channel: validatedParams.channel,
          contactId: validatedParams.contactId,
          limit: validatedParams.limit ?? 30,
          cursor: validatedParams.cursor ?? null,
        },
      }
    );

    // Validate response
    const validatedResponse = getChatHistoryResponseSchema.parse(response);

    if (!validatedResponse.ok) {
      return {
        success: false,
        error: validatedResponse.error || 'Failed to get chat history via Gateway',
      };
    }

    return {
      success: true,
      data: validatedResponse,
    };
  } catch (error) {
    if (error instanceof MessagingGatewayError) {
      const statusCode = error.statusCode;
      let errorMessage = error.message;
      
      switch (statusCode) {
        case 401:
          errorMessage = 'Messaging Gateway API Key is invalid or missing. Please verify SYNC_MESSAGING_API_KEY.';
          break;
        case 404:
          errorMessage = 'Contact not found in Kommo. Please verify the contact ID.';
          break;
        case 429:
          errorMessage = 'Rate limit exceeded. Please wait before retrying.';
          break;
        case 500:
          errorMessage = 'Messaging Gateway internal error. Please check Gateway logs.';
          break;
        case 502:
          errorMessage = 'Messaging Gateway cannot communicate with Kommo or channel provider.';
          break;
        case 503:
          errorMessage = 'Messaging Gateway is temporarily unavailable. Please try again later.';
          break;
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Unknown error occurred while getting chat history',
    };
  }
}

/**
 * Check Messaging Gateway health status.
 * 
 * Verifies that the Gateway is configured and operational.
 * 
 * @param config - Kommo configuration (must include Gateway URL and API Key)
 * @returns Result with Gateway health status
 * 
 * @example
 * ```typescript
 * const result = await checkMessagingGatewayHealth(config);
 * 
 * if (result.success && result.data) {
 *   console.log(`Gateway is ${result.data.ok ? 'healthy' : 'unhealthy'}`);
 * }
 * ```
 */
export async function checkMessagingGatewayHealth(
  config: KommoConfig
): Promise<MessagingResult<{ ok: boolean; service: string; version?: string }>> {
  if (!config.messagingGatewayUrl || !config.messagingGatewayApiKey) {
    return {
      success: false,
      error: 'Messaging Gateway is not configured',
    };
  }

  try {
    const response = await messagingRequest<{ ok: boolean; service: string; version?: string }>(
      '/health',
      config,
      { method: 'GET' }
    );

    return {
      success: response.ok,
      data: response,
    };
  } catch (error) {
    if (error instanceof MessagingGatewayError) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check Gateway health',
    };
  }
}

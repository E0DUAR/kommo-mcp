/**
 * Kommo CRM - Talks Write Operations
 * 
 * Write operations for messaging via the Messaging Gateway.
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import { messagingRequest, MessagingGatewayError, type KommoConfig } from '../../client.js';
import {
  sendMessageParamsSchema,
  sendMessageResponseSchema,
  upsertThreadParamsSchema,
  upsertThreadResponseSchema,
  type SendMessageParams,
  type SendMessageResponse,
  type UpsertThreadParams,
  type UpsertThreadResponse,
  type MessagingResult,
} from './types.js';

/**
 * Send a message to a contact via the Messaging Gateway.
 * 
 * The Gateway handles:
 * - Sending the message to the real channel (WhatsApp/Telegram/Instagram)
 * - Importing the message to Kommo Online Chats API
 * - Thread management
 * 
 * @param params - Message parameters (channel, contact, message content)
 * @param config - Kommo configuration (must include Gateway URL and API Key)
 * @returns Result with message ID and Kommo chat info
 * 
 * @example
 * ```typescript
 * const result = await kommoChatSendMessage({
 *   channel: 'whatsapp',
 *   to: { contactId: 123 },
 *   context: { leadId: 456 },
 *   message: { type: 'text', text: 'Hello!' }
 * }, config);
 * ```
 */
export async function kommoChatSendMessage(
  params: SendMessageParams,
  config: KommoConfig
): Promise<MessagingResult<SendMessageResponse>> {
  try {
    // Validate parameters
    const validatedParams = sendMessageParamsSchema.parse(params);

    // Check that Gateway is configured
    if (!config.messagingGatewayUrl || !config.messagingGatewayApiKey) {
      return {
        success: false,
        error: 'Messaging Gateway is not configured. Please set SYNC_MESSAGING_URL and SYNC_MESSAGING_API_KEY environment variables.',
      };
    }

    // Call Gateway API
    const response = await messagingRequest<SendMessageResponse>(
      '/v1/messages/send',
      config,
      {
        method: 'POST',
        body: {
          channel: validatedParams.channel,
          to: {
            contactId: validatedParams.to.contactId,
          },
          context: validatedParams.context,
          message: {
            type: validatedParams.message.type,
            text: validatedParams.message.text,
          },
        },
      }
    );

    // Validate response
    const validatedResponse = sendMessageResponseSchema.parse(response);

    if (!validatedResponse.ok) {
      return {
        success: false,
        error: validatedResponse.error || 'Failed to send message via Gateway',
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
      error: 'Unknown error occurred while sending message',
    };
  }
}

/**
 * Upsert a chat thread (prepare a conversation).
 * 
 * This is an idempotent operation that:
 * - Searches for an existing contact in Kommo by phone/email
 * - Creates a new contact if not found
 * - Gets or creates a chat thread for that contact
 * - Returns the contact ID and chat ID for future operations
 * 
 * @param params - Thread parameters (channel, identity, profile)
 * @param config - Kommo configuration (must include Gateway URL and API Key)
 * @returns Result with contact ID and chat ID
 * 
 * @example
 * ```typescript
 * const result = await kommoChatUpsertThread({
 *   channel: 'whatsapp',
 *   identity: { phone: '+1234567890' },
 *   profile: { name: 'John Doe' }
 * }, config);
 * ```
 */
export async function kommoChatUpsertThread(
  params: UpsertThreadParams,
  config: KommoConfig
): Promise<MessagingResult<UpsertThreadResponse>> {
  try {
    // Validate parameters
    const validatedParams = upsertThreadParamsSchema.parse(params);

    // Check that Gateway is configured
    if (!config.messagingGatewayUrl || !config.messagingGatewayApiKey) {
      return {
        success: false,
        error: 'Messaging Gateway is not configured. Please set SYNC_MESSAGING_URL and SYNC_MESSAGING_API_KEY environment variables.',
      };
    }

    // Call Gateway API
    const response = await messagingRequest<UpsertThreadResponse>(
      '/v1/threads/upsert',
      config,
      {
        method: 'POST',
        body: {
          channel: validatedParams.channel,
          identity: {
            phone: validatedParams.identity.phone,
            email: validatedParams.identity.email,
          },
          profile: validatedParams.profile,
        },
      }
    );

    // Validate response
    const validatedResponse = upsertThreadResponseSchema.parse(response);

    if (!validatedResponse.ok) {
      return {
        success: false,
        error: validatedResponse.error || 'Failed to upsert thread via Gateway',
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
      error: 'Unknown error occurred while upserting thread',
    };
  }
}

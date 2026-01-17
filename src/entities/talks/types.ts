/**
 * Kommo CRM - Talks (Messaging) Types
 * 
 * Type definitions for messaging operations via the Messaging Gateway.
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 */

import { z } from 'zod';

/**
 * Supported messaging channels.
 * 
 * ⚠️ CURRENT STATUS:
 * - 'whatsapp': ✅ Implemented and available
 * - 'telegram': ⏳ Reserved for future implementation
 * - 'instagram': ⏳ Reserved for future implementation
 */
export const messagingChannelSchema = z.enum(['whatsapp', 'telegram', 'instagram']);

export type MessagingChannel = z.infer<typeof messagingChannelSchema>;

/**
 * Parameters for sending a message via the Gateway.
 */
export const sendMessageParamsSchema = z.object({
  /** Channel to send the message through */
  channel: messagingChannelSchema,
  
  /** Recipient information */
  to: z.object({
    /** Kommo contact ID */
    contactId: z.number().int().positive('Contact ID must be a positive integer'),
  }),
  
  /** Optional context (for routing/logging) */
  context: z.object({
    /** Kommo lead ID (optional, for associating message with a lead) */
    leadId: z.number().int().positive().optional(),
  }).optional(),
  
  /** Message content */
  message: z.object({
    /** 
     * Message type.
     * 
     * ⚠️ CURRENT STATUS:
     * - 'text': ✅ Implemented and available
     * - Other types (image, document, audio, video): ⏳ Reserved for future implementation
     */
    type: z.literal('text'),
    /** Message text content */
    text: z.string().min(1, 'Message text cannot be empty').max(4096, 'Message text too long'),
  }),
});

export type SendMessageParams = z.infer<typeof sendMessageParamsSchema>;

/**
 * Response from Gateway when sending a message.
 */
export const sendMessageResponseSchema = z.object({
  ok: z.boolean(),
  providerMessageId: z.string().optional(),
  kommo: z.object({
    chatId: z.union([z.string(), z.number()]),
    imported: z.boolean(),
  }).optional(),
  error: z.string().optional(),
});

export type SendMessageResponse = z.infer<typeof sendMessageResponseSchema>;

/**
 * Parameters for getting chat history via the Gateway.
 */
export const getChatHistoryParamsSchema = z.object({
  /** Channel to get history from */
  channel: messagingChannelSchema,
  
  /** Kommo contact ID */
  contactId: z.number().int().positive('Contact ID must be a positive integer'),
  
  /** Maximum number of messages to return (default: 30) */
  limit: z.number().int().positive().max(100).optional(),
  
  /** Cursor for pagination (from previous response) */
  cursor: z.string().nullable().optional(),
});

export type GetChatHistoryParams = z.infer<typeof getChatHistoryParamsSchema>;

/**
 * Chat message item (from Gateway history response).
 */
export const chatMessageItemSchema = z.object({
  id: z.string(),
  direction: z.enum(['in', 'out']),
  text: z.string(),
  ts: z.number(),
  providerMessageId: z.string().optional(),
});

export type ChatMessageItem = z.infer<typeof chatMessageItemSchema>;

/**
 * Response from Gateway when getting chat history.
 */
export const getChatHistoryResponseSchema = z.object({
  ok: z.boolean(),
  items: z.array(chatMessageItemSchema),
  nextCursor: z.string().nullable().optional(),
  error: z.string().optional(),
});

export type GetChatHistoryResponse = z.infer<typeof getChatHistoryResponseSchema>;

/**
 * Parameters for upserting a chat thread (preparing a conversation).
 */
export const upsertThreadParamsSchema = z.object({
  /** Channel to use */
  channel: messagingChannelSchema,
  
  /** Contact identity */
  identity: z.object({
    /** Phone number (international format, e.g., +1234567890) */
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Phone must be in international format').optional(),
    /** Email address (alternative to phone) */
    email: z.string().email('Email must be a valid email address').optional(),
  }).refine(
    (data) => data.phone || data.email,
    { message: 'Either phone or email must be provided' }
  ),
  
  /** Optional profile information (for creating/updating contact) */
  profile: z.object({
    /** Contact name */
    name: z.string().optional(),
  }).optional(),
});

export type UpsertThreadParams = z.infer<typeof upsertThreadParamsSchema>;

/**
 * Response from Gateway when upserting a thread.
 */
export const upsertThreadResponseSchema = z.object({
  ok: z.boolean(),
  contactId: z.number().int().positive(),
  chatId: z.union([z.string(), z.number()]),
  created: z.boolean().optional(),
  error: z.string().optional(),
});

export type UpsertThreadResponse = z.infer<typeof upsertThreadResponseSchema>;

/**
 * Result wrapper for messaging operations.
 */
export interface MessagingResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

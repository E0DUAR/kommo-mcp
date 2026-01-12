/**
 * Kommo CRM Tool - Main Entry Point
 * 
 * ISOLATION RULE: This file must NOT import from src/core/ or src/features/
 * Treat this as an external NPM package.
 * 
 * This module provides a complete interface to Kommo CRM API.
 * 
 * @see docs/ARCHITECTURE.md - Section on MCP Isolation
 * @see https://developers.kommo.com/reference/kommo-api-reference - Kommo API docs
 */

// ============================================
// Configuration & Types
// ============================================

export { kommoConfigSchema, type KommoConfig } from './types.js';
export { getKommoConfig } from './server/config.js';
export type { KommoContact, SearchContactParams, GetContactParams, SearchContactResult, GetContactResult } from './types.js';
export { 
  SEARCH_CONTACT_TOOL_DESCRIPTION, 
  GET_CONTACT_TOOL_DESCRIPTION,
  LIST_PIPELINES_TOOL_DESCRIPTION,
  GET_PIPELINE_TOOL_DESCRIPTION,
  SEARCH_PIPELINE_BY_NAME_TOOL_DESCRIPTION,
  GET_PIPELINE_STATUSES_TOOL_DESCRIPTION,
  GET_LEAD_CUSTOM_FIELDS_TOOL_DESCRIPTION,
  UPDATE_LEAD_TOOL_DESCRIPTION,
  SEARCH_LEAD_CUSTOM_FIELD_TOOL_DESCRIPTION,
  UPDATE_LEAD_CUSTOM_FIELDS_TOOL_DESCRIPTION,
  GET_SELECT_FIELD_OPTIONS_TOOL_DESCRIPTION,
} from './types.js';

// ============================================
// Contacts - Read Operations
// ============================================

export {
  searchContactByPhone,
  searchContactByEmail,
  getContact,
  listContacts,
  getContactCustomFields,
} from './entities/contacts/read.js';

export {
  createContact,
  updateContact,
  linkContactToCompany,
} from './entities/contacts/write.js';

export type {
  CreateContactData,
  UpdateContactData,
  ContactWriteResult,
} from './entities/contacts/write.js';

export {
  formatSearchResultsAsContext,
} from './entities/contacts/formatters.js';

export type {
  SearchContactByPhoneParams,
  SearchContactByEmailParams,
  ListContactsFilters,
  ListContactsResult,
} from './entities/contacts/types.js';

// ============================================
// Leads - Read Operations
// ============================================

export {
  searchLead,
  getLead,
  listLeads,
  getLeadsByContact,
  getLeadCustomFields,
  searchLeadCustomField,
  getLeadCustomFieldInfo,
  getSelectFieldOptions,
  getLeadCustomFieldsMetadata,
  getLeadProducts,
} from './entities/leads/read.js';

export type {
  SearchLeadParams,
  GetLeadParams,
  ListLeadsFilters,
  SearchLeadResult,
  GetLeadResult,
  ListLeadsResult,
  KommoLead,
} from './entities/leads/types.js';

// ============================================
// Companies - Read Operations
// ============================================

export {
  searchCompany,
  getCompany,
  listCompanies,
  searchCompanyByDomain,
} from './entities/companies/read.js';

export type {
  SearchCompanyParams,
  GetCompanyParams,
  ListCompaniesFilters,
  SearchCompanyResult,
  GetCompanyResult,
  ListCompaniesResult,
  KommoCompany,
} from './entities/companies/types.js';

// ============================================
// Deals - Read Operations
// ============================================

export {
  searchDeal,
  getDeal,
  listDeals,
  getDealsByContact,
  getDealsByCompany,
} from './entities/deals/read.js';

export type {
  SearchDealParams,
  GetDealParams,
  ListDealsFilters,
  SearchDealResult,
  GetDealResult,
  ListDealsResult,
  KommoDeal,
} from './entities/deals/types.js';

// ============================================
// Tasks - Read Operations
// ============================================

export {
  getTask,
  listTasks,
  getTasksByContact,
  getTasksByLead,
  getTasksByDeal,
} from './entities/tasks/read.js';

export type {
  GetTaskParams,
  ListTasksFilters,
  GetTaskResult,
  ListTasksResult,
  KommoTask,
} from './entities/tasks/types.js';

// ============================================
// Notes - Read Operations
// ============================================

export {
  getNote,
  listNotes,
  getNotesByContact,
  getNotesByLead,
  getNotesByDeal,
} from './entities/notes/read.js';

export type {
  GetNoteParams,
  ListNotesFilters,
  GetNoteResult,
  ListNotesResult,
  KommoNote,
} from './entities/notes/types.js';

// ============================================
// Write Operations Exports
// ============================================

// Leads Write
export {
  createLead,
  updateLead,
  updateLeadStatus,
  linkLeadToContact,
  updateLeadCustomFields,
  linkProductToLead,
  unlinkProductFromLead,
} from './entities/leads/write.js';

export type {
  CreateLeadData,
  UpdateLeadData,
  LeadWriteResult,
} from './entities/leads/write.js';

// Companies Write
export {
  createCompany,
  updateCompany,
} from './entities/companies/write.js';

export type {
  CreateCompanyData,
  UpdateCompanyData,
  CompanyWriteResult,
} from './entities/companies/write.js';

// Deals Write
export {
  createDeal,
  updateDeal,
  updateDealStage,
  linkDealToContact,
  linkDealToCompany,
} from './entities/deals/write.js';

export type {
  CreateDealData,
  UpdateDealData,
  DealWriteResult,
} from './entities/deals/write.js';

// Tasks Write
export {
  createTask,
  updateTask,
  completeTask,
  linkTaskToContact,
  linkTaskToLead,
  linkTaskToDeal,
} from './entities/tasks/write.js';

export type {
  CreateTaskData,
  UpdateTaskData,
  TaskWriteResult,
} from './entities/tasks/write.js';

// Notes Write
export {
  createNote,
  updateNote,
  linkNoteToContact,
  linkNoteToLead,
  linkNoteToDeal,
} from './entities/notes/write.js';

export type {
  NoteWriteResult,
} from './entities/notes/write.js';

export type {
  CreateNoteData,
  UpdateNoteData,
} from './entities/notes/types.js';

// ============================================
// Legacy Compatibility
// ============================================

/**
 * @deprecated Use searchContactByPhone instead
 * Legacy function for backward compatibility.
 */
export { searchContactByPhone as searchContact } from './entities/contacts/read.js';

// ============================================
// Pipelines - Read Operations
// ============================================

export {
  listPipelines,
  getPipeline,
  searchPipelineByName,
  getPipelineStatuses,
} from './entities/pipelines/read.js';

export type {
  GetPipelineParams,
  SearchPipelineParams,
  GetPipelineStatusesParams,
  ListPipelinesResult,
  GetPipelineResult,
  SearchPipelineResult,
  GetPipelineStatusesResult,
  KommoPipeline,
  KommoPipelineStatus,
} from './entities/pipelines/types.js';

// ============================================
// Utilities
// ============================================

export { formatContactAsText } from './utils/formatters.js';
export { normalizePhone } from './client.js';
export { normalizePagination, type PaginationParams } from './utils/pagination.js';

// ============================================
// Catalogs - Read Operations
// ============================================

export {
  listCatalogs,
  getCatalog,
  searchCatalog,
  getCatalogCustomFields,
} from './entities/catalogs/read.js';

export type {
  GetCatalogParams,
  SearchCatalogParams,
  GetCatalogCustomFieldsParams,
  ListCatalogsResult,
  GetCatalogResult,
  SearchCatalogResult,
  GetCatalogCustomFieldsResult,
  KommoCatalog,
  KommoCatalogCustomField,
} from './entities/catalogs/types.js';

// ============================================
// Catalog Elements (Products) - Read Operations
// ============================================

export {
  listCatalogElements,
  getCatalogElement,
  searchCatalogElement,
} from './entities/catalog-elements/read.js';

export type {
  ListCatalogElementsParams,
  GetCatalogElementParams,
  SearchCatalogElementParams,
  ListCatalogElementsResult,
  GetCatalogElementResult,
  SearchCatalogElementResult,
  KommoCatalogElement,
} from './entities/catalog-elements/types.js';

// ============================================
// Catalog Elements (Products) - Write Operations
// ============================================

export {
  createCatalogElement,
  updateCatalogElement,
} from './entities/catalog-elements/write.js';

export type {
  CreateCatalogElementData,
  UpdateCatalogElementData,
  CatalogElementWriteResult,
} from './entities/catalog-elements/types.js';

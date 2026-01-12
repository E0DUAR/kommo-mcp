import { 
  searchContactByPhone, 
  getContact, 
  listLeads, 
  getLead, 
  updateLead,
  createLead,
  updateLeadStatus,
  linkLeadToContact,
  searchLead,
  getLeadsByContact,
  getLeadCustomFields,
  updateLeadCustomFields,
  linkProductToLead,
  unlinkProductFromLead,
  getSelectFieldOptions,
  searchContactByEmail,
  listContacts,
  createContact,
  updateContact,
  searchCompany,
  getCompany,
  listCompanies,
  createCompany,
  updateCompany,
  searchDeal,
  getDeal,
  listDeals,
  createDeal,
  updateDeal,
  listTasks,
  getTask,
  createTask,
  updateTask,
  listNotes,
  getNote,
  createNote,
  updateNote,
  listPipelines,
  getPipelineStatuses,
  listCatalogs,
  listCatalogElements
} from '../index.js';
import type { KommoConfig } from '../types.js';

/**
 * Handle kommo_search_contact_by_phone tool call.
 */
export async function handleSearchContactByPhone(
  args: { phone: string; name?: string },
  config: KommoConfig
) {
  const result = await searchContactByPhone(
    {
      phone: args.phone,
      name: args.name,
    },
    config
  );

  if (!result.success) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${result.error}`,
        },
      ],
      isError: true,
    };
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          success: true,
          totalFound: result.totalFound,
          contacts: result.contacts,
        }, null, 2),
      },
    ],
  };
}

/**
 * Handle kommo_get_contact tool call.
 */
export async function handleGetContact(
  args: { contactId: number },
  config: KommoConfig
) {
  const result = await getContact(
    { contactId: args.contactId },
    config
  );

  if (!result.success) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${result.error}`,
        },
      ],
      isError: true,
    };
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result.contact, null, 2),
      },
    ],
  };
}

/**
 * Handle kommo_list_leads tool call.
 */
export async function handleListLeads(
  args: {
    status_id?: number;
    responsible_user_id?: number;
    pipeline_id?: number;
    page?: number;
    limit?: number;
  },
  config: KommoConfig
) {
  const result = await listLeads(
    {
      status_id: args.status_id,
      responsible_user_id: args.responsible_user_id,
      pipeline_id: args.pipeline_id,
      page: args.page,
      limit: args.limit,
    },
    config
  );

  if (!result.success) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${result.error}`,
        },
      ],
      isError: true,
    };
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          success: true,
          totalFound: result.totalFound,
          leads: result.leads,
        }, null, 2),
      },
    ],
  };
}

/**
 * Handle kommo_get_lead tool call.
 */
export async function handleGetLead(
  args: { leadId: number },
  config: KommoConfig
) {
  const result = await getLead(
    { leadId: args.leadId },
    config
  );

  if (!result.success) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${result.error}`,
        },
      ],
      isError: true,
    };
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result.lead, null, 2),
      },
    ],
  };
}

/**
 * Handle kommo_update_lead tool call.
 */
export async function handleUpdateLead(
  args: {
    leadId: number;
    name?: string;
    price?: number;
    responsible_user_id?: number;
    status_id?: number;
    pipeline_id?: number;
    custom_fields_values?: Array<{
      field_id: number;
      values: Array<{ value: string }>;
    }>;
  },
  config: KommoConfig
) {
  const result = await updateLead(
    args.leadId,
    {
      name: args.name,
      price: args.price,
      responsible_user_id: args.responsible_user_id,
      status_id: args.status_id,
      pipeline_id: args.pipeline_id,
      custom_fields_values: args.custom_fields_values,
    },
    config
  );

  if (!result.success) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${result.error}`,
        },
      ],
      isError: true,
    };
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          success: true,
          leadId: result.leadId,
          message: 'Lead updated successfully',
        }, null, 2),
      },
    ],
  };
}

/**
 * Handle kommo_create_lead tool call.
 */
export async function handleCreateLead(
  args: {
    name?: string;
    price?: number;
    status_id?: number;
    pipeline_id?: number;
    responsible_user_id?: number;
    _embedded?: any;
  },
  config: KommoConfig
) {
  const result = await createLead(args, config);

  if (!result.success) {
    return {
      content: [{ type: 'text', text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

/**
 * Handle kommo_update_lead_status tool call.
 */
export async function handleUpdateLeadStatus(
  args: { leadId: number; statusId: number; pipelineId?: number },
  config: KommoConfig
) {
  const result = await updateLeadStatus(args.leadId, args.statusId, config);

  if (!result.success) {
    return {
      content: [{ type: 'text', text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

/**
 * Handle kommo_search_lead tool call.
 */
export async function handleSearchLead(
  args: { query: string; pipeline_id?: number },
  config: KommoConfig
) {
  const result = await searchLead(args, config);

  if (!result.success) {
    return {
      content: [{ type: 'text', text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

/**
 * Handle kommo_get_lead_custom_fields tool call.
 */
export async function handleGetLeadCustomFields(
  args: { leadId: number },
  config: KommoConfig
) {
  const result = await getLeadCustomFields(args.leadId, config);

  if (!result.success) {
    return {
      content: [{ type: 'text', text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

/**
 * Handle kommo_update_lead_custom_fields tool call.
 */
export async function handleUpdateLeadCustomFields(
  args: { leadId: number; fields: Record<string, any> },
  config: KommoConfig
) {
  const result = await updateLeadCustomFields(args.leadId, args.fields as any, config);

  if (!result.success) {
    return {
      content: [{ type: 'text', text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

/**
 * Handle kommo_search_contact_by_email tool call.
 */
export async function handleSearchContactByEmail(
  args: { email: string },
  config: KommoConfig
) {
  const result = await searchContactByEmail({ email: args.email }, config);

  if (!result.success) {
    return {
      content: [{ type: 'text', text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

/**
 * Handle kommo_create_contact tool call.
 */
export async function handleCreateContact(
  args: { name: string; first_name?: string; last_name?: string; responsible_user_id?: number },
  config: KommoConfig
) {
  const result = await createContact(args, config);

  if (!result.success) {
    return {
      content: [{ type: 'text', text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

/**
 * Handle kommo_list_companies tool call.
 */
export async function handleListCompanies(
  args: { page?: number; limit?: number },
  config: KommoConfig
) {
  const result = await listCompanies(args, config);

  if (!result.success) {
    return {
      content: [{ type: 'text', text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

/**
 * Handle kommo_create_company tool call.
 */
export async function handleCreateCompany(
  args: { name: string; responsible_user_id?: number },
  config: KommoConfig
) {
  const result = await createCompany(args, config);

  if (!result.success) {
    return {
      content: [{ type: 'text', text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

/**
 * Handle kommo_list_pipelines tool call.
 */
export async function handleListPipelines(
  config: KommoConfig
) {
  const result = await listPipelines(config);

  if (!result.success) {
    return {
      content: [{ type: 'text', text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

/**
 * Handle kommo_create_task tool call.
 */
export async function handleCreateTask(
  args: { 
    text: string; 
    complete_till: number; 
    entity_id: number; 
    entity_type: string;
    task_type_id?: number;
    responsible_user_id?: number;
  },
  config: KommoConfig
) {
  const result = await createTask(args, config);

  if (!result.success) {
    return {
      content: [{ type: 'text', text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

/**
 * Handle kommo_search_company tool call.
 */
export async function handleSearchCompany(
  args: { query: string },
  config: KommoConfig
) {
  const result = await searchCompany(args, config);

  if (!result.success) {
    return {
      content: [{ type: 'text', text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

/**
 * Handle kommo_get_company tool call.
 */
export async function handleGetCompany(
  args: { companyId: number },
  config: KommoConfig
) {
  const result = await getCompany({ companyId: args.companyId }, config);

  if (!result.success) {
    return {
      content: [{ type: 'text', text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

/**
 * Handle kommo_list_deals tool call.
 */
export async function handleListDeals(
  args: { 
    page?: number; 
    limit?: number;
    responsible_user_id?: number;
  },
  config: KommoConfig
) {
  const result = await listDeals(args, config);

  if (!result.success) {
    return {
      content: [{ type: 'text', text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

/**
 * Handle kommo_create_deal tool call.
 */
export async function handleCreateDeal(
  args: { 
    name: string; 
    price?: number; 
    status_id?: number; 
    pipeline_id?: number;
    _embedded?: any;
  },
  config: KommoConfig
) {
  const result = await createDeal(args, config);

  if (!result.success) {
    return {
      content: [{ type: 'text', text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

/**
 * Handle kommo_list_catalogs tool call.
 */
export async function handleListCatalogs(
  config: KommoConfig
) {
  const result = await listCatalogs(config);

  if (!result.success) {
    return {
      content: [{ type: 'text', text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

/**
 * Handle kommo_list_catalog_elements tool call.
 */
export async function handleListCatalogElements(
  args: { catalog_id: number; page?: number; limit?: number },
  config: KommoConfig
) {
  const result = await listCatalogElements({ catalogId: args.catalog_id, page: args.page, limit: args.limit }, config);

  if (!result.success) {
    return {
      content: [{ type: 'text', text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

/**
 * Handle kommo_link_product_to_lead tool call.
 */
export async function handleLinkProductToLead(
  args: { leadId: number; productId: number; quantity?: number; metadata?: any },
  config: KommoConfig
) {
  const result = await linkProductToLead(args.leadId, args.productId, args.quantity || 1, args.metadata, config);

  if (!result.success) {
    return {
      content: [{ type: 'text', text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

/**
 * Handle kommo_unlink_product_from_lead tool call.
 */
export async function handleUnlinkProductFromLead(
  args: { leadId: number; productId: number },
  config: KommoConfig
) {
  const result = await unlinkProductFromLead(args.leadId, args.productId, config);

  if (!result.success) {
    return {
      content: [{ type: 'text', text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

/**
 * Handle kommo_link_lead_to_contact tool call.
 */
export async function handleLinkLeadToContact(
  args: { leadId: number; contactId: number },
  config: KommoConfig
) {
  const result = await linkLeadToContact(args.leadId, args.contactId, config);

  if (!result.success) {
    return {
      content: [{ type: 'text', text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

/**
 * Handle kommo_get_leads_by_contact tool call.
 */
export async function handleGetLeadsByContact(
  args: { contactId: number },
  config: KommoConfig
) {
  const result = await getLeadsByContact(args.contactId, config);

  if (!result.success) {
    return {
      content: [{ type: 'text', text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

/**
 * Handle kommo_get_select_field_options tool call.
 */
export async function handleGetSelectFieldOptions(
  args: { leadId?: number; fieldId: number },
  config: KommoConfig
) {
  const result = await getSelectFieldOptions(args.fieldId, config);

  if (!result.success) {
    return {
      content: [{ type: 'text', text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

/**
 * Handle kommo_list_contacts tool call.
 */
export async function handleListContacts(
  args: { page?: number; limit?: number; query?: string; responsible_user_id?: number },
  config: KommoConfig
) {
  const result = await listContacts(args, config);

  if (!result.success) {
    return {
      content: [{ type: 'text', text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

/**
 * Handle kommo_update_contact tool call.
 */
export async function handleUpdateContact(
  args: { 
    contactId: number; 
    name?: string; 
    first_name?: string; 
    last_name?: string; 
    responsible_user_id?: number;
    custom_fields_values?: any[];
  },
  config: KommoConfig
) {
  const result = await updateContact(args.contactId, args, config);

  if (!result.success) {
    return {
      content: [{ type: 'text', text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

/**
 * Handle kommo_update_company tool call.
 */
export async function handleUpdateCompany(
  args: { 
    companyId: number; 
    name?: string; 
    responsible_user_id?: number;
    custom_fields_values?: any[];
  },
  config: KommoConfig
) {
  const result = await updateCompany(args.companyId, args, config);

  if (!result.success) {
    return {
      content: [{ type: 'text', text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

/**
 * Handle kommo_search_deal tool call.
 */
export async function handleSearchDeal(
  args: { query: string },
  config: KommoConfig
) {
  const result = await searchDeal(args, config);

  if (!result.success) {
    return {
      content: [{ type: 'text', text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

/**
 * Handle kommo_get_deal tool call.
 */
export async function handleGetDeal(
  args: { dealId: number },
  config: KommoConfig
) {
  const result = await getDeal({ dealId: args.dealId }, config);

  if (!result.success) {
    return {
      content: [{ type: 'text', text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

/**
 * Handle kommo_update_deal tool call.
 */
export async function handleUpdateDeal(
  args: { 
    dealId: number; 
    name?: string; 
    price?: number; 
    status_id?: number; 
    pipeline_id?: number;
    custom_fields_values?: any[];
  },
  config: KommoConfig
) {
  const result = await updateDeal(args.dealId, args, config);

  if (!result.success) {
    return {
      content: [{ type: 'text', text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

/**
 * Handle kommo_list_tasks tool call.
 */
export async function handleListTasks(
  args: { entity_type?: string; entity_id?: number; is_completed?: boolean },
  config: KommoConfig
) {
  const result = await listTasks(args, config);

  if (!result.success) {
    return {
      content: [{ type: 'text', text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

/**
 * Handle kommo_get_task tool call.
 */
export async function handleGetTask(
  args: { taskId: number },
  config: KommoConfig
) {
  const result = await getTask({ taskId: args.taskId }, config);

  if (!result.success) {
    return {
      content: [{ type: 'text', text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

/**
 * Handle kommo_update_task tool call.
 */
export async function handleUpdateTask(
  args: { 
    taskId: number; 
    text?: string; 
    is_completed?: boolean; 
    complete_till?: number;
    result_text?: string;
  },
  config: KommoConfig
) {
  const result = await updateTask(args.taskId, args as any, config);

  if (!result.success) {
    return {
      content: [{ type: 'text', text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

/**
 * Handle kommo_list_notes tool call.
 */
export async function handleListNotes(
  args: { entityType: string; entityId?: number; page?: number; limit?: number },
  config: KommoConfig
) {
  const result = await listNotes(args as any, config);

  if (!result.success) {
    return {
      content: [{ type: 'text', text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

/**
 * Handle kommo_create_note tool call.
 */
export async function handleCreateNote(
  args: { entityType: string; entityId: number; text: string; note_type?: string },
  config: KommoConfig
) {
  const result = await createNote(args as any, config);

  if (!result.success) {
    return {
      content: [{ type: 'text', text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

/**
 * Handle kommo_get_note tool call.
 */
export async function handleGetNote(
  args: { noteId: number; entityType: string },
  config: KommoConfig
) {
  const result = await getNote({ noteId: args.noteId, entityType: args.entityType as any }, config);

  if (!result.success) {
    return {
      content: [{ type: 'text', text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

/**
 * Handle kommo_update_note tool call.
 */
export async function handleUpdateNote(
  args: { noteId: number; entityType: string; text: string },
  config: KommoConfig
) {
  const result = await updateNote(args as any, config);

  if (!result.success) {
    return {
      content: [{ type: 'text', text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

/**
 * Handle kommo_get_pipeline_statuses tool call.
 */
export async function handleGetPipelineStatuses(
  args: { pipelineId: number },
  config: KommoConfig
) {
  const result = await getPipelineStatuses({ pipelineId: args.pipelineId }, config);

  if (!result.success) {
    return {
      content: [{ type: 'text', text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}
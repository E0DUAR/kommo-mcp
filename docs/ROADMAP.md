# Kommo CRM MCP - Roadmap

> **Last Updated:** 2026-01-12  
> **Vision:** "Total Control of Kommo" - AI-Native Enterprise MCP

---

## 📋 Index

1. [Current Status (Phase 1)](#current-status-phase-1)
2. [Enterprise Vision](#enterprise-vision)
3. [Roadmap by Phases](#roadmap-by-phases)
4. [Features by Category](#features-by-category)

---

## ✅ Current Status (Phase 1)

### What's Already Implemented

**Base Entities (Complete CRUD):**
- ✅ Contacts (5 read + 3 write)
- ✅ Leads (4 read + 4 write base + 5 advanced read + 2 advanced write)
- ✅ Companies (4 read + 2 write)
- ✅ Deals (5 read + 5 write)
- ✅ Tasks (4 read + 6 write)
- ✅ Notes (4 read + 3 write)
- ✅ Pipelines (4 read, read-only)
- ✅ Catalogs (4 read, read-only)
- ✅ Products (3 read + 2 write)

**Total:** ~83 functions implemented

**See documentation:**
- `docs/STATUS.md` - Current status and implemented functions
- `docs/KNOWN_ISSUES.md` - Resolved issues

---

## 🚀 Enterprise Vision

### Key Differentiator: Semantic Actions

**Instead of generic APIs:**
```typescript
// ❌ Traditional SDK
PATCH /leads/{id}
POST /leads/{id}/link
POST /leads/{id}/notes
```

**Our MCP offers semantic actions:**
```typescript
// ✅ AI-Native MCP
registerNewOpportunity()
advanceSalesStage()
logSalesInteraction()
```

👉 **This is gold for AI, copilots, and agents**

---

## 🗺️ Roadmap by Phases

### 🟢 Phase 1: MVP + AI Ready ✅ COMPLETED

**Objective:** Solid foundation for AI agents

**Features:**
- ✅ Complete CRUD of base entities
- ✅ Safe linking (verifies before creating)
- ✅ Notes corrected (entity-scoped)
- ✅ OAuth working
- ✅ Pipelines/Stages (read-only) - COMPLETED
- ✅ Advanced lead editing - COMPLETED
- ✅ Select fields with metadata - COMPLETED
- ✅ Catalogs and Products - COMPLETED

**Status:** ✅ **COMPLETED WITH EXTRAS**

**Extra Features Implemented (not in original roadmap):**
- ✅ `listPipelines()`, `getPipeline()`, `searchPipelineByName()`, `getPipelineStatuses()`
- ✅ `getLeadCustomFields()`, `searchLeadCustomField()`, `updateLeadCustomFields()`
- ✅ `getSelectFieldOptions()`, `getLeadCustomFieldsMetadata()`
- ✅ Smart text → enum_id matching for select fields

---

### 🟡 Phase 2: Automation + Analytics

**Objective:** Data intelligence and advanced automation

#### 🧠 1️⃣ Data Intelligence

**Semantic functions for AI:**

```typescript
// Complete timeline of a lead
getLeadTimeline(leadId)
// Returns: notes + status changes + links + tasks
// Format: Chronologically ordered array

// Contextual summary for AI
getLeadContextSummary(leadId)
// Returns: Structured summary for AI prompts
// Includes: current status, latest interactions, next steps

// Automatic status detection
detectLeadStatus(leadId)
// Returns: "active" | "cold" | "closed" | "lost"
// Logic: Based on last activity, time without contact, etc.

// Find inactive leads
findInactiveLeads(days: number)
// Returns: Leads without activity in X days
// Useful for: Reactivation campaigns
```

**Implementation:**
- Combine multiple endpoints (notes, tasks, status changes)
- Add business logic over Kommo data
- Format for AI consumption

---

#### 🔄 2️⃣ Advanced Automation

**Batch operations:**

```typescript
// Create multiple leads
bulkCreateLeads(leads: CreateLeadData[])
// Returns: Results per lead (success/error)
// Optimization: Batch requests when possible

// Update multiple leads
bulkUpdateLeads(updates: { leadId: number, data: UpdateLeadData }[])
// Returns: Results per lead

// Move multiple leads
bulkMoveLeads(leadIds: number[], newStatusId: number)
// Returns: Results per lead
// Validation: Verify all leads can be moved

// Assign lead to user
assignLeadToUser(leadId: number, userId: number)
// Semantic wrapper over updateLead

// Automatic distribution
autoDistributeLeads(leads: number[], strategy: 'round-robin' | 'load-based' | 'priority')
// round-robin: Distribute equitably
// load-based: Assign to user with fewer active leads
// priority: Assign based on lead priority
```

**Implementation:**
- Batch processing with error handling
- Intelligent distribution strategies
- Validation and rollback when needed

---

#### 📊 3️⃣ Analytics & Control

**Metrics for management and BI:**

```typescript
// Pipeline statistics
getPipelineStats(pipelineId: number, dateRange?: { from: Date, to: Date })
// Returns: {
//   totalLeads: number,
//   byStatus: { statusId: number, count: number }[],
//   averageTimeInStage: { stageId: number, days: number }[],
//   conversionRate: number
// }

// Conversion rates
getConversionRates(pipelineId: number, dateRange?: DateRange)
// Returns: {
//   overall: number,
//   byStage: { stageId: number, rate: number }[],
//   trends: { date: string, rate: number }[]
// }

// Lost reasons statistics
getLostReasonsStats(pipelineId: number, dateRange?: DateRange)
// Returns: {
//   reasons: { reason: string, count: number }[],
//   trends: { date: string, reasons: Record<string, number> }[]
// }

// User performance
getUserPerformance(userId: number, dateRange?: DateRange)
// Returns: {
//   leadsCreated: number,
//   leadsClosed: number,
//   conversionRate: number,
//   averageTimeToClose: number,
//   tasksCompleted: number
// }
```

**Implementation:**
- Aggregations over Kommo data
- Caching for performance
- Format ready for dashboards

**Status:** 🟡 Not started

---

### 🔴 Phase 3: Configuration + Governance

**Objective:** Complete CRM control

#### 🏗️ CRM Configuration

**⚠️ Very sensitive → requires high permissions**

```typescript
// Pipelines
createPipeline(data: CreatePipelineData)
updatePipeline(pipelineId: number, data: UpdatePipelineData)
deletePipeline(pipelineId: number)

// Stages
createStage(pipelineId: number, data: CreateStageData)
updateStage(stageId: number, data: UpdateStageData)
deleteStage(stageId: number)

// Custom fields
createCustomField(data: CreateCustomFieldData)
updateCustomField(fieldId: number, data: UpdateCustomFieldData)
deleteCustomField(fieldId: number)
```

**Implementation:**
- Strict permission validation
- Confirmations for destructive operations
- Logging of configuration changes

---

#### 🧑‍💼 Users & Roles

```typescript
// List users
getUsers(filters?: { active?: boolean, role?: string })
// Returns: List of users with permissions

// User availability
getUserAvailability(userId: number, dateRange: DateRange)
// Returns: {
//   totalLeads: number,
//   activeLeads: number,
//   capacity: number,
//   utilization: number
// }
```

---

#### 🧪 Diagnosis & Health

```typescript
// Validate account configuration
validateAccountSetup()
// Returns: {
//   isValid: boolean,
//   issues: {
//     missingFields: string[],
//     brokenAutomations: string[],
//     permissionIssues: string[]
//   }
// }

// Check missing fields
checkMissingFields(entityType: 'leads' | 'contacts' | 'deals')
// Returns: Required fields missing in entities

// Detect broken automations
detectBrokenAutomations()
// Returns: Automations that fail or have errors

// Test permissions
testPermissions()
// Returns: Permission test results
```

**Status:** 🔴 Not started

---

### 🔵 Phase 4: Communications & Webhooks (Optional)

**Objective:** Real-time communication integration

#### Communications

```typescript
// Send message to contact
sendMessageToContact(contactId: number, message: string, channel: 'email' | 'sms' | 'whatsapp')

// Log incoming message
logIncomingMessage(contactId: number, message: string, channel: string)

// Sync conversation history
syncConversationHistory(contactId: number, channel: string)
```

#### Webhooks & Events

```typescript
// Register webhook
registerWebhook(url: string, events: string[])

// Event handlers
handleLeadCreated(leadId: number)
handleStageChanged(leadId: number, oldStageId: number, newStageId: number)
handleIncomingMessage(contactId: number, message: string)
```

**Status:** 🔵 Not started (Optional)

---

## 📊 Summary by Phase

| Phase | Status | Functions | Priority |
|-------|--------|-----------|----------|
| **Phase 1: MVP + AI Ready** | ✅ Completed | ~83 functions | ✅ Done |
| **Phase 2: Automation + Analytics** | 🟡 Pending | ~13 functions | High |
| **Phase 3: Configuration + Governance** | 🔴 Pending | ~16 functions | Medium |
| **Phase 4: Communications** | 🔵 Pending | ~7 functions | Low (Optional) |

---

## 🎯 Priority Order

1. **Phase 1** ✅ - Complete (MVP foundation)
2. **Phase 2** 🟡 - Next (Data intelligence and automation)
3. **Phase 3** 🔴 - Future (Configuration control)
4. **Phase 4** 🔵 - Optional (Communications)

---

## 📚 References

- **Current Status:** See `docs/STATUS.md`
- **Setup Guide:** See `docs/SETUP.md`
- **Known Issues:** See `docs/KNOWN_ISSUES.md`
- **Main README:** See `README.md`

---

**Last Updated:** 2026-01-12
